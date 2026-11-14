require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware parsing Body JSON & URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan berkas statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Path ke file database frozen list
const frozenFilePath = path.join(__dirname, 'frozen_list.json');

// Fungsi helper membaca daftar beku
function getFrozenList() {
    try {
        if (!fs.existsSync(frozenFilePath)) return [];
        const data = fs.readFileSync(frozenFilePath, 'utf8');
        return JSON.parse(data).frozenIds || [];
    } catch (err) {
        console.error('❌ Error reading frozen_list.json:', err);
        return [];
    }
}

// Fungsi helper menyimpan daftar beku
function saveFrozenList(list) {
    try {
        fs.writeFileSync(frozenFilePath, JSON.stringify({ frozenIds: list }, null, 2));
    } catch (err) {
        console.error('❌ Error saving frozen_list.json:', err);
    }
}

// 1. Validasi Login / Verifikasi (Menolak akses ID yang dibekukan)
app.post('/api/verify', (req, res) => {
    const { garudaId } = req.body;
    const frozenIds = getFrozenList();

    if (frozenIds.includes(String(garudaId))) {
        return res.status(403).json({
            status: "error",
            message: "Access denied: Your Garuda ID is temporarily frozen by Founder's directive. Voting and login are restricted."
        });
    }

    return res.json({ status: "success", message: "Verification passed." });
});

// 2. Validasi Voting (Mencegah suara masuk dari ID yang dibekukan)
app.post('/api/vote', (req, res) => {
    const { garudaId } = req.body;
    const frozenIds = getFrozenList();

    if (frozenIds.includes(String(garudaId))) {
        return res.status(403).json({
            status: "error",
            message: "Access denied: Your Garuda ID is temporarily frozen. Vote submission rejected."
        });
    }

    return res.json({ status: "success", message: "Vote successfully recorded." });
});

// 3. Endpoint Admin: BAN (Freeze) Garuda ID
app.post('/api/admin/freeze', (req, res) => {
    const { garudaId } = req.body;
    if (!garudaId) {
        return res.status(400).json({ success: false, message: 'Garuda ID is required' });
    }
    let frozenIds = getFrozenList();
    
    if (!frozenIds.includes(String(garudaId))) {
        frozenIds.push(String(garudaId));
        saveFrozenList(frozenIds);
    }
    return res.json({ success: true, message: `Garuda ID ${garudaId} has been frozen.` });
});

// 4. Endpoint Admin: UNBAN (Unfreeze) Garuda ID - Pemulihan otomatis oleh Founder
app.post('/api/admin/unfreeze', (req, res) => {
    const { garudaId } = req.body;
    if (!garudaId) {
        return res.status(400).json({ success: false, message: 'Garuda ID is required' });
    }
    let frozenIds = getFrozenList();
    
    frozenIds = frozenIds.filter(id => id !== String(garudaId));
    saveFrozenList(frozenIds);
    
    return res.json({ success: true, message: `Garuda ID ${garudaId} has been unfrozen and restored.` });
});

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
