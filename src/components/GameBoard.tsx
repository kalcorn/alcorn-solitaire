import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useGameAnimations } from '../hooks/useGameAnimations';
import { useGameTimer } from '../hooks/useGameTimer';
import { useUndo } from '../hooks/useUndo';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useGameHydration } from '../hooks/useGameHydration';
import { getCardDimensions } from '../utils/cardDimensions';
import StockPile from './StockPile/StockPile';
import WastePile from './WastePile/WastePile';
import FoundationPile from './FoundationPile/FoundationPile';
import TableauPile from './TableauPile/TableauPile';
import DragPreview from './DragPreview/DragPreview';
import WinOverlay from './WinOverlay';
import MobileLayout from './layout/MobileLayout';
import DesktopLayout from './layout/DesktopLayout';
import LandscapeMobileLayout from './layout/LandscapeMobileLayout';
import ParticleEffects from './ParticleEffects';
import Header from './Header/Header';
import SettingsPanel from './SettingsPanel';
import HintsPanel from './HintsPanel';
import UndoRedoButtons from './UndoRedoButtons';
import SubtleHints from './SubtleHints';
import AnimatedCard from './AnimatedCard/AnimatedCard';
import FlyingCards from './FlyingCards/FlyingCards';
import BridgeCards from './BridgeCards';
// Removed old animation system imports - using new system instead
import { createEventHandlers } from '@/utils/eventHandlers';
import { Card as CardType, CardPosition } from '@/types';
import { useIsClient } from '@/utils/hydrationUtils';
import { playSoundEffect } from '@/utils/soundUtils';
import { animateElement } from '@/utils/animationEngine';

const GameBoard: React.FC = () => {
  const isClient = useIsClient();
  const {
    gameState,
    timeElapsed,
    startNewGame,
    moveCards,
    handleStockFlip,
    handleAutoMoveToFoundation,
    selectCards,
    getMovableCards,
    updateSettings,
    undo: performUndo,
    canUndo
  } = useGameState();

  // State for managing card visibility during shuffle
  const [cardVisibility, setCardVisibility] = useState<{ [cardId: string]: boolean }>({});

  const {
    particleTrigger,
    isShuffling,
    isWinAnimating,
    triggerShuffleAnimation,
    animateStockFlip
  } = useGameAnimations(gameState);

  const {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    isZoneHovered,
    isCardBeingDragged,
    getDragPreviewStyle,
    hoveredZone
  } = useDragAndDrop();

  // Create event handlers using the utility
  const eventHandlers = createEventHandlers(
    gameState,
    handleAutoMoveToFoundation,
    selectCards,
    getMovableCards,
    startDrag,
    // Provide a dummy function for the old animateStockFlip parameter
    () => {} // This is no longer used but required by the interface
  );

  // Enhanced move cards with particle effects
  const handleMoveCards = React.useCallback((from: CardPosition, to: CardPosition, cards: CardType[]) => {
    const result = moveCards(from, to, cards);
    if (result.success) {
      // Trigger sparkle effect for valid moves
      triggerShuffleAnimation();
    }
    return result;
  }, [moveCards, triggerShuffleAnimation]);

  // New shuffle function using Card visibility
  const handleShuffleWithVisibility = useCallback(async (cards: CardType[]) => {
    const stockElement = document.querySelector('[data-pile-type="stock"]') as HTMLElement;
    const wasteElement = document.querySelector('[data-pile-type="waste"]') as HTMLElement;
    
    if (!stockElement || !wasteElement) {
      console.error('Stock or waste element not found');
      return;
    }

    // Play shuffle sound
    playSoundEffect.shuffle();

    // Animate each card sequentially
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      try {
        // Make card visible
        setCardVisibility(prev => ({ ...prev, [card.id]: true }));
        
        // Wait for React to update DOM
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Find the card element
        const cardElement = wasteElement.querySelector(`[data-card-element="true"]`) as HTMLElement;
        if (!cardElement) {
          console.error('Card element not found');
          continue;
        }
        
        // Execute flip animation with error handling
        await animateElement(
          cardElement,
          stockElement,
          {
            type: 'flip',
            duration: 300,
            card: { ...card, faceUp: false },
            onComplete: () => {
              // Hide card after animation completes
              setCardVisibility(prev => ({ ...prev, [card.id]: false }));
            },
            onError: (error) => {
              console.error('Animation failed:', error);
              // Hide card on error
              setCardVisibility(prev => ({ ...prev, [card.id]: false }));
            }
          }
        );
        
        // Small delay between cards
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error('Card animation failed:', error);
        // Ensure card is hidden on error
        setCardVisibility(prev => ({ ...prev, [card.id]: false }));
      }
    }
  }, []);

  // Calculate visual center offset for proper alignment between stock and waste piles
  const calculateVisualCenterOffset = (element: HTMLElement, pileType: 'stock' | 'waste'): number => {
    const computedStyle = getComputedStyle(element);
    
    if (pileType === 'waste') {
      return 0; // Waste pile positioning is our baseline - no offset needed
    }
    
    // For stock pile, calculate offset relative to waste pile positioning
    let hoverOffset = 0;
    let borderOffset = 0;
    let positioningOffset = 0;
    
    // 1. Check for hover transform
    const transform = computedStyle.transform;
    if (transform && transform.includes('translateY')) {
      const translateYMatch = transform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
      if (translateYMatch) {
        const translateY = parseFloat(translateYMatch[1]);
        hoverOffset = -translateY;
      }
    }
    
    // 2. Border difference between face-down (stock) and face-up (waste) cards
    // Face-down cards have 2px border, face-up cards have 1px border
    borderOffset = pileType === 'stock' ? 2 : 0;
    
    // 3. Stock pile stacking offset - only applies to stock pile
    if (pileType === 'stock') {
      // Stock pile cards are stacked with incremental top positions (0px, 1px, 2px, etc.)
      // The top card appears higher than the visual center of the stacked deck
      // We need to offset down to match the visual center that users perceive
      const currentStockCount = gameState.stockPile.length;
      const stackedCardsBelow = Math.min(5, currentStockCount - 1); // Max 5 visible stacked cards
      
      if (stackedCardsBelow > 0) {
        // Visual stack effect is constant - doesn't matter if 1 or 5 cards beneath
        // The visual center of any stacked deck is the same position
        positioningOffset = 6; // Fixed offset for any stacked cards
      } else {
        positioningOffset = 0; // Last card - no stack beneath, perfect as-is
      }
    } else {
      positioningOffset = 0; // Waste pile positioning is the baseline
    }
    
    return hoverOffset + borderOffset + positioningOffset;
  };

  // Animated stock flip handler with immediate position capture
  const handleAnimatedStockFlip = async (event?: React.MouseEvent) => {
    const clickTime = performance.now();
    console.log('[TIMING] Stock/Recycle button clicked at:', clickTime);
    
    const isRecycling = gameState.stockPile.length === 0;
    console.log('[TIMING] Is recycling:', isRecycling);

    try {
      if (isRecycling && gameState.wastePile.length > 0) {
        const preAnimationTime = performance.now();
        console.log('[TIMING] Starting recycle animation preparation at:', preAnimationTime, 'Delay since click:', preAnimationTime - clickTime, 'ms');
        // Capture current waste pile data AND DOM elements before updating state
        const wasteCardsForAnimation = [...gameState.wastePile];
        
        // Animate the visual transition first (while DOM elements still exist)
        const animationStartTime = performance.now();
        console.log('[TIMING] Calling animateWasteToStock at:', animationStartTime, 'Delay since click:', animationStartTime - clickTime, 'ms');
        
        await handleShuffleWithVisibility(wasteCardsForAnimation);
        
        const animationEndTime = performance.now();
        console.log('[TIMING] animateWasteToStock completed at:', animationEndTime, 'Total duration:', animationEndTime - animationStartTime, 'ms');
        
        // Update game state AFTER animation completes
        handleStockFlip(true); // Skip sound since animation already played it
      } else if (gameState.stockPile.length > 0) {
        // Capture current top stock card for animation BEFORE updating game state
        const topStockCard = gameState.stockPile[gameState.stockPile.length - 1];
        
        // Capture positions immediately from the click event if available
        let stockPosition: { x: number; y: number } | null = null;
        let wastePosition: { x: number; y: number } | null = null;
        let topCardElement: HTMLElement | null = null;
        
        if (event) {
          // Get stock position from the actual top card element (accounting for hover/focus effects)
          const stockElement = document.querySelector('[data-pile-type="stock"]') as HTMLElement;
          if (stockElement) {
            // Try to find the actual top card element first
            topCardElement = stockElement.querySelector('[data-card-element="true"]') as HTMLElement;
            let stockRect: DOMRect;
            
            if (topCardElement) {
              // Capture position immediately while hover state is active
              stockRect = topCardElement.getBoundingClientRect();
              // Validate the rect has valid dimensions
              if (stockRect.width > 0 && stockRect.height > 0) {
                // THOROUGH INVESTIGATION: Let's see exactly what's happening
                const computedStyle = getComputedStyle(topCardElement);
                const currentTransform = computedStyle.transform;
                
                // Parse the transform to see the actual values
                let actualTranslateY = 0;
                if (currentTransform && currentTransform !== 'none') {
                  const translateYMatch = currentTransform.match(/translateY\((-?\d+(?:\.\d+)?)px\)/);
                  if (translateYMatch) {
                    actualTranslateY = parseFloat(translateYMatch[1]);
                  }
                }
                
                // Calculate visual center offset
                const stockVisualCenterOffset = calculateVisualCenterOffset(topCardElement, 'stock');
                
                
                stockPosition = {
                  x: stockRect.left + stockRect.width / 2,
                  y: stockRect.top + stockRect.height / 2 - stockVisualCenterOffset
                };
                // Add animating class to prevent hover effects during animation
                topCardElement.classList.add('animating');
              }
            }
            
            // Fallback to pile container if card element not found or invalid
            if (!stockPosition) {
              stockRect = stockElement.getBoundingClientRect();
              if (stockRect.width > 0 && stockRect.height > 0) {
                const stockVisualCenterOffsetFallback = 5;
                
                stockPosition = {
                  x: stockRect.left + stockRect.width / 2,
                  y: stockRect.top + stockRect.height / 2 - stockVisualCenterOffsetFallback
                };
              }
            }
          }

          // Get waste position from the waste pile container, accounting for raised stack effect
          const wasteElement = document.querySelector('[data-pile-type="waste"]') as HTMLElement;
          if (wasteElement) {
            // Look for existing cards in waste pile to determine stack positioning
            const existingWasteCards = wasteElement.querySelectorAll('[data-card-element="true"]');
            const wasteRect = wasteElement.getBoundingClientRect();
            
            // Validate waste element has valid dimensions
            if (wasteRect.width > 0 && wasteRect.height > 0) {
              // Calculate end position based on current waste pile state
              let wasteX = wasteRect.left + wasteRect.width / 2;
              let wasteY = wasteRect.top + wasteRect.height / 2;
              
              // If there are existing cards, use the actual top card position for both X and Y
              if (existingWasteCards.length > 0) {
                // Get the actual top card position to account for stacking and horizontal offset
                const topWasteCard = existingWasteCards[existingWasteCards.length - 1] as HTMLElement;
                const topCardRect = topWasteCard.getBoundingClientRect();
                
                // Validate the top card has valid dimensions
                if (topCardRect.width > 0 && topCardRect.height > 0) {
                  wasteX = topCardRect.left + topCardRect.width / 2;
                  wasteY = topCardRect.top + topCardRect.height / 2;
                }
              }
              
              wastePosition = {
                x: wasteX,
                y: wasteY
              };
            }
          }
        }
        
        // Animate the visual transition FIRST (before updating game state)
        await animateStockFlip(
          topStockCard,
          stockPosition,
          wastePosition,
          () => {
            // Animation complete - remove animating class
            if (topCardElement) {
              topCardElement.classList.remove('animating');
            }
          },
          (error) => {
            console.error('Stock flip animation failed:', error);
            // Remove animating class on error too
            if (topCardElement) {
              topCardElement.classList.remove('animating');
            }
          }
        );
        
        // Update game state AFTER animation completes
        handleStockFlip(true); // Skip sound since animation already played it
      }
    } catch (error) {
      console.error('Animation error:', error);
    }
  };

  // Animated new game handler
  const handleAnimatedNewGame = () => {
    // Start sound first (async) to counteract any lag
    if (gameState.settings.soundEnabled) {
      playSoundEffect.shuffle();
    }
    
    triggerShuffleAnimation();
    
    setTimeout(() => {
      startNewGame();
    }, 500);
  };

  // Global event listeners for drag and drop
  React.useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateDrag(e as any);
    };

    const handleMouseUp = () => {
      endDrag(handleMoveCards);
    };

    const handleTouchMove = (e: TouchEvent) => {
      updateDrag(e as any);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endDrag(handleMoveCards);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelDrag();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dragState.isDragging, updateDrag, endDrag, cancelDrag, handleMoveCards]);

  return (
    <>
      <Header 
        timeElapsed={isClient ? timeElapsed : 0}
        moves={isClient ? gameState.moves : 0}
        score={isClient ? gameState.score : 0}
        onNewGame={handleAnimatedNewGame}
        settings={gameState.settings}
        onSettingsChange={updateSettings}
      />
      <div 
        className={`w-full flex grow flex-col items-center bg-transparent min-h-screen overflow-hidden ${!isClient ? 'hydration-loading' : ''}`}
        role="main"
        aria-label="Solitaire game board"
      >

        {/* Mobile Layout - Default (mobile-first) */}
        <MobileLayout
          gameState={gameState}
          isShuffling={isShuffling}
          isWinAnimating={isWinAnimating}
          isCardBeingDragged={isCardBeingDragged}
          isZoneHovered={isZoneHovered}
          onStockFlip={handleAnimatedStockFlip}
          onCardClick={eventHandlers.handleCardClick}
          onCardDragStart={eventHandlers.handleCardDragStart}
          startDrag={startDrag}
          getMovableCards={getMovableCards}
          cardVisibility={cardVisibility}
        />

        {/* Landscape Mobile Layout */}
        <div className="hidden landscape-mobile-layout w-full flex-1 flex h-full">
          <LandscapeMobileLayout
            gameState={gameState}
            isShuffling={isShuffling}
            isWinAnimating={isWinAnimating}
            isCardBeingDragged={isCardBeingDragged}
            isZoneHovered={isZoneHovered}
            onStockFlip={handleAnimatedStockFlip}
            onCardClick={eventHandlers.handleCardClick}
            onCardDragStart={eventHandlers.handleCardDragStart}
            startDrag={startDrag}
            getMovableCards={getMovableCards}
            cardVisibility={cardVisibility}
          />
        </div>

        {/* Desktop Layout - md and up (mobile-first) */}
        <div className="hidden md:block w-full flex-1">
          <DesktopLayout
            gameState={gameState}
            isShuffling={isShuffling}
            isWinAnimating={isWinAnimating}
            isCardBeingDragged={isCardBeingDragged}
            isZoneHovered={isZoneHovered}
            onStockFlip={handleAnimatedStockFlip}
            onCardClick={eventHandlers.handleCardClick}
            onCardDragStart={eventHandlers.handleCardDragStart}
            startDrag={startDrag}
            getMovableCards={getMovableCards}
            cardVisibility={cardVisibility}
          />
        </div>

        {/* Drag Preview */}
        <DragPreview 
          cards={dragState.draggedCards}
          style={getDragPreviewStyle()}
          isOverDropZone={!!hoveredZone}
          isSnapBack={dragState.isSnapBack}
        />

        {/* Particle Effects */}
        <ParticleEffects trigger={particleTrigger} />

        {/* Subtle Hints */}
        <SubtleHints gameState={gameState} />

        {/* Undo Button */}
        <UndoRedoButtons onUndo={performUndo} canUndo={canUndo(gameState)} />

        {/* Win Overlay */}
        <WinOverlay 
          isGameWon={gameState.isGameWon}
          moves={gameState.moves}
          score={gameState.score}
          onNewGame={handleAnimatedNewGame}
        />

        {/* Animation components are no longer needed - animations are handled by the unified system */}
        
        {/* Animation Debugger - REMOVED FOR CLEANUP */}
        {/* <AnimationDebugger /> */}
      </div>
    </>
  );
};

export default GameBoard;