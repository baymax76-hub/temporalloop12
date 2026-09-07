/**
 * Starfield OS - Spacecraft Hangar & Selection Interface
 * 3D rotating hologram ship preview, tactical spec comparison, audio feedback,
 * and ship launch confirmation.
 */

/* global THREE */
import { SHIPS } from '../data/universeData.js';

export class ShipSelection {
  /**
   * @param {HTMLElement} container
   * @param {Object} soundEngine
   * @param {Function} onShipSelected
   */
  constructor(container, soundEngine, onShipSelected) {
    this.container = container;
    this.soundEngine = soundEngine;
    this.onShipSelected = onShipSelected;

    this.selectedShipId = 'vanguard';
    this.previewScene = null;
    this.previewCamera = null;
    this.previewRenderer = null;
    this.previewMeshGroup = null;
    this.animId = null;
    this.isFinished = false;

    this.render();
  }

  render() {
    if (this.animId) cancelAnimationFrame(this.animId);

    const shipList = Object.values(SHIPS);
    const activeShip = SHIPS[this.selectedShipId];

    this.container.innerHTML = `
      <div id="hangar-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-8 select-none pointer-events-auto cursor-default ${'theme-' + activeShip.theme}">
        <div class="scanlines absolute inset-0"></div>

        <div class="relative max-w-5xl w-full glass-panel sci-fi-corners p-6 md:p-8 rounded-lg border border-[var(--border-glow)] flex flex-col max-h-[95vh] overflow-hidden pointer-events-auto">
          
          <!-- Hangar Header -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-glow)] pb-4 mb-6">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-[var(--primary)] uppercase tracking-widest mb-1">
                <span class="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping"></span>
                HANGAR DECK // ACTIVE CALIBRATION
              </div>
              <h2 class="font-orbitron text-xl md:text-3xl font-bold text-white tracking-wider glow-text">
                SELECT YOUR EXPLORATION VESSEL
              </h2>
            </div>

            <!-- Ship Selector Tabs -->
            <div class="flex gap-2">
              ${shipList.map((ship, idx) => `
                <button data-ship-id="${ship.id}" class="ship-tab-btn px-4 py-2 rounded text-xs font-orbitron font-semibold tracking-wider transition-all border cursor-pointer pointer-events-auto ${ship.id === this.selectedShipId ? 'bg-[var(--primary)] text-black border-[var(--primary)] shadow-[0_0_15px_var(--glow)] font-bold' : 'bg-black/50 text-slate-300 border-slate-700/60 hover:border-slate-500'}">
                  [${idx + 1}] ${ship.name.split(' ')[0]}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Main Hangar Body: 3D Preview (Left) & Ship Specs (Right) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-1">
            
            <!-- Left: 3D Hologram Vessel Preview -->
            <div class="lg:col-span-6 flex flex-col items-center justify-center bg-black/70 border border-[var(--border-glow)] rounded-lg p-4 relative min-h-[280px]">
              <div class="absolute top-3 left-3 text-[10px] font-mono text-[var(--primary)] tracking-widest flex items-center gap-1">
                <svg class="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="30 60"></circle></svg>
                3D HOLOGRAPHIC BLUEPRINT
              </div>

              <!-- Canvas for 3D Ship Mesh -->
              <canvas id="ship-preview-canvas" class="w-full h-56 md:h-64"></canvas>

              <div class="text-center mt-2">
                <span class="text-xs font-mono text-slate-400">Class:</span>
                <span class="text-xs font-orbitron text-[var(--accent)] font-semibold ml-1">${activeShip.class}</span>
              </div>
            </div>

            <!-- Right: Tactical Specs & Lore -->
            <div class="lg:col-span-6 flex flex-col justify-between space-y-4">
              
              <!-- Ship Title & Tagline -->
              <div>
                <h3 class="font-orbitron text-2xl font-bold text-white glow-text mb-1">
                  ${activeShip.name}
                </h3>
                <p class="font-rajdhani text-sm text-slate-300 italic mb-4">
                  "${activeShip.tagline}"
                </p>
                
                <p class="font-mono text-xs text-slate-300/80 bg-black/40 border border-[var(--border-glow)] p-3 rounded leading-relaxed">
                  ${activeShip.lore}
                </p>
              </div>

              <!-- Tactical Stat Meters -->
              <div class="space-y-2.5 bg-black/40 border border-[var(--border-glow)] p-4 rounded">
                <div class="text-xs font-orbitron text-[var(--primary)] uppercase tracking-wider mb-2">
                  Tactical Performance Metrics
                </div>

                <!-- Maneuverability -->
                <div>
                  <div class="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>MANEUVERABILITY / AGILITY</span>
                    <span class="text-[var(--primary)] font-bold">${Math.round(activeShip.specs.turnRate * 2500)}%</span>
                  </div>
                  <div class="hud-progress-bar">
                    <div class="hud-progress-fill" style="width: ${Math.min(activeShip.specs.turnRate * 2500, 100)}%;"></div>
                  </div>
                </div>

                <!-- Sub-Light Warp Speed -->
                <div>
                  <div class="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>WARP ACCELERATION / VELOCITY</span>
                    <span class="text-[var(--primary)] font-bold">${activeShip.specs.maxSpeed}c</span>
                  </div>
                  <div class="hud-progress-bar">
                    <div class="hud-progress-fill" style="width: ${(activeShip.specs.maxSpeed / 5.0) * 100}%;"></div>
                  </div>
                </div>

                <!-- Shield Integrity -->
                <div>
                  <div class="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>SHIELD CAPACITOR</span>
                    <span class="text-[var(--primary)] font-bold">${activeShip.specs.shieldMax} GW</span>
                  </div>
                  <div class="hud-progress-bar">
                    <div class="hud-progress-fill" style="width: ${(activeShip.specs.shieldMax / 220) * 100}%;"></div>
                  </div>
                </div>

                <!-- Plasma Firepower -->
                <div>
                  <div class="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>PLASMA FIREPOWER</span>
                    <span class="text-[var(--primary)] font-bold">${activeShip.specs.laserDamage} MW</span>
                  </div>
                  <div class="hud-progress-bar">
                    <div class="hud-progress-fill" style="width: ${(activeShip.specs.laserDamage / 70) * 100}%;"></div>
                  </div>
                </div>
              </div>

              <!-- Special Tactical Module -->
              <div class="flex items-center gap-3 bg-[var(--glass-bg)] border border-[var(--border-glow)] p-3 rounded">
                <div class="w-8 h-8 rounded bg-[var(--primary)]/20 border border-[var(--primary)] flex items-center justify-center font-mono font-bold text-xs text-[var(--primary)] shrink-0">
                  ${activeShip.specialSystem.key}
                </div>
                <div class="text-left">
                  <div class="font-orbitron text-xs font-bold text-white">${activeShip.specialSystem.name}</div>
                  <div class="font-mono text-[11px] text-slate-300/80">${activeShip.specialSystem.description}</div>
                </div>
              </div>

            </div>
          </div>

          <!-- Bottom Action Confirmation -->
          <div class="mt-6 pt-4 border-t border-[var(--border-glow)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs font-mono text-slate-400">
              Cockpit HUD Theme: <span class="text-[var(--primary)] font-bold font-orbitron uppercase">${activeShip.theme}</span>
            </div>

            <button id="btn-launch-ship" class="btn-sci-fi px-8 py-3.5 rounded text-sm font-semibold tracking-widest flex items-center gap-3 w-full sm:w-auto justify-center cursor-pointer pointer-events-auto">
              <span>LAUNCH INTO OPEN SPACE [ENTER]</span>
              <svg class="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
    this.init3DPreview();
  }

  bindEvents() {
    const tabs = this.container.querySelectorAll('.ship-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        const shipId = e.currentTarget.getAttribute('data-ship-id');
        if (shipId && shipId !== this.selectedShipId) {
          this.selectedShipId = shipId;
          if (this.soundEngine) {
            this.soundEngine.playTargetLock();
          }
          this.render();
        }
      });
    });

    const btnLaunch = this.container.querySelector('#btn-launch-ship');
    if (btnLaunch) {
      btnLaunch.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.soundEngine) {
          this.soundEngine.playWarpJump();
        }
        this.finish();
      });
    }

    // Keyboard controls for switching ships and launching
    this.onKeyDown = (e) => {
      if (e.code === 'Digit1' || e.code === 'Numpad1') {
        this.selectedShipId = 'vanguard';
        if (this.soundEngine) this.soundEngine.playTargetLock();
        this.render();
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        this.selectedShipId = 'aegis';
        if (this.soundEngine) this.soundEngine.playTargetLock();
        this.render();
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        this.selectedShipId = 'quantum';
        if (this.soundEngine) this.soundEngine.playTargetLock();
        this.render();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        this.finish();
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  /**
   * 3D Wireframe / Faceted Ship Mesh Hologram
   */
  init3DPreview() {
    const canvas = this.container.querySelector('#ship-preview-canvas');
    if (!canvas) return;

    const w = canvas.clientWidth || 320;
    const h = canvas.clientHeight || 220;

    this.previewScene = new THREE.Scene();
    this.previewCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.previewCamera.position.set(0, 5, 18);
    this.previewCamera.lookAt(0, 0, 0);

    this.previewRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.previewRenderer.setSize(w, h);
    this.previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const activeShip = SHIPS[this.selectedShipId];
    const themeColor = new THREE.Color(activeShip.colors.primary);

    this.previewMeshGroup = new THREE.Group();

    // Procedural sci-fi ship silhouette geometry based on ship class
    let mainGeom;
    if (this.selectedShipId === 'vanguard') {
      // Sleek arrowhead fighter
      mainGeom = new THREE.ConeGeometry(3.5, 9, 4);
      mainGeom.rotateX(Math.PI / 2);
    } else if (this.selectedShipId === 'aegis') {
      // Heavy faceted dreadnought
      mainGeom = new THREE.BoxGeometry(6, 3, 9);
    } else {
      // Quantum pathfinder ring + prism
      mainGeom = new THREE.OctahedronGeometry(4, 1);
    }

    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
      emissive: themeColor,
      emissiveIntensity: 0.3,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: themeColor,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });

    const meshSolid = new THREE.Mesh(mainGeom, solidMat);
    const meshWire = new THREE.Mesh(mainGeom, wireMat);
    this.previewMeshGroup.add(meshSolid);
    this.previewMeshGroup.add(meshWire);

    // Holographic orbital scanning ring
    const ringGeom = new THREE.RingGeometry(6, 6.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: themeColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    this.previewMeshGroup.add(ringMesh);

    // Add ambient and directional lights to preview
    const light1 = new THREE.DirectionalLight(0xffffff, 2.0);
    light1.position.set(5, 10, 5);
    const light2 = new THREE.AmbientLight(0xffffff, 0.8);
    this.previewScene.add(light1);
    this.previewScene.add(light2);
    this.previewScene.add(this.previewMeshGroup);

    // Animation loop for hangar rotating hologram
    const animatePreview = () => {
      if (!this.previewMeshGroup) return;
      this.previewMeshGroup.rotation.y += 0.015;
      ringMesh.rotation.z -= 0.01;
      this.previewRenderer.render(this.previewScene, this.previewCamera);
      this.animId = requestAnimationFrame(animatePreview);
    };
    animatePreview();
  }

  finish() {
    if (this.isFinished) return;
    this.isFinished = true;

    window.removeEventListener('keydown', this.onKeyDown);
    if (this.animId) cancelAnimationFrame(this.animId);

    const modal = this.container.querySelector('#hangar-modal');
    if (modal) {
      modal.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.container.innerHTML = '';
        if (this.onShipSelected) {
          this.onShipSelected(SHIPS[this.selectedShipId]);
        }
      }, 250);
    } else {
      this.container.innerHTML = '';
      if (this.onShipSelected) {
        this.onShipSelected(SHIPS[this.selectedShipId]);
      }
    }
  }
}
