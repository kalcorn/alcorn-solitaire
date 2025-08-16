/**
 * Universal Animation Engine
 * Simple, reliable animations between any two DOM elements
 */

import { getElementPositions, ElementPosition } from './positionDetection';
import { Card } from '@/types';

export interface AnimationConfig {
  type: 'move' | 'flip' | 'shuffle';
  duration: number;
  initialRotation?: string;
  card?: Card;
  fromPosition?: { x: number; y: number };
  toPosition?: { x: number; y: number };
  onComplete?: () => void;
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
 * Calculate optimal flip rotation axis based on movement direction
 * Cards should flip around the axis that makes physical sense for the movement
 */
function calculateFlipRotation(path: AnimationPath): string {
  const deltaX = Math.abs(path.deltaX);
  const deltaY = Math.abs(path.deltaY);
  
  // Determine primary movement direction
  if (deltaX > deltaY) {
    // Primarily horizontal movement → flip around Y-axis (left-right flip)
    return 'rotateY(180deg)';
  } else if (deltaY > deltaX) {
    // Primarily vertical movement → flip around X-axis (top-bottom flip)
    return 'rotateX(180deg)';
  } else {
    // Equal or minimal movement → default to Y-axis flip
    return 'rotateY(180deg)';
  }
}


/**
 * Create animation element for the card
 */
function createAnimationElement(
  element: HTMLElement,
  path: AnimationPath,
  options: AnimationConfig
): HTMLElement {
  // Create container with 3D perspective
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = `${path.from.x - path.from.width / 2}px`;
  container.style.top = `${path.from.y - path.from.height / 2}px`;
  container.style.width = `${path.from.width}px`;
  container.style.height = `${path.from.height}px`;
  container.style.zIndex = '1000';
  container.style.pointerEvents = 'none';
  container.style.perspective = '1000px';
  container.style.transformStyle = 'preserve-3d';
  
  
  if (options.type === 'flip') {
    // For flip animations, create a proper flip card with both sides
    const flipContainer = document.createElement('div');
    flipContainer.style.position = 'absolute';
    flipContainer.style.top = '0';
    flipContainer.style.left = '0';
    flipContainer.style.width = '100%';
    flipContainer.style.height = '100%';
    flipContainer.style.transformStyle = 'preserve-3d';
    flipContainer.style.transition = 'none';
    
    // Use provided initial rotation or default to no rotation
    const initialRotation = options.initialRotation || 'rotateY(0deg)';
    flipContainer.style.transform = initialRotation;
    
    // Find the actual card element - either the element itself or inside it
    let cardElement = element.querySelector('[data-card-element="true"]') as HTMLElement;
    if (!cardElement && element.getAttribute('data-card-element') === 'true') {
      // The element itself is the card element
      cardElement = element;
    }
    
    
    if (cardElement) {
      // Create face-down side (visible at start)
      const faceDownSide = cardElement.cloneNode(true) as HTMLElement;
      faceDownSide.style.position = 'absolute';
      faceDownSide.style.width = '100%';
      faceDownSide.style.height = '100%';
      faceDownSide.style.backfaceVisibility = 'hidden';
      faceDownSide.style.transform = 'rotateY(0deg)';
      faceDownSide.style.visibility = 'visible'; // Ensure flip elements are always visible
      
      // Create face-up side (hidden at start, revealed during flip)
      const faceUpSide = cardElement.cloneNode(true) as HTMLElement;
      faceUpSide.style.position = 'absolute';
      faceUpSide.style.width = '100%';
      faceUpSide.style.height = '100%';
      faceUpSide.style.backfaceVisibility = 'hidden';
      faceUpSide.style.transform = 'rotateY(180deg)'; // Back face
      faceUpSide.style.visibility = 'visible'; // Ensure flip elements are always visible
      
      // Update the face-up side to show the actual card face
      // Remove face-down class and add face-up styling  
      faceUpSide.classList.remove('Card_faceDown__rQVhF');
      faceUpSide.classList.add('Card_faceUp___BDaO');
      
      // Create proper face-up card structure matching the Card component
      const card = options.card || { 
        id: 'flip-card',
        rank: 1, 
        suit: 'spades', 
        faceUp: false 
      } as Card;
      const displayRank = card.rank === 1 ? 'A' : card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank.toString();
      const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
      const suitColor = isRed ? 'text-red-600' : 'text-black';
      const isFaceCard = card.rank === 11 || card.rank === 12 || card.rank === 13;
      
      if (isFaceCard) {
        // Face cards have a different structure with SVG images
        faceUpSide.innerHTML = `
          <div class="relative w-full h-full bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-lg shadow-lg overflow-hidden">
            <div class="relative w-full h-full overflow-hidden rounded-lg flex flex-col justify-end">
              <img src="/cards/${card.rank === 11 ? 'jack' : card.rank === 12 ? 'queen' : 'king'}-${card.suit}.svg" 
                   alt="${displayRank} of ${card.suit}"
                   class="w-3/4 h-3/4 object-cover object-bottom rounded-lg mx-auto"
                   style="image-rendering: crisp-edges; object-position: bottom;"
                   draggable="false" />
              <div class="absolute top-0.5 left-0.5">
                <span class="${suitColor} font-bold leading-none text-xs">${displayRank}</span>
              </div>
              <div class="absolute top-0.5 right-0.5">
                ${getSuitIcon(card.suit, false, 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6')}
              </div>
            </div>
          </div>
        `;
      } else {
        // Regular number/ace cards with duo-tone center symbol
        faceUpSide.innerHTML = `
          <div class="relative w-full h-full bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-lg shadow-lg overflow-hidden">
            <!-- Top-left number -->
            <div class="absolute top-0.5 left-0.5">
              <span class="${suitColor} font-bold leading-none text-sm">${displayRank}</span>
            </div>
            
            <!-- Top-right suit icon -->
            <div class="absolute top-0.5 right-0.5">
              ${getSuitIcon(card.suit, false, 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6')}
            </div>
            
            <!-- Center large suit symbol with vertical duo-tone effect -->
            <div class="absolute inset-0 flex items-center justify-center" style="transform: translateY(20%)">
              <div class="relative">
                <!-- Main suit icon with duo-tone split effect -->
                <div class="relative" style="width: clamp(1.2rem, 4vw, 4rem); height: clamp(1.2rem, 4vw, 4rem);">
                  <!-- Left half of the icon -->
                  <div class="absolute inset-0 overflow-hidden" style="clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);">
                    ${getSuitIcon(card.suit, true, '', isRed ? 'text-red-500' : 'text-gray-700', isRed 
                      ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.3)) drop-shadow(0 2px 4px rgba(220, 38, 38, 0.4))'
                      : 'drop-shadow(0 0 8px rgba(55, 65, 81, 0.3)) drop-shadow(0 2px 4px rgba(31, 41, 55, 0.4))')}
                  </div>
                  <!-- Right half of the icon with slightly different color -->
                  <div class="absolute inset-0 overflow-hidden" style="clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);">
                    ${getSuitIcon(card.suit, true, '', isRed ? 'text-red-400' : 'text-gray-600', isRed
                      ? 'drop-shadow(0 0 6px rgba(248, 113, 113, 0.4)) drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
                      : 'drop-shadow(0 0 6px rgba(75, 85, 99, 0.4)) drop-shadow(0 2px 4px rgba(55, 65, 81, 0.3))')}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Clean modern border accent -->
            <div class="absolute inset-0 rounded-lg ring-1 ring-black/5 ring-inset"></div>
          </div>
        `;
      }
      
      flipContainer.appendChild(faceDownSide);
      flipContainer.appendChild(faceUpSide);
      
    } else {
      // Fallback to cloning the entire element
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '0';
      clonedElement.style.left = '0';
      clonedElement.style.width = '100%';
      clonedElement.style.height = '100%';
      clonedElement.style.transform = 'rotateY(180deg)';
      clonedElement.style.visibility = 'visible'; // Ensure flip fallback elements are visible
      flipContainer.appendChild(clonedElement);
    }
    
    container.appendChild(flipContainer);
    document.body.appendChild(container);
    
    return flipContainer;
  } else {
    // For non-flip animations, clone the original element
    const animationElement = element.cloneNode(true) as HTMLElement;
    animationElement.style.position = 'absolute';
    animationElement.style.top = '0';
    animationElement.style.left = '0';
    animationElement.style.width = '100%';
    animationElement.style.height = '100%';
    animationElement.style.transformStyle = 'preserve-3d';
    animationElement.style.transition = 'none';
    animationElement.style.visibility = 'visible'; // Ensure animation element is always visible
    
    container.appendChild(animationElement);
    document.body.appendChild(container);
    
    return animationElement;
  }
}

// Helper function to get suit icons
function getSuitIcon(suit: string, large = false, customClassName = '', customColor = '', customFilter = '') {
  const className = customClassName || (large ? 'text-2xl lg:text-4xl' : 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6');
  const color = customColor || (suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black');
  
  // For large center icons, we need custom styling that matches the Card component
  const sizeStyle = large && !customClassName ? 
    'width: clamp(1.2rem, 4vw, 4rem); height: clamp(1.2rem, 4vw, 4rem);' : '';
  
  const filterStyle = customFilter ? `filter: ${customFilter};` : '';
  const style = (sizeStyle || filterStyle) ? ` style="${sizeStyle}${filterStyle}"` : '';
  
  switch (suit) {
    case 'hearts':
      return `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" class="${className} ${color}"${style} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1z"></path></svg>`;
    case 'diamonds':
      return `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" class="${className} ${color}"${style} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M2.45 7.4 7.2 1.067a1 1 0 0 1 1.6 0L13.55 7.4a1 1 0 0 1 0 1.2L8.8 14.933a1 1 0 0 1-1.6 0L2.45 8.6a1 1 0 0 1 0-1.2z"></path></svg>`;
    case 'clubs':
      return `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" class="${className} ${color}"${style} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M11.5 12.5a3.493 3.493 0 0 1-2.684-1.254 19.92 19.92 0 0 0 1.582 2.907c.231.35-.02.847-.438.847H6.04c-.419 0-.67-.497-.438-.847a19.919 19.919 0 0 0 1.582-2.907 3.5 3.5 0 1 1-2.538-5.743 3.5 3.5 0 1 1 6.708 0A3.5 3.5 0 1 1 11.5 12.5z"></path></svg>`;
    case 'spades':
      return `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" class="${className} ${color}"${style} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M7.184 11.246A3.5 3.5 0 0 1 1 9c0-1.602 1.14-2.633 2.66-4.008C4.986 3.792 6.602 2.33 8 0c1.398 2.33 3.014 3.792 4.34 4.992C13.86 6.367 15 7.398 15 9a3.5 3.5 0 0 1-6.184 2.246 19.92 19.92 0 0 0 1.582 2.907c.231.35-.02.847-.438.847H6.04c-.419 0-.67-.497-.438-.847a19.919 19.919 0 0 0 1.582-2.907z"></path></svg>`;
    default:
      return '';
  }
}

/**
 * Execute move animation
 */
async function executeMoveAnimation(
  element: HTMLElement,
  path: AnimationPath,
  options: AnimationConfig
): Promise<void> {
  const duration = options.duration;
  const easing = 'ease-out'; // Default easing
  
  return new Promise((resolve) => {
    // Apply move animation
    element.style.transition = `transform ${duration}ms ${easing}`;
    element.style.transform = `translate(${path.deltaX}px, ${path.deltaY}px)`;
    
    // Clean up after animation
    setTimeout(() => {
      // Remove the container (for flip) or element (for move)
      const container = element.parentNode;
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
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
  options: AnimationConfig
): Promise<void> {
  const totalDuration = options.duration;
  
  return new Promise((resolve) => {
    // Calculate appropriate flip rotation based on movement direction
    const flipRotation = calculateFlipRotation(path);
    
    // Give browser a moment to render the initial state
    requestAnimationFrame(() => {
      // Single phase: 3D flip with movement
      // Element starts at rotate*(0deg) and flips to rotate*(180deg) based on movement direction
      element.style.transition = `transform ${totalDuration}ms ease-in-out`;
      element.style.transform = `translate(${path.deltaX}px, ${path.deltaY}px) ${flipRotation}`;
      
      // Call completion callback when animation is ~90% complete (so new card appears before cleanup)
      const completionDelay = Math.floor(totalDuration * 0.9);
      setTimeout(() => {
        options.onComplete?.();
      }, completionDelay);
      
      setTimeout(() => {
        // Clean up - remove the container, not just the element
        const container = element.parentNode;
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
        resolve();
      }, totalDuration);
    });
  });
}

/**
 * Execute shuffle animation - now uses flip animation for consistency
 */
async function executeShuffleAnimation(
  element: HTMLElement,
  path: AnimationPath,
  options: AnimationConfig
): Promise<void> {
  // Shuffle is now just a flip animation with card data
  // This ensures consistent behavior and code reuse
  const shuffleOptions = {
    ...options,
    // Ensure we have card data for flip animation
    card: { 
      id: 'shuffle-card',
      rank: 1, 
      suit: 'spades', 
      faceUp: false 
    } as Card // Assuming a default Card structure for now
  };
  
  // Delegate to flip animation - this provides the movement + 3D flip
  return executeFlipAnimation(element, path, shuffleOptions);
}

/**
 * Main animation function
 */
export async function animateElement(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  options: AnimationConfig
): Promise<void> {
  try {
    
    // Step 1: Get reliable positions (use overrides if provided)
    let positions;
    if (options.fromPosition && options.toPosition) {
      // Use position overrides for precise positioning
      positions = {
        from: {
          x: options.fromPosition.x,
          y: options.fromPosition.y,
          width: 52, // Standard card width
          height: 72, // Standard card height
          visible: true,
          confidence: 'high' as const,
          source: 'measured' as const
        },
        to: {
          x: options.toPosition.x,
          y: options.toPosition.y,
          width: 52,
          height: 72,
          visible: true,
          confidence: 'high' as const,
          source: 'measured' as const
        }
      };
    } else {
      // Use element positions as fallback
      positions = getElementPositions(fromElement, toElement);
    }
    
    // Step 2: Calculate animation path
    const path = calculateAnimationPath(positions.from, positions.to);
    
    // Check for zero-distance animation
    if (path.distance < 1) {
      options.onComplete?.();
      return;
    }
    
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
    
    // onComplete already called during animation for early display - don't call again
    
  } catch (error) {
    options?.onComplete?.(); // Ensure onComplete is called even on error
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
    options: AnimationConfig;
  }>,
  sequenceOptions: SequenceOptions
): Promise<void> {
  const { staggerDelay = 50, totalDuration, onComplete, onError } = sequenceOptions;
  
  try {
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
                }
              }
            );
          } catch (error) {
            animation.options?.onComplete?.(); // Ensure onComplete is called even on error
            resolve(); // Continue sequence even if one fails
          }
        }, delay);
      });
      
      promises.push(promise);
    });
    
    await Promise.all(promises);
    
    onComplete?.();
    
  } catch (error) {
    onError?.(error instanceof Error ? error.message : String(error));
    throw error;
  }
} 