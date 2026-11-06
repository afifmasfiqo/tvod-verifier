import { Keypair, Server, TransactionBuilder, Operation, Asset } from 'stellar-sdk';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PI_HORIZON_URL = "https://api.testnet.minepi.com";
const server = new Server(PI_HORIZON_URL);
const PI_NETWORK_PASSPHRASE = "Test Pi Network ; December 2019";

export default async function handler(req, res) {
  // CORS Headers untuk kompatibilitas Pi Browser & WebView
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
    return res.status(400).json({ success: false, message: 'Wallet address dan amount wajib diisi' });
  }

  const seed = process.env.PI_PAYOUT_SEED;
  if (!seed) {
    await supabase.from('payout_queue').insert([{
      username: username || 'Anonymous',
      wallet_address: walletAddress,
      amount: amount,
      proposal_id: proposalId,
      status: 'PENDING',
      error_log: 'PI_PAYOUT_SEED belum dikonfigurasi di Environment Variables Vercel'
    }]);

    return res.status(500).json({ 
      success: false, 
      message: 'PI_PAYOUT_SEED belum aktif di Vercel! Silakan set Environment Variable PI_PAYOUT_SEED lalu REDEPLOY.' 
    });
  }

  try {
    const cleanSeed = seed.trim();
    const sourceKeypair = Keypair.fromSecret(cleanSeed);
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    // Cek keberadaan wallet tujuan di ledger Horizon
    let destinationExists = true;
    try {
      await server.loadAccount(walletAddress);
    } catch (e) {
      destinationExists = false;
    }

    const paymentOp = destinationExists
      ? Operation.payment({
          destination: walletAddress,
          asset: Asset.native(),
          amount: amount.toString()
        })
      : Operation.createAccount({
          destination: walletAddress,
          startingBalance: amount.toString()
        });

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: "10000",
      networkPassphrase: PI_NETWORK_PASSPHRASE
    })
      .addOperation(paymentOp)
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);

    // Catat transaksi sukses ke Supabase
    await supabase.from('payout_queue').insert([{
      username: username || 'Anonymous',
      wallet_address: walletAddress,
      amount: amount,
      proposal_id: proposalId,
      status: 'SUCCESS',
      tx_hash: result.hash
    }]);

    return res.status(200).json({
      success: true,
      message: `BERHASIL ON-CHAIN! ${amount} Pi terkirim ke wallet.`,
      txHash: result.hash
    });

  } catch (error) {
    console.error("Payout Error:", error);

    let detailedError = error.message || 'Unknown Error';
    if (error?.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      detailedError = `Horizon Error: ${JSON.stringify(codes)}`;
    } else if (error?.data?.extras?.result_codes) {
      detailedError = `Horizon Error: ${JSON.stringify(error.data.extras.result_codes)}`;
    }

    await supabase.from('payout_queue').insert([{
      username: username || 'Anonymous',
      wallet_address: walletAddress,
      amount: amount,
      proposal_id: proposalId,
      status: 'PENDING',
      error_log: detailedError
    }]);

    return res.status(500).json({
      success: false,
      message: `Gagal On-Chain: ${detailedError}`
    });
  }
}
