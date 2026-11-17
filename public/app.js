"use strict";

const $ = (selector) => document.querySelector(selector);

const TVOD_APP_WALLET = "GBBIFANYEV6J5OYXPCFF4AYXTWQFIJNSIF4YYFF26LETN3PHA3TDQ3WL";
const AUTHORIZED_ADMINS = ["afifmasfiqo", "Nalaktak", "insya", "Rasj81"];

function isValidPiWalletAddress(address) {
  if (!address) return false;
  const cleanAddr = address.trim();
  return /^[GM][A-Z2-7]{55}$/i.test(cleanAddr);
}

const SUPABASE_URL = "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const i18nDictionary = {
  id: {
    app_title: "THE VOICE OF DAO",
    sub_title: "WEB3 VERIFIER & VOTING dAPP",
    nav_home: "🔑 Onboarding",
    nav_proposal: "📄 Voting",
    nav_verify: "🗳️ Fast Vote",
    nav_admin: "🛡️ Admin",
    step1_title: "Pendaftaran Pemilih & Verifikasi Pi Wallet",
    label_wallet: "Alamat Pi Wallet (Awalan G / M, 56 Karakter)",
    label_category: "Kategori Pemilih",
    label_chapter: "Wilayah Komunitas",
    label_role: "Peran Tata Kelola",
    btn_register: "Verifikasi Data & Buka Akses Voting",
    prop_bg_title: "📄 LATAR BELAKANG & DESKRIPSI OBJEK",
    vote_step_title: "Modul Fast Voting",
    vote_dir_label: "1. Arah Voting Anda",
    vote_agree: "👍 Setuju (+1)",
    vote_neutral: "😐 Netral (0)",
    vote_disagree: "👎 Tidak Setuju (-1)",
    confidence_label: "2. Tingkat Keyakinan (Skala 1 - 5)",
    btn_submit_vote: "Kirim Vote Enkripsi & Klaim Pi",
    admin_title: "🛡️ Admin Suite",
  },
  en: {
    app_title: "THE VOICE OF DAO",
    sub_title: "WEB3 VERIFIER & VOTING dAPP",
    nav_home: "🔑 Onboarding",
    nav_proposal: "📄 Voting",
    nav_verify: "🗳️ Fast Vote",
    nav_admin: "🛡️ Admin",
    step1_title: "Voter Registration & Pi Wallet",
    label_wallet: "Pi Wallet Address (Prefix G / M, 56 Characters)",
    label_category: "Voter Category",
    label_chapter: "Community Chapter",
    label_role: "Governance Role",
    btn_register: "Verify Data & Enable Voting",
    prop_bg_title: "📄 BACKGROUND & DESCRIPTION",
    vote_step_title: "Fast Voting Module",
    vote_dir_label: "1. Your Vote Direction",
    vote_agree: "👍 Agree (+1)",
    vote_neutral: "😐 Neutral (0)",
    vote_disagree: "👎 Disagree (-1)",
    confidence_label: "2. Confidence Level (Scale 1 - 5)",
    btn_submit_vote: "Submit Encrypted Vote & Claim Pi",
    admin_title: "🛡️ Admin Suite",
  }
};

let currentLanguage = "id";
function changeLanguage(lang) {
  if (!lang) return;
  currentLanguage = i18nDictionary[lang] ? lang : "id";
  document.documentElement.lang = currentLanguage;
  const dict = i18nDictionary[currentLanguage];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict && dict[key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = dict[key];
      else el.textContent = dict[key];
    }
  });
}

let currentUser = null;
let currentOpenedDocType = null;
let activeUser = {
  username: "afifmasfiqo",
  walletAddress: TVOD_APP_WALLET,
  category: "owner",
  role: "Group Leader",
  chapter: "GLOBAL",
  garudaId: 911,
  garudaHash: null
};

let currentConfidence = 3;
const signaturePads = {};
let votingEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
let countdownInterval = null;

let activeProposal = {
  id: "TVOD-PROP-2026-001",
  title: "Ratification of Web3 Verification System & TVOD Voting Incentive Distribution",
  category: "Community Voting",
  author: "afifmasfiqo",
  description: "Berkas bukti verifikasi objek voting terkait pengajuan sistem reward dan kepatuhan Kode Etik.",
  totalVotes: 0,
  netScore: 0,
  status: "ACTIVE"
};

function saveSignatureToStorage(id) {
  if (signaturePads[id] && !signaturePads[id].isEmpty()) {
    localStorage.setItem(`tvod_sig_${id}`, signaturePads[id].toDataURL("image/png"));
  }
}

function getSignatureDataUrl(id) {
  if (signaturePads[id] && !signaturePads[id].isEmpty()) {
    const url = signaturePads[id].toDataURL("image/png");
    localStorage.setItem(`tvod_sig_${id}`, url);
    return url;
  }
  return localStorage.getItem(`tvod_sig_${id}`) || null;
}

// Inisialisasi Pi SDK
async function initPiSDK() {
  let attempts = 30;
  while (!window.Pi && attempts > 0) {
    await new Promise(r => setTimeout(r, 100));
    attempts--;
  }
  if (!window.Pi) return false;
  try {
    window.Pi.init({ version: "2.0", sandbox: false });
    return true;
  } catch (e) {
    return true;
  }
}

async function handlePiAuth() {
  await initPiSDK();
  if (!window.Pi) throw new Error("Pi SDK tidak tersedia. Buka di Pi Browser.");

  return new Promise((resolve, reject) => {
    window.Pi.authenticate(['username', 'payments'], () => {}).then(auth => {
      if (!auth || !auth.user) return reject(new Error("Autentikasi gagal."));
      const user = { username: auth.user.username, uid: auth.user.uid, demo: false };
      localStorage.setItem("tvod_user_session", JSON.stringify(user));
      renderUser(user);
      setConnection("● Pi SDK Verified", true);
      resolve(user);
    }).catch(reject);
  });
}

function checkSavedSession() {
  const saved = localStorage.getItem("tvod_user_session");
  if (saved) {
    try {
      const user = JSON.parse(saved);
      if (user && user.username) {
        renderUser(user);
        setConnection(user.demo ? "● Demo Mode" : "● Pi SDK Verified", true);
      }
    } catch (e) {}
  }
}

async function fetchVoterStatsForAdmin() {
  const display = $("#adminVoterCountDisplay");
  if (!supabaseClient || !activeProposal.id) return;
  try {
    const { data: voteRows } = await supabaseClient.from('votes').select('*').eq('proposal_id', activeProposal.id);
    if (voteRows && display) {
      display.textContent = `${voteRows.length} Voters`;
    }
  } catch (e) {}
}

async function initialize() {
  setConnection("● Ready", true);
  const langSelectEl = $("#langSelect");
  if (langSelectEl) {
    langSelectEl.addEventListener("change", (e) => changeLanguage(e.target.value));
  }
  changeLanguage("id");

  ["sig-chairman", "sig-witness", "sig-inspector", "sig-country-head"].forEach((id) => {
    const canvas = $(`#${id}`);
    if (canvas && window.SignaturePad) {
      signaturePads[id] = new window.SignaturePad(canvas, { backgroundColor: "rgba(0,0,0,0)", penColor: "rgb(245, 158, 11)" });
      signaturePads[id].addEventListener("afterUpdateStroke", () => saveSignatureToStorage(id));
    }
  });

  const voterCatEl = $("#voterCategory");
  if (voterCatEl) voterCatEl.addEventListener("change", () => {
    const cat = voterCatEl.value;
    $("#ownerFields")?.classList.toggle("hidden", cat !== "owner");
    $("#delegatorFields")?.classList.toggle("hidden", cat !== "delegator");
  });

  $("#onboardingForm")?.addEventListener("submit", handleOnboarding);
  $("#votingForm")?.addEventListener("submit", handleCastVote);

  startCountdownTimer();
  await initPiSDK();
  checkSavedSession();
  fetchVoterStatsForAdmin();
}

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const distance = votingEndTime.getTime() - Date.now();
    const display = $("#countdownDisplay");
    if (distance <= 0) {
      if (display) display.textContent = "⚠️ VOTING CLOSED";
      return;
    }
    const h = Math.floor(distance / 3600000);
    const m = Math.floor((distance % 3600000) / 60000);
    const s = Math.floor((distance % 60000) / 1000);
    if (display) display.textContent = `⏳ ${h}h ${m}m ${s}s`;
  }, 1000);
}

function setConnection(message, good = false) {
  const el = $("#connection-status");
  if (el) {
    el.textContent = message;
    el.className = `px-2.5 py-0.5 rounded-full font-mono text-xs ${good ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-400"}`;
  }
}

function renderUser(user) {
  currentUser = user || null;
  if (user) {
    activeUser.username = user.username;
    $("#userBadge")?.classList.remove("hidden");
    $("#userBadge")?.classList.add("flex");
    if ($("#displayUsername")) $("#displayUsername").textContent = "@" + user.username;
    if ($("#loginStatusText")) $("#loginStatusText").textContent = `Authenticated: @${user.username}`;

    const isAdmin = AUTHORIZED_ADMINS.includes(user.username);
    $("#section-admin")?.classList.toggle("hidden", !isAdmin);
    $("#nav-admin-link")?.classList.toggle("hidden", !isAdmin);
  }
}

// Tombol Login Pi SDK
const piLoginBtn = $("#pi-login-button");
if (piLoginBtn) {
  piLoginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    piLoginBtn.disabled = true;
    piLoginBtn.innerText = "Connecting...";
    try {
      const user = await handlePiAuth();
      piLoginBtn.innerText = "Signed In (✓)";
      piLoginBtn.classList.add('bg-emerald-600', 'text-white');
      alert(`Berhasil Login! Selamat datang @${user.username}`);
    } catch (err) {
      alert("Gagal Login Pi SDK: " + (err.message || err));
      piLoginBtn.innerText = "Sign in with Pi SDK";
      piLoginBtn.disabled = false;
    }
  });
}

$("#demo-login-button")?.addEventListener("click", (e) => {
  e.preventDefault();
  const demoUser = { username: "afifmasfiqo", demo: true };
  localStorage.setItem("tvod_user_session", JSON.stringify(demoUser));
  renderUser(demoUser);
  alert("Entered Demo Mode.");
});

async function handleOnboarding(e) {
  if (e) e.preventDefault();
  const wallet = $("#walletAddress")?.value.trim() || "";
  if (!wallet || !isValidPiWalletAddress(wallet)) {
    alert("⛔ ALAMAT WALLET TIDAK VALID! Harus berawalan G/M dan 56 karakter.");
    return;
  }
  activeUser.walletAddress = wallet;
  alert(`✅ Registrasi & Binding Berhasil!`);
}

function setConfidence(val) {
  currentConfidence = val;
  document.querySelectorAll(".conf-btn").forEach((btn, idx) => {
    btn.classList.toggle("bg-amber-500", idx + 1 === val);
    btn.classList.toggle("text-slate-950", idx + 1 === val);
    btn.classList.toggle("font-bold", idx + 1 === val);
  });
}

async function handleCastVote(e) {
  if (e) e.preventDefault();
  const selected = document.querySelector('input[name="voteValue"]:checked');
  if (!selected) {
    alert("Pilih arah voting terlebih dahulu.");
    return;
  }
  const voteVal = parseInt(selected.value);
  const score = voteVal * currentConfidence * 1.0;

  if (supabaseClient) {
    await supabaseClient.from('votes').insert([{
      proposal_id: activeProposal.id,
      username: activeUser.username,
      wallet_address: activeUser.walletAddress,
      vote_direction: voteVal,
      confidence: currentConfidence,
      weighted_score: score,
      created_at: new Date().toISOString()
    }]);
  }
  alert("✅ Vote Berhasil Disimpan & Terenkripsi!");
}

function renderDocumentInModal(title, html) {
  $("#pdfModalTitle").textContent = title;
  $("#documentViewerContent").innerHTML = html;
  $("#pdfDownloadModal")?.classList.remove("hidden");
}

function closePdfModal() {
  $("#pdfDownloadModal")?.classList.add("hidden");
}

function downloadPdfDirect() {
  window.print();
}

function generateOfficialMinutesPDF() {
  renderDocumentInModal("Official Minutes", `<div style="text-align:center;"><h3>OFFICIAL MINUTES REPORT</h3><p>Proposal: ${activeProposal.title}</p></div>`);
}
function generateVoterAuditLogPDF() {
  renderDocumentInModal("Voter Audit Log", `<div style="text-align:center;"><h3>VOTER AUDIT TRAIL LOG</h3><p>Proposal ID: ${activeProposal.id}</p></div>`);
}
function generateCertificatePDF() {
  renderDocumentInModal("Digital Certificate", `<div style="text-align:center;"><h3>CERTIFICATE OF VERIFICATION</h3><p>Issued to @${activeUser.username}</p></div>`);
}

window.setConfidence = setConfidence;
window.closePdfModal = closePdfModal;
window.downloadPdfDirect = downloadPdfDirect;
window.generateOfficialMinutesPDF = generateOfficialMinutesPDF;
window.generateVoterAuditLogPDF = generateVoterAuditLogPDF;
window.generateCertificatePDF = generateCertificatePDF;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
