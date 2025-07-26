import { useEffect } from 'react';
import { createInitialGameState } from '@/utils/gameUtils';
import { loadSettings, loadGameState, clearGameState } from '@/utils/localStorage';
import { soundManager } from '@/utils/soundUtils';
import { GameState } from '@/types';

export function useGameHydration(
  isHydrated: boolean,
  setGameState: (state: GameState) => void,
  setTimeElapsed: (seconds: number) => void,
  setGameStarted: (started: boolean) => void,
  setIsHydrated: (hydrated: boolean) => void,
  saveState: (action: string, state: GameState, history: any[], historyIndex: number) => { history: any[]; historyIndex: number; }
) {
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
        initialState = createInitialGameState();
        if (savedSettings) {
          initialState.settings = { ...initialState.settings, ...savedSettings };
        }
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
  }, [isHydrated, setGameState, setTimeElapsed, setGameStarted, setIsHydrated, saveState]);
} 