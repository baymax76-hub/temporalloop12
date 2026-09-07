/**
 * Vercel Serverless Function: POST /api/telemetry/ping
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pilotId, shipName, theme, x, y, z, speed } = req.body || {};

  res.status(200).json({
    ack: true,
    serverTime: Date.now(),
    fleet: [
      { id: pilotId || 'current-pilot', shipName: shipName || 'Vanguard Prime', theme: theme || 'vanguard', x: x || 0, y: y || 0, z: z || 0, speed: speed || 0 },
      { id: 'fleet-01', shipName: 'Aegis Sentinel-9', theme: 'aegis', x: -280, y: 80, z: -480, speed: 2.1 },
      { id: 'fleet-02', shipName: 'Quantum Nomad', theme: 'quantum', x: 400, y: -120, z: -620, speed: 3.4 },
      { id: 'fleet-03', shipName: 'Vanguard Corsair', theme: 'vanguard', x: 120, y: 320, z: -700, speed: 4.2 },
    ],
  });
}
