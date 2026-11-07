const StellarSdk = require("@stellar/stellar-sdk");
const { createClient } = require("@supabase/supabase-js");

// 1. SUPABASE CLIENT
const SUPABASE_URL = "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. PI NETWORK TESTNET CONFIGURATION
const PI_HORIZON_URL = "https://api.testnet.minepi.com";
const PI_NETWORK_PASSPHRASE = "Pi Testnet";

function getHorizonServer() {
  const ServerClass = 
    StellarSdk.Horizon?.Server || 
    StellarSdk.Server || 
    StellarSdk.default?.Horizon?.Server || 
    StellarSdk.default?.Server;
    
  if (!ServerClass) {
    throw new Error("Horizon Server constructor tidak ditemukan pada library stellar-sdk.");
  }
  return new ServerClass(PI_HORIZON_URL);
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { walletAddress, amount, username, proposalId } = req.body || {};

  if (!walletAddress || !amount) {
    return res.status(400).json({ success: false, message: 'Wallet address dan amount wajib diisi.' });
  }

  // 1. Ambil & Sanitasi Secret Seed dari Vercel Environment Variables
  const rawSeed = process.env.PI_PAYOUT_SEED || process.env.PI_APP_SEED;
  if (!rawSeed) {
    await supabase.from('payout_queue').insert([{
      username: username || 'Anonymous',
      wallet_address: String(walletAddress).trim(),
      amount: amount,
      proposal_id: proposalId || 'TVOD-PROP',
      status: 'PENDING',
      error_log: 'PI_PAYOUT_SEED / PI_APP_SEED belum dikonfigurasi di Environment Variables Vercel.'
    }]);

    return res.status(500).json({ 
      success: false, 
      message: 'Seed belum aktif di Vercel. Pastikan Environment Variable PI_PAYOUT_SEED atau PI_APP_SEED sudah di-set di Settings Vercel.' 
    });
  }

  // Hapus karakter tersembunyi, spasi, tanda petik tunggal/ganda, dan newline
  const cleanSeed = String(rawSeed).trim().replace(/['"\r\n\s]/g, '');
  const cleanWallet = String(walletAddress).trim().replace(/['"\r\n\s]/g, '');

  // Validasi Keypair dari Secret Seed
  const Keypair = StellarSdk.Keypair || StellarSdk.default?.Keypair;
  let sourceKeypair;
  try {
    sourceKeypair = Keypair.fromSecret(cleanSeed);
  } catch (seedErr) {
    const errorMsg = `Format Secret Seed di Vercel tidak valid (${seedErr.message}). Pastikan string Seed berawalan huruf 'S', berjumlah 56 karakter, tanpa spasi atau tanda petik.`;
    
    await supabase.from('payout_queue').insert([{
      username: username || 'Anonymous',
      wallet_address: cleanWallet,
      amount: amount,
      proposal_id: proposalId || 'TVOD-PROP',
      status: 'PENDING',
      error_log: errorMsg
    }]);

    return res.status(500).json({ success: false, message: errorMsg });
  }

  try {
    const server = getHorizonServer();
    const TransactionBuilder = StellarSdk.TransactionBuilder || StellarSdk.default?.TransactionBuilder;
    const Operation = StellarSdk.Operation || StellarSdk.default?.Operation;
    const Asset = StellarSdk.Asset || StellarSdk.default?.Asset;

    // Load Akun Pengirim (Wallet Kas App)
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    // Cek Keberadaan Akun Penerima (Wallet Voter)
    let destinationExists = true;
    try {
      await server.loadAccount(cleanWallet);
    } catch (e) {
      destinationExists = false;
    }

    // Tentukan Operasi (Payment jika akun sudah aktif, CreateAccount jika akun belum terdaftar di blockchain)
    const paymentOp = destinationExists
      ? Operation.payment({
          destination: cleanWallet,
          asset: Asset.native(),
          amount: amount.toString()
        })
      : Operation.createAccount({
          destination: cleanWallet,
          startingBalance: amount.toString()
        });

    // Ambil Fee Transaksi Dinamis
    let feeVal = "10000";
    try {
      const feeStats = await server.fetchBaseFee();
      if (feeStats) feeVal = feeStats.toString();
    } catch (fErr) {
      feeVal = "10000";
    }

    // Build Transaksi On-Chain
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: feeVal,
      networkPassphrase: PI_NETWORK_PASSPHRASE
    })
      .addOperation(paymentOp)
      .setTimeout(180)
      .build();

    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);

    await supabase.from('payout_queue').insert([{
      username: username || 'Anonymous',
      wallet_address: cleanWallet,
      amount: amount,
      proposal_id: proposalId || 'TVOD-PROP',
      status: 'SUCCESS',
      tx_hash: result.hash
    }]);

    return res.status(200).json({
      success: true,
      message: `BERHASIL ON-CHAIN! ${amount} Pi terkirim ke wallet voter.`,
      txHash: result.hash
    });

  } catch (error) {
    console.error("Payout Error:", error);

    let detailedError = error.message || 'Unknown Error';
    if (error?.response?.data?.extras?.result_codes) {
      detailedError = `Horizon Result Codes: ${JSON.stringify(error.response.data.extras.result_codes)}`;
    } else if (error?.data?.extras?.result_codes) {
      detailedError = `Horizon Result Codes: ${JSON.stringify(error.data.extras.result_codes)}`;
    } else if (error?.response?.data?.detail) {
      detailedError = `Horizon Detail: ${error.response.data.detail}`;
    }

    await supabase.from('payout_queue').insert([{
      username: username || 'Anonymous',
      wallet_address: cleanWallet,
      amount: amount,
      proposal_id: proposalId || 'TVOD-PROP',
      status: 'PENDING',
      error_log: detailedError
    }]);

    return res.status(500).json({
      success: false,
      message: `Gagal On-Chain: ${detailedError}`
    });
  }
};
