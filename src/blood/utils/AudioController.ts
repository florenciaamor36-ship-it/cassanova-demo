class AudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMusic();
    } else {
      this.playMusic();
    }
  }

  public getMute() {
    return this.isMuted;
  }

  // Helper to create a master volume gain node
  private createGain(duration: number, startVal: number = 0.5): { ctx: AudioContext; gain: GainNode } | null {
    if (this.isMuted) return null;
    const ctx = this.initContext();
    if (!ctx) return null;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(startVal, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    gainNode.connect(ctx.destination);
    return { ctx, gain: gainNode };
  }

  // 1. Click sound for buttons - Stone crack & leather click
  public playClick() {
    const sound = this.createGain(0.15, 0.4);
    if (!sound) return;
    const { ctx, gain } = sound;

    // High pass click
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    osc1.connect(gain);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.15);
  }

  // 2. Spinning sound - rolling rumbling mechanical sounds
  private spinTimer: any = null;
  public startSpinSound() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopSpinSound();

    // Create a rhythmic mechanical rumble
    const interval = 120; // ms
    let tick = 0;

    const playRumbleTick = () => {
      const s = this.createGain(0.12, 0.25);
      if (!s) return;
      const { gain } = s;

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      // mechanical click sound
      osc.frequency.setValueAtTime(70 + (tick % 3) * 15, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.1);

      // Lowpass filter to make it rumble
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(300, ctx.currentTime);

      osc.connect(lp);
      lp.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      tick++;
    };

    playRumbleTick();
    this.spinTimer = setInterval(playRumbleTick, interval);
  }

  public stopSpinSound() {
    if (this.spinTimer) {
      clearInterval(this.spinTimer);
      this.spinTimer = null;
    }
  }

  // 3. Staggered Stops - thuds with increasing pitch to build tension
  public playReelStop(reelIndex: number) {
    const sound = this.createGain(0.25, 0.6);
    if (!sound) return;
    const { ctx, gain } = sound;

    const baseFreq = 80 + reelIndex * 15; // Increasing pitches for staggered feel!

    // Sine wave thud
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.2);

    // Mechanical click on top
    const click = ctx.createOscillator();
    click.type = 'square';
    click.frequency.setValueAtTime(400, ctx.currentTime);
    click.frequency.setValueAtTime(10, ctx.currentTime + 0.02);
    
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.3, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    click.connect(clickGain);
    clickGain.connect(gain);

    osc.start();
    click.start();
    osc.stop(ctx.currentTime + 0.25);
    click.stop(ctx.currentTime + 0.25);
  }

  // 4. Normal Win - shimmering bells and gothic gothic silver chord
  public playWinNormal() {
    const sound = this.createGain(1.2, 0.5);
    if (!sound) return;
    const { ctx, gain } = sound;

    // A beautiful A minor add9 chord in gothic silver style
    const freqs = [220, 261.63, 329.63, 392.00, 493.88]; // A3, C4, E4, G4, B4
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Delay each note slightly to pluck the chord
      const pluckDelay = idx * 0.05;
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + pluckDelay + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(noteGain);
      noteGain.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    });

    // Shivering crystal bells
    for (let i = 0; i < 6; i++) {
      const bell = ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(1500 + Math.random() * 800, ctx.currentTime);

      const bellGain = ctx.createGain();
      const delay = 0.1 * i;
      bellGain.gain.setValueAtTime(0, ctx.currentTime);
      bellGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.4);

      bell.connect(bellGain);
      bellGain.connect(gain);
      bell.start();
      bell.stop(ctx.currentTime + 1.2);
    }
  }

  // 5. WILD - Fangs Hiss & Bat Flutters
  public playWild() {
    const sound = this.createGain(0.8, 0.4);
    if (!sound) return;
    const { ctx, gain } = sound;

    // Fangs hissing sound (white noise filtered)
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    // Highpass filter for the "hiss"
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(4000, ctx.currentTime);
    hp.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.4);

    noiseNode.connect(hp);
    hp.connect(gain);
    noiseNode.start();
    noiseNode.stop(ctx.currentTime + 0.5);

    // Sudden dramatic bell-chime
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
    osc.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  }

  // 6. SCATTER - resonant bell gong
  public playScatter(count: number = 3) {
    const duration = 1.5;
    const sound = this.createGain(duration, 0.6);
    if (!sound) return;
    const { ctx, gain } = sound;

    // Blood gong/bell
    const baseFreq = 180 + count * 60; // Pitch increases with more scatters!
    
    // Multiple overtones for realistic metallic bell
    const overtones = [1.0, 2.0, 2.4, 3.0, 3.76, 4.2];
    overtones.forEach((ratio) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * ratio, ctx.currentTime);

      const oGain = ctx.createGain();
      oGain.gain.setValueAtTime(0.2 / ratio, ctx.currentTime);
      oGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(oGain);
      oGain.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    });
  }

  // 7. BONUS - Rising ancient arpeggios
  public playBonus() {
    const sound = this.createGain(1.8, 0.5);
    if (!sound) return;
    const { ctx, gain } = sound;

    const notes = [130.81, 155.56, 196.00, 261.63, 311.13, 392.00, 523.25, 622.25]; // C minor arpeggio
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(200, ctx.currentTime);
      lp.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + index * 0.15 + 0.2);

      const delay = index * 0.15;
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + delay);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.6);

      osc.connect(lp);
      lp.connect(noteGain);
      noteGain.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    });
  }

  // 8. BIG WIN - Pipes of Dracula!
  public playBigWin() {
    const duration = 3.5;
    const sound = this.createGain(duration, 0.7);
    if (!sound) return;
    const { ctx, gain } = sound;

    // Massive pipe organ chords
    const chord1 = [110, 220, 277.18, 329.63, 440]; // A major massive chord
    const chord2 = [130.81, 261.63, 329.63, 392, 523.25]; // C major massive chord

    // Play escalating chords
    const playChord = (freqs: number[], startTime: number, length: number) => {
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; // rich organ timbre
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        // Add a second detuned oscillator for chorus effect
        const detune = ctx.createOscillator();
        detune.type = 'sawtooth';
        detune.frequency.setValueAtTime(freq + 1.5, ctx.currentTime + startTime);

        const organFilter = ctx.createBiquadFilter();
        organFilter.type = 'bandpass';
        organFilter.frequency.setValueAtTime(800, ctx.currentTime);

        const chGain = ctx.createGain();
        chGain.gain.setValueAtTime(0, ctx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + startTime + 0.1);
        chGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + length);

        osc.connect(organFilter);
        detune.connect(organFilter);
        organFilter.connect(chGain);
        chGain.connect(gain);

        osc.start(ctx.currentTime + startTime);
        detune.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + length);
        detune.stop(ctx.currentTime + startTime + length);
      });
    };

    playChord(chord1, 0, 1.8);
    playChord(chord2, 1.5, 2.0);

    // Deep thunder rumble
    const rumble = ctx.createOscillator();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(45, ctx.currentTime);
    rumble.frequency.linearRampToValueAtTime(30, ctx.currentTime + duration);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.3, ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    rumble.connect(rumbleGain);
    rumbleGain.connect(gain);
    rumble.start();
    rumble.stop(ctx.currentTime + duration);
  }

  // 9. JACKPOT - Royal Gothic Chimes, cathedral bells & roaring thunder
  public playJackpot() {
    const duration = 5.0;
    const sound = this.createGain(duration, 0.8);
    if (!sound) return;
    const { ctx, gain } = sound;

    // Major celebratory fan-fare on pipe organ
    const fanFareNotes = [
      { f: [196, 246.94, 293.66, 392], t: 0, d: 1.0 }, // G Major
      { f: [220, 277.18, 329.63, 440], t: 0.8, d: 1.0 }, // A Major
      { f: [261.63, 329.63, 392, 523.25], t: 1.6, d: 1.0 }, // C Major
      { f: [293.66, 369.99, 440, 587.33], t: 2.4, d: 2.5 } // D Major (sustained epic climax!)
    ];

    fanFareNotes.forEach((note) => {
      note.f.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + note.t);

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 1.005, ctx.currentTime + note.t);

        const chGain = ctx.createGain();
        chGain.gain.setValueAtTime(0, ctx.currentTime);
        chGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + note.t + 0.05);
        chGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.t + note.d);

        osc.connect(chGain);
        osc2.connect(chGain);
        chGain.connect(gain);

        osc.start(ctx.currentTime + note.t);
        osc2.start(ctx.currentTime + note.t);
        osc.stop(ctx.currentTime + note.t + note.d);
        osc2.stop(ctx.currentTime + note.t + note.d);
      });
    });

    // Deep cathedral bell tolls (C3 = 130.81Hz)
    const tolls = [0, 1.2, 2.4, 3.6];
    tolls.forEach((tollTime) => {
      const bell = ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(130.81, ctx.currentTime + tollTime);

      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0, ctx.currentTime);
      bellGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + tollTime + 0.02);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + tollTime + 1.5);

      bell.connect(bellGain);
      bellGain.connect(gain);
      bell.start(ctx.currentTime + tollTime);
      bell.stop(ctx.currentTime + tollTime + 1.5);
    });
  }

  // 10. FREE SPINS - Eerie high tempo atmospheric choir
  public playFreeSpins() {
    const duration = 2.0;
    const sound = this.createGain(duration, 0.6);
    if (!sound) return;
    const { ctx, gain } = sound;

    // Ghostly spectral sound (sine wave sweep)
    const sweep = ctx.createOscillator();
    sweep.type = 'sine';
    sweep.frequency.setValueAtTime(100, ctx.currentTime);
    sweep.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + duration);

    // Filter sweep
    const lp = ctx.createBiquadFilter();
    lp.type = 'bandpass';
    lp.frequency.setValueAtTime(300, ctx.currentTime);
    lp.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + duration);

    sweep.connect(lp);
    lp.connect(gain);
    sweep.start();
    sweep.stop(ctx.currentTime + duration);

    // Rapid silver chimes
    for (let i = 0; i < 8; i++) {
      const chime = ctx.createOscillator();
      chime.type = 'triangle';
      chime.frequency.setValueAtTime(600 + i * 150, ctx.currentTime + i * 0.15);

      const cGain = ctx.createGain();
      cGain.gain.setValueAtTime(0, ctx.currentTime);
      cGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.15 + 0.02);
      cGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.15 + 0.4);

      chime.connect(cGain);
      cGain.connect(gain);
      chime.start(ctx.currentTime + i * 0.15);
      chime.stop(ctx.currentTime + i * 0.15 + 0.4);
    }
  }

  // 11. Environmental Ambient Music - a low-frequency gothic synth pad with slow minor chords
  public playMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    this.ambientOscs = [];

    // Blood covenant gothic ambient pad chords (A minor, F major, D minor)
    const chordProgression = [
      [110.00, 164.81, 220.00, 261.63], // Am (A2, E3, A3, C4)
      [87.31, 130.81, 174.61, 220.00],  // Fmaj (F2, C3, F3, A3)
      [73.42, 110.00, 146.83, 174.61]   // Dmin (D2, A2, D3, F3)
    ];

    let currentChordIndex = 0;

    const playAmbientChord = () => {
      if (!this.isMusicPlaying || this.isMuted) return;
      const notes = chordProgression[currentChordIndex];

      const chordDuration = 8.0; // Slow, evolving pads!
      
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine'; // Super soft
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        // Soft fade-in (2.5s)
        g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.5);
        // Stay sustained
        g.gain.setValueAtTime(0.05, ctx.currentTime + chordDuration - 2.5);
        // Soft fade-out (2.5s)
        g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + chordDuration);

        // Gentle low-pass filter
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(400, ctx.currentTime);

        osc.connect(lp);
        lp.connect(g);
        g.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + chordDuration);

        const oscRef = { osc, gain: g };
        this.ambientOscs.push(oscRef);

        // Remove from list after done
        setTimeout(() => {
          this.ambientOscs = this.ambientOscs.filter(o => o !== oscRef);
        }, chordDuration * 1000);
      });

      // Move to next chord
      currentChordIndex = (currentChordIndex + 1) % chordProgression.length;

      // Schedule next chord slightly before this ends (overlap for seamless transition)
      if (this.isMusicPlaying) {
        this.musicTimer = setTimeout(playAmbientChord, (chordDuration - 2.0) * 1000);
      }
    };

    playAmbientChord();
  }

  // Wheel of Fortune peg tick
  public playWheelTick(pitchMultiplier: number = 1.0) {
    const sound = this.createGain(0.08, 0.35);
    if (!sound) return;
    const { ctx, gain } = sound;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650 * pitchMultiplier, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.07);

    osc.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // Card flip whoosh & snap
  public playCardFlip() {
    const sound = this.createGain(0.18, 0.4);
    if (!sound) return;
    const { ctx, gain } = sound;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.18);

    osc.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }

  // Gamble Win fanfare
  public playGambleWin() {
    const sound = this.createGain(1.2, 0.5);
    if (!sound) return;
    const { ctx, gain } = sound;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0, ctx.currentTime);
      noteGain.gain.setValueAtTime(0.4, ctx.currentTime + idx * 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);

      osc.connect(noteGain);
      noteGain.connect(gain);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.6);
    });
  }

  // Gamble Lose dark thud
  public playGambleLose() {
    const sound = this.createGain(0.8, 0.4);
    if (!sound) return;
    const { ctx, gain } = sound;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.6);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(250, ctx.currentTime);

    osc.connect(lp);
    lp.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  }

  // Heavy reel bounce / impact thud
  public playImpactThud() {
    const sound = this.createGain(0.25, 0.45);
    if (!sound) return;
    const { ctx, gain } = sound;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.2);

    osc.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  private musicTimer: any = null;

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    this.ambientOscs.forEach(({ osc, gain }) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.ambientOscs = [];
  }
}

export const AudioEngine = new AudioController();
