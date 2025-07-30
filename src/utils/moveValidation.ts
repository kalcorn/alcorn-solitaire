import { Card, GameState, MoveResult, CardPosition } from '@/types';
import { areOppositeColors, cloneGameState, updateDraggableStates, checkWinCondition } from './gameUtils';

/**
 * Helper function to update a pile in game state immutably
 */
function updatePileInGameState(gameState: GameState, position: CardPosition, newPile: Card[]): void {
  switch (position.pileType) {
    case 'tableau':
      gameState.tableauPiles[position.pileIndex] = newPile;
      break;
    case 'foundation':
      gameState.foundationPiles[position.pileIndex] = newPile;
      break;
    case 'waste':
      gameState.wastePile = newPile;
      break;
    case 'stock':
      gameState.stockPile = newPile;
      break;
  }
}

/**
 * Validates if a card can be placed on a tableau pile
 */
export function canPlaceOnTableau(card: Card, targetPile: Card[]): boolean {
  // Empty tableau pile: only Kings can be placed
  if (targetPile.length === 0) {
    return card.rank === 13; // King
  }
  
  const topCard = targetPile[targetPile.length - 1];
  
  // Must be opposite color and one rank lower
  return areOppositeColors(card, topCard) && card.rank === topCard.rank - 1;
}

/**
 * Validates if a card can be placed on a foundation pile
 */
export function canPlaceOnFoundation(card: Card, targetPile: Card[]): boolean {
  // Empty foundation pile: only Aces can be placed
  if (targetPile.length === 0) {
    return card.rank === 1; // Ace
  }
  
  const topCard = targetPile[targetPile.length - 1];
  
  // Must be same suit and one rank higher
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
}

/**
 * Gets the correct foundation pile index for a card's suit
 */
export function getFoundationPileForSuit(suit: string): number {
  const suitMap: { [key: string]: number } = {
    'hearts': 0,
    'diamonds': 1, 
    'clubs': 2,
    'spades': 3
  };
  return suitMap[suit] ?? 0;
}

/**
 * Finds the correct foundation pile where a card can be placed
 */
export function findValidFoundationPile(card: Card, gameState: GameState): number | null {
  const correctPileIndex = getFoundationPileForSuit(card.suit);
  const correctPile = gameState.foundationPiles[correctPileIndex];
  
  if (canPlaceOnFoundation(card, correctPile)) {
    return correctPileIndex;
  }
  
  return null;
}

/**
 * Validates if a sequence of cards can be moved together
 */
export function isValidCardSequence(cards: Card[]): boolean {
  if (cards.length <= 1) return true;
  
  for (let i = 0; i < cards.length - 1; i++) {
    const currentCard = cards[i];
    const nextCard = cards[i + 1];
    
    // Must be alternating colors and descending ranks
    if (!areOppositeColors(currentCard, nextCard) || currentCard.rank !== nextCard.rank + 1) {
      return false;
    }
  }
  
  return true;
}

/**
 * Gets all cards that can be moved from a tableau pile starting from a specific card
 */
export function getMovableCardsFromTableau(pile: Card[], startIndex: number): Card[] {
  if (startIndex >= pile.length || !pile[startIndex].faceUp) {
    return [];
  }
  
  const movableCards = pile.slice(startIndex);
  
  // Validate the sequence
  if (!isValidCardSequence(movableCards)) {
    return [];
  }
  
  return movableCards;
}

/**
 * Validates move based on destination type
 */
function validateMoveByDestination(card: Card, to: CardPosition, gameState: GameState): MoveResult {
  switch (to.pileType) {
    case 'tableau':
      if (to.pileIndex < 0 || to.pileIndex >= gameState.tableauPiles.length) {
        return { success: false, error: 'Invalid tableau pile index' };
      }
      if (!canPlaceOnTableau(card, gameState.tableauPiles[to.pileIndex])) {
        return { success: false, error: 'Cannot place card on this tableau pile' };
      }
      break;
      
    case 'foundation':
      // Automatically find the correct foundation pile for this card's suit
      const correctFoundationIndex = findValidFoundationPile(card, gameState);
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
 * Gets cards from a specific position
 */
function getCardsFromPosition(gameState: GameState, position: CardPosition): Card[] | null {
  switch (position.pileType) {
    case 'tableau':
      if (position.pileIndex >= 0 && position.pileIndex < gameState.tableauPiles.length) {
        return gameState.tableauPiles[position.pileIndex];
      }
      break;
      
    case 'foundation':
      if (position.pileIndex >= 0 && position.pileIndex < gameState.foundationPiles.length) {
        return gameState.foundationPiles[position.pileIndex];
      }
      break;
      
    case 'waste':
      return gameState.wastePile;
      
    case 'stock':
      return gameState.stockPile;
  }
  
  return null;
}

/**
 * Executes the actual move on the game state
 */
function executeMoveOnState(
  gameState: GameState,
  from: CardPosition,
  to: CardPosition,
  cards: Card[]
): MoveResult {
  // Remove cards from source
  const sourcePile = getCardsFromPosition(gameState, from);
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
  updatePileInGameState(gameState, from, newSourcePile);
  
  // Add cards to destination immutably
  const targetPile = getCardsFromPosition(gameState, to);
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
  updatePileInGameState(gameState, to, newTargetPile);
  
  return { success: true };
}

/**
 * Calculates score for a move
 */
function calculateScoreForMove(from: CardPosition, to: CardPosition, cardCount: number): number {
  let score = 0;
  
  // Points for moving to foundation
  if (to.pileType === 'foundation') {
    score += 10;
  }
  
  // Points for moving from waste to tableau
  if (from.pileType === 'waste' && to.pileType === 'tableau') {
    score += 5;
  }
  
  // Points for flipping a card (handled elsewhere)
  // Points for multiple cards moved
  if (cardCount > 1) {
    score += cardCount - 1;
  }
  
  return score;
}

/**
 * Moves one card from waste pile to stock pile (for shuffle animation)
 */
export function moveOneCardWasteToStock(gameState: GameState): MoveResult {
  const newState = cloneGameState(gameState);
  
  try {
    if (newState.wastePile.length === 0) {
      return { success: false, error: 'No cards in waste pile to move' };
    }
    
    // Remove top card from waste pile
    const topCard = newState.wastePile.pop();
    if (!topCard) {
      return { success: false, error: 'Failed to remove card from waste pile' };
    }
    
    // Add card to stock pile (face down)
    newState.stockPile.push({
      ...topCard,
      faceUp: false,
      draggable: false
    });
    
    // Update draggable states
    const finalState = updateDraggableStates(newState);
    
    return { success: true, newGameState: finalState };
    
  } catch (error) {
    return { success: false, error: `Single card move failed: ${error}` };
  }
}

/**
 * Handles stock pile flip (deal 3 cards to waste)
 */
export function flipStock(gameState: GameState): MoveResult {
  const newState = cloneGameState(gameState);
  
  try {
    // If stock is empty, flip waste back to stock
    if (newState.stockPile.length === 0) {
      if (newState.wastePile.length === 0) {
        return { success: false, error: 'Both stock and waste piles are empty' };
      }
      
      // Check if we've reached the cycling limit
      if (newState.settings.deckCyclingLimit > 0 && 
          newState.stockCycles >= newState.settings.deckCyclingLimit) {
        return { success: false, error: 'Deck cycling limit reached' };
      }
      
      // Move all waste cards back to stock (face down)
      const cardsToMove = newState.wastePile.reverse().map(card => ({
        ...card,
        faceUp: false,
        draggable: false
      }));
      
      newState.stockPile = cardsToMove;
      newState.wastePile = [];
      newState.stockCycles++;
      newState.moves++;
      
    } else {
      // Deal one card from stock to waste
      const cardsToDeal = Math.min(1, newState.stockPile.length);
      const dealtCards = newState.stockPile.splice(-cardsToDeal, cardsToDeal).map(card => ({
        ...card,
        faceUp: true,
        draggable: false // Only top card will be draggable
      }));
      
      newState.wastePile.push(...dealtCards);
      newState.moves++;
    }
    
    // Update draggable states
    const finalState = updateDraggableStates(newState);
    
    return { success: true, newGameState: finalState };
    
  } catch (error) {
    return { success: false, error: `Stock flip failed: ${error}` };
  }
}

/**
 * Auto-moves a card to foundation if possible
 */
export function autoMoveToFoundation(gameState: GameState, card: Card): MoveResult {
  const newState = cloneGameState(gameState);
  
  // Find which foundation pile this card can go to
  let targetFoundationIndex = -1;
  for (let i = 0; i < newState.foundationPiles.length; i++) {
    if (canPlaceOnFoundation(card, newState.foundationPiles[i])) {
      targetFoundationIndex = i;
      break;
    }
  }
  
  if (targetFoundationIndex === -1) {
    return { success: false, error: 'Card cannot be moved to any foundation pile' };
  }
  
  // Find the card's current position
  let sourcePosition: CardPosition | null = null;
  
  // Check waste pile
  if (newState.wastePile.length > 0 && 
      newState.wastePile[newState.wastePile.length - 1].id === card.id) {
    sourcePosition = {
      pileType: 'waste',
      pileIndex: 0,
      cardIndex: newState.wastePile.length - 1
    };
  }
  
  // Check tableau piles
  if (!sourcePosition) {
    for (let i = 0; i < newState.tableauPiles.length; i++) {
      const pile = newState.tableauPiles[i];
      if (pile.length > 0 && pile[pile.length - 1].id === card.id) {
        sourcePosition = {
          pileType: 'tableau',
          pileIndex: i,
          cardIndex: pile.length - 1
        };
        break;
      }
    }
  }
  
  if (!sourcePosition) {
    return { success: false, error: 'Card not found in movable position' };
  }
  
  // Execute the move
  const targetPosition: CardPosition = {
    pileType: 'foundation',
    pileIndex: targetFoundationIndex,
    cardIndex: 0
  };
  
  return validateAndExecuteMove(newState, sourcePosition, targetPosition, [card]);
}

function validateMoveInput(cards: Card[]): MoveResult | null {
  if (!cards || cards.length === 0) {
    return { success: false, error: 'No cards to move' };
  }
  return null;
}

function validateSource(gameState: GameState, from: CardPosition): Card[] | null {
  return getCardsFromPosition(gameState, from);
}

function validateCardsToMove(sourceCards: Card[], from: CardPosition, cards: Card[]): MoveResult | Card[] {
  const cardsToMove = sourceCards.slice(from.cardIndex);
  if (cardsToMove.length !== cards.length ||
      !cardsToMove.every((card, index) => card.id === cards[index].id)) {
    return { success: false, error: 'Card mismatch' };
  }
  return cardsToMove;
}

function validateDestination(gameState: GameState, to: CardPosition, card: Card): MoveResult {
  const targetPile = getCardsFromPosition(gameState, { ...to, cardIndex: 0 });
  if (!targetPile && to.pileType !== 'tableau' && to.pileType !== 'foundation') {
    return { success: false, error: 'Invalid destination' };
  }
  return validateMoveByDestination(card, to, gameState);
}

function executeMoveAndUpdateState(gameState: GameState, from: CardPosition, to: CardPosition, cardsToMove: Card[]): MoveResult {
  const executionResult = executeMoveOnState(gameState, from, to, cardsToMove);
  if (!executionResult.success) {
    return executionResult;
  }
  // Update game state
  gameState.moves++;
  gameState.score += calculateScoreForMove(from, to, cardsToMove.length);
  gameState.isGameWon = checkWinCondition(gameState);
  return { success: true, newGameState: gameState };
}

function finalizeMoveState(gameState: GameState): GameState {
  const finalState = updateDraggableStates(gameState);
  finalState.selectedCards = [];
  finalState.selectedPileType = null;
  finalState.selectedPileIndex = null;
  return finalState;
}

export function validateAndExecuteMove(
  gameState: GameState,
  from: CardPosition,
  to: CardPosition,
  cards: Card[]
): MoveResult {
  // Input validation
  const inputError = validateMoveInput(cards);
  if (inputError) return inputError;

  // Clone game state to avoid mutations
  const newState = cloneGameState(gameState);

  try {
    // Validate source pile and get cards
    const sourceCards = validateSource(newState, from);
    if (!sourceCards) {
      return { success: false, error: 'Invalid source position' };
    }

    // Validate that the cards to move match the source
    const cardsToMoveOrError = validateCardsToMove(sourceCards, from, cards);
    if ('success' in cardsToMoveOrError && !cardsToMoveOrError.success) {
      return cardsToMoveOrError;
    }
    const cardsToMove = cardsToMoveOrError as Card[];

    // Validate destination
    const destValidation = validateDestination(newState, to, cards[0]);
    if (!destValidation.success) {
      return destValidation;
    }

    // Execute the move and update state
    const execResult = executeMoveAndUpdateState(newState, from, to, cardsToMove);
    if (!execResult.success) {
      return execResult;
    }

    // Finalize state
    const finalState = finalizeMoveState(execResult.newGameState!);
    return { success: true, newGameState: finalState };
  } catch (error) {
    return { success: false, error: `Move execution failed: ${error}` };
  }
}