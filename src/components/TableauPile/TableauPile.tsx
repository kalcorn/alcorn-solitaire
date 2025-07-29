import React from 'react';
import Card from '../Card';
import { Card as CardType } from '@/types';
import { cn } from '@/utils/cssUtils';
import { getCardDimensions } from '@/utils/cardDimensions';

import styles from './TableauPile.module.css';
import { usePileRegistration } from '@/hooks/usePileRegistration';

interface TableauPileProps {
  cards: CardType[];
  index: number; // Add index prop for pile identification
  onCardClick?: (cardId: string) => void;
  onCardDragStart?: (cardId: string, event: React.MouseEvent | React.TouchEvent) => void;
  isDropZone?: boolean;
  isCardBeingDragged?: (cardId: string) => boolean;
}

const TableauPile: React.FC<TableauPileProps> = ({ cards, index, onCardClick, onCardDragStart, isDropZone, isCardBeingDragged }) => {
  const [windowSize, setWindowSize] = React.useState({ width: 1200, height: 800 });

  // Register this pile with the animation system
  // Register this pile with the new animation system
  const { setElementRef } = usePileRegistration(`tableau-${index}`);

  // Update window size on resize for responsive spacing
  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Set initial size
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate dynamic card spacing to maximize readability while using available space
  const calculateCardSpacing = () => {
    const cardCount = cards.length;
    if (cardCount <= 1) return 0;

    // Get viewport dimensions
    const viewportHeight = windowSize.height;
    const viewportWidth = windowSize.width;
    
    // Get card dimensions from unified system
    const { height: cardHeight } = getCardDimensions();
    
    // Calculate rank/suit display height + padding as optimal spacing
    // Rank/suit text is roughly 12-20% of card height, with some padding
    const rankSuitDisplayHeight = Math.round(cardHeight * 0.15); // ~15% of card height
    const paddingMultiplier = 2; // Your suggested padding * 2
    const optimalSpacing = rankSuitDisplayHeight + (4 * paddingMultiplier); // 4px base padding
    
    // More aggressive viewport usage - use up to 80% of available height
    const availableHeight = viewportHeight * 0.8;
    
    // Reserve space for header, margins, and other UI elements
    const headerAndUIReserved = viewportHeight * 0.25; // Reserve 25% for UI
    const gameAreaHeight = availableHeight - headerAndUIReserved;
    
    // Calculate maximum space we can use for this tableau pile
    const maxPileHeight = gameAreaHeight;
    
    // Calculate what spacing would use all available space
    const maxPossibleSpacing = cardCount > 1 ? 
      Math.floor((maxPileHeight - cardHeight) / (cardCount - 1)) : 0;
    
    // Set reasonable bounds based on screen size
    const minSpacing = viewportWidth < 640 ? 8 : 
                      viewportWidth < 768 ? 10 : 
                      viewportWidth < 1024 ? 12 : 16;
    
    // Max spacing is the smaller of: optimal spacing or what fits in viewport
    const maxSpacing = Math.min(optimalSpacing, maxPossibleSpacing);
    
    // For fewer cards, we can use much more generous spacing
    let targetSpacing;
    if (cardCount <= 3) {
      // Very generous spacing for small piles - use most available space
      targetSpacing = Math.min(maxSpacing, optimalSpacing * 1.5);
    } else if (cardCount <= 6) {
      // Good spacing for medium piles
      targetSpacing = Math.min(maxSpacing, optimalSpacing * 1.2);
    } else if (cardCount <= 10) {
      // Standard spacing for larger piles
      targetSpacing = Math.min(maxSpacing, optimalSpacing);
    } else {
      // Compact spacing for very tall piles, but still readable
      targetSpacing = Math.min(maxSpacing, optimalSpacing * 0.8);
    }
    
    // Ensure we stay within bounds
    const finalSpacing = Math.max(minSpacing, Math.min(maxSpacing, Math.round(targetSpacing)));
    
    // Final safety check - ensure pile doesn't exceed available space
    const estimatedPileHeight = cardHeight + (cardCount - 1) * finalSpacing;
    if (estimatedPileHeight > maxPileHeight && cardCount > 1) {
      // Recalculate with strict height constraint
      return Math.max(minSpacing, Math.floor((maxPileHeight - cardHeight) / (cardCount - 1)));
    }
    
    return finalSpacing;
  };

  const cardSpacing = calculateCardSpacing();

  return (
    <div 
      ref={setElementRef}
      className={cn(
        styles.tableauPile,
        "relative",
        isDropZone && styles.dropZoneActive
      )} 
      role="list" 
      aria-label="Play pile"
    >
      {cards.length === 0 ? (
        <div className={styles.tableauEmptyPlaceholder} />
      ) : (
        cards.map((card, cardIndex) => (
          <div
            key={card.id}
            className={styles.tableauCardPosition}
            style={{ 
              '--card-index': cardIndex,
              '--dynamic-spacing': `${cardSpacing}px`,
              top: `${cardIndex * cardSpacing}px`
            } as React.CSSProperties}
          >
          <Card
            suit={card.suit}
            rank={card.rank}
            faceUp={card.faceUp}
            cardId={card.id}
            isBeingDragged={isCardBeingDragged ? isCardBeingDragged(card.id) : false}
            onClick={() => onCardClick && onCardClick(card.id)}
            onMouseDown={(e) => card.draggable && onCardDragStart && onCardDragStart(card.id, e)}
            onTouchStart={(e) => card.draggable && onCardDragStart && onCardDragStart(card.id, e)}
          />
        </div>
        ))
      )}
  </div>
  );
};

export default React.memo(TableauPile);
