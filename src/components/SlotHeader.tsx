import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, HelpCircle, History, Sparkles, RefreshCw, Trophy, Settings, X } from 'lucide-react';
import pharaohImg from '../assets/images/cleopatra_pharaoh_mask_1789481979630.jpg';

interface SlotHeaderProps {
  balance: number;
  freeSpinsRemaining: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenPaytable: () => void;
  onOpenDashboard: () => void;
  onRechargeCredits: () => void;
  onOpenCelebrations?: () => void;
  onShowLoadingScreen?: () => void;
}

export const SlotHeader: React.FC<SlotHeaderProps> = ({
  balance,
  freeSpinsRemaining,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onOpenPaytable,
  onOpenDashboard,
  onRechargeCredits,
  onOpenCelebrations,
  onShowLoadingScreen,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-2 z-30 shrink-0 select-none">
      {/* Imposing Game Title & Pharaoh Emblem */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div 
          onClick={onShowLoadingScreen}
          title="Ver Pantalla de Carga y Descarga"
          className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.7)] shrink-0 cursor-pointer active:scale-95 transition-transform"
        >
          <img
            src={pharaohImg}
            alt="Cleopatra Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-cinzel text-xs sm:text-xl font-black tracking-wider text-gold-metallic leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap">
              CLEOPATRA
            </h1>
            <span className="text-[7.5px] sm:text-[10px] font-black px-1 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-400/60 uppercase tracking-widest shadow whitespace-nowrap">
              GOLD
            </span>
          </div>
          <p className="text-[7px] sm:text-[9.5px] text-amber-200/80 font-cinzel tracking-wider leading-none mt-1 whitespace-nowrap">
            20 LÍNEAS • WILD 2X • TIROS 3X
          </p>
        </div>
      </div>

      {/* Right Corner: Clear Balance Display */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Balance Display Pill */}
        <div className="flex items-center bg-stone-900/95 border-2 border-amber-500/60 rounded-xl px-2.5 sm:px-3.5 py-1.5 shadow-[0_0_12px_rgba(0,0,0,0.8)]">
          <div className="text-right mr-1.5">
            <div className="text-[8px] text-amber-400 font-cinzel tracking-widest uppercase leading-none font-bold">
              Pesos ($)
            </div>
            <div className="font-cinzel text-xs sm:text-base font-black text-amber-200 tracking-tight leading-none mt-0.5">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <button
            id="btn-recharge-credits"
            onClick={onRechargeCredits}
            title="Recargar Pesos ($)"
            className="p-1 rounded bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
