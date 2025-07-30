import { useState, useEffect, useCallback } from 'react';
import { Card, GameState } from '../types';
import { useAnimation } from './useAnimation';
import { usePileElements } from './usePileRegistration';
import { playSoundEffect, initializeSoundSystem } from '../utils/soundUtils';
import { animateElement } from '../utils/animationEngine';

export interface AnimationState {
  particleTrigger: number;
  isShuffling: boolean;
  isWinAnimating: boolean;
  animatingCard: {
    card: Card;
    type: 'stockToWaste' | 'wasteToStock';
    startPosition?: { x: number; y: number };
    endPosition?: { x: number; y: number };
    isLandscapeMobile?: boolean;
  } | null;
  flyingCards: Card[];
  bridgeCards: Card[];
}

export interface GameAnimationHook {
  // Animation state
  particleTrigger: number;
  isShuffling: boolean;
  isWinAnimating: boolean;
  
  // Animation triggers
  triggerShuffleAnimation: () => void;
  resetShuffleAnimation: () => void;
  
  // Animation functions
  animateStockFlip: (card: Card, stockPosition?: { x: number; y: number } | null, wastePosition?: { x: number; y: number } | null, onComplete?: () => void, onError?: (error: string) => void) => Promise<void>;
  
  // New animation system functions
  animateStockToWaste: (card: Card, stockElement: HTMLElement, wasteElement: HTMLElement) => Promise<void>;
  animateCardToFoundation: (card: Card, fromElement: HTMLElement, toElement: HTMLElement) => Promise<void>;
  animateCardToTableau: (card: Card, fromElement: HTMLElement, toElement: HTMLElement) => Promise<void>;
  animateShuffleWasteToStock: (cards: Card[], wasteElements: HTMLElement[], stockElement: HTMLElement) => Promise<void>;
  animateCardFlip: (card: Card, element: HTMLElement) => Promise<void>;
}

export function useGameAnimations(gameState?: GameState): GameAnimationHook {
  const { animateStockFlip: newAnimateStockFlip, animatePileToPile, animateShuffle, animateElementSequence } = useAnimation();
  const { getPileElement } = usePileElements();
  
  // Initialize sound system with game settings
  useEffect(() => {
    if (gameState?.settings) {
      initializeSoundSystem(gameState.settings);
    }
  }, [gameState?.settings]);
  
  // Animation state
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isWinAnimating, setIsWinAnimating] = useState(false);

  // Trigger particle effects when game is won
  useEffect(() => {
    if (gameState?.isGameWon && !isWinAnimating) {
      setIsWinAnimating(true);
      setParticleTrigger(prev => prev + 1);
      
      // Reset win animation after delay
      const timer = setTimeout(() => {
        setIsWinAnimating(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState?.isGameWon, isWinAnimating]);

  const triggerShuffleAnimation = useCallback(() => {
    setIsShuffling(true);
    // Don't auto-reset - let the animation completion callback handle it
  }, []);
  
  const resetShuffleAnimation = useCallback(() => {
    setIsShuffling(false);
  }, []);

  // Legacy animateStockFlip function for backward compatibility
  const animateStockFlip = useCallback(async (
    card: Card,
    stockPosition?: { x: number; y: number } | null,
    wastePosition?: { x: number; y: number } | null,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    try {
      playSoundEffect.cardFlip();

      // Use the new animation system with position overrides if provided
      const stockElement = getPileElement('stock');
      const wasteElement = getPileElement('waste');

      if (stockElement && wasteElement) {
        
        if (stockPosition && wastePosition) {
          // Use position-aware animation for precise positioning
          await animateElement(stockElement, wasteElement, {
            type: 'flip',
            duration: 600,
            card,
            fromPosition: stockPosition,
            toPosition: wastePosition,
            onComplete,
            onError
          });
        } else {
          // Fallback to element-based animation
          await newAnimateStockFlip(card, stockElement, wasteElement);
          onComplete?.();
        }
      } else {
        console.warn('Animation elements not found - stock:', !!stockElement, 'waste:', !!wasteElement);
      }

      onComplete?.();
    } catch (error) {
      console.error('Stock flip animation failed:', error);
      onError?.(error as string);
    }
  }, [gameState?.settings.soundEnabled, newAnimateStockFlip, getPileElement]);





  // New animation system functions
  const animateStockToWaste = useCallback(async (
    card: Card,
    stockElement: HTMLElement,
    wasteElement: HTMLElement
  ): Promise<void> => {
    try {
      await newAnimateStockFlip(card, stockElement, wasteElement);
    } catch (error) {
      throw error;
    }
  }, [newAnimateStockFlip]);

  const animateCardToFoundation = useCallback(async (
    card: Card,
    fromElement: HTMLElement,
    toElement: HTMLElement
  ): Promise<void> => {
    try {
      await animatePileToPile(card, fromElement, toElement);
    } catch (error) {
      throw error;
    }
  }, [animatePileToPile]);

  const animateCardToTableau = useCallback(async (
    card: Card,
    fromElement: HTMLElement,
    toElement: HTMLElement
  ): Promise<void> => {
    try {
      await animatePileToPile(card, fromElement, toElement);
    } catch (error) {
      throw error;
    }
  }, [animatePileToPile]);

  const animateShuffleWasteToStock = useCallback(async (
    cards: Card[],
    wasteElements: HTMLElement[],
    stockElement: HTMLElement
  ): Promise<void> => {
    try {
      await animateShuffle(cards, wasteElements, stockElement);
    } catch (error) {
      throw error;
    }
  }, [animateShuffle]);

  const animateCardFlip = useCallback(async (
    card: Card,
    element: HTMLElement
  ): Promise<void> => {
    try {
      // For a card flip in place, we animate from the element to itself
      // This will trigger the flip animation without movement
      await animatePileToPile(card, element, element);
    } catch (error) {
      throw error;
    }
  }, [animatePileToPile]);

  return {
    // Animation state
    particleTrigger,
    isShuffling,
    isWinAnimating,
    
    // Animation triggers
    triggerShuffleAnimation,
    resetShuffleAnimation,
    
    // Legacy animation functions
    animateStockFlip,
    
    // New animation system functions
    animateStockToWaste,
    animateCardToFoundation,
    animateCardToTableau,
    animateShuffleWasteToStock,
    animateCardFlip
  };
} 