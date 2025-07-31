import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopPilesSection from '../components/layout/TopPilesSection';
import { Card, CardPosition } from '@/types';

// Mock the child components
jest.mock('../components/StockPile', () => {
  const MockStockPile = ({ cards, onClick, cyclesRemaining, canCycle, wasteCardCount, isShuffling }: any) => (
    <div 
      data-testid="stock-pile"
      onClick={onClick}
      data-cycles-remaining={cyclesRemaining !== undefined ? cyclesRemaining : 'undefined'}
      data-can-cycle={canCycle}
      data-waste-card-count={wasteCardCount}
      data-is-shuffling={isShuffling}
    >
      StockPile: {cards.length} cards
    </div>
  );
  MockStockPile.displayName = 'StockPile';
  return MockStockPile;
});

jest.mock('../components/WastePile', () => {
  const MockWastePile = ({ cards, cardVisibility, isShuffling, onCardClick, onCardDragStart, isCardBeingDragged }: any) => (
    <div 
      data-testid="waste-pile"
      data-is-shuffling={isShuffling}
    >
      WastePile: {cards.length} cards
      {cards.map((card: Card, index: number) => (
        <div
          key={card.id}
          data-testid={`waste-card-${card.id}`}
          onClick={() => onCardClick(card.id)}
          onMouseDown={(e) => onCardDragStart(card.id, e)}
          data-card-visibility={cardVisibility?.[card.id]}
          data-is-being-dragged={isCardBeingDragged(card.id)}
        >
          {card.id}
        </div>
      ))}
    </div>
  );
  MockWastePile.displayName = 'WastePile';
  return MockWastePile;
});

jest.mock('../components/FoundationPile', () => {
  const MockFoundationPile = ({ index, cards, onCardClick, onCardDragStart, isDropZone, isCardBeingDragged }: any) => (
    <div 
      data-testid={`foundation-pile-${index}`}
      data-is-drop-zone={isDropZone}
    >
      Foundation {index}: {cards.length} cards
      {cards.map((card: Card, cardIndex: number) => (
        <div
          key={card.id}
          data-testid={`foundation-card-${card.id}`}
          onClick={() => onCardClick(card.id)}
          onMouseDown={(e) => onCardDragStart(card.id, e)}
          data-is-being-dragged={isCardBeingDragged(card.id)}
        >
          {card.id}
        </div>
      ))}
    </div>
  );
  MockFoundationPile.displayName = 'FoundationPile';
  return MockFoundationPile;
});

describe('TopPilesSection Component', () => {
  let mockGameState: any;
  let mockProps: any;
  let mockCards: Card[];

  beforeEach(() => {
    mockCards = [
      { id: 'card1', suit: 'hearts' as const, rank: 1, faceUp: true },
      { id: 'card2', suit: 'spades' as const, rank: 2, faceUp: true },
      { id: 'card3', suit: 'diamonds' as const, rank: 3, faceUp: true },
      { id: 'card4', suit: 'clubs' as const, rank: 4, faceUp: true }
    ];

    mockGameState = {
      stockPile: [mockCards[0], mockCards[1]],
      wastePile: [mockCards[2]],
      foundationPiles: [
        [mockCards[3]],
        [],
        [],
        []
      ],
      stockCycles: 2,
      settings: {
        deckCyclingLimit: 3
      }
    };

    mockProps = {
      gameState: mockGameState,
      isShuffling: false,
      isWinAnimating: false,
      isCardBeingDragged: jest.fn().mockReturnValue(false),
      isZoneHovered: jest.fn().mockReturnValue(false),
      onStockFlip: jest.fn(),
      onCardClick: jest.fn(),
      onCardDragStart: jest.fn(),
      startDrag: jest.fn(),
      getMovableCards: jest.fn().mockReturnValue([]),
      cardVisibility: {}
    };
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<TopPilesSection {...mockProps} />);
      expect(screen.getByRole('region', { name: 'Stock, waste, and foundation piles' })).toBeInTheDocument();
    });

    it('should render all child components', () => {
      render(<TopPilesSection {...mockProps} />);
      
      expect(screen.getByTestId('stock-pile')).toBeInTheDocument();
      expect(screen.getByTestId('waste-pile')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-pile-0')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-pile-1')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-pile-2')).toBeInTheDocument();
      expect(screen.getByTestId('foundation-pile-3')).toBeInTheDocument();
    });

    it('should render with correct ARIA labels', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Stock, waste, and foundation piles');
    });

    it('should apply correct CSS classes', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const region = screen.getByRole('region');
      expect(region).toHaveClass('flex', 'flex-row', 'items-start', 'justify-between', 'w-full');
    });
  });

  describe('StockPile Props', () => {
    it('should pass correct props to StockPile', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const stockPile = screen.getByTestId('stock-pile');
      expect(stockPile).toHaveTextContent('StockPile: 2 cards');
      expect(stockPile).toHaveAttribute('data-cycles-remaining', '1'); // 3 - 2 = 1
      expect(stockPile).toHaveAttribute('data-can-cycle', 'true');
      expect(stockPile).toHaveAttribute('data-waste-card-count', '1');
      expect(stockPile).toHaveAttribute('data-is-shuffling', 'false');
    });

    it('should handle unlimited cycling', () => {
      const unlimitedGameState = {
        ...mockGameState,
        settings: {
          deckCyclingLimit: 0
        }
      };

      const unlimitedProps = {
        ...mockProps,
        gameState: unlimitedGameState
      };

      render(<TopPilesSection {...unlimitedProps} />);

      const stockPile = screen.getByTestId('stock-pile');
      expect(stockPile).toHaveAttribute('data-cycles-remaining', 'undefined'); // undefined becomes "undefined" string
      expect(stockPile).toHaveAttribute('data-can-cycle', 'true');
    });

    it('should handle exhausted cycles', () => {
      const propsWithExhaustedCycles = {
        ...mockProps,
        gameState: {
          ...mockGameState,
          stockCycles: 3,
          settings: { deckCyclingLimit: 3 }
        }
      };

      render(<TopPilesSection {...propsWithExhaustedCycles} />);
      
      const stockPile = screen.getByTestId('stock-pile');
      expect(stockPile).toHaveAttribute('data-cycles-remaining', '0');
      expect(stockPile).toHaveAttribute('data-can-cycle', 'false');
    });

    it('should call onStockFlip when StockPile is clicked', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const stockPile = screen.getByTestId('stock-pile');
      fireEvent.click(stockPile);
      
      expect(mockProps.onStockFlip).toHaveBeenCalledTimes(1);
    });
  });

  describe('WastePile Props', () => {
    it('should pass correct props to WastePile', () => {
      const cardVisibility = { card3: true };
      const propsWithVisibility = { ...mockProps, cardVisibility };

      render(<TopPilesSection {...propsWithVisibility} />);
      
      const wastePile = screen.getByTestId('waste-pile');
      expect(wastePile).toHaveTextContent('WastePile: 1 cards');
      expect(wastePile).toHaveAttribute('data-is-shuffling', 'false');
      
      const wasteCard = screen.getByTestId('waste-card-card3');
      expect(wasteCard).toHaveAttribute('data-card-visibility', 'true');
    });

    it('should handle WastePile card click', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const wasteCard = screen.getByTestId('waste-card-card3');
      fireEvent.click(wasteCard);
      
      expect(mockProps.onCardClick).toHaveBeenCalledWith('card3', 'waste', 0, 0);
    });

    it('should handle WastePile card drag start', () => {
      mockProps.getMovableCards.mockReturnValue([mockCards[2]]);
      
      render(<TopPilesSection {...mockProps} />);
      
      const wasteCard = screen.getByTestId('waste-card-card3');
      const mouseEvent = { clientX: 100, clientY: 200 };
      fireEvent.mouseDown(wasteCard, mouseEvent);
      
      expect(mockProps.startDrag).toHaveBeenCalledWith(
        [mockCards[2]], 
        { pileType: 'waste', pileIndex: 0, cardIndex: 0 }, 
        expect.any(Object)
      );
    });

    it('should not start drag when no movable cards', () => {
      mockProps.getMovableCards.mockReturnValue([]);
      
      render(<TopPilesSection {...mockProps} />);
      
      const wasteCard = screen.getByTestId('waste-card-card3');
      fireEvent.mouseDown(wasteCard);
      
      expect(mockProps.startDrag).not.toHaveBeenCalled();
    });

    it('should handle missing card in waste pile', () => {
      const propsWithEmptyWaste = {
        ...mockProps,
        gameState: { ...mockGameState, wastePile: [] }
      };

      render(<TopPilesSection {...propsWithEmptyWaste} />);
      
      const wastePile = screen.getByTestId('waste-pile');
      expect(wastePile).toHaveTextContent('WastePile: 0 cards');
    });
  });

  describe('FoundationPiles Props', () => {
    it('should render all four foundation piles', () => {
      render(<TopPilesSection {...mockProps} />);
      
      for (let i = 0; i < 4; i++) {
        expect(screen.getByTestId(`foundation-pile-${i}`)).toBeInTheDocument();
      }
    });

    it('should pass correct props to FoundationPiles', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const foundationPile0 = screen.getByTestId('foundation-pile-0');
      expect(foundationPile0).toHaveTextContent('Foundation 0: 1 cards');
      expect(foundationPile0).toHaveAttribute('data-is-drop-zone', 'false');
      
      const foundationPile1 = screen.getByTestId('foundation-pile-1');
      expect(foundationPile1).toHaveTextContent('Foundation 1: 0 cards');
    });

    it('should handle foundation card click', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const foundationCard = screen.getByTestId('foundation-card-card4');
      fireEvent.click(foundationCard);
      
      expect(mockProps.onCardClick).toHaveBeenCalledWith('card4', 'foundation', 0, 0);
    });

    it('should handle foundation card drag start', () => {
      mockProps.getMovableCards.mockReturnValue([mockCards[3]]);
      
      render(<TopPilesSection {...mockProps} />);
      
      const foundationCard = screen.getByTestId('foundation-card-card4');
      fireEvent.mouseDown(foundationCard);
      
      expect(mockProps.startDrag).toHaveBeenCalledWith(
        [mockCards[3]], 
        { pileType: 'foundation', pileIndex: 0, cardIndex: 0 }, 
        expect.any(Object)
      );
    });

    it('should not start drag from foundation when no movable cards', () => {
      mockProps.getMovableCards.mockReturnValue([]);
      
      render(<TopPilesSection {...mockProps} />);
      
      const foundationCard = screen.getByTestId('foundation-card-card4');
      fireEvent.mouseDown(foundationCard);
      
      expect(mockProps.startDrag).not.toHaveBeenCalled();
    });
  });

  describe('Drop Zones', () => {
    it('should apply drop zone data attributes to foundation piles', () => {
      render(<TopPilesSection {...mockProps} />);
      
      for (let i = 0; i < 4; i++) {
        const dropZone = screen.getByTestId(`foundation-pile-${i}`).parentElement;
        expect(dropZone).toHaveAttribute('data-drop-zone');
        expect(dropZone).toHaveAttribute('data-pile-type', 'foundation');
        expect(dropZone).toHaveAttribute('data-pile-index', i.toString());
      }
    });

    it('should apply hover class when zone is hovered', () => {
      mockProps.isZoneHovered.mockImplementation((type: string, index: number) => 
        type === 'foundation' && index === 1
      );

      render(<TopPilesSection {...mockProps} />);
      
      const dropZone = screen.getByTestId('foundation-pile-1').parentElement;
      expect(dropZone).toHaveClass('drop-zone');
      
      const nonHoveredZone = screen.getByTestId('foundation-pile-0').parentElement;
      expect(nonHoveredZone).not.toHaveClass('drop-zone');
    });

    it('should apply win animation class when win animating', () => {
      const propsWithWinAnimation = { ...mockProps, isWinAnimating: true };
      
      render(<TopPilesSection {...propsWithWinAnimation} />);
      
      for (let i = 0; i < 4; i++) {
        const dropZone = screen.getByTestId(`foundation-pile-${i}`).parentElement;
        expect(dropZone).toHaveClass('foundation-win-cascade');
      }
    });

    it('should apply both hover and win animation classes', () => {
      mockProps.isZoneHovered.mockReturnValue(true);
      const propsWithBoth = { ...mockProps, isWinAnimating: true };
      
      render(<TopPilesSection {...propsWithBoth} />);
      
      for (let i = 0; i < 4; i++) {
        const dropZone = screen.getByTestId(`foundation-pile-${i}`).parentElement;
        expect(dropZone).toHaveClass('drop-zone', 'foundation-win-cascade');
      }
    });
  });

  describe('Shuffling State', () => {
    it('should pass shuffling state to child components', () => {
      const propsWithShuffling = { ...mockProps, isShuffling: true };
      
      render(<TopPilesSection {...propsWithShuffling} />);
      
      const stockPile = screen.getByTestId('stock-pile');
      expect(stockPile).toHaveAttribute('data-is-shuffling', 'true');
      
      const wastePile = screen.getByTestId('waste-pile');
      expect(wastePile).toHaveAttribute('data-is-shuffling', 'true');
    });
  });

  describe('Card Being Dragged', () => {
    it('should check if cards are being dragged', () => {
      mockProps.isCardBeingDragged.mockImplementation((cardId: string) => cardId === 'card3');
      
      render(<TopPilesSection {...mockProps} />);
      
      const wasteCard = screen.getByTestId('waste-card-card3');
      expect(wasteCard).toHaveAttribute('data-is-being-dragged', 'true');
    });

    it('should pass isCardBeingDragged to foundation piles', () => {
      mockProps.isCardBeingDragged.mockImplementation((cardId: string) => cardId === 'card4');
      
      render(<TopPilesSection {...mockProps} />);
      
      const foundationCard = screen.getByTestId('foundation-card-card4');
      expect(foundationCard).toHaveAttribute('data-is-being-dragged', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty piles gracefully', () => {
      const propsWithEmptyPiles = {
        ...mockProps,
        gameState: {
          stockPile: [],
          wastePile: [],
          foundationPiles: [[], [], [], []],
          stockCycles: 0,
          settings: { deckCyclingLimit: 3 }
        }
      };

      render(<TopPilesSection {...propsWithEmptyPiles} />);
      
      expect(screen.getByTestId('stock-pile')).toHaveTextContent('StockPile: 0 cards');
      expect(screen.getByTestId('waste-pile')).toHaveTextContent('WastePile: 0 cards');
      
      for (let i = 0; i < 4; i++) {
        expect(screen.getByTestId(`foundation-pile-${i}`)).toHaveTextContent(`Foundation ${i}: 0 cards`);
      }
    });

    it('should handle missing cardVisibility prop', () => {
      const propsWithoutVisibility = { ...mockProps, cardVisibility: undefined };
      
      expect(() => {
        render(<TopPilesSection {...propsWithoutVisibility} />);
      }).not.toThrow();
    });

    it('should handle missing getMovableCards return', () => {
      const propsWithNoMovableCards = {
        ...mockProps,
        getMovableCards: jest.fn(() => []) // Return empty array instead of undefined
      };

      render(<TopPilesSection {...propsWithNoMovableCards} />);

      const wasteCard = screen.getByTestId('waste-card-card3');
      fireEvent.mouseDown(wasteCard);
      
      expect(mockProps.startDrag).not.toHaveBeenCalled();
    });

    it('should handle card not found in pile during click', () => {
      const propsWithMismatchedCards = {
        ...mockProps,
        gameState: {
          ...mockGameState,
          wastePile: [] // Card3 no longer in waste pile
        }
      };

      render(<TopPilesSection {...propsWithMismatchedCards} />);
      
      // Should still render without errors
      expect(screen.getByTestId('waste-pile')).toHaveTextContent('WastePile: 0 cards');
    });
  });

  describe('Event Handlers', () => {
    it('should call event handlers with correct parameters', () => {
      mockProps.getMovableCards.mockReturnValue([mockCards[2]]);
      
      render(<TopPilesSection {...mockProps} />);
      
      // Test waste pile click handler
      const wasteCard = screen.getByTestId('waste-card-card3');
      fireEvent.click(wasteCard);
      
      expect(mockProps.onCardClick).toHaveBeenCalledWith('card3', 'waste', 0, 0);
      
      // Test foundation pile click handler  
      const foundationCard = screen.getByTestId('foundation-card-card4');
      fireEvent.click(foundationCard);
      
      expect(mockProps.onCardClick).toHaveBeenCalledWith('card4', 'foundation', 0, 0);
    });

    it('should handle drag start events with proper card positioning', () => {
      mockProps.getMovableCards.mockReturnValue([mockCards[3]]);
      
      render(<TopPilesSection {...mockProps} />);
      
      const foundationCard = screen.getByTestId('foundation-card-card4');
      fireEvent.mouseDown(foundationCard);
      
      expect(mockProps.getMovableCards).toHaveBeenCalledWith({
        pileType: 'foundation',
        pileIndex: 0,
        cardIndex: 0
      });
      
      expect(mockProps.startDrag).toHaveBeenCalledWith(
        [mockCards[3]], 
        { pileType: 'foundation', pileIndex: 0, cardIndex: 0 }, 
        expect.any(Object)
      );
    });
  });

  describe('Responsive Layout', () => {
    it('should apply responsive layout classes', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const container = screen.getByRole('region').parentElement;
      expect(container).toHaveClass('w-full', 'max-w-6xl', 'mx-auto', 'px-4', 'xl:px-0');
    });

    it('should apply responsive gap classes', () => {
      render(<TopPilesSection {...mockProps} />);
      
      const leftSection = screen.getByTestId('stock-pile').parentElement;
      expect(leftSection).toHaveClass('gap-2', 'md:gap-4', 'lg:gap-6');
      
      const rightSection = screen.getByTestId('foundation-pile-0').parentElement?.parentElement;
      expect(rightSection).toHaveClass('gap-1', 'md:gap-2', 'lg:gap-3');
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = render(<TopPilesSection {...mockProps} />);
      
      // Same props should not cause re-render issues
      expect(() => {
        rerender(<TopPilesSection {...mockProps} />);
      }).not.toThrow();
    });

    it('should handle large numbers of foundation cards', () => {
      const largeFoundationPile = Array.from({ length: 13 }, (_, i) => ({
        id: `foundation-card-${i}`,
        suit: 'hearts' as const,
        rank: (i + 1).toString() as any,
        faceUp: true
      }));

      const propsWithLargePile = {
        ...mockProps,
        gameState: {
          ...mockGameState,
          foundationPiles: [largeFoundationPile, [], [], []]
        }
      };

      render(<TopPilesSection {...propsWithLargePile} />);
      
      expect(screen.getByTestId('foundation-pile-0')).toHaveTextContent('Foundation 0: 13 cards');
    });
  });
});