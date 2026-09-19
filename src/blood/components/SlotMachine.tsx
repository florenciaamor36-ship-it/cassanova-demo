import React, { useState, useEffect, useRef } from 'react';
import { SYMBOLS, BETS_LIST, INITIAL_CREDITS, PAYLINES } from '../data/gameData';
import { GameEngine, SpinResult, WinningLine, TestPreset } from '../utils/GameEngine';
import { AudioEngine } from '../utils/AudioController';
import { SlotReels } from './SlotReels';
import { SlotControls } from './SlotControls';
import { PaytableModal } from './PaytableModal';
import { WinCelebrationModal } from './WinCelebrationModal';
import { Volume2, VolumeX, ShieldCheck, Flame, Moon, Compass, Gift, Trophy, Disc } from 'lucide-react';
import castleBgImg from '../assets/images/gothic_castle_bg_1789671734060.webp';
import lordPortraitImg from '../assets/images/vampire_lord_portrait_1789671748955.webp';
import countessPortraitImg from '../assets/images/vampire_countess_portrait_1789671766123.webp';
import halloweenFramePc from '../assets/slots/halloween/frame-pc.png';
import halloweenFrameMobile from '../assets/slots/halloween/frame-mobile.png';

export const SlotMachine: React.FC = () => {
  // --- Game Core States ---
  const [credits, setCredits] = useState<number>(INITIAL_CREDITS);
  const [betIdx, setBetIdx] = useState<number>(2); // Default to $50
  const [grid, setGrid] = useState<string[][]>([
    ['vampire_lord', 'gothic_castle', 'gothic_a'],
    ['vampire_countess', 'wild_fangs', 'gothic_k'],
    ['blood_chalice', 'scatter_moon', 'gothic_q'],
    ['gothic_bat', 'vampire_lord', 'gothic_j'],
    ['bonus_coffin', 'blood_chalice', 'vampire_countess']
  ]);

  const currentBet = BETS_LIST[betIdx];

  // --- Spin & Animation States ---
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  
  // --- Audio Mute State ---
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // --- Win Outcomes & Highlights States ---
  const [lastWin, setLastWin] = useState<number>(0);
  const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
  const [activeWinningLineIdx, setActiveWinningLineIdx] = useState<number>(-1); // -1: all lines displayed
  const [winAnnouncement, setWinAnnouncement] = useState<string>('');

  // --- Modals Toggle ---
  const [isPaytableOpen, setIsPaytableOpen] = useState<boolean>(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const celebrationOpenRef = useRef(false);
  const [celebrationType, setCelebrationType] = useState<'lights' | 'rain' | 'grand'>('lights');
  const [lastCelebrationType, setLastCelebrationType] = useState<'lights' | 'rain' | 'grand' | ''>('');
  
  // --- Free Spins State ---
  const [isFreeSpinsActive, setIsFreeSpinsActive] = useState<boolean>(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [freeSpinsWinAccum, setFreeSpinsWinAccum] = useState<number>(0);
  const freeSpinsActiveRef = useRef(false);
  const freeSpinsLeftRef = useRef(0);
  const freeSpinsWinAccumRef = useRef(0);

  // --- Progressive Grand Jackpot Pool ---
  const [jackpotPool, setJackpotPool] = useState<number>(75420);

  // --- Test & Preset Outcome State ---
  const [selectedPreset, setSelectedPreset] = useState<TestPreset>('none');

  // --- Cursor Ambient Fog Canvas Refs ---
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current = timersRef.current.filter(id => id !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  };

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    celebrationOpenRef.current = isCelebrationOpen;
  }, [isCelebrationOpen]);

  // Update mouse position for candle halo tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Ambient Fog Canvas Drawing (Runs at smooth FPS for immersive gothic atmosphere!)
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lowPowerDevice = window.matchMedia('(pointer: coarse)').matches
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || ('connection' in navigator && (navigator as any).connection?.saveData === true);
    if (lowPowerDevice || isSpinning) return;

    let animId: number;
    let fogs: Array<{
      x: number;
      y: number;
      vx: number;
      size: number;
      alpha: number;
      growth: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize some cloud/mist coordinates
    for (let i = 0; i < 8; i++) {
      fogs.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.7 + Math.random() * canvas.height * 0.3,
        vx: Math.random() * 0.4 + 0.1,
        size: Math.random() * 120 + 80,
        alpha: Math.random() * 0.2 + 0.05,
        growth: 0.02
      });
    }

    const drawFog = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw subtle drifting white mist/fog at bottom
      fogs.forEach((fog) => {
        fog.x += fog.vx;
        fog.size += fog.growth;

        if (fog.size > 220 || fog.size < 60) {
          fog.growth = -fog.growth;
        }

        // wrap around edge
        if (fog.x > canvas.width + 150) {
          fog.x = -150;
        }

        ctx.save();
        const radGrad = ctx.createRadialGradient(fog.x, fog.y, 10, fog.x, fog.y, fog.size);
        radGrad.addColorStop(0, `rgba(180, 185, 200, ${fog.alpha})`);
        radGrad.addColorStop(0.5, `rgba(100, 105, 115, ${fog.alpha * 0.4})`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(fog.x, fog.y, fog.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 2. Draw gothic candlelit halo shadowing following the cursor
      if (mousePosRef.current.x !== -1000) {
        ctx.save();
        // Draw dark vignette mask across full viewport
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'; // Base darkness overlay
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Punch out a warm flickering candlelit circle around the cursor
        const flicker = Math.sin(Date.now() * 0.005) * 6; // slow candle flame pulsing
        const r1 = 30;
        const r2 = 280 + flicker;

        ctx.globalCompositeOperation = 'destination-out';
        const spotlightGrad = ctx.createRadialGradient(mousePosRef.current.x, mousePosRef.current.y, r1, mousePosRef.current.x, mousePosRef.current.y, r2);
        spotlightGrad.addColorStop(0, 'rgba(0, 0, 0, 1)'); // completely see-through
        spotlightGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.7)');
        spotlightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // fully masked

        ctx.fillStyle = spotlightGrad;
        ctx.beginPath();
        ctx.arc(mousePosRef.current.x, mousePosRef.current.y, r2, 0, Math.PI * 2);
        ctx.fill();

        // Overlay a faint warm amber tint inside the spotlight
        ctx.globalCompositeOperation = 'source-over';
        const amberGrad = ctx.createRadialGradient(mousePosRef.current.x, mousePosRef.current.y, r1, mousePosRef.current.x, mousePosRef.current.y, r2);
        amberGrad.addColorStop(0, 'rgba(217, 119, 6, 0.08)'); // subtle warm yellow
        amberGrad.addColorStop(0.5, 'rgba(127, 29, 29, 0.03)'); // subtle red fade
        amberGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = amberGrad;
        ctx.beginPath();
        ctx.arc(mousePosRef.current.x, mousePosRef.current.y, r2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Fallback vignette
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      animId = requestAnimationFrame(drawFog);
    };

    drawFog();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isSpinning]);

  // Lazy-unlock the audio context on first click
  useEffect(() => {
    const unlock = () => {
      AudioEngine.setMute(isMuted);
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, [isMuted]);

  // Audio mute toggling
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    AudioEngine.setMute(nextMute);
  };

  // Adjusting bet amounts
  const increaseBet = () => {
    if (isSpinning || isFreeSpinsActive) return;
    setBetIdx((prev) => (prev + 1) % BETS_LIST.length);
  };

  const decreaseBet = () => {
    if (isSpinning || isFreeSpinsActive) return;
    setBetIdx((prev) => (prev - 1 + BETS_LIST.length) % BETS_LIST.length);
  };

  const selectMaxBet = () => {
    if (isSpinning || isFreeSpinsActive) return;
    setBetIdx(BETS_LIST.length - 1); // Selects final index (e.g. $1000)
    // Auto trigger spin on max bet to feel arcade-like!
    schedule(() => {
      triggerSpin();
    }, 100);
  };

  // Virtual cash-out: simulates collecting credits and resetting virtual bank
  const handleCashOut = () => {
    if (isSpinning) return;
    setWinAnnouncement(`¡Has cobrado $${credits.toLocaleString()}! Banco restablecido a $10,000.`);
    setCredits(INITIAL_CREDITS);
    setLastWin(0);
    setWinningLines([]);
  };

  // --- Core Spin Routine ---
  const triggerSpin = () => {
    if (isSpinning) return;

    // Check credits
    if (!freeSpinsActiveRef.current && credits < currentBet) {
      setWinAnnouncement('¡Créditos insuficientes! Usa el botón COBRAR para recargar saldo.');
      setIsAutoPlaying(false);
      return;
    }

    // Reset previous outcome highlights
    setIsSpinning(true);
    setWinningLines([]);
    setActiveWinningLineIdx(-1);
    setWinAnnouncement('');

    // Deduct credits if normal spin
    if (!freeSpinsActiveRef.current) {
      setCredits(prev => prev - currentBet);
      setLastWin(0);
    }

    // Play rolling spin audio
    AudioEngine.startSpinSound();

    // Trigger individual column spin rolls
    setSpinningReels([true, true, true, true, true]);

    // Draw grid results using selected presets or standard random engine
    const finalGrid = GameEngine.generateGrid(selectedPreset);
    setSelectedPreset('none'); // Reset preset to standard for subsequent spins

    const evaluated = GameEngine.evaluateSpin(finalGrid, currentBet);

    // Put the final result underneath the canvas immediately. Each reel can
    // reveal its own real symbols as soon as it stops instead of falling back
    // to the previous grid and changing all five reels at the end.
    setGrid(finalGrid);

    // Timeline staggered stops
    // Give the reels a longer, more suspenseful cadence without blocking the UI.
    const baseStopDelay = isTurbo ? 320 : 520;
    
    // Staggered stops: each reel stops incrementally
    for (let reelIdx = 0; reelIdx < 5; reelIdx++) {
      schedule(() => {
        setSpinningReels(prev => {
          const updated = [...prev];
          updated[reelIdx] = false;
          return updated;
        });
        
        // Play solid thud for stopping
        AudioEngine.playReelStop(reelIdx);

        // Once the final reel has locked in
        if (reelIdx === 4) {
          AudioEngine.stopSpinSound();
          concludeSpin(finalGrid, evaluated);
        }
      }, (reelIdx + 1) * baseStopDelay);
    }
  };

  // Handle results after reels lock
  const concludeSpin = (finalGrid: string[][], evaluated: SpinResult) => {
    setGrid(finalGrid);
    setIsSpinning(false);

    const hasWinnings = evaluated.totalWin > 0;
    const isFreeTrigger = evaluated.isFreeSpinsTriggered;

    // Save outputs
    setWinningLines(evaluated.winningLines);
    setLastWin(evaluated.totalWin);

    if (hasWinnings) {
      if (freeSpinsActiveRef.current) {
        // Free-spin winnings stay in the round accumulator and are credited once
        // when the round closes. Do not also add them to the bank per spin.
        freeSpinsWinAccumRef.current += evaluated.totalWin;
        setFreeSpinsWinAccum(freeSpinsWinAccumRef.current);
      } else {
        setCredits(prev => prev + evaluated.totalWin);
      }
    }

    // Check if celebration is appropriate (Wins greater than or equal to 10x bet size)
    const multiplier = evaluated.totalWin / currentBet;
    const triggerCelebration = hasWinnings && multiplier >= 10;

    // Sequence handlers
    const executeSequence = async () => {
      // 1. Show the winning lines first, then open the celebration.
      // This gives the player time to read the paylines and highlighted symbols.
      if (triggerCelebration) {
        setWinAnnouncement(`LÍNEAS GANADORAS: $${evaluated.totalWin}`);
        await new Promise<void>((resolve) => schedule(resolve, 1100));

        const types: Array<'lights' | 'rain' | 'grand'> = ['lights', 'rain', 'grand'];
        const filtered = types.filter(t => t !== lastCelebrationType);
        const selected = filtered[Math.floor(Math.random() * filtered.length)];
        setCelebrationType(selected);
        setLastCelebrationType(selected);
        setIsCelebrationOpen(true);
        setWinAnnouncement(`¡GANANCIA ESPECTACULAR DE $${evaluated.totalWin}!`);

        // Wait for the real modal close before continuing free spins/autoplay.
        await new Promise<void>((resolve) => {
          const checkModalClosed = setInterval(() => {
            if (!celebrationOpenRef.current) {
              clearInterval(checkModalClosed);
              resolve();
            }
          }, 100);
        });
      } else if (hasWinnings) {
        // Normal wins also show the lines before the payout announcement.
        await new Promise<void>((resolve) => schedule(resolve, 800));
        AudioEngine.playWinNormal();
        setWinAnnouncement(`¡Has ganado $${evaluated.totalWin}!`);
      }

      // 2. Surface the coffin event explicitly. The old minigame was removed;
      // keep the detected event visible instead of silently dropping it.
      if (evaluated.isBonusTriggered) {
        setWinAnnouncement(`⚰️ BONUS DE ATAÚDES ACTIVADO: ${evaluated.bonusCount} ATAÚDES`);
        await new Promise<void>((resolve) => schedule(resolve, 900));
      }

      // 3. Handle Free Spins triggering
      if (isFreeTrigger) {
        AudioEngine.playFreeSpins();
        setWinAnnouncement(`🔮 ¡LUNA DE SANGRE! ${evaluated.freeSpinsCount} TIROS GRATIS ACTIVADOS`);
        freeSpinsActiveRef.current = true;
        freeSpinsLeftRef.current += evaluated.freeSpinsCount;
        setIsFreeSpinsActive(true);
        setFreeSpinsLeft(freeSpinsLeftRef.current);
      }

      // Bonus minigames removed: continue the normal sequence without opening extra games.
      if (freeSpinsActiveRef.current) {
        handleFreeSpinsStep();
      } else if (isAutoPlaying) {
        schedule(() => { triggerSpin(); }, isTurbo ? 600 : 1500);
      }
    };

    executeSequence();
  };

  // Manage steps inside active free spins
  const handleFreeSpinsStep = () => {
    const nextSpins = Math.max(0, freeSpinsLeftRef.current - 1);
    freeSpinsLeftRef.current = nextSpins;
    setFreeSpinsLeft(nextSpins);

    if (nextSpins === 0 && freeSpinsActiveRef.current) {
      schedule(() => {
        const accumulated = freeSpinsWinAccumRef.current;
        setWinAnnouncement(`🧛 TIROS GRATIS COMPLETADOS: +$${accumulated}`);
        setCredits(prev => prev + accumulated);
        setLastWin(accumulated);
        freeSpinsWinAccumRef.current = 0;
        setFreeSpinsWinAccum(0);
        freeSpinsActiveRef.current = false;
        setIsFreeSpinsActive(false);
        if (isAutoPlaying) schedule(() => triggerSpin(), 1500);
      }, 1200);
    } else if (nextSpins > 0) {
      schedule(() => triggerSpin(), isTurbo ? 800 : 1800);
    }
  };

  // Cycle and cycle-highlight multiple winning lines one by one for visual precision
  useEffect(() => {
    if (isSpinning || winningLines.length <= 1) {
      setActiveWinningLineIdx(-1);
      return;
    }

    // Index cycle loop
    let currentIdx = -1;
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % winningLines.length;
      setActiveWinningLineIdx(currentIdx);
      
      const line = winningLines[currentIdx];
      if (line) {
        if (line.lineId === 99) {
          setWinAnnouncement(`LUNA DE SANGRE SCATTER GANA $${line.payout}!`);
        } else if (line.lineId === 100) {
          setWinAnnouncement(`¡ATAÚD BONUS ACTIVADO!`);
        } else {
          setWinAnnouncement(`¡LÍNEA ${line.lineId} GANA $${line.payout}!`);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [winningLines, isSpinning]);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-black text-neutral-200">
      
      {/* Background Underlay - Generated Luxurious Gothic Castle */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none filter brightness-50 contrast-125 z-0"
        style={{ backgroundImage: `url(${castleBgImg})` }}
      />

      {/* Atmospheric Fog, Vignette & Candle Spotlight Layer */}
      <canvas ref={fogCanvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Master Audio Controller Mute Overlay */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40">
        <button
          onClick={toggleMute}
          className="p-2 sm:p-3 bg-neutral-900/85 border border-[#580000] rounded-full hover:border-red-500 hover:bg-[#200303] text-neutral-300 transition-all duration-200 shadow-lg active:scale-95"
          title={isMuted ? 'Activar Sonidos' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />}
        </button>
      </div>

      {/* HEADER SECTION: Game Title, Free Spins notification */}
      <header className="relative w-full pt-3 sm:pt-6 pb-1 sm:pb-2 px-3 text-center z-30 select-none">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:py-1 bg-black/60 border border-[#3a0202] rounded-full mb-1 sm:mb-2">
          <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-bold tracking-widest text-neutral-300 font-cinzel">CRÉDITOS VIRTUALES</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-wider sm:tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-red-600 to-red-950 font-cinzel filter drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase leading-tight">
          BLOOD COVENANT
        </h1>
        
        <p className="text-[9px] sm:text-[10px] md:text-xs tracking-wider text-neutral-400 font-sans mt-0.5 max-w-sm mx-auto uppercase">
          Vampire Gothic Slots
        </p>

        {/* Progressive Grand Jackpot Display with gold lighting */}
        <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-1 sm:py-1.5 bg-gradient-to-r from-amber-950/90 via-red-950/90 to-amber-950/90 border border-amber-500/80 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse" />
          <span className="font-cinzel text-[10px] sm:text-xs font-bold text-neutral-300">BOTE DEL CONDE:</span>
          <span className="font-cinzel text-xs sm:text-sm md:text-base font-black text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
            ${jackpotPool.toLocaleString()}
          </span>
        </div>

        {/* Free Spins Alert banner */}
        {isFreeSpinsActive && (
          <div className="mt-2 sm:mt-4 inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border border-rose-500 rounded-full shadow-[0_0_15px_rgba(251,113,133,0.4)] animate-pulse">
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            <span className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest font-cinzel text-white">
              TIROS GRATIS: {freeSpinsLeft} | GANADO: ${freeSpinsWinAccum}
            </span>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER: Character panels flanking centered machine */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-1 sm:py-2 flex items-center justify-center relative z-20">
        
        {/* Left Side: Absolute Character Overlay (Vampire Lord) - Hidden on mobile, pristine on wide desktop */}
        <div 
          className="hidden xl:block absolute left-4 bottom-24 w-60 h-80 bg-cover bg-center rounded-xl border border-red-900/40 shadow-2xl filter brightness-75 hover:brightness-100 transition-all pointer-events-none"
          style={{ backgroundImage: `url(${lordPortraitImg})` }}
        />

        {/* Right Side: Absolute Character Overlay (Vampire Countess) - Hidden on mobile, pristine on wide desktop */}
        <div 
          className="hidden xl:block absolute right-4 bottom-24 w-60 h-80 bg-cover bg-center rounded-xl border border-red-900/40 shadow-2xl filter brightness-75 hover:brightness-100 transition-all pointer-events-none"
          style={{ backgroundImage: `url(${countessPortraitImg})` }}
        />

        {/* CENTER SLOT CABIN */}
        <div id="slot-cabin-box" className="relative w-full max-w-3xl flex flex-col items-center">
          {/* Halloween skin: the center is transparent so only the real Pixi reels show. */}
          <picture className="absolute inset-0 z-30 pointer-events-none select-none">
            <source media="(max-width: 767px)" srcSet={halloweenFrameMobile} />
            <img src={halloweenFramePc} alt="Halloween slot frame" className="w-full h-full object-contain" />
          </picture>

          {/* Win Announcement Bar above Reels */}
          <div className="w-full h-8 sm:h-10 flex items-center justify-center bg-black/80 border border-[#3a0202] rounded-t-xl px-2 sm:px-4 text-center">
            <span className={`text-[11px] sm:text-xs md:text-sm font-bold tracking-wider font-cinzel transition-all duration-300 truncate ${winAnnouncement ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-neutral-500'}`}>
              {winAnnouncement || 'SANGRE Y RIQUEZA TE AGUARDAN...'}
            </span>
          </div>

          {/* Slot Reels Panel Frame */}
          <div className="w-full my-0.5 sm:my-1">
            <SlotReels
              grid={grid}
              isSpinning={isSpinning}
              spinningReels={spinningReels}
              winningLines={winningLines}
              activeWinningLineIdx={activeWinningLineIdx}
              isTurbo={isTurbo}
            />
          </div>

          {/* Active Testing presets tool underneath reels */}
          <div className="w-full mt-2 sm:mt-4 p-2 sm:p-2.5 bg-neutral-950/90 border border-[#2c0505] rounded-xl flex flex-wrap items-center justify-between gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] md:text-xs font-bold text-red-500 font-cinzel tracking-widest uppercase">
              <Compass className="w-3.5 h-3.5 text-red-600 animate-pulse" /> PRUEBAS:
            </div>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <button
                onClick={() => { setSelectedPreset('five_vampires'); setWinAnnouncement('PRESET: Vlad 5-Of-A-Kind preparado!'); }}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] bg-red-950/60 border border-red-900 text-red-400 font-bold hover:bg-red-900 hover:text-white rounded transition-colors active:scale-95"
              >
                Vlad 5x
              </button>
              <button
                onClick={() => { setSelectedPreset('free_spins'); setWinAnnouncement('PRESET: Tiros Gratis preparado!'); }}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] bg-rose-950/60 border border-rose-900 text-rose-400 font-bold hover:bg-rose-900 hover:text-white rounded transition-colors active:scale-95"
              >
                Tiros Gratis
              </button>
              <button
                onClick={() => { setSelectedPreset('mixed_wilds'); setWinAnnouncement('PRESET: Mixed Wilds preparado!'); }}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] bg-yellow-950/60 border border-yellow-900 text-yellow-400 font-bold hover:bg-yellow-900 hover:text-white rounded transition-colors active:scale-95"
              >
                Wilds
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER CABINET CONTROLS */}
      <footer className="w-full">
        <SlotControls
          credits={credits}
          currentBet={currentBet}
          lastWin={lastWin}
          isSpinning={isSpinning}
          isAutoPlaying={isAutoPlaying}
          isTurbo={isTurbo}
          onSpin={triggerSpin}
          onMaxBet={selectMaxBet}
          onToggleAuto={() => setIsAutoPlaying(prev => !prev)}
          onToggleTurbo={() => setIsTurbo(prev => !prev)}
          onIncreaseBet={increaseBet}
          onDecreaseBet={decreaseBet}
          onCashOut={handleCashOut}
          onOpenPaytable={() => setIsPaytableOpen(true)}
          freeSpinsLeft={freeSpinsLeft}
          isFreeSpinsActive={isFreeSpinsActive}
        />
      </footer>

      {/* --- Overlay Modals (Only one celebration visual can render at any given time) --- */}
      
      {/* 1. Paytable Information Modal */}
      <PaytableModal
        isOpen={isPaytableOpen}
        onClose={() => setIsPaytableOpen(false)}
      />

      {/* 2. Win Celebrations Modal (Lights, Rain, or Grand) */}
      <WinCelebrationModal
        isOpen={isCelebrationOpen}
        winAmount={lastWin}
        celebrationType={celebrationType}
        onClose={() => setIsCelebrationOpen(false)}
      />

    </div>
  );
};
export default SlotMachine;
