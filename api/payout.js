const StellarSdk = require("@stellar/stellar-sdk");
const { createClient } = require("@supabase/supabase-js");

// 1. SUPABASE CLIENT CONFIGURATION
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

  const { walletAddress, amount, username, proposalId, category, ownerUsername } = req.body || {};

  if (!walletAddress || !amount) {
    return res.status(400).json({ success: false, message: 'Wallet address dan amount wajib diisi.' });
  }

  const cleanWallet = String(walletAddress).trim().replace(/['"\r\n\s]/g, '');
  const cleanUsername = String(username || 'Anonymous').trim();
  const cleanPropId = String(proposalId || 'TVOD-PROP').trim();
  const baseAmount = parseFloat(amount) || 1.0;

  // Validasi Format Wallet Pi (Mendukung awalan 'G' Pi Browser & 'M' PiBox/PiPet, 56 karakter)
  if (!/^[GM][A-Z2-7]{55}$/i.test(cleanWallet)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Format alamat wallet Pi tidak valid. Wajib diawali huruf G atau M dan berjumlah 56 karakter.' 
    });
  }

  // -------------------------------------------------------------
  // SKEMA SKORING & PEMBAGIAN INSENTIF DELEGATOR VS GARUDA OWNER
  // -------------------------------------------------------------
  let delegatorPayAmount = baseAmount;
  let ownerPayAmount = 0;
  let cleanOwnerUsername = ownerUsername ? String(ownerUsername).trim().replace(/^@/, '') : null;
  let ownerWalletAddress = null;

  if (category === 'delegator' && cleanOwnerUsername) {
    delegatorPayAmount = baseAmount * 0.5;
    ownerPayAmount = baseAmount * 0.5;

    try {
      const { data: ownerData } = await supabase
        .from('voters')
        .select('wallet_address')
        .eq('username', cleanOwnerUsername)
        .single();

      if (ownerData && ownerData.wallet_address) {
        ownerWalletAddress = String(ownerData.wallet_address).trim().replace(/['"\r\n\s]/g, '');
      }
    } catch (e) {
      console.warn("Wallet Pemilik Garuda belum terdaftar di database:", cleanOwnerUsername);
    }
  }

  // 1. Ambil & Sanitasi Secret Seed dari Vercel Environment Variables
  const rawSeed = process.env.PI_APP_WALLET_SEED || process.env.PI_PAYOUT_SEED || process.env.PI_APP_SEED;
  if (!rawSeed) {
    const errText = 'PI_APP_WALLET_SEED belum dikonfigurasi di Environment Variables Vercel.';
    await logFailure(cleanUsername, cleanWallet, delegatorPayAmount, cleanPropId, errText);
    if (cleanOwnerUsername && ownerPayAmount > 0) {
      await logFailure(cleanOwnerUsername, ownerWalletAddress || 'UNREGISTERED', ownerPayAmount, cleanPropId, errText);
    }
    return res.status(500).json({ success: false, message: errText });
  }

  const cleanSeed = String(rawSeed).trim().replace(/['"\r\n\s]/g, '');
  const Keypair = StellarSdk.Keypair || StellarSdk.default?.Keypair;
  let sourceKeypair;

  try {
    sourceKeypair = Keypair.fromSecret(cleanSeed);
  } catch (seedErr) {
    const errText = `Format Secret Seed di Vercel tidak valid (${seedErr.message}). Pastikan PI_APP_WALLET_SEED diawali huruf 'S' (56 karakter).`;
    await logFailure(cleanUsername, cleanWallet, delegatorPayAmount, cleanPropId, errText);
    if (cleanOwnerUsername && ownerPayAmount > 0) {
      await logFailure(cleanOwnerUsername, ownerWalletAddress || 'UNREGISTERED', ownerPayAmount, cleanPropId, errText);
    }
    return res.status(500).json({ success: false, message: errText });
  }

  try {
    const server = getHorizonServer();
    const TransactionBuilder = StellarSdk.TransactionBuilder || StellarSdk.default?.TransactionBuilder;
    const Operation = StellarSdk.Operation || StellarSdk.default?.Operation;
    const Asset = StellarSdk.Asset || StellarSdk.default?.Asset;

    // Load Akun Pengirim (Wallet Kas App)
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    // --- OPERASI 1: Pembayaran ke Voter (Delegator / Owner) ---
    let dest1Exists = true;
    try { 
      await server.loadAccount(cleanWallet); 
    } catch (e) { 
      dest1Exists = false; 
    }

    const op1 = dest1Exists
      ? Operation.payment({ destination: cleanWallet, asset: Asset.native(), amount: delegatorPayAmount.toString() })
      : Operation.createAccount({ destination: cleanWallet, startingBalance: delegatorPayAmount.toString() });

    // --- OPERASI 2 (Opsional): Bounty ke Pemilik Garuda Asli ---
    let op2 = null;
    let isOwnerPaidOnChain = false;

    if (ownerPayAmount > 0 && ownerWalletAddress && /^[GM][A-Z2-7]{55}$/i.test(ownerWalletAddress)) {
      let dest2Exists = true;
      try { 
        await server.loadAccount(ownerWalletAddress); 
      } catch (e) { 
        dest2Exists = false; 
      }

      op2 = dest2Exists
        ? Operation.payment({ destination: ownerWalletAddress, asset: Asset.native(), amount: ownerPayAmount.toString() })
        : Operation.createAccount({ destination: ownerWalletAddress, startingBalance: ownerPayAmount.toString() });
      
      isOwnerPaidOnChain = true;
    }

    // Ambil Fee Transaksi Dinamis
    let feeVal = "10000";
    try {
      const feeStats = await server.fetchBaseFee();
      if (feeStats) feeVal = (feeStats * (op2 ? 2 : 1)).toString();
    } catch (fErr) {
      feeVal = op2 ? "20000" : "10000";
    }

    // Susun Atomic Transaction Multi-Operation
    const txBuilder = new TransactionBuilder(sourceAccount, { fee: feeVal, networkPassphrase: PI_NETWORK_PASSPHRASE })
      .addOperation(op1);

    if (op2) {
      txBuilder.addOperation(op2);
    }

    const transaction = txBuilder.setTimeout(180).build();
    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);

    // -------------------------------------------------------------
    // LOGGING 3 LAPIS SUPABASE (Delegator + Garuda Owner)
    // -------------------------------------------------------------
    
    // Log Delegator / Voter Payment
    await logSuccess(cleanUsername, cleanWallet, delegatorPayAmount, cleanPropId, result.hash);

    // Log Garuda Owner Bounty Payment
    if (cleanOwnerUsername) {
      if (isOwnerPaidOnChain) {
        await logSuccess(cleanOwnerUsername, ownerWalletAddress, ownerPayAmount, cleanPropId, result.hash);
      } else {
        // Jika wallet Pemilik belum terdaftar saat delegator voting, catat ke pending_rewards sebagai UNPAID
        await supabase.from('pending_rewards').upsert([{
          username: cleanOwnerUsername,
          wallet_address: ownerWalletAddress || 'UNREGISTERED',
          proposal_id: cleanPropId,
          amount: ownerPayAmount,
          status: 'UNPAID',
          reason: `Bounty dari delegator @${cleanUsername}. Wallet pemilik belum terdaftar.`
        }], { onConflict: 'username,proposal_id' });
      }
    }

    const msgDetail = isOwnerPaidOnChain
      ? `BERHASIL ON-CHAIN! ${delegatorPayAmount} Pi ke @${cleanUsername} & Bounty ${ownerPayAmount} Pi ke @${cleanOwnerUsername}.`
      : `BERHASIL ON-CHAIN! ${delegatorPayAmount} Pi ke @${cleanUsername}. (Bounty @${cleanOwnerUsername} dicatat di Pending Rewards).`;

    return res.status(200).json({ success: true, message: msgDetail, txHash: result.hash });

  } catch (error) {
    console.error("Payout Processing Error:", error);
    let detailedError = error.message || 'Unknown Error';
    if (error?.response?.data?.extras?.result_codes) {
      detailedError = `Horizon Result Codes: ${JSON.stringify(error.response.data.extras.result_codes)}`;
    } else if (error?.data?.extras?.result_codes) {
      detailedError = `Horizon Result Codes: ${JSON.stringify(error.data.extras.result_codes)}`;
    } else if (error?.response?.data?.detail) {
      detailedError = `Horizon Detail: ${error.response.data.detail}`;
    }

    await logFailure(cleanUsername, cleanWallet, delegatorPayAmount, cleanPropId, detailedError);
    if (cleanOwnerUsername) {
      await logFailure(cleanOwnerUsername, ownerWalletAddress || 'UNKNOWN', ownerPayAmount, cleanPropId, detailedError);
    }

    return res.status(500).json({ success: false, message: `Gagal On-Chain: ${detailedError}` });
  }
};

// --- HELPER LOGGING FUNCTIONS ---
async function logSuccess(user, wallet, amt, propId, txHash) {
  await supabase.from('payout_logs').insert([{ username: user, wallet_address: wallet, amount: amt, proposal_id: propId, status: 'SUCCESS', tx_hash: txHash }]);
  await supabase.from('payout_queue').insert([{ username: user, wallet_address: wallet, amount: amt, proposal_id: propId, status: 'SUCCESS', tx_hash: txHash }]);
  await supabase.from('pending_rewards').upsert([{ username: user, wallet_address: wallet, proposal_id: propId, amount: amt, status: 'PAID', tx_hash: txHash, paid_at: new Date().toISOString() }], { onConflict: 'username,proposal_id' });
}

async function logFailure(user, wallet, amt, propId, errLog) {
  await supabase.from('payout_logs').insert([{ username: user, wallet_address: wallet, amount: amt, proposal_id: propId, status: 'FAILED', error_message: errLog }]);
  await supabase.from('payout_queue').insert([{ username: user, wallet_address: wallet, amount: amt, proposal_id: propId, status: 'PENDING', error_log: errLog }]);
  await supabase.from('pending_rewards').upsert([{ username: user, wallet_address: wallet, proposal_id: propId, amount: amt, status: 'UNPAID', reason: errLog }], { onConflict: 'username,proposal_id' });
}
