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
  cardVisibility?: { [cardId: string]: boolean };
  isShuffling?: boolean;
}

const WastePile: React.FC<WastePileProps> = ({ cards, onCardClick, onCardDragStart, isCardBeingDragged, cardVisibility, isShuffling = false }) => {
  // Don't show empty state during shuffle animation, even if no cards remain
  const hasVisibleCards = cards.length > 0 || isShuffling;

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
          {/* Full DOM approach: render all cards, apply visual offsets only to top 3 */}
          {cards.map((card, index) => {
            const isTopCard = index === cards.length - 1;
            // Only apply visual offsets to the top 3 cards (last 3 in the array)
            // Cards beyond the top 3 should be positioned at the same location
            const isInTopThree = index >= cards.length - 3;
            const visualIndex = isInTopThree ? (cards.length - 1 - index) : 0; // 0, 1, 2 for top 3, 0 for rest
            
            // Default to visible if cardVisibility is not explicitly set for this card
            // This ensures waste pile cards are visible by default
            const shouldBeVisible = cardVisibility && cardVisibility[card.id] !== undefined ? cardVisibility[card.id] : true;
            
            return (
              <div
                key={card.id}
                className={isTopCard ? 'visible-card' : 'hidden-card'}
                style={{
                  position: 'absolute',
                  left: visualIndex * 1, // 1px offset for visual stacking (only top 3)
                  top: visualIndex * 1,  // 1px offset for visual stacking (only top 3)
                  zIndex: index + 1,
                  transform: 'translateZ(0)', // GPU acceleration
                  willChange: 'transform'
                }}
                data-card-element="true"
                data-card-id={card.id}
              >
                <Card
                  suit={card.suit}
                  rank={card.rank}
                  faceUp={card.faceUp}
                  visible={shouldBeVisible}
                  cardId={card.id}
                  isBeingDragged={isCardBeingDragged ? isCardBeingDragged(card.id) : false}
                  onClick={isTopCard ? 
                    () => onCardClick && onCardClick(card.id) : undefined}
                  onMouseDown={isTopCard && card.draggable ? 
                    (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
                  onTouchStart={isTopCard && card.draggable ? 
                    (e) => onCardDragStart && onCardDragStart(card.id, e) : undefined}
                />
              </div>
            );
          })}
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
