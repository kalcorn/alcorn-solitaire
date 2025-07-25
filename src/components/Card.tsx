import React from 'react';
import { Suit } from '@/types';
import { BsSuitHeartFill, BsSuitDiamondFill, BsSuitClubFill, BsSuitSpadeFill } from 'react-icons/bs';

interface CardProps {
  suit: Suit;
  rank: number;
  faceUp: boolean;
  onClick?: () => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
}

const suitIcons = {
  hearts: BsSuitHeartFill,
  diamonds: BsSuitDiamondFill,
  clubs: BsSuitClubFill,
  spades: BsSuitSpadeFill,
};

const rankMap = {
  1: "A", 11: "J", 12: "Q", 13: "K"
};

const Card: React.FC<CardProps> = ({ suit, rank, faceUp, onClick, onMouseDown, onTouchStart }) => {
  const SuitIcon = suitIcons[suit];
  const displayRank = rankMap[rank as keyof typeof rankMap] || rank;

  const suitColor = suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';

  return (
    <div
      className={`card rounded-lg shadow-xl
        flex items-center justify-center select-none cursor-pointer
        transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95
        ${faceUp ? "face-up" : "face-down"}`
      }
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        userSelect: 'none',
        touchAction: 'manipulation',
        position: 'relative'
      }}
    >
      {faceUp ? (
        <div className="relative w-full h-full">
          {/* Top-left corner */}
          <div className="absolute top-2 left-2 flex flex-col items-start">
            <span className={`${suitColor} text-lg font-bold leading-none`}>{displayRank}</span>
            <SuitIcon className={`${suitColor} text-2xl mt-1`} />
          </div>
          {/* Bottom-right corner (rotated) */}
          <div className="absolute bottom-2 right-2 flex flex-col items-end rotate-180">
            <span className={`${suitColor} text-lg font-bold leading-none`}>{displayRank}</span>
            <SuitIcon className={`${suitColor} text-2xl mt-1`} />
          </div>
          {/* Center large faded suit with subtle glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <SuitIcon className={`${suitColor} opacity-25 text-8xl drop-shadow-sm`} />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center" />
      )}
    </div>
  );
};

export default React.memo(Card);
