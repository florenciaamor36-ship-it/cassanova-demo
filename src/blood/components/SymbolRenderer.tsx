import React from 'react';

// Photorealistic 3D slot symbol assets generated with Gemini
import vampireLordImg from '../assets/images/symbol_vampire_lord_1789672331451.webp';
import vampireCountessImg from '../assets/images/symbol_vampire_countess_1789672341596.webp';
import wildFangsImg from '../assets/images/symbol_wild_fangs_1789672353099.webp';
import scatterMoonImg from '../assets/images/symbol_scatter_moon_1789672362883.webp';
import bonusCoffinImg from '../assets/images/symbol_bonus_coffin_1789672373585.webp';
import bloodChaliceImg from '../assets/images/symbol_blood_chalice_1789672383843.webp';
import gothicCastleImg from '../assets/images/symbol_gothic_castle_1789672392637.webp';
import gothicBatImg from '../assets/images/symbol_gothic_bat_1789672402943.webp';
import gothicAceImg from '../assets/images/symbol_gothic_ace_1789672414316.webp';
import gothicKingImg from '../assets/images/symbol_gothic_king_1789672425055.webp';
import gothicQueenImg from '../assets/images/symbol_gothic_queen_1789672435130.webp';
import gothicJackImg from '../assets/images/symbol_gothic_jack_1789672445720.webp';

interface SymbolRendererProps {
  symbolId: string;
  isWinning?: boolean;
}

const SYMBOL_ASSETS: Record<string, { src: string; name: string; glow: string; border: string }> = {
  vampire_lord: {
    src: vampireLordImg,
    name: 'Señor Vlad',
    glow: 'rgba(239, 68, 68, 0.9)',
    border: 'border-red-600/80'
  },
  vampire_countess: {
    src: vampireCountessImg,
    name: 'Condesa Carmilla',
    glow: 'rgba(236, 72, 153, 0.9)',
    border: 'border-pink-600/80'
  },
  wild_fangs: {
    src: wildFangsImg,
    name: 'WILD Colmillos',
    glow: 'rgba(244, 63, 94, 1)',
    border: 'border-rose-500'
  },
  scatter_moon: {
    src: scatterMoonImg,
    name: 'Luna SCATTER',
    glow: 'rgba(251, 113, 133, 1)',
    border: 'border-rose-400'
  },
  bonus_coffin: {
    src: bonusCoffinImg,
    name: 'Ataúd BONUS',
    glow: 'rgba(16, 185, 129, 1)',
    border: 'border-emerald-500'
  },
  blood_chalice: {
    src: bloodChaliceImg,
    name: 'Cáliz de Sangre',
    glow: 'rgba(220, 38, 38, 0.85)',
    border: 'border-amber-600/80'
  },
  gothic_castle: {
    src: gothicCastleImg,
    name: 'Castillo Oscuro',
    glow: 'rgba(139, 92, 246, 0.85)',
    border: 'border-purple-600/80'
  },
  gothic_bat: {
    src: gothicBatImg,
    name: 'Murciélago',
    glow: 'rgba(148, 163, 184, 0.8)',
    border: 'border-slate-500/80'
  },
  gothic_a: {
    src: gothicAceImg,
    name: 'As de Sangre',
    glow: 'rgba(239, 68, 68, 0.7)',
    border: 'border-red-700/60'
  },
  gothic_k: {
    src: gothicKingImg,
    name: 'Rey del Abismo',
    glow: 'rgba(245, 158, 11, 0.7)',
    border: 'border-amber-600/60'
  },
  gothic_q: {
    src: gothicQueenImg,
    name: 'Reina de Rosas',
    glow: 'rgba(168, 85, 247, 0.7)',
    border: 'border-purple-600/60'
  },
  gothic_j: {
    src: gothicJackImg,
    name: 'Sota de Dagas',
    glow: 'rgba(20, 184, 166, 0.7)',
    border: 'border-teal-600/60'
  }
};

export const SymbolRenderer: React.FC<SymbolRendererProps> = ({ symbolId, isWinning = false }) => {
  const symbol = SYMBOL_ASSETS[symbolId];

  if (!symbol) {
    return (
      <div className="w-full h-full bg-neutral-900 rounded-xl flex items-center justify-center text-white text-xs font-bold font-cinzel">
        {symbolId}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full aspect-square max-w-[110px] max-h-[110px] flex items-center justify-center select-none transition-all duration-300
        ${isWinning ? 'scale-110 z-20' : 'hover:scale-105'}`}
      style={{
        filter: isWinning
          ? `drop-shadow(0 0 16px ${symbol.glow}) drop-shadow(0 0 6px ${symbol.glow})`
          : 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))'
      }}
    >
      {/* Outer beveled frame container */}
      <div
        className={`relative w-full h-full rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-[#2a0808] via-[#120202] to-[#050000] border-2 shadow-inner transition-colors duration-300
          ${isWinning ? `${symbol.border} ring-2 ring-white/50 animate-pulse` : 'border-[#3d0909] hover:border-red-800'}`}
      >
        {/* Photorealistic 3D Slot Icon Image */}
        <img
          src={symbol.src}
          alt={symbol.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 pointer-events-none"
          loading="lazy"
        />

        {/* Ambient Dark Corner Vignette on image */}
        <div className="absolute inset-1 rounded-xl pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Golden / Red Corner Accent Nails */}
        <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-yellow-600/70 shadow-sm" />
        <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-yellow-600/70 shadow-sm" />
        <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-yellow-600/70 shadow-sm" />
        <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-yellow-600/70 shadow-sm" />

        {/* Winning pulsing sheen */}
        {isWinning && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default SymbolRenderer;
