import { useState, useCallback, useEffect } from 'react';
import { GameState, Card, CardPosition, MoveResult } from '@/types';
import { createInitialGameState, cloneGameState } from '@/utils/gameUtils';
import { validateAndExecuteMove, flipStock, autoMoveToFoundation } from '@/utils/moveValidation';

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
        showTimer: true
      }
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
      setGameState(createInitialGameState());
      setGameStarted(false);
      setTimeElapsed(0);
      setIsHydrated(true);
    }
  }, [isHydrated]);

  /**
   * Starts a new game
   */
  const startNewGame = useCallback(() => {
    const newState = createInitialGameState();
    setGameState(newState);
    setTimeElapsed(0);
    setGameStarted(false);
  }, []);

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
    }
    
    return result;
  }, [gameState, gameStarted]);

  /**
   * Updates game settings
   */
  const updateSettings = useCallback((newSettings: Partial<GameState['settings']>): void => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));
  }, []);

  /**
   * Auto-moves a card to foundation if possible
   */
  const handleAutoMoveToFoundation = useCallback((card: Card): MoveResult => {
    const result = autoMoveToFoundation(gameState, card);
    
    if (result.success && result.newGameState) {
      setGameState(result.newGameState);
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