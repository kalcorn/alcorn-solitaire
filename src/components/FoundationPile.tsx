import React from 'react';
import { Card as CardType } from '@/types';
import Card from './Card';

interface FoundationPileProps {
  cards: CardType[];
  onCardClick?: (cardId: string) => void;
  onDrop?: (cardId: string) => void;
}

const FoundationPile: React.FC<FoundationPileProps> = ({ cards, onCardClick, onDrop }) => {
  return (
    <div
      className="foundation-pile w-20 h-28 border-2 border-gray-700 rounded-md bg-green-700 flex items-center justify-center"
      role="list"
      aria-label="Foundation pile"
      onDrop={(e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        onDrop && onDrop(cardId);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {cards.length === 0 ? (
        <div className="empty-pile text-gray-400">Empty</div>
      ) : (
        cards.map((card) => (
          <Card
            key={card.id}
            suit={card.suit}
            rank={card.rank}
            faceUp={card.faceUp}
            onClick={() => onCardClick && onCardClick(card.id)}
          />
        ))
      )}
    </div>
  );
};

export default React.memo(FoundationPile);
