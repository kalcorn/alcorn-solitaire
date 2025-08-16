import { GameState, Card, CardPosition, MoveResult, GameHistoryEntry } from '@/types';
import { createInitialGameState } from '@/utils/gameUtils';
import { EventEmitter } from './EventEmitter';
import { GameHistory } from './GameHistory';
import { GameActions } from './GameActions';
import { StateManager } from './StateManager';

export enum GameEventType {
  STATE_CHANGED = 'state_changed',
  MOVE_EXECUTED = 'move_executed',
  STOCK_FLIPPED = 'stock_flipped',
  GAME_WON = 'game_won',
  GAME_STARTED = 'game_started',
  CARD_SELECTED = 'card_selected',
  INVALID_MOVE = 'invalid_move',
  UNDO_EXECUTED = 'undo_executed',
  NEW_GAME_STARTED = 'new_game_started'
}

export interface GameEvent {
  type: GameEventType;
  payload: any;
  timestamp: number;
}

export type EventCallback = (event: GameEvent) => void;

export class GameEngine {
  private stateManager: StateManager;
  private eventEmitter: EventEmitter;
  private history: GameHistory;
  private actions: GameActions;
  private gameStartTime?: number;

  constructor(initialState?: GameState) {
    this.stateManager = new StateManager(initialState || createInitialGameState());
    this.eventEmitter = new EventEmitter();
    this.history = new GameHistory();
    this.actions = new GameActions(this);
  }

  // Core game actions
  public moveCards(from: CardPosition, to: CardPosition, cards: Card[]): MoveResult {
    return this.actions.executeMove(from, to, cards);
  }

  public flipStock(): MoveResult {
    return this.actions.executeStockFlip();
  }

  public flipStockOnly(): MoveResult {
    return this.actions.executeStockOnly();
  }

  public addToWaste(card: Card): MoveResult {
    return this.actions.executeWasteAdd(card);
  }

  public startNewGame(seed?: number): void {
    this.actions.executeNewGame(seed);
  }

  public undo(): boolean {
    return this.actions.executeUndo();
  }

  public autoMoveToFoundation(card: Card): MoveResult {
    return this.actions.executeAutoMove(card);
  }

  public selectCard(card: Card, position: CardPosition): void {
    this.actions.executeCardSelection(card, position);
  }

  public deselectCards(): void {
    this.actions.executeCardDeselection();
  }

  public updateSettings(settings: Partial<GameState['settings']>): void {
    this.actions.executeSettingsUpdate(settings);
  }

  // State access
  public getState(): GameState {
    return this.stateManager.getState();
  }

  public getGameStartTime(): number | undefined {
    return this.gameStartTime;
  }

  public setGameStartTime(time: number): void {
    this.gameStartTime = time;
  }

  // Event system
  public subscribe(event: GameEventType, callback: EventCallback): void {
    this.eventEmitter.subscribe(event, callback);
  }

  public unsubscribe(event: GameEventType, callback: EventCallback): void {
    this.eventEmitter.unsubscribe(event, callback);
  }

  public emit(event: GameEvent): void {
    this.eventEmitter.emit(event);
  }

  // Internal access for actions
  public getStateManager(): StateManager {
    return this.stateManager;
  }

  public getHistory(): GameHistory {
    return this.history;
  }

  public getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  // Utility methods
  public getCardById(cardId: string): Card | null {
    const state = this.getState();
    
    // Search in tableau piles
    for (const pile of state.tableauPiles) {
      const card = pile.find(c => c.id === cardId);
      if (card) return card;
    }

    // Search in foundation piles
    for (const pile of state.foundationPiles) {
      const card = pile.find(c => c.id === cardId);
      if (card) return card;
    }

    // Search in waste pile
    const wasteCard = state.wastePile.find(c => c.id === cardId);
    if (wasteCard) return wasteCard;

    // Search in stock pile
    const stockCard = state.stockPile.find(c => c.id === cardId);
    if (stockCard) return stockCard;

    return null;
  }

  public getMovableCards(position: CardPosition): Card[] {
    const state = this.getState();
    let sourcePile: Card[] = [];

    switch (position.pileType) {
      case 'tableau':
        if (position.pileIndex >= 0 && position.pileIndex < state.tableauPiles.length) {
          sourcePile = state.tableauPiles[position.pileIndex];
        }
        break;
      case 'waste':
        sourcePile = state.wastePile;
        break;
      case 'foundation':
        if (position.pileIndex >= 0 && position.pileIndex < state.foundationPiles.length) {
          sourcePile = state.foundationPiles[position.pileIndex];
        }
        break;
    }

    if (position.cardIndex >= sourcePile.length) return [];
    if (position.pileType === 'tableau') return sourcePile.slice(position.cardIndex);
    return position.cardIndex === sourcePile.length - 1 ? [sourcePile[position.cardIndex]] : [];
  }

  public canDropAtPosition(cards: Card[], position: CardPosition): boolean {
    if (!cards.length) return false;
    const state = this.getState();
    const tempResult = this.actions.validateMove(state, { pileType: 'tableau', pileIndex: 0, cardIndex: 0 }, position, cards);
    return tempResult.success;
  }
} 