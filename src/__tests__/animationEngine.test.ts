import { animateElement, animateElementSequence } from '@/utils/animationEngine';

// Mock position detection
jest.mock('@/utils/positionDetection', () => ({
  getElementPositions: jest.fn(() => ({
    from: { x: 0, y: 0, width: 100, height: 140 },
    to: { x: 200, y: 100, width: 100, height: 140 }
  }))
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn();
global.requestAnimationFrame = mockRequestAnimationFrame;

// Mock setTimeout
const mockSetTimeout = jest.fn() as any;
mockSetTimeout.__promisify__ = jest.fn();
global.setTimeout = mockSetTimeout;

// Mock clearTimeout
const mockClearTimeout = jest.fn();
global.clearTimeout = mockClearTimeout;

describe('Animation Engine', () => {
  let mockFromElement: HTMLElement;
  let mockToElement: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockRequestAnimationFrame.mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    
    mockSetTimeout.mockImplementation((callback: any, delay: any) => {
      callback();
      return 1;
    });
    
    // Reset position detection mock to default
    const { getElementPositions } = require('@/utils/positionDetection');
    getElementPositions.mockImplementation(() => ({
      from: { x: 0, y: 0, width: 100, height: 140 },
      to: { x: 200, y: 100, width: 100, height: 140 }
    }));
    
    // Create mock elements without using document.createElement
    mockFromElement = {
      getBoundingClientRect: jest.fn(() => ({
        x: 0,
        y: 0,
        width: 100,
        height: 140,
        top: 0,
        left: 0,
        right: 100,
        bottom: 140
      })),
      style: {},
      cloneNode: jest.fn(() => ({
        style: {},
        getBoundingClientRect: jest.fn(() => ({
          x: 0,
          y: 0,
          width: 100,
          height: 140,
          top: 0,
          left: 0,
          right: 100,
          bottom: 140
        }))
      })),
      querySelector: jest.fn(() => null),
      getAttribute: jest.fn(() => null)
    } as any;
    
    mockToElement = {
      getBoundingClientRect: jest.fn(() => ({
        x: 200,
        y: 100,
        width: 100,
        height: 140,
        top: 100,
        left: 200,
        right: 300,
        bottom: 240
      })),
      style: {},
      cloneNode: jest.fn(() => ({
        style: {},
        getBoundingClientRect: jest.fn(() => ({
          x: 200,
          y: 100,
          width: 100,
          height: 140,
          top: 100,
          left: 200,
          right: 300,
          bottom: 240
        }))
      })),
      querySelector: jest.fn(() => null),
      getAttribute: jest.fn(() => null)
    } as any;
    
    // Mock document methods
    const mockCreateElement = jest.fn(() => {
      const element = {
        style: {},
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        getBoundingClientRect: jest.fn(() => ({
          x: 0,
          y: 0,
          width: 100,
          height: 140,
          top: 0,
          left: 0,
          right: 100,
          bottom: 140
        }))
      } as any;
      return element;
    });
    
    document.createElement = mockCreateElement as any;
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  describe('animateElement', () => {
    it('should animate move type', async () => {
      const config = {
        type: 'move' as const,
        duration: 300,
        onComplete: jest.fn()
      };

      await animateElement(mockFromElement, mockToElement, config);
      
      expect(config.onComplete).toHaveBeenCalled();
    });

    it('should animate flip type', async () => {
      const config = {
        type: 'flip' as const,
        duration: 300,
        onComplete: jest.fn()
      };

      await animateElement(mockFromElement, mockToElement, config);
      
      expect(config.onComplete).toHaveBeenCalled();
    });

    it('should animate shuffle type', async () => {
      const config = {
        type: 'shuffle' as const,
        duration: 300,
        onComplete: jest.fn()
      };

      await animateElement(mockFromElement, mockToElement, config);
      
      expect(config.onComplete).toHaveBeenCalled();
    });

    it('should handle zero distance animation', async () => {
      const config = {
        type: 'move' as const,
        duration: 300,
        onComplete: jest.fn()
      };

      // Mock position detection to return same position
      const { getElementPositions } = require('@/utils/positionDetection');
      getElementPositions.mockReturnValue({
        from: { x: 0, y: 0, width: 100, height: 140 },
        to: { x: 0, y: 0, width: 100, height: 140 }
      });

      await animateElement(mockFromElement, mockToElement, config);
      
      expect(config.onComplete).toHaveBeenCalled();
    });

    it('should handle animation errors gracefully', async () => {
      const callback = jest.fn();
      
      // Mock getElementPositions to throw error
      const { getElementPositions } = require('@/utils/positionDetection');
      getElementPositions.mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      // The animation engine should handle the error gracefully
      await animateElement(mockFromElement, mockToElement, { type: 'move', duration: 300, onComplete: callback });
      
      expect(callback).toHaveBeenCalled();
      
      // Restore original mock
      getElementPositions.mockImplementation(() => ({
        from: { x: 0, y: 0, width: 100, height: 140 },
        to: { x: 200, y: 100, width: 100, height: 140 }
      }));
    });
  });

  describe('animateElementSequence', () => {
    it('should animate sequence of elements', async () => {
      const animations = [
        {
          fromElement: mockFromElement,
          toElement: mockToElement,
          options: {
            type: 'move' as const,
            duration: 300,
            onComplete: jest.fn()
          }
        },
        {
          fromElement: mockFromElement,
          toElement: mockToElement,
          options: {
            type: 'move' as const,
            duration: 300,
            onComplete: jest.fn()
          }
        }
      ];
      
      const sequenceOptions = {
        onComplete: jest.fn()
      };

      await animateElementSequence(animations, sequenceOptions);
      
      expect(sequenceOptions.onComplete).toHaveBeenCalled();
      expect(animations[0].options.onComplete).toHaveBeenCalled();
      expect(animations[1].options.onComplete).toHaveBeenCalled();
    });

    it('should handle empty animations array', async () => {
      const sequenceOptions = {
        onComplete: jest.fn()
      };

      await animateElementSequence([], sequenceOptions);
      
      expect(sequenceOptions.onComplete).toHaveBeenCalled();
    });

    it('should handle single animation', async () => {
      const animations = [
        {
          fromElement: mockFromElement,
          toElement: mockToElement,
          options: {
            type: 'move' as const,
            duration: 300,
            onComplete: jest.fn()
          }
        }
      ];
      
      const sequenceOptions = {
        onComplete: jest.fn()
      };

      await animateElementSequence(animations, sequenceOptions);
      
      expect(sequenceOptions.onComplete).toHaveBeenCalled();
      expect(animations[0].options.onComplete).toHaveBeenCalled();
    });

    it('should handle animation errors in sequence', async () => {
      const animations = [
        {
          fromElement: mockFromElement,
          toElement: mockToElement,
          options: {
            type: 'move' as const,
            duration: 300,
            onComplete: jest.fn()
          }
        }
      ];
      
      const sequenceOptions = {
        onComplete: jest.fn(),
        onError: jest.fn()
      };

      // Mock requestAnimationFrame to throw error
      mockRequestAnimationFrame.mockImplementation(() => {
        throw new Error('Animation failed');
      });

      await animateElementSequence(animations, sequenceOptions);
      
      // Should still call onComplete even on error
      expect(sequenceOptions.onComplete).toHaveBeenCalled();
      expect(animations[0].options.onComplete).toHaveBeenCalled();
    });

    it('should handle stagger delay', async () => {
      const animations = [
        {
          fromElement: mockFromElement,
          toElement: mockToElement,
          options: {
            type: 'move' as const,
            duration: 300,
            onComplete: jest.fn()
          }
        },
        {
          fromElement: mockFromElement,
          toElement: mockToElement,
          options: {
            type: 'move' as const,
            duration: 300,
            onComplete: jest.fn()
          }
        }
      ];
      
      const sequenceOptions = {
        staggerDelay: 100,
        onComplete: jest.fn()
      };

      await animateElementSequence(animations, sequenceOptions);
      
      expect(sequenceOptions.onComplete).toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle invalid animation types', async () => {
      await expect(
        animateElement(mockFromElement, mockToElement, { type: 'invalid' as any, duration: 300 })
      ).rejects.toThrow('Unknown animation type: invalid');
    });

    it('should handle animation errors gracefully', async () => {
      const callback = jest.fn();
      
      // Mock getElementPositions to throw error
      const { getElementPositions } = require('@/utils/positionDetection');
      getElementPositions.mockImplementation(() => {
        throw new Error('DOM error');
      });
      
      // The animation engine should handle the error gracefully
      await animateElement(mockFromElement, mockToElement, { type: 'move', duration: 300, onComplete: callback });
      
      expect(callback).toHaveBeenCalled();
      
      // Restore original mock
      getElementPositions.mockImplementation(() => ({
        from: { x: 0, y: 0, width: 100, height: 140 },
        to: { x: 200, y: 100, width: 100, height: 140 }
      }));
    });
  });
});