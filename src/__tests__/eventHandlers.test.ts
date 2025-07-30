import { createEventHandlers, EventHandlers } from '../utils/eventHandlers';
import { Card, CardPosition } from '../types';

// Mock React events
const createMockEvent = (type: 'mouse' | 'touch', x: number = 100, y: number = 200) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  clientX: x,
  clientY: y,
  touches: type === 'touch' ? [{ clientX: x, clientY: y }] : undefined,
  changedTouches: type === 'touch' ? [{ clientX: x, clientY: y }] : undefined,
  button: 0,
  target: document.createElement('div')
});

describe('Event Handlers', () => {
  let eventHandlers: EventHandlers;
  let mockGameState: any;
  let mockHandleAutoMoveToFoundation: jest.Mock;
  let mockSelectCards: jest.Mock;
  let mockGetMovableCards: jest.Mock;
  let mockStartDrag: jest.Mock;
  let mockAnimateStockFlip: jest.Mock;
  let mockGetCardById: jest.Mock;
  let mockGetElementPosition: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGameState = {
      tableauPiles: [
        [{ id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true }],
        [{ id: '13-spades', rank: 13, suit: 'spades', faceUp: true }],
        [],
        [],
        [],
        [],
        []
      ],
      foundationPiles: [
        [{ id: '1-diamonds', rank: 1, suit: 'diamonds', faceUp: true }],
        [],
        [],
        []
      ],
      wastePile: [{ id: '12-hearts', rank: 12, suit: 'hearts', faceUp: true }],
      stockPile: []
    };

    mockHandleAutoMoveToFoundation = jest.fn().mockReturnValue({ success: false });
    mockSelectCards = jest.fn();
    mockGetMovableCards = jest.fn().mockReturnValue([]);
    mockStartDrag = jest.fn();
    mockAnimateStockFlip = jest.fn();
    mockGetCardById = jest.fn();
    mockGetElementPosition = jest.fn().mockReturnValue({ x: 100, y: 200 });



    eventHandlers = createEventHandlers(
      mockGameState,
      mockHandleAutoMoveToFoundation,
      mockSelectCards,
      mockGetMovableCards,
      mockStartDrag,
      mockAnimateStockFlip
    );


  });

  describe('handleCardClick', () => {
    it('should handle single click with auto-move attempt', () => {
      const card = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      mockHandleAutoMoveToFoundation.mockReturnValue({ success: true });

      eventHandlers.handleCardClick('1-hearts', 'tableau', 0, 0);

      expect(mockHandleAutoMoveToFoundation).toHaveBeenCalledWith(card);
      expect(mockSelectCards).not.toHaveBeenCalled();
    });

    it('should handle single click when auto-move fails', () => {
      const card = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      mockHandleAutoMoveToFoundation.mockReturnValue({ success: false });
      mockGetMovableCards.mockReturnValue([card]);

      eventHandlers.handleCardClick('1-hearts', 'tableau', 0, 0);

      expect(mockHandleAutoMoveToFoundation).toHaveBeenCalledWith(card);
      expect(mockGetMovableCards).toHaveBeenCalledWith({ pileType: 'tableau', pileIndex: 0, cardIndex: 0 });
      expect(mockSelectCards).toHaveBeenCalledWith({ pileType: 'tableau', pileIndex: 0, cardIndex: 0 }, [card]);
    });

    it('should handle double click', () => {
      const card = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      mockHandleAutoMoveToFoundation.mockReturnValue({ success: true });

      // First click
      eventHandlers.handleCardClick('1-hearts', 'tableau', 0, 0);
      
      // Second click (simulate double click by calling again immediately)
      eventHandlers.handleCardClick('1-hearts', 'tableau', 0, 0);

      expect(mockHandleAutoMoveToFoundation).toHaveBeenCalledTimes(2);
    });

    it('should handle click when no movable cards', () => {
      const card = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      mockHandleAutoMoveToFoundation.mockReturnValue({ success: false });
      mockGetMovableCards.mockReturnValue([]);

      eventHandlers.handleCardClick('1-hearts', 'tableau', 0, 0);

      expect(mockSelectCards).not.toHaveBeenCalled();
    });

    it('should handle click when card not found', () => {
      eventHandlers.handleCardClick('nonexistent', 'tableau', 0, 0);

      expect(mockHandleAutoMoveToFoundation).not.toHaveBeenCalled();
      expect(mockSelectCards).not.toHaveBeenCalled();
    });
  });

  describe('handleCardDragStart', () => {
    it('should start drag for tableau card', () => {
      const card = { id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true };
      mockGetMovableCards.mockReturnValue([card]);
      const event = createMockEvent('mouse');

      eventHandlers.handleCardDragStart('1-hearts', event);

      expect(mockStartDrag).toHaveBeenCalledWith([card], { pileType: 'tableau', pileIndex: 0, cardIndex: 0 }, event);
    });

    it('should start drag for foundation card', () => {
      const card = { id: '1-diamonds', rank: 1, suit: 'diamonds', faceUp: true };
      mockGetMovableCards.mockReturnValue([card]);
      const event = createMockEvent('mouse');

      eventHandlers.handleCardDragStart('1-diamonds', event);

      expect(mockStartDrag).toHaveBeenCalledWith([card], { pileType: 'foundation', pileIndex: 0, cardIndex: 0 }, event);
    });

    it('should start drag for waste card', () => {
      const card = { id: '12-hearts', rank: 12, suit: 'hearts', faceUp: true };
      mockGetMovableCards.mockReturnValue([card]);
      const event = createMockEvent('mouse');

      eventHandlers.handleCardDragStart('12-hearts', event);

      expect(mockStartDrag).toHaveBeenCalledWith([card], { pileType: 'waste', pileIndex: 0, cardIndex: 0 }, event);
    });

    it('should not start drag when card not found', () => {
      const event = createMockEvent('mouse');

      eventHandlers.handleCardDragStart('nonexistent', event);

      expect(mockStartDrag).not.toHaveBeenCalled();
    });

    it('should not start drag when card not in any pile', () => {
      mockGetCardById.mockReturnValue({ id: 'nonexistent', rank: 1, suit: 'hearts', faceUp: true });
      const event = createMockEvent('mouse');

      eventHandlers.handleCardDragStart('nonexistent', event);

      expect(mockStartDrag).not.toHaveBeenCalled();
    });
  });

  describe('getCardById', () => {
    it('should find card in tableau piles', () => {
      const result = eventHandlers.getCardById('1-hearts');
      expect(result).toEqual({ id: '1-hearts', rank: 1, suit: 'hearts', faceUp: true });
    });

    it('should find card in foundation piles', () => {
      const result = eventHandlers.getCardById('1-diamonds');
      expect(result).toEqual({ id: '1-diamonds', rank: 1, suit: 'diamonds', faceUp: true });
    });

    it('should find card in waste pile', () => {
      const result = eventHandlers.getCardById('12-hearts');
      expect(result).toEqual({ id: '12-hearts', rank: 12, suit: 'hearts', faceUp: true });
    });

    it('should return null when card not found', () => {
      const result = eventHandlers.getCardById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getElementPosition', () => {
    it('should return element position', () => {
      // Mock document.querySelector to return element with getBoundingClientRect
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 50,
          top: 100,
          width: 100,
          height: 200
        })
      };
      
      jest.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);
      
      const result = eventHandlers.getElementPosition('test-selector');
      
      expect(result).toEqual({ x: 100, y: 200 }); // left + width/2, top + height/2
      
      // Restore mock
      (document.querySelector as jest.Mock).mockRestore();
    });

    it('should return null when element not found', () => {
      jest.spyOn(document, 'querySelector').mockReturnValue(null);
      
      const result = eventHandlers.getElementPosition('non-existent');
      
      expect(result).toBeNull();
      
      (document.querySelector as jest.Mock).mockRestore();
    });
  });
}); 