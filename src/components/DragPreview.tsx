import React from 'react';
import Card from './Card';
import { Card as CardType } from '@/types';

interface DragPreviewProps {
  cards: CardType[];
  style: React.CSSProperties;
  isOverDropZone: boolean;
  isSnapBack?: boolean;
}

const DragPreview: React.FC<DragPreviewProps> = ({ cards, style, isOverDropZone, isSnapBack }) => {
  if (cards.length === 0) return null;

  // Extract width and height from the style prop to apply to individual cards
  const cardWidth = style.width;
  const cardHeight = style.height;

  return (
    <div 
      className={`drag-preview ${isOverDropZone ? 'over-dropzone' : 'dragging'} ${isSnapBack ? 'snap-back' : ''}`}
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