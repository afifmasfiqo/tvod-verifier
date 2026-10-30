const express = require('express');
const path = require('path');
const app = express();

// Menyajikan file statis (index.html, app.js, styles.css, logo.png, stempel-tvod.png)
app.use(express.static(path.join(__dirname, '.')));

// Fallback mengarahkan ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server TVOD berjalan di port ${PORT}`));

module.exports = app;
