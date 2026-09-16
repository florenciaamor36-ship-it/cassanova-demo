import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Zap, Compass } from 'lucide-react';

interface DynamicTickerProps {
  lastWin: number;
  freeSpinsRemaining: number;
  isSpinning: boolean;
}

const CASINO_TIPS = [
  '👑 CLEOPATRA WILD: Sustituye símbolos y duplica tus premios 2X',
  '🏺 3+ COFRES DE ORO: Activan el Bonus Tesoros del Faraón con multiplicadores de hasta 150X',
  '⚡ FLOR DE LOTO AZUL: Paga hasta 400X con descarga eléctrica en pantalla',
  '🔺 3 PIRÁMIDES SCATTER: Otorgan 15 Giros Gratis con multiplicador 3X en todas las ganancias',
  '💎 DOBLE O NADA: Arriesga tu premio adivinando el color de la carta sagrada',
];

export const DynamicTicker: React.FC<DynamicTickerProps> = ({
  lastWin,
  freeSpinsRemaining,
  isSpinning,
}) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CASINO_TIPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="dynamic-machine-ticker"
      className="w-full h-5 sm:h-6 px-2.5 rounded bg-black/60 border border-amber-500/20 flex items-center justify-between text-[8px] sm:text-[9.5px] font-cinzel text-amber-300/80 overflow-hidden shrink-0 mt-0.5"
    >
      <div className="flex items-center gap-1.5 truncate">
        {freeSpinsRemaining > 0 ? (
          <span className="flex items-center gap-1 text-yellow-300 font-bold animate-pulse">
            <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
            ¡TIROS GRATIS ACTIVOS! MULTIPLICADOR 3X ({freeSpinsRemaining} RESTANTES)
          </span>
        ) : lastWin > 0 && !isSpinning ? (
          <span className="flex items-center gap-1 text-amber-200 font-bold">
            <Award className="w-3 h-3 text-amber-400 shrink-0" />
            ¡VICTORIA REGISTRADA: +${lastWin.toFixed(2)}!
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-300/70 truncate">
            <Compass className="w-3 h-3 text-amber-400 shrink-0" />
            {CASINO_TIPS[tipIndex]}
          </span>
        )}
      </div>

      <div className="hidden xs:flex items-center gap-1 text-stone-500 font-mono text-[8px] shrink-0 ml-2">
        <span>RTP: 96.5%</span>
      </div>
    </div>
  );
};
