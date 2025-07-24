import React, { useState, useEffect, useCallback } from 'react';

interface Card {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number; // 1 - 13
  faceUp: boolean;
}

const initializeDeck = (): Card[] => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
  const deck: Card[] = [];
  suits.forEach(suit => {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        faceUp: false,
      });
    }
  });
  return deck;
};

const GameBoard: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>(() => initializeDeck());

  const flipCard = useCallback((id: string) => {
    setDeck(deck =>
      deck.map(card =>
        card.id === id ? { ...card, faceUp: !card.faceUp } : card
      )
    );
  }, []);

  useEffect(() => {
    // Game logic or side effects placeholder
  }, [deck]);

  return (
    <section aria-label="Solitaire game board" role="main" className="game-board p-4">
      {/* Render tableau piles here */}
    </section>
  );
};

export default React.memo(GameBoard);
