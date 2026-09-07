/**
 * Starfield OS - Master Application Coordinator
 * Connects Three.js Space Engine, Procedural Audio Synth, Ship Selection,
 * Cockpit HUD, Holographic Terminal, Galaxy Codex, and Real-time Cloud Engine.
 */

import { SHIPS, CELESTIAL_NODES } from './data/universeData.js';
import { soundEngine } from './audio/soundEngine.js';
import { SpaceEngine } from './three/SpaceEngine.js';
import { CloudEngine } from './network/cloudEngine.js';
import { IntroCinematic } from './components/IntroCinematic.js';
import { ShipSelection } from './components/ShipSelection.js';
import { CockpitHUD } from './components/CockpitHUD.js';
import { HoloTerminal } from './components/HoloTerminal.js';
import { GalaxyCodex } from './components/GalaxyCodex.js';
import { FlightManual } from './components/FlightManual.js';
import { CloudTerminal } from './components/CloudTerminal.js';

class StarfieldOSApp {
  constructor() {
    this.currentShip = SHIPS.vanguard;
    this.discoveredNodes = new Set(['aethelgard']); // Initial starting knowledge
    this.isDocked = false;

    // DOM containers
    this.canvasEl = document.getElementById('webgl-canvas');
    this.modalLayer = document.getElementById('modal-layer');
    this.hudLayer = document.getElementById('hud-layer');

    this.spaceEngine = null;
    this.cockpitHUD = null;
    this.cloudEngine = null;

    this.initCloudEngine();
    this.init();
  }

  initCloudEngine() {
    this.cloudEngine = new CloudEngine({
      onFleetUpdate: (fleet) => {
        if (this.spaceEngine) {
          this.spaceEngine.updateFleetMembers(fleet);
        }
      },
      onGlobalNodeDiscovered: (nodeId, allDiscovered) => {
        this.discoveredNodes.add(nodeId);
        if (allDiscovered) {
          allDiscovered.forEach(id => this.discoveredNodes.add(id));
        }
      },
      onNewLog: (log) => {
        console.log('[Cloud Broadcast Received]:', log);
      },
    });
  }

  init() {
    // 1. Start with Opening Narrative Cinematic
    this.introCinematic = new IntroCinematic(
      this.modalLayer,
      soundEngine,
      () => this.showShipSelection()
    );
  }

  showShipSelection() {
    this.shipSelection = new ShipSelection(
      this.modalLayer,
      soundEngine,
      (selectedShip) => {
        this.currentShip = selectedShip;
        this.startFlightSimulation();
      }
    );
  }

  startFlightSimulation() {
    // 1. Initialize SpaceEngine
    if (!this.spaceEngine) {
      this.spaceEngine = new SpaceEngine(
        this.canvasEl,
        this.currentShip,
        soundEngine,
        {
          onTargetHover: (nodeData) => {
            // Optional telemetry hook
          },
          onTargetSelect: (nodeData) => {
            // Selected node lock
          },
          onDockWithNode: (nodeData) => {
            this.openHoloTerminal(nodeData);
          },
          onFuelEarned: (amount) => {
            if (this.cockpitHUD) this.cockpitHUD.addFuel(amount);
          },
        }
      );
    } else {
      this.spaceEngine.flightPhysics.setShip(this.currentShip);
    }

    // 2. Initialize Cockpit HUD
    this.cockpitHUD = new CockpitHUD(
      this.hudLayer,
      this.currentShip,
      soundEngine,
      {
        onFireLaser: (theme) => {
          if (this.spaceEngine) this.spaceEngine.fireWeapons(theme);
        },
        onSpecialAbility: (theme) => {
          if (this.spaceEngine) this.spaceEngine.triggerSpecialAbility(theme);
        },
        onPowerChange: (engines, shields, weapons) => {
          if (this.spaceEngine) {
            this.spaceEngine.flightPhysics.setPowerAllocation(engines, shields, weapons);
          }
        },
        onSelectTargetNode: (nodeData) => {
          const node = this.spaceEngine.celestialNodes.find(n => n.data.id === nodeData.id);
          if (node) this.spaceEngine.selectNode(node);
        },
        onOpenCloud: () => this.openCloudTerminal(),
        onOpenCodex: () => this.openGalaxyCodex(),
        onOpenManual: () => this.openFlightManual(),
        onSwitchShip: () => this.showShipSelection(),
      }
    );

    // 3. Start HUD telemetry and cloud relay update loop
    this.startHUDLoop();
  }

  startHUDLoop() {
    let lastCloudSync = 0;

    const loop = (timestamp) => {
      requestAnimationFrame(loop);

      if (this.spaceEngine && this.cockpitHUD) {
        const telemetry = {
          speed: this.spaceEngine.flightPhysics.speed,
          throttle: this.spaceEngine.flightPhysics.throttle,
          coords: this.spaceEngine.camera.position,
          isBoosting: this.spaceEngine.flightPhysics.isBoosting,
          fuelBurn: (Math.abs(this.spaceEngine.flightPhysics.speed) * 0.01 + (this.spaceEngine.flightPhysics.isBoosting ? 0.05 : 0)) * 0.016,
        };

        const projectedNodes = this.spaceEngine.getProjectedNodeScreenPositions();
        this.cockpitHUD.update(telemetry, projectedNodes);

        // Sync position with cloud engine every 150ms
        if (this.cloudEngine && timestamp - lastCloudSync > 150) {
          lastCloudSync = timestamp;
          this.cloudEngine.sendTelemetry(this.currentShip, telemetry.coords, telemetry.speed);
        }
      }
    };
    loop(0);
  }

  openHoloTerminal(nodeData) {
    if (this.isDocked) return;
    this.isDocked = true;
    soundEngine.playHoloOpen();

    this.holoTerminal = new HoloTerminal(
      this.modalLayer,
      nodeData,
      soundEngine,
      {
        onScanLore: (node) => {
          this.discoveredNodes.add(node.id);
          if (this.cloudEngine) {
            this.cloudEngine.broadcastNodeDiscovery(node.id);
          }
          // Highlight constellation if unlocked
          if (this.spaceEngine && this.spaceEngine.constellationMesh) {
            this.spaceEngine.constellationMesh.highlightConstellation(node.constellation, true);
          }
        },
        onRefillFuel: (bonus) => {
          if (this.cockpitHUD) this.cockpitHUD.addFuel(bonus);
        },
        onWarpToNode: (targetNodeId) => {
          const targetNode = this.spaceEngine.celestialNodes.find(n => n.data.id === targetNodeId);
          if (targetNode) {
            this.spaceEngine.selectNode(targetNode);
          }
        },
        onClose: () => {
          this.isDocked = false;
        },
      }
    );
  }

  openCloudTerminal() {
    soundEngine.playTargetLock();
    this.cloudTerminal = new CloudTerminal(
      this.modalLayer,
      this.cloudEngine,
      soundEngine,
      () => {}
    );
  }

  openGalaxyCodex() {
    soundEngine.playTargetLock();
    this.galaxyCodex = new GalaxyCodex(
      this.modalLayer,
      this.discoveredNodes,
      soundEngine,
      {
        onWarpToNode: (targetNodeId) => {
          const targetNode = this.spaceEngine.celestialNodes.find(n => n.data.id === targetNodeId);
          if (targetNode) {
            this.spaceEngine.selectNode(targetNode);
          }
        },
        onClose: () => {},
      }
    );
  }

  openFlightManual() {
    soundEngine.playTargetLock();
    this.flightManual = new FlightManual(
      this.modalLayer,
      () => {}
    );
  }
}

// Initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.starfieldOS = new StarfieldOSApp();
});
