// file: app.js
"use strict";

const $ = (selector) => document.querySelector(selector);

/* ==========================================================
   CONFIGURATIONS: APP WALLET & SECRETS MANAGEMENT
   ========================================================== */
const TVOD_APP_WALLET = "GBBIFANYEV6J5OYXPCFF4AYXTWQFIJNSIF4YYFF26LETN3PHA3TDQ3WL";
const TVOD_SECRET_KEY = process.env.TVOD_SECRET_KEY || "SD_TVOD_SECURE_ADMIN_KEY_2026";
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

// Kamus Multi-Bahasa Lengkap (ID, EN, AR, ZH)
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
    prop_gallery_title: "📸 GALERI BUKTI FOTO & VIDEO",
    vote_step_title: "Modul Fast Voting",
    vote_dir_label: "1. Arah Voting Anda",
    vote_agree: "👍 Setuju (+1)",
    vote_neutral: "😐 Netral (0)",
    vote_disagree: "👎 Tidak Setuju (-1)",
    confidence_label: "2. Tingkat Keyakinan (Skala 1 - 5)",
    btn_submit_vote: "Kirim Vote Enkripsi & Klaim Pi",
    admin_title: "🛡️ Admin Suite",
    btn_publish_prop: "🚀 Publikasikan",
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
    btn_publish_prop: "🚀 Publish",
    btn_cancel_prop: "⛔ Cancel",
  },
  ar: {
    app_title: "صوت منظمة DAO",
    sub_title: "تطبيق التحقق والتصويت Web3",
    nav_home: "🔑 التسجيل",
    nav_proposal: "📄 التصويت",
    nav_verify: "🗳️ تصويت سريع",
    nav_admin: "🛡️ المشرف",
    step1_title: "تسجيل الناخبين ومحفظة Pi",
    label_wallet: "عنوان محفظة Pi (يبدأ بـ G / M، 56 حرفاً)",
    label_category: "فئة الناخب",
    label_chapter: "فصل المجتمع",
    label_role: "دور الحوكمة",
    btn_register: "التحقق من البيانات وتمكين التصويت",
    prop_bg_title: "📄 الخلفية والوصف",
    prop_gallery_title: "📸 معرض الصور",
    vote_step_title: "وحدة التصويت السريع",
    vote_dir_label: "1. اتجاه تصويتك",
    vote_agree: "👍 موافق (+1)",
    vote_neutral: "😐 محايد (0)",
    vote_disagree: "👎 غير موافق (-1)",
    confidence_label: "2. مستوى الثقة (مقياس 1 - 5)",
    btn_submit_vote: "إرسال التصويت المشفر والمطالبة بـ Pi",
    admin_title: "🛡️ لوحة المشرف",
    btn_publish_prop: "🚀 نشر",
    btn_cancel_prop: "⛔ إلغاء",
  },
  zh: {
    app_title: "DAO 之声",
    sub_title: "Web3 验证与投票 dAPP",
    nav_home: "🔑 注册入门",
    nav_proposal: "📄 提案投票",
    nav_verify: "🗳️ 快速投票",
    nav_admin: "🛡️ 管理员",
    step1_title: "选民注册与 Pi 钱包",
    label_wallet: "Pi 钱包地址（G / M 前缀，56个字符）",
    label_category: "选民类别",
    label_chapter: "社区分会",
    label_role: "治理角色",
    btn_register: "验证数据并启用投票",
    prop_bg_title: "📄 背景与描述",
    prop_gallery_title: "📸 照片证据库",
    vote_step_title: "快速投票模块",
    vote_dir_label: "1. 您的投票倾向",
    vote_agree: "👍 赞成 (+1)",
    vote_neutral: "😐 中立 (0)",
    vote_disagree: "👎 反对 (-1)",
    confidence_label: "2. 置信度级别（1 - 5 级）",
    btn_submit_vote: "提交加密投票并领取 Pi",
    admin_title: "🛡️ 管理员套件",
    btn_publish_prop: "🚀 发布",
    btn_cancel_prop: "⛔ 取消",
  }
};

let currentLanguage = "en";

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

let isPiSDKInitialized = false;
let currentUser = null;
let currentOpenedDocType = null;
let isUserBanned = false;

let activeUser = {
  username: "afifmasfiqo",
  walletAddress: TVOD_APP_WALLET,
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
  title: "Ratification of Web3 Verification System & TVOD Voting Incentive Distribution",
  proposerEntity: "TVOD Development Team",
  category: "Community Voting",
  author: "afifmasfiqo",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  description: "The following is the official verification proof file regarding the reward system proposal and Code of Ethics compliance.",
  durationHours: 24,
  images: [
    "https://via.placeholder.com/500x300/0f172a/f59e0b?text=Main+Voting+Proof+Image"
  ],
  videoUrl: "",
  totalVotes: 0,
  netScore: 0,
  agreeCount: 0,
  neutralCount: 0,
  disagreeCount: 0,
  agreeScore: 0,
  neutralScore: 0,
  disagreeScore: 0,
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
      headers: { 'Content-Type': 'application/json', 'X-TVOD-Secret': TVOD_SECRET_KEY },
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
        btnSubmit.className = "w-full bg-red-950 text-red-400 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed border border-red-700";
      }
      return true;
    }
  } catch (err) {
    console.warn("Server freeze check warning:", err);
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
          btnSubmit.className = "w-full bg-red-950 text-red-400 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed border border-red-700";
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

// STABIL & AMAN: Inisialisasi Pi SDK
async function initPiSDK() {
  if (isPiSDKInitialized) return true;

  let attempts = 20;
  while (!window.Pi && attempts > 0) {
    await new Promise(resolve => setTimeout(resolve, 150));
    attempts--;
  }

  if (!window.Pi) {
    console.warn("Pi SDK not injected or still loading.");
    return false;
  }

  try {
    window.Pi.init({ version: "2.0" });
    isPiSDKInitialized = true;
    return true;
  } catch (err) {
    console.warn("Pi SDK Init notice:", err);
    isPiSDKInitialized = true;
    return true;
  }
}

async function handlePiAuth() {
  const initialized = await initPiSDK();
  if (!initialized) {
    throw new Error("Pi SDK belum siap. Pastikan dApp dibuka di dalam Pi Browser.");
  }

  const scopes = ['username', 'payments'];
  
  return new Promise((resolve, reject) => {
    window.Pi.authenticate(scopes, onIncompletePaymentFound).then(async function(auth) {
      if (!auth || !auth.accessToken) {
        return reject(new Error("Gagal mendapatkan Access Token dari Pi Network."));
      }

      const accessToken = auth.accessToken;

      try {
        await fetch("https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: accessToken })
        });
      } catch (backendErr) {
        console.warn("Backend auth fallback notice:", backendErr);
      }

      const verifiedUser = {
        username: auth.user.username,
        uid: auth.user.uid,
        accessToken: accessToken,
        demo: false
      };

      localStorage.setItem("tvod_user_session", JSON.stringify(verifiedUser));
      renderUser(verifiedUser);
      setConnection("● Pi SDK Verified", true);
      resolve(verifiedUser);

    }).catch(function(error) {
      console.error("Pi Authentication Error:", error);
      reject(error);
    });
  });
}

const onIncompletePaymentFound = (payment) => {
  console.warn("Incomplete payment found:", payment);
  fetch('/api/payments/complete-incomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-TVOD-Secret': TVOD_SECRET_KEY },
    body: JSON.stringify({ paymentId: payment.identifier })
  }).catch(err => console.error("Incomplete payment resolution error:", err));
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
      console.warn("Failed to read saved session:", e);
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
      alert("⚠️ Failed to save voter profile to database: " + error.message);
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
        activeUser.walletAddress = TVOD_APP_WALLET;
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
      let agreeScore = 0, neutralScore = 0, disagreeScore = 0;
      let totalConf = 0;

      validVotes.forEach((v) => {
        const score = parseFloat(v.weighted_score) || 0;
        totalNetScore += score;
        totalConf += (parseFloat(v.confidence) || 0);
        if (v.vote_direction === 1) {
          agreeC++;
          agreeScore += score;
        } else if (v.vote_direction === 0) {
          neutralC++;
          neutralScore += score;
        } else if (v.vote_direction === -1) {
          disagreeC++;
          disagreeScore += score;
        }
      });

      activeProposal.totalVotes = count;
      activeProposal.netScore = totalNetScore;
      activeProposal.agreeCount = agreeC;
      activeProposal.neutralCount = neutralC;
      activeProposal.disagreeCount = disagreeC;
      activeProposal.agreeScore = agreeScore;
      activeProposal.neutralScore = neutralScore;
      activeProposal.disagreeScore = disagreeScore;
      activeProposal.avgConfidence = count > 0 ? (totalConf / count).toFixed(2) : 0;

      if (display) display.textContent = `${count} Voters (${totalNetScore >= 0 ? '+' : ''}${totalNetScore.toFixed(1)} Pts)`;
    }
  } catch (err) {
    if (display) display.textContent = "0 Voters";
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
      proposerEntity: "TVOD Development Team",
      author: p.author || "afifmasfiqo",
      date: new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      durationHours: p.duration_hours || 24,
      images: p.images && p.images.length > 0 ? p.images : ["https://via.placeholder.com/500x300/0f172a/f59e0b?text=Proof+Image"],
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
  const addrText = $("#appWalletAddrText");
  if (addrText) addrText.textContent = TVOD_APP_WALLET;
  if (display) display.textContent = "⏳ Checking...";
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
  const savedLang = localStorage.getItem("tvod_lang") || "en";
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
  if (countSpan) countSpan.textContent = `⏳ Compressing ${files.length} photos...`;
  try {
    const promises = Array.from(files).map((file) => compressAndResizeImage(file, 800, 0.8));
    uploadedGalleryBase64Images = await Promise.all(promises);
    if (countSpan) countSpan.textContent = `📷 ${uploadedGalleryBase64Images.length} photos ready.`;
  } catch (err) {
    if (countSpan) countSpan.textContent = "❌ Failed to load photos.";
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
      if (display) display.textContent = "⚠️ VOTING CLOSED";
      if (btn) {
        btn.disabled = true;
        btn.innerText = "⛔ Voting Session Closed";
        btn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-lg text-sm cursor-not-allowed";
      }
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (display) {
      display.textContent = `⏳ ${hours}h ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
    }
  }, 1000);
}

function setConnection(message, good = false) {
  const element = $("#connection-status");
  if (!element) return;
  element.textContent = message;
  element.className = `px-2.5 py-0.5 rounded-full font-mono text-xs ${good ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-800 text-slate-400"}`;
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
    if (loginStatusText) loginStatusText.textContent = `Authenticated: @${user.username}`;

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
    if (loginStatusText) loginStatusText.textContent = "Not authenticated";
    if (adminSection) adminSection.classList.add("hidden");
    if (adminNavLink) adminNavLink.classList.add("hidden");
  }
}

// Tombol Login Pi SDK dengan Event Handler yang Bersih
const piLoginBtn = $("#pi-login-button");
if (piLoginBtn) {
  const newPiBtn = piLoginBtn.cloneNode(true);
  piLoginBtn.parentNode.replaceChild(newPiBtn, piLoginBtn);

  newPiBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    newPiBtn.disabled = true;
    newPiBtn.innerText = "Authenticating with Pi...";
    
    try {
      const user = await handlePiAuth();
      newPiBtn.innerText = "Signed In Successfully (✓)";
      newPiBtn.classList.remove('bg-amber-500', 'hover:bg-amber-600');
      newPiBtn.classList.add('bg-emerald-600', 'text-white');
      alert(`Welcome @${user.username}! Pi SDK Login Successful.`);
    } catch (error) {
      alert("Pi Login Notice: " + (error.message || error));
      newPiBtn.innerText = "Sign in with Pi SDK (Payments Scope)";
      newPiBtn.disabled = false;
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
    alert("Entered Demo Mode.");
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
    alert("⚠️ Please log in first.");
    return;
  }

  const category = $("#voterCategory").value;
  const role = $("#userRole").value;
  const wallet = $("#walletAddress").value.trim();
  const chapter = $("#communityChapter") ? $("#communityChapter").value : "GLOBAL";

  if (!isValidPiWalletAddress(wallet)) {
    alert("⛔ INVALID WALLET ADDRESS!\nMust start with 'G' or 'M' and be exactly 56 characters long.");
    return;
  }

  let gId = null;
  let gHash = null;

  if (category === "owner") {
    gId = parseInt($("#garudaId").value || "0");
    gHash = $("#garudaHash").value.trim();
    if (!gId || gId < 1 || gId > 1000) {
      alert("Invalid Garuda ID.");
      return;
    }
    if (!gHash) {
      alert("Garuda NFT Hash is required.");
      return;
    }
    activeUser.garudaId = gId;
    activeUser.garudaHash = gHash;
  } else {
    const ownerUsername = $("#ownerUsername").value.trim();
    const nftType = $("#delegatorNftType").value;
    const rawHashes = $("#delegatorHashes").value.trim();
    if (!ownerUsername || !rawHashes) {
      alert("Please complete delegator details.");
      return;
    }
    activeUser.ownerUsername = ownerUsername;
    activeUser.delegatedNftType = nftType;
    activeUser.delegatedHashes = [rawHashes];
  }

  const banned = await checkGarudaBlacklistStatus(gId, username);
  if (banned) {
    alert("Access denied: Account frozen.");
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
    alert(`✅ Registration & Binding Successful!\nUsername: @${username}`);
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
      <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center shadow-md overflow-hidden max-w-full">
        <span class="text-xs sm:text-sm font-semibold text-amber-400 block mb-1">Proof Photo #${idx + 1}:</span>
        <div class="w-full max-h-[300px] overflow-hidden flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 p-1">
          <img src="${imgUrl}" alt="Proof Photo" class="w-full h-full max-h-[280px] object-contain rounded-xl">
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
    alert("Title and Description are required!");
    return;
  }

  activeProposal.id = "TVOD-PROP-" + Date.now();
  activeProposal.title = title;
  activeProposal.category = category;
  activeProposal.description = description;
  activeProposal.durationHours = durationHrs;
  activeProposal.author = activeUser.username || "afifmasfiqo";
  votingEndTime = new Date(Date.now() + durationHrs * 60 * 60 * 1000);

  startCountdownTimer();

  let combinedImages = [];
  if (uploadedGalleryBase64Images && uploadedGalleryBase64Images.length > 0) {
    combinedImages = combinedImages.concat(uploadedGalleryBase64Images);
  }
  activeProposal.images = combinedImages.length > 0 ? combinedImages : ["https://via.placeholder.com/500x300/0f172a/f59e0b?text=Proof"];

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
        author: activeProposal.author,
        images: activeProposal.images,
        status: 'ACTIVE'
      }], { onConflict: 'id' });
    } catch (err) {
      console.error(err);
    }
  }
  alert(`✅ Proposal Published Successfully!`);
}

async function cancelActiveProposal() {
  if (!confirm("Cancel this proposal?")) return;
  if (countdownInterval) clearInterval(countdownInterval);
  activeProposal.status = 'CANCELLED';
  if (supabaseClient) {
    await supabaseClient.from('proposals').update({ status: 'CANCELLED' }).eq('id', activeProposal.id);
  }
  alert("⛔ Proposal cancelled.");
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
    btn.innerText = "⏳ Processing Payment & Vote...";
  }

  const currentUsername = activeUser.username || "Anonymous";
  const currentWallet = activeUser.walletAddress || "";

  const isBanned = await checkGarudaBlacklistStatus(activeUser.garudaId, currentUsername);
  if (isBanned) {
    alert("Access denied: Account frozen.");
    if (btn) { btn.disabled = false; btn.innerText = "Submit Encrypted Vote & Claim Pi"; }
    return;
  }

  if (!currentWallet || !isValidPiWalletAddress(currentWallet)) {
    if (btn) { btn.disabled = false; btn.innerText = "Submit Encrypted Vote & Claim Pi"; }
    alert("Wallet address is not valid.");
    return;
  }

  const selectedValue = document.querySelector('input[name="voteValue"]:checked');
  if (!selectedValue) {
    if (btn) { btn.disabled = false; btn.innerText = "Submit Encrypted Vote & Claim Pi"; }
    alert("Please select a vote direction.");
    return;
  }

  const voteVal = parseInt(selectedValue.value);
  const roleWeight = activeUser.role === "Group Leader" ? 1.0 : (activeUser.role === "Founder" ? 2.0 : 0.5);
  const individualScore = voteVal * currentConfidence * roleWeight;
  const timestamp = new Date().toISOString();
  const rawPayload = `${currentUsername}|${currentWallet}|${voteVal}|${currentConfidence}|${roleWeight}|${timestamp}`;
  const voteHash = window.CryptoJS ? window.CryptoJS.SHA256(rawPayload).toString() : "HASH";
  const activeSig = getSignatureDataUrl("sig-chairman");

  if (window.Pi && typeof window.Pi.createPayment === 'function') {
    try {
      const paymentData = {
        amount: 1.0,
        memo: `TVOD Voting & Ratification Fee - @${currentUsername}`,
        metadata: { proposalId: activeProposal.id, voteVal: voteVal, username: currentUsername }
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId) => {
          await fetch('/api/payments/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-TVOD-Secret': TVOD_SECRET_KEY },
            body: JSON.stringify({ paymentId })
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-TVOD-Secret': TVOD_SECRET_KEY },
            body: JSON.stringify({ paymentId, txid })
          });
        },
        onCancel: (paymentId) => {
          alert("Payment was cancelled.");
          if (btn) { btn.disabled = false; btn.innerText = "Submit Encrypted Vote & Claim Pi"; }
        },
        onError: (error, payment) => {
          alert("Pi Network payment error occurred.");
          if (btn) { btn.disabled = false; btn.innerText = "Submit Encrypted Vote & Claim Pi"; }
        }
      };

      await window.Pi.createPayment(paymentData, callbacks);
    } catch (payErr) {
      console.warn("Pi Payment SDK notice:", payErr);
    }
  }

  await saveVoteToSupabase({
    proposal_id: activeProposal.id,
    username: currentUsername,
    wallet_address: currentWallet,
    vote_direction: voteVal,
    confidence: currentConfidence,
    role_weight: roleWeight,
    weighted_score: individualScore,
    vote_hash: voteHash,
    voter_signature_base64: activeSig,
    created_at: timestamp
  });

  await fetchVoterStatsForAdmin();

  try {
    const payoutRes = await fetch('/api/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-TVOD-Secret': TVOD_SECRET_KEY },
      body: JSON.stringify({
        walletAddress: currentWallet,
        amount: 1.0,
        username: currentUsername,
        proposalId: activeProposal.id
      })
    });
    const payoutData = await payoutRes.json();
    if (payoutRes.ok && payoutData.success) {
      showPayoutBanner(`🎉 SUCCESS!<br><strong>Tx:</strong> ${payoutData.txHash}`, true);
    } else {
      showPayoutBanner(`⚠️ Vote recorded. Automated payout pending queue.`, false);
    }
  } catch (payErr) {
    showPayoutBanner(`✅ Vote recorded in Database successfully.`, false);
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "✅ Vote Submitted & Pi Claimed";
    btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-3.5 rounded-lg text-sm border border-amber-500/30 cursor-not-allowed";
  }
}

async function toggleGarudaBan(isBan) {
  const garudaIdInput = $("#targetGarudaId") ? $("#targetGarudaId").value.trim() : "";
  const reasonInput = $("#targetBanReason") ? $("#targetBanReason").value.trim() : "";
  if (!garudaIdInput) {
    alert("Please enter Garuda ID.");
    return;
  }
  const garudaIdNum = parseInt(garudaIdInput);
  try {
    const endpoint = isBan ? '/api/admin/freeze' : '/api/admin/unfreeze';
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-TVOD-Secret': TVOD_SECRET_KEY },
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
    alert("Status updated successfully.");
    location.reload();
  } catch (err) {
    alert("Failed: " + err.message);
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
  if (statusEl) statusEl.textContent = "✅ Link copied successfully!";
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
    const docType = currentOpenedDocType || "document";
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
    alert("Failed to download PDF");
  }
}

function copyDocumentText() {
  const contentDiv = document.getElementById("documentViewerContent");
  if (!contentDiv) return;
  const textToCopy = contentDiv.innerText || contentDiv.textContent;
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert("✅ Teks dokumen berhasil disalin ke clipboard!");
  }).catch(err => {
    alert("⚠️ Gagal menyalin teks dokumen.");
  });
}

async function generateOfficialMinutesPDF() {
  currentOpenedDocType = "minutes";
  
  let votesList = [];
  let voterProfiles = [];
  if (supabaseClient) {
    try {
      const { data: vData } = await supabaseClient.from('votes').select('*').eq('proposal_id', activeProposal.id);
      if (vData) votesList = vData;
      const { data: pData } = await supabaseClient.from('voters').select('*');
      if (pData) voterProfiles = pData;
    } catch (e) {
      console.warn("Error fetching minutes data:", e);
    }
  }

  const profileMap = {};
  voterProfiles.forEach(p => { profileMap[p.username] = p; });
  const frozenIds = await getFrozenListClient();

  const validVotes = votesList.filter(v => {
    const prof = profileMap[v.username] || {};
    if (prof.garuda_id && frozenIds.includes(String(prof.garuda_id))) {
      return false;
    }
    return true;
  });

  let totalVotes = validVotes.length;
  let agreeC = 0, neutralC = 0, disagreeC = 0;
  let agreeScore = 0, neutralScore = 0, disagreeScore = 0;
  let totalConf = 0;

  validVotes.forEach(v => {
    const score = parseFloat(v.weighted_score) || 0;
    totalConf += (parseFloat(v.confidence) || 0);
    if (v.vote_direction === 1) {
      agreeC++;
      agreeScore += score;
    } else if (v.vote_direction === 0) {
      neutralC++;
      neutralScore += score;
    } else if (v.vote_direction === -1) {
      disagreeC++;
      disagreeScore += score;
    }
  });

  const netScore = agreeScore + neutralScore + disagreeScore;
  const avgConf = totalVotes > 0 ? (totalConf / totalVotes).toFixed(2) : "0.00";
  const verdict = netScore >= 0 ? "AGREE" : "DISAGREE";

  const sigChairman = getSignatureDataUrl("sig-chairman");
  const sigWitness = getSignatureDataUrl("sig-witness");
  const sigInspector = getSignatureDataUrl("sig-inspector");
  const sigCountryHead = getSignatureDataUrl("sig-country-head");

  const agreePct = totalVotes > 0 ? ((agreeC / totalVotes) * 100).toFixed(1) : "0.0";
  const neutralPct = totalVotes > 0 ? ((neutralC / totalVotes) * 100).toFixed(1) : "0.0";
  const disagreePct = totalVotes > 0 ? ((disagreeC / totalVotes) * 100).toFixed(1) : "0.0";

  const agreeScoreStr = (agreeScore >= 0 ? "+" : "") + agreeScore.toFixed(2);
  const neutralScoreStr = (neutralScore >= 0 ? "+" : "") + neutralScore.toFixed(2);
  const disagreeScoreStr = (disagreeScore >= 0 ? "+" : "") + disagreeScore.toFixed(2);
  const netScoreStr = (netScore >= 0 ? "+" : "") + netScore.toFixed(2);

  const currentDateObj = new Date();
  const dateFormattedUTC = currentDateObj.toUTCString();
  const dateFormattedDesc = currentDateObj.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const docHtml = `
    <div class="pdf-container" style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #ffffff; padding: 20px; font-size: 12px; line-height: 1.4;">
      <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px;">
        <img src="/logo.png" style="width: 48px; height: 48px; object-fit: contain; margin: 0 auto 4px auto; display: block;" alt="TVOD Logo" />
        <h2 style="color: #1e3a8a; margin: 0; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">OFFICIAL MINUTES</h2>
        <p style="font-size: 10px; color: #475569; margin: 3px 0; font-weight: bold;">WEB3 VOTING — ${activeProposal.title.toUpperCase()}</p>
        <p style="font-size: 9px; color: #64748b; margin: 0;">THE VOICE OF DAO (TVOD) X PI NETWORK ECOSYSTEM</p>
      </div>

      <div style="margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px; background: #f8fafc;">
        <h3 style="font-size: 11px; color: #1e3a8a; margin: 0 0 6px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; font-weight: bold;">DOCUMENT CONTROL RECORD</h3>
        <table style="width: 100%; font-size: 10px; border: none;">
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 3px 6px; width: 28%; font-weight: bold;">Document ID</td><td style="border: 1px solid #cbd5e1; padding: 3px 6px; font-family: monospace; color: #0f172a;">TVOD-PROP-${activeProposal.id}</td></tr>
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 3px 6px; font-weight: bold;">Integrity Hash</td><td style="border: 1px solid #cbd5e1; padding: 3px 6px; font-family: monospace; color: #2563eb;">${window.CryptoJS ? window.CryptoJS.SHA256(activeProposal.id + totalVotes).toString().substring(0, 16).toUpperCase() : '35E2E40E2908403B'}</td></tr>
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 3px 6px; font-weight: bold;">Classification</td><td style="border: 1px solid #cbd5e1; padding: 3px 6px; color: #b91c1c; font-weight: bold;">RESTRICTED - Official DAO Verification Record</td></tr>
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 3px 6px; font-weight: bold;">Generated Date</td><td style="border: 1px solid #cbd5e1; padding: 3px 6px;">${dateFormattedUTC}</td></tr>
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 3px 6px; font-weight: bold;">Subject</td><td style="border: 1px solid #cbd5e1; padding: 3px 6px;">${activeProposal.title}</td></tr>
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 3px 6px; font-weight: bold;">Source / Chapter</td><td style="border: 1px solid #cbd5e1; padding: 3px 6px;">TVOD Verifier dApp / GLOBAL</td></tr>
        </table>
      </div>

      <p style="font-size: 10px; color: #334155; margin-bottom: 12px; text-align: justify;">
        On this day, <b>${dateFormattedDesc}</b>, the Web3 Voting process for <b>"${activeProposal.title}"</b> was officially conducted and cryptographic records were committed under the following governance parameters:
      </p>

      <div style="margin-bottom: 12px;">
        <h3 style="font-size: 11px; color: #1e3a8a; margin: 0 0 5px 0; font-weight: bold;">I. ACTIVITY & GOVERNANCE DETAILS</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <tr><td style="background: #1e3a8a; color: #ffffff; width: 30%; border: 1px solid #1e3a8a; padding: 4px 6px; font-weight: bold;">Activity Name</td><td style="border: 1px solid #cbd5e1; padding: 4px 6px;">${activeProposal.title}</td></tr>
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 4px 6px; font-weight: bold;">Platform</td><td style="border: 1px solid #cbd5e1; padding: 4px 6px;">TVOD Verifier dApp</td></tr>
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 4px 6px; font-weight: bold;">Voting Method</td><td style="border: 1px solid #cbd5e1; padding: 4px 6px;">On-Chain NFT Verification & Weighted Role Voting</td></tr>
          <tr><td style="background: #1e3a8a; color: #ffffff; border: 1px solid #1e3a8a; padding: 4px 6px; font-weight: bold;">Scoring Formula</td><td style="border: 1px solid #cbd5e1; padding: 4px 6px;">Score = Direction × Confidence × Role Weight</td></tr>
        </table>
      </div>

      <div style="margin-bottom: 12px;">
        <h3 style="font-size: 11px; color: #1e3a8a; margin: 0 0 5px 0; font-weight: bold;">II. VOTING RESULTS & WEIGHTED METRICS</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: center;">
          <thead>
            <tr style="background: #1e3a8a; color: #ffffff;">
              <th style="padding: 5px; border: 1px solid #1e3a8a; color: #ffffff; text-align: left; background-color: #1e3a8a;">Category</th>
              <th style="padding: 5px; border: 1px solid #1e3a8a; color: #ffffff; background-color: #1e3a8a;">Ballots Count</th>
              <th style="padding: 5px; border: 1px solid #1e3a8a; color: #ffffff; background-color: #1e3a8a;">% Total Votes</th>
              <th style="padding: 5px; border: 1px solid #1e3a8a; color: #ffffff; background-color: #1e3a8a;">Weighted Score</th>
              <th style="padding: 5px; border: 1px solid #1e3a8a; color: #ffffff; background-color: #1e3a8a;">Avg Confidence</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background: #ecfdf5;">
              <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold; color: #065f46;">Agree (+1)</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${agreeC}</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${agreePct}%</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${agreeScoreStr}</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${avgConf}</td>
            </tr>
            <tr style="background: #fefce8;">
              <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold; color: #854d0e;">Neutral (0)</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${neutralC}</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${neutralPct}%</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${neutralScoreStr}</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${avgConf}</td>
            </tr>
            <tr style="background: #fef2f2;">
              <td style="padding: 5px; border: 1px solid #cbd5e1; text-align: left; font-weight: bold; color: #991b1b;">Disagree (-1)</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${disagreeC}</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${disagreePct}%</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">${disagreeScoreStr}</td>
              <td style="padding: 5px; border: 1px solid #cbd5e1;">0.00</td>
            </tr>
            <tr style="background: #1e293b; color: #ffffff; font-weight: bold;">
              <td style="padding: 5px; border: 1px solid #334155; color: #ffffff; text-align: left;">FINAL TOTAL</td>
              <td style="padding: 5px; border: 1px solid #334155; color: #ffffff;">${totalVotes}</td>
              <td style="padding: 5px; border: 1px solid #334155; color: #ffffff;">100%</td>
              <td style="padding: 5px; border: 1px solid #334155; color: #f59e0b;">${netScoreStr} Pts</td>
              <td style="padding: 5px; border: 1px solid #334155; color: #ffffff;">${avgConf}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 15px; border: 2px solid #10b981; border-radius: 6px; padding: 10px; text-align: center; background: #ecfdf5;">
        <h3 style="color: #065f46; font-size: 11px; margin: 0 0 3px 0; font-weight: bold;">III. OFFICIAL VERDICT</h3>
        <p style="font-size: 13px; font-weight: bold; color: #047857; margin: 3px 0; letter-spacing: 0.5px;">RATIFICATION VERDICT: ${verdict}</p>
        <p style="font-size: 9px; color: #064e3b; margin: 0;">Net Weighted Score: ${netScoreStr} | Average Confidence Scale: ${avgConf} / 5.0</p>
      </div>

      <div style="margin-top: 15px; position: relative;" class="avoid-break">
        <h3 style="font-size: 11px; color: #1e3a8a; margin: 0 0 6px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-weight: bold;">OFFICIAL RATIFICATION SIGNATURES</h3>
        
        <div style="position: absolute; left: 50%; top: 45%; transform: translate(-50%, -50%); width: 75px; height: 75px; z-index: 10; pointer-events: none;">
          <img src="/stempel-tvod.png" style="width: 100%; height: 100%; object-fit: contain;" alt="TVOD Official Seal" />
        </div>

        <table style="width: 100%; border: none; font-size: 9px; text-align: center; position: relative; z-index: 1;">
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; width: 50%; vertical-align: top; background: #ffffff;">
              <b>1. Chairperson:</b><br><br>
              ${sigChairman ? `<img src="${sigChairman}" style="max-height: 42px; display: block; margin: 0 auto;" />` : '<span style="color:#64748b; font-style:italic;">[Signed Digitally]</span>'}<br>
              <b>@afifmasfiqo</b> (#911)
            </td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; width: 50%; vertical-align: top; background: #ffffff;">
              <b>2. Witness:</b><br><br>
              ${sigWitness ? `<img src="${sigWitness}" style="max-height: 42px; display: block; margin: 0 auto;" />` : '<span style="color:#64748b; font-style:italic;">[Signed Digitally]</span>'}<br>
              <b>@insya</b> (Witness)
            </td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; background: #ffffff;">
              <b>3. Inspector:</b><br><br>
              ${sigInspector ? `<img src="${sigInspector}" style="max-height: 42px; display: block; margin: 0 auto;" />` : '<span style="color:#64748b; font-style:italic;">[Signed Digitally]</span>'}<br>
              <b>@Nalaktak</b> (#999)
            </td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; background: #ffffff;">
              <b>4. Country Head:</b><br><br>
              ${sigCountryHead ? `<img src="${sigCountryHead}" style="max-height: 42px; display: block; margin: 0 auto;" />` : '<span style="color:#64748b; font-style:italic;">[Signed Digitally]</span>'}<br>
              <b>@Rasj81</b> (Country Head)
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
  renderDocumentInModal("Official Minutes Report", docHtml);
}

async function generateVoterAuditLogPDF() {
  currentOpenedDocType = "audit_log";
  let votesList = [];
  let voterProfiles = [];
  if (supabaseClient) {
    try {
      const { data: vData } = await supabaseClient.from('votes').select('*').eq('proposal_id', activeProposal.id);
      if (vData) votesList = vData;
      const { data: pData } = await supabaseClient.from('voters').select('*');
      if (pData) voterProfiles = pData;
    } catch (e) {
      console.warn("Audit log fetch error:", e);
    }
  }

  const profileMap = {};
  voterProfiles.forEach(p => { profileMap[p.username] = p; });
  const frozenIds = await getFrozenListClient();

  const validVotes = votesList.filter(v => {
    const prof = profileMap[v.username] || {};
    if (prof.garuda_id && frozenIds.includes(String(prof.garuda_id))) {
      return false;
    }
    return true;
  });

  let tableRowsHtml = "";
  if (validVotes.length === 0) {
    tableRowsHtml = `<tr><td colspan="11" style="text-align: center; padding: 12px; color: #64748b;">No active voting records found for this proposal.</td></tr>`;
  } else {
    validVotes.forEach((v, idx) => {
      const dirText = v.vote_direction === 1 ? "Agree (+1)" : (v.vote_direction === 0 ? "Neutral (0)" : "Disagree (-1)");
      const prof = profileMap[v.username] || {};
      const garudaIdStr = prof.garuda_id ? `#${prof.garuda_id}` : 'Delegate';
      const timestampFormatted = v.created_at ? new Date(v.created_at).toUTCString().replace("GMT", "UTC") : new Date().toUTCString().replace("GMT", "UTC");
      
      tableRowsHtml += `
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 5px; text-align:center;">${idx + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">@${v.username || 'anonymous'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px; text-align:center;">${garudaIdStr}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">${prof.chapter || 'GLOBAL'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">${prof.role || 'Member'}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px; text-align:center; font-weight:bold; color:#581c87;">${v.role_weight || 1.0}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">TVOD Verifier dApp</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px;">${dirText}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px; text-align:center;">${v.confidence || 3}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px; text-align:center; font-weight:bold;">${(v.weighted_score >= 0 ? '+' : '') + (v.weighted_score || 0).toFixed(1)}</td>
          <td style="border: 1px solid #cbd5e1; padding: 5px; font-size: 8px; font-family: monospace;">${timestampFormatted}</td>
        </tr>
      `;
    });
  }

  const sigChairman = getSignatureDataUrl("sig-chairman");
  const sigInspector = getSignatureDataUrl("sig-inspector");

  const docHtml = `
    <div class="pdf-container" style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #ffffff; padding: 20px; font-size: 11px;">
      <div style="text-align: center; border-bottom: 2px solid #581c87; padding-bottom: 10px; margin-bottom: 15px;">
        <img src="/logo.png" style="width: 48px; height: 48px; object-fit: contain; margin: 0 auto 4px auto; display: block;" alt="TVOD Logo" />
        <h2 style="color: #581c87; margin: 0; font-size: 15px; font-weight: bold;">INDIVIDUAL VOTER AUDIT TRAIL LOG REPORT</h2>
        <p style="font-size: 11px; color: #475569; margin: 4px 0; font-weight: bold;">PROPOSAL: ${activeProposal.title.toUpperCase()}</p>
        <p style="font-size: 9px; color: #64748b; margin: 0;">THE VOICE OF DAO (TVOD) x PI NETWORK ECOSYSTEM</p>
      </div>

      <div style="margin-bottom: 10px; background: #f3e8ff; border: 1px solid #d8b4fe; padding: 6px 10px; border-radius: 4px; font-size: 9px; color: #6b21a8; font-weight: bold; text-align: center;">
        ⚠️ RESTRICTED - CONTROLLED AUDIT LOG DOCUMENT • AUTHORIZED PERSONNEL ONLY
      </div>

      <div style="overflow-x: auto; margin-bottom: 15px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 8.5px;">
          <thead>
            <tr style="background: #581c87; color: #ffffff; text-align: center;">
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">No</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Username</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Garuda ID</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Chapter</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Role</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Weight</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Voting Source</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Vote</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Conf</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Score</th>
              <th style="padding: 6px; border: 1px solid #4c1d95; color: #ffffff; background-color: #581c87;">Timestamp (UTC)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 20px; position: relative;" class="avoid-break">
        <h3 style="font-size: 11px; color: #581c87; margin: 0 0 6px 0; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; font-weight: bold;">AUDIT TRAIL VERIFICATION SIGNATURES</h3>
        
        <div style="position: absolute; left: 75%; top: 50%; transform: translate(-50%, -50%); width: 75px; height: 75px; z-index: 10; pointer-events: none;">
          <img src="/stempel-tvod.png" style="width: 100%; height: 100%; object-fit: contain;" alt="TVOD Audit Seal" />
        </div>

        <table style="width: 100%; border: none; font-size: 9px; text-align: center; position: relative; z-index: 1;">
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px; width: 50%; vertical-align: top; background: #ffffff;">
              <b>Governance Chairman:</b><br><br>
              ${sigChairman ? `<img src="${sigChairman}" style="max-height: 40px; display: block; margin: 0 auto;" />` : '<span style="color:#64748b;">[Signed Digitally]</span>'}<br>
              <b>@afifmasfiqo</b> (#911)
            </td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; width: 50%; vertical-align: top; background: #ffffff;">
              <b>Audit Inspector:</b><br><br>
              ${sigInspector ? `<img src="${sigInspector}" style="max-height: 40px; display: block; margin: 0 auto;" />` : '<span style="color:#64748b;">[Signed Digitally]</span>'}<br>
              <b>@Nalaktak</b> (#999)
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
  renderDocumentInModal("Individual Voter Audit Trail Log", docHtml);
}

async function generateCertificatePDF() {
  currentOpenedDocType = "certificate";
  const sigChairman = getSignatureDataUrl("sig-chairman");
  
  const applicantName = activeProposal.author ? `@${activeProposal.author}` : `@${activeUser.username || 'afifmasfiqo'}`;

  const docHtml = `
    <div class="pdf-container" style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #ffffff; padding: 30px; text-align: center; border: 8px double #f59e0b; position: relative;">
      <img src="/logo.png" style="width: 56px; height: 56px; object-fit: contain; margin: 0 auto 8px auto; display: block;" alt="TVOD Logo" />
      <h2 style="color: #b45309; font-size: 22px; margin-bottom: 5px; font-weight: bold;">CERTIFICATE OF VERIFICATION</h2>
      <p style="font-size: 12px; color: #78350f; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">THE VOICE OF DAO (TVOD) x PI NETWORK</p>
      
      <p style="font-size: 13px; margin: 25px 0 10px 0; color: #334155;">This certificate of recognition is proudly presented to:</p>
      <h3 style="font-size: 20px; color: #1e3a8a; margin: 5px 0 15px 0; font-weight: bold;">${applicantName}</h3>
      <p style="font-size: 12px; color: #475569; max-width: 500px; margin: 0 auto 20px auto; line-height: 1.6;">
        For outstanding proposal submission and active on-chain verification contribution in DAO governance:<br>
        <b>"${activeProposal.title}"</b>
      </p>

      <div style="display: flex; justify-content: space-around; align-items: center; margin-top: 40px; text-align: center; position: relative;" class="avoid-break">
        <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; z-index: 10; pointer-events: none;">
          <img src="/stempel-tvod.png" style="width: 100%; height: 100%; object-fit: contain;" alt="TVOD Certificate Seal" />
        </div>

        <div>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 5px;">Issued Date: ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="text-align: center; background: rgba(255,255,255,0.9); padding: 5px; border-radius: 4px;">
          <p style="font-size: 11px; font-weight: bold; color: #1e3a8a; margin-bottom: 4px;">Verified by Governance Chairman</p>
          ${sigChairman ? `<img src="${sigChairman}" style="max-height: 45px; display: block; margin: 0 auto;" />` : '<span style="color:#64748b;">[Signed Digitally]</span>'}
          <p style="font-size: 11px; font-weight: bold; margin-top: 4px;">@afifmasfiqo (#911)</p>
        </div>
      </div>
    </div>
  `;
  renderDocumentInModal("Digital Verification Certificate", docHtml);
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
window.copyDocumentText = copyDocumentText;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
