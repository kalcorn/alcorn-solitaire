import { 
  animateElement, 
  animateElementSequence,
  AnimationConfig,
  AnimationPath,
  SequenceOptions
} from '../utils/animationEngine';

// Mock DOM APIs
const createMockElement = (rect?: any) => ({
  getBoundingClientRect: jest.fn(() => ({
    x: 100,
    y: 100,
    width: 50,
    height: 70,
    top: 100,
    left: 100,
    right: 150,
    bottom: 170,
    ...rect
  })),
  style: {},
  remove: jest.fn(),
  appendChild: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  offsetParent: document.body,
  cloneNode: jest.fn(),
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn()
  },
  querySelector: jest.fn(),
  getAttribute: jest.fn(),
  setAttribute: jest.fn(),
  parentNode: null as any,
  innerHTML: ''
});

const mockElement = createMockElement();
mockElement.cloneNode = jest.fn(() => createMockElement());

const mockDocument = {
  createElement: jest.fn(() => {
    const element = createMockElement();
    element.parentNode = { removeChild: jest.fn() };
    return element;
  }),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  querySelector: jest.fn(() => mockElement),
  getElementById: jest.fn(() => mockElement)
};

// Mock global document and window using Jest environment
beforeAll(() => {
  // Mock document methods
  document.createElement = mockDocument.createElement;
  document.body.appendChild = mockDocument.body.appendChild;
  document.body.removeChild = mockDocument.body.removeChild;
  document.querySelector = mockDocument.querySelector;
  document.getElementById = mockDocument.getElementById;

  // Mock window methods  
  global.window.getComputedStyle = jest.fn(() => ({
    getPropertyValue: jest.fn(() => '100px'),
    transform: 'none',
    opacity: '1'
  }));
  global.window.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
  global.window.cancelAnimationFrame = jest.fn();
});

describe('Animation Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Public API', () => {
    it('should export animateElement function', () => {
      expect(typeof animateElement).toBe('function');
    });

    it('should export animateElementSequence function', () => {
      expect(typeof animateElementSequence).toBe('function');
    });
  });

  describe('animateElement', () => {
    it('should animate element from source to target', async () => {
      const source = mockElement as any;
      const target = {
        ...mockElement,
        getBoundingClientRect: () => ({
          x: 200, y: 300, width: 50, height: 70,
          top: 300, left: 200, right: 250, bottom: 370
        })
      } as any;

      const promise = animateElement(source, target, { type: 'move', duration: 300 });
      
      expect(promise).toBeInstanceOf(Promise);
      
      // Fast-forward animation
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(mockDocument.createElement).toHaveBeenCalled();
    });

    it('should handle animation with custom duration', async () => {
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      const options = { type: 'move' as const, duration: 500 };

      const promise = animateElement(source, target, options);
      
      jest.advanceTimersByTime(500);
      
      await promise;
      
      expect(promise).toBeInstanceOf(Promise);
    });

    it('should handle animation with callback', async () => {
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      const callback = jest.fn();
      const options = { type: 'move' as const, duration: 300, onComplete: callback };

      const promise = animateElement(source, target, options);
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle zero-distance animations', async () => {
      const source = mockElement as any;
      const target = mockElement as any; // Same position
      const callback = jest.fn();
      
      const promise = animateElement(source, target, { 
        type: 'move', 
        duration: 300, 
        onComplete: callback 
      });
      
      await promise;
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle flip animations', async () => {
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      const callback = jest.fn();
      
      const promise = animateElement(source, target, { 
        type: 'flip', 
        duration: 300, 
        onComplete: callback 
      });
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle shuffle animations', async () => {
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      const callback = jest.fn();
      
      const promise = animateElement(source, target, { 
        type: 'shuffle', 
        duration: 300, 
        onComplete: callback 
      });
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle animations with initial rotation', async () => {
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      
      const promise = animateElement(source, target, { 
        type: 'flip', 
        duration: 300,
        initialRotation: 'rotateY(90deg)'
      });
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(mockDocument.createElement).toHaveBeenCalled();
    });
  });

  describe('animateElementSequence', () => {
    it('should animate multiple elements in sequence', async () => {
      const animations = [
        {
          fromElement: createMockElement() as any,
          toElement: createMockElement({ x: 200, y: 200 }) as any,
          options: { type: 'move' as const, duration: 200 }
        },
        {
          fromElement: createMockElement() as any,
          toElement: createMockElement({ x: 300, y: 300 }) as any,
          options: { type: 'flip' as const, duration: 300 }
        }
      ];
      
      const sequenceOptions: SequenceOptions = {
        staggerDelay: 50,
        onComplete: jest.fn()
      };
      
      const promise = animateElementSequence(animations, sequenceOptions);
      
      expect(promise).toBeInstanceOf(Promise);
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(mockDocument.createElement).toHaveBeenCalled();
      expect(sequenceOptions.onComplete).toHaveBeenCalled();
    });

    it('should handle empty animation array', async () => {
      const sequenceOptions: SequenceOptions = {};
      
      await expect(
        animateElementSequence([], sequenceOptions)
      ).resolves.toBeUndefined();
    });

    it('should handle sequence with custom stagger delay', async () => {
      const animations = [
        {
          fromElement: createMockElement() as any,
          toElement: createMockElement() as any,
          options: { type: 'move' as const, duration: 200 }
        }
      ];
      
      const sequenceOptions: SequenceOptions = {
        staggerDelay: 100,
        onComplete: jest.fn()
      };
      
      const promise = animateElementSequence(animations, sequenceOptions);
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(sequenceOptions.onComplete).toHaveBeenCalled();
    });

    it('should handle sequence errors gracefully', async () => {
      const animations = [
        {
          fromElement: null as any,
          toElement: createMockElement() as any,
          options: { type: 'move' as const, duration: 200 }
        }
      ];
      
      const sequenceOptions: SequenceOptions = {
        onComplete: jest.fn(),
        onError: jest.fn()
      };
      
      const promise = animateElementSequence(animations, sequenceOptions);
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      // Should complete even with errors
      expect(sequenceOptions.onComplete).toHaveBeenCalled();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing requestAnimationFrame', () => {
      const originalRAF = window.requestAnimationFrame;
      delete (window as any).requestAnimationFrame;
      
      const source = mockElement as any;
      const target = mockElement as any;
      
      const promise = animateElement(source, target, { type: 'move', duration: 300 });
      
      expect(promise).toBeInstanceOf(Promise);
      
      // Restore
      window.requestAnimationFrame = originalRAF;
    });

    it('should handle elements with zero dimensions', async () => {
      const zeroElement = {
        getBoundingClientRect: () => ({
          x: 0, y: 0, width: 0, height: 0,
          top: 0, left: 0, right: 0, bottom: 0
        }),
        style: {},
        offsetParent: document.body
      } as any;
      
      const promise = animateElement(zeroElement, zeroElement, { type: 'move', duration: 300 });
      
      jest.advanceTimersByTime(300);
      
      await expect(promise).resolves.toBeUndefined();
    });

    it('should handle very large coordinates', async () => {
      const largeElement = {
        getBoundingClientRect: () => ({
          x: 10000, y: 10000, width: 50, height: 70,
          top: 10000, left: 10000, right: 10050, bottom: 10070
        }),
        style: {},
        offsetParent: document.body
      } as any;
      
      const promise = animateElement(largeElement, mockElement as any, { type: 'move', duration: 300 });
      
      jest.advanceTimersByTime(300);
      
      await expect(promise).resolves.toBeUndefined();
    });

    it('should handle invalid animation types', async () => {
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      
      await expect(
        animateElement(source, target, { type: 'invalid' as any, duration: 300 })
      ).rejects.toThrow('Unknown animation type: invalid');
    });

    it('should create proper flip card elements', async () => {
      const cardElement = createMockElement();
      cardElement.querySelector = jest.fn(() => cardElement);
      cardElement.getAttribute = jest.fn(() => 'true');
      
      const source = cardElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      
      const promise = animateElement(source, target, { type: 'flip', duration: 300 });
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(mockDocument.createElement).toHaveBeenCalled();
    });

    it('should handle movement direction for flip rotation', async () => {
      const source = createMockElement({ x: 100, y: 100 }) as any;
      
      // Test horizontal movement (should use rotateY)
      const horizontalTarget = createMockElement({ x: 300, y: 100 }) as any;
      const horizontalPromise = animateElement(source, horizontalTarget, { type: 'flip', duration: 300 });
      
      // Test vertical movement (should use rotateX)
      const verticalTarget = createMockElement({ x: 100, y: 300 }) as any;
      const verticalPromise = animateElement(source, verticalTarget, { type: 'flip', duration: 300 });
      
      jest.advanceTimersByTime(1000);
      
      await Promise.all([horizontalPromise, verticalPromise]);
      
      expect(mockDocument.createElement).toHaveBeenCalled();
    });

    it('should handle animation errors gracefully', async () => {
      // Simulate DOM error by making createElement throw
      mockDocument.createElement.mockImplementationOnce(() => {
        throw new Error('DOM error');
      });
      
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      const callback = jest.fn();
      
      await expect(
        animateElement(source, target, { type: 'move', duration: 300, onComplete: callback })
      ).rejects.toThrow('DOM error');
      
      // Callback should still be called on error
      expect(callback).toHaveBeenCalled();
    });

    it('should clean up animation elements properly', async () => {
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      
      const createdElement = createMockElement();
      createdElement.parentNode = {
        parentNode: {
          removeChild: jest.fn()
        }
      };
      
      mockDocument.createElement.mockReturnValueOnce(createdElement);
      
      const promise = animateElement(source, target, { type: 'move', duration: 300 });
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(createdElement.parentNode.parentNode.removeChild).toHaveBeenCalled();
    });

    it('should handle elements without proper card structure', async () => {
      const elementWithoutCard = createMockElement();
      elementWithoutCard.querySelector = jest.fn(() => null);
      elementWithoutCard.getAttribute = jest.fn(() => null);
      
      const source = elementWithoutCard as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      
      const promise = animateElement(source, target, { type: 'flip', duration: 300 });
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(mockDocument.createElement).toHaveBeenCalled();
    });

    it('should handle position detection fallback', async () => {
      const source = mockElement as any;
      const target = createMockElement({ x: 200, y: 200 }) as any;
      
      // Test with type other than 'move' to trigger position detection
      const promise = animateElement(source, target, { type: 'flip', duration: 300 });
      
      jest.advanceTimersByTime(1000);
      
      await promise;
      
      expect(source.getBoundingClientRect).toHaveBeenCalled();
      expect(target.getBoundingClientRect).toHaveBeenCalled();
    });
  });
});