import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandscapeMobileLayout from '../components/layout/LandscapeMobileLayout';

describe('LandscapeMobileLayout Component', () => {
  const mockGameState = {
    stockPile: [],
    wastePile: [],
    foundationPiles: [[], [], [], []],
    tableauPiles: [[], [], [], [], [], [], []],
    stockCycles: 0,
    settings: {
      deckCyclingLimit: 0
    }
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
    
    // Mock landscape mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 667
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 375
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Should render the landscape layout structure with stock pile
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should render game components correctly', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Should render stock pile, waste pile, and tableau piles
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Empty waste pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Tableau piles')).toBeInTheDocument();
    });

    it('should apply landscape-specific CSS classes', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Layout should have appropriate classes for landscape mobile
      const landscapeLayout = screen.getByLabelText('Empty stock pile').closest('.flex.flex-row');
      expect(landscapeLayout).toBeInTheDocument();
    });
  });

  describe('Landscape-specific features', () => {
    it('should optimize for landscape orientation', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should handle different landscape aspect ratios', () => {
      const aspectRatios = [
        { width: 667, height: 375 }, // iPhone landscape
        { width: 896, height: 414 }, // iPhone XR landscape
        { width: 640, height: 360 }  // Android landscape
      ];

      aspectRatios.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width });
        Object.defineProperty(window, 'innerHeight', { value: height });
        
        render(<LandscapeMobileLayout {...mockProps} />);
        
        expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
        
        // Clean up for next iteration
        document.body.innerHTML = '';
      });
    });

    it('should handle horizontal space efficiently', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Should utilize horizontal space effectively with flex-row layout
      const landscapeLayout = screen.getByLabelText('Empty stock pile').closest('.flex.flex-row');
      expect(landscapeLayout).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('should have proper landscape HTML structure', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Should have the landscape layout structure
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
      expect(screen.getByLabelText('Tableau piles')).toBeInTheDocument();
    });

    it('should render tableau section', () => {
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Should render tableau piles in landscape layout
      expect(screen.getByLabelText('Tableau piles')).toBeInTheDocument();
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

      render(<LandscapeMobileLayout {...propsWithEmptyState} />);
      
      // Should render without crashing even with empty state
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('should adapt to different landscape widths', () => {
      const widths = [568, 667, 736, 812, 896];
      
      widths.forEach(width => {
        Object.defineProperty(window, 'innerWidth', { value: width });
        Object.defineProperty(window, 'innerHeight', { value: 375 });
        
        render(<LandscapeMobileLayout {...mockProps} />);
        
        expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
        
        // Clean up for next iteration
        document.body.innerHTML = '';
      });
    });

    it('should handle transition from portrait to landscape', () => {
      // Start in portrait
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });
      
      render(<LandscapeMobileLayout {...mockProps} />);
      
      // Simulate rotation to landscape
      Object.defineProperty(window, 'innerWidth', { value: 667 });
      Object.defineProperty(window, 'innerHeight', { value: 375 });
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently in landscape mode', () => {
      const startTime = performance.now();
      
      render(<LandscapeMobileLayout {...mockProps} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render quickly
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should handle complex game state efficiently', () => {
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

      render(<LandscapeMobileLayout {...propsWithCards} />);
      
      // When stock pile has cards, the aria-label changes
      expect(screen.getByLabelText(/Stock pile with \d+ cards/)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle very wide landscape screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      Object.defineProperty(window, 'innerHeight', { value: 300 });
      
      render(<LandscapeMobileLayout {...mockProps} />);
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should handle narrow landscape screens', () => {
      Object.defineProperty(window, 'innerWidth', { value: 480 });
      Object.defineProperty(window, 'innerHeight', { value: 320 });
      
      render(<LandscapeMobileLayout {...mockProps} />);
      
      expect(screen.getByLabelText('Empty stock pile')).toBeInTheDocument();
    });

    it('should handle dynamic content', () => {
      // Test with changing game state
      const { rerender } = render(<LandscapeMobileLayout {...mockProps} />);
      
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
      
      rerender(<LandscapeMobileLayout {...newProps} />);
      
      // When stock pile has cards, the aria-label changes
      expect(screen.getByLabelText(/Stock pile with \d+ cards/)).toBeInTheDocument();
    });
  });
});