import React from 'react';
import Header from './Header';
import DragPreview from './DragPreview';
import ParticleEffects from './ParticleEffects';
import SubtleHints from './SubtleHints';
import UndoRedoButtons from './UndoRedoButtons';
import TopPilesSection from './layout/TopPilesSection';
import TableauSection from './layout/TableauSection';
import LandscapeMobileLayout from './layout/LandscapeMobileLayout';
import StockPile from './StockPile';
import WastePile from './WastePile';
import FoundationPile from './FoundationPile';
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
      endDrag();
    };

    const handleTouchMove = (e: TouchEvent) => {
      updateDrag(e as any);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endDrag();
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
  }, [dragState.isDragging, updateDrag, endDrag, cancelDrag]);

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
        className={`w-full flex grow flex-col items-center bg-transparent ${!isClient ? 'hydration-loading' : ''}`}
        role="main"
        aria-label="Solitaire game board"
      >
        {/* Top Piles Section - Desktop Only */}
        <div className="hidden lg:block w-full">
          <TopPilesSection
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

        {/* Mobile Layouts */}
        <div className="block md:hidden lg:hidden w-full">
          {/* Portrait Mobile Layout */}
          <div className="flex flex-col gap-4 w-full">
            {/* Mobile Top Piles Section - Full Width */}
            <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-opacity-90 py-3 shadow-lg border-y border-slate-600/30">
              <div className="flex flex-row items-center justify-between w-full px-4">
                <div className="flex flex-row items-center gap-3">
                  <StockPile 
                    cards={gameState.stockPile} 
                    onClick={handleAnimatedStockFlip}
                    cyclesRemaining={gameState.settings.deckCyclingLimit > 0 ? 
                      Math.max(0, gameState.settings.deckCyclingLimit - gameState.stockCycles) : 
                      undefined}
                    canCycle={gameState.settings.deckCyclingLimit === 0 || 
                      gameState.stockCycles < gameState.settings.deckCyclingLimit}
                    wasteCardCount={gameState.wastePile.length}
                    isShuffling={isShuffling}
                  />
                  <WastePile 
                    cards={gameState.wastePile}
                    onCardClick={(cardId) => {
                      const cardIndex = gameState.wastePile.findIndex(c => c.id === cardId);
                      if (cardIndex !== -1) {
                        eventHandlers.handleCardClick(cardId, 'waste', 0, cardIndex);
                      }
                    }}
                    onCardDragStart={(cardId, event) => {
                      const cardIndex = gameState.wastePile.findIndex(c => c.id === cardId);
                      if (cardIndex !== -1) {
                        const movableCards = getMovableCards({ pileType: 'waste', pileIndex: 0, cardIndex });
                        if (movableCards.length > 0) {
                          startDrag(movableCards, { pileType: 'waste', pileIndex: 0, cardIndex }, event);
                        }
                      }
                    }}
                    isCardBeingDragged={isCardBeingDragged}
                  />
                </div>
                <div className="flex flex-row items-center gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      data-drop-zone
                      data-pile-type="foundation"
                      data-pile-index={i}
                      className={`${isZoneHovered('foundation', i) ? 'drop-zone' : ''} ${isWinAnimating ? 'foundation-win-cascade' : ''}`}
                    >
                      <FoundationPile 
                        index={i} 
                        cards={gameState.foundationPiles[i]}
                        onCardClick={(cardId) => {
                          const cardIndex = gameState.foundationPiles[i].findIndex(c => c.id === cardId);
                          if (cardIndex !== -1) {
                            eventHandlers.handleCardClick(cardId, 'foundation', i, cardIndex);
                          }
                        }}
                        onCardDragStart={(cardId, event) => {
                          const cardIndex = gameState.foundationPiles[i].findIndex(c => c.id === cardId);
                          if (cardIndex !== -1) {
                            const movableCards = getMovableCards({ pileType: 'foundation', pileIndex: i, cardIndex });
                            if (movableCards.length > 0) {
                              startDrag(movableCards, { pileType: 'foundation', pileIndex: i, cardIndex }, event);
                            }
                          }
                        }}
                        isDropZone={isZoneHovered('foundation', i)}
                        isCardBeingDragged={isCardBeingDragged}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mobile Tableau Section */}
            <div className="px-4">
              <TableauSection
                tableauPiles={gameState.tableauPiles}
                isCardBeingDragged={isCardBeingDragged}
                isZoneHovered={isZoneHovered}
                onCardClick={eventHandlers.handleCardClick}
                onCardDragStart={eventHandlers.handleCardDragStart}
                startDrag={startDrag}
                getMovableCards={getMovableCards}
              />
            </div>
          </div>
        </div>

        {/* Landscape Mobile Layout */}
        <div className="hidden landscape-mobile-layout w-full flex-1 flex">
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

        {/* Desktop Layout */}
        <div className="hidden lg:block w-full flex grow max-w-6xl mx-auto px-4 xl:px-0">
          <div className="card-playing-area flex flex-col grow gap-3 w-full pt-6 md:pt-0 lg:pt-0">
            {/* Standard Tableau Section - Desktop Only */}
            <TableauSection
              tableauPiles={gameState.tableauPiles}
              isCardBeingDragged={isCardBeingDragged}
              isZoneHovered={isZoneHovered}
              onCardClick={eventHandlers.handleCardClick}
              onCardDragStart={eventHandlers.handleCardDragStart}
              startDrag={startDrag}
              getMovableCards={getMovableCards}
            />
          </div>
        </div>
          
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
      <UndoRedoButtons 
        onUndo={performUndo}
        canUndo={canUndo(gameState)}
      />
    </>
  );
};

export default GameBoard;