import { Card, GameState, CardPosition } from '@/types';

export class GameRules {
  /**
   * Validates if a card can be placed on a tableau pile
   */
  public static canPlaceOnTableau(card: Card, targetPile: Card[]): boolean {
    // Empty tableau pile: only Kings can be placed
    if (targetPile.length === 0) {
      return card.rank === 13; // King
    }
    
    const topCard = targetPile[targetPile.length - 1];
    
    // Must be opposite color and one rank lower
    return this.areOppositeColors(card, topCard) && card.rank === topCard.rank - 1;
  }

  /**
   * Validates if a card can be placed on a foundation pile
   */
  public static canPlaceOnFoundation(card: Card, targetPile: Card[]): boolean {
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
  public static getFoundationPileForSuit(suit: string): number {
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
  public static findValidFoundationPile(card: Card, gameState: GameState): number | null {
    const correctPileIndex = this.getFoundationPileForSuit(card.suit);
    const correctPile = gameState.foundationPiles[correctPileIndex];
    
    if (this.canPlaceOnFoundation(card, correctPile)) {
      return correctPileIndex;
    }
    
    return null;
  }

  /**
   * Validates if a sequence of cards can be moved together
   */
  public static isValidCardSequence(cards: Card[]): boolean {
    if (cards.length <= 1) return true;
    
    for (let i = 0; i < cards.length - 1; i++) {
      const currentCard = cards[i];
      const nextCard = cards[i + 1];
      
      // Must be alternating colors and descending ranks
      if (!this.areOppositeColors(currentCard, nextCard) || currentCard.rank !== nextCard.rank + 1) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Gets all cards that can be moved from a tableau pile starting from a specific card
   */
  public static getMovableCardsFromTableau(pile: Card[], startIndex: number): Card[] {
    if (startIndex < 0 || startIndex >= pile.length) return [];
    
    const movableCards = pile.slice(startIndex);
    
    // Check if the sequence is valid
    if (!this.isValidCardSequence(movableCards)) {
      return [];
    }
    
    return movableCards;
  }

  /**
   * Checks if two cards are opposite colors
   */
  public static areOppositeColors(card1: Card, card2: Card): boolean {
    const isRed1 = card1.suit === 'hearts' || card1.suit === 'diamonds';
    const isRed2 = card2.suit === 'hearts' || card2.suit === 'diamonds';
    return isRed1 !== isRed2;
  }

  /**
   * Checks if a card is red (hearts or diamonds)
   */
  public static isRedCard(card: Card): boolean {
    return card.suit === 'hearts' || card.suit === 'diamonds';
  }

  /**
   * Checks if the game is won
   */
  public static checkWinCondition(gameState: GameState): boolean {
    // Check if all foundation piles have 13 cards (Ace to King)
    return gameState.foundationPiles.every(pile => pile.length === 13);
  }

  /**
   * Calculates score for a move
   */
  public static calculateScoreForMove(from: CardPosition, to: CardPosition, cardCount: number): number {
    let score = 0;
    
    // Moving to foundation: 10 points per card
    if (to.pileType === 'foundation') {
      score += cardCount * 10;
    }
    
    // Moving from waste to tableau: 5 points per card
    if (from.pileType === 'waste' && to.pileType === 'tableau') {
      score += cardCount * 5;
    }
    
    // Moving from tableau to tableau: 5 points per card
    if (from.pileType === 'tableau' && to.pileType === 'tableau') {
      score += cardCount * 5;
    }
    
    // Moving from foundation to tableau: -15 points per card
    if (from.pileType === 'foundation' && to.pileType === 'tableau') {
      score -= cardCount * 15;
    }
    
    return score;
  }

  /**
   * Gets cards from a specific position in the game state
   */
  public static getCardsFromPosition(gameState: GameState, position: CardPosition): Card[] | null {
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
   * Updates a pile in game state immutably
   */
  public static updatePileInGameState(gameState: GameState, position: CardPosition, newPile: Card[]): void {
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
   * Updates draggable states for all cards in the game
   */
  public static updateDraggableStates(gameState: GameState): GameState {
    const newState = { ...gameState };
    
    // Update tableau piles - allow dragging from any card that's part of a valid sequence
    newState.tableauPiles = newState.tableauPiles.map(pile => 
      pile.map((card, index) => {
        // Only face-up cards can be dragged
        if (!card.faceUp) {
          return { ...card, draggable: false };
        }
        
        // Check if this card is part of a valid sequence that can be moved
        const movableCards = this.getMovableCardsFromTableau(pile, index);
        return {
          ...card,
          draggable: movableCards.length > 0
        };
      })
    );
    
    // Update foundation piles - only top card is draggable
    newState.foundationPiles = newState.foundationPiles.map(pile => 
      pile.map((card, index) => ({
        ...card,
        draggable: index === pile.length - 1
      }))
    );
    
    // Update waste pile - only top card is draggable
    newState.wastePile = newState.wastePile.map((card, index) => ({
      ...card,
      draggable: index === newState.wastePile.length - 1
    }));
    
    // Stock pile cards are never draggable
    newState.stockPile = newState.stockPile.map(card => ({
      ...card,
      draggable: false
    }));
    
    return newState;
  }
} 