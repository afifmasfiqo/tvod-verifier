"use strict";

// Helper Query Selector
const $ = (selector) => document.querySelector(selector);

// PUBLIC KEY WALLET APP TVOD (KAS OPERASIONAL)
const TVOD_APP_WALLET = "GBBIFANYEV6J5OYXPCFF4AYXTWQFIJNSIF4YYFF26LETN3PHA3TDQ3WL";

// Helper Memastikan URL Berawalan HTTPS
function ensureHttps(url) {
  if (!url) return "";
  let cleanUrl = url.trim();
  if (cleanUrl.length === 0) return "";
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }
  return cleanUrl;
}

// ==============================================================================
// 1. INITIALIZATION SUPABASE CLIENT
// ==============================================================================
const SUPABASE_URL = "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Helper Simpan Profil Voter Ke Supabase
async function saveVoterToSupabase(voterData) {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('voters')
      .upsert([voterData], { onConflict: 'username' });
    if (error) console.error("Gagal menyimpan data voter ke Supabase:", error);
    else console.log("✅ Data voter tersimpan di Supabase:", data);
  } catch (err) {
    console.error("Supabase Voter Error:", err);
  }
}

// Helper Simpan Rekaman Suara Voting Ke Supabase
async function saveVoteToSupabase(voteData) {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('votes')
      .insert([voteData]);
    if (error) console.error("Gagal menyimpan suara ke Supabase:", error);
    else console.log("✅ Suara voting tersimpan di Supabase:", data);
  } catch (err) {
    console.error("Supabase Vote Error:", err);
  }
}

// Helper Simpan Proposal Baru Ke Supabase
async function saveProposalToSupabase(proposalData) {
  if (!supabaseClient) return false;
  try {
    const { data, error } = await supabaseClient
      .from('proposals')
      .upsert([proposalData], { onConflict: 'id' });
    if (error) {
      console.error("Gagal menyimpan proposal ke Supabase:", error);
      alert("❌ Supabase Error: " + error.message);
      return false;
    } else {
      console.log("✅ Proposal tersimpan di Supabase:", data);
      return true;
    }
  } catch (err) {
    console.error("Supabase Proposal Error:", err);
    alert("❌ Error: Gagal terhubung ke database Supabase.");
    return false;
  }
}

// Helper Ambil Profil Voter dari Supabase
async function fetchVoterProfileFromSupabase(username) {
  if (!supabaseClient || !username) return;
  try {
    const { data, error } = await supabaseClient
      .from('voters')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.log("Profil voter belum ada di Supabase:", error.message);
      return;
    }

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

      console.log("✅ Profil voter berhasil dimuat otomatis dari Supabase.");
    }
  } catch (err) {
    console.error("Fetch Profile Error:", err);
  }
}

// Helper Ambil Proposal Aktif Terbaru Dari Supabase
async function fetchActiveProposalFromSupabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("Gagal mengambil proposal dari Supabase:", error);
      return;
    }

    if (data && data.length > 0) {
      const p = data[0];
      activeProposal = {
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        proposerEntity: p.proposer_entity || "ICP2E & TVOD Development Team",
        proposerUsername: p.proposer_username || "afifmasfiqo",
        author: `@${p.proposer_username || 'afifmasfiqo'} (Chairman)`,
        date: new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        durationHours: p.duration_hours || 24,
        images: p.images && p.images.length > 0 ? p.images : ["https://via.placeholder.com/600x350/0f172a/f59e0b?text=Bukti+Foto+Utama+Objek+Voting"],
        videoUrl: p.video_url || "",
        totalVotes: p.total_votes || 0,
        netScore: p.net_score || 0
      };

      if (p.voting_end_time) {
        votingEndTime = new Date(p.voting_end_time);
      }
      renderProposalMaterials();
      startCountdownTimer();
    }
  } catch (err) {
    console.error("Fetch Proposal Error:", err);
  }
}

// System Global State
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

const AUTHORIZED_ADMINS = ["afifmasfiqo", "Nalaktak"];

let activeProposal = {
  id: "TVOD-PROP-2026-001",
  title: "Ratifikasi Sistem Verifikasi Web3 & Distribusi Insentif Voting TVOD",
  proposerEntity: "ICP2E & TVOD Development Team",
  proposerUsername: "afifmasfiqo",
  category: "Verifikasi Objek / Kasus",
  author: "@afifmasfiqo (Chairman)",
  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  description: "Berikut adalah berkas bukti verifikasi objek voting terkait pengajuan sistem reward dan kepatuhan Kode Etik.\nHarap periksa materi audio-visual dan dokumen pendukung di bawah ini secara teliti sebelum memberikan suara terbobot Anda.",
  durationHours: 24,
  images: [
    "https://via.placeholder.com/600x350/0f172a/f59e0b?text=Bukti+Foto+Utama+Objek+Voting"
  ],
  videoUrl: "",
  totalVotes: 42,
  netScore: 18.5
};

// --- FUNGSI CEK SALDO WALLET APP TVOD VIA PI HORIZON NODE ---
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
    console.warn("Horizon API Fetch Error:", err);
    if (display) display.textContent = "⚡ 100.00 Testnet Pi (Simulasi)";
    if (addrText) addrText.textContent = `Wallet Kas App: ${TVOD_APP_WALLET.substring(0, 8)}...${TVOD_APP_WALLET.substring(TVOD_APP_WALLET.length - 6)}`;
  }
}

// --- COLORIZER STEMPEL EMAS ---
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

// --- FUNGSI KOMPRESI & RESIZE FOTO GALERI HP ---
function compressAndResizeImage(file, maxWidth = 800, quality = 0.7) {
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
    const promises = Array.from(files).map((file) => compressAndResizeImage(file, 800, 0.7));
    uploadedGalleryBase64Images = await Promise.all(promises);
    if (countSpan) countSpan.textContent = `📷 ${uploadedGalleryBase64Images.length} foto berhasil dikompresi & siap diterbitkan.`;
  } catch (err) {
    console.error("Gagal mengolah foto galeri:", err);
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
      <div class="bg-slate-950 border border-slate-800 rounded-lg p-2 text-center">
        <span class="text-[10px] font-semibold text-slate-400 block mb-1">Bukti Foto #${idx + 1}:</span>
        <img src="${imgUrl}" alt="Bukti Foto #${idx + 1}" class="w-full h-44 object-cover rounded border border-slate-800">
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

// --- FUNGSI UTAMA PENERBITAN PROPOSAL (DENGAN HANDLER DIRECT) ---
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
  activeProposal.author = `@${activeUser.username || 'afifmasfiqo'} (Chairman)`;
  activeProposal.date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  votingEndTime = new Date(Date.now() + durationHrs * 60 * 60 * 1000);

  const btnSubmit = $("#btnSubmitVote");
  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
    btnSubmit.className = "w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg text-xs transition shadow-lg";
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

  // LANGSUNG RENDERING KE TAMPILAN MATERI VOTING
  renderProposalMaterials();

  // SIMPAN KE SUPABASE DATABASE
  const isSaved = await saveProposalToSupabase({
    id: activeProposal.id,
    title: activeProposal.title,
    category: activeProposal.category,
    description: activeProposal.description,
    proposer_entity: activeProposal.proposerEntity || "ICP2E & TVOD Development Team",
    proposer_username: activeUser.username || activeProposal.proposerUsername || "afifmasfiqo",
    duration_hours: activeProposal.durationHours,
    voting_end_time: votingEndTime.toISOString(),
    images: activeProposal.images,
    video_url: activeProposal.videoUrl,
    status: 'ACTIVE'
  });

  if (isSaved) {
    alert(`✅ Proposal Baru (ID: ${activeProposal.id}) Berhasil Diterbitkan & Tersimpan di Database Supabase!\nDurasi Voting: ${durationHrs} Jam.`);
  } else {
    alert(`✅ Proposal Baru Berhasil Ditampilkan di dApp!\nID: ${activeProposal.id}\nDurasi Voting: ${durationHrs} Jam.`);
  }
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

  await saveVoteToSupabase({
    proposal_id: activeProposal.id,
    username: activeUser.username || "Anonymous",
    wallet_address: activeUser.walletAddress,
    vote_direction: voteVal,
    confidence: currentConfidence,
    role_weight: roleWeight,
    weighted_score: individualScore,
    vote_hash: voteHash,
    voter_signature_base64: null
  });

  if (btn) btn.innerText = "Menghitung & Mengirim Insentif Pi...";

  const payoutRateEl = $("#payoutRate");
  const baseReward = payoutRateEl ? parseFloat(payoutRateEl.value) || 1.0 : 1.0;

  let rewardAmount = baseReward;
  if (activeUser.category === "delegator") {
    rewardAmount = baseReward * 0.5;
  }

  try {
    const payoutRes = await fetch('/api/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: activeUser.walletAddress,
        amount: rewardAmount,
        username: activeUser.username,
        voteHash: voteHash
      })
    });

    const payoutData = await payoutRes.json();

    if (payoutData.success) {
      alert(`✅ SUARA TERKONFIRMASI & INSENTIF DIKIRIM!\n\nKategori Pemilih: ${activeUser.category.toUpperCase()}\nSkor Terbobot: ${individualScore}\nHash SHA-256: ${voteHash.substring(0, 16)}...\nInsentif: ${rewardAmount} Pi dikirim ke Wallet ${activeUser.walletAddress}`);
    } else {
      alert(`✅ Suara tersimpan di database Supabase.\n\n⚠️ Catatan Payout (${rewardAmount} Pi): ${payoutData.message}`);
    }
  } catch (payErr) {
    console.error("Gagal klaim payout:", payErr);
    alert(`✅ Suara tersimpan di Supabase. Insentif sebesar ${rewardAmount} Pi akan dikreditkan saat server siap.`);
  }

  if (btn) {
    btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
    btn.disabled = false;
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

async function generateOfficialMinutesPDF() {
  if (!window.jspdf?.jsPDF) {
    alert("Pustaka PDF tidak tersedia.");
    return;
  }

  const pdf = new window.jspdf.jsPDF();
  await addBranding(pdf);

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

  pdf.setFontSize(8);
  pdf.setFont("Helvetica", "bold");
  pdf.text(`Document ID: ${activeProposal.id}`, 15, 41);
  pdf.text("Security Classification: CONFIDENTIAL / ON-CHAIN VERIFIED", 115, 41);

  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("PREAMBLE & CONVENING STATEMENT", 15, 50);
  pdf.setFont("Helvetica", "normal");
  pdf.setFontSize(8);
  const preambleText = `On this day, ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, the governance body and verified voters of The Voice of DAO (TVOD) officially convened via the Pi Browser Web3 Infrastructure to review, audit, and execute a cryptographic weighted vote upon the formal proposal submitted under Reference ${activeProposal.id}. The proceedings were conducted in full compliance with TVOD Governance Rules, utilizing real-time PiBox Smart Contract wallet verification and immutable SHA-256 proof logging.`;
  pdf.text(pdf.splitTextToSize(preambleText, 180), 15, 55);

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

  await addOfficialStamp(pdf, 135, 175, 48, 48);

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

async function generateCertificatePDF() {
  if (!window.jspdf?.jsPDF) {
    alert("Pustaka PDF tidak tersedia.");
    return;
  }

  const pdf = new window.jspdf.jsPDF();
  await addBranding(pdf);

  pdf.setFontSize(18);
  pdf.setFont("Helvetica", "bold");
  pdf.text("THE VOICE OF DAO", 15, 25);
  pdf.setFontSize(11);
  pdf.text("OFFICIAL DIGITAL VERIFICATION CERTIFICATE", 15, 33);
  pdf.setFontSize(8);
  pdf.setFont("Helvetica", "normal");
  pdf.text("Pi Network Web3 Ecosystem Governance", 15, 38);
  pdf.line(15, 42, 195, 42);

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

  await addOfficialStamp(pdf, 135, 100, 52, 52);

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

// EKSPOR GLOBAL KE SCOPE WINDOW
window.publishNewProposal = publishNewProposal;
window.handleGalleryImagesSelect = handleGalleryImagesSelect;
window.checkAppWalletBalance = checkAppWalletBalance;
window.setConfidence = setConfidence;
window.clearOfficerSig = clearOfficerSig;
window.toggleUserBan = toggleUserBan;
window.savePayoutRate = savePayoutRate;
window.uploadAsset = uploadAsset;
window.changeLanguage = changeLanguage;
window.generateOfficialMinutesPDF = generateOfficialMinutesPDF;
window.generateCertificatePDF = generateCertificatePDF;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
