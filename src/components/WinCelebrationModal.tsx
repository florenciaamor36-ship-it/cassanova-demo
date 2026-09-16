import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Trophy, Flame, Coins, Award, Star, CheckCircle, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { sound } from '../services/soundEngine';
import { perf } from '../utils/performance';

// Egyptian Celebration Assets
import queenImg from '../assets/images/cleopatra_queen_portrait_1789481906325.jpg';
import pyramidImg from '../assets/images/cleopatra_pyramid_scatter_1789481922355.jpg';
import chestImg from '../assets/images/egyptian_treasure_chest_1789483982786.jpg';
import jackpotImg from '../assets/images/golden_jackpot_banner_1789483995548.jpg';
import scarabImg from '../assets/images/cleopatra_gold_scarab_1789481954310.jpg';

export type CelebrationType =
  | 'BIG_WIN'
  | 'MEGA_WIN'
  | 'SUPER_WIN'
  | 'ULTRA_WIN'
  | 'FREE_SPINS_TRIGGER'
  | 'VARIANT_1'
  | 'VARIANT_2'
  | 'VARIANT_3';

export type CelebrationVariant = 'VARIANT_1' | 'VARIANT_2' | 'VARIANT_3';

interface WinCelebrationModalProps {
  type: CelebrationType;
  amount: number;
  bet: number;
  onDismiss: () => void;
  initialVariant?: CelebrationVariant;
}

// 3D Realistic Coin Particle
interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  angleSpeed: number;
  colorType: number;
  bounceCount: number;
  layer: 'bg' | 'mid' | 'fg';
  alpha: number;
}

// Luminous Sparkle Particle
interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
  rotation: number;
  rotationSpeed: number;
}

// Shockwave Light Ring
interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
  speed: number;
}

// Procedural Lightning Bolt
interface LightningBolt {
  segments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  alpha: number;
  color: string;
  width: number;
}

export const WinCelebrationModal: React.FC<WinCelebrationModalProps> = ({
  type,
  amount,
  bet,
  onDismiss,
  initialVariant,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isCountUpComplete, setIsCountUpComplete] = useState(type === 'FREE_SPINS_TRIGGER');

  // Each prize popup uses exactly one celebration card.
  // If the caller does not force a style, choose one at random when the popup opens.
  const getInitialVariant = (): CelebrationVariant => {
    if (initialVariant) return initialVariant;
    const variants: CelebrationVariant[] = ['VARIANT_1', 'VARIANT_2', 'VARIANT_3'];
    return variants[Math.floor(Math.random() * variants.length)];
  };

  const [activeVariant, setActiveVariant] = useState<CelebrationVariant>(getInitialVariant);
  const [screenShake, setScreenShake] = useState(0);

  // Play audio when activeVariant or type changes
  const playVariantSound = useCallback((variant: CelebrationVariant) => {
    switch (variant) {
      case 'VARIANT_1':
        sound.playVariant1StandardExplosion();
        break;
      case 'VARIANT_2':
        sound.playVariant2CoinRainExplosion();
        break;
      case 'VARIANT_3':
        sound.playVariant3MegaEpicJackpot();
        break;
    }
  }, []);

  useEffect(() => {
    playVariantSound(activeVariant);
  }, [activeVariant, playVariantSound]);

  // Conversions - Exclusively in Pesos ($)
  const effectiveAmount = amount > 0 ? amount : 5000;
  const totalPesos = effectiveAmount;
  const displayPesos = displayAmount;

  // Fast-paced numeric counter rapidly rolling up to final prize value
  useEffect(() => {
    if (type === 'FREE_SPINS_TRIGGER' && effectiveAmount <= 0) {
      setIsCountUpComplete(true);
      return;
    }

    setIsCountUpComplete(false);
    let current = 0;
    
    // Variant 3 is super-fast spinning, Variant 2 fast-paced rolling, Variant 1 rapid scrolling
    const duration = activeVariant === 'VARIANT_3' ? 2400 : activeVariant === 'VARIANT_2' ? 1900 : 1500;
    const steps = activeVariant === 'VARIANT_3' ? 60 : 40;
    const intervalMs = duration / steps;
    const increment = effectiveAmount / steps;

    // Trigger initial shockwave screen shake
    setScreenShake(activeVariant === 'VARIANT_3' ? 16 : activeVariant === 'VARIANT_2' ? 10 : 7);

    const interval = setInterval(() => {
      current += increment;
      if (current >= effectiveAmount) {
        current = effectiveAmount;
        setDisplayAmount(effectiveAmount);
        setIsCountUpComplete(true);
        clearInterval(interval);
      } else {
        setDisplayAmount(current);
        if (activeVariant === 'VARIANT_2' || activeVariant === 'VARIANT_3') {
          sound.playCoinSound();
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [activeVariant, effectiveAmount, type]);

  // Screen shake dampening
  useEffect(() => {
    if (screenShake <= 0) return;
    const timer = setInterval(() => {
      setScreenShake((prev) => (prev > 0.5 ? prev * 0.85 : 0));
    }, 40);
    return () => clearInterval(timer);
  }, [screenShake]);

  // 60 FPS Photorealistic Canvas Physics Engine with Adaptive Mobile Optimization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = perf.getOptimizedDpr();
    const useGlow = perf.shouldUseShadowBlur();

    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      const newDpr = perf.getOptimizedDpr();
      width = canvas.width = window.innerWidth * newDpr;
      height = canvas.height = window.innerHeight * newDpr;
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const cx = cssWidth * 0.5;
    const cy = cssHeight * 0.42;

    // Helper to pre-render ultra-crisp Egyptian Gold Coins to an offscreen canvas
    // Eliminates 14,000+ GC object allocations per second in 60 FPS loops
    const createCachedCoinCanvas = (colorType: number, radius: number): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      const size = Math.ceil(radius * 2 + 4);
      c.width = size;
      c.height = size;
      const offCtx = c.getContext('2d');
      if (!offCtx) return c;

      const center = size / 2;

      // Photorealistic Metallic Gold Rim
      offCtx.beginPath();
      offCtx.arc(center, center, radius, 0, Math.PI * 2);
      const rimGrad = offCtx.createLinearGradient(center - radius, center - radius, center + radius, center + radius);
      rimGrad.addColorStop(0, '#fef08a');
      rimGrad.addColorStop(0.3, '#facc15');
      rimGrad.addColorStop(0.7, '#d97706');
      rimGrad.addColorStop(1, '#78350f');
      offCtx.fillStyle = rimGrad;
      offCtx.fill();

      offCtx.strokeStyle = '#fffbeb';
      offCtx.lineWidth = 1.5;
      offCtx.stroke();

      // Inner Coin Face
      offCtx.beginPath();
      offCtx.arc(center, center, radius * 0.72, 0, Math.PI * 2);
      offCtx.fillStyle = colorType === 0 ? '#fbbf24' : colorType === 1 ? '#f59e0b' : '#eab308';
      offCtx.fill();
      offCtx.strokeStyle = '#b45309';
      offCtx.lineWidth = 1;
      offCtx.stroke();

      // Embossed Sacred Scarab / Crown Center Glyph
      offCtx.fillStyle = '#78350f';
      offCtx.beginPath();
      offCtx.arc(center, center, radius * 0.28, 0, Math.PI * 2);
      offCtx.fill();

      return c;
    };

    const cachedCoins = [
      createCachedCoinCanvas(0, 24),
      createCachedCoinCanvas(1, 24),
      createCachedCoinCanvas(2, 24),
    ];

    // --- VARIANT 1 PARTICLES: Colorful Light Rays, Light Burst Explosions, Starbursts ---
    const lightRaysCount = perf.getLightRaysCount();
    const colorfulRayColors = [
      'rgba(251, 191, 36, 0.22)',  // Gold
      'rgba(236, 72, 153, 0.22)',  // Vibrant Magenta
      'rgba(6, 182, 212, 0.25)',   // Intense Cyan
      'rgba(168, 85, 247, 0.22)',  // Royal Purple
      'rgba(245, 158, 11, 0.24)',  // Warm Amber
      'rgba(255, 255, 255, 0.35)', // Bright White Flash
      'rgba(52, 211, 153, 0.22)',  // Emerald
    ];

    const shockwaves: ShockwaveRing[] = [
      { x: cx, y: cy, radius: 20, maxRadius: Math.max(cssWidth, cssHeight) * 0.85, color: '#fef08a', alpha: 0.9, lineWidth: 8, speed: 12 },
      { x: cx, y: cy, radius: 10, maxRadius: Math.max(cssWidth, cssHeight) * 0.75, color: '#38bdf8', alpha: 0.8, lineWidth: 6, speed: 16 },
      { x: cx, y: cy, radius: 5, maxRadius: Math.max(cssWidth, cssHeight) * 0.65, color: '#ec4899', alpha: 0.75, lineWidth: 5, speed: 9 },
    ];

    const sparkleTotal = perf.getSparkleCount();
    const sparkles: SparkleParticle[] = [];
    for (let i = 0; i < sparkleTotal; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      sparkles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 6,
        alpha: 0.9 + Math.random() * 0.1,
        color: ['#fde047', '#38bdf8', '#f43f5e', '#a855f7', '#ffffff', '#fbbf24'][Math.floor(Math.random() * 6)],
        decay: 0.008 + Math.random() * 0.012,
        rotation: Math.random() * Math.PI,
        rotationSpeed: 0.04 + Math.random() * 0.08,
      });
    }

    // --- VARIANT 2 & 3: Coins Collection with Adaptive Scaling ---
    const coinCount = perf.getCoinCount(activeVariant);
    const coins: CoinParticle[] = [];

    for (let i = 0; i < coinCount; i++) {
      const isExplosionCoin = i < Math.floor(coinCount * 0.4);
      const layer: 'bg' | 'mid' | 'fg' =
        activeVariant === 'VARIANT_3'
          ? (i % 3 === 0 ? 'bg' : i % 3 === 1 ? 'mid' : 'fg')
          : 'mid';

      const baseRadius = layer === 'bg' ? 8 : layer === 'mid' ? 13 : 20;

      if (isExplosionCoin) {
        // Explode outwards from center in 360 degrees
        const angle = Math.random() * Math.PI * 2;
        const spd = 4 + Math.random() * 12;
        coins.push({
          x: cx + (Math.random() - 0.5) * 40,
          y: cy + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - (Math.random() * 6),
          radius: baseRadius + Math.random() * 4,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: 0.08 + Math.random() * 0.2,
          colorType: Math.floor(Math.random() * 3),
          bounceCount: 0,
          layer,
          alpha: layer === 'bg' ? 0.65 : 1.0,
        });
      } else {
        // Continuous cascading rain from top
        coins.push({
          x: Math.random() * cssWidth,
          y: -30 - Math.random() * cssHeight * 1.2,
          vx: (Math.random() - 0.5) * 4,
          vy: 3 + Math.random() * 9,
          radius: baseRadius + Math.random() * 4,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: 0.06 + Math.random() * 0.16,
          colorType: Math.floor(Math.random() * 3),
          bounceCount: 0,
          layer,
          alpha: layer === 'bg' ? 0.65 : 1.0,
        });
      }
    }

    // --- VARIANT 3: Procedural Dramatic Lightning Generator ---
    let lightnings: LightningBolt[] = [];
    let lastLightningTime = 0;
    let backgroundFlashAlpha = 0;

    const generateLightning = () => {
      const startX = Math.random() * cssWidth;
      const startY = 0;
      const endX = cx + (Math.random() - 0.5) * cssWidth * 0.6;
      const endY = cy + (Math.random() - 0.5) * 200;

      const segments = [];
      let curX = startX;
      let curY = startY;
      const steps = 14;
      const dx = (endX - startX) / steps;
      const dy = (endY - startY) / steps;

      for (let s = 0; s < steps; s++) {
        const nextX = curX + dx + (Math.random() - 0.5) * 70;
        const nextY = curY + dy + (Math.random() - 0.5) * 20;
        segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

        // Optional fork branch
        if (Math.random() > 0.6) {
          const forkEndX = nextX + (Math.random() - 0.5) * 110;
          const forkEndY = nextY + 40 + Math.random() * 50;
          segments.push({ x1: curX, y1: curY, x2: forkEndX, y2: forkEndY });
        }

        curX = nextX;
        curY = nextY;
      }

      lightnings.push({
        segments,
        alpha: 1.0,
        color: Math.random() > 0.4 ? '#38bdf8' : '#fef08a',
        width: 3 + Math.random() * 3,
      });

      backgroundFlashAlpha = 0.35; // Intense room illumination
      setScreenShake(12);
    };

    let rotationAngle = 0;

    // Render loop running at 60 FPS
    const render = (time: number) => {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // 1. Render Background Lightning & Electrical Flash (Variant 3)
      if (activeVariant === 'VARIANT_3') {
        if (time - lastLightningTime > 900 + Math.random() * 600) {
          generateLightning();
          lastLightningTime = time;
        }

        if (backgroundFlashAlpha > 0.01) {
          ctx.fillStyle = `rgba(56, 189, 248, ${backgroundFlashAlpha * 0.4})`;
          ctx.fillRect(0, 0, cssWidth, cssHeight);
          ctx.fillStyle = `rgba(254, 240, 138, ${backgroundFlashAlpha * 0.25})`;
          ctx.fillRect(0, 0, cssWidth, cssHeight);
          backgroundFlashAlpha *= 0.88;
        }

        // Draw active lightning bolts
        for (let l = lightnings.length - 1; l >= 0; l--) {
          const bolt = lightnings[l];
          bolt.alpha -= 0.05;
          if (bolt.alpha <= 0) {
            lightnings.splice(l, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = bolt.alpha;
          ctx.strokeStyle = bolt.color;
          ctx.lineWidth = bolt.width;
          if (useGlow) {
            ctx.shadowColor = bolt.color;
            ctx.shadowBlur = 20;
          }
          ctx.lineCap = 'round';

          ctx.beginPath();
          bolt.segments.forEach((seg) => {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
          });
          ctx.stroke();

          // White core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1, bolt.width * 0.4);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Render Variant 1: Intense Colorful Light Rays & Light Burst Explosion
      if (activeVariant === 'VARIANT_1') {
        rotationAngle += 0.008;

        ctx.save();
        ctx.translate(cx, cy);

        // Radial light rays flashing across screen
        for (let r = 0; r < lightRaysCount; r++) {
          const rayAngle = rotationAngle + (r * Math.PI * 2) / lightRaysCount;
          const rayColor = colorfulRayColors[r % colorfulRayColors.length];
          const pulse = 0.12 + Math.sin(time * 0.006 + r * 1.5) * 0.06;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, Math.max(cssWidth, cssHeight) * 1.2, rayAngle, rayAngle + pulse);
          ctx.closePath();
          ctx.fillStyle = rayColor;
          ctx.fill();
        }
        ctx.restore();

        // Expanding shockwave rings
        shockwaves.forEach((sw) => {
          sw.radius += sw.speed;
          sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

          if (sw.alpha > 0.02) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.lineWidth * (1 - sw.radius / sw.maxRadius) + 1;
            ctx.globalAlpha = sw.alpha;
            if (useGlow) {
              ctx.shadowColor = sw.color;
              ctx.shadowBlur = 24;
            }
            ctx.stroke();
            ctx.restore();
          } else {
            // Loop shockwave
            sw.radius = 10;
            sw.alpha = 0.9;
          }
        });

        // Sparkling multi-colored burst particles
        sparkles.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.98;
          s.vy *= 0.98;
          s.rotation += s.rotationSpeed;
          s.alpha -= s.decay;

          if (s.alpha <= 0) {
            // Respawn in burst
            s.x = cx + (Math.random() - 0.5) * 60;
            s.y = cy + (Math.random() - 0.5) * 60;
            const a = Math.random() * Math.PI * 2;
            const sp = 3 + Math.random() * 7;
            s.vx = Math.cos(a) * sp;
            s.vy = Math.sin(a) * sp;
            s.alpha = 0.9 + Math.random() * 0.1;
          }

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rotation);
          ctx.globalAlpha = Math.max(0, s.alpha);
          ctx.fillStyle = s.color;
          if (useGlow) {
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 10;
          }

          // Diamond sparkle star
          ctx.beginPath();
          ctx.moveTo(0, -s.size * 2);
          ctx.lineTo(s.size * 0.5, -s.size * 0.5);
          ctx.lineTo(s.size * 2, 0);
          ctx.lineTo(s.size * 0.5, s.size * 0.5);
          ctx.lineTo(0, s.size * 2);
          ctx.lineTo(-s.size * 0.5, s.size * 0.5);
          ctx.lineTo(-s.size * 2, 0);
          ctx.lineTo(-s.size * 0.5, -s.size * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // 3. Render 3D Gold Coins (Blazing fast textured sprite blit with zero GC churn)
      coins.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.28; // Realistic casino gravity
        c.vx *= 0.992; // Air resistance
        c.angle += c.angleSpeed;

        // Bottom floor collision & bounce
        if (c.y + c.radius >= cssHeight) {
          c.y = cssHeight - c.radius;
          c.vy = -c.vy * 0.56; // Floor bounce dampening
          c.vx *= 0.85;
          c.bounceCount++;

          // Respawn coin to sustain rainfall
          if (c.bounceCount > 3 || Math.abs(c.vy) < 1.0) {
            c.y = -25 - Math.random() * 120;
            c.x = Math.random() * cssWidth;
            c.vy = 4 + Math.random() * 8;
            c.vx = (Math.random() - 0.5) * 5;
            c.bounceCount = 0;
          }
        }

        // Horizontal screen wrap
        if (c.x < -30) c.x = cssWidth + 30;
        if (c.x > cssWidth + 30) c.x = -30;

        ctx.save();
        ctx.translate(c.x, c.y);

        // 3D rotation projection via horizontal scale
        const scaleX = Math.cos(c.angle);
        ctx.scale(scaleX, 1);
        ctx.globalAlpha = c.alpha;

        const coinSprite = cachedCoins[c.colorType % 3];
        ctx.drawImage(coinSprite, -c.radius, -c.radius, c.radius * 2, c.radius * 2);

        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeVariant]);

  // Visual text and badge metadata
  const getVariantData = () => {
    switch (activeVariant) {
      case 'VARIANT_3':
        return {
          title: '¡MEGA EPIC JACKPOT!',
          subtitle: '¡EL GRAN PREMIO SUPREMO HA SIDO CONQUISTADO!',
          image: jackpotImg,
          tag: 'JACKPOT GRAND PRIZE',
          badgeColor: 'from-amber-400 via-yellow-200 to-amber-500',
          borderColor: 'border-yellow-300 shadow-[0_0_80px_rgba(250,204,21,0.9)]',
          icon: <Flame className="w-8 h-8 text-amber-300 animate-pulse" />,
        };
      case 'VARIANT_2':
        return {
          title: '¡LLUVIA DE ORO DEL FARAÓN!',
          subtitle: '¡CASCADA IMPERIAL DE MONEDAS MULTIPLICADAS!',
          image: chestImg,
          tag: 'COIN RAIN EXPLOSION',
          badgeColor: 'from-amber-500 via-amber-300 to-yellow-400',
          borderColor: 'border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.85)]',
          icon: <Coins className="w-8 h-8 text-yellow-300 animate-bounce" />,
        };
      case 'VARIANT_1':
      default:
        return {
          title: '¡EXPLOSIÓN DE PREMIO DORADO!',
          subtitle: '¡DESSTELLOS DE LUZ Y FORTUNA SAGRADA!',
          image: scarabImg,
          tag: 'STANDARD PRIZE EXPLOSION',
          badgeColor: 'from-cyan-400 via-amber-300 to-pink-500',
          borderColor: 'border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.85)]',
          icon: <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />,
        };
    }
  };

  const vData = getVariantData();
  const multiplier = bet > 0 ? (effectiveAmount / bet).toFixed(1) : null;

  return (
    <div
      id="fullscreen-win-celebration"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-[2px] sm:backdrop-blur-md overflow-hidden select-none animate-fade-in will-change-transform"
      onClick={onDismiss}
      style={{
        transform: screenShake > 0 ? `translate3d(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px, 0)` : 'none',
      }}
    >
      {/* 1. Fullscreen High-Performance 60 FPS Photorealistic 4K Canvas */}
      <canvas
        ref={canvasRef}
        id="celebration-particle-canvas"
        className="fixed inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 2. Central Win Showcase Modal Card */}
      <div
        className="relative z-20 w-full max-w-xl p-4 sm:p-7 rounded-3xl bg-gradient-to-b from-[#2b1705]/95 via-stone-950/98 to-black border-2 border-amber-400/80 shadow-[0_0_90px_rgba(251,191,36,0.7)] text-center flex flex-col items-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luminous Background Radial Halo */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* One celebration card is selected randomly for each prize. */}
        <div className="relative z-30 mb-2.5 text-[9px] sm:text-[10px] font-cinzel text-amber-400/80 uppercase font-bold tracking-widest">
          Celebración sorpresa
        </div>

        {/* --- VARIANT 3 GIANT GLOWING "MEGA" TEXT --- */}
        {activeVariant === 'VARIANT_3' && (
          <div className="my-1 text-center animate-bounce">
            <div className="font-cinzel font-black text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-600 tracking-widest drop-shadow-[0_0_35px_rgba(251,191,36,1)]">
              ⚡ MEGA ⚡
            </div>
            <div className="text-[10px] sm:text-xs font-cinzel text-yellow-300 font-bold uppercase tracking-widest -mt-1">
              GRAND PRIZE EPIC JACKPOT
            </div>
          </div>
        )}

        {/* Hero Prize Emblem Image */}
        <div className="relative my-1 group">
          {/* Animated Gold Aura Rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/50 to-yellow-200/50 blur-xl animate-pulse" />
          <div
            className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 ${vData.borderColor} flex items-center justify-center bg-black/60 shadow-2xl`}
          >
            <img
              src={vData.image}
              alt="Premio Especial"
              className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>

          {multiplier && (
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-stone-950 font-black font-cinzel text-xs sm:text-sm rounded-full border border-yellow-100 shadow-lg whitespace-nowrap">
              {multiplier}X APUESTA
            </div>
          )}
        </div>

        {/* Prize Tier Title Banner */}
        <div className="mt-3 mb-1 flex items-center justify-center gap-2">
          {vData.icon}
          <h2 className="font-cinzel text-lg sm:text-2xl md:text-3xl font-black text-gold-metallic tracking-wider drop-shadow-[0_2px_10px_rgba(251,191,36,0.6)]">
            {vData.title}
          </h2>
          {vData.icon}
        </div>

        <p className="text-xs sm:text-sm text-amber-200/80 font-cinzel font-medium max-w-md mx-auto mb-2">
          {vData.subtitle}
        </p>

        {/* Main Animated Numeric Display with Super-Fast Spin/Rolling Counter - Exclusively Pesos ($) */}
        <div className="my-2 py-3 px-4 rounded-2xl bg-black/75 border border-amber-500/50 w-full max-w-md shadow-2xl">
          <div className="text-[10px] sm:text-xs font-cinzel text-amber-400/90 font-bold uppercase tracking-widest mb-0.5">
            Premio Ganado
          </div>
          <div className="font-cinzel font-black text-3xl sm:text-5xl md:text-6xl text-gold-gradient tracking-tight drop-shadow-[0_4px_30px_rgba(251,191,36,0.85)]">
            +${displayPesos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Action Button: Collect / Continue */}
        <button
          id="btn-collect-win-action"
          onClick={onDismiss}
          className="mt-2.5 w-full max-w-md py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 text-stone-950 font-cinzel font-black text-sm sm:text-base uppercase tracking-widest hover:brightness-110 active:scale-95 shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center justify-center gap-2 transition-all"
        >
          {isCountUpComplete ? (
            <>
              <CheckCircle className="w-5 h-5 text-stone-950" />
              <span>¡COBRAR Y CONTINUAR!</span>
            </>
          ) : (
            <>
              <Coins className="w-5 h-5 text-stone-950" />
              <span>¡COBRAR AHORA! (SALTAR)</span>
            </>
          )}
        </button>

        {/* Prompt */}
        <div className="mt-1.5 text-[9px] text-amber-400/60 font-cinzel tracking-wider uppercase">
          Toca en cualquier parte para continuar
        </div>
      </div>
    </div>
  );
};

