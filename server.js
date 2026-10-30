require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');

const app = express();

// 1. Pengaturan CORS (Akses Lintas Domain)
app.use(cors({ origin: '*' }));

// 2. Pengaturan Keamanan Helmet (Penanganan Utama Blok Error Pi Browser)
app.use(
  helmet({
    frameguard: false, // Mematikan X-Frame-Options SAMEORIGIN agar dApp dibuka mulus di Pi Browser
    contentSecurityPolicy: false // Kebijakan CSP dikelola melalui vercel.json
  })
);

// 3. Pembatasan Rate Limit (Keamanan Anti-Spam / DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 permintaan per IP
  message: { error: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.' }
});
app.use('/api/', limiter);

// 4. Parser Body & Sesi (Session)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'tvod_secret_key_2026',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

// 5. Menyajikan File Statis (index.html, styles.css, app.js, logo.png, stempel-tvod.png)
app.use(express.static(path.join(__dirname, '.')));

// 6. Endpoint Kesehatan Server / API Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'The Voice of Dao (TVOD) Verifier',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Fallback Route: Mengarahkan semua akses ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 7. Penanganan Error Global
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan internal pada server' });
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`TVOD Verifier Server berjalan di port ${PORT}`);
  console.log(`Aturan Frameguard dinonaktifkan untuk Pi Browser`);
  console.log(`===========================================`);
});
