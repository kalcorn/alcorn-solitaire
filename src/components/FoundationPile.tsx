import React from 'react';
import { Card as CardType } from '@/types';
import Card from './Card';
import { BsSuitHeartFill, BsSuitDiamondFill, BsSuitClubFill, BsSuitSpadeFill } from 'react-icons/bs';

interface FoundationPileProps {
  cards: CardType[];
  index: number;
  onCardClick?: (cardId: string) => void;
  onCardDragStart?: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  isDropZone?: boolean;
  isCardBeingDragged?: (cardId: string) => boolean;
}

const FoundationPile: React.FC<FoundationPileProps> = ({ cards, index, onCardClick, onCardDragStart, isDropZone, isCardBeingDragged }) => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const suitIcons = [BsSuitHeartFill, BsSuitDiamondFill, BsSuitClubFill, BsSuitSpadeFill];
  const suitColors = ['text-red-500', 'text-red-500', 'text-gray-800', 'text-gray-800'];
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;
  
  return (
    <div
      className={`foundation-pile ${isDropZone ? 'drop-zone' : ''}`}
      role="list"
      aria-label={`${suits[index]} suit pile`}
    >
      {/* Always show suit icon/text as background */}
      <div className={`flex flex-col items-center justify-center h-full absolute inset-0 ${cards.length > 0 ? 'opacity-15' : 'opacity-40'}`}>
        {React.createElement(suitIcons[index], { 
          className: `text-2xl md:text-4xl ${suitColors[index]} mb-1 md:mb-2` 
        })}
        <div className="text-gray-300 text-xs md:text-base font-semibold text-center">{suits[index]}</div>
      </div>

      {/* Show cards with stacking effect */}
      {cards.length > 0 && (
        <>
          {cards.slice(-3).map((card, stackIndex, visibleCards) => (
            <div
              key={card.id}
              className="absolute"
              style={{ 
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) translateY(${stackIndex * -1}px) translateX(${stackIndex * 0.5}px)`,
                zIndex: stackIndex + 1
              }}
            >
              <Card
                suit={card.suit}
                rank={card.rank}
                faceUp={card.faceUp}
                cardId={card.id}
                isBeingDragged={isCardBeingDragged ? isCardBeingDragged(card.id) : false}
                onClick={stackIndex === visibleCards.length - 1 ? 
                  () => onCardClick && onCardClick(card.id) : undefined}
                onMouseDown={stackIndex === visibleCards.length - 1 && card.draggable ? 
                  (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
                onTouchStart={stackIndex === visibleCards.length - 1 && card.draggable ? 
                  (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default React.memo(FoundationPile);
