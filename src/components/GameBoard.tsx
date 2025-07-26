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
import { Card, CardPosition, GameState } from '@/types';

const GameBoard: React.FC = () => {
  const [isClient, setIsClient] = React.useState(false);
  const [particleTrigger, setParticleTrigger] = React.useState<{
    type: 'win' | 'validMove' | null;
    position?: { x: number; y: number };
  }>({ type: null });
  const [isStockAnimating, setIsStockAnimating] = React.useState(false);
  const [isWasteAnimating, setIsWasteAnimating] = React.useState(false);
  const [isShuffling, setIsShuffling] = React.useState(false);
  const [isWinAnimating, setIsWinAnimating] = React.useState(false);
  const [lastClickTime, setLastClickTime] = React.useState(0);
  const [lastClickedCardId, setLastClickedCardId] = React.useState<string | null>(null);
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

  // Ensure client-side rendering for consistent hydration
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Trigger win effect when game is won
  React.useEffect(() => {
    if (gameState.isGameWon && !isWinAnimating) {
      setIsWinAnimating(true);
      setParticleTrigger({ type: 'win' });
      
      // Reset animations after win sequence completes
      setTimeout(() => {
        setParticleTrigger({ type: null });
        setTimeout(() => {
          setIsWinAnimating(false);
        }, 1200);
      }, 100);
    }
  }, [gameState.isGameWon, isWinAnimating]);

  const {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
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

  const handleDrop = (source: CardPosition, target: CardPosition, cards: Card[]) => {
    const result = moveCards(source, target, cards);
    if (result.success) {
      // Trigger sparkle effect for valid moves
      setParticleTrigger({ 
        type: 'validMove', 
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 } 
      });
      // Clear trigger after a brief delay
      setTimeout(() => setParticleTrigger({ type: null }), 100);
    } else {
      console.warn('Move failed:', result.error);
    }
    return result;
  };

  const getCardById = (cardId: string): Card | null => {
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

  // Animated stock flip handler
  const handleAnimatedStockFlip = () => {
    if (isStockAnimating || isWasteAnimating) return;
    
    // Determine animation type based on stock pile state
    const isRecycling = gameState.stockPile.length === 0;
    
    if (isRecycling) {
      // When recycling waste back to stock - play shuffle sound
      if (gameState.settings.soundEnabled) {
        playSoundEffect.shuffle();
      }
      setIsWasteAnimating(true);
      setTimeout(() => {
        handleStockFlip();
        setTimeout(() => {
          setIsWasteAnimating(false);
        }, 600);
      }, 100);
    } else {
      // When dealing from stock to waste - simple slide animation
      setIsWasteAnimating(true);
      setTimeout(() => {
        handleStockFlip();
        setTimeout(() => {
          setIsWasteAnimating(false);
        }, 400);
      }, 100);
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
      <div className={` w-full flex flex-col items-center bg-transparent ${!isClient ? 'hydration-loading' : ''}`}>
        <div className="w-full max-w-7xl mx-auto px-1 sm:px-4 md:px-6 lg:px-0">
          <div className="card-playing-area flex flex-col gap-3 w-full pt-6 md:pt-8 lg:pt-10 pb-bottom-responsive">

            {/* Landscape Mobile: Left Side Piles (Stock, Waste) */}
            <div className="landscape-mobile-left-sidebar bg-gradient-to-b from-emerald-900 to-green-900 bg-opacity-40 rounded-xl p-4 shadow-lg border border-green-700 border-opacity-30">
              <div className="flex flex-col gap-2">
                <StockPile 
                  cards={gameState.stockPile} 
                  onClick={handleAnimatedStockFlip}
                  cyclesRemaining={gameState.settings.deckCyclingLimit > 0 ? 
                    Math.max(0, gameState.settings.deckCyclingLimit - gameState.stockCycles) : 
                    undefined}
                  canCycle={gameState.settings.deckCyclingLimit === 0 || 
                    gameState.stockCycles < gameState.settings.deckCyclingLimit}
                  isAnimating={isStockAnimating}
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
                  isAnimating={isWasteAnimating}
                  animationType={gameState.stockPile.length === 0 ? 'toStock' : 'fromStock'}
                />
              </div>
            </div>

            {/* Landscape Mobile: Right Side Foundation Piles */}
            <div className="landscape-mobile-right-sidebar bg-gradient-to-b from-emerald-900 to-green-900 bg-opacity-40 rounded-xl p-4 shadow-lg border border-green-700 border-opacity-30">
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    data-drop-zone
                    data-pile-type="foundation"
                    data-pile-index={i}
                    className={`${isZoneHovered('foundation', i) ? 'drop-zone' : ''} ${isWinAnimating ? 'foundation-win-cascade' : ''}`}
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
                      isDropZone={isZoneHovered('foundation', i)}
                      isCardBeingDragged={isCardBeingDragged}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Piles Section - Standard Layout: Stock, Waste, and Foundations - Desktop/Portrait Mobile */}
            <div className="standard-layout flex flex-row items-start justify-between w-full bg-gradient-to-r from-emerald-900 to-green-900 bg-opacity-40 rounded-xl p-6 mb-0 md:mb-4 lg:mb-6 shadow-lg border border-green-700 border-opacity-30">
              <div className="flex flex-row items-center gap-2 md:gap-4 lg:gap-6 flex-shrink-0">
                <StockPile 
                  cards={gameState.stockPile} 
                  onClick={handleAnimatedStockFlip}
                  cyclesRemaining={gameState.settings.deckCyclingLimit > 0 ? 
                    Math.max(0, gameState.settings.deckCyclingLimit - gameState.stockCycles) : 
                    undefined}
                  canCycle={gameState.settings.deckCyclingLimit === 0 || 
                    gameState.stockCycles < gameState.settings.deckCyclingLimit}
                  isAnimating={isStockAnimating}
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
                  isAnimating={isWasteAnimating}
                  animationType={gameState.stockPile.length === 0 ? 'toStock' : 'fromStock'}
                />
              </div>
              <div className="flex flex-row items-center gap-1 md:gap-2 lg:gap-3 flex-shrink-0">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    data-drop-zone
                    data-pile-type="foundation"
                    data-pile-index={i}
                    className={`${isZoneHovered('foundation', i) ? 'drop-zone' : ''} ${isWinAnimating ? 'foundation-win-cascade' : ''}`}
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
                      isDropZone={isZoneHovered('foundation', i)}
                      isCardBeingDragged={isCardBeingDragged}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Landscape Mobile: Center Tableau with Increased Size */}
            <div className="landscape-mobile-tableau flex-1 flex justify-center">
              <div className="landscape-tableau-center justify-between w-full max-w-4xl">
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
                    className="px-6 py-2 rounded-lg bg-emerald-700 text-white font-semibold shadow-lg hover:bg-emerald-800 border border-emerald-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
        canUndo={canUndo}
      />
    </>
  );
};

export default GameBoard;