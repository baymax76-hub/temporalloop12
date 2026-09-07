/**
 * Starfield OS - Opening Narrative Cinematic Component
 * Atmospheric multiversal lore introduction with typewriter text, sound initialization,
 * and seamless transition to ship selection.
 */

export class IntroCinematic {
  /**
   * @param {HTMLElement} container
   * @param {Object} soundEngine
   * @param {Function} onComplete
   */
  constructor(container, soundEngine, onComplete) {
    this.container = container;
    this.soundEngine = soundEngine;
    this.onComplete = onComplete;
    this.isSkipped = false;
    this.isFinished = false;

    this.narrativeLines = [
      "DEEP SPACE TELEMETRY // SECTOR UNKNOWN",
      "THE MULTIVERSAL WAR HAS COLLAPSED STABLE REALITY.",
      "Dimensions have shattered into drifting cosmic fragments, leaving broken worlds and lost civilizations suspended in the deep void.",
      "You are drifting in open space, fleeing broken dimensions in search of survivors, forgotten lore, and the hidden constellation connections that can restore universal balance.",
      "Prepare your vessel. Every star holds a story. Every constellation is a connection.",
    ];

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div id="intro-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6 select-none pointer-events-auto cursor-default">
        <!-- Ambient animated backdrop glow -->
        <div class="absolute inset-0 bg-radial from-cyan-950/30 via-slate-950/80 to-black pointer-events-none"></div>
        <div class="scanlines absolute inset-0"></div>

        <div class="relative max-w-2xl w-full glass-panel sci-fi-corners p-8 md:p-10 border border-cyan-500/30 rounded-lg shadow-[0_0_50px_rgba(0,240,255,0.15)] text-center pointer-events-auto">
          
          <!-- System Status Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-mono text-xs mb-6 tracking-widest animate-pulse">
            <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
            MULTIVERSAL BROADCAST DETECTED
          </div>

          <!-- Title -->
          <h1 class="font-orbitron text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 tracking-wider mb-6 glow-text">
            STARFIELD OS
          </h1>
          <p class="font-rajdhani text-sm md:text-base text-cyan-200/60 tracking-widest uppercase mb-8">
            Universal Constellation Exploration System
          </p>

          <!-- Typewriter Output Box -->
          <div class="min-h-[160px] bg-black/60 border border-cyan-500/20 rounded p-5 text-left font-mono text-cyan-300/90 text-sm md:text-base leading-relaxed mb-8 flex flex-col justify-center">
            <p id="typewriter-text" class="whitespace-pre-line"></p>
            <span id="cursor" class="inline-block w-2.5 h-4 bg-cyan-400 animate-pulse ml-1 align-middle"></span>
          </div>

          <!-- Controls / Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button id="btn-begin-journey" class="btn-sci-fi w-full sm:w-auto px-8 py-3.5 rounded text-sm font-semibold tracking-widest text-cyan-300 border-cyan-500/50 hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-3 cursor-pointer pointer-events-auto">
              <svg class="w-5 h-5 text-cyan-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>INITIALIZE FLIGHT DECK</span>
            </button>
            <button id="btn-skip-intro" class="w-full sm:w-auto px-6 py-3.5 rounded text-xs font-mono tracking-widest text-cyan-400/60 hover:text-cyan-200 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/20 transition-all cursor-pointer pointer-events-auto">
              SKIP PROLOGUE [ESC / ENTER]
            </button>
          </div>

          <!-- Sound note -->
          <div class="mt-6 flex items-center justify-center gap-2 text-cyan-400/50 text-xs font-mono">
            <svg class="w-4 h-4 text-cyan-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Audio Engine Active &bull; Procedural Deep-Space Synthesizer
          </div>

        </div>
      </div>
    `;

    this.typewriterEl = this.container.querySelector('#typewriter-text');
    this.cursorEl = this.container.querySelector('#cursor');
    this.btnBegin = this.container.querySelector('#btn-begin-journey');
    this.btnSkip = this.container.querySelector('#btn-skip-intro');

    this.btnBegin.addEventListener('click', (e) => {
      e.stopPropagation();
      this.finish();
    });

    this.btnSkip.addEventListener('click', (e) => {
      e.stopPropagation();
      this.finish();
    });

    // Global Key Listener for instant skip
    this.onKeyDown = (e) => {
      if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') {
        this.finish();
      }
    };
    window.addEventListener('keydown', this.onKeyDown);

    this.startTypewriter();
  }

  async startTypewriter() {
    let fullText = this.narrativeLines.join('\n\n');
    let currentText = '';

    for (let i = 0; i < fullText.length; i++) {
      if (this.isSkipped || this.isFinished) break;

      currentText += fullText[i];
      if (this.typewriterEl) {
        this.typewriterEl.textContent = currentText;
      }

      // Audio click on character
      if (i % 3 === 0 && this.soundEngine) {
        this.soundEngine.playTypeClick();
      }

      const delay = fullText[i] === '\n' ? 140 : (fullText[i] === '.' ? 90 : 16);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.isSkipped = true;

    window.removeEventListener('keydown', this.onKeyDown);

    if (this.soundEngine) {
      try {
        this.soundEngine.init();
        this.soundEngine.playHoloOpen();
      } catch (err) {
        console.warn('Audio start note:', err);
      }
    }

    const modal = this.container.querySelector('#intro-modal');
    if (modal) {
      modal.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      modal.style.opacity = '0';
      modal.style.transform = 'scale(1.05)';
      setTimeout(() => {
        this.container.innerHTML = '';
        if (this.onComplete) this.onComplete();
      }, 250);
    } else {
      this.container.innerHTML = '';
      if (this.onComplete) this.onComplete();
    }
  }
}
