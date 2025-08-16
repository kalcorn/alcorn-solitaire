import React from 'react';
import Image from 'next/image';
import { Suit } from '@/types';
import { BsSuitHeartFill, BsSuitDiamondFill, BsSuitClubFill, BsSuitSpadeFill } from 'react-icons/bs';
import { cn } from '@/utils/cssUtils';
import cardStyles from './Card.module.css';

// Import all face card images for bundling
import jackHearts from '/public/cards/jack-hearts.svg';
import jackDiamonds from '/public/cards/jack-diamonds.svg';
import jackClubs from '/public/cards/jack-clubs.svg';
import jackSpades from '/public/cards/jack-spades.svg';
import queenHearts from '/public/cards/queen-hearts.svg';
import queenDiamonds from '/public/cards/queen-diamonds.svg';
import queenClubs from '/public/cards/queen-clubs.svg';
import queenSpades from '/public/cards/queen-spades.svg';
import kingHearts from '/public/cards/king-hearts.svg';
import kingDiamonds from '/public/cards/king-diamonds.svg';
import kingClubs from '/public/cards/king-clubs.svg';
import kingSpades from '/public/cards/king-spades.svg';

interface CardProps {
  suit: Suit;
  rank: number;
  faceUp: boolean;
  visible?: boolean;
  cardId?: string;
  isBeingDragged?: boolean;
  onClick?: () => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onDragStart?: (event: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

const suitIcons = {
  hearts: BsSuitHeartFill,
  diamonds: BsSuitDiamondFill,
  clubs: BsSuitClubFill,
  spades: BsSuitSpadeFill,
};

// Face card image mapping
const faceCardImages = {
  'jack-hearts': jackHearts,
  'jack-diamonds': jackDiamonds,
  'jack-clubs': jackClubs,
  'jack-spades': jackSpades,
  'queen-hearts': queenHearts,
  'queen-diamonds': queenDiamonds,
  'queen-clubs': queenClubs,
  'queen-spades': queenSpades,
  'king-hearts': kingHearts,
  'king-diamonds': kingDiamonds,
  'king-clubs': kingClubs,
  'king-spades': kingSpades,
};

const rankMap = {
  1: "A", 11: "J", 12: "Q", 13: "K"
};

const Card: React.FC<CardProps> = ({ suit, rank, faceUp, visible = true, cardId, isBeingDragged, onClick, onMouseDown, onTouchStart, onDragStart, className, style }) => {
  const SuitIcon = suitIcons[suit];
  const displayRank = rankMap[rank as keyof typeof rankMap] || rank;
  const [isMouseDown, setIsMouseDown] = React.useState(false);
  const dragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const suitColor = suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  
  // Check if this is a face card
  const isFaceCard = rank === 11 || rank === 12 || rank === 13; // Jack, Queen, King
  
  // Get the appropriate imported image for face cards
  const getFaceCardImage = () => {
    if (!isFaceCard) return null;
    const cardNames = { 11: 'jack', 12: 'queen', 13: 'king' };
    const cardName = cardNames[rank as keyof typeof cardNames];
    const imageKey = `${cardName}-${suit}` as keyof typeof faceCardImages;
    return faceCardImages[imageKey];
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsMouseDown(true);
    
    // Store event data before timeout since React events are recycled
    const currentTarget = event.currentTarget;
    const clientX = event.clientX;
    const clientY = event.clientY;
    const button = event.button;
    
    // Call onDragStart immediately for left mouse button
    if (onDragStart && button === 0) {
      onDragStart(event);
    }
    
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
    
    // Call onDragStart immediately for touch events
    if (onDragStart) {
      onDragStart(event as any);
    }
    
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
      role="button"
      tabIndex={faceUp ? 0 : -1}
      aria-label={faceUp ? `${displayRank} of ${suit}` : 'Face-down card'}
      aria-describedby={faceUp ? undefined : 'card-back-description'}
      data-card-element="true"
      data-testid={cardId ? `card-${cardId}` : `card-${rank}-${suit}`}
      className={cn(
        cardStyles.card,
        faceUp ? cardStyles.faceUp : cardStyles.faceDown,
        isBeingDragged && "opacity-0 pointer-events-none",
        className
      )}
      onMouseDown={onMouseDown ? handleMouseDown : onClick}
      onMouseUp={onMouseDown ? handleMouseUp : undefined}
      onTouchStart={onTouchStart ? handleTouchStart : onClick}
      onTouchEnd={onTouchStart ? handleTouchEnd : undefined}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        userSelect: 'none',
        touchAction: 'none', // Prevent all default touch behaviors
        position: 'relative',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        display: visible ? 'block' : 'none',
        ...style // Merge passed styles to override dimensions
      }}
    >
      {faceUp ? (
        <div className="relative w-full h-full bg-white border border-blue-200 rounded-lg shadow-lg overflow-hidden">
          {isFaceCard ? (
            /* Face Card SVG Display */
            <div className="relative w-full h-full overflow-hidden rounded-lg flex flex-col justify-end">
              <Image 
                src={getFaceCardImage()!} 
                alt={`${displayRank} of ${suit}`}
                width={120}
                height={168}
                className="w-3/4 h-3/4 object-cover object-bottom rounded-lg mx-auto"
                style={{ imageRendering: 'crisp-edges', objectPosition: 'bottom' }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
              {/* Small rank and suit in corners for face cards */}
              <div className="absolute top-0.5 left-0.5">
                <span className={`${suitColor} font-bold leading-none text-xs`}>{displayRank}</span>
              </div>
              <div className="absolute top-0.5 right-0.5">
                <SuitIcon className={`${suitColor} w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6`} />
              </div>
            </div>
          ) : (
            /* Regular Number/Ace Card Display */
            <>
              {/* Top-left number */}
              <div className="absolute top-0.5 left-0.5">
                <span className={`${suitColor} font-bold leading-none text-sm`}>{displayRank}</span>
              </div>
              
              {/* Top-right suit icon */}
              <div className="absolute top-0.5 right-0.5">
                <SuitIcon className={`${suitColor} w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6`} />
              </div>
              
              {/* Center large suit symbol with vertical duo-tone effect - positioned lower */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(20%)' }}>
                <div className="relative">
                  {/* Main suit icon with duo-tone split effect */}
                  <div className="relative" style={{ width: 'clamp(1.2rem, 4vw, 4rem)', height: 'clamp(1.2rem, 4vw, 4rem)' }}>
                    {/* Left half of the icon */}
                    <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}>
                      <SuitIcon 
                        className={`${suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-700'}`}
                        style={{
                          width: 'clamp(1.2rem, 4vw, 4rem)',
                          height: 'clamp(1.2rem, 4vw, 4rem)'
                        }} 
                      />
                    </div>
                    {/* Right half of the icon with slightly different color */}
                    <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}>
                      <SuitIcon 
                        className={suit === 'hearts' || suit === 'diamonds' ? 'text-red-400' : 'text-gray-600'}
                        style={{
                          width: 'clamp(1.2rem, 4vw, 4rem)',
                          height: 'clamp(1.2rem, 4vw, 4rem)'
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
        <div 
          className="w-full h-full flex items-center justify-center"
          id="card-back-description"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default React.memo(Card);
