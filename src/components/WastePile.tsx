import React from 'react';
import { Card } from '@/types';
import CardComponent from './Card';

interface WastePileProps {
  cards: Card[];
  onCardClick?: (cardId: string) => void;
  onCardDragStart?: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  isCardBeingDragged?: (cardId: string) => boolean;
}

const WastePile: React.FC<WastePileProps> = ({ cards, onCardClick, onCardDragStart, isCardBeingDragged }) => {
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;

  return (
    <div
      className="flex-shrink-0 waste-pile-responsive"
      style={{ position: 'relative', zIndex: 1 }}
      aria-label="Waste pile"
      role="list"
    >
      {topCard ? (
        <>
          {/* Show multiple cards with slight offset for depth */}
          {cards.slice(-3).map((card, index, visibleCards) => (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: index * 2,
                top: index * 1,
                zIndex: index + 1
              }}
            >
              <CardComponent
                suit={card.suit}
                rank={card.rank}
                faceUp={card.faceUp}
                cardId={card.id}
                isBeingDragged={isCardBeingDragged ? isCardBeingDragged(card.id) : false}
                onClick={index === visibleCards.length - 1 ? () => onCardClick && onCardClick(card.id) : undefined}
                onMouseDown={index === visibleCards.length - 1 && card.draggable ? 
                  (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
                onTouchStart={index === visibleCards.length - 1 && card.draggable ? 
                  (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
              />
            </div>
          ))}
        </>
      ) : (
        <div 
          className={`waste-pile ${cards.length === 0 ? 'empty' : ''} flex items-center justify-center waste-pile-responsive`}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <div className="text-white text-sm font-medium opacity-60">Empty</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(WastePile);
