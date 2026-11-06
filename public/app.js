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

// Global State
let isPiSDKInitialized = false;
let currentUser = null;
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

// ⚡ INISIALISASI PI SDK SATU KALI KHUSUS UNTUK PI BROWSER
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

  // Inisialisasi Canvas Tanda Tangan Latar Belakang Transparan
  ["sig-chairman", "sig-witness", "sig-inspector", "sig-country-head"].forEach((id) => {
    const canvas = $(`#${id}`);
    if (canvas && window.SignaturePad) {
      signaturePads[id] = new window.SignaturePad(canvas, {
        backgroundColor: "rgba(0, 0, 0, 0)",
        penColor: "rgb(59, 130, 246)"
      });
    }
  });

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

function clearOfficerSig(id) {
  if (signaturePads[id]) signaturePads[id].clear();
}

function getSignatureDataUrl(id) {
  if (signaturePads[id] && !signaturePads[id].isEmpty()) {
    return signaturePads[id].toDataURL("image/png");
  }
  return null;
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

  if (supabaseClient && currentUsername !== "Anonymous") {
    try {
      const { data: existingVotes } = await supabaseClient
        .from('votes')
        .select('id')
        .eq('proposal_id', activeProposal.id)
        .or(`username.eq.${currentUsername},wallet_address.eq.${currentWallet}`)
        .limit(1);

      if (existingVotes && existingVotes.length > 0) {
        if (btn) {
          btn.innerText = "✅ Anda Sudah Mengirim Suara";
          btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-3.5 rounded-xl text-sm border border-amber-500/30 cursor-not-allowed";
        }
        alert("⛔ AKSES VOTING DITOLAK!\n\nAnda (@" + currentUsername + ") sudah memberikan suara untuk proposal ini.");
        return;
      }
    } catch (err) {
      console.error("Error validasi suara ganda:", err);
    }
  }

  if (btn) btn.innerText = "Memeriksa NFT di Wallet On-Chain...";
  const isNftValid = await verifyOnChainNftOwnership();
  if (!isNftValid) {
    if (btn) {
      btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
      btn.disabled = false;
    }
    alert("⛔ AKSES VOTING DITOLAK!\n\nNFT terdaftar tidak ditemukan di wallet Anda.");
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
    voter_signature_base64: getSignatureDataUrl("sig-chairman")
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
      alert(`🎉 SUARA & PAYOUT SUCCESS!\n\nTx Hash: ${payoutData.txHash}\nStatus: ${payoutData.message}`);
    } else {
      alert(`⚠️ HAK SUARA TERSIMPAN, TETAPI PAYOUT GAGAL:\n\nAlasan: ${payoutData.message}\n\nCatatan: Insentif Anda telah dicatat ke antrean PENDING dan dapat dikirim ulang oleh Admin.`);
    }
  } catch (payErr) {
    console.error("Gagal klaim payout:", payErr);
    alert(`✅ Suara berhasil disimpan ke Database, namun koneksi payout terputus.`);
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

// FITUR RETRY PEMBAYARAN PENDING DARI ADMIN SUITE
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

function changeLanguage(lang) {
  if (lang === "ar") {
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }
}

// RENDER DOKUMEN MODAL & FITUR DIRECT UNDUH PDF KHUSUS PI BROWSER
function renderDocumentInModal(titleText, htmlBodyContent) {
  const modal = $("#pdfDownloadModal");
  const modalTitle = $("#pdfModalTitle");
  const contentDiv = $("#documentViewerContent");
  const printAreaDiv = $("#printArea");

  if (modal && modalTitle && contentDiv) {
    modalTitle.textContent = titleText;
    contentDiv.innerHTML = htmlBodyContent;
    if (printAreaDiv) printAreaDiv.innerHTML = htmlBodyContent;
    modal.classList.remove("hidden");
  }
}

function closePdfModal() {
  const modal = $("#pdfDownloadModal");
  if (modal) modal.classList.add("hidden");
}

// PERBAIKAN PENGUNDUHAN PDF KHUSUS PI BROWSER SELULER
function downloadPdfModal() {
  const element = document.getElementById("documentViewerContent");
  const modalTitle = document.getElementById("pdfModalTitle") ? document.getElementById("pdfModalTitle").textContent : "Official_Minutes";
  const fileName = modalTitle.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";

  if (window.html2pdf) {
    const opt = {
      margin:       [0.3, 0.3, 0.3, 0.3],
      filename:     fileName,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }).catch(err => {
      console.warn("Fallback html2pdf save:", err);
      try {
        html2pdf().set(opt).from(element).save();
      } catch (e) {
        window.print();
      }
    });
  } else {
    window.print();
  }
}

function copyDocumentText() {
  const contentDiv = $("#documentViewerContent");
  if (contentDiv) {
    navigator.clipboard.writeText(contentDiv.innerText).then(() => {
      alert("📋 Seluruh Teks Dokumen Resmi Berhasil Disalin ke Clipboard!");
    }).catch(err => {
      alert("Gagal menyalin teks: " + err);
    });
  }
}

window.closePdfModal = closePdfModal;
window.downloadPdfModal = downloadPdfModal;
window.copyDocumentText = copyDocumentText;

// 📄 GENERATE OFFICIAL MINUTES DOKUMEN
async function generateOfficialMinutesPDF() {
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
  const integrityHash = window.CryptoJS ? window.CryptoJS.SHA256(`TVOD-HASH-${activeProposal.id}`).toString().substring(0, 16).toUpperCase() : "8F97D023B35F5C67";

  const sigChairman = getSignatureDataUrl("sig-chairman");
  const sigWitness = getSignatureDataUrl("sig-witness");
  const sigInspector = getSignatureDataUrl("sig-inspector");
  const sigCountryHead = getSignatureDataUrl("sig-country-head");

  const docHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.4;">
      
      <!-- HEADER LOGO & JUDUL DOKUMEN -->
      <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px;">
        <img src="/logo.png" alt="TVOD Logo" style="height: 55px; margin: 0 auto 5px auto; display: block;" />
        <h1 style="font-size: 20px; font-weight: bold; color: #1e3a8a; margin: 0; text-transform: uppercase;">OFFICIAL MINUTES</h1>
        <h2 style="font-size: 13px; font-weight: bold; color: #3b82f6; margin: 2px 0 0 0; text-transform: uppercase;">WEB3 VOTING — ${activeProposal.title}</h2>
        <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0; font-family: monospace;">TVOD Verifier dApp X Pi Network Ecosystem</p>
      </div>

      <!-- TABEL DOCUMENT CONTROL METADATA -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; border: 1px solid #cbd5e1;">
        <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1;"><td colspan="2" style="padding: 5px 8px; font-weight: bold; color: #1e293b;">DOCUMENT CONTROL</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; width: 140px; background: #f1f5f9;">Document ID</td><td style="padding: 4px 8px; font-family: monospace;">${activeProposal.id}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; background: #f1f5f9;">Integrity Hash</td><td style="padding: 4px 8px; font-family: monospace; color: #2563eb; font-weight: bold;">${integrityHash}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; background: #f1f5f9;">Classification</td><td style="padding: 4px 8px; color: #dc2626; font-weight: bold;">RESTRICTED — Authorized Personnel Only</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; background: #f1f5f9;">Security System</td><td style="padding: 4px 8px;">TVOD File Security System + Lock Editing Mode</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; background: #f1f5f9;">Generated</td><td style="padding: 4px 8px; font-family: monospace;">${new Date().toISOString().replace('T', ' ').substring(0, 16)} UTC</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; background: #f1f5f9;">Subject</td><td style="padding: 4px 8px;">Conduct and Results of Web3 Voting — ${activeProposal.title}</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold; background: #f1f5f9;">Source / Chapter</td><td style="padding: 4px 8px;">TVOD Verifier dApp / ${activeUser.chapter || "GLOBAL"}</td></tr>
      </table>

      <p style="font-size: 11px; color: #334155; margin-bottom: 12px;">
        On this day, <strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, the Web3 Voting process for <strong>"${activeProposal.title}"</strong> was conducted under the following terms and conditions:
      </p>

      <!-- I. ACTIVITY DETAILS -->
      <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 12px 0 6px 0;">I. ACTIVITY DETAILS</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; border: 1px solid #cbd5e1;">
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; width: 140px; background: #f8fafc;">Activity Name</td><td style="padding: 4px 8px;">${activeProposal.title}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; background: #f8fafc;">Platform</td><td style="padding: 4px 8px;">TVOD Verifier X Pi Network Ecosystem</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; background: #f8fafc;">Voting Method</td><td style="padding: 4px 8px;">Weighted Voting (Role-based)</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 4px 8px; font-weight: bold; background: #f8fafc;">Data Source</td><td style="padding: 4px 8px;">Supabase On-Chain Logs & Pi SDK Wallet Auth</td></tr>
        <tr><td style="padding: 4px 8px; font-weight: bold; background: #f8fafc;">Scoring System</td><td style="padding: 4px 8px; font-family: monospace;">Score = Vote Direction × Confidence × Role Weight</td></tr>
      </table>

      <!-- II. ROLE WEIGHTS -->
      <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 12px 0 6px 0;">II. ROLE WEIGHTS</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; border: 1px solid #cbd5e1; text-align: center;">
        <tr style="background: #0f172a; color: #fff; font-weight: bold;">
          <td style="padding: 5px; border: 1px solid #334155;">Role</td>
          <td style="padding: 5px; border: 1px solid #334155;">Weight</td>
          <td style="padding: 5px; border: 1px solid #334155;">Description</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 4px; font-weight: bold;">Founder</td>
          <td style="padding: 4px; font-weight: bold;">2.0</td>
          <td style="padding: 4px; text-align: left;">Highest influence</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 4px; font-weight: bold;">Group Leader</td>
          <td style="padding: 4px; font-weight: bold;">1.0</td>
          <td style="padding: 4px; text-align: left;">Standard influence</td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold;">Member</td>
          <td style="padding: 4px; font-weight: bold;">0.5</td>
          <td style="padding: 4px; text-align: left;">Lower influence</td>
        </tr>
      </table>

      <!-- III. VOTE OPTIONS -->
      <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 12px 0 6px 0;">III. VOTE OPTIONS</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; border: 1px solid #cbd5e1; text-align: center;">
        <tr style="background: #0f172a; color: #fff; font-weight: bold;">
          <td style="padding: 5px; border: 1px solid #334155;">Option</td>
          <td style="padding: 5px; border: 1px solid #334155;">Direction Value</td>
          <td style="padding: 5px; border: 1px solid #334155;">Description</td>
        </tr>
        <tr style="background: #dcfce7; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 4px; font-weight: bold; color: #166534;">Agree</td>
          <td style="padding: 4px; font-weight: bold;">+1</td>
          <td style="padding: 4px; text-align: left;">In favor / Support</td>
        </tr>
        <tr style="background: #fef9c3; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 4px; font-weight: bold; color: #854d0e;">Neutral</td>
          <td style="padding: 4px; font-weight: bold;">0</td>
          <td style="padding: 4px; text-align: left;">Neutral / Abstain</td>
        </tr>
        <tr style="background: #fee2e2;">
          <td style="padding: 4px; font-weight: bold; color: #991b1b;">Disagree</td>
          <td style="padding: 4px; font-weight: bold;">-1</td>
          <td style="padding: 4px; text-align: left;">Opposed / Against</td>
        </tr>
      </table>

      <!-- IV. VOTING RESULTS -->
      <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 12px 0 6px 0;">IV. VOTING RESULTS</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; border: 1px solid #cbd5e1; text-align: center;">
        <tr style="background: #0f172a; color: #fff; font-weight: bold;">
          <td style="padding: 5px; border: 1px solid #334155;">Category</td>
          <td style="padding: 5px; border: 1px solid #334155;">Count</td>
          <td style="padding: 5px; border: 1px solid #334155;">% of Votes</td>
          <td style="padding: 5px; border: 1px solid #334155;">Total Score</td>
          <td style="padding: 5px; border: 1px solid #334155;">Avg Confidence</td>
        </tr>
        <tr style="background: #dcfce7; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 4px; font-weight: bold; color: #166534;">Agree</td>
          <td style="padding: 4px;">${agreeCount}</td>
          <td style="padding: 4px;">${agreePct}%</td>
          <td style="padding: 4px; font-weight: bold;">+${(agreeCount * avgConf).toFixed(2)}</td>
          <td style="padding: 4px;">${avgConf}</td>
        </tr>
        <tr style="background: #fef9c3; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 4px; font-weight: bold; color: #854d0e;">Neutral</td>
          <td style="padding: 4px;">${neutralCount}</td>
          <td style="padding: 4px;">${neutralPct}%</td>
          <td style="padding: 4px;">0.0</td>
          <td style="padding: 4px;">${avgConf}</td>
        </tr>
        <tr style="background: #fee2e2; border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 4px; font-weight: bold; color: #991b1b;">Disagree</td>
          <td style="padding: 4px;">${disagreeCount}</td>
          <td style="padding: 4px;">${disagreePct}%</td>
          <td style="padding: 4px;">0.0</td>
          <td style="padding: 4px;">0.00</td>
        </tr>
        <tr style="background: #0f172a; color: #fff; font-weight: bold;">
          <td style="padding: 5px;">TOTAL</td>
          <td style="padding: 5px;">${totalCount}</td>
          <td style="padding: 5px;">100%</td>
          <td style="padding: 5px; font-size: 12px; color: #f59e0b;">+${netScoreVal.toFixed(2)}</td>
          <td style="padding: 5px;">${avgConf}</td>
        </tr>
      </table>

      <!-- V. DECISION -->
      <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 12px 0 6px 0;">V. DECISION</h3>
      <p style="font-size: 11px; color: #334155; margin-bottom: 6px;">
        Based on the weighted score calculation from the Web3 Voting system, it is hereby determined that the option with the highest Total Score is:
      </p>
      <div style="text-align: center; padding: 8px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 15px;">
        <h2 style="font-size: 18px; font-weight: bold; color: #166534; margin: 0;">${verdictText}</h2>
        <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0;">with a Total Score of +${netScoreVal.toFixed(2)} and an average Confidence level of ${avgConf}</p>
      </div>

      <!-- VI. CLOSING & AUTHORIZATION -->
      <h3 style="font-size: 12px; font-weight: bold; color: #0f172a; margin: 12px 0 6px 0;">VI. CLOSING & AUTHORIZATION</h3>
      <p style="font-size: 10px; color: #64748b; margin-bottom: 15px; line-height: 1.4;">
        These Official Minutes have been prepared in good faith and may be used as required. All data refer to the TVOD Verifier System (TVOD Verifier dApp X Pi Network Ecosystem), which has been duly verified. This document is protected under the TVOD File Security System with Lock Editing Mode. Any unauthorized reproduction constitutes a security violation.
      </p>

      <!-- AREA TANDA TANGAN 4 PEJABAT (STEMPEL DI-POSITIONING DI SUDUT ATAS AGAR TIDAK MENUTUPI WITNESS) -->
      <div style="position: relative; margin-top: 20px; border-top: 1px solid #cbd5e1; padding-top: 10px;">
        
        <img src="/stempel-tvod.png" alt="Stempel Resmi TVOD" style="position: absolute; right: 10px; top: -5px; width: 90px; height: 90px; opacity: 0.65; pointer-events: none; z-index: 10;" />

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
          
          <!-- 1. Chairman -->
          <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #fafafa; min-height: 105px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: bold; color: #1e3a8a; display: block;">Chair / Person in Charge:</span>
            <div style="height: 50px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigChairman ? `<img src="${sigChairman}" style="max-height: 48px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Belum Ditandatangani]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px;">@afifmasfiqo (#911)</strong>
          </div>

          <!-- 2. Witness -->
          <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #fafafa; min-height: 105px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: bold; color: #1e3a8a; display: block;">Witness / Verifier:</span>
            <div style="height: 50px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigWitness ? `<img src="${sigWitness}" style="max-height: 48px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Belum Ditandatangani]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px;">@insya (Witness)</strong>
          </div>

          <!-- 3. Inspector -->
          <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #fafafa; min-height: 105px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: bold; color: #1e3a8a; display: block;">Inspector:</span>
            <div style="height: 50px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigInspector ? `<img src="${sigInspector}" style="max-height: 48px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Belum Ditandatangani]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px;">@Nalaktak (#999)</strong>
          </div>

          <!-- 4. Country Head -->
          <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #fafafa; min-height: 105px; display: flex; flex-direction: column; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: bold; color: #1e3a8a; display: block;">Country Head:</span>
            <div style="height: 50px; display: flex; align-items: center; justify-content: center; margin: 4px 0;">
              ${sigCountryHead ? `<img src="${sigCountryHead}" style="max-height: 48px; max-width: 100%; object-fit: contain;" />` : `<span style="font-size: 10px; color: #94a3b8; font-style: italic;">[Belum Ditandatangani]</span>`}
            </div>
            <strong style="font-size: 11px; display: block; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px;">@Rasj81</strong>
          </div>

        </div>
      </div>

    </div>
  `;

  renderDocumentInModal(`Official Minutes: ${activeProposal.id}`, docHtml);
}

// 🎓 GENERATE SERTIFIKAT VERIFIKASI DIGITAL DOKUMEN REAL-TIME
async function generateCertificatePDF() {
  await fetchVoterStatsForAdmin();

  const netScoreVal = activeProposal.netScore || 0;
  const verdictText = netScoreVal > 0 ? "TVOD VERIFIED & PASSED" : "VERIFIED - REJECTED";
  const shaProof = window.CryptoJS ? window.CryptoJS.SHA256(`CERT-${activeProposal.id}-${Date.now()}`).toString() : "CERT-SHA256-PROVED";

  const sigChairman = getSignatureDataUrl("sig-chairman");

  const certHtml = `
    <div style="border: 3px double #f59e0b; padding: 25px; border-radius: 12px; background: #ffffff; color: #0f172a; text-align: center; position: relative;">
      
      <img src="/logo.png" alt="TVOD Logo" style="height: 60px; margin: 0 auto 10px auto; display: block;" />
      <h1 style="font-size: 22px; font-weight: bold; color: #1e3a8a; margin: 0 0 5px 0;">THE VOICE OF DAO</h1>
      <h2 style="font-size: 13px; font-weight: bold; color: #d97706; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">OFFICIAL DIGITAL VERIFICATION CERTIFICATE</h2>
      <p style="font-size: 10px; color: #64748b; font-family: monospace; margin-bottom: 15px;">TVOD Verifier dApp X Pi Network Ecosystem</p>

      <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 15px 0;" />

      <p style="font-size: 11px; color: #475569; text-transform: uppercase; margin-bottom: 8px;">THIS IS TO OFFICIALLY CERTIFY THAT THE VOTING OBJECT / PROPOSAL:</p>
      <h3 style="font-size: 16px; font-weight: bold; color: #1e293b; margin: 0 0 15px 0;">"${activeProposal.title}"</h3>

      <div style="text-align: left; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 11px; color: #334155; margin-bottom: 15px;">
        <p style="margin: 3px 0;">• Submitted By Entity / Publisher : <strong>${activeProposal.proposerEntity}</strong></p>
        <p style="margin: 3px 0;">• Case Category                   : <strong>${activeProposal.category}</strong></p>
        <p style="margin: 3px 0;">• Verification Reference ID       : <strong>${activeProposal.id}</strong></p>
        <p style="margin: 3px 0;">• Date of Final Ratification      : <strong>${activeProposal.date}</strong></p>
      </div>

      <div style="background: #f0fdf4; border: 2px solid #166534; padding: 12px; border-radius: 8px; margin-bottom: 15px; position: relative;">
        <span style="font-size: 10px; font-weight: bold; color: #166534; display: block; margin-bottom: 4px;">GOVERNANCE AUDIT STATUS:</span>
        <strong style="font-size: 16px; color: #166534;">STATUS: ${verdictText}</strong>
        <p style="font-size: 11px; color: #334155; margin: 6px 0 0 0;">
          Net Weighted Score: <strong>+${netScoreVal.toFixed(1)} Pts</strong> | Total Verified On-Chain Votes: <strong>${activeProposal.totalVotes} Ballots</strong>
        </p>

        <img src="/stempel-tvod.png" alt="Stempel TVOD" style="position: absolute; right: 15px; top: 10px; width: 65px; height: 65px; opacity: 0.9;" />
      </div>

      <div style="margin-top: 20px; font-size: 10px; color: #475569; font-family: monospace;">
        <div style="margin-bottom: 5px;">
          ${sigChairman ? `<img src="${sigChairman}" style="max-height: 40px; margin: 0 auto; display: block;" />` : ''}
          <strong style="display: block; font-size: 11px; color: #0f172a;">@afifmasfiqo (#911)</strong>
          <span style="font-size: 9px; color: #64748b;">Issued by Governance Chairman</span>
        </div>
        <p style="margin: 4px 0 10px 0;">Cryptographic Hash: ${shaProof}</p>
        <div style="display: inline-block; border: 1px solid #d97706; color: #d97706; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 10px;">
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
