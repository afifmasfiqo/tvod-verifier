// api/payout.js - Backend Vercel Serverless Function dengan Log Otomatis ke Supabase

const SUPABASE_URL = "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";

// Helper fungsi untuk mencatat log payout ke Supabase secara langsung
async function logPayoutToSupabase(logData) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/payout_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(logData)
    });
    console.log("✅ Log payout berhasil dicatat ke Supabase:", logData.username);
  } catch (err) {
    console.error("❌ Gagal menyimpan log payout ke Supabase:", err);
  }
}

export default async function handler(req, res) {
  // 1. Validasi Method HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed. Gunakan POST.' 
    });
  }

  // 2. Ambil payload request
  const { walletAddress, amount, username, voteHash } = req.body || {};

  if (!walletAddress || !amount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Wallet Address dan Amount wajib diisi.' 
    });
  }

  // 3. Ambil API Key Pi Network
  const PI_API_KEY = process.env.PI_API_KEY;

  // Jika PI_API_KEY belum dikonfigurasi di Vercel, tetap catat ke Supabase dengan status SIMULATED/PENDING
  if (!PI_API_KEY) {
    const simTxId = `SIMULATED-${Date.now()}`;
    await logPayoutToSupabase({
      username: username || 'Anonymous',
      wallet_address: walletAddress,
      amount: parseFloat(amount),
      vote_hash: voteHash || '',
      status: 'SIMULATED',
      payment_id: simTxId
    });

    return res.status(200).json({ 
      success: true, 
      message: `Suara tersimpan. Payout ${amount} Pi dicatat dalam status simulasi (PI_API_KEY belum dipasang di Vercel).`,
      paymentId: simTxId
    });
  }

  try {
    // 4. Kirim Permintaan Payout ke Pi Platform Server API
    const piResponse = await fetch('https://api.minepi.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment: {
          amount: parseFloat(amount),
          memo: `Insentif Voting TVOD - Hash: ${(voteHash || '').substring(0, 8)}`,
          metadata: { voteHash, username },
          uid: username || walletAddress
        }
      })
    });

    const data = await piResponse.json();

    if (!piResponse.ok) {
      // Catat status FAILED ke Supabase
      await logPayoutToSupabase({
        username: username || 'Anonymous',
        wallet_address: walletAddress,
        amount: parseFloat(amount),
        vote_hash: voteHash || '',
        status: 'FAILED',
        payment_id: null
      });

      return res.status(piResponse.status).json({ 
        success: false, 
        message: data.message || 'Gagal memproses pembayaran melalui Pi Platform API.',
        error: data 
      });
    }

    const paymentId = data.identifier || data.id || `TX-${Date.now()}`;

    // 5. Catat status SUCCESS ke Supabase
    await logPayoutToSupabase({
      username: username || 'Anonymous',
      wallet_address: walletAddress,
      amount: parseFloat(amount),
      vote_hash: voteHash || '',
      status: 'SUCCESS',
      payment_id: paymentId
    });

    return res.status(200).json({
      success: true,
      message: `Insentif sebesar ${amount} Pi berhasil dikirim ke Wallet ${walletAddress}`,
      paymentId: paymentId
    });

  } catch (err) {
    console.error("Payout Serverless Error:", err);

    // Catat status ERROR ke Supabase
    await logPayoutToSupabase({
      username: username || 'Anonymous',
      wallet_address: walletAddress,
      amount: parseFloat(amount),
      vote_hash: voteHash || '',
      status: 'ERROR',
      payment_id: null
    });

    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Terjadi kesalahan pada server backend.' 
    });
  }
}
