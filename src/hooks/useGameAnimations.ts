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
  bridgeCards: Array<{
    id: string;
    card: CardType;
    startPosition: { x: number; y: number };
    endPosition: { x: number; y: number };
    delay: number;
  }>;
}

export function useGameAnimations(gameState: GameState) {
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isWinAnimating, setIsWinAnimating] = useState(false);
  const [animatingCard, setAnimatingCard] = useState<AnimationState['animatingCard']>(null);
  const [flyingCards, setFlyingCards] = useState<AnimationState['flyingCards']>([]);
  const [bridgeCards, setBridgeCards] = useState<AnimationState['bridgeCards']>([]);

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

  const createCardBridgeAnimation = useCallback((
    wastePosition: { x: number; y: number },
    stockPosition: { x: number; y: number },
    isLandscapeMobile = false
  ) => {
    // Get all cards from waste pile
    const wasteCards = gameState.wastePile;
    if (wasteCards.length === 0) return;

    // Calculate timing for exactly 1 second total duration
    const totalDuration = 1000; // 1 second
    const animationDuration = 300; // Each card animation takes 300ms
    const staggerDelay = wasteCards.length > 1 
      ? (totalDuration - animationDuration) / (wasteCards.length - 1) 
      : 0;

    // Create bridge animation for each card
    const newBridgeCards = wasteCards.map((card, index) => {
      const delay = index * staggerDelay;
      
      return {
        id: `${card.id}-bridge-${index}`,
        card,
        startPosition: wastePosition,
        endPosition: stockPosition,
        delay,
      };
    });
    
    setBridgeCards(newBridgeCards);
    
    // Clear bridge cards after exactly 1 second
    setTimeout(() => {
      setBridgeCards([]);
    }, totalDuration);
  }, [gameState.wastePile]);

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
    bridgeCards,
    setBridgeCards,
    triggerShuffleAnimation,
    createShuffleCardsAnimation,
    createCardBridgeAnimation,
    animateStockFlip,
  };
} 