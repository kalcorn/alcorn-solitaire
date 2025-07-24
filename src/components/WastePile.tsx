import React from 'react';
import { Card } from '@/types';
import CardComponent from './Card';

interface WastePileProps {
  cards: Card[];
  onCardClick?: (cardId: string) => void;
}

const WastePile: React.FC<WastePileProps> = ({ cards, onCardClick }) => {
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;

  return (
    <div
      className="w-20 h-28 rounded-md border bg-green-700 flex items-center justify-center"
      aria-label="Waste pile"
      role="list"
    >
      {topCard ? (
        <CardComponent
          suit={topCard.suit}
          rank={topCard.rank}
          faceUp={topCard.faceUp}
          onClick={() => onCardClick && onCardClick(topCard.id)}
        />
      ) : (
        <div className="empty-pile text-gray-400">Empty</div>
      )}
    </div>
  );
};

export default React.memo(WastePile);
