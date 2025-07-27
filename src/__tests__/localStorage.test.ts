import { saveGameState, loadGameState, clearGameState, saveSettings, loadSettings } from '@/utils/localStorage';
import { GameState } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('localStorage utils', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('gameState persistence', () => {
    const mockGameState: GameState = {
      stockPile: [],
      wastePile: [],
      foundationPiles: [[], [], [], []],
      tableauPiles: [[], [], [], [], [], [], []],
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
        showHints: true
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
      historyIndex: -1,
      gameStartTime: Date.now()
    };

    it('should save and load game state', () => {
      const result = saveGameState(mockGameState);
      expect(result).toBe(true);
      
      const loadedState = loadGameState();
      expect(loadedState).toMatchObject({
        stockPile: mockGameState.stockPile,
        wastePile: mockGameState.wastePile,
        foundationPiles: mockGameState.foundationPiles,
        tableauPiles: mockGameState.tableauPiles,
        moves: mockGameState.moves,
        score: mockGameState.score,
        isGameWon: mockGameState.isGameWon
      });
    });

    it('should return null when no game state is saved', () => {
      const loadedState = loadGameState();
      expect(loadedState).toBeNull();
    });

    it('should return null when saved game state is invalid JSON', () => {
      localStorageMock.setItem('solitaire-game-state', 'invalid-json');
      const loadedState = loadGameState();
      expect(loadedState).toBeNull();
    });

    it('should clear game state', () => {
      saveGameState(mockGameState);
      expect(loadGameState()).toBeTruthy();
      
      const result = clearGameState();
      expect(result).toBe(true);
      expect(loadGameState()).toBeNull();
    });
  });

  describe('settings persistence', () => {
    const mockSettings = {
      deckCyclingLimit: 0,
      drawCount: 1,
      autoMoveToFoundation: false,
      soundEnabled: false,
      showHints: true
    };

    it('should save and load settings', () => {
      const result = saveSettings(mockSettings);
      expect(result).toBe(true);
      
      const loadedSettings = loadSettings();
      expect(loadedSettings).toEqual(mockSettings);
    });

    it('should return null when no settings are saved', () => {
      const loadedSettings = loadSettings();
      expect(loadedSettings).toBeNull();
    });

    it('should return null when saved settings are invalid JSON', () => {
      localStorageMock.setItem('solitaire-settings', 'invalid-json');
      const loadedSettings = loadSettings();
      expect(loadedSettings).toBeNull();
    });
  });
});