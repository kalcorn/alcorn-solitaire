import { useState, useCallback } from 'react';
import { Card, CardPosition } from '@/types';

interface DragState {
  isDragging: boolean;
  draggedCards: Card[];
  dragSource: CardPosition | null;
  dragOffset: { x: number; y: number };
  dragPosition: { x: number; y: number };
  isAnimating: boolean;
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
    isAnimating: false
  });

  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [hoveredZone, setHoveredZone] = useState<DropZone | null>(null);

  /**
   * Starts dragging cards
   */
  const startDrag = useCallback((cards: Card[], source: CardPosition, event: React.MouseEvent | React.TouchEvent) => {
    if (cards.length === 0) return;

    // Calculate offset from mouse/touch to card center
    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const cardElement = event.currentTarget as HTMLElement;
    const rect = cardElement.getBoundingClientRect();
    const offsetX = clientX - rect.left - rect.width / 2;
    const offsetY = clientY - rect.top - rect.height / 2;

    setDragState({
      isDragging: true,
      draggedCards: cards,
      dragSource: source,
      dragOffset: { x: offsetX, y: offsetY },
      dragPosition: { x: clientX, y: clientY },
      isAnimating: false
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
    
    // Prevent default drag behavior
    event.preventDefault();
  }, []);

  /**
   * Updates drag position with smooth animation
   */
  const updateDrag = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging || typeof document === 'undefined') return;

    let clientX: number, clientY: number;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Update drag position for smooth movement
    setDragState(prev => ({
      ...prev,
      dragPosition: { x: clientX, y: clientY }
    }));

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
  }, [dragState.isDragging]);

  /**
   * Ends drag operation
   */
  const endDrag = useCallback((onDrop?: (source: CardPosition, target: CardPosition, cards: Card[]) => void) => {
    if (!dragState.isDragging) return null;

    const result = {
      source: dragState.dragSource!,
      target: hoveredZone ? {
        pileType: hoveredZone.pileType,
        pileIndex: hoveredZone.pileIndex,
        cardIndex: 0
      } as CardPosition : null,
      cards: dragState.draggedCards
    };

    // Call drop handler if provided and we have a valid target
    if (onDrop && result.target) {
      onDrop(result.source, result.target, result.cards);
    }

    // Reset drag state with animation
    setDragState({
      isDragging: false,
      draggedCards: [],
      dragSource: null,
      dragOffset: { x: 0, y: 0 },
      dragPosition: { x: 0, y: 0 },
      isAnimating: false
    });
    
    setDropZones([]);
    setHoveredZone(null);

    return result;
  }, [dragState, hoveredZone]);

  /**
   * Cancels drag operation
   */
  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedCards: [],
      dragSource: null,
      dragOffset: { x: 0, y: 0 },
      dragPosition: { x: 0, y: 0 },
      isAnimating: false
    });
    
    setDropZones([]);
    setHoveredZone(null);
  }, []);

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

    const scale = hoveredZone ? 1.05 : 1;
    const rotation = hoveredZone ? '3deg' : '5deg';
    const opacity = hoveredZone ? 0.9 : 0.8;

    return {
      position: 'fixed' as const,
      left: dragState.dragPosition.x - dragState.dragOffset.x - 64, // Half card width
      top: dragState.dragPosition.y - dragState.dragOffset.y - 92, // Half card height
      zIndex: 1000,
      pointerEvents: 'none' as const,
      transform: `rotate(${rotation}) scale(${scale})`,
      opacity,
      transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
      filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))'
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
    
    // Utilities
    isZoneHovered,
    getDragPreviewStyle
  };
}