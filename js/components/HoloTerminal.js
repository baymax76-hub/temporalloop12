/**
 * Starfield OS - Planetary Holographic Terminal Overlay
 * Displays narrative logs, survivor transmissions, dimensional frequencies,
 * lore scanner, energy harvester, and constellation warp jump links.
 */

export class HoloTerminal {
  /**
   * @param {HTMLElement} container
   * @param {Object} nodeData - planet data from universeData.js
   * @param {Object} soundEngine
   * @param {Object} callbacks - { onScanLore, onRefillFuel, onWarpToNode, onClose }
   */
  constructor(container, nodeData, soundEngine, callbacks = {}) {
    this.container = container;
    this.nodeData = nodeData;
    this.soundEngine = soundEngine;
    this.callbacks = callbacks;
    this.isScanned = false;

    this.render();
  }

  render() {
    const d = this.nodeData;

    this.container.innerHTML = `
      <div id="holo-terminal-modal" class="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 select-none pointer-events-auto cursor-default">
        <div class="scanlines absolute inset-0"></div>

        <div class="relative max-w-4xl w-full glass-panel sci-fi-corners p-6 md:p-8 rounded-lg border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto">
          
          <!-- Terminal Header -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/30 pb-4 mb-5">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                ORBITAL DOCK ESTABLISHED // ${d.dimensionalFrequency}
              </div>
              <h2 class="font-orbitron text-2xl md:text-3xl font-extrabold text-white tracking-wider glow-text flex items-center gap-3">
                <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${d.color}; box-shadow: 0 0 10px ${d.color};"></span>
                ${d.name}
              </h2>
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2 text-xs font-mono">
              <span class="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                ${d.classification}
              </span>
              <span class="px-2.5 py-1 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                ${d.constellation}
              </span>
            </div>
          </div>

          <!-- Main Terminal Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-1">
            
            <!-- Left: Planetary Lore & History (Cols 1-7) -->
            <div class="md:col-span-7 space-y-4">
              <div class="bg-black/50 border border-cyan-500/20 p-4 rounded-lg">
                <div class="text-xs font-orbitron text-cyan-400 font-bold mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  MULTIVERSAL LOG ARCHIVE
                </div>
                <p class="font-mono text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  ${d.lore}
                </p>
              </div>

              <!-- Survivor Transmission Box -->
              <div class="bg-cyan-950/30 border border-cyan-500/30 p-4 rounded-lg">
                <div class="flex items-center justify-between text-xs font-mono text-cyan-300 mb-2">
                  <span class="font-bold flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"></path></svg>
                    INTERCEPTED SURVIVOR AUDIO LOG
                  </span>
                  <span class="text-slate-400 text-[10px]">${d.audioLog.timestamp}</span>
                </div>
                <p class="font-mono text-xs text-amber-200/90 italic mb-2">
                  ${d.audioLog.transcript}
                </p>
                <div class="text-[10px] font-mono text-cyan-400/70">
                  Transmitted by: <strong class="text-white">${d.audioLog.author}</strong>
                </div>
              </div>
            </div>

            <!-- Right: Orbital Actions & Connected Constellation Jump (Cols 8-12) -->
            <div class="md:col-span-5 space-y-3 flex flex-col justify-between">
              
              <div class="space-y-3">
                <div class="text-xs font-orbitron text-cyan-400 font-bold mb-1">
                  ORBITAL OPERATIONS
                </div>

                <!-- Action 1: Scan Lore -->
                <button id="btn-scan-lore" class="btn-sci-fi w-full p-3 rounded text-xs flex items-center justify-between">
                  <span class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <span>SCAN PLANETARY LORE</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300">+LOG</span>
                </button>

                <!-- Action 2: Refuel Energy -->
                <button id="btn-refuel-ship" class="btn-sci-fi w-full p-3 rounded text-xs flex items-center justify-between text-amber-300 border-amber-500/40">
                  <span class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span>HARVEST ANTIMATTER FUEL</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-[10px] text-amber-300">+${d.rewards.fuelBonus}%</span>
                </button>

                <!-- Connected Constellation Star Jumps -->
                <div class="bg-black/50 border border-purple-500/30 p-3 rounded-lg">
                  <div class="text-[11px] font-orbitron text-purple-300 font-bold mb-2">
                    CONNECTED CONSTELLATION NODES
                  </div>
                  <div class="space-y-1.5">
                    ${d.rewards.connectionUnlocks.map(targetId => `
                      <button data-warp-id="${targetId}" class="btn-warp-jump w-full text-left p-2 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-mono text-purple-200 flex items-center justify-between transition-all">
                        <span>WARP TO >> ${targetId.toUpperCase()}</span>
                        <span class="text-[10px] text-purple-400">JUMP ➔</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Terminal Feedback Alert -->
              <div id="terminal-feedback" class="text-xs font-mono text-center text-emerald-400 min-h-[20px] transition-all"></div>

            </div>
          </div>

          <!-- Bottom Close / Undock -->
          <div class="mt-5 pt-3 border-t border-cyan-500/30 flex justify-end">
            <button id="btn-close-terminal" class="btn-sci-fi px-6 py-2.5 rounded text-xs font-bold flex items-center gap-2">
              <span>DISENGAGE ORBIT / RESUME FLIGHT [ESC]</span>
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnScan = this.container.querySelector('#btn-scan-lore');
    const btnRefuel = this.container.querySelector('#btn-refuel-ship');
    const btnClose = this.container.querySelector('#btn-close-terminal');
    const feedbackEl = this.container.querySelector('#terminal-feedback');

    if (btnScan) {
      btnScan.addEventListener('click', () => {
        this.isScanned = true;
        if (this.soundEngine) this.soundEngine.playEnergyTransfer();
        if (feedbackEl) {
          feedbackEl.innerHTML = `✓ Planetary lore decrypted and synced to Galaxy Codex!`;
        }
        if (this.callbacks.onScanLore) {
          this.callbacks.onScanLore(this.nodeData);
        }
      });
    }

    if (btnRefuel) {
      btnRefuel.addEventListener('click', () => {
        if (this.soundEngine) this.soundEngine.playEnergyTransfer();
        if (feedbackEl) {
          feedbackEl.innerHTML = `⚡ Energy surge absorbed! Fuel replenished (+${this.nodeData.rewards.fuelBonus}%).`;
        }
        if (this.callbacks.onRefillFuel) {
          this.callbacks.onRefillFuel(this.nodeData.rewards.fuelBonus);
        }
      });
    }

    const warpBtns = this.container.querySelectorAll('.btn-warp-jump');
    warpBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-warp-id');
        this.close();
        if (this.callbacks.onWarpToNode) {
          this.callbacks.onWarpToNode(targetId);
        }
      });
    });

    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    this.onKeyDown = (e) => {
      if (e.code === 'Escape') this.close();
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  close() {
    window.removeEventListener('keydown', this.onKeyDown);
    const modal = this.container.querySelector('#holo-terminal-modal');
    if (modal) {
      modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.container.innerHTML = '';
        if (this.callbacks.onClose) this.callbacks.onClose();
      }, 300);
    } else {
      if (this.callbacks.onClose) this.callbacks.onClose();
    }
  }
}
