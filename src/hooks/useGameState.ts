import { useState, useCallback, useEffect } from 'react';
import { GameState, Card, CardPosition, MoveResult } from '@/types';
import { createInitialGameState } from '@/utils/gameUtils';
import { validateAndExecuteMove, flipStock, autoMoveToFoundation } from '@/utils/moveValidation';
import { soundManager, playSoundEffect } from '@/utils/soundUtils';
import { saveSettings, loadSettings, saveGameState, loadGameState, clearGameState } from '@/utils/localStorage';
import { useUndoRedo } from './useUndoRedo';
import { useGameTimer } from './useGameTimer';
import { useGameHydration } from './useGameHydration';

/**
 * Custom hook for managing game state and actions
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const { saveState, undo } = useUndoRedo(setGameState);

  // Timer effect
  useGameTimer(gameStarted, gameState.isGameWon, setTimeElapsed);

  // Main hydration and state initialization effect
  useGameHydration(isHydrated, setGameState, setTimeElapsed, setGameStarted, setIsHydrated, saveState);

  // Auto-save game state
  useEffect(() => {
    if (isHydrated && gameState.gameStartTime) { // Only save if game has started
      const timeoutId = setTimeout(() => {
        saveGameState(gameState);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState, isHydrated]);

  const startNewGame = useCallback((skipSound = false) => {
    // Generate a random seed for each new game to ensure different layouts
    const randomSeed = Math.floor(Math.random() * 1000000);
    let newState = createInitialGameState(randomSeed);
    newState.settings = { ...gameState.settings };
    newState.gameStartTime = Date.now();
    clearGameState();

    const historyUpdate = saveState('New game', newState, [], -1);
    newState = {
      ...newState,
      history: historyUpdate.history,
      historyIndex: historyUpdate.historyIndex
    };

    setGameState(newState);
    setTimeElapsed(0);
    setGameStarted(false);

    if (newState.settings.soundEnabled && !skipSound) {
      playSoundEffect.shuffle();
    }
  }, [gameState.settings, saveState]);

  const selectCards = useCallback((position: CardPosition, cards: Card[]) => {
    setGameState(prev => ({
      ...prev,
      selectedCards: cards,
      selectedPileType: position.pileType,
      selectedPileIndex: position.pileIndex
    }));
  }, []);

  const deselectCards = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedCards: [],
      selectedPileType: null,
      selectedPileIndex: null
    }));
  }, []);

  const moveCards = useCallback((from: CardPosition, to: CardPosition, cards: Card[]): MoveResult => {
    if (!gameStarted) setGameStarted(true);

    const result = validateAndExecuteMove(gameState, from, to, cards);

    if (result.success && result.newGameState) {
      const historyUpdate = saveState(`Move from ${from.pileType} to ${to.pileType}`, result.newGameState, gameState.history, gameState.historyIndex);
      setGameState({
        ...result.newGameState,
        history: historyUpdate.history,
        historyIndex: historyUpdate.historyIndex
      });

      if (gameState.settings.soundEnabled) {
        if (to.pileType === 'foundation') playSoundEffect.cardDrop();
        else playSoundEffect.cardMove();
        if (result.newGameState.isGameWon) setTimeout(() => playSoundEffect.win(), 200);
      }
    } else if (gameState.settings.soundEnabled) {
      playSoundEffect.error();
    }
    return result;
  }, [gameState, gameStarted, saveState]);

  const handleStockFlip = useCallback((skipSound = false): MoveResult => {
    if (!gameStarted) setGameStarted(true);

    const result = flipStock(gameState);

    if (result.success && result.newGameState) {
      const historyUpdate = saveState('Flip stock pile', result.newGameState, gameState.history, gameState.historyIndex);
      setGameState({
        ...result.newGameState,
        history: historyUpdate.history,
        historyIndex: historyUpdate.historyIndex
      });

      if (gameState.settings.soundEnabled && !skipSound) playSoundEffect.cardFlip();
    }
    return result;
  }, [gameState, gameStarted, saveState]);

  const updateSettings = useCallback((newSettings: Partial<GameState['settings']>) => {
    setGameState(prev => {
      const updatedSettings = { ...prev.settings, ...newSettings };
      if ('soundEnabled' in newSettings) soundManager.setEnabled(newSettings.soundEnabled!);
      saveSettings(updatedSettings);
      return { ...prev, settings: updatedSettings };
    });
  }, []);

  const handleAutoMoveToFoundation = useCallback((card: Card): MoveResult => {
    const result = autoMoveToFoundation(gameState, card);

    if (result.success && result.newGameState) {
      const historyUpdate = saveState('Auto-move to foundation', result.newGameState, gameState.history, gameState.historyIndex);
      setGameState({
        ...result.newGameState,
        history: historyUpdate.history,
        historyIndex: historyUpdate.historyIndex
      });

      if (gameState.settings.soundEnabled) playSoundEffect.cardDrop();
    }
    return result;
  }, [gameState, saveState]);

  const getMovableCards = useCallback((position: CardPosition): Card[] => {
    let sourcePile: Card[] = [];
    switch (position.pileType) {
      case 'tableau':
        if (position.pileIndex >= 0 && position.pileIndex < gameState.tableauPiles.length) {
          sourcePile = gameState.tableauPiles[position.pileIndex];
        }
        break;
      case 'waste':
        sourcePile = gameState.wastePile;
        break;
      case 'foundation':
        if (position.pileIndex >= 0 && position.pileIndex < gameState.foundationPiles.length) {
          sourcePile = gameState.foundationPiles[position.pileIndex];
        }
        break;
    }
    if (position.cardIndex >= sourcePile.length) return [];
    if (position.pileType === 'tableau') return sourcePile.slice(position.cardIndex);
    return position.cardIndex === sourcePile.length - 1 ? [sourcePile[position.cardIndex]] : [];
  }, [gameState]);

  const canDropAtPosition = useCallback((cards: Card[], position: CardPosition): boolean => {
    if (!cards.length) return false;
    const tempResult = validateAndExecuteMove(gameState, { pileType: 'tableau', pileIndex: 0, cardIndex: 0 }, position, cards);
    return tempResult.success;
  }, [gameState]);

  const handleUndo = useCallback(() => {
    undo(gameState);
  }, [gameState, undo]);

  return {
    gameState,
    timeElapsed,
    gameStarted,
    startNewGame,
    selectCards,
    deselectCards,
    moveCards,
    handleStockFlip,
    handleAutoMoveToFoundation,
    updateSettings,
    undo: handleUndo,
    getMovableCards,
    canDropAtPosition,
    canUndo: (gameState: GameState) => gameState.historyIndex > 0 && gameState.history.length > 0,
  };
}