import { GameState, GameHistoryEntry } from '@/types';
import { GameHistory } from './GameHistory';

export class StateManager {
  private state: GameState;
  private history: GameHistory;

  constructor(initialState: GameState) {
    this.state = initialState;
    this.history = new GameHistory();
  }

  public updateState(updater: (state: GameState) => GameState, action: string = 'State update'): void {
    const newState = updater({ ...this.state });
    
    // Create history entry
    const historyEntry: GameHistoryEntry = {
      state: { ...this.state },
      timestamp: Date.now(),
      action
    };
    
    this.history.addEntry(historyEntry);
    this.state = newState;
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public setState(newState: GameState, action: string = 'State set'): void {
    const historyEntry: GameHistoryEntry = {
      state: { ...this.state },
      timestamp: Date.now(),
      action
    };
    
    this.history.addEntry(historyEntry);
    this.state = { ...newState };
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