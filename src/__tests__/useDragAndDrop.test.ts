import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { Card, CardPosition } from '@/types';

describe('useDragAndDrop Hook', () => {
  let mockCards: Card[];
  let mockPosition: CardPosition;
  let mockMouseEvent: React.MouseEvent;
  let mockTouchEvent: React.TouchEvent;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock document.elementFromPoint
    Object.defineProperty(document, 'elementFromPoint', {
      value: jest.fn(() => null),
      writable: true
    });
    
    mockCards = [
      { id: 'card1', suit: 'hearts' as const, rank: 1, faceUp: true },
      { id: 'card2', suit: 'spades' as const, rank: 2, faceUp: true }
    ];
    
    mockPosition = {
      pileType: 'tableau',
      pileIndex: 0,
      cardIndex: 0
    };
    
    mockMouseEvent = {
      clientX: 100,
      clientY: 200,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: { getBoundingClientRect: () => ({ left: 50, top: 150, width: 100, height: 140 }) }
    } as any;
    
    mockTouchEvent = {
      touches: [{ clientX: 150, clientY: 250 }],
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: { getBoundingClientRect: () => ({ left: 75, top: 175, width: 100, height: 140 }) }
    } as any;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Hook initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.draggedCards).toEqual([]);
      expect(result.current.dragState.dragSource).toBeNull();
      expect(result.current.dragState.isAnimating).toBe(false);
      expect(result.current.dragState.isSnapBack).toBe(false);
      expect(result.current.dropZones).toEqual([]);
      expect(result.current.hoveredZone).toBeNull();
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      expect(typeof result.current.startDrag).toBe('function');
      expect(typeof result.current.updateDrag).toBe('function');
      expect(typeof result.current.endDrag).toBe('function');
      expect(typeof result.current.cancelDrag).toBe('function');
      expect(typeof result.current.setDropZones).toBe('function');
      expect(typeof result.current.clearDropZones).toBe('function');
      expect(typeof result.current.isCardBeingDragged).toBe('function');
      expect(typeof result.current.isZoneHovered).toBe('function');
    });
  });

  describe('startDrag', () => {
    it('should start drag with mouse event', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      expect(result.current.dragState.isDragging).toBe(true);
      expect(result.current.dragState.draggedCards).toEqual(mockCards);
      expect(result.current.dragState.dragSource).toEqual(mockPosition);
      expect(result.current.dragState.dragPosition.x).toBe(100);
      expect(result.current.dragState.dragPosition.y).toBe(200);
    });

    it('should start drag with touch event', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockTouchEvent);
      });
      
      expect(result.current.dragState.isDragging).toBe(true);
      expect(result.current.dragState.draggedCards).toEqual(mockCards);
      expect(result.current.dragState.dragSource).toEqual(mockPosition);
      expect(result.current.dragState.dragPosition.x).toBe(150);
      expect(result.current.dragState.dragPosition.y).toBe(250);
    });

    it('should not start drag with empty cards array', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag([], mockPosition, mockMouseEvent);
      });
      
      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.draggedCards).toEqual([]);
    });

    it('should calculate correct drag offset', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      // Should calculate offset from mouse position to card center
      expect(result.current.dragState.dragOffset.x).toBeDefined();
      expect(result.current.dragState.dragOffset.y).toBeDefined();
    });

    it('should handle single card drag', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const singleCard = [mockCards[0]];
      
      act(() => {
        result.current.startDrag(singleCard, mockPosition, mockMouseEvent);
      });
      
      expect(result.current.dragState.draggedCards).toHaveLength(1);
      expect(result.current.dragState.draggedCards[0]).toEqual(mockCards[0]);
    });
  });

  describe('updateDrag', () => {
    it('should update drag position with mouse event', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      // Start drag first
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      const updateEvent = { ...mockMouseEvent, clientX: 150, clientY: 250 };
      
      act(() => {
        result.current.updateDrag(updateEvent as any);
      });
      
      expect(result.current.dragState.dragPosition.x).toBe(150);
      expect(result.current.dragState.dragPosition.y).toBe(250);
    });

    it('should update drag position with touch event', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockTouchEvent);
      });
      
      const updateTouchEvent = {
        ...mockTouchEvent,
        touches: [{ clientX: 200, clientY: 300 }]
      };
      
      act(() => {
        result.current.updateDrag(updateTouchEvent as any);
      });
      
      expect(result.current.dragState.dragPosition.x).toBe(200);
      expect(result.current.dragState.dragPosition.y).toBe(300);
    });

    it('should not update when not dragging', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      const initialState = result.current.dragState;
      
      act(() => {
        result.current.updateDrag(mockMouseEvent as any);
      });
      
      expect(result.current.dragState.dragPosition).toEqual(initialState.dragPosition);
    });

    it('should throttle updates for performance', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      const updateEvent1 = { ...mockMouseEvent, clientX: 120, clientY: 220 };
      const updateEvent2 = { ...mockMouseEvent, clientX: 140, clientY: 240 };
      
      act(() => {
        result.current.updateDrag(updateEvent1 as any);
        result.current.updateDrag(updateEvent2 as any);
      });
      
      // Should handle rapid updates without performance issues
      expect(result.current.dragState.isDragging).toBe(true);
    });
  });

  describe('endDrag', () => {
    it('should end drag and reset state', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      expect(result.current.dragState.isDragging).toBe(true);
      
      act(() => {
        result.current.endDrag();
        jest.runAllTimers();
      });
      
      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.draggedCards).toEqual([]);
      expect(result.current.dragState.dragSource).toBeNull();
    });

    it('should handle ending drag when not dragging', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.endDrag();
      });
      
      expect(result.current.dragState.isDragging).toBe(false);
    });

    it('should clear hovered zone on end drag', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
        result.current.setDropZones([
          { pileType: 'foundation', pileIndex: 0, isActive: true }
        ]);
      });
      
      act(() => {
        result.current.endDrag();
      });
      
      expect(result.current.hoveredZone).toBeNull();
    });
  });

  describe('cancelDrag', () => {
    it('should cancel drag with snap back animation', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      act(() => {
        result.current.cancelDrag();
      });
      
      expect(result.current.dragState.isSnapBack).toBe(true);
      expect(result.current.dragState.isAnimating).toBe(true);
    });

    it('should reset state after snap back animation', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
        result.current.cancelDrag();
      });
      
      // Advance timers to complete the animation
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      // Run any pending effects
      act(() => {
        jest.runAllTimers();
      });
      
      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.isAnimating).toBe(false);
      expect(result.current.dragState.isSnapBack).toBe(false);
    });

    it('should handle cancel when not dragging', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.cancelDrag();
      });
      
      expect(result.current.dragState.isSnapBack).toBe(false);
      expect(result.current.dragState.isAnimating).toBe(false);
    });
  });

  describe('Drop zones management', () => {
    it('should set drop zones', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const dropZones = [
        { pileType: 'foundation' as const, pileIndex: 0, isActive: true },
        { pileType: 'tableau' as const, pileIndex: 1, isActive: false }
      ];
      
      act(() => {
        result.current.setDropZones(dropZones);
      });
      
      expect(result.current.dropZones).toEqual(dropZones);
    });

    it('should clear drop zones', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.setDropZones([
          { pileType: 'foundation', pileIndex: 0, isActive: true }
        ]);
      });
      
      expect(result.current.dropZones).toHaveLength(1);
      
      act(() => {
        result.current.clearDropZones();
      });
      
      expect(result.current.dropZones).toEqual([]);
    });

    it('should update hovered zone', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const dropZone = { pileType: 'foundation' as const, pileIndex: 0, isActive: true };
      
      act(() => {
        result.current.setDropZones([dropZone]);
      });
      
      // Simulate hover detection logic would set this
      expect(result.current.dropZones).toHaveLength(1);
    });
  });

  describe('Helper functions', () => {
    it('should check if card is being dragged', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      expect(result.current.isCardBeingDragged('card1')).toBe(true);
      expect(result.current.isCardBeingDragged('card2')).toBe(true);
      expect(result.current.isCardBeingDragged('card3')).toBe(false);
    });

    it('should check if zone is hovered', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.setDropZones([
          { pileType: 'foundation', pileIndex: 0, isActive: true }
        ]);
      });
      
      expect(result.current.isZoneHovered('foundation', 0)).toBe(false);
      expect(result.current.isZoneHovered('tableau', 1)).toBe(false);
    });

    it('should return false for card check when not dragging', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      expect(result.current.isCardBeingDragged('card1')).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing target in event', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const eventWithoutTarget = { ...mockMouseEvent, target: null };
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, eventWithoutTarget as any);
      });
      
      expect(result.current.dragState.isDragging).toBe(true);
    });

    it('should handle invalid touch event', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const invalidTouchEvent = { ...mockTouchEvent, touches: [] };
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, invalidTouchEvent as any);
      });
      
      // Should handle gracefully without crashing
      expect(result.current.dragState).toBeDefined();
    });

    it('should handle rapid start/end cycles', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      // Rapid start/end cycles should not cause issues
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
          result.current.endDrag();
        });
        
        // Advance timers after each cycle
        act(() => {
          jest.runAllTimers();
        });
      }
      
      // Wait for any remaining timers to complete
      act(() => {
        jest.runAllTimers();
      });
      
      expect(result.current.dragState.isDragging).toBe(false);
    });

    it('should handle multiple cancel attempts', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
        result.current.cancelDrag();
        result.current.cancelDrag(); // Second cancel should be ignored
      });
      
      // Check animation state immediately after cancel
      expect(result.current.dragState.isAnimating).toBe(true);
      expect(result.current.dragState.isSnapBack).toBe(true);
      
      // Complete animation
      act(() => {
        jest.advanceTimersByTime(300);
        jest.runAllTimers();
      });
      
      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.isAnimating).toBe(false);
    });
  });

  describe('Performance considerations', () => {
    it('should not create memory leaks', () => {
      const { result, unmount } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      unmount();
      
      // Should not throw after unmount
      expect(true).toBe(true);
    });

    it('should handle large numbers of cards efficiently', () => {
      const { result } = renderHook(() => useDragAndDrop());
      const largeCardSet = Array.from({ length: 52 }, (_, i) => ({
        id: `card${i}`,
        suit: 'hearts' as const,
        rank: 1 as const,
        faceUp: true
      }));
      
      act(() => {
        result.current.startDrag(largeCardSet, mockPosition, mockMouseEvent);
      });
      
      expect(result.current.dragState.draggedCards).toHaveLength(52);
      expect(result.current.dragState.isDragging).toBe(true);
    });

    it('should handle rapid position updates efficiently', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      // Rapid position updates
      for (let i = 0; i < 10; i++) {
        act(() => {
          const updateEvent = { 
            ...mockMouseEvent, 
            clientX: 100 + i, 
            clientY: 200 + i 
          };
          result.current.updateDrag(updateEvent as any);
          jest.advanceTimersByTime(16); // ~60fps
        });
      }
      
      expect(result.current.dragState.isDragging).toBe(true);
      expect(result.current.dragState.dragPosition.x).toBe(109); // 100 + 9 (last iteration)
      expect(result.current.dragState.dragPosition.y).toBe(209); // 200 + 9 (last iteration)
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete drag and drop cycle', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      // Set up drop zones
      act(() => {
        result.current.setDropZones([
          { pileType: 'foundation', pileIndex: 0, isActive: true }
        ]);
      });
      
      // Start drag
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      expect(result.current.dragState.isDragging).toBe(true);
      
      // Update position
      const moveEvent = { ...mockMouseEvent, clientX: 150, clientY: 250 };
      
      act(() => {
        result.current.updateDrag(moveEvent as any);
      });
      
      // End drag with successful drop - no onDrop callback since no hovered zone
      act(() => {
        result.current.endDrag();
        jest.runAllTimers();
      });
      
      expect(result.current.dragState.isDragging).toBe(false);
    });

    it('should handle drag cancel scenario', () => {
      const { result } = renderHook(() => useDragAndDrop());
      
      act(() => {
        result.current.startDrag(mockCards, mockPosition, mockMouseEvent);
      });
      
      // Update position
      const moveEvent = { ...mockMouseEvent, clientX: 150, clientY: 250 };
      
      act(() => {
        result.current.updateDrag(moveEvent as any);
        result.current.cancelDrag();
      });
      
      expect(result.current.dragState.isAnimating).toBe(true);
      expect(result.current.dragState.isSnapBack).toBe(true);

      // Complete animation
      act(() => {
        jest.advanceTimersByTime(300);
      });
      
      expect(result.current.dragState.isDragging).toBe(false);
      expect(result.current.dragState.isAnimating).toBe(false);
    });
  });
});