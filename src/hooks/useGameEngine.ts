import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameEngine, GameEventType, GameEvent } from '@/engine/GameEngine';
import { GameState, Card, CardPosition, MoveResult } from '@/types';
import { createInitialGameState } from '@/utils/gameUtils';
import { loadSettings, loadGameState, saveGameState } from '@/utils/localStorage';
import { soundManager, playSoundEffect } from '@/utils/soundUtils';

export function useGameEngine() {
  const [engine] = useState(() => new GameEngine());
  const [state, setState] = useState<GameState>(engine.getState());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize game state from localStorage
  useEffect(() => {
    if (!isHydrated) {
      const savedSettings = loadSettings();
      const savedGameState = loadGameState();
      let initialState: GameState;

      if (savedGameState && !savedGameState.isGameWon) {
        initialState = {
          ...createInitialGameState(),
          ...savedGameState,
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
        const randomSeed = Math.floor(Math.random() * 1000000);
        initialState = createInitialGameState(randomSeed);
        if (savedSettings) {
          initialState.settings = { ...initialState.settings, ...savedSettings };
        }
        setGameStarted(false);
        setTimeElapsed(0);
      }

      // Create new engine with initial state
      const newEngine = new GameEngine(initialState);
      if (initialState.gameStartTime) {
        newEngine.setGameStartTime(initialState.gameStartTime);
      }
      
      // Update the engine reference
      Object.assign(engine, newEngine);
      setState(initialState);
      setIsHydrated(true);

      if (initialState.settings.soundEnabled !== undefined && soundManager) {
        soundManager.setEnabled(initialState.settings.soundEnabled);
      }
    }
  }, [isHydrated, engine]);

  // Subscribe to game events
  useEffect(() => {
    const handleStateChange = (event: GameEvent) => {
      setState(engine.getState());
    };

    const handleMoveExecuted = (event: GameEvent) => {
      const { result } = event.payload;
      if (result.success && result.newGameState) {
        if (result.newGameState.settings.soundEnabled) {
          if (event.payload.to.pileType === 'foundation') {
            playSoundEffect.cardDrop();
          } else {
            playSoundEffect.cardMove();
          }
          if (result.newGameState.isGameWon) {
            setTimeout(() => playSoundEffect.win(), 200);
          }
        }
      }
    };

    const handleStockFlipped = (event: GameEvent) => {
      const currentState = engine.getState();
      if (currentState.settings.soundEnabled) {
        playSoundEffect.cardFlip();
      }
    };

    const handleInvalidMove = (event: GameEvent) => {
      const currentState = engine.getState();
      if (currentState.settings.soundEnabled) {
        playSoundEffect.error();
      }
    };

    const handleGameWon = (event: GameEvent) => {
      // Handle game won event
    };

    const handleNewGameStarted = (event: GameEvent) => {
      const { state: newState } = event.payload;
      setTimeElapsed(0);
      setGameStarted(false);
      
      if (newState.settings.soundEnabled) {
        playSoundEffect.shuffle();
      }
    };

    engine.subscribe(GameEventType.STATE_CHANGED, handleStateChange);
    engine.subscribe(GameEventType.MOVE_EXECUTED, handleMoveExecuted);
    engine.subscribe(GameEventType.STOCK_FLIPPED, handleStockFlipped);
    engine.subscribe(GameEventType.INVALID_MOVE, handleInvalidMove);
    engine.subscribe(GameEventType.GAME_WON, handleGameWon);
    engine.subscribe(GameEventType.NEW_GAME_STARTED, handleNewGameStarted);

    return () => {
      engine.unsubscribe(GameEventType.STATE_CHANGED, handleStateChange);
      engine.unsubscribe(GameEventType.MOVE_EXECUTED, handleMoveExecuted);
      engine.unsubscribe(GameEventType.STOCK_FLIPPED, handleStockFlipped);
      engine.unsubscribe(GameEventType.INVALID_MOVE, handleInvalidMove);
      engine.unsubscribe(GameEventType.GAME_WON, handleGameWon);
      engine.unsubscribe(GameEventType.NEW_GAME_STARTED, handleNewGameStarted);
    };
  }, [engine]);

  // Auto-save game state
  useEffect(() => {
    if (isHydrated && state.gameStartTime) {
      const timeoutId = setTimeout(() => {
        saveGameState(state);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [state, isHydrated]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !state.isGameWon) {
      interval = setInterval(() => {
        try {
          setTimeElapsed(prev => prev + 1);
        } catch (error) {
          console.warn('Timer callback error:', error);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, state.isGameWon]);

  // Game actions - moved outside useMemo to fix hooks rules
  const moveCards = useCallback((from: CardPosition, to: CardPosition, cards: Card[]): MoveResult => {
    if (!gameStarted) setGameStarted(true);
    return engine.moveCards(from, to, cards);
  }, [engine, gameStarted]);

  const flipStock = useCallback((skipSound = false): MoveResult => {
    if (!gameStarted) setGameStarted(true);
    return engine.flipStock();
  }, [engine, gameStarted]);

  const startNewGame = useCallback((seed?: number) => {
    engine.startNewGame(seed);
  }, [engine]);

  const undo = useCallback(() => {
    return engine.undo();
  }, [engine]);

  const autoMoveToFoundation = useCallback((card: Card): MoveResult => {
    return engine.autoMoveToFoundation(card);
  }, [engine]);

  const selectCards = useCallback((position: CardPosition, cards: Card[]) => {
    engine.getStateManager().updateState((state: GameState) => ({
      ...state,
      selectedCards: cards,
      selectedPileType: position.pileType,
      selectedPileIndex: position.pileIndex
    }), 'Select cards');
  }, [engine]);

  const deselectCards = useCallback(() => {
    engine.getStateManager().updateState((state: GameState) => ({
      ...state,
      selectedCards: [],
      selectedPileType: null,
      selectedPileIndex: null
    }), 'Deselect cards');
  }, [engine]);

  const updateSettings = useCallback((settings: Partial<GameState['settings']>) => {
    engine.updateSettings(settings);
  }, [engine]);

  const getMovableCards = useCallback((position: CardPosition): Card[] => {
    return engine.getMovableCards(position);
  }, [engine]);

  const canDropAtPosition = useCallback((cards: Card[], position: CardPosition): boolean => {
    return engine.canDropAtPosition(cards, position);
  }, [engine]);

  const getCardById = useCallback((cardId: string): Card | null => {
    return engine.getCardById(cardId);
  }, [engine]);

  const canUndo = useCallback(() => {
    return engine.getStateManager().canUndo();
  }, [engine]);

  const actions = useMemo(() => ({
    moveCards,
    flipStock,
    startNewGame,
    undo,
    autoMoveToFoundation,
    selectCards,
    deselectCards,
    updateSettings,
    getMovableCards,
    canDropAtPosition,
    getCardById,
    canUndo,
    engine
  }), [
    moveCards,
    flipStock,
    startNewGame,
    undo,
    autoMoveToFoundation,
    selectCards,
    deselectCards,
    updateSettings,
    getMovableCards,
    canDropAtPosition,
    getCardById,
    canUndo,
    engine
  ]);

  return {
    state,
    timeElapsed,
    gameStarted,
    isHydrated,
    actions,
    engine
  };
} 