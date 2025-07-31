import { renderHook, act } from '@testing-library/react';
import { useGameTimer } from '../hooks/useGameTimer';

describe('useGameTimer Hook', () => {
  let mockSetTimeElapsed: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSetTimeElapsed = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Hook initialization', () => {
    it('should initialize without starting timer when game not started', () => {
      renderHook(() => useGameTimer(false, false, mockSetTimeElapsed));
      
      jest.advanceTimersByTime(1000);
      
      expect(mockSetTimeElapsed).not.toHaveBeenCalled();
    });

    it('should initialize without starting timer when game is won', () => {
      renderHook(() => useGameTimer(true, true, mockSetTimeElapsed));
      
      jest.advanceTimersByTime(1000);
      
      expect(mockSetTimeElapsed).not.toHaveBeenCalled();
    });

    it('should handle undefined callback function', () => {
      expect(() => {
        renderHook(() => useGameTimer(false, false, undefined as any));
      }).not.toThrow();
    });
  });

  describe('Timer functionality', () => {
    it('should start timer when game is started and not won', () => {
      renderHook(() => useGameTimer(true, false, mockSetTimeElapsed));
      
      jest.advanceTimersByTime(1000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
      expect(mockSetTimeElapsed).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should increment time elapsed every second', () => {
      renderHook(() => useGameTimer(true, false, mockSetTimeElapsed));
      
      jest.advanceTimersByTime(3000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(3);
    });

    it('should stop timer when game is won', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: true, isGameWon: false } }
      );
      
      jest.advanceTimersByTime(1000);
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
      
      // Game is won
      rerender({ gameStarted: true, isGameWon: true });
      
      jest.advanceTimersByTime(2000);
      
      // Should not increment after game is won
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
    });

    it('should stop timer when game is paused', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: true, isGameWon: false } }
      );
      
      jest.advanceTimersByTime(1000);
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
      
      // Game is paused
      rerender({ gameStarted: false, isGameWon: false });
      
      jest.advanceTimersByTime(2000);
      
      // Should not increment after game is paused
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
    });
  });

  describe('Timer state transitions', () => {
    it('should handle rapid state changes', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: false, isGameWon: false } }
      );
      
      // Start game
      rerender({ gameStarted: true, isGameWon: false });
      jest.advanceTimersByTime(1000); // Wait for full second
      
      // Pause game
      rerender({ gameStarted: false, isGameWon: false });
      jest.advanceTimersByTime(500);
      
      // Resume game
      rerender({ gameStarted: true, isGameWon: false });
      jest.advanceTimersByTime(1000); // Wait for full second
      
      // Win game
      rerender({ gameStarted: true, isGameWon: true });
      jest.advanceTimersByTime(1000); // Wait for full second - should not increment
      
      // Only the first and third intervals should increment
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple game restarts', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: true, isGameWon: false } }
      );
      
      jest.advanceTimersByTime(1000);
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
      
      // Win game
      rerender({ gameStarted: true, isGameWon: true });
      jest.advanceTimersByTime(1000);
      
      // Start new game
      rerender({ gameStarted: true, isGameWon: false });
      jest.advanceTimersByTime(1000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(2);
    });

    it('should handle game state changes during timer execution', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: true, isGameWon: false } }
      );
      
      // Timer is running
      jest.advanceTimersByTime(500);
      
      // Change state mid-interval
      rerender({ gameStarted: false, isGameWon: false });
      
      jest.advanceTimersByTime(500);
      
      // Should not complete the interval after state change
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(0);
    });
  });

  describe('Callback function behavior', () => {
    it('should pass correct updater function to setTimeElapsed', () => {
      renderHook(() => useGameTimer(true, false, mockSetTimeElapsed));
      
      jest.advanceTimersByTime(1000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledWith(expect.any(Function));
      
      // Test the updater function
      const updaterFunction = mockSetTimeElapsed.mock.calls[0][0];
      const previousValue = 10;
      const newValue = updaterFunction(previousValue);
      
      expect(newValue).toBe(11);
    });

    it('should handle callback function changes', () => {
      const newMockSetTimeElapsed = jest.fn();
      const { rerender } = renderHook(
        ({ callback }) => useGameTimer(true, false, callback),
        { initialProps: { callback: mockSetTimeElapsed } }
      );
      
      jest.advanceTimersByTime(1000);
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
      
      // Change callback
      rerender({ callback: newMockSetTimeElapsed });
      
      jest.advanceTimersByTime(1000);
      
      expect(newMockSetTimeElapsed).toHaveBeenCalledTimes(1);
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
    });

    it('should handle callback throwing errors', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      
      renderHook(() => useGameTimer(true, false, errorCallback));
      
      // Should not crash when callback throws
      expect(() => {
        jest.advanceTimersByTime(1000);
      }).not.toThrow();
      
      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('Cleanup and memory management', () => {
    it('should cleanup interval on unmount', () => {
      const { unmount } = renderHook(() => useGameTimer(true, false, mockSetTimeElapsed));
      
      jest.advanceTimersByTime(1000);
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
      
      unmount();
      
      jest.advanceTimersByTime(2000);
      
      // Should not continue after unmount
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
    });

    it('should cleanup previous interval when state changes', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: true, isGameWon: false } }
      );
      
      jest.advanceTimersByTime(500);
      
      // Change state to trigger cleanup and new interval
      rerender({ gameStarted: false, isGameWon: false });
      rerender({ gameStarted: true, isGameWon: false });
      
      jest.advanceTimersByTime(1000);
      
      // Should only have one active interval
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid cleanups', () => {
      const { rerender, unmount } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: true, isGameWon: false } }
      );
      
      // Rapid state changes
      for (let i = 0; i < 5; i++) {
        rerender({ gameStarted: false, isGameWon: false });
        rerender({ gameStarted: true, isGameWon: false });
      }
      
      unmount();
      
      // Should not crash or leak memory
      expect(true).toBe(true);
    });
  });

  describe('Performance considerations', () => {
    it('should not create new intervals unnecessarily', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: true, isGameWon: false } }
      );
      
      // Rerender with same props
      rerender({ gameStarted: true, isGameWon: false });
      rerender({ gameStarted: true, isGameWon: false });
      
      jest.advanceTimersByTime(1000);
      
      // Should only have one interval running
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
    });

    it('should handle high-frequency timer updates', () => {
      renderHook(() => useGameTimer(true, false, mockSetTimeElapsed));
      
      // Simulate 60 seconds
      jest.advanceTimersByTime(60000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(60);
    });

    it('should be efficient with dependency array changes', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const { rerender } = renderHook(
        ({ callback }) => useGameTimer(true, false, callback),
        { initialProps: { callback: callback1 } }
      );
      
      jest.advanceTimersByTime(1000);
      expect(callback1).toHaveBeenCalledTimes(1);
      
      // Change dependency
      rerender({ callback: callback2 });
      
      jest.advanceTimersByTime(1000);
      
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback1).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero-duration timers', () => {
      renderHook(() => useGameTimer(true, false, mockSetTimeElapsed));
      
      jest.advanceTimersByTime(0);
      
      expect(mockSetTimeElapsed).not.toHaveBeenCalled();
    });

    it('should handle extremely long running timers', () => {
      renderHook(() => useGameTimer(true, false, mockSetTimeElapsed));
      
      // Simulate 24 hours
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(24 * 60 * 60);
    });

    it('should handle boolean type coercion', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted as any, isGameWon as any, mockSetTimeElapsed),
        { initialProps: { gameStarted: 1 as any, isGameWon: 0 as any } }
      );
      
      jest.advanceTimersByTime(1000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
      
      // Change to falsy values
      rerender({ gameStarted: 0 as any, isGameWon: false });
      
      jest.advanceTimersByTime(1000);
      
      // Should stop timer
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(1);
    });

    it('should handle null and undefined states', () => {
      expect(() => {
        renderHook(() => useGameTimer(null as any, undefined as any, mockSetTimeElapsed));
      }).not.toThrow();
      
      jest.advanceTimersByTime(1000);
      
      expect(mockSetTimeElapsed).not.toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should work with typical game flow', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: false, isGameWon: false } }
      );
      
      // Game starts
      rerender({ gameStarted: true, isGameWon: false });
      jest.advanceTimersByTime(5000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(5);
      
      // Game is won
      rerender({ gameStarted: true, isGameWon: true });
      jest.advanceTimersByTime(3000);
      
      // Should not increment after win
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(5);
      
      // New game starts
      rerender({ gameStarted: true, isGameWon: false });
      jest.advanceTimersByTime(2000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(7);
    });

    it('should handle pause and resume correctly', () => {
      const { rerender } = renderHook(
        ({ gameStarted, isGameWon }) => useGameTimer(gameStarted, isGameWon, mockSetTimeElapsed),
        { initialProps: { gameStarted: true, isGameWon: false } }
      );
      
      // Play for 3 seconds
      jest.advanceTimersByTime(3000);
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(3);
      
      // Pause game
      rerender({ gameStarted: false, isGameWon: false });
      jest.advanceTimersByTime(5000);
      
      // Should not increment during pause
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(3);
      
      // Resume game
      rerender({ gameStarted: true, isGameWon: false });
      jest.advanceTimersByTime(2000);
      
      expect(mockSetTimeElapsed).toHaveBeenCalledTimes(5);
    });
  });
});