import { useState, useCallback, useEffect } from 'react';
import { GameState, Card, CardPosition, MoveResult } from '@/types';
import { createInitialGameState } from '@/utils/gameUtils';
import { validateAndExecuteMove, flipStock, autoMoveToFoundation } from '@/utils/moveValidation';
import { soundManager, playSoundEffect } from '@/utils/soundUtils';
import { saveSettings, loadSettings, saveGameState, loadGameState, clearGameState } from '@/utils/localStorage';
import { useUndoRedo } from './useUndoRedo';

/**
 * Custom hook for managing game state and actions
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Return a static, placeholder state for SSR to avoid hydration errors
    return {
      tableauPiles: [[], [], [], [], [], [], []],
      foundationPiles: [[], [], [], []],
      stockPile: [],
      wastePile: [],
      moves: 0,
      score: 0,
      isGameWon: false,
      selectedCards: [],
      selectedPileType: null,
      selectedPileIndex: null,
      stockCycles: 0,
      settings: {
        deckCyclingLimit: 0,
        drawCount: 1,
        autoMoveToFoundation: false,
        soundEnabled: true,
        showHints: false
      },
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalTime: 0,
        bestTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageMoves: 0,
        totalMoves: 0,
        lastPlayed: 0
      },
      history: [],
      historyIndex: -1
    };
  });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const { saveState, undo } = useUndoRedo(setGameState);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameState.isGameWon) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, gameState.isGameWon]);

  // Main hydration and state initialization effect
  useEffect(() => {
    if (!isHydrated) {
      const savedSettings = loadSettings();
      const savedGameState = loadGameState();
      let initialState: GameState;

      if (savedGameState && !savedGameState.isGameWon) {
        initialState = {
          ...createInitialGameState(), // Base structure
          ...savedGameState, // Overwrite with saved data
          selectedCards: [],
          selectedPileType: null,
          selectedPileIndex: null,
        };
        if (savedSettings) {
          initialState.settings = { ...initialState.settings, ...savedSettings };
        }
        if (savedGameState.gameStartTime) {
          setTimeElapsed(Math.floor((Date.now() - savedGameState.gameStartTime) / 1000));
        }
        setGameStarted(true);
      } else {
        initialState = createInitialGameState();
        if (savedSettings) {
          initialState.settings = { ...initialState.settings, ...savedSettings };
        }
        // This is a new game, so save its initial state for undo
        const historyUpdate = saveState('New game', initialState, [], -1);
        initialState.history = historyUpdate.history;
        initialState.historyIndex = historyUpdate.historyIndex;
        setGameStarted(false);
        setTimeElapsed(0);
      }

      setGameState(initialState);
      setIsHydrated(true);

      if (initialState.settings.soundEnabled !== undefined) {
        soundManager.setEnabled(initialState.settings.soundEnabled);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, saveState]);

  // Auto-save game state
  useEffect(() => {
    if (isHydrated && gameState.gameStartTime) { // Only save if game has started
      const timeoutId = setTimeout(() => {
        saveGameState(gameState);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState, isHydrated]);

  const startNewGame = useCallback(() => {
    let newState = createInitialGameState();
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

    if (newState.settings.soundEnabled) {
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

  const handleStockFlip = useCallback((): MoveResult => {
    if (!gameStarted) setGameStarted(true);

    const result = flipStock(gameState);

    if (result.success && result.newGameState) {
      const historyUpdate = saveState('Flip stock pile', result.newGameState, gameState.history, gameState.historyIndex);
      setGameState({
        ...result.newGameState,
        history: historyUpdate.history,
        historyIndex: historyUpdate.historyIndex
      });

      if (gameState.settings.soundEnabled) playSoundEffect.cardFlip();
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