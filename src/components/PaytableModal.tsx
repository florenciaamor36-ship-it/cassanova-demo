import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Zap, Trophy, Coins, Flame, Star, PlayCircle } from 'lucide-react';
import { SYMBOLS, PAYLINES } from '../data/slotConfig';
import { SymbolId } from '../types';
import { CelebrationType } from './WinCelebrationModal';

import queenImg from '../assets/images/cleopatra_queen_portrait_1789481906325.jpg';
import pyramidImg from '../assets/images/cleopatra_pyramid_scatter_1789481922355.jpg';
import chestImg from '../assets/images/egyptian_treasure_chest_1789483982786.jpg';
import jackpotImg from '../assets/images/golden_jackpot_banner_1789483995548.jpg';
import scarabImg from '../assets/images/cleopatra_gold_scarab_1789481954310.jpg';

interface PaytableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewPayline: (lineId: number | null) => void;
  currentBet?: number;
  onTestCelebration?: (type: CelebrationType, amount: number) => void;
}

export const PaytableModal: React.FC<PaytableModalProps> = ({
  isOpen,
  onClose,
  onPreviewPayline,
  currentBet = 20,
  onTestCelebration,
}) => {
  const [activeTab, setActiveTab] = useState<'symbols' | 'paylines' | 'celebrations' | 'rules'>('symbols');

  if (!isOpen) return null;

  return (
    <div
      id="modal-paytable"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-500/60 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/30 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-lg sm:text-xl font-bold text-gold-metallic">
              TABLA DE PAGOS Y REGLAS CLEOPATRA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-amber-500/20 px-6 bg-stone-950/80">
          <button
            onClick={() => setActiveTab('symbols')}
            className={`px-4 py-3 font-cinzel text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'symbols'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-amber-200'
            }`}
          >
            Símbolos y Premios
          </button>
          <button
            onClick={() => setActiveTab('paylines')}
            className={`px-4 py-3 font-cinzel text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'paylines'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-amber-200'
            }`}
          >
            20 Líneas de Pago
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-3 font-cinzel text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-amber-200'
            }`}
          >
            Reglas del Juego y RNG
          </button>
          <button
            onClick={() => setActiveTab('celebrations')}
            className={`px-4 py-3 font-cinzel text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'celebrations'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-amber-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Premios Canvas
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'symbols' && (
            <div className="space-y-6">
              {/* Special Feature Highlights: Wild & Scatter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cleopatra Wild Box */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-stone-900 border border-amber-400/50 flex gap-4 items-center">
                  <img
                    src={SYMBOLS.WILD.image}
                    alt="Cleopatra Wild"
                    className="w-20 h-20 rounded-xl object-cover border border-amber-300 shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel font-bold text-amber-200 text-base">
                        CLEOPATRA REAL
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-400/40">
                        WILD 2X
                      </span>
                    </div>
                    <p className="text-xs text-amber-100/70 mt-1">
                      Sustituye a cualquier símbolo (excepto Scatter) y <strong>DUPLICA (2X)</strong> las ganancias en las líneas donde participa.
                    </p>
                    <div className="text-xs text-amber-400 font-mono font-bold mt-2">
                      5x = 10,000x • 4x = 2,000x • 3x = 200x • 2x = 10x
                    </div>
                  </div>
                </div>

                {/* Pyramid Scatter Box */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-sky-900/20 to-stone-900 border border-sky-400/50 flex gap-4 items-center">
                  <img
                    src={SYMBOLS.SCATTER.image}
                    alt="Pirámide Scatter"
                    className="w-20 h-20 rounded-xl object-cover border border-sky-300 shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cinzel font-bold text-sky-200 text-base">
                        PIRÁMIDE DE GUIZA
                      </span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold border border-sky-400/40">
                        SCATTER
                      </span>
                    </div>
                    <p className="text-xs text-sky-100/70 mt-1">
                      3 o más en cualquier posición activan <strong>15 TIROS GRATIS</strong> donde todas las ganancias se <strong>TRIPLICAN (3X)</strong>.
                    </p>
                    <div className="text-xs text-sky-300 font-mono font-bold mt-2">
                      5x = 100x • 4x = 20x • 3x = 5x • 2x = 2x Apuesta Total
                    </div>
                  </div>
                </div>
              </div>

              {/* Regular Symbols Grid */}
              <div>
                <h3 className="font-cinzel font-bold text-amber-300 text-sm mb-3 uppercase tracking-wider">
                  Símbolos Sagrados y Realeza (Multiplicadores de Línea)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(
                    [
                      'PHARAOH',
                      'SCARAB',
                      'CHEST',
                      'LOTUS',
                      'EYE',
                      'ANUBIS',
                      'SCEPTER',
                      'BASTET',
                      'COBRA',
                      'ANKH',
                    ] as SymbolId[]
                  ).map((id) => {
                    const item = SYMBOLS[id];
                    if (!item) return null;
                    return (
                      <div
                        key={id}
                        className="p-3 rounded-xl bg-stone-900/80 border border-amber-500/20 hover:border-amber-400/50 transition-colors flex flex-col items-center text-center"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover mb-2 border border-amber-500/30 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div className="font-cinzel font-bold text-xs text-amber-100 leading-tight">
                          {item.name}
                        </div>
                        {item.subtitle && (
                          <div className="text-[9px] font-cinzel text-amber-400/70 tracking-wide mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                        <div className="text-[11px] font-mono text-amber-400/80 mt-1 space-y-0.5">
                          <div>5 = {item.payouts[5]}x</div>
                          <div>4 = {item.payouts[4]}x</div>
                          <div>3 = {item.payouts[3]}x</div>
                          {item.payouts[2] && <div>2 = {item.payouts[2]}x</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paylines' && (
            <div>
              <p className="text-xs text-stone-300 mb-4">
                La tragamonedas Cleopatra cuenta con <strong>20 líneas de pago fijas</strong>. Las combinaciones pagan de izquierda a derecha en carretes adyacentes. Pasa el cursor sobre cualquier línea para ver su trayectoria exacta sobre los rodillos.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {PAYLINES.map((line) => (
                  <button
                    key={line.id}
                    onMouseEnter={() => onPreviewPayline(line.id)}
                    onMouseLeave={() => onPreviewPayline(null)}
                    className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-500/30 hover:border-amber-400 hover:bg-stone-800 transition-all flex flex-col items-center text-center group"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: line.color }}
                      />
                      <span className="font-cinzel font-bold text-xs text-amber-200">
                        Línea {line.id}
                      </span>
                    </div>
                    {/* Mini 5x3 Grid Preview */}
                    <div className="grid grid-cols-5 gap-1 w-full max-w-[100px] p-1 bg-black/60 rounded border border-stone-800">
                      {[0, 1, 2].map((row) =>
                        [0, 1, 2, 3, 4].map((col) => {
                          const isActive = line.coords[col] === row;
                          return (
                            <div
                              key={`${col}-${row}`}
                              className={`h-2.5 rounded-sm transition-colors ${
                                isActive ? 'shadow-[0_0_5px_currentColor]' : 'bg-stone-800'
                              }`}
                              style={{
                                backgroundColor: isActive ? line.color : undefined,
                              }}
                            />
                          );
                        })
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4 text-xs text-stone-300 leading-relaxed font-sans">
              <div className="p-4 rounded-xl bg-stone-900/70 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-cinzel font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Generador de Números Aleatorios (RNG) Certificado
                </div>
                <p>
                  Esta máquina tragamonedas implementa un generador criptográfico justo basado en{' '}
                  <code className="bg-stone-800 px-1 py-0.5 rounded text-amber-300 font-mono">
                    window.crypto.getRandomValues
                  </code>
                  . Cada parada de rodillo se calcula de forma independiente y sin sesgo, garantizando transparencia absoluta y un Retorno Teórico al Jugador (RTP) de <strong>96.5%</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/70 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-cinzel font-bold text-sm">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Mecánica de Ronda de Bonificación (Tiros Gratis)
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>3 o más símbolos Scatter (Pirámides) en cualquier lugar activan 15 giros gratis.</li>
                  <li>Todas las ganancias durante los tiros gratis se pagan con un multiplicador de 3X.</li>
                  <li>Los tiros gratis no descuentan dinero de tu saldo en pesos.</li>
                  <li>Si un comodín Cleopatra sustituye durante giros gratis, ¡el multiplicador total es 6X (2X x 3X)!</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/70 border border-amber-500/30 space-y-2">
                <div className="text-amber-300 font-cinzel font-bold text-sm">
                  Ponderación de Pagos
                </div>
                <p>
                  Los premios de línea se multiplican por la apuesta de línea (Apuesta Total / 20).
                  Los premios Scatter se multiplican por la apuesta total y se suman a los premios de línea.
                  Solo se abona la ganancia más alta por línea seleccionada.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'celebrations' && (
            <div className="space-y-6">
              {/* Highlight Box: 3 Official Casino Motion Variants */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border-2 border-amber-500/60 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                <div className="font-cinzel font-black text-amber-300 text-sm sm:text-lg mb-1 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-yellow-400 animate-pulse" />
                  Estilos de Animación Casino 4K 60FPS (Variantes Oficiales)
                </div>
                <p className="text-xs text-stone-300 mb-3">
                  Prueba directamente las 3 variantes de animación de alta energía con simulación física de partículas en 60 FPS, destellos lumínicos y síntesis de audio procedural Web Audio API:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Variant 1 Trigger */}
                  <button
                    onClick={() => onTestCelebration && onTestCelebration('VARIANT_1', currentBet * 20)}
                    className="p-3 rounded-xl bg-black/70 border border-cyan-400/60 hover:border-cyan-300 hover:bg-cyan-950/30 transition-all text-left flex flex-col justify-between gap-2 group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-cyan-300 font-cinzel font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
                        Variante 1: Luces
                      </div>
                      <div className="text-[10px] text-stone-300 mt-1 leading-snug">
                        Explosión de rayos de luz de colores vibrantes, ondas de choque y campanadas celestiales.
                      </div>
                    </div>
                    <div className="py-1 px-2 rounded-lg bg-cyan-500/20 text-cyan-200 text-[10px] font-cinzel font-bold text-center border border-cyan-400/40">
                      ▶ Probar Variante 1
                    </div>
                  </button>

                  {/* Variant 2 Trigger */}
                  <button
                    onClick={() => onTestCelebration && onTestCelebration('VARIANT_2', currentBet * 50)}
                    className="p-3 rounded-xl bg-black/70 border border-amber-400/60 hover:border-amber-300 hover:bg-amber-950/30 transition-all text-left flex flex-col justify-between gap-2 group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-cinzel font-bold text-xs">
                        <Coins className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                        Variante 2: Lluvia
                      </div>
                      <div className="text-[10px] text-stone-300 mt-1 leading-snug">
                        Explosión masiva y lluvia torrencial de monedas de oro en 3D con física de rebote y fanfarria.
                      </div>
                    </div>
                    <div className="py-1 px-2 rounded-lg bg-amber-500/20 text-amber-200 text-[10px] font-cinzel font-bold text-center border border-amber-400/40">
                      ▶ Probar Variante 2
                    </div>
                  </button>

                  {/* Variant 3 Trigger */}
                  <button
                    onClick={() => onTestCelebration && onTestCelebration('VARIANT_3', currentBet * 120)}
                    className="p-3 rounded-xl bg-black/70 border border-yellow-300/80 hover:border-yellow-200 hover:bg-yellow-950/40 transition-all text-left flex flex-col justify-between gap-2 group shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-yellow-300 font-cinzel font-black text-xs">
                        <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                        Variante 3: MEGA Jackpot
                      </div>
                      <div className="text-[10px] text-stone-300 mt-1 leading-snug">
                        Texto gigante MEGA, relámpagos eléctricos, temblor de pantalla y miles de monedas.
                      </div>
                    </div>
                    <div className="py-1 px-2 rounded-lg bg-yellow-500/30 text-yellow-200 text-[10px] font-cinzel font-bold text-center border border-yellow-300/60 animate-pulse">
                      ⚡ Probar Mega Epic Jackpot
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs sm:text-sm text-amber-200 leading-relaxed">
                <div className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-2 text-sm sm:text-base">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Premios en Pesos ($) con Motor de Partículas 4K
                </div>
                Cada vez que obtengas premios destacados, la máquina tragamonedas desplegará una celebración inmersiva en pantalla completa impulsada por un motor de partículas Canvas a 60 FPS con monedas giratorias en 3D, rayos divinos de sol y fuegos artificiales egipcios, acreditando directamente tus ganancias en <strong className="text-amber-300 font-mono">Pesos ($)</strong>.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Jackpot Legendario */}
                <div className="p-4 rounded-2xl bg-stone-900/80 border-2 border-yellow-400/70 shadow-[0_0_25px_rgba(250,204,21,0.3)] flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-yellow-400 shadow-md shrink-0">
                      <img src={jackpotImg} alt="Jackpot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-yellow-300 font-cinzel font-black text-sm sm:text-base">
                        <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                        ¡JACKPOT DEL FARAÓN!
                      </div>
                      <div className="text-[11px] font-mono text-amber-300/80 mt-0.5">
                        Premio: 80X+ Apuesta o 5 Comodines Wild
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Rayos divinos dorados y lluvia máxima de monedas y gemas.
                      </div>
                    </div>
                  </div>
                  {onTestCelebration && (
                    <button
                      onClick={() => onTestCelebration('ULTRA_WIN', currentBet * 100)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2 shadow"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Probar Animación Jackpot
                    </button>
                  )}
                </div>

                {/* 2. Super Premio de la Reina */}
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0">
                      <img src={queenImg} alt="Reina Cleopatra" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-cinzel font-bold text-sm sm:text-base">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        ¡SUPER PREMIO DE LA REINA!
                      </div>
                      <div className="text-[11px] font-mono text-amber-300/80 mt-0.5">
                        Premio: 35X - 79X Apuesta
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Bendición real de Cleopatra con monedas 3D y fuegos artificiales.
                      </div>
                    </div>
                  </div>
                  {onTestCelebration && (
                    <button
                      onClick={() => onTestCelebration('SUPER_WIN', currentBet * 45)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2 shadow"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Probar Super Premio
                    </button>
                  )}
                </div>

                {/* 3. Mega Premio del Cofre */}
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-amber-500/50 shadow-[0_0_20px_rgba(217,119,6,0.2)] flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-500 shadow-md shrink-0">
                      <img src={chestImg} alt="Cofre del Tesoro" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-cinzel font-bold text-sm sm:text-base">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        ¡MEGA PREMIO DEL COFRE!
                      </div>
                      <div className="text-[11px] font-mono text-amber-300/80 mt-0.5">
                        Premio: 15X - 34X Apuesta
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Cofre rebosante de monedas de oro y gemas sagradas.
                      </div>
                    </div>
                  </div>
                  {onTestCelebration && (
                    <button
                      onClick={() => onTestCelebration('MEGA_WIN', currentBet * 25)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 text-amber-100 font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2 shadow"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Probar Mega Premio
                    </button>
                  )}
                </div>

                {/* 4. Gran Premio Dorado */}
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.15)] flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-md shrink-0">
                      <img src={scarabImg} alt="Escarabajo Sagrado" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-300 font-cinzel font-bold text-sm sm:text-base">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        ¡GRAN PREMIO DORADO!
                      </div>
                      <div className="text-[11px] font-mono text-amber-300/80 mt-0.5">
                        Premio: 4X - 14X Apuesta
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Escarabajo de oro con destellos celestiales y cascada de monedas.
                      </div>
                    </div>
                  </div>
                  {onTestCelebration && (
                    <button
                      onClick={() => onTestCelebration('BIG_WIN', currentBet * 8)}
                      className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2 border border-amber-500/40 shadow"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Probar Gran Premio
                    </button>
                  )}
                </div>

                {/* 5. 15 Tiros Gratis */}
                <div className="p-4 rounded-2xl bg-stone-900/80 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col justify-between gap-3 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-cyan-400 shadow-md shrink-0">
                      <img src={pyramidImg} alt="Pirámide Sagrada" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-cyan-300 font-cinzel font-black text-sm sm:text-base">
                        <Star className="w-4 h-4 text-cyan-400 animate-spin" />
                        ¡RONDA DE 15 TIROS GRATIS CON MULTIPLICADOR 3X!
                      </div>
                      <div className="text-[11px] font-mono text-cyan-200/90 mt-0.5">
                        Activación: 3 o más Pirámides Scatter en los rodillos
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Todos los giros se juegan gratis con ganancias triplicadas (¡y hasta 6X con Cleopatra Wild!).
                      </div>
                    </div>
                  </div>
                  {onTestCelebration && (
                    <button
                      onClick={() => onTestCelebration('FREE_SPINS_TRIGGER', currentBet * 15)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-cyan-400 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2 shadow"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Probar Pantalla de Tiros Gratis
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-amber-500/30 bg-stone-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gold px-6 py-2 rounded-xl text-xs uppercase tracking-wider"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
