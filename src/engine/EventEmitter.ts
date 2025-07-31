import { GameEventType, GameEvent, EventCallback } from './GameEngine';

export class EventEmitter {
  private listeners: Map<GameEventType, EventCallback[]> = new Map();

  public subscribe(event: GameEventType, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public unsubscribe(event: GameEventType, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit(event: GameEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }

  public getListenerCount(event: GameEventType): number {
    return this.listeners.get(event)?.length || 0;
  }
} 