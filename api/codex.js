/**
 * Vercel Serverless Function: POST /api/codex/transmit
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { author, planetId, message } = req.body || {};

  const newLog = {
    id: `log-${Date.now().toString(36)}`,
    author: author || 'Drifting Explorer',
    planetId: planetId || 'aethelgard',
    timestamp: `Cycle ${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 99)}`,
    message: message || 'Uncatalogued multiversal anomaly broadcast across Vercel Edge.',
  };

  res.status(200).json({ success: true, log: newLog });
}
