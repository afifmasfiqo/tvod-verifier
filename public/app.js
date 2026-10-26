
"use strict";

const $ = (selector) => document.querySelector(selector);

let currentUser = null;
let signatures = {};
const signaturePads = {};

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function showResult(selector, data) {
  const element = $(selector);
  if (element) element.textContent = JSON.stringify(data, null, 2);
}

function showStatus(selector, message, isError = false) {
  const element = $(selector);
  if (!element) return;

  element.textContent = message;
  element.classList.toggle("text-error", isError);
}

function setConnection(message, good = false) {
  const element = $("#connection-status");
  if (!element) return;

  element.textContent = message;
  element.classList.toggle("status-good", good);
  element.classList.toggle("status-neutral", !good);
}

function renderUser(user) {
  currentUser = user || null;

  $("#user-card").hidden = !user;
  $("#pi-login-button").hidden = Boolean(user);
  $("#demo-login-button").hidden = Boolean(user);
  $("#logout-button").hidden = !user;

  if (user) {
    $("#user-name").textContent = user.username || "Pi participant";
    $("#user-mode").textContent = user.demo
      ? "DEMO SESSION"
      : "Pi-verified session";
    $("#user-avatar").textContent =
      (user.username || "T").slice(0, 1).toUpperCase();
  }
}

async function refreshSession() {
  try {
    const result = await api("/api/session");
    renderUser(result.authenticated ? result.user : null);
  } catch (error) {
    setConnection("API unavailable");
    console.error(error);
  }
}

async function initialize() {
  try {
    await api("/api/health");
    const config = await api("/api/config");

    setConnection("Server connected", true);

    $("#demo-login-button").hidden = !config.demoAuthEnabled;

    if (config.piSandbox) {
      $("#connection-status").title = "Pi Sandbox/Testnet configuration";
    }

    await refreshSession();
  } catch (error) {
    setConnection("Server unavailable");
    console.error(error);
  }
}

/* Pi SDK login.
   The backend must verify the access token before creating a session. */
$("#pi-login-button").addEventListener("click", async () => {
  const button = $("#pi-login-button");
  button.disabled = true;

  try {
    if (!window.Pi) {
      throw new Error(
        "Pi SDK is not available. Open the app inside Pi Browser."
      );
    }

    window.Pi.init({
      version: "2.0",
      sandbox: true
    });

    const auth = await window.Pi.authenticate(
      ["username"],
      (payment) => {
        console.warn("Unexpected incomplete payment:", payment);
      }
    );

    if (!auth || !auth.accessToken) {
      throw new Error("Pi authentication returned no access token.");
    }

    const result = await api("/api/auth/pi", {
      method: "POST",
      body: JSON.stringify({
        accessToken: auth.accessToken
      })
    });

    renderUser(result.user);
    alert("Pi login successful.");
  } catch (error) {
    alert("Pi login not completed: " + error.message);
  } finally {
    button.disabled = false;
  }
});

$("#demo-login-button").addEventListener("click", async () => {
  try {
    const result = await api("/api/demo-login", {
      method: "POST",
      body: "{}"
    });

    renderUser(result.user);
  } catch (error) {
    alert(error.message);
  }
});

$("#logout-button").addEventListener("click", async () => {
  try {
    await api("/api/logout", {
      method: "POST",
      body: "{}"
    });

    renderUser(null);
  } catch (error) {
    alert(error.message);
  }
});

/* PiBox mock adapter. A successful response is NOT proof of ownership. */
$("#nft-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const result = await api("/api/pibox/verify", {
      method: "POST",
      body: JSON.stringify({
        walletAddress: $("#nft-wallet").value.trim(),
        nftType: $("#nft-type").value
      })
    });

    showResult("#nft-result", result);
  } catch (error) {
    showResult("#nft-result", {
      ok: false,
      message: error.message
    });
  }
});

/* Mock payout queue. It never transfers Pi. */
$("#payout-key").value = crypto.randomUUID();

$("#payout-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const result = await api("/api/a2u/queue", {
      method: "POST",
      body: JSON.stringify({
        recipientWallet: $("#payout-wallet").value.trim(),
        amount: Number($("#payout-amount").value),
        idempotencyKey: $("#payout-key").value.trim()
      })
    });

    showResult("#payout-result", result);
    $("#payout-key").value = crypto.randomUUID();
  } catch (error) {
    showResult("#payout-result", {
      ok: false,
      message: error.message
    });
  }
});

/* Signature pads: touchscreen and mouse support. */
function setupSignaturePad(canvas) {
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let hasInk = false;

  function resize() {
    const saved = hasInk ? canvas.toDataURL("image/png") : null;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#18243a";

    if (saved) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, rect.width, rect.height);
      };
      image.src = saved;
    }
  }

  function position(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    hasInk = true;
    canvas.setPointerCapture(event.pointerId);

    const p = position(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    event.preventDefault();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;

    const p = position(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    event.preventDefault();
  });

  function stopDrawing() {
    drawing = false;
    if (hasInk) {
      signatures[canvas.id] = canvas.toDataURL("image/png");
    }
  }

  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);
  canvas.addEventListener("pointerleave", (event) => {
    if (event.buttons === 0) stopDrawing();
  });

  resize();
  signaturePads[canvas.id] = {
    clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
      delete signatures[canvas.id];
    },
    export() {
      return hasInk ? canvas.toDataURL("image/png") : null;
    }
  };
}

document.querySelectorAll(".signature-pad").forEach(setupSignaturePad);

document.querySelectorAll("[data-clear-signature]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.clearSignature;
    signaturePads[id]?.clear();
    showStatus("#signature-status", `${id} cleared.`);
  });
});

$("#save-tvod-signatures").addEventListener("click", () => {
  const names = {
    "sig-chairman": "Chairman",
    "sig-witness": "Witness",
    "sig-inspector": "Inspector",
    "sig-country-head": "Country Head"
  };

  const missing = Object.keys(names).filter(
    (id) => !signaturePads[id]?.export()
  );

  if (missing.length) {
    showStatus(
      "#signature-status",
      "Please sign all four blocks before saving.",
      true
    );
    return;
  }

  Object.keys(names).forEach((id) => {
    signatures[id] = signaturePads[id].export();
  });

  showStatus(
    "#signature-status",
    "All four signatures saved in memory as Base64 PNG for this page session."
  );
});

/* Add logo and stamp to a PDF when the image files can be loaded. */
function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function addBranding(pdf) {
  const logo = await loadImage("/logo.png");
  const stamp = await loadImage("/stempel-tvod.png");

  if (logo) {
    pdf.addImage(logo, "PNG", 155, 10, 35, 22);
  }

  if (stamp) {
    pdf.addImage(stamp, "PNG", 145, 230, 35, 35);
  }
}

function addSignatureBlock(pdf, title, data, x, y) {
  pdf.setFontSize(10);
  pdf.text(title, x, y);
  pdf.setDrawColor(150);
  pdf.line(x, y + 25, x + 75, y + 25);

  if (data) {
    try {
      pdf.addImage(data, "PNG", x, y + 2, 65, 20);
    } catch (error) {
      console.warn("Could not add signature image:", title);
    }
  }

  pdf.setFontSize(8);
  pdf.text("Signature", x, y + 30);
}

/* BAP Hybrid PDF */
$("#bap-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!window.jspdf?.jsPDF) {
    alert("PDF library is unavailable. Check your internet connection.");
    return;
  }

  const pdf = new window.jspdf.jsPDF();
  const documentId = $("#bap-id").value.trim();
  const date = $("#bap-date").value;
  const subject = $("#bap-subject").value.trim();
  const summary = $("#bap-summary").value.trim();

  await addBranding(pdf);

  pdf.setFontSize(18);
  pdf.text("THE VOICE OF DAO", 15, 22);
  pdf.setFontSize(14);
  pdf.text("HYBRID MINUTES OF PROCEEDINGS (BAP)", 15, 34);

  pdf.setFontSize(10);
  pdf.text(`Document ID: ${documentId}`, 15, 47);
  pdf.text(`Date: ${date}`, 15, 55);
  pdf.text("Language: English", 15, 63);
  pdf.text("Status: Test environment document", 15, 71);

  pdf.setFontSize(12);
  pdf.text("Subject", 15, 86);
  pdf.setFontSize(10);
  pdf.text(pdf.splitTextToSize(subject, 175), 15, 94);

  pdf.setFontSize(12);
  pdf.text("Proceedings Summary", 15, 111);
  pdf.setFontSize(10);
  const lines = pdf.splitTextToSize(summary, 175);
  pdf.text(lines.slice(0, 13), 15, 119);

  pdf.setFontSize(8);
  pdf.text(
    "This is a demonstration document and does not constitute legal certification.",
    15,
    192
  );

  addSignatureBlock(pdf, "Chairman", signatures["sig-chairman"], 15, 207);
  addSignatureBlock(pdf, "Witness", signatures["sig-witness"], 110, 207);
  addSignatureBlock(pdf, "Inspector", signatures["sig-inspector"], 15, 252);
  addSignatureBlock(pdf, "Country Head", signatures["sig-country-head"], 110, 252);

  pdf.save(`${documentId.replace(/[^a-zA-Z0-9_-]/g, "_") || "TVOD-BAP"}.pdf`);
});

/* Certificate creation plus QR code pointing to the verification URL. */
$("#certificate-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!window.jspdf?.jsPDF || !window.QRCode) {
    showStatus("#certificate-result", "PDF or QR library unavailable.", true);
    return;
  }

  try {
    const certificateId = $("#certificate-id").value.trim();

    const result = await api("/api/certificates", {
      method: "POST",
      body: JSON.stringify({
        certificateId,
        recipient: $("#certificate-recipient").value.trim(),
        walletAddress: $("#certificate-wallet").value.trim(),
        nftType: $("#certificate-nft").value
      })
    });

    const pdf = new window.jspdf.jsPDF();
    await addBranding(pdf);

    pdf.setFontSize(18);
    pdf.text("THE VOICE OF DAO", 15, 28);
    pdf.setFontSize(15);
    pdf.text("DIGITAL VERIFICATION CERTIFICATE", 15, 43);

    pdf.setFontSize(11);
    pdf.text(`Certificate ID: ${certificateId}`, 15, 60);
    pdf.text(`Recipient: ${result.certificate.recipient}`, 15, 72);
    pdf.text(`NFT category: ${result.certificate.nftType}`, 15, 84);

    const wallet = result.certificate.walletAddress;
    pdf.text("Wallet address:", 15, 96);
    pdf.text(pdf.splitTextToSize(wallet, 175), 15, 103);

    pdf.text(`Issued: ${result.certificate.issuedAt}`, 15, 120);
    pdf.text("DEMO RECORD. NFT OWNERSHIP NOT CRYPTOGRAPHICALLY VERIFIED.", 15, 136);

    const qrContainer = document.createElement("div");
    new window.QRCode(qrContainer, {
      text: result.verificationUrl,
      width: 180,
      height: 180
    });

    await new Promise((resolve) => setTimeout(resolve, 250));

    const qrImage = qrContainer.querySelector("img");
    const qrCanvas = qrContainer.querySelector("canvas");
    let qrData = null;

    if (qrImage?.src) {
      qrData = qrImage.src;
    } else if (qrCanvas) {
      qrData = qrCanvas.toDataURL("image/png");
    }

    if (qrData) {
      pdf.addImage(qrData, "PNG", 80, 150, 45, 45);
    }

    pdf.save(`${certificateId.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`);

    showStatus(
      "#certificate-result",
      "Demo certificate PDF created. QR points to the server verification record."
    );
  } catch (error) {
    showStatus("#certificate-result", error.message, true);
  }
});

initialize();
                    
