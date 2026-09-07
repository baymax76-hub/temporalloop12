/**
 * Vercel Serverless Function: GET /api/health
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    status: 'ONLINE',
    platform: 'Vercel Serverless Edge',
    universeShard: 'ALPHA-VERCEL-EDGE',
    activePilots: 4,
    harmonicResonance: 99.4,
    timestamp: new Date().toISOString(),
  });
}
