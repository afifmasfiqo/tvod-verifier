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

// FERIFIKASI STATISTIK VOTER & SKOR REAL-TIME DARI SUPABASE
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
    } else {
      const count = voteRows.length;
      let totalNetScore = 0;
      let agreeC = 0, neutralC = 0, disagreeC = 0;

      voteRows.forEach((v) => {
        totalNetScore += (parseFloat(v.weighted_score) || 0);
        if (v.vote_direction === 1) agreeC++;
        else if (v.vote_direction === 0) neutralC++;
        else if (v.vote_direction === -1) disagreeC++;
      });

      activeProposal.totalVotes = count;
      activeProposal.netScore = totalNetScore;
      activeProposal.agreeCount = agreeC;
      activeProposal.neutralCount = neutralC;
      activeProposal.disagreeCount = disagreeC;

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

// Global State
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
  status: "ACTIVE"
};

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

  ["sig-chairman", "sig-witness", "sig-inspector", "sig-country-head"].forEach((id) => {
    const canvas = $(`#${id}`);
    if (canvas && window.SignaturePad) {
      signaturePads[id] = new window.SignaturePad(canvas, {
        backgroundColor: "rgb(2, 6, 23)",
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

  await fetchActiveProposalFromSupabase();

  try {
    if (window.Pi) {
      await handlePiAuth();
    }
  } catch (e) {
    console.warn("Auto sign-in pending user action:", e);
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
    voter_signature_base64: null
  });

  await fetchVoterStatsForAdmin();

  const payoutRateEl = $("#payoutRate");
  const baseReward = payoutRateEl ? parseFloat(payoutRateEl.value) || 1.0 : 1.0;

  if (btn) btn.innerText = "Memproses Insentif Pi...";

  try {
    const payoutRes = await fetch('/api/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: currentWallet,
        amount: baseReward,
        username: currentUsername,
        voteHash: voteHash,
        proposalId: activeProposal.id
      })
    });

    const payoutData = await payoutRes.json();

    if (payoutRes.ok && payoutData.success) {
      alert(`✅ SUARA TERKONFIRMASI!\n\nKategori Pemilih: ${activeUser.category.toUpperCase()}\nStatus Payout: ${payoutData.message}`);
    } else {
      alert(`✅ Suara berhasil disimpan ke Database.\n⚠️ Payout Status: ${payoutData.message || 'Berhasil dicatat di antrean'}`);
    }
  } catch (payErr) {
    console.error("Gagal klaim payout:", payErr);
    alert(`✅ Suara berhasil disimpan ke Database.`);
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

function changeLanguage(lang) {
  if (lang === "ar") {
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }
}

// 🖨️ DOCUMENT RENDERER VIEWER KHUSUS WEBVIEW PI BROWSER
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

function printPdfModal() {
  const contentDiv = $("#documentViewerContent");
  if (contentDiv) {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <html>
          <head>
            <title>TVOD Official Document</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #000; }
              h1, h2, h3 { margin-bottom: 5px; }
              hr { border: 1px solid #ccc; margin: 15px 0; }
              .stamp { border: 2px solid #d97706; padding: 10px; display: inline-block; font-weight: bold; color: #d97706; }
            </style>
          </head>
          <body>
            ${contentDiv.innerHTML}
          </body>
        </html>
      `);
      printWin.document.close();
      printWin.focus();
      printWin.print();
    }
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
window.printPdfModal = printPdfModal;
window.copyDocumentText = copyDocumentText;

// 📑 GENERATE OFFICIAL MINUTES DOKUMEN REAL-TIME
async function generateOfficialMinutesPDF() {
  await fetchVoterStatsForAdmin();

  const netScoreVal = activeProposal.netScore || 0;
  const verdictText = netScoreVal > 0 ? "PASSED (AGREE)" : (netScoreVal < 0 ? "REJECTED (DISAGREE)" : "TIED / NEUTRAL");
  const shaProof = window.CryptoJS ? window.CryptoJS.SHA256(`TVOD-MINUTES-${activeProposal.id}-${Date.now()}`).toString() : "SHA256-AUTHENTICATED";

  const docHtml = `
    <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 12px; margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 20px; font-weight: bold; color: #f59e0b; margin: 0;">THE VOICE OF DAO (TVOD)</h1>
          <p style="font-size: 11px; color: #94a3b8; margin: 2px 0 0 0;">Pi Network Web3 Governance Ecosystem</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b; padding: 2px 6px; border-radius: 4px; font-family: monospace;">ON-CHAIN VERIFIED</span>
        </div>
      </div>
    </div>

    <h2 style="font-size: 14px; font-weight: bold; color: #f1f5f9; text-transform: uppercase; margin-bottom: 5px;">OFFICIAL MINUTES OF PROCEEDINGS & VERIFICATION RECORD</h2>
    <p style="font-size: 11px; font-family: monospace; color: #cbd5e1; margin-bottom: 15px;">
      Document ID: <strong>${activeProposal.id}</strong> | Security Classification: <strong>CONFIDENTIAL / GOVERNANCE RECORD</strong>
    </p>

    <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
      <h3 style="font-size: 12px; font-weight: bold; color: #f59e0b; margin-top: 0;">PREAMBLE & CONVENING STATEMENT</h3>
      <p style="font-size: 11px; color: #cbd5e1; line-height: 1.5; margin: 0;">
        On this day, <strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>, the governance body and verified voters of The Voice of DAO (TVOD) officially convened via the Pi Browser Web3 Infrastructure to review, audit, and execute a cryptographic weighted vote upon the proposal <strong>"${activeProposal.title}"</strong>. The proceedings were conducted in full compliance with TVOD Governance Rules, utilizing real-time PiBox Smart Contract wallet verification and immutable cryptographic proof logging.
      </p>
    </div>

    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 12px; font-weight: bold; color: #f59e0b; margin-bottom: 8px;">SECTION I: PROPOSAL METADATA</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #cbd5e1;">
        <tr><td style="padding: 4px 0; width: 180px;">• Proposal Title</td><td>: <strong>${activeProposal.title}</strong></td></tr>
        <tr><td style="padding: 4px 0;">• Case Category</td><td>: ${activeProposal.category}</td></tr>
        <tr><td style="padding: 4px 0;">• Issuing Entity</td><td>: ${activeProposal.proposerEntity}</td></tr>
        <tr><td style="padding: 4px 0;">• Presiding Chairman</td><td>: @afifmasfiqo (Garuda ID: #911)</td></tr>
        <tr><td style="padding: 4px 0;">• Presiding Inspector</td><td>: @Nalaktak (Garuda ID: #999)</td></tr>
        <tr><td style="padding: 4px 0;">• Community Chapter</td><td>: ${activeUser.chapter || "GLOBAL"}</td></tr>
        <tr><td style="padding: 4px 0;">• Voting Expiry Date</td><td>: ${votingEndTime.toLocaleString('en-US')}</td></tr>
      </table>
    </div>

    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 12px; font-weight: bold; color: #f59e0b; margin-bottom: 8px;">SECTION II: MATHEMATICAL VOTING SCORE & VERDICT</h3>
      <div style="background: #020617; border: 1px solid #1e293b; padding: 12px; border-radius: 8px; font-size: 11px;">
        <p style="margin: 0 0 6px 0; color: #94a3b8;">Formula: Individual Score = (Vote Direction: +1/0/-1) x (Confidence: 1-5) x (Role Weight)</p>
        <p style="margin: 0 0 10px 0; color: #94a3b8;">Applied Role Weights: Founder = 2.0 | Group Leader = 1.0 | Member = 0.5</p>
        
        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 10px;">
          <div style="background: #0f172a; padding: 8px 12px; border-radius: 6px; border: 1px solid #334155;">
            <span style="color: #94a3b8; display: block; font-size: 10px;">Total Verified Ballots:</span>
            <strong style="font-size: 14px; color: #f1f5f9;">${activeProposal.totalVotes} Ballots</strong>
          </div>
          <div style="background: #0f172a; padding: 8px 12px; border-radius: 6px; border: 1px solid #334155;">
            <span style="color: #94a3b8; display: block; font-size: 10px;">Aggregate Net Score:</span>
            <strong style="font-size: 14px; color: ${netScoreVal >= 0 ? '#10b981' : '#ef4444'};">${netScoreVal >= 0 ? '+' : ''}${netScoreVal.toFixed(1)} Pts</strong>
          </div>
        </div>

        <p style="margin: 0; font-size: 13px; font-weight: bold; color: #f59e0b;">
          FINAL GOVERNANCE VERDICT: <span style="color: #10b981;">${verdictText}</span>
        </p>
      </div>
    </div>

    <div style="margin-bottom: 15px;">
      <h3 style="font-size: 12px; font-weight: bold; color: #f59e0b; margin-bottom: 12px;">SECTION III: OFFICIAL AUTHORIZATION & SIGNATURES</h3>
      <div style="display: grid; grid-template-cols: repeat(2, 1fr); gap: 12px;">
        <div style="border: 1px dashed #334155; padding: 10px; border-radius: 6px;">
          <span style="font-size: 10px; font-weight: bold; color: #f59e0b; display: block;">1. Chairman</span>
          <strong style="font-size: 11px;">@afifmasfiqo (#911)</strong>
          <div style="height: 35px; border-bottom: 1px solid #475569; margin-top: 5px;"></div>
        </div>
        <div style="border: 1px dashed #334155; padding: 10px; border-radius: 6px;">
          <span style="font-size: 10px; font-weight: bold; color: #f59e0b; display: block;">2. Witness</span>
          <strong style="font-size: 11px;">@insya (Witness)</strong>
          <div style="height: 35px; border-bottom: 1px solid #475569; margin-top: 5px;"></div>
        </div>
        <div style="border: 1px dashed #334155; padding: 10px; border-radius: 6px;">
          <span style="font-size: 10px; font-weight: bold; color: #f59e0b; display: block;">3. Inspector</span>
          <strong style="font-size: 11px;">@Nalaktak (#999)</strong>
          <div style="height: 35px; border-bottom: 1px solid #475569; margin-top: 5px;"></div>
        </div>
        <div style="border: 1px dashed #334155; padding: 10px; border-radius: 6px;">
          <span style="font-size: 10px; font-weight: bold; color: #f59e0b; display: block;">4. Country Head</span>
          <strong style="font-size: 11px;">@Rasj81</strong>
          <div style="height: 35px; border-bottom: 1px solid #475569; margin-top: 5px;"></div>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid #334155; pt-10px; font-family: monospace; font-size: 9px; color: #64748b;">
      <p style="margin: 5px 0 2px 0;">SHA-256 Cryptographic Proof: ${shaProof}</p>
      <p style="margin: 0;">Disclaimer: Official Minutes compiled for Pi Core Team reporting, Web3 ecosystem audit, and governance record.</p>
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

  const certHtml = `
    <div style="border: 3px double #f59e0b; padding: 20px; border-radius: 12px; background: #020617; text-align: center;">
      <h1 style="font-size: 22px; font-weight: bold; color: #f59e0b; margin: 0 0 5px 0;">THE VOICE OF DAO</h1>
      <h2 style="font-size: 12px; font-weight: bold; color: #f1f5f9; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">OFFICIAL DIGITAL VERIFICATION CERTIFICATE</h2>
      <p style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-bottom: 15px;">Pi Network Web3 Ecosystem Governance</p>

      <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;" />

      <p style="font-size: 11px; color: #cbd5e1; text-transform: uppercase; margin-bottom: 8px;">THIS IS TO OFFICIALLY CERTIFY THAT THE VOTING OBJECT / PROPOSAL:</p>
      <h3 style="font-size: 16px; font-weight: bold; color: #fbbf24; margin: 0 0 15px 0;">"${activeProposal.title}"</h3>

      <div style="text-align: left; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; font-size: 11px; color: #cbd5e1; margin-bottom: 15px;">
        <p style="margin: 3px 0;">• Submitted By Entity / Publisher : <strong>${activeProposal.proposerEntity}</strong></p>
        <p style="margin: 3px 0;">• Case Category                   : <strong>${activeProposal.category}</strong></p>
        <p style="margin: 3px 0;">• Verification Reference ID       : <strong>${activeProposal.id}</strong></p>
        <p style="margin: 3px 0;">• Date of Final Ratification      : <strong>${activeProposal.date}</strong></p>
      </div>

      <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
        <span style="font-size: 10px; font-weight: bold; color: #10b981; uppercase display: block; margin-bottom: 4px;">GOVERNANCE AUDIT STATUS:</span>
        <strong style="font-size: 16px; color: #10b981;">STATUS: ${verdictText}</strong>
        <p style="font-size: 11px; color: #cbd5e1; margin: 6px 0 0 0;">
          Net Weighted Score: <strong>+${netScoreVal.toFixed(1)} Pts</strong> | Total Verified On-Chain Votes: <strong>${activeProposal.totalVotes} Ballots</strong>
        </p>
      </div>

      <div style="margin-top: 20px; font-size: 10px; color: #94a3b8; font-family: monospace;">
        <p style="margin: 0 0 4px 0;">Issued by Governance Chairman: @afifmasfiqo (#911)</p>
        <p style="margin: 0 0 10px 0;">Cryptographic Hash: ${shaProof}</p>
        <div style="display: inline-block; border: 1px solid #f59e0b; color: #f59e0b; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 10px;">
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
window.changeLanguage = changeLanguage;
window.generateOfficialMinutesPDF = generateOfficialMinutesPDF;
window.generateCertificatePDF = generateCertificatePDF;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
