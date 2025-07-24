import React from 'react';

interface CardProps {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number;
  faceUp: boolean;
  onClick?: () => void;
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const Card: React.FC<CardProps> = ({ suit, rank, faceUp, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={faceUp}
      aria-label={`${rank} of ${suit}`}
      className={`card ${faceUp ? 'face-up' : 'face-down'}`}
    >
      {faceUp ? (
        <span className="text-red-600">{suitSymbols[suit]}</span>
      ) : (
        <span className="card-back" />
      )}
      <span className="rank">{rank}</span>
    </button>
  );
};

export default React.memo(Card);
