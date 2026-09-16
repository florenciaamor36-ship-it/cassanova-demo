import React from 'react';
import { SYMBOLS } from '../data/slotConfig';
import { SymbolId, WinResult, GameHistoryItem, GameStats } from '../types';
import { Sparkles, TrendingUp, Zap, Keyboard, Award } from 'lucide-react';

interface DesktopLeftWingProps {
  currentBet: number;
  activeWins: WinResult[];
}

export const DesktopLeftWing: React.FC<DesktopLeftWingProps> = ({ currentBet, activeWins }) => {
  const lineBet = currentBet / 20;
  const activeWinSymbolIds = new Set(activeWins.map((w) => w.symbolId));

  const spotlightSymbols: SymbolId[] = ['PHARAOH', 'CHEST', 'LOTUS', 'SCARAB', 'EYE', 'ANUBIS'];

  return (
    <aside
      id="desktop-left-wing"
      className="hidden xl:flex flex-col w-56 p-3 rounded-2xl bg-stone-950/85 border border-amber-500/30 backdrop-blur-sm shadow-2xl shrink-0 self-center max-h-[580px] overflow-hidden"
    >
      <div className="flex items-center gap-1.5 pb-2 border-b border-amber-500/30 mb-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h3 className="font-cinzel text-xs font-bold text-amber-200 tracking-wider uppercase">
          Premios en Vivo
        </h3>
      </div>

      <div className="text-[9px] text-amber-400/70 font-mono mb-2 flex justify-between">
        <span>Línea: ${lineBet.toFixed(2)}</span>
        <span className="text-amber-300">Apuesta: ${currentBet.toFixed(2)}</span>
      </div>

      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-0.5 custom-scrollbar">
        {spotlightSymbols.map((id) => {
          const sym = SYMBOLS[id];
          if (!sym) return null;
          const isWinning = activeWinSymbolIds.has(id);

          const win5 = (sym.payouts[5] || 0) * lineBet;
          const win4 = (sym.payouts[4] || 0) * lineBet;

          return (
            <div
              key={id}
              className={`p-1.5 rounded-lg border transition-all ${
                isWinning
                  ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-[1.02]'
                  : 'bg-stone-900/60 border-amber-500/15 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={sym.image}
                  alt={sym.name}
                  className="w-7 h-7 rounded object-cover border border-amber-400/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-cinzel text-[10px] font-bold text-amber-100 truncate">
                    {sym.name}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                    <span className="text-stone-400">5x: <strong className="text-amber-300">${win5.toFixed(2)}</strong></span>
                    <span className="text-stone-400">4x: <strong className="text-amber-200">${win4.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2 border-t border-amber-500/20 text-[8px] font-cinzel text-amber-300/80 space-y-1">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
          <span>Cleopatra (Wild) duplica premios 2X</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
          <span>Tiros Gratis multiplican 3X</span>
        </div>
      </div>
    </aside>
  );
};

interface DesktopRightWingProps {
  stats: GameStats;
  history: GameHistoryItem[];
}

export const DesktopRightWing: React.FC<DesktopRightWingProps> = ({ stats, history }) => {
  const lastFive = history.slice(0, 5);

  return (
    <aside
      id="desktop-right-wing"
      className="hidden xl:flex flex-col w-56 p-3 rounded-2xl bg-stone-950/85 border border-amber-500/30 backdrop-blur-sm shadow-2xl shrink-0 self-center max-h-[580px] overflow-hidden"
    >
      <div className="flex items-center gap-1.5 pb-2 border-b border-amber-500/30 mb-2">
        <TrendingUp className="w-4 h-4 text-amber-400" />
        <h3 className="font-cinzel text-xs font-bold text-amber-200 tracking-wider uppercase">
          Estadísticas & Suerte
        </h3>
      </div>

      {/* RTP & Luck Gauge */}
      <div className="p-2 rounded-xl bg-stone-900/80 border border-amber-500/20 mb-2.5">
        <div className="flex justify-between text-[9px] font-cinzel text-amber-300 mb-1">
          <span>RTP de Sesión</span>
          <span className="font-mono font-bold">{stats.currentRtp}%</span>
        </div>
        <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(10, (stats.currentRtp / 150) * 100))}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-2 pt-1.5 border-t border-stone-800 text-[9px]">
          <div>
            <span className="text-stone-400 block font-cinzel">Giros:</span>
            <span className="font-mono font-bold text-amber-200">{stats.totalSpins}</span>
          </div>
          <div>
            <span className="text-stone-400 block font-cinzel">Mayor Premio:</span>
            <span className="font-mono font-bold text-yellow-300">${stats.biggestWin.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Recent Spins Mini-Feed */}
      <div className="font-cinzel text-[10px] text-amber-400/80 font-bold mb-1 flex items-center justify-between">
        <span>Últimos Giros</span>
        <Award className="w-3 h-3 text-amber-400" />
      </div>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-0.5 custom-scrollbar">
        {lastFive.length === 0 ? (
          <div className="text-[10px] text-stone-500 italic py-4 text-center">
            Presiona Girar para iniciar
          </div>
        ) : (
          lastFive.map((item) => (
            <div
              key={item.id}
              className="p-1.5 rounded-lg bg-stone-900/60 border border-amber-500/15 flex items-center justify-between text-[9px]"
            >
              <div className="flex items-center gap-1">
                {item.freeSpinsTriggered ? (
                  <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[8px] font-bold">
                    15 FS
                  </span>
                ) : item.totalWin > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-600" />
                )}
                <span className="font-cinzel text-stone-300">
                  {item.totalWin > 0 ? 'Premio' : 'Giro'}
                </span>
              </div>
              <span
                className={`font-mono font-bold ${
                  item.totalWin > 0 ? 'text-yellow-300' : 'text-stone-500'
                }`}
              >
                {item.totalWin > 0 ? `+$${item.totalWin.toFixed(2)}` : `-$${item.bet.toFixed(2)}`}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Quick Keyboard shortcuts hint */}
      <div className="mt-2 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[8px] font-cinzel text-stone-400">
        <div className="flex items-center gap-1">
          <Keyboard className="w-3 h-3 text-amber-400" />
          <span>Espacio = Girar</span>
        </div>
        <span>+/- = Apuesta</span>
      </div>
    </aside>
  );
};
