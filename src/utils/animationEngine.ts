/**
 * Universal Animation Engine
 * Simple, reliable animations between any two DOM elements
 */

import { getElementPositions, ElementPosition } from './positionDetection';
import { Card } from '@/types';

export type AnimationType = 'move' | 'flip' | 'shuffle';

export interface AnimationOptions {
  type: AnimationType;
  duration?: number;
  delay?: number;
  card?: Card; // For flip animations
  onComplete?: () => void;
  onError?: (error: string) => void;
  easing?: string;
}

export interface AnimationPath {
  from: ElementPosition;
  to: ElementPosition;
  deltaX: number;
  deltaY: number;
  distance: number;
  angle: number;
}

export interface SequenceOptions {
  staggerDelay?: number;
  totalDuration?: number;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Calculate animation path between two positions
 */
function calculateAnimationPath(from: ElementPosition, to: ElementPosition): AnimationPath {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
  return {
    from,
    to,
    deltaX,
    deltaY,
    distance,
    angle
  };
}

/**
 * Create animation element for the card
 */
function createAnimationElement(
  element: HTMLElement,
  path: AnimationPath,
  options: AnimationOptions
): HTMLElement {
  // Clone the original element for animation
  const animationElement = element.cloneNode(true) as HTMLElement;
  
  // Position the animation element at the start position
  animationElement.style.position = 'fixed';
  animationElement.style.left = `${path.from.x - path.from.width / 2}px`;
  animationElement.style.top = `${path.from.y - path.from.height / 2}px`;
  animationElement.style.zIndex = '1000';
  animationElement.style.pointerEvents = 'none';
  animationElement.style.transformStyle = 'preserve-3d';
  animationElement.style.perspective = '1000px';
  
  // Add animation element to DOM
  document.body.appendChild(animationElement);
  
  return animationElement;
}

/**
 * Execute move animation
 */
async function executeMoveAnimation(
  element: HTMLElement,
  path: AnimationPath,
  options: AnimationOptions
): Promise<void> {
  const duration = options.duration || 300;
  const easing = options.easing || 'ease-out';
  
  return new Promise((resolve) => {
    // Apply move animation
    element.style.transition = `transform ${duration}ms ${easing}`;
    element.style.transform = `translate(${path.deltaX}px, ${path.deltaY}px)`;
    
    // Clean up after animation
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      resolve();
    }, duration);
  });
}

/**
 * Execute flip animation (multi-phase)
 */
async function executeFlipAnimation(
  element: HTMLElement,
  path: AnimationPath,
  options: AnimationOptions
): Promise<void> {
  const totalDuration = options.duration || 600;
  const card = options.card;
  
  if (!card) {
    throw new Error('Card data required for flip animation');
  }
  
  return new Promise((resolve) => {
    const phase1Duration = totalDuration * 0.25; // Reveal
    const phase2Duration = totalDuration * 0.5;  // Flip
    const phase3Duration = totalDuration * 0.25; // Move
    
    let currentPhase = 1;
    
    // Phase 1: Reveal card (if hidden)
    if (!card.faceUp) {
      element.style.transition = `opacity ${phase1Duration}ms ease-in`;
      element.style.opacity = '1';
      
      setTimeout(() => {
        currentPhase = 2;
        // Phase 2: 3D flip
        element.style.transition = `transform ${phase2Duration}ms ease-in-out`;
        element.style.transform = `translate(${path.deltaX * 0.5}px, ${path.deltaY * 0.5}px) rotateY(180deg)`;
        
        setTimeout(() => {
          currentPhase = 3;
          // Phase 3: Move to final position
          element.style.transition = `transform ${phase3Duration}ms ease-out`;
          element.style.transform = `translate(${path.deltaX}px, ${path.deltaY}px) rotateY(180deg)`;
          
          setTimeout(() => {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
            resolve();
          }, phase3Duration);
        }, phase2Duration);
      }, phase1Duration);
    } else {
      // Card is already face up, just do flip + move
      element.style.transition = `transform ${phase2Duration + phase3Duration}ms ease-in-out`;
      element.style.transform = `translate(${path.deltaX}px, ${path.deltaY}px) rotateY(180deg)`;
      
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        resolve();
      }, phase2Duration + phase3Duration);
    }
  });
}

/**
 * Execute shuffle animation
 */
async function executeShuffleAnimation(
  element: HTMLElement,
  path: AnimationPath,
  options: AnimationOptions
): Promise<void> {
  const duration = options.duration || 300;
  
  return new Promise((resolve) => {
    // Add some rotation and scaling for shuffle effect
    element.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    element.style.transform = `translate(${path.deltaX}px, ${path.deltaY}px) rotate(${Math.random() * 360}deg) scale(0.9)`;
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      resolve();
    }, duration);
  });
}

/**
 * Main animation function
 */
export async function animateElement(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  options: AnimationOptions
): Promise<void> {
  try {
    console.log('[AnimationEngine] Starting animation:', {
      type: options.type,
      duration: options.duration,
      fromElement: fromElement.id || fromElement.className,
      toElement: toElement.id || toElement.className
    });
    
    // Step 1: Get reliable positions
    const positions = await getElementPositions(fromElement, toElement);
    
    // Step 2: Calculate animation path
    const path = calculateAnimationPath(positions.from, positions.to);
    
    // Check for zero-distance animation
    if (path.distance < 1) {
      console.warn('[AnimationEngine] Zero-distance animation detected, skipping');
      options.onComplete?.();
      return;
    }
    
    console.log('[AnimationEngine] Animation path calculated:', {
      distance: path.distance,
      angle: path.angle,
      deltaX: path.deltaX,
      deltaY: path.deltaY
    });
    
    // Step 3: Create animation element
    const animationElement = createAnimationElement(fromElement, path, options);
    
    // Step 4: Execute animation based on type
    let animationPromise: Promise<void>;
    
    switch (options.type) {
      case 'move':
        animationPromise = executeMoveAnimation(animationElement, path, options);
        break;
      case 'flip':
        animationPromise = executeFlipAnimation(animationElement, path, options);
        break;
      case 'shuffle':
        animationPromise = executeShuffleAnimation(animationElement, path, options);
        break;
      default:
        throw new Error(`Unknown animation type: ${options.type}`);
    }
    
    // Step 5: Handle completion
    await animationPromise;
    
    console.log('[AnimationEngine] Animation completed successfully');
    options.onComplete?.();
    
  } catch (error) {
    console.error('[AnimationEngine] Animation failed:', error);
    options.onError?.(error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Animate a sequence of elements
 */
export async function animateElementSequence(
  animations: Array<{
    fromElement: HTMLElement;
    toElement: HTMLElement;
    options: AnimationOptions;
  }>,
  sequenceOptions: SequenceOptions
): Promise<void> {
  const { staggerDelay = 50, totalDuration, onComplete, onError } = sequenceOptions;
  
  try {
    console.log('[AnimationEngine] Starting animation sequence:', {
      count: animations.length,
      staggerDelay,
      totalDuration
    });
    
    const promises: Promise<void>[] = [];
    
    animations.forEach((animation, index) => {
      const delay = index * staggerDelay;
      
      const promise = new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            await animateElement(
              animation.fromElement,
              animation.toElement,
              {
                ...animation.options,
                onComplete: () => {
                  animation.options.onComplete?.();
                  resolve();
                },
                onError: (error) => {
                  animation.options.onError?.(error);
                  resolve(); // Continue sequence even if one fails
                }
              }
            );
          } catch (error) {
            console.warn(`[AnimationEngine] Sequence animation ${index} failed:`, error);
            resolve(); // Continue sequence
          }
        }, delay);
      });
      
      promises.push(promise);
    });
    
    await Promise.all(promises);
    
    console.log('[AnimationEngine] Animation sequence completed');
    onComplete?.();
    
  } catch (error) {
    console.error('[AnimationEngine] Animation sequence failed:', error);
    onError?.(error instanceof Error ? error.message : String(error));
    throw error;
  }
} 