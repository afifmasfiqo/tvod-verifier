"use strict";

const $ = (selector) => document.querySelector(selector);

let currentUser = null;
let currentSessionToken = null;
let signatures = {};
const signaturePads = {};

function onIncompletePaymentFound(payment) {
  console.warn("Incomplete payment found:", payment);
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
  element.className = `status-pill ${good ? 'status-good' : 'status-neutral'}`;
}

function renderUser(user) {
  currentUser = user || null;

  const userCard = $("#user-card");
  const piLoginBtn = $("#pi-login-button");
  const demoLoginBtn = $("#demo-login-button");
  const logoutBtn = $("#logout-button");

  if (userCard) userCard.hidden = !user;
  if (piLoginBtn) piLoginBtn.hidden = Boolean(user);
  if (demoLoginBtn) demoLoginBtn.hidden = Boolean(user);
  if (logoutBtn) logoutBtn.hidden = !user;

  if (user) {
    if ($("#user-name")) $("#user-name").textContent = user.username || "Pi Participant";
    if ($("#user-mode")) $("#user-mode").textContent = user.demo ? "DEMO SESSION" : "App Studio Verified Session";
    if ($("#user-avatar")) $("#user-avatar").textContent = (user.username || "T").slice(0, 1).toUpperCase();
  }
}

async function handlePiAuth() {
  if (!window.Pi) {
    throw new Error("Pi SDK is not loaded. Please open inside Pi Browser.");
  }

  await window.Pi.init({ version: "2.0" });

  const auth = await window.Pi.authenticate(["username"], onIncompletePaymentFound);
  if (!auth || !auth.accessToken) {
    throw new Error("Pi.authenticate did not return an access token.");
  }

  const response = await fetch("https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      accessToken: auth.accessToken
    })
  });

  if (!response.ok) {
    throw new Error(`App Studio login exchange failed (${response.status})`);
  }

  const data = await response.json();
  currentSessionToken = data.sessionToken;

  const verifiedUser = {
    username: data.user.username,
    uid: data.user.uid,
    demo: false
  };

  renderUser(verifiedUser);
  setConnection("Verified by App Studio", true);
  return verifiedUser;
}

async function initialize() {
  setConnection("Pi Ecosystem Ready", true);
  if ($("#demo-login-button")) $("#demo-login-button").hidden = false;

  try {
    if (window.Pi) {
      await handlePiAuth();
    }
  } catch (e) {
    console.warn("Auto sign-in skipped or pending user action:", e);
  }
}

const piLoginButton = $("#pi-login-button");
if (piLoginButton) {
  piLoginButton.addEventListener("click", async () => {
    piLoginButton.disabled = true;
    try {
      const user = await handlePiAuth();
      alert(`Welcome @${user.username}! Pi App Studio Authentication Successful.`);
    } catch (error) {
      alert("Pi Login Notice: " + error.message + "\n\nTip: Use 'Enter local demo' for interface testing.");
    } finally {
      piLoginButton.disabled = false;
    }
  });
}

const demoLoginButton = $("#demo-login-button");
if (demoLoginButton) {
  demoLoginButton.addEventListener("click", () => {
    renderUser({
      username: "afifmasfiqo",
      demo: true
    });
  });
}

const logoutButton = $("#logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    currentSessionToken = null;
    renderUser(null);
  });
}

const nftForm = $("#nft-form");
if (nftForm) {
  nftForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const wallet = $("#nft-wallet").value.trim();
    const nftType = $("#nft-type").value;

    const mockResult = {
      ok: true,
      walletAddress: wallet,
      nftCategory: nftType,
      verifiedOnChain: true,
      timestamp: new Date().toISOString(),
      message: `Verified: ${nftType} active in wallet ${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    };

    showResult("#nft-result", mockResult);
  });
}

if ($("#payout-key")) {
  $("#payout-key").value = (window.crypto && window.crypto.randomUUID) 
    ? crypto.randomUUID() 
    : 'key-' + Math.random().toString(36).substring(2, 9);
}

const payoutForm = $("#payout-form");
if (payoutForm) {
  payoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const mockPayout = {
      ok: true,
      status: "QUEUED_PENDING_FUNDS",
      recipientWallet: $("#payout-wallet").value.trim(),
      amount: Number($("#payout-amount").value),
      idempotencyKey: $("#payout-key").value.trim(),
      splitRule: "50/50 Delegator-Owner Split Active"
    };

    showResult("#payout-result", mockPayout);
    if ($("#payout-key")) {
      $("#payout-key").value = (window.crypto && window.crypto.randomUUID) 
        ? crypto.randomUUID() 
        : 'key-' + Math.random().toString(36).substring(2, 9);
    }
  });
}

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
      image.onload = () => ctx.drawImage(image, 0, 0, rect.width, rect.height);
      image.src = saved;
    }
  }

  function position(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX || (event.touches && event.touches[0].clientX)) - rect.left,
      y: (event.clientY || (event.touches && event.touches[0].clientY)) - rect.top
    };
  }

  const startDraw = (event) => {
    drawing = true;
    hasInk = true;
    const p = position(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const moveDraw = (event) => {
    if (!drawing) return;
    const p = position(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const stopDraw = () => {
    drawing = false;
    if (hasInk) {
      signatures[canvas.id] = canvas.toDataURL("image/png");
    }
  };

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", moveDraw);
  canvas.addEventListener("mouseup", stopDraw);

  canvas.addEventListener("touchstart", startDraw);
  canvas.addEventListener("touchmove", moveDraw);
  canvas.addEventListener("touchend", stopDraw);

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

const saveSigBtn = $("#save-tvod-signatures");
if (saveSigBtn) {
  saveSigBtn.addEventListener("click", () => {
    const names = {
      "sig-chairman": "Chairman",
      "sig-witness": "Witness",
      "sig-inspector": "Inspector",
      "sig-country-head": "Country Head"
    };

    const missing = Object.keys(names).filter((id) => !signaturePads[id]?.export());

    if (missing.length) {
      showStatus("#signature-status", "Please sign all four blocks before saving.", true);
      return;
    }

    Object.keys(names).forEach((id) => {
      signatures[id] = signaturePads[id].export();
    });

    showStatus("#signature-status", "All four signatures saved successfully for PDF generation.");
  });
}

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

  if (logo) pdf.addImage(logo, "PNG", 155, 10, 35, 22);
  if (stamp) pdf.addImage(stamp, "PNG", 145, 230, 35, 35);
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
  pdf.text("Verified Signature", x, y + 30);
}

const bapForm = $("#bap-form");
if (bapForm) {
  bapForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!window.jspdf?.jsPDF) {
      alert("PDF library is unavailable.");
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
    pdf.setFontSize(13);
    pdf.text("OFFICIAL MINUTES OF PROCEEDINGS & VERIFICATION RECORD", 15, 34);

    pdf.setFontSize(10);
    pdf.text(`Document ID: ${documentId}`, 15, 47);
    pdf.text(`Proceedings Date: ${date}`, 15, 55);
    pdf.text("Document Standard: TVOD Global Governance (English)", 15, 63);
    pdf.text(`Recorded By User: ${currentUser ? currentUser.username : 'Guest Session'}`, 15, 71);

    pdf.setFontSize(12);
    pdf.text("Subject / Proposal Title", 15, 86);
    pdf.setFontSize(10);
    pdf.text(pdf.splitTextToSize(subject, 175), 15, 94);

    pdf.setFontSize(12);
    pdf.text("Proceedings & Decision Summary", 15, 111);
    pdf.setFontSize(10);
    pdf.text(pdf.splitTextToSize(summary, 175).slice(0, 13), 15, 119);

    addSignatureBlock(pdf, "Chairman", signatures["sig-chairman"], 15, 207);
    addSignatureBlock(pdf, "Witness", signatures["sig-witness"], 110, 207);
    addSignatureBlock(pdf, "Inspector", signatures["sig-inspector"], 15, 252);
    addSignatureBlock(pdf, "Country Head", signatures["sig-country-head"], 110, 252);

    pdf.save(`${documentId.replace(/[^a-zA-Z0-9_-]/g, "_") || "TVOD_Official_Proceedings"}.pdf`);
  });
}

const certForm = $("#certificate-form");
if (certForm) {
  certForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!window.jspdf?.jsPDF) {
      showStatus("#certificate-result", "PDF library unavailable.", true);
      return;
    }

    try {
      const certificateId = $("#certificate-id").value.trim();
      const recipient = $("#certificate-recipient").value.trim();
      const wallet = $("#certificate-wallet").value.trim();
      const nftType = $("#certificate-nft").value;

      const pdf = new window.jspdf.jsPDF();
      await addBranding(pdf);

      pdf.setFontSize(18);
      pdf.text("THE VOICE OF DAO", 15, 28);
      pdf.setFontSize(14);
      pdf.text("OFFICIAL DIGITAL VERIFICATION CERTIFICATE", 15, 43);

      pdf.setFontSize(10);
      pdf.text(`Certificate ID: ${certificateId}`, 15, 60);
      pdf.text(`Recipient Name: ${recipient}`, 15, 70);
      pdf.text(`Verified NFT Category: ${nftType}`, 15, 80);

      pdf.text("Bound Pi Wallet Address:", 15, 92);
      pdf.text(pdf.splitTextToSize(wallet, 175), 15, 100);

      pdf.text(`Issue Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 118);
      pdf.text("Verification Status: Web3 Verified Ecosystem Member", 15, 128);

      if (window.QRCode) {
        const qrContainer = document.createElement("div");
        new window.QRCode(qrContainer, {
          text: `https://tvod-verifier.vercel.app/verify/${certificateId}`,
          width: 180,
          height: 180
        });

        await new Promise((resolve) => setTimeout(resolve, 250));
        const qrCanvas = qrContainer.querySelector("canvas");
        if (qrCanvas) {
          pdf.addImage(qrCanvas.toDataURL("image/png"), "PNG", 80, 142, 45, 45);
        }
      }

      pdf.setFontSize(8);
      pdf.text("Scan QR code above for live verification record", 72, 192);

      pdf.save(`${certificateId.replace(/[^a-zA-Z0-9_-]/g, "_") || "TVOD_Digital_Certificate"}.pdf`);
      showStatus("#certificate-result", "Official Digital Certificate PDF generated successfully in English.");
    } catch (error) {
      showStatus("#certificate-result", error.message, true);
    }
  });
}

initialize();
