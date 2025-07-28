import React from 'react';
import { Card as CardType } from '@/types';
import Card from '../Card';
import { cn } from '@/utils/cssUtils';
import styles from './FlyingCards.module.css';

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
    // Get dimensions from CSS custom properties for consistency
    const computedStyle = getComputedStyle(document.documentElement);
    const width = computedStyle.getPropertyValue('--card-width').trim();
    const height = computedStyle.getPropertyValue('--card-height').trim();
    
    return { width, height };
  };

  const { width, height } = getCardSize();

  return (
    <>
      {flyingCards.map((flyingCard) => (
        <div
          key={flyingCard.id}
          className={styles.cardShuffleFly}
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