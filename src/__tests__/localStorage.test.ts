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
      stock: [],
      waste: [],
      foundations: [[], [], [], []],
      tableau: [[], [], [], [], [], [], []],
      isGameWon: false,
      selectedCards: [],
      selectedPileType: null,
      selectedPileIndex: null,
      settings: { soundEnabled: true },
      history: [],
      historyIndex: -1,
    };

    it('should save and load game state', () => {
      saveGameState(mockGameState);
      const loadedState = loadGameState();
      
      expect(loadedState).toEqual(mockGameState);
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
      expect(loadGameState()).toEqual(mockGameState);
      
      clearGameState();
      expect(loadGameState()).toBeNull();
    });
  });

  describe('settings persistence', () => {
    const mockSettings = { soundEnabled: false };

    it('should save and load settings', () => {
      saveSettings(mockSettings);
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