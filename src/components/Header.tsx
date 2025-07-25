import React from 'react';
import SettingsPanel, { GameSettings } from './SettingsPanel';

interface HeaderProps {
  timeElapsed: number;
  moves: number;
  score: number;
  onNewGame: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const Header: React.FC<HeaderProps> = ({ timeElapsed, moves, score, onNewGame, settings, onSettingsChange }) => (
  <header className="fixed top-0 left-0 right-0 w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white py-3 sm:py-4 shadow-xl z-50">
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">Alcorn Solitaire</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Game Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            {settings.showTimer && (
              <div className="text-xs sm:text-sm font-mono font-bold text-white bg-black bg-opacity-30 rounded-lg px-3 py-2 border border-white border-opacity-10 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-xs opacity-70 hidden sm:block mb-0.5">Time</div>
                  <div className="text-sm sm:text-base">{formatTime(timeElapsed)}</div>
                </div>
              </div>
            )}
            <div className="text-xs sm:text-sm font-mono font-bold text-white bg-black bg-opacity-30 rounded-lg px-3 py-2 border border-white border-opacity-10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs opacity-70 hidden sm:block mb-0.5">Moves</div>
                <div className="text-sm sm:text-base">{moves}</div>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white bg-black bg-opacity-30 rounded-lg px-3 py-2 border border-white border-opacity-10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs opacity-70 hidden sm:block mb-0.5">Score</div>
                <div className="text-sm sm:text-base">{score}</div>
              </div>
            </div>
          </div>
          <SettingsPanel 
            settings={settings}
            onSettingsChange={onSettingsChange}
            onNewGame={onNewGame}
          />
        </div>
      </div>
    </div>
  </header>
);
export default Header;
