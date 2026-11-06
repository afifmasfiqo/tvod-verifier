import { Keypair, Server, TransactionBuilder, Operation, Asset } from 'stellar-sdk';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdtybxriphsdtojkrevp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdHlieHJpcGhzZHRvamtyZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1NjQ1MjgsImV4cCI6MjEwOTE0MDUyOH0.yUCGB3vMRcIHpO8uesxp5Tho4T0mTZF0ZwWpHsg04GI";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PI_HORIZON_URL = "https://api.testnet.minepi.com";
const server = new Server(PI_HORIZON_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { walletAddress, amount, username, proposalId } = req.body;

  if (!walletAddress || !amount) {
    return res.status(400).json({ success: false, message: 'Wallet address dan amount wajib diisi' });
  }

  const seed = process.env.PI_PAYOUT_SEED;
  if (!seed) {
    return res.status(500).json({ 
      success: false, 
      message: 'PI_PAYOUT_SEED belum aktif! Silakan klik REDEPLOY di Vercel Dashboard.' 
    });
  }

  try {
    const cleanSeed = seed.trim();
    const sourceKeypair = Keypair.fromSecret(cleanSeed);
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

    // Cek apakah wallet tujuan sudah terdaftar di ledger Horizon Testnet
    let destinationExists = true;
    try {
      await server.loadAccount(walletAddress);
    } catch (e) {
      destinationExists = false;
    }

    // Jika wallet belum pernah punya saldo, gunakan createAccount, jika sudah ada gunakan payment
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
      networkPassphrase: "Pi Testnet"
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

    let detailedError = error.message;
    if (error.response && error.response.data && error.response.data.extras) {
      const codes = error.response.data.extras.result_codes;
      detailedError = `Horizon Error: ${JSON.stringify(codes)}`;
    }

    // Catat transaksi gagal ke antrean PENDING
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
