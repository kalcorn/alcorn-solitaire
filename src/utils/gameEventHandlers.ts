import { Card, CardPosition } from '@/types';
import { GameEngine } from '@/engine/GameEngine';

export interface GameEventHandlers {
  handleCardClick: (cardId: string, pileType: 'tableau' | 'foundation' | 'waste', pileIndex: number, cardIndex: number) => void;
  handleCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent, position?: { pileType: 'tableau'; pileIndex: number; cardIndex: number }) => void;
  getCardById: (cardId: string) => Card | null;
  getElementPosition: (selector: string) => { x: number; y: number } | null;
}

export function createGameEventHandlers(
  engine: GameEngine,
  startDrag: (cards: Card[], source: CardPosition, event: React.MouseEvent | React.TouchEvent) => void
): GameEventHandlers {
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
        const result = engine.autoMoveToFoundation(card);
        if (result.success) {
          return;
        }
      }
    }
    
    // Try auto-move to foundation on single click first
    const card = getCardById(cardId);
    if (card) {
      const result = engine.autoMoveToFoundation(card);
      if (result.success) {
        return;
      }
    }
    
    // If auto-move failed, proceed with selection
    const position: CardPosition = { pileType, pileIndex, cardIndex };
    const movableCards = engine.getMovableCards(position);
    if (movableCards.length > 0) {
      engine.selectCard(card!, position);
    }
  };

  const handleCardDragStart = (cardId: string, event: React.MouseEvent | React.TouchEvent, position?: { pileType: 'tableau'; pileIndex: number; cardIndex: number }) => {
    const card = getCardById(cardId);
    if (!card) return;

    // If position is provided (from TableauPile), use it directly for optimization
    if (position) {
      const movableCards = engine.getMovableCards(position);
      if (movableCards.length > 0) {
        startDrag(movableCards, position, event);
      }
      return;
    }

    // Find the card's position (fallback for other pile types)
    let pileType: 'tableau' | 'foundation' | 'waste' = 'waste';
    let pileIndex = 0;
    let cardIndex = -1;

    const state = engine.getState();

    // Check tableau piles
    for (let i = 0; i < state.tableauPiles.length; i++) {
      const pile = state.tableauPiles[i];
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
      for (let i = 0; i < state.foundationPiles.length; i++) {
        const pile = state.foundationPiles[i];
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
      const foundIndex = state.wastePile.findIndex((c: Card) => c.id === cardId);
      if (foundIndex !== -1) {
        pileType = 'waste';
        pileIndex = 0;
        cardIndex = foundIndex;
      }
    }

    if (cardIndex !== -1) {
      const position: CardPosition = { pileType, pileIndex, cardIndex };
      const movableCards = engine.getMovableCards(position);
      if (movableCards.length > 0) {
        startDrag(movableCards, position, event);
      }
    }
  };

  const getCardById = (cardId: string): Card | null => {
    return engine.getCardById(cardId);
  };

  const getElementPosition = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      return null;
    }
    
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