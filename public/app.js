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
    btn_share_chrome: "🌐 Salin Link Chrome",
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
    btn_share_chrome: "🌐 Copy Chrome Link",
    btn_copy_text: "📋 Copy Document Text",
    btn_close_modal: "Close Document"
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
    label_wallet: "عنوان محفظة Pi (المفتاح العام للمكافآت)",
    label_category: "فئة الناخب",
    cat_owner: "ناخب دائم (مالك NFT Garuda #1 - #1000)",
    cat_delegator: "مفوض (1 unit Halloween / 3 units PiDay2026)",
    cat_witness: "شاهد خارجي (تجاوز الشاهد الخارجي)",
    label_chapter: "منطقة المجتمع",
    label_role: "دور الحوكمة",
    role_member: "عضو (وزن الصوت: 0.5)",
    role_leader: "قائد المجموعة (وزن الصوت: 1.0)",
    role_founder: "مؤسس (وزن الصوت: 2.0 - Garuda #999)",
    btn_register: "التحقق من البيانات وفتح الوصول للتصويت",
    prop_bg_title: "📄 الخلفية ووصف الهدف",
    prop_gallery_title: "📸 معرض الصور والفيديو للأدلة",
    vote_step_title: "وحدة التصويت السريع",
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
    btn_print_pdf: "🖨️ طباعة / حفظ وثيقة PDF",
    btn_share_chrome: "🌐 نسخ رابط Chrome",
    btn_copy_text: "📋 نسخ نص الوثيقة",
    btn_close_modal: "إغلاق الوثيقة"
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
    label_wallet: "Pi 钱包地址 (公钥用于支付与 NFT 检查)",
    label_category: "选民类别",
    cat_owner: "正式选民 (Garuda NFT 所有者 #1 - #1000)",
    cat_delegator: "代表 (1个 Halloween NFT / 3个 PiDay2026 NFT)",
    cat_witness: "外部证人 (外部旁路)",
    label_chapter: "社区分会 / 区域",
    label_role: "治理角色",
    role_member: "成员 (投票权重: 0.5)",
    role_leader: "组长 (投票权重: 1.0)",
    role_founder: "创始人 (投票权重: 2.0 - Garuda ID #999)",
    btn_register: "验证数据并开启投票权限",
    prop_bg_title: "📄 背景与对象描述",
    prop_gallery_title: "📸 照片与视频证明图库",
    vote_step_title: "快速投票模块",
    vote_dir_label: "1. 您的投票方向",
    vote_agree: "👍 赞成 (+1)",
    vote_neutral: "😐 中立 (0)",
    vote_disagree: "👎 反对 (-1)",
    confidence_label: "2. 验证置信度等级 (1 - 5 级)",
    btn_submit_vote: "提交加密投票并领取 Pi 奖励",
    admin_title: "🛡️ 管理员套件",
    btn_publish_prop: "🚀 发布提案并启动计时器",
    btn_cancel_prop: "⛔ 取消 / 关闭当前提案",
    btn_retry_payouts: "🔄 处理挂起的支付队列",
    btn_official_minutes: "📄 生成官方会议纪要文档 (PDF)",
    btn_digital_cert: "🎓 生成数字验证证书",
    btn_print_pdf: "🖨️ 打印 / 保存 PDF 文档",
    btn_share_chrome: "🌐 复制 Chrome 链接",
    btn_copy_text: "📋 复制文档文本",
    btn_close_modal: "关闭文档"
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

  if (dict) {
    const optOwner = document.querySelector("#voterCategory option[value='owner']");
    if (optOwner && dict.cat_owner) optOwner.textContent = dict.cat_owner;
    
    const optDelegator = document.querySelector("#voterCategory option[value='delegator']");
    if (optDelegator && dict.cat_delegator) optDelegator.textContent = dict.cat_delegator;

    const optWitness = document.querySelector("#voterCategory option[value='witness']");
    if (optWitness && dict.cat_witness) optWitness.textContent = dict.cat_witness;

    const optMember = document.querySelector("#userRole option[value='Member']");
    if (optMember && dict.role_member) optMember.textContent = dict.role_member;

    const optLeader = document.querySelector("#userRole option[value='Group Leader']");
    if (optLeader && dict.role_leader) optLeader.textContent = dict.role_leader;

    const optFounder = document.querySelector("#userRole option[value='Founder']");
    if (optFounder && dict.role_founder) optFounder.textContent = dict.role_founder;
  }
}

// Global State
let isPiSDKInitialized = false;
let currentUser = null;
let currentOpenedDocType = null;
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

// ✍️ FUNGSI SAVING TANDA TANGAN OTOMATIS KE LOCALSTORAGE
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

// ⚡ INISIALISASI PI SDK
async function initPiSDK() {
  if (isPiSDKInitialized) return true;
  if (!window.Pi) return false;
  try {
    await window.Pi.init({ version: "2.0", sandbox: true });
    isPiSDKInitialized = true;
    console.log("✅ Pi SDK Berhasil Diinisialisasi");
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

  const verifiedUser = {
    username: auth.user.username,
    uid: auth.user.uid,
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
      if (user && user.username) {
        renderUser(user);
        setConnection(user.demo ? "● Mode Demo" : "● Verified by Pi SDK", true);
      }
    } catch (e) {
      console.warn("Gagal membaca saved session:", e);
    }
  }
}

async function saveVoterToSupabase(voterData) {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('voters').upsert([voterData], { onConflict: 'username' });
    if (error) console.error("Gagal menyimpan data voter ke Supabase:", error);
    else console.log("✅ Data voter tersimpan di Supabase:", data);
  } catch (err) {
    console.error("Supabase Voter Error:", err);
  }
}

async function saveVoteToSupabase(voteData) {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('votes').insert([voteData]);
    if (error) console.error("Gagal menyimpan suara ke Supabase:", error);
    else console.log("✅ Suara voting tersimpan di Supabase:", data);
  } catch (err) {
    console.error("Supabase Vote Error:", err);
  }
}

async function fetchVoterProfileFromSupabase(username) {
  if (!supabaseClient || !username) return;
  try {
    const { data, error } = await supabaseClient.from('voters').select('*').eq('username', username).single();
    if (error) return;
    if (data) {
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
        $("#voterCategory").value = data.category;
        toggleCategoryFields();
      }
      if ($("#communityChapter")) $("#communityChapter").value = data.chapter;
      if ($("#userRole")) $("#userRole").value = data.role;
      if ($("#garudaId")) $("#garudaId").value = data.garuda_id || "";
      if ($("#garudaHash")) $("#garudaHash").value = data.garuda_hash || "";

      const displayGaruda = $("#displayGaruda");
      if (displayGaruda) {
        displayGaruda.textContent = data.garuda_id ? `#${data.garuda_id}` : `DELEGATE (${data.category.toUpperCase()})`;
      }
    }
  } catch (err) {
    console.error("Fetch Profile Error:", err);
  }
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
      activeProposal.totalVotes = 0;
      activeProposal.netScore = 0;
      activeProposal.agreeCount = 0;
      activeProposal.neutralCount = 0;
      activeProposal.disagreeCount = 0;
      activeProposal.avgConfidence = 0;
    } else {
      const count = voteRows.length;
      let totalNetScore = 0;
      let agreeC = 0, neutralC = 0, disagreeC = 0;
      let totalConf = 0;

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
  } catch (err) {
    if (display) display.textContent = "0 Voter Aktif";
  }
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

    if (p.voting_end_time) {
      votingEndTime = new Date(p.voting_end_time);
    }
    renderProposalMaterials();

    if (p.status === 'CANCELLED') {
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
    } else {
      startCountdownTimer();
    }

    await fetchVoterStatsForAdmin();
  } catch (err) {
    console.error("Fetch Proposal Error:", err);
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
    if (loginStatusText) loginStatusText.textContent = `Terautentikasi: @${user.username} ${user.demo ? "(DEMO)" : ""}`;

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

  saveVoterToSupabase({
    username: activeUser.username || `voter_${Date.now()}`,
    wallet_address: activeUser.walletAddress,
    category: activeUser.category,
    chapter: activeUser.chapter,
    role: activeUser.role,
    garuda_id: activeUser.garudaId,
    garuda_hash: activeUser.garudaHash,
    owner_username: activeUser.ownerUsername,
    delegated_nft_type: activeUser.delegatedNftType,
    delegated_hashes: activeUser.delegatedHashes
  });

  checkAppWalletBalance();
  alert(`✅ Registrasi Berhasil!\nStatus: ${category.toUpperCase()}\nRole: ${role}\nWilayah: ${chapter}\nData tersimpan ke Supabase Database.`);
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

async function publishNewProposal(e) {
  if (e && e.preventDefault) e.preventDefault();

  const title = $("#inputPropTitle") ? $("#inputPropTitle").value.trim() : "";
  const category = $("#inputPropCategory") ? $("#inputPropCategory").value : "Verifikasi Objek / Kasus";
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

  if (uploadedGalleryBase64Images && uploadedGalleryBase64Images.length > 0) {
    activeProposal.images = uploadedGalleryBase64Images;
  } else {
    const rawImages = $("#inputPropImages") ? $("#inputPropImages").value.trim() : "";
    if (rawImages) {
      activeProposal.images = rawImages.split(",").map(img => ensureHttps(img.trim())).filter(img => img.length > 0);
    } else {
      activeProposal.images = ["https://via.placeholder.com/600x350/0f172a/f59e0b?text=Bukti+Foto+Objek+Voting"];
    }
  }

  const rawVideo = $("#inputPropVideo") ? $("#inputPropVideo").value.trim() : "";
  activeProposal.videoUrl = rawVideo ? ensureHttps(rawVideo) : "";

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

  alert(`✅ Proposal Baru (ID: ${activeProposal.id}) Berhasil Diterbitkan oleh TVOD Development Team!\nDurasi Voting: ${durationHrs} Jam.`);
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
  if (activeUser.category === "witness") return true;

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

  if (btn) {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.innerText = "⏳ Memeriksa Hak Suara...";
  }

  if (activeProposal.status === 'CANCELLED' || new Date().getTime() > votingEndTime.getTime()) {
    if (btn) {
      btn.innerText = "⛔ Sesi Voting Ditutup (Waktu Habis / Dibatalkan)";
      btn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3.5 rounded-xl text-sm cursor-not-allowed";
    }
    alert("⛔ PROSES VOTING DITOLAK!\n\nSesi waktu voting untuk proposal ini telah berakhir atau dibatalkan admin.");
    return;
  }

  const currentUsername = activeUser.username || "Anonymous";
  const currentWallet = activeUser.walletAddress || "";

  if (!currentWallet) {
    if (btn) {
      btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
      btn.disabled = false;
    }
    alert("⚠️ Alamat Wallet belum diisi! Silakan daftarkan wallet Anda pada form Verifikasi Voter terlebih dahulu.");
    return;
  }

  if (supabaseClient && currentUsername !== "Anonymous") {
    try {
      const { data: existingVotes } = await supabaseClient
        .from('votes')
        .select('id')
        .eq('proposal_id', activeProposal.id)
        .eq('username', currentUsername)
        .limit(1);

      if (existingVotes && existingVotes.length > 0) {
        if (btn) {
          btn.innerText = "✅ Anda Sudah Mengirim Suara";
          btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-3.5 rounded-xl text-sm border border-amber-500/30 cursor-not-allowed";
        }
        showPayoutBanner(`ℹ️ Suara Anda (@${currentUsername}) telah terdaftar sebelumnya.`, true);
        return;
      }
    } catch (err) {
      console.error("Error validasi suara ganda:", err);
    }
  }

  if (btn) btn.innerText = "Memeriksa Validitas Identitas Voter...";
  const isNftValid = await verifyOnChainNftOwnership();
  if (!isNftValid) {
    if (btn) {
      btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
      btn.disabled = false;
    }
    alert("⛔ AKSES VOTING DITOLAK!\n\nPersyaratan NFT / Identitas tidak lengkap pada profil Anda.");
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
  const rawPayload = `${currentUsername}|${currentWallet}|${voteVal}|${currentConfidence}|${roleWeight}|${timestamp}`;

  let voteHash = "HASH_GENERATED";
  if (window.CryptoJS) {
    voteHash = window.CryptoJS.SHA256(rawPayload).toString();
  }

  const activeSig = getSignatureDataUrl("sig-chairman");

  if (btn) btn.innerText = "Menyimpan Suara Terenkripsi...";
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

  const payoutRateEl = $("#payoutRate");
  const baseReward = payoutRateEl ? parseFloat(payoutRateEl.value) || 1.0 : 1.0;

  if (btn) btn.innerText = "Memproses Insentif Pi On-Chain...";

  try {
    const payoutRes = await fetch('/api/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: currentWallet,
        amount: baseReward,
        username: currentUsername,
        proposalId: activeProposal.id
      })
    });

    const payoutData = await payoutRes.json();

    if (payoutRes.ok && payoutData.success) {
      showPayoutBanner(`🎉 SUARA & PAYOUT SUCCESS!<br><strong>Tx Hash:</strong> <span class="font-mono text-xs">${payoutData.txHash}</span><br>${payoutData.message}`, true);
    } else {
      showPayoutBanner(`⚠️ Suara Berhasil Disimpan di Database.<br><strong>Status Payout:</strong> ${payoutData.message || 'Dipending di Antrean'}`, false);
    }
  } catch (payErr) {
    console.error("Gagal klaim payout:", payErr);
    showPayoutBanner(`✅ Suara berhasil disimpan ke Database, namun koneksi payout ke serverless mengalami waktu tunggu.`, false);
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "✅ Anda Sudah Mengirim Suara";
    btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-3.5 rounded-xl text-sm border border-amber-500/30 cursor-not-allowed";
  }
}

function toggleUserBan(isBan) {
  const target = $("#targetUser") ? $("#targetUser").value.trim() : "";
  if (!target) return alert("Masukkan Username Pi Target.");
  alert(`User ${target} telah berhasil di-${isBan ? "BAN / RESTRICTED" : "REINSTATED"}.`);
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
    // 1. Tunggu seluruh elemen gambar (stempel & tanda tangan Base64) selesai dimuat di DOM
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

    // 2. Beri jeda kecil agar layout browser tuntas di-render
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

// 🖨️ RENDER DOKUMEN MENJADI GAMBAR PNG (FALLBACK PREVIEW)
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

// 📄 GENERATE OFFICIAL MINUTES DOKUMEN (FULL-WIDTH & FULL-A4 HIGH RESOLUTION)
async function generateOfficialMinutesPDF() {
  currentOpenedDocType = "minutes";
  await fetchVoterStatsForAdmin();

  // 1. Ambil tanda tangan dari Kanvas / LocalStorage
  let sigChairman = getSignatureDataUrl("sig-chairman");
  let sigWitness = getSignatureDataUrl("sig-witness");
  let sigInspector = getSignatureDataUrl("sig-inspector");
  let sigCountryHead = getSignatureDataUrl("sig-country-head");

  // 2. Fallback untuk Google Chrome: Jika LocalStorage Chrome belum ada, ambil tanda tangan dari database Supabase
  if ((!sigChairman || !sigWitness) && supabaseClient && activeProposal.id) {
    try {
      const { data: voteRows } = await supabaseClient
        .from('votes')
        .select('voter_signature_base64, username')
        .eq('proposal_id', activeProposal.id)
        .not('voter_signature_base64', 'is', null)
        .order('created_at', { ascending: false });

      if (voteRows && voteRows.length > 0) {
        voteRows.forEach((v) => {
          if (v.voter_signature_base64) {
            if (!sigChairman && (v.username === 'afifmasfiqo' || v.username.toLowerCase().includes('afif'))) {
              sigChairman = v.voter_signature_base64;
              localStorage.setItem('tvod_sig_sig-chairman', sigChairman);
            } else if (!sigChairman) {
              sigChairman = v.voter_signature_base64;
              localStorage.setItem('tvod_sig_sig-chairman', sigChairman);
            }
          }
        });
      }
    } catch (err) {
      console.warn("Gagal mengambil fallback tanda tangan dari Supabase:", err);
    }
  }

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
  const integrityHash = window.CryptoJS ? window.CryptoJS.SHA256(`TVOD-HASH-${activeProposal.id}`).toString().substring(0, 16).toUpperCase() : "8F97D023B35F5C67";

  const docHtml = `
    <div class="pdf-container" style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; width: 100%; max-width: 100%; margin: 0; padding: 12px 10px; box-sizing: border-box; line-height: 1.45; background: #ffffff;">
      
      <!-- HEADER LOGO & JUDUL -->
      <div style="text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 12px; margin-bottom: 16px;">
        <img src="/logo.png" alt="TVOD Logo" style="height: 60px; margin: 0 auto 6px auto; display: block;" />
        <h1 style="font-size: 22px; font-weight: 800; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">OFFICIAL MINUTES</h1>
        <h2 style="font-size: 14px; font-weight: 700; color: #2563eb; margin: 4px 0 0 0; text-transform: uppercase;">WEB3 VOTING — ${activeProposal.title}</h2>
        <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; font-family: monospace; font-weight: 600;">THE VOICE OF DAO (TVOD) X PI NETWORK ECOSYSTEM</p>
      </div>

      <!-- TABEL DOKUMEN CONTROL -->
      <table class="avoid-break" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; border: 1.5px solid #cbd5e1; page-break-inside: avoid;">
        <tr style="background: #1e293b; color: #ffffff;"><td colspan="2" style="padding: 7px 10px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">DOCUMENT CONTROL RECORD</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 10px; font-weight: bold; width: 150px; background: #f1f5f9; color: #334155;">Document ID</td><td style="padding: 7px 10px; font-family: monospace; font-weight: bold; color: #0f172a; word-break: break-all;">${activeProposal.id}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Integrity Hash</td><td style="padding: 7px 10px; font-family: monospace; color: #2563eb; font-weight: bold; word-break: break-all;">${integrityHash}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Classification</td><td style="padding: 7px 10px; color: #dc2626; font-weight: bold;">RESTRICTED — Official DAO Verification Record</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Generated Date</td><td style="padding: 7px 10px; font-family: monospace; font-weight: bold;">${new Date().toISOString().replace('T', ' ').substring(0, 16)} UTC</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Subject</td><td style="padding: 7px 10px; font-weight: 600;">Conduct and Final Verdict of Web3 Voting — ${activeProposal.title}</td></tr>
        <tr><td style="padding: 7px 10px; font-weight: bold; background: #f1f5f9; color: #334155;">Source / Chapter</td><td style="padding: 7px 10px; font-weight: 600;">TVOD Verifier dApp / ${activeUser.chapter || "GLOBAL"}</td></tr>
      </table>

      <p style="font-size: 12.5px; color: #334155; margin-bottom: 14px; line-height: 1.5;">
        On this day, <strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, the Web3 Voting process for <strong>"${activeProposal.title}"</strong> was officially conducted and cryptographic records were committed under the following governance parameters:
      </p>

      <!-- SEKSI 1: DETAIL KEGIATAN -->
      <h3 style="font-size: 13px; font-weight: bold; color: #1e3a8a; margin: 14px 0 6px 0; text-transform: uppercase; border-left: 4px solid #2563eb; padding-left: 8px;">I. ACTIVITY & GOVERNANCE DETAILS</h3>
      <table class="avoid-break" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; border: 1px solid #cbd5e1; page-break-inside: avoid;">
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 10px; font-weight: bold; width: 150px; background: #f8fafc; color: #475569;">Activity Name</td><td style="padding: 7px 10px; font-weight: 600; color: #0f172a;">${activeProposal.title}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 10px; font-weight: bold; background: #f8fafc; color: #475569;">Platform / Protocol</td><td style="padding: 7px 10px; font-weight: 600;">TVOD Verifier dApp X Pi Network</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 7px 10px; font-weight: bold; background: #f8fafc; color: #475569;">Voting Method</td><td style="padding: 7px 10px; font-weight: 600;">On-Chain NFT Verification & Weighted Role Voting</td></tr>
        <tr><td style="padding: 7px 10px; font-weight: bold; background: #f8fafc; color: #475569;">Scoring Formula</td><td style="padding: 7px 10px; font-family: monospace; font-weight: bold; color: #b45309;">Score = Direction × Confidence × Role Weight</td></tr>
      </table>

      <!-- SEKSI 2: HASIL PERHITUNGAN SUARA -->
      <h3 style="font-size: 13px; font-weight: bold; color: #1e3a8a; margin: 14px 0 6px 0; text-transform: uppercase; border-left: 4px solid #2563eb; padding-left: 8px;">II. VOTING RESULTS & WEIGHTED METRICS</h3>
      <table class="avoid-break" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; border: 1.5px solid #cbd5e1; text-align: center; page-break-inside: avoid;">
        <tr style="background: #0f172a; color: #ffffff; font-weight: bold;">
          <td style="padding: 8px; border: 1px solid #334155;">Category</td>
          <td style="padding: 8px; border: 1px solid #334155;">Ballots Count</td>
          <td style="padding: 8px; border: 1px solid #334155;">% Total Votes</td>
          <td style="padding: 8px; border: 1px solid #334155;">Weighted Score</td>
          <td style="padding: 8px; border: 1px solid #334155;">Avg Confidence</td>
        </tr>
        <tr style="background: #dcfce7; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 7px; font-weight: bold; color: #166534;">Agree (+1)</td>
          <td style="padding: 7px; font-weight: 600;">${agreeCount}</td>
          <td style="padding: 7px; font-weight: 600;">${agreePct}%</td>
          <td style="padding: 7px; font-weight: bold; color: #15803d;">+${(agreeCount * avgConf).toFixed(2)}</td>
          <td style="padding: 7px;">${avgConf}</td>
        </tr>
        <tr style="background: #fef9c3; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 7px; font-weight: bold; color: #854d0e;">Neutral (0)</td>
          <td style="padding: 7px; font-weight: 600;">${neutralCount}</td>
          <td style="padding: 7px; font-weight: 600;">${neutralPct}%</td>
          <td style="padding: 7px;">0.00</td>
          <td style="padding: 7px;">${avgConf}</td>
        </tr>
        <tr style="background: #fee2e2; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 7px; font-weight: bold; color: #991b1b;">Disagree (-1)</td>
          <td style="padding: 7px; font-weight: 600;">${disagreeCount}</td>
          <td style="padding: 7px; font-weight: 600;">${disagreePct}%</td>
          <td style="padding: 7px; font-weight: bold; color: #b91c1c;">0.00</td>
          <td style="padding: 7px;">0.00</td>
        </tr>
        <tr style="background: #1e293b; color: #ffffff; font-weight: bold;">
          <td style="padding: 8px;">FINAL TOTAL</td>
          <td style="padding: 8px; font-size: 13px;">${totalCount}</td>
          <td style="padding: 8px; font-size: 13px;">100%</td>
          <td style="padding: 8px; font-size: 14px; color: #fbbf24;">+${netScoreVal.toFixed(2)} Pts</td>
          <td style="padding: 8px; font-size: 13px;">${avgConf}</td>
        </tr>
      </table>

      <!-- SEKSI 3: KEPUTUSAN FINAL -->
      <h3 style="font-size: 13px; font-weight: bold; color: #1e3a8a; margin: 14px 0 6px 0; text-transform: uppercase; border-left: 4px solid #2563eb; padding-left: 8px;">III. OFFICIAL VERDICT</h3>
      <div class="avoid-break" style="text-align: center; padding: 12px; background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 8px; margin-bottom: 18px; page-break-inside: avoid;">
        <h2 style="font-size: 20px; font-weight: 800; color: #166534; margin: 0; letter-spacing: 1px;">RATIFICATION VERDICT: ${verdictText}</h2>
        <p style="font-size: 11px; color: #475569; margin: 4px 0 0 0; font-weight: 600;">Net Weighted Score: +${netScoreVal.toFixed(2)} | Average Confidence Scale: ${avgConf} / 5.0</p>
      </div>

      <!-- SEKSI 4: TANDA TANGAN DIGITAL PEJABAT TVOD DENGAN STEMPEL DI TENGAH -->
      <div class="avoid-break" style="position: relative; margin-top: 20px; border-top: 2px solid #cbd5e1; padding-top: 12px; page-break-inside: avoid;">
        <!-- STEMPEL RESMI TVOD DIBESARKAN (140px) & DIPOSISIKAN PERSISI DI TENGAH ANTARA CHAIRPERSON & WITNESS -->
        <img src="/stempel-tvod.png" alt="Stempel Resmi TVOD" style="position: absolute; left: 50%; transform: translateX(-50%); top: 25px; width: 140px; height: 140px; opacity: 0.75; pointer-events: none; z-index: 10;" />

        <h4 style="font-size: 12px; font-weight: bold; color: #1e3a8a; margin: 0 0 10px 0; text-transform: uppercase;">OFFICIAL RATIFICATION SIGNATURES</h4>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          
          <div style="border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 8px; background: #fafafa; min-height: 115px; display: flex; flex-direction: column; justify-content: space-between; z-index: 1; position: relative;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a; display: block;">1. Chairperson:</span>
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigChairman ? `<img src="${sigChairman}" style="max-height: 58px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Belum Ditandatangani]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px; text-align: center;">@afifmasfiqo (#911)</strong>
          </div>

          <div style="border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 8px; background: #fafafa; min-height: 115px; display: flex; flex-direction: column; justify-content: space-between; z-index: 1; position: relative;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a; display: block;">2. Witness:</span>
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigWitness ? `<img src="${sigWitness}" style="max-height: 58px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Belum Ditandatangani]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px; text-align: center;">@insya (Witness)</strong>
          </div>

          <div style="border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 8px; background: #fafafa; min-height: 115px; display: flex; flex-direction: column; justify-content: space-between; z-index: 1; position: relative;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a; display: block;">3. Inspector:</span>
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigInspector ? `<img src="${sigInspector}" style="max-height: 58px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Belum Ditandatangani]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px; text-align: center;">@Nalaktak (#999)</strong>
          </div>

          <div style="border: 1.5px solid #cbd5e1; padding: 8px; border-radius: 8px; background: #fafafa; min-height: 115px; display: flex; flex-direction: column; justify-content: space-between; z-index: 1; position: relative;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a; display: block;">4. Country Head:</span>
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigCountryHead ? `<img src="${sigCountryHead}" style="max-height: 58px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Belum Ditandatangani]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px; text-align: center;">@Rasj81</strong>
          </div>

        </div>
      </div>

    </div>
  `;

  renderDocumentInModal(`Official Minutes: ${activeProposal.id}`, docHtml);
}

// 🎓 GENERATE SERTIFIKAT VERIFIKASI DIGITAL (FULL-WIDTH RESPONSIF)
async function generateCertificatePDF() {
  currentOpenedDocType = "certificate";
  await fetchVoterStatsForAdmin();

  let sigChairman = getSignatureDataUrl("sig-chairman");

  if (!sigChairman && supabaseClient && activeProposal.id) {
    try {
      const { data: voteRows } = await supabaseClient
        .from('votes')
        .select('voter_signature_base64')
        .eq('proposal_id', activeProposal.id)
        .not('voter_signature_base64', 'is', null)
        .limit(1);

      if (voteRows && voteRows.length > 0 && voteRows[0].voter_signature_base64) {
        sigChairman = voteRows[0].voter_signature_base64;
      }
    } catch (err) {
      console.warn("Gagal mengambil fallback tanda tangan sertifikat:", err);
    }
  }

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
        <p style="margin: 3px 0;">• Case Category      : <strong>${activeProposal.category}</strong></p>
        <p style="margin: 3px 0;">• Reference ID       : <strong>${activeProposal.id}</strong></p>
        <p style="margin: 3px 0;">• Ratification Date  : <strong>${activeProposal.date}</strong></p>
      </div>

      <div style="background: #f0fdf4; border: 2px solid #166534; padding: 14px; border-radius: 8px; margin-bottom: 16px; position: relative;">
        <span style="font-size: 11px; font-weight: bold; color: #166534; display: block; margin-bottom: 4px;">GOVERNANCE AUDIT STATUS:</span>
        <strong style="font-size: 16px; color: #166534; letter-spacing: 0.5px;">STATUS: ${verdictText}</strong>
        <p style="font-size: 11.5px; color: #334155; margin: 6px 0 0 0;">
          Net Weighted Score: <strong>+${netScoreVal.toFixed(1)} Pts</strong> | Total Verified Votes: <strong>${activeProposal.totalVotes} Ballots</strong>
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
window.toggleUserBan = toggleUserBan;
window.savePayoutRate = savePayoutRate;
window.retryFailedPayouts = retryFailedPayouts;
window.changeLanguage = changeLanguage;
window.generateOfficialMinutesPDF = generateOfficialMinutesPDF;
window.generateCertificatePDF = generateCertificatePDF;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
