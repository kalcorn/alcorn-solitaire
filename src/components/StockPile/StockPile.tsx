import React from 'react';
import { Card as CardType } from '@/types';
import Card from '../Card';
import { BsArrowCounterclockwise } from 'react-icons/bs';
import { cn } from '@/utils/cssUtils';
import styles from './StockPile.module.css';
import { usePileRegistration } from '@/hooks/usePileRegistration';

interface StockPileProps {
  cards: CardType[];
  onClick?: (event?: React.MouseEvent) => void;
  cyclesRemaining?: number;
  canCycle?: boolean;
  wasteCardCount?: number;
  isShuffling?: boolean;
}

const StockPile: React.FC<StockPileProps> = ({ cards, onClick, cyclesRemaining, canCycle = true, wasteCardCount = 0, isShuffling = false }) => {
  const isRecycleAvailable = cards.length === 0 && wasteCardCount > 0 && canCycle;
  
  // Register this pile with the new animation system
  const { setElementRef } = usePileRegistration('stock');
  
  return (
  <div 
    ref={setElementRef}
    className={cn("flex-shrink-0", styles.stockPileResponsive)} 
    style={{ position: 'relative', zIndex: 1 }}
    data-pile-type="stock"
  >
    {/* Dynamic card stack effect based on card count */}
    {Array.from({ length: Math.min(5, cards.length - 1) }, (_, i) => (
      <div 
        key={i}
        style={{ 
          position: 'absolute', 
          left: `${(i + 1) * 1}px`, 
          top: `${(i + 1) * 1}px`,
          zIndex: i + 1,
          opacity: Math.max(0.1, 0.4 - (i * 0.08)),
          animationDelay: isShuffling ? `${i * 0.08}s` : '0s',
          pointerEvents: 'none'
        }}
        className={isShuffling ? styles.stockShuffleCascade : ''}
      >
        <Card
          suit="hearts"
          rank={1}
          faceUp={false}
          cardId={`stock-stack-${i}`}
          isBeingDragged={false}
        />
      </div>
    ))}
    {/* Top card */}
    {cards.length > 0 ? (
      <div
        role="button"
        tabIndex={canCycle ? 0 : -1}
        aria-label={`Stock pile with ${cards.length} cards. Click to deal cards to waste pile.`}
        aria-disabled={!canCycle}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          zIndex: 10,
          animationDelay: isShuffling ? '0.4s' : '0s',
          cursor: canCycle ? 'pointer' : 'not-allowed',
          opacity: canCycle ? 1 : 0.5
        }}
        className={isShuffling ? styles.stockShuffleCascade : ''}
        onClick={canCycle ? (event) => {
          console.log('[TIMING] StockPile click handler triggered at:', performance.now());
          onClick?.(event);
        } : undefined}
        title={canCycle ? "Stock pile" : "No more cycles allowed"}
      >
        <Card
          suit="hearts"
          rank={1}
          faceUp={false}
          cardId="stock-top"
          isBeingDragged={false}
        />
      </div>
    ) : (
      <div 
        className={cn(
          styles.stockPile,
          styles.empty,
          "flex flex-col items-center justify-center",
          isRecycleAvailable && styles.recycleAvailable,
          canCycle ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
        )}
        role="button"
        tabIndex={canCycle ? 0 : -1}
        aria-label={isRecycleAvailable ? "Empty stock pile. Click to recycle waste cards." : "Empty stock pile"}
        aria-disabled={!canCycle}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
        onClick={canCycle ? (event) => {
          console.log('[TIMING] StockPile recycle click handler triggered at:', performance.now());
          onClick?.(event);
        } : undefined}
        title={canCycle ? "Click to recycle" : "No more cycles allowed"}
      >
        <div className="flex items-center justify-center">
          {isRecycleAvailable ? (
            <BsArrowCounterclockwise size={32} className={cn("text-green-400", styles.recycleIconGlow)} />
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
