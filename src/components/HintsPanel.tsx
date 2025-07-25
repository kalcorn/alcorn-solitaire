import React, { useState, useEffect } from 'react';
import { BsLightbulb, BsX, BsChevronRight, BsArrowUp, BsArrowDown, BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { GameState, Card } from '@/types';

interface Hint {
  id: string;
  type: 'move' | 'reveal' | 'strategy' | 'foundation';
  title: string;
  description: string;
  fromPile?: string;
  toPile?: string;
  cardRank?: number;
  cardSuit?: string;
  priority: number; // Higher = more important
}

interface HintsPanelProps {
  gameState: GameState;
  onClose: () => void;
}

const HintsPanel: React.FC<HintsPanelProps> = ({ gameState, onClose }) => {
  const [hints, setHints] = useState<Hint[]>([]);
  const [activeTab, setActiveTab] = useState<'hints' | 'tips'>('hints');

  const staticTips = [
    {
      title: "Build in Alternating Colors",
      description: "Place cards on tableau piles in descending order with alternating colors (red on black, black on red)."
    },
    {
      title: "Prioritize Revealing Hidden Cards",
      description: "Focus on moves that reveal face-down cards in tableau piles, as this gives you more options."
    },
    {
      title: "Empty Tableau Spaces",
      description: "Only Kings can be placed on empty tableau spaces. Use this strategically to reorganize sequences."
    },
    {
      title: "Foundation Building",
      description: "Build foundation piles from Ace to King in the same suit. Move Aces to foundations immediately."
    },
    {
      title: "Stock Pile Strategy",
      description: "Don't cycle through the stock pile too quickly. Sometimes waiting and making tableau moves first opens up better options."
    },
    {
      title: "Plan Ahead",
      description: "Look for sequences that can be moved together. Moving longer sequences is often more beneficial."
    }
  ];

  // Analyze game state and generate hints
  useEffect(() => {
    const generateHints = () => {
      const newHints: Hint[] = [];
      let hintId = 0;

      // Check for Aces that can go to foundation
      gameState.tableauPiles.forEach((pile, pileIndex) => {
        if (pile.length > 0) {
          const topCard = pile[pile.length - 1];
          if (topCard.faceUp && topCard.rank === 1) {
            const foundationIndex = gameState.foundationPiles.findIndex(fp => fp.length === 0);
            if (foundationIndex !== -1) {
              newHints.push({
                id: `hint-${hintId++}`,
                type: 'foundation',
                title: 'Move Ace to Foundation',
                description: `Move the Ace of ${topCard.suit} from tableau pile ${pileIndex + 1} to an empty foundation pile.`,
                fromPile: `Tableau ${pileIndex + 1}`,
                toPile: `Foundation ${foundationIndex + 1}`,
                cardRank: topCard.rank,
                cardSuit: topCard.suit,
                priority: 10
              });
            }
          }
        }
      });

      // Check waste pile for foundation moves
      if (gameState.wastePile.length > 0) {
        const wasteCard = gameState.wastePile[gameState.wastePile.length - 1];
        gameState.foundationPiles.forEach((foundationPile, foundationIndex) => {
          if (foundationPile.length === 0 && wasteCard.rank === 1) {
            newHints.push({
              id: `hint-${hintId++}`,
              type: 'foundation',
              title: 'Move Ace from Waste',
              description: `Move the Ace of ${wasteCard.suit} from the waste pile to foundation pile ${foundationIndex + 1}.`,
              fromPile: 'Waste',
              toPile: `Foundation ${foundationIndex + 1}`,
              priority: 9
            });
          } else if (foundationPile.length > 0) {
            const topFoundationCard = foundationPile[foundationPile.length - 1];
            if (wasteCard.suit === topFoundationCard.suit && wasteCard.rank === topFoundationCard.rank + 1) {
              newHints.push({
                id: `hint-${hintId++}`,
                type: 'foundation',
                title: 'Build Foundation',
                description: `Move the ${wasteCard.rank} of ${wasteCard.suit} from waste to foundation pile ${foundationIndex + 1}.`,
                fromPile: 'Waste',
                toPile: `Foundation ${foundationIndex + 1}`,
                priority: 8
              });
            }
          }
        });
      }

      // Check for cards that can reveal hidden cards
      gameState.tableauPiles.forEach((pile, pileIndex) => {
        if (pile.length > 1) {
          const topCard = pile[pile.length - 1];
          if (topCard.faceUp) {
            // Check if this card can be moved to reveal a hidden card
            gameState.tableauPiles.forEach((targetPile, targetIndex) => {
              if (targetIndex !== pileIndex && targetPile.length > 0) {
                const targetTop = targetPile[targetPile.length - 1];
                if (targetTop.faceUp && 
                    topCard.rank === targetTop.rank - 1 && 
                    ((topCard.suit === 'hearts' || topCard.suit === 'diamonds') !== 
                     (targetTop.suit === 'hearts' || targetTop.suit === 'diamonds'))) {
                  
                  // Check if moving this card would reveal a hidden card
                  if (pile.length > 1 && !pile[pile.length - 2].faceUp) {
                    newHints.push({
                      id: `hint-${hintId++}`,
                      type: 'reveal',
                      title: 'Reveal Hidden Card',
                      description: `Move the ${topCard.rank} of ${topCard.suit} from tableau ${pileIndex + 1} to tableau ${targetIndex + 1} to reveal a hidden card.`,
                      fromPile: `Tableau ${pileIndex + 1}`,
                      toPile: `Tableau ${targetIndex + 1}`,
                      priority: 7
                    });
                  }
                }
              }
            });
          }
        }
      });

      // Check for empty tableau spaces that need Kings
      const emptyTableauPiles = gameState.tableauPiles.map((pile, index) => pile.length === 0 ? index : -1).filter(i => i !== -1);
      if (emptyTableauPiles.length > 0) {
        // Look for Kings that can be moved
        gameState.tableauPiles.forEach((pile, pileIndex) => {
          if (pile.length > 0) {
            const topCard = pile[pile.length - 1];
            if (topCard.faceUp && topCard.rank === 13) {
              newHints.push({
                id: `hint-${hintId++}`,
                type: 'move',
                title: 'Move King to Empty Space',
                description: `Move the King of ${topCard.suit} from tableau ${pileIndex + 1} to the empty tableau space ${emptyTableauPiles[0] + 1}.`,
                fromPile: `Tableau ${pileIndex + 1}`,
                toPile: `Tableau ${emptyTableauPiles[0] + 1}`,
                priority: 6
              });
            }
          }
        });

        // Check waste pile for King
        if (gameState.wastePile.length > 0) {
          const wasteCard = gameState.wastePile[gameState.wastePile.length - 1];
          if (wasteCard.rank === 13) {
            newHints.push({
              id: `hint-${hintId++}`,
              type: 'move',
              title: 'Move King from Waste',
              description: `Move the King of ${wasteCard.suit} from waste to the empty tableau space ${emptyTableauPiles[0] + 1}.`,
              fromPile: 'Waste',
              toPile: `Tableau ${emptyTableauPiles[0] + 1}`,
              priority: 6
            });
          }
        }
      }

      // Sort hints by priority (highest first)
      newHints.sort((a, b) => b.priority - a.priority);
      
      // Limit to top 5 hints
      setHints(newHints.slice(0, 5));
    };

    generateHints();
  }, [gameState]);

  const getHintIcon = (type: string) => {
    switch (type) {
      case 'foundation': return <BsArrowUp className="text-green-600" />;
      case 'reveal': return <BsLightbulb className="text-yellow-600" />;
      case 'move': return <BsArrowRight className="text-blue-600" />;
      default: return <BsChevronRight className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BsLightbulb className="text-yellow-500" />
            Hints & Tips
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <BsX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border-b">
          <button
            onClick={() => setActiveTab('hints')}
            className={`py-2 px-4 font-semibold transition-colors ${
              activeTab === 'hints' 
                ? 'text-emerald-600 border-b-2 border-emerald-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Current Hints ({hints.length})
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`py-2 px-4 font-semibold transition-colors ${
              activeTab === 'tips' 
                ? 'text-emerald-600 border-b-2 border-emerald-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            General Tips
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          {activeTab === 'hints' ? (
            <div className="space-y-3">
              {hints.length > 0 ? (
                hints.map((hint, index) => (
                  <div key={hint.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-emerald-400">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getHintIcon(hint.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{hint.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{hint.description}</p>
                        {hint.fromPile && hint.toPile && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {hint.fromPile}
                            </span>
                            <BsArrowRight />
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {hint.toPile}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BsLightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hints available right now.</p>
                  <p className="text-sm">Try making a move or flipping the stock pile!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {staticTips.map((tip, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <BsLightbulb className="text-blue-600 w-4 h-4" />
                    {tip.title}
                  </h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HintsPanel;