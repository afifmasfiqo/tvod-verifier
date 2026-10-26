
"use strict";

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DEMO_AUTH_ENABLED = process.env.DEMO_AUTH_ENABLED === "true";
const PI_SANDBOX = process.env.PI_SANDBOX !== "false";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.error("SESSION_SECRET must contain at least 32 characters.");
  process.exit(1);
}

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: "1mb" }));

app.use(session({
  name: "tvod.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(express.static(path.join(__dirname, "public")));

const payouts = new Map();
const certificates = new Map();

function validWalletAddress(value) {
  return typeof value === "string" &&
    value.length >= 20 &&
    value.length <= 200 &&
    /^[a-zA-Z0-9_-]+$/.test(value);
}

function requireSession(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      ok: false,
      message: "Silakan login terlebih dahulu."
    });
  }

  next();
}

function validText(value, max = 200) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= max;
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "TVOD Verifier",
    mode: "TESTNET SIMULATION",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    piSandbox: PI_SANDBOX,
    demoAuthEnabled: DEMO_AUTH_ENABLED,
    piboxMode: "mock",
    paymentsMode: "mock"
  });
});

app.get("/api/session", (req, res) => {
  res.json({
    authenticated: Boolean(req.session.user),
    user: req.session.user || null
  });
});

/*
 * Demo login is disabled unless DEMO_AUTH_ENABLED=true.
 * Never enable this setting on a public production service.
 */
app.post("/api/demo-login", (req, res) => {
  if (!DEMO_AUTH_ENABLED || process.env.NODE_ENV === "production") {
    return res.status(403).json({
      ok: false,
      message: "Demo login is disabled."
    });
  }

  req.session.user = {
    username: "tvod-demo",
    demo: true
  };

  res.json({ ok: true, user: req.session.user });
});

/*
 * Pi authentication intentionally fails closed until the
 * server-side Pi token verifier has been configured.
 */
app.post("/api/auth/pi", async (req, res) => {
  const token = req.body?.accessToken;

  if (!validText(token, 4096)) {
    return res.status(400).json({
      ok: false,
      message: "Pi access token is required."
    });
  }

  const apiKey = process.env.PI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      message: "Pi server verification is not configured yet."
    });
  }

  try {
    const response = await fetch("https://api.minepi.com/v2/me", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return res.status(401).json({
        ok: false,
        message: "Pi access token verification failed."
      });
    }

    const piUser = await response.json();

    if (!piUser.uid || !piUser.username) {
      return res.status(401).json({
        ok: false,
        message: "Pi returned an invalid user record."
      });
    }

    req.session.user = {
      uid: piUser.uid,
      username: piUser.username,
      demo: false
    };

    res.json({ ok: true, user: req.session.user });
  } catch (error) {
    console.error("Pi verification error:", error.message);

    res.status(502).json({
      ok: false,
      message: "Unable to contact Pi authentication service."
    });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("tvod.sid");
    res.json({ ok: true });
  });
});

/*
 * MOCK ONLY.
 * A syntactically valid wallet is not proof of NFT ownership.
 */
app.post("/api/pibox/verify", requireSession, (req, res) => {
  const { walletAddress, nftType } = req.body || {};

  if (!validWalletAddress(walletAddress)) {
    return res.status(400).json({
      ok: false,
      verified: false,
      message: "Wallet address format is invalid."
    });
  }

  if (!validText(nftType, 100)) {
    return res.status(400).json({
      ok: false,
      verified: false,
      message: "NFT type is required."
    });
  }

  res.json({
    ok: true,
    verified: true,
    mode: "MOCK",
    walletAddress,
    nftType,
    message: "Mock validation only. No on-chain ownership was checked."
  });
});

/*
 * Mock payout queue. This endpoint never sends Pi.
 * The idempotency key prevents duplicate queue entries in
 * this process, but Map storage is lost on restart.
 */
app.post("/api/a2u/queue", requireSession, (req, res) => {
  const { recipientWallet, amount, idempotencyKey } = req.body || {};

  if (!validWalletAddress(recipientWallet)) {
    return res.status(400).json({
      ok: false,
      message: "Recipient wallet format is invalid."
    });
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 1000000
  ) {
    return res.status(400).json({
      ok: false,
      message: "Amount must be a positive number."
    });
  }

  if (!validText(idempotencyKey, 200)) {
    return res.status(400).json({
      ok: false,
      message: "A valid idempotency key is required."
    });
  }

  if (payouts.has(idempotencyKey)) {
    return res.json({
      ok: true,
      duplicate: true,
      payout: payouts.get(idempotencyKey)
    });
  }

  const payout = {
    id: crypto.randomUUID(),
    recipientWallet,
    amount,
    idempotencyKey,
    status: "QUEUED_PENDING_FUNDS",
    mode: "MOCK_NO_TRANSFER",
    createdAt: new Date().toISOString()
  };

  payouts.set(idempotencyKey, payout);

  res.status(202).json({
    ok: true,
    payout,
    message: "Payout queued for simulation. No Pi was transferred."
  });
});

app.get("/api/a2u/queue", requireSession, (req, res) => {
  res.json({
    ok: true,
    payouts: Array.from(payouts.values())
  });
});

app.post("/api/certificates", requireSession, (req, res) => {
  const {
    certificateId,
    recipient,
    walletAddress,
    nftType
  } = req.body || {};

  if (!validText(certificateId, 100) ||
      !validText(recipient, 200) ||
      !validWalletAddress(walletAddress) ||
      !validText(nftType, 100)) {
    return res.status(400).json({
      ok: false,
      message: "Certificate fields are missing or invalid."
    });
  }

  if (certificates.has(certificateId)) {
    return res.status(409).json({
      ok: false,
      message: "Certificate ID already exists."
    });
  }

  const certificate = {
    certificateId,
    recipient,
    walletAddress,
    nftType,
    issuedAt: new Date().toISOString(),
    mode: "DEMO"
  };

  certificates.set(certificateId, certificate);

  res.status(201).json({
    ok: true,
    certificate,
    verificationUrl:
      `${req.protocol}://${req.get("host")}/api/certificates/${encodeURIComponent(certificateId)}`
  });
});

app.get("/api/certificates/:id", (req, res) => {
  const certificate = certificates.get(req.params.id);

  if (!certificate) {
    return res.status(404).json({
      ok: false,
      message: "Certificate not found."
    });
  }

  res.json({
    ok: true,
    certificate,
    authenticity: "DEMO_RECORD_NOT_CRYPTOGRAPHICALLY_SIGNED"
  });
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      ok: false,
      message: "API endpoint not found."
    });
  }

  res.sendFile(path.join(__dirname, "public", "index.html"), (error) => {
    if (error) next(error);
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error.message);

  res.status(500).json({
    ok: false,
    message: "Internal server error."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TVOD Verifier listening on port ${PORT}`);
});
