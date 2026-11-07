// api/payout.js
const StellarSdk = require("@stellar/stellar-sdk");

// URL Horizon & Network Passphrase resmi Pi Testnet
const HORIZON_URL = "https://api.testnet.minepi.com";
const PI_NETWORK_PASSPHRASE = "Pi Testnet"; 

// Seed Private Key Wallet Kas App (Gunakan ENV Variable di Vercel demi keamanan)
// Format Seed diawali huruf 'S...', contoh: "SDXXXXXXXXXXXXXX..."
const APP_WALLET_SEED = process.env.PI_APP_SEED || "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; 

/**
 * Inisialisasi Horizon Server secara universal lintas versi SDK
 */
function createHorizonServer(url) {
  if (StellarSdk.Horizon && typeof StellarSdk.Horizon.Server === "function") {
    return new StellarSdk.Horizon.Server(url);
  }
  if (typeof StellarSdk.Server === "function") {
    return new StellarSdk.Server(url);
  }
  if (StellarSdk.default && StellarSdk.default.Horizon && typeof StellarSdk.default.Horizon.Server === "function") {
    return new StellarSdk.default.Horizon.Server(url);
  }
  if (StellarSdk.default && typeof StellarSdk.default.Server === "function") {
    return new StellarSdk.default.Server(url);
  }
  throw new Error("StellarSdk Horizon Server constructor tidak ditemukan.");
}

module.exports = async function handler(req, res) {
  // Hanya menerima HTTP POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { walletAddress, amount, username, proposalId } = req.body;

  if (!walletAddress || !amount) {
    return res.status(400).json({ success: false, message: "Wallet Address dan Amount wajib diisi." });
  }

  try {
    const server = createHorizonServer(HORIZON_URL);
    
    // 1. Ekstrak Keypair dari Secret Seed
    const sourceKeypair = StellarSdk.Keypair.fromSecret(APP_WALLET_SEED);
    const sourcePublicKey = sourceKeypair.publicKey();

    // 2. Ambil Account Sequence terbaru dari Pi Horizon
    const sourceAccount = await server.loadAccount(sourcePublicKey);

    // 3. Susun Transaksi Pembayaran Insentif Voter
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE || "10000",
      networkPassphrase: PI_NETWORK_PASSPHRASE,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: walletAddress,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(30)
      .build();

    // 4. Tanda Tangani Transaksi Secara On-Chain
    transaction.sign(sourceKeypair);

    // 5. Submit Transaksi ke Pi Horizon Network
    const result = await server.submitTransaction(transaction);

    return res.status(200).json({
      success: true,
      message: `Insentif ${amount} Testnet Pi berhasil dikirim ke @${username}!`,
      txHash: result.hash,
    });
  } catch (error) {
    console.error("Payout Processing Error:", error);
    
    const errDetail = error.response && error.response.data && error.response.data.extras 
      ? JSON.stringify(error.response.data.extras.result_codes) 
      : error.message;

    return res.status(500).json({
      success: false,
      message: `Gagal memproses payout: ${errDetail}`,
    });
  }
};
