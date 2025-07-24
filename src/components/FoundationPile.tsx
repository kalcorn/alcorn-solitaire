import React from 'react';
import { Card } from '@/types';

interface FoundationPileProps {
  cards: Card[];
  onCardClick?: (cardId: string) => void;
  onDrop?: (cardId: string) => void;
}

const FoundationPile: React.FC<FoundationPileProps> = ({
  cards,
  onCardClick,
  onDrop,
}) => {
  return (
    <div
      className="foundation-pile w-20 h-28 border rounded-md bg-green-700 flex flex-col items-center justify-center"
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
          <button
            key={card.id}
            type="button"
            draggable={card.faceUp}
            onClick={() => onCardClick && onCardClick(card.id)}
            aria-label={`${card.rank} of ${card.suit}`}
            role="listitem"
            className={`card ${card.faceUp ? 'face-up' : 'face-down'}`}
          >
            {card.faceUp ? (
              <span>
                {card.rank} {card.suit}
              </span>
            ) : (
              <span className="card-back" />
            )}
          </button>
        ))
      )}
    </div>
  );
};

export default React.memo(FoundationPile);
