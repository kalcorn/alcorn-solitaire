import React from 'react';
import { Card } from '@/types';

interface StockPileProps {
  cards: Card[];
  onDrawCard?: () => void;
  disabled?: boolean;
}

const StockPile: React.FC<StockPileProps> = ({ cards, onDrawCard, disabled }) => {
  const isEmpty = cards.length === 0;

  return (
    <button
      type="button"
      className={`stock-pile w-20 h-28 rounded-md border ${
        isEmpty ? 'bg-gray-700 cursor-default' : 'bg-green-700 cursor-pointer'
      }`}
      aria-label={isEmpty ? 'Empty stock pile' : 'Stock pile, click to draw a card'}
      onClick={() => {
        if (!disabled && !isEmpty && onDrawCard) onDrawCard();
      }}
      disabled={disabled || isEmpty}
    >
      {isEmpty ? (
        <div className="empty-pile text-gray-400">Empty</div>
      ) : (
        <div className="card-back" />
      )}
    </button>
  );
};

export default React.memo(StockPile);
