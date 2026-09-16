import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Crown, Award, CheckCircle2 } from 'lucide-react';
import treasureChestImg from '../assets/images/egyptian_treasure_chest_1789483982786.jpg';
import { sound } from '../services/soundEngine';
import { haptic } from '../utils/haptics';

interface PharaohChestBonusModalProps {
  isOpen: boolean;
  totalBet: number;
  onClaimReward: (rewardAmount: number) => void;
}

export const PharaohChestBonusModal: React.FC<PharaohChestBonusModalProps> = ({
  isOpen,
  totalBet,
  onClaimReward,
}) => {
  const [selectedChest, setSelectedChest] = useState<number | null>(null);
  const [revealedMultipliers, setRevealedMultipliers] = useState<number[] | null>(null);
  const [claimed, setClaimed] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedChest(null);
      setRevealedMultipliers(null);
      setClaimed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePickChest = (index: number) => {
    if (selectedChest !== null) return;
    sound.playGoldChestShimmer();
    haptic.bigWin();

    // Generate 3 exciting multipliers (one big, one medium, one great)
    const options = [15, 30, 60, 100, 150];
    // Shuffle
    const shuffled = [...options].sort(() => Math.random() - 0.5).slice(0, 3);
    setSelectedChest(index);
    setRevealedMultipliers(shuffled);
  };

  const selectedMultiplier =
    selectedChest !== null && revealedMultipliers ? revealedMultipliers[selectedChest] : 0;
  const wonAmount = parseFloat((totalBet * selectedMultiplier).toFixed(2));

  const handleConfirmClaim = () => {
    if (claimed) return;
    setClaimed(true);
    sound.playWin(true, true);
    onClaimReward(wonAmount);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          className="relative w-full max-w-xl p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#2e1a06] via-stone-950 to-[#120802] border-2 border-yellow-400 shadow-[0_0_60px_rgba(251,191,36,0.5)] flex flex-col items-center text-center overflow-hidden"
        >
          {/* Header Title */}
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce" />
            <h2 className="font-cinzel font-black text-lg sm:text-2xl text-yellow-300 tracking-wider uppercase drop-shadow">
              ¡Cofres del Faraón!
            </h2>
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce" />
          </div>

          <p className="font-cinzel text-xs sm:text-sm text-amber-200/90 mb-6">
            {selectedChest === null
              ? 'Cleopatra te concede su tesoro oculto. ¡Elige 1 cofre sagrado!'
              : '¡El Faraón ha revelado tu fortuna sagrada!'}
          </p>

          {/* 3 Interactive Pharaoh's Chests */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 w-full mb-6">
            {[0, 1, 2].map((idx) => {
              const isSelected = selectedChest === idx;
              const isPicked = selectedChest !== null;
              const multiplier = revealedMultipliers ? revealedMultipliers[idx] : null;

              return (
                <motion.div
                  key={idx}
                  whileHover={!isPicked ? { scale: 1.05 } : {}}
                  whileTap={!isPicked ? { scale: 0.95 } : {}}
                  onClick={() => !isPicked && handlePickChest(idx)}
                  className={`relative p-2 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center ${
                    isSelected
                      ? 'bg-amber-500/30 border-yellow-300 shadow-[0_0_30px_rgba(251,191,36,0.8)] scale-105'
                      : isPicked
                      ? 'bg-stone-900/60 border-amber-500/20 opacity-60'
                      : 'bg-stone-900/90 border-amber-500/50 hover:border-yellow-400 shadow-lg shadow-black/80'
                  }`}
                >
                  {/* Chest Artwork with Gold Glow */}
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden mb-2 border border-amber-400/60">
                    <img
                      src={treasureChestImg}
                      alt="Cofre de Oro"
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-yellow-400/20 animate-pulse pointer-events-none" />
                    )}
                  </div>

                  {/* Multiplier / Status Display */}
                  {multiplier !== null ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`font-cinzel font-black text-sm sm:text-lg ${
                        isSelected ? 'text-yellow-300 drop-shadow' : 'text-stone-400'
                      }`}
                    >
                      {multiplier}X APUESTA
                    </motion.div>
                  ) : (
                    <div className="font-cinzel text-[10px] sm:text-xs font-bold text-amber-400 uppercase">
                      Cofre #{idx + 1}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Reward Confirmation & Claim Button */}
          {selectedChest !== null && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="mb-4 py-2 px-6 rounded-2xl bg-amber-500/20 border border-yellow-400/80 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                <span className="text-xs font-cinzel text-amber-300 uppercase block">
                  Premio Extra Obtenido:
                </span>
                <span className="font-cinzel font-black text-2xl sm:text-3xl text-yellow-300 drop-shadow">
                  +${wonAmount.toFixed(2)}
                </span>
              </div>

              <button
                id="btn-claim-chest-reward"
                onClick={handleConfirmClaim}
                className="py-3 px-8 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border border-yellow-200 text-stone-950 font-cinzel font-black text-sm sm:text-base tracking-wider shadow-[0_0_25px_rgba(251,191,36,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-stone-950" />
                <span>RECLAMAR TESORO</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
