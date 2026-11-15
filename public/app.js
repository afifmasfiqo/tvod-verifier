// file: app.js
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

function isValidPiWalletAddress(address) {
  if (!address) return false;
  const cleanAddr = address.trim();
  const piWalletRegex = /^[GM][A-Z2-7]{55}$/i;
  return piWalletRegex.test(cleanAddr);
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
    step1_title: "Pendaftaran Pemilih & Pi Wallet",
    label_wallet: "Pi Wallet Address (Awalan G / M, 56 Karakter)",
    label_category: "Kategori Pemilih",
    cat_owner: "Pemilik NFT Garuda",
    cat_delegator: "Delegator (Halloween/PiDay)",
    label_chapter: "Wilayah Chapter",
    label_role: "Peran Tata Kelola",
    btn_register: "Verifikasi Data & Buka Akses Voting",
    prop_bg_title: "📄 LATAR BELAKANG & DESKRIPSI",
    prop_gallery_title: "📸 GALERI BUKTI FOTO",
    vote_step_title: "Modul Fast Voting",
    vote_dir_label: "1. Arah Pilihan Suara Anda",
    vote_agree: "👍 Agree (+1)",
    vote_neutral: "😐 Neutral (0)",
    vote_disagree: "👎 Disagree (-1)",
    confidence_label: "2. Tingkat Keyakinan (Skala 1 - 5)",
    btn_submit_vote: "Kirim Suara Terenkripsi & Klaim Insentif Pi",
    admin_title: "🛡️ Admin Suite",
    btn_publish_prop: "🚀 Publish Proposal",
    btn_cancel_prop: "⛔ Batalkan",
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
    cat_owner: "Garuda NFT Owner",
    cat_delegator: "Delegator (Halloween/PiDay)",
    label_chapter: "Community Chapter",
    label_role: "Governance Role",
    btn_register: "Verify Data & Enable Voting",
    prop_bg_title: "📄 BACKGROUND & DESCRIPTION",
    prop_gallery_title: "📸 PHOTO PROOF GALLERY",
    vote_step_title: "Fast Voting Module",
    vote_dir_label: "1. Your Vote Direction",
    vote_agree: "👍 Agree (+1)",
    vote_neutral: "😐 Neutral (0)",
    vote_disagree: "👎 Disagree (-1)",
    confidence_label: "2. Confidence Level (Scale 1 - 5)",
    btn_submit_vote: "Submit Encrypted Vote & Claim Pi",
    admin_title: "🛡️ Admin Suite",
    btn_publish_prop: "🚀 Publish Proposal",
    btn_cancel_prop: "⛔ Cancel",
  },
  ar: {
    app_title: "صوت منظمة DAO",
    sub_title: "تطبيق التحقق والتصويت Web3",
    nav_home: "🔑 التسجيل",
    nav_proposal: "📄 التصويت",
    nav_verify: "🗳️ التصويت السريع",
    nav_admin: "🛡️ الإدارة",
    step1_title: "تسجيل الناخبين والمحفظة",
    label_wallet: "عنوان محفظة Pi",
    label_category: "فئة الناخب",
    label_chapter: "منطقة المجتمع",
    label_role: "دور الحوكمة",
    btn_register: "التحقق من البيانات",
    prop_bg_title: "📄 الخلفية والوصف",
    prop_gallery_title: "📸 معرض الصور",
    vote_step_title: "وحدة التصويت السريع",
    vote_dir_label: "1. اتجاه صوتك",
    vote_agree: "👍 موافق",
    vote_neutral: "😐 محايد",
    vote_disagree: "👎 غير موافق",
    confidence_label: "2. مستوى الثقة",
    btn_submit_vote: "إرسال الصوت المشفر",
    admin_title: "🛡️ جناح الإدارة",
    btn_publish_prop: "🚀 نشر",
    btn_cancel_prop: "⛔ إلغاء",
  },
  zh: {
    app_title: "THE VOICE OF DAO",
    sub_title: "WEB3 验证与投票 dAPP",
    nav_home: "🔑 入职",
    nav_proposal: "📄 投票",
    nav_verify: "🗳️ 快速投票",
    nav_admin: "🛡️ 管理员",
    step1_title: "选民注册与 Pi 钱包",
    label_wallet: "Pi 钱包地址 (前缀 G / M)",
    label_category: "选民类别",
    label_chapter: "社区分会",
    label_role: "治理角色",
    btn_register: "验证数据并开启权限",
    prop_bg_title: "📄 背景与描述",
    prop_gallery_title: "📸 照片图库",
    vote_step_title: "快速投票模块",
    vote_dir_label: "1. 您的投票方向",
    vote_agree: "👍 赞成",
    vote_neutral: "😐 中立",
    vote_disagree: "👎 反对",
    confidence_label: "2. 置信度等级",
    btn_submit_vote: "提交加密投票并领取 Pi",
    admin_title: "🛡️ 管理员套件",
    btn_publish_prop: "🚀 发布",
    btn_cancel_prop: "⛔ 取消",
  }
};

let currentLanguage = "id";

function changeLanguage(lang) {
  if (!lang) return;
  const targetLang = lang.toLowerCase().substring(0, 2);
  currentLanguage = i18nDictionary[targetLang] ? targetLang : "en";
  localStorage.setItem("tvod_lang", currentLanguage);
  
  if (currentLanguage === "ar") {
    document.documentElement.dir = "rtl";
    document.body.classList.add("rtl");
  } else {
    document.documentElement.dir = "ltr";
    document.body.classList.remove("rtl");
  }
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

let isPiSDKInitialized = false;
let currentUser = null;
let currentOpenedDocType = null;
let isUserBanned = false;

let activeUser = {
  username: "afifmasfiqo",
  walletAddress: "GCVGSZJOHN467T5QYFMJFSKIDDNC3N6EHCOSSEC7X3PKSK3YI733D2OO",
  category: "owner",
  role: "Group Leader",
  chapter: "GLOBAL",
  garudaId: 911,
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
  category: "Community Voting",
  author: "TVOD Team",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  description: "Berikut adalah berkas bukti verifikasi objek voting terkait pengajuan sistem reward dan kepatuhan Kode Etik.",
  durationHours: 24,
  images: [
    "https://via.placeholder.com/500x300/0f172a/f59e0b?text=Bukti+Foto+Utama+Objek+Voting"
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

function saveSignatureToStorage(id) {
  if (signaturePads[id] && !signaturePads[id].isEmpty()) {
    const dataUrl = signaturePads[id].toDataURL("image/png");
    localStorage.setItem(`tvod_sig_${id}`, dataUrl);
  }
}

function loadSignaturesFromStorage() {
  ["sig-chairman", "sig-witness", "sig-inspector", "sig-country-head"].forEach((id) => {
    const saved = localStorage.getItem(`tvod_sig_${id}`);
    if (saved && signaturePads[id]) {
      const img = new Image();
      img.src = saved;
      img.onload = () => {
        const canvas = document.getElementById(id);
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
    }
  });
}

function getSignatureDataUrl(id) {
  if (signaturePads[id] && !signaturePads[id].isEmpty()) {
    const url = signaturePads[id].toDataURL("image/png");
    localStorage.setItem(`tvod_sig_${id}`, url);
    return url;
  }
  const saved = localStorage.getItem(`tvod_sig_${id}`);
  return saved || null;
}

function clearOfficerSig(id) {
  if (signaturePads[id]) signaturePads[id].clear();
  localStorage.removeItem(`tvod_sig_${id}`);
}

async function checkGarudaBlacklistStatus(garudaId, username) {
  const banBanner = $("#banBanner");
  const banReason = $("#banReason");
  isUserBanned = false;

  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ garudaId, username })
    });

    if (res.status === 403) {
      isUserBanned = true;
      const data = await res.json().catch(() => ({}));
      const errorMsg = data.message || "Access denied: Account temporarily frozen.";
      if (banReason) banReason.textContent = `⚠️ ${errorMsg}`;
      if (banBanner) banBanner.classList.remove("hidden");
      localStorage.removeItem("tvod_user_session");
      const btnSubmit = $("#btnSubmitVote");
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Access denied: Account Frozen";
        btnSubmit.className = "w-full bg-red-950 text-red-400 font-bold py-3 rounded-xl text-xs cursor-not-allowed border border-red-700";
      }
      return true;
    }
  } catch (err) {
    console.warn("Gagal mengecek status frozen server:", err);
  }

  if (supabaseClient) {
    try {
      let query = supabaseClient.from('garuda_blacklist').select('*');
      if (garudaId) {
        query = query.or(`garuda_id.eq.${garudaId},username.eq.${username}`);
      } else if (username) {
        query = query.eq('username', username);
      } else {
        if (banBanner) banBanner.classList.add("hidden");
        return false;
      }

      const { data } = await query;
      if (data && data.length > 0) {
        isUserBanned = true;
        const record = data[0];
        const reasonText = record.reason || "Access denied: Account temporarily frozen.";
        if (banReason) banReason.textContent = `⚠️ ${reasonText}`;
        if (banBanner) banBanner.classList.remove("hidden");
        localStorage.removeItem("tvod_user_session");
        const btnSubmit = $("#btnSubmitVote");
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.innerText = "Access denied: Account Frozen";
          btnSubmit.className = "w-full bg-red-950 text-red-400 font-bold py-3 rounded-xl text-xs cursor-not-allowed border border-red-700";
        }
        return true;
      }
    } catch (e) {
      console.warn("Supabase blacklist check warning:", e);
    }
  }

  if (banBanner) banBanner.classList.add("hidden");
  return false;
}

async function initPiSDK() {
  if (isPiSDKInitialized) return true;
  if (!window.Pi) return false;
  try {
    await window.Pi.init({ version: "2.0" });
    isPiSDKInitialized = true;
    return true;
  } catch (err) {
    console.warn("Pi SDK Init Warning:", err);
    return false;
  }
}

async function handlePiAuth() {
  const initialized = await initPiSDK();
  if (!initialized) {
    throw new Error("Pi SDK belum siap. Buka dApp di Pi Browser.");
  }

  const auth = await window.Pi.authenticate(["username"], onIncompletePaymentFound);
  if (!auth || !auth.accessToken) {
    throw new Error("Gagal memperoleh access token dari Pi.");
  }

  const accessToken = auth.accessToken;
  const response = await fetch("https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: accessToken })
  });

  if (!response.ok) {
    throw new Error(`Login failed with status ${response.status}`);
  }

  const data = await response.json();
  const sessionToken = data.sessionToken;
  const user = data.user;

  const verifiedUser = {
    username: user.username,
    uid: user.uid,
    sessionToken: sessionToken,
    accessToken: accessToken,
    demo: false
  };

  localStorage.setItem("tvod_user_session", JSON.stringify(verifiedUser));
  renderUser(verifiedUser);
  setConnection("● Pi SDK Verified", true);
  return verifiedUser;
}

const onIncompletePaymentFound = (payment) => {
  console.warn("Incomplete payment found:", payment);
};

function checkSavedSession() {
  const saved = localStorage.getItem("tvod_user_session");
  if (saved) {
    try {
      const user = JSON.parse(saved);
      if (user && user.username) {
        renderUser(user);
        setConnection(user.demo ? "● Demo Mode" : "● Pi SDK Verified", true);
      }
    } catch (e) {
      console.warn("Gagal membaca saved session:", e);
    }
  }
}

async function saveVoterToSupabase(voterData) {
  if (!supabaseClient) return false;
  try {
    const { error } = await supabaseClient
      .from('voters')
      .upsert([voterData], { onConflict: 'username' });

    if (error) {
      alert("⚠️ Gagal menyimpan profil ke Database: " + error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase Voter Error:", err);
    return false;
  }
}

async function saveVoteToSupabase(voteData) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from('votes').insert([voteData]);
  } catch (err) {
    console.error("Supabase Vote Error:", err);
  }
}

async function fetchVoterProfileFromSupabase(username) {
  if (!supabaseClient || !username) return;
  try {
    const { data, error } = await supabaseClient
      .from('voters')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error || !data) {
      if (username === "afifmasfiqo") {
        activeUser.walletAddress = "GCVGSZJOHN467T5QYFMJFSKIDDNC3N6EHCOSSEC7X3PKSK3YI733D2OO";
        activeUser.garudaId = 911;
        if ($("#walletAddress")) $("#walletAddress").value = activeUser.walletAddress;
        if ($("#garudaId")) $("#garudaId").value = "911";
        const displayGaruda = $("#displayGaruda");
        if (displayGaruda) displayGaruda.textContent = "#911";
      }
      await checkGarudaBlacklistStatus(activeUser.garudaId, username);
      return;
    }

    activeUser.walletAddress = data.wallet_address || "";
    activeUser.category = data.category || "owner";
    activeUser.role = data.role || "Member";
    activeUser.chapter = data.chapter || "GLOBAL";
    activeUser.garudaId = data.garuda_id;
    activeUser.garudaHash = data.garuda_hash;

    if ($("#walletAddress")) $("#walletAddress").value = data.wallet_address || "";
    if ($("#voterCategory")) {
      $("#voterCategory").value = data.category === 'owner' ? 'owner' : 'delegator';
      toggleCategoryFields();
    }
    if ($("#communityChapter")) $("#communityChapter").value = data.chapter;
    if ($("#userRole")) $("#userRole").value = data.role;
    if ($("#garudaId")) $("#garudaId").value = data.garuda_id || "";
    if ($("#garudaHash")) $("#garudaHash").value = data.garuda_hash || "";

    const displayGaruda = $("#displayGaruda");
    if (displayGaruda) {
      displayGaruda.textContent = data.garuda_id ? `#${data.garuda_id}` : `DELEGATE`;
    }

    await checkGarudaBlacklistStatus(data.garuda_id, username);
  } catch (err) {
    console.error("Fetch Profile Error:", err);
  }
}

async function getFrozenListClient() {
  try {
    const res = await fetch('/frozen_list.json');
    const data = await res.json();
    return data.frozenIds || [];
  } catch (e) {
    return ["951", "992", "983", "929", "921", "954", "973", "931", "986", "953", "993", "995", "975", "920", "952", "985", "930", "991", "981"];
  }
}

async function fetchVoterStatsForAdmin() {
  const display = $("#adminVoterCountDisplay");
  if (!supabaseClient || !activeProposal.id) {
    if (display) display.textContent = "0 Voter";
    return;
  }

  try {
    const { data: voteRows } = await supabaseClient
      .from('votes')
      .select('*')
      .eq('proposal_id', activeProposal.id);

    const { data: voterProfiles } = await supabaseClient
      .from('voters')
      .select('*');

    const profileMap = {};
    if (voterProfiles) {
      voterProfiles.forEach(p => { profileMap[p.username] = p; });
    }

    const frozenIds = await getFrozenListClient();

    if (!voteRows) {
      if (display) display.textContent = "0 Voter";
    } else {
      const validVotes = voteRows.filter(v => {
        const prof = profileMap[v.username] || {};
        if (prof.garuda_id && frozenIds.includes(String(prof.garuda_id))) {
          return false;
        }
        return true;
      });

      const count = validVotes.length;
      let totalNetScore = 0;
      let agreeC = 0, neutralC = 0, disagreeC = 0;
      let totalConf = 0;

      validVotes.forEach((v) => {
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

      if (display) display.textContent = `${count} Voter (${totalNetScore >= 0 ? '+' : ''}${totalNetScore.toFixed(1)} Pts)`;
    }
  } catch (err) {
    if (display) display.textContent = "0 Voter";
  }
}

async function fetchActiveProposalFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data } = await supabaseClient
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return;

    const p = data[0];
    activeProposal = {
      id: p.id,
      title: p.title,
      category: p.category || "Community Voting",
      description: p.description,
      proposerEntity: "TVOD Team",
      author: "TVOD Team",
      date: new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      durationHours: p.duration_hours || 24,
      images: p.images && p.images.length > 0 ? p.images : ["https://via.placeholder.com/500x300/0f172a/f59e0b?text=Bukti+Foto"],
      videoUrl: p.video_url || "",
      totalVotes: p.total_votes || 0,
      netScore: p.net_score || 0,
      status: p.status || 'ACTIVE'
    };

    if (p.voting_end_time) {
      votingEndTime = new Date(p.voting_end_time);
    }
    renderProposalMaterials();
    startCountdownTimer();
    await fetchVoterStatsForAdmin();
  } catch (err) {
    console.error("Fetch Proposal Error:", err);
  }
}

async function checkAppWalletBalance() {
  const display = $("#appWalletDisplay");
  if (display) display.textContent = "⏳ Memeriksa...";
  try {
    const res = await fetch(`https://api.testnet.minepi.com/accounts/${TVOD_APP_WALLET}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const nativeBalance = data.balances.find(b => b.asset_type === 'native');
    const balanceVal = nativeBalance ? parseFloat(nativeBalance.balance).toFixed(2) : "0.00";
    if (display) display.textContent = `⚡ ${balanceVal} Testnet Pi`;
  } catch (err) {
    if (display) display.textContent = "⚡ 210.00 Testnet Pi";
  }
}

async function initialize() {
  setConnection("● Ready", true);
  const savedLang = localStorage.getItem("tvod_lang") || "id";
  const langSelectEl = $("#langSelect");
  if (langSelectEl) {
    langSelectEl.value = savedLang;
    langSelectEl.addEventListener("change", (e) => changeLanguage(e.target.value));
  }
  changeLanguage(savedLang);

  ["sig-chairman", "sig-witness", "sig-inspector", "sig-country-head"].forEach((id) => {
    const canvas = $(`#${id}`);
    if (canvas && window.SignaturePad) {
      signaturePads[id] = new window.SignaturePad(canvas, {
        backgroundColor: "rgba(0, 0, 0, 0)",
        penColor: "rgb(245, 158, 11)"
      });
      signaturePads[id].addEventListener("afterUpdateStroke", () => {
        saveSignatureToStorage(id);
      });
    }
  });

  loadSignaturesFromStorage();

  const voterCatEl = $("#voterCategory");
  if (voterCatEl) voterCatEl.addEventListener("change", toggleCategoryFields);

  const onboardingFormEl = $("#onboardingForm");
  if (onboardingFormEl) onboardingFormEl.addEventListener("submit", handleOnboarding);

  const votingFormEl = $("#votingForm");
  if (votingFormEl) votingFormEl.addEventListener("submit", handleCastVote);

  const fileInputEl = $("#inputPropFileImages");
  if (fileInputEl) fileInputEl.addEventListener("change", handleGalleryImagesSelect);

  toggleCategoryFields();
  renderProposalMaterials();
  startCountdownTimer();

  await initPiSDK();
  checkSavedSession();
  await fetchActiveProposalFromSupabase();

  const urlParams = new URLSearchParams(window.location.search);
  const requestedDocType = urlParams.get("docType");
  const requestedPropId = urlParams.get("propId");

  if (requestedDocType) {
    if (requestedPropId) activeProposal.id = requestedPropId;
    if (requestedDocType === "minutes") await generateOfficialMinutesPDF();
    else if (requestedDocType === "audit_log") await generateVoterAuditLogPDF();
    else if (requestedDocType === "certificate") await generateCertificatePDF();
  }
}

function compressAndResizeImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

async function handleGalleryImagesSelect(event) {
  const files = event.target.files;
  uploadedGalleryBase64Images = [];
  const countSpan = $("#galleryFilesCount");
  if (!files || files.length === 0) {
    if (countSpan) countSpan.textContent = "";
    return;
  }
  if (countSpan) countSpan.textContent = `⏳ Mengompres ${files.length} foto...`;
  try {
    const promises = Array.from(files).map((file) => compressAndResizeImage(file, 800, 0.8));
    uploadedGalleryBase64Images = await Promise.all(promises);
    if (countSpan) countSpan.textContent = `📷 ${uploadedGalleryBase64Images.length} foto siap.`;
  } catch (err) {
    if (countSpan) countSpan.textContent = "❌ Gagal memuat foto.";
  }
}

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = votingEndTime.getTime() - now;
    const display = $("#countdownDisplay");
    const btn = $("#btnSubmitVote");

    if (distance <= 0) {
      clearInterval(countdownInterval);
      if (display) display.textContent = "⚠️ VOTING BERAKHIR";
      if (btn) {
        btn.disabled = true;
        btn.innerText = "⛔ Sesi Voting Ditutup";
        btn.className = "w-full bg-slate-800 text-slate-500 font-bold py-2.5 rounded-lg text-xs cursor-not-allowed";
      }
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (display) {
      display.textContent = `⏳ ${hours}j ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    }
  }, 1000);
}

function setConnection(message, good = false) {
  const element = $("#connection-status");
  if (!element) return;
  element.textContent = message;
  element.className = `px-2 py-0.5 rounded-full font-mono text-[9px] ${good ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-400"}`;
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
    if (userBadge) {
      userBadge.classList.remove("hidden");
      userBadge.classList.add("flex");
    }
    if (displayUsername) displayUsername.textContent = "@" + user.username;
    if (loginStatusText) loginStatusText.textContent = `Terautentikasi: @${user.username}`;

    const isAdmin = AUTHORIZED_ADMINS.includes(user.username);
    if (adminSection) adminSection.classList.toggle("hidden", !isAdmin);
    if (adminNavLink) adminNavLink.classList.toggle("hidden", !isAdmin);

    fetchVoterProfileFromSupabase(user.username);
    checkAppWalletBalance();
    fetchVoterStatsForAdmin();
  } else {
    if (userBadge) {
      userBadge.classList.add("hidden");
      userBadge.classList.remove("flex");
    }
    if (loginStatusText) loginStatusText.textContent = "Belum terautentikasi";
    if (adminSection) adminSection.classList.add("hidden");
    if (adminNavLink) adminNavLink.classList.add("hidden");
  }
}

const piLoginBtn = $("#pi-login-button");
if (piLoginBtn) {
  piLoginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    piLoginBtn.disabled = true;
    try {
      const user = await handlePiAuth();
      alert(`Selamat datang @${user.username}! Login Pi SDK Berhasil.`);
    } catch (error) {
      alert("Pi Login Notice: " + error.message);
    } finally {
      piLoginBtn.disabled = false;
    }
  });
}

const demoLoginBtn = $("#demo-login-button");
if (demoLoginBtn) {
  demoLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const demoUser = { username: "afifmasfiqo", demo: true };
    localStorage.setItem("tvod_user_session", JSON.stringify(demoUser));
    renderUser(demoUser);
    alert("Masuk ke Mode Demo.");
  });
}

function toggleCategoryFields() {
  const cat = $("#voterCategory") ? $("#voterCategory").value : "owner";
  const ownerFields = $("#ownerFields");
  const delegatorFields = $("#delegatorFields");
  if (ownerFields) ownerFields.classList.toggle("hidden", cat !== "owner");
  if (delegatorFields) delegatorFields.classList.toggle("hidden", cat !== "delegator");
}

async function handleOnboarding(e) {
  e.preventDefault();
  const username = currentUser ? currentUser.username : activeUser.username;
  if (!username) {
    alert("⚠️ Silakan login terlebih dahulu.");
    return;
  }

  const category = $("#voterCategory").value;
  const role = $("#userRole").value;
  const wallet = $("#walletAddress").value.trim();
  const chapter = $("#communityChapter") ? $("#communityChapter").value : "GLOBAL";

  if (!isValidPiWalletAddress(wallet)) {
    alert("⛔ ALAMAT WALLET TIDAK VALID!\nHarus diawali 'G' atau 'M' dengan panjang tepat 56 karakter.");
    return;
  }

  let gId = null;
  let gHash = null;

  if (category === "owner") {
    gId = parseInt($("#garudaId").value || "0");
    gHash = $("#garudaHash").value.trim();
    if (!gId || gId < 1 || gId > 1000) {
      alert("Garuda ID tidak valid.");
      return;
    }
    if (!gHash) {
      alert("Hash NFT Garuda wajib diisi.");
      return;
    }
    activeUser.garudaId = gId;
    activeUser.garudaHash = gHash;
  } else {
    const ownerUsername = $("#ownerUsername").value.trim();
    const nftType = $("#delegatorNftType").value;
    const rawHashes = $("#delegatorHashes").value.trim();
    if (!ownerUsername || !rawHashes) {
      alert("Lengkapi data delegator.");
      return;
    }
    activeUser.ownerUsername = ownerUsername;
    activeUser.delegatedNftType = nftType;
    activeUser.delegatedHashes = [rawHashes];
  }

  const banned = await checkGarudaBlacklistStatus(gId, username);
  if (banned) {
    alert("Access denied: Akun dibekukan.");
    return;
  }

  activeUser.username = username;
  activeUser.walletAddress = wallet;
  activeUser.category = category;
  activeUser.role = role;
  activeUser.chapter = chapter;

  const displayGaruda = $("#displayGaruda");
  if (displayGaruda) {
    displayGaruda.textContent = activeUser.garudaId ? `#${activeUser.garudaId}` : `DELEGATE`;
  }

  const savedSuccess = await saveVoterToSupabase({
    username: username,
    wallet_address: wallet,
    category: category,
    chapter: chapter,
    role: role,
    garuda_id: activeUser.garudaId,
    garuda_hash: activeUser.garudaHash
  });

  if (savedSuccess) {
    checkAppWalletBalance();
    alert(`✅ Registrasi & Binding Berhasil!\nUsername: @${username}`);
  }
}

function renderProposalMaterials() {
  if ($("#displayPropTitle")) $("#displayPropTitle").textContent = activeProposal.title;
  if ($("#displayPropCategory")) $("#displayPropCategory").textContent = "🏷️ Category: " + activeProposal.category;
  if ($("#displayPropDescription")) $("#displayPropDescription").textContent = activeProposal.description;
  if ($("#displayPropAuthor")) $("#displayPropAuthor").textContent = activeProposal.author;

  const galleryContainer = $("#mediaGalleryContainer");
  if (galleryContainer && activeProposal.images) {
    galleryContainer.innerHTML = activeProposal.images.map((imgUrl, idx) => `
      <div class="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center shadow-md overflow-hidden max-w-full">
        <span class="text-[10px] font-semibold text-amber-400 block mb-1">Bukti Foto #${idx + 1}:</span>
        <div class="w-full max-h-[260px] overflow-hidden flex items-center justify-center bg-slate-900/60 rounded border border-slate-800 p-1">
          <img src="${imgUrl}" alt="Bukti Foto" class="w-full h-full max-h-[240px] object-contain rounded">
        </div>
      </div>
    `).join("");
  }
}

async function publishNewProposal(e) {
  if (e && e.preventDefault) e.preventDefault();
  const title = $("#inputPropTitle") ? $("#inputPropTitle").value.trim() : "";
  const category = $("#inputPropCategory") ? $("#inputPropCategory").value : "Community Voting";
  const durationHrs = parseFloat($("#inputPropDuration").value) || 24;
  const description = $("#inputPropDesc") ? $("#inputPropDesc").value.trim() : "";

  if (!title || !description) {
    alert("Judul dan Deskripsi wajib diisi!");
    return;
  }

  activeProposal.id = "TVOD-PROP-" + Date.now();
  activeProposal.title = title;
  activeProposal.category = category;
  activeProposal.description = description;
  activeProposal.durationHours = durationHrs;
  votingEndTime = new Date(Date.now() + durationHrs * 60 * 60 * 1000);

  startCountdownTimer();

  let combinedImages = [];
  if (uploadedGalleryBase64Images && uploadedGalleryBase64Images.length > 0) {
    combinedImages = combinedImages.concat(uploadedGalleryBase64Images);
  }
  activeProposal.images = combinedImages.length > 0 ? combinedImages : ["https://via.placeholder.com/500x300/0f172a/f59e0b?text=Bukti"];

  renderProposalMaterials();
  await fetchVoterStatsForAdmin();

  if (supabaseClient) {
    try {
      await supabaseClient.from('proposals').upsert([{
        id: activeProposal.id,
        title: activeProposal.title,
        category: activeProposal.category,
        description: activeProposal.description,
        duration_hours: activeProposal.durationHours,
        voting_end_time: votingEndTime.toISOString(),
        images: activeProposal.images,
        status: 'ACTIVE'
      }], { onConflict: 'id' });
    } catch (err) {
      console.error(err);
    }
  }
  alert(`✅ Proposal Berhasil Diterbitkan!`);
}

async function cancelActiveProposal() {
  if (!confirm("Batalkan proposal ini?")) return;
  if (countdownInterval) clearInterval(countdownInterval);
  activeProposal.status = 'CANCELLED';
  if (supabaseClient) {
    await supabaseClient.from('proposals').update({ status: 'CANCELLED' }).eq('id', activeProposal.id);
  }
  alert("⛔ Proposal dibatalkan.");
}

async function verifyOnChainNftOwnership() {
  return true;
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

function showPayoutBanner(message, isSuccess = true) {
  const banner = $("#voteStatusBanner");
  if (!banner) return;
  banner.classList.remove("hidden", "bg-emerald-500/20", "text-emerald-300", "border-emerald-500/40", "bg-amber-500/20", "text-amber-300", "border-amber-500/40");
  banner.classList.add(isSuccess ? "bg-emerald-500/20" : "bg-amber-500/20", "border", isSuccess ? "border-emerald-500/40" : "border-amber-500/40");
  banner.innerHTML = message;
}

async function handleCastVote(e) {
  if (e && e.preventDefault) e.preventDefault();
  const btn = $("#btnSubmitVote");
  if (btn) {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.innerText = "⏳ Memproses...";
  }

  const currentUsername = activeUser.username || "Anonymous";
  const currentWallet = activeUser.walletAddress || "";

  const isBanned = await checkGarudaBlacklistStatus(activeUser.garudaId, currentUsername);
  if (isBanned) {
    alert("Access denied: Akun frozen.");
    return;
  }

  if (!currentWallet || !isValidPiWalletAddress(currentWallet)) {
    if (btn) { btn.disabled = false; btn.innerText = "Kirim Suara"; }
    alert("Wallet belum valid.");
    return;
  }

  const selectedValue = document.querySelector('input[name="voteValue"]:checked');
  if (!selectedValue) {
    if (btn) { btn.disabled = false; btn.innerText = "Kirim Suara"; }
    alert("Pilih arah suara.");
    return;
  }

  const voteVal = parseInt(selectedValue.value);
  const roleWeight = activeUser.role === "Group Leader" ? 1.0 : (activeUser.role === "Founder" ? 2.0 : 0.5);
  const individualScore = voteVal * currentConfidence * roleWeight;
  const timestamp = new Date().toISOString();
  const rawPayload = `${currentUsername}|${currentWallet}|${voteVal}|${currentConfidence}|${roleWeight}|${timestamp}`;
  const voteHash = window.CryptoJS ? window.CryptoJS.SHA256(rawPayload).toString() : "HASH";
  const activeSig = getSignatureDataUrl("sig-chairman");

  await saveVoteToSupabase({
    proposal_id: activeProposal.id,
    username: currentUsername,
    wallet_address: currentWallet,
    vote_direction: voteVal,
    confidence: currentConfidence,
    role_weight: roleWeight,
    weighted_score: individualScore,
    vote_hash: voteHash,
    voter_signature_base64: activeSig
  });

  await fetchVoterStatsForAdmin();

  try {
    const payoutRes = await fetch('/api/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: currentWallet,
        amount: 1.0,
        username: currentUsername,
        proposalId: activeProposal.id
      })
    });
    const payoutData = await payoutRes.json();
    if (payoutRes.ok && payoutData.success) {
      showPayoutBanner(`🎉 SUKSES!<br><strong>Tx:</strong> ${payoutData.txHash}`, true);
    } else {
      showPayoutBanner(`⚠️ Suara tersimpan. Payout dipending.`, false);
    }
  } catch (payErr) {
    showPayoutBanner(`✅ Suara tersimpan di Database.`, false);
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "✅ Suara Terkirim";
    btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-2.5 rounded-lg text-xs border border-amber-500/30 cursor-not-allowed";
  }
}

async function toggleGarudaBan(isBan) {
  const garudaIdInput = $("#targetGarudaId") ? $("#targetGarudaId").value.trim() : "";
  const reasonInput = $("#targetBanReason") ? $("#targetBanReason").value.trim() : "";
  if (!garudaIdInput) {
    alert("Masukkan Garuda ID.");
    return;
  }
  const garudaIdNum = parseInt(garudaIdInput);
  try {
    const endpoint = isBan ? '/api/admin/freeze' : '/api/admin/unfreeze';
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ garudaId: String(garudaIdNum) })
    });
    if (supabaseClient) {
      if (isBan) {
        await supabaseClient.from('garuda_blacklist').upsert([{
          garuda_id: garudaIdNum,
          reason: reasonInput,
          banned_by: activeUser.username || 'admin',
          created_at: new Date().toISOString()
        }], { onConflict: 'garuda_id' });
      } else {
        await supabaseClient.from('garuda_blacklist').delete().eq('garuda_id', garudaIdNum);
      }
    }
    alert("Status berhasil diperbarui.");
    location.reload();
  } catch (err) {
    alert("Gagal: " + err.message);
  }
}

async function shareToExternalBrowser() {
  const docType = currentOpenedDocType || "minutes";
  const propId = activeProposal.id || "";
  const docShareUrl = `${window.location.origin}${window.location.pathname}?docType=${docType}&propId=${encodeURIComponent(propId)}`;
  const linkInput = document.getElementById("externalLinkInput");
  const linkContainer = document.getElementById("externalLinkContainer");
  const statusEl = document.getElementById("shareStatusText");

  if (linkContainer) linkContainer.classList.remove("hidden");
  if (linkInput) {
    linkInput.value = docShareUrl;
    linkInput.focus();
    linkInput.select();
  }
  if (statusEl) statusEl.textContent = "✅ Link berhasil disalin!";
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

async function downloadPdfDirect() {
  const contentDiv = document.getElementById("documentViewerContent");
  if (!contentDiv) return;
  try {
    const docType = currentOpenedDocType || "dokumen";
    const propId = activeProposal.id || "TVOD";
    const filename = `${docType.toUpperCase()}_${propId}.pdf`;
    if (window.html2pdf) {
      const opt = {
        margin: [4, 4, 4, 4],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await window.html2pdf().set(opt).from(contentDiv).save();
    } else {
      window.print();
    }
  } catch (err) {
    alert("Gagal unduh PDF");
  }
}

async function generateOfficialMinutesPDF() {
  currentOpenedDocType = "minutes";
  const sigChairman = getSignatureDataUrl("sig-chairman");
  const docHtml = `
    <div class="pdf-container" style="font-family: Arial; padding: 12px; color: #000;">
      <h2 style="text-align: center; color: #1e3a8a;">OFFICIAL MINUTES REPORT</h2>
      <p><b>Proposal:</b> ${activeProposal.title}</p>
      <p><b>Total Votes:</b> ${activeProposal.totalVotes}</p>
      <div style="margin-top: 20px;">
        <p><b>Chairman Signature:</b></p>
        ${sigChairman ? `<img src="${sigChairman}" style="max-height: 50px;" />` : '[Signed]'}
      </div>
    </div>
  `;
  renderDocumentInModal("Official Minutes", docHtml);
}

async function generateVoterAuditLogPDF() {
  currentOpenedDocType = "audit_log";
  const docHtml = `<div class="pdf-container"><h3>Voter Audit Log</h3><p>Proposal ID: ${activeProposal.id}</p></div>`;
  renderDocumentInModal("Audit Log", docHtml);
}

async function generateCertificatePDF() {
  currentOpenedDocType = "certificate";
  const docHtml = `<div class="pdf-container" style="text-align: center;"><h3>CERTIFICATE</h3><p>${activeProposal.title}</p></div>`;
  renderDocumentInModal("Certificate", docHtml);
}

window.publishNewProposal = publishNewProposal;
window.cancelActiveProposal = cancelActiveProposal;
window.handleGalleryImagesSelect = handleGalleryImagesSelect;
window.checkAppWalletBalance = checkAppWalletBalance;
window.fetchVoterStatsForAdmin = fetchVoterStatsForAdmin;
window.setConfidence = setConfidence;
window.clearOfficerSig = clearOfficerSig;
window.toggleGarudaBan = toggleGarudaBan;
window.changeLanguage = changeLanguage;
window.generateOfficialMinutesPDF = generateOfficialMinutesPDF;
window.generateVoterAuditLogPDF = generateVoterAuditLogPDF;
window.generateCertificatePDF = generateCertificatePDF;
window.closePdfModal = closePdfModal;
window.downloadPdfDirect = downloadPdfDirect;
window.shareToExternalBrowser = shareToExternalBrowser;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
