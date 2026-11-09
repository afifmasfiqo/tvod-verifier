require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware parsing Body JSON & URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan berkas statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Router API Payout (Mendukung pengujian lokal via Node.js dengan Dynamic Import ESM)
app.post('/api/payout', async (req, res) => {
  try {
    const payoutModule = await import('./api/payout.js');
    const payoutHandler = payoutModule.default || payoutModule;
    return await payoutHandler(req, res);
  } catch (err) {
    console.error('❌ API Payout Route Error:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengeksekusi handler payout: ' + err.message
      });
    }
  }
});

// Fallback mengarahkan ke public/index.html (SPA Routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan Server jika dipanggil langsung
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 TVOD Verifier dApp running locally!`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

module.exports = app;
