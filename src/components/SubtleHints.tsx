import React, { useState, useEffect } from 'react';
import { BsLightbulb, BsChevronUp, BsChevronDown } from 'react-icons/bs';
import { GameState } from '@/types';

interface Hint {
  id: string;
  message: string;
  priority: number;
}

interface SubtleHintsProps {
  gameState: GameState;
}

const SubtleHints: React.FC<SubtleHintsProps> = ({ gameState }) => {
  const [currentHints, setCurrentHints] = useState<Hint[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert rank number to readable name
  const getRankName = (rank: number): string => {
    switch (rank) {
      case 1: return 'Ace';
      case 11: return 'Jack';
      case 12: return 'Queen';
      case 13: return 'King';
      default: return rank.toString();
    }
  };

  // Convert suit to proper capitalization
  const getSuitName = (suit: string): string => {
    return suit.charAt(0).toUpperCase() + suit.slice(1);
  };

  // Generate hints based on game state
  useEffect(() => {
    const generateHints = (): Hint[] => {
      const hints: Hint[] = [];
      let hintId = 0;

      // Check for Aces that can go to foundation
      gameState.tableauPiles.forEach((pile, pileIndex) => {
        if (pile.length > 0) {
          const topCard = pile[pile.length - 1];
          if (topCard.faceUp && topCard.rank === 1) {
            const foundationIndex = gameState.foundationPiles.findIndex(fp => fp.length === 0);
            if (foundationIndex !== -1) {
              hints.push({
                id: `hint-${hintId++}`,
                message: `Move ${getRankName(topCard.rank)} of ${getSuitName(topCard.suit)} to suit pile`,
                priority: 10
              });
            }
          }
        }
      });

      // Check waste pile for Aces
      if (gameState.wastePile.length > 0) {
        const wasteCard = gameState.wastePile[gameState.wastePile.length - 1];
        if (wasteCard.rank === 1) {
          const foundationIndex = gameState.foundationPiles.findIndex(fp => fp.length === 0);
          if (foundationIndex !== -1) {
            hints.push({
              id: `hint-${hintId++}`,
              message: `Move ${getRankName(wasteCard.rank)} of ${getSuitName(wasteCard.suit)} from waste to suit pile`,
              priority: 9
            });
          }
        }
      }

      // Check for foundation building opportunities
      if (gameState.wastePile.length > 0) {
        const wasteCard = gameState.wastePile[gameState.wastePile.length - 1];
        gameState.foundationPiles.forEach((foundationPile, foundationIndex) => {
          if (foundationPile.length > 0) {
            const topFoundationCard = foundationPile[foundationPile.length - 1];
            if (wasteCard.suit === topFoundationCard.suit && wasteCard.rank === topFoundationCard.rank + 1) {
              hints.push({
                id: `hint-${hintId++}`,
                message: `Build suit pile with ${getRankName(wasteCard.rank)} of ${getSuitName(wasteCard.suit)}`,
                priority: 8
              });
            }
          }
        });
      }

      // Check for moves that reveal hidden cards
      gameState.tableauPiles.forEach((pile, pileIndex) => {
        if (pile.length > 1) {
          const topCard = pile[pile.length - 1];
          if (topCard.faceUp && pile.length > 1 && !pile[pile.length - 2].faceUp) {
            // Check if this card can be moved somewhere
            gameState.tableauPiles.forEach((targetPile, targetIndex) => {
              if (targetIndex !== pileIndex && targetPile.length > 0) {
                const targetTop = targetPile[targetPile.length - 1];
                if (targetTop.faceUp && 
                    topCard.rank === targetTop.rank - 1 && 
                    ((topCard.suit === 'hearts' || topCard.suit === 'diamonds') !== 
                     (targetTop.suit === 'hearts' || targetTop.suit === 'diamonds'))) {
                  hints.push({
                    id: `hint-${hintId++}`,
                    message: `Move ${getRankName(topCard.rank)} of ${getSuitName(topCard.suit)} to reveal hidden card`,
                    priority: 7
                  });
                }
              }
            });
          }
        }
      });

      // Check for Kings in empty spaces
      const emptyTableauPiles = gameState.tableauPiles.map((pile, index) => pile.length === 0 ? index : -1).filter(i => i !== -1);
      if (emptyTableauPiles.length > 0) {
        // Look for Kings
        gameState.tableauPiles.forEach((pile, pileIndex) => {
          if (pile.length > 0) {
            const topCard = pile[pile.length - 1];
            if (topCard.faceUp && topCard.rank === 13) {
              hints.push({
                id: `hint-${hintId++}`,
                message: `Move ${getRankName(topCard.rank)} to empty space`,
                priority: 6
              });
            }
          }
        });

        if (gameState.wastePile.length > 0) {
          const wasteCard = gameState.wastePile[gameState.wastePile.length - 1];
          if (wasteCard.rank === 13) {
            hints.push({
              id: `hint-${hintId++}`,
              message: `Move ${getRankName(wasteCard.rank)} from waste to empty space`,
              priority: 6
            });
          }
        }
      }

      // If no specific moves, suggest flipping stock
      if (hints.length === 0 && gameState.stockPile.length > 0) {
        hints.push({
          id: `hint-${hintId++}`,
          message: `Try flipping cards from the stock pile`,
          priority: 3
        });
      }

      // Sort by priority and return top hints
      return hints.sort((a, b) => b.priority - a.priority).slice(0, 3);
    };

    const hints = generateHints();
    setCurrentHints(hints);
    setCurrentHintIndex(0);
  }, [gameState]);

  // Auto-rotate hints every 10 seconds
  useEffect(() => {
    if (currentHints.length > 1) {
      const timer = setInterval(() => {
        setCurrentHintIndex(prev => (prev + 1) % currentHints.length);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [currentHints]);

  // Don't show if hints are disabled or no hints available
  if (!gameState.settings.showHints || currentHints.length === 0) {
    return null;
  }

  const currentHint = currentHints[currentHintIndex];

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <div className="bg-black bg-opacity-40 backdrop-blur-md text-white rounded-lg shadow-2xl border border-white border-opacity-10 transition-all duration-300 hover:bg-opacity-60">
        {/* Header with expand/collapse */}
        <div 
          className="flex items-center gap-2 px-3 py-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <BsLightbulb className="text-yellow-300 w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-medium opacity-80">Hints</span>
          {currentHints.length > 1 && (
            <span className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-0.5 ml-auto">
              {currentHintIndex + 1}/{currentHints.length}
            </span>
          )}
          {isExpanded ? (
            <BsChevronDown className="w-3 h-3 opacity-60" />
          ) : (
            <BsChevronUp className="w-3 h-3 opacity-60" />
          )}
        </div>

        {/* Hint content */}
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-white border-opacity-10">
            <p className="text-sm leading-relaxed mt-2 opacity-90">
              {currentHint.message}
            </p>
            
            {/* Navigation for multiple hints */}
            {currentHints.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-white border-opacity-10">
                {currentHints.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentHintIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentHintIndex 
                        ? 'bg-yellow-300' 
                        : 'bg-white bg-opacity-30 hover:bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubtleHints;