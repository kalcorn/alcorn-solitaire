import React, { useState } from 'react';
import { BsGear, BsX, BsChevronDown } from 'react-icons/bs';

export interface GameSettings {
  deckCyclingLimit: number; // 0 = unlimited, 1 = once, 3 = three times
  drawCount: number; // 1 or 3 cards from stock
  autoMoveToFoundation: boolean;
  showTimer: boolean;
}

interface SettingsPanelProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onNewGame: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  onSettingsChange, 
  onNewGame 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K, 
    value: GameSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const cyclingOptions = [
    { value: 0, label: 'Unlimited' },
    { value: 1, label: 'Once Only' },
    { value: 3, label: 'Three Times' }
  ];


  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs sm:text-sm font-mono font-bold text-white bg-black bg-opacity-30 rounded-lg px-3 py-2 border border-white border-opacity-10 backdrop-blur-sm hover:bg-opacity-40 transition-all"
        title="Game Settings"
      >
        <div className="flex items-center justify-center min-h-[20px]">
          <BsGear className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Game Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <BsX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Settings Form */}
            <div className="space-y-6">
              {/* Deck Cycling Limit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deck Cycling Limit
                </label>
                <div className="relative">
                  <select
                    value={settings.deckCyclingLimit}
                    onChange={(e) => handleSettingChange('deckCyclingLimit', parseInt(e.target.value))}
                    className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white cursor-pointer text-gray-900"
                  >
                    {cyclingOptions.map(option => (
                      <option key={option.value} value={option.value} className="text-gray-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <BsChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How many times you can cycle through the stock pile
                </p>
              </div>


              {/* Auto-move to Foundation */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoMoveToFoundation}
                    onChange={(e) => handleSettingChange('autoMoveToFoundation', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Auto-move to Foundation
                    </span>
                    <p className="text-xs text-gray-500">
                      Automatically move cards to foundation when possible
                    </p>
                  </div>
                </label>
              </div>

              {/* Show Timer */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.showTimer}
                    onChange={(e) => handleSettingChange('showTimer', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      Show Timer
                    </span>
                    <p className="text-xs text-gray-500">
                      Display elapsed time during gameplay
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onNewGame();
                  setIsOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                New Game
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;