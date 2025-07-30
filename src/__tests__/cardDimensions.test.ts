import { getCardDimensions, getCardFontSizes, getCardDimensionStyles, getCardDimensionStylesFlexible } from '../utils/cardDimensions';

// Mock getComputedStyle
const mockGetComputedStyle = jest.fn();
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
  writable: true
});

describe('Card Dimensions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default CSS custom properties with proper mock implementation
    const mockStyle = {
      getPropertyValue: jest.fn((property: string) => {
        switch (property) {
          case '--card-width': return '52px';
          case '--card-height': return '72px';
          case '--card-font-size': return '0.9rem';
          case '--card-rank-font-size': return '1.4rem';
          case '--card-suit-symbol-size': return '2.8rem';
          case '--card-face-down-font-size': return '1.5rem';
          default: return '';
        }
      })
    };
    mockGetComputedStyle.mockReturnValue(mockStyle);
  });

  describe('getCardDimensions', () => {
    it('should return default dimensions for SSR', () => {
      // Mock window as undefined for SSR
      const originalWindow = global.window;
      delete (global as any).window;

      const dimensions = getCardDimensions();

      expect(dimensions).toEqual({
        width: 52,
        height: 72,
        widthPx: '52px',
        heightPx: '72px',
        aspectRatio: 52 / 72
      });

      // Restore window
      global.window = originalWindow;
    });

    it('should handle getComputedStyle returning null', () => {
      // Mock getComputedStyle to return null
      mockGetComputedStyle.mockReturnValue(null);

      expect(() => getCardDimensions()).toThrow();
    });

    it('should return dimensions from CSS custom properties', () => {
      // Mock CSS custom properties
      const mockStyle = {
        getPropertyValue: jest.fn()
          .mockReturnValueOnce('100px')  // --card-width
          .mockReturnValueOnce('140px')  // --card-height
      };
      mockGetComputedStyle.mockReturnValue(mockStyle);

      const dimensions = getCardDimensions();

      expect(dimensions).toEqual({
        width: 100,
        height: 140,
        widthPx: '100px',
        heightPx: '140px',
        aspectRatio: 100 / 140
      });
    });

    it('should handle CSS properties without px suffix', () => {
      const mockStyle = {
        getPropertyValue: jest.fn()
          .mockReturnValueOnce('100')  // --card-width
          .mockReturnValueOnce('140')  // --card-height
      };
      mockGetComputedStyle.mockReturnValue(mockStyle);

      const dimensions = getCardDimensions();

      expect(dimensions).toEqual({
        width: 100,
        height: 140,
        widthPx: '100',
        heightPx: '140',
        aspectRatio: 100 / 140
      });
    });

    it('should handle empty CSS properties', () => {
      const mockStyle = {
        getPropertyValue: jest.fn()
          .mockReturnValueOnce('')  // --card-width
          .mockReturnValueOnce('')  // --card-height
      };
      mockGetComputedStyle.mockReturnValue(mockStyle);

      const dimensions = getCardDimensions();

      expect(dimensions).toEqual({
        width: NaN,
        height: NaN,
        widthPx: '',
        heightPx: '',
        aspectRatio: NaN
      });
    });


  });

  describe('getCardFontSizes', () => {
    it('should return default font sizes for SSR', () => {
      // Mock window as undefined for SSR
      const originalWindow = global.window;
      delete (global as any).window;

      const fontSizes = getCardFontSizes();

      expect(fontSizes).toEqual({
        base: '0.9rem',
        rank: '1.4rem',
        suitSymbol: '2.8rem',
        faceDown: '1.5rem'
      });

      // Restore window
      global.window = originalWindow;
    });

    it('should return font sizes from CSS custom properties', () => {
      const mockStyle = {
        getPropertyValue: jest.fn()
          .mockReturnValueOnce('0.9rem')  // --card-font-size-base
          .mockReturnValueOnce('1.4rem')  // --card-font-size-rank
          .mockReturnValueOnce('2.8rem')  // --card-font-size-suit
          .mockReturnValueOnce('1.5rem')  // --card-font-size-face-down
      };
      mockGetComputedStyle.mockReturnValue(mockStyle);

      const fontSizes = getCardFontSizes();

      expect(fontSizes).toEqual({
        base: '0.9rem',
        rank: '1.4rem',
        suitSymbol: '2.8rem',
        faceDown: '1.5rem'
      });
    });


  });

  describe('getCardDimensionStyles', () => {
    it('should return style object with card dimensions', () => {
      const mockStyle = {
        getPropertyValue: jest.fn()
          .mockReturnValueOnce('52px')  // --card-width
          .mockReturnValueOnce('72px')  // --card-height
      };
      mockGetComputedStyle.mockReturnValue(mockStyle);

      const styles = getCardDimensionStyles();

      expect(styles).toEqual({
        width: '52px',
        height: '72px',
        minWidth: '52px',
        minHeight: '72px',
        maxWidth: '52px',
        maxHeight: '52px'
      });
    });


  });

  describe('getCardDimensionStylesFlexible', () => {
    it('should return flexible style object with card dimensions', () => {
      const mockStyle = {
        getPropertyValue: jest.fn()
          .mockReturnValueOnce('52px')  // --card-width
          .mockReturnValueOnce('72px')  // --card-height
      };
      mockGetComputedStyle.mockReturnValue(mockStyle);

      const styles = getCardDimensionStylesFlexible();

      expect(styles).toEqual({
        width: '52px',
        height: '72px'
      });
    });


  });
}); 