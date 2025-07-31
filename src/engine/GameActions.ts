import { Card, GameState, CardPosition, MoveResult } from '@/types';
import { GameEngine, GameEventType, GameEvent } from './GameEngine';
import { MoveValidator } from './MoveValidator';
import { GameRules } from './GameRules';
import { createInitialGameState } from '@/utils/gameUtils';

export class GameActions {
  constructor(private engine: GameEngine) {}

  /**
   * Executes a card move
   */
  public executeMove(from: CardPosition, to: CardPosition, cards: Card[]): MoveResult {
    const currentState = this.engine.getState();
    const result = MoveValidator.validateAndExecuteMove(currentState, from, to, cards);

    if (result.success && result.newGameState) {
      this.engine.getStateManager().setState(result.newGameState, `Move from ${from.pileType} to ${to.pileType}`);
      
      // Emit events
      this.engine.emit({
        type: GameEventType.MOVE_EXECUTED,
        payload: { from, to, cards, result },
        timestamp: Date.now()
      });

      if (result.newGameState.isGameWon) {
        this.engine.emit({
          type: GameEventType.GAME_WON,
          payload: { state: result.newGameState },
          timestamp: Date.now()
        });
      }

      this.engine.emit({
        type: GameEventType.STATE_CHANGED,
        payload: { state: result.newGameState },
        timestamp: Date.now()
      });
    } else {
      this.engine.emit({
        type: GameEventType.INVALID_MOVE,
        payload: { from, to, cards, error: result.error },
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Executes stock flip
   */
  public executeStockFlip(): MoveResult {
    const currentState = this.engine.getState();
    
    // Check if we need to recycle waste to stock
    if (currentState.stockPile.length === 0) {
      if (currentState.wastePile.length === 0) {
        return { success: false, error: 'No cards to flip' };
      }

      // Check cycling limit
      if (currentState.settings.deckCyclingLimit > 0 && 
          currentState.stockCycles >= currentState.settings.deckCyclingLimit) {
        return { success: false, error: 'Deck cycling limit reached' };
      }

      // Recycle waste to stock
      const newState = { ...currentState };
      newState.stockPile = [...currentState.wastePile].reverse().map(card => ({
        ...card,
        faceUp: false,
        draggable: false
      }));
      newState.wastePile = [];
      newState.stockCycles++;

      this.engine.getStateManager().setState(newState, 'Recycle waste to stock');
      
      this.engine.emit({
        type: GameEventType.STOCK_FLIPPED,
        payload: { action: 'recycle', state: newState },
        timestamp: Date.now()
      });
    } else {
      // Flip cards from stock to waste
      const drawCount = currentState.settings.drawCount;
      const cardsToFlip = Math.min(drawCount, currentState.stockPile.length);
      
      if (cardsToFlip === 0) {
        return { success: false, error: 'No cards to flip' };
      }

      const newState = { ...currentState };
      const flippedCards = newState.stockPile.slice(-cardsToFlip).map(card => ({
        ...card,
        faceUp: true,
        draggable: true
      }));

      newState.stockPile = newState.stockPile.slice(0, -cardsToFlip);
      newState.wastePile = [...newState.wastePile, ...flippedCards];

      this.engine.getStateManager().setState(newState, 'Flip stock cards');
      
      this.engine.emit({
        type: GameEventType.STOCK_FLIPPED,
        payload: { action: 'flip', cards: flippedCards, state: newState },
        timestamp: Date.now()
      });
    }

    this.engine.emit({
      type: GameEventType.STATE_CHANGED,
      payload: { state: this.engine.getState() },
      timestamp: Date.now()
    });

    return { success: true, newGameState: this.engine.getState() };
  }

  /**
   * Executes new game
   */
  public executeNewGame(seed?: number): void {
    const randomSeed = seed || Math.floor(Math.random() * 1000000);
    const newState = createInitialGameState(randomSeed);
    newState.gameStartTime = Date.now();
    
    this.engine.setGameStartTime(newState.gameStartTime);
    this.engine.getStateManager().clearHistory();
    this.engine.getStateManager().setState(newState, 'New game');
    
    this.engine.emit({
      type: GameEventType.NEW_GAME_STARTED,
      payload: { state: newState, seed: randomSeed },
      timestamp: Date.now()
    });

    this.engine.emit({
      type: GameEventType.STATE_CHANGED,
      payload: { state: newState },
      timestamp: Date.now()
    });
  }

  /**
   * Executes undo
   */
  public executeUndo(): boolean {
    const previousState = this.engine.getStateManager().undo();
    if (previousState) {
      this.engine.emit({
        type: GameEventType.UNDO_EXECUTED,
        payload: { state: previousState },
        timestamp: Date.now()
      });

      this.engine.emit({
        type: GameEventType.STATE_CHANGED,
        payload: { state: previousState },
        timestamp: Date.now()
      });

      return true;
    }
    return false;
  }

  /**
   * Executes auto move to foundation
   */
  public executeAutoMove(card: Card): MoveResult {
    const currentState = this.engine.getState();
    const targetPosition = MoveValidator.findAutoMoveTarget(currentState, card);
    
    if (!targetPosition) {
      return { success: false, error: 'No valid foundation move available' };
    }

    // Find the card's current position
    const cardPosition = this.findCardPosition(card);
    if (!cardPosition) {
      return { success: false, error: 'Card not found in game state' };
    }

    return this.executeMove(cardPosition, targetPosition, [card]);
  }

  /**
   * Executes card selection
   */
  public executeCardSelection(card: Card, position: CardPosition): void {
    const movableCards = this.engine.getMovableCards(position);
    
    this.engine.getStateManager().updateState(state => ({
      ...state,
      selectedCards: movableCards,
      selectedPileType: position.pileType,
      selectedPileIndex: position.pileIndex
    }), 'Select cards');

    this.engine.emit({
      type: GameEventType.CARD_SELECTED,
      payload: { card, position, selectedCards: movableCards },
      timestamp: Date.now()
    });
  }

  /**
   * Executes card deselection
   */
  public executeCardDeselection(): void {
    this.engine.getStateManager().updateState(state => ({
      ...state,
      selectedCards: [],
      selectedPileType: null,
      selectedPileIndex: null
    }), 'Deselect cards');
  }

  /**
   * Executes settings update
   */
  public executeSettingsUpdate(settings: Partial<GameState['settings']>): void {
    this.engine.getStateManager().updateState(state => ({
      ...state,
      settings: { ...state.settings, ...settings }
    }), 'Update settings');

    this.engine.emit({
      type: GameEventType.STATE_CHANGED,
      payload: { state: this.engine.getState() },
      timestamp: Date.now()
    });
  }

  /**
   * Validates a move without executing it
   */
  public validateMove(
    gameState: GameState,
    from: CardPosition,
    to: CardPosition,
    cards: Card[]
  ): MoveResult {
    return MoveValidator.validateMove(gameState, from, to, cards);
  }

  /**
   * Finds card position in game state
   */
  private findCardPosition(card: Card): CardPosition | null {
    const state = this.engine.getState();
    
    // Search in tableau piles
    for (let i = 0; i < state.tableauPiles.length; i++) {
      const pile = state.tableauPiles[i];
      const cardIndex = pile.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        return { pileType: 'tableau', pileIndex: i, cardIndex };
      }
    }

    // Search in foundation piles
    for (let i = 0; i < state.foundationPiles.length; i++) {
      const pile = state.foundationPiles[i];
      const cardIndex = pile.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        return { pileType: 'foundation', pileIndex: i, cardIndex };
      }
    }

    // Search in waste pile
    const wasteIndex = state.wastePile.findIndex(c => c.id === card.id);
    if (wasteIndex !== -1) {
      return { pileType: 'waste', pileIndex: 0, cardIndex: wasteIndex };
    }

    // Search in stock pile
    const stockIndex = state.stockPile.findIndex(c => c.id === card.id);
    if (stockIndex !== -1) {
      return { pileType: 'stock', pileIndex: 0, cardIndex: stockIndex };
    }

    return null;
  }
} 