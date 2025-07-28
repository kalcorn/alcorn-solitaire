/* =================================================================
   UNIFIED PILE-TO-PILE ANIMATION SYSTEM
   ================================================================= */

import { Card as CardType } from '@/types';

/**
 * Represents a pile that can participate in animations
 */
export interface PileReference {
  id: string;
  type: 'stock' | 'waste' | 'foundation' | 'tableau';
  index?: number; // For foundation/tableau piles
  getPosition: () => { x: number; y: number } | null;
  getElement: () => HTMLElement | null;
  isVisible: () => boolean;
}

/**
 * Animation descriptor for pile-to-pile card movements
 */
export interface AnimationDescriptor {
  id: string;
  card: CardType;
  startPile: PileReference;
  endPile: PileReference;
  animationType: 'flip' | 'move' | 'shuffle' | 'bridge';
  duration?: number;
  delay?: number;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Position with fallback strategies
 */
interface PositionResult {
  position: { x: number; y: number };
  confidence: 'high' | 'medium' | 'low';
  source: 'element' | 'cache' | 'fallback';
}

/**
 * Central registry for all piles in the game
 */
class PileRegistry {
  private piles = new Map<string, PileReference>();
  private positionCache = new Map<string, { position: { x: number; y: number }; timestamp: number }>();
  private readonly CACHE_TTL = 100; // 100ms cache TTL for performance

  /**
   * Register a pile with the animation system
   */
  register(pile: PileReference): void {
    this.piles.set(this.getPileKey(pile), pile);
  }

  /**
   * Unregister a pile from the animation system
   */
  unregister(pile: PileReference): void {
    const key = this.getPileKey(pile);
    this.piles.delete(key);
    this.positionCache.delete(key);
  }

  /**
   * Get a pile by type and optional index
   */
  getPile(type: PileReference['type'], index?: number): PileReference | null {
    const key = `${type}${index !== undefined ? `-${index}` : ''}`;
    return this.piles.get(key) || null;
  }

  /**
   * Get position for a pile with fallback strategies
   */
  getPosition(pile: PileReference): PositionResult {
    const key = this.getPileKey(pile);
    const now = Date.now();

    // Try cached position first (if recent)
    const cached = this.positionCache.get(key);
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return {
        position: cached.position,
        confidence: 'high',
        source: 'cache'
      };
    }

    // Try to get fresh position from pile
    const freshPosition = pile.getPosition();
    if (freshPosition) {
      // Cache the position
      this.positionCache.set(key, { position: freshPosition, timestamp: now });
      return {
        position: freshPosition,
        confidence: 'high',
        source: 'element'
      };
    }

    // Try to get position from DOM element directly
    const element = pile.getElement();
    if (element) {
      const rect = element.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      this.positionCache.set(key, { position, timestamp: now });
      return {
        position,
        confidence: 'medium',
        source: 'element'
      };
    }

    // Use cached position even if stale
    if (cached) {
      return {
        position: cached.position,
        confidence: 'low',
        source: 'cache'
      };
    }

    // Ultimate fallback - calculated positions based on pile type
    const fallbackPosition = this.getFallbackPosition(pile);
    return {
      position: fallbackPosition,
      confidence: 'low',
      source: 'fallback'
    };
  }

  /**
   * Clear position cache (call on layout changes)
   */
  clearCache(): void {
    this.positionCache.clear();
  }

  private getPileKey(pile: PileReference): string {
    return `${pile.type}${pile.index !== undefined ? `-${pile.index}` : ''}`;
  }

  private getFallbackPosition(pile: PileReference): { x: number; y: number } {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Reasonable fallback positions based on typical layouts
    switch (pile.type) {
      case 'stock':
        return { x: centerX - 120, y: centerY - 100 };
      case 'waste':
        return { x: centerX - 60, y: centerY - 100 };
      case 'foundation':
        const foundationX = centerX + 60 + (pile.index || 0) * 80;
        return { x: foundationX, y: centerY - 100 };
      case 'tableau':
        const tableauX = centerX - 240 + (pile.index || 0) * 80;
        return { x: tableauX, y: centerY + 50 };
      default:
        return { x: centerX, y: centerY };
    }
  }
}

/**
 * Unified animation coordinator
 */
class AnimationCoordinator {
  private activeAnimations = new Map<string, AnimationDescriptor>();
  private animationElements = new Map<string, HTMLElement>();

  constructor(private registry: PileRegistry) {}

  /**
   * Start a pile-to-pile animation
   */
  async animate(descriptor: AnimationDescriptor): Promise<void> {
    // Validate animation descriptor
    const validation = this.validateAnimation(descriptor);
    if (!validation.valid) {
      descriptor.onError?.(validation.error!);
      throw new Error(`Animation validation failed: ${validation.error}`);
    }

    // Get positions with fallback handling
    const startResult = this.registry.getPosition(descriptor.startPile);
    const endResult = this.registry.getPosition(descriptor.endPile);

    // Log position confidence for debugging
    if (startResult.confidence === 'low' || endResult.confidence === 'low') {
      console.warn(`Animation ${descriptor.id}: Using low-confidence positions`, {
        start: { ...startResult, pile: descriptor.startPile.type },
        end: { ...endResult, pile: descriptor.endPile.type }
      });
    }

    // Create animation element
    const animationElement = this.createAnimationElement(descriptor, startResult.position, endResult.position);
    
    // Track active animation
    this.activeAnimations.set(descriptor.id, descriptor);
    this.animationElements.set(descriptor.id, animationElement);

    // Execute animation
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        this.activeAnimations.delete(descriptor.id);
        const element = this.animationElements.get(descriptor.id);
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.animationElements.delete(descriptor.id);
      };

      const onComplete = () => {
        cleanup();
        descriptor.onComplete?.();
        resolve();
      };

      const onError = (error: string) => {
        cleanup();
        descriptor.onError?.(error);
        reject(new Error(error));
      };

      try {
        switch (descriptor.animationType) {
          case 'flip':
            this.executeFlipAnimation(animationElement, startResult.position, endResult.position, descriptor, onComplete);
            break;
          case 'move':
            this.executeMoveAnimation(animationElement, startResult.position, endResult.position, descriptor, onComplete);
            break;
          case 'shuffle':
            this.executeShuffleAnimation(animationElement, startResult.position, endResult.position, descriptor, onComplete);
            break;
          case 'bridge':
            this.executeBridgeAnimation(animationElement, startResult.position, endResult.position, descriptor, onComplete);
            break;
          default:
            onError(`Unknown animation type: ${descriptor.animationType}`);
        }
      } catch (error) {
        onError(`Animation execution failed: ${error}`);
      }
    });
  }

  /**
   * Cancel an active animation
   */
  cancel(animationId: string): void {
    const element = this.animationElements.get(animationId);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    this.activeAnimations.delete(animationId);
    this.animationElements.delete(animationId);
  }

  /**
   * Cancel all active animations
   */
  cancelAll(): void {
    for (const animationId of this.activeAnimations.keys()) {
      this.cancel(animationId);
    }
  }

  private validateAnimation(descriptor: AnimationDescriptor): { valid: boolean; error?: string } {
    if (!descriptor.startPile || !descriptor.endPile) {
      return { valid: false, error: 'Missing start or end pile' };
    }

    if (!descriptor.startPile.isVisible() || !descriptor.endPile.isVisible()) {
      return { valid: false, error: 'Start or end pile is not visible' };
    }

    return { valid: true };
  }

  private createAnimationElement(
    descriptor: AnimationDescriptor,
    startPos: { x: number; y: number },
    endPos: { x: number; y: number }
  ): HTMLElement {
    const element = document.createElement('div');
    element.id = `animation-${descriptor.id}`;
    element.style.position = 'fixed';
    element.style.zIndex = '1000';
    element.style.pointerEvents = 'none';
    element.style.left = `${startPos.x}px`;
    element.style.top = `${startPos.y}px`;
    element.style.width = 'var(--card-width)';
    element.style.height = 'var(--card-height)';

    // Add CSS custom properties for end position
    element.style.setProperty('--end-x', `${endPos.x - startPos.x}px`);
    element.style.setProperty('--end-y', `${endPos.y - startPos.y}px`);

    // Create card content
    element.innerHTML = this.createCardHTML(descriptor.card);

    document.body.appendChild(element);
    return element;
  }

  private createCardHTML(card: CardType): string {
    // This would integrate with your Card component
    // For now, a placeholder that matches your card structure
    return `<div class="card ${card.faceUp ? 'face-up' : 'face-down'}">${card.faceUp ? `${card.rank}${card.suit}` : ''}</div>`;
  }

  private executeFlipAnimation(
    element: HTMLElement,
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    descriptor: AnimationDescriptor,
    onComplete: () => void
  ): void {
    const duration = descriptor.duration || 300;
    element.style.animation = `cardFlipMove ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    element.style.animationDelay = `${descriptor.delay || 0}ms`;

    setTimeout(() => {
      onComplete();
    }, (descriptor.delay || 0) + duration);
  }

  private executeMoveAnimation(
    element: HTMLElement,
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    descriptor: AnimationDescriptor,
    onComplete: () => void
  ): void {
    const duration = descriptor.duration || 300;
    element.style.animation = `cardMove ${duration}ms ease-out forwards`;
    element.style.animationDelay = `${descriptor.delay || 0}ms`;

    setTimeout(() => {
      onComplete();
    }, (descriptor.delay || 0) + duration);
  }

  private executeShuffleAnimation(
    element: HTMLElement,
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    descriptor: AnimationDescriptor,
    onComplete: () => void
  ): void {
    const duration = descriptor.duration || 1000;
    element.style.animation = `cardShuffle ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
    element.style.animationDelay = `${descriptor.delay || 0}ms`;

    setTimeout(() => {
      onComplete();
    }, (descriptor.delay || 0) + duration);
  }

  private executeBridgeAnimation(
    element: HTMLElement,
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    descriptor: AnimationDescriptor,
    onComplete: () => void
  ): void {
    const duration = descriptor.duration || 300;
    element.style.animation = `cardBridge ${duration}ms ease-out forwards`;
    element.style.animationDelay = `${descriptor.delay || 0}ms`;

    setTimeout(() => {
      onComplete();
    }, (descriptor.delay || 0) + duration);
  }
}

// Global instances
export const pileRegistry = new PileRegistry();
export const animationCoordinator = new AnimationCoordinator(pileRegistry);

/**
 * Utility function to create a pile reference
 */
export function createPileReference(
  type: PileReference['type'],
  element: HTMLElement | (() => HTMLElement | null),
  index?: number
): PileReference {
  return {
    id: `${type}${index !== undefined ? `-${index}` : ''}`,
    type,
    index,
    getPosition: () => {
      const el = typeof element === 'function' ? element() : element;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    },
    getElement: () => typeof element === 'function' ? element() : element,
    isVisible: () => {
      const el = typeof element === 'function' ? element() : element;
      return el ? el.offsetParent !== null : false;
    }
  };
}

/**
 * High-level animation functions
 */
export const animations = {
  /**
   * Animate card from stock to waste pile
   */
  stockToWaste: (card: CardType, onComplete?: () => void): Promise<void> => {
    const stockPile = pileRegistry.getPile('stock');
    const wastePile = pileRegistry.getPile('waste');
    
    if (!stockPile || !wastePile) {
      throw new Error('Stock or waste pile not found');
    }

    return animationCoordinator.animate({
      id: `stock-to-waste-${card.id}-${Date.now()}`,
      card,
      startPile: stockPile,
      endPile: wastePile,
      animationType: 'flip',
      duration: 300,
      onComplete
    });
  },

  /**
   * Animate card from waste to stock pile
   */
  wasteToStock: (card: CardType, onComplete?: () => void): Promise<void> => {
    const stockPile = pileRegistry.getPile('stock');
    const wastePile = pileRegistry.getPile('waste');
    
    if (!stockPile || !wastePile) {
      throw new Error('Stock or waste pile not found');
    }

    return animationCoordinator.animate({
      id: `waste-to-stock-${card.id}-${Date.now()}`,
      card,
      startPile: wastePile,
      endPile: stockPile,
      animationType: 'flip',
      duration: 300,
      onComplete
    });
  },

  /**
   * Animate cards from any pile to any pile
   */
  pileTopile: (
    card: CardType,
    fromType: PileReference['type'],
    toType: PileReference['type'],
    fromIndex?: number,
    toIndex?: number,
    onComplete?: () => void
  ): Promise<void> => {
    const startPile = pileRegistry.getPile(fromType, fromIndex);
    const endPile = pileRegistry.getPile(toType, toIndex);
    
    if (!startPile || !endPile) {
      throw new Error(`Pile not found: ${fromType}${fromIndex !== undefined ? `-${fromIndex}` : ''} or ${toType}${toIndex !== undefined ? `-${toIndex}` : ''}`);
    }

    return animationCoordinator.animate({
      id: `pile-to-pile-${card.id}-${Date.now()}`,
      card,
      startPile,
      endPile,
      animationType: 'move',
      duration: 300,
      onComplete
    });
  }
};