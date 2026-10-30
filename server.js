const express = require('express');
const path = require('path');
const app = express();

// Menyajikan file statis dari dalam folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Fallback mengarahkan ke public/index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server TVOD berjalan di port ${PORT}`));

module.exports = app;
