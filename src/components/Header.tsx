import React from 'react';

interface HeaderProps {
  timeElapsed: number;
  onNewGame: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const Header: React.FC<HeaderProps> = ({ timeElapsed, onNewGame }) => (
  <header className="w-full bg-gray-900 text-white py-3 flex justify-between items-center">
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-white drop-shadow-sm mb-1">Alcorn Solitaire</h1>
        <span className="text-sm text-gray-200">{formatTime(timeElapsed)}</span>
      </div>
      <button
        onClick={onNewGame}
        className="px-5 py-2 rounded-lg bg-blue-600 text-white text-lg font-semibold shadow hover:bg-blue-700 active:scale-95 transition"
      >
        New Game
      </button>
    </div>
  </header>
);
export default Header;
