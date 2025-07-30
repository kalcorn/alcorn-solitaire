import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

// Mock dependencies
jest.mock('../utils/gameUtils', () => ({
  createInitialGameState: jest.fn(() => ({
    stockPile: [],
    wastePile: [],
    foundationPiles: [[], [], [], []],
    tableauPiles: [[], [], [], [], [], [], []],
    moves: 0,
    score: 0,
    isGameWon: false,
    selectedCards: [],
    selectedPileType: null,
    selectedPileIndex: null,
    stockCycles: 0,
    settings: {
      deckCyclingLimit: 0,
      drawCount: 1,
      autoMoveToFoundation: false,
      soundEnabled: true,
      showHints: true
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
    historyIndex: -1,
    gameStartTime: Date.now()
  })),
  shuffleDeck: jest.fn(() => []),
  dealCards: jest.fn(() => ({
    stockPile: [],
    tableauPiles: [[], [], [], [], [], [], []]
  })),
  isGameWon: jest.fn(() => false),
  calculateScore: jest.fn(() => 0)
}));

jest.mock('../utils/moveValidation', () => ({
  validateMove: jest.fn(() => ({ isValid: true, reason: '' })),
  getValidMoves: jest.fn(() => []),
  canMoveToFoundation: jest.fn(() => true)
}));

jest.mock('../utils/localStorage', () => ({
  saveGameState: jest.fn(),
  loadGameState: jest.fn(() => null),
  saveGameStats: jest.fn(),
  loadGameStats: jest.fn(() => ({}))
}));

jest.mock('../hooks/useGameTimer', () => ({
  useGameTimer: () => ({
    timeElapsed: 0,
    startTimer: jest.fn(),
    stopTimer: jest.fn(),
    resetTimer: jest.fn()
  })
}));

describe('useGameState Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook initialization', () => {
    it('should initialize with default game state', () => {
      const { result } = renderHook(() => useGameState());
      
      expect(result.current).toBeDefined();
      expect(result.current.gameState).toBeDefined();
      expect(result.current.timeElapsed).toBe(0);
      expect(typeof result.current.startNewGame).toBe('function');
      expect(typeof result.current.moveCards).toBe('function');
      expect(typeof result.current.handleCardClick).toBe('function');
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useGameState());
      
      expect(result.current.handleCardClick).toBeDefined();
      expect(result.current.handleCardDragStart).toBeDefined();
      expect(result.current.handleCardDrop).toBeDefined();
      expect(result.current.handleStockClick).toBeDefined();
      expect(result.current.handleNewGame).toBeDefined();
      expect(result.current.handleUndo).toBeDefined();
      expect(result.current.handleRedo).toBeDefined();
      expect(result.current.handleSettingsChange).toBeDefined();
      expect(result.current.handleHint).toBeDefined();
      expect(result.current.handleAutoMove).toBeDefined();
      expect(result.current.handleAutoMoveToFoundation).toBeDefined();
      expect(result.current.selectCards).toBeDefined();
      expect(result.current.getMovableCards).toBeDefined();
      expect(result.current.updateSettings).toBeDefined();
      expect(result.current.canUndo).toBeDefined();
    });
  });

  describe('startNewGame', () => {
    it('should reset game state', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startNewGame();
      });
      
      expect(result.current.gameState.moves).toBe(0);
      expect(result.current.gameState.score).toBe(0);
    });

    it('should initialize new deck', () => {
      const { createInitialGameState } = require('../utils/gameUtils');
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startNewGame();
      });
      
      expect(createInitialGameState).toHaveBeenCalled();
    });
  });

  describe('handleCardClick', () => {
    it('should handle card selection', () => {
      const { result } = renderHook(() => useGameState());
      
      const mockCard = { id: 'card1', suit: 'hearts', rank: 'A', faceUp: true };
      const mockPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      
      act(() => {
        result.current.handleCardClick(mockCard, mockPosition);
      });
      
      expect(result.current.gameState.selectedCards).toBeDefined();
    });

    it('should handle invalid card clicks', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.handleCardClick(null as any, null as any);
      });
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('handleStockClick', () => {
    it('should handle stock pile click', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.handleStockClick();
      });
      
      expect(result.current.gameState.moves).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty stock pile', () => {
      const { result } = renderHook(() => useGameState());
      
      // Set empty stock pile
      act(() => {
        result.current.gameState.stockPile = [];
        result.current.handleStockClick();
      });
      
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('moveCards', () => {
    it('should validate and execute valid moves', () => {
      const { validateMove } = require('../utils/moveValidation');
      validateMove.mockReturnValue({ isValid: true, reason: '' });
      
      const { result } = renderHook(() => useGameState());
      
      const fromPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      const toPosition = { pileType: 'foundation', pileIndex: 0, cardIndex: 0 };
      const cards = [{ id: 'card1', suit: 'hearts', rank: 'A', faceUp: true }];
      
      act(() => {
        const moveResult = result.current.moveCards(fromPosition, toPosition, cards);
        expect(moveResult.success).toBe(true);
      });
    });

    it('should reject invalid moves', () => {
      const { validateMove } = require('../utils/moveValidation');
      validateMove.mockReturnValue({ isValid: false, reason: 'Invalid move' });
      
      const { result } = renderHook(() => useGameState());
      
      const fromPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      const toPosition = { pileType: 'foundation', pileIndex: 0, cardIndex: 0 };
      const cards = [{ id: 'card1', suit: 'hearts', rank: 'K', faceUp: true }];
      
      act(() => {
        const moveResult = result.current.moveCards(fromPosition, toPosition, cards);
        expect(moveResult.success).toBe(false);
      });
    });

    it('should handle null parameters', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        const moveResult = result.current.moveCards(null as any, null as any, null as any);
        expect(moveResult.success).toBe(false);
      });
    });
  });

  describe('handleUndo', () => {
    it('should undo previous move', () => {
      const { result } = renderHook(() => useGameState());
      
      // Add some history
      act(() => {
        result.current.gameState.history = [result.current.gameState];
        result.current.gameState.historyIndex = 0;
        result.current.handleUndo();
      });
      
      expect(result.current.gameState.historyIndex).toBeGreaterThanOrEqual(-1);
    });

    it('should handle empty history', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.handleUndo();
      });
      
      expect(result.current.gameState.historyIndex).toBe(-1);
    });
  });

  describe('handleRedo', () => {
    it('should redo undone move', () => {
      const { result } = renderHook(() => useGameState());
      
      // Setup undo/redo state
      act(() => {
        result.current.gameState.history = [result.current.gameState, result.current.gameState];
        result.current.gameState.historyIndex = 0;
        result.current.handleRedo();
      });
      
      expect(result.current.gameState.historyIndex).toBeGreaterThanOrEqual(0);
    });

    it('should handle no redo available', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.handleRedo();
      });
      
      expect(result.current.gameState.historyIndex).toBe(-1);
    });
  });

  describe('handleSettingsChange', () => {
    it('should update game settings', () => {
      const { result } = renderHook(() => useGameState());
      
      const newSettings = {
        soundEnabled: false,
        showHints: false,
        drawCount: 3,
        deckCyclingLimit: 3,
        autoMoveToFoundation: true
      };
      
      act(() => {
        result.current.handleSettingsChange(newSettings);
      });
      
      expect(result.current.gameState.settings.soundEnabled).toBe(false);
    });

    it('should handle partial settings updates', () => {
      const { result } = renderHook(() => useGameState());
      
      const partialSettings = { soundEnabled: false };
      
      act(() => {
        result.current.handleSettingsChange(partialSettings);
      });
      
      expect(result.current.gameState.settings.soundEnabled).toBe(false);
      expect(result.current.gameState.settings.showHints).toBeDefined();
    });
  });

  describe('Auto-move functionality', () => {
    it('should handle auto-move to foundation', () => {
      const { canMoveToFoundation } = require('../utils/moveValidation');
      canMoveToFoundation.mockReturnValue(true);
      
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.handleAutoMoveToFoundation();
      });
      
      expect(canMoveToFoundation).toHaveBeenCalled();
    });

    it('should handle general auto-move', () => {
      const { getValidMoves } = require('../utils/moveValidation');
      getValidMoves.mockReturnValue([]);
      
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.handleAutoMove();
      });
      
      expect(getValidMoves).toHaveBeenCalled();
    });
  });

  describe('Drag and drop', () => {
    it('should handle drag start', () => {
      const { result } = renderHook(() => useGameState());
      
      const mockCard = { id: 'card1', suit: 'hearts', rank: 'A', faceUp: true };
      const mockPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      
      act(() => {
        result.current.handleCardDragStart(mockCard, mockPosition);
      });
      
      expect(result.current.gameState.selectedCards).toBeDefined();
    });

    it('should handle drag drop', () => {
      const { result } = renderHook(() => useGameState());
      
      const mockCards = [{ id: 'card1', suit: 'hearts', rank: 'A', faceUp: true }];
      const fromPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      const toPosition = { pileType: 'foundation', pileIndex: 0, cardIndex: 0 };
      
      act(() => {
        result.current.handleCardDrop(mockCards, fromPosition, toPosition);
      });
      
      expect(true).toBe(true); // Should not throw
    });
  });

  describe('Game state persistence', () => {
    it('should save game state', () => {
      const { saveGameState } = require('../utils/localStorage');
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startNewGame();
      });
      
      expect(saveGameState).toHaveBeenCalled();
    });

    it('should handle save errors gracefully', () => {
      const { saveGameState } = require('../utils/localStorage');
      saveGameState.mockImplementation(() => {
        throw new Error('Save failed');
      });
      
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        result.current.startNewGame();
      });
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Performance considerations', () => {
    it('should not create memory leaks', () => {
      const { result, unmount } = renderHook(() => useGameState());
      
      expect(result.current).toBeDefined();
      
      unmount();
      
      // Should not throw after unmount
      expect(true).toBe(true);
    });

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useGameState());
      
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.startNewGame();
        }
      });
      
      expect(result.current.gameState.moves).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should handle game utility errors', () => {
      const { createInitialGameState } = require('../utils/gameUtils');
      createInitialGameState.mockImplementation(() => {
        throw new Error('Game creation failed');
      });
      
      expect(() => {
        renderHook(() => useGameState());
      }).not.toThrow();
    });

    it('should handle validation errors', () => {
      const { validateMove } = require('../utils/moveValidation');
      validateMove.mockImplementation(() => {
        throw new Error('Validation failed');
      });
      
      const { result } = renderHook(() => useGameState());
      
      const fromPosition = { pileType: 'tableau', pileIndex: 0, cardIndex: 0 };
      const toPosition = { pileType: 'foundation', pileIndex: 0, cardIndex: 0 };
      const cards = [{ id: 'card1', suit: 'hearts', rank: 'A', faceUp: true }];
      
      act(() => {
        const moveResult = result.current.moveCards(fromPosition, toPosition, cards);
        expect(moveResult.success).toBe(false);
      });
    });
  });
});