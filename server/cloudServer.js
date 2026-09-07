/**
 * Starfield OS - Production Cloud Server & Multiverse Telemetry Engine
 * Features:
 * - Real-time WebSocket fleet relay for spatial 3D ship positioning
 * - Constellation network bridge synchronization across all explorers
 * - Multiversal survivor archive & codex cloud repository
 * - High-speed static file serving for Starfield OS client
 */

import http from 'http';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 8080;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Serve frontend static assets from root workspace
app.use(express.static(ROOT_DIR));

// In-Memory Cloud State
const cloudState = {
  serverStartTime: Date.now(),
  universeShard: 'ALPHA-PRIME-771',
  globalConstellationBridges: {
    phoenix_core: { unlocked: true, completion: 85 },
    chronos_arc: { unlocked: true, completion: 60 },
    elysium_nexus: { unlocked: false, completion: 35 },
  },
  discoveredPlanets: new Set(['aethelgard', 'chronos', 'vespera']),
  activeFleet: new Map(), // socketId -> { id, shipName, theme, x, y, z, speed, lastPing }
  multiverseLogs: [
    {
      id: 'log-001',
      author: 'Archivist Lyra Vance',
      planetId: 'aethelgard',
      timestamp: 'Cycle 944.12',
      message: 'Chrono-Prism vaults successfully calibrated across dimension shard 7.',
    },
    {
      id: 'log-002',
      author: 'Commander Thorne',
      planetId: 'chronos',
      timestamp: 'Cycle 108.04',
      message: 'Temporal shear field stabilized. Slipstream corridor open.',
    },
  ],
  telemetryStats: {
    totalPacketsProcessed: 0,
    activePilots: 0,
    harmonicResonancePct: 78.4,
  },
};

// Seed some AI/Simulated Fleet survivors if few real players
const SIMULATED_SURVIVORS = [
  { id: 'fleet-01', shipName: 'Aegis Sentinel-9', theme: 'aegis', x: -280, y: 80, z: -480, speed: 2.1, status: 'Patrolling Sector' },
  { id: 'fleet-02', shipName: 'Quantum Nomad', theme: 'quantum', x: 400, y: -120, z: -620, speed: 3.4, status: 'Scanning Anomaly' },
  { id: 'fleet-03', shipName: 'Vanguard Corsair', theme: 'vanguard', x: 120, y: 320, z: -700, speed: 4.2, status: 'Approaching Gateway' },
];

// --- REST API ENDPOINTS ---

// 1. Health & Telemetry Metrics
app.get('/api/health', (req, res) => {
  const uptimeSec = Math.floor((Date.now() - cloudState.serverStartTime) / 1000);
  res.json({
    status: 'ONLINE',
    universeShard: cloudState.universeShard,
    uptimeSeconds: uptimeSec,
    activePilots: cloudState.activeFleet.size + SIMULATED_SURVIVORS.length,
    totalPackets: cloudState.telemetryStats.totalPacketsProcessed,
    harmonicResonance: cloudState.telemetryStats.harmonicResonancePct,
    timestamp: new Date().toISOString(),
  });
});

// 2. Global Universe & Constellation State
app.get('/api/universe/state', (req, res) => {
  res.json({
    universeShard: cloudState.universeShard,
    constellationBridges: cloudState.globalConstellationBridges,
    discoveredPlanets: Array.from(cloudState.discoveredPlanets),
    multiverseLogs: cloudState.multiverseLogs,
    activeFleetCount: cloudState.activeFleet.size + SIMULATED_SURVIVORS.length,
  });
});

// 3. Post Telemetry Ping (REST Fallback)
app.post('/api/telemetry/ping', (req, res) => {
  cloudState.telemetryStats.totalPacketsProcessed++;
  const { pilotId, shipName, theme, x, y, z, speed } = req.body;

  if (pilotId) {
    cloudState.activeFleet.set(pilotId, {
      id: pilotId,
      shipName: shipName || 'Unknown Vessel',
      theme: theme || 'vanguard',
      x: x || 0,
      y: y || 0,
      z: z || 0,
      speed: speed || 0,
      lastPing: Date.now(),
    });
  }

  res.json({
    ack: true,
    serverTime: Date.now(),
    fleet: Array.from(cloudState.activeFleet.values()).concat(SIMULATED_SURVIVORS),
  });
});

// 4. Transmit New Codex Log to Cloud Archive
app.post('/api/codex/transmit', (req, res) => {
  const { author, planetId, message } = req.body;
  const newLog = {
    id: `log-${Date.now().toString(36)}`,
    author: author || 'Drifting Explorer',
    planetId: planetId || 'unknown',
    timestamp: `Cycle ${Math.floor(Math.random() * 900 + 100)}.${Math.floor(Math.random() * 99)}`,
    message: message || 'Uncatalogued multiversal anomaly recorded.',
  };

  cloudState.multiverseLogs.unshift(newLog);
  if (planetId) cloudState.discoveredPlanets.add(planetId);

  // Broadcast to all WebSocket clients
  broadcast({
    type: 'NEW_CODEX_LOG',
    log: newLog,
    discoveredPlanets: Array.from(cloudState.discoveredPlanets),
  });

  res.json({ success: true, log: newLog });
});

// --- WEBSOCKET GATEWAY FOR REAL-TIME 3D FLEET TELEMETRY ---

wss.on('connection', (ws, req) => {
  const socketId = `pilot-${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[Cloud Engine] Explorer linked: ${socketId}`);

  // Send initial handshake
  ws.send(JSON.stringify({
    type: 'HANDSHAKE_INIT',
    socketId: socketId,
    universeShard: cloudState.universeShard,
    constellationBridges: cloudState.globalConstellationBridges,
    discoveredPlanets: Array.from(cloudState.discoveredPlanets),
    fleet: Array.from(cloudState.activeFleet.values()).concat(SIMULATED_SURVIVORS),
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      cloudState.telemetryStats.totalPacketsProcessed++;

      if (msg.type === 'SHIP_TELEMETRY') {
        cloudState.activeFleet.set(socketId, {
          id: socketId,
          shipName: msg.shipName || 'Explorer',
          theme: msg.theme || 'vanguard',
          x: msg.x,
          y: msg.y,
          z: msg.z,
          speed: msg.speed,
          lastPing: Date.now(),
        });

        // Relay fleet update to other connected pilots
        broadcast({
          type: 'FLEET_UPDATE',
          fleet: Array.from(cloudState.activeFleet.values()).concat(SIMULATED_SURVIVORS),
        }, ws);
      } else if (msg.type === 'DISCOVER_NODE') {
        cloudState.discoveredPlanets.add(msg.nodeId);
        broadcast({
          type: 'NODE_DISCOVERED_GLOBAL',
          nodeId: msg.nodeId,
          discoveredPlanets: Array.from(cloudState.discoveredPlanets),
        });
      }
    } catch (err) {
      console.error('[Cloud Engine] Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    console.log(`[Cloud Engine] Explorer disconnected: ${socketId}`);
    cloudState.activeFleet.delete(socketId);
    broadcast({
      type: 'FLEET_UPDATE',
      fleet: Array.from(cloudState.activeFleet.values()).concat(SIMULATED_SURVIVORS),
    });
  });
});

function broadcast(payload, excludeWs = null) {
  const str = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(str);
    }
  });
}

// Clean up stale fleet entries every 10 seconds
setInterval(() => {
  const now = Date.now();
  for (const [id, pilot] of cloudState.activeFleet.entries()) {
    if (now - pilot.lastPing > 15000) {
      cloudState.activeFleet.delete(id);
    }
  }
}, 10000);

// Start Server
server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Starfield OS Cloud Server & Telemetry Engine`);
  console.log(`📡 Shard: ${cloudState.universeShard}`);
  console.log(`🌐 Server Running: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Relay: ws://localhost:${PORT}/ws`);
  console.log(`=================================================`);
});
