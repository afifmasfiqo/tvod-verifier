"use strict";

const $ = (selector) => document.querySelector(selector);
const TVOD_APP_WALLET = "GBBIFANYEV6J5OYXPCFF4AYXTWQFIJNSIF4YYFF26LETN3PHA3TDQ3WL";
const AUTHORIZED_ADMINS = ["afifmasfiqo", "Nalaktak"];

function ensureHttps(url) {
  if (!url) return "";
  let cleanUrl = url.trim();
  if (cleanUrl.length === 0) return "";
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }
  return cleanUrl;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 🛑 VALIDASI ALAMAT WALLET PI (Mendukung awalan 'G' Pi Browser & 'M' PiBox/PiPet, 56 Karakter)
function isValidPiWalletAddress(address) {
  if (!address) return false;
  const cleanAddr = address.trim();
  const piWalletRegex = /^[GM][A-Z2-7]{55}$/i;
  return piWalletRegex.test(cleanAddr);
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
    label_wallet: "Pi Wallet Address (Awalan G / M, 56 Karakter untuk Payout & Cek NFT)",
    label_category: "Kategori Pemilih (Voter Category)",
    cat_owner: "Pemilih Tetap (Pemilik NFT Garuda #1 - #1000)",
    cat_delegator: "Delegator (NFT Halloween 1 Unit / NFT PiDay2026 3 Unit)",
    label_chapter: "Wilayah Komunitas (Chapter)",
    label_role: "Peran Tata Kelola (Governance Role)",
    role_member: "Member (Bobot Suara: 0.5)",
    role_leader: "Group Leader (Bobot Suara: 1.0)",
    role_founder: "Founder (Vote Weight: 2.0)",
    btn_register: "Verifikasi Data & Buka Akses Voting",
    prop_bg_title: "📄 LATAR BELAKANG & DESKRIPSI OBJEK",
    prop_gallery_title: "📸 GALERI BUKTI FOTO & VIDEO OBJEK",
    prop_author_label: "Diterbitkan oleh:",
    prop_date_label: "Tanggal:",
    prop_video_label: "Bukti Rekaman Video:",
    prop_no_video: "Belum ada video dilampirkan",
    vote_step_title: "Modul Fast Voting",
    vote_step_desc: "Sistem memverifikasi keberadaan NFT di wallet secara On-Chain sebelum menyimpan suara Anda.",
    vote_dir_label: "1. Arah Pilihan Suara Anda",
    vote_agree: "👍 Agree (+1)",
    vote_neutral: "😐 Neutral (0)",
    vote_disagree: "👎 Disagree (-1)",
    confidence_label: "2. Tingkat Keyakinan / Confidence (Skala 1 - 5)",
    btn_submit_vote: "Kirim Suara Terenkripsi & Klaim Insentif Pi",
    admin_title: "🛡️ Admin Suite",
    btn_publish_prop: "🚀 Terbitkan Proposal & Mulai Timer Voting",
    btn_cancel_prop: "⛔ Batalkan / Tutup Proposal Aktif",
    btn_retry_payouts: "🔄 Process Pending Payouts Queue",
    btn_official_minutes: "📄 Generate Official Minutes Document (English)",
    btn_digital_cert: "🎓 Generate Digital Verification Certificate",
    btn_print_pdf: "📥 Download PDF Directly (1-Klik)",
    btn_share_chrome: "🌐 Salin Link Chrome",
    btn_copy_text: "📋 Salin Teks",
    btn_close_modal: "Tutup"
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
    label_wallet: "Pi Wallet Address (Prefix G / M, 56 Characters for Payouts & NFT Check)",
    label_category: "Voter Category",
    cat_owner: "Regular Voter (Garuda NFT Owner #1 - #1000)",
    cat_delegator: "Delegator (1 Unit Halloween NFT / 3 Units PiDay2026 NFT)",
    label_chapter: "Community Chapter / Region",
    label_role: "Governance Role",
    role_member: "Member (Vote Weight: 0.5)",
    role_leader: "Group Leader (Vote Weight: 1.0)",
    role_founder: "Founder (Vote Weight: 2.0)",
    btn_register: "Verify Data & Enable Voting Access",
    prop_bg_title: "📄 BACKGROUND & OBJECT DESCRIPTION",
    prop_gallery_title: "📸 PHOTO & VIDEO PROOF GALLERY",
    prop_author_label: "Published by:",
    prop_date_label: "Date:",
    prop_video_label: "Video Evidence Recording:",
    prop_no_video: "No video attached yet",
    vote_step_title: "Fast Voting Module",
    vote_step_desc: "System verifies NFT presence in wallet On-Chain before storing your vote.",
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
    btn_print_pdf: "📥 Download PDF Directly (1-Click)",
    btn_share_chrome: "🌐 Copy Chrome Link",
    btn_copy_text: "📋 Copy Document Text",
    btn_close_modal: "Close"
  },
  ar: {
    app_title: "صوت منظمة DAO",
    sub_title: "تطبيق التحقق والتصويت Web3",
    nav_home: "🔑 التسجيل والمحفظة",
    nav_proposal: "📄 مواد التصويت",
    nav_verify: "🗳️ التصويت السريع",
    nav_admin: "🛡️ جناح الإدارة",
    step1_title: "تسجيل الناخبين والتحقق من محفظة Pi",
    step1_desc: "مصادقة عبر Pi SDK وربط المحفظة للتحقق من ملكية NFT.",
    label_wallet: "عنوان محفظة Pi (البادئة G / M)",
    label_category: "فئة الناخب",
    cat_owner: "ناخب دائم (مالك NFT Garuda #1 - #1000)",
    cat_delegator: "مفوض (1 unit Halloween / 3 units PiDay2026)",
    label_chapter: "منطقة المجتمع",
    label_role: "دور الحوكمة",
    role_member: "عضو (وزن الصوت: 0.5)",
    role_leader: "قائد المجموعة (وزن الصوت: 1.0)",
    role_founder: "مؤسس (وزن الصوت: 2.0)",
    btn_register: "التحقق من البيانات وفتح الوصول للتصويت",
    prop_bg_title: "📄 الخلفية ووصف الهدف",
    prop_gallery_title: "📸 معرض الصور والفيديو للأدلة",
    prop_author_label: "نُشر بواسطة:",
    prop_date_label: "التاريخ:",
    prop_video_label: "تسجيل الفيديو للأدلة:",
    prop_no_video: "لم يتم إرفاق فيديو بعد",
    vote_step_title: "وحدة التصويت السريع",
    vote_step_desc: "يتحقق النظام من وجود NFT في المحفظة عبر الشبكة قبل حفظ صوتك.",
    vote_dir_label: "1. اتجاه صوتك",
    vote_agree: "👍 موافق (+1)",
    vote_neutral: "😐 محايد (0)",
    vote_disagree: "👎 غير موافق (-1)",
    confidence_label: "2. مستوى الثقة في التحقق (مقياس 1 - 5)",
    btn_submit_vote: "إرسال الصوت المشفر والمطالبة بالحافز",
    admin_title: "🛡️ جناح الإدارة",
    btn_publish_prop: "🚀 نشر اقتراح وبدء المؤقت",
    btn_cancel_prop: "⛔ إلغاء / إغلاق الاقتراح النشط",
    btn_retry_payouts: "🔄 معالجة صف المدفوعات المعلقة",
    btn_official_minutes: "📄 إنشاء وثيقة المحضر الرسمي (PDF)",
    btn_digital_cert: "🎓 إنشاء شهادة التحقق الرقمية",
    btn_print_pdf: "📥 تنزيل ملف PDF مباشرة",
    btn_share_chrome: "🌐 نسخ رابط Chrome",
    btn_copy_text: "📋 نسخ النص",
    btn_close_modal: "إغلاق"
  },
  zh: {
    app_title: "THE VOICE OF DAO",
    sub_title: "WEB3 验证与投票 dAPP",
    nav_home: "🔑 入职与钱包",
    nav_proposal: "📄 投票材料",
    nav_verify: "🗳️ 快速投票",
    nav_admin: "🛡️ 管理员套件",
    step1_title: "选民注册与 Pi 钱包验证",
    step1_desc: "通过 Pi SDK 进行身份验证并连接钱包以验证 On-Chain NFT 所有权。",
    label_wallet: "Pi 钱包地址 (前缀 G / M, 56 个字符)",
    label_category: "选民类别",
    cat_owner: "正式选民 (Garuda NFT 所有者 #1 - #1000)",
    cat_delegator: "代表 (1个 Halloween NFT / 3个 PiDay2026 NFT)",
    label_chapter: "社区分会 / 区域",
    label_role: "治理角色",
    role_member: "成员 (投票权重: 0.5)",
    role_leader: "组长 (投票权重: 1.0)",
    role_founder: "创始人 (投票权重: 2.0)",
    btn_register: "验证数据并开启投票权限",
    prop_bg_title: "📄 背景与对象描述",
    prop_gallery_title: "📸 照片与视频证明图库",
    prop_author_label: "发布者：",
    prop_date_label: "日期：",
    prop_video_label: "视频证据录像：",
    prop_no_video: "尚未附加视频",
    vote_step_title: "快速投票模块",
    vote_step_desc: "在保存您的投票之前，系统会在链上验证钱包中 NFT 的存在。",
    vote_dir_label: "1. 您的投票方向",
    vote_agree: "👍 赞成 (+1)",
    vote_neutral: "😐 中立 (0)",
    vote_disagree: "👎 反对 (-1)",
    confidence_label: "2. 验证置信度等级 (1 - 5 级)",
    btn_submit_vote: "提交加密投票并领取 Pi 奖励",
    admin_title: "🛡️ 管理员套件",
    btn_publish_prop: "🚀 发布提案并启动计时器",
    btn_cancel_prop: "⛔ 发布提案并启动计时器",
    btn_retry_payouts: "🔄 处理挂起的支付队列",
    btn_official_minutes: "📄 生成官方会议纪要文档 (PDF)",
    btn_digital_cert: "🎓 生成数字验证证书",
    btn_print_pdf: "📥 直接下载 PDF (1键)",
    btn_share_chrome: "🌐 复制 Chrome 链接",
    btn_copy_text: "📋 复制文本",
    btn_close_modal: "关闭"
  }
};
let currentLanguage = "id";

function syncRestrictedDropdownOptions() {
  const currentU = String((currentUser && currentUser.username) || activeUser.username || "").trim().toLowerCase();
  const currentG = Number(activeUser.garudaId || 0);

  // 1. Sembunyikan Opsi TVOD dari dropdown jika bukan Ketua TVOD
  const chapterSelect = $("#communityChapter");
  if (chapterSelect) {
    const tvodOpt = chapterSelect.querySelector("option[value='TVOD']");
    if (tvodOpt) {
      const canSeeTvod = (currentU === "afifmasfiqo");
      tvodOpt.hidden = !canSeeTvod;
      tvodOpt.disabled = !canSeeTvod;
      if (!canSeeTvod && chapterSelect.value === "TVOD") {
        chapterSelect.value = "GLOBAL";
      }
    }
  }

  // 2. Sembunyikan Opsi Founder dari dropdown jika bukan Founder (#999)
  const roleSelect = $("#userRole");
  if (roleSelect) {
    const founderOpt = roleSelect.querySelector("option[value='Founder']");
    if (founderOpt) {
      const canSeeFounder = (currentU === "nalaktak" && currentG === 999);
      founderOpt.hidden = !canSeeFounder;
      founderOpt.disabled = !canSeeFounder;
      if (!canSeeFounder && roleSelect.value === "Founder") {
        roleSelect.value = "Member";
      }
    }
  }
}

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

  if (dict) {
    const optOwner = document.querySelector("#voterCategory option[value='owner']");
    if (optOwner && dict.cat_owner) optOwner.textContent = dict.cat_owner;
    
    const optDelegator = document.querySelector("#voterCategory option[value='delegator']");
    if (optDelegator && dict.cat_delegator) optDelegator.textContent = dict.cat_delegator;

    const optMember = document.querySelector("#userRole option[value='Member']");
    if (optMember && dict.role_member) optMember.textContent = dict.role_member;

    const optLeader = document.querySelector("#userRole option[value='Group Leader']");
    if (optLeader && dict.role_leader) optLeader.textContent = dict.role_leader;

    const optFounder = document.querySelector("#userRole option[value='Founder']");
    if (optFounder && dict.role_founder) optFounder.textContent = dict.role_founder;

    // Perbarui Teks Label di Materi Voting
    const authorLbl = document.querySelector("#propAuthorLabel");
    if (authorLbl && dict.prop_author_label) authorLbl.textContent = dict.prop_author_label;

    const dateLbl = document.querySelector("#propDateLabel");
    if (dateLbl && dict.prop_date_label) dateLbl.textContent = dict.prop_date_label;

    const videoLbl = document.querySelector("#propVideoLabel");
    if (videoLbl && dict.prop_video_label) videoLbl.textContent = dict.prop_video_label;

    const videoPlaceholder = document.querySelector("#videoPlaceholder");
    if (videoPlaceholder && dict.prop_no_video) videoPlaceholder.textContent = dict.prop_no_video;
  }
}

// Global State
let isPiSDKInitialized = false;
let currentUser = null;
let currentOpenedDocType = null;
let isUserBanned = false;

let activeUser = {
  username: null,
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

let votingEndTime = null;
let countdownInterval = null;

let activeProposal = {
  id: "TVOD-PROP-2026-001",
  title: "Ratifikasi Sistem Verifikasi Web3 & Distribusi Insentif Voting TVOD",
  proposerEntity: "TVOD Development Team",
  proposerUsername: "TVOD Development Team",
  category: "Community Voting",
  author: "TVOD Development Team",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  description: "Berikut adalah berkas bukti verifikasi objek voting terkait pengajuan sistem reward dan kepatuhan Kode Etik.\nHarap periksa materi audio-visual dan dokumen pendukung di bawah ini secara teliti sebelum memberikan suara terbobot Anda.",
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

async function isVoterBlockedForVoting(garudaId, username) {
  const cleanUsername = String(username || "").trim().toLowerCase();
  const cleanGarudaId = (garudaId !== null && garudaId !== undefined && String(garudaId).trim() !== "")
    ? String(garudaId).trim()
    : "";

  const frozenIdSet = new Set(
    (await getFrozenListClient()).map((id) => String(id).trim())
  );
  const frozenUsernameSet = new Set();

  if (cleanGarudaId && frozenIdSet.has(cleanGarudaId)) {
    return true;
  }

  if (supabaseClient) {
    try {
      const { data: blacklistRows } = await supabaseClient
        .from("garuda_blacklist")
        .select("garuda_id, username");

      if (blacklistRows && blacklistRows.length > 0) {
        blacklistRows.forEach((b) => {
          if (b.garuda_id !== null && b.garuda_id !== undefined) {
            frozenIdSet.add(String(b.garuda_id).trim());
          }
          if (b.username) {
            frozenUsernameSet.add(String(b.username).trim().toLowerCase());
          }
        });
      }
    } catch (err) {
      console.warn("Gagal memeriksa daftar blokir Supabase saat voting:", err);
    }
  }

  if (cleanUsername && frozenUsernameSet.has(cleanUsername)) {
    return true;
  }
  if (cleanGarudaId && frozenIdSet.has(cleanGarudaId)) {
    return true;
  }

  return false;
}

// 🚫 1. PENGECEKAN STATUS BLACKLIST / PEMBEKUAN SERVER & SUPABASE
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
      const errorMsg = data.message || "Access denied: Your Garuda ID is temporarily frozen by Founder's directive. Voting and login are restricted.";
      
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
        const reasonText = record.reason || "Access denied: Your Garuda ID is temporarily frozen by Founder's directive.";
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

// ⚡ INISIALISASI PI SDK
async function initPiSDK() {
  if (isPiSDKInitialized) return true;
  if (!window.Pi) return false;
  try {
    await window.Pi.init({ version: "2.0", sandbox: true });
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
    throw new Error("Pi SDK belum siap. Pastikan dApp dibuka di dalam Pi Browser.");
  }

  const auth = await window.Pi.authenticate(["username", "payments"], (payment) => {
    console.warn("Incomplete payment found:", payment);
  });

  if (!auth || !auth.accessToken) {
    throw new Error("Gagal memperoleh otentikasi dari Pi SDK.");
  }

  // 🌐 KIRIM ACCESS TOKEN KE PI APP STUDIO PARENT WINDOW (MENGATASI "We didn't detect a verified sign-in")
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({
        type: "pi_access_token",
        accessToken: auth.accessToken,
        token: auth.accessToken,
        user: auth.user
      }, "*");
    } catch (e) {
      console.warn("Failed to post message to parent window:", e);
    }
  }

  const verifiedUser = {
    username: auth.user.username,
    uid: auth.user.uid,
    accessToken: auth.accessToken,
    demo: false
  };

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
      if (user && user.username && !user.demo) {
        renderUser(user);
        setConnection(user.demo ? "● Mode Demo" : "● Verified by Pi SDK", true);

        // Jika tersimpan, teruskan token ke App Studio parent window jika berjalan di iframe preview
        if (user.accessToken && window.parent && window.parent !== window) {
          try {
            window.parent.postMessage({
              type: "pi_access_token",
              accessToken: user.accessToken,
              token: user.accessToken,
              user: { username: user.username, uid: user.uid }
            }, "*");
          } catch (e) {
            console.warn("Failed to post saved session token to parent window:", e);
          }
        }
      }
    } catch (e) {
      console.warn("Gagal membaca saved session:", e);
    }
  }
}

async function saveVoterToSupabase(voterData) {
  if (!supabaseClient) return false;
  try {
    const cleanUsername = String(voterData.username || "").trim();
    if (!cleanUsername) return false;

    // 1. Cek apakah akun ini sudah memiliki data terkunci di Supabase
    const { data: existingOwn } = await supabaseClient
      .from('voters')
      .select('username, wallet_address, garuda_id, garuda_hash, category')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingOwn) {
      if (
        existingOwn.garuda_id &&
        voterData.garuda_id &&
        Number(existingOwn.garuda_id) !== Number(voterData.garuda_id)
      ) {
        alert(`⛔ DATA TERKUNCI (1 AKUN = 1 DATA)!\n\nAkun @${cleanUsername} sudah terikat pada Garuda ID #${existingOwn.garuda_id} dan tidak dapat diubah ke #${voterData.garuda_id}.`);
        return false;
      }
      if (
        existingOwn.wallet_address &&
        voterData.wallet_address &&
        existingOwn.wallet_address.trim().toLowerCase() !== voterData.wallet_address.trim().toLowerCase()
      ) {
        alert(`⛔ WALLET TERKUNCI (1 AKUN = 1 DATA)!\n\nAkun @${cleanUsername} sudah terikat pada Pi Wallet yang terdaftar sebelumnya.`);
        return false;
      }
    }

    // 2. Cegah Garuda ID dipakai username lain (hash boleh sama antar ID #1-#1000)
    if (voterData.garuda_id) {
      const { data: ownerByGaruda } = await supabaseClient
        .from('voters')
        .select('username, garuda_id')
        .eq('garuda_id', voterData.garuda_id)
        .neq('username', cleanUsername)
        .maybeSingle();

      if (ownerByGaruda) {
        alert(`⛔ REGISTRASI DITOLAK!\n\nGaruda ID #${voterData.garuda_id} sudah terikat pada akun @${ownerByGaruda.username}.`);
        return false;
      }
    }

    // 3. Cegah Wallet dipakai username lain
    if (voterData.wallet_address) {
      const { data: ownerByWallet } = await supabaseClient
        .from('voters')
        .select('username, wallet_address')
        .eq('wallet_address', voterData.wallet_address)
        .neq('username', cleanUsername)
        .maybeSingle();

      if (ownerByWallet) {
        alert(`⛔ REGISTRASI DITOLAK!\n\nAlamat Pi Wallet ini sudah terikat pada akun @${ownerByWallet.username}.`);
        return false;
      }
    }

    const { error } = await supabaseClient
      .from('voters')
      .upsert([voterData], { onConflict: 'username' });

    if (error) {
      if (error.code === '23505') {
        alert("⛔ REGISTRASI DITOLAK!\n\nUsername, Garuda ID, atau Pi Wallet sudah terdaftar di sistem.");
        return false;
      }
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
  if (!supabaseClient) {
    return { ok: false, message: "Supabase Client belum terhubung." };
  }
  try {
    const { error } = await supabaseClient.from('votes').insert([voteData]);
    if (error) {
      console.error("Supabase Vote Error:", error);
      return { ok: false, message: error.message || "Gagal insert ke tabel votes." };
    }
    return { ok: true };
  } catch (err) {
    console.error("Supabase Vote Error:", err);
    return { ok: false, message: err.message || "Terjadi kesalahan jaringan saat menyimpan suara." };
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
      // Voter baru: kosongkan field agar wajib mengisi datanya sendiri dengan benar
      activeUser.username = username;
      activeUser.walletAddress = "";
      activeUser.garudaId = null;
      activeUser.garudaHash = null;
      activeUser.ownerUsername = null;
      activeUser.delegatedNftType = null;
      activeUser.delegatedHashes = [];

      if ($("#walletAddress")) $("#walletAddress").value = "";
      if ($("#garudaId")) $("#garudaId").value = "";
      if ($("#garudaHash")) $("#garudaHash").value = "";
      if ($("#ownerUsername")) $("#ownerUsername").value = "";
      if ($("#delegatorHashes")) $("#delegatorHashes").value = "";

      const displayGaruda = $("#displayGaruda");
      if (displayGaruda) displayGaruda.textContent = "BELUM TERDAFTAR";
      return;
    }

    activeUser.username = data.username;
    activeUser.walletAddress = data.wallet_address || "";
    activeUser.category = data.category || "owner";
    activeUser.role = data.role || "Member";
    activeUser.chapter = data.chapter || "GLOBAL";
    activeUser.garudaId = data.garuda_id;
    activeUser.garudaHash = data.garuda_hash;
    activeUser.ownerUsername = data.owner_username;
    activeUser.delegatedNftType = data.delegated_nft_type;
    activeUser.delegatedHashes = data.delegated_hashes || [];

    if ($("#walletAddress")) $("#walletAddress").value = data.wallet_address || "";
    if ($("#voterCategory")) {
      $("#voterCategory").value = data.category === 'owner' ? 'owner' : 'delegator';
      toggleCategoryFields();
    }
    if ($("#communityChapter")) $("#communityChapter").value = data.chapter || "GLOBAL";
    if ($("#userRole")) $("#userRole").value = data.role || "Member";
    if ($("#garudaId")) $("#garudaId").value = data.garuda_id || "";
    if ($("#garudaHash")) $("#garudaHash").value = data.garuda_hash || "";

    const displayGaruda = $("#displayGaruda");
    if (displayGaruda) {
      displayGaruda.textContent = data.garuda_id ? `#${data.garuda_id}` : `DELEGATE (${(data.category || 'owner').toUpperCase()})`;
    }

    await checkGarudaBlacklistStatus(data.garuda_id, username);
    syncRestrictedDropdownOptions();
  } catch (err) {
    console.error("Fetch Profile Error:", err);
  }
}

// 🚫 PENGAMBILAN DAFTAR FROZEN DI CLIENT UNTUK FILTER LAPORAN
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
  if (!supabaseClient || !activeProposal || !activeProposal.id) {
    if (display) display.textContent = "0 Voter Aktif";
    return;
  }

  if (display) {
    display.textContent = "⏳ Memuat statistik voter...";
  }

  try {
    let voteRows = null;
    let error = null;

    const resWithOrder = await supabaseClient
      .from('votes')
      .select('*')
      .eq('proposal_id', activeProposal.id)
      .order('created_at', { ascending: true });

    if (resWithOrder.error) {
      // Fallback jika kolom created_at belum ada / berbeda
      const resFallback = await supabaseClient
        .from('votes')
        .select('*')
        .eq('proposal_id', activeProposal.id);
      voteRows = resFallback.data;
      error = resFallback.error;
    } else {
      voteRows = resWithOrder.data;
      error = resWithOrder.error;
    }

    const { data: voterProfiles } = await supabaseClient
      .from('voters')
      .select('*');

    const profileMap = {};
    if (voterProfiles) {
      voterProfiles.forEach(p => {
        if (p.username) profileMap[p.username.toLowerCase()] = p;
      });
    }

    const frozenIdSet = new Set(
      (await getFrozenListClient()).map(id => String(id).trim())
    );
    const frozenUsernameSet = new Set();

    try {
      const { data: blacklistRows } = await supabaseClient
        .from('garuda_blacklist')
        .select('garuda_id, username');

      if (blacklistRows) {
        blacklistRows.forEach(b => {
          if (b.garuda_id !== null && b.garuda_id !== undefined) {
            frozenIdSet.add(String(b.garuda_id).trim());
          }
          if (b.username) {
            frozenUsernameSet.add(String(b.username).trim().toLowerCase());
          }
        });
      }
    } catch (blErr) {
      console.warn("Warning membaca garuda_blacklist:", blErr);
    }

    if (error || !voteRows) {
      console.warn("Fetch voter stats error:", error);
      if (display) display.textContent = "0 Voter Aktif";
      activeProposal.totalVotes = 0;
      activeProposal.netScore = 0;
      activeProposal.agreeCount = 0;
      activeProposal.neutralCount = 0;
      activeProposal.disagreeCount = 0;
      activeProposal.agreeScore = 0;
      activeProposal.neutralScore = 0;
      activeProposal.disagreeScore = 0;
      activeProposal.agreeAvgConf = "0.00";
      activeProposal.neutralAvgConf = "0.00";
      activeProposal.disagreeAvgConf = "0.00";
      activeProposal.avgConfidence = "0.00";
      return;
    }

    const seenUsernames = new Set();
    const seenGarudaIds = new Set();

    const validVotes = voteRows.filter(v => {
      const uname = (v.username || "").trim().toLowerCase();
      if (!uname || uname === "anonymous") return false;
      if (frozenUsernameSet.has(uname)) return false;

      const prof = profileMap[uname] || {};
      const garudaIdStr = prof.garuda_id !== null && prof.garuda_id !== undefined
        ? String(prof.garuda_id).trim()
        : "";

      if (garudaIdStr && frozenIdSet.has(garudaIdStr)) return false;
      if (seenUsernames.has(uname)) return false;
      if (garudaIdStr && seenGarudaIds.has(garudaIdStr)) return false;

      seenUsernames.add(uname);
      if (garudaIdStr) seenGarudaIds.add(garudaIdStr);
      return true;
    });

    const count = validVotes.length;
    let totalNetScore = 0;
    let agreeC = 0, neutralC = 0, disagreeC = 0;
    let agreeScore = 0, neutralScore = 0, disagreeScore = 0;
    let agreeConfSum = 0, neutralConfSum = 0, disagreeConfSum = 0;
    let totalConf = 0;

    validVotes.forEach((v) => {
      const score = parseFloat(v.weighted_score) || 0;
      const conf = parseFloat(v.confidence) || 0;
      totalNetScore += score;
      totalConf += conf;

      if (v.vote_direction === 1) {
        agreeC++;
        agreeScore += score;
        agreeConfSum += conf;
      } else if (v.vote_direction === 0) {
        neutralC++;
        neutralScore += score;
        neutralConfSum += conf;
      } else if (v.vote_direction === -1) {
        disagreeC++;
        disagreeScore += score;
        disagreeConfSum += conf;
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
    activeProposal.agreeAvgConf = agreeC > 0 ? (agreeConfSum / agreeC).toFixed(2) : "0.00";
    activeProposal.neutralAvgConf = neutralC > 0 ? (neutralConfSum / neutralC).toFixed(2) : "0.00";
    activeProposal.disagreeAvgConf = disagreeC > 0 ? (disagreeConfSum / disagreeC).toFixed(2) : "0.00";
    activeProposal.avgConfidence = count > 0 ? (totalConf / count).toFixed(2) : "0.00";

    if (display) {
      display.textContent = `${count} Voter Aktif (${totalNetScore >= 0 ? '+' : ''}${totalNetScore.toFixed(1)} Pts) [Frozen & Dupes Excluded]`;
    }
  } catch (err) {
    console.error("Error fetchVoterStatsForAdmin:", err);
    if (display) display.textContent = "0 Voter Aktif";
  }
}

function setWaitingForProposalState() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  votingEndTime = null;
  activeProposal.status = "DRAFT";

  const display = $("#countdownDisplay");
  if (display) {
    display.textContent = "⏳ Menunggu Proposal Diterbitkan";
    display.className = "bg-slate-800 text-amber-300 border border-amber-500/30 text-xs px-3 py-1 rounded-full font-mono font-bold";
  }

  const btn = $("#btnSubmitVote");
  if (btn && !isUserBanned) {
    btn.disabled = true;
    btn.innerText = "⏳ Menunggu Proposal Aktif Diterbitkan Admin";
    btn.className = "w-full bg-slate-800 text-slate-400 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed border border-slate-700";
  }
}

async function fetchActiveProposalFromSupabase() {
  if (!supabaseClient) {
    setWaitingForProposalState();
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('proposals')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      setWaitingForProposalState();
      return;
    }

    const p = data[0];
    const endTimeCandidate = p.voting_end_time ? new Date(p.voting_end_time) : null;

    // Jika tidak ada waktu selesai atau waktunya sudah lewat, kembalikan ke mode menunggu
    if (!endTimeCandidate || Number.isNaN(endTimeCandidate.getTime()) || endTimeCandidate.getTime() <= Date.now()) {
      setWaitingForProposalState();
      return;
    }

    activeProposal = {
      id: p.id,
      title: p.title,
      category: p.category || "Community Voting",
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

    votingEndTime = endTimeCandidate;
    renderProposalMaterials();

    const btn = $("#btnSubmitVote");
    if (btn && !isUserBanned) {
      btn.disabled = false;
      btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
      btn.className = "w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl text-sm transition shadow-lg";
    }

    startCountdownTimer();
    await fetchVoterStatsForAdmin();
  } catch (err) {
    console.error("Fetch Proposal Error:", err);
    setWaitingForProposalState();
  }
}

async function checkAppWalletBalance() {
  const display = $("#appWalletDisplay");
  const addrText = $("#appWalletAddrText");

  if (display) display.textContent = "⏳ Memeriksa Horizon API...";

  try {
    const res = await fetch(`https://api.testnet.minepi.com/accounts/${TVOD_APP_WALLET}`);
    if (!res.ok) throw new Error("Wallet belum aktif / 0 Balance");

    const data = await res.json();
    const nativeBalance = data.balances.find(b => b.asset_type === 'native');
    const balanceVal = nativeBalance ? parseFloat(nativeBalance.balance).toFixed(2) : "0.00";

    if (display) display.textContent = `⚡ ${balanceVal} Testnet Pi`;
    if (addrText) addrText.textContent = `Wallet Kas App: ${TVOD_APP_WALLET.substring(0, 8)}...${TVOD_APP_WALLET.substring(TVOD_APP_WALLET.length - 6)}`;
  } catch (err) {
    if (display) display.textContent = "⚡ 210.00 Testnet Pi";
    if (addrText) addrText.textContent = `Wallet Kas App: ${TVOD_APP_WALLET.substring(0, 8)}...${TVOD_APP_WALLET.substring(TVOD_APP_WALLET.length - 6)}`;
  }
}

async function initialize() {
  setConnection("● Ecosystem Ready", true);

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
        penColor: "rgb(59, 130, 246)"
      });
      signaturePads[id].addEventListener("afterUpdateStroke", () => {
        saveSignatureToStorage(id);
      });
    }
  });

  loadSignaturesFromStorage();

  const voterCatEl = $("#voterCategory");
  if (voterCatEl) voterCatEl.addEventListener("change", toggleCategoryFields);

  const delegatorTypeEl = $("#delegatorNftType");
  if (delegatorTypeEl) delegatorTypeEl.addEventListener("change", updateDelegatorHint);

  const onboardingFormEl = $("#onboardingForm");
  if (onboardingFormEl) onboardingFormEl.addEventListener("submit", handleOnboarding);

  const votingFormEl = $("#votingForm");
  if (votingFormEl) votingFormEl.addEventListener("submit", handleCastVote);

  const fileInputEl = $("#inputPropFileImages");
  if (fileInputEl) fileInputEl.addEventListener("change", handleGalleryImagesSelect);

  const videoFileInputEl = $("#inputPropFileVideo");
  if (videoFileInputEl) {
    videoFileInputEl.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      const statusSpan = $("#videoFileStatus");
      if (!file) {
        if (statusSpan) statusSpan.textContent = "";
        return;
      }
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      if (statusSpan) {
        statusSpan.textContent = `🎬 File dipilih: ${file.name} (${sizeMb} MB)`;
      }
    });
  }

  toggleCategoryFields();
  renderProposalMaterials();
  setWaitingForProposalState();

  await initPiSDK();
  checkSavedSession();

  await fetchActiveProposalFromSupabase();

  const urlParams = new URLSearchParams(window.location.search);
  const requestedDocType = urlParams.get("docType");
  const requestedPropId = urlParams.get("propId");

  if (requestedDocType) {
    if (requestedPropId) {
      activeProposal.id = requestedPropId;
    }
    if (requestedDocType === "minutes") {
      await generateOfficialMinutesPDF();
    } else if (requestedDocType === "audit_log" || requestedDocType === "audit") {
      await generateVoterAuditLogPDF();
    } else if (requestedDocType === "certificate" || requestedDocType === "cert") {
      await generateCertificatePDF();
    }
  }
}

function compressAndResizeImage(file, maxWidth = 1000, quality = 0.8) {
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

  if (countSpan) countSpan.textContent = `⏳ Mengompres ${files.length} foto dari Galeri...`;

  try {
    const promises = Array.from(files).map((file) => compressAndResizeImage(file, 1000, 0.8));
    uploadedGalleryBase64Images = await Promise.all(promises);
    if (countSpan) countSpan.textContent = `📷 ${uploadedGalleryBase64Images.length} foto berhasil dikompresi & siap diterbitkan.`;
  } catch (err) {
    if (countSpan) countSpan.textContent = "❌ Gagal memuat beberapa foto.";
  }
}

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  if (activeProposal.status !== "ACTIVE" || !votingEndTime) {
    setWaitingForProposalState();
    return;
  }

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = votingEndTime.getTime() - now;

    const display = $("#countdownDisplay");
    const btn = $("#btnSubmitVote");

    if (distance <= 0) {
      clearInterval(countdownInterval);
      if (display) {
        display.textContent = "⚠️ VOTING TELAH BERAKHIR";
        display.className = "bg-red-500/10 text-red-500 border border-red-500/30 text-xs px-3 py-1 rounded-full font-mono font-bold animate-pulse";
      }
      if (btn) {
        btn.disabled = true;
        btn.innerText = "⛔ Sesi Voting Ditutup (Waktu Habis)";
        btn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed";
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
  syncRestrictedDropdownOptions();
}

const piLoginBtn = $("#pi-login-button");
if (piLoginBtn) {
  piLoginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
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
  demoLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const demoUser = { username: "afifmasfiqo", demo: true };
    localStorage.setItem("tvod_user_session", JSON.stringify(demoUser));
    renderUser(demoUser);
    alert("Masuk ke Mode Simulasi Demo.");
  });
}

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

async function validateRestrictedGovernanceSelection(username, chapter, role, garudaId) {
  const cleanUser = String(username || "").trim();
  const cleanUserLower = cleanUser.toLowerCase();
  const cleanChapter = String(chapter || "").trim().toUpperCase();
  const cleanRole = String(role || "").trim();
  const numericGarudaId =
    garudaId !== null && garudaId !== undefined && String(garudaId).trim() !== ""
      ? Number(garudaId)
      : null;

  const genericDeniedMessage =
    "⛔ Akses ditolak.\n\nPilihan wilayah atau peran yang dipilih tidak sesuai dengan otoritas akun Anda.";

  // 1. Validasi chapter TVOD
  if (cleanChapter === "TVOD") {
    if (cleanUserLower !== "afifmasfiqo") {
      return { ok: false, message: genericDeniedMessage };
    }
  }

  // 2. Validasi peran Founder
  if (cleanRole === "Founder") {
    if (cleanUserLower !== "nalaktak" || numericGarudaId !== 999) {
      return { ok: false, message: genericDeniedMessage };
    }
  }

  // 3. Validasi chapter FOUNDER RECOMMENDED (Fleksibel Username / Garuda ID)
  if (cleanChapter === "FOUNDER RECOMMENDED") {
    let isAllowedRecommended = false;

    if (supabaseClient) {
      try {
        const { data: recRows, error: recErr } = await supabaseClient
          .from("founder_recommended_voters")
          .select("username, garuda_id, active");

        if (!recErr && Array.isArray(recRows) && recRows.length > 0) {
          isAllowedRecommended = recRows.some((r) => {
            if (r.active === false) return false;
            const matchUser =
              r.username && String(r.username).trim().toLowerCase() === cleanUserLower;
            const matchGaruda =
              numericGarudaId !== null &&
              !Number.isNaN(numericGarudaId) &&
              r.garuda_id !== null &&
              r.garuda_id !== undefined &&
              Number(r.garuda_id) === numericGarudaId;
            return Boolean(matchUser || matchGaruda);
          });
        } else {
          // Fallback ke tabel voters
          if (cleanUser) {
            const { data: byUser } = await supabaseClient
              .from("voters")
              .select("username, garuda_id, founder_recommended, is_founder_recommended")
              .eq("username", cleanUser)
              .maybeSingle();

            if (
              byUser &&
              (byUser.founder_recommended === true || byUser.is_founder_recommended === true)
            ) {
              isAllowedRecommended = true;
            }
          }

          if (!isAllowedRecommended && numericGarudaId !== null && !Number.isNaN(numericGarudaId)) {
            const { data: byGaruda } = await supabaseClient
              .from("voters")
              .select("username, garuda_id, founder_recommended, is_founder_recommended")
              .eq("garuda_id", numericGarudaId)
              .maybeSingle();

            if (
              byGaruda &&
              (byGaruda.founder_recommended === true || byGaruda.is_founder_recommended === true)
            ) {
              isAllowedRecommended = true;
            }
          }
        }
      } catch (err) {
        console.warn("Gagal memverifikasi status otorisasi chapter:", err);
      }
    }

    if (!isAllowedRecommended) {
      return { ok: false, message: genericDeniedMessage };
    }
  }

  return { ok: true };
}

async function handleOnboarding(e) {
  e.preventDefault();

  const username = currentUser && currentUser.username ? currentUser.username.trim() : "";
  if (!username || currentUser.demo) {
    alert("⚠️ Silakan login resmi via Pi SDK terlebih dahulu.");
    return;
  }

  const category = $("#voterCategory") ? $("#voterCategory").value.trim() : "";
  const role = $("#userRole") ? $("#userRole").value.trim() : "";
  const wallet = $("#walletAddress") ? $("#walletAddress").value.trim() : "";
  const chapter = $("#communityChapter") ? $("#communityChapter").value.trim() : "";

  if (!category || !role || !chapter || !wallet) {
    alert("⚠️ LENGKAPI SEMUA DATA!\n\nPastikan Pi Wallet, Kategori Pemilih, Wilayah (Chapter), dan Peran (Role) terisi lengkap sebelum mendaftar.");
    return;
  }

  if (!isValidPiWalletAddress(wallet)) {
    alert("⛔ ALAMAT WALLET TIDAK VALID!\n\nPastikan Anda memasukkan Public Key Alamat Wallet Pi yang sah (Pi Browser, PiPet, atau PiBox).\n\nCiri wallet sah:\n- Diawali huruf kapital 'G' atau 'M'\n- Memiliki panjang tepat 56 karakter");
    return;
  }

  let gId = null;
  let gHash = null;

  if (category === "owner") {
    gId = parseInt($("#garudaId").value || "0");
    gHash = $("#garudaHash").value.trim();

    if (!gId || gId < 1 || gId > 1000) {
      alert("Pendaftaran Ditolak: Garuda ID tidak valid.");
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

  const banned = await checkGarudaBlacklistStatus(gId, username);
  if (banned) {
    alert("Access denied: Your Garuda ID is temporarily frozen by Founder's directive. Voting and login are restricted.");
    return;
  }

  activeUser.username = username;
  activeUser.walletAddress = wallet;
  activeUser.category = category;
  activeUser.role = role;
  activeUser.chapter = chapter;

  const displayGaruda = $("#displayGaruda");
  if (displayGaruda) {
    displayGaruda.textContent = activeUser.garudaId ? `#${activeUser.garudaId}` : `DELEGATE (${category.toUpperCase()})`;
  }

  const savedSuccess = await saveVoterToSupabase({
    username: username,
    wallet_address: wallet,
    category: category,
    chapter: chapter,
    role: role,
    garuda_id: activeUser.garudaId,
    garuda_hash: activeUser.garudaHash,
    owner_username: activeUser.ownerUsername,
    delegated_nft_type: activeUser.delegatedNftType,
    delegated_hashes: activeUser.delegatedHashes
  });

  if (savedSuccess) {
    checkAppWalletBalance();
    alert(`✅ Registrasi & Binding Wallet Berhasil!\n\nUsername: @${username}\nWallet: ${wallet.substring(0, 8)}...${wallet.substring(48)}\nStatus: ${category.toUpperCase()}\nRole: ${role}\nWilayah: ${chapter}`);
  }
}

function renderProposalMaterials() {
  if ($("#displayPropTitle")) $("#displayPropTitle").textContent = activeProposal.title;
  if ($("#displayPropCategory")) $("#displayPropCategory").textContent = "🏷️ Category: " + activeProposal.category;
  if ($("#displayPropDescription")) $("#displayPropDescription").textContent = activeProposal.description;
  if ($("#displayPropAuthor")) $("#displayPropAuthor").textContent = activeProposal.author;
  if ($("#displayPropDate")) $("#displayPropDate").textContent = activeProposal.date;

  const galleryContainer = $("#mediaGalleryContainer");
  if (galleryContainer && activeProposal.images) {
    galleryContainer.innerHTML = activeProposal.images.map((imgUrl, idx) => `
      <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-center shadow-lg">
        <span class="text-xs sm:text-sm font-semibold text-amber-400 block mb-2">Bukti Foto #${idx + 1}:</span>
        <img src="${imgUrl}" alt="Bukti Foto #${idx + 1}" class="w-full h-auto max-h-[650px] object-contain rounded-xl border border-slate-800 bg-slate-900/60 shadow">
      </div>
    `).join("");
  }

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
        videoElem.load();
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

async function compressVideoIfSupported(file, onProgressText) {
  if (!file || file.size <= 6 * 1024 * 1024) {
    return file;
  }

  if (typeof MediaRecorder === "undefined" || typeof document === "undefined") {
    return file;
  }

  const candidateTypes = [
    "video/mp4;codecs=avc1,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm"
  ];

  const supportedMime = candidateTypes.find((t) => {
    try {
      return typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(t);
    } catch (_) {
      return false;
    }
  });

  if (!supportedMime) {
    return file;
  }

  return new Promise((resolve) => {
    let objectUrl = "";
    let settled = false;

    const finish = (resultFile) => {
      if (settled) return;
      settled = true;
      try {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      } catch (_) {}
      resolve(resultFile || file);
    };

    try {
      objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.crossOrigin = "anonymous";

      const safetyTimer = setTimeout(() => {
        finish(file);
      }, 25000);

      video.addEventListener("loadedmetadata", () => {
        try {
          const srcW = video.videoWidth || 720;
          const srcH = video.videoHeight || 1280;
          const maxDim = 720;
          let targetW = srcW;
          let targetH = srcH;

          if (srcW > maxDim || srcH > maxDim) {
            if (srcW >= srcH) {
              targetW = maxDim;
              targetH = Math.max(2, Math.round((srcH / srcW) * maxDim));
            } else {
              targetH = maxDim;
              targetW = Math.max(2, Math.round((srcW / srcH) * maxDim));
            }
          }
          targetW = targetW % 2 === 0 ? targetW : targetW - 1;
          targetH = targetH % 2 === 0 ? targetH : targetH - 1;

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");

          if (!ctx || typeof canvas.captureStream !== "function") {
            clearTimeout(safetyTimer);
            finish(file);
            return;
          }

          const stream = canvas.captureStream(24);

          try {
            const captureAudio = video.captureStream || video.mozCaptureStream;
            if (typeof captureAudio === "function") {
              const mediaStream = captureAudio.call(video);
              const audioTracks = mediaStream && mediaStream.getAudioTracks ? mediaStream.getAudioTracks() : [];
              audioTracks.forEach((track) => stream.addTrack(track));
            }
          } catch (_) {}

          const chunks = [];
          const recorder = new MediaRecorder(stream, {
            mimeType: supportedMime,
            videoBitsPerSecond: 1200000
          });

          recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) {
              chunks.push(ev.data);
            }
          };

          recorder.onstop = () => {
            clearTimeout(safetyTimer);
            if (!chunks.length) {
              finish(file);
              return;
            }
            const blobType = supportedMime.split(";")[0] || "video/webm";
            const compressedBlob = new Blob(chunks, { type: blobType });

            if (compressedBlob.size > 0 && compressedBlob.size < file.size * 0.92) {
              const ext = blobType.includes("mp4") ? "mp4" : "webm";
              const baseName = file.name.replace(/\.[^/.]+$/, "") || "video";
              const compressedFile = new File([compressedBlob], `${baseName}_compressed.${ext}`, {
                type: blobType,
                lastModified: Date.now()
              });
              finish(compressedFile);
            } else {
              finish(file);
            }
          };

          recorder.onerror = () => {
            clearTimeout(safetyTimer);
            finish(file);
          };

          let rafId = null;
          const drawFrame = () => {
            if (video.paused || video.ended) {
              if (recorder.state === "recording") {
                try { recorder.stop(); } catch (_) {}
              }
              return;
            }
            try {
              ctx.drawImage(video, 0, 0, targetW, targetH);
            } catch (_) {}
            rafId = requestAnimationFrame(drawFrame);
          };

          video.onplay = () => {
            if (typeof onProgressText === "function") {
              onProgressText("🎚️ Mengompres video agar upload lebih cepat...");
            }
            drawFrame();
          };

          video.onended = () => {
            if (rafId) cancelAnimationFrame(rafId);
            if (recorder.state === "recording") {
              try { recorder.stop(); } catch (_) {}
            }
          };

          recorder.start(250);
          video.play().catch(() => {
            clearTimeout(safetyTimer);
            finish(file);
          });
        } catch (_) {
          clearTimeout(safetyTimer);
          finish(file);
        }
      }, { once: true });

      video.addEventListener("error", () => {
        clearTimeout(safetyTimer);
        finish(file);
      }, { once: true });
    } catch (_) {
      finish(file);
    }
  });
}

async function uploadProposalVideoToStorage(fallbackYoutubeUrl = "") {
  const videoInput = $("#inputPropFileVideo");
  const rawFile = videoInput && videoInput.files ? videoInput.files[0] : null;
  const statusSpan = $("#videoFileStatus");

  if (!rawFile) {
    return fallbackYoutubeUrl ? ensureHttps(fallbackYoutubeUrl) : "";
  }

  if (!supabaseClient) {
    throw new Error("Supabase Client belum terhubung untuk upload video.");
  }

  const origSizeMb = (rawFile.size / (1024 * 1024)).toFixed(2);
  if (statusSpan) {
    statusSpan.textContent = `⏳ Memproses video (${origSizeMb} MB)...`;
  }

  const fileToUpload = await compressVideoIfSupported(rawFile, (msg) => {
    if (statusSpan) statusSpan.textContent = msg;
  });

  const maxBytes = 20 * 1024 * 1024;
  if (fileToUpload.size > maxBytes) {
    throw new Error("Ukuran video masih melebihi 20 MB setelah proses. Silakan pilih video yang lebih pendek.");
  }

  const finalSizeMb = (fileToUpload.size / (1024 * 1024)).toFixed(2);
  if (statusSpan) {
    statusSpan.textContent = `⏳ Mengunggah video (${finalSizeMb} MB) ke Supabase Storage...`;
  }

  const rawExt = (fileToUpload.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const ext = rawExt || "mp4";
  const cleanBaseName = fileToUpload.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 35) || "video";
  const storagePath = `proposal-videos/${Date.now()}_${cleanBaseName}.${ext}`;
  const mimeType = fileToUpload.type && fileToUpload.type.startsWith("video/")
    ? fileToUpload.type
    : (ext === "webm" ? "video/webm" : ext === "mov" ? "video/quicktime" : "video/mp4");

  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      if (attempt > 1 && statusSpan) {
        statusSpan.textContent = `⏳ Mencoba ulang upload video (${finalSizeMb} MB)...`;
      }

      const { error: uploadError } = await supabaseClient.storage
        .from("proposal-media")
        .upload(storagePath, fileToUpload, {
          contentType: mimeType,
          upsert: false
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Upload Storage ditolak");
      }

      const { data: pubData } = supabaseClient.storage
        .from("proposal-media")
        .getPublicUrl(storagePath);

      const publicVideoUrl = pubData && pubData.publicUrl ? pubData.publicUrl : "";
      if (!publicVideoUrl) {
        throw new Error("URL publik video tidak berhasil dibuat.");
      }

      if (statusSpan) {
        statusSpan.textContent = `✅ Video (${finalSizeMb} MB) berhasil diunggah ke Storage.`;
      }
      return publicVideoUrl;
    } catch (err) {
      lastErr = err;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }
  }

  if (statusSpan) {
    statusSpan.textContent = "❌ Gagal upload video.";
  }

  const detailMsg = lastErr && lastErr.message ? lastErr.message : "Failed to fetch";
  throw new Error(`Gagal upload video ke Storage (${detailMsg}). Pastikan koneksi stabil dan bucket 'proposal-media' sudah Public.`);
}

async function publishNewProposal(e) {
  if (e && e.preventDefault) e.preventDefault();

  const title = $("#inputPropTitle") ? $("#inputPropTitle").value.trim() : "";
  const category = $("#inputPropCategory") ? $("#inputPropCategory").value : "Community Voting";
  const durationInput = $("#inputPropDuration");
  const durationHrs = durationInput ? parseFloat(durationInput.value) || 24 : 24;
  const description = $("#inputPropDesc") ? $("#inputPropDesc").value.trim() : "";

  if (!title) {
    alert("⚠️ Judul Proposal wajib diisi!");
    return;
  }
  if (!description) {
    alert("⚠️ Deskripsi Proposal wajib diisi!");
    return;
  }

  activeProposal.id = "TVOD-PROP-" + Date.now();
  activeProposal.title = title;
  activeProposal.category = category;
  activeProposal.description = description;
  activeProposal.durationHours = durationHrs;
  activeProposal.proposerEntity = "TVOD Development Team";
  activeProposal.proposerUsername = "TVOD Development Team";
  activeProposal.author = "TVOD Development Team";
  activeProposal.date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  activeProposal.status = "ACTIVE";

  votingEndTime = new Date(Date.now() + durationHrs * 60 * 60 * 1000);

  const btnSubmit = $("#btnSubmitVote");
  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
    btnSubmit.className = "w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl text-sm transition shadow-lg";
  }
  startCountdownTimer();

  let combinedImages = [];
  if (uploadedGalleryBase64Images && uploadedGalleryBase64Images.length > 0) {
    combinedImages = combinedImages.concat(uploadedGalleryBase64Images);
  }

  const rawImages = $("#inputPropImages") ? $("#inputPropImages").value.trim() : "";
  if (rawImages) {
    const extList = rawImages.split(",").map(img => ensureHttps(img.trim())).filter(img => img.length > 0);
    combinedImages = combinedImages.concat(extList);
  }

  activeProposal.images = combinedImages.length > 0 ? combinedImages : ["https://via.placeholder.com/600x350/0f172a/f59e0b?text=Bukti+Foto+Utama+Objek+Voting"];

 const rawVideo = $("#inputPropVideo") ? $("#inputPropVideo").value.trim() : "";
  try {
    activeProposal.videoUrl = await uploadProposalVideoToStorage(rawVideo);
  } catch (vidErr) {
    alert(`⚠️ ${vidErr.message}`);
    return;
  }

  renderProposalMaterials();
  await fetchVoterStatsForAdmin();

  if (supabaseClient) {
    try {
      await supabaseClient.from('proposals').upsert([{
        id: activeProposal.id,
        title: activeProposal.title,
        category: activeProposal.category,
        description: activeProposal.description,
        proposer_entity: "TVOD Development Team",
        proposer_username: "TVOD Development Team",
        duration_hours: activeProposal.durationHours,
        voting_end_time: votingEndTime.toISOString(),
        images: activeProposal.images,
        video_url: activeProposal.videoUrl,
        status: 'ACTIVE'
      }], { onConflict: 'id' });
    } catch (err) {
      console.error("Supabase Proposal Insert Error:", err);
    }
  }

  alert(`✅ Proposal Baru (ID: ${activeProposal.id}) Berhasil Diterbitkan oleh TVOD Development Team!\nKategori: ${category}\nDurasi Voting: ${durationHrs} Jam.`);
}

async function cancelActiveProposal() {
  if (!confirm(`Apakah Anda yakin ingin membatalkan/menutup proposal "${activeProposal.title}" secara paksa?`)) {
    return;
  }

  if (countdownInterval) clearInterval(countdownInterval);
  votingEndTime = new Date(0);

  activeProposal.status = 'CANCELLED';

  const display = $("#countdownDisplay");
  if (display) {
    display.textContent = "⚠️ PROPOSAL DIBATALKAN / DITUTUP";
    display.className = "bg-red-500/10 text-red-500 border border-red-500/30 text-xs px-3 py-1 rounded-full font-mono font-bold animate-pulse";
  }

  const btn = $("#btnSubmitVote");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "⛔ Proposal Dibatalkan / Ditutup Admin";
    btn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed";
  }

  if (supabaseClient && activeProposal.id) {
    try {
      await supabaseClient.from('proposals').update({ status: 'CANCELLED' }).eq('id', activeProposal.id);
    } catch (err) {
      console.error("Supabase Cancel Proposal Error:", err);
    }
  }

  alert(`⛔ Proposal (${activeProposal.id}) telah berhasil dibatalkan dan masa voting ditutup.`);
}

async function verifyOnChainNftOwnership() {
  if (activeUser.category === "owner") {
    return !!(activeUser.walletAddress && (activeUser.garudaHash || activeUser.garudaId));
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

function showPayoutBanner(message, isSuccess = true) {
  const banner = $("#voteStatusBanner");
  if (!banner) return;
  banner.classList.remove("hidden", "bg-emerald-500/20", "text-emerald-300", "border-emerald-500/40", "bg-amber-500/20", "text-amber-300", "border-amber-500/40");
  if (isSuccess) {
    banner.classList.add("bg-emerald-500/20", "text-emerald-300", "border", "border-emerald-500/40");
  } else {
    banner.classList.add("bg-amber-500/20", "text-amber-300", "border", "border-amber-500/40");
  }
  banner.innerHTML = message;
}

async function handleCastVote(e) {
  if (e && e.preventDefault) e.preventDefault();

  const btn = $("#btnSubmitVote");
  const defaultBtnText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";

  // Helper untuk reset status tombol jika terjadi pembatalan/error
  const resetVoteButton = (text = defaultBtnText, enabled = true) => {
    if (!btn) return;
    btn.disabled = !enabled;
    btn.innerText = text;
    if (enabled) {
      btn.className = "w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 rounded-xl text-sm transition shadow-lg";
    }
  };

  if (btn && btn.disabled) return;
  resetVoteButton("⏳ Memeriksa Hak Suara & Status Etika...", false);

  try {
    const currentUsername = (activeUser.username || (currentUser && currentUser.username) || "").trim();
    const currentWallet = (activeUser.walletAddress || "").trim();

    if (!currentUsername) {
      resetVoteButton(defaultBtnText, true);
      alert("⚠️ Silakan login terlebih dahulu sebelum memberikan suara.");
      return;
    }

    let effectiveGarudaId = activeUser.garudaId;
    if (supabaseClient && !effectiveGarudaId) {
      try {
        const { data: profRow } = await supabaseClient
          .from("voters")
          .select("garuda_id")
          .eq("username", currentUsername)
          .maybeSingle();
        if (profRow && profRow.garuda_id) {
          effectiveGarudaId = profRow.garuda_id;
          activeUser.garudaId = profRow.garuda_id;
        }
      } catch (err) {
        console.warn("Gagal mengambil garuda_id profil saat cek blokir:", err);
      }
    }

    let effectiveRole = activeUser.role || "Member";
    // Proteksi: Jika bukan akun Founder sah (@nalaktak #999), otomatis turunkan ke Member
    if (
      effectiveRole === "Founder" &&
      (String(currentUsername).trim().toLowerCase() !== "nalaktak" || Number(effectiveGarudaId) !== 999)
    ) {
      effectiveRole = "Member";
    }

    const effectiveChapter = activeUser.chapter || "GLOBAL";

    // Validasi tata kelola restricted (Menggunakan effectiveChapter & effectiveRole)
    const governanceCheck = await validateRestrictedGovernanceSelection(
      currentUsername,
      effectiveChapter,
      effectiveRole,
      effectiveGarudaId
    );
    if (!governanceCheck.ok) {
      resetVoteButton(defaultBtnText, true);
      alert(governanceCheck.message);
      return;
    }

    // Cek pembekuan akun (Blacklist)
    const isBannedBanner = await checkGarudaBlacklistStatus(effectiveGarudaId, currentUsername);
    const isBlockedInList = await isVoterBlockedForVoting(effectiveGarudaId, currentUsername);

    if (isBannedBanner || isBlockedInList || isUserBanned) {
      if (btn) {
        btn.disabled = true;
        btn.innerText = "⛔ ID / Akun Terblokir — Tidak Bisa Voting";
        btn.className = "w-full bg-red-950 text-red-400 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed border border-red-700";
      }
      alert("⛔ VOTING DITOLAK!\n\nGaruda ID atau akun Anda tercatat terblokir (frozen/blacklist) sehingga tidak diizinkan ikut voting.");
      return;
    }

    // Cek status proposal aktif
    if (activeProposal.status !== 'ACTIVE' || !votingEndTime || new Date().getTime() > votingEndTime.getTime()) {
      if (btn) {
        btn.disabled = true;
        btn.innerText = "⛔ Sesi Voting Ditutup (Waktu Habis / Dibatalkan)";
        btn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed";
      }
      alert("⛔ PROSES VOTING DITOLAK!\n\nSesi waktu voting untuk proposal ini telah berakhir atau dibatalkan admin.");
      return;
    }

    // Validasi alamat wallet
    if (!currentWallet || !isValidPiWalletAddress(currentWallet)) {
      resetVoteButton(defaultBtnText, true);
      alert("⚠️ Alamat Wallet belum diisi atau tidak valid! Silakan daftarkan wallet Anda pada form Verifikasi Voter terlebih dahulu.");
      return;
    }

    // Cek apakah suara ganda (Double voting prevention)
    if (supabaseClient && currentUsername !== "Anonymous") {
      const { data: existingVotes } = await supabaseClient
        .from('votes')
        .select('id')
        .eq('proposal_id', activeProposal.id)
        .eq('username', currentUsername)
        .limit(1);

      if (existingVotes && existingVotes.length > 0) {
        if (btn) {
          btn.disabled = true;
          btn.innerText = "✅ Anda Sudah Mengirim Suara";
          btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-3.5 rounded-xl text-sm border border-amber-500/30 cursor-not-allowed";
        }
        showPayoutBanner(`ℹ️ Suara Anda (@${currentUsername}) telah terdaftar sebelumnya.`, true);
        return;
      }
    }

    if (btn) btn.innerText = "Memeriksa Validitas Identitas Voter...";
    const isNftValid = await verifyOnChainNftOwnership();
    if (!isNftValid) {
      resetVoteButton(defaultBtnText, true);
      alert("⛔ AKSES VOTING DITOLAK!\n\nPersyaratan NFT / Identitas tidak lengkap pada profil Anda.");
      return;
    }

    const selectedValue = document.querySelector('input[name="voteValue"]:checked');
    if (!selectedValue) {
      resetVoteButton(defaultBtnText, true);
      alert("Pilih arah suara Anda (Agree / Neutral / Disagree).");
      return;
    }

    const voteVal = parseInt(selectedValue.value, 10);

    let roleWeight = 0.5;
    if (effectiveRole === "Group Leader") roleWeight = 1.0;
    if (effectiveRole === "Founder") roleWeight = 2.0;

    const individualScore = voteVal * currentConfidence * roleWeight;
    const timestamp = new Date().toISOString();
    const rawPayload = `${currentUsername}|${currentWallet}|${voteVal}|${currentConfidence}|${roleWeight}|${timestamp}`;

    let voteHash = "HASH_GENERATED";
    if (window.CryptoJS) {
      voteHash = window.CryptoJS.SHA256(rawPayload).toString();
    }

    const activeSig = getSignatureDataUrl("sig-chairman");

    if (btn) btn.innerText = "Menyimpan Suara Terenkripsi...";
    
    // Simpan suara ke Supabase & tunggu konfirmasinya
    const saveResult = await saveVoteToSupabase({
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

    if (!saveResult || !saveResult.ok) {
      resetVoteButton(defaultBtnText, true);
      alert(`⚠️ Gagal menyimpan suara ke Database: ${saveResult ? saveResult.message : "Unknown error"}`);
      return;
    }

    // Refresh statistik voter di Admin Suite
    await fetchVoterStatsForAdmin();

    const payoutRateEl = $("#payoutRate");
    const baseReward = payoutRateEl ? parseFloat(payoutRateEl.value) || 1.0 : 1.0;

    if (btn) btn.innerText = "Memproses Insentif Pi On-Chain...";

    // Eksekusi Payout Otomatis
    try {
      const payoutRes = await fetch('/api/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: currentWallet,
          amount: baseReward,
          username: currentUsername,
          proposalId: activeProposal.id,
          category: activeUser.category,
          ownerUsername: activeUser.ownerUsername
        })
      });

      const payoutData = await payoutRes.json();

      if (payoutRes.ok && payoutData.success) {
        showPayoutBanner(`🎉 SUARA & PAYOUT SUCCESS!<br><strong>Tx Hash:</strong> <span class="font-mono text-xs">${escapeHtml(payoutData.txHash || "")}</span><br>${escapeHtml(payoutData.message || "")}`, true);
      } else {
        showPayoutBanner(`⚠️ Suara Berhasil Disimpan di Database.<br><strong>Status Payout:</strong> ${escapeHtml(payoutData.message || 'Dipending di Antrean')}`, false);
      }
    } catch (payErr) {
      console.error("Gagal klaim payout:", payErr);
      showPayoutBanner(`✅ Suara berhasil disimpan ke Database, namun koneksi payout ke serverless mengalami waktu tunggu.`, false);
    }

    // Kunci tombol voting jika sudah sukses
    if (btn) {
      btn.disabled = true;
      btn.innerText = "✅ Anda Sudah Mengirim Suara";
      btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-3.5 rounded-xl text-sm border border-amber-500/30 cursor-not-allowed";
    }
  } catch (err) {
    console.error("Error saat kirim suara:", err);
    resetVoteButton(defaultBtnText, true);
    alert(`⚠️ Terjadi kesalahan saat memproses suara: ${err.message || err}`);
  }
}

// 🚫 MODUL PEMBEKUAN (BLACK-LISTING) ID GARUDA / USERNAME OLEH ADMIN
async function toggleGarudaBan(isBan) {
  const garudaIdInput = $("#targetGarudaId") ? $("#targetGarudaId").value.trim() : "";
  const reasonInput = $("#targetBanReason") ? $("#targetBanReason").value.trim() : "";

  if (!garudaIdInput) {
    alert("⚠️ Masukkan Garuda ID target.");
    return;
  }

  const garudaIdNum = parseInt(garudaIdInput);
  if (isNaN(garudaIdNum) || garudaIdNum < 1 || garudaIdNum > 1000) {
    alert("⚠️ Nomor Garuda ID tidak valid.");
    return;
  }

  if (isBan && !reasonInput) {
    alert("⚠️ Harap masukkan Alasan Pembekuan / Pelanggaran Kode Etik.");
    return;
  }

  if (!supabaseClient) {
    alert("❌ Supabase Client belum terhubung.");
    return;
  }

  try {
    if (isBan) {
      // Simpan langsung ke tabel Supabase garuda_blacklist (aman tanpa error cache schema)
      const { error } = await supabaseClient.from('garuda_blacklist').upsert([{
        garuda_id: garudaIdNum,
        reason: reasonInput,
        created_at: new Date().toISOString()
      }], { onConflict: 'garuda_id' });

      if (error) throw error;
      alert(`✅ Sukses: Garuda ID #${garudaIdNum} berhasil dibekukan & disimpan ke Supabase.`);
    } else {
      // Hapus dari tabel Supabase garuda_blacklist (Unfreeze)
      const { error } = await supabaseClient.from('garuda_blacklist').delete().eq('garuda_id', garudaIdNum);

      if (error) throw error;
      alert(`✅ Sukses: Pembekuan Garuda ID #${garudaIdNum} berhasil dicabut.`);
    }

    location.reload();
  } catch (err) {
    console.error("Detail Error Supabase:", err);
    alert("❌ Gagal menyimpan ke Supabase: " + (err.message || JSON.stringify(err)));
  }
}

function savePayoutRate() {
  const rate = $("#payoutRate") ? $("#payoutRate").value : "1.0";
  alert(`Rate insentif berhasil diperbarui menjadi ${rate} Pi / suara.`);
}

async function retryFailedPayouts() {
  if (!supabaseClient) return alert("Supabase Client belum siap.");
  
  const displayBtn = $("#btnRetryPayouts");
  if (displayBtn) {
    displayBtn.disabled = true;
    displayBtn.innerText = "⏳ Memproses Ulang Pembayaran...";
  }

  try {
    const { data: pendingQueue, error } = await supabaseClient
      .from('payout_queue')
      .select('*')
      .eq('status', 'PENDING');

    if (error || !pendingQueue || pendingQueue.length === 0) {
      alert("✅ Tidak ada antrean pembayaran yang tertunda (0 Pending).");
      if (displayBtn) {
        displayBtn.disabled = false;
        displayBtn.innerText = "🔄 Process Pending Payouts Queue";
      }
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of pendingQueue) {
      try {
        const res = await fetch('/api/payout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: item.wallet_address,
            amount: item.amount,
            username: item.username,
            proposalId: item.proposal_id
          })
        });

        const result = await res.json();
        if (res.ok && result.success) {
          successCount++;
          await supabaseClient.from('payout_queue').update({ status: 'SUCCESS', tx_hash: result.txHash }).eq('id', item.id);
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    alert(`📋 HASIL RETRY PEMBAYARAN:\n\n✅ Berhasil Terkirim: ${successCount}\n❌ Masih Gagal: ${failCount}`);

  } catch (err) {
    alert("Gagal memproses antrean pembayaran: " + err.message);
  } finally {
    if (displayBtn) {
      displayBtn.disabled = false;
      displayBtn.innerText = "🔄 Process Pending Payouts Queue";
    }
  }
}

// 🌐 HANDLER UNTUK SALIN LINK SPESIFIK DOKUMEN UNTUK GOOGLE CHROME
async function shareToExternalBrowser() {
  const docType = currentOpenedDocType || "minutes";
  const propId = (activeProposal && activeProposal.id) ? activeProposal.id : "";
  const docShareUrl = `${window.location.origin}${window.location.pathname}?docType=${docType}&propId=${encodeURIComponent(propId)}`;

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
  } catch (err) {
    console.warn("Clipboard API dibatasi WebView:", err);
  }

  if (statusEl) {
    statusEl.textContent = copied 
      ? `✅ Link khusus dokumen (${docType.toUpperCase()}) berhasil disalin! Buka Chrome lalu Tempel (Paste) link ini.`
      : "📋 Silakan tekan lama pada kolom teks di atas, lalu pilih Salin (Copy).";
    statusEl.className = "text-xs font-semibold text-emerald-400 mt-1 block";
  }

  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    try {
      const cleanHostPath = window.location.host + window.location.pathname + `?docType=${docType}&propId=${encodeURIComponent(propId)}`;
      window.location.href = `intent://${cleanHostPath}#intent;scheme=https;package=com.android.chrome;end;`;
    } catch (e) {
      console.warn("Intent diblokir WebView:", e);
    }
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

// 📥 FUNGSI UNDUH PDF LANGSUNG (RESPONSIF HIGH-DPI UNTUK HP VERTIKAL)
async function downloadPdfDirect() {
  const contentDiv = document.getElementById("documentViewerContent");
  const btnDownload = document.getElementById("btnModalDownload");
  const fallbackContainer = document.getElementById("directDownloadFallbackLink");

  if (!contentDiv) return;

  if (btnDownload) {
    btnDownload.disabled = true;
    btnDownload.innerHTML = "⏳ Merender File PDF...";
  }
  if (fallbackContainer) fallbackContainer.classList.add("hidden");

  try {
    const images = Array.from(contentDiv.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }
          })
      )
    );

    await new Promise((r) => setTimeout(r, 200));

    const docType = currentOpenedDocType || "dokumen";
    const propId = (activeProposal && activeProposal.id) ? activeProposal.id : "TVOD";
    const filename = `${docType.toUpperCase()}_${propId}.pdf`;

    if (window.html2pdf) {
      const opt = {
        margin:       [4, 4, 4, 4],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2.5, useCORS: true, allowTaint: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const worker = window.html2pdf().set(opt).from(contentDiv);
      const pdfBlob = await worker.output('blob');

      const blobUrl = URL.createObjectURL(pdfBlob);
      
      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = filename;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      if (fallbackContainer) {
        fallbackContainer.innerHTML = `
          <p class="text-xs text-emerald-300 font-semibold mb-1">Jika unduhan tidak berjalan otomatis di HP Anda:</p>
          <a href="${blobUrl}" download="${filename}" class="inline-block bg-emerald-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs shadow hover:bg-emerald-400">
            👉 Klik Di Sini Untuk Simpan PDF (${filename})
          </a>
        `;
        fallbackContainer.classList.remove("hidden");
      }
    } else {
      window.print();
    }
  } catch (err) {
    console.error("html2pdf error:", err);
    downloadPdfModal();
  } finally {
    if (btnDownload) {
      btnDownload.disabled = false;
      btnDownload.innerHTML = "📥 Download PDF Directly (1-Klik)";
    }
  }
}

async function downloadPdfModal() {
  const contentDiv = document.getElementById("documentViewerContent");
  const btnDownload = document.getElementById("btnModalDownload");

  if (!contentDiv) return;

  if (btnDownload) {
    btnDownload.disabled = true;
    btnDownload.innerHTML = "⏳ Merender Gambar Dokumen...";
  }

  try {
    if (window.html2canvas) {
      const canvas = await window.html2canvas(contentDiv, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");

      let imgPreviewArea = document.getElementById("pngPreviewArea");
      if (!imgPreviewArea) {
        imgPreviewArea = document.createElement("div");
        imgPreviewArea.id = "pngPreviewArea";
        contentDiv.appendChild(imgPreviewArea);
      }

      imgPreviewArea.innerHTML = `
        <div style="text-align:center; padding:10px; margin-top:20px; border-top:2px dashed #cbd5e1;">
          <div style="background:#fef3c7; color:#92400e; padding:12px; border-radius:8px; margin-bottom:12px; font-weight:bold; font-size:12px; border: 1px solid #f59e0b;">
            📌 GAMBAR HASIL RENDER (SIAP DISIMPAN):<br>
            Tekan & tahan (long-press) gambar di bawah, lalu pilih <strong>"Simpan Gambar" / "Save Image"</strong> ke Galeri HP Anda.
          </div>
          <img src="${imgData}" style="width:100%; height:auto; border:1px solid #cbd5e1; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
        </div>
      `;

      imgPreviewArea.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.print();
    }
  } catch (err) {
    alert("Gagal merender dokumen: " + err.message);
  } finally {
    if (btnDownload) {
      btnDownload.disabled = false;
      btnDownload.innerHTML = "📥 Download PDF Directly (1-Klik)";
    }
  }
}

function copyDocumentText() {
  const contentDiv = document.getElementById("documentViewerContent");
  if (!contentDiv) return;

  const clone = contentDiv.cloneNode(true);
  const previewArea = clone.querySelector("#pngPreviewArea");
  if (previewArea) {
    previewArea.remove();
  }

  const textToCopy = clone.innerText.trim();

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("📋 Seluruh Teks Dokumen Resmi Berhasil Disalin!");
    }).catch(() => {
      fallbackCopyText(textToCopy);
    });
  } else {
    fallbackCopyText(textToCopy);
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    alert("📋 Seluruh Teks Dokumen Resmi Berhasil Disalin!");
  } catch (err) {
    alert("Gagal menyalin teks dokumen.");
  }
  document.body.removeChild(textarea);
}

window.closePdfModal = closePdfModal;
window.downloadPdfDirect = downloadPdfDirect;
window.downloadPdfModal = downloadPdfModal;
window.shareToExternalBrowser = shareToExternalBrowser;
window.copyDocumentText = copyDocumentText;

// 📄 1. GENERATE OFFICIAL MINUTES DOKUMEN (DI FILTER AGAR AKUN FROZEN TIDAK MASUK)
async function generateOfficialMinutesPDF() {
  currentOpenedDocType = "minutes";
  await fetchVoterStatsForAdmin();

  let sigChairman = getSignatureDataUrl("sig-chairman");
  let sigWitness = getSignatureDataUrl("sig-witness");
  let sigInspector = getSignatureDataUrl("sig-inspector");
  let sigCountryHead = getSignatureDataUrl("sig-country-head");

  const totalCount = activeProposal.totalVotes || 0;
  const netScoreVal = activeProposal.netScore || 0;
  const agreeCount = activeProposal.agreeCount || 0;
  const neutralCount = activeProposal.neutralCount || 0;
  const disagreeCount = activeProposal.disagreeCount || 0;
  const agreeScore = activeProposal.agreeScore || 0;
  const neutralScore = activeProposal.neutralScore || 0;
  const disagreeScore = activeProposal.disagreeScore || 0;
  const agreeAvgConf = activeProposal.agreeAvgConf || "0.00";
  const neutralAvgConf = activeProposal.neutralAvgConf || "0.00";
  const disagreeAvgConf = activeProposal.disagreeAvgConf || "0.00";
  const avgConf = activeProposal.avgConfidence || "0.00";

  const agreePct = totalCount > 0 ? ((agreeCount / totalCount) * 100).toFixed(1) : "0.0";
  const neutralPct = totalCount > 0 ? ((neutralCount / totalCount) * 100).toFixed(1) : "0.0";
  const disagreePct = totalCount > 0 ? ((disagreeCount / totalCount) * 100).toFixed(1) : "0.0";
const totalPctDisplay = totalCount > 0 ? "100%" : "0.0%";
  
  const verdictText = netScoreVal > 0 ? "AGREE" : (netScoreVal < 0 ? "DISAGREE" : "NEUTRAL / TIED");
  const verdictColor = netScoreVal > 0 ? "#166534" : (netScoreVal < 0 ? "#991b1b" : "#854d0e");

  const safeTitle = escapeHtml(activeProposal.title);
  const safeId = escapeHtml(activeProposal.id);
  const safeChapter = escapeHtml(activeUser.chapter || "GLOBAL");
  const netPrefix = netScoreVal >= 0 ? "+" : "";

  const nowDate = new Date();
  const parsedPropDate = activeProposal.date ? new Date(activeProposal.date) : null;
  const eventDate = (parsedPropDate && !Number.isNaN(parsedPropDate.getTime())) ? parsedPropDate : nowDate;

  const formattedOnThisDay = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const generatedUtc = nowDate.toISOString().replace("T", " ").substring(0, 16) + " UTC";

  const integrityHash = window.CryptoJS
    ? window.CryptoJS.SHA256(`TVOD-HASH-${activeProposal.id}`).toString().substring(0, 16).toUpperCase()
    : "8F97D023B35F5C67";

  const docHtml = `
    <div class="pdf-container" style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; width: 100%; max-width: 100%; margin: 0; padding: 16px 14px; box-sizing: border-box; line-height: 1.5; background: #ffffff;">
      
      <!-- HEADER LOGO & TITLE -->
      <div style="text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 12px; margin-bottom: 16px;">
        <img src="/logo.png" alt="TVOD Logo" style="height: 65px; margin: 0 auto 6px auto; display: block;" />
        <h1 style="font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">OFFICIAL MINUTES</h1>
        <h2 style="font-size: 13px; font-weight: 700; color: #2563eb; margin: 4px 0 0 0; text-transform: uppercase;">WEB3 VOTING — ${safeTitle}</h2>
        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; font-family: monospace; font-weight: 600;">THE VOICE OF DAO (TVOD) X PI NETWORK ECOSYSTEM</p>
      </div>

      <!-- DOCUMENT CONTROL RECORD -->
      <table class="avoid-break" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 14px; border: 1.5px solid #cbd5e1; page-break-inside: avoid;">
        <tr style="background: #1e293b; color: #ffffff;">
          <td colspan="2" style="padding: 8px 10px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">DOCUMENT CONTROL RECORD</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 10px; font-weight: bold; width: 160px; background: #f1f5f9; color: #334155;">Document ID</td>
          <td style="padding: 7px 10px; font-family: monospace; font-weight: bold; color: #0f172a; word-break: break-all;">${safeId}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Integrity Hash</td>
          <td style="padding: 7px 10px; font-family: monospace; color: #2563eb; font-weight: bold; word-break: break-all;">${integrityHash}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Classification</td>
          <td style="padding: 7px 10px; color: #dc2626; font-weight: bold;">RESTRICTED — Official DAO Verification Record [Frozen & Duplicate Votes Excluded]</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Generated Date</td>
          <td style="padding: 7px 10px; font-family: monospace; font-weight: bold;">${generatedUtc}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Subject</td>
          <td style="padding: 7px 10px; font-weight: 600;">Conduct and Final Verdict of Web3 Voting — ${safeTitle}</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Source / Chapter</td>
          <td style="padding: 7px 10px; font-weight: 600;">TVOD Verifier dApp / ${safeChapter}</td>
        </tr>
      </table>

      <!-- ON THIS DAY STATEMENT -->
      <p style="font-size: 11.5px; color: #334155; margin: 0 0 14px 0; line-height: 1.55;">
        On this day, <strong>${escapeHtml(formattedOnThisDay)}</strong>, the Web3 Voting process for "<strong>${safeTitle}</strong>" was officially conducted and cryptographic records were committed under the following governance parameters:
      </p>

      <!-- SECTION I: ACTIVITY & GOVERNANCE DETAILS -->
      <h3 style="font-size: 13px; font-weight: bold; color: #1e3a8a; margin: 14px 0 6px 0; text-transform: uppercase; border-left: 4px solid #2563eb; padding-left: 8px;">I. ACTIVITY &amp; GOVERNANCE DETAILS</h3>
      <table class="avoid-break" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; border: 1.5px solid #cbd5e1; page-break-inside: avoid;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 10px; font-weight: bold; width: 160px; background: #f8fafc; color: #334155;">Activity Name</td>
          <td style="padding: 7px 10px; font-weight: 600; color: #0f172a;">${safeTitle}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 10px; font-weight: bold; background: #f8fafc; color: #334155;">Platform</td>
          <td style="padding: 7px 10px; font-weight: 600; color: #0f172a;">TVOD Verifier dApp</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 10px; font-weight: bold; background: #f8fafc; color: #334155;">Voting Method</td>
          <td style="padding: 7px 10px; font-weight: 600; color: #0f172a;">On-Chain NFT Verification &amp; Weighted Role Voting</td>
        </tr>
        <tr>
          <td style="padding: 7px 10px; font-weight: bold; background: #f8fafc; color: #334155;">Scoring Formula</td>
          <td style="padding: 7px 10px; font-family: monospace; font-weight: 600; color: #0f172a;">Score = Direction &times; Confidence &times; Role Weight</td>
        </tr>
      </table>

      <!-- SECTION II: VOTING RESULTS & WEIGHTED METRICS -->
      <h3 style="font-size: 13px; font-weight: bold; color: #1e3a8a; margin: 16px 0 6px 0; text-transform: uppercase; border-left: 4px solid #2563eb; padding-left: 8px;">II. VOTING RESULTS &amp; WEIGHTED METRICS</h3>
      <table class="avoid-break" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; border: 1.5px solid #cbd5e1; text-align: center; page-break-inside: avoid;">
        <thead>
          <tr style="background: #0f172a; color: #ffffff; font-weight: bold;">
            <th style="padding: 8px; border: 1px solid #334155;">Category</th>
            <th style="padding: 8px; border: 1px solid #334155;">Ballots Count</th>
            <th style="padding: 8px; border: 1px solid #334155;">% Total Votes</th>
            <th style="padding: 8px; border: 1px solid #334155;">Weighted Score</th>
            <th style="padding: 8px; border: 1px solid #334155;">Avg Confidence</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #dcfce7; border-bottom: 1px solid #cbd5e1;">
            <td style="padding: 8px; font-weight: bold; color: #166534;">Agree (+1)</td>
            <td style="padding: 8px; font-weight: 600;">${agreeCount}</td>
            <td style="padding: 8px; font-weight: 600;">${agreePct}%</td>
            <td style="padding: 8px; font-weight: bold; color: #15803d;">${agreeScore >= 0 ? '+' : ''}${agreeScore.toFixed(2)}</td>
            <td style="padding: 8px;">${agreeAvgConf}</td>
          </tr>
          <tr style="background: #fef9c3; border-bottom: 1px solid #cbd5e1;">
            <td style="padding: 8px; font-weight: bold; color: #854d0e;">Neutral (0)</td>
            <td style="padding: 8px; font-weight: 600;">${neutralCount}</td>
            <td style="padding: 8px; font-weight: 600;">${neutralPct}%</td>
            <td style="padding: 8px;">${neutralScore.toFixed(2)}</td>
            <td style="padding: 8px;">${neutralAvgConf}</td>
          </tr>
          <tr style="background: #fee2e2; border-bottom: 1px solid #cbd5e1;">
            <td style="padding: 8px; font-weight: bold; color: #991b1b;">Disagree (-1)</td>
            <td style="padding: 8px; font-weight: 600;">${disagreeCount}</td>
            <td style="padding: 8px; font-weight: 600;">${disagreePct}%</td>
            <td style="padding: 8px; font-weight: bold; color: #b91c1c;">${disagreeScore.toFixed(2)}</td>
            <td style="padding: 8px;">${disagreeAvgConf}</td>
          </tr>
          <tr style="background: #1e293b; color: #ffffff; font-weight: bold;">
            <td style="padding: 9px;">FINAL TOTAL</td>
            <td style="padding: 9px; font-size: 13px;">${totalPctDisplay}</td>
            <td style="padding: 9px; font-size: 13px;">100%</td>
            <td style="padding: 9px; font-size: 14px; color: #fbbf24;">${netPrefix}${netScoreVal.toFixed(2)} Pts</td>
            <td style="padding: 9px; font-size: 13px;">${avgConf}</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION III: OFFICIAL VERDICT -->
      <h3 style="font-size: 13px; font-weight: bold; color: #1e3a8a; margin: 16px 0 6px 0; text-transform: uppercase; border-left: 4px solid #2563eb; padding-left: 8px;">III. OFFICIAL VERDICT</h3>
      <div class="avoid-break" style="text-align: center; padding: 14px; background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 8px; margin-bottom: 20px; page-break-inside: avoid;">
        <h2 style="font-size: 20px; font-weight: 800; color: ${verdictColor}; margin: 0; letter-spacing: 1px;">RATIFICATION VERDICT: ${verdictText}</h2>
        <p style="font-size: 11px; color: #475569; margin: 6px 0 0 0; font-weight: 600;">Net Weighted Score: ${netPrefix}${netScoreVal.toFixed(2)} | Average Confidence Scale: ${avgConf} / 5.0</p>
      </div>

      <!-- SECTION IV: OFFICIAL SIGNATURES & STAMP -->
      <div class="avoid-break" style="position: relative; margin-top: 24px; border-top: 2px solid #cbd5e1; padding-top: 14px; page-break-inside: avoid;">
        <img src="/stempel-tvod.png" alt="Official TVOD Stamp" style="position: absolute; left: 50%; transform: translateX(-50%); top: 30px; width: 140px; height: 140px; opacity: 0.75; pointer-events: none; z-index: 10;" />

        <h4 style="font-size: 12px; font-weight: bold; color: #1e3a8a; margin: 0 0 12px 0; text-transform: uppercase;">OFFICIAL RATIFICATION SIGNATURES</h4>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          
          <div style="border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 8px; background: #fafafa; min-height: 115px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a; display: block;">1. Chairperson:</span>
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigChairman ? `<img src="${sigChairman}" style="max-height: 58px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Signed Digitally]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px; text-align: center;">@afifmasfiqo (#911)</strong>
          </div>

          <div style="border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 8px; background: #fafafa; min-height: 115px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a; display: block;">2. Witness:</span>
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigWitness ? `<img src="${sigWitness}" style="max-height: 58px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Signed Digitally]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px; text-align: center;">@insya (Witness)</strong>
          </div>

          <div style="border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 8px; background: #fafafa; min-height: 115px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a; display: block;">3. Inspector:</span>
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigInspector ? `<img src="${sigInspector}" style="max-height: 58px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Signed Digitally]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px; text-align: center;">@Nalaktak (#999)</strong>
          </div>

          <div style="border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 8px; background: #fafafa; min-height: 115px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a; display: block;">4. Country Head:</span>
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigCountryHead ? `<img src="${sigCountryHead}" style="max-height: 58px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Signed Digitally]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px; text-align: center;">@Rasj81</strong>
          </div>

        </div>
      </div>

    </div>
  `;

  renderDocumentInModal(`Official Minutes: ${activeProposal.id}`, docHtml);
}

// 📊 2. GENERATE INDIVIDUAL VOTER AUDIT TRAIL LOG REPORT (DENGAN KOLOM TIMESTAMP & DI-FILTER DARI AKUN FROZEN)
async function generateVoterAuditLogPDF() {
  currentOpenedDocType = "audit_log";
  await fetchVoterStatsForAdmin();

  let sigChairman = getSignatureDataUrl("sig-chairman");
  let sigInspector = getSignatureDataUrl("sig-inspector");

  let voterLogRowsHtml = "";

  // Ambil daftar ID terblokir gabungan (frozen_list.json + garuda_blacklist Supabase)
  const frozenIdSet = new Set(
    (await getFrozenListClient()).map(id => String(id).trim())
  );
  const frozenUsernameSet = new Set();

  if (supabaseClient) {
    try {
      const { data: blacklistRows } = await supabaseClient
        .from('garuda_blacklist')
        .select('garuda_id, username');

      if (blacklistRows) {
        blacklistRows.forEach(b => {
          if (b.garuda_id !== null && b.garuda_id !== undefined) {
            frozenIdSet.add(String(b.garuda_id).trim());
          }
          if (b.username) {
            frozenUsernameSet.add(String(b.username).trim().toLowerCase());
          }
        });
      }
    } catch (e) {
      console.warn("Warning membaca blacklist untuk audit log:", e);
    }
  }

  if (supabaseClient && activeProposal.id) {
    try {
      const { data: voteData } = await supabaseClient
        .from('votes')
        .select('*')
        .eq('proposal_id', activeProposal.id)
        .order('created_at', { ascending: true });

      const { data: voterProfiles } = await supabaseClient
        .from('voters')
        .select('*');

      const profileMap = {};
      if (voterProfiles) {
        voterProfiles.forEach(p => {
          if (p.username) profileMap[p.username.toLowerCase()] = p;
        });
      }

      if (voteData && voteData.length > 0) {
        const seenUsernames = new Set();
        const seenGarudaIds = new Set();

        const validVoteRows = voteData.filter(v => {
          const uname = (v.username || "").trim().toLowerCase();
          if (!uname || uname === "anonymous") return false;
          if (frozenUsernameSet.has(uname)) return false;

          const prof = profileMap[uname] || {};
          const garudaIdStr = prof.garuda_id !== null && prof.garuda_id !== undefined
            ? String(prof.garuda_id).trim()
            : "";

          if (garudaIdStr && frozenIdSet.has(garudaIdStr)) return false;

          // Cegah duplikasi suara
          if (seenUsernames.has(uname)) return false;
          if (garudaIdStr && seenGarudaIds.has(garudaIdStr)) return false;

          seenUsernames.add(uname);
          if (garudaIdStr) seenGarudaIds.add(garudaIdStr);
          return true;
        });

        const rowList = validVoteRows.map((v, idx) => {
          const unameLower = (v.username || "").trim().toLowerCase();
          const prof = profileMap[unameLower] || {};
         const garudaDisplay = prof.garuda_id ? `#${prof.garuda_id}` : `DELEGATE (${escapeHtml((prof.delegated_nft_type || 'NFT').toUpperCase())})`;
          const communityDisplay = escapeHtml(prof.chapter || 'GLOBAL');
          const safeUname = escapeHtml(v.username || "Unknown");
          const voteDirectionText = v.vote_direction === 1 ? 'Agree (+1)' : (v.vote_direction === 0 ? 'Neutral (0)' : 'Disagree (-1)');
          const voteBgColor = v.vote_direction === 1 ? '#dcfce7' : (v.vote_direction === 0 ? '#fef9c3' : '#fee2e2');
          const voteTextColor = v.vote_direction === 1 ? '#166534' : (v.vote_direction === 0 ? '#854d0e' : '#991b1b');
          const scoreVal = (parseFloat(v.weighted_score) || 0);
          
          let formattedTimestamp = "-";
          if (v.created_at) {
            formattedTimestamp = v.created_at.replace('T', ' ').substring(0, 19);
          }

          const ownerName = escapeHtml(prof.owner_username || 'Garuda Owner');
          const noteText = prof.category === 'owner' ? `Verified On-Chain (Garuda #${prof.garuda_id || ''})` : `Delegator (@${ownerName})`;

          return `
            <tr style="border-bottom: 1px solid #cbd5e1; font-size: 9.5px;">
              <td style="padding: 6px 3px; font-weight: bold; background: #f8fafc; text-align: center;">${idx + 1}</td>
              <td style="padding: 6px 5px; font-weight: bold; text-align: left; color: #0f172a;">@${safeUname}</td>
              <td style="padding: 6px 3px; font-family: monospace; font-weight: bold; color: #1e3a8a; text-align: center;">${garudaDisplay}</td>
              <td style="padding: 6px 3px; font-weight: 600; text-align: center;">${communityDisplay}</td>
              <td style="padding: 6px 3px; text-align: center;">${escapeHtml(prof.role || 'Member')}</td>
              <td style="padding: 6px 3px; font-weight: bold; text-align: center;">${v.role_weight || 0.5}</td>
              <td style="padding: 6px 3px; font-weight: bold; text-align: center; background: ${voteBgColor}; color: ${voteTextColor};">${voteDirectionText}</td>
              <td style="padding: 6px 3px; font-weight: bold; text-align: center;">${v.confidence || 3}</td>
              <td style="padding: 6px 3px; font-weight: bold; text-align: center; color: ${scoreVal >= 0 ? '#15803d' : '#b91c1c'};">${scoreVal >= 0 ? '+' : ''}${scoreVal.toFixed(1)}</td>
              <td style="padding: 6px 4px; font-family: monospace; font-size: 8.5px; text-align: center; color: #334155;">${formattedTimestamp}</td>
              <td style="padding: 6px 5px; text-align: left; font-size: 8.5px; color: #475569;">${noteText}</td>
            </tr>
          `;
        });
        voterLogRowsHtml = rowList.join('');
      }
    } catch (err) {
      console.warn("Gagal membaca voter log Supabase:", err);
    }
  }
  
  if (!voterLogRowsHtml) {
    voterLogRowsHtml = `
      <tr>
        <td colspan="11" style="padding: 12px; text-align: center; color: #64748b; font-style: italic;">
          No valid &amp; non-frozen ballots recorded yet for this proposal.
        </td>
      </tr>
    `;
  }

  const safeTitle = escapeHtml(activeProposal.title);
  const safeId = escapeHtml(activeProposal.id);

  const docHtml = `
    <div class="pdf-container" style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; width: 100%; max-width: 100%; margin: 0; padding: 14px 10px; box-sizing: border-box; line-height: 1.45; background: #ffffff;">
      
      <!-- HEADER LOGO & TITLE -->
      <div style="text-align: center; border-bottom: 3px double #4c1d95; padding-bottom: 10px; margin-bottom: 14px;">
        <img src="/logo.png" alt="TVOD Logo" style="height: 60px; margin: 0 auto 6px auto; display: block;" />
        <h1 style="font-size: 19px; font-weight: 800; color: #4c1d95; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">INDIVIDUAL VOTER AUDIT TRAIL LOG REPORT</h1>
        <h2 style="font-size: 12px; font-weight: 700; color: #6b21a8; margin: 4px 0 0 0; text-transform: uppercase;">PROPOSAL: ${safeTitle}</h2>
        <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0; font-family: monospace; font-weight: 600;">THE VOICE OF DAO (TVOD) X PI NETWORK ECOSYSTEM</p>
      </div>

      <!-- CONTROL BANNER -->
      <div style="background: #1e1b4b; color: #ffffff; text-align: center; padding: 5px; font-size: 9.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; border-radius: 4px;">
        ⚠️ RESTRICTED · CONTROLLED AUDIT LOG DOCUMENT [FROZEN & DUPLICATE VOTES EXCLUDED]
      </div>

      <!-- AUDIT DATA TABLE -->
      <div style="overflow-x: auto; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1.5px solid #4c1d95; text-align: center;">
          <thead>
            <tr style="background: #4c1d95; color: #ffffff; font-weight: bold;">
              <th style="padding: 6px 3px; border: 1px solid #6b21a8; width: 22px;">No.</th>
              <th style="padding: 6px 5px; border: 1px solid #6b21a8; text-align: left;">Name</th>
              <th style="padding: 6px 3px; border: 1px solid #6b21a8;">Garuda ID</th>
              <th style="padding: 6px 3px; border: 1px solid #6b21a8;">Chapter</th>
              <th style="padding: 6px 3px; border: 1px solid #6b21a8;">Role</th>
              <th style="padding: 6px 3px; border: 1px solid #6b21a8;">Wgt</th>
              <th style="padding: 6px 3px; border: 1px solid #6b21a8;">Vote</th>
              <th style="padding: 6px 3px; border: 1px solid #6b21a8;">Conf</th>
              <th style="padding: 6px 3px; border: 1px solid #6b21a8;">Score</th>
              <th style="padding: 6px 4px; border: 1px solid #6b21a8;">Timestamp (UTC)</th>
              <th style="padding: 6px 5px; border: 1px solid #6b21a8; text-align: left;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${voterLogRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- VERIFICATION SIGNATURES -->
      <div class="avoid-break" style="position: relative; margin-top: 16px; border-top: 2px solid #cbd5e1; padding-top: 10px; page-break-inside: avoid;">
        <img src="/stempel-tvod.png" alt="Official TVOD Stamp" style="position: absolute; right: 20px; top: 15px; width: 90px; height: 90px; opacity: 0.75; pointer-events: none;" />

        <h4 style="font-size: 11px; font-weight: bold; color: #4c1d95; margin: 0 0 8px 0; text-transform: uppercase;">AUDIT TRAIL VERIFICATION SIGNATURES</h4>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 75%;">
          
          <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 6px; background: #fafafa; min-height: 90px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: bold; color: #4c1d95; display: block;">Governance Chairman:</span>
            <div style="height: 45px; display: flex; align-items: center; justify-content: center; margin: 2px 0;">
              ${sigChairman ? `<img src="${sigChairman}" style="max-height: 42px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 9px; color: #94a3b8; font-style: italic;">[Signed Digitally]</span>`}
            </div>
            <strong style="font-size: 10px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 2px; text-align: center;">@afifmasfiqo (#911)</strong>
          </div>

          <div style="border: 1px solid #cbd5e1; padding: 6px; border-radius: 6px; background: #fafafa; min-height: 90px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: bold; color: #4c1d95; display: block;">Audit Inspector:</span>
            <div style="height: 45px; display: flex; align-items: center; justify-content: center; margin: 2px 0;">
              ${sigInspector ? `<img src="${sigInspector}" style="max-height: 42px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 9px; color: #94a3b8; font-style: italic;">[Signed Digitally]</span>`}
            </div>
            <strong style="font-size: 10px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 2px; text-align: center;">@Nalaktak (#999)</strong>
          </div>

        </div>
      </div>

    </div>
  `;

  renderDocumentInModal(`Voter Audit Log: ${safeId}`, docHtml);
}

// 🎓 3. GENERATE SERTIFIKAT VERIFIKASI DIGITAL
async function generateCertificatePDF() {
  currentOpenedDocType = "certificate";
  await fetchVoterStatsForAdmin();

  let sigChairman = getSignatureDataUrl("sig-chairman");
  const netScoreVal = activeProposal.netScore || 0;
  const verdictText = netScoreVal > 0 ? "TVOD VERIFIED & PASSED" : "VERIFIED - REJECTED";
  const shaProof = window.CryptoJS ? window.CryptoJS.SHA256(`CERT-${activeProposal.id}-${Date.now()}`).toString() : "CERT-SHA256-PROVED";

  const certHtml = `
    <div class="pdf-container avoid-break" style="border: 3px double #f59e0b; padding: 20px 14px; border-radius: 12px; background: #ffffff; color: #0f172a; text-align: center; position: relative; width: 100%; box-sizing: border-box; page-break-inside: avoid;">
      
      <img src="/logo.png" alt="TVOD Logo" style="height: 65px; margin: 0 auto 10px auto; display: block;" />
      <h1 style="font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0 0 6px 0;">THE VOICE OF DAO</h1>
      <h2 style="font-size: 14px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0;">OFFICIAL DIGITAL VERIFICATION CERTIFICATE</h2>
      <p style="font-size: 11px; color: #64748b; font-family: monospace; font-weight: bold; margin-bottom: 12px;">THE VOICE OF DAO (TVOD) X PI NETWORK ECOSYSTEM</p>

      <hr style="border: 0; border-top: 1.5px solid #cbd5e1; margin: 12px 0;" />

      <p style="font-size: 11px; color: #475569; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">THIS IS TO OFFICIALLY CERTIFY THAT THE VOTING OBJECT / PROPOSAL:</p>
      <h3 style="font-size: 16px; font-weight: 800; color: #1e293b; margin: 0 0 14px 0; line-height: 1.4;">"${activeProposal.title}"</h3>

      <div style="text-align: left; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1.5px solid #cbd5e1; font-size: 11.5px; color: #334155; margin-bottom: 14px; line-height: 1.6;">
        <p style="margin: 3px 0;">• Submitted By Entity : <strong>${activeProposal.proposerEntity}</strong></p>
        <p style="margin: 3px 0;">• Case Category     : <strong>${activeProposal.category}</strong></p>
        <p style="margin: 3px 0;">• Reference ID       : <strong>${activeProposal.id}</strong></p>
        <p style="margin: 3px 0;">• Ratification Date  : <strong>${activeProposal.date}</strong></p>
      </div>

      <div style="background: #f0fdf4; border: 2px solid #166534; padding: 14px; border-radius: 8px; margin-bottom: 16px; position: relative;">
        <span style="font-size: 11px; font-weight: bold; color: #166534; display: block; margin-bottom: 4px;">GOVERNANCE AUDIT STATUS:</span>
        <strong style="font-size: 16px; color: #166534; letter-spacing: 0.5px;">STATUS: ${verdictText}</strong>
        <p style="font-size: 11.5px; color: #334155; margin: 6px 0 0 0;">
          Net Weighted Score: <strong>+${netScoreVal.toFixed(1)} Pts</strong> | Total Verified Votes (Active): <strong>${activeProposal.totalVotes} Ballots</strong>
        </p>
        <img src="/stempel-tvod.png" alt="Stempel TVOD" style="position: absolute; right: 12px; top: 10px; width: 75px; height: 75px; opacity: 0.85;" />
      </div>

      <div style="margin-top: 18px; font-size: 10px; color: #475569; font-family: monospace;">
        <div style="margin-bottom: 6px;">
          ${sigChairman ? `<img src="${sigChairman}" style="max-height: 50px; margin: 0 auto; display: block;" />` : ''}
          <strong style="display: block; font-size: 11px; color: #0f172a; margin-top: 4px;">@afifmasfiqo (#911)</strong>
          <span style="font-size: 9px; color: #64748b;">Issued by Governance Chairman</span>
        </div>
        <p style="margin: 4px 0 10px 0; word-break: break-all;">Cryptographic Hash: ${shaProof}</p>
        <div style="display: inline-block; border: 1.5px solid #d97706; color: #d97706; padding: 4px 14px; border-radius: 20px; font-weight: bold; font-size: 10px;">
          ✓ IMMUTABLE SHA-256 RECORDED
        </div>
      </div>
    </div>
  `;

  renderDocumentInModal(`Digital Certificate: ${activeProposal.id}`, certHtml);
}

window.publishNewProposal = publishNewProposal;
window.cancelActiveProposal = cancelActiveProposal;
window.handleGalleryImagesSelect = handleGalleryImagesSelect;
window.checkAppWalletBalance = checkAppWalletBalance;
window.fetchVoterStatsForAdmin = fetchVoterStatsForAdmin;
window.setConfidence = setConfidence;
window.clearOfficerSig = clearOfficerSig;
window.toggleGarudaBan = toggleGarudaBan;
window.savePayoutRate = savePayoutRate;
window.retryFailedPayouts = retryFailedPayouts;
window.changeLanguage = changeLanguage;
window.generateOfficialMinutesPDF = generateOfficialMinutesPDF;
window.generateVoterAuditLogPDF = generateVoterAuditLogPDF;
window.generateCertificatePDF = generateCertificatePDF;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
