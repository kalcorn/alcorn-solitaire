import { useCallback } from 'react';
import { GameState, GameHistoryEntry } from '@/types';

export const useUndoRedo = (gameState: GameState, setGameState: (state: GameState) => void) => {
  
  const saveState = useCallback((action: string, currentState?: GameState) => {
    const stateToUse = currentState || gameState;
    
    const stateToSave = {
      tableauPiles: stateToUse.tableauPiles,
      foundationPiles: stateToUse.foundationPiles,
      stockPile: stateToUse.stockPile,
      wastePile: stateToUse.wastePile,
      moves: stateToUse.moves,
      score: stateToUse.score,
      isGameWon: stateToUse.isGameWon,
      selectedCards: [],
      selectedPileType: null,
      selectedPileIndex: null,
      stockCycles: stateToUse.stockCycles,
      settings: stateToUse.settings,
      stats: stateToUse.stats
    };

    const historyEntry: GameHistoryEntry = {
      state: stateToSave,
      timestamp: Date.now(),
      action
    };

    // Remove any future history if we're not at the end
    const newHistory = stateToUse.history.slice(0, stateToUse.historyIndex + 1);
    newHistory.push(historyEntry);

    // Limit history to last 50 moves to prevent memory issues
    const limitedHistory = newHistory.slice(-50);

    return {
      history: limitedHistory,
      historyIndex: limitedHistory.length - 1
    };
  }, [gameState]);

  const undo = useCallback(() => {
    if (gameState.historyIndex > 0 && gameState.history.length > 0) {
      const previousIndex = gameState.historyIndex - 1;
      const historyEntry = gameState.history[previousIndex];
      
      if (!historyEntry || !historyEntry.state) {
        console.warn('Invalid history entry at index', previousIndex);
        return false;
      }
      
      const previousState = historyEntry.state;
      
      setGameState({
        ...previousState,
        history: gameState.history,
        historyIndex: previousIndex
      });
      
      return true;
    }
    return false;
  }, [gameState, setGameState]);

  const canUndo = gameState.historyIndex > 0 && 
                  gameState.history.length > 0;

  return {
    saveState,
    undo,
    canUndo,
    historyLength: gameState.history.length
  };
};