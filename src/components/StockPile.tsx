import React from 'react';
import { Card as CardType } from '@/types';

interface StockPileProps {
  cards: CardType[];
  onClick?: () => void;
  cyclesRemaining?: number;
  canCycle?: boolean;
  isAnimating?: boolean;
  wasteCardCount?: number;
  isShuffling?: boolean;
}

const StockPile: React.FC<StockPileProps> = ({ cards, onClick, cyclesRemaining, canCycle = true, isAnimating = false, wasteCardCount = 0, isShuffling = false }) => {
  const isRecycleAvailable = cards.length === 0 && wasteCardCount > 0 && canCycle;
  
  return (
  <div className="flex-shrink-0 stock-pile-responsive" style={{ position: 'relative', zIndex: 1 }}>
    {/* Dynamic card stack effect based on card count */}
    {Array.from({ length: Math.min(5, cards.length - 1) }, (_, i) => (
      <div 
        key={i}
        className={`stock-pile pointer-events-none ${isShuffling ? 'stock-shuffle-cascade' : ''}`}
        style={{ 
          position: 'absolute', 
          left: `${(i + 1) * 2}px`, 
          top: `${(i + 1) * 2}px`,
          zIndex: i + 1,
          opacity: Math.max(0.03, 0.15 - (i * 0.03)),
          animationDelay: isShuffling ? `${i * 0.08}s` : '0s'
        }} 
      />
    ))}
    {/* Top card */}
    {cards.length > 0 ? (
      <div
        className={`stock-pile face-down transition-all duration-200 ${
          canCycle ? 'cursor-pointer hover:shadow-2xl' : 'cursor-not-allowed opacity-50'
        } ${isAnimating ? 'stock-flip-to-waste' : ''} ${isShuffling ? 'stock-shuffle-cascade' : ''}`}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          zIndex: 10,
          animationDelay: isShuffling ? '0.4s' : '0s'
        }}
        onClick={canCycle ? onClick : undefined}
        title={canCycle ? "Stock pile" : "No more cycles allowed"}
      />
    ) : (
      <div 
        className={`stock-pile empty flex flex-col items-center justify-center transition-all duration-200 ${
          isRecycleAvailable ? 'recycle-available' : ''
        } ${
          canCycle ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-40'
        }`}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
        onClick={canCycle ? onClick : undefined}
        title={canCycle ? "Click to recycle" : "No more cycles allowed"}
      >
        <div className={`text-xs text-center font-semibold ${isRecycleAvailable ? 'text-white' : 'text-gray-500'}`}>
          {isRecycleAvailable ? '♻️ Recycle' : canCycle ? 'Recycle' : 'Empty'}
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
};

export default StockPile;
