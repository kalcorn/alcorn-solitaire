/* =================================================================
   UNIFIED CARD DIMENSIONS UTILITY - JAVASCRIPT ACCESS
   ================================================================= */

/**
 * Gets the current card dimensions from CSS custom properties.
 * This ensures JavaScript animations use the exact same dimensions as CSS.
 * 
 * NEVER hardcode card dimensions in JavaScript - always use this function.
 */
export interface CardDimensions {
  width: number;
  height: number;
  widthPx: string;
  heightPx: string;
  aspectRatio: number;
}

export function getCardDimensions(): CardDimensions {
  // Default mobile dimensions for SSR
  if (typeof window === 'undefined') {
    return {
      width: 52,
      height: 72,
      widthPx: '52px',
      heightPx: '72px',
      aspectRatio: 52 / 72
    };
  }

  // Get the computed CSS custom properties
  const computedStyle = getComputedStyle(document.documentElement);
  const widthPx = computedStyle.getPropertyValue('--card-width').trim();
  const heightPx = computedStyle.getPropertyValue('--card-height').trim();
  
  // Parse to numbers (remove 'px')
  const width = parseInt(widthPx.replace('px', ''));
  const height = parseInt(heightPx.replace('px', ''));
  
  return {
    width,
    height,
    widthPx,
    heightPx,
    aspectRatio: width / height
  };
}

/**
 * Gets the current card font sizes from CSS custom properties.
 */
export interface CardFontSizes {
  base: string;
  rank: string;
  suitSymbol: string;
  faceDown: string;
}

export function getCardFontSizes(): CardFontSizes {
  // Default mobile font sizes for SSR
  if (typeof window === 'undefined') {
    return {
      base: '0.9rem',
      rank: '1.4rem',
      suitSymbol: '2.8rem',
      faceDown: '1.5rem'
    };
  }

  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    base: computedStyle.getPropertyValue('--card-font-size').trim(),
    rank: computedStyle.getPropertyValue('--card-rank-font-size').trim(),
    suitSymbol: computedStyle.getPropertyValue('--card-suit-symbol-size').trim(),
    faceDown: computedStyle.getPropertyValue('--card-face-down-font-size').trim()
  };
}

/**
 * Utility function to create a style object with card dimensions.
 * Useful for inline styles in React components.
 */
export function getCardDimensionStyles(): React.CSSProperties {
  const { widthPx, heightPx } = getCardDimensions();
  
  return {
    width: widthPx,
    height: heightPx,
    minWidth: widthPx,
    minHeight: heightPx,
    maxWidth: widthPx,
    maxHeight: widthPx
  };
}

/**
 * Utility function to create a flexible style object with card dimensions.
 * For components that need card dimensions but allow flexible sizing.
 */
export function getCardDimensionStylesFlexible(): React.CSSProperties {
  const { widthPx, heightPx } = getCardDimensions();
  
  return {
    width: widthPx,
    height: heightPx
  };
}