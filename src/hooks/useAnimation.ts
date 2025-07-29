/**
 * React Hook for Animation Engine
 * Provides easy integration with React components
 */

import { useCallback } from 'react';
import { animateElement, animateElementSequence, AnimationOptions, SequenceOptions } from '@/utils/animationEngine';
import { Card } from '@/types';

export interface AnimationHook {
  animateCard: (
    fromElement: HTMLElement,
    toElement: HTMLElement,
    options: AnimationOptions
  ) => Promise<void>;
  
  animateSequence: (
    animations: Array<{
      fromElement: HTMLElement;
      toElement: HTMLElement;
      options: AnimationOptions;
    }>,
    sequenceOptions: SequenceOptions
  ) => Promise<void>;
  
  // Convenience methods for common animations
  animateStockFlip: (
    card: Card,
    stockElement: HTMLElement,
    wasteElement: HTMLElement,
    onComplete?: () => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  
  animatePileToPile: (
    card: Card,
    fromElement: HTMLElement,
    toElement: HTMLElement,
    onComplete?: () => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  
  animateShuffle: (
    cards: Card[],
    fromElements: HTMLElement[],
    toElement: HTMLElement,
    onComplete?: () => void,
    onError?: (error: string) => void
  ) => Promise<void>;
}

export function useAnimation(): AnimationHook {
  const animateCard = useCallback(async (
    fromElement: HTMLElement,
    toElement: HTMLElement,
    options: AnimationOptions
  ): Promise<void> => {
    return animateElement(fromElement, toElement, options);
  }, []);

  const animateSequence = useCallback(async (
    animations: Array<{
      fromElement: HTMLElement;
      toElement: HTMLElement;
      options: AnimationOptions;
    }>,
    sequenceOptions: SequenceOptions
  ): Promise<void> => {
    return animateElementSequence(animations, sequenceOptions);
  }, []);

  const animateStockFlip = useCallback(async (
    card: Card,
    stockElement: HTMLElement,
    wasteElement: HTMLElement,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    console.log('[useAnimation] animateStockFlip called:', {
      cardId: card.id,
      cardSuit: card.suit,
      cardRank: card.rank,
      faceUp: card.faceUp
    });

    return animateElement(stockElement, wasteElement, {
      type: 'flip',
      duration: 600,
      card,
      onComplete,
      onError
    });
  }, []);

  const animatePileToPile = useCallback(async (
    card: Card,
    fromElement: HTMLElement,
    toElement: HTMLElement,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    console.log('[useAnimation] animatePileToPile called:', {
      cardId: card.id,
      fromElement: fromElement.id || fromElement.className,
      toElement: toElement.id || toElement.className
    });

    return animateElement(fromElement, toElement, {
      type: 'move',
      duration: 300,
      onComplete,
      onError
    });
  }, []);

  const animateShuffle = useCallback(async (
    cards: Card[],
    fromElements: HTMLElement[],
    toElement: HTMLElement,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    console.log('[useAnimation] animateShuffle called:', {
      cardCount: cards.length,
      toElement: toElement.id || toElement.className
    });

    if (cards.length !== fromElements.length) {
      throw new Error('Card count must match element count for shuffle animation');
    }

    const animations = cards.map((card, index) => ({
      fromElement: fromElements[index],
      toElement,
      options: {
        type: 'shuffle' as const,
        duration: 200,
        card
      }
    }));

    return animateElementSequence(animations, {
      staggerDelay: 50,
      totalDuration: 1000,
      onComplete,
      onError
    });
  }, []);

  return {
    animateCard,
    animateSequence,
    animateStockFlip,
    animatePileToPile,
    animateShuffle
  };
} 