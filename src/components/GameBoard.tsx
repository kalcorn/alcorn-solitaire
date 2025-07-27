import React from 'react';
import Header from './Header';
import TableauPile from './TableauPile';
import FoundationPile from './FoundationPile';
import StockPile from './StockPile';
import WastePile from './WastePile';
import DragPreview from './DragPreview';
import ParticleEffects from './ParticleEffects';
import SubtleHints from './SubtleHints';
import UndoRedoButtons from './UndoRedoButtons';
import { useGameState } from '@/hooks/useGameState';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { playSoundEffect } from '@/utils/soundUtils';
import { Card as CardType, CardPosition, GameState } from '@/types';
import { useIsClient } from '@/utils/hydrationUtils';
import { useGameAnimations } from '@/hooks/useGameAnimations';
import Card from './Card';

const GameBoard: React.FC = () => {
  const isClient = useIsClient();
  const {
    gameState,
    timeElapsed,
    startNewGame,
    moveCards,
    handleStockFlip,
    handleAutoMoveToFoundation,
    selectCards,
    getMovableCards,
    updateSettings,
    undo: performUndo, // Renamed to avoid conflict with canUndo
    canUndo
  } = useGameState();

  const {
    particleTrigger,
    setParticleTrigger,
    isShuffling,
    setIsShuffling,
    isWinAnimating,
    setIsWinAnimating
  } = useGameAnimations(gameState);
  const [lastClickTime, setLastClickTime] = React.useState(0);
  const [lastClickedCardId, setLastClickedCardId] = React.useState<string | null>(null);
  const [animatingCard, setAnimatingCard] = React.useState<null | { 
    card: CardType; 
    type: 'stockToWaste' | 'wasteToStock';
    startPosition?: { x: number; y: number };
    endPosition?: { x: number; y: number };
    isLandscapeMobile?: boolean;
  }>(null);

  const {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    isZoneHovered,
    isCardBeingDragged,
    getDragPreviewStyle,
    hoveredZone
  } = useDragAndDrop();

  const handleCardClick = (cardId: string, pileType: 'tableau' | 'foundation' | 'waste', pileIndex: number, cardIndex: number) => {
    const currentTime = Date.now();
    const isDoubleClick = currentTime - lastClickTime < 500 && lastClickedCardId === cardId;
    
    setLastClickTime(currentTime);
    setLastClickedCardId(cardId);
    
    if (isDoubleClick) {
      // Double-click to auto-move to foundation
      const card = getCardById(cardId);
      if (card) {
        const result = handleAutoMoveToFoundation(card);
        if (result.success) {
          return;
        }
      }
    }
    
    // Try auto-move to foundation on single click first
    const card = getCardById(cardId);
    if (card) {
      const result = handleAutoMoveToFoundation(card);
      if (result.success) {
        return;
      }
    }
    
    // If auto-move failed, proceed with selection
    const movableCards = getMovableCards({ pileType, pileIndex, cardIndex });
    if (movableCards.length > 0) {
      selectCards({ pileType, pileIndex, cardIndex }, movableCards);
    }
  };

  const handleDrop = (source: CardPosition, target: CardPosition, cards: CardType[]) => {
    const result = moveCards(source, target, cards);
    if (result.success) {
      // Trigger sparkle effect for valid moves
      setParticleTrigger({ 
        type: 'validMove', 
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 } 
      });
      // Clear trigger after a brief delay
      setTimeout(() => setParticleTrigger({ type: null }), 100);
    }
    return result;
  };

  const getCardById = (cardId: string): CardType | null => {
    // Search all piles for the card
    for (const pile of gameState.tableauPiles) {
      const card = pile.find(c => c.id === cardId);
      if (card) return card;
    }
    for (const pile of gameState.foundationPiles) {
      const card = pile.find(c => c.id === cardId);
      if (card) return card;
    }
    const wasteCard = gameState.wastePile.find(c => c.id === cardId);
    if (wasteCard) return wasteCard;
    return null;
  };

  // Get DOM element positions for animation
  const getElementPosition = (selector: string) => {
    const element = document.querySelector(selector);
    if (!element) {
      console.log(`Element not found: ${selector}`);
      return { x: 0, y: 0 };
    }
    const rect = element.getBoundingClientRect();
    console.log(`Position for ${selector}:`, { x: rect.left, y: rect.top, width: rect.width, height: rect.height });
    return { x: rect.left, y: rect.top };
  };

  // Animated stock flip handler
  const handleAnimatedStockFlip = () => {
    if (animatingCard) return;
    
    // Determine animation type based on stock pile state
    const isRecycling = gameState.stockPile.length === 0;
    
    // Check if we're in landscape mobile layout - match CSS media query exactly
    const isLandscapeMobile = window.innerHeight <= 500 && window.innerWidth >= 640 && window.innerWidth <= 1024;
    
    // Get actual positions of stock and waste piles - try multiple selectors for different layouts
    let stockPosition = getElementPosition('.standard-layout .stock-pile-responsive .card');
    if (stockPosition.x === 0 && stockPosition.y === 0) {
      stockPosition = getElementPosition('.standard-layout .stock-pile-responsive');
    }
    if (stockPosition.x === 0 && stockPosition.y === 0) {
      stockPosition = getElementPosition('.landscape-mobile-left-sidebar .stock-pile-responsive .card');
    }
    if (stockPosition.x === 0 && stockPosition.y === 0) {
      stockPosition = getElementPosition('.landscape-mobile-left-sidebar .stock-pile-responsive');
    }
    
    let wastePosition = getElementPosition('.standard-layout .waste-pile-responsive .card');
    if (wastePosition.x === 0 && wastePosition.y === 0) {
      wastePosition = getElementPosition('.standard-layout .waste-pile-responsive');
    }
    if (wastePosition.x === 0 && wastePosition.y === 0) {
      wastePosition = getElementPosition('.landscape-mobile-left-sidebar .waste-pile-responsive .card');
    }
    if (wastePosition.x === 0 && wastePosition.y === 0) {
      wastePosition = getElementPosition('.landscape-mobile-left-sidebar .waste-pile-responsive');
    }
    
    if (isRecycling) {
      // Animate waste to stock (recycle) - only ghost card, no pile animations
      if (gameState.wastePile.length === 0) return;
      const card = gameState.wastePile[gameState.wastePile.length - 1];
      setAnimatingCard({ 
        card, 
        type: 'wasteToStock',
        startPosition: wastePosition,
        endPosition: stockPosition,
        isLandscapeMobile
      });
      setTimeout(() => {
        setAnimatingCard(null);
        handleStockFlip();
      }, 600);
    } else {
      // Animate stock to waste - only ghost card, no pile animations
      if (gameState.stockPile.length === 0) return;
      const card = gameState.stockPile[gameState.stockPile.length - 1];
      setAnimatingCard({ 
        card, 
        type: 'stockToWaste',
        startPosition: stockPosition,
        endPosition: wastePosition,
        isLandscapeMobile
      });
      setTimeout(() => {
        setAnimatingCard(null);
        handleStockFlip();
      }, 400);
    }
  };

  // Animated new game handler with shuffle effect
  const handleAnimatedNewGame = () => {
    if (isShuffling) return;
    
    setIsShuffling(true);
    setTimeout(() => {
      startNewGame();
      setTimeout(() => {
        setIsShuffling(false);
      }, 1200);
    }, 100);
  };

  // Global mouse/touch event handlers for drag and drop
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateDrag(e as any);
    };

    const handleMouseUp = () => {
      endDrag(handleDrop);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      updateDrag(e as any);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      endDrag(handleDrop);
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [dragState.isDragging, updateDrag, endDrag]);

  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Space or Enter to activate focused element
      if (event.key === ' ' || event.key === 'Enter') {
        const focusedElement = document.activeElement as HTMLElement;
        if (focusedElement?.getAttribute('role') === 'button') {
          event.preventDefault();
          focusedElement.click();
        }
      }
      
      // Escape to cancel drag operation
      if (event.key === 'Escape' && dragState.isDragging) {
        cancelDrag();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dragState.isDragging, cancelDrag]);

  return (
    <>
      <Header 
        timeElapsed={isClient ? timeElapsed : 0}
        moves={isClient ? gameState.moves : 0}
        score={isClient ? gameState.score : 0}
        onNewGame={handleAnimatedNewGame}
        settings={gameState.settings}
        onSettingsChange={updateSettings}
      />
      <div 
        className={` w-full flex grow flex-col items-center bg-transparent ${!isClient ? 'hydration-loading' : ''}`}
        role="main"
        aria-label="Solitaire game board"
      >
        {/* Top Piles Section - Full Width Background */}
        <div className="standard-layout w-full  bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-opacity-90 from-slate-800 via-green-900 to-slate-800 bg-opacity-90 py-4 mb-0 md:mb-4 lg:mb-6 shadow-lg border-y border-slate-600/30">
          <div className="w-full max-w-6xl mx-auto px-4 xl:px-0">
            <div 
              className="flex flex-row items-start justify-between w-full"
              role="region"
              aria-label="Stock, waste, and foundation piles"
            >
              <div className="flex flex-row items-center gap-2 md:gap-4 lg:gap-6 flex-shrink-0">
                <StockPile 
                  cards={gameState.stockPile} 
                  onClick={handleAnimatedStockFlip}
                  cyclesRemaining={gameState.settings.deckCyclingLimit > 0 ? 
                    Math.max(0, gameState.settings.deckCyclingLimit - gameState.stockCycles) : 
                    undefined}
                  canCycle={gameState.settings.deckCyclingLimit === 0 || 
                    gameState.stockCycles < gameState.settings.deckCyclingLimit}
                  wasteCardCount={gameState.wastePile.length}
                  isShuffling={isShuffling}
                />
                <WastePile 
                  cards={gameState.wastePile}
                  onCardClick={(cardId) => {
                    const cardIndex = gameState.wastePile.findIndex(c => c.id === cardId);
                    if (cardIndex !== -1) {
                      handleCardClick(cardId, 'waste', 0, cardIndex);
                    }
                  }}
                  onCardDragStart={(cardId, event) => {
                    const cardIndex = gameState.wastePile.findIndex(c => c.id === cardId);
                    if (cardIndex !== -1) {
                      const movableCards = getMovableCards({ pileType: 'waste', pileIndex: 0, cardIndex });
                      if (movableCards.length > 0) {
                        startDrag(movableCards, { pileType: 'waste', pileIndex: 0, cardIndex }, event);
                      }
                    }
                  }}
                  isCardBeingDragged={isCardBeingDragged}
                />
              </div>
              <div className="flex flex-row items-center gap-1 md:gap-2 lg:gap-3 flex-shrink-0">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    data-drop-zone
                    data-pile-type="foundation"
                    data-pile-index={i}
                    className={`${dragState.isDragging && isZoneHovered('foundation', i) ? 'drop-zone' : ''} ${isWinAnimating ? 'foundation-win-cascade' : ''}`}
                  >
                    <FoundationPile 
                      index={i} 
                      cards={gameState.foundationPiles[i]}
                      onCardClick={(cardId) => {
                        const cardIndex = gameState.foundationPiles[i].findIndex(c => c.id === cardId);
                        if (cardIndex !== -1) {
                          handleCardClick(cardId, 'foundation', i, cardIndex);
                        }
                      }}
                      onCardDragStart={(cardId, event) => {
                        const cardIndex = gameState.foundationPiles[i].findIndex(c => c.id === cardId);
                        if (cardIndex !== -1) {
                          const movableCards = getMovableCards({ pileType: 'foundation', pileIndex: i, cardIndex });
                          if (movableCards.length > 0) {
                            startDrag(movableCards, { pileType: 'foundation', pileIndex: i, cardIndex }, event);
                          }
                        }
                      }}
                      isDropZone={dragState.isDragging && isZoneHovered('foundation', i)}
                      isCardBeingDragged={isCardBeingDragged}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex grow max-w-6xl mx-auto px-4 xl:px-0">
          <div className="card-playing-area flex flex-col grow gap-3 w-full pt-6 md:pt-0 lg:pt-0">

            {/* Landscape Mobile: Left Side Piles (Stock, Waste) */}
            <div className="landscape-mobile-left-sidebar bg-gradient-to-b from-emerald-900 to-green-900 bg-opacity-40 p-3 shadow-lg border border-green-700 border-opacity-30">
              <div className="flex flex-col gap-2">
                <StockPile 
                  cards={gameState.stockPile} 
                  onClick={handleAnimatedStockFlip}
                  cyclesRemaining={gameState.settings.deckCyclingLimit > 0 ? 
                    Math.max(0, gameState.settings.deckCyclingLimit - gameState.stockCycles) : 
                    undefined}
                  canCycle={gameState.settings.deckCyclingLimit === 0 || 
                    gameState.stockCycles < gameState.settings.deckCyclingLimit}
                  wasteCardCount={gameState.wastePile.length}
                  isShuffling={isShuffling}
                />
                <WastePile 
                  cards={gameState.wastePile}
                  onCardClick={(cardId) => {
                    const cardIndex = gameState.wastePile.findIndex(c => c.id === cardId);
                    if (cardIndex !== -1) {
                      handleCardClick(cardId, 'waste', 0, cardIndex);
                    }
                  }}
                  onCardDragStart={(cardId, event) => {
                    const cardIndex = gameState.wastePile.findIndex(c => c.id === cardId);
                    if (cardIndex !== -1) {
                      const movableCards = getMovableCards({ pileType: 'waste', pileIndex: 0, cardIndex });
                      if (movableCards.length > 0) {
                        startDrag(movableCards, { pileType: 'waste', pileIndex: 0, cardIndex }, event);
                      }
                    }
                  }}
                  isCardBeingDragged={isCardBeingDragged}
                />
              </div>
            </div>

            {/* Landscape Mobile: Center Tableau with Increased Size */}
            <div className="landscape-mobile-tableau flex-1 flex justify-center">
              <div 
              className="landscape-tableau-center justify-between w-full max-w-4xl"
              role="region"
              aria-label="Tableau piles"
            >
                {gameState.tableauPiles.map((pile, i) => (
                  <div 
                    key={i} 
                    className={`flex-shrink-0 tableau-pile tableau-container ${dragState.isDragging && isZoneHovered('tableau', i) ? 'drop-zone' : ''}`}
                    data-drop-zone
                    data-pile-type="tableau"
                    data-pile-index={i}
                  >
                    <TableauPile 
                      cards={pile}
                      isDropZone={dragState.isDragging && isZoneHovered('tableau', i)}
                      onCardClick={(cardId) => {
                        const cardIndex = pile.findIndex(c => c.id === cardId);
                        if (cardIndex !== -1) {
                          handleCardClick(cardId, 'tableau', i, cardIndex);
                        }
                      }}
                      onCardDragStart={(cardId, event) => {
                        const cardIndex = pile.findIndex(c => c.id === cardId);
                        if (cardIndex !== -1) {
                          const movableCards = getMovableCards({ pileType: 'tableau', pileIndex: i, cardIndex });
                          if (movableCards.length > 0) {
                            startDrag(movableCards, { pileType: 'tableau', pileIndex: i, cardIndex }, event);
                          }
                        }
                      }}
                      isCardBeingDragged={isCardBeingDragged}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Landscape Mobile: Right Side Foundation Piles */}
            <div className="landscape-mobile-right-sidebar bg-gradient-to-b from-emerald-900 to-green-900 bg-opacity-40 p-3 shadow-lg border border-green-700 border-opacity-30">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    data-drop-zone
                    data-pile-type="foundation"
                    data-pile-index={i}
                    className={`${dragState.isDragging && isZoneHovered('foundation', i) ? 'drop-zone' : ''} ${isWinAnimating ? 'foundation-win-cascade' : ''}`}
                  >
                    <FoundationPile 
                      index={i} 
                      cards={gameState.foundationPiles[i]}
                      onCardClick={(cardId) => {
                        const cardIndex = gameState.foundationPiles[i].findIndex(c => c.id === cardId);
                        if (cardIndex !== -1) {
                          handleCardClick(cardId, 'foundation', i, cardIndex);
                        }
                      }}
                      onCardDragStart={(cardId, event) => {
                        const cardIndex = gameState.foundationPiles[i].findIndex(c => c.id === cardId);
                        if (cardIndex !== -1) {
                          const movableCards = getMovableCards({ pileType: 'foundation', pileIndex: i, cardIndex });
                          if (movableCards.length > 0) {
                            startDrag(movableCards, { pileType: 'foundation', pileIndex: i, cardIndex }, event);
                          }
                        }
                      }}
                      isDropZone={dragState.isDragging && isZoneHovered('foundation', i)}
                      isCardBeingDragged={isCardBeingDragged}
                    />
                  </div>
                ))}
            </div>

            {/* Tableau Section - Standard Tableau for Desktop/Portrait Mobile */}
            <div className="standard-tableau desktop-tableau justify-between w-full">
              {gameState.tableauPiles.map((pile, i) => (
                <div 
                  key={i} 
                  className={`flex-shrink-0 tableau-pile tableau-container ${isZoneHovered('tableau', i) ? 'drop-zone' : ''}`}
                  data-drop-zone
                  data-pile-type="tableau"
                  data-pile-index={i}
                >
                  <TableauPile 
                    cards={pile}
                    isDropZone={isZoneHovered('tableau', i)}
                    onCardClick={(cardId) => {
                      const cardIndex = pile.findIndex(c => c.id === cardId);
                      if (cardIndex !== -1) {
                        handleCardClick(cardId, 'tableau', i, cardIndex);
                      }
                    }}
                    onCardDragStart={(cardId, event) => {
                      const cardIndex = pile.findIndex(c => c.id === cardId);
                      if (cardIndex !== -1) {
                        const movableCards = getMovableCards({ pileType: 'tableau', pileIndex: i, cardIndex });
                        if (movableCards.length > 0) {
                          startDrag(movableCards, { pileType: 'tableau', pileIndex: i, cardIndex }, event);
                        }
                      }
                    }}
                    isCardBeingDragged={isCardBeingDragged}
                  />
                </div>
              ))}
            </div>
          
            {/* Win condition display */}
            {gameState.isGameWon && (
              <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 win-overlay">
                <div className="bg-slate-800 rounded-lg p-8 text-center shadow-2xl win-celebration border border-slate-600">
                  <h2 className="text-3xl font-bold text-green-400 mb-4">🎉 Congratulations! 🎉</h2>
                  <p className="text-lg mb-4 text-slate-200">You won in {gameState.moves} moves!</p>
                  <p className="text-lg mb-6 text-slate-200">Final Score: {gameState.score}</p>
                  <button
                    onClick={handleAnimatedNewGame}
                    className="px-6 py-2 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 text-white font-semibold shadow-lg hover:from-emerald-700 hover:to-emerald-800 border border-emerald-500 hover:border-emerald-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black"
                  >
                    🎮 Play Again
                  </button>
                </div>
              </div>
            )}

            {/* Drag Preview */}
            {dragState.isDragging && (
              <DragPreview
                cards={dragState.draggedCards}
                style={getDragPreviewStyle()}
                isOverDropZone={!!hoveredZone}
                isSnapBack={dragState.isSnapBack}
              />
            )}

            {/* Animated Card Flyover */}
            {animatingCard && animatingCard.startPosition && animatingCard.endPosition && (
              <div
                className={`animated-card-flyover ${animatingCard.type}`}
                style={{
                  position: 'fixed',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  top: `${animatingCard.startPosition.y}px`,
                  left: `${animatingCard.startPosition.x}px`,
                  // Use consistent sizes for landscape mobile, responsive for others
                  width: animatingCard.isLandscapeMobile ? '60px' : 
                    window.innerWidth >= 1536 ? '110px' :
                    window.innerWidth >= 1280 ? '100px' :
                    window.innerWidth >= 1024 ? '100px' :
                    window.innerWidth >= 768 ? '85px' : 
                    window.innerWidth >= 640 ? '65px' : '52px',
                  height: animatingCard.isLandscapeMobile ? '84px' : 
                    window.innerWidth >= 1536 ? '154px' :
                    window.innerWidth >= 1280 ? '140px' :
                    window.innerWidth >= 1024 ? '140px' :
                    window.innerWidth >= 768 ? '119px' : 
                    window.innerWidth >= 640 ? '91px' : '72px',
                  transition: animatingCard.type === 'stockToWaste' 
                    ? 'all 0.4s cubic-bezier(0.4,0,0.2,1)' 
                    : 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
                  transform: `translate(${animatingCard.endPosition.x - animatingCard.startPosition.x}px, ${animatingCard.endPosition.y - animatingCard.startPosition.y}px)`,
                }}
              >
                <Card
                  suit={animatingCard.card.suit}
                  rank={animatingCard.card.rank}
                  faceUp={animatingCard.type === 'stockToWaste' ? true : animatingCard.card.faceUp}
                  cardId={animatingCard.card.id}
                  isBeingDragged={false}
                  style={{
                    width: animatingCard.isLandscapeMobile ? '60px' : 
                      window.innerWidth >= 1536 ? '110px' :
                      window.innerWidth >= 1280 ? '100px' :
                      window.innerWidth >= 1024 ? '100px' :
                      window.innerWidth >= 768 ? '85px' : 
                      window.innerWidth >= 640 ? '65px' : '52px',
                    height: animatingCard.isLandscapeMobile ? '84px' : 
                      window.innerWidth >= 1536 ? '154px' :
                      window.innerWidth >= 1280 ? '140px' :
                      window.innerWidth >= 1024 ? '140px' :
                      window.innerWidth >= 768 ? '119px' : 
                      window.innerWidth >= 640 ? '91px' : '72px'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Particle Effects */}
      <ParticleEffects trigger={particleTrigger} />

      {/* Subtle Hints */}
      <SubtleHints gameState={gameState} />

      {/* Undo Button */}
      <UndoRedoButtons 
        onUndo={performUndo}
        canUndo={canUndo(gameState)}
      />
    </>
  );
};

export default GameBoard;