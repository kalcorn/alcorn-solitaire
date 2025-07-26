import { useEffect } from 'react';

export function useGameTimer(gameStarted: boolean, isGameWon: boolean, setTimeElapsed: (fn: (prev: number) => number) => void) {
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isGameWon) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, isGameWon, setTimeElapsed]);
} 