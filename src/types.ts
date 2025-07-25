export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string; // Unique identifier, e.g. 'hearts-7'
  suit: Suit;
  rank: number; // 1 (Ace) to 13 (King)
  faceUp: boolean;
  draggable?: boolean;
}

export interface GameState {
  tableauPiles: Card[][];
  foundationPiles: Card[][];
  stockPile: Card[];
  wastePile: Card[];
  moves: number;
  score: number;
  isGameWon: boolean;
  selectedCards: Card[];
  selectedPileType: 'tableau' | 'foundation' | 'waste' | 'stock' | null;
  selectedPileIndex: number | null;
  stockCycles: number; // Number of times stock has been cycled
  settings: {
    deckCyclingLimit: number;
    drawCount: number;
    autoMoveToFoundation: boolean;
    showTimer: boolean;
  };
}

export interface MoveResult {
  success: boolean;
  error?: string;
  newGameState?: GameState;
}

export interface CardPosition {
  pileType: 'tableau' | 'foundation' | 'stock' | 'waste';
  pileIndex: number;
  cardIndex: number;
}

export type GameAction = 
  | { type: 'MOVE_CARDS'; from: CardPosition; to: CardPosition; cards: Card[] }
  | { type: 'FLIP_STOCK' }
  | { type: 'SELECT_CARDS'; position: CardPosition; cards: Card[] }
  | { type: 'DESELECT_CARDS' }
  | { type: 'NEW_GAME' }
  | { type: 'AUTO_MOVE_TO_FOUNDATION'; card: Card };
