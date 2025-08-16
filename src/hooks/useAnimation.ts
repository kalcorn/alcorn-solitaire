/**
 * React Hook for Animation Engine
 * Provides easy integration with React components
 */

import { useCallback } from 'react';
import { animateElement, animateElementSequence, AnimationConfig, SequenceOptions } from '@/utils/animationEngine';
import { Card } from '@/types';

export interface AnimationHook {
  // Core animation functions
  animateCard: (
    fromElement: HTMLElement,
    toElement: HTMLElement,
    options: AnimationConfig
  ) => Promise<void>;
  
  animateSequence: (
    animations: Array<{
      fromElement: HTMLElement;
      toElement: HTMLElement;
      options: AnimationConfig;
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

  animateElementSequence: (
    animations: Array<{
      fromElement: HTMLElement;
      toElement: HTMLElement;
      options: AnimationConfig;
    }>,
    sequenceOptions: SequenceOptions
  ) => Promise<void>;

  // Test-expected convenience functions
  animateMove: (
    fromElement: HTMLElement | null,
    toElement: HTMLElement | null,
    options?: Partial<AnimationConfig>
  ) => Promise<void>;
  
  animateFlip: (
    element: HTMLElement | null,
    options?: Partial<AnimationConfig>
  ) => Promise<void>;
}

export function useAnimation(): AnimationHook {
  const animateCard = useCallback(async (
    fromElement: HTMLElement,
    toElement: HTMLElement,
    options: AnimationConfig
  ): Promise<void> => {
    return animateElement(fromElement, toElement, options);
  }, []);

  const animateSequence = useCallback(async (
    animations: Array<{
      fromElement: HTMLElement;
      toElement: HTMLElement;
      options: AnimationConfig;
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
    return animateElement(stockElement, wasteElement, {
      type: 'flip',
      duration: 600,
      card,
      onComplete
    });
  }, []);

  const animatePileToPile = useCallback(async (
    card: Card,
    fromElement: HTMLElement,
    toElement: HTMLElement,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    return animateElement(fromElement, toElement, {
      type: 'move',
      duration: 300,
      onComplete
    });
  }, []);

  const animateShuffle = useCallback(async (
    cards: Card[],
    fromElements: HTMLElement[],
    toElement: HTMLElement,
    onComplete?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    // Handle edge cases
    if (!toElement) {
      return;
    }
    
    if (cards.length === 0 || fromElements.length === 0) {
      return;
    }
    
    if (cards.length !== fromElements.length) {
      throw new Error('Card count must match element count for shuffle animation');
    }

    // Calculate timing for exactly 1 second total duration
    const totalDuration = 1000;
    const staggerDelay = Math.min(50, totalDuration / cards.length); // Ensure reasonable stagger
    const animationDuration = Math.max(200, totalDuration - (cards.length * staggerDelay)); // Ensure reasonable animation duration

    const animations = cards.map((card, index) => ({
      fromElement: fromElements[index],
      toElement,
      options: {
        type: 'shuffle' as const,
        duration: animationDuration,
        card
      }
    }));

    return animateElementSequence(animations, {
      staggerDelay,
      totalDuration,
      onComplete
    });
  }, []);

  const animateElementSequenceWrapper = useCallback(async (
    animations: Array<{
      fromElement: HTMLElement;
      toElement: HTMLElement;
      options: AnimationConfig;
    }>,
    sequenceOptions: SequenceOptions
  ): Promise<void> => {
    return animateElementSequence(animations, sequenceOptions);
  }, []);

  // Test-expected convenience functions
  const animateMove = useCallback(async (
    fromElement: HTMLElement | null,
    toElement: HTMLElement | null,
    options: Partial<AnimationConfig> = {}
  ): Promise<void> => {
    if (!fromElement || !toElement) {
      return;
    }
    
    return animateElement(fromElement, toElement, {
      type: 'move',
      duration: 300,
      ...options
    });
  }, []);

  const animateFlip = useCallback(async (
    element: HTMLElement | null,
    options: Partial<AnimationConfig> = {}
  ): Promise<void> => {
    if (!element) {
      return;
    }
    
    return animateElement(element, element, {
      type: 'flip',
      duration: 300,
      ...options
    });
  }, []);

  return {
    animateCard,
    animateSequence,
    animateStockFlip,
    animatePileToPile,
    animateShuffle,
    animateElementSequence: animateElementSequenceWrapper,
    animateMove,
    animateFlip
  };
} 