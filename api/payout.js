// api/payout.js - Vercel Serverless Function TVOD Payout Engine

const SUPABASE_URL = process.env.SUPABASE_URL || "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";

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
  } catch (err) {
    console.error("❌ Gagal mencatat log payout ke Supabase:", err);
  }
}

async function insertPayoutQueue(queueData) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/payout_queue`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(queueData)
    });
  } catch (err) {
    console.error("❌ Gagal mencatat antrean ke payout_queue:", err);
  }
}

async function fetchVoterProfile(username) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/voters?username=eq.${encodeURIComponent(username)}&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(rewardData)
    });
  } catch (err) {
    console.error("Save Pending Reward Error:", err);
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
  const PI_API_KEY = process.env.PI_API_KEY;

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

    // 2. HITUNG PORSI PAYOUT
    let delegatorAmount = baseAmount;
    let ownerAmount = 0;
    let targetOwnerUsername = null;

    if (category === 'delegator') {
      delegatorAmount = baseAmount * 0.5;
      ownerAmount = baseAmount * 0.5;
      targetOwnerUsername = voter && voter.owner_username ? voter.owner_username.replace('@', '') : null;
    }

    // 3. MASUKKAN KE PAYOUT QUEUE
    await insertPayoutQueue({
      proposal_id: currentProposalId,
      vote_hash: voteHash || '',
      recipient_username: cleanUsername,
      wallet_address: walletAddress,
      amount: delegatorAmount,
      payout_role: category === 'delegator' ? 'DELEGATOR_SHARE_50' : 'OWNER_FULL_100',
      status: PI_API_KEY ? 'QUEUED' : 'SIMULATED'
    });

    let paymentId = `SIMULATED-${Date.now()}`;
    let isLive = false;

    if (PI_API_KEY) {
      const piResponse = await fetch('https://api.minepi.com/v2/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment: {
            amount: delegatorAmount,
            memo: `Insentif Voting TVOD (${category.toUpperCase()}) - Hash: ${(voteHash || '').substring(0, 8)}`,
            metadata: { voteHash, username: cleanUsername, category, proposalId: currentProposalId },
            uid: cleanUsername || walletAddress
          }
        })
      });

      const piData = await piResponse.json();

      if (!piResponse.ok) {
        await logPayoutToSupabase({
          username: cleanUsername,
          wallet_address: walletAddress,
          amount: delegatorAmount,
          vote_hash: voteHash || '',
          status: 'FAILED',
          payment_id: null
        });

        return res.status(piResponse.status).json({
          success: false,
          message: piData.message || 'Gagal memproses pembayaran melalui Pi Platform API.',
          error: piData
        });
      }

      paymentId = piData.identifier || piData.id || `TX-${Date.now()}`;
      isLive = true;
    }

    await logPayoutToSupabase({
      username: cleanUsername,
      wallet_address: walletAddress,
      amount: delegatorAmount,
      vote_hash: voteHash || '',
      status: isLive ? 'SUCCESS' : 'SIMULATED',
      payment_id: paymentId
    });

    // 4. JIKA DELEGATOR: ALOKASI 50% ROYALTIES KE PEMILIK GARUDA
    if (category === 'delegator' && targetOwnerUsername) {
      const ownerProfile = await fetchVoterProfile(targetOwnerUsername);

      if (ownerProfile && ownerProfile.wallet_address) {
        let ownerTxId = `SIMULATED-ROYALTY-${Date.now()}`;

        await insertPayoutQueue({
          proposal_id: currentProposalId,
          vote_hash: voteHash || '',
          recipient_username: targetOwnerUsername,
          wallet_address: ownerProfile.wallet_address,
          amount: ownerAmount,
          payout_role: 'GARUDA_OWNER_ROYALTY_50',
          status: PI_API_KEY ? 'QUEUED' : 'SIMULATED'
        });

        if (PI_API_KEY) {
          try {
            const piOwnerRes = await fetch('https://api.minepi.com/v2/payments', {
              method: 'POST',
              headers: {
                'Authorization': `Key ${PI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                payment: {
                  amount: ownerAmount,
                  memo: `Royalti Garuda 50% TVOD dari Delegator @${cleanUsername}`,
                  metadata: { voteHash, delegator: cleanUsername, proposalId: currentProposalId },
                  uid: targetOwnerUsername
                }
              })
            });
            const piOwnerData = await piOwnerRes.json();
            if (piOwnerRes.ok) {
              ownerTxId = piOwnerData.identifier || piOwnerData.id || ownerTxId;
            }
          } catch (e) {
            console.error("Owner Payout Error:", e);
          }
        }

        await logPayoutToSupabase({
          username: targetOwnerUsername,
          wallet_address: ownerProfile.wallet_address,
          amount: ownerAmount,
          vote_hash: voteHash || '',
          status: PI_API_KEY ? 'SUCCESS_ROYALTY' : 'SIMULATED_ROYALTY',
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
      message: category === 'delegator'
        ? `Suara terkonfirmasi. Insentif Delegator (${delegatorAmount} Pi) dikirim ke Wallet, dan 50% Royalti (${ownerAmount} Pi) dialokasikan ke Pemilik Asli (@${targetOwnerUsername}).`
        : `Insentif sebesar ${delegatorAmount} Pi berhasil dikirim ke Wallet ${walletAddress}`,
      paymentId: paymentId
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
