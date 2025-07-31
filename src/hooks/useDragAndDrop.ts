import { useState, useCallback, useRef } from 'react';
import { Card, CardPosition } from '@/types';

interface DragState {
  isDragging: boolean;
  draggedCards: Card[];
  dragSource: CardPosition | null;
  dragOffset: { x: number; y: number };
  dragPosition: { x: number; y: number };
  isAnimating: boolean;
  isSnapBack: boolean;
}

interface DropZone {
  pileType: 'tableau' | 'foundation';
  pileIndex: number;
  isActive: boolean;
}

/**
 * Custom hook for drag and drop functionality
 */
export function useDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCards: [],
    dragSource: null,
    dragOffset: { x: 0, y: 0 },
    dragPosition: { x: 0, y: 0 },
    isAnimating: false,
    isSnapBack: false
  });

  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [hoveredZone, setHoveredZone] = useState<DropZone | null>(null);
  const lastUpdateRef = useRef<number>(0);

  /**
   * Starts dragging cards
   */
  const startDrag = useCallback((cards: Card[], source: CardPosition, event: React.MouseEvent | React.TouchEvent) => {
    if (cards.length === 0) return;

    // Calculate offset from mouse/touch to card center
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if (event.changedTouches && event.changedTouches.length > 0) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
      } else {
        return; // No valid touch data
      }
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const cardElement = event.currentTarget as HTMLElement;
    if (!cardElement) {
      return;
    }
    
    const rect = cardElement.getBoundingClientRect();
    if (!rect) {
      return;
    }
    
    const offsetX = clientX - rect.left - rect.width / 2;
    const offsetY = clientY - rect.top - rect.height / 2;

    setDragState({
      isDragging: true,
      draggedCards: cards,
      dragSource: source,
      dragOffset: { x: offsetX, y: offsetY },
      dragPosition: { x: clientX, y: clientY },
      isAnimating: false,
      isSnapBack: false
    });

    // Initialize drop zones
    const zones: DropZone[] = [];
    
    // Add tableau drop zones
    for (let i = 0; i < 7; i++) {
      zones.push({
        pileType: 'tableau',
        pileIndex: i,
        isActive: false
      });
    }
    
    // Add foundation drop zones
    for (let i = 0; i < 4; i++) {
      zones.push({
        pileType: 'foundation',
        pileIndex: i,
        isActive: false
      });
    }
    
    setDropZones(zones);
  }, []);

  /**
   * Updates drag position with smooth animation
   */
  const updateDrag = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging || typeof document === 'undefined') return;

    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      // Prevent scrolling and other touch behaviors during drag
      event.stopPropagation();
      
      // Use the first touch point, but ensure it exists
      if (event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        // Fallback to changedTouches if touches is empty (can happen on touchend)
        if (event.changedTouches && event.changedTouches.length > 0) {
          clientX = event.changedTouches[0].clientX;
          clientY = event.changedTouches[0].clientY;
        } else {
          return; // No valid touch data
        }
      }
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Update position immediately for better test compatibility
    setDragState(prev => {
      if (!prev.isDragging) return prev; // Guard against race conditions
      return {
        ...prev,
        dragPosition: { x: clientX, y: clientY }
      };
    });

    // Throttle drop zone detection for better performance
    const now = Date.now();
    if (!lastUpdateRef.current || now - lastUpdateRef.current > 16) { // ~60fps
      lastUpdateRef.current = now;
      
      // Update drop zone hover states based on cursor position
      const elementBelow = document.elementFromPoint(clientX, clientY);
      let newHoveredZone: DropZone | null = null;

      if (elementBelow) {
        // Check if cursor is over a drop zone
        const dropZoneElement = elementBelow.closest('[data-drop-zone]');
        if (dropZoneElement) {
          const pileType = dropZoneElement.getAttribute('data-pile-type') as 'tableau' | 'foundation';
          const pileIndex = parseInt(dropZoneElement.getAttribute('data-pile-index') || '0');
          
          newHoveredZone = {
            pileType,
            pileIndex,
            isActive: true
          };
        }
      }

      setHoveredZone(newHoveredZone);
    }
  }, [dragState.isDragging]);

  /**
   * Ends drag operation and attempts to drop cards
   */
  const endDrag = useCallback((onMoveCards?: (from: CardPosition, to: CardPosition, cards: Card[]) => any) => {
    if (!dragState.isDragging) return null;

    // If no hovered zone, treat as failed drop
    if (!hoveredZone) {
      setDragState(prev => ({
        ...prev,
        isSnapBack: true,
        isAnimating: true
      }));

      // After snap-back animation, reset state
      setTimeout(() => {
        setDragState({
          isDragging: false,
          draggedCards: [],
          dragSource: null,
          dragOffset: { x: 0, y: 0 },
          dragPosition: { x: 0, y: 0 },
          isAnimating: false,
          isSnapBack: false
        });
        setDropZones([]);
        setHoveredZone(null);
      }, 300); // Match animation duration
      
      return { success: false };
    }

    const result = onMoveCards?.(dragState.dragSource!, {
      pileType: hoveredZone.pileType,
      pileIndex: hoveredZone.pileIndex,
      cardIndex: 0
    }, dragState.draggedCards) || { success: false };

    // If drop failed or no valid target, trigger snap-back animation
    if (!result.success) {
      // Immediately clear hover zone to remove green border
      setHoveredZone(null);
      
      setDragState(prev => ({
        ...prev,
        isSnapBack: true,
        isAnimating: true
      }));

      // After snap-back animation, reset state
      setTimeout(() => {
        setDragState({
          isDragging: false,
          draggedCards: [],
          dragSource: null,
          dragOffset: { x: 0, y: 0 },
          dragPosition: { x: 0, y: 0 },
          isAnimating: false,
          isSnapBack: false
        });
        setDropZones([]);
        setHoveredZone(null);
      }, 300); // Match animation duration
    } else {
      // Successful drop - reset immediately for better test compatibility
      setDragState({
        isDragging: false,
        draggedCards: [],
        dragSource: null,
        dragOffset: { x: 0, y: 0 },
        dragPosition: { x: 0, y: 0 },
        isAnimating: false,
        isSnapBack: false
      });
      setDropZones([]);
      setHoveredZone(null);
    }

    return result;
  }, [dragState, hoveredZone]);

  /**
   * Cancels drag operation
   */
  const cancelDrag = useCallback(() => {
    if (!dragState.isDragging) return;
    
    setDragState(prev => ({
      ...prev,
      isSnapBack: true,
      isAnimating: true
    }));

    // After snap-back animation, reset state
    setTimeout(() => {
      setDragState({
        isDragging: false,
        draggedCards: [],
        dragSource: null,
        dragOffset: { x: 0, y: 0 },
        dragPosition: { x: 0, y: 0 },
        isAnimating: false,
        isSnapBack: false
      });
      setDropZones([]);
      setHoveredZone(null);
    }, 300); // Match animation duration
  }, [dragState.isDragging]);

  /**
   * Clears drop zones
   */
  const clearDropZones = useCallback(() => {
    setDropZones([]);
    setHoveredZone(null);
  }, []);

  /**
   * Checks if a card should be hidden during drag
   */
  const isCardBeingDragged = useCallback((cardId: string): boolean => {
    return dragState.isDragging && !dragState.isSnapBack && 
           dragState.draggedCards.some(card => card.id === cardId);
  }, [dragState]);

  /**
   * Checks if a drop zone is currently being hovered
   */
  const isZoneHovered = useCallback((pileType: 'tableau' | 'foundation', pileIndex: number): boolean => {
    return hoveredZone?.pileType === pileType && hoveredZone?.pileIndex === pileIndex;
  }, [hoveredZone]);

  /**
   * Gets the current drag preview position with smooth animations
   */
  const getDragPreviewStyle = useCallback(() => {
    if (!dragState.isDragging) return { display: 'none' };

    const scale = hoveredZone ? 1.08 : 1.02;
    const rotation = hoveredZone ? '2deg' : '3deg';
    const opacity = hoveredZone ? 0.95 : 0.85;

    // Responsive card dimensions for different layouts - match CSS exactly
    const isLandscapeMobile = window.innerHeight <= 500 && window.innerWidth >= 640 && window.innerWidth <= 1024;
    
    let cardWidth: number;
    let cardHeight: number;
    
    if (isLandscapeMobile) {
      // Landscape mobile: 60x84
      cardWidth = 60;
      cardHeight = 84;
    } else if (window.innerWidth >= 1536) {
      // 2XL breakpoint: 110x154
      cardWidth = 110;
      cardHeight = 154;
    } else if (window.innerWidth >= 1280) {
      // XL breakpoint: 100x140
      cardWidth = 100;
      cardHeight = 140;
    } else if (window.innerWidth >= 1024) {
      // LG breakpoint: 100x140
      cardWidth = 100;
      cardHeight = 140;
    } else if (window.innerWidth >= 768) {
      // MD breakpoint: 85x119
      cardWidth = 85;
      cardHeight = 119;
    } else if (window.innerWidth >= 640) {
      // SM breakpoint: 65x91
      cardWidth = 65;
      cardHeight = 91;
    } else {
      // Base mobile: 52x72
      cardWidth = 52;
      cardHeight = 72;
    }

    return {
      position: 'fixed' as const,
      left: dragState.dragPosition.x - dragState.dragOffset.x - (cardWidth / 2),
      top: dragState.dragPosition.y - dragState.dragOffset.y - (cardHeight / 2),
      width: cardWidth,
      height: cardHeight,
      zIndex: 1000,
      pointerEvents: 'none' as const,
      transform: `rotate(${rotation}) scale(${scale})`,
      opacity,
      transition: dragState.isSnapBack 
        ? 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' 
        : 'transform 0.1s ease-out, opacity 0.1s ease-out',
      filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4))',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden' as const,
      perspective: '1000px'
    };
  }, [dragState, hoveredZone]);

  return {
    // State
    dragState,
    dropZones,
    hoveredZone,
    
    // Actions
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    setDropZones,
    clearDropZones,
    
    // Utilities
    isZoneHovered,
    isCardBeingDragged,
    getDragPreviewStyle
  };
}