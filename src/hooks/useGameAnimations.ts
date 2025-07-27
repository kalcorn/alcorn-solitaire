import { useState, useCallback, useEffect } from 'react';
import { GameState, Card as CardType } from '@/types';

interface AnimationState {
  particleTrigger: number;
  isShuffling: boolean;
  isWinAnimating: boolean;
  animatingCard: null | { 
    card: CardType; 
    type: 'stockToWaste' | 'wasteToStock';
    startPosition?: { x: number; y: number };
    endPosition?: { x: number; y: number };
    isLandscapeMobile?: boolean;
  };
  flyingCards: Array<{
    id: string;
    card: CardType;
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
    flyX: number;
    flyRotation: number;
  }>;
}

export function useGameAnimations(gameState: GameState) {
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isWinAnimating, setIsWinAnimating] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<AnimationState['animatingCard']>(null);
  const [flyingCards, setFlyingCards] = useState<AnimationState['flyingCards']>([]);

  // Trigger particle effects when game is won
  useEffect(() => {
    if (gameState.isGameWon && !isWinAnimating) {
      setIsWinAnimating(true);
      setParticleTrigger(prev => prev + 1);
      
      // Reset win animation after delay
      const timer = setTimeout(() => {
        setIsWinAnimating(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.isGameWon, isWinAnimating]);

  const triggerShuffleAnimation = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 1200);
  }, []);

  const createShuffleCardsAnimation = useCallback(() => {
    const cards = gameState.stockPile.slice(-10); // Animate last 10 cards
    const newFlyingCards = cards.map((card, index) => {
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      const endX = Math.random() * window.innerWidth;
      const endY = Math.random() * window.innerHeight;
      
      return {
        id: `${card.id}-shuffle-${index}`,
        card,
        startPosition: { x: startX, y: startY },
        endPosition: { x: endX, y: endY },
        flyX: (endX - startX) * 0.3,
        flyRotation: (Math.random() - 0.5) * 30,
      };
    });
    
    setFlyingCards(newFlyingCards);
    
    // Clear flying cards after animation
    setTimeout(() => {
      setFlyingCards([]);
    }, 1000);
  }, [gameState.stockPile]);

  const animateStockFlip = useCallback((
    card: CardType,
    startPosition: { x: number; y: number },
    endPosition: { x: number; y: number },
    type: 'stockToWaste' | 'wasteToStock',
    isLandscapeMobile = false
  ) => {
    setAnimatingCard({
      card,
      type,
      startPosition,
      endPosition,
      isLandscapeMobile,
    });
    
    // Clear animation after completion
    setTimeout(() => {
      setAnimatingCard(null);
    }, 300);
  }, []);

  return {
    particleTrigger,
    setParticleTrigger,
    isShuffling,
    setIsShuffling,
    isWinAnimating,
    setIsWinAnimating,
    animatingCard,
    setAnimatingCard,
    flyingCards,
    setFlyingCards,
    triggerShuffleAnimation,
    createShuffleCardsAnimation,
    animateStockFlip,
  };
} 