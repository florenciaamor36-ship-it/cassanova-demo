import React, { useState } from 'react';
import { X, Shield, Moon, Gift, Sparkles, Crown, Zap, Coins, Info } from 'lucide-react';
import { SYMBOLS, PAYLINES, SymbolDef } from '../data/gameData';
import { SymbolRenderer } from './SymbolRenderer';
import { AudioEngine } from '../utils/AudioController';

interface PaytableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'specials' | 'high' | 'low' | 'paylines';

export const PaytableModal: React.FC<PaytableModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('specials');
  const [selectedPayline, setSelectedPayline] = useState<number | null>(null);

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'specials', label: 'ESPECIALES', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'high', label: 'PAGOS ALTOS', icon: <Crown className="w-4 h-4 text-yellow-400" /> },
    { id: 'low', label: 'REALEZA GÓTICA', icon: <Shield className="w-4 h-4 text-purple-400" /> },
    { id: 'paylines', label: '20 LÍNEAS', icon: <Zap className="w-4 h-4 text-red-400" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md transition-opacity duration-300">
      {/* Outer Gothic Gold & Ruby Baroque Frame */}
      <div 
        id="paytable-modal-container"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1c0303] via-[#0d0101] to-[#040000] border-3 border-amber-500/80 shadow-[0_0_80px_rgba(245,158,11,0.4),0_0_30px_rgba(220,38,38,0.5)] rounded-3xl p-5 sm:p-7 text-neutral-200"
      >
        {/* Corner Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400/80 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400/80 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400/80 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400/80 rounded-br-lg pointer-events-none" />

        {/* Top Header Banner */}
        <div className="relative w-full py-6 px-4 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.4)] mb-5 bg-gradient-to-r from-[#2a0404] via-[#450a0a] to-[#2a0404] flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-xs font-black tracking-widest text-amber-300 uppercase font-cinzel">
              COVENANT OF BLOOD
            </span>
            <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-300 to-amber-500 font-cinzel-dec filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            TABLA DE PAGOS Y REGLAS
          </h2>
          <p className="text-[11px] sm:text-xs text-amber-200/80 font-cinzel tracking-wider uppercase mt-1">
            20 LÍNEAS DE PREMIO SAGRADAS • RTP 96.50%
          </p>

          {/* Close button inside header corner */}
          <button 
            onClick={() => {
              AudioEngine.playClick();
              onClose();
            }}
            className="absolute top-3 right-3 p-1.5 border border-amber-500/70 hover:border-yellow-300 hover:text-white text-amber-300 rounded-full bg-black/80 shadow-lg transition-all hover:scale-110 active:scale-95 z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Pragmatic Play Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  AudioEngine.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase border transition-all duration-200 shadow-md ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black border-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-102'
                    : 'bg-[#150202] hover:bg-[#250505] text-amber-200/80 border-amber-900/80 hover:border-amber-600/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: SÍMBOLOS ESPECIALES */}
        {activeTab === 'specials' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WILD Colmillos */}
              <div className="relative group overflow-hidden rounded-2xl border-2 border-red-500/70 bg-gradient-to-b from-[#2b0404] via-[#140202] to-[#080000] p-5 shadow-[0_0_25px_rgba(239,68,68,0.3)] hover:shadow-[0_0_35px_rgba(239,68,68,0.6)] hover:border-red-400 transition-all flex flex-col items-center text-center">
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-red-600 text-white shadow">
                  WILD
                </div>
                <div className="w-20 h-20 mb-3 filter drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">
                  <SymbolRenderer symbolId="wild_fangs" />
                </div>
                <h4 className="text-lg font-black font-cinzel text-amber-200">COLMILLOS SAGRADOS</h4>
                <p className="text-xs text-neutral-300 my-2 leading-relaxed">
                  Sustituye a cualquier símbolo regular excepto SCATTER y BONUS para completar combinaciones ganadoras máximas.
                </p>
                <div className="w-full mt-auto pt-3 border-t border-red-900/60 space-y-1.5">
                  <div className="flex justify-between items-center px-3 py-1 rounded bg-black/40 text-xs font-bold font-cinzel">
                    <span className="text-amber-400">5 Símbolos:</span>
                    <span className="text-yellow-300 text-sm">5,000x</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1 rounded bg-black/40 text-xs font-bold font-cinzel">
                    <span className="text-neutral-300">4 Símbolos:</span>
                    <span className="text-amber-400">800x</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1 rounded bg-black/40 text-xs font-bold font-cinzel">
                    <span className="text-neutral-400">3 Símbolos:</span>
                    <span className="text-amber-400">200x</span>
                  </div>
                </div>
              </div>

              {/* SCATTER Luna */}
              <div className="relative group overflow-hidden rounded-2xl border-2 border-purple-500/70 bg-gradient-to-b from-[#24032a] via-[#100114] to-[#080000] p-5 shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] hover:border-purple-400 transition-all flex flex-col items-center text-center">
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-purple-600 text-white shadow">
                  SCATTER
                </div>
                <div className="w-20 h-20 mb-3 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
                  <SymbolRenderer symbolId="scatter_moon" />
                </div>
                <h4 className="text-lg font-black font-cinzel text-purple-200">LUNA DE SANGRE</h4>
                <p className="text-xs text-neutral-300 my-2 leading-relaxed">
                  Paga en cualquier posición. 3 o más símbolos otorgan <strong className="text-pink-400">10 TIROS GRATIS</strong> con multiplicador global activado.
                </p>
                <div className="w-full mt-auto pt-3 border-t border-purple-900/60 space-y-1.5">
                  <div className="flex justify-between items-center px-3 py-1 rounded bg-black/40 text-xs font-bold font-cinzel">
                    <span className="text-purple-300">5 Símbolos:</span>
                    <span className="text-yellow-300 text-sm">50x Apuesta Total</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1 rounded bg-black/40 text-xs font-bold font-cinzel">
                    <span className="text-purple-300">4 Símbolos:</span>
                    <span className="text-pink-300">10x Apuesta Total</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1 rounded bg-black/40 text-xs font-bold font-cinzel">
                    <span className="text-purple-300">3 Símbolos:</span>
                    <span className="text-pink-300">2x Apuesta Total</span>
                  </div>
                </div>
              </div>

              {/* BONUS Ataúd */}
              <div className="relative group overflow-hidden rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-b from-[#032616] via-[#01120a] to-[#080000] p-5 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:border-emerald-400 transition-all flex flex-col items-center text-center">
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-600 text-white shadow">
                  BONUS
                </div>
                <div className="w-20 h-20 mb-3 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                  <SymbolRenderer symbolId="bonus_coffin" />
                </div>
                <h4 className="text-lg font-black font-cinzel text-emerald-200">ATAÚD ANCESTRAL</h4>
                <p className="text-xs text-neutral-300 my-2 leading-relaxed">
                  3 o más ataúdes en cualquier carrete activan el <strong className="text-emerald-400">Mini-Juego de Criptas</strong> con premios en efectivo directo.
                </p>
                <div className="w-full mt-auto pt-3 border-t border-emerald-900/60 text-center">
                  <div className="px-3 py-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-xs font-black font-cinzel text-emerald-300 uppercase">
                    ¡ACTIVA EL JUEGO DE CRIPTAS!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SÍMBOLOS ALTOS Y MEDIOS */}
        {activeTab === 'high' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYMBOLS.filter(s => s.type === 'high' || s.type === 'mid').map((sym) => (
              <div 
                key={sym.id} 
                className="relative overflow-hidden rounded-2xl border-2 border-amber-600/60 bg-gradient-to-b from-[#220404] via-[#100101] to-[#060000] p-4 shadow-lg hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 mb-2">
                  <SymbolRenderer symbolId={sym.id} />
                </div>
                <h4 className="text-base font-black font-cinzel text-amber-200 mb-1">{sym.displayName}</h4>
                <p className="text-[11px] text-neutral-400 italic mb-3">{sym.description}</p>
                
                <div className="w-full mt-auto pt-2 border-t border-amber-950 space-y-1">
                  {sym.payouts[5] && (
                    <div className="flex justify-between items-center px-2.5 py-1 rounded bg-black/50 text-xs font-bold font-cinzel">
                      <span className="text-amber-400 flex items-center gap-1">🥇 5x:</span>
                      <span className="text-yellow-300 font-black">{sym.payouts[5]}x</span>
                    </div>
                  )}
                  {sym.payouts[4] && (
                    <div className="flex justify-between items-center px-2.5 py-1 rounded bg-black/50 text-xs font-bold font-cinzel">
                      <span className="text-neutral-300 flex items-center gap-1">🥈 4x:</span>
                      <span className="text-amber-300">{sym.payouts[4]}x</span>
                    </div>
                  )}
                  {sym.payouts[3] && (
                    <div className="flex justify-between items-center px-2.5 py-1 rounded bg-black/50 text-xs font-bold font-cinzel">
                      <span className="text-amber-600 flex items-center gap-1">🥉 3x:</span>
                      <span className="text-amber-400">{sym.payouts[3]}x</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: REALEZA GÓTICA (BAJOS) */}
        {activeTab === 'low' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SYMBOLS.filter(s => s.type === 'low').map((sym) => (
              <div 
                key={sym.id} 
                className="relative overflow-hidden rounded-2xl border border-amber-700/50 bg-gradient-to-b from-[#180303] via-[#0c0101] to-[#040000] p-4 shadow-md hover:border-amber-400 transition-all flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 mb-2">
                  <SymbolRenderer symbolId={sym.id} />
                </div>
                <h4 className="text-sm font-black font-cinzel text-amber-200 mb-1">{sym.displayName}</h4>
                <div className="w-full mt-auto pt-2 border-t border-amber-950/80 space-y-1">
                  {sym.payouts[5] && (
                    <div className="flex justify-between items-center px-2 py-0.5 rounded bg-black/40 text-[11px] font-bold font-cinzel">
                      <span className="text-yellow-400">5x:</span>
                      <span className="text-yellow-300">{sym.payouts[5]}x</span>
                    </div>
                  )}
                  {sym.payouts[4] && (
                    <div className="flex justify-between items-center px-2 py-0.5 rounded bg-black/40 text-[11px] font-bold font-cinzel">
                      <span className="text-neutral-300">4x:</span>
                      <span className="text-neutral-200">{sym.payouts[4]}x</span>
                    </div>
                  )}
                  {sym.payouts[3] && (
                    <div className="flex justify-between items-center px-2 py-0.5 rounded bg-black/40 text-[11px] font-bold font-cinzel">
                      <span className="text-amber-600">3x:</span>
                      <span className="text-neutral-300">{sym.payouts[3]}x</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: 20 LÍNEAS DE PAGO INTERACTIVAS */}
        {activeTab === 'paylines' && (
          <div className="space-y-4">
            <div className="p-3 bg-black/40 border border-amber-500/40 rounded-xl text-center">
              <p className="text-xs text-amber-200 font-cinzel">
                Toca cualquier miniatura para inspeccionar la trayectoria exacta de las 20 líneas sagradas. Los premios se pagan de izquierda a derecha en rodillos consecutivos.
              </p>
            </div>

            {/* Grid of 20 Paylines */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {PAYLINES.map((line) => {
                const isSelected = selectedPayline === line.id;
                return (
                  <button
                    key={line.id}
                    onClick={() => setSelectedPayline(line.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center transition-all ${
                      isSelected
                        ? 'border-yellow-400 bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105'
                        : 'border-neutral-800 bg-neutral-950/60 hover:border-amber-500/60 hover:bg-[#1a0202]'
                    }`}
                  >
                    <span className="text-[10px] font-bold font-cinzel text-neutral-300 mb-1">
                      Línea {line.id}
                    </span>
                    {/* Mini 5x3 Grid */}
                    <div className="grid grid-cols-5 gap-0.5 w-12 h-7 bg-black/90 p-0.5 rounded border border-neutral-800">
                      {[0, 1, 2].map((row) =>
                        [0, 1, 2, 3, 4].map((col) => {
                          const isActiveCell = line.coords[col] === row;
                          return (
                            <div
                              key={`${col}-${row}`}
                              className={`w-full h-full rounded-xs transition-colors ${
                                isActiveCell ? 'bg-red-500 shadow-[0_0_4px_#ef4444]' : 'bg-neutral-900'
                              }`}
                            />
                          );
                        })
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payline Detailed Inspector */}
            {selectedPayline && (() => {
              const line = PAYLINES.find(p => p.id === selectedPayline);
              if (!line) return null;
              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/70 via-black to-red-950/70 border-2 border-red-500/70 text-center shadow-lg animate-fadeIn">
                  <div className="text-base font-black font-cinzel text-amber-300 mb-1">
                    {line.name} — Coordenadas de los Rodillos
                  </div>
                  <p className="text-xs text-neutral-300 mb-3">
                    {line.coords.map((row, col) => `R${col + 1}: Fila ${row + 1}`).join(' ➔ ')}
                  </p>
                  {/* Large 5x3 Visual Display */}
                  <div className="inline-grid grid-cols-5 gap-2 p-3 bg-neutral-950 border border-amber-600/60 rounded-xl shadow-inner">
                    {[0, 1, 2].map((row) =>
                      [0, 1, 2, 3, 4].map((col) => {
                        const isHit = line.coords[col] === row;
                        return (
                          <div
                            key={`large-${col}-${row}`}
                            className={`w-10 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-cinzel transition-all ${
                              isHit
                                ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_0_12px_#ef4444] border border-yellow-300 scale-105'
                                : 'bg-neutral-900/60 border border-neutral-800 text-neutral-600'
                            }`}
                          >
                            {isHit ? `C${col+1}` : ''}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Footer Explanations */}
        <div className="mt-6 pt-4 border-t border-amber-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs text-amber-200/70">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Fórmula: Ganancia = Multiplicador x (Apuesta Total ÷ 20 Líneas). RTP Teórico: 96.50%</span>
          </div>

          <button
            onClick={() => {
              AudioEngine.playClick();
              onClose();
            }}
            className="px-8 py-2.5 font-cinzel font-black tracking-wider text-xs uppercase text-amber-200 rounded-xl border border-amber-500/70 bg-gradient-to-r from-red-950 via-red-900 to-red-950 hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-300"
          >
            VOLVER AL JUEGO
          </button>
        </div>
      </div>
    </div>
  );
};
export default PaytableModal;
