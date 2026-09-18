import React, { useEffect, useRef } from 'react';
import { Application, Assets, Container, Sprite, Texture, Ticker } from 'pixi.js';
import { SYMBOL_ASSETS } from './SymbolRenderer';

const REELS = 5;
const ROWS = 3;
const W = 800;
const H = 440;
const CELL_W = 144;
const CELL_H = 132;
const GAP = 10;
const PAD_X = 18;
const PAD_Y = 18;
const STRIP = ['vampire_lord','gothic_castle','blood_chalice','wild_fangs','vampire_countess','scatter_moon','bonus_coffin','gothic_bat','gothic_a','gothic_k','gothic_q','gothic_j'];

type Reel = { root: Container; symbols: Container; sprites: Sprite[]; y: number; speed: number; index: number };

interface Props { spinningReels: boolean[]; isTurbo: boolean; grid: string[][] }

/** Blood Covenant skin using the same pooled Pixi renderer model as Cleopatra. */
export const BloodPixiReels: React.FC<Props> = ({ spinningReels, isTurbo, grid }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const reelsRef = useRef<Reel[]>([]);
  const stateRef = useRef({ spinningReels, isTurbo, grid });
  stateRef.current = { spinningReels, isTurbo, grid };

  useEffect(() => {
    let dead = false;
    const app = new Application();
    appRef.current = app;
    const init = async () => {
      await app.init({ width: W, height: H, backgroundAlpha: 0, antialias: false, preference: 'webgl', powerPreference: 'high-performance', resolution: Math.min(window.devicePixelRatio || 1, 1.5), autoDensity: true });
      if (dead || !hostRef.current) { app.destroy(true, { children: true }); return; }
      const canvas = app.canvas;
      canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.display = 'block';
      hostRef.current.appendChild(canvas);
      const ids = Array.from(new Set([...STRIP, ...stateRef.current.grid.flat()]));
      const textures: Record<string, Texture> = {};
      await Promise.all(ids.map(async id => { try { textures[id] = await Assets.load(SYMBOL_ASSETS[id]?.src); } catch { textures[id] = Texture.WHITE; } }));
      if (dead) return;
      const stage = new Container(); app.stage.addChild(stage);
      const reels: Reel[] = [];
      for (let r = 0; r < REELS; r++) {
        const root = new Container(); root.x = PAD_X + r * (CELL_W + GAP); root.y = PAD_Y;
        const symbols = new Container(); root.addChild(symbols); stage.addChild(root);
        const sprites: Sprite[] = [];
        for (let i = 0; i < ROWS + 3; i++) {
          const id = STRIP[(r * 2 + i) % STRIP.length];
          const sprite = new Sprite(textures[id] || Texture.WHITE);
          sprite.width = CELL_W - 8; sprite.height = CELL_H - 8; sprite.x = 4; sprite.y = (i - 1) * CELL_H + 4;
          symbols.addChild(sprite); sprites.push(sprite);
        }
        reels.push({ root, symbols, sprites, y: 0, speed: 0, index: r });
      }
      reelsRef.current = reels;
      const tick = (ticker: Ticker) => {
        const state = stateRef.current;
        const dt = Math.min(ticker.deltaTime, 2.5);
        reels.forEach((reel, r) => {
          if (!state.spinningReels[r]) { reel.root.visible = false; return; }
          reel.root.visible = true;
          const target = state.isTurbo ? 46 : 36;
          reel.speed += (target - reel.speed) * Math.min(1, 0.16 * dt);
          reel.y += reel.speed * dt;
          while (reel.y >= CELL_H) {
            reel.y -= CELL_H;
            const next = STRIP[Math.floor(Math.random() * STRIP.length)];
            for (let i = reel.sprites.length - 1; i > 0; i--) reel.sprites[i].texture = reel.sprites[i - 1].texture;
            reel.sprites[0].texture = textures[next] || Texture.WHITE;
          }
          reel.symbols.y = reel.y;
        });
      };
      app.ticker.add(tick);
      appRef.current = app;
    };
    init();
    return () => { dead = true; if (appRef.current) { appRef.current.destroy(true, { children: true }); appRef.current = null; } };
  }, []);

  return <div ref={hostRef} className="absolute inset-0 z-[15] pointer-events-none overflow-hidden" aria-hidden="true" />;
};

export default BloodPixiReels;
