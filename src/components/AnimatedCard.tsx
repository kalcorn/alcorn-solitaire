import React from 'react';
import { Card as CardType } from '@/types';
import Card from './Card';

interface AnimatedCardProps {
  animatingCard: {
    card: CardType;
    type: 'stockToWaste' | 'wasteToStock';
    startPosition?: { x: number; y: number };
    endPosition?: { x: number; y: number };
    isLandscapeMobile?: boolean;
  } | null;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ animatingCard }) => {
  if (!animatingCard || !animatingCard.startPosition || !animatingCard.endPosition) {
    return null;
  }

  const getCardSize = () => {
    if (animatingCard.isLandscapeMobile) {
      return { width: '60px', height: '84px' };
    }
    
    if (window.innerWidth >= 1536) return { width: '110px', height: '154px' };
    if (window.innerWidth >= 1280) return { width: '100px', height: '140px' };
    if (window.innerWidth >= 1024) return { width: '100px', height: '140px' };
    if (window.innerWidth >= 768) return { width: '85px', height: '119px' };
    if (window.innerWidth >= 640) return { width: '65px', height: '91px' };
    return { width: '52px', height: '72px' };
  };

  const { width, height } = getCardSize();
  
  // Parse width and height to get numeric values for centering
  const cardWidth = parseInt(width);
  const cardHeight = parseInt(height);

  return (
    <div
      className={`animated-card-flyover ${animatingCard.type}${animatingCard.isLandscapeMobile ? ' landscape-mobile' : ''}`}
      style={{
        position: 'fixed',
        zIndex: 1000,
        pointerEvents: 'none',
        top: `${animatingCard.startPosition.y - cardHeight / 2}px`,
        left: `${animatingCard.startPosition.x - cardWidth / 2}px`,
        width,
        height,
        '--end-x': `${animatingCard.endPosition.x - animatingCard.startPosition.x}px`,
        '--end-y': `${animatingCard.endPosition.y - animatingCard.startPosition.y}px`,
        transformStyle: 'preserve-3d',
      } as React.CSSProperties}
    >
      {/* Show both sides of the card for flip effect */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        transformStyle: 'preserve-3d'
      }}>
        {/* Front side (face down) - visible at start for stockToWaste */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          transform: animatingCard.type === 'stockToWaste' ? 'rotateY(0deg)' : 'rotateY(180deg)'
        }}>
          <Card
            suit={animatingCard.card.suit}
            rank={animatingCard.card.rank}
            faceUp={false}
            cardId={animatingCard.card.id}
            isBeingDragged={false}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </div>
        
        {/* Back side (face up) - revealed during flip */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          transform: animatingCard.type === 'stockToWaste' ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          <Card
            suit={animatingCard.card.suit}
            rank={animatingCard.card.rank}
            faceUp={true}
            cardId={animatingCard.card.id}
            isBeingDragged={false}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AnimatedCard; 