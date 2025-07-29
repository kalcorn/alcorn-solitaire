import React from 'react';
import StockPile from '../StockPile';
import WastePile from '../WastePile';
import FoundationPile from '../FoundationPile';
import { Card, CardPosition } from '@/types';

interface TopPilesSectionProps {
  gameState: {
    stockPile: Card[];
    wastePile: Card[];
    foundationPiles: Card[][];
    stockCycles: number;
    settings: {
      deckCyclingLimit: number;
    };
  };
  isShuffling: boolean;
  isWinAnimating: boolean;
  isCardBeingDragged: (cardId: string) => boolean;
  isZoneHovered: (pileType: 'foundation', pileIndex: number) => boolean;
  onStockFlip: () => void;
  onCardClick: (cardId: string, pileType: 'foundation' | 'waste', pileIndex: number, cardIndex: number) => void;
  onCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  startDrag: (cards: Card[], source: CardPosition, event: React.MouseEvent | React.TouchEvent) => void;
  getMovableCards: (position: CardPosition) => Card[];
  cardVisibility?: { [cardId: string]: boolean };
}

const TopPilesSection: React.FC<TopPilesSectionProps> = ({
  gameState,
  isShuffling,
  isWinAnimating,
  isCardBeingDragged,
  isZoneHovered,
  onStockFlip,
  onCardClick,
  onCardDragStart,
  startDrag,
  getMovableCards,
  cardVisibility,
}) => {
  return (
    <div className="standard-layout w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-opacity-90 from-slate-800 via-green-900 to-slate-800 bg-opacity-90 py-4 mb-0 md:mb-4 lg:mb-6 shadow-lg border-y border-slate-600/30">
      <div className="w-full max-w-6xl mx-auto px-4 xl:px-0">
        <div 
          className="flex flex-row items-start justify-between w-full"
          role="region"
          aria-label="Stock, waste, and foundation piles"
        >
          <div className="flex flex-row items-center gap-2 md:gap-4 lg:gap-6 flex-shrink-0">
            <StockPile 
              cards={gameState.stockPile} 
              onClick={onStockFlip}
              cyclesRemaining={gameState.settings.deckCyclingLimit > 0 ? 
                Math.max(0, gameState.settings.deckCyclingLimit - gameState.stockCycles) : 
                undefined}
              canCycle={gameState.settings.deckCyclingLimit === 0 || 
                gameState.stockCycles < gameState.settings.deckCyclingLimit}
              wasteCardCount={gameState.wastePile.length}
              isShuffling={isShuffling}
            />
            <WastePile 
              cards={gameState.wastePile}
              cardVisibility={cardVisibility}
              onCardClick={(cardId) => {
                const cardIndex = gameState.wastePile.findIndex(c => c.id === cardId);
                if (cardIndex !== -1) {
                  onCardClick(cardId, 'waste', 0, cardIndex);
                }
              }}
              onCardDragStart={(cardId, event) => {
                const cardIndex = gameState.wastePile.findIndex(c => c.id === cardId);
                if (cardIndex !== -1) {
                  const movableCards = getMovableCards({ pileType: 'waste', pileIndex: 0, cardIndex });
                  if (movableCards.length > 0) {
                    startDrag(movableCards, { pileType: 'waste', pileIndex: 0, cardIndex }, event);
                  }
                }
              }}
              isCardBeingDragged={isCardBeingDragged}
            />
          </div>
          <div className="flex flex-row items-center gap-1 md:gap-2 lg:gap-3 flex-shrink-0">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                data-drop-zone
                data-pile-type="foundation"
                data-pile-index={i}
                className={`${isZoneHovered('foundation', i) ? 'drop-zone' : ''} ${isWinAnimating ? 'foundation-win-cascade' : ''}`}
              >
                <FoundationPile 
                  index={i} 
                  cards={gameState.foundationPiles[i]}
                  onCardClick={(cardId) => {
                    const cardIndex = gameState.foundationPiles[i].findIndex(c => c.id === cardId);
                    if (cardIndex !== -1) {
                      onCardClick(cardId, 'foundation', i, cardIndex);
                    }
                  }}
                  onCardDragStart={(cardId, event) => {
                    const cardIndex = gameState.foundationPiles[i].findIndex(c => c.id === cardId);
                    if (cardIndex !== -1) {
                      const movableCards = getMovableCards({ pileType: 'foundation', pileIndex: i, cardIndex });
                      if (movableCards.length > 0) {
                        startDrag(movableCards, { pileType: 'foundation', pileIndex: i, cardIndex }, event);
                      }
                    }
                  }}
                  isDropZone={isZoneHovered('foundation', i)}
                  isCardBeingDragged={isCardBeingDragged}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPilesSection; 