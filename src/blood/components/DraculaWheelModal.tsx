import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Flame, Disc, X } from 'lucide-react';
import { AudioEngine } from '../utils/AudioController';
import bloodWheelImg from '../assets/images/dracula_blood_wheel_1789672919148.jpg';

interface WheelSegment {
  id: number;
  label: string;
  type: 'multiplier' | 'freespins' | 'jackpot';
  value: number; // multiplier value or fixed cash or freespins
  color: string;
  glow: string;
}

const SEGMENTS: WheelSegment[] = [
  { id: 0, label: 'x10', type: 'multiplier', value: 10, color: '#991b1b', glow: '#ef4444' },
  { id: 1, label: 'x20', type: 'multiplier', value: 20, color: '#7c2d12', glow: '#f97316' },
  { id: 2, label: 'x5', type: 'multiplier', value: 5, color: '#450a0a', glow: '#dc2626' },
  { id: 3, label: 'BOTE 5000', type: 'jackpot', value: 5000, color: '#78350f', glow: '#fbbf24' },
  { id: 4, label: 'x15', type: 'multiplier', value: 15, color: '#831843', glow: '#f43f5e' },
  { id: 5, label: '+10 TIROS', type: 'freespins', value: 10, color: '#581c87', glow: '#c084fc' },
  { id: 6, label: 'x25', type: 'multiplier', value: 25, color: '#7c2d12', glow: '#f97316' },
  { id: 7, label: 'x50', type: 'multiplier', value: 50, color: '#881337', glow: '#f43f5e' },
  { id: 8, label: 'x8', type: 'multiplier', value: 8, color: '#450a0a', glow: '#dc2626' },
  { id: 9, label: 'x100', type: 'multiplier', value: 100, color: '#713f12', glow: '#eab308' },
  { id: 10, label: 'x12', type: 'multiplier', value: 12, color: '#581c87', glow: '#a855f7' },
  { id: 11, label: 'x30', type: 'multiplier', value: 30, color: '#991b1b', glow: '#ef4444' },
];

interface DraculaWheelModalProps {
  isOpen: boolean;
  baseBet: number;
  onClose: (result: { winCredits: number; extraFreeSpins: number }) => void;
}

export const DraculaWheelModal: React.FC<DraculaWheelModalProps> = ({
  isOpen,
  baseBet,
  onClose,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [wonSegment, setWonSegment] = useState<WheelSegment | null>(null);
  const [winCredits, setWinCredits] = useState<number>(0);
  const [needleBump, setNeedleBump] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  const numSegments = SEGMENTS.length;
  const degreesPerSegment = 360 / numSegments;

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setIsSpinning(false);
      setHasSpun(false);
      setWonSegment(null);
      setWinCredits(0);
      setNeedleBump(false);
      AudioEngine.playBonus();
    }
  }, [isOpen]);

  const spinWheel = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setNeedleBump(false);

    // Pick winning segment with weighted probabilities
    // Standard random index
    const chosenIndex = Math.floor(Math.random() * numSegments);
    const targetSegment = SEGMENTS[chosenIndex];

    // Compute final degree
    // Add 5-8 full spins (1800 - 2880 deg)
    const extraSpins = 6 * 360;
    // Align so that pointer (at top: 0 / 360 deg) points to chosen segment
    // Segment 0 center is at 0 deg, segment 1 is at degreesPerSegment, etc.
    const segmentAngle = chosenIndex * degreesPerSegment;
    // Add small random offset inside the segment (within +/- 10 deg)
    const jitter = (Math.random() - 0.5) * (degreesPerSegment * 0.5);
    const totalRotation = extraSpins + (360 - segmentAngle) + jitter;

    const startTime = performance.now();
    const duration = 5500; // 5.5 seconds spin
    let lastTickAngle = 0;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      const currentRot = totalRotation * easeOut;
      setRotation(currentRot);

      // Sound effect ticks when passing segment pegs
      if (Math.abs(currentRot - lastTickAngle) >= degreesPerSegment) {
        lastTickAngle = currentRot;
        setNeedleBump(prev => !prev);
        // Play tick sound with decreasing pitch as it slows
        const speed = 1 - progress;
        AudioEngine.playWheelTick(0.8 + speed * 0.5);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateSpin);
      } else {
        // Finished
        setIsSpinning(false);
        setHasSpun(true);
        setWonSegment(targetSegment);

        // Compute prize
        let finalCash = 0;
        let extraFree = 0;
        if (targetSegment.type === 'jackpot') {
          finalCash = targetSegment.value;
          AudioEngine.playJackpot();
        } else if (targetSegment.type === 'multiplier') {
          finalCash = targetSegment.value * baseBet;
          AudioEngine.playBigWin();
        } else {
          extraFree = targetSegment.value;
          AudioEngine.playFreeSpins();
        }

        setWinCredits(finalCash);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateSpin);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleClaim = () => {
    if (!wonSegment) return;
    const extraSpins = wonSegment.type === 'freespins' ? wonSegment.value : 0;
    onClose({ winCredits, extraFreeSpins: extraSpins });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          {/* Ambient Blood Moon Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.25)_0%,transparent_70%)] pointer-events-none" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            className="relative w-full max-w-xl bg-gradient-to-b from-[#1a0505] via-[#0d0202] to-black border-2 border-amber-600/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center text-center overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                <h2 className="font-cinzel text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-red-400 to-amber-400">
                  RUEDA DE SANGRE DE DRÁCULA
                </h2>
              </div>
              <button
                onClick={() => onClose({ winCredits: 0, extraFreeSpins: 0 })}
                disabled={isSpinning}
                className="p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-900/60 border border-neutral-700 disabled:opacity-30 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="font-sans text-xs sm:text-sm text-neutral-300 mb-4 max-w-md">
              Gira la rueda mística del vampiro ancestral para multiplicar tu apuesta o reclamar el{' '}
              <span className="text-amber-400 font-bold">GRAN BOTE DE $5,000</span>.
            </p>

            {/* Wheel Container */}
            <div className="relative w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] md:w-[340px] md:h-[340px] flex items-center justify-center my-2 select-none">
              {/* Golden Pointer Needle at Top */}
              <div
                className={`absolute top-0 z-30 transform -translate-y-2 transition-transform duration-100 ${
                  needleBump ? 'scale-110 rotate-6' : 'rotate-0'
                }`}
              >
                <div className="w-0 h-0 border-l-[10px] sm:border-l-[14px] border-l-transparent border-r-[10px] sm:border-r-[14px] border-r-transparent border-t-[20px] sm:border-t-[28px] border-t-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full mx-auto -mt-4 sm:-mt-6 border border-white" />
              </div>

              {/* Decorative Outer Ring with LED studs */}
              <div className="absolute inset-0 rounded-full border-2 sm:border-4 border-amber-600 shadow-[0_0_30px_rgba(234,179,8,0.4)] pointer-events-none z-20">
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  return (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-300 shadow-[0_0_6px_#fbbf24] -translate-x-1/2 -translate-y-1/2"
                      style={{
                        top: `${50 - 48 * Math.cos((angle * Math.PI) / 180)}%`,
                        left: `${50 + 48 * Math.sin((angle * Math.PI) / 180)}%`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Rotating Wheel Canvas / SVG */}
              <div
                className="w-full h-full rounded-full relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] border-2 border-red-950"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'none' : 'transform 0.1s ease-out',
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {SEGMENTS.map((seg, idx) => {
                    const startAngle = (idx * 360) / numSegments;
                    const endAngle = ((idx + 1) * 360) / numSegments;

                    // Convert polar to cartesian coordinates
                    const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                    const textAngle = startAngle + degreesPerSegment / 2;
                    const textRad = (Math.PI * (textAngle - 90)) / 180;
                    const tx = 50 + 33 * Math.cos(textRad);
                    const ty = 50 + 33 * Math.sin(textRad);

                    return (
                      <g key={seg.id}>
                        {/* Slice Path */}
                        <path
                          d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                          fill={seg.color}
                          stroke="#d97706"
                          strokeWidth="0.8"
                        />
                        {/* Segment Label */}
                        <text
                          x={tx}
                          y={ty}
                          fill="#ffffff"
                          fontSize="5.2"
                          fontWeight="bold"
                          fontFamily="Cinzel, serif"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                          style={{
                            textShadow: '0 0 4px #000, 0 0 6px #000',
                          }}
                        >
                          {seg.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center Dracula Medallion 3D Image */}
                <div className="absolute inset-0 m-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.7)] z-10">
                  <img
                    src={bloodWheelImg}
                    alt="Center Skull"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Action / Result section */}
            <div className="mt-4 w-full flex flex-col items-center">
              {!hasSpun ? (
                <button
                  onClick={spinWheel}
                  disabled={isSpinning}
                  className="px-8 py-3.5 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-cinzel font-black text-lg rounded-2xl border-2 border-amber-400 shadow-[0_0_25px_rgba(239,68,68,0.6)] active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Disc className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                  {isSpinning ? 'GIRANDO LA RUEDA...' : '¡GIRAR LA RUEDA DE SANGRE!'}
                </button>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-red-950/80 border border-amber-500/80 rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                    <p className="font-cinzel text-sm text-neutral-300">¡HAS CONSEGUIDO!</p>
                    <p className="font-cinzel text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                      {wonSegment?.type === 'jackpot'
                        ? '👑 ¡GRAN BOTE DE $5,000!'
                        : wonSegment?.type === 'freespins'
                        ? `🔮 +${wonSegment?.value} TIROS GRATIS`
                        : `🩸 +$${winCredits.toLocaleString()} (Multiplicador ${wonSegment?.label})`}
                    </p>
                  </div>

                  <button
                    onClick={handleClaim}
                    className="mt-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-cinzel font-black text-base rounded-xl border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer"
                  >
                    RECLAMAR PREMIO Y VOLVER AL JUEGO
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
