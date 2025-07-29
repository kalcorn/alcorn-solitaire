import React from 'react';
import { BsArrowLeftCircle } from 'react-icons/bs';
import { playSoundEffect } from '@/utils/soundUtils';

interface UndoButtonProps {
  onUndo: () => void;
  canUndo: boolean;
}

const UndoButton: React.FC<UndoButtonProps> = ({ 
  onUndo, 
  canUndo
}) => {
  const handleUndo = () => {
    if (!canUndo) return;
    
    // Play card flip sound first
    playSoundEffect.cardFlip();
    
    onUndo();
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
        <BsArrowLeftCircle className="w-5 h-5 sm:w-7 sm:h-7 landscape-mobile-undo-icon" />
        <span className="text-base sm:text-xl font-bold landscape-mobile-undo-text">Undo</span>
      </button>
    </div>
  );
};

export default UndoButton;