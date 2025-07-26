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
            zIndex: cards.length - index
          }}
        >
          <Card
            suit={card.suit}
            rank={card.rank}
            faceUp={card.faceUp}
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(DragPreview);