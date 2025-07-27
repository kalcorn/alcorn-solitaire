import { Card, CardPosition } from '@/types';

export interface EventHandlers {
  handleCardClick: (cardId: string, pileType: 'tableau' | 'foundation' | 'waste', pileIndex: number, cardIndex: number) => void;
  handleCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  getCardById: (cardId: string) => Card | null;
  getElementPosition: (selector: string) => { x: number; y: number } | null;
}

export function createEventHandlers(
  gameState: any,
  handleAutoMoveToFoundation: (card: Card) => { success: boolean },
  selectCards: (position: CardPosition, cards: Card[]) => void,
  getMovableCards: (position: CardPosition) => Card[],
  startDrag: (cards: Card[], source: CardPosition, event: React.MouseEvent | React.TouchEvent) => void,
  animateStockFlip: (card: Card, startPos: { x: number; y: number }, endPos: { x: number; y: number }, type: 'stockToWaste' | 'wasteToStock', isLandscapeMobile?: boolean) => void
): EventHandlers {
  let lastClickTime = 0;
  let lastClickedCardId: string | null = null;

  const handleCardClick = (cardId: string, pileType: 'tableau' | 'foundation' | 'waste', pileIndex: number, cardIndex: number) => {
    const currentTime = Date.now();
    const isDoubleClick = currentTime - lastClickTime < 500 && lastClickedCardId === cardId;
    
    lastClickTime = currentTime;
    lastClickedCardId = cardId;
    
    if (isDoubleClick) {
      // Double-click to auto-move to foundation
      const card = getCardById(cardId);
      if (card) {
        const result = handleAutoMoveToFoundation(card);
        if (result.success) {
          return;
        }
      }
    }
    
    // Try auto-move to foundation on single click first
    const card = getCardById(cardId);
    if (card) {
      const result = handleAutoMoveToFoundation(card);
      if (result.success) {
        return;
      }
    }
    
    // If auto-move failed, proceed with selection
    const movableCards = getMovableCards({ pileType, pileIndex, cardIndex });
    if (movableCards.length > 0) {
      selectCards({ pileType, pileIndex, cardIndex }, movableCards);
    }
  };

  const handleCardDragStart = (cardId: string, event: React.MouseEvent | React.TouchEvent) => {
    const card = getCardById(cardId);
    if (!card) return;

    // Find the card's position
    let pileType: 'tableau' | 'foundation' | 'waste' = 'waste';
    let pileIndex = 0;
    let cardIndex = -1;

    // Check tableau piles
    for (let i = 0; i < gameState.tableauPiles.length; i++) {
      const pile = gameState.tableauPiles[i];
      const foundIndex = pile.findIndex((c: Card) => c.id === cardId);
      if (foundIndex !== -1) {
        pileType = 'tableau';
        pileIndex = i;
        cardIndex = foundIndex;
        break;
      }
    }

    // Check foundation piles
    if (cardIndex === -1) {
      for (let i = 0; i < gameState.foundationPiles.length; i++) {
        const pile = gameState.foundationPiles[i];
        const foundIndex = pile.findIndex((c: Card) => c.id === cardId);
        if (foundIndex !== -1) {
          pileType = 'foundation';
          pileIndex = i;
          cardIndex = foundIndex;
          break;
        }
      }
    }

    // Check waste pile
    if (cardIndex === -1) {
      const foundIndex = gameState.wastePile.findIndex((c: Card) => c.id === cardId);
      if (foundIndex !== -1) {
        pileType = 'waste';
        pileIndex = 0;
        cardIndex = foundIndex;
      }
    }

    if (cardIndex !== -1) {
      const movableCards = getMovableCards({ pileType, pileIndex, cardIndex });
      if (movableCards.length > 0) {
        startDrag(movableCards, { pileType, pileIndex, cardIndex }, event);
      }
    }
  };

  const getCardById = (cardId: string): Card | null => {
    // Search in tableau piles
    for (const pile of gameState.tableauPiles) {
      const card = pile.find((c: Card) => c.id === cardId);
      if (card) return card;
    }

    // Search in foundation piles
    for (const pile of gameState.foundationPiles) {
      const card = pile.find((c: Card) => c.id === cardId);
      if (card) return card;
    }

    // Search in waste pile
    const wasteCard = gameState.wastePile.find((c: Card) => c.id === cardId);
    if (wasteCard) return wasteCard;

    // Search in stock pile
    const stockCard = gameState.stockPile.find((c: Card) => c.id === cardId);
    if (stockCard) return stockCard;

    return null;
  };

  const getElementPosition = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  return {
    handleCardClick,
    handleCardDragStart,
    getCardById,
    getElementPosition,
  };
} 