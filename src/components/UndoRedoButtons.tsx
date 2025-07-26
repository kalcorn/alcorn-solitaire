import React from 'react';
import { BsArrowCounterclockwise, BsArrowClockwise } from 'react-icons/bs';

interface UndoRedoButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const UndoRedoButtons: React.FC<UndoRedoButtonsProps> = ({ 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex flex-row gap-6 
                    sm:bottom-6 sm:left-1/2 sm:transform sm:-translate-x-1/2
                    max-sm:bottom-4 max-sm:left-4 max-sm:transform-none">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`transition-all duration-200 flex items-center gap-2 ${
          canUndo 
            ? 'text-gray-100 hover:text-white hover:scale-105' 
            : 'cursor-not-allowed text-gray-500'
        }`}
        title="Undo last move"
      >
        <BsArrowCounterclockwise className="w-5 h-5" />
        <span className="text-sm font-bold max-sm:hidden">Undo</span>
      </button>
      
      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`transition-all duration-200 flex items-center gap-2 ${
          canRedo 
            ? 'text-gray-100 hover:text-white hover:scale-105' 
            : 'cursor-not-allowed text-gray-500'
        }`}
        title="Redo last move"
      >
        <BsArrowClockwise className="w-5 h-5" />
        <span className="text-sm font-bold max-sm:hidden">Redo</span>
      </button>
    </div>
  );
};

export default UndoRedoButtons;