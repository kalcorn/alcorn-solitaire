import React from 'react';
import { Card as CardType } from '../types'; // Assuming you have a types file
import Card from './Card';

interface StockPileProps {
  cards: CardType[];
  onDraw: () => void;
}

const StockPile: React.FC<StockPileProps> = ({ cards, onDraw }) => {
  return (
    <button
      onClick={onDraw}
      disabled={cards.length === 0}
      aria-label={cards.length === 0 ? 'Stock pile empty' : 'Draw a card from stock pile'}
      className={`stock-pile w-16 h-24 rounded border-2 border-green-800 bg-green-700 ${
        cards.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {cards.length > 0 ? (
        <div className="card-back" />
      ) : (
        <div className="empty-stock text-center text-green-300 mt-8">Empty</div>
      )}
    </button>
  );
};

export default React.memo(StockPile);
