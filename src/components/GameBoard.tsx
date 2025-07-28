import React from 'react';
import Header from './Header';
import DragPreview from './DragPreview';
import ParticleEffects from './ParticleEffects';
import SubtleHints from './SubtleHints';
import UndoButton from './UndoButton';
import LandscapeMobileLayout from './layout/LandscapeMobileLayout';
import MobileLayout from './layout/MobileLayout';
import DesktopLayout from './layout/DesktopLayout';
import WinOverlay from './WinOverlay';
import AnimatedCard from './AnimatedCard';
import FlyingCards from './FlyingCards';
import BridgeCards from './BridgeCards';
import { useGameState } from '@/hooks/useGameState';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useGameAnimations } from '@/hooks/useGameAnimations';
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
    animatingCard,
    flyingCards,
    bridgeCards,
    triggerShuffleAnimation,
    createShuffleCardsAnimation,
    createCardBridgeAnimation,
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
    animateStockFlip
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

  // Animated stock flip handler
  const handleAnimatedStockFlip = () => {
    if (animatingCard) return;
    
    const isRecycling = gameState.stockPile.length === 0;
    const isLandscapeMobile = window.innerHeight <= 500 && window.innerWidth >= 640 && window.innerWidth <= 1024;
    
    // Get positions for animation - try all layouts
    let stockPosition = null;
    let wastePosition = null;
    
    if (isLandscapeMobile) {
      // For landscape mobile, look in the landscape mobile layout first
      stockPosition = eventHandlers.getElementPosition('.landscape-mobile-left-sidebar .stock-pile-responsive');
      wastePosition = eventHandlers.getElementPosition('.landscape-mobile-left-sidebar .waste-pile-responsive');
    } else if (window.innerWidth < 1024) {
      // For mobile (both portrait and landscape), look in the mobile layout
      // Try more specific selectors for mobile layout
      stockPosition = eventHandlers.getElementPosition('.block.md\\:hidden.lg\\:hidden .stock-pile-responsive');
      wastePosition = eventHandlers.getElementPosition('.block.md\\:hidden.lg\\:hidden .waste-pile-responsive');
      
      // Fallback to generic selectors if specific ones don't work
      if (!stockPosition) {
        stockPosition = eventHandlers.getElementPosition('.stock-pile-responsive');
      }
      if (!wastePosition) {
        wastePosition = eventHandlers.getElementPosition('.waste-pile-responsive');
      }
    } else {
      // For desktop, look in the standard layout
      stockPosition = eventHandlers.getElementPosition('.standard-layout .stock-pile-responsive');
      wastePosition = eventHandlers.getElementPosition('.standard-layout .waste-pile-responsive');
    }
    
    // Fallback positions if elements not found
    if (!stockPosition) {
      stockPosition = { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 };
    }
    if (!wastePosition) {
      wastePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    if (isRecycling && gameState.wastePile.length > 0) {
      // Start sound first (async) to counteract any lag
      if (gameState.settings.soundEnabled) {
        if (gameState.wastePile.length === 1) {
          playSoundEffect.cardFlip();
        } else {
          playSoundEffect.shuffle();
        }
      }
      
      // Create card bridge animation - cards move one by one from waste to stock
      createCardBridgeAnimation(wastePosition, stockPosition, isLandscapeMobile);
      
      // Delay the actual stock flip until bridge animation completes (exactly 1 second)
      setTimeout(() => {
        handleStockFlip(true); // Skip sound since we already played it
      }, 1000);
    } else if (gameState.stockPile.length > 0) {
      // Start sound first (async) to counteract any lag
      if (gameState.settings.soundEnabled) {
        playSoundEffect.cardFlip();
      }
      
      // Animate card from stock to waste
      const topStockCard = gameState.stockPile[gameState.stockPile.length - 1];
      
      // Use the actual stock pile position (center) for the animation start
      const stockStartPosition = {
        x: stockPosition.x,
        y: stockPosition.y
      };
      
      // Use the center of waste pile for the animation end (so card lands on top)
      const wasteEndPosition = {
        x: wastePosition.x,
        y: wastePosition.y
      };
      
      animateStockFlip(topStockCard, stockStartPosition, wasteEndPosition, 'stockToWaste', isLandscapeMobile);
      
      // Delay the actual stock flip until animation completes
      setTimeout(() => {
        handleStockFlip(true); // Skip sound since we already played it
      }, 300);
    }
  };

  // Animated new game handler
  const handleAnimatedNewGame = () => {
    // Start sound first (async) to counteract any lag
    if (gameState.settings.soundEnabled) {
      playSoundEffect.shuffle();
    }
    
    createShuffleCardsAnimation();
    
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
          
        {/* Win condition display */}
        <WinOverlay
          isGameWon={gameState.isGameWon}
          moves={gameState.moves}
          score={gameState.score}
          onNewGame={handleAnimatedNewGame}
        />

        {/* Drag Preview */}
        {dragState.isDragging && (
          <DragPreview
            cards={dragState.draggedCards}
            style={getDragPreviewStyle()}
            isOverDropZone={!!hoveredZone}
            isSnapBack={dragState.isSnapBack}
          />
        )}

        {/* Animated Card Flyover */}
        <AnimatedCard animatingCard={animatingCard} />

        {/* Flying Cards Shuffle Animation */}
        <FlyingCards flyingCards={flyingCards} />

        {/* Bridge Cards Animation */}
        <BridgeCards bridgeCards={bridgeCards} />
      </div>

      {/* Particle Effects */}
      <ParticleEffects trigger={particleTrigger} />

      {/* Subtle Hints */}
      <SubtleHints gameState={gameState} />

      {/* Undo Button */}
      <UndoButton 
        onUndo={performUndo}
        canUndo={canUndo(gameState)}
      />
    </>
  );
};

export default GameBoard;