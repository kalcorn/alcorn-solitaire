import React from 'react';
import { Suit } from '@/types';
import { BsSuitHeartFill, BsSuitDiamondFill, BsSuitClubFill, BsSuitSpadeFill } from 'react-icons/bs';

interface CardProps {
  suit: Suit;
  rank: number;
  faceUp: boolean;
  cardId?: string;
  isBeingDragged?: boolean;
  onClick?: () => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
}

const suitIcons = {
  hearts: BsSuitHeartFill,
  diamonds: BsSuitDiamondFill,
  clubs: BsSuitClubFill,
  spades: BsSuitSpadeFill,
};

const rankMap = {
  1: "A", 11: "J", 12: "Q", 13: "K"
};

const Card: React.FC<CardProps> = ({ suit, rank, faceUp, cardId, isBeingDragged, onClick, onMouseDown, onTouchStart }) => {
  const SuitIcon = suitIcons[suit];
  const displayRank = rankMap[rank as keyof typeof rankMap] || rank;
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const dragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const suitColor = suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  
  // Check if this is a face card
  const isFaceCard = rank === 11 || rank === 12 || rank === 13; // Jack, Queen, King
  
  // Get the appropriate SVG path for face cards
  const getFaceCardSvg = () => {
    if (!isFaceCard) return null;
    const cardNames = { 11: 'jack', 12: 'queen', 13: 'king' };
    const cardName = cardNames[rank as keyof typeof cardNames];
    return `/cards/${cardName}-${suit}.svg`;
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsMouseDown(true);
    
    // Store event data before timeout since React events are recycled
    const currentTarget = event.currentTarget;
    const clientX = event.clientX;
    const clientY = event.clientY;
    const button = event.button;
    
    // Set a timeout to distinguish between click and drag
    dragTimeoutRef.current = setTimeout(() => {
      if (onMouseDown && currentTarget) {
        // Create a synthetic event with preserved data
        const syntheticEvent = {
          currentTarget,
          clientX,
          clientY,
          button,
          preventDefault: () => {},
          stopPropagation: () => {}
        } as React.MouseEvent;
        onMouseDown(syntheticEvent);
      }
    }, 150); // 150ms delay before starting drag
  };

  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    // If mouse was down for less than 150ms, treat it as a click
    if (isMouseDown && onClick) {
      onClick();
    }
    setIsMouseDown(false);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    setIsMouseDown(true);
    
    // Store event data before timeout since React events are recycled
    const currentTarget = event.currentTarget;
    const touch = event.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    
    // Set a timeout to distinguish between tap and drag
    dragTimeoutRef.current = setTimeout(() => {
      if (onTouchStart && currentTarget) {
        // Create a synthetic event with preserved data
        const syntheticEvent = {
          currentTarget,
          touches: [{ clientX, clientY }],
          preventDefault: () => {},
          stopPropagation: () => {}
        } as any;
        onTouchStart(syntheticEvent);
      }
    }, 150); // 150ms delay before starting drag
  };

  const handleTouchEnd = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    // If touch was down for less than 150ms, treat it as a tap
    if (isMouseDown && onClick) {
      onClick();
    }
    setIsMouseDown(false);
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`card rounded-lg shadow-xl
        flex items-center justify-center select-none cursor-pointer
        transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95
        ${faceUp ? "face-up" : "face-down"}
        ${isBeingDragged ? "opacity-0 pointer-events-none" : ""}`
      }
      onMouseDown={onMouseDown ? handleMouseDown : onClick}
      onMouseUp={onMouseDown ? handleMouseUp : undefined}
      onTouchStart={onTouchStart ? handleTouchStart : onClick}
      onTouchEnd={onTouchStart ? handleTouchEnd : undefined}
      style={{
        userSelect: 'none',
        touchAction: 'none', // Prevent all default touch behaviors
        position: 'relative',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {faceUp ? (
        <div className="relative w-full h-full bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-lg shadow-lg">
          {isFaceCard ? (
            /* Face Card SVG Display */
            <div className="relative w-full h-full overflow-hidden rounded-lg flex flex-col justify-end">
              <img 
                src={getFaceCardSvg()!} 
                alt={`${displayRank} of ${suit}`}
                className="w-3/4 h-3/4 object-cover object-bottom rounded-lg mx-auto"
                style={{ imageRendering: 'crisp-edges', objectPosition: 'bottom' }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
              {/* Small rank and suit in corners for face cards */}
              <div className="absolute top-1 left-1">
                <span className={`${suitColor} font-bold leading-none text-xs`}>{displayRank}</span>
              </div>
              <div className="absolute top-1 right-1">
                <SuitIcon className={`${suitColor} w-3 h-3`} />
              </div>
            </div>
          ) : (
            /* Regular Number/Ace Card Display */
            <>
              {/* Top-left number */}
              <div className="absolute top-1 left-1">
                <span className={`${suitColor} font-bold leading-none text-sm`}>{displayRank}</span>
              </div>
              
              {/* Top-right suit icon */}
              <div className="absolute top-1 right-1">
                <SuitIcon className={`${suitColor} w-4 h-4`} />
              </div>
              
              {/* Center large suit symbol with fancy duotone effect - positioned lower */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(20%)' }}>
                <div className="relative">
                  {/* Main suit icon with duotone effect */}
                  <div className="relative">
                    <SuitIcon 
                      className={`${suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-700'} drop-shadow-lg`} 
                      style={{
                        fontSize: 'clamp(1.2rem, 4vw, 4rem)',
                        filter: suit === 'hearts' || suit === 'diamonds' 
                          ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.3)) drop-shadow(0 2px 4px rgba(220, 38, 38, 0.4))'
                          : 'drop-shadow(0 0 8px rgba(55, 65, 81, 0.3)) drop-shadow(0 2px 4px rgba(31, 41, 55, 0.4))'
                      }} 
                    />
                    {/* Duotone overlay */}
                    <div className="absolute inset-0">
                      <SuitIcon 
                        className={suit === 'hearts' || suit === 'diamonds' ? 'text-pink-300' : 'text-slate-500'}
                        style={{
                          fontSize: 'clamp(1.2rem, 4vw, 4rem)',
                          mixBlendMode: 'multiply',
                          opacity: 0.6,
                          transform: 'translate(1px, -1px)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Clean modern border accent */}
              <div className="absolute inset-0 rounded-lg ring-1 ring-black/5 ring-inset"></div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center" />
      )}
    </div>
  );
};

export default React.memo(Card);
