import React from 'react';
import { Card as CardType } from '@/types';

interface StockPileProps {
  cards: CardType[];
  onClick?: () => void;
  cyclesRemaining?: number;
  canCycle?: boolean;
}

const StockPile: React.FC<StockPileProps> = ({ cards, onClick, cyclesRemaining, canCycle = true }) => (
  <div className="flex-shrink-0 stock-pile-responsive" style={{ position: 'relative', zIndex: 1 }}>
    {/* Card stack effect (subtle shadows if more than 1 card) */}
    {cards.length > 1 && (
      <div 
        className="stock-pile opacity-10 pointer-events-none" 
        style={{ 
          position: 'absolute', 
          left: '4px', 
          top: '4px',
          zIndex: 1
        }} 
      />
    )}
    {cards.length > 2 && (
      <div 
        className="stock-pile opacity-5 pointer-events-none" 
        style={{ 
          position: 'absolute', 
          left: '8px', 
          top: '8px',
          zIndex: 2
        }} 
      />
    )}
    {/* Top card */}
    {cards.length > 0 ? (
      <div
        className={`stock-pile face-down transition-all duration-200 ${
          canCycle ? 'cursor-pointer hover:shadow-2xl' : 'cursor-not-allowed opacity-50'
        }`}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 3 }}
        onClick={canCycle ? onClick : undefined}
        title={canCycle ? "Stock pile" : "No more cycles allowed"}
      />
    ) : (
      <div 
        className={`stock-pile border-gray-400 bg-gray-200 flex flex-col items-center justify-center transition-all duration-200 ${
          canCycle ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-40'
        }`}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 3 }}
        onClick={canCycle ? onClick : undefined}
        title={canCycle ? "Click to recycle" : "No more cycles allowed"}
      >
        <div className="text-gray-500 text-xs text-center">
          {canCycle ? 'Recycle' : 'Empty'}
        </div>
        {cyclesRemaining !== undefined && cyclesRemaining > 0 && (
          <div className="text-gray-500 text-xs">
            {cyclesRemaining} left
          </div>
        )}
      </div>
    )}
  </div>
);

export default StockPile;
