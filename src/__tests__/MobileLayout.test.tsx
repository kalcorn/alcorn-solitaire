import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileLayout from '../components/layout/MobileLayout';

describe('MobileLayout Component', () => {
  const mockGameState = {
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
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Should render the mobile layout structure with stock pile
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should render game components correctly', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Should render stock pile, waste pile, and foundation piles
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Empty waste pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Hearts suit pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Diamonds suit pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Clubs suit pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Spades suit pile')).toBeInTheDocument();
    });

    it('should apply mobile-specific CSS classes', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Layout should have appropriate classes for mobile
      const mobileLayout = screen.getByLabelText('Empty stock pile').closest('.block.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();
    });
  });

  describe('Mobile-specific features', () => {
    it('should handle touch interactions', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Should render elements that are touch-friendly
      const stockPile = screen.getByLabelText('Empty stock pile');
      expect(stockPile).toBeInTheDocument();
      expect(stockPile).toHaveAttribute('role', 'button');
    });

    it('should optimize for small screens', () => {
      // Test very small mobile screen
      Object.defineProperty(window, 'innerWidth', {
        value: 320
      });
      
      render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should handle portrait orientation', () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 812 });
      
      render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('should have proper mobile HTML structure', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Should have the mobile layout structure
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Empty waste pile')).toBeInTheDocument();
    });

    it('should render tableau section', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Should render tableau piles
      const tableauPiles = screen.getAllByLabelText('Play pile');
      expect(tableauPiles).toHaveLength(7);
    });

    it('should handle empty game state gracefully', () => {
      const emptyGameState = {
        ...mockGameState,
        stockPile: [],
        wastePile: [],
        foundationPiles: [[], [], [], []],
        tableauPiles: [[], [], [], [], [], [], []]
      };

      const propsWithEmptyState = {
        ...mockProps,
        gameState: emptyGameState
      };

      render(<MobileLayout {...propsWithEmptyState} />);
      
      // Should render without crashing even with empty state
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });
  });

  describe('Viewport handling', () => {
    it('should handle different mobile screen sizes', () => {
      const screenSizes = [
        { width: 320, height: 568 }, // iPhone 5/SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone XR
        { width: 360, height: 640 }  // Android
      ];

      screenSizes.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width });
        Object.defineProperty(window, 'innerHeight', { value: height });
        
        render(<MobileLayout {...mockProps} />);
        
        expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
        
        // Clean up for next iteration
        document.body.innerHTML = '';
      });
    });

    it('should handle viewport meta changes', () => {
      render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });
  });

  describe('Performance on mobile', () => {
    it('should render efficiently on mobile', () => {
      const startTime = performance.now();
      
      render(<MobileLayout {...mockProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly even on mobile
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should handle memory constraints', () => {
      // Test with a game state that has many cards
      const gameStateWithCards = {
        ...mockGameState,
        stockPile: Array.from({ length: 52 }, (_, i) => ({
          id: `card-${i}`,
          suit: 'hearts' as const,
          rank: (i % 13) + 1,
          faceUp: false
        }))
      };

      const propsWithCards = {
        ...mockProps,
        gameState: gameStateWithCards
      };

      render(<MobileLayout {...propsWithCards} />);
      
      // When stock pile has cards, the aria-label changes
      expect(screen.getByLabelText(/Stock pile with \d+ cards/)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle orientation changes', () => {
      render(<MobileLayout {...mockProps} />);
      
      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', { value: 667 });
      Object.defineProperty(window, 'innerHeight', { value: 375 });
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should handle dynamic content', () => {
      // Test with changing game state
      const { rerender } = render(<MobileLayout {...mockProps} />);
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
      
      // Change game state
      const newGameState = {
        ...mockGameState,
        stockPile: [{ id: 'card-1', suit: 'hearts' as const, rank: 1, faceUp: true }]
      };
      
      const newProps = {
        ...mockProps,
        gameState: newGameState
      };
      
      rerender(<MobileLayout {...newProps} />);
      
      // When stock pile has cards, the aria-label changes
      expect(screen.getByLabelText(/Stock pile with \d+ cards/)).toBeInTheDocument();
    });
  });
});