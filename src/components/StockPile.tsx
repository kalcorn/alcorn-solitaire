import React from 'react';
import { Card as CardType } from '@/types';

interface StockPileProps {
  cards: CardType[];
  onClick?: () => void;
}

const StockPile: React.FC<StockPileProps> = ({ cards, onClick }) => (
  <div className="relative">
    {/* Card stack effect (subtle shadows if more than 1 card) */}
    {cards.length > 1 && (
      <div className="absolute left-1 top-1 w-20 h-28 rounded-xl border-2 border-blue-900 shadow opacity-10 pointer-events-none" />
    )}
    {cards.length > 2 && (
      <div className="absolute left-2 top-2 w-20 h-28 rounded-xl border-2 border-blue-900 shadow opacity-5 pointer-events-none" />
    )}
    {/* Top card */}
    {cards.length > 0 ? (
      <div
        className="blue-linen-texture w-20 h-28 rounded-xl border-2 border-blue-800 shadow-lg cursor-pointer"
        onClick={onClick}
        title="Stock pile"
      />
    ) : (
      <div className="w-20 h-28 rounded-xl border-2 border-gray-400 bg-gray-200 flex items-center justify-center opacity-40" />
    )}
  </div>
);

export default StockPile;
