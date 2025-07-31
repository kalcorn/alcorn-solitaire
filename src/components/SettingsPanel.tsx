import React, { useEffect, useRef } from 'react';
import { BsGear, BsX, BsChevronDown } from 'react-icons/bs';

export interface GameSettings {
  deckCyclingLimit: number; // 0 = unlimited, 1 = once, 3 = three times
  drawCount: number; // 1 or 3 cards from stock
  autoMoveToFoundation: boolean;
  soundEnabled: boolean;
  showHints: boolean;
}

interface SettingsPanelProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  onSettingsChange,
  isOpen = false,
  onClose,
  className = ''
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management when panel opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K, 
    value: GameSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const cyclingOptions = [
    { value: 0, label: 'Unlimited' },
    { value: 1, label: 'Once Only' },
    { value: 3, label: 'Three Times' }
  ];

  const drawCountOptions = [
    { value: 1, label: '1 Card' },
    { value: 3, label: '3 Cards' }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is handled by individual change handlers
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => onClose?.()}
        className={`text-sm sm:text-lg font-mono font-bold text-white bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg px-4 py-3 border border-slate-600 shadow-lg hover:from-slate-600 hover:to-slate-700 hover:border-slate-500 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 hover:shadow-xl ${className}`}
        title="Game Settings"
      >
        <div className="flex items-center justify-center">
          <BsGear className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-600">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Settings</h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-1 rounded hover:bg-slate-700 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label="Close settings"
                title="Close settings"
              >
                <BsX className="w-7 h-7 text-slate-300" />
              </button>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Deck Cycling Limit */}
              <div>
                <label htmlFor="deck-cycling" className="block text-base font-semibold text-slate-200 mb-2">
                  Deck Cycling Limit
                </label>
                <div className="relative">
                  <select
                    id="deck-cycling"
                    value={settings.deckCyclingLimit}
                    onChange={(e) => handleSettingChange('deckCyclingLimit', parseInt(e.target.value))}
                    className="w-full p-3 pr-12 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-slate-700 cursor-pointer text-base text-white"
                  >
                    {cyclingOptions.map(option => (
                      <option key={option.value} value={option.value} className="text-white bg-slate-700">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <BsChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  How many times you can cycle through the stock pile
                </p>
              </div>

              {/* Draw Count */}
              <div>
                <label htmlFor="draw-count" className="block text-base font-semibold text-slate-200 mb-2">
                  Draw Count
                </label>
                <div className="relative">
                  <select
                    id="draw-count"
                    value={settings.drawCount}
                    onChange={(e) => handleSettingChange('drawCount', parseInt(e.target.value))}
                    className="w-full p-3 pr-12 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-slate-700 cursor-pointer text-base text-white"
                  >
                    {drawCountOptions.map(option => (
                      <option key={option.value} value={option.value} className="text-white bg-slate-700">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <BsChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Number of cards to draw from stock pile
                </p>
              </div>

              {/* Auto-move to Foundation */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoMoveToFoundation}
                    onChange={(e) => handleSettingChange('autoMoveToFoundation', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-slate-500 rounded focus:ring-emerald-500 bg-slate-700"
                  />
                  <div>
                    <span className="text-base font-semibold text-slate-200">
                      Auto-move to Foundation
                    </span>
                    <p className="text-sm text-slate-400">
                      Automatically move cards to foundation when possible
                    </p>
                  </div>
                </label>
              </div>

              {/* Sound Effects */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-slate-500 rounded focus:ring-emerald-500 bg-slate-700"
                  />
                  <div>
                    <span className="text-base font-semibold text-slate-200">
                      Sound Enabled
                    </span>
                    <p className="text-sm text-slate-400">
                      Play sounds for card movements and game events
                    </p>
                  </div>
                </label>
              </div>

              {/* Show Hints */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.showHints}
                    onChange={(e) => handleSettingChange('showHints', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 border-slate-500 rounded focus:ring-emerald-500 bg-slate-700"
                  />
                  <div>
                    <span className="text-base font-semibold text-slate-200">
                      Show Hints
                    </span>
                    <p className="text-sm text-slate-400">
                      Display helpful move suggestions during gameplay
                    </p>
                  </div>
                </label>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex justify-center mt-8 pt-4 border-t border-slate-600">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-lg bg-gradient-to-b from-emerald-600 to-emerald-700 text-white text-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 border border-emerald-500 hover:border-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800"
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