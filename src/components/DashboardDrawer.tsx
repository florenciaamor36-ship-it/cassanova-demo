import React, { useState } from 'react';
import { X, TrendingUp, DollarSign, Award, RotateCcw, PlusCircle, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { GameHistoryItem, GameStats } from '../types';
import { sound } from '../services/soundEngine';

interface DashboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  stats: GameStats;
  history: GameHistoryItem[];
  onAddFunds: (amount: number) => void;
  onResetStats: () => void;
}

export const DashboardDrawer: React.FC<DashboardDrawerProps> = ({
  isOpen,
  onClose,
  balance,
  stats,
  history,
  onAddFunds,
  onResetStats,
}) => {
  const [filter, setFilter] = useState<'all' | 'wins' | 'bonus'>('all');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filter === 'wins') return item.totalWin > 0;
    if (filter === 'bonus') return item.freeSpinsTriggered || item.isFreeSpinsRound;
    return true;
  });

  return (
    <div
      id="dashboard-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl h-full flex flex-col bg-gradient-to-b from-stone-900 via-stone-950 to-black border-l border-amber-500/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-amber-500/30 flex items-center justify-between bg-stone-900/80">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-gold-metallic">
              PANEL DE CONTROL & HISTORIAL
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Balance & Quick Top-Up Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-stone-900/80 border border-amber-500/40 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase font-cinzel text-amber-400/80">
                  Saldo Disponible
                </span>
                <div className="font-cinzel text-2xl sm:text-3xl font-bold text-amber-100">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40">
                <DollarSign className="w-6 h-6 text-amber-300" />
              </div>
            </div>

            {/* Quick Recharge Chips */}
            <div>
              <div className="text-[10px] font-cinzel text-amber-300/70 uppercase mb-1.5">
                Cargar Pesos al Saldo ($):
              </div>
              <div className="flex flex-wrap gap-2">
                {[100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      sound.playClick();
                      onAddFunds(amt);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3 h-3" />
                    +${amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Session Statistics KPIs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-cinzel font-bold text-xs uppercase text-amber-400 tracking-wider">
                Rendimiento de la Sesión
              </h3>
              <button
                onClick={() => {
                  sound.playClick();
                  onResetStats();
                }}
                className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reiniciar Métricas
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Total Spins */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-mono">Tiros Totales</div>
                <div className="font-cinzel text-lg font-bold text-amber-200">
                  {stats.totalSpins}
                </div>
              </div>

              {/* Total Bet */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-mono">Total Apostado</div>
                <div className="font-cinzel text-lg font-bold text-stone-200">
                  ${stats.totalBet.toFixed(2)}
                </div>
              </div>

              {/* Total Won */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-mono">Total Pagado</div>
                <div className="font-cinzel text-lg font-bold text-amber-400">
                  ${stats.totalWon.toFixed(2)}
                </div>
              </div>

              {/* Net Profit */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-mono">Beneficio Neto</div>
                <div
                  className={`font-cinzel text-lg font-bold flex items-center gap-0.5 ${
                    stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {stats.netProfit >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  ${Math.abs(stats.netProfit).toFixed(2)}
                </div>
              </div>

              {/* Session RTP */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-mono">RTP Sesión</div>
                <div className="font-cinzel text-lg font-bold text-sky-400">
                  {stats.totalBet > 0 ? stats.currentRtp.toFixed(1) : '96.5'}%
                </div>
              </div>

              {/* Biggest Win */}
              <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-mono">Mayor Premio</div>
                <div className="font-cinzel text-lg font-bold text-amber-300">
                  ${stats.biggestWin.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Game History List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-cinzel font-bold text-xs uppercase text-amber-400 tracking-wider">
                Historial de Giros ({history.length})
              </h3>
              <div className="flex rounded-lg bg-stone-900 p-0.5 border border-stone-800">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                    filter === 'all'
                      ? 'bg-amber-500/20 text-amber-200 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('wins')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                    filter === 'wins'
                      ? 'bg-amber-500/20 text-amber-200 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Premios
                </button>
                <button
                  onClick={() => setFilter('bonus')}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                    filter === 'bonus'
                      ? 'bg-amber-500/20 text-amber-200 font-bold'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Bonus
                </button>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/40 rounded-xl border border-stone-800 text-stone-500 text-xs">
                No hay giros registrados todavía. ¡Haz girar los rodillos!
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredHistory.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      item.freeSpinsTriggered
                        ? 'bg-sky-950/30 border-sky-500/40'
                        : item.totalWin > 0
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-stone-900/60 border-stone-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono text-stone-500 min-w-[24px]">
                        #{history.length - idx}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-cinzel text-xs font-bold text-amber-100">
                            {item.isFreeSpinsRound
                              ? 'Tiro Gratis (3X)'
                              : `Apuesta $${item.bet.toFixed(2)}`}
                          </span>
                          {item.freeSpinsTriggered && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> 15 TIROS
                            </span>
                          )}
                          {item.winCount > 1 && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
                              {item.winCount} líneas
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {item.totalWin > 0 ? (
                        <div className="font-cinzel font-bold text-xs sm:text-sm text-emerald-400">
                          +${item.totalWin.toFixed(2)}
                        </div>
                      ) : (
                        <div className="font-mono text-xs text-stone-500">-$0.00</div>
                      )}
                      <div
                        className={`text-[9px] font-mono ${
                          item.net >= 0 ? 'text-emerald-500' : 'text-stone-500'
                        }`}
                      >
                        Neto: {item.net >= 0 ? `+$${item.net.toFixed(2)}` : `-$${Math.abs(item.net).toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-amber-500/30 bg-stone-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gold px-5 py-2 rounded-xl text-xs uppercase tracking-wider"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
