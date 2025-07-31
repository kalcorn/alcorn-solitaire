import { useCallback } from 'react';
import { GameState, GameHistoryEntry } from '@/types';

export const useUndo = (
  setGameState: (state: GameState) => void
) => {
  
  const saveState = useCallback((
    action: string, 
    currentState: GameState,
    history: GameHistoryEntry[],
    historyIndex: number
  ) => {
    const stateToUse = currentState;
    
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

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(historyEntry);

    const limitedHistory = newHistory.slice(-50);

    return {
      history: limitedHistory,
      historyIndex: limitedHistory.length - 1
    };
  }, []);

  const undo = useCallback((gameState: GameState | null) => {
    // Handle null game state gracefully
    if (!gameState || !gameState.history || gameState.historyIndex === undefined) {
      return false;
    }
    
    if (gameState.historyIndex > 0 && gameState.history.length > 0) {
      const previousIndex = gameState.historyIndex - 1;
      const historyEntry = gameState.history[previousIndex];
      
      if (!historyEntry || !historyEntry.state) {
        return false;
      }
      
      const previousState = historyEntry.state;
      
      // Validate that the state has required properties
      if (!previousState.tableauPiles || !previousState.foundationPiles || 
          !previousState.stockPile || !previousState.wastePile) {
        return false;
      }
      
      setGameState({
        ...previousState,
        history: gameState.history,
        historyIndex: previousIndex
      });
      
      return true;
    }
    return false;
  }, [setGameState]);

  return {
    saveState,
    undo,
    canUndo: (gameState: GameState | null) => {
      if (!gameState || !gameState.history || gameState.historyIndex === undefined) {
        return false;
      }
      return gameState.historyIndex > 0 && gameState.history.length > 0;
    },
  };
};