import { GameState } from '@/types';

const SETTINGS_KEY = 'solitaire-game-settings';
const GAME_STATE_KEY = 'solitaire-game-state';

/**
 * Safely access localStorage (handles SSR)
 */
const isClient = typeof window !== 'undefined';

/**
 * Logger for localStorage operations
 */
const logger = {
  error: (message: string, error: unknown) => {
    console.error(`[localStorage] ${message}:`, error);
  },
  warn: (message: string) => {
    console.warn(`[localStorage] ${message}`);
  }
};

/**
 * Validates if a value is a valid JSON object
 */
function isValidJSON(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}

/**
 * Safely parse JSON with validation
 */
function safeJSONParse<T>(value: string, validator?: (parsed: any) => parsed is T): T | null {
  try {
    const parsed = JSON.parse(value);
    if (validator && !validator(parsed)) {
      logger.warn('Parsed JSON failed validation');
      return null;
    }
    return parsed;
  } catch (error) {
    logger.error('Failed to parse JSON', error);
    return null;
  }
}

/**
 * Check localStorage availability and space
 */
function checkLocalStorageAvailability(): boolean {
  if (!isClient) return false;
  
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    logger.error('localStorage is not available', error);
    return false;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: GameState['settings']): boolean {
  if (!checkLocalStorageAvailability()) return false;
  
  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, serialized);
    return true;
  } catch (error) {
    logger.error('Failed to save settings', error);
    return false;
  }
}

/**
 * Settings validator
 */
function isValidSettings(parsed: any): parsed is GameState['settings'] {
  return parsed && 
         typeof parsed === 'object' &&
         typeof parsed.soundEnabled === 'boolean' &&
         typeof parsed.deckCyclingLimit === 'number' &&
         typeof parsed.drawCount === 'number' &&
         typeof parsed.autoMoveToFoundation === 'boolean' &&
         typeof parsed.showHints === 'boolean';
}

/**
 * Load settings from localStorage
 */
export function loadSettings(): GameState['settings'] | null {
  if (!checkLocalStorageAvailability()) return null;
  
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved && isValidJSON(saved)) {
      return safeJSONParse<GameState['settings']>(saved, isValidSettings);
    }
  } catch (error) {
    logger.error('Failed to load settings', error);
  }
  
  return null;
}

/**
 * Save game state to localStorage
 */
export function saveGameState(gameState: GameState): boolean {
  if (!checkLocalStorageAvailability()) return false;
  
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
    
    const serialized = JSON.stringify(stateToSave);
    
    // Check for localStorage quota
    if (serialized.length > 5 * 1024 * 1024) { // 5MB limit
      logger.warn('Game state is too large to save');
      return false;
    }
    
    localStorage.setItem(GAME_STATE_KEY, serialized);
    return true;
  } catch (error) {
    logger.error('Failed to save game state', error);
    return false;
  }
}

/**
 * Saved game state interface (includes additional fields for persistence)
 */
interface SavedGameState extends Partial<GameState> {
  timestamp?: number;
}

/**
 * Game state validator
 */
function isValidGameState(parsed: any): parsed is SavedGameState {
  return parsed && 
         typeof parsed === 'object' &&
         Array.isArray(parsed.tableauPiles) &&
         Array.isArray(parsed.foundationPiles) &&
         Array.isArray(parsed.stockPile) &&
         Array.isArray(parsed.wastePile) &&
         typeof parsed.moves === 'number' &&
         typeof parsed.score === 'number' &&
         typeof parsed.isGameWon === 'boolean';
}

/**
 * Load game state from localStorage
 */
export function loadGameState(): Partial<GameState> | null {
  if (!checkLocalStorageAvailability()) return null;
  
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    if (saved && isValidJSON(saved)) {
      const parsed = safeJSONParse<SavedGameState>(saved, isValidGameState);
      
      if (parsed) {
        // Check if the saved state is not too old (optional - 24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (parsed.timestamp && Date.now() - parsed.timestamp > maxAge) {
          // Clear old save
          logger.warn('Game state is too old, clearing');
          clearGameState();
          return null;
        }
        
        return parsed;
      }
    }
  } catch (error) {
    logger.error('Failed to load game state', error);
  }
  
  return null;
}

/**
 * Clear saved game state
 */
export function clearGameState(): boolean {
  if (!checkLocalStorageAvailability()) return false;
  
  try {
    localStorage.removeItem(GAME_STATE_KEY);
    return true;
  } catch (error) {
    logger.error('Failed to clear game state', error);
    return false;
  }
}

/**
 * Clear all saved data
 */
export function clearAllSavedData(): boolean {
  if (!checkLocalStorageAvailability()) return false;
  
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(GAME_STATE_KEY);
    return true;
  } catch (error) {
    logger.error('Failed to clear all saved data', error);
    return false;
  }
}