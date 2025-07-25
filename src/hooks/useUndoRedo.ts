import { useCallback } from 'react';
import { GameState, GameHistoryEntry } from '@/types';

export const useUndoRedo = (gameState: GameState, setGameState: (state: GameState) => void) => {
  
  const saveState = useCallback((action: string) => {
    const stateToSave = {
      tableauPiles: gameState.tableauPiles,
      foundationPiles: gameState.foundationPiles,
      stockPile: gameState.stockPile,
      wastePile: gameState.wastePile,
      moves: gameState.moves,
      score: gameState.score,
      isGameWon: gameState.isGameWon,
      selectedCards: gameState.selectedCards,
      selectedPileType: gameState.selectedPileType,
      selectedPileIndex: gameState.selectedPileIndex,
      stockCycles: gameState.stockCycles,
      settings: gameState.settings,
      stats: gameState.stats
    };

    const historyEntry: GameHistoryEntry = {
      state: stateToSave,
      timestamp: Date.now(),
      action
    };

    // Remove any future history if we're not at the end
    const newHistory = gameState.history.slice(0, gameState.historyIndex + 1);
    newHistory.push(historyEntry);

    // Limit history to last 50 moves to prevent memory issues
    const limitedHistory = newHistory.slice(-50);

    setGameState({
      ...gameState,
      history: limitedHistory,
      historyIndex: limitedHistory.length - 1
    });
  }, [gameState, setGameState]);

  const undo = useCallback(() => {
    if (gameState.historyIndex > 0) {
      const previousIndex = gameState.historyIndex - 1;
      const previousState = gameState.history[previousIndex].state;
      
      setGameState({
        ...previousState,
        history: gameState.history,
        historyIndex: previousIndex
      });
      
      return true;
    }
    return false;
  }, [gameState, setGameState]);

  const redo = useCallback(() => {
    if (gameState.historyIndex < gameState.history.length - 1) {
      const nextIndex = gameState.historyIndex + 1;
      const nextState = gameState.history[nextIndex].state;
      
      setGameState({
        ...nextState,
        history: gameState.history,
        historyIndex: nextIndex
      });
      
      return true;
    }
    return false;
  }, [gameState, setGameState]);

  const canUndo = gameState.historyIndex > 0;
  const canRedo = gameState.historyIndex < gameState.history.length - 1;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: gameState.history.length
  };
};