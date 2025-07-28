import React from 'react';
import Card from '../Card';
import { Card as CardType } from '@/types';
import { cn } from '@/utils/cssUtils';
import styles from './DragPreview.module.css';

interface DragPreviewProps {
  cards: CardType[];
  style: React.CSSProperties;
  isOverDropZone: boolean;
  isSnapBack?: boolean;
}

const DragPreview: React.FC<DragPreviewProps> = ({ cards, style, isOverDropZone, isSnapBack }) => {
  if (cards.length === 0) return null;

  // Extract width and height from the style prop to apply to individual cards
  const cardWidth = typeof style.width === 'number' ? style.width : parseInt(style.width as string);
  const cardHeight = typeof style.height === 'number' ? style.height : parseInt(style.height as string);

  return (
    <div 
      className={cn(
        styles.dragPreview,
        isOverDropZone ? styles.overDropzone : styles.dragging,
        isSnapBack && styles.snapBack
      )}
      style={style}
    >
      {cards.map((card, index) => (
        <div
          key={card.id}
          style={{
            position: 'absolute',
            top: index * 24, // Stack cards with offset
            left: 0,
            zIndex: index
          }}
        >
          <Card
            suit={card.suit}
            rank={card.rank}
            faceUp={card.faceUp}
            style={{
              width: cardWidth,
              height: cardHeight
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(DragPreview);