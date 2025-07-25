import React from 'react';
import { Suit } from '@/types';
import { BsSuitHeartFill, BsSuitDiamondFill, BsSuitClubFill, BsSuitSpadeFill } from 'react-icons/bs';

interface CardProps {
  suit: Suit;
  rank: number;
  faceUp: boolean;
  onClick?: () => void;
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

const Card: React.FC<CardProps> = ({ suit, rank, faceUp, onClick }) => {
  const SuitIcon = suitIcons[suit];
  const displayRank = rankMap[rank as keyof typeof rankMap] || rank;

  const suitColor = suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';

  return (
    <div
      className={`card w-100 h-28 rounded-xl border-2 border-gray-300 shadow-lg
        flex items-center justify-center select-none cursor-pointer
        transition-transform duration-150 active:scale-95
        ${faceUp ? "bg-white face-up" : "blue-linen-texture border-blue-800"}`
      }
      onClick={onClick}
      style={{
        userSelect: 'none',
        touchAction: 'manipulation',
        position: 'relative'
      }}
    >
      {faceUp ? (
        <div className="relative w-full h-full">
          {/* Top-left corner */}
          <div className="absolute top-1 left-1 flex flex-col items-start">
            <span className={`${suitColor} text-xs font-bold`}>{displayRank}</span>
            <SuitIcon className={`${suitColor} text-base`} />
          </div>
          {/* Bottom-right corner (rotated) */}
          <div className="absolute bottom-1 right-1 flex flex-col items-end rotate-180">
            <span className={`${suitColor} text-xs font-bold`}>{displayRank}</span>
            <SuitIcon className={`${suitColor} text-base`} />
          </div>
          {/* Center large faded suit */}
          <div className="absolute inset-0 flex items-center justify-center">
            <SuitIcon className={`${suitColor} opacity-20 text-5xl`} />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center" />
      )}
    </div>
  );
};

export default React.memo(Card);
