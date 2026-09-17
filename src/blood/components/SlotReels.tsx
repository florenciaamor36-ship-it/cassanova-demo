import React, { useEffect, useRef, useState } from 'react';
import { SYMBOLS, PAYLINES, SymbolDef } from '../data/gameData';
import { SymbolRenderer } from './SymbolRenderer';
import { WinningLine } from '../utils/GameEngine';

interface SlotReelsProps {
  grid: string[][]; // 5 reels x 3 rows
  isSpinning: boolean;
  spinningReels: boolean[]; // whether each of the 5 reels is currently spinning
  winningLines: WinningLine[];
  activeWinningLineIdx: number; // which winning line to highlight (-1 for all or none)
  isTurbo: boolean;
}

export const SlotReels: React.FC<SlotReelsProps> = ({
  grid,
  isSpinning,
  spinningReels,
  winningLines,
  activeWinningLineIdx,
  isTurbo
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Local dimensions of the reels for canvas scaling
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Monitor container size changes to keep coordinates perfectly aligned
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update canvas sizing and run the 64fps particle / line drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      alpha: number;
    }> = [];

    const cellWidth = dimensions.width / 5;
    const cellHeight = dimensions.height / 3;

    // Get screen coordinates of a grid cell
    const getCellCenter = (col: number, row: number) => {
      return {
        x: (col + 0.5) * cellWidth,
        y: (row + 0.5) * cellHeight
      };
    };

    let pulseTime = 0;

    const drawLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pulseTime += 0.05;

      // Lines to draw: either a single highlighted line or all lines if cycle is showing summary
      const linesToDraw = activeWinningLineIdx >= 0 
        ? [winningLines[activeWinningLineIdx]] 
        : winningLines;

      if (linesToDraw.length > 0 && !isSpinning) {
        linesToDraw.forEach((winLine) => {
          if (!winLine) return;

          // Find the original payline configuration for the color
          const paylineDef = PAYLINES.find(p => p.id === winLine.lineId);
          const lineColor = paylineDef ? paylineDef.color : '#ef4444';

          // Scatter and Bonus don't have a rigid line path, they flash individual symbols
          if (winLine.lineId === 99 || winLine.lineId === 100) {
            // Draw floating sparks around scatter/bonus positions
            winLine.coords.forEach(([col, row]) => {
              const center = getCellCenter(col, row);
              if (Math.random() < 0.2) {
                particles.push({
                  x: center.x + (Math.random() - 0.5) * cellWidth * 0.6,
                  y: center.y + (Math.random() - 0.5) * cellHeight * 0.6,
                  vx: (Math.random() - 0.5) * 1,
                  vy: -Math.random() * 1.5 - 0.5,
                  color: winLine.lineId === 100 ? '#10b981' : '#f43f5e', // Emerald for bonus, crimson for scatter
                  size: Math.random() * 3 + 2,
                  alpha: 1
                });
              }

              // Draw neon outline box
              ctx.save();
              ctx.strokeStyle = winLine.lineId === 100 ? '#10b981' : '#f43f5e';
              ctx.lineWidth = 3 + Math.sin(pulseTime) * 1;
              ctx.shadowBlur = 10;
              ctx.shadowColor = ctx.strokeStyle;
              ctx.strokeRect(col * cellWidth + 4, row * cellHeight + 4, cellWidth - 8, cellHeight - 8);
              ctx.restore();
            });
            return;
          }

          // Regular payline drawing
          if (winLine.coords && winLine.coords.length > 0) {
            ctx.save();
            ctx.beginPath();
            
            const startCenter = getCellCenter(winLine.coords[0][0], winLine.coords[0][1]);
            ctx.moveTo(startCenter.x, startCenter.y);

            for (let i = 1; i < winLine.coords.length; i++) {
              const ptCenter = getCellCenter(winLine.coords[i][0], winLine.coords[i][1]);
              ctx.lineTo(ptCenter.x, ptCenter.y);
            }

            // Pulsing Neon Laser effect
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 4 + Math.sin(pulseTime) * 1.5;
            ctx.shadowBlur = 15;
            ctx.shadowColor = lineColor;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            
            // White core laser
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 0;
            ctx.stroke();
            ctx.restore();

            // Spawn sparkles riding along the line
            if (Math.random() < 0.3) {
              const randomSegIdx = Math.floor(Math.random() * (winLine.coords.length - 1));
              const start = getCellCenter(winLine.coords[randomSegIdx][0], winLine.coords[randomSegIdx][1]);
              const end = getCellCenter(winLine.coords[randomSegIdx+1][0], winLine.coords[randomSegIdx+1][1]);
              
              // Interpolate
              const t = Math.random();
              particles.push({
                x: start.x + (end.x - start.x) * t,
                y: start.y + (end.y - start.y) * t,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5 - 0.5,
                color: lineColor,
                size: Math.random() * 3 + 1.5,
                alpha: 1
              });
            }

            // Draw individual cell highlights for winning count
            winLine.coords.forEach(([col, row]) => {
              ctx.save();
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 3;
              ctx.shadowBlur = 12;
              ctx.shadowColor = '#f59e0b';
              ctx.strokeRect(col * cellWidth + 5, row * cellHeight + 5, cellWidth - 10, cellHeight - 10);
              ctx.restore();
            });

            // Pragmatic Play Floating Golden Payout Pill Badge
            if (winLine.payout && winLine.payout > 0) {
              const midCoordIdx = Math.floor(winLine.coords.length / 2);
              const midCoord = winLine.coords[midCoordIdx];
              if (midCoord) {
                const centerPt = getCellCenter(midCoord[0], midCoord[1]);
                const badgeText = `+${winLine.payout}`;
                
                ctx.save();
                ctx.font = '900 13px "Cinzel", Georgia, serif';
                const textMetrics = ctx.measureText(badgeText);
                const badgeWidth = Math.max(54, textMetrics.width + 18);
                const badgeHeight = 22;
                const badgeX = centerPt.x - badgeWidth / 2;
                const badgeY = centerPt.y - badgeHeight / 2 - 12 + Math.sin(pulseTime * 2.5) * 3;

                // Outer Gold Glow
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#f59e0b';

                // Pill Background
                ctx.fillStyle = '#1c0303';
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 11);
                ctx.fill();
                ctx.stroke();

                // Inner text
                ctx.fillStyle = '#fef08a';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#000000';
                ctx.fillText(badgeText, centerPt.x, badgeY + badgeHeight / 2);
                ctx.restore();
              }
            }
          }
        });
      }

      // Update and draw sparkles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, winningLines, activeWinningLineIdx, isSpinning]);

  // Is a specific cell part of the currently highlighted winning combination?
  const isCellWinning = (colIndex: number, rowIndex: number) => {
    if (isSpinning) return false;
    
    const linesToCheck = activeWinningLineIdx >= 0 
      ? [winningLines[activeWinningLineIdx]] 
      : winningLines;

    return linesToCheck.some(line => 
      line?.coords?.some(([c, r]) => c === colIndex && r === rowIndex)
    );
  };

  // Base symbol sequence for seamless spinning reel animation
  const BASE_STRIP = [
    'vampire_lord',
    'gothic_castle',
    'blood_chalice',
    'wild_fangs',
    'vampire_countess',
    'scatter_moon',
    'bonus_coffin',
    'gothic_bat',
    'gothic_a',
    'gothic_k',
    'gothic_q',
    'gothic_j'
  ];
  // Duplicate for seamless 0% -> -50% loop
  const SEAMLESS_STRIP = [...BASE_STRIP, ...BASE_STRIP];

  const [reelBounces, setReelBounces] = useState<number[]>([0, 0, 0, 0, 0]);
  const prevSpinningRef = useRef<boolean[]>([false, false, false, false, false]);

  // Handle mechanical bounce-back when reel stops
  useEffect(() => {
    spinningReels.forEach((isNowSpinning, reelIdx) => {
      const wasSpinning = prevSpinningRef.current[reelIdx];
      // Reel just locked into place!
      if (wasSpinning && !isNowSpinning) {
        // Trigger mechanical overshoot bounce: +12px down then spring back to 0
        setReelBounces(prev => {
          const next = [...prev];
          next[reelIdx] = 12;
          return next;
        });

        setTimeout(() => {
          setReelBounces(prev => {
            const next = [...prev];
            next[reelIdx] = -4; // slight upward rebound
            return next;
          });
        }, 90);

        setTimeout(() => {
          setReelBounces(prev => {
            const next = [...prev];
            next[reelIdx] = 0; // settle
            return next;
          });
        }, 180);
      }
    });

    prevSpinningRef.current = [...spinningReels];
  }, [spinningReels]);

  const anyReelSpinning = spinningReels.some(s => s);
  const hasWins = winningLines.length > 0 && !anyReelSpinning;

  return (
    <div className="relative w-full p-2 sm:p-3 bg-gradient-to-b from-[#380202] via-[#1a0101] to-[#380202] rounded-2xl border-2 border-amber-600/70 shadow-[0_0_40px_rgba(220,38,38,0.5)]">
      {/* Perimeter Dynamic LED Lights Chaser Frame */}
      <div className="absolute inset-1 pointer-events-none rounded-xl overflow-hidden z-40">
        {/* Top LEDs */}
        <div className="absolute top-1 inset-x-3 flex justify-between">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={`top-led-${i}`}
              className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                anyReelSpinning
                  ? (i % 2 === 0 ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-red-600 shadow-[0_0_8px_#ef4444]')
                  : hasWins
                  ? 'bg-yellow-300 shadow-[0_0_10px_#fde047] animate-pulse'
                  : 'bg-red-950/80 border border-red-800/40'
              }`}
            />
          ))}
        </div>

        {/* Bottom LEDs */}
        <div className="absolute bottom-1 inset-x-3 flex justify-between">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={`bot-led-${i}`}
              className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                anyReelSpinning
                  ? (i % 2 === 1 ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-red-600 shadow-[0_0_8px_#ef4444]')
                  : hasWins
                  ? 'bg-yellow-300 shadow-[0_0_10px_#fde047] animate-pulse'
                  : 'bg-red-950/80 border border-red-800/40'
              }`}
            />
          ))}
        </div>

        {/* Left LEDs */}
        <div className="absolute left-1 inset-y-4 flex flex-col justify-between">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`left-led-${i}`}
              className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                anyReelSpinning
                  ? (i % 2 === 0 ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-red-600 shadow-[0_0_8px_#ef4444]')
                  : hasWins
                  ? 'bg-yellow-300 shadow-[0_0_10px_#fde047] animate-pulse'
                  : 'bg-red-950/80 border border-red-800/40'
              }`}
            />
          ))}
        </div>

        {/* Right LEDs */}
        <div className="absolute right-1 inset-y-4 flex flex-col justify-between">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`right-led-${i}`}
              className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                anyReelSpinning
                  ? (i % 2 === 1 ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-red-600 shadow-[0_0_8px_#ef4444]')
                  : hasWins
                  ? 'bg-yellow-300 shadow-[0_0_10px_#fde047] animate-pulse'
                  : 'bg-red-950/80 border border-red-800/40'
              }`}
            />
          ))}
        </div>
      </div>

      <div 
        ref={containerRef}
        className={`relative w-full aspect-[5/3] min-h-[190px] sm:min-h-[260px] md:min-h-[300px] bg-neutral-950 rounded-lg border-2 sm:border-4 border-[#3a0202] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.9),0_0_25px_rgba(88,0,0,0.4)]
          ${hasWins ? 'shadow-[inset_0_0_60px_rgba(220,38,38,0.3),0_0_35px_rgba(234,179,8,0.5)]' : ''}`}
      >
        {/* Background backing glow grid */}
        <div className="absolute inset-0 grid grid-cols-5 pointer-events-none z-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-full border-r border-[#1a0101]/60 bg-gradient-to-b from-[#100303] via-[#050101] to-[#100303]" />
          ))}
        </div>

        {/* Columns and Reel Tapes */}
        <div className="absolute inset-0 grid grid-cols-5 z-10">
          {grid.map((column, colIdx) => {
            const isReelSpinning = spinningReels[colIdx];
            const bounceY = reelBounces[colIdx] || 0;
            
            return (
              <div 
                key={colIdx} 
                className="relative h-full overflow-hidden flex flex-col"
              >
                {isReelSpinning ? (
                  // Spinning animation: seamless vertical reel tape scrolling infinitely
                  <div 
                    className="w-full flex flex-col will-change-transform"
                    style={{
                      height: `${(SEAMLESS_STRIP.length / 3) * 100}%`,
                      animation: `reelSpin ${isTurbo ? '0.24s' : '0.38s'} linear infinite`,
                      animationDelay: `${colIdx * 0.05}s`,
                      filter: 'blur(3px)'
                    }}
                  >
                    {SEAMLESS_STRIP.map((symId, dummyIdx) => (
                      <div 
                        key={dummyIdx} 
                        className="w-full flex items-center justify-center p-1 sm:p-2"
                        style={{ height: `${100 / SEAMLESS_STRIP.length}%` }}
                      >
                        <SymbolRenderer symbolId={symId} />
                      </div>
                    ))}
                  </div>
                ) : (
                  // Static Result Grid with settling spring bounce
                  <div 
                    className="grid grid-rows-3 h-full w-full transition-transform duration-100 ease-out"
                    style={{
                      transform: `translateY(${bounceY}px)`
                    }}
                  >
                    {column.map((symbolId, rowIdx) => {
                      const winning = isCellWinning(colIdx, rowIdx);
                      return (
                        <div 
                          key={rowIdx} 
                          className={`relative w-full h-full p-1 sm:p-2 md:p-2.5 flex items-center justify-center transition-all duration-300
                            ${winning ? 'bg-red-950/30 shadow-[inset_0_0_24px_rgba(220,38,38,0.4)] scale-105 z-20' : 'opacity-95 hover:opacity-100'}`}
                        >
                          <SymbolRenderer symbolId={symbolId} isWinning={winning} />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Vertical dark grid line dividing columns */}
                {colIdx < 4 && (
                  <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#2a0101] via-[#520202]/30 to-[#2a0101] pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {/* Beautiful Glass reflection overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-b from-white/3 via-transparent to-black/35" />

        {/* Floating horizontal shadow dividers for Rows */}
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between">
          <div className="h-[33.33%] w-full border-b border-[#2d0202]/40 shadow-[inset_0_-10px_10px_rgba(0,0,0,0.4)]" />
          <div className="h-[33.33%] w-full border-b border-[#2d0202]/40 shadow-[inset_0_-10px_10px_rgba(0,0,0,0.4)]" />
        </div>

        {/* Canvas Layer overlaying everything for neon winning lines and stars */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 pointer-events-none z-30" 
        />
      </div>
    </div>
  );
};
export default SlotReels;
