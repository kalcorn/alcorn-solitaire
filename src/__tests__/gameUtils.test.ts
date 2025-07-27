import { createInitialGameState, shuffleDeck, canMoveCard } from '@/utils/gameUtils';
import { GameState, Card } from '@/types';

describe('gameUtils', () => {
  describe('createInitialGameState', () => {
    it('should create a valid initial game state', () => {
      const gameState = createInitialGameState();
      
      expect(gameState.stock).toHaveLength(24);
      expect(gameState.waste).toHaveLength(0);
      expect(gameState.foundations).toHaveLength(4);
      expect(gameState.tableau).toHaveLength(7);
      expect(gameState.isGameWon).toBe(false);
      expect(gameState.selectedCards).toEqual([]);
      expect(gameState.selectedPileType).toBeNull();
      expect(gameState.selectedPileIndex).toBeNull();
      
      // Check tableau setup
      expect(gameState.tableau[0]).toHaveLength(1);
      expect(gameState.tableau[1]).toHaveLength(2);
      expect(gameState.tableau[2]).toHaveLength(3);
      expect(gameState.tableau[3]).toHaveLength(4);
      expect(gameState.tableau[4]).toHaveLength(5);
      expect(gameState.tableau[5]).toHaveLength(6);
      expect(gameState.tableau[6]).toHaveLength(7);
      
      // Check that top cards are face up
      gameState.tableau.forEach((pile, index) => {
        if (pile.length > 0) {
          expect(pile[pile.length - 1].isFlipped).toBe(true);
        }
      });
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle the deck', () => {
      const originalDeck: Card[] = [
        { id: '1', suit: 'hearts', rank: 'A', isFlipped: false },
        { id: '2', suit: 'spades', rank: '2', isFlipped: false },
        { id: '3', suit: 'diamonds', rank: '3', isFlipped: false },
        { id: '4', suit: 'clubs', rank: '4', isFlipped: false },
      ];
      
      const shuffledDeck = shuffleDeck([...originalDeck]);
      
      expect(shuffledDeck).toHaveLength(originalDeck.length);
      expect(shuffledDeck).toEqual(expect.arrayContaining(originalDeck));
    });

    it('should produce identical results with the same seed', () => {
      const deck: Card[] = [
        { id: '1', suit: 'hearts', rank: 'A', isFlipped: false },
        { id: '2', suit: 'spades', rank: '2', isFlipped: false },
        { id: '3', suit: 'diamonds', rank: '3', isFlipped: false },
        { id: '4', suit: 'clubs', rank: '4', isFlipped: false },
      ];
      
      const shuffle1 = shuffleDeck([...deck], 42);
      const shuffle2 = shuffleDeck([...deck], 42);
      
      expect(shuffle1).toEqual(shuffle2);
    });

    it('should produce different results with different seeds', () => {
      const deck: Card[] = [
        { id: '1', suit: 'hearts', rank: 'A', isFlipped: false },
        { id: '2', suit: 'spades', rank: '2', isFlipped: false },
        { id: '3', suit: 'diamonds', rank: '3', isFlipped: false },
        { id: '4', suit: 'clubs', rank: '4', isFlipped: false },
        { id: '5', suit: 'hearts', rank: '5', isFlipped: false },
        { id: '6', suit: 'spades', rank: '6', isFlipped: false },
      ];
      
      const shuffle1 = shuffleDeck([...deck], 12345);
      const shuffle2 = shuffleDeck([...deck], 54321);
      
      expect(shuffle1).not.toEqual(shuffle2);
    });
  });

  describe('canMoveCard', () => {
    const mockGameState: GameState = {
      stock: [],
      waste: [],
      foundations: [[], [], [], []],
      tableau: [[], [], [], [], [], [], []],
      isGameWon: false,
      selectedCards: [],
      selectedPileType: null,
      selectedPileIndex: null,
      settings: { soundEnabled: true },
      history: [],
      historyIndex: -1,
    };

    it('should allow placing King on empty tableau pile', () => {
      const king: Card = { id: '1', suit: 'hearts', rank: 'K', isFlipped: true };
      
      const result = canMoveCard([king], 'tableau', 0, mockGameState);
      
      expect(result.canMove).toBe(true);
    });

    it('should allow placing red card on black card of one rank higher', () => {
      const redCard: Card = { id: '1', suit: 'hearts', rank: '6', isFlipped: true };
      const blackCard: Card = { id: '2', suit: 'spades', rank: '7', isFlipped: true };
      
      const gameStateWithCard: GameState = {
        ...mockGameState,
        tableau: [[blackCard], [], [], [], [], [], []],
      };
      
      const result = canMoveCard([redCard], 'tableau', 0, gameStateWithCard);
      
      expect(result.canMove).toBe(true);
    });

    it('should not allow placing same color cards', () => {
      const redCard1: Card = { id: '1', suit: 'hearts', rank: '6', isFlipped: true };
      const redCard2: Card = { id: '2', suit: 'diamonds', rank: '7', isFlipped: true };
      
      const gameStateWithCard: GameState = {
        ...mockGameState,
        tableau: [[redCard2], [], [], [], [], [], []],
      };
      
      const result = canMoveCard([redCard1], 'tableau', 0, gameStateWithCard);
      
      expect(result.canMove).toBe(false);
      expect(result.reason).toBe('Must alternate colors');
    });

    it('should allow placing Ace on empty foundation', () => {
      const ace: Card = { id: '1', suit: 'hearts', rank: 'A', isFlipped: true };
      
      const result = canMoveCard([ace], 'foundation', 0, mockGameState);
      
      expect(result.canMove).toBe(true);
    });

    it('should allow placing card of same suit and one rank higher on foundation', () => {
      const ace: Card = { id: '1', suit: 'hearts', rank: 'A', isFlipped: true };
      const two: Card = { id: '2', suit: 'hearts', rank: '2', isFlipped: true };
      
      const gameStateWithAce: GameState = {
        ...mockGameState,
        foundations: [[ace], [], [], []],
      };
      
      const result = canMoveCard([two], 'foundation', 0, gameStateWithAce);
      
      expect(result.canMove).toBe(true);
    });
  });
});