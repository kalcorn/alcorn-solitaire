import React from 'react';
import { GameState, Card as CardType, CardPosition } from '@/types';
import TopPilesSection from './TopPilesSection';
import TableauSection from './TableauSection';

interface DesktopLayoutProps {
  gameState: GameState;
  isShuffling: boolean;
  isWinAnimating: boolean;
  isCardBeingDragged: (cardId: string) => boolean;
  isZoneHovered: (pileType: "tableau" | "foundation", pileIndex: number) => boolean;
  onStockFlip: () => void;
  onCardClick: (cardId: string, pileType: "tableau" | "foundation" | "waste", pileIndex: number, cardIndex: number) => void;
  onCardDragStart: (cardId: string, event: React.MouseEvent | React.TouchEvent, position?: { pileType: 'tableau'; pileIndex: number; cardIndex: number }) => void;
  startDrag: (cards: CardType[], position: CardPosition, event: React.MouseEvent | React.TouchEvent) => void;
  getMovableCards: (position: CardPosition) => CardType[];
  cardVisibility?: { [cardId: string]: boolean };
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  gameState,
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
}) => {
  return (
    <div className="hidden md:block w-full flex grow flex-col">
      {/* Desktop Top Piles Section - Full Width Background */}
      <TopPilesSection
        gameState={gameState}
        isShuffling={isShuffling}
        isWinAnimating={isWinAnimating}
        isCardBeingDragged={isCardBeingDragged}
        isZoneHovered={isZoneHovered}
        onStockFlip={onStockFlip}
        onCardClick={onCardClick}
        onCardDragStart={onCardDragStart}
        startDrag={startDrag}
        getMovableCards={getMovableCards}
        cardVisibility={cardVisibility}
      />
      {/* Desktop Tableau Section - Constrained Width */}
      <div className="w-full max-w-6xl mx-auto px-4 xl:px-0">
        <div className="card-playing-area flex flex-col grow gap-3 w-full pt-6 md:pt-0 lg:pt-0">
          <TableauSection
            tableauPiles={gameState.tableauPiles}
            isCardBeingDragged={isCardBeingDragged}
            isZoneHovered={isZoneHovered}
            onCardClick={onCardClick}
            onCardDragStart={onCardDragStart}
            startDrag={startDrag}
            getMovableCards={getMovableCards}
          />
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;