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

  const {
    particleTrigger,
    isShuffling,
    isWinAnimating,
    triggerShuffleAnimation,
    animateStockFlip,
    animateWasteToStock
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

  // Animated stock flip handler with immediate position capture
  const handleAnimatedStockFlip = async (event?: React.MouseEvent) => {
    const isRecycling = gameState.stockPile.length === 0;

    if (isRecycling && gameState.wastePile.length > 0) {
      // Animate waste to stock (recycling)
      await animateWasteToStock(
        gameState.wastePile,
        () => {
          // Animation complete - perform the actual stock flip
          handleStockFlip(true); // Skip sound since we already played it
        },
        (error) => {
          console.error('Recycling animation failed:', error);
          // Fallback to immediate stock flip
          handleStockFlip(true);
        }
      );
    } else if (gameState.stockPile.length > 0) {
      // Animate stock to waste with immediate position capture
      const topStockCard = gameState.stockPile[gameState.stockPile.length - 1];
      
      // Capture positions immediately from the click event if available
      let stockPosition: { x: number; y: number } | null = null;
      let wastePosition: { x: number; y: number } | null = null;
      let topCardElement: HTMLElement | null = null;
      
      if (event) {
        console.log('[GameBoard] Capturing positions immediately to capture hover state');
        
        // Get stock position from the actual top card element (accounting for hover/focus effects)
        const stockElement = document.querySelector('[data-pile-type="stock"]') as HTMLElement;
        if (stockElement) {
          // Try to find the actual top card element first
          topCardElement = stockElement.querySelector('[data-card-element="true"]') as HTMLElement;
          let stockRect: DOMRect;
          
          if (topCardElement) {
            // IMPORTANT: Capture position immediately while hover state is active
            // The hover effect: transform: translateY(-6px) scale(1.02)
            stockRect = topCardElement.getBoundingClientRect();
            console.log('[GameBoard] Using HOVER-STATE top card element for position');
          } else {
            // Fallback to pile container
            stockRect = stockElement.getBoundingClientRect();
            console.log('[GameBoard] Using pile container for position (no card element found)');
          }
          
          const cardDimensions = getCardDimensions();
          const computedStyle = getComputedStyle(document.documentElement);
          const cssCardWidth = computedStyle.getPropertyValue('--card-width').trim();
          const cssCardHeight = computedStyle.getPropertyValue('--card-height').trim();
          
          // Convert top-left coordinates to center coordinates for animation system
          stockPosition = {
            x: stockRect.left + stockRect.width / 2,
            y: stockRect.top + stockRect.height / 2
          };
          
          // Add animating class to prevent hover effects during animation
          if (topCardElement) {
            topCardElement.classList.add('animating');
          }
          
          console.log('[GameBoard] Stock position captured (HOVER STATE):', {
            position: stockPosition,
            cardRect: { left: stockRect.left, top: stockRect.top, width: stockRect.width, height: stockRect.height },
            cardDimensions: { width: cardDimensions.width, height: cardDimensions.height },
            cssProperties: { width: cssCardWidth, height: cssCardHeight },
            calculation: `CENTER = ${stockRect.left} + ${stockRect.width/2} = ${stockRect.left + stockRect.width/2}, ${stockRect.top} + ${stockRect.height/2} = ${stockRect.top + stockRect.height/2}`,
            hoverState: topCardElement ? 'ACTIVE (hover transform applied)' : 'NOT_DETECTED',
            expectedHoverTransform: 'translateY(-6px) scale(1.02)',
            debug: {
              cardElementFound: !!topCardElement,
              rectSource: topCardElement ? 'HOVER_CARD_ELEMENT' : 'PILE_CONTAINER',
              hoverOffset: topCardElement ? 'Y: -6px, Scale: 1.02' : 'NO_HOVER',
              centerCalculation: `(${stockRect.left}, ${stockRect.top}) + (${stockRect.width/2}, ${stockRect.height/2}) = (${stockPosition.x}, ${stockPosition.y})`
            },
            pileElement: {
              className: stockElement.className,
              tagName: stockElement.tagName,
              children: stockElement.children.length,
              hasCardElement: !!topCardElement
            }
          });
        }

        // Get waste position from the waste pile container
        const wasteElement = document.querySelector('[data-pile-type="waste"]') as HTMLElement;
        if (wasteElement) {
          const wasteRect = wasteElement.getBoundingClientRect();
          // Since pile containers are the same size as cards, position at pile container
          const cardDimensions = getCardDimensions();
          
          // Convert top-left coordinates to center coordinates for animation system  
          // Add slight downward offset for more natural diagonal movement
          wastePosition = {
            x: wasteRect.left + wasteRect.width / 2,
            y: wasteRect.top + wasteRect.height / 2 + 8 // Add 8px downward for subtle diagonal
          };
          console.log('[GameBoard] Waste position from pile container:', {
            position: wastePosition,
            pileRect: { left: wasteRect.left, top: wasteRect.top, width: wasteRect.width, height: wasteRect.height },
            cardDimensions: { width: cardDimensions.width, height: cardDimensions.height },
            calculation: `${wasteRect.left} (pile left), ${wasteRect.top} (pile top)`,
            alignment: 'Animated card left edge aligned with waste pile left edge',
            debug: {
              pileWidth: wasteRect.width,
              pileHeight: wasteRect.height,
              cardWidth: cardDimensions.width,
              cardHeight: cardDimensions.height,
              widthDifference: wasteRect.width - cardDimensions.width,
              heightDifference: wasteRect.height - cardDimensions.height,
              reason: 'Pile and card dimensions are identical - using container positioning',
              finalPosition: {
                cardLeftEdge: wasteRect.left,
                cardRightEdge: wasteRect.left + cardDimensions.width,
                pileLeftEdge: wasteRect.left,
                pileRightEdge: wasteRect.left + wasteRect.width,
                alignment: 'Card left edge = Pile left edge'
              }
            },
            pileElement: {
              className: wasteElement.className,
              tagName: wasteElement.tagName,
              children: wasteElement.children.length
            }
          });
        }
      }
      
      // Debug movement calculation
      if (stockPosition && wastePosition) {
        const deltaX = wastePosition.x - stockPosition.x;
        const deltaY = wastePosition.y - stockPosition.y;
        console.log('[GameBoard] Movement delta analysis:', {
          stockPosition,
          wastePosition,
          delta: { x: deltaX, y: deltaY },
          movement: {
            horizontal: Math.abs(deltaX) > Math.abs(deltaY) ? 'PRIMARY' : 'secondary',
            vertical: Math.abs(deltaY) > Math.abs(deltaX) ? 'PRIMARY' : 'secondary',
            direction: `${deltaX > 0 ? 'RIGHT' : 'LEFT'} ${deltaY > 0 ? 'DOWN' : 'UP'}`,
            distance: Math.sqrt(deltaX * deltaX + deltaY * deltaY)
          },
          expectedMovement: deltaX > 0 && Math.abs(deltaY) > 5 ? 'DIAGONAL' : deltaX > 0 ? 'HORIZONTAL_ONLY' : 'UNEXPECTED'
        });
      }
      
      await animateStockFlip(
        topStockCard,
        stockPosition,
        wastePosition,
        () => {
          // Animation complete - remove animating class and perform the actual stock flip
          if (topCardElement) {
            topCardElement.classList.remove('animating');
          }
          handleStockFlip(true); // Skip sound since we already played it
        },
        (error) => {
          console.error('Stock flip animation failed:', error);
          // Fallback to immediate stock flip
          handleStockFlip(true);
        }
      );
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