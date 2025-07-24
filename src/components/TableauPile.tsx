import React from 'react';

interface Card {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number;
  faceUp: boolean;
}

interface TableauPileProps {
  cards: Card[];
  onCardClick?: (cardId: string) => void;
  onDragStart?: (cardId: string) => void;
  onDrop?: (cardId: string) => void;
}

const TableauPile: React.FC<TableauPileProps> = ({
  cards,
  onCardClick,
  onDragStart,
  onDrop,
}) => {
  return (
    <div
      className="tableau-pile flex flex-col space-y-[-70%]"
      role="list"
      aria-label="Tableau pile"
      onDrop={(e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        onDrop && onDrop(cardId);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {cards.map((card, index) => (
        <button
          key={card.id}
          type="button"
          draggable={card.faceUp}
          onClick={() => onCardClick && onCardClick(card.id)}
          onDragStart={(e) => {
            if (card.faceUp && onDragStart) {
              onDragStart(card.id);
              e.dataTransfer.setData('text/plain', card.id);
            } else {
              e.preventDefault();
            }
          }}
          role="listitem"
          aria-pressed={card.faceUp}
          aria-label={`${card.rank} of ${card.suit}`}
          className={`card ${card.faceUp ? 'face-up' : 'face-down'}`}
          style={{ marginTop: index === 0 ? 0 : '-70%' }}
        >
          {/* Render card face or back here */}
          {card.faceUp ? (
            <span>
              {card.rank} {card.suit}
            </span>
          ) : (
            <span className="card-back" />
          )}
        </button>
      ))}
    </div>
  );
};

export default React.memo(TableauPile);
