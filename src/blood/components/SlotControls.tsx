import React from 'react';
import { Info, RotateCw, ShieldAlert, Zap, Award, Coins, HelpCircle, ArrowLeftRight } from 'lucide-react';
import { BETS_LIST } from '../data/gameData';
import { AudioEngine } from '../utils/AudioController';

interface SlotControlsProps {
  credits: number;
  currentBet: number;
  lastWin: number;
  isSpinning: boolean;
  isAutoPlaying: boolean;
  isTurbo: boolean;
  onSpin: () => void;
  onMaxBet: () => void;
  onToggleAuto: () => void;
  onToggleTurbo: () => void;
  onIncreaseBet: () => void;
  onDecreaseBet: () => void;
  onCashOut: () => void; // Reset virtual bank
  onOpenPaytable: () => void;
  onOpenGamble?: () => void;
  onOpenWheel?: () => void;
  freeSpinsLeft: number;
  isFreeSpinsActive: boolean;
}

export const SlotControls: React.FC<SlotControlsProps> = ({
  credits,
  currentBet,
  lastWin,
  isSpinning,
  isAutoPlaying,
  isTurbo,
  onSpin,
  onMaxBet,
  onToggleAuto,
  onToggleTurbo,
  onIncreaseBet,
  onDecreaseBet,
  onCashOut,
  onOpenPaytable,
  onOpenGamble,
  onOpenWheel,
  freeSpinsLeft,
  isFreeSpinsActive
}) => {
  return (
    <div id="slot-controls-chassis" className="w-full bg-[#160a0a] border-t-2 sm:border-t-4 border-[#420404] p-2.5 sm:p-4 md:p-6 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] relative z-20 pb-safe">
      
      {/* Decorative metal rivets and subtle glow lines */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-red-800/50" />
      <div className="absolute top-1 left-2 sm:left-4 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-neutral-900 border border-neutral-700 shadow-inner" />
      <div className="absolute top-1 right-2 sm:right-4 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-neutral-900 border border-neutral-700 shadow-inner" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto flex flex-col gap-2.5 sm:gap-4">
        
        {/* Row 1: Readouts and Displays */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:gap-6">
          
          {/* Bank / Balance Display */}
          <div className="bg-[#0b0303] border border-[#420a0a] rounded-lg p-1.5 sm:p-2.5 md:p-3 shadow-inner flex flex-col justify-center text-center">
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-wider sm:tracking-widest text-neutral-400 font-cinzel flex items-center justify-center gap-1 uppercase truncate">
              <Coins className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-yellow-500 shrink-0" /> <span className="truncate">SALDO</span>
            </span>
            <span className="text-sm sm:text-lg md:text-2xl font-bold font-cinzel text-yellow-500 mt-0.5 sm:mt-1 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)] truncate">
              ${credits.toLocaleString()}
            </span>
          </div>

          {/* Current Bet Display */}
          <div className="bg-[#0b0303] border border-[#420a0a] rounded-lg p-1.5 sm:p-2.5 md:p-3 shadow-inner flex flex-col justify-center text-center relative overflow-hidden">
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-wider sm:tracking-widest text-neutral-400 font-cinzel flex items-center justify-center gap-1 uppercase truncate">
              APUESTA
            </span>
            
            {/* Bet display & adjustment arrows */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-3 mt-0.5 sm:mt-1">
              <button
                disabled={isSpinning || isFreeSpinsActive}
                onClick={() => {
                  AudioEngine.playClick();
                  onDecreaseBet();
                }}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-red-900 hover:border-red-500 bg-red-950/60 text-red-400 text-xs font-bold flex items-center justify-center hover:bg-red-900 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all touch-manipulation"
              >
                -
              </button>
              
              <span className="text-sm sm:text-lg md:text-2xl font-bold font-cinzel text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] min-w-[36px] sm:min-w-[50px] text-center">
                ${currentBet}
              </span>

              <button
                disabled={isSpinning || isFreeSpinsActive}
                onClick={() => {
                  AudioEngine.playClick();
                  onIncreaseBet();
                }}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-red-900 hover:border-red-500 bg-red-950/60 text-red-400 text-xs font-bold flex items-center justify-center hover:bg-red-900 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all touch-manipulation"
              >
                +
              </button>
            </div>
          </div>

          {/* Last Win Display */}
          <div className="bg-[#0b0303] border border-[#420a0a] rounded-lg p-1.5 sm:p-2.5 md:p-3 shadow-inner flex flex-col justify-center text-center">
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold tracking-wider sm:tracking-widest text-neutral-400 font-cinzel flex items-center justify-center gap-1 uppercase truncate">
              <Award className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-red-500 shrink-0" /> <span className="truncate">PREMIO</span>
            </span>
            <span className={`text-sm sm:text-lg md:text-2xl font-bold font-cinzel mt-0.5 sm:mt-1 transition-all duration-300 truncate ${lastWin > 0 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] scale-105' : 'text-neutral-500'}`}>
              ${lastWin > 0 ? lastWin.toLocaleString() : '0'}
            </span>
          </div>

        </div>

        {/* Row 2: Tactile 3D Action Buttons */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 sm:gap-3 pt-1">
          
          {/* Left Block: Utility Controls (INFO, CASHOUT, TURBO, RUEDA) */}
          <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5 sm:gap-2.5 w-full md:w-auto">
            {/* Paytable (INFO) button */}
            <button
              onClick={() => {
                AudioEngine.playClick();
                onOpenPaytable();
              }}
              className="px-2 sm:px-3.5 py-2 sm:py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-300 font-cinzel text-[10px] sm:text-xs font-bold tracking-wider flex items-center justify-center gap-1
                        shadow-[0_2px_0_#262626,0_3px_6px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all touch-manipulation"
              title="Tabla de Pagos"
            >
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>PAGOS</span>
            </button>

            {/* Cash Out / Cobrar Button */}
            <button
              onClick={() => {
                AudioEngine.playClick();
                onCashOut();
              }}
              className="px-2 sm:px-3.5 py-2 sm:py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 font-cinzel text-[10px] sm:text-xs font-bold tracking-wider flex items-center justify-center gap-1
                        shadow-[0_2px_0_#0f0f0f,0_3px_6px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all touch-manipulation"
              title="Reiniciar Créditos Virtuales"
            >
              <HelpCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span>COBRAR</span>
            </button>

            {/* Turbo Toggle */}
            <button
              onClick={() => {
                AudioEngine.playClick();
                onToggleTurbo();
              }}
              className={`px-2 sm:px-3.5 py-2 sm:py-2.5 border rounded-lg font-cinzel text-[10px] sm:text-xs font-bold tracking-wider flex items-center justify-center gap-1 transition-all touch-manipulation
                        ${isTurbo 
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500 shadow-[0_2px_0_#78350f,0_3px_6px_rgba(217,119,6,0.2)]' 
                          : 'bg-neutral-900 text-neutral-500 border-neutral-800 shadow-[0_2px_0_#0c0c0c]'
                        } active:translate-y-[2px] active:shadow-none`}
            >
              <Zap className={`w-3.5 h-3.5 shrink-0 ${isTurbo ? 'text-amber-400 animate-pulse' : 'text-neutral-600'}`} />
              <span>TURBO</span>
            </button>

            {/* Dracula's Blood Wheel Minigame Button */}
            {onOpenWheel && (
              <button
                onClick={() => {
                  AudioEngine.playClick();
                  onOpenWheel();
                }}
                disabled={isSpinning}
                className="px-2 sm:px-3 py-2 sm:py-2.5 bg-gradient-to-r from-red-950 via-amber-950 to-red-950 hover:from-red-900 hover:to-amber-900 border border-amber-500/80 rounded-lg text-amber-300 font-cinzel text-[10px] sm:text-xs font-bold tracking-wider flex items-center justify-center gap-1 shadow-[0_2px_0_#451a03,0_3px_6px_rgba(245,158,11,0.2)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40 cursor-pointer touch-manipulation"
                title="Girar la Rueda de Sangre de Drácula"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>RUEDA</span>
              </button>
            )}
          </div>

          {/* Right Block: Core Slot Game Controls (DOBLAR, MAX, AUTO, GIRAR) */}
          <div className="grid grid-cols-4 sm:flex sm:items-center gap-1.5 sm:gap-2.5 w-full md:w-auto">
            
            {/* DOBLE O NADA (Gamble Feature Button) */}
            {onOpenGamble && (
              <button
                disabled={isSpinning || lastWin <= 0}
                onClick={() => {
                  AudioEngine.playClick();
                  onOpenGamble();
                }}
                className={`px-2 sm:px-3.5 py-2.5 sm:py-3.5 border rounded-xl font-cinzel text-[10px] sm:text-xs font-bold tracking-wider flex items-center justify-center gap-1 transition-all duration-150 cursor-pointer touch-manipulation
                  ${lastWin > 0 && !isSpinning
                    ? 'bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 hover:from-amber-500 hover:to-red-500 text-white border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse active:scale-95'
                    : 'bg-neutral-900/80 text-neutral-600 border-neutral-800 opacity-40 pointer-events-none'
                  }`}
              >
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-300 shrink-0" />
                <span className="truncate">DOBLAR</span>
              </button>
            )}
            
            {/* MAX APUESTA (Max Bet) */}
            <button
              disabled={isSpinning || isFreeSpinsActive}
              onClick={() => {
                AudioEngine.playClick();
                onMaxBet();
              }}
              className="px-2 sm:px-4 py-2.5 sm:py-3.5 bg-gradient-to-b from-[#450a0a] to-[#240303] hover:from-[#580e0e] hover:to-[#330505] border border-red-900/60 rounded-xl text-red-200 font-cinzel text-[10px] sm:text-xs md:text-sm font-bold tracking-wider sm:tracking-widest flex items-center justify-center
                        shadow-[0_3px_0_#1a0202,0_4px_8px_rgba(0,0,0,0.5)] active:translate-y-[3px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none transition-all touch-manipulation"
            >
              <span className="truncate">MAX</span>
            </button>

            {/* AUTO SPIN Button */}
            <button
              disabled={isFreeSpinsActive}
              onClick={() => {
                AudioEngine.playClick();
                onToggleAuto();
              }}
              className={`px-2 sm:px-4 py-2.5 sm:py-3.5 border rounded-xl font-cinzel text-[10px] sm:text-xs md:text-sm font-bold tracking-wider sm:tracking-widest transition-all flex items-center justify-center touch-manipulation
                        ${isAutoPlaying 
                          ? 'bg-red-950/80 text-red-300 border-red-500 shadow-[0_3px_0_#581c1c,0_4px_8px_rgba(239,68,68,0.2)]' 
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 shadow-[0_3px_0_#0f0f0f,0_4px_8px_rgba(0,0,0,0.5)]'
                        } active:translate-y-[3px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none`}
            >
              <span className="truncate">{isAutoPlaying ? 'STOP' : 'AUTO'}</span>
            </button>

            {/* SPIN BUTTON (Botón GIRAR) */}
            <button
              onClick={onSpin}
              disabled={isSpinning && !isAutoPlaying}
              className={`col-span-1 sm:col-auto px-3 sm:px-8 py-2.5 sm:py-4 bg-gradient-to-b from-[#dc2626] to-[#7f1d1d] hover:from-[#ef4444] hover:to-[#991b1b] border-2 border-red-500 rounded-xl text-white font-cinzel text-xs sm:text-base md:text-lg font-black tracking-wider sm:tracking-widest
                        shadow-[0_4px_0_#4c0519,0_6px_15px_rgba(220,38,38,0.4)] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-1 sm:gap-2.5 touch-manipulation
                        ${isFreeSpinsActive ? 'from-rose-600 to-rose-950 border-rose-400 shadow-[0_4px_0_#4c0519,0_8px_20px_rgba(251,113,133,0.3)] animate-pulse' : ''}`}
            >
              <RotateCw className={`w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0 ${isSpinning ? 'animate-spin' : ''}`} />
              <span className="truncate">
                {isFreeSpinsActive 
                  ? `TIRO (${freeSpinsLeft})` 
                  : isSpinning 
                  ? '...' 
                  : 'GIRAR'}
              </span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
export default SlotControls;
