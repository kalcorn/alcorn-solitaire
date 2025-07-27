import React from 'react';
import StockPile from '../StockPile';
import WastePile from '../WastePile';
import FoundationPile from '../FoundationPile';
import TableauPile from '../TableauPile';
import { Card, CardPosition } from '@/types';

interface LandscapeMobileLayoutProps {
  gameState: {
    stockPile: Card[];
    wastePile: Card[];
    foundationPiles: Card[][];
    tableauPiles: Card[][];
    stockCycles: number;
    settings: {
      deckCyclingLimit: number;
    };
  };
  isShuffling: boolean;
  isWinAnimating: boolean;
  isCardBeingDragged: (cardId: string) => boolean;
  isZoneHovered: (pileType: 'tableau' | 'foundation', pileIndex: number) => boolean;
  onStockFlip: () => void;
  onCardClick: (cardId: string, pileType: 'tableau' | 'foundation' | 'waste', pileIndex: number, cardIndex: number) => void;
  onCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  startDrag: (cards: Card[], source: CardPosition, event: React.MouseEvent | React.TouchEvent) => void;
  getMovableCards: (position: CardPosition) => Card[];
}

const LandscapeMobileLayout: React.FC<LandscapeMobileLayoutProps> = ({
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
}) => {
  return (
    <div className="flex flex-row w-full h-full">
      {/* Landscape Mobile: Left Side Piles (Stock, Waste) */}
      <div className="landscape-mobile-left-sidebar bg-gradient-to-b from-emerald-900 to-green-900 bg-opacity-40 p-3 shadow-lg border border-green-700 border-opacity-30 flex flex-col">
        <div className="flex flex-col gap-2">
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
      </div>

      {/* Landscape Mobile: Center Tableau with Increased Size */}
      <div className="landscape-mobile-tableau flex-1 flex justify-center">
        <div 
          className="landscape-tableau-center justify-between w-full max-w-4xl"
          role="region"
          aria-label="Tableau piles"
        >
          {gameState.tableauPiles.map((pile, i) => (
            <div 
              key={i} 
              className={`flex-shrink-0 tableau-pile tableau-container ${isZoneHovered('tableau', i) ? 'drop-zone' : ''}`}
              data-drop-zone
              data-pile-type="tableau"
              data-pile-index={i}
            >
              <TableauPile 
                cards={pile}
                isDropZone={isZoneHovered('tableau', i)}
                onCardClick={(cardId) => {
                  const cardIndex = pile.findIndex(c => c.id === cardId);
                  if (cardIndex !== -1) {
                    onCardClick(cardId, 'tableau', i, cardIndex);
                  }
                }}
                onCardDragStart={(cardId, event) => {
                  const cardIndex = pile.findIndex(c => c.id === cardId);
                  if (cardIndex !== -1) {
                    const movableCards = getMovableCards({ pileType: 'tableau', pileIndex: i, cardIndex });
                    if (movableCards.length > 0) {
                      startDrag(movableCards, { pileType: 'tableau', pileIndex: i, cardIndex }, event);
                    }
                  }
                }}
                isCardBeingDragged={isCardBeingDragged}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Landscape Mobile: Right Side Foundation Piles */}
      <div className="landscape-mobile-right-sidebar bg-gradient-to-b from-emerald-900 to-green-900 bg-opacity-40 p-3 shadow-lg border border-green-700 border-opacity-30 flex flex-col justify-center">
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
  );
};

export default LandscapeMobileLayout; 