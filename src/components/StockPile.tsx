import React from 'react';
import { Card as CardType } from '@/types';
import { BsArrowCounterclockwise } from 'react-icons/bs';

interface StockPileProps {
  cards: CardType[];
  onClick?: () => void;
  cyclesRemaining?: number;
  canCycle?: boolean;
  wasteCardCount?: number;
  isShuffling?: boolean;
}

const StockPile: React.FC<StockPileProps> = ({ cards, onClick, cyclesRemaining, canCycle = true, wasteCardCount = 0, isShuffling = false }) => {
  const isRecycleAvailable = cards.length === 0 && wasteCardCount > 0 && canCycle;
  
  return (
  <div className="flex-shrink-0 stock-pile-responsive" style={{ position: 'relative', zIndex: 1 }}>
    {/* Dynamic card stack effect based on card count */}
    {Array.from({ length: Math.min(5, cards.length - 1) }, (_, i) => (
      <div 
        key={i}
        className={`card face-down pointer-events-none ${isShuffling ? 'stock-shuffle-cascade' : ''}`}
        style={{ 
          position: 'absolute', 
          left: `${(i + 1) * 1}px`, 
          top: `${(i + 1) * 1}px`,
          zIndex: i + 1,
          opacity: Math.max(0.1, 0.4 - (i * 0.08)),
          animationDelay: isShuffling ? `${i * 0.08}s` : '0s'
        }} 
      />
    ))}
    {/* Top card */}
    {cards.length > 0 ? (
      <div
        className={`card face-down ${
          canCycle ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
        } ${isShuffling ? 'stock-shuffle-cascade' : ''}`}
        role="button"
        tabIndex={canCycle ? 0 : -1}
        aria-label={`Stock pile with ${cards.length} cards. Click to deal cards to waste pile.`}
        aria-disabled={!canCycle}
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
        className={`stock-pile empty flex flex-col items-center justify-center ${
          isRecycleAvailable ? 'recycle-available' : ''
        } ${
          canCycle ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
        }`}
        role="button"
        tabIndex={canCycle ? 0 : -1}
        aria-label={isRecycleAvailable ? "Empty stock pile. Click to recycle waste cards." : "Empty stock pile"}
        aria-disabled={!canCycle}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
        onClick={canCycle ? onClick : undefined}
        title={canCycle ? "Click to recycle" : "No more cycles allowed"}
      >
        <div className="flex items-center justify-center">
          {isRecycleAvailable ? (
            <BsArrowCounterclockwise size={32} className="text-green-400 recycle-icon-glow" />
          ) : null}
        </div>
        {cyclesRemaining !== undefined && cyclesRemaining > 0 && (
          <div className="text-white text-xs opacity-50">
            {cyclesRemaining} left
          </div>
        )}
      </div>
    )}
  </div>
  );
};

export default StockPile;
