import React from 'react';
import { Card as CardType } from '@/types';
import Card from './Card';

interface FlyingCard {
  id: string;
  card: CardType;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  flyX: number;
  flyRotation: number;
}

interface FlyingCardsProps {
  flyingCards: FlyingCard[];
}

const FlyingCards: React.FC<FlyingCardsProps> = ({ flyingCards }) => {
  if (flyingCards.length === 0) return null;

  const getCardSize = () => {
    if (window.innerWidth >= 1536) return { width: '110px', height: '154px' };
    if (window.innerWidth >= 1280) return { width: '100px', height: '140px' };
    if (window.innerWidth >= 1024) return { width: '100px', height: '140px' };
    if (window.innerWidth >= 768) return { width: '85px', height: '119px' };
    if (window.innerWidth >= 640) return { width: '65px', height: '91px' };
    return { width: '52px', height: '72px' };
  };

  const { width, height } = getCardSize();

  return (
    <>
      {flyingCards.map((flyingCard) => (
        <div
          key={flyingCard.id}
          className="card-shuffle-fly"
          style={{
            top: `${flyingCard.startPosition.y}px`,
            left: `${flyingCard.startPosition.x}px`,
            width,
            height,
            '--end-x': `${flyingCard.endPosition.x - flyingCard.startPosition.x}px`,
            '--end-y': `${flyingCard.endPosition.y - flyingCard.startPosition.y}px`,
            '--fly-x': `${flyingCard.flyX}px`,
            '--fly-rotation': `${flyingCard.flyRotation}deg`,
          } as React.CSSProperties}
        >
          <Card
            suit={flyingCard.card.suit}
            rank={flyingCard.card.rank}
            faceUp={flyingCard.card.faceUp}
            cardId={flyingCard.card.id}
            isBeingDragged={false}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      ))}
    </>
  );
};

export default FlyingCards; 