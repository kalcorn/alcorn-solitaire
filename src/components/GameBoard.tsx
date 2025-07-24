import React, { useState, useEffect } from 'react';
import Header from './Header';
import TableauPile from './TableauPile';
import FoundationPile from './FoundationPile';
import StockPile from './StockPile';
import WastePile from './WastePile';
import { Card as CardType, Suit } from '@/types';

const initialTableau: CardType[][] = [
  [
    { id: 'hearts-1', suit: 'hearts' as Suit, rank: 1, faceUp: false },
    { id: 'hearts-2', suit: 'hearts' as Suit, rank: 2, faceUp: false },
    { id: 'hearts-3', suit: 'hearts' as Suit, rank: 3, faceUp: true },
  ],
  [
    { id: 'clubs-4', suit: 'clubs' as Suit, rank: 4, faceUp: false },
    { id: 'clubs-5', suit: 'clubs' as Suit, rank: 5, faceUp: true },
  ],
  [
    { id: 'diamonds-6', suit: 'diamonds' as Suit, rank: 6, faceUp: false },
    { id: 'diamonds-7', suit: 'diamonds' as Suit, rank: 7, faceUp: false },
    { id: 'diamonds-8', suit: 'diamonds' as Suit, rank: 8, faceUp: true },
  ],
  [
    { id: 'spades-9', suit: 'spades' as Suit, rank: 9, faceUp: true },
  ],
  [],
  [],
  [],
];

const initialFoundation: CardType[][] = [
  [
    { id: 'hearts-1', suit: 'hearts' as Suit, rank: 1, faceUp: true },
    { id: 'hearts-2', suit: 'hearts' as Suit, rank: 2, faceUp: true },
  ],
  [
    { id: 'clubs-1', suit: 'clubs' as Suit, rank: 1, faceUp: true },
  ],
  [],
  [],
];

const initialStock: CardType[] = [
  { id: 'spades-10', suit: 'spades' as Suit, rank: 10, faceUp: false },
  { id: 'spades-11', suit: 'spades' as Suit, rank: 11, faceUp: false },
];

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
    // Reset logic to be implemented
    setTimeElapsed(0);
  };

  return (
    <main className="pt-32 p-4 bg-green-900 min-h-screen flex flex-col items-center overflow-y-auto">
      <Header timeElapsed={timeElapsed} onNewGame={handleNewGame} />

      <section className="flex justify-between w-full max-w-7xl mb-6">
        <StockPile cards={stockPile} />
        <WastePile cards={wastePile} />
        <div className="flex space-x-4">
          {foundationPiles.map((pile, idx) => (
            <FoundationPile key={idx} cards={pile} />
          ))}
        </div>
      </section>

      <section className="flex justify-between w-full max-w-7xl">
        {tableauPiles.map((pile, idx) => (
          <TableauPile key={idx} cards={pile} />
        ))}
      </section>
    </main>
  );
};

export default GameBoard;
