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

  describe('cloneGameState', () => {
    it('should create a deep copy of game state', () => {
      const { cloneGameState } = require('@/utils/gameUtils');
      const originalState = createInitialGameState();
      originalState.tableauPiles[0] = [{ id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true }];
      originalState.score = 100;
      originalState.moves = 5;

      const clonedState = cloneGameState(originalState);

      expect(clonedState).not.toBe(originalState);
      expect(clonedState.tableauPiles).not.toBe(originalState.tableauPiles);
      expect(clonedState.tableauPiles[0]).not.toBe(originalState.tableauPiles[0]);
      expect(clonedState.tableauPiles[0][0]).toEqual(originalState.tableauPiles[0][0]);
      expect(clonedState.score).toBe(originalState.score);
      expect(clonedState.moves).toBe(originalState.moves);
    });

    it('should handle game state with selectedCards', () => {
      const { cloneGameState } = require('@/utils/gameUtils');
      const originalState = createInitialGameState();
      originalState.selectedCards = [{ id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true }];

      const clonedState = cloneGameState(originalState);

      expect(clonedState.selectedCards).toEqual(originalState.selectedCards);
      expect(clonedState.selectedCards).not.toBe(originalState.selectedCards);
    });

    it('should handle game state with empty selectedCards', () => {
      const { cloneGameState } = require('@/utils/gameUtils');
      const originalState = createInitialGameState();
      originalState.selectedCards = [];

      const clonedState = cloneGameState(originalState);

      expect(clonedState.selectedCards).toEqual([]);
    });
  });

  describe('isRedCard', () => {
    it('should return true for red cards', () => {
      const { isRedCard } = require('@/utils/gameUtils');
      const redCard = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      
      expect(isRedCard(redCard)).toBe(true);
    });

    it('should return false for black cards', () => {
      const { isRedCard } = require('@/utils/gameUtils');
      const blackCard = { id: '1-spades', rank: 1, suit: 'spades', faceUp: true };
      
      expect(isRedCard(blackCard)).toBe(false);
    });
  });

  describe('isBlackCard', () => {
    it('should return true for black cards', () => {
      const { isBlackCard } = require('@/utils/gameUtils');
      const blackCard = { id: '1-spades', rank: 1, suit: 'spades', faceUp: true };
      
      expect(isBlackCard(blackCard)).toBe(true);
    });

    it('should return false for red cards', () => {
      const { isBlackCard } = require('@/utils/gameUtils');
      const redCard = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      
      expect(isBlackCard(redCard)).toBe(false);
    });
  });

  describe('areOppositeColors', () => {
    it('should return true for opposite colors', () => {
      const { areOppositeColors } = require('@/utils/gameUtils');
      const redCard = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      const blackCard = { id: '1-spades', rank: 1, suit: 'spades', faceUp: true };
      
      expect(areOppositeColors(redCard, blackCard)).toBe(true);
    });

    it('should return false for same colors', () => {
      const { areOppositeColors } = require('@/utils/gameUtils');
      const redCard1 = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      const redCard2 = { id: '1-diamonds', rank: 1, suit: 'diamonds', faceUp: true };
      
      expect(areOppositeColors(redCard1, redCard2)).toBe(false);
    });
  });

  describe('checkWinCondition', () => {
    it('should detect win condition', () => {
      const { checkWinCondition } = require('@/utils/gameUtils');
      const gameState = createInitialGameState();
      // Fill all foundation piles with complete suits
      for (let i = 0; i < 4; i++) {
        for (let rank = 1; rank <= 13; rank++) {
          gameState.foundationPiles[i].push({
            id: `${rank}-${['hearts', 'diamonds', 'clubs', 'spades'][i]}`,
            rank,
            suit: ['hearts', 'diamonds', 'clubs', 'spades'][i],
            faceUp: true
          });
        }
      }

      const result = checkWinCondition(gameState);

      expect(result).toBe(true);
    });

    it('should not detect win condition for incomplete game', () => {
      const { checkWinCondition } = require('@/utils/gameUtils');
      const gameState = createInitialGameState();

      const result = checkWinCondition(gameState);

      expect(result).toBe(false);
    });
  });

  describe('updateDraggableStates', () => {
    it('should update draggable states correctly', () => {
      const { updateDraggableStates } = require('@/utils/gameUtils');
      const gameState = createInitialGameState();
      
      const updatedState = updateDraggableStates(gameState);
      
      // Check that face-up cards are draggable
      updatedState.tableauPiles.forEach(pile => {
        pile.forEach(card => {
          if (card.faceUp) {
            expect(card.draggable).toBe(true);
          }
        });
      });
    });
  });
});