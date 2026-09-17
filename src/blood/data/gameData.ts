export interface SymbolDef {
  id: string;
  name: string;
  displayName: string;
  type: 'high' | 'mid' | 'low' | 'wild' | 'scatter' | 'bonus';
  payouts: { [key: number]: number }; // payout multiplier based on count (3, 4, or 5 matching symbols)
  description: string;
  glowColor: string;
  themeColor: string;
}

export const SYMBOLS: SymbolDef[] = [
  {
    id: 'vampire_lord',
    name: 'Vampire Lord',
    displayName: 'Señor Vlad',
    type: 'high',
    payouts: { 3: 100, 4: 500, 5: 2500 },
    description: 'El símbolo supremo. Paga hasta 2500x la apuesta de línea.',
    glowColor: 'rgba(239, 68, 68, 0.8)', // red glow
    themeColor: '#ef4444'
  },
  {
    id: 'vampire_countess',
    name: 'Vampire Countess',
    displayName: 'Condesa Carmilla',
    type: 'high',
    payouts: { 3: 50, 4: 250, 5: 1000 },
    description: 'Elegancia mortal. Paga hasta 1000x la apuesta de línea.',
    glowColor: 'rgba(236, 72, 153, 0.8)', // pink/magenta glow
    themeColor: '#ec4899'
  },
  {
    id: 'gothic_castle',
    name: 'Gothic Castle',
    displayName: 'Castillo Oscuro',
    type: 'mid',
    payouts: { 3: 30, 4: 150, 5: 500 },
    description: 'El hogar del clan. Paga hasta 500x la apuesta de línea.',
    glowColor: 'rgba(139, 92, 246, 0.8)', // purple glow
    themeColor: '#8b5cf6'
  },
  {
    id: 'blood_chalice',
    name: 'Blood Chalice',
    displayName: 'Cáliz de Sangre',
    type: 'mid',
    payouts: { 3: 20, 4: 100, 5: 300 },
    description: 'La esencia de la vida eterna. Paga hasta 300x la apuesta de línea.',
    glowColor: 'rgba(220, 38, 38, 0.8)', // dark red glow
    themeColor: '#dc2626'
  },
  {
    id: 'gothic_bat',
    name: 'Gothic Bat',
    displayName: 'Murciélago',
    type: 'mid',
    payouts: { 3: 15, 4: 75, 5: 200 },
    description: 'Criatura de la noche. Paga hasta 200x la apuesta de línea.',
    glowColor: 'rgba(30, 41, 59, 0.8)', // dark slate glow
    themeColor: '#475569'
  },
  {
    id: 'gothic_a',
    name: 'Ace',
    displayName: 'As de Sangre',
    type: 'low',
    payouts: { 3: 10, 4: 40, 5: 120 },
    description: 'Letra gótica de alta costura. Paga hasta 120x.',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    themeColor: '#f87171'
  },
  {
    id: 'gothic_k',
    name: 'King',
    displayName: 'Rey del Abismo',
    type: 'low',
    payouts: { 3: 8, 4: 30, 5: 100 },
    description: 'Corona de espinas. Paga hasta 100x.',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    themeColor: '#fbbf24'
  },
  {
    id: 'gothic_q',
    name: 'Queen',
    displayName: 'Reina de Rosas',
    type: 'low',
    payouts: { 3: 5, 4: 20, 5: 80 },
    description: 'Rosa marchita y espinas. Paga hasta 80x.',
    glowColor: 'rgba(167, 139, 250, 0.4)',
    themeColor: '#c084fc'
  },
  {
    id: 'gothic_j',
    name: 'Jack',
    displayName: 'Sota de Dagas',
    type: 'low',
    payouts: { 3: 4, 4: 15, 5: 60 },
    description: 'Daga de plata victoriana. Paga hasta 60x.',
    glowColor: 'rgba(45, 212, 191, 0.4)',
    themeColor: '#2dd4bf'
  },
  {
    id: 'wild_fangs',
    name: 'WILD',
    displayName: 'Colmillos WILD',
    type: 'wild',
    payouts: { 3: 200, 4: 800, 5: 5000 },
    description: 'Sustituye a cualquier símbolo excepto SCATTER y BONUS. Paga hasta 5000x.',
    glowColor: 'rgba(244, 63, 94, 0.9)', // rose-red glow
    themeColor: '#f43f5e'
  },
  {
    id: 'scatter_moon',
    name: 'SCATTER',
    displayName: 'Luna de Sangre',
    type: 'scatter',
    payouts: { 3: 2, 4: 10, 5: 50 }, // Multiplier of total bet
    description: '3 o más otorgan 10 TIROS GRATIS. Paga en cualquier posición (multiplicador de apuesta total).',
    glowColor: 'rgba(251, 113, 133, 0.9)',
    themeColor: '#fb7185'
  },
  {
    id: 'bonus_coffin',
    name: 'BONUS',
    displayName: 'Ataúd BONUS',
    type: 'bonus',
    payouts: {},
    description: '3 o más activan el Mini-Juego del Ataúd del Vampiro para premios instantáneos.',
    glowColor: 'rgba(16, 185, 129, 0.9)', // emerald green glow
    themeColor: '#10b981'
  }
];

// Definition of the 20 Paylines
// Each payline is represented by 5 row-coordinates (0 to 2), corresponding to each of the 5 reels
export const PAYLINES = [
  { id: 1, name: 'Línea 1', coords: [1, 1, 1, 1, 1], color: '#ef4444' }, // Middle Straight
  { id: 2, name: 'Línea 2', coords: [0, 0, 0, 0, 0], color: '#3b82f6' }, // Top Straight
  { id: 3, name: 'Línea 3', coords: [2, 2, 2, 2, 2], color: '#10b981' }, // Bottom Straight
  { id: 4, name: 'Línea 4', coords: [0, 1, 2, 1, 0], color: '#f59e0b' }, // V Shape
  { id: 5, name: 'Línea 5', coords: [2, 1, 0, 1, 2], color: '#8b5cf6' }, // Inverted V Shape
  { id: 6, name: 'Línea 6', coords: [0, 0, 1, 2, 2], color: '#ec4899' },
  { id: 7, name: 'Línea 7', coords: [2, 2, 1, 0, 0], color: '#06b6d4' },
  { id: 8, name: 'Línea 8', coords: [1, 2, 2, 1, 0], color: '#14b8a6' },
  { id: 9, name: 'Línea 9', coords: [1, 0, 0, 1, 2], color: '#f43f5e' },
  { id: 10, name: 'Línea 10', coords: [0, 1, 0, 1, 0], color: '#fb923c' },
  { id: 11, name: 'Línea 11', coords: [2, 1, 2, 1, 2], color: '#a78bfa' },
  { id: 12, name: 'Línea 12', coords: [1, 0, 1, 2, 1], color: '#22c55e' },
  { id: 13, name: 'Línea 13', coords: [1, 2, 1, 0, 1], color: '#0ea5e9' },
  { id: 14, name: 'Línea 14', coords: [0, 2, 0, 2, 0], color: '#d946ef' },
  { id: 15, name: 'Línea 15', coords: [2, 0, 2, 0, 2], color: '#84cc16' },
  { id: 16, name: 'Línea 16', coords: [0, 0, 2, 2, 0], color: '#eab308' },
  { id: 17, name: 'Línea 17', coords: [2, 2, 0, 0, 2], color: '#f472b6' },
  { id: 18, name: 'Línea 18', coords: [1, 1, 0, 1, 1], color: '#2dd4bf' },
  { id: 19, name: 'Línea 19', coords: [1, 1, 2, 1, 1], color: '#fda4af' },
  { id: 20, name: 'Línea 20', coords: [0, 2, 2, 2, 0], color: '#c084fc' }
];

export const BETS_LIST = [10, 20, 50, 100, 200, 500, 1000];
export const INITIAL_CREDITS = 10000;
