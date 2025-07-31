import { GameHistoryEntry, GameState } from '@/types';

export class GameHistory {
  private entries: GameHistoryEntry[] = [];
  private currentIndex: number = -1;
  private maxEntries: number = 100;

  public addEntry(entry: GameHistoryEntry): void {
    // Remove any entries after current index (for redo)
    this.entries = this.entries.slice(0, this.currentIndex + 1);
    
    // Add new entry
    this.entries.push(entry);
    this.currentIndex++;
    
    // Maintain max entries limit
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
      this.currentIndex--;
    }
  }

  public undo(): GameHistoryEntry | null {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.entries[this.currentIndex];
    }
    return null;
  }

  public redo(): GameHistoryEntry | null {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.entries[this.currentIndex];
    }
    return null;
  }

  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.entries.length - 1;
  }

  public getCurrentEntry(): GameHistoryEntry | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.entries.length) {
      return this.entries[this.currentIndex];
    }
    return null;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getEntries(): GameHistoryEntry[] {
    return [...this.entries];
  }

  public clear(): void {
    this.entries = [];
    this.currentIndex = -1;
  }

  public setMaxEntries(max: number): void {
    this.maxEntries = max;
    // Trim if necessary
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
      this.currentIndex = Math.min(this.currentIndex, this.entries.length - 1);
    }
  }

  public getMaxEntries(): number {
    return this.maxEntries;
  }
} 