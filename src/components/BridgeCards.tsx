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

  return (
    <>
      {bridgeCards.map((bridgeCard) => (
        <div
          key={bridgeCard.id}
          className="fixed z-50 pointer-events-none"
          style={{
            top: `${bridgeCard.startPosition.y - 36}px`, // Center the card (72/2 = 36)
            left: `${bridgeCard.startPosition.x - 26}px`, // Center the card (52/2 = 26)
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
          />
        </div>
      ))}
    </>
  );
};

export default BridgeCards; 