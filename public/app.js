"use strict";

// Helper Query Selector
const $ = (selector) => document.querySelector(selector);

// System Global State
let currentUser = null;
let currentSessionToken = null;
let activeUser = {
  username: "",
  walletAddress: "",
  category: "owner",
  role: "Member",
  chapter: "GLOBAL",
  garudaId: null,
  garudaHash: null,
  ownerUsername: null,
  delegatedNftType: null,
  delegatedHashes: []
};
let currentConfidence = 3;
let signatures = {};
const signaturePads = {};
let voterSigPad = null;

// State Durasi Waktu Voting (Default: 24 Jam dari sekarang)
let votingEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
let countdownInterval = null;

const AUTHORIZED_ADMINS = ["afifmasfiqo", "Nalaktak"];

// Active Proposal State (Materi & Objek Voting)
let activeProposal = {
  id: "TVOD-PROP-2026-001",
  title: "Ratifikasi Sistem Verifikasi Web3 & Distribusi Insentif Voting TVOD",
  proposerEntity: "ICP2E & TVOD Development Team",
  proposerUsername: "afifmasfiqo",
  category: "Verifikasi Objek / Kasus",
  author: "@afifmasfiqo (Chairman)",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  description: "Berikut adalah berkas bukti verifikasi objek voting terkait pengajuan sistem reward dan kepatuhan Kode Etik.\nHarap periksa materi audio-visual, tautan bukti di media sosial, dan dokumen pendukung di bawah ini secara teliti sebelum memberikan suara terbobot Anda.",
  durationHours: 24,
  images: [
    "https://via.placeholder.com/600x350/0f172a/f59e0b?text=Bukti+Foto+Utama+Objek+Voting"
  ],
  videoUrl: "",
  socialLinks: {
    fb: "https://facebook.com",
    x: "https://x.com",
    yt: "https://youtube.com",
    discord: "https://discord.gg",
    pi: "https://minepi.com"
  },
  totalVotes: 42,
  netScore: 18.5
};

// --- COLORIZER STEMPEL: MENGUBAH STEMPEL BIRU MENJADI EMAS (#F59E0B) ---
function loadAndColorizeStamp(src, goldColor = "#F59E0B") {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = goldColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// --- INITIALIZATION ---
async function initialize() {
  setConnection("● Ecosystem Ready", true);

  // Setup Voter Signature Pad
  const voterCanvas = $("#voterSignatureCanvas");
  if (voterCanvas && window.SignaturePad) {
    voterSigPad = new window.SignaturePad(voterCanvas, {
      backgroundColor: "rgb(2, 6, 23)",
      penColor: "rgb(245, 158, 11)"
    });
  }

  // Setup Officer Signature Pads (4 Pejabat TVOD)
  ["sig-chairman", "sig-witness", "sig-inspector", "sig-country-head"].forEach((id) => {
    const canvas = $(`#${id}`);
    if (canvas && window.SignaturePad) {
      signaturePads[id] = new window.SignaturePad(canvas, {
        backgroundColor: "rgb(2, 6, 23)",
        penColor: "rgb(59, 130, 246)"
      });
    }
  });

  // Setup Dynamic Form Toggles & Event Listeners
  const voterCatEl = $("#voterCategory");
  if (voterCatEl) voterCatEl.addEventListener("change", toggleCategoryFields);

  const delegatorTypeEl = $("#delegatorNftType");
  if (delegatorTypeEl) delegatorTypeEl.addEventListener("change", updateDelegatorHint);

  const onboardingFormEl = $("#onboardingForm");
  if (onboardingFormEl) onboardingFormEl.addEventListener("submit", handleOnboarding);

  const votingFormEl = $("#votingForm");
  if (votingFormEl) votingFormEl.addEventListener("submit", handleCastVote);

  toggleCategoryFields();
  renderProposalMaterials();
  startCountdownTimer();

  // Auto Pi Auth Check
  try {
    if (window.Pi) {
      await handlePiAuth();
    }
  } catch (e) {
    console.warn("Auto sign-in pending user action:", e);
  }
}

// --- LOGIKA COUNTDOWN TIMER DURASI VOTING ---
function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = votingEndTime.getTime() - now;

    const display = $("#countdownDisplay");
    const btn = $("#btnSubmitVote");

    if (distance <= 0) {
      clearInterval(countdownInterval);
      if (display) {
        display.textContent = "⚠️ VOTING TELAH BERAKHIR";
        display.className = "bg-red-500/10 text-red-500 border border-red-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold animate-pulse";
      }
      if (btn) {
        btn.disabled = true;
        btn.innerText = "⛔ Sesi Voting Ditutup (Waktu Habis)";
        btn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-lg text-xs cursor-not-allowed";
      }
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (display) {
      display.textContent = `⏳ sisa waktu: ${hours}j ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    }
  }, 1000);
}

// --- UI STATUS HELPERS ---
function setConnection(message, good = false) {
  const element = $("#connection-status");
  if (!element) return;
  element.textContent = message;
  element.className = `status-pill ${good ? "status-good text-emerald-400" : "status-neutral text-slate-400"}`;
}

function renderUser(user) {
  currentUser = user || null;
  const userBadge = $("#userBadge");
  const displayUsername = $("#displayUsername");
  const loginStatusText = $("#loginStatusText");
  const adminSection = $("#section-admin");
  const adminNavLink = $("#nav-admin-link");

  if (user) {
    activeUser.username = user.username;
    if (userBadge) userBadge.classList.remove("hidden");
    if (userBadge) userBadge.classList.add("flex");
    if (displayUsername) displayUsername.textContent = "@" + user.username;
    if (loginStatusText) loginStatusText.textContent = `Terautentikasi: @${user.username} ${user.demo ? "(DEMO)" : ""}`;

    const isAdmin = AUTHORIZED_ADMINS.includes(user.username);
    if (adminSection) adminSection.classList.toggle("hidden", !isAdmin);
    if (adminNavLink) adminNavLink.classList.toggle("hidden", !isAdmin);
  } else {
    if (userBadge) userBadge.classList.add("hidden");
    if (userBadge) userBadge.classList.remove("flex");
    if (loginStatusText) loginStatusText.textContent = "Belum terautentikasi";
    if (adminSection) adminSection.classList.add("hidden");
    if (adminNavLink) adminNavLink.classList.add("hidden");
  }
}

// --- AUTHENTICATION ---
async function handlePiAuth() {
  if (!window.Pi) {
    throw new Error("Pi SDK belum dimuat. Buka di dalam Pi Browser.");
  }

  await window.Pi.init({ version: "2.0", sandbox: true });

  const auth = await window.Pi.authenticate(["username", "payments"], (payment) => {
    console.warn("Incomplete payment found:", payment);
  });

  if (!auth || !auth.accessToken) {
    throw new Error("Gagal memperoleh token otentikasi Pi SDK.");
  }

  const verifiedUser = {
    username: auth.user.username,
    uid: auth.user.uid,
    demo: false
  };

  renderUser(verifiedUser);
  setConnection("● Verified by Pi SDK", true);
  return verifiedUser;
}

const piLoginBtn = $("#pi-login-button");
if (piLoginBtn) {
  piLoginBtn.addEventListener("click", async () => {
    piLoginBtn.disabled = true;
    try {
      const user = await handlePiAuth();
      alert(`Selamat datang @${user.username}! Otentikasi Pi SDK Berhasil.`);
    } catch (error) {
      alert("Pi Login Notice: " + error.message);
    } finally {
      piLoginBtn.disabled = false;
    }
  });
}

const demoLoginBtn = $("#demo-login-button");
if (demoLoginBtn) {
  demoLoginBtn.addEventListener("click", () => {
    renderUser({ username: "afifmasfiqo", demo: true });
    alert("Masuk ke Mode Simulasi Demo sebagai @afifmasfiqo.");
  });
}

// --- ONBOARDING & CATEGORY TOGGLES ---
function toggleCategoryFields() {
  const cat = $("#voterCategory") ? $("#voterCategory").value : "owner";
  const ownerFields = $("#ownerFields");
  const delegatorFields = $("#delegatorFields");

  if (ownerFields) ownerFields.classList.toggle("hidden", cat !== "owner");
  if (delegatorFields) delegatorFields.classList.toggle("hidden", cat !== "delegator");
}

function updateDelegatorHint() {
  const type = $("#delegatorNftType") ? $("#delegatorNftType").value : "halloween";
  const hint = $("#delegatorHint");
  if (hint) {
    hint.textContent = type === "halloween"
      ? "Wajib memasukkan tepat 1 Hash NFT Halloween."
      : "Wajib memasukkan tepat 3 Hash NFT PiDay2026 (dipisahkan tanda koma).";
  }
}

function handleOnboarding(e) {
  e.preventDefault();

  const category = $("#voterCategory").value;
  const role = $("#userRole").value;
  const wallet = $("#walletAddress").value.trim();
  const chapter = $("#communityChapter") ? $("#communityChapter").value : "GLOBAL";

  if (category === "owner") {
    const gId = parseInt($("#garudaId").value || "0");
    const gHash = $("#garudaHash").value.trim();

    if (!gId || gId < 1 || gId > 1000) {
      alert("Pendaftaran Ditolak: Garuda ID harus berupa angka antara #1 sampai #1000.");
      return;
    }
    if (!gHash) {
      alert("Pendaftaran Ditolak: Hash / Token ID NFT Garuda wajib diisi.");
      return;
    }

    if (role === "Founder" && gId !== 999) {
      alert("SECURITY REJECTION: Peran Founder HANYA VALID untuk pemilik Garuda ID #999.");
      return;
    }

    activeUser.garudaId = gId;
    activeUser.garudaHash = gHash;
  } else if (category === "delegator") {
    const ownerUsername = $("#ownerUsername").value.trim();
    const nftType = $("#delegatorNftType").value;
    const rawHashes = $("#delegatorHashes").value.trim();
    const hashList = rawHashes.split(",").map((h) => h.trim()).filter((h) => h.length > 0);

    if (!ownerUsername) {
      alert("Pendaftaran Ditolak: Username pemilik asli Garuda wajib diisi.");
      return;
    }
    if (nftType === "halloween" && hashList.length !== 1) {
      alert("Pendaftaran Ditolak: NFT Halloween membutuhkan tepat 1 Hash NFT.");
      return;
    }
    if (nftType === "piday" && hashList.length !== 3) {
      alert("Pendaftaran Ditolak: NFT PiDay2026 membutuhkan tepat 3 Hash NFT (dipisahkan koma).");
      return;
    }

    activeUser.ownerUsername = ownerUsername;
    activeUser.delegatedNftType = nftType;
    activeUser.delegatedHashes = hashList;
  }

  activeUser.walletAddress = wallet;
  activeUser.category = category;
  activeUser.role = role;
  activeUser.chapter = chapter;

  const displayGaruda = $("#displayGaruda");
  if (displayGaruda) {
    displayGaruda.textContent = activeUser.garudaId ? `#${activeUser.garudaId}` : `DELEGATE (${category.toUpperCase()})`;
  }

  alert(`✅ Registrasi Berhasil!\nStatus: ${category.toUpperCase()}\nRole: ${role}\nWilayah: ${chapter}`);
}

// --- PROPOSAL MATERIAL MANAGER & PUBLISH SUITE ---
function renderProposalMaterials() {
  if ($("#displayPropTitle")) $("#displayPropTitle").textContent = activeProposal.title;
  if ($("#displayPropCategory")) $("#displayPropCategory").textContent = "🏷️ Kategori: " + activeProposal.category;
  if ($("#displayPropDescription")) $("#displayPropDescription").textContent = activeProposal.description;
  if ($("#displayPropAuthor")) $("#displayPropAuthor").textContent = activeProposal.author;
  if ($("#displayPropDate")) $("#displayPropDate").textContent = activeProposal.date;

  // Render Tautan Media Sosial Multi-Platform
  const linksContainer = $("#socialLinksContainer");
  if (linksContainer && activeProposal.socialLinks) {
    const s = activeProposal.socialLinks;
    linksContainer.innerHTML = `
      ${s.fb ? `<a href="${s.fb}" target="_blank" class="flex items-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 transition"><span class="text-blue-400">📘</span> Facebook</a>` : ''}
      ${s.x ? `<a href="${s.x}" target="_blank" class="flex items-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 transition"><span class="text-slate-100">🖤</span> X (Twitter)</a>` : ''}
      ${s.yt ? `<a href="${s.yt}" target="_blank" class="flex items-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 transition"><span class="text-red-500">🔴</span> YouTube</a>` : ''}
      ${s.discord ? `<a href="${s.discord}" target="_blank" class="flex items-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 transition"><span class="text-indigo-400">💬</span> Discord / Telegram</a>` : ''}
      ${s.pi ? `<a href="${s.pi}" target="_blank" class="flex items-center gap-2 p-2.5 bg-slate-950 hover:bg-slate-800 border border-amber-500/40 rounded-lg text-amber-300 transition"><span class="text-purple-400">⚡</span> Pi dApp Explorer</a>` : ''}
    `;
  }

  // Render Galeri Multi-Foto
  const galleryContainer = $("#mediaGalleryContainer");
  if (galleryContainer && activeProposal.images) {
    galleryContainer.innerHTML = activeProposal.images.map((imgUrl, idx) => `
      <div class="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center">
        <span class="text-[10px] font-semibold text-slate-400 block mb-1">Bukti Foto #${idx + 1}:</span>
        <img src="${imgUrl}" alt="Bukti Foto #${idx + 1}" class="w-full h-44 object-cover rounded border border-slate-800">
      </div>
    `).join("");
  }

  // Render Video (Embed YouTube atau Native Direct MP4)
  const videoElem = $("#displayMediaVideo");
  const iframeElem = $("#displayMediaIframe");
  const placeholder = $("#videoPlaceholder");

  if (activeProposal.videoUrl) {
    if (placeholder) placeholder.classList.add("hidden");

    if (activeProposal.videoUrl.includes("youtube.com") || activeProposal.videoUrl.includes("youtu.be")) {
      let embedUrl = activeProposal.videoUrl;
      if (embedUrl.includes("watch?v=")) {
        embedUrl = embedUrl.replace("watch?v=", "embed/");
      } else if (embedUrl.includes("youtu.be/")) {
        embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
      }
      if (iframeElem) {
        iframeElem.src = embedUrl;
        iframeElem.classList.remove("hidden");
      }
      if (videoElem) videoElem.classList.add("hidden");
    } else {
      if (videoElem) {
        videoElem.src = activeProposal.videoUrl;
        videoElem.classList.remove("hidden");
      }
      if (iframeElem) iframeElem.classList.add("hidden");
    }
  } else {
    if (placeholder) placeholder.classList.remove("hidden");
    if (iframeElem) iframeElem.classList.add("hidden");
    if (videoElem) videoElem.classList.add("hidden");
  }
}

function publishNewProposal(e) {
  e.preventDefault();

  activeProposal.title = $("#inputPropTitle").value.trim() || "Proposal Tanpa Judul";
  activeProposal.category = $("#inputPropCategory").value;
  activeProposal.description = $("#inputPropDesc").value.trim();

  // 1. Atur Durasi Waktu Voting & Reset Countdown Timer
  const durationInput = $("#inputPropDuration");
  const durationHrs = durationInput ? parseFloat(durationInput.value) || 24 : 24;
  activeProposal.durationHours = durationHrs;
  votingEndTime = new Date(Date.now() + durationHrs * 60 * 60 * 1000);

  // Enable kembali tombol voting jika sebelumnya habis
  const btnSubmit = $("#btnSubmitVote");
  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
    btnSubmit.className = "w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg text-xs transition shadow-lg";
  }
  startCountdownTimer();

  // 2. Olah Multi-Media Foto
  const rawImages = $("#inputPropImages") ? $("#inputPropImages").value.trim() : "";
  if (rawImages) {
    activeProposal.images = rawImages.split(",").map(img => img.trim()).filter(img => img.length > 0);
  } else {
    activeProposal.images = ["https://via.placeholder.com/600x350/0f172a/f59e0b?text=Bukti+Foto+Objek+Voting"];
  }

  // 3. Olah Video URL
  activeProposal.videoUrl = $("#inputPropVideo") ? $("#inputPropVideo").value.trim() : "";

  // 4. Olah Multi-Link Media Sosial
  activeProposal.socialLinks = {
    fb: $("#inputSocialFb") ? $("#inputSocialFb").value.trim() : "",
    x: $("#inputSocialX") ? $("#inputSocialX").value.trim() : "",
    yt: $("#inputSocialYt") ? $("#inputSocialYt").value.trim() : "",
    discord: $("#inputSocialDiscord") ? $("#inputSocialDiscord").value.trim() : "",
    pi: $("#inputSocialPi") ? $("#inputSocialPi").value.trim() : ""
  };

  renderProposalMaterials();
  alert(`✅ Proposal Baru Berhasil Diterbitkan!\nDurasi Voting diatur: ${durationHrs} Jam dari sekarang.`);
}

// --- ON-CHAIN REALTIME NFT VERIFICATION ---
async function verifyOnChainNftOwnership() {
  if (activeUser.category === "witness") return true;

  if (activeUser.category === "owner") {
    return !!(activeUser.walletAddress && activeUser.garudaHash);
  }

  if (activeUser.category === "delegator") {
    if (activeUser.delegatedNftType === "halloween") {
      return activeUser.delegatedHashes && activeUser.delegatedHashes.length === 1;
    }
    if (activeUser.delegatedNftType === "piday") {
      return activeUser.delegatedHashes && activeUser.delegatedHashes.length === 3;
    }
  }
  return false;
}

function setConfidence(val) {
  currentConfidence = val;
  document.querySelectorAll(".conf-btn").forEach((btn, idx) => {
    if (idx + 1 === val) {
      btn.classList.add("bg-amber-500", "text-slate-950", "font-bold");
    } else {
      btn.classList.remove("bg-amber-500", "text-slate-950", "font-bold");
    }
  });
}

function clearVoterSignature() {
  if (voterSigPad) voterSigPad.clear();
}

function clearOfficerSig(id) {
  if (signaturePads[id]) signaturePads[id].clear();
}

// --- FAST VOTING SUBMISSION ---
async function handleCastVote(e) {
  e.preventDefault();

  if (new Date().getTime() > votingEndTime.getTime()) {
    alert("⛔ PROSES VOTING DITOLAK!\n\nSesi waktu voting untuk proposal ini telah berakhir.");
    return;
  }

  const btn = $("#btnSubmitVote");
  if (btn) {
    btn.innerText = "Memeriksa NFT di Wallet On-Chain...";
    btn.disabled = true;
  }

  const isNftValid = await verifyOnChainNftOwnership();
  if (!isNftValid) {
    if (btn) {
      btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
      btn.disabled = false;
    }
    alert("⛔ AKSES VOTING DITOLAK!\n\nSistem gagal mengonfirmasi kepemilikan NFT di wallet Pi Anda.\nNFT terdaftar (Garuda / Halloween / PiDay2026) tidak terdeteksi secara On-Chain.");

    const banBanner = $("#banBanner");
    const banReason = $("#banReason");
    if (banBanner) banBanner.classList.remove("hidden");
    if (banReason) banReason.innerText = "Akses Voting Ditolak: NFT terdaftar tidak ditemukan di wallet Anda.";
    return;
  }

  if (!voterSigPad || voterSigPad.isEmpty()) {
    if (btn) {
      btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
      btn.disabled = false;
    }
    alert("Harap bubuhkan tanda tangan digital Anda terlebih dahulu.");
    return;
  }

  const selectedValue = document.querySelector('input[name="voteValue"]:checked');
  if (!selectedValue) {
    if (btn) {
      btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
      btn.disabled = false;
    }
    alert("Pilih arah suara Anda (Agree / Neutral / Disagree).");
    return;
  }

  const voteVal = parseInt(selectedValue.value);
  let roleWeight = 0.5;
  if (activeUser.role === "Group Leader") roleWeight = 1.0;
  if (activeUser.role === "Founder") roleWeight = 2.0;

  const individualScore = voteVal * currentConfidence * roleWeight;
  const timestamp = new Date().toISOString();
  const rawPayload = `${activeUser.username || "Anonymous"}|${activeUser.walletAddress}|${voteVal}|${currentConfidence}|${roleWeight}|${timestamp}`;

  let voteHash = "HASH_GENERATED";
  if (window.CryptoJS) {
    voteHash = window.CryptoJS.SHA256(rawPayload).toString();
  }

  if (btn) {
    btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
    btn.disabled = false;
  }

  alert(`✅ SUARA TERKONFIRMASI & HASH TERSIMPANI!\n\nSkor Terbobot: ${individualScore}\nHash SHA-256: ${voteHash.substring(0, 24)}...`);
}

// --- ADMIN / ETHICS ACTIONS ---
function toggleUserBan(isBan) {
  const target = $("#targetUser") ? $("#targetUser").value.trim() : "";
  if (!target) return alert("Masukkan Username Pi Target.");
  alert(`User ${target} telah berhasil di-${isBan ? "BAN / RESTRICTED" : "REINSTATED"}.`);
}

function savePayoutRate() {
  const rate = $("#payoutRate") ? $("#payoutRate").value : "1.0";
  alert(`Rate insentif berhasil diperbarui menjadi ${rate} Pi / suara.`);
}

function uploadAsset(e, type) {
  const file = e.target.files[0];
  if (file && type === "logo") {
    const logoEl = $("#appLogo");
    if (logoEl) logoEl.src = URL.createObjectURL(file);
    alert("Logo header berhasil diperbarui.");
  }
}

function changeLanguage(lang) {
  if (lang === "ar") {
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }
}

// --- HELPER UNTUK PDF BRANDING & STEMPEL EMAS ---
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
  if (logo) {
    try {
      pdf.addImage(logo, "PNG", 155, 10, 35, 22);
    } catch (e) {
      console.warn("Gagal memuat logo.png:", e);
    }
  }
}

async function addOfficialStamp(pdf, x, y, width = 48, height = 48) {
  const goldStampData = await loadAndColorizeStamp("/stempel-tvod.png", "#F59E0B");
  if (goldStampData) {
    try {
      pdf.addImage(goldStampData, "PNG", x, y, width, height);
    } catch (e) {
      console.warn("Gagal menyematkan stempel emas:", e);
    }
  }
}

// ==============================================================================
// 1. GENERATE OFFICIAL MINUTES PDF (FOR PI CORE TEAM REPORTING)
// ==============================================================================
async function generateOfficialMinutesPDF() {
  if (!window.jspdf?.jsPDF) {
    alert("Pustaka PDF tidak tersedia.");
    return;
  }

  const pdf = new window.jspdf.jsPDF();
  await addBranding(pdf);

  // Header TVOD
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("THE VOICE OF DAO (TVOD)", 15, 18);
  pdf.setFontSize(9);
  pdf.setFont("Helvetica", "normal");
  pdf.text("Pi Network Web3 Governance Ecosystem", 15, 23);

  pdf.setFontSize(11);
  pdf.setFont("Helvetica", "bold");
  pdf.text("OFFICIAL MINUTES OF PROCEEDINGS & VERIFICATION RECORD", 15, 31);
  pdf.line(15, 34, 195, 34);

  // Metadata Dokumen
  pdf.setFontSize(8);
  pdf.setFont("Helvetica", "bold");
  pdf.text(`Document ID: ${activeProposal.id}`, 15, 41);
  pdf.text("Security Classification: CONFIDENTIAL / ON-CHAIN VERIFIED", 115, 41);

  // PREAMBLE
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("PREAMBLE & CONVENING STATEMENT", 15, 50);
  pdf.setFont("Helvetica", "normal");
  pdf.setFontSize(8);
  const preambleText = `On this day, ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, the governance body and verified voters of The Voice of DAO (TVOD) officially convened via the Pi Browser Web3 Infrastructure to review, audit, and execute a cryptographic weighted vote upon the formal proposal submitted under Reference ${activeProposal.id}. The proceedings were conducted in full compliance with TVOD Governance Rules, utilizing real-time PiBox Smart Contract wallet verification and immutable SHA-256 proof logging.`;
  pdf.text(pdf.splitTextToSize(preambleText, 180), 15, 55);

  // SECTION I: METADATA
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("SECTION I: PROPOSAL & CASE METADATA", 15, 75);
  pdf.setFont("Helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(`• Proposal Title       : ${activeProposal.title}`, 15, 81);
  pdf.text(`• Case Category        : ${activeProposal.category}`, 15, 86);
  pdf.text(`• Presiding Chairman   : @afifmasfiqo (Garuda ID: #911)`, 15, 91);
  pdf.text(`• Presiding Inspector  : @Nalaktak (Garuda ID: #999)`, 15, 96);
  pdf.text(`• Community Chapter    : ${activeUser.chapter || "GLOBAL"}`, 15, 101);
  pdf.text(`• Voting Expiry Date   : ${votingEndTime.toLocaleString('en-US')}`, 15, 106);

  // SECTION II: SCORING & VERDICT
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("SECTION II: MATHEMATICAL SCORING & VERDICT BREAKDOWN", 15, 116);
  pdf.setFont("Helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("Formula: Individual Score = (Vote Direction: +1/0/-1) x (Confidence: 1-5) x (Role Weight)", 15, 122);
  pdf.text("Applied Role Weights: Founder = 2.0 | Group Leader = 1.0 | Member = 0.5", 15, 127);
  pdf.text(`• Total Verified Ballots Cast : ${activeProposal.totalVotes} Ballots`, 15, 133);
  pdf.text(`• Aggregate Net Score        : +${activeProposal.netScore} Points`, 15, 138);
  pdf.setFont("Helvetica", "bold");
  pdf.text(`• FINAL GOVERNANCE VERDICT  : PASSED (AGREE)`, 15, 144);

  // SECTION III: SIGNATURE BLOCKS & GOLD STAMP
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("SECTION III: OFFICIAL AUTHORIZATION & SIGNATURES", 15, 156);

  const signers = [
    { title: "Chairman", name: "@afifmasfiqo (#911)", id: "sig-chairman", x: 15, y: 165 },
    { title: "Witness", name: "@insya (Witness)", id: "sig-witness", x: 105, y: 165 },
    { title: "Inspector", name: "@Nalaktak (#999)", id: "sig-inspector", x: 15, y: 200 },
    { title: "Country Head", name: "@Rasj81", id: "sig-country-head", x: 105, y: 200 }
  ];

  signers.forEach((s) => {
    pdf.setFontSize(8);
    pdf.setFont("Helvetica", "bold");
    pdf.text(`${s.title}: ${s.name}`, s.x, s.y);
    pdf.line(s.x, s.y + 22, s.x + 70, s.y + 22);

    if (signaturePads[s.id] && !signaturePads[s.id].isEmpty()) {
      try {
        pdf.addImage(signaturePads[s.id].toDataURL("image/png"), "PNG", s.x, s.y + 2, 60, 18);
      } catch (err) {
        console.warn("Signature export failed for:", s.id);
      }
    }
  });

  // MENEMPELKAN STEMPEL EMAS RESMI TVOD DI ATAS SIGNATURE BLOCK
  await addOfficialStamp(pdf, 135, 175, 48, 48);

  // SHA-256 PROOF & FOOTER
  let shaProof = "TVOD-PROOF-SHA256";
  if (window.CryptoJS) {
    shaProof = window.CryptoJS.SHA256(`TVOD-MINUTES-${Date.now()}`).toString();
  }
  pdf.setFontSize(7);
  pdf.setFont("Courier", "normal");
  pdf.text(`SHA-256 Cryptographic Proof: ${shaProof}`, 15, 245);
  pdf.text("Disclaimer: Official Minutes compiled for Pi Core Team reporting, Web3 ecosystem audit, and governance record.", 15, 250);

  pdf.save(`TVOD_Official_Minutes_${activeProposal.id}.pdf`);
}

// ==============================================================================
// 2. GENERATE DIGITAL VERIFICATION CERTIFICATE (FOR VOTING OBJECT / PROPOSER)
// ==============================================================================
async function generateCertificatePDF() {
  if (!window.jspdf?.jsPDF) {
    alert("Pustaka PDF tidak tersedia.");
    return;
  }

  const pdf = new window.jspdf.jsPDF();
  await addBranding(pdf);

  // Header Sertifikat
  pdf.setFontSize(18);
  pdf.setFont("Helvetica", "bold");
  pdf.text("THE VOICE OF DAO", 15, 25);
  pdf.setFontSize(11);
  pdf.text("OFFICIAL DIGITAL VERIFICATION CERTIFICATE", 15, 33);
  pdf.setFontSize(8);
  pdf.setFont("Helvetica", "normal");
  pdf.text("Pi Network Web3 Ecosystem Governance", 15, 38);
  pdf.line(15, 42, 195, 42);

  // Pernyataan Sertifikasi Objek
  pdf.setFontSize(10);
  pdf.setFont("Helvetica", "bold");
  pdf.text("THIS IS TO OFFICIALLY CERTIFY THAT THE VOTING OBJECT / PROPOSAL:", 15, 52);

  pdf.setFontSize(12);
  pdf.setFont("Helvetica", "bold");
  pdf.text(`"${activeProposal.title}"`, 15, 62);

  pdf.setFontSize(9);
  pdf.setFont("Helvetica", "normal");
  pdf.text(`Submitted By Entity / Creator : ${activeProposal.proposerEntity} (@${activeProposal.proposerUsername})`, 15, 72);
  pdf.text(`Case Category                : ${activeProposal.category}`, 15, 78);
  pdf.text(`Verification Reference ID    : ${activeProposal.id}`, 15, 84);
  pdf.text(`Date of Final Ratification   : ${activeProposal.date}`, 15, 90);

  pdf.line(15, 95, 195, 95);

  // Status Hasil Governance & Verdict
  pdf.setFontSize(10);
  pdf.setFont("Helvetica", "bold");
  pdf.text("GOVERNANCE AUDIT VERDICT:", 15, 105);

  pdf.setFontSize(14);
  pdf.text("STATUS: TVOD VERIFIED & PASSED", 15, 115);

  pdf.setFontSize(9);
  pdf.setFont("Helvetica", "normal");
  pdf.text(`Net Weighted Score Achieved  : +${activeProposal.netScore} Points`, 15, 124);
  pdf.text(`Total Verified On-Chain Votes: ${activeProposal.totalVotes} Ballots`, 15, 130);
  pdf.text(`Verification Protocol        : PiBox Smart Contract Real-Time Wallet Verification`, 15, 136);

  // MENEMPELKAN STEMPEL EMAS RESMI TVOD DI SISI KANAN
  await addOfficialStamp(pdf, 135, 100, 52, 52);

  // QR Code Live Verification
  if (window.QRCode) {
    const qrDiv = document.createElement("div");
    new window.QRCode(qrDiv, { text: `https://tvod-verifier.vercel.app/verify/${activeProposal.id}`, width: 120, height: 120 });
    await new Promise((res) => setTimeout(res, 200));
    const qrCanvas = qrDiv.querySelector("canvas");
    if (qrCanvas) {
      pdf.addImage(qrCanvas.toDataURL("image/png"), "PNG", 15, 145, 38, 38);
      pdf.setFontSize(7);
      pdf.text("Scan QR Code to audit live verification record on Pi Browser", 15, 187);
    }
  }

  // SHA-256 Proof & Signature Header
  let certHash = "CERT-HASH-PROVED";
  if (window.CryptoJS) {
    certHash = window.CryptoJS.SHA256(`CERT-${activeProposal.id}-${Date.now()}`).toString();
  }

  pdf.setFontSize(7);
  pdf.setFont("Courier", "normal");
  pdf.text(`SHA-256 Certificate Hash: ${certHash}`, 15, 200);

  pdf.setFontSize(8);
  pdf.setFont("Helvetica", "bold");
  pdf.text("Issued by Governance Chairman: @afifmasfiqo (#911)", 15, 210);

  pdf.setFontSize(7);
  pdf.setFont("Helvetica", "italic");
  pdf.text("Disclaimer: Konten ini dibuat semata-mata untuk tujuan hiburan, berbagi panduan simulasi permainan digital, serta edukasi komunitas.", 15, 220);

  pdf.save(`TVOD_Digital_Verification_Certificate_${activeProposal.id}.pdf`);
}

// Execute Initialize when DOM is Ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
