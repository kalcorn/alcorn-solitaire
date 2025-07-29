import { useState, useEffect, useCallback } from 'react';
import { Card, GameState } from '../types';
import { useAnimation } from './useAnimation';
import { usePileElements } from './usePileRegistration';
import { playSoundEffect } from '../utils/soundUtils';

export interface AnimationState {
  particleTrigger: number;
  isShuffling: boolean;
  isWinAnimating: boolean;
  animatingCard: {
    card: any;
    type: 'stockToWaste' | 'wasteToStock';
    startPosition?: { x: number; y: number };
    endPosition?: { x: number; y: number };
    isLandscapeMobile?: boolean;
  } | null;
  flyingCards: any[];
  bridgeCards: any[];
}

export interface GameAnimationHook {
  // Animation state
  particleTrigger: number;
  isShuffling: boolean;
  isWinAnimating: boolean;
  
  // Animation triggers
  triggerShuffleAnimation: () => void;
  
  // Animation functions
  animateStockFlip: (card: any, stockPosition?: { x: number; y: number } | null, wastePosition?: { x: number; y: number } | null, onComplete?: () => void, onError?: (error: string) => void) => Promise<void>;
  animateWasteToStock: (cards: any[], onComplete?: () => void, onError?: (error: string) => void) => Promise<void>;
  
  // New animation system functions
  animateStockToWaste: (card: Card, stockElement: HTMLElement, wasteElement: HTMLElement) => Promise<void>;
  animateCardToFoundation: (card: Card, fromElement: HTMLElement, toElement: HTMLElement) => Promise<void>;
  animateCardToTableau: (card: Card, fromElement: HTMLElement, toElement: HTMLElement) => Promise<void>;
  animateShuffleWasteToStock: (cards: Card[], wasteElements: HTMLElement[], stockElement: HTMLElement) => Promise<void>;
  animateCardFlip: (card: Card, element: HTMLElement) => Promise<void>;
}

export function useGameAnimations(gameState?: GameState): GameAnimationHook {
  const { animateStockFlip: newAnimateStockFlip, animatePileToPile, animateShuffle } = useAnimation();
  const { getPileElement } = usePileElements();
  
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
    setTimeout(() => setIsShuffling(false), 1200);
  }, []);

  // Legacy animateStockFlip function for backward compatibility
  const animateStockFlip = useCallback(async (
    card: any,
    stockPosition?: { x: number; y: number } | null,
    wastePosition?: { x: number; y: number } | null,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    try {
      console.log('[useGameAnimations] animateStockFlip called with:', {
        card: {
          id: card.id,
          suit: card.suit,
          rank: card.rank,
          faceUp: card.faceUp
        },
        stockPosition,
        wastePosition,
        hasPositions: !!(stockPosition && wastePosition)
      });
      
      if (gameState?.settings.soundEnabled) {
        playSoundEffect.cardFlip();
      }

      // Use the new animation system with actual DOM elements
      const stockElement = getPileElement('stock');
      const wasteElement = getPileElement('waste');

      if (stockElement && wasteElement) {
        console.log('[useGameAnimations] Using new animation system for stock flip');
        await newAnimateStockFlip(card, stockElement, wasteElement);
      } else {
        console.warn('[useGameAnimations] Pile elements not found, falling back to immediate completion');
      }

      onComplete?.();
    } catch (error) {
      console.error('Stock flip animation failed:', error);
      onError?.(error as string);
    }
  }, [gameState?.settings.soundEnabled, newAnimateStockFlip, getPileElement]);

  // Legacy animateWasteToStock function for backward compatibility
  const animateWasteToStock = useCallback(async (
    cards: any[],
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    try {
      if (gameState?.settings.soundEnabled) {
        if (cards.length === 1) {
          playSoundEffect.cardFlip();
        } else {
          playSoundEffect.shuffle();
        }
      }

      // Use the new animation system with actual DOM elements
      const stockElement = getPileElement('stock');
      const wasteElement = getPileElement('waste');

      if (stockElement && wasteElement) {
        console.log('[useGameAnimations] Using new animation system for waste to stock shuffle');
        // Create waste elements array (simplified - in real implementation we'd get actual card elements)
        const wasteElements = Array(cards.length).fill(wasteElement);
        await animateShuffle(cards, wasteElements, stockElement);
      } else {
        console.warn('[useGameAnimations] Pile elements not found, falling back to immediate completion');
      }

      onComplete?.();
    } catch (error) {
      console.error('Waste to stock animation failed:', error);
      onError?.(error as string);
    }
  }, [gameState?.settings.soundEnabled, animateShuffle, getPileElement]);

  // New animation system functions
  const animateStockToWaste = useCallback(async (
    card: Card,
    stockElement: HTMLElement,
    wasteElement: HTMLElement
  ): Promise<void> => {
    console.log('[useGameAnimations] animateStockToWaste:', {
      cardId: card.id,
      cardSuit: card.suit,
      cardRank: card.rank,
      faceUp: card.faceUp
    });

    try {
      await newAnimateStockFlip(card, stockElement, wasteElement);
      console.log('[useGameAnimations] Stock to waste animation completed');
    } catch (error) {
      console.error('[useGameAnimations] Stock to waste animation failed:', error);
      throw error;
    }
  }, [newAnimateStockFlip]);

  const animateCardToFoundation = useCallback(async (
    card: Card,
    fromElement: HTMLElement,
    toElement: HTMLElement
  ): Promise<void> => {
    console.log('[useGameAnimations] animateCardToFoundation:', {
      cardId: card.id,
      cardSuit: card.suit,
      cardRank: card.rank,
      fromElement: fromElement.id || fromElement.className,
      toElement: toElement.id || toElement.className
    });

    try {
      await animatePileToPile(card, fromElement, toElement);
      console.log('[useGameAnimations] Card to foundation animation completed');
    } catch (error) {
      console.error('[useGameAnimations] Card to foundation animation failed:', error);
      throw error;
    }
  }, [animatePileToPile]);

  const animateCardToTableau = useCallback(async (
    card: Card,
    fromElement: HTMLElement,
    toElement: HTMLElement
  ): Promise<void> => {
    console.log('[useGameAnimations] animateCardToTableau:', {
      cardId: card.id,
      cardSuit: card.suit,
      cardRank: card.rank,
      fromElement: fromElement.id || fromElement.className,
      toElement: toElement.id || toElement.className
    });

    try {
      await animatePileToPile(card, fromElement, toElement);
      console.log('[useGameAnimations] Card to tableau animation completed');
    } catch (error) {
      console.error('[useGameAnimations] Card to tableau animation failed:', error);
      throw error;
    }
  }, [animatePileToPile]);

  const animateShuffleWasteToStock = useCallback(async (
    cards: Card[],
    wasteElements: HTMLElement[],
    stockElement: HTMLElement
  ): Promise<void> => {
    console.log('[useGameAnimations] animateShuffleWasteToStock:', {
      cardCount: cards.length,
      stockElement: stockElement.id || stockElement.className
    });

    try {
      await animateShuffle(cards, wasteElements, stockElement);
      console.log('[useGameAnimations] Shuffle waste to stock animation completed');
    } catch (error) {
      console.error('[useGameAnimations] Shuffle waste to stock animation failed:', error);
      throw error;
    }
  }, [animateShuffle]);

  const animateCardFlip = useCallback(async (
    card: Card,
    element: HTMLElement
  ): Promise<void> => {
    console.log('[useGameAnimations] animateCardFlip:', {
      cardId: card.id,
      cardSuit: card.suit,
      cardRank: card.rank,
      element: element.id || element.className
    });

    try {
      // For a card flip in place, we animate from the element to itself
      // This will trigger the flip animation without movement
      await animatePileToPile(card, element, element);
      console.log('[useGameAnimations] Card flip animation completed');
    } catch (error) {
      console.error('[useGameAnimations] Card flip animation failed:', error);
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
    
    // Legacy animation functions
    animateStockFlip,
    animateWasteToStock,
    
    // New animation system functions
    animateStockToWaste,
    animateCardToFoundation,
    animateCardToTableau,
    animateShuffleWasteToStock,
    animateCardFlip
  };
} 