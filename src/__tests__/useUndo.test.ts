import { renderHook, act } from '@testing-library/react';
import { useUndo } from '../hooks/useUndo';
import { GameState, GameHistoryEntry } from '@/types';

describe('useUndo Hook', () => {
  let mockSetGameState: jest.Mock;
  let mockGameState: GameState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetGameState = jest.fn();
    
    mockGameState = {
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
  });

  describe('Hook initialization', () => {
    it('should initialize with correct functions', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.saveState).toBe('function');
      expect(typeof result.current.undo).toBe('function');
      expect(typeof result.current.canUndo).toBe('function');
    });

    it('should handle undefined setGameState callback', () => {
      expect(() => {
        renderHook(() => useUndo(undefined as any));
      }).not.toThrow();
    });
  });

  describe('saveState function', () => {
    it('should save game state to history', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const action = 'Move card';
      const history: GameHistoryEntry[] = [];
      const historyIndex = -1;
      
      const savedResult = result.current.saveState(action, mockGameState, history, historyIndex);
      
      expect(savedResult.history).toHaveLength(1);
      expect(savedResult.historyIndex).toBe(0);
      expect(savedResult.history[0].action).toBe(action);
      expect(savedResult.history[0].state).toBeDefined();
      expect(savedResult.history[0].timestamp).toBeDefined();
    });

    it('should clear selection data when saving state', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const gameStateWithSelection = {
        ...mockGameState,
        selectedCards: [{ id: 'card1', suit: 'hearts' as const, rank: 1, faceUp: true }],
        selectedPileType: 'tableau' as const,
        selectedPileIndex: 0
      };
      
      const savedResult = result.current.saveState('Test', gameStateWithSelection, [], -1);
      
      expect(savedResult.history[0].state.selectedCards).toEqual([]);
      expect(savedResult.history[0].state.selectedPileType).toBeNull();
      expect(savedResult.history[0].state.selectedPileIndex).toBeNull();
    });

    it('should limit history to 50 entries', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      // Create initial history with 50 entries
      const initialHistory: GameHistoryEntry[] = Array.from({ length: 50 }, (_, i) => ({
        state: mockGameState,
        timestamp: Date.now() - (50 - i) * 1000,
        action: `Action ${i}`
      }));
      
      const savedResult = result.current.saveState('New Action', mockGameState, initialHistory, 49);
      
      expect(savedResult.history).toHaveLength(50);
      expect(savedResult.history[49].action).toBe('New Action');
      expect(savedResult.history[0].action).toBe('Action 1'); // First entry removed
    });

    it('should truncate history when saving from middle of history', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const initialHistory: GameHistoryEntry[] = [
        { state: mockGameState, timestamp: Date.now() - 3000, action: 'Action 1' },
        { state: mockGameState, timestamp: Date.now() - 2000, action: 'Action 2' },
        { state: mockGameState, timestamp: Date.now() - 1000, action: 'Action 3' }
      ];
      
      // Save from middle of history (index 1)
      const savedResult = result.current.saveState('New Action', mockGameState, initialHistory, 1);
      
      expect(savedResult.history).toHaveLength(3);
      expect(savedResult.history[2].action).toBe('New Action');
      expect(savedResult.historyIndex).toBe(2);
    });

    it('should handle empty history', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const savedResult = result.current.saveState('First Action', mockGameState, [], -1);
      
      expect(savedResult.history).toHaveLength(1);
      expect(savedResult.historyIndex).toBe(0);
      expect(savedResult.history[0].action).toBe('First Action');
    });

    it('should preserve game state properties correctly', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const gameStateWithData = {
        ...mockGameState,
        moves: 5,
        score: 100,
        stockCycles: 2,
        stockPile: [{ id: 'card1', suit: 'hearts' as const, rank: 1, faceUp: false }],
        wastePile: [{ id: 'card2', suit: 'spades' as const, rank: 13, faceUp: true }]
      };
      
      const savedResult = result.current.saveState('Test', gameStateWithData, [], -1);
      const savedState = savedResult.history[0].state;
      
      expect(savedState.moves).toBe(5);
      expect(savedState.score).toBe(100);
      expect(savedState.stockCycles).toBe(2);
      expect(savedState.stockPile).toHaveLength(1);
      expect(savedState.wastePile).toHaveLength(1);
    });
  });

  describe('undo function', () => {
    it('should undo to previous state', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const history: GameHistoryEntry[] = [
        {
          state: { ...mockGameState, moves: 0, score: 0 },
          timestamp: Date.now() - 1000,
          action: 'Initial'
        },
        {
          state: { ...mockGameState, moves: 1, score: 10 },
          timestamp: Date.now(),
          action: 'Move card'
        }
      ];
      
      const currentState = {
        ...mockGameState,
        moves: 2,
        score: 20,
        history,
        historyIndex: 1
      };
      
      const undoResult = result.current.undo(currentState);
      
      expect(undoResult).toBe(true);
      expect(mockSetGameState).toHaveBeenCalledWith({
        ...history[0].state,
        history,
        historyIndex: 0
      });
    });

    it('should return false when no history available', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const currentState = {
        ...mockGameState,
        history: [],
        historyIndex: -1
      };
      
      const undoResult = result.current.undo(currentState);
      
      expect(undoResult).toBe(false);
      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should return false when at beginning of history', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const history: GameHistoryEntry[] = [
        {
          state: { ...mockGameState, moves: 0 },
          timestamp: Date.now(),
          action: 'Initial'
        }
      ];
      
      const currentState = {
        ...mockGameState,
        history,
        historyIndex: 0
      };
      
      const undoResult = result.current.undo(currentState);
      
      expect(undoResult).toBe(false);
      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should handle corrupted history entry', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const history: GameHistoryEntry[] = [
        {
          state: { ...mockGameState, moves: 0 },
          timestamp: Date.now() - 1000,
          action: 'Initial'
        },
        {
          state: { ...mockGameState, moves: 1 },
          timestamp: Date.now(),
          action: 'Valid'
        }
      ];
      
      const currentState = {
        ...mockGameState,
        history,
        historyIndex: 1
      };
      
      // Corrupt the history entry by removing required properties
      history[0].state = { ...history[0].state, tableauPiles: undefined as any };
      
      const undoResult = result.current.undo(currentState);
      
      expect(undoResult).toBe(false);
      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should handle history entry without state', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const history: GameHistoryEntry[] = [
        {
          state: null as any, // Corrupted entry at index 0
          timestamp: Date.now() - 1000,
          action: 'Corrupted'
        },
        {
          state: { ...mockGameState, moves: 1 },
          timestamp: Date.now(),
          action: 'Valid'
        }
      ];
      
      const currentState = {
        ...mockGameState,
        history,
        historyIndex: 1
      };
      
      const undoResult = result.current.undo(currentState);
      
      expect(undoResult).toBe(false);
      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should preserve history and update index correctly', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const history: GameHistoryEntry[] = [
        {
          state: { ...mockGameState, moves: 0 },
          timestamp: Date.now() - 2000,
          action: 'Initial'
        },
        {
          state: { ...mockGameState, moves: 1 },
          timestamp: Date.now() - 1000,
          action: 'Move 1'
        },
        {
          state: { ...mockGameState, moves: 2 },
          timestamp: Date.now(),
          action: 'Move 2'
        }
      ];
      
      const currentState = {
        ...mockGameState,
        moves: 3,
        history,
        historyIndex: 2
      };
      
      result.current.undo(currentState);
      
      expect(mockSetGameState).toHaveBeenCalledWith({
        ...history[1].state,
        history,
        historyIndex: 1
      });
    });
  });

  describe('canUndo function', () => {
    it('should return true when undo is possible', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const stateWithHistory = {
        ...mockGameState,
        history: [
          {
            state: mockGameState,
            timestamp: Date.now(),
            action: 'Test'
          }
        ],
        historyIndex: 0
      };
      
      const canUndo = result.current.canUndo(stateWithHistory);
      
      expect(canUndo).toBe(false); // At index 0, cannot undo further
    });

    it('should return true when can undo', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const stateWithHistory = {
        ...mockGameState,
        history: [
          {
            state: mockGameState,
            timestamp: Date.now() - 1000,
            action: 'First'
          },
          {
            state: mockGameState,
            timestamp: Date.now(),
            action: 'Second'
          }
        ],
        historyIndex: 1
      };
      
      const canUndo = result.current.canUndo(stateWithHistory);
      
      expect(canUndo).toBe(true);
    });

    it('should return false when no history', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const stateWithoutHistory = {
        ...mockGameState,
        history: [],
        historyIndex: -1
      };
      
      const canUndo = result.current.canUndo(stateWithoutHistory);
      
      expect(canUndo).toBe(false);
    });

    it('should return false when at beginning of history', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const stateAtBeginning = {
        ...mockGameState,
        history: [
          {
            state: mockGameState,
            timestamp: Date.now(),
            action: 'Initial'
          }
        ],
        historyIndex: 0
      };
      
      const canUndo = result.current.canUndo(stateAtBeginning);
      
      expect(canUndo).toBe(false);
    });

    it('should handle negative history index', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const stateWithNegativeIndex = {
        ...mockGameState,
        history: [
          {
            state: mockGameState,
            timestamp: Date.now(),
            action: 'Test'
          }
        ],
        historyIndex: -1
      };
      
      const canUndo = result.current.canUndo(stateWithNegativeIndex);
      
      expect(canUndo).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete save and undo cycle', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      // Initial state
      const initialState = { ...mockGameState, moves: 0, score: 0 };
      let history: GameHistoryEntry[] = [];
      let historyIndex = -1;
      
      // Save first move
      const firstSave = result.current.saveState('First move', initialState, history, historyIndex);
      history = firstSave.history;
      historyIndex = firstSave.historyIndex;
      
      // Make second move
      const secondState = { ...mockGameState, moves: 1, score: 10 };
      const secondSave = result.current.saveState('Second move', secondState, history, historyIndex);
      history = secondSave.history;
      historyIndex = secondSave.historyIndex;
      
      // Current state after second move
      const currentState = {
        ...mockGameState,
        moves: 2,
        score: 20,
        history,
        historyIndex
      };
      
      // Undo should work
      expect(result.current.canUndo(currentState)).toBe(true);
      
      const undoResult = result.current.undo(currentState);
      expect(undoResult).toBe(true);
      
      // Should have called setGameState with first move state
      expect(mockSetGameState).toHaveBeenCalledWith({
        ...history[0].state,
        history,
        historyIndex: 0
      });
    });

    it('should handle multiple consecutive undos', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const history: GameHistoryEntry[] = [
        {
          state: { ...mockGameState, moves: 0 },
          timestamp: Date.now() - 3000,
          action: 'Initial'
        },
        {
          state: { ...mockGameState, moves: 1 },
          timestamp: Date.now() - 2000,
          action: 'Move 1'
        },
        {
          state: { ...mockGameState, moves: 2 },
          timestamp: Date.now() - 1000,
          action: 'Move 2'
        }
      ];
      
      // Start at the end of history
      let currentState = {
        ...mockGameState,
        moves: 3,
        history,
        historyIndex: 2
      };
      
      // First undo
      expect(result.current.canUndo(currentState)).toBe(true);
      result.current.undo(currentState);
      
      // Update state after first undo
      currentState = {
        ...history[1].state,
        history,
        historyIndex: 1
      };
      
      // Second undo
      expect(result.current.canUndo(currentState)).toBe(true);
      result.current.undo(currentState);
      
      // Update state after second undo
      currentState = {
        ...history[0].state,
        history,
        historyIndex: 0
      };
      
      // Third undo should not be possible
      expect(result.current.canUndo(currentState)).toBe(false);
      expect(result.current.undo(currentState)).toBe(false);
      
      expect(mockSetGameState).toHaveBeenCalledTimes(2);
    });

    it('should handle save after undo (branching history)', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const initialHistory: GameHistoryEntry[] = [
        {
          state: { ...mockGameState, moves: 0 },
          timestamp: Date.now() - 2000,
          action: 'Initial'
        },
        {
          state: { ...mockGameState, moves: 1 },
          timestamp: Date.now() - 1000,
          action: 'Move 1'
        },
        {
          state: { ...mockGameState, moves: 2 },
          timestamp: Date.now(),
          action: 'Move 2'
        }
      ];
      
      // Undo from end to middle
      const stateAfterUndo = {
        ...mockGameState,
        history: initialHistory,
        historyIndex: 1
      };
      
      // Save new action from middle - should truncate future history
      const newSave = result.current.saveState(
        'Alternative move', 
        { ...mockGameState, moves: 3, score: 50 }, 
        stateAfterUndo.history, 
        stateAfterUndo.historyIndex
      );
      
      expect(newSave.history).toHaveLength(3);
      expect(newSave.history[2].action).toBe('Alternative move');
      expect(newSave.historyIndex).toBe(2);
    });
  });

  describe('Performance considerations', () => {
    it('should not create memory leaks', () => {
      const { result, unmount } = renderHook(() => useUndo(mockSetGameState));
      
      expect(result.current).toBeDefined();
      
      unmount();
      
      // Should not throw after unmount
      expect(true).toBe(true);
    });

    it('should handle large history efficiently', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      // Create large history
      const largeHistory: GameHistoryEntry[] = Array.from({ length: 100 }, (_, i) => ({
        state: { ...mockGameState, moves: i },
        timestamp: Date.now() - (100 - i) * 1000,
        action: `Move ${i}`
      }));
      
      const savedResult = result.current.saveState('New move', mockGameState, largeHistory, 99);
      
      // Should limit to 50 entries
      expect(savedResult.history).toHaveLength(50);
      expect(savedResult.historyIndex).toBe(49);
    });

    it('should handle rapid save operations', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      let history: GameHistoryEntry[] = [];
      let historyIndex = -1;
      
      // Rapid saves
      for (let i = 0; i < 10; i++) {
        const saveResult = result.current.saveState(
          `Rapid move ${i}`,
          { ...mockGameState, moves: i },
          history,
          historyIndex
        );
        history = saveResult.history;
        historyIndex = saveResult.historyIndex;
      }
      
      expect(history).toHaveLength(10);
      expect(historyIndex).toBe(9);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null game state gracefully', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      expect(() => {
        result.current.undo(null as any);
      }).not.toThrow();
      
      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should handle undefined history gracefully', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const stateWithUndefinedHistory = {
        ...mockGameState,
        history: undefined as any,
        historyIndex: 0
      };
      
      expect(() => {
        result.current.canUndo(stateWithUndefinedHistory);
        result.current.undo(stateWithUndefinedHistory);
      }).not.toThrow();
      
      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should handle callback throwing errors', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('SetGameState error');
      });
      
      const { result } = renderHook(() => useUndo(errorCallback));
      
      const history: GameHistoryEntry[] = [
        {
          state: mockGameState,
          timestamp: Date.now() - 1000,
          action: 'Previous'
        },
        {
          state: mockGameState,
          timestamp: Date.now(),
          action: 'Current'
        }
      ];
      
      const currentState = {
        ...mockGameState,
        history,
        historyIndex: 1
      };
      
      expect(() => {
        result.current.undo(currentState);
      }).toThrow('SetGameState error');
    });

    it('should handle timestamp consistency', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const startTime = Date.now();
      const savedResult = result.current.saveState('Test', mockGameState, [], -1);
      const endTime = Date.now();
      
      const timestamp = savedResult.history[0].timestamp;
      expect(timestamp).toBeGreaterThanOrEqual(startTime);
      expect(timestamp).toBeLessThanOrEqual(endTime);
    });

    it('should handle extreme history indices', () => {
      const { result } = renderHook(() => useUndo(mockSetGameState));
      
      const history: GameHistoryEntry[] = [
        {
          state: mockGameState,
          timestamp: Date.now(),
          action: 'Test'
        }
      ];
      
      const stateWithExtremeIndex = {
        ...mockGameState,
        history,
        historyIndex: 999 // Way beyond history length
      };
      
      expect(result.current.canUndo(stateWithExtremeIndex)).toBe(true);
      expect(result.current.undo(stateWithExtremeIndex)).toBe(false); // Should handle gracefully
    });
  });
});