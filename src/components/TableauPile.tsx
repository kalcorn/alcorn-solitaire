import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface TableauPileProps {
  cards: CardType[];
  onCardClick?: (cardId: string) => void;
  onCardDragStart?: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  isDropZone?: boolean;
  isCardBeingDragged?: (cardId: string) => boolean;
}

const TableauPile: React.FC<TableauPileProps> = ({ cards, onCardClick, onCardDragStart, isDropZone, isCardBeingDragged }) => (
  <div className={`tableau-pile relative ${isDropZone ? 'drop-zone-active' : ''}`} role="list" aria-label="Play pile">
    {cards.map((card, index) => (
      <div
        key={card.id}
        className="tableau-card-position"
        style={{ '--card-index': index } as React.CSSProperties}
      >
        <Card
          suit={card.suit}
          rank={card.rank}
          faceUp={card.faceUp}
          cardId={card.id}
          isBeingDragged={isCardBeingDragged ? isCardBeingDragged(card.id) : false}
          onClick={() => onCardClick && onCardClick(card.id)}
          onMouseDown={(e) => card.draggable && onCardDragStart && onCardDragStart(card.id, e)}
          onTouchStart={(e) => card.draggable && onCardDragStart && onCardDragStart(card.id, e)}
        />
      </div>
    ))}
  </div>
);

export default React.memo(TableauPile);
