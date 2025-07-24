import React from 'react';

interface HeaderProps {
  timeElapsed: number; // seconds
  onNewGame: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Header: React.FC<HeaderProps> = ({ timeElapsed, onNewGame }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-green-700 text-white">
      <h1 className="text-xl font-bold">Alcorn Solitaire</h1>
      <div className="flex items-center space-x-4">
        <span aria-live="polite" aria-atomic="true" className="font-mono">
          {formatTime(timeElapsed)}
        </span>
        <button
          onClick={onNewGame}
          className="px-3 py-1 bg-green-900 rounded hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Start a new game"
        >
          New Game
        </button>
      </div>
    </header>
  );
};

export default React.memo(Header);
