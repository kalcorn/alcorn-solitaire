import { Card, Suit, GameState } from '@/types';

/**
 * Creates a standard 52-card deck with proper IDs and suits
 */
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck: Card[] = [];

  suits.forEach(suit => {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        faceUp: false,
        draggable: false
      });
    }
  });

  return deck;
}

// Simple seedable PRNG (Mulberry32)
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles a deck using a seedable PRNG for deterministic results
 */
export function shuffleDeck(deck: Card[], seed: number = 42): Card[] {
  const shuffled = [...deck];
  const random = mulberry32(seed);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deals cards according to Klondike Solitaire rules:
 * - 7 tableau piles with 1,2,3,4,5,6,7 cards respectively
 * - Top card of each pile is face up
 * - Remaining cards go to stock pile
 * Accepts a seed for deterministic shuffling
 */
export function dealInitialCards(seed: number = 42): {
  tableauPiles: Card[][];
  stockPile: Card[];
  foundationPiles: Card[][];
  wastePile: Card[];
} {
  const deck = shuffleDeck(createDeck(), seed);
  const tableauPiles: Card[][] = [[], [], [], [], [], [], []];
  let cardIndex = 0;
  for (let pile = 0; pile < 7; pile++) {
    for (let card = 0; card <= pile; card++) {
      const currentCard = { ...deck[cardIndex] };
      currentCard.faceUp = card === pile;
      currentCard.draggable = currentCard.faceUp;
      tableauPiles[pile].push(currentCard);
      cardIndex++;
    }
  }
  const stockPile = deck.slice(cardIndex).map(card => ({
    ...card,
    faceUp: false,
    draggable: false
  }));
  const foundationPiles: Card[][] = [[], [], [], []];
  const wastePile: Card[] = [];
  return {
    tableauPiles,
    stockPile,
    foundationPiles,
    wastePile
  };
}

/**
 * Creates initial game state with deterministic seed
 */
export function createInitialGameState(seed: number = 42): GameState {
  const { tableauPiles, stockPile, foundationPiles, wastePile } = dealInitialCards(seed);
  return {
    tableauPiles,
    foundationPiles,
    stockPile,
    wastePile,
    moves: 0,
    score: 0,
    isGameWon: false,
    selectedCards: [],
    selectedPileType: null,
    selectedPileIndex: null,
    stockCycles: 0,
    settings: {
      deckCyclingLimit: 0, // unlimited by default
      drawCount: 1,
      autoMoveToFoundation: true,
      soundEnabled: true,
      showHints: false
    },
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      bestTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageMoves: 0,
      totalMoves: 0,
      lastPlayed: 0
    },
    history: [],
    historyIndex: -1
  };
}

/**
 * Checks if a card is red (hearts or diamonds)
 */
export function isRedCard(card: Card): boolean {
  return card.suit === 'hearts' || card.suit === 'diamonds';
}

/**
 * Checks if a card is black (clubs or spades)
 */
export function isBlackCard(card: Card): boolean {
  return card.suit === 'clubs' || card.suit === 'spades';
}

/**
 * Gets the opposite color cards can be placed on
 */
export function areOppositeColors(card1: Card, card2: Card): boolean {
  return (isRedCard(card1) && isBlackCard(card2)) || (isBlackCard(card1) && isRedCard(card2));
}

/**
 * Checks if the game is won (all foundation piles have 13 cards)
 */
export function checkWinCondition(gameState: GameState): boolean {
  return gameState.foundationPiles.every(pile => pile.length === 13);
}

/**
 * Deep clone a game state to prevent mutations
 */
export function cloneGameState(gameState: GameState): GameState {
  return {
    ...gameState,
    tableauPiles: gameState.tableauPiles.map(pile => pile.map(card => ({ ...card }))),
    foundationPiles: gameState.foundationPiles.map(pile => pile.map(card => ({ ...card }))),
    stockPile: gameState.stockPile.map(card => ({ ...card })),
    wastePile: gameState.wastePile.map(card => ({ ...card })),
    selectedCards: gameState.selectedCards.map(card => ({ ...card }))
  };
}

/**
 * Updates draggable state for all cards based on game rules
 */
export function updateDraggableStates(gameState: GameState): GameState {
  const newState = cloneGameState(gameState);
  
  // Update tableau cards
  newState.tableauPiles.forEach((pile, pileIndex) => {
    pile.forEach((card, cardIndex) => {
      // Only face-up cards can be draggable
      if (!card.faceUp) {
        card.draggable = false;
        return;
      }
      
      // Check if this card and all cards below it form a valid sequence
      let isValidSequence = true;
      for (let i = cardIndex; i < pile.length - 1; i++) {
        const currentCard = pile[i];
        const nextCard = pile[i + 1];
        
        if (!areOppositeColors(currentCard, nextCard) || currentCard.rank !== nextCard.rank + 1) {
          isValidSequence = false;
          break;
        }
      }
      
      card.draggable = isValidSequence;
    });
  });
  
  // Waste pile: only top card is draggable
  newState.wastePile.forEach((card, index) => {
    card.draggable = index === newState.wastePile.length - 1;
  });
  
  // Foundation piles: only top card is draggable
  newState.foundationPiles.forEach(pile => {
    pile.forEach((card, index) => {
      card.draggable = index === pile.length - 1;
    });
  });
  
  return newState;
}