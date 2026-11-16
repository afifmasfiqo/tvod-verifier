// file: api/auth/login.js
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    // 1. Coba verifikasi token ke Pi Network Mainnet API
    let piRes = await fetch('https://api.minepi.com/v2/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    // 2. Jika gagal di Mainnet, coba verifikasi ke Pi Network Testnet API
    if (!piRes.ok) {
      piRes = await fetch('https://api.testnet.minepi.com/v2/me', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    }

    if (!piRes.ok) {
      const errText = await piRes.text();
      return res.status(401).json({ error: `Invalid Pi Access Token: ${errText}` });
    }

    const userData = await piRes.json();
    
    // Kembalikan data user yang valid ke frontend app.js
    return res.status(200).json({
      success: true,
      user: {
        username: userData.username,
        uid: userData.uid || userData.id
      },
      sessionToken: 'tvod_sess_' + Date.now()
    });

  } catch (err) {
    console.error("Auth proxy error:", err);
    return res.status(500).json({ error: 'Internal server error during authentication: ' + err.message });
  }
}
