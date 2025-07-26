import React, { useState, useEffect } from 'react';
import { BsArrowCounterclockwise, BsCheckCircle } from 'react-icons/bs';

interface UndoRedoButtonsProps {
  onUndo: () => void;
  canUndo: boolean;
}

const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({ 
  onUndo, 
  canUndo 
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleUndo = () => {
    if (!canUndo) return;
    
    onUndo();
    setShowFeedback(true);
    
    // Clear feedback after animation
    setTimeout(() => setShowFeedback(false), 1000);
  };

  return (
    <div className="fixed z-40 
                    /* All resolutions: left-aligned with page content - matches header/content margin */
                    lg:bottom-8 lg:left-0 lg:ml-8 lg:transform-none lg:flex lg:flex-row
                    md:bottom-6 md:left-0 md:ml-6 md:transform-none md:flex md:flex-row
                    sm:bottom-4 sm:left-0 sm:ml-4 sm:transform-none sm:flex sm:flex-row
                    max-sm:bottom-4 max-sm:left-0 max-sm:ml-4 max-sm:transform-none max-sm:flex max-sm:flex-col">
      {/* Undo Button */}
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className={`transition-all duration-200 flex items-center gap-2 sm:gap-3 landscape-mobile-undo-button ${
          canUndo 
            ? 'text-gray-100 hover:text-white hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-75 rounded-lg px-2 py-1' 
            : 'cursor-not-allowed text-gray-500 opacity-50'
        }`}
        title={canUndo ? "Undo last move" : "No moves to undo"}
      >
        {showFeedback ? (
          <>
            <BsCheckCircle className="w-5 h-5 sm:w-7 sm:h-7 landscape-mobile-undo-icon text-green-400" />
            <span className="text-base sm:text-xl font-bold landscape-mobile-undo-text text-green-400">Undone!</span>
          </>
        ) : (
          <>
            <BsArrowCounterclockwise className="w-5 h-5 sm:w-7 sm:h-7 landscape-mobile-undo-icon" />
            <span className="text-base sm:text-xl font-bold landscape-mobile-undo-text">Undo</span>
          </>
        )}
      </button>
    </div>
  );
};

export default UndoRedoButtons;