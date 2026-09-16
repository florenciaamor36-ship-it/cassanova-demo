import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Flame } from 'lucide-react';
import pharaohImg from '../assets/images/cleopatra_pharaoh_mask_1789481979630.jpg';
import queenImg from '../assets/images/cleopatra_queen_portrait_1789481906325.jpg';
import templeBg from '../assets/images/cleopatra_temple_bg_1789482734602.jpg';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

const LOADING_MESSAGES = [
  'Conectando con servidores seguros...',
  'Descargando rodillos de alta velocidad 60 FPS...',
  'Sincronizando tabla de premios y multiplicadores...',
  'Verificando algoritmos RNG certificados...',
  'Activando comodines Wild 2X y Giros Gratis...',
  '¡Todo listo para jugar!',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusIndex, setStatusIndex] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Preload critical images in background
    const imagesToPreload = [
      pharaohImg,
      queenImg,
      templeBg,
    ];

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Smooth realistic loading progress bar (runs for ~3.5 to 4 seconds so user can enjoy the art and see download progress)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Steady increments for a clear, visible loading experience
        const increment = Math.floor(Math.random() * 4) + 2;
        const next = Math.min(prev + increment, 100);

        // Update status text dynamically based on progress brackets
        const nextStatusIdx = Math.min(
          Math.floor((next / 100) * LOADING_MESSAGES.length),
          LOADING_MESSAGES.length - 1
        );
        setStatusIndex(nextStatusIdx);

        return next;
      });
    }, 75);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      // Pause at 100% so user sees the completed state, then smooth fadeout
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 600);

      const completeTimer = setTimeout(() => {
        onLoadComplete();
      }, 1200);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [progress, onLoadComplete]);

  return (
    <div
      id="game-loading-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-8 bg-black select-none transition-opacity duration-500 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Immersive Temple Egyptian Background with Dim Blur */}
      <img
        src={templeBg}
        alt="Cleopatra Temple"
        className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105 filter blur-xs"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-stone-950/80 to-black/95" />

      {/* Decorative Golden Corner Accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 pt-2 sm:pt-6 flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-stone-900/90 border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[9px] sm:text-xs font-cinzel font-bold text-amber-300 uppercase tracking-widest">
            Casino Oficial • RNG 96.5% RTP
          </span>
        </div>
      </div>

      {/* Central Brand Core: Logo, Game Title & "LA CLAVE ARGENTINA" */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md w-full my-auto px-2">
        {/* Pharaoh & Queen Egyptian Crest */}
        <div className="relative mb-5 sm:mb-6">
          {/* Animated Golden Aura Glow */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-600/30 via-yellow-400/40 to-amber-700/30 blur-xl animate-pulse" />
          
          {/* Main Logo Disc */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.85)] overflow-hidden bg-gradient-to-b from-stone-900 to-black p-1">
            <img
              src={pharaohImg}
              alt="Cleopatra Pharaoh Logo"
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Queen Floating Cameo Badge */}
          <div className="absolute -bottom-2 -right-2 w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.9)] overflow-hidden bg-stone-900">
            <img
              src={queenImg}
              alt="Cleopatra Queen"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Game Title */}
        <div className="flex items-center gap-2 justify-center mb-1">
          <h1 className="font-cinzel text-3xl sm:text-4xl font-black tracking-widest text-gold-metallic leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]">
            CLEOPATRA
          </h1>
          <span className="font-cinzel text-xs sm:text-sm font-black px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/80 uppercase tracking-widest shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            GOLD
          </span>
        </div>

        {/* Prominent Badge: "LA CLAVE ARGENTINA" */}
        <div className="my-3 py-1.5 px-5 rounded-xl bg-gradient-to-r from-sky-950/90 via-sky-900/90 to-sky-950/90 border-2 border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.5)] flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow shrink-0" />
          <span className="font-cinzel font-black text-sm sm:text-base text-sky-200 tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            LA CLAVE ARGENTINA
          </span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow shrink-0" />
        </div>

        <p className="font-cinzel text-[10px] sm:text-xs text-amber-200/80 tracking-wider">
          20 LÍNEAS DE PAGO • COMODINES WILD 2X • 15 TIROS GRATIS 3X
        </p>
      </div>

      {/* Bottom Section: Downloading Progress Bar & Dynamic Status */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md pb-4 sm:pb-8 flex flex-col items-center">
        {/* Status Text & Percentage */}
        <div className="w-full flex items-center justify-between text-[10px] sm:text-xs font-cinzel text-amber-300/90 font-bold mb-1.5 px-1">
          <span className="truncate pr-2 flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-amber-400 shrink-0 animate-bounce" />
            <span className="truncate">{LOADING_MESSAGES[statusIndex]}</span>
          </span>
          <span className="font-mono font-black text-amber-200 text-xs sm:text-sm shrink-0">
            {progress}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3.5 sm:h-4 rounded-full bg-stone-950 border-2 border-amber-500/70 p-0.5 shadow-[0_0_20px_rgba(0,0,0,0.9)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.9)] transition-all duration-150 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Glow Highlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Download Subtitle Footnote */}
        <div className="mt-2.5 text-[8px] sm:text-[9.5px] font-cinzel text-stone-400/80 tracking-wider text-center uppercase">
          Descargando recursos gráficos y motor de audio...
        </div>
      </div>
    </div>
  );
};
