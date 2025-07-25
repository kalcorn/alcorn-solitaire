import { useState, useCallback, useEffect } from 'react';
import { GameState, Card, CardPosition, MoveResult } from '@/types';
import { createInitialGameState, cloneGameState } from '@/utils/gameUtils';
import { validateAndExecuteMove, flipStock, autoMoveToFoundation } from '@/utils/moveValidation';
import { soundManager, playSoundEffect } from '@/utils/soundUtils';
import { saveSettings, loadSettings, saveGameState, loadGameState, clearGameState } from '@/utils/localStorage';
import { useUndoRedo } from './useUndoRedo';

/**
 * Custom hook for managing game state and actions
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    // Return a placeholder state for SSR that will be replaced on client
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
        deckCyclingLimit: 0, // unlimited by default
        drawCount: 1,
        autoMoveToFoundation: true,
        showTimer: true,
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

  // Initialize game state after hydration
  useEffect(() => {
    if (!isHydrated) {
      // Load saved settings first
      const savedSettings = loadSettings();
      
      // Try to load saved game state
      const savedGameState = loadGameState();
      
      let initialState: GameState;
      
      if (savedGameState && !savedGameState.isGameWon) {
        // Restore saved game if it exists and isn't won
        initialState = {
          ...createInitialGameState(),
          ...savedGameState,
          // Ensure we have all required fields
          selectedCards: [],
          selectedPileType: null,
          selectedPileIndex: null,
          history: [],
          historyIndex: -1
        };
        
        // Apply saved settings if available
        if (savedSettings) {
          initialState.settings = { ...initialState.settings, ...savedSettings };
        }
        
        setGameStarted(true); // Resume game timer if we loaded a game in progress
      } else {
        // Create new game with saved settings
        initialState = createInitialGameState();
        if (savedSettings) {
          initialState.settings = { ...initialState.settings, ...savedSettings };
        }
        setGameStarted(false);
        setTimeElapsed(0);
      }
      
      setGameState(initialState);
      setIsHydrated(true);
      
      // Initialize sound manager with loaded settings
      if (initialState.settings.soundEnabled !== undefined) {
        soundManager.setEnabled(initialState.settings.soundEnabled);
      }
    }
  }, [isHydrated]);

  // Auto-save game state whenever it changes (but not during initial hydration)
  useEffect(() => {
    if (isHydrated && gameState) {
      // Debounce saves to avoid excessive localStorage writes
      const timeoutId = setTimeout(() => {
        saveGameState(gameState);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState, isHydrated]);

  /**
   * Starts a new game
   */
  const startNewGame = useCallback(() => {
    const newState = createInitialGameState();
    // Preserve current settings
    newState.settings = { ...gameState.settings };
    
    setGameState(newState);
    setTimeElapsed(0);
    setGameStarted(false);
    
    // Clear the saved game state since we're starting fresh
    clearGameState();
  }, [gameState.settings]);

  /**
   * Selects cards for moving
   */
  const selectCards = useCallback((position: CardPosition, cards: Card[]) => {
    setGameState(prev => ({
      ...prev,
      selectedCards: cards,
      selectedPileType: position.pileType,
      selectedPileIndex: position.pileIndex
    }));
  }, []);

  /**
   * Deselects all cards
   */
  const deselectCards = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedCards: [],
      selectedPileType: null,
      selectedPileIndex: null
    }));
  }, []);

  /**
   * Moves cards from one position to another
   */
  const moveCards = useCallback((from: CardPosition, to: CardPosition, cards: Card[]): MoveResult => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const result = validateAndExecuteMove(gameState, from, to, cards);
    
    if (result.success && result.newGameState) {
      setGameState(result.newGameState);
      
      // Play sound effects based on the move
      if (gameState.settings.soundEnabled) {
        if (to.pileType === 'foundation') {
          playSoundEffect.cardDrop();
        } else {
          playSoundEffect.cardMove();
        }
        
        // Check for win condition and play win sound
        if (result.newGameState.isGameWon) {
          setTimeout(() => playSoundEffect.win(), 200);
        }
      }
    } else if (gameState.settings.soundEnabled) {
      playSoundEffect.error();
    }
    
    return result;
  }, [gameState, gameStarted]);

  /**
   * Flips the stock pile (deals cards to waste)
   */
  const handleStockFlip = useCallback((): MoveResult => {
    if (!gameStarted) {
      setGameStarted(true);
    }

    const result = flipStock(gameState);
    
    if (result.success && result.newGameState) {
      setGameState(result.newGameState);
      
      // Play stock flip sound
      if (gameState.settings.soundEnabled) {
        playSoundEffect.stockFlip();
      }
    }
    
    return result;
  }, [gameState, gameStarted]);

  /**
   * Updates game settings
   */
  const updateSettings = useCallback((newSettings: Partial<GameState['settings']>): void => {
    setGameState(prev => {
      const updatedSettings = {
        ...prev.settings,
        ...newSettings
      };
      
      // Update sound manager if sound setting changed
      if ('soundEnabled' in newSettings) {
        soundManager.setEnabled(newSettings.soundEnabled!);
      }
      
      // Save settings to localStorage
      saveSettings(updatedSettings);
      
      return {
        ...prev,
        settings: updatedSettings
      };
    });
  }, []);

  /**
   * Auto-moves a card to foundation if possible
   */
  const handleAutoMoveToFoundation = useCallback((card: Card): MoveResult => {
    const result = autoMoveToFoundation(gameState, card);
    
    if (result.success && result.newGameState) {
      setGameState(result.newGameState);
      
      // Play card drop sound for auto-move
      if (gameState.settings.soundEnabled) {
        playSoundEffect.cardDrop();
      }
    }
    
    return result;
  }, [gameState]);

  /**
   * Gets cards that can be moved from a specific position
   */
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
    
    if (position.cardIndex >= sourcePile.length) {
      return [];
    }
    
    // For tableau, can move sequences; for others, only single top card
    if (position.pileType === 'tableau') {
      return sourcePile.slice(position.cardIndex);
    } else {
      // Only return the top card if it's the one being requested
      return position.cardIndex === sourcePile.length - 1 ? [sourcePile[position.cardIndex]] : [];
    }
  }, [gameState]);

  /**
   * Checks if a card or sequence can be dropped at a position
   */
  const canDropAtPosition = useCallback((cards: Card[], position: CardPosition): boolean => {
    if (!cards.length) return false;
    
    const tempResult = validateAndExecuteMove(
      gameState,
      { pileType: 'tableau', pileIndex: 0, cardIndex: 0 }, // Dummy source
      position,
      cards
    );
    
    return tempResult.success;
  }, [gameState]);

  return {
    // State
    gameState,
    timeElapsed,
    gameStarted,
    
    // Actions
    startNewGame,
    selectCards,
    deselectCards,
    moveCards,
    handleStockFlip,
    handleAutoMoveToFoundation,
    updateSettings,
    
    // Utilities
    getMovableCards,
    canDropAtPosition
  };
}