import React from 'react';

interface HeaderProps {
  timeElapsed: number; // seconds
  onNewGame: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const Header: React.FC<HeaderProps> = ({ timeElapsed, onNewGame }) => {
  return (
    <header className="w-full fixed top-0 left-0 bg-gray-900 text-white shadow-md z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-3xl font-semibold">Alcorn Solitaire</h1>
        <div className="flex items-center space-x-8">
          <div className="text-lg">Time: {formatTime(timeElapsed)}</div>
          <button
            onClick={onNewGame}
            className="bg-green-700 hover:bg-green-800 px-5 py-2 rounded-md text-lg"
            aria-label="Start a new game"
          >
            New Game
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
