import { useState, useEffect, useRef } from 'react';
import { GameState } from '@/types';

export function useGameAnimations(gameState: GameState) {
  const [particleTrigger, setParticleTrigger] = useState<{
    type: 'win' | 'validMove' | null;
    position?: { x: number; y: number };
  }>({ type: null });
  const [isShuffling, setIsShuffling] = useState(false);
  const [isWinAnimating, setIsWinAnimating] = useState(false);
  
  // Track timeout IDs for cleanup
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Cleanup function for timeouts
  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  // Trigger win effect when game is won
  useEffect(() => {
    if (gameState.isGameWon && !isWinAnimating) {
      setIsWinAnimating(true);
      setParticleTrigger({ type: 'win' });
      
      const timeout1 = setTimeout(() => {
        setParticleTrigger({ type: null });
        const timeout2 = setTimeout(() => {
          setIsWinAnimating(false);
        }, 1200);
        timeoutRefs.current.push(timeout2);
      }, 100);
      timeoutRefs.current.push(timeout1);
    }

    // Cleanup on unmount or dependency change
    return clearAllTimeouts;
  }, [gameState.isGameWon, isWinAnimating]);

  // Cleanup on unmount
  useEffect(() => {
    return clearAllTimeouts;
  }, []);

  return {
    particleTrigger,
    setParticleTrigger,
    isShuffling,
    setIsShuffling,
    isWinAnimating,
    setIsWinAnimating,
  };
} 