import React from 'react';
import { GameState, Card as CardType, CardPosition } from '@/types';
import StockPile from '../StockPile';
import WastePile from '../WastePile';
import FoundationPile from '../FoundationPile';
import TableauSection from './TableauSection';

interface MobileLayoutProps {
  gameState: GameState;
  isShuffling: boolean;
  isWinAnimating: boolean;
  isCardBeingDragged: (cardId: string) => boolean;
  isZoneHovered: (pileType: "tableau" | "foundation", pileIndex: number) => boolean;
  onStockFlip: () => void;
  onCardClick: (cardId: string, pileType: "tableau" | "foundation" | "waste", pileIndex: number, cardIndex: number) => void;
  onCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  startDrag: (cards: CardType[], position: CardPosition, event: React.MouseEvent | React.TouchEvent) => void;
  getMovableCards: (position: CardPosition) => CardType[];
  cardVisibility?: { [cardId: string]: boolean };
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
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
  cardVisibility
}) => {
  return (
    <div className="block md:hidden w-full">
      {/* Portrait Mobile Layout */}
      <div className="flex flex-col gap-4 w-full">
        {/* Mobile Top Piles Section - Full Width */}
        <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-opacity-90 py-3 shadow-lg border-y border-slate-600/30">
          <div className="flex flex-row items-center justify-between w-full px-4">
            <div className="flex flex-row items-center gap-3">
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
                isShuffling={isShuffling}
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
            <div className="flex flex-row items-center gap-2">
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
        
        {/* Mobile Tableau Section */}
        <div className="px-4">
          <TableauSection
            tableauPiles={gameState.tableauPiles}
            isCardBeingDragged={isCardBeingDragged}
            isZoneHovered={isZoneHovered}
            onCardClick={onCardClick}
            onCardDragStart={onCardDragStart}
            startDrag={startDrag}
            getMovableCards={getMovableCards}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;