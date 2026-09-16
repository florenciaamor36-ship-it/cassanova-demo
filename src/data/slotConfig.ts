import { SlotSymbol, Payline, SymbolId, SpinResult, WinResult } from '../types';

import cleopatraQueenImg from '../assets/images/cleopatra_queen_portrait_1789481906325.jpg';
import pyramidScatterImg from '../assets/images/cleopatra_pyramid_scatter_1789481922355.jpg';
import pharaohMaskImg from '../assets/images/cleopatra_pharaoh_mask_1789481979630.jpg';
import goldScarabImg from '../assets/images/cleopatra_gold_scarab_1789481954310.jpg';
import eyeHorusImg from '../assets/images/cleopatra_eye_horus_1789481936322.jpg';
import anubisIdolImg from '../assets/images/cleopatra_anubis_idol_1789481965602.jpg';
import treasureChestImg from '../assets/images/egyptian_treasure_chest_1789483982786.jpg';
import pharaohScepterImg from '../assets/images/egyptian_pharaoh_scepter_1789484736298.jpg';
import bastetCatImg from '../assets/images/egyptian_bastet_cat_1789484722919.jpg';
import royalCobraImg from '../assets/images/egyptian_royal_cobra_1789484710648.jpg';
import goldenAnkhImg from '../assets/images/egyptian_golden_ankh_1789484698536.jpg';
import sacredLotusImg from '../assets/images/lotus_blue_medallion_1789489171747.jpg';

// High-fidelity Egyptian Jewel SVG badges for Royals
const createRoyalSvg = (letter: string, color: string, gemColor: string): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <radialGradient id="goldBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2a1b08"/>
          <stop offset="70%" stop-color="#140a03"/>
          <stop offset="100%" stop-color="#050201"/>
        </radialGradient>
        <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff6cc"/>
          <stop offset="35%" stop-color="#d4af37"/>
          <stop offset="70%" stop-color="#7a5500"/>
          <stop offset="100%" stop-color="#f5d77f"/>
        </linearGradient>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="40%" stop-color="${color}"/>
          <stop offset="80%" stop-color="#7a4200"/>
          <stop offset="100%" stop-color="#ffd875"/>
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <rect width="200" height="200" rx="28" fill="url(#goldBg)"/>
      <rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="url(#goldRim)" stroke-width="4"/>
      <rect x="16" y="16" width="168" height="168" rx="16" fill="none" stroke="#523908" stroke-width="1.5" stroke-dasharray="4,4"/>
      
      <!-- Corner jewels -->
      <polygon points="24,24 32,20 28,32" fill="${gemColor}"/>
      <polygon points="176,24 168,20 172,32" fill="${gemColor}"/>
      <polygon points="24,176 32,180 28,168" fill="${gemColor}"/>
      <polygon points="176,176 168,180 172,168" fill="${gemColor}"/>

      <!-- Central Egyptian Emblem Letter -->
      <text x="100" y="138" font-family="'Cinzel Decorative', 'Cinzel', serif" font-weight="900" font-size="105" text-anchor="middle" fill="url(#textGrad)" stroke="#1a0f00" stroke-width="4" filter="url(#glow)">${letter}</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SYMBOLS: Record<SymbolId, SlotSymbol> = {
  WILD: {
    id: 'WILD',
    name: 'Cleopatra Real',
    subtitle: 'COMODÍN 2X',
    image: cleopatraQueenImg,
    isWild: true,
    payouts: {
      2: 10,
      3: 200,
      4: 2000,
      5: 10000,
    },
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.9)',
  },
  SCATTER: {
    id: 'SCATTER',
    name: 'Pirámide de Guiza',
    subtitle: '15 TIROS GRATIS',
    image: pyramidScatterImg,
    isScatter: true,
    payouts: {
      2: 2,
      3: 5,
      4: 20,
      5: 100, // Pays total bet
    },
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.85)',
  },
  PHARAOH: {
    id: 'PHARAOH',
    name: 'Máscara del Faraón',
    subtitle: 'Jackpot Real',
    image: pharaohMaskImg,
    payouts: {
      2: 2,
      3: 25,
      4: 100,
      5: 750,
    },
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.7)',
  },
  SCARAB: {
    id: 'SCARAB',
    name: 'Escarabajo Dorado',
    subtitle: 'Símbolo Sagrado',
    image: goldScarabImg,
    payouts: {
      2: 2,
      3: 25,
      4: 100,
      5: 750,
    },
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.7)',
  },
  EYE: {
    id: 'EYE',
    name: 'Ojo de Horus',
    subtitle: 'Protección Divina',
    image: eyeHorusImg,
    payouts: {
      3: 15,
      4: 100,
      5: 400,
    },
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.7)',
  },
  ANUBIS: {
    id: 'ANUBIS',
    name: 'Ídolo de Anubis',
    subtitle: 'Guardián del Más Allá',
    image: anubisIdolImg,
    payouts: {
      3: 10,
      4: 75,
      5: 250,
    },
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.7)',
  },
  CHEST: {
    id: 'CHEST',
    name: 'Cofre del Faraón',
    subtitle: 'Gran Fortuna de Oro',
    image: treasureChestImg,
    payouts: {
      2: 3,
      3: 35,
      4: 150,
      5: 600,
    },
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.9)',
  },
  SCEPTER: {
    id: 'SCEPTER',
    name: 'Cetro y Flagelo',
    subtitle: 'Poder de Osiris',
    image: pharaohScepterImg,
    payouts: {
      3: 5,
      4: 30,
      5: 100,
    },
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.75)',
  },
  BASTET: {
    id: 'BASTET',
    name: 'Gata Sagrada Bastet',
    subtitle: 'Protectora del Templo',
    image: bastetCatImg,
    payouts: {
      3: 5,
      4: 25,
      5: 90,
    },
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.75)',
  },
  COBRA: {
    id: 'COBRA',
    name: 'Cobra Real Uraeus',
    subtitle: 'Corona del Nilo',
    image: royalCobraImg,
    payouts: {
      3: 5,
      4: 25,
      5: 90,
    },
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.75)',
  },
  ANKH: {
    id: 'ANKH',
    name: 'Ankh de la Vida',
    subtitle: 'Llave de la Inmortalidad',
    image: goldenAnkhImg,
    payouts: {
      3: 5,
      4: 25,
      5: 90,
    },
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.75)',
  },
  LOTUS: {
    id: 'LOTUS',
    name: 'Medallón Loto Azul',
    subtitle: 'Rayo Místico y Gran Suerte',
    image: sacredLotusImg,
    payouts: {
      2: 3,
      3: 30,
      4: 125,
      5: 500,
    },
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.95)',
  },
  ACE: {
    id: 'ACE',
    name: 'As Real',
    image: createRoyalSvg('A', '#ffd700', '#dc2626'),
    payouts: {
      3: 10,
      4: 50,
      5: 125,
    },
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
  KING: {
    id: 'KING',
    name: 'Rey Egipcio',
    image: createRoyalSvg('K', '#f97316', '#2563eb'),
    payouts: {
      3: 5,
      4: 50,
      5: 100,
    },
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.5)',
  },
  QUEEN: {
    id: 'QUEEN',
    name: 'Reina del Nilo',
    image: createRoyalSvg('Q', '#eab308', '#9333ea'),
    payouts: {
      3: 5,
      4: 25,
      5: 100,
    },
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.5)',
  },
  JACK: {
    id: 'JACK',
    name: 'Príncipe',
    image: createRoyalSvg('J', '#22c55e', '#0ea5e9'),
    payouts: {
      3: 5,
      4: 25,
      5: 100,
    },
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.5)',
  },
  TEN: {
    id: 'TEN',
    name: 'Diez Dorado',
    image: createRoyalSvg('10', '#3b82f6', '#f59e0b'),
    payouts: {
      3: 5,
      4: 25,
      5: 100,
    },
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  NINE: {
    id: 'NINE',
    name: 'Nueve Sagrado',
    image: createRoyalSvg('9', '#a855f7', '#10b981'),
    payouts: {
      2: 2,
      3: 5,
      4: 25,
      5: 100,
    },
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
};

// 20 Standard Cleopatra Slot Paylines across 5 reels x 3 rows (0=top, 1=middle, 2=bottom)
export const PAYLINES: Payline[] = [
  { id: 1, name: 'Línea 1 (Centro)', coords: [1, 1, 1, 1, 1], color: '#eab308' },
  { id: 2, name: 'Línea 2 (Superior)', coords: [0, 0, 0, 0, 0], color: '#38bdf8' },
  { id: 3, name: 'Línea 3 (Inferior)', coords: [2, 2, 2, 2, 2], color: '#f43f5e' },
  { id: 4, name: 'Línea 4 (V)', coords: [0, 1, 2, 1, 0], color: '#a855f7' },
  { id: 5, name: 'Línea 5 (V Invertida)', coords: [2, 1, 0, 1, 2], color: '#22c55e' },
  { id: 6, name: 'Línea 6 (Escalón Superior)', coords: [0, 0, 1, 0, 0], color: '#fb923c' },
  { id: 7, name: 'Línea 7 (Escalón Inferior)', coords: [2, 2, 1, 2, 2], color: '#06b6d4' },
  { id: 8, name: 'Línea 8 (Zigzag Superior)', coords: [1, 0, 0, 0, 1], color: '#ec4899' },
  { id: 9, name: 'Línea 9 (Zigzag Inferior)', coords: [1, 2, 2, 2, 1], color: '#84cc16' },
  { id: 10, name: 'Línea 10 (Arco)', coords: [1, 0, 1, 0, 1], color: '#f59e0b' },
  { id: 11, name: 'Línea 11 (Valle)', coords: [1, 2, 1, 2, 1], color: '#14b8a6' },
  { id: 12, name: 'Línea 12 (Onda Descendente)', coords: [0, 1, 1, 1, 0], color: '#6366f1' },
  { id: 13, name: 'Línea 13 (Onda Ascendente)', coords: [2, 1, 1, 1, 2], color: '#d946ef' },
  { id: 14, name: 'Línea 14 (Pirámide Baja)', coords: [0, 1, 0, 1, 0], color: '#e11d48' },
  { id: 15, name: 'Línea 15 (Pirámide Alta)', coords: [2, 1, 2, 1, 2], color: '#10b981' },
  { id: 16, name: 'Línea 16 (Diagonal Baja)', coords: [1, 1, 0, 1, 1], color: '#facc15' },
  { id: 17, name: 'Línea 17 (Diagonal Alta)', coords: [1, 1, 2, 1, 1], color: '#38bdf8' },
  { id: 18, name: 'Línea 18 (Escalón Doble)', coords: [0, 0, 2, 0, 0], color: '#c084fc' },
  { id: 19, name: 'Línea 19 (Invertido Doble)', coords: [2, 2, 0, 2, 2], color: '#4ade80' },
  { id: 20, name: 'Línea 20 (Cruce Faraón)', coords: [0, 2, 0, 2, 0], color: '#f472b6' },
];

export const BET_STEPS = [0.20, 0.40, 0.60, 1.00, 2.00, 4.00, 10.00, 20.00, 50.00, 100.00];

// Reel Strips filled with gorgeous authentic Egyptian Artifacts and Deities (~96.5% RTP)
export const REEL_STRIPS: SymbolId[][] = [
  // Reel 1
  ['LOTUS', 'ANKH', 'COBRA', 'BASTET', 'SCEPTER', 'CHEST', 'ANUBIS', 'EYE', 'SCARAB', 'LOTUS', 'ANKH', 'COBRA', 'PHARAOH', 'BASTET', 'SCEPTER', 'WILD', 'SCATTER', 'LOTUS', 'ANKH', 'EYE', 'COBRA', 'ANUBIS', 'BASTET', 'SCEPTER', 'CHEST', 'SCARAB'],
  // Reel 2
  ['ANKH', 'LOTUS', 'COBRA', 'BASTET', 'ANUBIS', 'SCEPTER', 'CHEST', 'EYE', 'PHARAOH', 'ANKH', 'LOTUS', 'SCATTER', 'COBRA', 'BASTET', 'WILD', 'SCEPTER', 'SCARAB', 'CHEST', 'ANKH', 'LOTUS', 'ANUBIS', 'COBRA', 'BASTET', 'EYE', 'SCEPTER', 'CHEST'],
  // Reel 3
  ['COBRA', 'ANKH', 'LOTUS', 'BASTET', 'SCEPTER', 'CHEST', 'ANUBIS', 'SCATTER', 'EYE', 'SCARAB', 'COBRA', 'ANKH', 'PHARAOH', 'WILD', 'LOTUS', 'BASTET', 'SCEPTER', 'CHEST', 'ANUBIS', 'COBRA', 'ANKH', 'EYE', 'BASTET', 'SCARAB', 'SCEPTER', 'CHEST'],
  // Reel 4
  ['BASTET', 'COBRA', 'ANKH', 'LOTUS', 'SCEPTER', 'CHEST', 'EYE', 'SCARAB', 'ANUBIS', 'SCATTER', 'BASTET', 'COBRA', 'WILD', 'PHARAOH', 'ANKH', 'LOTUS', 'SCEPTER', 'CHEST', 'EYE', 'ANUBIS', 'BASTET', 'COBRA', 'SCARAB', 'ANKH', 'SCEPTER', 'CHEST'],
  // Reel 5
  ['SCEPTER', 'BASTET', 'COBRA', 'ANKH', 'LOTUS', 'CHEST', 'ANUBIS', 'EYE', 'SCARAB', 'PHARAOH', 'SCATTER', 'SCEPTER', 'BASTET', 'WILD', 'COBRA', 'ANKH', 'LOTUS', 'CHEST', 'ANUBIS', 'EYE', 'SCEPTER', 'BASTET', 'SCARAB', 'COBRA', 'PHARAOH', 'CHEST'],
];

/**
 * Cryptographically fair random number generator for slot outcome
 */
export function getFairRandomInt(max: number): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/**
 * Generates a full 5-reel x 3-row grid using realistic reel stops
 */
export function generateSlotGrid(): SymbolId[][] {
  const grid: SymbolId[][] = [];

  for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
    const strip = REEL_STRIPS[reelIndex];
    const stopIndex = getFairRandomInt(strip.length);

    const reelSymbols: SymbolId[] = [
      strip[stopIndex % strip.length],
      strip[(stopIndex + 1) % strip.length],
      strip[(stopIndex + 2) % strip.length],
    ];

    grid.push(reelSymbols);
  }

  return grid;
}

/**
 * Evaluates wins on all active paylines, accounting for:
 * 1. Cleopatra WILD substituting for regular symbols and DOUBLING the line win (2x)
 * 2. 5-of-a-kind WILD top prize
 * 3. 3+ SCATTER anywhere triggering 15 Free Spins and paying a total bet multiplier
 * 4. Free Spins 3x multiplier applied to all line wins
 */
export function evaluateSpin(
  grid: SymbolId[][],
  totalBet: number,
  isFreeSpinsRound: boolean = false,
  activePaylinesCount: number = 20
): SpinResult {
  const lineBet = totalBet / activePaylinesCount;
  const wins: WinResult[] = [];
  let totalWin = 0;

  // 1. Evaluate Line Wins
  for (let p = 0; p < Math.min(activePaylinesCount, PAYLINES.length); p++) {
    const line = PAYLINES[p];
    const lineSymbols: { id: SymbolId; reel: number; row: number }[] = [];

    for (let reel = 0; reel < 5; reel++) {
      const row = line.coords[reel];
      lineSymbols.push({ id: grid[reel][row], reel, row });
    }

    // Determine leading symbol (from leftmost reel)
    const firstSymbolId = lineSymbols[0].id;
    if (firstSymbolId === 'SCATTER') {
      // Scatters do not pay on paylines; they pay anywhere on reels
      continue;
    }

    let targetSymbolId: SymbolId = firstSymbolId;
    let matchCount = 1;
    let isWildSubstituted = false;

    // Check if first symbol was WILD
    if (firstSymbolId === 'WILD') {
      // Find the first non-wild symbol on the line to match as target
      for (let i = 1; i < 5; i++) {
        if (lineSymbols[i].id !== 'WILD') {
          if (lineSymbols[i].id !== 'SCATTER') {
            targetSymbolId = lineSymbols[i].id;
            isWildSubstituted = true;
          }
          break;
        }
      }
    }

    // Now count consecutive matching symbols starting from reel 0
    for (let i = 1; i < 5; i++) {
      const current = lineSymbols[i].id;
      if (current === targetSymbolId || current === 'WILD') {
        if (current === 'WILD' && targetSymbolId !== 'WILD') {
          isWildSubstituted = true;
        }
        matchCount++;
      } else {
        break;
      }
    }

    // Also check if pure WILD line payout is higher (e.g. 2, 3, 4, 5 Wilds)
    let wildCount = 0;
    for (let i = 0; i < 5; i++) {
      if (lineSymbols[i].id === 'WILD') wildCount++;
      else break;
    }

    const targetDef = SYMBOLS[targetSymbolId];
    const wildDef = SYMBOLS.WILD;

    const regularPayoutMult = targetDef.payouts[matchCount as keyof typeof targetDef.payouts] || 0;
    const pureWildPayoutMult = wildDef.payouts[wildCount as keyof typeof wildDef.payouts] || 0;

    let finalSymbolId = targetSymbolId;
    let finalMatchCount = matchCount;
    let baseMultiplier = regularPayoutMult;

    // Wild double multiplier rule
    if (isWildSubstituted && baseMultiplier > 0) {
      baseMultiplier *= 2;
    }

    if (pureWildPayoutMult > baseMultiplier) {
      finalSymbolId = 'WILD';
      finalMatchCount = wildCount;
      baseMultiplier = pureWildPayoutMult;
      isWildSubstituted = false;
    }

    if (baseMultiplier > 0) {
      let finalMultiplier = baseMultiplier;
      if (isFreeSpinsRound) {
        finalMultiplier *= 3; // Free Spins 3X multiplier
      }

      const payout = parseFloat((finalMultiplier * lineBet).toFixed(2));
      totalWin += payout;

      wins.push({
        paylineId: line.id,
        paylineIndex: p,
        symbolId: finalSymbolId,
        symbolName: SYMBOLS[finalSymbolId].name,
        matchCount: finalMatchCount,
        baseMultiplier,
        isWildSubstituted,
        totalMultiplier: finalMultiplier,
        lineBet,
        payout,
        winningCoords: lineSymbols.slice(0, finalMatchCount).map(s => ({ reel: s.reel, row: s.row })),
      });
    }
  }

  // 2. Evaluate SCATTERS (Anywhere on 5 reels)
  const scatterCoords: Array<{ reel: number; row: number }> = [];
  for (let reel = 0; reel < 5; reel++) {
    for (let row = 0; row < 3; row++) {
      if (grid[reel][row] === 'SCATTER') {
        scatterCoords.push({ reel, row });
      }
    }
  }

  const scatterCount = scatterCoords.length;
  let scatterPayout = 0;
  let isFreeSpinsTriggered = false;
  let freeSpinsAwarded = 0;

  if (scatterCount >= 2) {
    const scatterMult = SYMBOLS.SCATTER.payouts[scatterCount as keyof typeof SYMBOLS.SCATTER.payouts] || 0;
    scatterPayout = parseFloat((scatterMult * totalBet).toFixed(2));
    totalWin += scatterPayout;

    if (scatterCount >= 3) {
      isFreeSpinsTriggered = true;
      freeSpinsAwarded = 15; // 15 free spins
    }
  }

  return {
    grid,
    wins,
    totalWin: parseFloat(totalWin.toFixed(2)),
    scatterCount,
    scatterPayout,
    scatterCoords,
    isFreeSpinsTriggered,
    freeSpinsAwarded,
  };
}
