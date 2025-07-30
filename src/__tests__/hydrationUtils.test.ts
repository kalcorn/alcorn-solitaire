jest.mock('react', () => ({
  useState: jest.fn(),
  useEffect: jest.fn()
}));

import * as hydrationUtils from '../utils/hydrationUtils';
import { createInitialGameState } from '../utils/gameUtils';

const {
  useIsClient,
  clientOnly,
  safeDocument,
  safeWindow,
  createSSRSafeGameState,
  withHydrationDelay
} = hydrationUtils;

describe('Hydration Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useIsClient', () => {
    it('should return false initially and true after useEffect', () => {
      const React = require('react');
      const setStateMock = jest.fn();
      React.useState.mockReturnValue([false, setStateMock]);
      React.useEffect.mockImplementation((callback) => callback());

      const result = useIsClient();

      expect(result).toBe(false);
      expect(React.useState).toHaveBeenCalledWith(false);
      expect(React.useEffect).toHaveBeenCalled();
      expect(setStateMock).toHaveBeenCalledWith(true);
    });
  });

  describe('clientOnly', () => {
    it('should return fallback when window is undefined (SSR)', () => {
      // Mock typeof window check by overriding the window property
      const originalDescriptor = Object.getOwnPropertyDescriptor(global, 'window');
      Object.defineProperty(global, 'window', {
        value: undefined,
        configurable: true
      });

      const result = clientOnly(() => 'client result', 'fallback');
      
      expect(result).toBe('fallback');

      // Restore window
      if (originalDescriptor) {
        Object.defineProperty(global, 'window', originalDescriptor);
      } else {
        delete (global as any).window;
      }
    });

    it('should return function result when window is defined', () => {
      const result = clientOnly(() => 'client result', 'fallback');
      
      expect(result).toBe('client result');
    });

    it('should return undefined when no fallback provided', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(global, 'window');
      Object.defineProperty(global, 'window', {
        value: undefined,
        configurable: true
      });

      const result = clientOnly(() => 'client result');
      
      expect(result).toBeUndefined();

      // Restore window
      if (originalDescriptor) {
        Object.defineProperty(global, 'window', originalDescriptor);
      } else {
        delete (global as any).window;
      }
    });
  });

  describe('safeDocument', () => {
    it('should return document when available', () => {
      const result = safeDocument();
      
      expect(result).toBe(document);
    });

    it('should return null when document is undefined (SSR)', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(global, 'document');
      Object.defineProperty(global, 'document', {
        value: undefined,
        configurable: true
      });

      const result = safeDocument();
      
      expect(result).toBeNull();

      // Restore document
      if (originalDescriptor) {
        Object.defineProperty(global, 'document', originalDescriptor);
      } else {
        delete (global as any).document;
      }
    });
  });

  describe('safeWindow', () => {
    it('should return window when available', () => {
      const result = safeWindow();
      
      expect(result).toBe(window);
    });

    it('should return null when window is undefined (SSR)', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(global, 'window');
      Object.defineProperty(global, 'window', {
        value: undefined,
        configurable: true
      });

      const result = safeWindow();
      
      expect(result).toBeNull();

      // Restore window
      if (originalDescriptor) {
        Object.defineProperty(global, 'window', originalDescriptor);
      } else {
        delete (global as any).window;
      }
    });
  });

  describe('createSSRSafeGameState', () => {
    it('should create initial game state', () => {
      const result = createSSRSafeGameState();
      const expected = createInitialGameState();
      
      expect(result).toEqual(expected);
    });
  });

  describe('withHydrationDelay', () => {
    it('should return fallback when window is undefined (SSR)', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(global, 'window');
      Object.defineProperty(global, 'window', {
        value: undefined,
        configurable: true
      });

      const result = withHydrationDelay(() => 'operation result', 'fallback');
      
      expect(result).toBe('fallback');

      // Restore window
      if (originalDescriptor) {
        Object.defineProperty(global, 'window', originalDescriptor);
      } else {
        delete (global as any).window;
      }
    });

    it('should return operation result when no delay', () => {
      const result = withHydrationDelay(() => 'operation result', 'fallback', 0);
      
      expect(result).toBe('operation result');
    });

    it('should return fallback and schedule operation when delay > 0', () => {
      jest.useFakeTimers();
      const operationMock = jest.fn(() => 'operation result');
      
      const result = withHydrationDelay(operationMock, 'fallback', 100);
      
      expect(result).toBe('fallback');
      expect(operationMock).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(operationMock).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });
});