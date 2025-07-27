import { createInitialGameState, shuffleDeck } from '@/utils/gameUtils';
import { GameState, Card } from '@/types';

describe('gameUtils', () => {
  describe('createInitialGameState', () => {
    it('should create a valid initial game state', () => {
      const gameState = createInitialGameState();
      
      expect(gameState.stockPile).toHaveLength(24);
      expect(gameState.wastePile).toHaveLength(0);
      expect(gameState.foundationPiles).toHaveLength(4);
      expect(gameState.tableauPiles).toHaveLength(7);
      expect(gameState.isGameWon).toBe(false);
      expect(gameState.selectedCards).toEqual([]);
      expect(gameState.selectedPileType).toBeNull();
      expect(gameState.selectedPileIndex).toBeNull();
      
      // Check tableau setup
      expect(gameState.tableauPiles[0]).toHaveLength(1);
      expect(gameState.tableauPiles[1]).toHaveLength(2);
      expect(gameState.tableauPiles[2]).toHaveLength(3);
      expect(gameState.tableauPiles[3]).toHaveLength(4);
      expect(gameState.tableauPiles[4]).toHaveLength(5);
      expect(gameState.tableauPiles[5]).toHaveLength(6);
      expect(gameState.tableauPiles[6]).toHaveLength(7);
      
      // Check that top cards are face up
      gameState.tableauPiles.forEach((pile, index) => {
        if (pile.length > 0) {
          expect(pile[pile.length - 1].faceUp).toBe(true);
        }
      });
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle the deck', () => {
      const originalDeck: Card[] = [
        { id: '1', suit: 'hearts', rank: 1, faceUp: false },
        { id: '2', suit: 'spades', rank: 2, faceUp: false },
        { id: '3', suit: 'diamonds', rank: 3, faceUp: false },
        { id: '4', suit: 'clubs', rank: 4, faceUp: false },
      ];
      
      const shuffledDeck = shuffleDeck([...originalDeck]);
      
      expect(shuffledDeck).toHaveLength(originalDeck.length);
      expect(shuffledDeck).toEqual(expect.arrayContaining(originalDeck));
    });

    it('should produce identical results with the same seed', () => {
      const deck: Card[] = [
        { id: '1', suit: 'hearts', rank: 1, faceUp: false },
        { id: '2', suit: 'spades', rank: 2, faceUp: false },
        { id: '3', suit: 'diamonds', rank: 3, faceUp: false },
        { id: '4', suit: 'clubs', rank: 4, faceUp: false },
      ];
      
      const shuffle1 = shuffleDeck([...deck], 42);
      const shuffle2 = shuffleDeck([...deck], 42);
      
      expect(shuffle1).toEqual(shuffle2);
    });

    it('should produce different results with different seeds', () => {
      const deck: Card[] = [
        { id: '1', suit: 'hearts', rank: 1, faceUp: false },
        { id: '2', suit: 'spades', rank: 2, faceUp: false },
        { id: '3', suit: 'diamonds', rank: 3, faceUp: false },
        { id: '4', suit: 'clubs', rank: 4, faceUp: false },
        { id: '5', suit: 'hearts', rank: 5, faceUp: false },
        { id: '6', suit: 'spades', rank: 6, faceUp: false },
      ];
      
      const shuffle1 = shuffleDeck([...deck], 12345);
      const shuffle2 = shuffleDeck([...deck], 54321);
      
      expect(shuffle1).not.toEqual(shuffle2);
    });
  });
});