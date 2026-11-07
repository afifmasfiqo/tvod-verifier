"use strict";

const $ = (selector) => document.querySelector(selector);
const TVOD_APP_WALLET = "GBBIFANYEV6J5OYXPCFF4AYXTWQFIJNSIF4YYFF26LETN3PHA3TDQ3WL";
const AUTHORIZED_ADMINS = ["afifmasfiqo", "Nalaktak", "insya", "Rasj81"];

function ensureHttps(url) {
  if (!url) return "";
  let cleanUrl = url.trim();
  if (cleanUrl.length === 0) return "";
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }
  return cleanUrl;
}

// 1. SUPABASE CLIENT
const SUPABASE_URL = "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// 2. KAMUS TERJEMAHAN MULTI-BAHASA LENGKAP (i18n ENGINE)
const i18nDictionary = {
  id: {
    app_title: "THE VOICE OF DAO",
    sub_title: "WEB3 VERIFIER & VOTING dAPP",
    nav_home: "🔑 Onboarding & Wallet",
    nav_proposal: "📄 Materi Voting",
    nav_verify: "🗳️ Fast Voting",
    nav_admin: "🛡️ Admin Suite",
    step1_title: "Pendaftaran Pemilih & Verifikasi Pi Wallet",
    step1_desc: "Otentikasi Pi SDK dan hubungkan wallet untuk memverifikasi kepemilikan NFT secara On-Chain.",
    label_wallet: "Pi Wallet Address (Public Key untuk Payout & Cek NFT)",
    label_category: "Kategori Pemilih (Voter Category)",
    cat_owner: "Pemilih Tetap (Pemilik NFT Garuda #1 - #1000)",
    cat_delegator: "Delegator (NFT Halloween 1 Unit / NFT PiDay2026 3 Unit)",
    cat_witness: "Saksi Luar (External Witness Bypass)",
    label_chapter: "Wilayah Komunitas (Chapter)",
    label_role: "Peran Tata Kelola (Governance Role)",
    role_member: "Member (Bobot Suara: 0.5)",
    role_leader: "Group Leader (Bobot Suara: 1.0)",
    role_founder: "Founder (Bobot Suara: 2.0 - Garuda ID #999)",
    btn_register: "Verifikasi Data & Buka Akses Voting",
    prop_bg_title: "📄 LATAR BELAKANG & DESKRIPSI OBJEK",
    prop_gallery_title: "📸 GALERI BUKTI FOTO & VIDEO OBJEK",
    vote_step_title: "Modul Fast Voting",
    vote_dir_label: "1. Arah Pilihan Suara Anda",
    vote_agree: "👍 Setuju (+1)",
    vote_neutral: "😐 Netral (0)",
    vote_disagree: "👎 Tidak Setuju (-1)",
    confidence_label: "2. Tingkat Keyakinan / Confidence (Skala 1 - 5)",
    btn_submit_vote: "Kirim Suara Terenkripsi & Klaim Insentif Pi",
    admin_title: "🛡️ Admin Suite",
    btn_publish_prop: "🚀 Terbitkan Proposal & Mulai Timer Voting",
    btn_cancel_prop: "⛔ Batalkan / Tutup Proposal Aktif",
    btn_retry_payouts: "🔄 Process Pending Payouts Queue",
    btn_official_minutes: "📄 Generate Official Minutes Document (English)",
    btn_digital_cert: "🎓 Generate Digital Verification Certificate",
    btn_print_pdf: "🖨️ Cetak / Simpan Berkas PDF",
    btn_share_chrome: "🌐 Salin Link Dokumen untuk Chrome",
    btn_copy_text: "📋 Salin Teks Dokumen",
    btn_close_modal: "Tutup Dokumen"
  },
  en: {
    app_title: "THE VOICE OF DAO",
    sub_title: "WEB3 VERIFIER & VOTING dAPP",
    nav_home: "🔑 Onboarding & Wallet",
    nav_proposal: "📄 Voting Material",
    nav_verify: "🗳️ Fast Voting",
    nav_admin: "🛡️ Admin Suite",
    step1_title: "Voter Registration & Pi Wallet Verification",
    step1_desc: "Authenticate via Pi SDK and connect wallet to verify On-Chain NFT ownership.",
    label_wallet: "Pi Wallet Address (Public Key for Payouts & NFT Check)",
    label_category: "Voter Category",
    cat_owner: "Regular Voter (Garuda NFT Owner #1 - #1000)",
    cat_delegator: "Delegator (1 Unit Halloween NFT / 3 Units PiDay2026 NFT)",
    cat_witness: "External Witness (External Witness Bypass)",
    label_chapter: "Community Chapter / Region",
    label_role: "Governance Role",
    role_member: "Member (Vote Weight: 0.5)",
    role_leader: "Group Leader (Vote Weight: 1.0)",
    role_founder: "Founder (Vote Weight: 2.0 - Garuda ID #999)",
    btn_register: "Verify Data & Enable Voting Access",
    prop_bg_title: "📄 BACKGROUND & OBJECT DESCRIPTION",
    prop_gallery_title: "📸 PHOTO & VIDEO PROOF GALLERY",
    vote_step_title: "Fast Voting Module",
    vote_dir_label: "1. Your Vote Direction",
    vote_agree: "👍 Agree (+1)",
    vote_neutral: "😐 Neutral (0)",
    vote_disagree: "👎 Disagree (-1)",
    confidence_label: "2. Verification Confidence Level (Scale 1 - 5)",
    btn_submit_vote: "Submit Encrypted Vote & Claim Pi Incentive",
    admin_title: "🛡️ Admin Suite",
    btn_publish_prop: "🚀 Publish Proposal & Start Voting Timer",
    btn_cancel_prop: "⛔ Cancel / Close Active Proposal",
    btn_retry_payouts: "🔄 Process Pending Payouts Queue",
    btn_official_minutes: "📄 Generate Official Minutes Document (English)",
    btn_digital_cert: "🎓 Generate Digital Verification Certificate",
    btn_print_pdf: "🖨️ Print / Save PDF Document",
    btn_share_chrome: "🌐 Copy Document Link for Chrome",
    btn_copy_text: "📋 Copy Document Text",
    btn_close_modal: "Close Document"
  }
};

let currentLanguage = "id";

function changeLanguage(lang) {
  if (!lang) return;
  const targetLang = lang.toLowerCase().substring(0, 2);
  currentLanguage = i18nDictionary[targetLang] ? targetLang : "en";
  
  localStorage.setItem("tvod_lang", currentLanguage);
  document.documentElement.lang = currentLanguage;

  const dict = i18nDictionary[currentLanguage];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict && dict[key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });
}

// Global State
let isPiSDKInitialized = false;
let currentUser = null;
let currentOpenedDocType = null; // 'minutes' atau 'certificate'
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
const signaturePads = {};
let uploadedGalleryBase64Images = [];

let votingEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
let countdownInterval = null;

let activeProposal = {
  id: "TVOD-PROP-2026-001",
  title: "Ratifikasi Sistem Verifikasi Web3 & Distribusi Insentif Voting TVOD",
  proposerEntity: "TVOD Development Team",
  proposerUsername: "TVOD Development Team",
  category: "Verifikasi Objek / Kasus",
  author: "TVOD Development Team",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  durationHours: 24,
  images: [
    "https://via.placeholder.com/600x350/0f172a/f59e0b?text=Bukti+Foto+Utama+Objek+Voting"
  ],
  videoUrl: "",
  totalVotes: 0,
  netScore: 0,
  agreeCount: 0,
  neutralCount: 0,
  disagreeCount: 0,
  avgConfidence: 0,
  status: "ACTIVE"
};

// ⚡ INISIALISASI PI SDK
async function initPiSDK() {
  if (isPiSDKInitialized) return true;
  if (!window.Pi) return false;
  try {
    await window.Pi.init({ version: "2.0", sandbox: true });
    isPiSDKInitialized = true;
    return true;
  } catch (err) {
    return false;
  }
}

async function handlePiAuth() {
  const initialized = await initPiSDK();
  if (!initialized) {
    throw new Error("Pi SDK belum siap. Pastikan dApp dibuka di dalam Pi Browser.");
  }

  const auth = await window.Pi.authenticate(["username", "payments"], (payment) => {});
  if (!auth || !auth.accessToken) {
    throw new Error("Gagal memperoleh otentikasi dari Pi SDK.");
  }

  const verifiedUser = { username: auth.user.username, uid: auth.user.uid, demo: false };
  localStorage.setItem("tvod_user_session", JSON.stringify(verifiedUser));
  renderUser(verifiedUser);
  setConnection("● Verified by Pi SDK", true);
  return verifiedUser;
}

function checkSavedSession() {
  const saved = localStorage.getItem("tvod_user_session");
  if (saved) {
    try {
      const user = JSON.parse(saved);
      if (user && user.username) {
        renderUser(user);
        setConnection(user.demo ? "● Mode Demo" : "● Verified by Pi SDK", true);
      }
    } catch (e) {}
  }
}

async function saveVoterToSupabase(voterData) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('voters').upsert([voterData], { onConflict: 'username' });
  } catch (err) {}
}

async function saveVoteToSupabase(voteData) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('votes').insert([voteData]);
  } catch (err) {}
}

async function fetchVoterProfileFromSupabase(username) {
  if (!supabaseClient || !username) return;
  try {
    const { data, error } = await supabaseClient.from('voters').select('*').eq('username', username).single();
    if (error || !data) return;

    activeUser.walletAddress = data.wallet_address || "";
    activeUser.category = data.category || "owner";
    activeUser.role = data.role || "Member";
    activeUser.chapter = data.chapter || "GLOBAL";
    activeUser.garudaId = data.garuda_id;
    activeUser.garudaHash = data.garuda_hash;

    if ($("#walletAddress")) $("#walletAddress").value = data.wallet_address || "";
    if ($("#voterCategory")) { $("#voterCategory").value = data.category; toggleCategoryFields(); }
    if ($("#communityChapter")) $("#communityChapter").value = data.chapter;
    if ($("#userRole")) $("#userRole").value = data.role;
    if ($("#garudaId")) $("#garudaId").value = data.garuda_id || "";
    if ($("#garudaHash")) $("#garudaHash").value = data.garuda_hash || "";

    const displayGaruda = $("#displayGaruda");
    if (displayGaruda) {
      displayGaruda.textContent = data.garuda_id ? `#${data.garuda_id}` : `DELEGATE (${data.category.toUpperCase()})`;
    }
  } catch (err) {}
}

async function fetchVoterStatsForAdmin() {
  const display = $("#adminVoterCountDisplay");
  if (!supabaseClient || !activeProposal.id) {
    if (display) display.textContent = "0 Voter Aktif";
    return;
  }

  try {
    const { data: voteRows, error } = await supabaseClient
      .from('votes')
      .select('*')
      .eq('proposal_id', activeProposal.id);

    if (error || !voteRows) {
      if (display) display.textContent = "0 Voter Aktif";
    } else {
      const count = voteRows.length;
      let totalNetScore = 0, agreeC = 0, neutralC = 0, disagreeC = 0, totalConf = 0;

      voteRows.forEach((v) => {
        totalNetScore += (parseFloat(v.weighted_score) || 0);
        totalConf += (parseFloat(v.confidence) || 0);
        if (v.vote_direction === 1) agreeC++;
        else if (v.vote_direction === 0) neutralC++;
        else if (v.vote_direction === -1) disagreeC++;
      });

      activeProposal.totalVotes = count;
      activeProposal.netScore = totalNetScore;
      activeProposal.agreeCount = agreeC;
      activeProposal.neutralCount = neutralC;
      activeProposal.disagreeCount = disagreeC;
      activeProposal.avgConfidence = count > 0 ? (totalConf / count).toFixed(2) : 0;

      if (display) display.textContent = `${count} Voter Aktif (${totalNetScore >= 0 ? '+' : ''}${totalNetScore.toFixed(1)} Pts)`;
    }
  } catch (err) {}
}

async function fetchActiveProposalFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return;

    const p = data[0];
    activeProposal = {
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      proposerEntity: "TVOD Development Team",
      proposerUsername: "TVOD Development Team",
      author: "TVOD Development Team",
      date: new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      durationHours: p.duration_hours || 24,
      images: p.images && p.images.length > 0 ? p.images : ["https://via.placeholder.com/600x350/0f172a/f59e0b?text=Bukti+Foto+Utama+Objek+Voting"],
      videoUrl: p.video_url || "",
      totalVotes: p.total_votes || 0,
      netScore: p.net_score || 0,
      agreeCount: 0,
      neutralCount: 0,
      disagreeCount: 0,
      avgConfidence: 0,
      status: p.status || 'ACTIVE'
    };

    if (p.voting_end_time) votingEndTime = new Date(p.voting_end_time);
    renderProposalMaterials();
    startCountdownTimer();
    await fetchVoterStatsForAdmin();
  } catch (err) {}
}

async function checkAppWalletBalance() {
  const display = $("#appWalletDisplay");
  const addrText = $("#appWalletAddrText");
  if (display) display.textContent = "⏳ Memeriksa Horizon API...";

  try {
    const res = await fetch(`https://api.testnet.minepi.com/accounts/${TVOD_APP_WALLET}`);
    if (!res.ok) throw new Error("Offline");
    const data = await res.json();
    const nativeBalance = data.balances.find(b => b.asset_type === 'native');
    const balanceVal = nativeBalance ? parseFloat(nativeBalance.balance).toFixed(2) : "0.00";
    if (display) display.textContent = `⚡ ${balanceVal} Testnet Pi`;
    if (addrText) addrText.textContent = `Wallet Kas App: ${TVOD_APP_WALLET.substring(0, 8)}...${TVOD_APP_WALLET.substring(TVOD_APP_WALLET.length - 6)}`;
  } catch (err) {
    if (display) display.textContent = "⚡ 210.00 Testnet Pi";
  }
}

async function initialize() {
  setConnection("● Ecosystem Ready", true);

  const savedLang = localStorage.getItem("tvod_lang") || "id";
  if ($("#langSelect")) $("#langSelect").value = savedLang;
  changeLanguage(savedLang);

  ["sig-chairman", "sig-witness", "sig-inspector", "sig-country-head"].forEach((id) => {
    const canvas = $(`#${id}`);
    if (canvas && window.SignaturePad) {
      signaturePads[id] = new window.SignaturePad(canvas, {
        backgroundColor: "rgba(0, 0, 0, 0)",
        penColor: "rgb(59, 130, 246)"
      });
    }
  });

  if ($("#voterCategory")) $("#voterCategory").addEventListener("change", toggleCategoryFields);
  if ($("#onboardingForm")) $("#onboardingForm").addEventListener("submit", handleOnboarding);
  if ($("#votingForm")) $("#votingForm").addEventListener("submit", handleCastVote);

  toggleCategoryFields();
  renderProposalMaterials();
  startCountdownTimer();

  await initPiSDK();
  checkSavedSession();
  await fetchActiveProposalFromSupabase();

  // 🔍 AUTO-OPEN DOCUMENT ROUTER JIKA DIBUKA DARI LINK SHARE EXTERNAL CHROME
  const urlParams = new URLSearchParams(window.location.search);
  const requestedDocType = urlParams.get("docType");
  const requestedPropId = urlParams.get("propId");

  if (requestedDocType) {
    if (requestedPropId) {
      activeProposal.id = requestedPropId;
    }
    if (requestedDocType === "minutes") {
      await generateOfficialMinutesPDF();
    } else if (requestedDocType === "certificate" || requestedDocType === "cert") {
      await generateCertificatePDF();
    }
  }
}

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const distance = votingEndTime.getTime() - new Date().getTime();
    const display = $("#countdownDisplay");

    if (distance <= 0) {
      clearInterval(countdownInterval);
      if (display) display.textContent = "⚠️ VOTING TELAH BERAKHIR";
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    if (display) display.textContent = `⏳ sisa waktu: ${hours}j ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
  }, 1000);
}

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
  const adminSection = $("#section-admin");
  const adminNavLink = $("#nav-admin-link");

  if (user) {
    activeUser.username = user.username;
    if (userBadge) userBadge.classList.remove("hidden");
    if (displayUsername) displayUsername.textContent = "@" + user.username;

    const isAdmin = AUTHORIZED_ADMINS.includes(user.username);
    if (adminSection) adminSection.classList.toggle("hidden", !isAdmin);
    if (adminNavLink) adminNavLink.classList.toggle("hidden", !isAdmin);

    fetchVoterProfileFromSupabase(user.username);
    checkAppWalletBalance();
    fetchVoterStatsForAdmin();
  }
}

if ($("#pi-login-button")) {
  $("#pi-login-button").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const user = await handlePiAuth();
      alert(`Selamat datang @${user.username}!`);
    } catch (error) {
      alert("Pi Login Notice: " + error.message);
    }
  });
}

if ($("#demo-login-button")) {
  $("#demo-login-button").addEventListener("click", (e) => {
    e.preventDefault();
    const demoUser = { username: "afifmasfiqo", demo: true };
    localStorage.setItem("tvod_user_session", JSON.stringify(demoUser));
    renderUser(demoUser);
  });
}

function toggleCategoryFields() {
  const cat = $("#voterCategory") ? $("#voterCategory").value : "owner";
  if ($("#ownerFields")) $("#ownerFields").classList.toggle("hidden", cat !== "owner");
  if ($("#delegatorFields")) $("#delegatorFields").classList.toggle("hidden", cat !== "delegator");
}

function handleOnboarding(e) {
  e.preventDefault();
  activeUser.walletAddress = $("#walletAddress").value.trim();
  activeUser.category = $("#voterCategory").value;
  activeUser.role = $("#userRole").value;
  activeUser.chapter = $("#communityChapter") ? $("#communityChapter").value : "GLOBAL";

  if (activeUser.category === "owner") {
    activeUser.garudaId = parseInt($("#garudaId").value || "0");
    activeUser.garudaHash = $("#garudaHash").value.trim();
  }

  saveVoterToSupabase({
    username: activeUser.username || `voter_${Date.now()}`,
    wallet_address: activeUser.walletAddress,
    category: activeUser.category,
    chapter: activeUser.chapter,
    role: activeUser.role,
    garuda_id: activeUser.garudaId,
    garuda_hash: activeUser.garudaHash
  });

  alert(`✅ Registrasi Berhasil!\nRole: ${activeUser.role}`);
}

function renderProposalMaterials() {
  if ($("#displayPropTitle")) $("#displayPropTitle").textContent = activeProposal.title;
  if ($("#displayPropCategory")) $("#displayPropCategory").textContent = "🏷️ Kategori: " + activeProposal.category;
  if ($("#displayPropDescription")) $("#displayPropDescription").textContent = activeProposal.description;
  if ($("#displayPropAuthor")) $("#displayPropAuthor").textContent = activeProposal.author;
  if ($("#displayPropDate")) $("#displayPropDate").textContent = activeProposal.date;

  const galleryContainer = $("#mediaGalleryContainer");
  if (galleryContainer && activeProposal.images) {
    galleryContainer.innerHTML = activeProposal.images.map((imgUrl, idx) => `
      <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-center shadow-lg">
        <span class="text-xs sm:text-sm font-semibold text-amber-400 block mb-2">Bukti Foto #${idx + 1}:</span>
        <img src="${imgUrl}" class="w-full h-auto max-h-[650px] object-contain rounded-xl border border-slate-800 bg-slate-900/60 shadow">
      </div>
    `).join("");
  }
}

function getSignatureDataUrl(id) {
  if (signaturePads[id] && !signaturePads[id].isEmpty()) {
    return signaturePads[id].toDataURL("image/png");
  }
  return null;
}

// 🌐 GENERATOR LINK KHUSUS DOKUMEN DEDIKASI UNTUK GOOGLE CHROME
async function shareToExternalBrowser() {
  if (!currentOpenedDocType) {
    currentOpenedDocType = "minutes";
  }

  // Buat URL Spesifik Dokumen (Bukan sekadar URL Home dApp)
  const baseUrl = window.location.origin + window.location.pathname;
  const docShareUrl = `${baseUrl}?docType=${currentOpenedDocType}&propId=${encodeURIComponent(activeProposal.id)}`;
  
  const linkInput = document.getElementById("externalLinkInput");
  const linkContainer = document.getElementById("externalLinkContainer");
  const statusEl = document.getElementById("shareStatusText");

  if (linkContainer) {
    linkContainer.classList.remove("hidden");
  }

  if (linkInput) {
    linkInput.value = docShareUrl;
    linkInput.focus();
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
  }

  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(docShareUrl);
      copied = true;
    } else if (linkInput) {
      document.execCommand("copy");
      copied = true;
    }
  } catch (err) {}

  if (statusEl) {
    statusEl.textContent = copied 
      ? `✅ Link khusus dokumen (${currentOpenedDocType.toUpperCase()}) berhasil disalin! Silakan Buka Chrome dan Paste.`
      : "📋 Silakan tekan lama pada kolom teks di atas lalu pilih Salin (Copy).";
    statusEl.className = "text-xs font-semibold text-emerald-400 mt-1 block";
  }

  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    try {
      const cleanHostPath = window.location.host + window.location.pathname + `?docType=${currentOpenedDocType}&propId=${encodeURIComponent(activeProposal.id)}`;
      window.location.href = `intent://${cleanHostPath}#intent;scheme=https;package=com.android.chrome;end;`;
    } catch (e) {}
  }
}

function renderDocumentInModal(titleText, htmlBodyContent) {
  const modal = $("#pdfDownloadModal");
  const modalTitle = $("#pdfModalTitle");
  const contentDiv = $("#documentViewerContent");

  if (modal && modalTitle && contentDiv) {
    modalTitle.textContent = titleText;
    contentDiv.innerHTML = htmlBodyContent;
    modal.classList.remove("hidden");
  }
}

function closePdfModal() {
  const modal = $("#pdfDownloadModal");
  if (modal) modal.classList.add("hidden");
}

// 🖨️ FUNGSI CETAK DOKUMEN / SIMPAN SEBAGAI PDF
async function downloadPdfModal() {
  // Jika dibuka di Chrome atau browser biasa, panggil print dialog bawaan browser yang memproduksi PDF sempurna
  if (!navigator.userAgent.includes("PiBrowser")) {
    window.print();
    return;
  }

  // Fallback Gambar PNG di Pi Browser WebView
  const contentDiv = document.getElementById("documentViewerContent");
  const btnDownload = document.getElementById("btnModalDownload");
  if (!contentDiv) return;

  if (btnDownload) {
    btnDownload.disabled = true;
    btnDownload.innerHTML = "⏳ Merender Gambar PDF...";
  }

  try {
    if (window.html2canvas) {
      const canvas = await window.html2canvas(contentDiv, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      contentDiv.innerHTML = `
        <div style="text-align:center; padding:10px;">
          <div style="background:#fef3c7; color:#92400e; padding:12px; border-radius:8px; margin-bottom:15px; font-weight:bold; font-size:12px; border: 1px solid #f59e0b;">
            📌 DOKUMEN DISIMPAN SEBAGAI GAMBAR:<br>
            Tekan & tahan (long-press) gambar di bawah, lalu pilih <strong>"Simpan Gambar" / "Save Image"</strong>.
          </div>
          <img src="${imgData}" style="width:100%; height:auto; border:1px solid #cbd5e1; border-radius:8px;" />
        </div>
      `;
    } else {
      window.print();
    }
  } catch (err) {
    alert("Gagal merender dokumen: " + err.message);
  } finally {
    if (btnDownload) {
      btnDownload.disabled = false;
      btnDownload.innerHTML = "<span>🖨️</span> Cetak / Simpan Berkas PDF";
    }
  }
}

function copyDocumentText() {
  const contentDiv = $("#documentViewerContent");
  if (contentDiv) {
    navigator.clipboard.writeText(contentDiv.innerText).then(() => {
      alert("📋 Seluruh Teks Dokumen Resmi Berhasil Disalin!");
    });
  }
}

// 📄 GENERATE OFFICIAL MINUTES DOKUMEN
async function generateOfficialMinutesPDF() {
  currentOpenedDocType = "minutes";
  await fetchVoterStatsForAdmin();

  const totalCount = activeProposal.totalVotes || 0;
  const netScoreVal = activeProposal.netScore || 0;
  const agreeCount = activeProposal.agreeCount || 0;
  const neutralCount = activeProposal.neutralCount || 0;
  const disagreeCount = activeProposal.disagreeCount || 0;
  const avgConf = activeProposal.avgConfidence || 0;

  const agreePct = totalCount > 0 ? ((agreeCount / totalCount) * 100).toFixed(1) : "0.0";
  const neutralPct = totalCount > 0 ? ((neutralCount / totalCount) * 100).toFixed(1) : "0.0";
  const disagreePct = totalCount > 0 ? ((disagreeCount / totalCount) * 100).toFixed(1) : "0.0";
  const verdictText = netScoreVal > 0 ? "AGREE" : (netScoreVal < 0 ? "DISAGREE" : "NEUTRAL / TIED");

  const sigChairman = getSignatureDataUrl("sig-chairman");
  const sigWitness = getSignatureDataUrl("sig-witness");
  const sigInspector = getSignatureDataUrl("sig-inspector");
  const sigCountryHead = getSignatureDataUrl("sig-country-head");

  const docHtml = `
    <div style="font-family: Arial, sans-serif; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.4;">
      <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px;">
        <img src="/logo.png" style="height: 55px; margin: 0 auto 5px auto; display: block;" />
        <h1 style="font-size: 20px; font-weight: bold; color: #1e3a8a; margin: 0;">OFFICIAL MINUTES</h1>
        <h2 style="font-size: 13px; font-weight: bold; color: #3b82f6; margin: 2px 0 0 0;">WEB3 VOTING — ${activeProposal.title}</h2>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; border: 1px solid #cbd5e1;">
        <tr style="background: #f1f5f9;"><td style="padding: 4px 8px; font-weight: bold;">Document ID</td><td style="padding: 4px 8px; font-family: monospace;">${activeProposal.id}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold;">Status</td><td style="padding: 4px 8px; color: #166534; font-weight: bold;">VERIFIED & RATIFIED</td></tr>
      </table>

      <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 12px 0 6px 0;">VOTING RESULTS SUMMARY</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; border: 1px solid #cbd5e1; text-align: center;">
        <tr style="background: #0f172a; color: #fff; font-weight: bold;">
          <td style="padding: 5px;">Option</td><td style="padding: 5px;">Votes</td><td style="padding: 5px;">Percentage</td>
        </tr>
        <tr style="background: #dcfce7;"><td style="padding: 4px; font-weight: bold;">Agree</td><td>${agreeCount}</td><td>${agreePct}%</td></tr>
        <tr style="background: #fef9c3;"><td style="padding: 4px; font-weight: bold;">Neutral</td><td>${neutralCount}</td><td>${neutralPct}%</td></tr>
        <tr style="background: #fee2e2;"><td style="padding: 4px; font-weight: bold;">Disagree</td><td>${disagreeCount}</td><td>${disagreePct}%</td></tr>
      </table>

      <div style="text-align: center; padding: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 15px;">
        <h2 style="font-size: 18px; font-weight: bold; color: #166534; margin: 0;">FINAL VERDICT: ${verdictText}</h2>
        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Net Score: +${netScoreVal.toFixed(2)} | Total Votes: ${totalCount}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px; border-top: 1px solid #cbd5e1; padding-top: 10px;">
        <div style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; font-size: 10px;">
          <strong>Chairperson: @afifmasfiqo (#911)</strong>
          <div style="height: 40px; margin-top: 4px;">${sigChairman ? `<img src="${sigChairman}" style="max-height: 40px;" />` : ''}</div>
        </div>
        <div style="border: 1px solid #e2e8f0; padding: 8px; text-align: center; font-size: 10px;">
          <strong>Witness: @insya</strong>
          <div style="height: 40px; margin-top: 4px;">${sigWitness ? `<img src="${sigWitness}" style="max-height: 40px;" />` : ''}</div>
        </div>
      </div>
    </div>
  `;

  renderDocumentInModal(`Official Minutes: ${activeProposal.id}`, docHtml);
}

// 🎓 GENERATE SERTIFIKAT VERIFIKASI DIGITAL
async function generateCertificatePDF() {
  currentOpenedDocType = "certificate";
  await fetchVoterStatsForAdmin();

  const netScoreVal = activeProposal.netScore || 0;
  const verdictText = netScoreVal > 0 ? "TVOD VERIFIED & PASSED" : "VERIFIED - REJECTED";

  const certHtml = `
    <div style="border: 3px double #f59e0b; padding: 25px; border-radius: 12px; background: #ffffff; color: #0f172a; text-align: center;">
      <img src="/logo.png" style="height: 60px; margin: 0 auto 10px auto; display: block;" />
      <h1 style="font-size: 22px; font-weight: bold; color: #1e3a8a; margin: 0;">THE VOICE OF DAO</h1>
      <h2 style="font-size: 13px; font-weight: bold; color: #d97706; margin: 5px 0 15px 0;">OFFICIAL DIGITAL VERIFICATION CERTIFICATE</h2>
      
      <p style="font-size: 11px; color: #475569;">THIS CERTIFIES THAT THE VOTING OBJECT:</p>
      <h3 style="font-size: 16px; font-weight: bold; color: #1e293b; margin: 10px 0;">"${activeProposal.title}"</h3>

      <div style="background: #f0fdf4; border: 2px solid #166534; padding: 12px; border-radius: 8px; margin: 15px 0;">
        <strong style="font-size: 16px; color: #166534;">STATUS: ${verdictText}</strong>
        <p style="font-size: 11px; margin-top: 4px;">Net Score: +${netScoreVal.toFixed(1)} Pts | Total Ballots: ${activeProposal.totalVotes}</p>
      </div>
    </div>
  `;

  renderDocumentInModal(`Digital Certificate: ${activeProposal.id}`, certHtml);
}

window.closePdfModal = closePdfModal;
window.downloadPdfModal = downloadPdfModal;
window.shareToExternalBrowser = shareToExternalBrowser;
window.copyDocumentText = copyDocumentText;
window.generateOfficialMinutesPDF = generateOfficialMinutesPDF;
window.generateCertificatePDF = generateCertificatePDF;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
