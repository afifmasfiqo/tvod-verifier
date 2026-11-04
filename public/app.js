// --- FUNGSI PROSES VOTING & KLAIM INSENTIF (1 USER = 1 SUARA) ---
async function handleCastVote(e) {
  e.preventDefault();

  const btn = $("#btnSubmitVote");
  
  // 1. KUNCI TOMBOL SEGERA UNTUK MENCEGAH DOUBLE CLICK
  if (btn) {
    if (btn.disabled) return; // Cegah eksekusi berulang jika sedang diproses
    btn.disabled = true;
    btn.innerText = "⏳ Memeriksa Hak Suara...";
  }

  // 2. CEK MASA VOTING PROPOSAL
  if (new Date().getTime() > votingEndTime.getTime()) {
    if (btn) {
      btn.innerText = "⛔ Sesi Voting Ditutup (Waktu Habis)";
      btn.className = "w-full bg-slate-800 text-slate-500 font-bold py-3 rounded-lg text-xs cursor-not-allowed";
    }
    alert("⛔ PROSES VOTING DITOLAK!\n\nSesi waktu voting untuk proposal ini telah berakhir.");
    return;
  }

  // 3. CEK CEGAH SUARA GANDA DI SUPABASE (1 VOTER = 1 KALI VOTE & KLAIM)
  const currentUsername = activeUser.username || "Anonymous";
  const currentWallet = activeUser.walletAddress || "";

  if (supabaseClient && currentUsername !== "Anonymous") {
    try {
      const { data: existingVotes, error: checkErr } = await supabaseClient
        .from('votes')
        .select('id')
        .eq('proposal_id', activeProposal.id)
        .or(`username.eq.${currentUsername},wallet_address.eq.${currentWallet}`)
        .limit(1);

      if (checkErr) console.warn("Pengecekan suara ganda:", checkErr.message);

      if (existingVotes && existingVotes.length > 0) {
        if (btn) {
          btn.innerText = "✅ Anda Sudah Mengirim Suara";
          btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-3 rounded-lg text-xs border border-amber-500/30 cursor-not-allowed";
        }
        alert("⛔ AKSES VOTING DITOLAK!\n\nAnda (@" + currentUsername + ") sudah memberikan suara dan mengklaim insentif untuk proposal ini.\nSatu akun/wallet hanya diizinkan memilih 1 kali per proposal.");
        return;
      }
    } catch (err) {
      console.error("Error validasi suara ganda:", err);
    }
  }

  // 4. VERIFIKASI KEPEMILIKAN NFT ON-CHAIN
  if (btn) btn.innerText = "Memeriksa NFT di Wallet On-Chain...";
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

  // 5. VALIDASI ARAH PILIHAN SUARA
  const selectedValue = document.querySelector('input[name="voteValue"]:checked');
  if (!selectedValue) {
    if (btn) {
      btn.innerText = "Kirim Suara Terenkripsi & Klaim Insentif Pi";
      btn.disabled = false;
    }
    alert("Pilih arah suara Anda (Agree / Neutral / Disagree).");
    return;
  }

  // 6. HITUNG SKOR TERBOBOT
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

  // 7. SIMPAN SUARA KE SUPABASE
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

  // 8. HITUNG NOMINAL INSENTIF PIPAYOUT
  const payoutRateEl = $("#payoutRate");
  const baseReward = payoutRateEl ? parseFloat(payoutRateEl.value) || 1.0 : 1.0;

  let rewardAmount = baseReward;
  if (activeUser.category === "delegator") {
    rewardAmount = baseReward * 0.5; // Delegator menerima 50%
  }

  // 9. PROSES KLAIM PAYOUT KE BACKEND API
  if (btn) btn.innerText = "Menghitung & Mengirim Insentif Pi...";

  try {
    const payoutRes = await fetch('/api/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: currentWallet,
        amount: rewardAmount,
        username: currentUsername,
        voteHash: voteHash
      })
    });

    const payoutData = await payoutRes.json();

    if (payoutData.success) {
      alert(`✅ SUARA TERKONFIRMASI & INSENTIF DIKIRIM!\n\nKategori Pemilih: ${activeUser.category.toUpperCase()}\nSkor Terbobot: ${individualScore}\nHash SHA-256: ${voteHash.substring(0, 16)}...\nInsentif: ${rewardAmount} Pi dikirim ke Wallet ${currentWallet}`);
    } else {
      alert(`✅ Suara berhasil disimpan (1x Vote).\n\n⚠️ Status Insentif (${rewardAmount} Pi): ${payoutData.message}`);
    }
  } catch (payErr) {
    console.error("Gagal klaim payout:", payErr);
    alert(`✅ Suara berhasil disimpan (1x Vote).\nInsentif sebesar ${rewardAmount} Pi akan dikreditkan saat koneksi server Pi Network aktif.`);
  }

  // 10. UBAH TAMPILAN TOMBOL MENJADI TERKUNCI SETELAH SUKSES VOTING
  if (btn) {
    btn.disabled = true;
    btn.innerText = "✅ Anda Sudah Mengirim Suara";
    btn.className = "w-full bg-slate-800 text-amber-400 font-bold py-3 rounded-lg text-xs border border-amber-500/30 cursor-not-allowed";
  }
}
