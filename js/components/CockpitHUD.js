/**
 * Starfield OS - Master Cockpit Flight HUD Interface
 * Diegetic glassmorphic HUD with 3 ship themes, 3D target reticles, radar mini-map,
 * telemetry readouts, power distribution sliders, tactical weapons bay, and gyro horizon.
 */

export class CockpitHUD {
  /**
   * @param {HTMLElement} container
   * @param {Object} shipConfig
   * @param {Object} soundEngine
   * @param {Object} handlers - { onFireLaser, onSpecialAbility, onPowerChange, onOpenCodex, onOpenManual, onSwitchShip }
   */
  constructor(container, shipConfig, soundEngine, handlers = {}) {
    this.container = container;
    this.shipConfig = shipConfig;
    this.soundEngine = soundEngine;
    this.handlers = handlers;

    // Dynamic Ship State
    this.hull = shipConfig.specs.hullMax;
    this.shield = shipConfig.specs.shieldMax;
    this.fuel = shipConfig.specs.fuelMax;
    this.laserHeat = 0; // 0 to 100%

    // Power Routing (Engines, Shields, Weapons) - Normalized to 3.0 total
    this.power = {
      engines: 1.0,
      shields: 1.0,
      weapons: 1.0,
    };

    this.activeTarget = null;
    this.lockPercentage = 0;
    this.telemetry = { speed: 0, throttle: 0, coords: { x: 0, y: 0, z: 0 }, isBoosting: false };

    this.render();
    this.initRadarCanvas();
    this.bindEvents();
  }

  setShip(shipConfig) {
    this.shipConfig = shipConfig;
    this.hull = shipConfig.specs.hullMax;
    this.shield = shipConfig.specs.shieldMax;
    this.fuel = shipConfig.specs.fuelMax;
    this.render();
    this.initRadarCanvas();
    this.bindEvents();
  }

  render() {
    const s = this.shipConfig;

    this.container.innerHTML = `
      <div id="flight-hud-root" class="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 md:p-6 select-none ${'theme-' + s.theme}">
        <div class="cockpit-frame-overlay"></div>
        <div class="scanlines absolute inset-0"></div>

        <!-- 1. TOP HEADER: Telemetry & Navigation Strip -->
        <header class="interactive-hud pointer-events-auto flex items-center justify-between gap-4 glass-panel sci-fi-corners px-4 py-2.5 rounded-lg">
          
          <!-- Left: Ship Identity & Status -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-[var(--primary)]/15 border border-[var(--primary)] flex items-center justify-center text-[var(--primary)] font-orbitron font-bold text-xs shadow-[0_0_10px_var(--glow)]">
              ${s.name.charAt(0)}
            </div>
            <div>
              <div class="font-orbitron text-xs md:text-sm font-bold text-white tracking-wider flex items-center gap-2">
                <span>${s.name}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/40">${s.class}</span>
              </div>
              <div class="font-mono text-[11px] text-slate-400">
                SYS: <span class="text-emerald-400 font-bold">ONLINE</span> &bull; LINK: <span class="text-[var(--primary)]">ESTABLISHED</span>
              </div>
            </div>
          </div>

          <!-- Center: 3D Spatial Coordinates & Warp Telemetry -->
          <div class="hidden md:flex items-center gap-8 font-mono text-xs">
            <div>
              <div class="text-[10px] text-slate-400 tracking-widest uppercase">Coordinates [X, Y, Z]</div>
              <div id="hud-coordinates" class="text-[var(--primary)] font-bold text-sm tracking-wider">
                X: +000 &bull; Y: +000 &bull; Z: +000
              </div>
            </div>

            <div>
              <div class="text-[10px] text-slate-400 tracking-widest uppercase">Velocity / Sub-Light</div>
              <div id="hud-speedometer" class="text-white font-bold text-sm tracking-wider font-orbitron flex items-center gap-1.5">
                <span id="hud-speed-val" class="text-[var(--primary)]">0.00</span>
                <span class="text-[10px] text-slate-400">c (Lightspeed)</span>
              </div>
            </div>

            <div>
              <div class="text-[10px] text-slate-400 tracking-widest uppercase">Warp Drive Capacitor</div>
              <div id="hud-warp-status" class="text-sky-400 font-bold text-xs tracking-wider flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                READY [SPACE]
              </div>
            </div>
          </div>

          <!-- Right: Action Buttons & Sound Toggle -->
          <div class="flex items-center gap-2">
            <button id="btn-cloud" title="Open Cloud Server & Multiverse Fleet Engine [C]" class="btn-sci-fi px-3 py-1.5 rounded text-xs flex items-center gap-1.5 text-emerald-400 border-emerald-500/40">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="hidden sm:inline">CLOUD [C]</span>
            </button>

            <button id="btn-codex" title="Open Multiverse Galaxy Codex [M]" class="btn-sci-fi px-3 py-1.5 rounded text-xs flex items-center gap-1.5">
              <svg class="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <span class="hidden sm:inline">CODEX [M]</span>
            </button>

            <button id="btn-manual" title="Flight Controls & Keybindings [H]" class="btn-sci-fi px-3 py-1.5 rounded text-xs flex items-center gap-1.5">
              <svg class="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span class="hidden sm:inline">CONTROLS</span>
            </button>

            <button id="btn-mute-toggle" title="Toggle Audio Synthesizer" class="p-2 rounded bg-black/60 border border-[var(--border-glow)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-black transition-all">
              <svg id="icon-sound-on" class="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
            </button>

            <button id="btn-switch-ship" title="Switch Ship in Hangar" class="p-2 rounded bg-black/60 border border-[var(--border-glow)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-black transition-all">
              <svg class="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
          </div>
        </header>

        <!-- 2. CENTER RETICLE ANCHORS CONTAINER (Screen Space Overlays) -->
        <div id="reticles-layer" class="absolute inset-0 pointer-events-none"></div>

        <!-- 3. CENTER FLIGHT CROSSHAIR -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center opacity-80">
          <div class="relative w-12 h-12 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]"></div>
            <div class="absolute w-8 h-8 border border-[var(--primary)]/50 rounded-full"></div>
            <div class="absolute w-12 border-t border-[var(--primary)]/30"></div>
            <div class="absolute h-12 border-l border-[var(--primary)]/30"></div>
          </div>
        </div>

        <!-- 4. BOTTOM DASHBOARD: Radar, Ship Status, Power Routing, Tactical Bay -->
        <footer class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pointer-events-none">
          
          <!-- Bottom Left: 3D Galaxy Map & Waypoint Radar (Cols 1-4) -->
          <div class="interactive-hud pointer-events-auto md:col-span-4 glass-panel sci-fi-corners p-3.5 rounded-lg border border-[var(--border-glow)]">
            <div class="flex items-center justify-between text-xs font-mono text-[var(--primary)] mb-2">
              <span class="flex items-center gap-1.5 font-orbitron font-bold">
                <span class="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                GALAXY RADAR &bull; 360&deg;
              </span>
              <span id="radar-target-name" class="text-[10px] text-slate-400 truncate max-w-[120px]">SEARCHING...</span>
            </div>

            <!-- Radar Canvas -->
            <div class="relative w-full h-32 bg-black/60 rounded border border-[var(--border-glow)] overflow-hidden flex items-center justify-center">
              <canvas id="radar-canvas" class="w-full h-full"></canvas>
              
              <!-- Directional Target Indicator Arrow -->
              <div id="radar-beacon-arrow" class="absolute pointer-events-none text-[var(--primary)] font-bold text-xs" style="transform: rotate(0deg);">
                ▲
              </div>
            </div>

            <div class="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-400">
              <span>RANGE: <span class="text-[var(--primary)] font-bold">12,000 AU</span></span>
              <span>BLIPS: <span class="text-white font-bold">8 NODES</span></span>
            </div>
          </div>

          <!-- Bottom Center: Tactical Power Routing & Gyro Horizon (Cols 5-8) -->
          <div class="interactive-hud pointer-events-auto md:col-span-4 glass-panel sci-fi-corners p-3.5 rounded-lg border border-[var(--border-glow)]">
            <div class="flex items-center justify-between text-xs font-orbitron text-[var(--primary)] font-bold mb-2">
              <span>POWER DISTRIBUTION MATRIX</span>
              <span class="text-[10px] font-mono text-slate-400">BALANCED</span>
            </div>

            <!-- 3 Power Routing Sliders -->
            <div class="space-y-2 text-xs font-mono">
              <!-- Engines -->
              <div>
                <div class="flex justify-between text-slate-300 text-[11px] mb-0.5">
                  <span class="flex items-center gap-1 text-sky-400">⚡ ENGINES (THRUST)</span>
                  <span id="val-power-engines" class="font-bold">1.0x</span>
                </div>
                <input id="slider-engines" type="range" min="0.5" max="1.5" step="0.1" value="1.0" class="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-sky-400" />
              </div>

              <!-- Shields -->
              <div>
                <div class="flex justify-between text-slate-300 text-[11px] mb-0.5">
                  <span class="flex items-center gap-1 text-emerald-400">🛡️ SHIELDS (ARMOR)</span>
                  <span id="val-power-shields" class="font-bold">1.0x</span>
                </div>
                <input id="slider-shields" type="range" min="0.5" max="1.5" step="0.1" value="1.0" class="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-emerald-400" />
              </div>

              <!-- Weapons -->
              <div>
                <div class="flex justify-between text-slate-300 text-[11px] mb-0.5">
                  <span class="flex items-center gap-1 text-rose-400">💥 WEAPONS (CADENCE)</span>
                  <span id="val-power-weapons" class="font-bold">1.0x</span>
                </div>
                <input id="slider-weapons" type="range" min="0.5" max="1.5" step="0.1" value="1.0" class="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-rose-400" />
              </div>
            </div>
          </div>

          <!-- Bottom Right: Ship Vitals & Weapons Fire Bay (Cols 9-12) -->
          <div class="interactive-hud pointer-events-auto md:col-span-4 glass-panel sci-fi-corners p-3.5 rounded-lg border border-[var(--border-glow)]">
            <div class="flex items-center justify-between text-xs font-orbitron text-[var(--primary)] font-bold mb-2">
              <span>HULL & TACTICAL STATUS</span>
              <span id="hud-fuel-percent" class="text-[10px] font-mono text-[var(--primary)] font-bold">100% FUEL</span>
            </div>

            <!-- Vitals Progress Bars -->
            <div class="space-y-1.5 mb-3 text-xs font-mono">
              <!-- Hull -->
              <div>
                <div class="flex justify-between text-[10px] text-slate-300">
                  <span>HULL INTEGRITY</span>
                  <span id="val-hull" class="text-rose-400 font-bold">${s.specs.hullMax} / ${s.specs.hullMax}</span>
                </div>
                <div class="hud-progress-bar h-1.5">
                  <div id="fill-hull" class="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all" style="width: 100%;"></div>
                </div>
              </div>

              <!-- Shield -->
              <div>
                <div class="flex justify-between text-[10px] text-slate-300">
                  <span>SHIELD CAPACITOR</span>
                  <span id="val-shield" class="text-sky-400 font-bold">${s.specs.shieldMax} / ${s.specs.shieldMax}</span>
                </div>
                <div class="hud-progress-bar h-1.5">
                  <div id="fill-shield" class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all" style="width: 100%;"></div>
                </div>
              </div>

              <!-- Fuel Reserve -->
              <div>
                <div class="flex justify-between text-[10px] text-slate-300">
                  <span>ANTIMATTER FUEL</span>
                  <span id="val-fuel" class="text-amber-400 font-bold">${s.specs.fuelMax} / ${s.specs.fuelMax}</span>
                </div>
                <div class="hud-progress-bar h-1.5">
                  <div id="fill-fuel" class="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all" style="width: 100%;"></div>
                </div>
              </div>
            </div>

            <!-- Tactical Weapon Triggers -->
            <div class="grid grid-cols-2 gap-2">
              <button id="btn-fire-laser" class="btn-sci-fi py-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                <span>FIRE LASER [F]</span>
              </button>

              <button id="btn-special-ability" class="btn-sci-fi py-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 text-[var(--accent)] border-[var(--accent)]/40">
                <span>${s.specialSystem.name.split(' ')[0]} [${s.specialSystem.key}]</span>
              </button>
            </div>
          </div>

        </footer>
      </div>
    `;

    this.reticlesLayer = this.container.querySelector('#reticles-layer');
    this.speedValEl = this.container.querySelector('#hud-speed-val');
    this.coordsEl = this.container.querySelector('#hud-coordinates');
    this.fuelValEl = this.container.querySelector('#val-fuel');
    this.fuelFillEl = this.container.querySelector('#fill-fuel');
    this.fuelPercentEl = this.container.querySelector('#hud-fuel-percent');
    this.shieldValEl = this.container.querySelector('#val-shield');
    this.shieldFillEl = this.container.querySelector('#fill-shield');
    this.hullValEl = this.container.querySelector('#val-hull');
    this.hullFillEl = this.container.querySelector('#fill-hull');
    this.radarTargetName = this.container.querySelector('#radar-target-name');
    this.radarBeaconArrow = this.container.querySelector('#radar-beacon-arrow');
  }

  initRadarCanvas() {
    this.radarCanvas = this.container.querySelector('#radar-canvas');
    if (!this.radarCanvas) return;
    this.radarCtx = this.radarCanvas.getContext('2d');
    this.radarCanvas.width = 300;
    this.radarCanvas.height = 160;
  }

  bindEvents() {
    // 1. Action Buttons
    const btnCloud = this.container.querySelector('#btn-cloud');
    const btnCodex = this.container.querySelector('#btn-codex');
    const btnManual = this.container.querySelector('#btn-manual');
    const btnMute = this.container.querySelector('#btn-mute-toggle');
    const btnSwitch = this.container.querySelector('#btn-switch-ship');
    const btnFire = this.container.querySelector('#btn-fire-laser');
    const btnSpecial = this.container.querySelector('#btn-special-ability');

    if (btnCloud) btnCloud.addEventListener('click', () => this.handlers.onOpenCloud?.());
    if (btnCodex) btnCodex.addEventListener('click', () => this.handlers.onOpenCodex?.());
    if (btnManual) btnManual.addEventListener('click', () => this.handlers.onOpenManual?.());
    if (btnSwitch) btnSwitch.addEventListener('click', () => this.handlers.onSwitchShip?.());

    if (btnMute) {
      btnMute.addEventListener('click', () => {
        if (this.soundEngine) {
          const isMuted = this.soundEngine.toggleMute();
          btnMute.innerHTML = isMuted
            ? `<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>`
            : `<svg class="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>`;
        }
      });
    }

    if (btnFire) {
      btnFire.addEventListener('click', () => this.handlers.onFireLaser?.(this.shipConfig.theme));
    }
    if (btnSpecial) {
      btnSpecial.addEventListener('click', () => this.handlers.onSpecialAbility?.(this.shipConfig.theme));
    }

    // 2. Power Sliders
    const sEng = this.container.querySelector('#slider-engines');
    const sShi = this.container.querySelector('#slider-shields');
    const sWea = this.container.querySelector('#slider-weapons');
    const vEng = this.container.querySelector('#val-power-engines');
    const vShi = this.container.querySelector('#val-power-shields');
    const vWea = this.container.querySelector('#val-power-weapons');

    const updatePower = () => {
      this.power.engines = parseFloat(sEng.value);
      this.power.shields = parseFloat(sShi.value);
      this.power.weapons = parseFloat(sWea.value);

      vEng.textContent = `${this.power.engines.toFixed(1)}x`;
      vShi.textContent = `${this.power.shields.toFixed(1)}x`;
      vWea.textContent = `${this.power.weapons.toFixed(1)}x`;

      if (this.handlers.onPowerChange) {
        this.handlers.onPowerChange(this.power.engines, this.power.shields, this.power.weapons);
      }
    };

    if (sEng) sEng.addEventListener('input', updatePower);
    if (sShi) sShi.addEventListener('input', updatePower);
    if (sWea) sWea.addEventListener('input', updatePower);

    // 3. Hotkeys for Lasers & Special
    this.onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'KeyF') {
        this.handlers.onFireLaser?.(this.shipConfig.theme);
      } else if (e.code === 'KeyR' || e.code === 'KeyT') {
        this.handlers.onSpecialAbility?.(this.shipConfig.theme);
      } else if (e.code === 'KeyM') {
        this.handlers.onOpenCodex?.();
      } else if (e.code === 'KeyC') {
        this.handlers.onOpenCloud?.();
      } else if (e.code === 'KeyH') {
        this.handlers.onOpenManual?.();
      }
    };

    window.addEventListener('keydown', this.onKeyDown);
  }

  /**
   * Refill or consume ship fuel
   */
  addFuel(amount) {
    this.fuel = Math.min(this.fuel + amount, this.shipConfig.specs.fuelMax);
  }

  /**
   * Per-frame HUD update tick
   * @param {Object} telemetry - from SpaceEngine
   * @param {Array} projectedNodes - 2D screen positions & distances of all celestial nodes
   */
  update(telemetry, projectedNodes) {
    this.telemetry = telemetry;

    // 1. Deduct fuel burn
    if (telemetry.fuelBurn > 0) {
      this.fuel = Math.max(0, this.fuel - telemetry.fuelBurn);
    }

    // 2. Update telemetry readouts in DOM
    if (this.speedValEl) {
      this.speedValEl.textContent = (telemetry.speed || 0).toFixed(2);
    }
    if (this.coordsEl && telemetry.coords) {
      const x = Math.round(telemetry.coords.x);
      const y = Math.round(telemetry.coords.y);
      const z = Math.round(telemetry.coords.z);
      this.coordsEl.innerHTML = `X: <span class="text-white">${x > 0 ? '+' : ''}${x}</span> &bull; Y: <span class="text-white">${y > 0 ? '+' : ''}${y}</span> &bull; Z: <span class="text-white">${z > 0 ? '+' : ''}${z}</span>`;
    }

    // 3. Update Vitals Meters
    if (this.fuelFillEl && this.fuelValEl) {
      const fuelPct = Math.round((this.fuel / this.shipConfig.specs.fuelMax) * 100);
      this.fuelFillEl.style.width = `${fuelPct}%`;
      this.fuelValEl.textContent = `${Math.round(this.fuel)} / ${this.shipConfig.specs.fuelMax}`;
      if (this.fuelPercentEl) this.fuelPercentEl.textContent = `${fuelPct}% FUEL`;
    }

    // 4. Update Screen Space Target Reticles
    this.updateTargetReticles(projectedNodes);

    // 5. Update Galaxy Radar Mini-Map
    this.updateRadar(projectedNodes, telemetry);
  }

  /**
   * Render dynamic 3D-projected target reticles over celestial stars
   */
  updateTargetReticles(projectedNodes) {
    if (!this.reticlesLayer || !projectedNodes) return;

    let html = '';
    projectedNodes.forEach(node => {
      // Only show if in front of camera
      if (!node.inFront) return;

      const isHoveredOrLocked = node.isHovered || node.isLocked;
      const opacity = isHoveredOrLocked ? 1.0 : (node.distance < 1200 ? 0.8 : 0.45);
      const distFormatted = `${Math.round(node.distance)} AU`;

      html += `
        <div class="target-reticle interactive-hud pointer-events-auto" style="left: ${node.screenX}px; top: ${node.screenY}px; opacity: ${opacity};" data-node-id="${node.id}">
          
          <div class="relative flex items-center justify-center">
            <!-- Reticle Ring -->
            <div class="reticle-ring ${isHoveredOrLocked ? 'w-20 h-20 border-[var(--primary)] scale-110 shadow-[0_0_20px_var(--glow)]' : 'w-14 h-14 border-slate-400/40'}">
              <div class="reticle-center-dot"></div>
            </div>

            <!-- Corner Brackets -->
            <div class="bracket-tl reticle-corner-bracket"></div>
            <div class="bracket-tr reticle-corner-bracket"></div>
            <div class="bracket-bl reticle-corner-bracket"></div>
            <div class="bracket-br reticle-corner-bracket"></div>

            <!-- Target Data Callout Box -->
            <div class="absolute left-12 top-1/2 -translate-y-1/2 bg-black/80 border border-[var(--border-glow)] px-2.5 py-1.5 rounded text-left whitespace-nowrap backdrop-blur-md shadow-lg pointer-events-none">
              <div class="font-orbitron text-[11px] font-bold text-white flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${node.color};"></span>
                ${node.name}
              </div>
              <div class="font-mono text-[9px] text-slate-300 flex items-center gap-2">
                <span>DIST: <strong class="text-[var(--primary)]">${distFormatted}</strong></span>
                <span>&bull; ${node.constellation}</span>
              </div>
            </div>
          </div>

        </div>
      `;
    });

    this.reticlesLayer.innerHTML = html;

    // Bind click events on reticles to lock-on / warp
    const reticleEls = this.reticlesLayer.querySelectorAll('.target-reticle');
    reticleEls.forEach(el => {
      el.addEventListener('click', (e) => {
        const nodeId = el.getAttribute('data-node-id');
        const targetNode = projectedNodes.find(n => n.id === nodeId);
        if (targetNode && this.handlers.onSelectTargetNode) {
          this.handlers.onSelectTargetNode(targetNode.nodeData);
        }
      });
    });
  }

  /**
   * Draw 360-degree radar sphere with celestial blips and target direction arrow
   */
  updateRadar(projectedNodes, telemetry) {
    if (!this.radarCtx || !this.radarCanvas) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radarRadius = Math.min(cx, cy) - 10;

    ctx.clearRect(0, 0, w, h);

    // 1. Radar background circles
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius * 0.33, 0, Math.PI * 2);
    ctx.arc(cx, cy, radarRadius * 0.66, 0, Math.PI * 2);
    ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - radarRadius, cy);
    ctx.lineTo(cx + radarRadius, cy);
    ctx.moveTo(cx, cy - radarRadius);
    ctx.lineTo(cx, cy + radarRadius);
    ctx.stroke();

    // 2. Sweep line animation
    const time = performance.now() * 0.002;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(time) * radarRadius, cy + Math.sin(time) * radarRadius);
    ctx.stroke();

    // 3. Center ship blip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Plot celestial node blips on radar
    if (projectedNodes && projectedNodes.length > 0) {
      const nearest = projectedNodes[0];
      if (this.radarTargetName) {
        this.radarTargetName.textContent = `${nearest.name} (${Math.round(nearest.distance)} AU)`;
      }

      projectedNodes.forEach(node => {
        if (!node.relVector) return;

        // Scale distance to radar radius
        const maxDist = 2000;
        const normDist = Math.min(node.distance / maxDist, 1.0) * radarRadius;
        const angle = Math.atan2(node.relVector.z, node.relVector.x);

        const bx = cx + Math.cos(angle) * normDist;
        const by = cy + Math.sin(angle) * normDist;

        ctx.fillStyle = node.color || '#00f0ff';
        ctx.beginPath();
        ctx.arc(bx, by, node.isLocked ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (node.isLocked) {
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bx, by, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Directional arrow rotation to nearest / locked target
      if (this.radarBeaconArrow && nearest && nearest.relVector) {
        const arrowAngle = Math.atan2(nearest.relVector.x, -nearest.relVector.z) * (180 / Math.PI);
        this.radarBeaconArrow.style.transform = `rotate(${arrowAngle}deg)`;
      }
    }
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
