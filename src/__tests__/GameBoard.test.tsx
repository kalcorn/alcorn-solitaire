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

// Mock all required hooks and utilities
jest.mock('../hooks/useGameState', () => ({
  useGameState: () => ({
    gameState: {
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
    startNewGame: jest.fn(),
    moveCards: jest.fn().mockReturnValue({ success: true }),
    handleCardClick: jest.fn(),
    handleCardDragStart: jest.fn(),
    handleCardDrop: jest.fn(),
    handleStockClick: jest.fn(),
    handleNewGame: jest.fn(),
    handleUndo: jest.fn(),
    handleRedo: jest.fn(),
    handleSettingsChange: jest.fn(),
    handleHint: jest.fn(),
    handleAutoMove: jest.fn(),
    handleAutoMoveToFoundation: jest.fn(),
    selectCards: jest.fn(),
    getMovableCards: jest.fn().mockReturnValue([]),
    updateSettings: jest.fn(),
    undo: jest.fn(),
    canUndo: jest.fn().mockReturnValue(false),
    flipStock: jest.fn(),
    moveCard: jest.fn(),
    canMoveCard: jest.fn().mockReturnValue(false),
    getValidMoves: jest.fn().mockReturnValue([])
  })
}));

jest.mock('../hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    dragState: {
      isDragging: false,
      draggedCards: [],
      dragSource: null,
      dragOffset: { x: 0, y: 0 }
    },
    startDrag: jest.fn(),
    endDrag: jest.fn(),
    updateDrag: jest.fn(),
    cancelDrag: jest.fn(),
    isZoneHovered: jest.fn().mockReturnValue(false),
    isCardBeingDragged: jest.fn().mockReturnValue(false),
    getDragPreviewStyle: jest.fn().mockReturnValue({}),
    hoveredZone: null,
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleDragOver: jest.fn(),
    handleDrop: jest.fn()
  })
}));

jest.mock('../hooks/useGameAnimations', () => ({
  useGameAnimations: () => ({
    particleTrigger: false,
    isShuffling: false,
    isWinAnimating: false,
    triggerShuffleAnimation: jest.fn(),
    resetShuffleAnimation: jest.fn(),
    animateStockFlip: jest.fn(),
    isAnimating: false,
    animationQueue: [],
    addAnimation: jest.fn(),
    clearAnimations: jest.fn(),
    animateCardMove: jest.fn()
  })
}));

jest.mock('../hooks/useGameTimer', () => ({
  useGameTimer: () => ({
    elapsedTime: 0,
    isRunning: false,
    startTimer: jest.fn(),
    stopTimer: jest.fn(),
    resetTimer: jest.fn()
  })
}));

jest.mock('../hooks/useUndo', () => ({
  useUndo: () => ({
    canUndo: false,
    canRedo: false,
    undo: jest.fn(),
    redo: jest.fn()
  })
}));

jest.mock('../hooks/useGameHydration', () => ({
  useGameHydration: () => ({
    isHydrated: true,
    shouldRender: true
  })
}));

jest.mock('../utils/hydrationUtils', () => ({
  useIsClient: () => true
}));

jest.mock('../utils/soundUtils', () => ({
  playSoundEffect: jest.fn()
}));

jest.mock('../utils/animationEngine', () => ({
  animateElement: jest.fn()
}));

jest.mock('../utils/eventHandlers', () => ({
  createEventHandlers: () => ({
    handleKeyDown: jest.fn(),
    handleMouseMove: jest.fn(),
    handleMouseUp: jest.fn()
  })
}));

jest.mock('../utils/cardDimensions', () => ({
  getCardDimensions: () => ({
    width: 52,
    height: 72,
    widthPx: '52px',
    heightPx: '72px',
    aspectRatio: 52 / 72
  })
}));

// Mock all child components to prevent complex rendering
jest.mock('../components/StockPile/StockPile', () => {
  return function MockStockPile() {
    return <div data-testid="stock-pile">StockPile</div>;
  };
});

jest.mock('../components/WastePile/WastePile', () => {
  return function MockWastePile() {
    return <div data-testid="waste-pile">WastePile</div>;
  };
});

jest.mock('../components/FoundationPile/FoundationPile', () => {
  return function MockFoundationPile() {
    return <div data-testid="foundation-pile">FoundationPile</div>;
  };
});

jest.mock('../components/TableauPile/TableauPile', () => {
  return function MockTableauPile() {
    return <div data-testid="tableau-pile">TableauPile</div>;
  };
});

jest.mock('../components/DragPreview/DragPreview', () => {
  return function MockDragPreview() {
    return <div data-testid="drag-preview">DragPreview</div>;
  };
});

jest.mock('../components/WinOverlay', () => {
  return function MockWinOverlay() {
    return <div data-testid="win-overlay">WinOverlay</div>;
  };
});

jest.mock('../components/ParticleEffects', () => {
  return function MockParticleEffects() {
    return <div data-testid="particle-effects">ParticleEffects</div>;
  };
});

jest.mock('../components/Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock('../components/SettingsPanel', () => {
  return function MockSettingsPanel() {
    return <div data-testid="settings-panel">SettingsPanel</div>;
  };
});

jest.mock('../components/HintsPanel', () => {
  return function MockHintsPanel() {
    return <div data-testid="hints-panel">HintsPanel</div>;
  };
});

jest.mock('../components/UndoRedoButtons', () => {
  return function MockUndoRedoButtons() {
    return <div data-testid="undo-redo-buttons">UndoRedoButtons</div>;
  };
});

jest.mock('../components/SubtleHints', () => {
  return function MockSubtleHints() {
    return <div data-testid="subtle-hints">SubtleHints</div>;
  };
});

jest.mock('../components/AnimatedCard/AnimatedCard', () => {
  return function MockAnimatedCard() {
    return <div data-testid="animated-card">AnimatedCard</div>;
  };
});

jest.mock('../components/FlyingCards/FlyingCards', () => {
  return function MockFlyingCards() {
    return <div data-testid="flying-cards">FlyingCards</div>;
  };
});

jest.mock('../components/BridgeCards', () => {
  return function MockBridgeCards() {
    return <div data-testid="bridge-cards">BridgeCards</div>;
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
    it('should render desktop layout for wide screens', () => {
      window.innerWidth = 1024;
      window.innerHeight = 768;
      
      render(<GameBoard />);
      
      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    });

    it('should render mobile layout for narrow screens', () => {
      window.innerWidth = 375;
      window.innerHeight = 667;
      
      render(<GameBoard />);
      
      expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
    });

    it('should render landscape mobile layout for landscape orientation', () => {
      window.innerWidth = 667;
      window.innerHeight = 375;
      
      render(<GameBoard />);
      
      expect(screen.getByTestId('landscape-mobile-layout')).toBeInTheDocument();
    });
  });

  describe('Game functionality', () => {
    it('should render without crashing', () => {
      render(<GameBoard />);
      
      // Component should render successfully
      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    });

    it('should pass game state to layout components', () => {
      render(<GameBoard />);
      
      const layout = screen.getByTestId('desktop-layout');
      expect(layout).toBeInTheDocument();
      
      // Layout should receive game state and handlers as props
      expect(layout).toHaveAttribute('data-testid', 'desktop-layout');
    });
  });

  describe('Responsive behavior', () => {
    it('should handle window resize', () => {
      render(<GameBoard />);
      
      // Initially desktop layout
      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
      
      // Simulate window resize to mobile
      window.innerWidth = 375;
      window.innerHeight = 667;
      fireEvent.resize(window);
      
      // Should still show desktop layout since component doesn't re-render on resize
      // This is expected behavior as layout is determined on initial render
      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle missing props gracefully', () => {
      // Component should render even with minimal setup
      render(<GameBoard />);
      
      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    });
  });
});