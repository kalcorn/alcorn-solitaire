import { GameState, GameHistoryEntry } from '@/types';
import { GameHistory } from './GameHistory';

// Internal state without history/historyIndex (managed separately)
type InternalGameState = Omit<GameState, 'history' | 'historyIndex'>;

export class StateManager {
  private state: InternalGameState;
  private history: GameHistory;

  constructor(initialState: GameState) {
    // Extract history fields and store the rest as internal state
    const { history, historyIndex, ...internalState } = initialState;
    this.state = internalState;
    this.history = new GameHistory();
  }

  public updateState(updater: (state: GameState) => GameState, action: string = 'State update'): void {
    const newState = updater(this.getState());
    
    // Create history entry with current internal state
    const historyEntry: GameHistoryEntry = {
      state: { ...this.state },
      timestamp: Date.now(),
      action
    };
    
    this.history.addEntry(historyEntry);
    
    // Extract and store the new internal state
    const { history, historyIndex, ...newInternalState } = newState;
    this.state = newInternalState;
  }

  public getState(): GameState {
    return { 
      ...this.state, 
      history: this.history.getEntries(),
      historyIndex: this.history.getCurrentIndex()
    };
  }

  public setState(newState: GameState, action: string = 'State set'): void {
    const historyEntry: GameHistoryEntry = {
      state: { ...this.state },
      timestamp: Date.now(),
      action
    };
    
    this.history.addEntry(historyEntry);
    
    // Extract and store the new internal state
    const { history, historyIndex, ...newInternalState } = newState;
    this.state = newInternalState;
  }

  public canUndo(): boolean {
    return this.history.canUndo();
  }

  public canRedo(): boolean {
    return this.history.canRedo();
  }

  public undo(): GameState | null {
    const entry = this.history.undo();
    if (entry && entry.state) {
      this.state = { ...entry.state };
      return this.getState();
    }
    return null;
  }

  public redo(): GameState | null {
    const entry = this.history.redo();
    if (entry && entry.state) {
      this.state = { ...entry.state };
      return this.getState();
    }
    return null;
  }

  public saveState(action: string): void {
    const historyEntry: GameHistoryEntry = {
      state: { ...this.state },
      timestamp: Date.now(),
      action
    };
    this.history.addEntry(historyEntry);
  }

  public getHistory(): GameHistory {
    return this.history;
  }

  public clearHistory(): void {
    this.history.clear();
  }

  public getHistoryIndex(): number {
    return this.history.getCurrentIndex();
  }

  public getHistoryEntries(): GameHistoryEntry[] {
    return this.history.getEntries();
  }
} 