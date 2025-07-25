import React, { useState, useEffect } from 'react';
import Header from './Header';
import TableauPile from './TableauPile';
import FoundationPile from './FoundationPile';
import StockPile from './StockPile';
import WastePile from './WastePile';
import { Card as CardType, Suit } from '@/types';

// --- 7 tableau piles: classic deal, last card faceUp
const initialTableau: CardType[][] = [
  [ { id: 'H1', suit: 'hearts', rank: 1, faceUp: true } ],
  [
    { id: 'C2', suit: 'clubs', rank: 2, faceUp: false },
    { id: 'D2', suit: 'diamonds', rank: 2, faceUp: true },
  ],
  [
    { id: 'S3a', suit: 'spades', rank: 3, faceUp: false },
    { id: 'H3a', suit: 'hearts', rank: 3, faceUp: false },
    { id: 'C3a', suit: 'clubs', rank: 3, faceUp: true },
  ],
  [
    { id: 'D4a', suit: 'diamonds', rank: 4, faceUp: false },
    { id: 'S4a', suit: 'spades', rank: 4, faceUp: false },
    { id: 'H4a', suit: 'hearts', rank: 4, faceUp: false },
    { id: 'C4a', suit: 'clubs', rank: 4, faceUp: true },
  ],
  [
    { id: 'S5a', suit: 'spades', rank: 5, faceUp: false },
    { id: 'D5a', suit: 'diamonds', rank: 5, faceUp: false },
    { id: 'H5a', suit: 'hearts', rank: 5, faceUp: false },
    { id: 'C5a', suit: 'clubs', rank: 5, faceUp: false },
    { id: 'S5b', suit: 'spades', rank: 5, faceUp: true },
  ],
  [
    { id: 'H6a', suit: 'hearts', rank: 6, faceUp: false },
    { id: 'D6a', suit: 'diamonds', rank: 6, faceUp: false },
    { id: 'C6a', suit: 'clubs', rank: 6, faceUp: false },
    { id: 'S6a', suit: 'spades', rank: 6, faceUp: false },
    { id: 'H6b', suit: 'hearts', rank: 6, faceUp: false },
    { id: 'D6b', suit: 'diamonds', rank: 6, faceUp: true },
  ],
  [
    { id: 'C7a', suit: 'clubs', rank: 7, faceUp: false },
    { id: 'S7a', suit: 'spades', rank: 7, faceUp: false },
    { id: 'H7a', suit: 'hearts', rank: 7, faceUp: false },
    { id: 'D7a', suit: 'diamonds', rank: 7, faceUp: false },
    { id: 'C7b', suit: 'clubs', rank: 7, faceUp: false },
    { id: 'S7b', suit: 'spades', rank: 7, faceUp: false },
    { id: 'H7b', suit: 'hearts', rank: 7, faceUp: true },
  ],
];

// --- Dummy 4 foundation piles (empty for now) ---
const initialFoundation: CardType[][] = [[], [], [], []];

// --- 24-card stock pile, face down ---
const initialStock: CardType[] = Array.from({ length: 24 }, (_, i) => ({
  id: `stock-${i + 1}`,
  suit: (['hearts', 'diamonds', 'clubs', 'spades'] as Suit[])[i % 4],
  rank: ((i % 13) + 1),
  faceUp: false
}));

const initialWaste: CardType[] = [];

const GameBoard: React.FC = () => {
  const [tableauPiles, setTableauPiles] = useState<CardType[][]>(initialTableau);
  const [foundationPiles, setFoundationPiles] = useState<CardType[][]>(initialFoundation);
  const [stockPile, setStockPile] = useState<CardType[]>(initialStock);
  const [wastePile, setWastePile] = useState<CardType[]>(initialWaste);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNewGame = () => {
    setTimeElapsed(0);
    // TODO: Reset logic for piles here
  };

  return (
    <>
      <Header timeElapsed={timeElapsed} onNewGame={handleNewGame} />
      <main className="pt-24 min-h-screen w-full flex flex-col items-center">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 w-full">
            {/* Stock, Waste, Foundations */}
            <div className="flex flex-row items-center justify-between w-full gap-8 mb-6">
              <div className="flex flex-row items-center gap-4">
                <StockPile cards={stockPile} />
                <WastePile cards={wastePile} />
              </div>
              <div className="flex flex-row items-center gap-4">
                {[0, 1, 2, 3].map(i => (
                  <FoundationPile key={i} index={i} cards={foundationPiles[i]} />
                ))}
              </div>
            </div>
            {/* Tableau piles - perfectly flush left/right using grid with negative margin */}
            <div className="grid grid-cols-7 w-full">
              {tableauPiles.map((pile, i) => (
                <div key={i} className={i === 0 ? "pe-2" :
                  i === tableauPiles.length -1 ? "ps-2" 
                  : "px-2"}>
          
                  <TableauPile cards={pile} />
                </div>

              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default GameBoard;
