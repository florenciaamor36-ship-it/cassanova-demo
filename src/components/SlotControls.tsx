import React, { useState, useEffect } from 'react';
import { Minus, Plus, Zap, Play, Square, Award, Sparkles, Settings, HelpCircle, Volume2, VolumeX, BarChart3, BookOpen, RotateCcw } from 'lucide-react';
import { BET_STEPS, SYMBOLS } from '../data/slotConfig';
import { sound } from '../services/soundEngine';
import { haptic } from '../utils/haptics';
import { perf, PerformanceMode } from '../utils/performance';

interface SlotControlsProps {
  currentBet: number;
  balance: number;
  isSpinning: boolean;
  lastWin: number;
  turboMode: boolean;
  autoSpinCount: number;
  freeSpinsRemaining: number;
  activePaylinesCount: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onBetChange: (newBet: number) => void;
  onPaylinesChange: (lines: number) => void;
  onMaxBet: () => void;
  onToggleTurbo: () => void;
  onSpin: () => void;
  onStartAutoSpin: (spins: number) => void;
  onStopAutoSpin: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenPaytable: () => void;
  onOpenDashboard: () => void;
  onOpenCelebrations?: () => void;
  onShowLoadingScreen?: () => void;
}

const PAYLINE_OPTIONS = [1, 5, 10, 15, 20];

export const SlotControls: React.FC<SlotControlsProps> = ({
  currentBet,
  balance,
  isSpinning,
  lastWin,
  turboMode,
  autoSpinCount,
  freeSpinsRemaining,
  activePaylinesCount,
  soundEnabled,
  musicEnabled,
  onBetChange,
  onPaylinesChange,
  onMaxBet,
  onToggleTurbo,
  onSpin,
  onStartAutoSpin,
  onStopAutoSpin,
  onToggleSound,
  onToggleMusic,
  onOpenPaytable,
  onOpenDashboard,
  onOpenCelebrations,
  onShowLoadingScreen,
}) => {
  const [showAutoSpinMenu, setShowAutoSpinMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPayRefModal, setShowPayRefModal] = useState(false);
  const [perfMode, setPerfMode] = useState<PerformanceMode>(perf.getMode());

  const handleCyclePerfMode = () => {
    sound.playClick();
    haptic.light();
    const modes: PerformanceMode[] = ['auto', 'eco', 'high'];
    const next = modes[(modes.indexOf(perfMode) + 1) % modes.length];
    perf.setMode(next);
    setPerfMode(next);
  };

  const currentBetIndex = BET_STEPS.indexOf(currentBet) !== -1 ? BET_STEPS.indexOf(currentBet) : 0;
  const currentLinesIndex = PAYLINE_OPTIONS.indexOf(activePaylinesCount) !== -1 ? PAYLINE_OPTIONS.indexOf(activePaylinesCount) : PAYLINE_OPTIONS.length - 1;

  const handleDecreaseBet = () => {
    if (isSpinning || freeSpinsRemaining > 0) return;
    sound.playClick();
    haptic.light();
    if (currentBetIndex > 0) {
      onBetChange(BET_STEPS[currentBetIndex - 1]);
    }
  };

  const handleIncreaseBet = () => {
    if (isSpinning || freeSpinsRemaining > 0) return;
    sound.playClick();
    haptic.light();
    if (currentBetIndex < BET_STEPS.length - 1) {
      onBetChange(BET_STEPS[currentBetIndex + 1]);
    }
  };

  const handleDecreasePaylines = () => {
    if (isSpinning || freeSpinsRemaining > 0) return;
    sound.playClick();
    haptic.light();
    if (currentLinesIndex > 0) {
      onPaylinesChange(PAYLINE_OPTIONS[currentLinesIndex - 1]);
    }
  };

  const handleIncreasePaylines = () => {
    if (isSpinning || freeSpinsRemaining > 0) return;
    sound.playClick();
    haptic.light();
    if (currentLinesIndex < PAYLINE_OPTIONS.length - 1) {
      onPaylinesChange(PAYLINE_OPTIONS[currentLinesIndex + 1]);
    }
  };

  const handleSpinClick = () => {
    if (isSpinning || (balance < currentBet && freeSpinsRemaining === 0)) return;
    haptic.spin();
    onSpin();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (!isSpinning && (balance >= currentBet || freeSpinsRemaining > 0)) {
          handleSpinClick();
        }
      } else if ((e.key === '+' || e.key === '=' || e.code === 'ArrowUp') && !isSpinning && freeSpinsRemaining === 0) {
        e.preventDefault();
        handleIncreaseBet();
      } else if ((e.key === '-' || e.code === 'ArrowDown') && !isSpinning && freeSpinsRemaining === 0) {
        e.preventDefault();
        handleDecreaseBet();
      } else if ((e.key === 'l' || e.key === 'L') && !e.repeat && !isSpinning && freeSpinsRemaining === 0) {
        e.preventDefault();
        handleIncreasePaylines();
      } else if ((e.key === 't' || e.key === 'T') && !e.repeat) {
        e.preventDefault();
        sound.playClick();
        haptic.light();
        onToggleTurbo();
      } else if ((e.key === 'm' || e.key === 'M') && !e.repeat && !isSpinning && freeSpinsRemaining === 0) {
        e.preventDefault();
        sound.playClick();
        haptic.light();
        onMaxBet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, balance, currentBet, freeSpinsRemaining, onSpin, currentBetIndex, currentLinesIndex, turboMode]);

  return (
    <div
      id="slot-controls-panel"
      className="relative w-full px-1.5 sm:px-3 pt-2 pb-3 sm:py-1.5 bg-gradient-to-t from-black via-stone-950/98 to-black/98 border-t-2 border-amber-500/50 shrink-0 select-none shadow-[0_-12px_30px_rgba(0,0,0,0.9)] box-border overflow-visible"
    >
      {/* 1. Upper Console Bar: Lines Stepper [Left] • Win / Message [Center] • Bet Stepper [Right] */}
      <div className="w-full h-8 sm:h-9 mb-1.5 px-1 sm:px-2 rounded-xl bg-stone-900/90 border border-amber-500/40 flex items-center justify-between gap-1 shadow-inner relative">
        {/* Left: Lines Stepper */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 bg-stone-950/80 border border-amber-500/30 rounded-lg px-0.5 py-0.5">
          <button
            id="btn-lines-decrease"
            disabled={currentLinesIndex === 0 || isSpinning || freeSpinsRemaining > 0}
            onClick={handleDecreasePaylines}
            title="Reducir Líneas de Pago"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-stone-800 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-90"
          >
            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>

          <div className="text-center px-1 min-w-[36px] sm:min-w-[48px]">
            <span className="text-[6.5px] sm:text-[8px] text-amber-400 font-cinzel uppercase tracking-wider block font-bold leading-none">
              LÍNEAS
            </span>
            <span className="font-cinzel text-[11px] sm:text-sm font-black text-amber-100 block leading-none mt-0.5">
              {activePaylinesCount}
            </span>
          </div>

          <button
            id="btn-lines-increase"
            disabled={currentLinesIndex === PAYLINE_OPTIONS.length - 1 || isSpinning || freeSpinsRemaining > 0}
            onClick={handleIncreasePaylines}
            title="Aumentar Líneas de Pago"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-stone-800 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-90"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        </div>

        {/* Center: Win Readout / Status Message */}
        <div className="flex-1 text-center font-cinzel px-1 truncate min-w-0">
          {lastWin > 0 ? (
            <span className="text-amber-300 font-black text-xs sm:text-sm drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] tracking-wider animate-bounce inline-block truncate">
              ¡PREMIO: +${lastWin.toFixed(2)}!
            </span>
          ) : freeSpinsRemaining > 0 ? (
            <span className="text-amber-300 font-bold text-[10px] sm:text-xs animate-pulse inline-flex items-center justify-center gap-1 truncate">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>TIROS #{16 - freeSpinsRemaining}/15 (3X)</span>
            </span>
          ) : isSpinning ? (
            <span className="text-amber-400/90 font-bold tracking-widest text-[9px] sm:text-xs animate-pulse truncate">
              GIRANDO...
            </span>
          ) : (
            <span className="text-stone-400/90 font-bold text-[9px] sm:text-xs tracking-wider truncate">
              LISTO PARA JUGAR
            </span>
          )}
        </div>

        {/* Right: Bet Stepper */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 bg-stone-950/80 border border-amber-500/30 rounded-lg px-0.5 py-0.5">
          <button
            id="btn-bet-decrease"
            disabled={currentBetIndex === 0 || isSpinning || freeSpinsRemaining > 0}
            onClick={handleDecreaseBet}
            title="Reducir Apuesta"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-stone-800 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-90"
          >
            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>

          <div className="text-center px-1 min-w-[44px] sm:min-w-[56px]">
            <span className="text-[6.5px] sm:text-[8px] text-amber-400 font-cinzel uppercase tracking-wider block font-bold leading-none">
              APUESTA
            </span>
            <span className="font-cinzel text-[11px] sm:text-sm font-black text-amber-100 block leading-none mt-0.5">
              ${currentBet.toFixed(2)}
            </span>
          </div>

          <button
            id="btn-bet-increase"
            disabled={currentBetIndex === BET_STEPS.length - 1 || isSpinning || freeSpinsRemaining > 0}
            onClick={handleIncreaseBet}
            title="Aumentar Apuesta"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-stone-800 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors active:scale-90"
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        </div>
      </div>

      {/* 2. Main Action Deck: Perfectly Balanced 3-Column Layout */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full gap-1 sm:gap-3">
        
        {/* LEFT COLUMN: Max Bet & Auto Spin */}
        <div className="flex items-center gap-1 sm:gap-2 justify-start">
          {/* Max Bet */}
          <button
            id="btn-max-bet"
            disabled={isSpinning || freeSpinsRemaining > 0 || currentBet === BET_STEPS[BET_STEPS.length - 1]}
            onClick={() => {
              sound.playClick();
              haptic.light();
              onMaxBet();
            }}
            title="Apostar Máximo"
            className="h-10 sm:h-13 px-2 sm:px-3 rounded-xl bg-stone-900/95 border-2 border-amber-500/70 text-amber-300 hover:bg-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex flex-col items-center justify-center shadow-lg active:scale-95"
          >
            <span className="font-cinzel font-black text-[9px] sm:text-xs uppercase leading-none">
              MAX
            </span>
            <span className="text-[6.5px] sm:text-[8px] text-amber-400/80 font-mono uppercase leading-none mt-0.5 sm:mt-1 font-bold">
              BET
            </span>
          </button>

          {/* Auto Spin */}
          <div className="relative">
            {autoSpinCount > 0 ? (
              <button
                id="btn-stop-autospin"
                onClick={() => {
                  sound.playClick();
                  haptic.light();
                  onStopAutoSpin();
                }}
                title="Detener Giros Automáticos"
                className="h-10 sm:h-13 px-2 sm:px-3 rounded-xl bg-red-950/95 border-2 border-red-500 text-red-300 hover:bg-red-900 transition-colors flex items-center justify-center shadow-lg animate-pulse active:scale-95"
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-red-400" />
              </button>
            ) : (
              <button
                id="btn-autospin-menu"
                disabled={isSpinning || freeSpinsRemaining > 0}
                onClick={() => {
                  sound.playClick();
                  haptic.light();
                  setShowAutoSpinMenu(!showAutoSpinMenu);
                }}
                title="Menú de Giros Automáticos"
                className="h-10 sm:h-13 px-1.5 sm:px-3 rounded-xl bg-stone-900/95 border-2 border-amber-500/70 text-amber-300 hover:bg-amber-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex flex-col items-center justify-center shadow-lg active:scale-95"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[6px] sm:text-[7.5px] text-amber-400/80 font-mono uppercase leading-none mt-0.5 font-bold">
                  AUTO
                </span>
              </button>
            )}

            {showAutoSpinMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-stone-950/98 border-2 border-amber-500/80 rounded-xl p-2.5 shadow-2xl z-50 min-w-[130px] flex flex-col gap-1 backdrop-blur-md">
                <div className="text-[10px] font-cinzel text-amber-400 text-center uppercase tracking-wider mb-1 font-bold">
                  Giros Automáticos
                </div>
                {[10, 25, 50, 100].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setShowAutoSpinMenu(false);
                      sound.playClick();
                      haptic.light();
                      onStartAutoSpin(count);
                    }}
                    className="py-1 px-2.5 text-xs font-cinzel font-bold text-amber-200 hover:bg-amber-500/25 rounded text-center transition-colors"
                  >
                    {count} Giros
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: The Monumental, Perfectly Centered GIRAR Button */}
        <div className="flex items-center justify-center px-1 sm:px-2 relative z-20">
          <button
            id="btn-spin-action"
            disabled={isSpinning || (balance < currentBet && freeSpinsRemaining === 0)}
            onClick={handleSpinClick}
            className={`relative w-[92px] h-[92px] sm:w-[112px] sm:h-[112px] rounded-full shrink-0 flex items-center justify-center transition-all cursor-pointer ${
              isSpinning
                ? 'opacity-70 cursor-not-allowed scale-95'
                : 'hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(251,191,36,0.9),0_0_20px_rgba(217,119,6,0.9)]'
            } bg-gradient-to-tr from-amber-700 via-amber-400 to-yellow-200 border-4 sm:border-[6px] border-yellow-100 touch-manipulation`}
          >
            <div className="w-[78px] h-[78px] sm:w-[96px] sm:h-[96px] rounded-full bg-gradient-to-b from-[#1c0f04] via-[#2a1705] to-[#3a2007] border-2 border-amber-400/90 flex flex-col items-center justify-center shadow-inner">
              <span className="font-cinzel font-black text-xl sm:text-2xl text-yellow-300 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider">
                GIRAR
              </span>
              <span className="text-[9px] sm:text-xs text-amber-400 font-mono uppercase tracking-widest leading-none mt-1 font-bold">
                SPIN
              </span>
            </div>
          </button>
        </div>

        {/* RIGHT COLUMN: Turbo, Paytable & Settings */}
        <div className="flex items-center gap-1 sm:gap-1.5 justify-end">
          {/* Turbo Toggle */}
          <button
            id="btn-toggle-turbo"
            onClick={() => {
              sound.playClick();
              haptic.light();
              onToggleTurbo();
            }}
            title={turboMode ? 'Desactivar Turbo' : 'Activar Turbo'}
            className={`h-10 sm:h-13 px-1.5 sm:px-2.5 rounded-xl border-2 flex flex-col items-center justify-center transition-colors shadow-lg active:scale-95 ${
              turboMode
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                : 'bg-stone-900/95 border-amber-500/50 text-stone-400 hover:text-amber-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${turboMode ? 'text-amber-400 fill-amber-400 animate-bounce' : ''}`} />
            <span className="text-[6px] sm:text-[7.5px] text-amber-400/80 font-mono uppercase leading-none mt-0.5 font-bold">
              TURBO
            </span>
          </button>

          {/* Pay Reference Modal Button */}
          <button
            id="btn-pay-reference"
            onClick={() => {
              sound.playClick();
              haptic.light();
              setShowPayRefModal(true);
            }}
            title="Referencias de Pagos"
            className="h-10 sm:h-13 px-1.5 sm:px-2.5 rounded-xl bg-stone-900/95 border-2 border-amber-500/70 text-amber-300 hover:bg-amber-900/40 transition-colors flex flex-col items-center justify-center shadow-lg active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="text-[6px] sm:text-[7.5px] text-amber-400/80 font-mono uppercase leading-none mt-0.5 font-bold">
              INFO
            </span>
          </button>

          {/* Settings / Config Button */}
          <div className="relative">
            <button
              id="btn-bottom-config"
              onClick={() => {
                sound.playClick();
                haptic.light();
                setShowSettingsMenu((prev) => !prev);
              }}
              title="Ajustes de Juego"
              className="h-10 sm:h-13 px-1.5 sm:px-2.5 rounded-xl bg-amber-600/30 border-2 border-amber-400 text-amber-200 hover:bg-amber-600/50 transition-colors flex flex-col items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.6)] active:scale-95"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-spin-slow" />
              <span className="text-[6px] sm:text-[7.5px] text-amber-200/90 font-mono uppercase leading-none mt-0.5 font-bold">
                AJUST
              </span>
            </button>

            {showSettingsMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-stone-950/98 border-2 border-amber-500/80 rounded-2xl p-3 shadow-2xl z-50 min-w-[200px] flex flex-col gap-2 backdrop-blur-md">
                <div className="text-xs font-cinzel text-amber-400 text-center uppercase tracking-widest font-bold border-b border-amber-500/30 pb-1.5">
                  Ajustes de Máquina
                </div>

                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    onToggleSound();
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-cinzel text-amber-200"
                >
                  <span>Efectos de Sonido</span>
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                </button>

                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    onToggleMusic();
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-cinzel text-amber-200"
                >
                  <span>Música Egipcia</span>
                  {musicEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                </button>

                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    onOpenPaytable();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-cinzel text-amber-200"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Tabla de Pagos</span>
                </button>

                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    onOpenDashboard();
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-cinzel text-amber-200"
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Estadísticas & RTP</span>
                </button>

                <button
                  id="btn-settings-perf-mode"
                  onClick={handleCyclePerfMode}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-cinzel text-amber-200 border border-stone-800"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Rendimiento</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {perfMode === 'auto' ? 'Auto (Móvil)' : perfMode === 'eco' ? 'Ultra Fluido' : 'Alta Calidad'}
                  </span>
                </button>

                {onOpenCelebrations && (
                  <button
                    id="btn-settings-celebrations"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onOpenCelebrations();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-amber-600/30 hover:from-amber-600/50 hover:to-yellow-600/50 text-xs font-cinzel text-yellow-300 border border-yellow-500/40"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span>Celebraciones (V1, V2, V3)</span>
                  </button>
                )}

                {onShowLoadingScreen && (
                  <button
                    id="btn-settings-loading-screen"
                    onClick={() => {
                      setShowSettingsMenu(false);
                      onShowLoadingScreen();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-sky-950/70 hover:bg-sky-900/80 text-xs font-cinzel text-sky-200 border border-sky-500/40"
                  >
                    <RotateCcw className="w-4 h-4 text-sky-400" />
                    <span>Ver Pantalla de Carga</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Pay Reference Modal */}
      {showPayRefModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#2a1806] via-stone-950 to-[#120701] border-2 border-amber-500/80 rounded-2xl p-4 shadow-[0_0_30px_rgba(251,191,36,0.5)] text-amber-100">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2 mb-3">
              <h3 className="font-cinzel text-base font-black text-gold-metallic tracking-wider">
                📜 REFERENCIA DE PAGOS • CLEOPATRA GOLD
              </h3>
              <button
                onClick={() => setShowPayRefModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 border border-amber-500/40 text-amber-300 hover:bg-stone-700 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
              <div className="text-[11px] text-amber-200/90 font-cinzel mb-2">
                Los pagos se multiplican por la apuesta por línea (Apuesta Total / {activePaylinesCount}). Las combinaciones pagan de izquierda a derecha.
              </div>

              {Object.values(SYMBOLS).map((sym) => (
                <div key={sym.id} className="flex items-center justify-between p-2 rounded-xl bg-stone-900/90 border border-amber-500/20">
                  <div className="flex items-center gap-2.5">
                    <img src={sym.image} alt={sym.name} className="w-10 h-10 rounded-lg object-cover border border-amber-400/40 shadow" referrerPolicy="no-referrer" />
                    <div>
                      <div className="font-cinzel font-bold text-xs text-amber-300">{sym.name}</div>
                      <div className="text-[9px] text-amber-400/70">Premio Multiplicador por Línea</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-yellow-300">
                    <div>5x: {sym.payouts[5]}x</div>
                    <div className="text-[10px] text-amber-400/70">4x: {sym.payouts[4]}x | 3x: {sym.payouts[3]}x</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPayRefModal(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-cinzel font-black text-sm tracking-wider shadow-lg"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
