import React from 'react';
import { Card as CardType } from '@/types';
import Card from './Card';

interface FoundationPileProps {
  cards: CardType[];
  index: number;
  onCardClick?: (cardId: string) => void;
  onCardDragStart?: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  isDropZone?: boolean;
}

const FoundationPile: React.FC<FoundationPileProps> = ({ cards, index, onCardClick, onCardDragStart, isDropZone }) => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const suitIcons = ['♥', '♦', '♣', '♠'];
  const suitColors = ['text-red-500', 'text-red-500', 'text-gray-800', 'text-gray-800'];
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;
  
  return (
    <div
      className={`foundation-pile ${isDropZone ? 'drop-zone' : ''}`}
      role="list"
      aria-label={`Foundation pile for ${suits[index]}`}
    >
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full opacity-40">
          <div className={`text-5xl ${suitColors[index]} mb-2`}>{suitIcons[index]}</div>
          <div className="text-gray-300 text-xs font-semibold text-center">{suits[index]}</div>
        </div>
      ) : (
        <div className="relative h-full">
          {/* Show slight stacking effect */}
          {cards.slice(-3).map((card, stackIndex, visibleCards) => (
            <div
              key={card.id}
              className="absolute top-0 left-0"
              style={{ 
                transform: `translateY(${stackIndex * -1}px) translateX(${stackIndex * 0.5}px)`,
                zIndex: stackIndex
              }}
            >
              <Card
                suit={card.suit}
                rank={card.rank}
                faceUp={card.faceUp}
                onClick={stackIndex === visibleCards.length - 1 ? 
                  () => onCardClick && onCardClick(card.id) : undefined}
                onMouseDown={stackIndex === visibleCards.length - 1 && card.draggable ? 
                  (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
                onTouchStart={stackIndex === visibleCards.length - 1 && card.draggable ? 
                  (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(FoundationPile);
