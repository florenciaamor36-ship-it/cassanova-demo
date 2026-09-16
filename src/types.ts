export type SymbolId =
  | 'WILD'
  | 'SCATTER'
  | 'PHARAOH'
  | 'SCARAB'
  | 'EYE'
  | 'ANUBIS'
  | 'CHEST'
  | 'SCEPTER'
  | 'BASTET'
  | 'COBRA'
  | 'ANKH'
  | 'LOTUS'
  | 'ACE'
  | 'KING'
  | 'QUEEN'
  | 'JACK'
  | 'TEN'
  | 'NINE';

export interface SlotSymbol {
  id: SymbolId;
  name: string;
  subtitle?: string;
  image: string;
  isWild?: boolean;
  isScatter?: boolean;
  payouts: {
    2?: number;
    3: number;
    4: number;
    5: number;
  };
  color: string;
  glowColor: string;
}

export interface Payline {
  id: number;
  name: string;
  coords: [number, number, number, number, number]; // Row index (0, 1, 2) for reels 0..4
  color: string;
}

export interface WinResult {
  paylineId: number;
  paylineIndex: number;
  symbolId: SymbolId;
  symbolName: string;
  matchCount: number;
  baseMultiplier: number;
  isWildSubstituted: boolean;
  totalMultiplier: number; // 2x if wild in normal, multiplied by 3 in free spins
  lineBet: number;
  payout: number;
  winningCoords: Array<{ reel: number; row: number }>;
}

export interface SpinResult {
  grid: SymbolId[][]; // 5 reels x 3 rows [reel][row]
  wins: WinResult[];
  totalWin: number;
  scatterCount: number;
  scatterPayout: number;
  scatterCoords: Array<{ reel: number; row: number }>;
  isFreeSpinsTriggered: boolean;
  freeSpinsAwarded: number;
}

export interface GameHistoryItem {
  id: string;
  timestamp: number;
  bet: number;
  totalWin: number;
  net: number;
  isFreeSpinsRound: boolean;
  freeSpinsTriggered: boolean;
  topWinMultiplier: number;
  winCount: number;
  highlightSymbol?: SymbolId;
}

export interface GameStats {
  totalSpins: number;
  totalBet: number;
  totalWon: number;
  netProfit: number;
  biggestWin: number;
  freeSpinsRoundsTriggered: number;
  currentRtp: number;
}
