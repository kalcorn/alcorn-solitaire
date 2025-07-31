import { useEffect } from 'react';

export function useGameTimer(gameStarted: boolean, isGameWon: boolean, setTimeElapsed: (fn: (prev: number) => number) => void) {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isGameWon) {
      interval = setInterval(() => {
        try {
          setTimeElapsed(prev => prev + 1);
        } catch (error) {
          // Silently handle callback errors to prevent timer from breaking
          console.warn('Timer callback error:', error);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, isGameWon, setTimeElapsed]);
} 