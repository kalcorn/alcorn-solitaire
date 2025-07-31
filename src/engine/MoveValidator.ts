import { Card, GameState, CardPosition, MoveResult } from '@/types';
import { GameRules } from './GameRules';

export interface ValidationResult {
  success: boolean;
  error?: string;
  newGameState?: GameState;
}

export class MoveValidator {
  /**
   * Validates and executes a move
   */
  public static validateAndExecuteMove(
    gameState: GameState,
    from: CardPosition,
    to: CardPosition,
    cards: Card[]
  ): MoveResult {
    // Input validation
    const inputError = this.validateMoveInput(cards);
    if (inputError) return inputError;

    // Clone game state to avoid mutations
    const newState = { ...gameState };

    try {
      // Validate source pile and get cards
      const sourceCards = this.validateSource(newState, from);
      if (!sourceCards) {
        return { success: false, error: 'Invalid source pile' };
      }

      // Validate cards to move
      const cardsToMove = this.validateCardsToMove(sourceCards, from, cards);
      if (!cardsToMove || 'success' in cardsToMove) {
        return cardsToMove as MoveResult;
      }

      // Validate destination
      const destinationValidation = this.validateDestination(newState, to, cardsToMove[0]);
      if (!destinationValidation.success) {
        return destinationValidation;
      }

      // Execute move
      const executionResult = this.executeMoveAndUpdateState(newState, from, to, cardsToMove);
      if (!executionResult.success) {
        return executionResult;
      }

      // Finalize state
      const finalState = this.finalizeMoveState(newState);
      return { success: true, newGameState: finalState };
    } catch (error) {
      return { success: false, error: 'Unexpected error during move execution' };
    }
  }

  /**
   * Validates move input
   */
  private static validateMoveInput(cards: Card[]): MoveResult | null {
    if (!cards || cards.length === 0) {
      return { success: false, error: 'No cards to move' };
    }

    if (!GameRules.isValidCardSequence(cards)) {
      return { success: false, error: 'Invalid card sequence' };
    }

    return null;
  }

  /**
   * Validates source pile
   */
  private static validateSource(gameState: GameState, from: CardPosition): Card[] | null {
    return GameRules.getCardsFromPosition(gameState, from);
  }

  /**
   * Validates cards to move
   */
  private static validateCardsToMove(sourceCards: Card[], from: CardPosition, cards: Card[]): MoveResult | Card[] {
    const cardsToMove = sourceCards.slice(from.cardIndex);
    if (cardsToMove.length !== cards.length ||
        !cardsToMove.every((card, index) => card.id === cards[index].id)) {
      return { success: false, error: 'Card mismatch' };
    }
    return cardsToMove;
  }

  /**
   * Validates destination
   */
  private static validateDestination(gameState: GameState, to: CardPosition, card: Card): MoveResult {
    const targetPile = GameRules.getCardsFromPosition(gameState, { ...to, cardIndex: 0 });
    if (!targetPile && to.pileType !== 'tableau' && to.pileType !== 'foundation') {
      return { success: false, error: 'Invalid destination' };
    }
    return this.validateMoveByDestination(card, to, gameState);
  }

  /**
   * Validates move based on destination type
   */
  private static validateMoveByDestination(card: Card, to: CardPosition, gameState: GameState): MoveResult {
    switch (to.pileType) {
      case 'tableau':
        if (to.pileIndex < 0 || to.pileIndex >= gameState.tableauPiles.length) {
          return { success: false, error: 'Invalid tableau pile index' };
        }
        if (!GameRules.canPlaceOnTableau(card, gameState.tableauPiles[to.pileIndex])) {
          return { success: false, error: 'Cannot place card on this tableau pile' };
        }
        break;
        
      case 'foundation':
        // Automatically find the correct foundation pile for this card's suit
        const correctFoundationIndex = GameRules.findValidFoundationPile(card, gameState);
        if (correctFoundationIndex === null) {
          return { success: false, error: 'Cannot place card on foundation pile' };
        }
        // Update the target to point to the correct foundation pile
        to.pileIndex = correctFoundationIndex;
        break;
        
      default:
        return { success: false, error: 'Invalid destination pile type' };
    }
    
    return { success: true };
  }

  /**
   * Executes the actual move on the game state
   */
  private static executeMoveOnState(
    gameState: GameState,
    from: CardPosition,
    to: CardPosition,
    cards: Card[]
  ): MoveResult {
    // Remove cards from source
    const sourcePile = GameRules.getCardsFromPosition(gameState, from);
    if (!sourcePile) {
      return { success: false, error: 'Source pile not found' };
    }
    
    // Validate that we're removing from the end of the pile
    if (from.cardIndex + cards.length !== sourcePile.length) {
      return { success: false, error: 'Can only move cards from the end of a pile' };
    }
    
    // Create immutable updates instead of mutations
    const newSourcePile = sourcePile.slice(0, from.cardIndex);
    
    // Flip the newly exposed card if it exists and is face down
    if (from.pileType === 'tableau' && newSourcePile.length > 0) {
      const newTopCardIndex = newSourcePile.length - 1;
      const newTopCard = newSourcePile[newTopCardIndex];
      if (!newTopCard.faceUp) {
        newSourcePile[newTopCardIndex] = {
          ...newTopCard,
          faceUp: true,
          draggable: true
        };
      }
    }
    
    // Update source pile in game state immutably
    GameRules.updatePileInGameState(gameState, from, newSourcePile);
    
    // Add cards to destination immutably
    const targetPile = GameRules.getCardsFromPosition(gameState, to);
    if (!targetPile) {
      return { success: false, error: 'Target pile not found' };
    }
    
    // Update card properties for destination
    const cardsToAdd = cards.map(card => ({
      ...card,
      faceUp: true,
      draggable: false // Will be updated by updateDraggableStates
    }));
    
    const newTargetPile = [...targetPile, ...cardsToAdd];
    GameRules.updatePileInGameState(gameState, to, newTargetPile);
    
    return { success: true };
  }

  /**
   * Executes move and updates game state
   */
  private static executeMoveAndUpdateState(gameState: GameState, from: CardPosition, to: CardPosition, cardsToMove: Card[]): MoveResult {
    const executionResult = this.executeMoveOnState(gameState, from, to, cardsToMove);
    if (!executionResult.success) {
      return executionResult;
    }
    
    // Update game state
    gameState.moves++;
    gameState.score += GameRules.calculateScoreForMove(from, to, cardsToMove.length);
    gameState.isGameWon = GameRules.checkWinCondition(gameState);
    
    return { success: true, newGameState: gameState };
  }

  /**
   * Finalizes move state
   */
  private static finalizeMoveState(gameState: GameState): GameState {
    const finalState = GameRules.updateDraggableStates(gameState);
    finalState.selectedCards = [];
    finalState.selectedPileType = null;
    finalState.selectedPileIndex = null;
    return finalState;
  }

  /**
   * Validates a move without executing it
   */
  public static validateMove(
    gameState: GameState,
    from: CardPosition,
    to: CardPosition,
    cards: Card[]
  ): ValidationResult {
    const inputError = this.validateMoveInput(cards);
    if (inputError) return { success: false, error: inputError.error };

    const sourceCards = this.validateSource(gameState, from);
    if (!sourceCards) {
      return { success: false, error: 'Invalid source pile' };
    }

    const cardsToMove = this.validateCardsToMove(sourceCards, from, cards);
    if (!cardsToMove || 'success' in cardsToMove) {
      return { success: false, error: (cardsToMove as MoveResult).error };
    }

    const destinationValidation = this.validateDestination(gameState, to, cardsToMove[0]);
    if (!destinationValidation.success) {
      return { success: false, error: destinationValidation.error };
    }

    return { success: true };
  }

  /**
   * Finds valid moves for a card
   */
  public static findValidMoves(gameState: GameState, card: Card): CardPosition[] {
    const validMoves: CardPosition[] = [];

    // Check tableau piles
    gameState.tableauPiles.forEach((pile, index) => {
      if (GameRules.canPlaceOnTableau(card, pile)) {
        validMoves.push({ pileType: 'tableau', pileIndex: index, cardIndex: pile.length });
      }
    });

    // Check foundation piles
    const foundationIndex = GameRules.findValidFoundationPile(card, gameState);
    if (foundationIndex !== null) {
      validMoves.push({ pileType: 'foundation', pileIndex: foundationIndex, cardIndex: gameState.foundationPiles[foundationIndex].length });
    }

    return validMoves;
  }

  /**
   * Finds auto-move target for a card
   */
  public static findAutoMoveTarget(gameState: GameState, card: Card): CardPosition | null {
    if (!gameState.settings.autoMoveToFoundation) {
      return null;
    }

    const foundationIndex = GameRules.findValidFoundationPile(card, gameState);
    if (foundationIndex !== null) {
      return { pileType: 'foundation', pileIndex: foundationIndex, cardIndex: gameState.foundationPiles[foundationIndex].length };
    }

    return null;
  }
} 