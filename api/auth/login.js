export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    const appStudioRes = await fetch("https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken })
    });

    if (!appStudioRes.ok) {
      const errorText = await appStudioRes.text();
      return res.status(appStudioRes.status).json({ error: `App Studio auth failed: ${errorText}` });
    }

    const data = await appStudioRes.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Auth proxy error:", err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}
