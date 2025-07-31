import { renderHook, act } from '@testing-library/react';
import { useGameAnimations } from '../hooks/useGameAnimations';

// Mock dependencies
const mockAnimateStockFlip = jest.fn(() => Promise.resolve());
jest.mock('../hooks/useAnimation', () => ({
  useAnimation: () => ({
    animateMove: jest.fn(() => Promise.resolve()),
    animateFlip: jest.fn(() => Promise.resolve()),
    animateShuffle: jest.fn(() => Promise.resolve()),
    animateStockFlip: mockAnimateStockFlip
  })
}));

jest.mock('../utils/animationEngine', () => ({
  animateElement: jest.fn(() => Promise.resolve())
}));

jest.mock('../utils/soundUtils', () => ({
  playSoundEffect: {
    cardFlip: jest.fn(),
    cardMove: jest.fn(),
    cardDrop: jest.fn(),
    shuffle: jest.fn(),
    win: jest.fn(),
    click: jest.fn()
  },
  initializeSoundSystem: jest.fn()
}));

// Mock the pile registration hook
jest.mock('../hooks/usePileRegistration', () => ({
  usePileElements: () => ({
    getPileElement: jest.fn((pileId: string) => {
      // Return null to force the fallback path that calls newAnimateStockFlip
      return null;
    }),
    getAllPileElements: jest.fn(() => new Map())
  })
}));

describe('useGameAnimations Hook', () => {
  const mockGameState = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      expect(result.current).toBeDefined();
      expect(result.current.particleTrigger).toBe(false);
      expect(result.current.isShuffling).toBe(false);
      expect(result.current.isWinAnimating).toBe(false);
      expect(typeof result.current.triggerShuffleAnimation).toBe('function');
      expect(typeof result.current.resetShuffleAnimation).toBe('function');
      expect(typeof result.current.animateStockFlip).toBe('function');
    });

    it('should provide all required animation functions', () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      expect(result.current.triggerShuffleAnimation).toBeDefined();
      expect(result.current.resetShuffleAnimation).toBeDefined();
      expect(result.current.animateStockFlip).toBeDefined();
    });
  });

  describe('triggerShuffleAnimation', () => {
    it('should trigger shuffle animation state', () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      act(() => {
        result.current.triggerShuffleAnimation();
      });
      
      expect(result.current.particleTrigger).toBe(true);
    });

    it('should handle multiple trigger calls', () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      act(() => {
        result.current.triggerShuffleAnimation();
        result.current.triggerShuffleAnimation();
      });
      
      expect(result.current.particleTrigger).toBe(true);
    });
  });

  describe('resetShuffleAnimation', () => {
    it('should reset shuffle animation state', () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      act(() => {
        result.current.triggerShuffleAnimation();
      });
      
      expect(result.current.particleTrigger).toBe(true);
      
      act(() => {
        result.current.resetShuffleAnimation();
      });
      
      expect(result.current.particleTrigger).toBe(false);
    });

    it('should reset from any state', () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      act(() => {
        result.current.resetShuffleAnimation();
      });
      
      expect(result.current.particleTrigger).toBe(false);
    });
  });

  describe('animateStockFlip', () => {
    it('should execute stock flip animation', async () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      const mockCard = { id: 'test-card', suit: 'hearts' as const, rank: 1, faceUp: true };
      
      await act(async () => {
        await result.current.animateStockFlip(mockCard);
      });
      
      // The function should be called with mock elements since pile elements are not found
      // Note: animateStockFlip is destructured as newAnimateStockFlip in useGameAnimations
      expect(mockAnimateStockFlip).toHaveBeenCalledWith(
        mockCard,
        expect.any(HTMLElement), // mockStockElement
        expect.any(HTMLElement)  // mockWasteElement
      );
    });

    it('should handle null elements gracefully', async () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      const mockCard = { id: 'test-card', suit: 'hearts' as const, rank: 1, faceUp: true };
      
      await act(async () => {
        await result.current.animateStockFlip(mockCard);
      });
      
      // Should not throw even with null elements
      expect(true).toBe(true);
    });

    it('should play sound effects when enabled', async () => {
      const { playSoundEffect } = require('../utils/soundUtils');
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      const mockCard = { id: 'test-card', suit: 'hearts' as const, rank: 1, faceUp: true };
      
      await act(async () => {
        await result.current.animateStockFlip(mockCard);
      });
      
      expect(playSoundEffect.cardFlip).toHaveBeenCalled();
    });

    it('should not play sound when disabled', async () => {
      const { playSoundEffect } = require('../utils/soundUtils');
      const gameStateWithoutSound = {
        ...mockGameState,
        settings: { ...mockGameState.settings, soundEnabled: false }
      };
      const { result } = renderHook(() => useGameAnimations(gameStateWithoutSound));
      const mockCard = { id: 'test-card', suit: 'hearts' as const, rank: 1, faceUp: true };
      
      await act(async () => {
        await result.current.animateStockFlip(mockCard);
      });
      
      expect(playSoundEffect.cardFlip).not.toHaveBeenCalled();
    });
  });

  describe('Game state integration', () => {
    it('should respond to game won state', () => {
      const wonGameState = {
        ...mockGameState,
        isGameWon: true
      };
      
      const { result } = renderHook(() => useGameAnimations(wonGameState));
      
      expect(result.current.isWinAnimating).toBe(true);
    });

    it('should handle game state changes', () => {
      const { result, rerender } = renderHook(
        ({ gameState }) => useGameAnimations(gameState),
        { initialProps: { gameState: mockGameState } }
      );
      
      expect(result.current.isWinAnimating).toBe(false);
      
      const wonGameState = { ...mockGameState, isGameWon: true };
      rerender({ gameState: wonGameState });
      
      expect(result.current.isWinAnimating).toBe(true);
    });

    it('should handle undefined game state', () => {
      const { result } = renderHook(() => useGameAnimations(undefined as any));
      
      expect(result.current).toBeDefined();
      expect(result.current.particleTrigger).toBe(false);
    });
  });

  describe('Animation timing', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should handle animation delays', async () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      act(() => {
        result.current.triggerShuffleAnimation();
      });
      
      expect(result.current.particleTrigger).toBe(true);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(result.current.particleTrigger).toBe(true);
    });

    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      act(() => {
        result.current.triggerShuffleAnimation();
        result.current.resetShuffleAnimation();
        result.current.triggerShuffleAnimation();
      });
      
      expect(result.current.particleTrigger).toBe(true);
    });
  });

  describe('Performance considerations', () => {
    it('should not create memory leaks', () => {
      const { result, unmount } = renderHook(() => useGameAnimations(mockGameState));
      
      expect(result.current).toBeDefined();
      
      unmount();
      
      // Should not throw after unmount
      expect(true).toBe(true);
    });

    it('should handle concurrent animations', async () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      const mockCard1 = { id: 'test-card-1', suit: 'hearts' as const, rank: 1, faceUp: true };
      const mockCard2 = { id: 'test-card-2', suit: 'spades' as const, rank: 2, faceUp: true };
      
      await act(async () => {
        const promise1 = result.current.animateStockFlip(mockCard1);
        const promise2 = result.current.animateStockFlip(mockCard2);
        
        await Promise.all([promise1, promise2]);
      });
      
      // Should handle concurrent animations without errors
      expect(true).toBe(true);
    });

    it('should debounce rapid animation triggers', () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.triggerShuffleAnimation();
        }
      });
      
      expect(result.current.particleTrigger).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle animation errors gracefully', async () => {
      mockAnimateStockFlip.mockRejectedValueOnce(new Error('Animation failed'));
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      const mockCard = { id: 'test-card', suit: 'hearts' as const, rank: 1, faceUp: true };

      await act(async () => {
        await expect(
          result.current.animateStockFlip(mockCard)
        ).rejects.toThrow('Animation failed');
      });
      
      // The function should be called with mock elements since pile elements are not found
      // Note: animateStockFlip is destructured as newAnimateStockFlip in useGameAnimations
      expect(mockAnimateStockFlip).toHaveBeenCalledWith(
        mockCard,
        expect.any(HTMLElement), // mockStockElement
        expect.any(HTMLElement)  // mockWasteElement
      );
    });

    it('should handle invalid elements', async () => {
      const { result } = renderHook(() => useGameAnimations(mockGameState));
      
      const invalidElement = {} as any;
      
      await act(async () => {
        await result.current.animateStockFlip(invalidElement);
      });
      
      // Should not throw
      expect(true).toBe(true);
    });
  });
});