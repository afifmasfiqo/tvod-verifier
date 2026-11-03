// api/payout.js - Backend Vercel Serverless Function untuk Payout Pi Otomatis
export default async function handler(req, res) {
  // 1. Validasi Method HTTP (Hanya menerima POST request)
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed. Gunakan POST.' 
    });
  }

  // 2. Ambil data dari payload request frontend
  const { walletAddress, amount, username, voteHash } = req.body || {};

  if (!walletAddress || !amount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Wallet Address dan Amount wajib diisi.' 
    });
  }

  // 3. Ambil API Key Pi Network dari Environment Variable Vercel
  const PI_API_KEY = process.env.PI_API_KEY;

  if (!PI_API_KEY) {
    return res.status(500).json({ 
      success: false, 
      message: 'PI_API_KEY belum dikonfigurasi di Environment Variables Vercel.' 
    });
  }

  try {
    // 4. Kirim Permintaan Transaksi Payout ke Pi Platform Server API (v2 Payments)
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
      console.error("Pi API Payout Error:", data);
      return res.status(piResponse.status).json({ 
        success: false, 
        message: data.message || 'Gagal memproses pembayaran melalui Pi Platform API.',
        error: data 
      });
    }

    // 5. Kembalikan respons sukses ke frontend
    return res.status(200).json({
      success: true,
      message: `Insentif sebesar ${amount} Pi berhasil dikirim ke Wallet ${walletAddress}`,
      paymentId: data.identifier || data.id
    });

  } catch (err) {
    console.error("Payout Serverless Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Terjadi kesalahan pada server backend.' 
    });
  }
}
