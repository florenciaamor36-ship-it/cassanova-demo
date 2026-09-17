import { SYMBOLS, PAYLINES, SymbolDef, SymbolDef as GameSymbol } from '../data/gameData';

export interface SpinResult {
  grid: string[][]; // 5 reels x 3 rows grid
  winningLines: WinningLine[];
  totalWin: number;
  isFreeSpinsTriggered: boolean;
  freeSpinsCount: number;
  isBonusTriggered: boolean;
  scatterCount: number;
  bonusCount: number;
}

export interface WinningLine {
  lineId: number;
  symbolId: string;
  count: number;
  payout: number;
  coords: [number, number][]; // coordinates [reelIndex, rowIndex] of winning symbols
}

// Preset configurations for reproducible test outcomes
export type TestPreset = 'none' | 'five_vampires' | 'free_spins' | 'bonus_coffins' | 'mixed_wilds' | 'low_win';

export class GameEngine {
  // Generate a random symbol ID based on weightings
  private static getRandomSymbolId(): string {
    const weights: { [key: string]: number } = {
      vampire_lord: 3,       // Rare, high payout
      vampire_countess: 5,   // Medium-rare
      gothic_castle: 8,      // Mid
      blood_chalice: 10,     // Mid
      gothic_bat: 12,        // Mid
      gothic_a: 15,          // Common
      gothic_k: 16,          // Common
      gothic_q: 18,          // Common
      gothic_j: 20,          // Common
      wild_fangs: 4,         // Rare, substituting
      scatter_moon: 4,       // Rare, free spins trigger
      bonus_coffin: 4,       // Rare, bonus trigger
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;

    for (const [id, weight] of Object.entries(weights)) {
      if (rand < weight) {
        return id;
      }
      rand -= weight;
    }

    return 'gothic_j';
  }

  // Generate a complete 5x3 reel grid
  public static generateGrid(preset: TestPreset = 'none'): string[][] {
    const grid: string[][] = Array(5).fill(null).map(() => Array(3).fill(''));

    if (preset === 'five_vampires') {
      // Line 1 (middle row) is five Vampire Lords!
      for (let col = 0; col < 5; col++) {
        grid[col][1] = 'vampire_lord';
        grid[col][0] = this.getRandomSymbolId();
        grid[col][2] = this.getRandomSymbolId();
      }
      // Add a couple wild fangs just to make it extra flashy
      grid[0][0] = 'wild_fangs';
      grid[4][2] = 'wild_fangs';
    } 
    else if (preset === 'free_spins') {
      // Must contain at least 3 Scatter Moons in random spots
      // Fill random grid first
      for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 3; row++) {
          grid[col][row] = this.getRandomSymbolId();
          // Avoid natural scatter
          if (grid[col][row] === 'scatter_moon') grid[col][row] = 'gothic_q';
        }
      }
      // Force 3 Scatters at reels 0, 2, and 4
      grid[0][0] = 'scatter_moon';
      grid[2][1] = 'scatter_moon';
      grid[4][2] = 'scatter_moon';
    } 
    else if (preset === 'bonus_coffins') {
      // Must contain at least 3 Bonus Coffins
      for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 3; row++) {
          grid[col][row] = this.getRandomSymbolId();
          if (grid[col][row] === 'bonus_coffin') grid[col][row] = 'gothic_j';
        }
      }
      // Force 3 Coffins on reels 1, 2, and 3
      grid[1][1] = 'bonus_coffin';
      grid[2][2] = 'bonus_coffin';
      grid[3][0] = 'bonus_coffin';
    } 
    else if (preset === 'mixed_wilds') {
      // Fill with lots of WILDs and high symbols
      for (let col = 0; col < 5; col++) {
        grid[col][0] = 'wild_fangs';
        grid[col][1] = col % 2 === 0 ? 'vampire_countess' : 'wild_fangs';
        grid[col][2] = 'gothic_castle';
      }
    } 
    else if (preset === 'low_win') {
      // Fill middle row with J and Q
      for (let col = 0; col < 5; col++) {
        grid[col][1] = col < 3 ? 'gothic_j' : 'gothic_q';
        grid[col][0] = 'gothic_a';
        grid[col][2] = 'gothic_k';
      }
    } 
    else {
      // Normal random generator
      for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 3; row++) {
          grid[col][row] = this.getRandomSymbolId();
        }
      }
    }

    return grid;
  }

  // Calculate the slot spin winnings
  public static evaluateSpin(grid: string[][], betPerLine: number): SpinResult {
    const winningLines: WinningLine[] = [];
    let totalWin = 0;

    // Total Bet = betPerLine * 20 lines
    const totalBet = betPerLine * 20;

    // 1. Evaluate each of the 20 paylines
    PAYLINES.forEach((line) => {
      const lineSymbols = line.coords.map((rowIdx, colIdx) => grid[colIdx][rowIdx]);
      
      // Determine the best payout for this line by trying different substitution candidates
      let bestPayout = 0;
      let bestSymbolId = '';
      let bestCount = 0;

      // Regular symbols that WILD can substitute for
      const substituteCandidates = SYMBOLS.filter(s => s.type === 'high' || s.type === 'mid' || s.type === 'low');

      // Also evaluate if it's pure WILDs line
      const wildDef = SYMBOLS.find(s => s.id === 'wild_fangs')!;

      // Check pure WILD line first
      let consecutiveWilds = 0;
      for (let i = 0; i < 5; i++) {
        if (lineSymbols[i] === 'wild_fangs') {
          consecutiveWilds++;
        } else {
          break;
        }
      }
      if (consecutiveWilds >= 3) {
        const payoutMult = wildDef.payouts[consecutiveWilds] || 0;
        const payoutAmount = payoutMult * betPerLine;
        if (payoutAmount > bestPayout) {
          bestPayout = payoutAmount;
          bestSymbolId = 'wild_fangs';
          bestCount = consecutiveWilds;
        }
      }

      // Check each substitute candidate
      substituteCandidates.forEach((candidate) => {
        let count = 0;
        for (let i = 0; i < 5; i++) {
          const sym = lineSymbols[i];
          if (sym === candidate.id || sym === 'wild_fangs') {
            count++;
          } else {
            break; // Must be consecutive from left to right!
          }
        }

        if (count >= 3) {
          const payoutMult = candidate.payouts[count] || 0;
          const payoutAmount = payoutMult * betPerLine;
          if (payoutAmount > bestPayout) {
            bestPayout = payoutAmount;
            bestSymbolId = candidate.id;
            bestCount = count;
          }
        }
      });

      if (bestPayout > 0) {
        // Collect coordinates of the winning symbols in this line
        const coords: [number, number][] = [];
        for (let colIdx = 0; colIdx < bestCount; colIdx++) {
          coords.push([colIdx, line.coords[colIdx]]);
        }

        winningLines.push({
          lineId: line.id,
          symbolId: bestSymbolId,
          count: bestCount,
          payout: bestPayout,
          coords
        });

        totalWin += bestPayout;
      }
    });

    // 2. Evaluate Scatter Moons (Pay anywhere, triggers Free Spins!)
    let scatterCount = 0;
    const scatterCoords: [number, number][] = [];
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 3; row++) {
        if (grid[col][row] === 'scatter_moon') {
          scatterCount++;
          scatterCoords.push([col, row]);
        }
      }
    }

    let isFreeSpinsTriggered = false;
    let freeSpinsCount = 0;
    let scatterPayout = 0;

    if (scatterCount >= 3) {
      isFreeSpinsTriggered = true;
      freeSpinsCount = 10;
      
      // Scatter multiplier of total bet
      const scatterDef = SYMBOLS.find(s => s.id === 'scatter_moon')!;
      const mult = scatterDef.payouts[scatterCount] || 0;
      scatterPayout = mult * totalBet;
      totalWin += scatterPayout;

      // Add scatter as a virtual winning line for animation feedback
      winningLines.push({
        lineId: 99, // Special ID for Scatter
        symbolId: 'scatter_moon',
        count: scatterCount,
        payout: scatterPayout,
        coords: scatterCoords
      });
    }

    // 3. Evaluate Bonus Coffins (Triggers vampire coffin picking mini-game!)
    let bonusCount = 0;
    const bonusCoords: [number, number][] = [];
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 3; row++) {
        if (grid[col][row] === 'bonus_coffin') {
          bonusCount++;
          bonusCoords.push([col, row]);
        }
      }
    }

    let isBonusTriggered = false;
    if (bonusCount >= 3) {
      isBonusTriggered = true;
      
      // Add bonus to winning lines list for animations
      winningLines.push({
        lineId: 100, // Special ID for Bonus
        symbolId: 'bonus_coffin',
        count: bonusCount,
        payout: 0, // Bonus game awards custom prizes in the picker
        coords: bonusCoords
      });
    }

    return {
      grid,
      winningLines,
      totalWin,
      isFreeSpinsTriggered,
      freeSpinsCount,
      isBonusTriggered,
      scatterCount,
      bonusCount
    };
  }
}
export default GameEngine;
