import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, HelpCircle, Gift } from 'lucide-react';
import { AudioEngine } from '../utils/AudioController';

import bonusCoffinImg from '../assets/images/symbol_bonus_coffin_1789672373585.jpg';
import vampireLordImg from '../assets/images/symbol_vampire_lord_1789672331451.jpg';
import bloodChaliceImg from '../assets/images/symbol_blood_chalice_1789672383843.jpg';
import gothicKingImg from '../assets/images/symbol_gothic_king_1789672425055.jpg';
import gothicAceImg from '../assets/images/symbol_gothic_ace_1789672414316.jpg';
import gothicBatImg from '../assets/images/symbol_gothic_bat_1789672402943.jpg';

interface CoffinBonusModalProps {
  isOpen: boolean;
  onClose: (totalWon: number) => void;
}

interface CoffinState {
  id: number;
  isOpened: boolean;
  prizeName: string;
  prizeAmount: number;
  iconType: 'vampire' | 'gem' | 'chalice' | 'dust' | 'crown';
}

export const CoffinBonusModal: React.FC<CoffinBonusModalProps> = ({ isOpen, onClose }) => {
  const [coffins, setCoffins] = useState<CoffinState[]>([
    { id: 1, isOpened: false, prizeName: 'Cáliz Sagrado', prizeAmount: 500, iconType: 'chalice' },
    { id: 2, isOpened: false, prizeName: 'Corona de Vlad', prizeAmount: 1500, iconType: 'crown' },
    { id: 3, isOpened: false, prizeName: '¡DRÁCULA DESPIERTO!', prizeAmount: 3000, iconType: 'vampire' },
    { id: 4, isOpened: false, prizeName: 'Polvo de Gárgola', prizeAmount: 200, iconType: 'dust' },
    { id: 5, isOpened: false, prizeName: 'Rubí de Sangre', prizeAmount: 800, iconType: 'gem' }
  ]);

  const [picksLeft, setPicksLeft] = useState<number>(3);
  const [totalWon, setTotalWon] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!isOpen) return null;

  // Shuffle the prizes inside the coffins when first loaded
  const handlePick = (coffinId: number) => {
    if (picksLeft <= 0 || isFinished) return;

    // Check if already opened
    const target = coffins.find(c => c.id === coffinId);
    if (target?.isOpened) return;

    // Play scary creaking hinges / thud sound!
    AudioEngine.playBonus();

    // Specific synthesizer sound for picks
    if (target?.iconType === 'vampire') {
      AudioEngine.playWild(); // scary scream/hiss representation
    } else {
      AudioEngine.playWinNormal();
    }

    const updated = coffins.map((coffin) => {
      if (coffin.id === coffinId) {
        return { ...coffin, isOpened: true };
      }
      return coffin;
    });

    setCoffins(updated);
    const addedWin = target ? target.prizeAmount : 0;
    setTotalWon(prev => prev + addedWin);
    
    const nextPicks = picksLeft - 1;
    setPicksLeft(nextPicks);

    if (nextPicks === 0) {
      setTimeout(() => {
        setIsFinished(true);
      }, 1500);
    }
  };

  const handleCollectAndExit = () => {
    AudioEngine.playClick();
    onClose(totalWon);
    // Reset local state
    setCoffins([
      { id: 1, isOpened: false, prizeName: 'Cáliz Sagrado', prizeAmount: 500, iconType: 'chalice' },
      { id: 2, isOpened: false, prizeName: 'Corona de Vlad', prizeAmount: 1500, iconType: 'crown' },
      { id: 3, isOpened: false, prizeName: '¡DRÁCULA DESPIERTO!', prizeAmount: 3000, iconType: 'vampire' },
      { id: 4, isOpened: false, prizeName: 'Polvo de Gárgola', prizeAmount: 200, iconType: 'dust' },
      { id: 5, isOpened: false, prizeName: 'Rubí de Sangre', prizeAmount: 800, iconType: 'gem' }
    ]);
    setPicksLeft(3);
    setTotalWon(0);
    setIsFinished(false);
  };

  // Render photorealistic 3D prize icon based on prize content
  const renderPrizeIcon = (type: string) => {
    switch (type) {
      case 'vampire':
        return (
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse">
            <img src={vampireLordImg} alt="Vlad" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        );
      case 'crown':
        return (
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]">
            <img src={gothicKingImg} alt="Crown" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        );
      case 'chalice':
        return (
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]">
            <img src={bloodChaliceImg} alt="Chalice" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        );
      case 'gem':
        return (
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-bounce">
            <img src={gothicAceImg} alt="Ruby" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-500 shadow-[0_0_15px_rgba(148,163,184,0.8)]">
            <img src={gothicBatImg} alt="Gargoyle" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 p-4 md:p-8 overflow-y-auto">
      
      {/* Background candle highlights */}
      <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-red-950/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-emerald-950/20 blur-3xl pointer-events-none" />

      {/* Crypt Frame Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-neutral-950 border-2 sm:border-3 border-[#580000] shadow-[0_0_80px_rgba(139,0,0,0.5)] rounded-2xl p-4 sm:p-6 md:p-8 text-neutral-200">
        
        {/* Header Title */}
        <div className="text-center mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-widest text-emerald-500 font-cinzel filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            EL MINI-JUEGO DEL ATAÚD
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1 sm:mt-2">
            <span className="text-xs sm:text-sm font-bold font-cinzel text-neutral-400">CRIPTAS DE SANGRE</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45" />
            <span className="text-xs sm:text-sm text-neutral-500 font-sans">Elige tus recompensas</span>
          </div>
        </div>

        {/* Counter Displays */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-md mx-auto mb-4 sm:mb-8">
          <div className="bg-[#0b0303] border border-[#2c0505] rounded-xl p-2 sm:p-3 text-center shadow-inner">
            <div className="text-[10px] sm:text-xs text-neutral-400 font-cinzel tracking-wider uppercase">Picks Disponibles</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-cinzel text-emerald-400 mt-0.5 animate-pulse">
              {picksLeft}
            </div>
          </div>
          <div className="bg-[#0b0303] border border-[#2c0505] rounded-xl p-2 sm:p-3 text-center shadow-inner">
            <div className="text-[10px] sm:text-xs text-neutral-400 font-cinzel tracking-wider uppercase">Premio Acumulado</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-cinzel text-yellow-500 mt-0.5">
              ${totalWon}
            </div>
          </div>
        </div>

        {/* Coffins Grid */}
        {!isFinished ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 md:gap-5 justify-center my-3 sm:my-6">
            {coffins.map((coffin) => (
              <motion.div
                key={coffin.id}
                whileHover={!coffin.isOpened ? { scale: 1.05, y: -4 } : {}}
                whileTap={!coffin.isOpened ? { scale: 0.96 } : {}}
                onClick={() => handlePick(coffin.id)}
                className={`relative aspect-[1/2] rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center p-3 transition-all duration-300 overflow-hidden
                  ${coffin.isOpened 
                    ? 'bg-gradient-to-b from-[#1a0505] to-[#0a0000] border-amber-600/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-default' 
                    : 'bg-gradient-to-b from-[#1c2c1a] via-[#0b160b] to-[#040804] border-emerald-500/70 hover:border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]'
                  }`}
              >
                {/* Baroque Gold Corner studs */}
                <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-amber-400/80 rounded-tl" />
                <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-amber-400/80 rounded-tr" />
                <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-amber-400/80 rounded-bl" />
                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-amber-400/80 rounded-br" />

                <AnimatePresence mode="wait">
                  {!coffin.isOpened ? (
                    // Closed Coffin Graphics
                    <motion.div
                      key="closed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-between h-full py-2 w-full text-center relative"
                    >
                      {/* 3D Coffin Image Preview */}
                      <div className="w-full aspect-square max-w-[96px] rounded-xl overflow-hidden border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        <img 
                          src={bonusCoffinImg} 
                          alt="Gothic Coffin" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      {/* Coffin Number Badge */}
                      <span className="font-cinzel text-[11px] font-black text-amber-200 bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border border-emerald-500/80 px-2.5 py-1 rounded-full shadow-md mt-2 tracking-wider">
                        ATAÚD #{coffin.id}
                      </span>
                    </motion.div>
                  ) : (
                    // Opened Coffin Graphics (Revealed prize)
                    <motion.div
                      key="opened"
                      initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      className="flex flex-col items-center justify-center text-center h-full gap-2 p-1"
                    >
                      {renderPrizeIcon(coffin.iconType)}
                      <h4 className="font-cinzel text-[11px] font-black text-amber-300 uppercase leading-tight">
                        {coffin.prizeName}
                      </h4>
                      <div className="px-2.5 py-1 rounded-full bg-black/70 border border-amber-400/80 shadow">
                        <span className="text-sm font-black font-cinzel text-yellow-300">
                          +${coffin.prizeAmount}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          // Victory / Summary Screen
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 bg-[#0b0303] border border-[#2c0505] rounded-2xl max-w-xl mx-auto my-6"
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Sparkles className="w-10 h-10 text-emerald-400 animate-spin" />
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold font-cinzel text-white tracking-widest">
              ¡RECOMPENSAS DEVORADAS!
            </h3>
            
            <p className="text-xs text-neutral-400 mt-2 max-w-sm mx-auto">
              Has logrado profanar la cripta del castillo y escapar con valiosos tesoros virtuales.
            </p>

            <div className="text-4xl md:text-5xl font-black font-cinzel text-yellow-500 my-6 drop-shadow-[0_2px_8px_rgba(234,179,8,0.4)] animate-pulse">
              +${totalWon} <span className="text-xs uppercase text-neutral-400 font-sans block mt-1">Créditos de Sangre totales</span>
            </div>

            <button
              onClick={handleCollectAndExit}
              className="px-10 py-3.5 font-cinzel font-bold text-base tracking-widest text-white rounded-lg shadow-lg border-2 border-emerald-500 bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-950 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              COBRAR Y REGRESAR
            </button>
          </motion.div>
        )}

        {/* Crypt Rules footer */}
        {!isFinished && (
          <p className="text-center text-[11px] text-neutral-500 mt-6 font-sans leading-relaxed">
            *Tienes exactamente 3 intentos en esta cripta. Cada ataúd abierto contiene riquezas o al mismísimo Conde Vlad que otorga el premio supremo.
          </p>
        )}

      </div>
    </div>
  );
};
export default CoffinBonusModal;
