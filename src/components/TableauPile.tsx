import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface TableauPileProps {
  cards: CardType[];
  onCardClick?: (cardId: string) => void;
  onCardDragStart?: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  isDropZone?: boolean;
}

const TableauPile: React.FC<TableauPileProps> = ({ cards, onCardClick, onCardDragStart, isDropZone }) => (
  <div className={`tableau-pile relative ${isDropZone ? 'drop-zone-active' : ''}`} role="list" aria-label="Tableau pile">
    {cards.map((card, index) => (
      <div
        key={card.id}
        style={{ position: 'absolute', top: `${index * 32}px`, left: 0, right: 0 }}
      >
        <Card
          suit={card.suit}
          rank={card.rank}
          faceUp={card.faceUp}
          onClick={() => onCardClick && onCardClick(card.id)}
          onMouseDown={(e) => card.draggable && onCardDragStart && onCardDragStart(card.id, e)}
          onTouchStart={(e) => card.draggable && onCardDragStart && onCardDragStart(card.id, e)}
        />
      </div>
    ))}
  </div>
);

export default React.memo(TableauPile);
