/**
 * Starfield OS - Cloud Server & Multiverse Fleet Control Terminal
 * Real-time cloud server telemetry, active fleet status, ping latency,
 * and emergency multiversal transmission console.
 */

export class CloudTerminal {
  /**
   * @param {HTMLElement} container
   * @param {Object} cloudEngine
   * @param {Object} soundEngine
   * @param {Function} onClose
   */
  constructor(container, cloudEngine, soundEngine, onClose) {
    this.container = container;
    this.cloudEngine = cloudEngine;
    this.soundEngine = soundEngine;
    this.onClose = onClose;

    this.render();
  }

  render() {
    const status = this.cloudEngine.getCloudStatus();
    const fleetList = Array.from(this.cloudEngine.fleetMembers.values());

    this.container.innerHTML = `
      <div id="cloud-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 md:p-8 select-none">
        <div class="scanlines absolute inset-0"></div>

        <div class="relative max-w-4xl w-full glass-panel sci-fi-corners p-6 md:p-8 rounded-lg border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.2)] flex flex-col max-h-[92vh] overflow-hidden">
          
          <!-- Header -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/30 pb-4 mb-5">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                CLOUD SERVER TELEMETRY // ${status.shard}
              </div>
              <h2 class="font-orbitron text-xl md:text-3xl font-extrabold text-white tracking-wider glow-text flex items-center gap-3">
                MULTIVERSE CLOUD CONTROL ENGINE
              </h2>
            </div>

            <!-- Server Status Badge -->
            <div class="flex items-center gap-3 bg-black/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-lg text-xs font-mono">
              <div>
                <span class="text-slate-400">LATENCY:</span>
                <span class="text-emerald-400 font-bold font-orbitron">${status.latency} ms</span>
              </div>
              <div class="w-px h-4 bg-slate-700"></div>
              <div>
                <span class="text-slate-400">UPLINK:</span>
                <span class="text-cyan-300 font-bold">${status.mode}</span>
              </div>
            </div>
          </div>

          <!-- Main Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-1">
            
            <!-- Left: Active Fleet Roster (Cols 1-7) -->
            <div class="lg:col-span-7 space-y-4">
              <div class="text-xs font-orbitron text-cyan-300 font-bold flex items-center justify-between">
                <span>ACTIVE SURVIVOR FLEET IN SECTOR</span>
                <span class="text-[10px] font-mono text-slate-400">${fleetList.length} VESSELS TRACKED</span>
              </div>

              <div class="space-y-2">
                ${fleetList.map(pilot => `
                  <div class="p-3 rounded bg-black/50 border border-slate-800 flex items-center justify-between font-mono text-xs hover:border-cyan-500/40 transition-all">
                    <div class="flex items-center gap-3">
                      <div class="w-3 h-3 rounded-full ${pilot.theme === 'aegis' ? 'bg-amber-400 shadow-[0_0_8px_#ffaa00]' : (pilot.theme === 'quantum' ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' : 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]')}"></div>
                      <div>
                        <div class="font-bold text-white">${pilot.shipName}</div>
                        <div class="text-[10px] text-slate-400">ID: ${pilot.id} &bull; Vector: [${Math.round(pilot.x)}, ${Math.round(pilot.y)}, ${Math.round(pilot.z)}]</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-[11px] font-bold text-cyan-300">${(pilot.speed || 2.0).toFixed(1)}c</span>
                      <div class="text-[9px] text-emerald-400">SYNCED</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Right: Broadcast Transmission & Cloud Control (Cols 8-12) -->
            <div class="lg:col-span-5 space-y-4 flex flex-col justify-between">
              
              <div class="space-y-3">
                <div class="text-xs font-orbitron text-cyan-300 font-bold">
                  TRANSMIT TO CLOUD ARCHIVE
                </div>

                <div class="bg-black/50 border border-cyan-500/20 p-4 rounded-lg space-y-3 font-mono text-xs">
                  <div>
                    <label class="block text-slate-400 text-[10px] uppercase mb-1">Author / Call-sign</label>
                    <input id="input-pilot-author" type="text" value="Deep Void Vanguard" class="w-full bg-black/80 border border-slate-700 rounded px-2.5 py-1.5 text-cyan-300 focus:outline-none focus:border-cyan-400" />
                  </div>

                  <div>
                    <label class="block text-slate-400 text-[10px] uppercase mb-1">Encrypted Lore Broadcast</label>
                    <textarea id="input-pilot-msg" rows="3" class="w-full bg-black/80 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 resize-none" placeholder="Enter emergency coordinates or discovered anomaly log..."></textarea>
                  </div>

                  <button id="btn-broadcast-log" class="btn-sci-fi w-full py-2.5 rounded text-xs font-bold flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    <span>BROADCAST TO MULTIVERSE</span>
                  </button>

                  <div id="cloud-tx-feedback" class="text-[11px] text-emerald-400 min-h-[16px]"></div>
                </div>
              </div>

              <!-- Shard Telemetry Metrics -->
              <div class="bg-cyan-950/20 border border-cyan-500/20 p-3 rounded font-mono text-[11px] text-slate-300 space-y-1">
                <div class="flex justify-between"><span>Throughput:</span><strong class="text-white">14.8 KB/s</strong></div>
                <div class="flex justify-between"><span>Harmonic Resonance:</span><strong class="text-cyan-300">99.4%</strong></div>
                <div class="flex justify-between"><span>Cloud Core:</span><strong class="text-white">Node.js / WebSockets</strong></div>
              </div>

            </div>

          </div>

          <!-- Bottom Close -->
          <div class="mt-4 pt-3 border-t border-cyan-500/30 flex justify-end">
            <button id="btn-close-cloud" class="btn-sci-fi px-6 py-2 rounded text-xs font-bold">
              RETURN TO FLIGHT [ESC]
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnTx = this.container.querySelector('#btn-broadcast-log');
    const btnClose = this.container.querySelector('#btn-close-cloud');
    const inputAuthor = this.container.querySelector('#input-pilot-author');
    const inputMsg = this.container.querySelector('#input-pilot-msg');
    const feedbackEl = this.container.querySelector('#cloud-tx-feedback');

    if (btnTx) {
      btnTx.addEventListener('click', async () => {
        const author = inputAuthor.value.trim() || 'Explorer';
        const msg = inputMsg.value.trim() || 'Deep-space anomaly signal transmitted across the multiverse.';

        if (this.soundEngine) this.soundEngine.playTargetLock();
        btnTx.disabled = true;
        btnTx.innerHTML = `<span>TRANSMITTING...</span>`;

        await this.cloudEngine.transmitCodexLog(author, 'aethelgard', msg);

        btnTx.disabled = false;
        btnTx.innerHTML = `<span>BROADCAST TO MULTIVERSE</span>`;
        if (feedbackEl) {
          feedbackEl.textContent = '✓ Broadcast relayed to all connected vessels.';
        }
        inputMsg.value = '';
      });
    }

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
    const modal = this.container.querySelector('#cloud-modal');
    if (modal) {
      modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.container.innerHTML = '';
        if (this.onClose) this.onClose();
      }, 300);
    } else {
      if (this.onClose) this.onClose();
    }
  }
}
