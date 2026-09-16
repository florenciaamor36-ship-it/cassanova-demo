import React, { useState, useEffect } from 'react';
import { Crown, Flame, Gem } from 'lucide-react';

interface JackpotBannersProps {
  spinCounter: number;
  onSelectJackpot?: (type: 'MINI' | 'MAJOR' | 'GRAND', amount: number) => void;
}

export const JackpotBanners: React.FC<JackpotBannersProps> = ({ spinCounter, onSelectJackpot }) => {
  const [grandVal, setGrandVal] = useState(15420.50);
  const [majorVal, setMajorVal] = useState(2650.20);
  const [miniVal, setMiniVal] = useState(380.15);

  useEffect(() => {
    if (spinCounter > 0) {
      setGrandVal((prev) => parseFloat((prev + 0.35 + Math.random() * 0.25).toFixed(2)));
      setMajorVal((prev) => parseFloat((prev + 0.15 + Math.random() * 0.15).toFixed(2)));
      setMiniVal((prev) => parseFloat((prev + 0.05 + Math.random() * 0.08).toFixed(2)));
    }
  }, [spinCounter]);

  return (
    <div
      id="jackpot-banners-bar"
      className="w-full max-w-[820px] mx-auto px-1 sm:px-2 py-1 mb-1.5 grid grid-cols-3 gap-1.5 sm:gap-2 shrink-0 select-none"
    >
      {/* MINI JACKPOT - Variant 1 Standard Prize Explosion */}
      <button
        id="btn-jackpot-mini"
        onClick={() => onSelectJackpot && onSelectJackpot('MINI', miniVal)}
        className="py-1 px-2 rounded-xl bg-gradient-to-b from-[#1a1308] to-[#0c0904] border border-cyan-500/50 hover:border-cyan-400 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_10px_rgba(6,182,212,0.25)] flex flex-col items-center justify-center text-center cursor-pointer group"
      >
        <div className="flex items-center gap-1 mb-0.5">
          <Gem className="w-3 h-3 text-cyan-400 shrink-0 animate-pulse group-hover:scale-110 transition-transform" />
          <span className="font-cinzel text-[8px] sm:text-[10px] font-bold text-cyan-300 tracking-wider uppercase">
            MINI
          </span>
        </div>
        <div className="font-cinzel text-xs sm:text-sm font-black text-cyan-100 font-mono tracking-tight">
          ${miniVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </button>

      {/* MAJOR JACKPOT - Variant 2 Coin Rain Explosion */}
      <button
        id="btn-jackpot-major"
        onClick={() => onSelectJackpot && onSelectJackpot('MAJOR', majorVal)}
        className="py-1 px-2 rounded-xl bg-gradient-to-b from-[#241304] to-[#0d0702] border border-amber-500/60 hover:border-amber-400 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] flex flex-col items-center justify-center text-center cursor-pointer group"
      >
        <div className="flex items-center gap-1 mb-0.5">
          <Flame className="w-3 h-3 text-amber-400 shrink-0 animate-bounce group-hover:scale-110 transition-transform" />
          <span className="font-cinzel text-[8px] sm:text-[10px] font-bold text-amber-300 tracking-wider uppercase">
            MAJOR
          </span>
        </div>
        <div className="font-cinzel text-xs sm:text-sm font-black text-amber-100 font-mono tracking-tight">
          ${majorVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </button>

      {/* GRAND JACKPOT - Variant 3 Mega Epic Jackpot */}
      <button
        id="btn-jackpot-grand"
        onClick={() => onSelectJackpot && onSelectJackpot('GRAND', grandVal)}
        className="py-1 px-2 rounded-xl bg-gradient-to-r from-[#3d1e05] via-[#593208] to-[#3d1e05] border border-yellow-400/80 hover:border-yellow-300 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_16px_rgba(251,191,36,0.4)] flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/15 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        <div className="flex items-center gap-1 mb-0.5 relative z-10">
          <Crown className="w-3.5 h-3.5 text-yellow-300 shrink-0 group-hover:rotate-12 transition-transform" />
          <span className="font-cinzel text-[8px] sm:text-[10px] font-black text-yellow-300 tracking-widest uppercase drop-shadow">
            GRAND
          </span>
        </div>
        <div className="font-cinzel text-xs sm:text-base font-black text-yellow-100 font-mono tracking-tight relative z-10 drop-shadow">
          ${grandVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </button>
    </div>
  );
};
