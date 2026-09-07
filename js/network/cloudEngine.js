/**
 * Starfield OS - Client-Side Cloud Engine & Telemetry Relay
 * Communicates with the Cloud Server over WebSockets / REST API, with seamless
 * fallback to an embedded Quantum Mesh Simulator when offline or running locally.
 */

export class CloudEngine {
  /**
   * @param {Object} options - { serverUrl, onFleetUpdate, onGlobalNodeDiscovered, onNewLog }
   */
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws';
    this.restUrl = options.restUrl || window.location.origin;

    this.onFleetUpdate = options.onFleetUpdate || null;
    this.onGlobalNodeDiscovered = options.onGlobalNodeDiscovered || null;
    this.onNewLog = options.onNewLog || null;

    this.isConnected = false;
    this.isSimulated = false;
    this.socket = null;
    this.socketId = `local-${Math.random().toString(36).substring(2, 7)}`;
    this.universeShard = 'QUANTUM-MESH-PRIME';
    this.latencyMs = 18;
    this.activePilotsCount = 4;

    this.fleetMembers = new Map(); // id -> { id, shipName, theme, x, y, z, speed }

    this.init();
  }

  init() {
    try {
      this.socket = new WebSocket(this.serverUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.isSimulated = false;
        console.log('[Cloud Engine] Uplink established with Cloud Server Gateway.');
      };

      this.socket.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          this.handleServerMessage(msg);
        } catch (err) {
          console.warn('[Cloud Engine] Error parsing packet:', err);
        }
      };

      this.socket.onerror = () => {
        this.fallbackToSimulation();
      };

      this.socket.onclose = () => {
        this.fallbackToSimulation();
      };
    } catch (err) {
      this.fallbackToSimulation();
    }
  }

  fallbackToSimulation() {
    if (this.isSimulated) return;
    this.isSimulated = true;
    this.isConnected = true;
    console.log('[Cloud Engine] Cloud Gateway running in Autonomous Quantum Mesh Simulation Mode.');

    // Seed simulated explorer vessels drifting through the star systems
    this.fleetMembers.set('fleet-01', {
      id: 'fleet-01',
      shipName: 'Aegis Sentinel-9',
      theme: 'aegis',
      x: -280,
      y: 80,
      z: -480,
      speed: 2.1,
      heading: 0,
    });

    this.fleetMembers.set('fleet-02', {
      id: 'fleet-02',
      shipName: 'Quantum Nomad',
      theme: 'quantum',
      x: 400,
      y: -120,
      z: -620,
      speed: 3.4,
      heading: 0,
    });

    this.fleetMembers.set('fleet-03', {
      id: 'fleet-03',
      shipName: 'Vanguard Corsair',
      theme: 'vanguard',
      x: 120,
      y: 320,
      z: -700,
      speed: 4.2,
      heading: 0,
    });

    // Run simulated drift loop
    setInterval(() => {
      this.updateSimulatedFleet();
    }, 100);
  }

  updateSimulatedFleet() {
    this.fleetMembers.forEach((member) => {
      // Orbit / drift smoothly
      member.x += Math.sin(Date.now() * 0.001 + member.id.charCodeAt(6)) * 0.8;
      member.z += Math.cos(Date.now() * 0.001 + member.id.charCodeAt(6)) * 0.8;
    });

    if (this.onFleetUpdate) {
      this.onFleetUpdate(Array.from(this.fleetMembers.values()));
    }
  }

  handleServerMessage(msg) {
    switch (msg.type) {
      case 'HANDSHAKE_INIT':
        this.socketId = msg.socketId;
        this.universeShard = msg.universeShard;
        if (msg.fleet && this.onFleetUpdate) {
          this.onFleetUpdate(msg.fleet);
        }
        break;

      case 'FLEET_UPDATE':
        if (msg.fleet) {
          this.activePilotsCount = msg.fleet.length;
          if (this.onFleetUpdate) this.onFleetUpdate(msg.fleet);
        }
        break;

      case 'NODE_DISCOVERED_GLOBAL':
        if (this.onGlobalNodeDiscovered) {
          this.onGlobalNodeDiscovered(msg.nodeId, msg.discoveredPlanets);
        }
        break;

      case 'NEW_CODEX_LOG':
        if (this.onNewLog) {
          this.onNewLog(msg.log);
        }
        break;
    }
  }

  /**
   * Broadcast current ship position and velocity to the cloud fleet
   */
  sendTelemetry(shipConfig, coords, speed) {
    if (!coords) return;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'SHIP_TELEMETRY',
        shipName: shipConfig.name,
        theme: shipConfig.theme,
        x: coords.x,
        y: coords.y,
        z: coords.z,
        speed: speed,
      }));
    }
  }

  /**
   * Transmit newly discovered planet node
   */
  broadcastNodeDiscovery(nodeId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'DISCOVER_NODE',
        nodeId: nodeId,
      }));
    }
  }

  /**
   * Transmit custom lore log entry to Cloud Archive
   */
  async transmitCodexLog(author, planetId, message) {
    try {
      const res = await fetch(`${this.restUrl}/api/codex/transmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, planetId, message }),
      });
      return await res.json();
    } catch (err) {
      // Fallback local acknowledgment
      return {
        success: true,
        log: {
          id: `log-${Date.now().toString(36)}`,
          author: author || 'Local Explorer',
          planetId: planetId,
          timestamp: 'Cycle 944.88',
          message: message,
        },
      };
    }
  }

  getCloudStatus() {
    return {
      connected: this.isConnected,
      mode: this.isSimulated ? 'QUANTUM MESH [LOCAL]' : 'CLOUD DEDICATED [ONLINE]',
      shard: this.universeShard,
      latency: this.latencyMs,
      activePilots: this.activePilotsCount,
    };
  }
}
