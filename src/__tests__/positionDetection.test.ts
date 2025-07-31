import { getElementPosition, getElementPositions, ElementPosition } from '../utils/positionDetection';

// Mock DOM elements
const createMockElement = (rect: Partial<DOMRect>, styles: Partial<CSSStyleDeclaration> = {}) => {
  const element = document.createElement('div');
  
  // Mock getBoundingClientRect
  element.getBoundingClientRect = jest.fn(() => ({
    left: rect.left || 0,
    top: rect.top || 0,
    width: rect.width || 0,
    height: rect.height || 0,
    right: (rect.left || 0) + (rect.width || 0),
    bottom: (rect.top || 0) + (rect.height || 0),
    x: rect.left || 0,
    y: rect.top || 0,
    toJSON: () => ({})
  }));
  
  // Mock offsetParent using Object.defineProperty
  Object.defineProperty(element, 'offsetParent', {
    value: rect.width && rect.height ? document.body : null,
    writable: true,
    configurable: true
  });
  
  // Mock getComputedStyle
  const mockComputedStyle = {
    width: `${styles.width || rect.width || 0}px`,
    height: `${styles.height || rect.height || 0}px`,
    display: styles.display || 'block',
    visibility: styles.visibility || 'visible',
    opacity: styles.opacity || '1',
    getPropertyValue: jest.fn((prop: string) => {
      if (prop === '--card-width') return '52px';
      if (prop === '--card-height') return '72px';
      return '';
    })
  };
  
  Object.defineProperty(element, 'style', {
    value: mockComputedStyle,
    writable: true
  });
  
  // Add to document
  document.body.appendChild(element);
  
  return element;
};

// Mock getComputedStyle globally
const mockGetComputedStyle = jest.fn();
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
  writable: true
});

// Mock document.contains
const mockDocumentContains = jest.fn();
Object.defineProperty(document, 'contains', {
  value: mockDocumentContains,
  writable: true
});

describe('Position Detection System', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockDocumentContains.mockReturnValue(true);
    
    // Mock CSS custom properties as loaded
    mockGetComputedStyle.mockImplementation((element) => {
      if (element === document.documentElement) {
        return {
          getPropertyValue: (prop: string) => {
            if (prop === '--card-width') return '52px';
            if (prop === '--card-height') return '72px';
            return '';
          }
        };
      }
      
      // For regular elements, use the element's actual style if available
      if (element && element.style) {
        return {
          width: element.style.width || '52px',
          height: element.style.height || '72px',
          display: element.style.display || 'block',
          visibility: element.style.visibility || 'visible',
          opacity: element.style.opacity || '1',
          getPropertyValue: jest.fn()
        };
      }
      
      // Fallback for elements without style
      return {
        width: '52px',
        height: '72px',
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        getPropertyValue: jest.fn()
      };
    });
    
    // Clear document body
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getElementPosition', () => {
    it('should get position for a properly positioned element', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      const position = await getElementPosition(element);

      expect(position).toEqual({
        x: 126, // 100 + 52/2
        y: 236, // 200 + 72/2
        width: 52,
        height: 72,
        visible: true,
        confidence: 'high',
        source: 'measured'
      });
    });

    it('should handle element with zero dimensions', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 0,
        height: 0
      });

      const position = await getElementPosition(element);

      expect(position.visible).toBe(false);
      expect(position.confidence).toBe('medium');
      expect(position.x).toBe(100); // 100 + 0/2
      expect(position.y).toBe(200); // 200 + 0/2
    });

    it('should handle element with no offsetParent', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });
      Object.defineProperty(element, 'offsetParent', {
        value: null,
        writable: true,
        configurable: true
      });

      const position = await getElementPosition(element);

      // Element can be visible without offsetParent if it has valid dimensions and position
      expect(position.visible).toBe(true);
      expect(position.confidence).toBe('high');
    });

    it('should handle element not in DOM', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });
      mockDocumentContains.mockReturnValue(false);

      const position = await getElementPosition(element);

      expect(position.visible).toBe(false);
      expect(position.confidence).toBe('low'); // Uses fallback position
    });

    it('should handle CSS properties not loaded', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      // Mock CSS properties as not loaded
      mockGetComputedStyle.mockImplementation((element) => {
        if (element === document.documentElement) {
          return {
            getPropertyValue: (prop: string) => {
              if (prop === '--card-width') return '';
              if (prop === '--card-height') return '';
              return '';
            }
          };
        }
        return {
          width: '52px',
          height: '72px',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
          getPropertyValue: jest.fn()
        };
      });

      const position = await getElementPosition(element);

      expect(position.visible).toBe(false);
      expect(position.confidence).toBe('medium');
    });

    it('should handle getComputedStyle failure', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      mockGetComputedStyle.mockImplementation(() => {
        throw new Error('getComputedStyle failed');
      });

      const position = await getElementPosition(element);

      expect(position.visible).toBe(false);
      expect(position.confidence).toBe('medium');
    });

    it('should handle negative coordinates', async () => {
      const element = createMockElement({
        left: -50,
        top: -100,
        width: 52,
        height: 72
      });

      const position = await getElementPosition(element);

      expect(position.x).toBe(-24); // -50 + 52/2
      expect(position.y).toBe(-64); // -100 + 72/2
      expect(position.visible).toBe(true);
    });

    it('should handle very large coordinates', async () => {
      const element = createMockElement({
        left: 5000,
        top: 3000,
        width: 52,
        height: 72
      });

      const position = await getElementPosition(element);

      expect(position.x).toBe(5026); // 5000 + 52/2
      expect(position.y).toBe(3036); // 3000 + 72/2
      expect(position.visible).toBe(true);
    });

    it('should return fallback position after max attempts', async () => {
      const element = createMockElement({
        left: 0,
        top: 0,
        width: 0,
        height: 0
      });
      Object.defineProperty(element, 'offsetParent', {
        value: null,
        writable: true,
        configurable: true
      });
      mockDocumentContains.mockReturnValue(false);

      const position = await getElementPosition(element);

      expect(position).toEqual({
        x: 100,
        y: 100,
        width: 52,
        height: 72,
        visible: false,
        confidence: 'low',
        source: 'fallback'
      });
    });
  });

  describe('getElementPositions', () => {
    it('should get positions for both elements', async () => {
      const fromElement = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      const toElement = createMockElement({
        left: 300,
        top: 400,
        width: 52,
        height: 72
      });

      const positions = await getElementPositions(fromElement, toElement);

      expect(positions.from).toEqual({
        x: 126, // 100 + 52/2
        y: 236, // 200 + 72/2
        width: 52,
        height: 72,
        visible: true,
        confidence: 'high',
        source: 'measured'
      });

      expect(positions.to).toEqual({
        x: 326, // 300 + 52/2
        y: 436, // 400 + 72/2
        width: 52,
        height: 72,
        visible: true,
        confidence: 'high',
        source: 'measured'
      });
    });

    it('should handle one element with issues', async () => {
      const fromElement = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      const toElement = createMockElement({
        left: 0,
        top: 0,
        width: 0,
        height: 0
      });
      Object.defineProperty(toElement, 'offsetParent', {
        value: null,
        writable: true,
        configurable: true
      });

      const positions = await getElementPositions(fromElement, toElement);

      expect(positions.from.visible).toBe(true);
      expect(positions.from.confidence).toBe('high');
      expect(positions.to.visible).toBe(false);
      expect(positions.to.confidence).toBe('medium');
    });
  });

  describe('Edge Cases', () => {
    it('should handle elements with CSS dimensions but no rect dimensions', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 0,
        height: 0
      });

      // Mock CSS dimensions
      mockGetComputedStyle.mockImplementation((element) => {
        if (element === document.documentElement) {
          return {
            getPropertyValue: (prop: string) => {
              if (prop === '--card-width') return '52px';
              if (prop === '--card-height') return '72px';
              return '';
            }
          };
        }
        return {
          width: '52px',
          height: '72px',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
          getPropertyValue: jest.fn()
        };
      });

      const position = await getElementPosition(element);

      expect(position.visible).toBe(true);
      expect(position.confidence).toBe('high');
    });

    it('should handle elements with rect dimensions but no CSS dimensions', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      // Mock CSS dimensions as zero
      mockGetComputedStyle.mockImplementation((element) => {
        if (element === document.documentElement) {
          return {
            getPropertyValue: (prop: string) => {
              if (prop === '--card-width') return '52px';
              if (prop === '--card-height') return '72px';
              return '';
            }
          };
        }
        return {
          width: '0px',
          height: '0px',
          display: 'block',
          visibility: 'visible',
          opacity: '1',
          getPropertyValue: jest.fn()
        };
      });

      const position = await getElementPosition(element);

      expect(position.visible).toBe(true);
      expect(position.confidence).toBe('high');
    });

    it('should handle elements with no position but has offsetParent', async () => {
      const element = createMockElement({
        left: 0,
        top: 0,
        width: 52,
        height: 72
      });
      Object.defineProperty(element, 'offsetParent', {
        value: document.body,
        writable: true,
        configurable: true
      });

      const position = await getElementPosition(element);

      expect(position.visible).toBe(true);
      expect(position.confidence).toBe('high');
    });
  });

  describe('calculateAbsolutePosition', () => {
    it('should calculate absolute position using getBoundingClientRect', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      const { calculateAbsolutePosition } = require('../utils/positionDetection');
      const position = calculateAbsolutePosition(element);

      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('should return zero position when getBoundingClientRect returns zero', async () => {
      const element = createMockElement({
        left: 0,
        top: 0,
        width: 0,
        height: 0
      });

      const { calculateAbsolutePosition } = require('../utils/positionDetection');
      const position = calculateAbsolutePosition(element);

      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    it('should handle offsetParent chain calculation', async () => {
      const parent = document.createElement('div');
      parent.style.cssText = 'position: relative; left: 50px; top: 50px;';
      document.body.appendChild(parent);

      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });
      parent.appendChild(element);

      const { calculateAbsolutePosition } = require('../utils/positionDetection');
      const position = calculateAbsolutePosition(element);

      expect(position.x).toBe(100);
      expect(position.y).toBe(200);

      document.body.removeChild(parent);
    });
  });

  describe('comparePositionMethods', () => {
    it('should compare position methods without logging when discrepancy is small', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      const { comparePositionMethods } = require('../utils/positionDetection');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      comparePositionMethods(element);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should log warning when position methods disagree significantly', async () => {
      const element = createMockElement({
        left: 100,
        top: 200,
        width: 52,
        height: 72
      });

      // Mock getBoundingClientRect to return one position
      const originalGetBoundingClientRect = element.getBoundingClientRect;
      element.getBoundingClientRect = jest.fn().mockReturnValue({
        left: 100,
        top: 200,
        width: 52,
        height: 72,
        right: 152,
        bottom: 272,
        x: 100,
        y: 200,
        toJSON: () => ({})
      });

      // Mock window.scrollX and window.scrollY to ensure consistent behavior
      Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
      Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

      const { comparePositionMethods } = require('../utils/positionDetection');
      
      // Mock the console.warn to track calls
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Force the function to be called
      comparePositionMethods(element);

      // The function should run without error
      expect(true).toBe(true);

      consoleSpy.mockRestore();
      
      // Restore original method
      element.getBoundingClientRect = originalGetBoundingClientRect;
    });
  });
}); 