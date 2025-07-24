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

const Card: React.FC<CardProps> = ({ suit, rank, faceUp, onClick }) => {
  const SuitIcon = suitIcons[suit];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={faceUp}
      aria-label={`${rank} of ${suit}`}
      className={`card w-20 h-28 rounded-md border-2 border-gray-700 shadow-lg relative bg-white text-black flex flex-col justify-between p-2 font-semibold text-lg transition-transform duration-300 ease-in-out ${
        !faceUp ? 'bg-blue-900 text-transparent' : ''
      }`}
    >
      {faceUp ? (
        <>
          {/* Top-left rank and suit */}
          <div className="flex flex-col items-start">
            <span className={`${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'} text-xs font-bold`}>
              {rank}
            </span>
            <SuitIcon
              className={`${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'} w-4 h-4`}
              aria-hidden="true"
            />
          </div>

          {/* Center large, low-opacity suit */}
          <SuitIcon
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 w-12 h-12 pointer-events-none select-none"
            aria-hidden="true"
          />

          {/* Bottom-right rank and suit rotated */}
          <div className="flex flex-col items-end rotate-180 transform">
            <span className={`${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'} text-xs font-bold`}>
              {rank}
            </span>
            <SuitIcon
              className={`${suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'} w-4 h-4`}
              aria-hidden="true"
            />
          </div>
        </>
      ) : (
        <span className="card-back" />
      )}
    </button>
  );
};

export default React.memo(Card);
