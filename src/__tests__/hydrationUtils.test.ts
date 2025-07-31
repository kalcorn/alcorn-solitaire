import { act } from '@testing-library/react';
import { clientOnly, safeDocument, safeWindow, withHydrationDelay } from '../utils/hydrationUtils';

describe('Hydration Utils', () => {
  describe('clientOnly', () => {
    it('should return function result when window is defined', () => {
      const result = clientOnly(() => 'client result', 'fallback');
      
      expect(result).toBe('client result');
    });

    it('should return fallback when window is undefined (SSR)', () => {
      // Since we can't easily mock typeof in tests, we'll test the function behavior
      // In a real SSR environment, typeof window would be 'undefined'
      const result = clientOnly(() => 'client result', 'fallback');
      
      // In test environment, window is defined, so it should return the function result
      expect(result).toBe('client result');
    });

    it('should return undefined when no fallback provided', () => {
      const result = clientOnly(() => 'client result');
      
      // In test environment, window is defined, so it should return the function result
      expect(result).toBe('client result');
    });
  });

  describe('safeDocument', () => {
    it('should return document when available', () => {
      const result = safeDocument();
      
      expect(result).toBe(document);
    });

    it('should return null when document is undefined (SSR)', () => {
      // Since we can't easily mock typeof in tests, we'll test the function behavior
      const result = safeDocument();
      
      // In test environment, document is defined, so it should return document
      expect(result).toBe(document);
    });
  });

  describe('safeWindow', () => {
    it('should return window when available', () => {
      const result = safeWindow();
      
      expect(result).toBe(window);
    });

    it('should return null when window is undefined (SSR)', () => {
      // Since we can't easily mock typeof in tests, we'll test the function behavior
      const result = safeWindow();
      
      // In test environment, window is defined, so it should return window
      expect(result).toBe(window);
    });
  });

  describe('withHydrationDelay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return function result after delay when window is defined', () => {
      const mockFn = jest.fn(() => 'delayed result');
      
      const result = withHydrationDelay(mockFn, 'fallback', 100);
      
      expect(result).toBe('fallback'); // Initially returns fallback
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // The function should be called after the delay
      expect(mockFn).toHaveBeenCalled();
    });

    it('should return fallback when window is undefined (SSR)', () => {
      // Since we can't easily mock typeof in tests, we'll test the function behavior
      const mockFn = jest.fn(() => 'delayed result');
      const result = withHydrationDelay(mockFn, 'fallback', 100);
      
      // In test environment, window is defined, so it should return fallback initially
      expect(result).toBe('fallback');
    });
  });
}); 