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

  // Simplified stock flip handler
  const handleStockFlip = useCallback(async (event?: React.MouseEvent) => {
    const result = actions.flipStock(false); // Pass skipSound parameter
    
    if (result.success) {
      // Handle animation if needed
      if (event) {
        // Simple animation trigger - the actual animation logic is in useGameAnimations
        triggerShuffleAnimation();
      }
    }
  }, [actions, triggerShuffleAnimation]);

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