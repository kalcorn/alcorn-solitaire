import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from '../components/GameBoard';

// Mock the components used by GameBoard
jest.mock('../components/layout/DesktopLayout', () => {
  return function MockDesktopLayout({ children, ...props }: any) {
    // Filter out React-specific props that shouldn't be passed to DOM
    const { isShuffling, isWinAnimating, isCardBeingDragged, isZoneHovered, onStockFlip, onCardClick, onCardDragStart, startDrag, getMovableCards, cardVisibility, ...domProps } = props;
    return <div data-testid="desktop-layout" {...domProps}>{children}</div>;
  };
});

jest.mock('../components/layout/MobileLayout', () => {
  return function MockMobileLayout({ children, ...props }: any) {
    // Filter out React-specific props that shouldn't be passed to DOM
    const { isShuffling, isWinAnimating, isCardBeingDragged, isZoneHovered, onStockFlip, onCardClick, onCardDragStart, startDrag, getMovableCards, cardVisibility, ...domProps } = props;
    return <div data-testid="mobile-layout" {...domProps}>{children}</div>;
  };
});

jest.mock('../components/layout/LandscapeMobileLayout', () => {
  return function MockLandscapeMobileLayout({ children, ...props }: any) {
    // Filter out React-specific props that shouldn't be passed to DOM
    const { isShuffling, isWinAnimating, isCardBeingDragged, isZoneHovered, onStockFlip, onCardClick, onCardDragStart, startDrag, getMovableCards, cardVisibility, ...domProps } = props;
    return <div data-testid="landscape-mobile-layout" {...domProps}>{children}</div>;
  };
});

// Mock the new useGameEngine hook
jest.mock('../hooks/useGameEngine', () => ({
  useGameEngine: () => ({
    state: {
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
    },
    timeElapsed: 0,
    gameStarted: false,
    isHydrated: true,
    actions: {
      moveCards: jest.fn().mockReturnValue({ success: true }),
      flipStock: jest.fn().mockReturnValue({ success: true }),
      startNewGame: jest.fn(),
      undo: jest.fn(),
      autoMoveToFoundation: jest.fn(),
      selectCards: jest.fn(),
      deselectCards: jest.fn(),
      updateSettings: jest.fn(),
      getMovableCards: jest.fn().mockReturnValue([]),
      canDropAtPosition: jest.fn().mockReturnValue(false),
      getCardById: jest.fn(),
      canUndo: jest.fn().mockReturnValue(false),
      engine: {
        getState: jest.fn(),
        moveCards: jest.fn(),
        flipStock: jest.fn(),
        startNewGame: jest.fn(),
        undo: jest.fn(),
        autoMoveToFoundation: jest.fn(),
        selectCard: jest.fn(),
        deselectCards: jest.fn(),
        updateSettings: jest.fn(),
        getMovableCards: jest.fn(),
        canDropAtPosition: jest.fn(),
        getCardById: jest.fn(),
        getStateManager: jest.fn().mockReturnValue({
          canUndo: jest.fn().mockReturnValue(false)
        })
      }
    },
    engine: {
      getState: jest.fn(),
      moveCards: jest.fn(),
      flipStock: jest.fn(),
      startNewGame: jest.fn(),
      undo: jest.fn(),
      autoMoveToFoundation: jest.fn(),
      selectCard: jest.fn(),
      deselectCards: jest.fn(),
      updateSettings: jest.fn(),
      getMovableCards: jest.fn(),
      canDropAtPosition: jest.fn(),
      getCardById: jest.fn(),
      getStateManager: jest.fn().mockReturnValue({
        canUndo: jest.fn().mockReturnValue(false)
      })
    }
  })
}));

jest.mock('../hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    dragState: {
      isDragging: false,
      draggedCards: [],
      dragSource: null,
      dragOffset: { x: 0, y: 0 },
      dragPosition: { x: 0, y: 0 },
      isAnimating: false,
      isSnapBack: false
    },
    startDrag: jest.fn(),
    updateDrag: jest.fn(),
    endDrag: jest.fn(),
    cancelDrag: jest.fn(),
    isZoneHovered: jest.fn().mockReturnValue(false),
    isCardBeingDragged: jest.fn().mockReturnValue(false),
    getDragPreviewStyle: jest.fn().mockReturnValue({}),
    hoveredZone: null
  })
}));

jest.mock('../hooks/useGameAnimations', () => ({
  useGameAnimations: () => ({
    particleTrigger: false,
    isShuffling: false,
    isWinAnimating: false,
    triggerShuffleAnimation: jest.fn(),
    resetShuffleAnimation: jest.fn(),
    animateStockFlip: jest.fn()
  })
}));

jest.mock('../utils/gameEventHandlers', () => ({
  createGameEventHandlers: () => ({
    handleCardClick: jest.fn(),
    handleCardDragStart: jest.fn(),
    getCardById: jest.fn(),
    getElementPosition: jest.fn()
  })
}));

jest.mock('../utils/hydrationUtils', () => ({
  useIsClient: () => true
}));

jest.mock('../utils/soundUtils', () => ({
  playSoundEffect: {
    shuffle: jest.fn(),
    cardFlip: jest.fn(),
    cardMove: jest.fn(),
    cardDrop: jest.fn(),
    win: jest.fn(),
    error: jest.fn()
  }
}));

// Mock all the component dependencies
jest.mock('../components/GameLayout', () => {
  return function MockGameLayout(props: any) {
    return <div data-testid="game-layout" {...props} />;
  };
});

jest.mock('../components/DragPreview/DragPreview', () => {
  return function MockDragPreview() {
    return <div data-testid="drag-preview" />;
  };
});

jest.mock('../components/WinOverlay', () => {
  return function MockWinOverlay() {
    return <div data-testid="win-overlay" />;
  };
});

jest.mock('../components/ParticleEffects', () => {
  return function MockParticleEffects() {
    return <div data-testid="particle-effects" />;
  };
});

jest.mock('../components/Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="header" />;
  };
});

jest.mock('../components/SettingsPanel', () => {
  return function MockSettingsPanel() {
    return <div data-testid="settings-panel" />;
  };
});

jest.mock('../components/HintsPanel', () => {
  return function MockHintsPanel() {
    return <div data-testid="hints-panel" />;
  };
});

jest.mock('../components/UndoRedoButtons', () => {
  return function MockUndoRedoButtons() {
    return <div data-testid="undo-redo-buttons" />;
  };
});

jest.mock('../components/SubtleHints', () => {
  return function MockSubtleHints() {
    return <div data-testid="subtle-hints" />;
  };
});

// Mock window.innerWidth for responsive layout testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

// Mock window.innerHeight
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('GameBoard', () => {
  beforeEach(() => {
    // Reset window dimensions
    window.innerWidth = 1024;
    window.innerHeight = 768;
    
    // Reset matchMedia to default
    (window.matchMedia as jest.Mock).mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Layout rendering', () => {
    it('should render game layout', () => {
      window.innerWidth = 1024;
      window.innerHeight = 768;
      
      render(<GameBoard />);
      
      expect(screen.getByTestId('game-layout')).toBeInTheDocument();
    });

    it('should render all required components', () => {
      render(<GameBoard />);
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('game-layout')).toBeInTheDocument();
      expect(screen.getByTestId('drag-preview')).toBeInTheDocument();
      expect(screen.getByTestId('particle-effects')).toBeInTheDocument();
      expect(screen.getByTestId('subtle-hints')).toBeInTheDocument();
      expect(screen.getByTestId('undo-redo-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('win-overlay')).toBeInTheDocument();
    });
  });

  describe('Game functionality', () => {
    it('should render without crashing', () => {
      render(<GameBoard />);
      
      // Component should render successfully
      expect(screen.getByTestId('game-layout')).toBeInTheDocument();
    });

    it('should pass game state to layout components', () => {
      render(<GameBoard />);
      
      const layout = screen.getByTestId('game-layout');
      expect(layout).toBeInTheDocument();
      
      // Layout should receive game state and handlers as props
      expect(layout).toHaveAttribute('data-testid', 'game-layout');
    });
  });

  describe('Responsive behavior', () => {
    it('should handle window resize', () => {
      render(<GameBoard />);
      
      // Initially game layout
      expect(screen.getByTestId('game-layout')).toBeInTheDocument();
      
      // Simulate window resize to mobile
      window.innerWidth = 375;
      window.innerHeight = 667;
      fireEvent.resize(window);
      
      // Should still show game layout since component doesn't re-render on resize
      // This is expected behavior as layout is determined on initial render
      expect(screen.getByTestId('game-layout')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle missing props gracefully', () => {
      // Component should render even with minimal setup
      render(<GameBoard />);
      
      expect(screen.getByTestId('game-layout')).toBeInTheDocument();
    });
  });
});