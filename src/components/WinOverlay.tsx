import React from 'react';

interface WinOverlayProps {
  isGameWon: boolean;
  moves: number;
  score: number;
  onNewGame: () => void;
}

const WinOverlay: React.FC<WinOverlayProps> = ({ isGameWon, moves, score, onNewGame }) => {
  if (!isGameWon) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 win-overlay">
      <div className="bg-slate-800 rounded-lg p-8 text-center shadow-2xl win-celebration border border-slate-600">
        <h2 className="text-3xl font-bold text-green-400 mb-4">🎉 Congratulations! 🎉</h2>
        <p className="text-lg mb-4 text-slate-200">You won in {moves} moves!</p>
        <p className="text-lg mb-6 text-slate-200">Final Score: {score}</p>
        <button
          onClick={onNewGame}
          className="px-6 py-2 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 text-white font-semibold shadow-lg hover:from-emerald-700 hover:to-emerald-800 border border-emerald-500 hover:border-emerald-600 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black"
        >
          🎮 Play Again
        </button>
      </div>
    </div>
  );
};

export default WinOverlay; 