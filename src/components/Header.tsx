import React from 'react';
import SettingsPanel, { GameSettings } from './SettingsPanel';
import { BsArrowCounterclockwise, BsArrowClockwise } from 'react-icons/bs';

interface HeaderProps {
  timeElapsed: number;
  moves: number;
  score: number;
  onNewGame: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const Header: React.FC<HeaderProps> = ({ 
  timeElapsed, 
  moves, 
  score, 
  onNewGame, 
  settings, 
  onSettingsChange, 
  onUndo, 
  onRedo, 
  canUndo = false, 
  canRedo = false 
}) => (
  <header className="fixed top-0 left-0 right-0 w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white py-3 sm:py-4 shadow-xl z-50 border-b border-white border-opacity-20">
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 sm:gap-0">
        <div className="flex items-center gap-3">
          <img src="./alcorn-logo.svg" alt="Alcorn Solitaire Logo" className="h-10 sm:h-12 lg:h-14 w-auto" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">Alcorn Solitaire</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onNewGame}
              className="text-xs sm:text-sm font-semibold text-white bg-emerald-600 rounded-lg px-3 py-2 border border-emerald-500 hover:bg-emerald-700 hover:border-emerald-600 transition-all"
              title="Start new game"
            >
              New Game
            </button>
          </div>
          
          {/* Game Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            {settings.showTimer && (
              <div className="text-xs sm:text-sm font-mono font-bold text-white bg-black bg-opacity-30 rounded-lg px-3 py-2 border border-white border-opacity-10 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-xs opacity-70 mb-0.5">Time</div>
                  <div className="text-sm sm:text-base">{formatTime(timeElapsed)}</div>
                </div>
              </div>
            )}
            <div className="text-xs sm:text-sm font-mono font-bold text-white bg-black bg-opacity-30 rounded-lg px-3 py-2 border border-white border-opacity-10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs opacity-70 mb-0.5">Moves</div>
                <div className="text-sm sm:text-base">{moves}</div>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white bg-black bg-opacity-30 rounded-lg px-3 py-2 border border-white border-opacity-10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs opacity-70 mb-0.5">Score</div>
                <div className="text-sm sm:text-base">{score}</div>
              </div>
            </div>
          </div>
          <SettingsPanel 
            settings={settings}
            onSettingsChange={onSettingsChange}
          />
        </div>
      </div>
    </div>
  </header>
);
export default Header;
