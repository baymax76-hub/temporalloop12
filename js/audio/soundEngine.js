/**
 * Starfield OS - Procedural Web Audio Synthesizer
 * Zero external audio dependencies. Generates rich sci-fi soundscapes, dynamic engine hums,
 * warp boom transients, laser blasters, lock-on telemetry, and holographic UI tones in real-time.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.masterGain = null;

    // Ambient space drone nodes
    this.droneGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.droneLfo = null;

    // Engine hum nodes
    this.engineGain = null;
    this.engineOsc = null;
    this.engineNoise = null;
    this.engineFilter = null;

    // Typewriter click buffer
    this.clickBuffer = null;
  }

  /**
   * Initialize AudioContext on first user interaction
   */
  init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.initAmbientDrone();
      this.initEngineHum();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Continuous deep-space ambient resonance
   */
  initAmbientDrone() {
    if (!this.ctx) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    // Deep sub-bass oscillator
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    // Harmonic warm oscillator
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(110.5, this.ctx.currentTime); // Slight detune

    // LFO for slow ambient breathing filter sweep
    this.droneLfo = this.ctx.createOscillator();
    this.droneLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 0.12 Hz slow wave
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    this.droneLfo.connect(lfoGain);
    lfoGain.connect(this.droneFilter.frequency);

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.droneLfo.start();
  }

  /**
   * Dynamic ship thruster engine sound (responds to speed/throttle)
   */
  initEngineHum() {
    if (!this.ctx) return;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'bandpass';
    this.engineFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'triangle';
    this.engineOsc.frequency.setValueAtTime(65, this.ctx.currentTime);

    // Generate brown/pink noise buffer for engine exhaust roar
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain boost
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    noiseSource.connect(noiseGain);
    noiseGain.connect(this.engineFilter);

    this.engineOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
    noiseSource.start();
  }

  /**
   * Update engine sound based on ship flight speed and warp boost status
   * @param {number} speed - 0.0 to 5.0
   * @param {boolean} isBoosting - true during hyperspace / boost
   */
  updateEngineSpeed(speed, isBoosting = false) {
    if (!this.ctx || !this.engineOsc || !this.engineFilter || !this.engineGain) return;

    const normalized = Math.min(Math.max(speed / 4.0, 0), 2.5);
    const targetFreq = 50 + normalized * 110 + (isBoosting ? 90 : 0);
    const filterFreq = 120 + normalized * 450 + (isBoosting ? 600 : 0);
    const targetGain = 0.06 + normalized * 0.16 + (isBoosting ? 0.22 : 0);

    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);
    this.engineGain.gain.setTargetAtTime(this.isMuted ? 0 : targetGain, now, 0.08);
  }

  /**
   * Sci-Fi Plasma Laser Shot
   */
  playLaser(shipTheme = 'vanguard') {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    let startFreq = 880;
    let endFreq = 90;
    let duration = 0.18;

    if (shipTheme === 'aegis') {
      startFreq = 620;
      endFreq = 55;
      duration = 0.26;
      osc.type = 'sawtooth';
    } else if (shipTheme === 'quantum') {
      startFreq = 1200;
      endFreq = 160;
      duration = 0.16;
      osc.type = 'sine';
    } else {
      osc.type = 'sawtooth';
    }

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Hyperspace Warp Boom / Cinematic Jump Surge
   */
  playWarpJump() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub-bass sweep
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(40, now);
    subOsc.frequency.exponentialRampToValueAtTime(260, now + 0.4);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 1.6);

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.6, now + 0.35);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 1.8);

    // High shimmer / Doppler flash
    const shimmerOsc = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    shimmerOsc.type = 'sawtooth';
    shimmerOsc.frequency.setValueAtTime(400, now);
    shimmerOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.4);
    shimmerOsc.frequency.exponentialRampToValueAtTime(100, now + 1.2);

    shimmerGain.gain.setValueAtTime(0.01, now);
    shimmerGain.gain.linearRampToValueAtTime(0.3, now + 0.35);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(this.masterGain);
    shimmerOsc.start(now);
    shimmerOsc.stop(now + 1.3);
  }

  /**
   * Asteroid Explosion / Mining Blast
   */
  playExplosion() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.5);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Target lock-on acquired chirp
   */
  playTargetLock() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    [0, 0.08, 0.16].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880 + idx * 220, now + delay);

      gain.gain.setValueAtTime(0.18, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.06);
    });
  }

  /**
   * Celestial Hover Synth Tone
   */
  playHoverTone(freq = 520) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Holographic Terminal Open / Docking Chime
   */
  playHoloOpen() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // Cyberpunk major arpeggio

    notes.forEach((freq, idx) => {
      const delay = idx * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.28);
    });
  }

  /**
   * Terminal Scan Lore / Power Refill Energy Beam Sound
   */
  playEnergyTransfer() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.8);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(440, now);
    filter.frequency.linearRampToValueAtTime(1760, now + 0.8);
    filter.Q.setValueAtTime(5.0, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  /**
   * UI Typewriter Click / Keypress
   */
  playTypeClick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400 + Math.random() * 600, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * Tactical EMP Blast wave sound
   */
  playEmpBlast() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.7);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.7);
    filter.Q.setValueAtTime(6.0, now);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.75);
  }
}

export const soundEngine = new SoundEngine();
