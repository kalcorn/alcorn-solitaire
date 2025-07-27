import React from 'react';
import TableauPile from '../TableauPile';
import { Card, CardPosition } from '@/types';

interface TableauSectionProps {
  tableauPiles: Card[][];
  isCardBeingDragged: (cardId: string) => boolean;
  isZoneHovered: (pileType: 'tableau', pileIndex: number) => boolean;
  onCardClick: (cardId: string, pileType: 'tableau', pileIndex: number, cardIndex: number) => void;
  onCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  startDrag: (cards: Card[], source: CardPosition, event: React.MouseEvent | React.TouchEvent) => void;
  getMovableCards: (position: CardPosition) => Card[];
}

const TableauSection: React.FC<TableauSectionProps> = ({
  tableauPiles,
  isCardBeingDragged,
  isZoneHovered,
  onCardClick,
  onCardDragStart,
  startDrag,
  getMovableCards,
}) => {
  return (
    <div className="standard-tableau desktop-tableau justify-between w-full">
      {tableauPiles.map((pile, i) => (
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
  );
};

export default TableauSection; 