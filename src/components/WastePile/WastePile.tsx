import React from 'react';
import { Card as CardType } from '@/types';
import Card from '../Card';
import { cn } from '@/utils/cssUtils';
import styles from './WastePile.module.css';
import { usePileRegistration } from '@/hooks/usePileRegistration';

interface WastePileProps {
  cards: CardType[];
  onCardClick?: (cardId: string) => void;
  onCardDragStart?: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  isCardBeingDragged?: (cardId: string) => boolean;
}

const WastePile: React.FC<WastePileProps> = ({ cards, onCardClick, onCardDragStart, isCardBeingDragged }) => {
  // Don't filter cards - just check if there are any cards
  const hasVisibleCards = cards.length > 0;

  // Register this pile with the animation system
  // Register this pile with the new animation system
  const { setElementRef } = usePileRegistration('waste');

  return (
    <div
      ref={setElementRef}
      className={cn("flex-shrink-0", styles.wastePileResponsive)}
      style={{ 
        position: 'relative', 
        zIndex: 1
      }}
      aria-label="Waste pile"
      role="list"
      data-pile-type="waste"
    >
      {hasVisibleCards ? (
        <>
          {/* Use original positioning for animation compatibility, but keep working drag logic */}
          {cards.slice(-3).map((card, index, slicedCards) => (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: index * 2,
                top: index * 1,
                zIndex: index + 1
              }}
            >
              <Card
                suit={card.suit}
                rank={card.rank}
                faceUp={card.faceUp}
                cardId={card.id}
                isBeingDragged={isCardBeingDragged ? isCardBeingDragged(card.id) : false}
                onClick={index === slicedCards.length - 1 ? 
                  () => onCardClick && onCardClick(card.id) : undefined}
                onMouseDown={index === slicedCards.length - 1 && card.draggable ? 
                  (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
                onTouchStart={index === slicedCards.length - 1 && card.draggable ? 
                  (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
              />
            </div>
          ))}
        </>
      ) : (
        <div 
          className={cn(
            styles.wastePile,
            styles.empty,
            "flex items-center justify-center"
          )}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            zIndex: 1
          }}
          role="button"
          aria-label="Empty waste pile"
        >
          <div className="text-white text-sm font-medium opacity-60"></div>
        </div>
      )}
    </div>
  );
};

export default React.memo(WastePile);
