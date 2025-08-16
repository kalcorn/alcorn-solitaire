import React, { useState, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameAnimations } from '../hooks/useGameAnimations';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { createGameEventHandlers } from '@/utils/gameEventHandlers';
import { CardPosition } from '@/types';
import { useIsClient } from '@/utils/hydrationUtils';
import { playSoundEffect } from '@/utils/soundUtils';
import GameLayout from './GameLayout';
import DragPreview from './DragPreview/DragPreview';
import WinOverlay from './WinOverlay';
import ParticleEffects from './ParticleEffects';
import Header from './Header/Header';
import SettingsPanel from './SettingsPanel';
import HintsPanel from './HintsPanel';
import UndoRedoButtons from './UndoRedoButtons';
import SubtleHints from './SubtleHints';

const GameBoard: React.FC = () => {
  const isClient = useIsClient();
  const {
    state,
    timeElapsed,
    gameStarted,
    isHydrated,
    actions
  } = useGameEngine();

  // State for managing card visibility during shuffle
  const [cardVisibility, setCardVisibility] = useState<{ [cardId: string]: boolean }>({});

  const {
    particleTrigger,
    isShuffling,
    isWinAnimating,
    triggerShuffleAnimation,
    resetShuffleAnimation,
    animateStockFlip
  } = useGameAnimations(state);

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

  // Create event handlers using the game engine
  const eventHandlers = createGameEventHandlers(actions.engine, startDrag);

  // Enhanced move cards with particle effects
  const handleMoveCards = useCallback((from: CardPosition, to: CardPosition, cards: any[]) => {
    const result = actions.moveCards(from, to, cards);
    if (result.success) {
      // Trigger sparkle effect for valid moves
      triggerShuffleAnimation();
    }
    return result;
  }, [actions, triggerShuffleAnimation]);

  // Stock flip handler  
  const handleStockFlip = useCallback(async (event?: React.MouseEvent) => {
    if (!event) return;
    
    // Get the card that will be flipped
    const stockCard = state.stockPile[state.stockPile.length - 1];
    if (!stockCard) {
      // Handle empty stock case (recycling) - just call the action
      actions.flipStock(false);
      return;
    }
    
    // Calculate actual top card positions for animation
    const stockElement = document.querySelector('[data-pile-type="stock"]') as HTMLElement;
    const wasteElement = document.querySelector('[data-pile-type="waste"]') as HTMLElement;
    
    let stockPosition = null;
    let wastePosition = null;
    
    if (stockElement && wasteElement) {
      const stockRect = stockElement.getBoundingClientRect();
      const wasteRect = wasteElement.getBoundingClientRect();
      
      // Calculate stock pile top card position (matches StockPile.tsx logic)
      const stockStackOffset = Math.min(4, state.stockPile.length - 1);
      stockPosition = {
        x: stockRect.left + stockRect.width / 2 - stockStackOffset,
        y: stockRect.top + stockRect.height / 2 - stockStackOffset
      };
      
      // Calculate waste pile position where new card should land
      const currentWasteCount = state.wastePile.length;
      
      if (currentWasteCount === 0) {
        // First card special position
        wastePosition = { 
          x: wasteRect.left + 20, 
          y: wasteRect.top + 34 
        };
      } else {
        // Cards 2+ follow a simple pattern: move up/left by 1px per "level"
        const newWasteCount = currentWasteCount + 1;
        const offset = Math.max(0, 3 - newWasteCount); // 2,1,0 for counts 1,2,3+
        wastePosition = {
          x: wasteRect.left + 22 - offset,
          y: wasteRect.top + 36 - offset
        };
      }
    }
    
    // Update stock pile immediately, then start animation
    actions.flipStockOnly();
    
    // Start animation, then add card to waste when animation completes
    await animateStockFlip(stockCard, stockPosition, wastePosition, () => {
      // Add card to waste pile after animation completes
      actions.addToWaste(stockCard);
    });
  }, [actions, animateStockFlip, state.stockPile, state.wastePile]);

  // Simplified new game handler
  const handleNewGame = useCallback(() => {
    if (state.settings.soundEnabled) {
      playSoundEffect.shuffle();
    }
    
    triggerShuffleAnimation();
    
    setTimeout(() => {
      actions.startNewGame();
    }, 500);
  }, [actions, state.settings.soundEnabled, triggerShuffleAnimation]);

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
        moves={isClient ? state.moves : 0}
        score={isClient ? state.score : 0}
        onNewGame={handleNewGame}
        settings={state.settings}
        onSettingsChange={actions.updateSettings}
        onUndo={actions.undo}
        canUndo={actions.canUndo()}
      />
      <div 
        className={`w-full flex grow flex-col items-center bg-transparent min-h-screen overflow-hidden ${!isClient ? 'hydration-loading' : ''}`}
        role="main"
        aria-label="Solitaire game board"
      >
        <GameLayout
          state={state}
          isShuffling={isShuffling}
          isWinAnimating={isWinAnimating}
          isCardBeingDragged={isCardBeingDragged}
          isZoneHovered={isZoneHovered}
          onStockFlip={handleStockFlip}
          onCardClick={eventHandlers.handleCardClick}
          onCardDragStart={eventHandlers.handleCardDragStart}
          startDrag={startDrag}
          getMovableCards={actions.getMovableCards}
          cardVisibility={cardVisibility}
        />

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
        <SubtleHints gameState={state} />

        {/* Undo Button */}
        <UndoRedoButtons onUndo={actions.undo} canUndo={actions.canUndo()} />

        {/* Win Overlay */}
        <WinOverlay 
          isGameWon={state.isGameWon}
          moves={state.moves}
          score={state.score}
          onNewGame={handleNewGame}
        />
      </div>
    </>
  );
};

export default GameBoard;