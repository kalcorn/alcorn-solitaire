import React from 'react';
import Card from './Card';

interface BridgeCard {
  id: string;
  card: {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: number;
    faceUp: boolean;
    id: string;
  };
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  delay: number;
}

interface BridgeCardsProps {
  bridgeCards: BridgeCard[];
}

const BridgeCards: React.FC<BridgeCardsProps> = ({ bridgeCards }) => {
  if (bridgeCards.length === 0) return null;

  const getCardSize = () => {
    // Get dimensions from CSS custom properties for consistency
    const computedStyle = getComputedStyle(document.documentElement);
    const widthStr = computedStyle.getPropertyValue('--card-width').trim();
    const heightStr = computedStyle.getPropertyValue('--card-height').trim();
    
    // Parse to numbers for this component's usage
    const width = parseInt(widthStr.replace('px', ''));
    const height = parseInt(heightStr.replace('px', ''));
    
    return { width, height };
  };

  const { width, height } = getCardSize();

  return (
    <>
      {bridgeCards.map((bridgeCard) => (
        <div
          key={bridgeCard.id}
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${bridgeCard.startPosition.y - height / 2}px`, // Center the card
            left: `${bridgeCard.startPosition.x - width / 2}px`, // Center the card
            width: `${width}px`,
            height: `${height}px`,
            '--end-x': `${bridgeCard.endPosition.x - bridgeCard.startPosition.x}px`,
            '--end-y': `${bridgeCard.endPosition.y - bridgeCard.startPosition.y}px`,
            animation: `bridgeCardMove 0.3s ease-out ${bridgeCard.delay}ms forwards`,
          } as React.CSSProperties & { '--end-x': string; '--end-y': string }}
        >
          <Card
            suit={bridgeCard.card.suit}
            rank={bridgeCard.card.rank}
            faceUp={bridgeCard.card.faceUp}
            cardId={bridgeCard.card.id}
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

export default BridgeCards; 