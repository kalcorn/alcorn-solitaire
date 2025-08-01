import React from 'react';
import Image from 'next/image';
import SettingsPanel, { GameSettings } from '../SettingsPanel';
import { cn } from '@/utils/cssUtils';
import styles from './Header.module.css';

interface HeaderProps {
  timeElapsed: number;
  moves: number;
  score: number;
  onNewGame: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) {
      return `${days}d ${remainingHours}h ${mins}m`;
    }
    return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
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
  canUndo = false 
}) => (
  <header className={cn(styles.header, "landscape-mobile-header")}>
    <div className={styles.headerContainer}>
      <div className={cn(styles.headerContent, "landscape-mobile-single-line")}>
        {/* Portrait Mobile: First row centered logo and title */}
        <div className={cn(styles.mobilePortraitRow, styles.showOnMobile)}>
          <Image 
            src="/alcorn-logo.svg" 
            alt="Alcorn Solitaire Logo" 
            width={48} 
            height={48} 
            className={cn(styles.logo, "landscape-mobile-logo")} 
          />
          <h1 className={cn(styles.title, "header-title")}>Alcorn Solitaire</h1>
        </div>
        
        {/* Portrait Mobile: Second row with + button, stats, and settings cog */}
        <div className={cn(styles.mobileControlsRow, styles.showOnMobile)}>
          {/* Portrait Mobile + Button */}
          <button
            onClick={onNewGame}
            className={styles.plusButton}
            style={{ minHeight: '36px' }}
            title="New game"
            aria-label="Start a new game"
          >
            +
          </button>
          
          {/* Game Stats for portrait mobile */}
          <div className={styles.mobileStatsCompact}>
            <div className={styles.compactStatBox}>
              <span className="opacity-95">
                <span className={styles.timeValue}>{formatTime(timeElapsed)}</span>
                <span className={styles.statSeparator}>•</span>
                
                <span className={cn(styles.movesValue, "mx-1.5")}>{moves}</span>
                <span className="text-slate-400 text-xs">moves</span>

                <span className={styles.statSeparator}>•</span>
                <span className={styles.scoreValue}>{score}</span>
              </span>
            </div>
          </div>
          
          {/* Settings cog */}
          <div className="flex-shrink-0">
            <SettingsPanel 
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          </div>
        </div>
        
        {/* Desktop and Landscape Mobile Layout */}
        <div className={cn(styles.logoTitleSection, styles.showOnDesktop, "landscape-mobile-title")}>
          <Image 
            src="/alcorn-logo.svg" 
            alt="Alcorn Solitaire Logo" 
            width={48} 
            height={48} 
            className={cn(styles.logo, "landscape-mobile-logo")} 
          />
          <h1 className={cn(styles.title, "header-title")}>Alcorn Solitaire</h1>
        </div>
        
        <div className={cn(styles.showOnDesktop, "items-center gap-2 sm:gap-4 landscape-mobile-right")}>
          {/* Desktop New Game Button */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onNewGame}
              className={cn(styles.newGameButton, "landscape-mobile-new-game")}
              title="Start new game"
              aria-label="Start a new game"
            >
              New Game
            </button>
          </div>
          
          {/* Desktop and Landscape Mobile Stats */}
          <div className="flex items-center gap-2 sm:gap-3 landscape-mobile-stats">
            {/* Fancy single-line stats for landscape mobile */}
            <div className="landscape-mobile-single-stat text-sm font-mono text-white bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg px-4 py-2 border border-slate-700 shadow-lg">
              <span className="opacity-95">
                <span className="text-slate-300 text-xs">Time: </span>
                <span className="text-blue-300 font-semibold">{formatTime(timeElapsed)}</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="text-slate-300 text-xs">Moves: </span>
                <span className="text-orange-300 font-semibold">{moves}</span>
                
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="text-slate-300 text-xs">Score: </span>
                <span className="text-green-300 font-semibold">{score}</span>
              </span>
            </div>
            
            {/* Regular stats for desktop only */}
            <div className="landscape-mobile-regular-stats flex items-center gap-2 sm:gap-3">
              <div className="text-sm sm:text-base font-mono font-bold text-white bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg px-4 py-2 border border-slate-700 shadow-lg">
                <div className="text-center">
                  <div className="text-sm opacity-70 mb-0.5 text-slate-400">Time</div>
                  <div className="text-base sm:text-lg text-blue-300 font-semibold">{formatTime(timeElapsed)}</div>
                </div>
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-white bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg px-4 py-2 border border-slate-700 shadow-lg">
                <div className="text-center">
                  <div className="text-sm opacity-70 mb-0.5 text-slate-400">Moves</div>
                  <div className="text-base sm:text-lg text-orange-300 font-semibold">{moves}</div>
                </div>
              </div>
              <div className="text-sm sm:text-base font-mono font-bold text-white bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg px-4 py-2 border border-slate-700 shadow-lg">
                <div className="text-center">
                  <div className="text-sm opacity-70 mb-0.5 text-slate-400">Score</div>
                  <div className="text-base sm:text-lg text-green-300 font-semibold">{score}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop Settings */}
          <div className="landscape-mobile-controls flex items-center gap-2">
            {/* Compact + button for landscape mobile - next to settings */}
            <button
              onClick={onNewGame}
              className="landscape-mobile-plus-button w-10 h-10 text-xl font-bold text-white bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-lg border border-emerald-500 hover:from-emerald-700 hover:to-emerald-800 hover:border-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              title="New game"
              aria-label="Start a new game"
            >
              +
            </button>
            <SettingsPanel 
              settings={settings}
              onSettingsChange={onSettingsChange}
            />
          </div>
        </div>
      </div>
    </div>
  </header>
);
export default Header;
