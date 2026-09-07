/**
 * Starfield OS - Multiverse Galaxy Codex & Constellation Topology Viewer
 * Fullscreen holographic archives of all planetary systems, constellations, survivor logs,
 * and direct star navigation links.
 */

import { CONSTELLATIONS, CELESTIAL_NODES } from '../data/universeData.js';

export class GalaxyCodex {
  /**
   * @param {HTMLElement} container
   * @param {Set} discoveredNodeIds
   * @param {Object} soundEngine
   * @param {Object} callbacks - { onWarpToNode, onClose }
   */
  constructor(container, discoveredNodeIds, soundEngine, callbacks = {}) {
    this.container = container;
    this.discoveredNodeIds = discoveredNodeIds || new Set(['aethelgard']);
    this.soundEngine = soundEngine;
    this.callbacks = callbacks;

    this.selectedNodeId = Array.from(this.discoveredNodeIds)[0] || 'aethelgard';
    this.render();
  }

  render() {
    const totalNodes = CELESTIAL_NODES.length;
    const discoveredCount = this.discoveredNodeIds.size;
    const completionPct = Math.round((discoveredCount / totalNodes) * 100);
    const activeNode = CELESTIAL_NODES.find(n => n.id === this.selectedNodeId) || CELESTIAL_NODES[0];

    this.container.innerHTML = `
      <div id="codex-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 md:p-8 select-none pointer-events-auto cursor-default">
        <div class="scanlines absolute inset-0"></div>

        <div class="relative max-w-6xl w-full glass-panel sci-fi-corners p-6 md:p-8 rounded-lg border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.2)] flex flex-col max-h-[92vh] overflow-hidden pointer-events-auto">
          
          <!-- Codex Header -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/30 pb-4 mb-5">
            <div>
              <div class="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-widest uppercase mb-1">
                <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                MULTIVERSAL CARTOGRAPHY ARCHIVE // CODEX 4.8
              </div>
              <h2 class="font-orbitron text-xl md:text-3xl font-extrabold text-white tracking-wider glow-text">
                GALAXY CONSTELLATION NETWORK
              </h2>
            </div>

            <!-- Progress Meter -->
            <div class="flex items-center gap-4 bg-black/60 border border-cyan-500/30 px-4 py-2 rounded-lg">
              <div class="text-right font-mono text-xs">
                <div class="text-slate-400">DISCOVERY PROGRESS</div>
                <div class="text-cyan-300 font-bold font-orbitron">${discoveredCount} / ${totalNodes} NODES (${completionPct}%)</div>
              </div>
              <div class="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]" style="width: ${completionPct}%;"></div>
              </div>
            </div>
          </div>

          <!-- Main Codex Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-y-auto pr-1">
            
            <!-- Left: Constellation Trees & Star List (Cols 1-5) -->
            <div class="lg:col-span-5 space-y-4">
              
              <!-- Constellations Accordion / Clusters -->
              <div class="space-y-3">
                ${CONSTELLATIONS.map(c => `
                  <div class="bg-black/50 border border-slate-700/60 p-3 rounded-lg">
                    <div class="flex items-center justify-between font-orbitron text-xs font-bold text-white mb-2">
                      <span class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${c.color};"></span>
                        ${c.name}
                      </span>
                      <span class="text-[10px] font-mono text-slate-400">
                        ${c.nodeIds.filter(id => this.discoveredNodeIds.has(id)).length}/${c.nodeIds.length} Discovered
                      </span>
                    </div>

                    <div class="space-y-1">
                      ${c.nodeIds.map(nodeId => {
                        const node = CELESTIAL_NODES.find(n => n.id === nodeId);
                        if (!node) return '';
                        const isDiscovered = this.discoveredNodeIds.has(nodeId);
                        const isSelected = this.selectedNodeId === nodeId;

                        return `
                          <button data-node-id="${nodeId}" class="codex-star-btn w-full text-left p-2 rounded text-xs font-mono flex items-center justify-between transition-all ${isSelected ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200' : (isDiscovered ? 'bg-black/40 hover:bg-slate-800/60 text-slate-300' : 'bg-black/20 text-slate-600 opacity-60')}">
                            <span class="flex items-center gap-2">
                              <span>${isDiscovered ? '★' : '☆'}</span>
                              <strong class="${isDiscovered ? 'text-white' : 'text-slate-500'}">${node.name}</strong>
                            </span>
                            <span class="text-[10px] ${isDiscovered ? 'text-cyan-400' : 'text-slate-600'}">
                              ${isDiscovered ? 'UNLOCKED' : 'ENCRYPTED'}
                            </span>
                          </button>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>

            </div>

            <!-- Right: Detailed Node Lore & Direct Warp Trigger (Cols 6-12) -->
            <div class="lg:col-span-7 flex flex-col justify-between space-y-4 bg-black/60 border border-cyan-500/30 p-5 rounded-lg">
              
              <div class="space-y-4">
                <!-- Header -->
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-orbitron text-2xl font-bold text-white glow-text mb-1">
                      ${activeNode.name}
                    </h3>
                    <div class="font-mono text-xs text-cyan-400">
                      ${activeNode.classification} &bull; ${activeNode.constellation}
                    </div>
                  </div>

                  <span class="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-xs font-mono text-cyan-300">
                    FREQ: ${activeNode.dimensionalFrequency}
                  </span>
                </div>

                <!-- Lore text -->
                <div class="bg-black/50 border border-slate-800 p-4 rounded text-xs md:text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-line">
                  ${activeNode.lore}
                </div>

                <!-- Survivor Audio Log transcript -->
                <div class="bg-cyan-950/20 border border-cyan-500/20 p-3.5 rounded">
                  <div class="text-[11px] font-mono text-cyan-300 font-bold mb-1">
                    AUDIO LOG ARCHIVE // ${activeNode.audioLog.author}
                  </div>
                  <div class="text-xs font-mono text-amber-200/90 italic">
                    ${activeNode.audioLog.transcript}
                  </div>
                </div>

                <!-- Coordinates & Relic Reward -->
                <div class="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div class="p-2.5 bg-black/40 border border-slate-800 rounded">
                    <span class="text-slate-400">3D Vector:</span>
                    <div class="text-white font-bold">X:${activeNode.coordinates.x} Y:${activeNode.coordinates.y} Z:${activeNode.coordinates.z}</div>
                  </div>
                  <div class="p-2.5 bg-black/40 border border-slate-800 rounded">
                    <span class="text-slate-400">Discovered Relic:</span>
                    <div class="text-cyan-300 font-bold truncate">${activeNode.rewards.loreDiscovered}</div>
                  </div>
                </div>
              </div>

              <!-- Warp Navigation Button -->
              <div class="pt-4 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div class="text-xs font-mono text-slate-400">
                  Faction: <strong class="text-white">${activeNode.faction}</strong>
                </div>

                <button id="btn-codex-warp" class="btn-sci-fi px-6 py-2.5 rounded text-xs font-bold flex items-center gap-2 w-full sm:w-auto justify-center">
                  <span>INITIATE DIRECT WARP JUMP</span>
                  <svg class="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>

            </div>

          </div>

          <!-- Bottom Close -->
          <div class="mt-4 pt-3 border-t border-cyan-500/30 flex justify-end">
            <button id="btn-close-codex" class="btn-sci-fi px-6 py-2 rounded text-xs font-bold">
              RETURN TO COCKPIT [ESC]
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const starBtns = this.container.querySelectorAll('.codex-star-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nodeId = e.currentTarget.getAttribute('data-node-id');
        if (nodeId) {
          this.selectedNodeId = nodeId;
          if (this.soundEngine) this.soundEngine.playTargetLock();
          this.render();
        }
      });
    });

    const btnWarp = this.container.querySelector('#btn-codex-warp');
    if (btnWarp) {
      btnWarp.addEventListener('click', () => {
        const targetId = this.selectedNodeId;
        this.close();
        if (this.callbacks.onWarpToNode) {
          this.callbacks.onWarpToNode(targetId);
        }
      });
    }

    const btnClose = this.container.querySelector('#btn-close-codex');
    if (btnClose) {
      btnClose.addEventListener('click', () => this.close());
    }

    this.onKeyDown = (e) => {
      if (e.code === 'Escape' || e.code === 'KeyM') this.close();
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  close() {
    window.removeEventListener('keydown', this.onKeyDown);
    const modal = this.container.querySelector('#codex-modal');
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
