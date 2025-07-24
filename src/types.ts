export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string; // Unique identifier, e.g. 'hearts-7'
  suit: Suit;
  rank: number; // 1 (Ace) to 13 (King)
  faceUp: boolean;
  draggable?: boolean;
}

export interface Pile {
  id: string;
  cards: Card[];
}

export interface GameState {
  tableauPiles: Pile[];
  foundationPiles: Pile[];
  stockPile: Pile;
  wastePile: Pile;
  timer: number; // Seconds elapsed
  score: number;
  isGameWon: boolean;
}
