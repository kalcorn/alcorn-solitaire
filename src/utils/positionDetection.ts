/**
 * Bulletproof Position Detection System
 * Solves the core problem of getting reliable X/Y coordinates from DOM elements
 */

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  confidence: 'high' | 'medium' | 'low';
  source: 'measured' | 'fallback';
}

export interface PositionValidation {
  isValid: boolean;
  issues: string[];
  confidence: 'high' | 'medium' | 'low';
}







/**
 * Measure element position with multiple validation approaches
 */
function measureElementPosition(element: HTMLElement): ElementPosition {
  const rect = element.getBoundingClientRect();
  
  // Try to get CSS dimensions
  let cssWidth = 0;
  let cssHeight = 0;
  let hasCssDimensions = false;
  
  try {
    const computedStyle = getComputedStyle(element);
    cssWidth = parseFloat(computedStyle.width);
    cssHeight = parseFloat(computedStyle.height);
    hasCssDimensions = cssWidth > 0 && cssHeight > 0;
  } catch (error) {
    // getComputedStyle failed - treat as no CSS dimensions
    hasCssDimensions = false;
  }
  
  // Check if element has position from getBoundingClientRect
  const hasValidDimensions = rect.width > 0 && rect.height > 0;
  // Position is valid if it's not NaN and not undefined (0,0 is a valid position)
  const hasValidPosition = !isNaN(rect.left) && !isNaN(rect.top) && 
                          rect.left !== undefined && rect.top !== undefined;
  
  // Check if element is in the layout flow
  const hasOffsetParent = element.offsetParent !== null;
  
  // Check if CSS custom properties are loaded
  let cssLoaded = false;
  try {
    const documentStyle = getComputedStyle(document.documentElement);
    const cardWidth = documentStyle.getPropertyValue('--card-width').trim();
    const cardHeight = documentStyle.getPropertyValue('--card-height').trim();
    cssLoaded = cardWidth !== '' && cardHeight !== '';
  } catch (error) {
    cssLoaded = false;
  }
    
    // Calculate center position
  // If getBoundingClientRect returns zero dimensions but we have CSS dimensions,
  // use the CSS dimensions for positioning
  let x, y;
  if (rect.width === 0 && rect.height === 0 && hasCssDimensions) {
    // Use CSS dimensions when getBoundingClientRect is not available yet
    x = rect.left + cssWidth / 2;
    y = rect.top + cssHeight / 2;
  } else {
    // Use getBoundingClientRect dimensions
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  }
  
  // Element is visible if it has valid dimensions and position
  // CSS must be loaded for elements to be considered visible
  const isVisible = hasValidPosition && (hasCssDimensions || hasValidDimensions) && cssLoaded;
  
  
  
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(rect.width || cssWidth),
    height: Math.round(rect.height || cssHeight),
    visible: isVisible,
    confidence: isVisible ? 'high' : 'medium',
    source: 'measured'
  };
}

/**
 * Validate position is usable for animation
 */
function validatePosition(position: ElementPosition): PositionValidation {
  const issues: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  // Check if element is visible
  if (!position.visible) {
    issues.push('Element not visible');
    confidence = 'medium';
  }
  
  // Check if position is reasonable (allow negative coordinates for off-screen elements)
  if (position.x < -2000 || position.y < -2000) {
    issues.push('Position is far outside viewport');
    confidence = 'medium';
  }
  
  // Check if dimensions are reasonable (allow zero dimensions)
  if (position.width < 0 || position.height < 0) {
    issues.push('Element has negative dimensions');
    confidence = 'low';
  }
  
  // Check if position is within reasonable bounds (with tolerance)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  if (position.x > viewportWidth + 3000 || position.y > viewportHeight + 3000) {
    issues.push('Position is far outside viewport');
    confidence = 'medium';
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    confidence
  };
}

/**
 * Comprehensive debugging function to identify why element position is 0
 */
export async function debugElementPosition(element: HTMLElement): Promise<void> {
  console.group('[PositionDetection] Comprehensive Element Debug');
  
  // 1. Check if element reference is valid
  console.log('1. Element Reference Check:');
  console.log('  - Element:', element);
  console.log('  - Element type:', typeof element);
  console.log('  - Is HTMLElement:', element instanceof HTMLElement);
  console.log('  - Element ID:', element.id);
  console.log('  - Element classList:', element.classList.toString());
  
  // 2. Check if element is in document flow
  console.log('2. Document Flow Check:');
  console.log('  - In DOM:', document.contains(element));
  console.log('  - Parent element:', element.parentElement);
  console.log('  - Parent in DOM:', element.parentElement ? document.contains(element.parentElement) : 'N/A');
  
  // 3. Check CSS properties
  console.log('3. CSS Properties Check:');
  try {
    const computedStyle = getComputedStyle(element);
    console.log('  - display:', computedStyle.display);
    console.log('  - visibility:', computedStyle.visibility);
    console.log('  - opacity:', computedStyle.opacity);
    console.log('  - position:', computedStyle.position);
    console.log('  - width:', computedStyle.width);
    console.log('  - height:', computedStyle.height);
    console.log('  - top:', computedStyle.top);
    console.log('  - left:', computedStyle.left);
    console.log('  - transform:', computedStyle.transform);
  } catch (error) {
    console.log('  - getComputedStyle failed:', error);
  }
  
  // 4. Check offsetParent chain
  console.log('4. OffsetParent Chain Check:');
  let currentElement: HTMLElement | null = element;
  let chainLevel = 0;
  while (currentElement && chainLevel < 10) {
    console.log(`  - Level ${chainLevel}:`, {
      element: currentElement.tagName + (currentElement.id ? `#${currentElement.id}` : ''),
      offsetTop: currentElement.offsetTop,
      offsetLeft: currentElement.offsetLeft,
      offsetWidth: currentElement.offsetWidth,
      offsetHeight: currentElement.offsetHeight,
      offsetParent: currentElement.offsetParent ? 
        (currentElement.offsetParent as HTMLElement).tagName + 
        ((currentElement.offsetParent as HTMLElement).id ? `#${(currentElement.offsetParent as HTMLElement).id}` : '') : 
        'null'
    });
    currentElement = currentElement.offsetParent as HTMLElement;
    chainLevel++;
  }
  
  // 5. Check getBoundingClientRect
  console.log('5. getBoundingClientRect Check:');
  try {
    const rect = element.getBoundingClientRect();
    console.log('  - rect:', {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      x: rect.x,
      y: rect.y
    });
  } catch (error) {
    console.log('  - getBoundingClientRect failed:', error);
  }
  
  // 6. Check scroll positions
  console.log('6. Scroll Position Check:');
  console.log('  - window.scrollX:', window.scrollX);
  console.log('  - window.scrollY:', window.scrollY);
  console.log('  - document.documentElement.scrollLeft:', document.documentElement.scrollLeft);
  console.log('  - document.documentElement.scrollTop:', document.documentElement.scrollTop);
  
  // 7. Check viewport dimensions
  console.log('7. Viewport Check:');
  console.log('  - window.innerWidth:', window.innerWidth);
  console.log('  - window.innerHeight:', window.innerHeight);
  console.log('  - document.documentElement.clientWidth:', document.documentElement.clientWidth);
  console.log('  - document.documentElement.clientHeight:', document.documentElement.clientHeight);
  
  // 8. Check if element is visible
  console.log('8. Visibility Check:');
  console.log('  - Element visible in viewport:', element.offsetWidth > 0 && element.offsetHeight > 0);
  console.log('  - Element has dimensions:', element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0);
  
  console.groupEnd();
  
  // If element has zero dimensions, analyze the parent tree
  if (element.getBoundingClientRect().width === 0 && element.getBoundingClientRect().height === 0) {
    console.warn('[PositionDetection] Element has zero dimensions - analyzing parent tree...');
    await debugParentTree(element);
    
    // Check for responsive layout issue (hidden parent elements)
    const computedStyle = getComputedStyle(element);
    if (computedStyle.display === 'none') {
      console.warn('[PositionDetection] Element has display: none - this is a responsive layout issue!');
    } else {
      // Check if any parent has display: none
      let parent = element.parentElement;
      let level = 0;
      while (parent && level < 10) {
        const parentStyle = getComputedStyle(parent);
        if (parentStyle.display === 'none') {
          console.warn(`[PositionDetection] Parent at level ${level} has display: none - responsive layout issue detected!`);
          console.warn(`[PositionDetection] Parent element:`, parent);
          break;
        }
        parent = parent.parentElement;
        level++;
      }
    }
  }
}

/**
 * Systematically test DOM parent tree to find where positioning breaks down
 */
export async function debugParentTree(element: HTMLElement): Promise<void> {
  console.group('[PositionDetection] DOM Parent Tree Analysis');
  
  let currentElement: HTMLElement | null = element;
  let level = 0;
  const maxLevels = 20; // Prevent infinite loops
  
  while (currentElement && level < maxLevels) {
    const rect = currentElement.getBoundingClientRect();
    const computedStyle = getComputedStyle(currentElement);
    
    console.log(`Level ${level}:`, {
      element: currentElement.tagName + 
        (currentElement.id ? `#${currentElement.id}` : '') + 
        (currentElement.className ? `.${currentElement.className.split(' ').join('.')}` : ''),
      position: computedStyle.position,
      display: computedStyle.display,
      width: computedStyle.width,
      height: computedStyle.height,
      offsetParent: currentElement.offsetParent ? 
        (currentElement.offsetParent as HTMLElement).tagName + 
        ((currentElement.offsetParent as HTMLElement).id ? `#${(currentElement.offsetParent as HTMLElement).id}` : '') : 
        'null',
      offsetTop: currentElement.offsetTop,
      offsetLeft: currentElement.offsetLeft,
      offsetWidth: currentElement.offsetWidth,
      offsetHeight: currentElement.offsetHeight,
      getBoundingClientRect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      },
      hasValidDimensions: rect.width > 0 && rect.height > 0,
      hasValidPosition: rect.left !== 0 || rect.top !== 0
    });
    
    // Check if this element has valid positioning
    if (rect.width > 0 && rect.height > 0) {
      console.log(`✅ Level ${level} has valid dimensions: ${rect.width}x${rect.height}`);
    } else {
      console.log(`❌ Level ${level} has zero dimensions: ${rect.width}x${rect.height}`);
    }
    
    if (rect.left !== 0 || rect.top !== 0) {
      console.log(`✅ Level ${level} has valid position: (${rect.left}, ${rect.top})`);
    } else {
      console.log(`❌ Level ${level} has zero position: (${rect.left}, ${rect.top})`);
    }
    
    // Move to parent
    currentElement = currentElement.parentElement;
    level++;
    
    // Stop if we reach body
    if (currentElement && currentElement.tagName === 'BODY') {
      console.log(`🏁 Reached BODY at level ${level}`);
      break;
    }
  }
  
  console.groupEnd();
}

/**
 * Get reliable element position with improved retry logic
 */
export function getElementPosition(element: HTMLElement): ElementPosition {
  // Check if element is in DOM
  if (!document.contains(element)) {
    return {
      x: 100,
      y: 100,
      width: 52,
      height: 72,
      visible: false,
      confidence: 'low',
      source: 'fallback'
    };
  }
  
  // Measure position
  const position = measureElementPosition(element);
  
  // Basic validation
  const validation = validatePosition(position);
  
  if (validation.isValid || validation.confidence === 'medium') {
    return position;
  }
  
  // Simple fallback
  return {
    x: 100,
    y: 100,
    width: 52,
    height: 72,
    visible: false,
    confidence: 'low',
    source: 'fallback'
  };
}

/**
 * Get positions for both elements with validation
 */
export function getElementPositions(
  fromElement: HTMLElement,
  toElement: HTMLElement
): { from: ElementPosition; to: ElementPosition } {
  const fromPosition = getElementPosition(fromElement);
  const toPosition = getElementPosition(toElement);
  
  return { from: fromPosition, to: toPosition };
} 

/**
 * Calculate absolute coordinates by recursively summing parent offsets
 * This gives us the true absolute position relative to document body (0,0)
 */
export function calculateAbsolutePosition(element: HTMLElement): { x: number, y: number } {
  // Use getBoundingClientRect + scroll (most reliable)
  const rect = element.getBoundingClientRect();
  const boundingRectPosition = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY
  };
  
  // If position is zero, return zero
  if (boundingRectPosition.x === 0 && boundingRectPosition.y === 0) {
    return { x: 0, y: 0 };
  }
  
  // Method 3: Use offsetParent chain (for comparison)
  let currentElement: HTMLElement | null = element;
  let offsetX = 0;
  let offsetY = 0;
  let level = 0;
  const maxLevels = 20;
  
  while (currentElement && level < maxLevels) {
    const offsetLeft = currentElement.offsetLeft;
    const offsetTop = currentElement.offsetTop;
    const scrollLeft = currentElement.scrollLeft || 0;
    const scrollTop = currentElement.scrollTop || 0;
    
    offsetX += offsetLeft - scrollLeft;
    offsetY += offsetTop - scrollTop;
    
    currentElement = currentElement.offsetParent as HTMLElement;
    level++;
    
    if (currentElement && (currentElement.tagName === 'BODY' || currentElement.tagName === 'HTML')) {
      break;
    }
  }
  
  const offsetPosition = { x: offsetX, y: offsetY };
  
  // Compare methods
  const discrepancy = {
    x: Math.abs(boundingRectPosition.x - offsetPosition.x),
    y: Math.abs(boundingRectPosition.y - offsetPosition.y)
  };
  
  if (discrepancy.x > 5 || discrepancy.y > 5) {
    return boundingRectPosition;
  } else {
    return offsetPosition;
  }
}

/**
 * Compare getBoundingClientRect vs absolute position calculation
 */
export function comparePositionMethods(element: HTMLElement): void {
  // Simple comparison without verbose logging
  const rect = element.getBoundingClientRect();
  const boundingRectPosition = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY
  };
  
  const absolutePosition = calculateAbsolutePosition(element);
  
  const boundingVsAbsolute = {
    xDiff: Math.abs(boundingRectPosition.x - absolutePosition.x),
    yDiff: Math.abs(boundingRectPosition.y - absolutePosition.y)
  };
  
  // Only log if there's a significant discrepancy
  if (boundingVsAbsolute.xDiff > 5 || boundingVsAbsolute.yDiff > 5) {
    console.warn('Position methods disagree:', { boundingRectPosition, absolutePosition, discrepancy: boundingVsAbsolute });
  }
} 