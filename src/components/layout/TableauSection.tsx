import React from 'react';
import TableauPile from '../TableauPile';
import { Card, CardPosition } from '@/types';

interface TableauSectionProps {
  tableauPiles: Card[][];
  isCardBeingDragged: (cardId: string) => boolean;
  isZoneHovered: (pileType: 'tableau', pileIndex: number) => boolean;
  onCardClick: (cardId: string, pileType: 'tableau', pileIndex: number, cardIndex: number) => void;
  onCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent, position: { pileType: 'tableau'; pileIndex: number; cardIndex: number }) => void;
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
    <div className="flex flex-row justify-between w-full gap-1">
      {tableauPiles.map((pile, i) => (
        <div 
          key={i} 
          className={`flex-shrink-0 ${isZoneHovered('tableau', i) ? 'drop-zone' : ''}`}
          data-drop-zone
          data-pile-type="tableau"
          data-pile-index={i}
        >
          <TableauPile 
            index={i}
            cards={pile}
            isDropZone={isZoneHovered('tableau', i)}
            onCardClick={(cardId) => {
              const cardIndex = pile.findIndex(c => c.id === cardId);
              if (cardIndex !== -1) {
                onCardClick(cardId, 'tableau', i, cardIndex);
              }
            }}
            onCardDragStart={(cardId, event, position) => {
              const movableCards = getMovableCards(position);
              if (movableCards.length > 0) {
                startDrag(movableCards, position, event);
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