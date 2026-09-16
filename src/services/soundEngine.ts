/**
 * Web Audio API Sound Synthesizer Engine for Cleopatra Slot Machine
 * Zero external mp3 dependencies, instant playback, zero network latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private volume: number = 0.8;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private spinTickerInterval: number | null = null;
  private isMusicPlaying: boolean = false;
  private musicTimeout: number | null = null;
  private droneOsc: OscillatorNode | null = null;

  constructor() {
    // Lazy initialization on first user interaction
  }

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.soundEnabled ? 0.8 : 0, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.35 : 0, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? 0.8 : 0, this.ctx.currentTime);
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(enabled ? 0.35 : 0, this.ctx.currentTime);
    }
    if (enabled && !this.isMusicPlaying) {
      this.startAmbientMusic();
    } else if (!enabled && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // --- SOUND EFFECTS ---

  /**
   * UI Click on buttons
   */
  public playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Continuous mechanical spin clicks
   */
  public startSpinningTicks() {
    if (!this.soundEnabled) return;
    this.stopSpinningTicks();
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    this.spinTickerInterval = window.setInterval(() => {
      if (!this.soundEnabled || !this.ctx || !this.sfxGain) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 40, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    }, 75);
  }

  public stopSpinningTicks() {
    if (this.spinTickerInterval !== null) {
      clearInterval(this.spinTickerInterval);
      this.spinTickerInterval = null;
    }
  }

  /**
   * Heavy reel stop clunk (landing on paylines)
   */
  public playReelStop(reelIndex: number) {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const baseFreq = 120 + reelIndex * 20;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.32, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(600 + reelIndex * 70, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.12, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    click.connect(clickGain);
    clickGain.connect(this.sfxGain);

    osc.start();
    click.start();
    osc.stop(ctx.currentTime + 0.1);
    click.stop(ctx.currentTime + 0.03);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      click.disconnect();
      clickGain.disconnect();
    };
  }

  /**
   * Pyramid Scatter landing mystical chime
   */
  public playScatterDrop(scatterCount: number) {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const pitches = [523.25, 659.25, 783.99, 1046.5];
    const pitch = pitches[Math.min(scatterCount - 1, pitches.length - 1)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Suspense drone when 2 scatters hit
   */
  public playAnticipation() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(ctx.currentTime + 1.3);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Standard payline win celebration
   */
  public playWin(isWild: boolean = false, isBigWin: boolean = false) {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const notes = isWild
      ? [440, 554.37, 659.25, 880, 1108.73] // A Major arpeggio
      : [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio

    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isWild ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const dur = isBigWin ? 0.6 : 0.35;
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + dur);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  /**
   * Coin shower count-up sound
   */
  public playCoinSound() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400 + Math.random() * 400, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Free Spins Gong & Egyptian Celebration Fanfare
   */
  public playFreeSpinsFanfare() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const gong = ctx.createOscillator();
    const gongGain = ctx.createGain();
    gong.type = 'sine';
    gong.frequency.setValueAtTime(110, ctx.currentTime);
    gong.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1.5);
    gongGain.gain.setValueAtTime(0.5, ctx.currentTime);
    gongGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

    gong.connect(gongGain);
    gongGain.connect(this.sfxGain);
    gong.start();
    gong.stop(ctx.currentTime + 1.8);

    const fanfareNotes = [293.66, 329.63, 369.99, 440.0, 587.33, 739.99, 880.0];
    fanfareNotes.forEach((freq, i) => {
      const t = ctx.currentTime + 0.3 + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.5);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  /**
   * Powerful golden flash sound when the Golden Chest triggers a jackpot flash
   */
  public playGoldChestShimmer() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;

    // Resonant shimmering bell harmonics (high golden chimes)
    const bellFrequencies = [1174.66, 1760.0, 2349.32, 3520.0, 4698.64];
    bellFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Slight sparkling vibrato
      osc.frequency.linearRampToValueAtTime(freq * 1.05, now + 0.15);
      osc.frequency.linearRampToValueAtTime(freq, now + 0.4);

      const delay = idx * 0.03;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.22 / (idx + 1), now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + delay);
      osc.stop(now + delay + 1.25);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });

    // Deep warm golden resonant surge
    const warmOsc = ctx.createOscillator();
    const warmGain = ctx.createGain();
    warmOsc.type = 'triangle';
    warmOsc.frequency.setValueAtTime(220, now);
    warmOsc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
    warmOsc.frequency.exponentialRampToValueAtTime(220, now + 0.8);

    warmGain.gain.setValueAtTime(0.35, now);
    warmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    warmOsc.connect(warmGain);
    warmGain.connect(this.sfxGain);
    warmOsc.start(now);
    warmOsc.stop(now + 0.95);
    warmOsc.onended = () => {
      warmOsc.disconnect();
      warmGain.disconnect();
    };
  }

  /**
   * Loud thunderous electric lightning zap and arc propagation sound for the Blue Lotus Medallion
   */
  public playLotusLightningStrike() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;

    // 1. Initial High-Voltage Electric Discharge Crack (Noise burst)
    const bufferSize = ctx.sampleRate * 0.45;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(600, now + 0.4);
    noiseFilter.Q.setValueAtTime(3, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.45);

    // 2. High-Frequency Electric Arc Zaps (Chirping lightning bolts)
    for (let z = 0; z < 4; z++) {
      const zapTime = now + 0.05 + z * 0.08;
      const zapOsc = ctx.createOscillator();
      const zapGain = ctx.createGain();
      zapOsc.type = 'sawtooth';
      zapOsc.frequency.setValueAtTime(1400 - z * 180, zapTime);
      zapOsc.frequency.exponentialRampToValueAtTime(150, zapTime + 0.12);

      zapGain.gain.setValueAtTime(0.28, zapTime);
      zapGain.gain.exponentialRampToValueAtTime(0.001, zapTime + 0.13);

      zapOsc.connect(zapGain);
      zapGain.connect(this.sfxGain);

      zapOsc.start(zapTime);
      zapOsc.stop(zapTime + 0.14);
      zapOsc.onended = () => {
        zapOsc.disconnect();
        zapGain.disconnect();
      };
    }

    // 3. Low Sub-Bass Electric Rumble (Thunder shockwave)
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(120, now + 0.04);
    bassOsc.frequency.exponentialRampToValueAtTime(40, now + 0.7);

    bassGain.gain.setValueAtTime(0.5, now + 0.04);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    bassOsc.connect(bassGain);
    bassGain.connect(this.sfxGain);
    bassOsc.start(now + 0.04);
    bassOsc.stop(now + 0.8);
    bassOsc.onended = () => {
      bassOsc.disconnect();
      bassGain.disconnect();
    };
  }

  /**
   * Sound when picking a chest or flipping a card
   */
  public playCardFlip() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.13);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Triumphant chime when gamble guess is correct (Doble o Nada)
   */
  public playCardWin() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D, F#, A, D
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  /**
   * Ominous low tone when gamble is lost
   */
  public playCardLoss() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.48);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  // --- AMBIENT EGYPTIAN TEMPLE SOUNDTRACK ---

  public startAmbientMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    const ctx = this.initCtx();
    if (!ctx || !this.musicGain) return;

    this.isMusicPlaying = true;

    // Egyptian Phrygian Dominant progression notes
    const melody = [
      { note: 293.66, dur: 2.5 },
      { note: 311.13, dur: 1.2 },
      { note: 369.99, dur: 1.8 },
      { note: 293.66, dur: 2.2 },
      { note: 392.0, dur: 1.5 },
      { note: 369.99, dur: 1.2 },
      { note: 311.13, dur: 1.8 },
      { note: 293.66, dur: 3.5 },
    ];

    let step = 0;

    // Low temple drone
    try {
      this.droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(73.42, ctx.currentTime);

      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(140, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.06, ctx.currentTime);
      this.droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.musicGain);
      this.droneOsc.start();
    } catch {
      // Ignored if AudioContext state not ready
    }

    const playNextFluteNote = () => {
      if (!this.isMusicPlaying || !this.musicGain || !this.ctx) return;
      const current = melody[step % melody.length];
      step++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(current.note, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + current.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + current.dur + 0.1);
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };

      this.musicTimeout = window.setTimeout(playNextFluteNote, current.dur * 1000);
    };

    playNextFluteNote();
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimeout !== null) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch {
        // Ignored
      }
      this.droneOsc = null;
    }
  }

  // --- EPIC CELEBRATION SOUND EFFECTS ---

  public playBigWinSound() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major fanfare
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.55);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }

  public playMegaWinSound() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C major cascading
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
      osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
    });
  }

  public playSuperWinSound() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    // Divine lightning strike + chime
    this.playLotusLightningStrike();
    const chord = [349.23, 440, 523.25, 698.46, 880];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + 0.15 + idx * 0.06);
      gain.gain.setValueAtTime(0.2, now + 0.15 + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + idx * 0.06 + 0.6);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + 0.15 + idx * 0.06);
      osc.stop(now + 0.15 + idx * 0.06 + 0.65);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }

  public playUltraWinSound() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    // Epic Imperial Pharaoh Fanfare
    const notes = [293.66, 369.99, 440, 587.33, 739.99, 880, 1174.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now + idx * 0.12);
      gain.gain.setValueAtTime(0.3, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.7);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.75);
      osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
    });
  }

  public playFreeSpinsTriggerSound() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;
    // Mystical Pyramid golden gates opening chime
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.25, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.55);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }

  /**
   * VARIANT 1 - STANDARD PRIZE EXPLOSION
   * Vibrant light burst explosion, energetic rising sweeps, and bright celebratory chimes
   */
  public playVariant1StandardExplosion() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    // 1. Energetic Rising Frequency Sweep (Light burst energy)
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'triangle';
    sweepOsc.frequency.setValueAtTime(220, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
    sweepGain.gain.setValueAtTime(0.25, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(this.sfxGain);
    sweepOsc.start(now);
    sweepOsc.stop(now + 0.42);
    sweepOsc.onended = () => { sweepOsc.disconnect(); sweepGain.disconnect(); };

    // 2. Bright celebratory chimes (Crystalline bells arpeggiation)
    const chimeFrequencies = [1046.5, 1318.51, 1567.98, 2093.0, 2637.02, 3135.96];
    chimeFrequencies.forEach((freq, idx) => {
      const t = now + 0.12 + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.65);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }

  /**
   * VARIANT 2 - COIN RAIN EXPLOSION
   * Massive dynamic explosion boom, rainfall of gold coins scattering, and triumphant celebration audio
   */
  public playVariant2CoinRainExplosion() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    // 1. Massive dynamic explosion impact boom
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'triangle';
    boomOsc.frequency.setValueAtTime(140, now);
    boomOsc.frequency.exponentialRampToValueAtTime(35, now + 0.55);
    boomGain.gain.setValueAtTime(0.65, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    boomOsc.connect(boomGain);
    boomGain.connect(this.sfxGain);
    boomOsc.start(now);
    boomOsc.stop(now + 0.65);
    boomOsc.onended = () => { boomOsc.disconnect(); boomGain.disconnect(); };

    // 2. Heavy cascading coin scatter clatters (series of crisp rapid metallic pings)
    for (let i = 0; i < 18; i++) {
      const coinTime = now + 0.05 + i * 0.045 + Math.random() * 0.02;
      const coinOsc = ctx.createOscillator();
      const coinGain = ctx.createGain();
      coinOsc.type = 'sine';
      coinOsc.frequency.setValueAtTime(1600 + Math.random() * 800, coinTime);
      coinGain.gain.setValueAtTime(0.18, coinTime);
      coinGain.gain.exponentialRampToValueAtTime(0.001, coinTime + 0.09);
      coinOsc.connect(coinGain);
      coinGain.connect(this.sfxGain);
      coinOsc.start(coinTime);
      coinOsc.stop(coinTime + 0.1);
      coinOsc.onended = () => { coinOsc.disconnect(); coinGain.disconnect(); };
    }

    // 3. Triumphant celebration brass fanfare
    const fanfareNotes = [392.0, 523.25, 659.25, 783.99, 1046.5];
    fanfareNotes.forEach((freq, idx) => {
      const ft = now + 0.25 + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ft);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ft);
      gain.gain.setValueAtTime(0.24, ft);
      gain.gain.exponentialRampToValueAtTime(0.001, ft + 0.65);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(ft);
      osc.stop(ft + 0.7);
      osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
    });
  }

  /**
   * VARIANT 3 - MEGA EPIC JACKPOT (GRAND PRIZE)
   * Loud thundering, epic cinematic jackpot sound effect with a massive roar of cascading coins,
   * powerful explosions, lightning bolt cracks, and booming victorious fanfare
   */
  public playVariant3MegaEpicJackpot() {
    if (!this.soundEnabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    // 1. Thundering Sub-Bass Shockwave Explosion
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);
    subGain.gain.setValueAtTime(0.85, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 1.35);
    subOsc.onended = () => { subOsc.disconnect(); subGain.disconnect(); };

    // 2. Powerful lightning bolt electric crackle
    this.playLotusLightningStrike();

    // 3. Dense Roar of Thousands of Cascading Coins
    for (let c = 0; c < 30; c++) {
      const ct = now + 0.08 + c * 0.03 + Math.random() * 0.015;
      const coinOsc = ctx.createOscillator();
      const coinGain = ctx.createGain();
      coinOsc.type = 'triangle';
      coinOsc.frequency.setValueAtTime(1200 + Math.random() * 1200, ct);
      coinGain.gain.setValueAtTime(0.16, ct);
      coinGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.08);
      coinOsc.connect(coinGain);
      coinGain.connect(this.sfxGain);
      coinOsc.start(ct);
      coinOsc.stop(ct + 0.09);
      coinOsc.onended = () => { coinOsc.disconnect(); coinGain.disconnect(); };
    }

    // 4. Booming Victorious Orchestral Grand Fanfare
    const majorChords = [
      { freq: 261.63, time: 0.15, dur: 0.8 }, // C4
      { freq: 329.63, time: 0.15, dur: 0.8 }, // E4
      { freq: 392.00, time: 0.15, dur: 0.8 }, // G4
      { freq: 523.25, time: 0.35, dur: 0.9 }, // C5
      { freq: 659.25, time: 0.55, dur: 1.0 }, // E5
      { freq: 783.99, time: 0.75, dur: 1.2 }, // G5
      { freq: 1046.50, time: 0.95, dur: 1.6 }, // High C6 Triumph
      { freq: 1318.51, time: 1.15, dur: 1.8 }, // E6 Shimmer
    ];

    majorChords.forEach((chord) => {
      const startTime = now + chord.time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(chord.freq, startTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, startTime);

      gain.gain.setValueAtTime(0.32, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + chord.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + chord.dur + 0.05);
      osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
    });
  }
}

export const sound = new SoundEngine();
