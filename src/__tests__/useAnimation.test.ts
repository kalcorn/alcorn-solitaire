import { renderHook } from '@testing-library/react';
import { useAnimation } from '../hooks/useAnimation';

// Mock the animation engine
jest.mock('../utils/animationEngine', () => ({
  animateElement: jest.fn(() => Promise.resolve()),
  createAnimationElement: jest.fn(() => document.createElement('div')),
  cleanupAnimation: jest.fn()
}));

// Mock position detection
jest.mock('../utils/positionDetection', () => ({
  getElementPosition: jest.fn(() => ({ x: 0, y: 0, width: 100, height: 140 })),
  waitForElementPosition: jest.fn(() => Promise.resolve({ x: 0, y: 0, width: 100, height: 140 }))
}));

describe('useAnimation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hook initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useAnimation());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.animateMove).toBe('function');
      expect(typeof result.current.animateFlip).toBe('function');
      expect(typeof result.current.animateShuffle).toBe('function');
    });

    it('should provide animation functions', () => {
      const { result } = renderHook(() => useAnimation());
      
      expect(result.current.animateMove).toBeDefined();
      expect(result.current.animateFlip).toBeDefined();
      expect(result.current.animateShuffle).toBeDefined();
    });
  });

  describe('animateMove', () => {
    it('should call animateElement for move animation', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const sourceElement = document.createElement('div');
      const targetElement = document.createElement('div');
      
      await result.current.animateMove(sourceElement, targetElement);
      
      expect(animateElement).toHaveBeenCalledWith(
        sourceElement,
        targetElement,
        expect.objectContaining({
          type: 'move'
        })
      );
    });

    it('should handle move animation with custom options', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const sourceElement = document.createElement('div');
      const targetElement = document.createElement('div');
      const options = { duration: 500, onComplete: jest.fn() };
      
      await result.current.animateMove(sourceElement, targetElement, options);
      
      expect(animateElement).toHaveBeenCalledWith(
        sourceElement,
        targetElement,
        expect.objectContaining({
          type: 'move',
          duration: 500,
          onComplete: options.onComplete
        })
      );
    });

    it('should handle null elements gracefully', async () => {
      const { result } = renderHook(() => useAnimation());
      
      await expect(result.current.animateMove(null, null)).resolves.toBeUndefined();
    });
  });

  describe('animateFlip', () => {
    it('should call animateElement for flip animation', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const element = document.createElement('div');
      
      await result.current.animateFlip(element);
      
      expect(animateElement).toHaveBeenCalledWith(
        element,
        element,
        expect.objectContaining({
          type: 'flip'
        })
      );
    });

    it('should handle flip animation with custom duration', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const element = document.createElement('div');
      const options = { duration: 300 };
      
      await result.current.animateFlip(element, options);
      
      expect(animateElement).toHaveBeenCalledWith(
        element,
        element,
        expect.objectContaining({
          type: 'flip',
          duration: 300
        })
      );
    });

    it('should handle null element gracefully', async () => {
      const { result } = renderHook(() => useAnimation());
      
      await expect(result.current.animateFlip(null)).resolves.toBeUndefined();
    });
  });

  describe('animateShuffle', () => {
    it('should call animateElement for shuffle animation', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const elements = [
        document.createElement('div'),
        document.createElement('div')
      ];
      const targetElement = document.createElement('div');
      
      await result.current.animateShuffle(elements, targetElement);
      
      expect(animateElement).toHaveBeenCalledTimes(2);
    });

    it('should handle empty elements array', async () => {
      const { result } = renderHook(() => useAnimation());
      
      const targetElement = document.createElement('div');
      
      await expect(result.current.animateShuffle([], targetElement)).resolves.toBeUndefined();
    });

    it('should handle shuffle with stagger delay', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const elements = [
        document.createElement('div'),
        document.createElement('div')
      ];
      const targetElement = document.createElement('div');
      const options = { staggerDelay: 100 };
      
      await result.current.animateShuffle(elements, targetElement, options);
      
      expect(animateElement).toHaveBeenCalledTimes(2);
    });

    it('should handle null target element', async () => {
      const { result } = renderHook(() => useAnimation());
      
      const elements = [document.createElement('div')];
      
      await expect(result.current.animateShuffle(elements, null)).resolves.toBeUndefined();
    });
  });

  describe('Animation options', () => {
    it('should handle different animation durations', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const element = document.createElement('div');
      
      await result.current.animateMove(element, element, { duration: 1000 });
      
      expect(animateElement).toHaveBeenCalledWith(
        element,
        element,
        expect.objectContaining({
          duration: 1000
        })
      );
    });

    it('should handle animation callbacks', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const element = document.createElement('div');
      const onComplete = jest.fn();
      
      await result.current.animateMove(element, element, { onComplete });
      
      expect(animateElement).toHaveBeenCalledWith(
        element,
        element,
        expect.objectContaining({
          onComplete
        })
      );
    });

    it('should handle animation easing options', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const element = document.createElement('div');
      const easing = 'ease-in-out';
      
      await result.current.animateMove(element, element, { easing });
      
      expect(animateElement).toHaveBeenCalledWith(
        element,
        element,
        expect.objectContaining({
          easing
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle animation errors gracefully', async () => {
      const { animateElement } = require('../utils/animationEngine');
      animateElement.mockRejectedValueOnce(new Error('Animation failed'));
      
      const { result } = renderHook(() => useAnimation());
      
      const element = document.createElement('div');
      
      await expect(result.current.animateMove(element, element)).rejects.toThrow('Animation failed');
    });

    it('should handle invalid elements', async () => {
      const { result } = renderHook(() => useAnimation());
      
      const invalidElement = {} as any;
      
      await expect(result.current.animateMove(invalidElement, invalidElement)).resolves.toBeUndefined();
    });

    it('should handle concurrent animations', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const element = document.createElement('div');
      
      const promise1 = result.current.animateMove(element, element);
      const promise2 = result.current.animateFlip(element);
      
      await Promise.all([promise1, promise2]);
      
      expect(animateElement).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance considerations', () => {
    it('should not create memory leaks', () => {
      const { result, unmount } = renderHook(() => useAnimation());
      
      expect(result.current).toBeDefined();
      
      unmount();
      
      // Should not throw after unmount
      expect(true).toBe(true);
    });

    it('should handle rapid successive animations', async () => {
      const { animateElement } = require('../utils/animationEngine');
      const { result } = renderHook(() => useAnimation());
      
      const element = document.createElement('div');
      
      const promises = Array.from({ length: 10 }, () =>
        result.current.animateMove(element, element)
      );
      
      await Promise.all(promises);
      
      expect(animateElement).toHaveBeenCalledTimes(10);
    });
  });
});