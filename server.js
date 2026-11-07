const express = require('express');
const path = require('path');
const app = express();

// Middleware parsing body JSON & URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan file statis dari dalam folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Router API Payout (Mendukung pengujian lokal via Node.js)
app.post('/api/payout', async (req, res) => {
  try {
    const payoutModule = await import('./api/payout.js');
    const payoutHandler = payoutModule.default;
    return await payoutHandler(req, res);
  } catch (err) {
    console.error("API Payout Route Error:", err);
    return res.status(500).json({
      success: false,
      message: "Gagal mengeksekusi handler payout: " + err.message
    });
  }
});

// Fallback mengarahkan ke public/index.html (SPA Routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server TVOD berjalan di http://localhost:${PORT}`));

module.exports = app;
