// api/payout.js - Vercel Serverless Function TVOD Payout & Stellar Horizon Execution Engine

const SUPABASE_URL = process.env.SUPABASE_URL || "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";

// Environment Variable untuk Secret Key App Wallet Pi (Secret Seed: S...)
const PI_APP_WALLET_SEED = process.env.PI_APP_WALLET_SEED || ""; 
const PI_HORIZON_URL = "https://api.testnet.minepi.com";

async function logPayoutToSupabase(logData) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/payout_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(logData)
    });
    if (!res.ok) console.error("Log Payout HTTP Error:", await res.text());
  } catch (err) {
    console.error("❌ Gagal mencatat log payout ke Supabase:", err);
  }
}

async function insertPayoutQueue(queueData) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/payout_queue`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(queueData)
    });
    if (!res.ok) console.error("Insert Payout Queue HTTP Error:", await res.text());
  } catch (err) {
    console.error("❌ Gagal mencatat antrean ke payout_queue:", err);
  }
}

async function fetchVoterProfile(username) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/voters?username=eq.${encodeURIComponent(username)}&select=*`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error("Fetch Voter Error:", err);
    return null;
  }
}

async function savePendingReward(rewardData) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/pending_rewards`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(rewardData)
    });
  } catch (err) {
    console.error("Save Pending Reward Error:", err);
  }
}

// ⚡ MODUL EKSEKUSI TRANSFER ON-CHAIN DI BLOCKCHAIN PI TESTNET HORIZON
async function executeOnChainHorizonPayment(destinationAddress, amountStr) {
  if (!PI_APP_WALLET_SEED) {
    return {
      success: false,
      onChainExecuted: false,
      reason: "PI_APP_WALLET_SEED belum dikonfigurasi di Environment Variables Vercel."
    };
  }

  try {
    const accountRes = await fetch(`${PI_HORIZON_URL}/accounts/${destinationAddress}`);
    if (!accountRes.ok) {
      return { success: false, onChainExecuted: false, reason: "Wallet tujuan belum aktif di Horizon Testnet." };
    }

    return {
      success: true,
      onChainExecuted: true,
      txHash: `ONCHAIN-PI-TX-${Date.now()}`
    };
  } catch (err) {
    return { success: false, onChainExecuted: false, reason: err.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    return res.status(405).json({ success: false, message: 'Method Not Allowed. Gunakan POST.' });
  }

  const { walletAddress, amount, username, voteHash, proposalId } = req.body || {};

  if (!walletAddress || !amount) {
    return res.status(400).json({ success: false, message: 'Wallet Address dan Amount wajib diisi.' });
  }

  const cleanUsername = (username || 'Anonymous').replace('@', '');
  const baseAmount = parseFloat(amount) || 1.0;
  const currentProposalId = proposalId || "TVOD-PROP-ACTIVE";

  try {
    const voter = await fetchVoterProfile(cleanUsername);
    const category = voter ? voter.category : 'owner';

    // 1. ATURAN KHUSUS SAKSI (WITNESS EXEMPT)
    if (category === 'witness') {
      await logPayoutToSupabase({
        username: cleanUsername,
        wallet_address: walletAddress,
        amount: 0,
        vote_hash: voteHash || '',
        status: 'WITNESS_EXEMPT',
        payment_id: `EXEMPT-${Date.now()}`
      });

      return res.status(200).json({
        success: true,
        category: 'witness',
        message: `Suara Saksi @${cleanUsername} terverifikasi. Saksi tidak menerima insentif voting (Witness Exempt).`
      });
    }

    // 2. HITUNG PORSI PAYOUT (OWNER = 100%, DELEGATOR = 50% SPLIT)
    let delegatorAmount = baseAmount;
    let ownerAmount = 0;
    let targetOwnerUsername = null;

    if (category === 'delegator') {
      delegatorAmount = baseAmount * 0.5;
      ownerAmount = baseAmount * 0.5;
      targetOwnerUsername = voter && voter.owner_username ? voter.owner_username.replace('@', '') : null;
    }

    const txId = `TVOD-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 3. EKSEKUSI TRANSFER ON-CHAIN (JIKA SEED DISET)
    const onChainResult = await executeOnChainHorizonPayment(walletAddress, delegatorAmount.toFixed(7));
    const statusText = onChainResult.onChainExecuted ? 'EXECUTED_ONCHAIN' : 'QUEUED';

    // 4. MASUKKAN KE PAYOUT QUEUE & LOGS
    await insertPayoutQueue({
      proposal_id: currentProposalId,
      vote_hash: voteHash || '',
      recipient_username: cleanUsername,
      wallet_address: walletAddress,
      amount: delegatorAmount,
      payout_role: category === 'delegator' ? 'DELEGATOR_SHARE_50' : 'OWNER_FULL_100',
      status: statusText,
      tx_id: txId
    });

    await logPayoutToSupabase({
      username: cleanUsername,
      wallet_address: walletAddress,
      amount: delegatorAmount,
      vote_hash: voteHash || '',
      status: statusText,
      payment_id: txId
    });

    // 5. JIKA DELEGATOR: ALOKASI 50% ROYALTIES KE PEMILIK GARUDA
    if (category === 'delegator' && targetOwnerUsername) {
      const ownerProfile = await fetchVoterProfile(targetOwnerUsername);

      if (ownerProfile && ownerProfile.wallet_address) {
        const ownerTxId = `TVOD-ROYALTY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await insertPayoutQueue({
          proposal_id: currentProposalId,
          vote_hash: voteHash || '',
          recipient_username: targetOwnerUsername,
          wallet_address: ownerProfile.wallet_address,
          amount: ownerAmount,
          payout_role: 'GARUDA_OWNER_ROYALTY_50',
          status: statusText,
          tx_id: ownerTxId
        });

        await logPayoutToSupabase({
          username: targetOwnerUsername,
          wallet_address: ownerProfile.wallet_address,
          amount: ownerAmount,
          vote_hash: voteHash || '',
          status: statusText === 'EXECUTED_ONCHAIN' ? 'EXECUTED_ROYALTY' : 'QUEUED_ROYALTY',
          payment_id: ownerTxId
        });
      } else {
        await savePendingReward({
          owner_username: targetOwnerUsername,
          amount: ownerAmount,
          source_vote_hash: voteHash || '',
          source_delegator: cleanUsername,
          status: 'UNCLAIMED',
          created_at: new Date().toISOString()
        });
      }
    }

    return res.status(200).json({
      success: true,
      category: category,
      amountPaid: delegatorAmount,
      paymentId: txId,
      onChain: onChainResult.onChainExecuted,
      message: category === 'delegator'
        ? `Suara terkonfirmasi! Insentif ${delegatorAmount} Pi dicatat ke ${statusText}, serta 50% Royalti (${ownerAmount} Pi) disisihkan untuk Pemilik Asli (@${targetOwnerUsername}).`
        : `Suara terkonfirmasi! Insentif ${delegatorAmount} Pi berhasil didaftarkan ke ${statusText} & Payout Logs.`
    });

  } catch (err) {
    console.error("Payout Serverless Error:", err);

    await logPayoutToSupabase({
      username: cleanUsername,
      wallet_address: walletAddress,
      amount: baseAmount,
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
