import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, ShieldAlert, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { AudioEngine } from '../utils/AudioController';
import tarotImg from '../assets/images/gamble_cards_tarot_1789672931692.webp';
import vampireLordImg from '../assets/images/symbol_vampire_lord_1789672331451.webp';
import vampireCountessImg from '../assets/images/symbol_vampire_countess_1789672341596.webp';

interface GambleCardModalProps {
  isOpen: boolean;
  initialWin: number;
  onClose: (finalWin: number) => void;
}

type CardColor = 'red' | 'black';
type CardSuit = 'chalice' | 'bat' | 'fangs' | 'crown';

interface DrawnCard {
  color: CardColor;
  suit: CardSuit;
  name: string;
}

export const GambleCardModal: React.FC<GambleCardModalProps> = ({
  isOpen,
  initialWin,
  onClose,
}) => {
  const [currentPot, setCurrentPot] = useState<number>(initialWin);
  const [history, setHistory] = useState<CardColor[]>(['red', 'black', 'red', 'red', 'black']);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [revealedCard, setRevealedCard] = useState<DrawnCard | null>(null);
  const [roundResult, setRoundResult] = useState<'win' | 'lose' | null>(null);
  const [roundsWon, setRoundsWon] = useState<number>(0);

  if (!isOpen) return null;

  const handlePickColor = (chosenColor: CardColor) => {
    if (isFlipping) return;

    setIsFlipping(true);
    setRoundResult(null);
    AudioEngine.playCardFlip();

    setTimeout(() => {
      // 50/50 probability
      const outcomeColor: CardColor = Math.random() >= 0.5 ? 'red' : 'black';
      const suits: CardSuit[] = ['chalice', 'bat', 'fangs', 'crown'];
      const outcomeSuit = suits[Math.floor(Math.random() * suits.length)];

      const card: DrawnCard = {
        color: outcomeColor,
        suit: outcomeSuit,
        name: outcomeColor === 'red' ? 'Conde Drácula (Rojo)' : 'Condesa Carmilla (Negro)',
      };

      setRevealedCard(card);
      setHistory(prev => [outcomeColor, ...prev.slice(0, 4)]);

      if (chosenColor === outcomeColor) {
        // Player doubled their money
        const newPot = currentPot * 2;
        setCurrentPot(newPot);
        setRoundsWon(prev => prev + 1);
        setRoundResult('win');
        AudioEngine.playGambleWin();
        setIsFlipping(false);
      } else {
        // Player lost
        setRoundResult('lose');
        setCurrentPot(0);
        AudioEngine.playGambleLose();
        setIsFlipping(false);

        // Auto close after brief display
        setTimeout(() => {
          onClose(0);
        }, 1800);
      }
    }, 600);
  };

  const handleCollect = () => {
    if (isFlipping) return;
    onClose(currentPot);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#220707] via-[#0e0202] to-black border-2 border-red-600/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col items-center text-center overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-red-500 animate-pulse" />
            <h2 className="font-cinzel text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-red-400">
              DOBLE O NADA: RITUAL DE SANGRE
            </h2>
          </div>

          <p className="font-sans text-xs text-neutral-300 mb-4">
            Adivina el color de la carta oculta para duplicar tu ganancia (x2).
          </p>

          {/* History Pills */}
          <div className="flex items-center gap-2 mb-4 bg-black/60 px-3 py-1.5 rounded-full border border-neutral-800">
            <span className="font-cinzel text-xs text-neutral-400">Historial:</span>
            {history.map((col, idx) => (
              <span
                key={idx}
                className={`w-4 h-4 rounded-full border ${
                  col === 'red'
                    ? 'bg-red-600 border-red-400 shadow-[0_0_5px_#ef4444]'
                    : 'bg-neutral-900 border-neutral-500 shadow-[0_0_5px_#64748b]'
                }`}
              />
            ))}
          </div>

          {/* Pot Readout */}
          <div className="grid grid-cols-2 gap-3 w-full mb-4">
            <div className="bg-black/60 border border-neutral-800 rounded-xl p-2.5">
              <span className="font-cinzel text-[11px] text-neutral-400 block">GANANCIA ACTUAL</span>
              <span className="font-cinzel text-xl sm:text-2xl font-black text-amber-400">
                ${currentPot.toLocaleString()}
              </span>
            </div>
            <div className="bg-black/60 border border-red-900/60 rounded-xl p-2.5">
              <span className="font-cinzel text-[11px] text-red-300 block">DOBLAR A (x2)</span>
              <span className="font-cinzel text-xl sm:text-2xl font-black text-red-400">
                ${(currentPot * 2).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tarot Card Display Area */}
          <div className="relative w-44 h-64 sm:w-48 sm:h-72 my-2 perspective-1000 select-none">
            <motion.div
              animate={{ rotateY: isFlipping ? 180 : 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.4)] border-2 border-amber-500/80"
            >
              {revealedCard && !isFlipping ? (
                <div className="w-full h-full relative bg-neutral-950 flex flex-col items-center justify-center p-3">
                  <img
                    src={revealedCard.color === 'red' ? vampireLordImg : vampireCountessImg}
                    alt={revealedCard.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-2 inset-x-2 bg-black/80 backdrop-blur-sm py-1.5 rounded-lg border border-amber-500/50">
                    <span className="font-cinzel text-xs font-bold text-white">
                      {revealedCard.name}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative bg-black">
                  <img
                    src={tarotImg}
                    alt="Card Back"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-red-950/20 flex items-center justify-center">
                    <span className="font-cinzel text-sm font-bold text-amber-300 tracking-widest bg-black/70 px-3 py-1 rounded-full border border-amber-600">
                      ? ELIGE ?
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Status announcement */}
          <div className="h-8 my-2 flex items-center justify-center">
            {roundResult === 'win' && (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 text-emerald-400 font-cinzel font-bold text-base"
              >
                <CheckCircle2 className="w-5 h-5" />
                ¡CORRECTO! Ganancia duplicada ({roundsWon} aciertos)
              </motion.div>
            )}
            {roundResult === 'lose' && (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 text-red-500 font-cinzel font-bold text-base"
              >
                <XCircle className="w-5 h-5" />
                ¡Has fallado! El vampiro devoró tu apuesta.
              </motion.div>
            )}
          </div>

          {/* Action Buttons: Red vs Black */}
          {roundResult !== 'lose' && (
            <div className="w-full flex flex-col gap-3 mt-1">
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => handlePickColor('red')}
                  disabled={isFlipping}
                  className="py-3.5 px-4 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-cinzel font-black text-base rounded-2xl border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="w-4 h-4 rounded-full bg-red-500 inline-block shadow-md" />
                  ROJO (Vlad)
                </button>

                <button
                  onClick={() => handlePickColor('black')}
                  disabled={isFlipping}
                  className="py-3.5 px-4 bg-gradient-to-r from-neutral-800 to-neutral-950 hover:from-neutral-700 hover:to-neutral-900 text-white font-cinzel font-black text-base rounded-2xl border-2 border-neutral-600 shadow-[0_0_20px_rgba(100,116,139,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="w-4 h-4 rounded-full bg-neutral-400 inline-block shadow-md" />
                  NEGRO (Carmilla)
                </button>
              </div>

              {/* Collect Button */}
              <button
                onClick={handleCollect}
                disabled={isFlipping || currentPot === 0}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-cinzel font-black text-base rounded-xl border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all cursor-pointer"
              >
                COBRAR ${currentPot.toLocaleString()} Y SALIR
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
