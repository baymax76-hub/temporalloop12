/**
 * Starfield OS - Pilot Flight Manual & Keybindings Guide
 */

export class FlightManual {
  /**
   * @param {HTMLElement} container
   * @param {Function} onClose
   */
  constructor(container, onClose) {
    this.container = container;
    this.onClose = onClose;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div id="manual-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 md:p-8 select-none pointer-events-auto cursor-default">
        <div class="scanlines absolute inset-0"></div>

        <div class="relative max-w-3xl w-full glass-panel sci-fi-corners p-6 md:p-8 rounded-lg border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-5">
            <div>
              <div class="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">PILOT DIRECTIVE MANUAL</div>
              <h2 class="font-orbitron text-xl md:text-2xl font-bold text-white tracking-wider glow-text">
                SPACECRAFT FLIGHT CONTROLS & HOTKEYS
              </h2>
            </div>
            <button id="btn-close-x" class="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              ✕
            </button>
          </div>

          <!-- Controls Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1 text-xs font-mono">
            
            <!-- Flight Steering -->
            <div class="bg-black/50 border border-slate-700/60 p-3.5 rounded-lg space-y-2">
              <div class="font-orbitron text-cyan-300 font-bold flex items-center gap-2">
                <span>🚀</span> 3D FLIGHT STEERING
              </div>
              <div class="space-y-1.5 text-slate-300">
                <div class="flex justify-between"><span>Pitch & Yaw</span><strong class="text-white">Mouse Drag / Move</strong></div>
                <div class="flex justify-between"><span>Forward Throttle</span><strong class="text-white">W or Up Arrow</strong></div>
                <div class="flex justify-between"><span>Reverse / Brake</span><strong class="text-white">S or Down Arrow</strong></div>
                <div class="flex justify-between"><span>Lateral Strafe</span><strong class="text-white">A / D</strong></div>
                <div class="flex justify-between"><span>Roll Left / Right</span><strong class="text-white">Q / E</strong></div>
                <div class="flex justify-between"><span>Throttle Wheel</span><strong class="text-white">Mouse Wheel</strong></div>
              </div>
            </div>

            <!-- Hyper-Speed & Navigation -->
            <div class="bg-black/50 border border-slate-700/60 p-3.5 rounded-lg space-y-2">
              <div class="font-orbitron text-cyan-300 font-bold flex items-center gap-2">
                <span>⚡</span> WARP DRIVE & COMBAT
              </div>
              <div class="space-y-1.5 text-slate-300">
                <div class="flex justify-between"><span>Warp Speed Boost</span><strong class="text-white">SPACE / SHIFT</strong></div>
                <div class="flex justify-between"><span>Fire Plasma Lasers</span><strong class="text-white">F / Left Click</strong></div>
                <div class="flex justify-between"><span>Special Ability / EMP</span><strong class="text-white">R or T</strong></div>
                <div class="flex justify-between"><span>Lock-on Target Star</span><strong class="text-white">Click Star / Reticle</strong></div>
                <div class="flex justify-between"><span>Mine Asteroids</span><strong class="text-white">Blast with Lasers</strong></div>
              </div>
            </div>

            <!-- Cockpit HUD Systems -->
            <div class="bg-black/50 border border-slate-700/60 p-3.5 rounded-lg space-y-2">
              <div class="font-orbitron text-cyan-300 font-bold flex items-center gap-2">
                <span>🗺️</span> NAVIGATION & ARCHIVES
              </div>
              <div class="space-y-1.5 text-slate-300">
                <div class="flex justify-between"><span>Galaxy Codex Star Map</span><strong class="text-white">M Key</strong></div>
                <div class="flex justify-between"><span>Flight Controls Manual</span><strong class="text-white">H Key</strong></div>
                <div class="flex justify-between"><span>Power Routing Sliders</span><strong class="text-white">Engines/Shields/Weapons</strong></div>
                <div class="flex justify-between"><span>360&deg; Galaxy Radar</span><strong class="text-white">Bottom Left Deck</strong></div>
              </div>
            </div>

            <!-- Exploration Tips -->
            <div class="bg-cyan-950/30 border border-cyan-500/30 p-3.5 rounded-lg space-y-2">
              <div class="font-orbitron text-cyan-300 font-bold flex items-center gap-2">
                <span>💡</span> EXPLORATION PROTOCOLS
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                Approach glowing celestial nodes or click them to initiate automatic orbit docking. Open holographic terminals to scan multiversal logs, replenish antimatter fuel, and traverse constellation pathways.
              </p>
            </div>

          </div>

          <!-- Bottom Close -->
          <div class="mt-4 pt-3 border-t border-cyan-500/30 flex justify-end">
            <button id="btn-close-manual" class="btn-sci-fi px-6 py-2 rounded text-xs font-bold">
              RESUME FLIGHT [ESC]
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnClose = this.container.querySelector('#btn-close-manual');
    const btnCloseX = this.container.querySelector('#btn-close-x');

    const handleClose = () => {
      window.removeEventListener('keydown', this.onKeyDown);
      this.container.innerHTML = '';
      if (this.onClose) this.onClose();
    };

    if (btnClose) btnClose.addEventListener('click', handleClose);
    if (btnCloseX) btnCloseX.addEventListener('click', handleClose);

    this.onKeyDown = (e) => {
      if (e.code === 'Escape' || e.code === 'KeyH') handleClose();
    };
    window.addEventListener('keydown', this.onKeyDown);
  }
}
