import React from 'react';
import { Card as CardType } from '../types';
import Card from './Card';

interface FoundationPileProps {
  pile: CardType[];
  suit: CardType['suit'];
  onDropCard: (card: CardType) => void;
}

const FoundationPile: React.FC<FoundationPileProps> = ({ pile, suit, onDropCard }) => {
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;

  return (
    <section
      className="foundation-pile w-16 h-24 border-2 border-green-800 rounded bg-green-700"
      aria-label={`Foundation pile for ${suit}`}
      role="list"
      tabIndex={0}
    >
      {topCard ? (
        <Card {...topCard} />
      ) : (
        <div className="empty-pile flex items-center justify-center text-green-300">Empty</div>
      )}
    </section>
  );
};

export default React.memo(FoundationPile);
