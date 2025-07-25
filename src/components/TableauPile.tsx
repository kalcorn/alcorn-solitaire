import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface TableauPileProps {
  cards: CardType[];
  onCardClick?: (cardId: string) => void;
}

const TableauPile: React.FC<TableauPileProps> = ({ cards, onCardClick }) => (
  <div className="tableau-pile w-100 relative" role="list" aria-label="Tableau pile">
    {cards.map((card, index) => (
      <div
        key={card.id}
        style={{ position: 'absolute', top: `${index * 25}px`, left: 0, right: 0 }}
      >
        <Card
          suit={card.suit}
          rank={card.rank}
          faceUp={card.faceUp}
          onClick={() => onCardClick && onCardClick(card.id)}
        />
      </div>
    ))}
  </div>
);

export default React.memo(TableauPile);
