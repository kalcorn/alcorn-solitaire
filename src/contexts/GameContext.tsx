import React, { createContext, useContext, ReactNode } from 'react';
import { GameEngine } from '@/engine/GameEngine';

const GameContext = createContext<GameEngine | null>(null);

interface GameProviderProps {
  children: ReactNode;
  engine?: GameEngine;
}

export function GameProvider({ children, engine }: GameProviderProps) {
  const gameEngine = engine || new GameEngine();
  
  return (
    <GameContext.Provider value={gameEngine}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameEngine {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
} 