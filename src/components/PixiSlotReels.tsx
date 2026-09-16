import React, { useEffect, useRef, useState } from 'react';
import { Application, Container, Sprite, Graphics, Assets, BlurFilter, Texture, Ticker } from 'pixi.js';
import { SymbolId, WinResult } from '../types';
import { SYMBOLS, PAYLINES, REEL_STRIPS } from '../data/slotConfig';
import { sound } from '../services/soundEngine';
import { perf } from '../utils/performance';

interface PixiSlotReelsProps {
  currentGrid: SymbolId[][];
  isSpinning: boolean;
  turboMode: boolean;
  wins: WinResult[];
  activePaylinePreview: number | null;
  onSpinComplete: () => void;
}

const REEL_COUNT = 5;
const ROW_COUNT = 3;
const SYMBOL_WIDTH = 144;
const SYMBOL_HEIGHT = 132;
const REEL_GAP = 10;
const PADDING_X = 18;
const PADDING_Y = 18;

// Total coordinate stage: 18*2 + 5*144 + 4*10 = 36 + 720 + 40 = 796px width, 18*2 + 3*132 = 36 + 396 = 432px height
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 440;

// 60 FPS Reel Movement Physics States
enum ReelPhase {
  IDLE = 'IDLE',
  WINDBACK = 'WINDBACK',
  ACCELERATING = 'ACCELERATING',
  RUNNING = 'RUNNING',
  DECELERATING = 'DECELERATING',
  BOUNCING = 'BOUNCING',
  STOPPED = 'STOPPED',
}

interface Reel60FpsState {
  index: number;
  container: Container;
  symbolsContainer: Container;
  blurFilter: BlurFilter | null;
  phase: ReelPhase;
  phaseTime: number;
  positionY: number;
  speedY: number;
  maxSpeed: number;
  stopScheduledTime: number;
  targetSymbols: SymbolId[];
  stripIndex: number;
  scatterDropped: boolean;
  sprites: Sprite[];
  currentSymbolsInStrip: SymbolId[];
}

export const PixiSlotReels: React.FC<PixiSlotReelsProps> = ({
  currentGrid,
  isSpinning,
  turboMode,
  wins,
  activePaylinePreview,
  onSpinComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const reelsRef = useRef<Reel60FpsState[]>([]);
  const texturesRef = useRef<Record<string, Texture>>({});
  const winGraphicsRef = useRef<Graphics | null>(null);
  const highlightGraphicsRef = useRef<Graphics | null>(null);
  const tickerCallbackRef = useRef<((ticker: Ticker) => void) | null>(null);
  const activeWinIndexRef = useRef<number>(0);
  const winCycleTimerRef = useRef<number>(0);

  const [texturesLoaded, setTexturesLoaded] = useState(false);

  // Initialize Pixi Application and 60 FPS Engine with responsive canvas scaling
  useEffect(() => {
    if (!containerRef.current) return;

    let isDestroyed = false;
    const app = new Application();

    const initPixi = async () => {
      try {
        const isLow = perf.isLowEnd();
        await app.init({
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          backgroundAlpha: 0,
          resolution: perf.getOptimizedDpr(),
          autoDensity: true,
          antialias: !isLow,
          preference: 'webgl',
          powerPreference: 'high-performance',
        });

        if (isDestroyed) {
          app.destroy(true, { children: true });
          return;
        }

        appRef.current = app;

        // Force canvas to be 100% responsive inside parent container without fixed overflow
        const canvas = app.canvas;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        canvas.style.objectFit = 'contain';

        containerRef.current?.appendChild(canvas);

        // Preload all symbol textures
        const textureMap: Record<string, Texture> = {};
        const loadPromises = Object.entries(SYMBOLS).map(async ([key, item]) => {
          try {
            const tex = await Assets.load(item.image);
            textureMap[key] = tex;
          } catch {
            textureMap[key] = Texture.WHITE;
          }
        });

        await Promise.all(loadPromises);
        texturesRef.current = textureMap;

        const mainStage = new Container();
        app.stage.addChild(mainStage);

        // Background Dark Reel Tracks & Column Dividers (rendered inside Pixi coordinate space)
        const bgGraphics = new Graphics();
        for (let r = 0; r < REEL_COUNT; r++) {
          const rx = PADDING_X + r * (SYMBOL_WIDTH + REEL_GAP);
          bgGraphics.roundRect(rx - 2, PADDING_Y - 2, SYMBOL_WIDTH + 4, ROW_COUNT * SYMBOL_HEIGHT + 4, 8);
          bgGraphics.fill({ color: 0x08040a, alpha: 0.95 });
          bgGraphics.stroke({ color: 0x6e4e16, width: 1.5, alpha: 0.7 });
        }

        // Inner vertical metallic guides between reels
        for (let r = 1; r < REEL_COUNT; r++) {
          const gx = PADDING_X + r * (SYMBOL_WIDTH + REEL_GAP) - REEL_GAP / 2;
          bgGraphics.moveTo(gx, PADDING_Y + 4);
          bgGraphics.lineTo(gx, PADDING_Y + ROW_COUNT * SYMBOL_HEIGHT - 4);
          bgGraphics.stroke({ color: 0xb48c36, width: 1.5, alpha: 0.45 });
        }
        mainStage.addChild(bgGraphics);

        // Build the 5 Reels with 60 FPS cylinder pooling
        const reels: Reel60FpsState[] = [];
        const POOL_SIZE = 6; // 1 buffer top, 3 visible rows, 2 buffer bottom

        for (let r = 0; r < REEL_COUNT; r++) {
          const reelContainer = new Container();
          reelContainer.x = PADDING_X + r * (SYMBOL_WIDTH + REEL_GAP);
          reelContainer.y = PADDING_Y;

          // Mask reel to exact 3 visible rows
          const mask = new Graphics();
          mask.roundRect(0, 0, SYMBOL_WIDTH, ROW_COUNT * SYMBOL_HEIGHT, 6);
          mask.fill({ color: 0xffffff });
          reelContainer.addChild(mask);
          reelContainer.mask = mask;

          const symbolsContainer = new Container();
          reelContainer.addChild(symbolsContainer);

          // Lightweight BlurFilter configured for low GPU overhead
          const blurFilter = new BlurFilter({
            strengthX: 0,
            strengthY: 0,
            quality: 1, // Ultra-fast single pass
          });
          // Do not attach filters while idle to avoid offscreen FBO creation
          symbolsContainer.filters = null;

          mainStage.addChild(reelContainer);

          // Initial symbols for this reel
          const initialSymbols: SymbolId[] = currentGrid[r] || ['PHARAOH', 'SCARAB', 'EYE'];
          const strip = REEL_STRIPS[r];
          const poolSymbols: SymbolId[] = [
            strip[0],
            initialSymbols[0],
            initialSymbols[1],
            initialSymbols[2],
            strip[1],
            strip[2],
          ];

          const sprites: Sprite[] = [];
          for (let i = 0; i < POOL_SIZE; i++) {
            const symId = poolSymbols[i];
            const tex = textureMap[symId] || Texture.WHITE;
            const sprite = new Sprite(tex);
            sprite.width = SYMBOL_WIDTH - 8;
            sprite.height = SYMBOL_HEIGHT - 8;
            sprite.x = 4;
            sprite.y = (i - 1) * SYMBOL_HEIGHT + 4; // -1 is top buffer
            symbolsContainer.addChild(sprite);
            sprites.push(sprite);
          }

          reels.push({
            index: r,
            container: reelContainer,
            symbolsContainer,
            blurFilter,
            phase: ReelPhase.IDLE,
            phaseTime: 0,
            positionY: 0,
            speedY: 0,
            maxSpeed: 38,
            stopScheduledTime: 0,
            targetSymbols: initialSymbols,
            stripIndex: 0,
            scatterDropped: false,
            sprites,
            currentSymbolsInStrip: poolSymbols,
          });
        }

        reelsRef.current = reels;

        // Overlay graphics for Win Lines & Pulsing highlights
        const highlightG = new Graphics();
        const winG = new Graphics();
        mainStage.addChild(highlightG);
        mainStage.addChild(winG);

        highlightGraphicsRef.current = highlightG;
        winGraphicsRef.current = winG;

        setTexturesLoaded(true);
        app.render();
      } catch (err) {
        console.error('Error initializing PixiJS 60FPS slot engine:', err);
      }
    };

    initPixi();

    return () => {
      isDestroyed = true;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // 60 FPS Slot Reel Simulation Loop via PixiJS Ticker
  useEffect(() => {
    if (!isSpinning || !texturesLoaded || !appRef.current || !reelsRef.current.length) return;

    const app = appRef.current;
    const reels = reelsRef.current;
    const textureMap = texturesRef.current;

    sound.startSpinningTicks();

    // Clear old win lines
    if (winGraphicsRef.current) winGraphicsRef.current.clear();
    if (highlightGraphicsRef.current) highlightGraphicsRef.current.clear();

    const startTime = performance.now();
    let scatterCountSoFar = 0;

    const enableBlur = !perf.isLowEnd();

    // Configure 60 FPS mechanical physics per reel
    reels.forEach((reel, r) => {
      reel.phase = ReelPhase.WINDBACK;
      reel.phaseTime = 0;
      reel.positionY = 0;
      reel.symbolsContainer.y = 0;
      reel.speedY = 0;
      reel.maxSpeed = turboMode ? 44 : 34;
      reel.targetSymbols = currentGrid[r];
      reel.scatterDropped = false;

      // Only mount blur filter during motion if hardware supports it
      if (enableBlur && reel.blurFilter) {
        reel.symbolsContainer.filters = [reel.blurFilter];
      } else {
        reel.symbolsContainer.filters = null;
      }

      let stopDelay = turboMode ? 280 + r * 130 : 750 + r * 280;

      // Tension anticipation: lengthen reel 4 and 5 if 2+ Scatters hit early
      if (scatterCountSoFar >= 2 && r >= 3) {
        stopDelay += 1000;
        sound.playAnticipation();
      }
      if (reel.targetSymbols.includes('SCATTER')) {
        scatterCountSoFar++;
      }

      reel.stopScheduledTime = startTime + stopDelay;
    });

    // 60 FPS Hardware-synced tick listener
    const onTick = (ticker: Ticker) => {
      const dt = ticker.deltaTime;
      const now = performance.now();
      let allReelsCompleted = true;

      reels.forEach((reel) => {
        const r = reel.index;
        const strip = REEL_STRIPS[r];

        switch (reel.phase) {
          case ReelPhase.WINDBACK: {
            allReelsCompleted = false;
            reel.phaseTime += dt / 60;
            // Mechanical reverse pull (-12px)
            reel.positionY -= 2.0 * dt;
            reel.symbolsContainer.y = reel.positionY;

            if (reel.phaseTime >= (turboMode ? 0.05 : 0.1)) {
              reel.phase = ReelPhase.ACCELERATING;
              reel.phaseTime = 0;
            }
            break;
          }

          case ReelPhase.ACCELERATING: {
            allReelsCompleted = false;
            reel.phaseTime += dt / 60;
            reel.speedY += 4.5 * dt;

            if (reel.speedY >= reel.maxSpeed) {
              reel.speedY = reel.maxSpeed;
              reel.phase = ReelPhase.RUNNING;
            }

            reel.positionY += reel.speedY * dt;
            reel.symbolsContainer.y = reel.positionY % SYMBOL_HEIGHT;
            if (reel.blurFilter) {
              reel.blurFilter.strengthY = Math.min(6, reel.speedY * 0.15);
            }

            updateCylinderPool(reel, strip, textureMap);
            break;
          }

          case ReelPhase.RUNNING: {
            allReelsCompleted = false;
            reel.positionY += reel.speedY * dt;
            reel.symbolsContainer.y = reel.positionY % SYMBOL_HEIGHT;
            if (reel.blurFilter) {
              reel.blurFilter.strengthY = turboMode ? 5 : 6;
            }

            updateCylinderPool(reel, strip, textureMap);

            if (now >= reel.stopScheduledTime) {
              reel.phase = ReelPhase.DECELERATING;
              reel.phaseTime = 0;
            }
            break;
          }

          case ReelPhase.DECELERATING: {
            allReelsCompleted = false;
            reel.phaseTime += dt / 60;
            reel.speedY = Math.max(8, reel.speedY - 3.2 * dt);
            reel.positionY += reel.speedY * dt;
            reel.symbolsContainer.y = reel.positionY % SYMBOL_HEIGHT;
            if (reel.blurFilter) {
              reel.blurFilter.strengthY = Math.max(0, reel.speedY * 0.1);
            }

            updateCylinderPool(reel, strip, textureMap);

            if (reel.speedY <= 12) {
              reel.phase = ReelPhase.BOUNCING;
              reel.phaseTime = 0;
              if (reel.blurFilter) reel.blurFilter.strengthY = 0;

              injectTargetSymbols(reel, textureMap);
              sound.playReelStop(r);

              if (reel.targetSymbols.includes('SCATTER') && !reel.scatterDropped) {
                reel.scatterDropped = true;
                sound.playScatterDrop(r + 1);
              }
            }
            break;
          }

          case ReelPhase.BOUNCING: {
            allReelsCompleted = false;
            reel.phaseTime += dt / 60;

            // Damped Harmonic Oscillation
            const amplitude = turboMode ? 7 : 14;
            const omega = 28;
            const decay = 15;
            const bounceY = amplitude * Math.sin(omega * reel.phaseTime) * Math.exp(-decay * reel.phaseTime);

            reel.symbolsContainer.y = bounceY;

            if (reel.phaseTime >= (turboMode ? 0.18 : 0.3) || Math.abs(bounceY) < 0.3) {
              reel.symbolsContainer.y = 0;
              reel.phase = ReelPhase.STOPPED;
            }
            break;
          }

          case ReelPhase.STOPPED:
          case ReelPhase.IDLE:
          default: {
            reel.symbolsContainer.y = 0;
            break;
          }
        }
      });

      // Anticipation Adrenaline FX: Electric Cyan & Golden Tension Field around spinning reels waiting for 3rd scatter
      if (highlightGraphicsRef.current) {
        const highG = highlightGraphicsRef.current;
        highG.clear();
        if (scatterCountSoFar >= 2) {
          reels.forEach((rState) => {
            if (rState.index >= 3 && rState.phase !== ReelPhase.STOPPED && rState.phase !== ReelPhase.IDLE) {
              const rx = PADDING_X + rState.index * (SYMBOL_WIDTH + REEL_GAP);
              const pulseTension = 0.6 + 0.4 * Math.sin(now * 0.02);
              // Electric cyan & gold glowing tension border
              highG.roundRect(rx - 3, PADDING_Y - 3, SYMBOL_WIDTH + 6, ROW_COUNT * SYMBOL_HEIGHT + 6, 8);
              highG.stroke({ color: 0x38bdf8, width: 4, alpha: pulseTension });
              highG.roundRect(rx - 1, PADDING_Y - 1, SYMBOL_WIDTH + 2, ROW_COUNT * SYMBOL_HEIGHT + 2, 8);
              highG.stroke({ color: 0xfbbf24, width: 2, alpha: pulseTension * 0.85 });

              // High-voltage energy spark traveling vertically down the reel edges
              const sparkY = PADDING_Y + ((now * 0.45) % (ROW_COUNT * SYMBOL_HEIGHT));
              highG.circle(rx + 2, sparkY, 3.5);
              highG.fill({ color: 0xffffff, alpha: 0.95 });
              highG.circle(rx + SYMBOL_WIDTH - 2, sparkY, 3.5);
              highG.fill({ color: 0x38bdf8, alpha: 0.95 });
            }
          });
        }
      }

      // All 5 reels completed their 60 FPS motion
      if (allReelsCompleted) {
        if (highlightGraphicsRef.current) highlightGraphicsRef.current.clear();
        app.ticker.remove(onTick);
        tickerCallbackRef.current = null;
        reels.forEach((r) => {
          if (r.symbolsContainer.filters) {
            r.symbolsContainer.filters = null;
          }
        });
        sound.stopSpinningTicks();
        onSpinComplete();
      }
    };

    tickerCallbackRef.current = onTick;
    app.ticker.add(onTick);

    return () => {
      if (tickerCallbackRef.current && appRef.current) {
        appRef.current.ticker.remove(tickerCallbackRef.current);
        tickerCallbackRef.current = null;
      }
      sound.stopSpinningTicks();
    };
  }, [isSpinning, currentGrid, turboMode, texturesLoaded, onSpinComplete]);

  // Cylinder Pool symbol recycling
  const updateCylinderPool = (
    reel: Reel60FpsState,
    strip: SymbolId[],
    textureMap: Record<string, Texture>
  ) => {
    if (reel.positionY >= SYMBOL_HEIGHT) {
      reel.positionY -= SYMBOL_HEIGHT;
      reel.stripIndex = (reel.stripIndex + 1) % strip.length;

      const nextSym = strip[reel.stripIndex];
      for (let i = reel.sprites.length - 1; i > 0; i--) {
        reel.sprites[i].texture = reel.sprites[i - 1].texture;
      }
      reel.sprites[0].texture = textureMap[nextSym] || Texture.WHITE;
    }
  };

  // Set the 3 visible rows to exact target outcome symbols
  const injectTargetSymbols = (
    reel: Reel60FpsState,
    textureMap: Record<string, Texture>
  ) => {
    const strip = REEL_STRIPS[reel.index];
    const target = reel.targetSymbols;

    const finalIds: SymbolId[] = [
      strip[0],
      target[0],
      target[1],
      target[2],
      strip[1],
      strip[2],
    ];

    reel.sprites.forEach((sprite, idx) => {
      const symId = finalIds[idx];
      sprite.texture = textureMap[symId] || Texture.WHITE;
      sprite.y = (idx - 1) * SYMBOL_HEIGHT + 4;
    });
  };

  // Helper to draw a jagged lightning bolt branch in PixiJS
  const drawLightningBolt = (
    g: Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    displace: number,
    color: number,
    width: number,
    alpha: number
  ) => {
    const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
    const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;
    const q1X = (x1 + midX) / 2 + (Math.random() - 0.5) * (displace * 0.6);
    const q1Y = (y1 + midY) / 2 + (Math.random() - 0.5) * (displace * 0.6);
    const q2X = (midX + x2) / 2 + (Math.random() - 0.5) * (displace * 0.6);
    const q2Y = (midY + y2) / 2 + (Math.random() - 0.5) * (displace * 0.6);

    g.moveTo(x1, y1);
    g.lineTo(q1X, q1Y);
    g.lineTo(midX, midY);
    g.lineTo(q2X, q2Y);
    g.lineTo(x2, y2);
    g.stroke({ color, width, alpha });

    // Branching small spark
    if (Math.random() > 0.4) {
      const bX = midX + (Math.random() - 0.5) * displace * 0.8;
      const bY = midY + (Math.random() - 0.5) * displace * 0.8;
      g.moveTo(midX, midY);
      g.lineTo(bX, bY);
      g.stroke({ color: 0x93c5fd, width: Math.max(1, width - 1.5), alpha: alpha * 0.75 });
    }
  };

  // Helper to draw a 4-point Egyptian diamond star in PixiJS
  const drawDiamondStar = (
    g: Graphics,
    sx: number,
    sy: number,
    radius: number,
    color: number,
    alpha: number
  ) => {
    g.poly([
      sx, sy - radius,
      sx + radius * 0.32, sy - radius * 0.32,
      sx + radius, sy,
      sx + radius * 0.32, sy + radius * 0.32,
      sx, sy + radius,
      sx - radius * 0.32, sy + radius * 0.32,
      sx - radius, sy,
      sx - radius * 0.32, sy - radius * 0.32,
    ]);
    g.fill({ color, alpha });
  };

  // Winning paylines animation loop with high-adrenaline symbol motion & canvas VFX
  useEffect(() => {
    if (isSpinning || !winGraphicsRef.current || !highlightGraphicsRef.current) return;

    const winG = winGraphicsRef.current;
    const highG = highlightGraphicsRef.current;

    winG.clear();
    highG.clear();

    const resetAllSprites = () => {
      reelsRef.current.forEach((reel) => {
        reel.sprites.forEach((sprite, idx) => {
          sprite.width = SYMBOL_WIDTH - 8;
          sprite.height = SYMBOL_HEIGHT - 8;
          sprite.x = 4;
          sprite.y = (idx - 1) * SYMBOL_HEIGHT + 4;
        });
      });
    };

    if (activePaylinePreview !== null) {
      resetAllSprites();
      const payline = PAYLINES.find((p) => p.id === activePaylinePreview);
      if (payline) {
        drawPayline(winG, payline.coords, payline.color, 4, 0.95);
      }
      return;
    }

    if (wins.length === 0) {
      resetAllSprites();

      // Subtle ambient gold glint shimmer across random high-tier symbols during idle
      let idleAnimId: number;
      const animateIdle = (now: number) => {
        highG.clear();
        const period = (now % 3500) / 3500; // 0 to 1 every 3.5s
        if (period < 0.25) {
          const t = period / 0.25; // 0 to 1
          const glintAlpha = Math.sin(t * Math.PI) * 0.65;
          // Shimmer across reel 2 row 1 (center)
          const cx = PADDING_X + 2 * (SYMBOL_WIDTH + REEL_GAP) + SYMBOL_WIDTH / 2;
          const cy = PADDING_Y + 1 * SYMBOL_HEIGHT + SYMBOL_HEIGHT / 2;
          drawDiamondStar(highG, cx - 35 + t * 70, cy - 25 + t * 50, 8, 0xffea79, glintAlpha);
        }
        idleAnimId = requestAnimationFrame(animateIdle);
      };
      idleAnimId = requestAnimationFrame(animateIdle);
      return () => {
        cancelAnimationFrame(idleAnimId);
        highG.clear();
        resetAllSprites();
      };
    }

    let cycleId: number;
    let lastTick = performance.now();
    let playedSfxWinIndex = -1;

    const animateWins = (now: number) => {
      const elapsed = now - lastTick;
      winCycleTimerRef.current += elapsed;
      lastTick = now;

      if (winCycleTimerRef.current > 1900) {
        winCycleTimerRef.current = 0;
        resetAllSprites();
        activeWinIndexRef.current = (activeWinIndexRef.current + 1) % wins.length;
      }

      const activeWin = wins[activeWinIndexRef.current] || wins[0];

      // Trigger high-adrenaline specialized sound effects for CHEST & LOTUS when cycle changes
      if (playedSfxWinIndex !== activeWinIndexRef.current) {
        playedSfxWinIndex = activeWinIndexRef.current;
        if (activeWin.symbolId === 'CHEST') {
          sound.playGoldChestShimmer();
        } else if (activeWin.symbolId === 'LOTUS') {
          sound.playLotusLightningStrike();
        }
      }

      const payline = PAYLINES.find((p) => p.id === activeWin.paylineId);

      winG.clear();
      highG.clear();

      const pulse = 0.75 + 0.25 * Math.sin(now * 0.009);
      const bounceScale = 1.0 + 0.12 * Math.abs(Math.sin(now * 0.007));

      if (payline) {
        drawPayline(winG, payline.coords, payline.color, 5, pulse);
      }

      // 1. High Adrenaline: Scale & Bounce the winning symbol sprites dynamically in 60 FPS
      activeWin.winningCoords.forEach((coord) => {
        const reel = reelsRef.current[coord.reel];
        if (reel && reel.sprites[coord.row + 1]) {
          const sprite = reel.sprites[coord.row + 1];
          const w = (SYMBOL_WIDTH - 8) * bounceScale;
          const h = (SYMBOL_HEIGHT - 8) * bounceScale;
          sprite.width = w;
          sprite.height = h;
          sprite.x = 4 - (w - (SYMBOL_WIDTH - 8)) / 2;
          sprite.y = coord.row * SYMBOL_HEIGHT + 4 - (h - (SYMBOL_HEIGHT - 8)) / 2;
        }

        const x = PADDING_X + coord.reel * (SYMBOL_WIDTH + REEL_GAP);
        const y = PADDING_Y + coord.row * SYMBOL_HEIGHT;
        const cx = x + SYMBOL_WIDTH / 2;
        const cy = y + SYMBOL_HEIGHT / 2;

        // 2. Rotating Divine Sunbeam God-Rays behind the winning symbol
        const numRays = activeWin.symbolId === 'CHEST' ? 16 : 10;
        const rotAngle = (now * 0.002) % (Math.PI * 2);
        for (let i = 0; i < numRays; i++) {
          const a = rotAngle + (i * Math.PI * 2) / numRays;
          const rInner = 36;
          const rOuter = (activeWin.symbolId === 'CHEST' ? 84 : 64) + 8 * Math.sin(now * 0.009 + i);
          const x1 = cx + Math.cos(a) * rInner;
          const y1 = cy + Math.sin(a) * rInner;
          const x2 = cx + Math.cos(a) * rOuter;
          const y2 = cy + Math.sin(a) * rOuter;
          highG.moveTo(x1, y1);
          highG.lineTo(x2, y2);
          highG.stroke({
            color:
              activeWin.symbolId === 'CHEST'
                ? 0xfff3a0
                : activeWin.symbolId === 'LOTUS'
                ? 0x67e8f9
                : activeWin.isWildSubstituted
                ? 0xffea79
                : 0xfbbf24,
            width: activeWin.symbolId === 'CHEST' ? 3.5 : 2.5,
            alpha: 0.65 * pulse,
          });
        }

        // 3. Double-Layered Glowing Electric Frame
        const frameGlowColor =
          activeWin.symbolId === 'CHEST'
            ? 0xf59e0b
            : activeWin.symbolId === 'LOTUS'
            ? 0x0284c7
            : activeWin.isWildSubstituted
            ? 0xffea79
            : 0xf59e0b;
        const frameInnerColor =
          activeWin.symbolId === 'CHEST'
            ? 0xfffbeb
            : activeWin.symbolId === 'LOTUS'
            ? 0xe0f2fe
            : activeWin.isWildSubstituted
            ? 0xffffff
            : 0xffe066;

        highG.roundRect(x - 2, y - 2, SYMBOL_WIDTH + 4, SYMBOL_HEIGHT + 4, 10);
        highG.stroke({
          color: frameGlowColor,
          width: 5.5,
          alpha: pulse * 0.45,
        });

        highG.roundRect(x + 2, y + 2, SYMBOL_WIDTH - 4, SYMBOL_HEIGHT - 4, 8);
        highG.stroke({
          color: frameInnerColor,
          width: 3.5,
          alpha: pulse,
        });

        // 4. Sparkling Diamond Star Particles at the 4 corners
        const starRadius = (activeWin.symbolId === 'CHEST' ? 7 : 5) + 2 * Math.sin(now * 0.01);
        const starColor =
          activeWin.symbolId === 'CHEST'
            ? 0xfff08a
            : activeWin.symbolId === 'LOTUS'
            ? 0x38bdf8
            : activeWin.isWildSubstituted
            ? 0xfff08a
            : 0xfacc15;
        drawDiamondStar(highG, x + 6, y + 6, starRadius, starColor, pulse);
        drawDiamondStar(highG, x + SYMBOL_WIDTH - 6, y + 6, starRadius, starColor, pulse);
        drawDiamondStar(highG, x + 6, y + SYMBOL_HEIGHT - 6, starRadius, starColor, pulse);
        drawDiamondStar(highG, x + SYMBOL_WIDTH - 6, y + SYMBOL_HEIGHT - 6, starRadius, starColor, pulse);

        // 5. SPECIAL GOLD CHEST EFFECT: Brilliant radiant golden flash + exploding sparkles
        if (activeWin.symbolId === 'CHEST') {
          // Intense golden flash expansion circles
          const flashPulse = Math.sin(now * 0.008);
          const flashRadius = 68 + 14 * flashPulse;
          highG.circle(cx, cy, flashRadius);
          highG.stroke({ color: 0xffe066, width: 4.5, alpha: 0.75 * pulse });

          highG.circle(cx, cy, flashRadius + 16);
          highG.stroke({ color: 0xfffbeb, width: 2, alpha: 0.45 * pulse });

          // Radiating golden flare spikes & starburst
          const numFlares = 8;
          for (let f = 0; f < numFlares; f++) {
            const angle = (now * 0.003) + (f * Math.PI * 2) / numFlares;
            const dist = 55 + 24 * Math.sin(now * 0.01 + f);
            const fx = cx + Math.cos(angle) * dist;
            const fy = cy + Math.sin(angle) * dist;
            drawDiamondStar(highG, fx, fy, 6 + 2 * Math.sin(now * 0.015 + f), 0xffffff, 0.9);
          }

          // Shimmering gold sheen box over chest
          highG.roundRect(x, y, SYMBOL_WIDTH, SYMBOL_HEIGHT, 8);
          highG.fill({ color: 0xffd700, alpha: 0.18 + 0.12 * Math.sin(now * 0.014) });
        }

        // 6. SPECIAL BLUE LOTUS MEDALLION EFFECT: High-Voltage Lightning Bolts that propagate across the screen!
        if (activeWin.symbolId === 'LOTUS') {
          // Radial electric aura shockwave around the medallion
          highG.circle(cx, cy, 62 + 8 * Math.sin(now * 0.016));
          highG.stroke({ color: 0x38bdf8, width: 3.5, alpha: 0.85 * pulse });
          highG.circle(cx, cy, 76 + 6 * Math.cos(now * 0.014));
          highG.stroke({ color: 0x0284c7, width: 1.5, alpha: 0.5 * pulse });

          // Blue electric core wash
          highG.roundRect(x, y, SYMBOL_WIDTH, SYMBOL_HEIGHT, 8);
          highG.fill({ color: 0x0284c7, alpha: 0.15 + 0.1 * Math.sin(now * 0.018) });

          // Propagate electric lightning rays to other symbols across the reel grid looking for luck!
          for (let r = 0; r < REEL_COUNT; r++) {
            for (let row = 0; row < ROW_COUNT; row++) {
              if (r === coord.reel && row === coord.row) continue;
              // Propagate lightning arcs outward across screen
              const targetX = PADDING_X + r * (SYMBOL_WIDTH + REEL_GAP) + SYMBOL_WIDTH / 2;
              const targetY = PADDING_Y + row * SYMBOL_HEIGHT + SYMBOL_HEIGHT / 2;

              // Distance-based lightning arc calculation
              const dx = targetX - cx;
              const dy = targetY - cy;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // Wave propagation phase: electric shockwave sweeps across the reel matrix
              const wavePhase = (now * 0.005 - dist * 0.008) % (Math.PI * 2);
              if (Math.sin(wavePhase) > 0.45) {
                // Arc lightning from this Lotus to other reel symbol
                drawLightningBolt(highG, cx, cy, targetX, targetY, 32, 0x00f0ff, 3, 0.85);
                drawLightningBolt(highG, cx, cy, targetX, targetY, 20, 0xffffff, 1.5, 0.95);

                // Electric spark at the touched target symbol
                drawDiamondStar(highG, targetX, targetY, 7, 0x67e8f9, 0.9);
                highG.circle(targetX, targetY, 14);
                highG.stroke({ color: 0x38bdf8, width: 2, alpha: 0.75 });
              }
            }
          }
        }

        // 7. Special Cleopatra WILD Multiplier Aura
        if (activeWin.isWildSubstituted && activeWin.symbolId !== 'CHEST' && activeWin.symbolId !== 'LOTUS') {
          highG.circle(cx, cy, 60 + 4 * Math.sin(now * 0.012));
          highG.stroke({ color: 0xffd700, width: 2.5, alpha: 0.8 * pulse });

          for (let s = 0; s < 4; s++) {
            const sa = now * 0.004 + (s * Math.PI) / 2;
            const sx = cx + Math.cos(sa) * 60;
            const sy = cy + Math.sin(sa) * 52;
            drawDiamondStar(highG, sx, sy, 5, 0x38bdf8, pulse * 0.9);
          }
        }
      });

      cycleId = requestAnimationFrame(animateWins);
    };

    cycleId = requestAnimationFrame(animateWins);

    return () => {
      cancelAnimationFrame(cycleId);
      winG.clear();
      highG.clear();
      resetAllSprites();
    };
  }, [wins, isSpinning, activePaylinePreview]);

  const drawPayline = (
    g: Graphics,
    coords: [number, number, number, number, number],
    colorHex: string,
    lineWidth: number,
    alpha: number
  ) => {
    const numColor = parseInt(colorHex.replace('#', '0x'), 16);

    const points: Array<{ x: number; y: number }> = [];
    for (let r = 0; r < REEL_COUNT; r++) {
      const row = coords[r];
      const x = PADDING_X + r * (SYMBOL_WIDTH + REEL_GAP) + SYMBOL_WIDTH / 2;
      const y = PADDING_Y + row * SYMBOL_HEIGHT + SYMBOL_HEIGHT / 2;
      points.push({ x, y });
    }

    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.stroke({ color: numColor, width: lineWidth + 5, alpha: alpha * 0.35 });

    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
    }
    g.stroke({ color: 0xffffff, width: lineWidth - 1.5, alpha: alpha * 0.95 });

    points.forEach((pt) => {
      g.circle(pt.x, pt.y, 5);
      g.fill({ color: numColor, alpha });
      g.circle(pt.x, pt.y, 2.5);
      g.fill({ color: 0xffffff, alpha });
    });
  };

  return (
    <div
      id="pixi-reels-wrapper"
      className="relative w-full aspect-[800/420] max-h-[70vh] sm:max-h-[76vh] mx-auto overflow-hidden rounded-xl bg-gradient-to-b from-stone-950 via-[#0d0714] to-stone-950 shadow-[0_0_40px_rgba(0,0,0,0.9)] border border-amber-500/30 flex items-center justify-center"
    >
      {/* Pixi Canvas Mounting Container */}
      <div
        ref={containerRef}
        id="pixi-canvas-container"
        className="w-full h-full flex items-center justify-center overflow-hidden"
      />

      {/* Subtle Golden Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(0,0,0,0.65)_100%)] shadow-inner" />
    </div>
  );
};
