import { 
  canPlaceOnTableau, 
  canPlaceOnFoundation, 
  getFoundationPileForSuit,
  findValidFoundationPile,
  isValidCardSequence,
  getMovableCardsFromTableau,
  moveOneCardWasteToStock,
  flipStock,
  autoMoveToFoundation,
  validateAndExecuteMove
} from '../utils/moveValidation';
import { Card, GameState, CardPosition } from '../types';

describe('Move Validation', () => {
  const createCard = (rank: number, suit: string, faceUp: boolean = true): Card => ({
    id: `${rank}-${suit}`,
    rank,
    suit,
    faceUp
  });

  const createGameState = (): GameState => ({
    tableauPiles: [[], [], [], [], [], [], []],
    foundationPiles: [[], [], [], []],
    wastePile: [],
    stockPile: [],
    selectedCards: [],
    score: 0,
    moves: 0,
    time: 0,
    gameStarted: false,
    gameWon: false,
    hints: [],
    undoStack: [],
    redoStack: []
  });

  describe('canPlaceOnTableau', () => {
    it('should allow king on empty tableau', () => {
      const king = createCard(13, 'hearts');
      const emptyPile: Card[] = [];
      
      expect(canPlaceOnTableau(king, emptyPile)).toBe(true);
    });

    it('should not allow non-king on empty tableau', () => {
      const queen = createCard(12, 'hearts');
      const emptyPile: Card[] = [];
      
      expect(canPlaceOnTableau(queen, emptyPile)).toBe(false);
    });

    it('should allow alternating color sequential cards', () => {
      const king = createCard(13, 'spades'); // black
      const queen = createCard(12, 'hearts'); // red
      const pile = [king];
      
      expect(canPlaceOnTableau(queen, pile)).toBe(true);
    });

    it('should not allow same color', () => {
      const king = createCard(13, 'hearts'); // red
      const queen = createCard(12, 'diamonds'); // red
      const pile = [king];
      
      expect(canPlaceOnTableau(queen, pile)).toBe(false);
    });
  });

  describe('canPlaceOnFoundation', () => {
    it('should allow ace on empty foundation', () => {
      const ace = createCard(1, 'hearts');
      const emptyPile: Card[] = [];
      
      expect(canPlaceOnFoundation(ace, emptyPile)).toBe(true);
    });

    it('should not allow non-ace on empty foundation', () => {
      const two = createCard(2, 'hearts');
      const emptyPile: Card[] = [];
      
      expect(canPlaceOnFoundation(two, emptyPile)).toBe(false);
    });

    it('should allow sequential same-suit cards', () => {
      const ace = createCard(1, 'hearts');
      const two = createCard(2, 'hearts');
      const pile = [ace];
      
      expect(canPlaceOnFoundation(two, pile)).toBe(true);
    });

    it('should not allow different suits', () => {
      const ace = createCard(1, 'hearts');
      const two = createCard(2, 'diamonds');
      const pile = [ace];
      
      expect(canPlaceOnFoundation(two, pile)).toBe(false);
    });
  });

  describe('getFoundationPileForSuit', () => {
    it('should return correct pile indices for suits', () => {
      expect(getFoundationPileForSuit('hearts')).toBe(0);
      expect(getFoundationPileForSuit('diamonds')).toBe(1);
      expect(getFoundationPileForSuit('clubs')).toBe(2);
      expect(getFoundationPileForSuit('spades')).toBe(3);
    });

    it('should return 0 for unknown suits', () => {
      expect(getFoundationPileForSuit('unknown')).toBe(0);
    });
  });

  describe('findValidFoundationPile', () => {
    it('should find valid foundation pile for ace', () => {
      const ace = createCard(1, 'hearts');
      const gameState = createGameState();
      
      const result = findValidFoundationPile(ace, gameState);
      
      expect(result).toBe(0); // hearts pile
    });

    it('should return null when no valid pile found', () => {
      const two = createCard(2, 'hearts');
      const gameState = createGameState();
      
      const result = findValidFoundationPile(two, gameState);
      
      expect(result).toBeNull();
    });
  });

  describe('isValidCardSequence', () => {
    it('should validate valid sequence', () => {
      const cards = [
        createCard(13, 'spades'), // K♠
        createCard(12, 'hearts'), // Q♥
        createCard(11, 'clubs')   // J♣
      ];
      
      expect(isValidCardSequence(cards)).toBe(true);
    });

    it('should reject invalid sequence', () => {
      const cards = [
        createCard(13, 'spades'), // K♠
        createCard(12, 'spades'), // Q♠ (same color)
        createCard(11, 'clubs')   // J♣
      ];
      
      expect(isValidCardSequence(cards)).toBe(false);
    });

    it('should handle single card', () => {
      const cards = [createCard(13, 'spades')];
      
      expect(isValidCardSequence(cards)).toBe(true);
    });

    it('should handle empty array', () => {
      expect(isValidCardSequence([])).toBe(true);
    });
  });

  describe('getMovableCardsFromTableau', () => {
    it('should return face-up cards from index', () => {
      const pile = [
        createCard(13, 'spades', false), // face-down
        createCard(12, 'hearts', true),  // face-up
        createCard(11, 'clubs', true)    // face-up
      ];
      
      const result = getMovableCardsFromTableau(pile, 1);
      
      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(12);
      expect(result[1].rank).toBe(11);
    });

    it('should return empty array for face-down card', () => {
      const pile = [
        createCard(13, 'spades', false) // face-down
      ];
      
      const result = getMovableCardsFromTableau(pile, 0);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('moveOneCardWasteToStock', () => {
    it('should move card from waste to stock', () => {
      const gameState = createGameState();
      gameState.wastePile = [createCard(13, 'hearts')];
      gameState.stockPile = [createCard(12, 'diamonds')];
      
      const result = moveOneCardWasteToStock(gameState);
      
      expect(result.success).toBe(true);
      // The function returns a new game state
      expect(result.newGameState?.wastePile).toHaveLength(0);
      expect(result.newGameState?.stockPile).toHaveLength(2);
    });

    it('should fail when waste pile is empty', () => {
      const gameState = createGameState();
      
      const result = moveOneCardWasteToStock(gameState);
      
      expect(result.success).toBe(false);
    });
  });

  describe('flipStock', () => {
    it('should flip stock to waste', () => {
      const gameState = createGameState();
      gameState.stockPile = [createCard(13, 'hearts'), createCard(12, 'diamonds')];
      
      const result = flipStock(gameState);
      
      expect(result.success).toBe(true);
      expect(result.newGameState?.stockPile).toHaveLength(1);
      expect(result.newGameState?.wastePile).toHaveLength(1);
    });

    it('should fail when stock is empty', () => {
      const gameState = createGameState();
      
      const result = flipStock(gameState);
      
      expect(result.success).toBe(false);
    });
  });

  describe('autoMoveToFoundation', () => {
    it('should auto-move ace to foundation', () => {
      const gameState = createGameState();
      const ace = createCard(1, 'hearts');
      gameState.wastePile = [ace];
      
      const result = autoMoveToFoundation(gameState, ace);
      
      expect(result.success).toBe(true);
      expect(result.newGameState?.foundationPiles[0]).toHaveLength(1);
      expect(result.newGameState?.wastePile).toHaveLength(0);
    });

    it('should fail for non-ace card', () => {
      const gameState = createGameState();
      const queen = createCard(12, 'hearts');
      
      const result = autoMoveToFoundation(gameState, queen);
      
      expect(result.success).toBe(false);
    });

    it('should handle card not found in any pile', () => {
      const gameState = createGameState();
      const card = createCard(1, 'hearts');
      
      const result = autoMoveToFoundation(gameState, card);
      
      expect(result.success).toBe(false);
    });

    it('should handle card in tableau pile', () => {
      const gameState = createGameState();
      const ace = createCard(1, 'hearts');
      gameState.tableauPiles[0] = [ace];
      
      const result = autoMoveToFoundation(gameState, ace);
      
      expect(result.success).toBe(true);
      expect(result.newGameState?.foundationPiles[0]).toHaveLength(1);
      expect(result.newGameState?.tableauPiles[0]).toHaveLength(0);
    });

    it('should handle card in foundation pile', () => {
      const gameState = createGameState();
      const ace = createCard(1, 'hearts');
      gameState.foundationPiles[0] = [ace];
      
      const result = autoMoveToFoundation(gameState, ace);
      
      expect(result.success).toBe(false);
    });
  });

  describe('validateAndExecuteMove', () => {
    it('should validate and execute valid move', () => {
      const gameState = createGameState();
      const card = createCard(13, 'hearts');
      gameState.wastePile = [card];
      
      const from: CardPosition = { pileType: 'waste', pileIndex: 0, cardIndex: 0 };
      const to: CardPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      
      const result = validateAndExecuteMove(gameState, from, to, [card]);
      
      expect(result.success).toBe(true);
      expect(result.newGameState?.tableauPiles[0]).toHaveLength(1);
      expect(result.newGameState?.wastePile).toHaveLength(0);
    });

    it('should fail for invalid move', () => {
      const gameState = createGameState();
      const card = createCard(12, 'hearts');
      gameState.wastePile = [card];
      
      const from: CardPosition = { pileType: 'waste', pileIndex: 0, cardIndex: 0 };
      const to: CardPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      
      const result = validateAndExecuteMove(gameState, from, to, [card]);
      
      expect(result.success).toBe(false);
    });

    it('should fail for invalid cards array', () => {
      const gameState = createGameState();
      const from: CardPosition = { pileType: 'waste', pileIndex: 0, cardIndex: 0 };
      const to: CardPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      
      const result = validateAndExecuteMove(gameState, from, to, []);
      
      expect(result.success).toBe(false);
    });

    it('should fail when source cards not found', () => {
      const gameState = createGameState();
      const card = createCard(13, 'hearts');
      
      const from: CardPosition = { pileType: 'waste', pileIndex: 0, cardIndex: 0 };
      const to: CardPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      
      const result = validateAndExecuteMove(gameState, from, to, [card]);
      
      expect(result.success).toBe(false);
    });
  });
}); 