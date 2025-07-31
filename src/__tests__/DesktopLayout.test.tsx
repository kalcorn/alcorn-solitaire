import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DesktopLayout from '../components/layout/DesktopLayout';
import { GameState } from '@/types';

// Mock child components to avoid complex dependencies
jest.mock('../components/layout/TopPilesSection', () => {
  return function MockTopPilesSection(props: any) {
    return <div data-testid="top-piles-section">Top Piles Section</div>;
  };
});

jest.mock('../components/layout/TableauSection', () => {
  return function MockTableauSection(props: any) {
    return (
      <div data-testid="tableau-section">
        Tableau Section
        {props.children}
      </div>
    );
  };
});

describe('DesktopLayout Component', () => {
  const mockGameState: GameState = {
    stockPile: [],
    wastePile: [],
    foundationPiles: [[], [], [], []],
    tableauPiles: [[], [], [], [], [], [], []],
    moves: 0,
    score: 0,
    isGameWon: false,
    selectedCards: [],
    selectedPileType: null,
    selectedPileIndex: null,
    stockCycles: 0,
    settings: {
      deckCyclingLimit: 0,
      drawCount: 1,
      autoMoveToFoundation: false,
      soundEnabled: true,
      showHints: true
    },
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      bestTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageMoves: 0,
      totalMoves: 0,
      lastPlayed: 0
    },
    history: [],
    historyIndex: -1,
    gameStartTime: Date.now()
  };

  const mockProps = {
    gameState: mockGameState,
    isShuffling: false,
    isWinAnimating: false,
    isCardBeingDragged: jest.fn(() => false),
    isZoneHovered: jest.fn(() => false),
    onStockFlip: jest.fn(),
    onCardClick: jest.fn(),
    onCardDragStart: jest.fn(),
    startDrag: jest.fn(),
    getMovableCards: jest.fn(() => []),
    cardVisibility: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<DesktopLayout {...mockProps} />);
      
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
      expect(screen.getByTestId('tableau-section')).toBeInTheDocument();
    });

    it('should render main sections correctly', () => {
      render(<DesktopLayout {...mockProps} />);
      
      const topPiles = screen.getByTestId('top-piles-section');
      const tableau = screen.getByTestId('tableau-section');
      
      expect(topPiles).toBeInTheDocument();
      expect(tableau).toBeInTheDocument();
      expect(topPiles).toHaveTextContent('Top Piles Section');
      expect(tableau).toHaveTextContent('Tableau Section');
    });

    it('should apply desktop layout structure', () => {
      render(<DesktopLayout {...mockProps} />);
      
      // Should render main layout structure
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
      expect(screen.getByTestId('tableau-section')).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('should have proper HTML structure', () => {
      render(<DesktopLayout {...mockProps} />);
      
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
      expect(screen.getByTestId('tableau-section')).toBeInTheDocument();
    });

    it('should pass props to child components', () => {
      render(<DesktopLayout {...mockProps} />);
      
      // Child components should receive props and render
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
      expect(screen.getByTestId('tableau-section')).toBeInTheDocument();
    });

    it('should handle game state prop changes', () => {
      const { rerender } = render(<DesktopLayout {...mockProps} />);
      
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
      
      // Update game state
      const newGameState = { ...mockGameState, moves: 5, score: 100 };
      rerender(<DesktopLayout {...mockProps} gameState={newGameState} />);
      
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('should handle different screen sizes', () => {
      // Mock large desktop screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });

      render(<DesktopLayout {...mockProps} />);
      
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
    });

    it('should handle medium desktop screen', () => {
      // Mock medium desktop screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      render(<DesktopLayout {...mockProps} />);
      
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(<DesktopLayout {...mockProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly (less than 100ms)
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle props without children', () => {
      render(<DesktopLayout {...mockProps} />);
      
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
      expect(screen.getByTestId('tableau-section')).toBeInTheDocument();
    });

    it('should handle undefined optional props', () => {
      const propsWithoutOptional = {
        gameState: mockGameState,
        isShuffling: false,
        isWinAnimating: false,
        isCardBeingDragged: jest.fn(),
        isZoneHovered: jest.fn(),
        onStockFlip: jest.fn(),
        onCardClick: jest.fn(),
        onCardDragStart: jest.fn(),
        startDrag: jest.fn(),
        getMovableCards: jest.fn()
        // cardVisibility is optional
      };

      render(<DesktopLayout {...propsWithoutOptional} />);
      
      expect(screen.getByTestId('top-piles-section')).toBeInTheDocument();
      expect(screen.getByTestId('tableau-section')).toBeInTheDocument();
    });
  });
});