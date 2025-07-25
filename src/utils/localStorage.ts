import { GameState } from '@/types';

const SETTINGS_KEY = 'solitaire-game-settings';
const GAME_STATE_KEY = 'solitaire-game-state';

/**
 * Safely access localStorage (handles SSR)
 */
const isClient = typeof window !== 'undefined';

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: GameState['settings']): void {
  if (!isClient) return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
  }
}

/**
 * Load settings from localStorage
 */
export function loadSettings(): GameState['settings'] | null {
  if (!isClient) return null;
  
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
  }
  
  return null;
}

/**
 * Save game state to localStorage
 */
export function saveGameState(gameState: GameState): void {
  if (!isClient) return;
  
  try {
    // Create a state to save including limited history for undo/redo
    const stateToSave = {
      tableauPiles: gameState.tableauPiles,
      foundationPiles: gameState.foundationPiles,
      stockPile: gameState.stockPile,
      wastePile: gameState.wastePile,
      moves: gameState.moves,
      score: gameState.score,
      isGameWon: gameState.isGameWon,
      stockCycles: gameState.stockCycles,
      settings: gameState.settings,
      stats: gameState.stats,
      history: gameState.history.slice(-10), // Save last 10 history entries
      historyIndex: Math.max(0, gameState.historyIndex - (gameState.history.length - 10)), // Adjust index
      timestamp: Date.now(),
      gameStartTime: gameState.gameStartTime || Date.now() // Store when game was started
    };
    
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
  }
}

/**
 * Load game state from localStorage
 */
export function loadGameState(): Partial<GameState> | null {
  if (!isClient) return null;
  
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Check if the saved state is not too old (optional - 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (parsed.timestamp && Date.now() - parsed.timestamp > maxAge) {
        // Clear old save
        clearGameState();
        return null;
      }
      
      return parsed;
    }
  } catch (error) {
  }
  
  return null;
}

/**
 * Clear saved game state
 */
export function clearGameState(): void {
  if (!isClient) return;
  
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
  }
}

/**
 * Clear all saved data
 */
export function clearAllSavedData(): void {
  if (!isClient) return;
  
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
  }
}