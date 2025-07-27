import React, { useState, useEffect } from 'react';
import { BsArrowLeftCircle, BsCheckCircle } from 'react-icons/bs';

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
    <div className="fixed z-40 bottom-4 left-4 xl:left-[max(1rem,calc(50vw-36rem))]">
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
            <BsArrowLeftCircle className="w-5 h-5 sm:w-7 sm:h-7 landscape-mobile-undo-icon" />
            <span className="text-base sm:text-xl font-bold landscape-mobile-undo-text">Undo</span>
          </>
        )}
      </button>
    </div>
  );
};

export default UndoRedoButtons;