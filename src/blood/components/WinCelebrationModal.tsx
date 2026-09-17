import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Flame, Crown, Coins } from 'lucide-react';
import { AudioEngine } from '../utils/AudioController';

interface WinCelebrationModalProps {
  isOpen: boolean;
  winAmount: number;
  celebrationType: 'lights' | 'rain' | 'grand';
  onClose: () => void;
}

export const WinCelebrationModal: React.FC<WinCelebrationModalProps> = ({
  isOpen,
  winAmount,
  celebrationType,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tickerAmount, setTickerAmount] = useState<number>(0);
  const [isCountFinished, setIsCountFinished] = useState<boolean>(false);
  const [cameraShake, setCameraShake] = useState<boolean>(false);

  // Dynamic Win Tiers based on win amount
  const getWinTier = () => {
    if (winAmount >= 5000 || celebrationType === 'grand') {
      return {
        id: 'sensational',
        title: '¡PREMIO SENSACIONAL!',
        subtitle: '★ SENSATIONAL EPIC WIN ★',
        tag: 'IMPERIO DE LA NOCHE',
        gradientText: 'from-[#fffbeb] via-[#fbbf24] to-[#b45309]',
        glowColor: 'rgba(245, 158, 11, 0.9)',
        accentColor: '#f59e0b',
        secondaryColor: '#fef08a',
        ribbonBg: 'from-amber-600 via-yellow-400 to-amber-600',
        ribbonText: 'text-black',
        icon: <Crown className="w-10 h-10 text-yellow-300 animate-bounce" />
      };
    }
    if (winAmount >= 2000) {
      return {
        id: 'super',
        title: '¡SÚPER PREMIO!',
        subtitle: '★ SUPER MEGA WIN ★',
        tag: 'RANGO NOBLE SUPREMO',
        gradientText: 'from-[#fdf4ff] via-[#d946ef] to-[#701a75]',
        glowColor: 'rgba(217, 70, 239, 0.9)',
        accentColor: '#d946ef',
        secondaryColor: '#f5d0fe',
        ribbonBg: 'from-fuchsia-600 via-pink-400 to-fuchsia-600',
        ribbonText: 'text-black',
        icon: <Trophy className="w-10 h-10 text-fuchsia-300 animate-pulse" />
      };
    }
    if (winAmount >= 800 || celebrationType === 'rain') {
      return {
        id: 'mega',
        title: '¡MEGA PREMIO!',
        subtitle: '★ MEGA WIN VICTORIA ★',
        tag: 'PACTO DE SANGRE REAL',
        gradientText: 'from-[#fff1f2] via-[#ef4444] to-[#7f1d1d]',
        glowColor: 'rgba(239, 68, 68, 0.9)',
        accentColor: '#ef4444',
        secondaryColor: '#fecaca',
        ribbonBg: 'from-red-600 via-rose-400 to-red-600',
        ribbonText: 'text-white',
        icon: <Flame className="w-10 h-10 text-red-400 animate-bounce" />
      };
    }
    return {
      id: 'big',
      title: '¡GRAN PREMIO!',
      subtitle: '★ BIG WIN PREMIO ★',
      tag: 'BENDICIÓN OSCURA',
      gradientText: 'from-[#fffbeb] via-[#f59e0b] to-[#78350f]',
      glowColor: 'rgba(251, 191, 36, 0.8)',
      accentColor: '#f59e0b',
      secondaryColor: '#fef08a',
      ribbonBg: 'from-amber-500 via-yellow-300 to-amber-500',
      ribbonText: 'text-black',
      icon: <Sparkles className="w-10 h-10 text-amber-300 animate-spin" />
    };
  };

  const tier = getWinTier();

  // Instant skip to final amount when user taps anywhere on screen
  const handleInstantSkip = () => {
    if (!isCountFinished) {
      setTickerAmount(Math.round(winAmount));
      setIsCountFinished(true);
      setCameraShake(true);
      setTimeout(() => setCameraShake(false), 500);
      AudioEngine.playJackpot();
    } else {
      AudioEngine.playClick();
      onClose();
    }
  };

  // Ticker animation & audio triggering
  useEffect(() => {
    if (isOpen && winAmount > 0) {
      setIsCountFinished(false);
      setCameraShake(false);

      if (winAmount >= 2000 || celebrationType === 'grand') {
        AudioEngine.playJackpot();
      } else if (winAmount >= 800) {
        AudioEngine.playBigWin();
      } else {
        AudioEngine.playWinNormal();
      }

      let start = 0;
      const duration = 2200;
      const stepTime = 25;
      const totalSteps = duration / stepTime;
      const increment = winAmount / totalSteps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= winAmount) {
          setTickerAmount(Math.round(winAmount));
          setIsCountFinished(true);
          setCameraShake(true);
          setTimeout(() => setCameraShake(false), 600);
          clearInterval(timer);
        } else {
          setTickerAmount(Math.round(start));
        }
      }, stepTime);

      return () => clearInterval(timer);
    } else {
      setTickerAmount(0);
      setIsCountFinished(false);
    }
  }, [isOpen, winAmount, celebrationType]);

  // Full Screen Pure Canvas Animation: 3D Coins, Rubies, Bats, Light Bursts
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Particles system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      spin: number;
      spinSpeed: number;
      type: 'coin' | 'ruby' | 'sparkle' | 'bat' | 'burst';
      wingAngle?: number;
      wingSpeed?: number;
    }

    const particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Spawn rich casino celebratory particles
    const spawnParticle = () => {
      const rand = Math.random();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      if (rand < 0.45) {
        // 3D Spinning Gold Coins bursting outward from center & raining from top
        const fromCenter = Math.random() > 0.4;
        const angle = Math.random() * Math.PI * 2;
        const speed = fromCenter ? Math.random() * 8 + 4 : Math.random() * 3 + 2;

        particles.push({
          x: fromCenter ? centerX + (Math.random() - 0.5) * 100 : Math.random() * canvas.width,
          y: fromCenter ? centerY + (Math.random() - 0.5) * 60 : -20,
          vx: fromCenter ? Math.cos(angle) * speed : (Math.random() - 0.5) * 4,
          vy: fromCenter ? Math.sin(angle) * speed - 3 : Math.random() * 5 + 4,
          radius: Math.random() * 10 + 8,
          color: '#f59e0b',
          alpha: 1,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.2,
          type: 'coin'
        });
      } else if (rand < 0.75) {
        // Sparkling Crimson Rubies
        particles.push({
          x: Math.random() * canvas.width,
          y: -20,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 4 + 3,
          radius: Math.random() * 8 + 5,
          color: '#ef4444',
          alpha: 1,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.1,
          type: 'ruby'
        });
      } else if (rand < 0.88) {
        // Flying Vampire Bats flapping across the screen
        particles.push({
          x: Math.random() > 0.5 ? -40 : canvas.width + 40,
          y: Math.random() * (canvas.height * 0.7) + 50,
          vx: (Math.random() * 4 + 3) * (Math.random() > 0.5 ? 1 : -1),
          vy: (Math.random() - 0.5) * 2,
          radius: Math.random() * 12 + 10,
          color: '#180202',
          alpha: 0.85,
          spin: 0,
          spinSpeed: 0,
          wingAngle: 0,
          wingSpeed: Math.random() * 0.3 + 0.25,
          type: 'bat'
        });
      } else {
        // Radiant Star Flares
        particles.push({
          x: centerX + (Math.random() - 0.5) * canvas.width * 0.8,
          y: centerY + (Math.random() - 0.5) * canvas.height * 0.8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(Math.random() * 2 + 0.5),
          radius: Math.random() * 7 + 3,
          color: ['#fde047', '#f472b6', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)],
          alpha: 1,
          spin: 0,
          spinSpeed: 0,
          type: 'sparkle'
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Keep particles alive and dense for intense action
      if (particles.length < 180) {
        spawnParticle();
        spawnParticle();
      }

      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'coin') {
          p.vy += 0.22; // gravity
          p.spin += p.spinSpeed;
        } else if (p.type === 'ruby') {
          p.vy += 0.12;
          p.spin += p.spinSpeed;
        } else if (p.type === 'sparkle') {
          p.alpha -= 0.012;
        } else if (p.type === 'bat') {
          if (p.wingAngle !== undefined && p.wingSpeed !== undefined) {
            p.wingAngle += p.wingSpeed;
          }
        }

        // Fade out when falling
        if (p.y > canvas.height * 0.85 && p.type !== 'bat') {
          p.alpha -= 0.035;
        }

        if (p.alpha <= 0 || p.y > canvas.height + 60 || p.x < -60 || p.x > canvas.width + 60) {
          particles.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

        if (p.type === 'coin') {
          // 3D Spinning Gold Coin with Edge Ridges & Reflection
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin);
          const rx = Math.max(0.2, p.radius);
          const ry = Math.max(0.2, Math.abs(p.radius * Math.sin(p.spin * 2.8)));

          // Outer Coin Glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#eab308';

          // Coin Body
          ctx.beginPath();
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
          const coinGrad = ctx.createLinearGradient(-rx, -ry, rx, ry);
          coinGrad.addColorStop(0, '#fef08a');
          coinGrad.addColorStop(0.3, '#f59e0b');
          coinGrad.addColorStop(0.7, '#d97706');
          coinGrad.addColorStop(1, '#78350f');
          ctx.fillStyle = coinGrad;
          ctx.fill();

          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Embossed Star in center of coin
          if (ry > 4) {
            ctx.beginPath();
            ctx.ellipse(0, 0, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2);
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } else if (p.type === 'ruby') {
          // Faceted Radiant Ruby Gem
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin);
          const s = Math.max(0.2, p.radius);

          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.85, -s * 0.3);
          ctx.lineTo(s * 0.65, s * 0.85);
          ctx.lineTo(-s * 0.65, s * 0.85);
          ctx.lineTo(-s * 0.85, -s * 0.3);
          ctx.closePath();

          const rubyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
          rubyGrad.addColorStop(0, '#fecaca');
          rubyGrad.addColorStop(0.3, '#ef4444');
          rubyGrad.addColorStop(0.8, '#991b1b');
          rubyGrad.addColorStop(1, '#450a0a');
          ctx.fillStyle = rubyGrad;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ef4444';
          ctx.fill();

          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (p.type === 'bat') {
          // Flying Gothic Vampire Bat Silhouette
          ctx.translate(p.x, p.y);
          const wingSpread = Math.sin(p.wingAngle || 0) * (p.radius * 0.7);
          const scaleDir = p.vx > 0 ? 1 : -1;
          ctx.scale(scaleDir, 1);

          ctx.fillStyle = '#0f0202';
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 0.8;

          // Bat Wings
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(p.radius * 0.6, -p.radius + wingSpread, p.radius * 1.5, -p.radius * 0.4 + wingSpread);
          ctx.quadraticCurveTo(p.radius * 0.9, 0, 0, p.radius * 0.3);
          ctx.quadraticCurveTo(-p.radius * 0.9, 0, -p.radius * 1.5, -p.radius * 0.4 + wingSpread);
          ctx.quadraticCurveTo(-p.radius * 0.6, -p.radius + wingSpread, 0, 0);
          ctx.fill();
          ctx.stroke();

          // Bat Glowing Red Eyes
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(p.radius * 0.15, -p.radius * 0.1, 1.2, 0, Math.PI * 2);
          ctx.arc(-p.radius * 0.15, -p.radius * 0.1, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 4-Point Star Burst Flare
          ctx.translate(p.x, p.y);
          const s = Math.max(0.2, p.radius);
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.8);
          ctx.quadraticCurveTo(0, 0, s * 1.8, 0);
          ctx.quadraticCurveTo(0, 0, 0, s * 1.8);
          ctx.quadraticCurveTo(0, 0, -s * 1.8, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s * 1.8);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 14;
          ctx.shadowColor = p.color;
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          onClick={handleInstantSkip}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden cursor-pointer select-none"
        >
          {/* Background Canvas: Explosive 3D Coins, Rubies & Bats */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

          {/* Rotating Volumetric Sunburst Golden God Rays (Full screen) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
            <div className="w-[1000px] h-[1000px] md:w-[1500px] md:h-[1500px] rounded-full animate-[spin_40s_linear_infinite] opacity-40 bg-[conic-gradient(from_0deg,#eab308,transparent_15deg,#eab308_30deg,transparent_45deg,#dc2626_60deg,transparent_75deg,#eab308_90deg,transparent_105deg,#eab308_120deg,transparent_135deg,#dc2626_150deg,transparent_165deg,#eab308_180deg,transparent_195deg,#eab308_210deg,transparent_225deg,#dc2626_240deg,transparent_255deg,#eab308_270deg,transparent_285deg,#eab308_300deg,transparent_315deg,#dc2626_330deg,transparent_345deg,#eab308_360deg)] filter blur-md" />
            <div className="absolute w-[600px] h-[600px] rounded-full bg-red-600/35 blur-[140px] animate-pulse" />
          </div>

          {/* Shockwave Blast Ring on Completion */}
          {isCountFinished && (
            <motion.div
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute w-[400px] h-[400px] rounded-full border-4 border-yellow-300 pointer-events-none z-15 shadow-[0_0_80px_#f59e0b]"
            />
          )}

          {/* Floating 3D Casino Presentation (NO CARD CONTAINER / NO MODAL BOX) */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              x: cameraShake ? [-8, 8, -6, 6, -3, 3, 0] : 0 
            }}
            exit={{ scale: 0.4, opacity: 0, y: 50 }}
            transition={{ 
              scale: { type: 'spring', damping: 12, stiffness: 140 },
              y: { type: 'spring', damping: 12, stiffness: 140 },
              opacity: { duration: 0.25 },
              x: { duration: 0.5, ease: 'easeInOut' }
            }}
            className="relative z-20 flex flex-col items-center text-center max-w-3xl pointer-events-none"
          >
            {/* Top Royal Vampire Crown with Flanking Golden Wings */}
            <div className="flex items-center justify-center gap-3 mb-2 filter drop-shadow-[0_0_25px_rgba(245,158,11,0.9)] animate-pulse">
              {/* Left Wing SVG */}
              <svg className="w-12 sm:w-16 h-8 text-amber-400 -scale-x-100" viewBox="0 0 100 50" fill="currentColor">
                <path d="M0,25 Q30,0 70,5 Q100,10 95,25 Q70,20 50,35 Q25,45 0,25 Z" fill="url(#wingGrad)" />
                <defs>
                  <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Crown */}
              <div className="p-3 rounded-full bg-gradient-to-b from-[#450a0a] to-[#1a0202] border-2 border-yellow-400 shadow-[0_0_35px_rgba(245,158,11,0.9)]">
                {tier.icon}
              </div>

              {/* Right Wing SVG */}
              <svg className="w-12 sm:w-16 h-8 text-amber-400" viewBox="0 0 100 50" fill="currentColor">
                <path d="M0,25 Q30,0 70,5 Q100,10 95,25 Q70,20 50,35 Q25,45 0,25 Z" fill="url(#wingGrad)" />
              </svg>
            </div>

            {/* Gilded Top Badge Ribbon */}
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="mb-3"
            >
              <span className={`inline-flex items-center gap-2 px-6 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-widest uppercase font-cinzel shadow-[0_0_25px_rgba(245,158,11,0.7)] bg-gradient-to-r ${tier.ribbonBg} ${tier.ribbonText}`}>
                ★ {tier.tag} ★
              </span>
            </motion.div>

            {/* Giant 3D Sculpted Metallic Text (BIG WIN / MEGA WIN / SUPER PREMIO) */}
            <h1 
              className="text-3xl sm:text-6xl md:text-8xl font-black tracking-normal sm:tracking-wider font-cinzel-dec uppercase select-none leading-tight sm:leading-none my-1 px-2"
              style={{
                color: '#fffbeb',
                backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #fef08a 30%, #f59e0b 65%, #78350f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 3px 0 #450a0a) drop-shadow(0 6px 1px #1a0202) drop-shadow(0 0 25px ${tier.glowColor})`
              }}
            >
              {tier.title}
            </h1>

            {/* Subtitle with stars */}
            <p className="text-xs sm:text-lg font-black tracking-wider sm:tracking-widest text-amber-200 uppercase font-cinzel my-1 sm:my-2 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {tier.subtitle}
            </p>

            {/* Floating Enormous Amount Ticker (NO CARD BOX - Pure Glowing Floating Bullion) */}
            <div className="relative my-2 sm:my-6 flex flex-col items-center max-w-full px-2">
              {/* Dynamic Aura Glow behind numbers */}
              <div 
                className="absolute inset-0 -inset-x-8 sm:-inset-x-12 rounded-full blur-2xl opacity-60 pointer-events-none animate-pulse"
                style={{ backgroundColor: tier.accentColor }}
              />

              <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm text-yellow-300 font-bold uppercase tracking-wider sm:tracking-widest font-cinzel mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <Coins className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-300 animate-spin shrink-0" />
                <span>GANANCIA TOTAL ACREDITADA</span>
                <Coins className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-300 animate-spin shrink-0" />
              </div>

              {/* Giant Gold Amount Numbers with Layered 3D Extrusion */}
              <motion.div 
                key={tickerAmount}
                className="relative z-10 text-4xl sm:text-7xl md:text-9xl font-black font-cinzel tracking-tight sm:tracking-wider leading-none break-all"
                style={{
                  color: '#ffffff',
                  backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #fef08a 25%, #facc15 50%, #ca8a04 75%, #713f12 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 4px 0 #450a0a) drop-shadow(0 8px 2px #0f0202) drop-shadow(0 0 30px rgba(245,158,11,1))'
                }}
              >
                ${tickerAmount.toLocaleString()}
              </motion.div>

              <div className="relative z-10 text-[9px] sm:text-xs md:text-sm font-sans font-bold text-amber-200/90 tracking-wider uppercase mt-1 sm:mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                CRÉDITOS VIRTUALES AÑADIDOS A TU BANCA
              </div>
            </div>

            {/* Instant Click Hint */}
            <p className="text-xs sm:text-sm text-amber-200/90 italic my-2 animate-pulse font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {isCountFinished ? 'Toca la pantalla para continuar el juego' : 'Toca en cualquier parte para cobrar al instante'}
            </p>

            {/* Sleek Floating Collect Button */}
            <div className="mt-4 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInstantSkip();
                }}
                className="relative group px-12 sm:px-16 py-4 font-cinzel font-black text-base sm:text-xl tracking-widest text-amber-100 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.9)] border-3 border-amber-300 bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#991b1b] overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:border-yellow-200 hover:shadow-[0_0_70px_rgba(250,204,21,1)]"
              >
                {/* Dynamic light sheen across button */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10 flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  <Coins className="w-6 h-6 text-yellow-300" />
                  {isCountFinished ? 'CONTINUAR JUGANDO' : 'COBRAR AL INSTANTE'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default WinCelebrationModal;
