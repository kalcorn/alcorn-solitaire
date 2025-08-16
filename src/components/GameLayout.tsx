import React from 'react';
import { GameState, CardPosition } from '@/types';
import { useIsClient } from '@/utils/hydrationUtils';
import MobileLayout from './layout/MobileLayout';
import DesktopLayout from './layout/DesktopLayout';
import LandscapeMobileLayout from './layout/LandscapeMobileLayout';

interface GameLayoutProps {
  state: GameState;
  isShuffling: boolean;
  isWinAnimating: boolean;
  isCardBeingDragged: (cardId: string) => boolean;
  isZoneHovered: (pileType: "tableau" | "foundation", pileIndex: number) => boolean;
  onStockFlip: (event?: React.MouseEvent) => void;
  onCardClick: (cardId: string, pileType: 'tableau' | 'foundation' | 'waste', pileIndex: number, cardIndex: number) => void;
  onCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent, position?: { pileType: 'tableau'; pileIndex: number; cardIndex: number }) => void;
  startDrag: (cards: any[], source: CardPosition, event: React.MouseEvent | React.TouchEvent) => void;
  getMovableCards: (position: CardPosition) => any[];
  cardVisibility?: { [cardId: string]: boolean };
}

const GameLayout: React.FC<GameLayoutProps> = ({
  state,
  isShuffling,
  isWinAnimating,
  isCardBeingDragged,
  isZoneHovered,
  onStockFlip,
  onCardClick,
  onCardDragStart,
  startDrag,
  getMovableCards,
  cardVisibility = {}
}) => {
  const isClient = useIsClient();

  // Simple responsive detection
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isLandscape = typeof window !== 'undefined' && window.innerHeight < window.innerWidth;

  if (!isClient) {
    return <div className="w-full flex grow flex-col items-center bg-transparent min-h-screen overflow-hidden hydration-loading" />;
  }

  const layoutProps = {
    gameState: state,
    isShuffling,
    isWinAnimating,
    isCardBeingDragged,
    isZoneHovered,
    onStockFlip,
    onCardClick,
    onCardDragStart,
    startDrag,
    getMovableCards,
    cardVisibility
  };

  if (isMobile && isLandscape) {
    return (
      <div className="hidden landscape-mobile-layout w-full flex-1 flex h-full">
        <LandscapeMobileLayout {...layoutProps} />
      </div>
    );
  } else if (isMobile) {
    return <MobileLayout {...layoutProps} />;
  } else {
    return (
      <div className="hidden md:block w-full flex-1">
        <DesktopLayout {...layoutProps} />
      </div>
    );
  }
};

export default GameLayout; 