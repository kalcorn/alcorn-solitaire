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
 * Check if CSS custom properties are loaded
 */
function areCssPropertiesLoaded(): boolean {
  try {
    const computedStyle = getComputedStyle(document.documentElement);
    const cardWidth = computedStyle.getPropertyValue('--card-width').trim();
    const cardHeight = computedStyle.getPropertyValue('--card-height').trim();
    return cardWidth !== '' && cardHeight !== '' && 
           parseFloat(cardWidth) > 0 && parseFloat(cardHeight) > 0;
  } catch (error) {
    console.warn('[PositionDetection] Failed to check CSS properties:', error);
    return false; // Changed from true to false - if we can't check, assume not loaded
  }
}

/**
 * Wait for an element to be properly positioned in the DOM
 */
async function waitForElementInDOM(element: HTMLElement, maxAttempts = 5): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (document.contains(element)) {
      return;
    }
    
    if (attempt === 1 || attempt === maxAttempts) {
      console.log(`[PositionDetection] Waiting for element in DOM: attempt ${attempt}/${maxAttempts}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 20)); // Reduced delay
  }
  
  throw new Error(`Element not in DOM after ${maxAttempts} attempts`);
}

/**
 * Wait for CSS custom properties to be loaded
 */
async function waitForCSSProperties(maxAttempts = 5): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (areCssPropertiesLoaded()) {
    return;
  }
  
    if (attempt === 1 || attempt === maxAttempts) {
      console.log(`[PositionDetection] Waiting for CSS properties: attempt ${attempt}/${maxAttempts}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 20)); // Reduced delay
  }
  
  console.warn('[PositionDetection] CSS properties not loaded, continuing anyway');
}

/**
 * Force layout recalculation for an element
 */
function forceLayoutRecalculation(element: HTMLElement): void {
  // Force the browser to recalculate layout
  element.offsetHeight; // This triggers a reflow
}

/**
 * Force layout recalculation multiple times with delays
 */
async function forceLayoutRecalculationAggressive(element: HTMLElement, attempts = 5): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    // Multiple properties that force reflow
    element.offsetHeight;
    element.offsetWidth;
    element.getBoundingClientRect();
    
    // Small delay to allow layout to settle
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

/**
 * Wait for element layout to be stable
 */
async function waitForLayoutStable(element: HTMLElement, maxAttempts = 10): Promise<void> {
  let lastRect: DOMRect | null = null;
  let stableCount = 0;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Force layout recalculation
    forceLayoutRecalculation(element);
    
    const rect = element.getBoundingClientRect();
    
    if (lastRect && 
        Math.abs(rect.left - lastRect.left) < 1 &&
        Math.abs(rect.top - lastRect.top) < 1 &&
        Math.abs(rect.width - lastRect.width) < 1 &&
        Math.abs(rect.height - lastRect.height) < 1) {
      stableCount++;
      if (stableCount >= 2) {
        return; // Layout is stable
      }
    } else {
      stableCount = 0;
    }
    
    lastRect = rect;
    
    if (attempt === 1 || attempt === maxAttempts) {
      console.log(`[PositionDetection] Waiting for layout stability: attempt ${attempt}/${maxAttempts}, stable: ${stableCount}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50)); // Increased delay to 50ms
  }
  
  console.warn('[PositionDetection] Layout not stable, continuing anyway');
}

/**
 * Measure element position with multiple validation approaches
 */
async function measureElementPosition(element: HTMLElement): Promise<ElementPosition> {
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
    console.warn('[PositionDetection] getComputedStyle failed:', error);
  }
  
  // Check if element has position from getBoundingClientRect
  const hasValidDimensions = rect.width > 0 && rect.height > 0;
  // Position is valid if it's not NaN and not undefined (0,0 is a valid position)
  const hasValidPosition = !isNaN(rect.left) && !isNaN(rect.top) && 
                          rect.left !== undefined && rect.top !== undefined;
  
  // Check if element is in the layout flow
  const hasOffsetParent = element.offsetParent !== null;
  
  // Check if CSS custom properties are loaded
  const cssLoaded = areCssPropertiesLoaded();
    
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
  
  // Element is visible if it has either CSS dimensions or valid rect dimensions
  // AND CSS custom properties are loaded (for consistent sizing)
  // AND either has valid position or offsetParent or CSS dimensions
  const isVisible = (hasCssDimensions || hasValidDimensions) && 
                   cssLoaded &&
                   (hasValidPosition || hasOffsetParent || hasCssDimensions);
  
  // Debug logging for visibility calculation
  console.log('[PositionDetection] Visibility calculation:', {
    hasCssDimensions,
    hasValidDimensions,
    hasValidPosition,
    hasOffsetParent,
    cssLoaded,
    isVisible,
    rect: { width: rect.width, height: rect.height, left: rect.left, top: rect.top },
    css: { width: cssWidth, height: cssHeight }
  });
  
  // Debug logging for visibility issues
  if (!isVisible) {
    console.warn('[PositionDetection] Element not visible:', {
      hasOffsetParent,
      hasValidDimensions,
      hasValidPosition,
      hasCssDimensions,
      cssLoaded,
      rect: { width: rect.width, height: rect.height, left: rect.left, top: rect.top },
      css: { width: cssWidth, height: cssHeight },
      offsetParent: element.offsetParent ? 'present' : 'null'
    });
    
    // Run comprehensive debug if element has zero dimensions
    if (rect.width === 0 && rect.height === 0) {
      console.warn('[PositionDetection] Element has zero dimensions - running comprehensive debug...');
      debugElementPosition(element);
      
      // Check for CSS vs layout mismatch (exactly what we're seeing in browser)
      if (hasCssDimensions && cssWidth > 0 && cssHeight > 0) {
        console.warn('[PositionDetection] CSS vs Layout mismatch detected! CSS dimensions exist but layout dimensions are zero.');
        console.warn('[PositionDetection] This indicates a layout timing issue - forcing immediate layout recalculation...');
        
        // Force immediate layout recalculation
        await forceLayoutRecalculationAggressive(element, 3);
        
        // Re-measure immediately
        const immediateRect = element.getBoundingClientRect();
        console.log('[PositionDetection] After immediate layout recalculation:', {
          width: immediateRect.width,
          height: immediateRect.height,
          left: immediateRect.left,
          top: immediateRect.top
        });
      }
    }
  }
  
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
export async function getElementPosition(element: HTMLElement): Promise<ElementPosition> {
  const maxAttempts = 10; // Reduced from 15
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Step 1: Wait for element to be in DOM
      await waitForElementInDOM(element, 3); // Reduced from 5
      
      // Step 2: Wait for CSS properties
      await waitForCSSProperties(3); // Reduced from 5
      
      // Step 3: Wait for layout to be stable
      await waitForLayoutStable(element, 10); // Increased from 3 to 10
      
      // Step 4: Measure position
      const position = await measureElementPosition(element);
      
      // Step 5: If we have CSS dimensions but not valid rect dimensions,
      // force additional layout recalculations
      if (position.visible && position.width === 0 && position.height === 0) {
        console.log(`[PositionDetection] Element has CSS dimensions but zero rect dimensions, forcing aggressive layout recalculation on attempt ${attempt}`);
        
        // Check if this is Chrome mobile view issue
        const computedStyle = getComputedStyle(element);
        const hasCssDimensions = computedStyle.width !== 'auto' && computedStyle.height !== 'auto';
        const cssWidth = parseFloat(computedStyle.width);
        const cssHeight = parseFloat(computedStyle.height);
        
        if (hasCssDimensions && cssWidth > 0 && cssHeight > 0) {
          console.warn(`[PositionDetection] Chrome mobile view detected! CSS dimensions: ${cssWidth}x${cssHeight}, but layout dimensions: 0x0`);
          console.warn(`[PositionDetection] Applying Chrome mobile view workaround...`);
          
          // Chrome mobile view workaround: force multiple layout recalculations
          for (let i = 0; i < 10; i++) {
            // Force layout recalculation
            element.offsetHeight;
            element.offsetWidth;
            element.getBoundingClientRect();
            
            // Small delay to allow layout to settle
            await new Promise(resolve => setTimeout(resolve, 5));
          }
          
          // Re-measure after Chrome mobile view workaround
          const chromeWorkaroundRect = element.getBoundingClientRect();
          console.log(`[PositionDetection] After Chrome mobile view workaround:`, {
            width: chromeWorkaroundRect.width,
            height: chromeWorkaroundRect.height,
            left: chromeWorkaroundRect.left,
            top: chromeWorkaroundRect.top
          });
          
          // If still zero, use CSS dimensions as fallback
          if (chromeWorkaroundRect.width === 0 && chromeWorkaroundRect.height === 0) {
            console.warn(`[PositionDetection] Chrome mobile view workaround failed, using CSS dimensions as fallback`);
            position.x = 0; // We can't get real position, use 0
            position.y = 0; // We can't get real position, use 0
            position.width = cssWidth;
            position.height = cssHeight;
            position.visible = true;
            position.confidence = 'low'; // Low confidence due to Chrome mobile view issue
            return position;
          } else {
            console.log(`[PositionDetection] Chrome mobile view workaround successful!`);
            position.x = chromeWorkaroundRect.left;
            position.y = chromeWorkaroundRect.top;
            position.width = chromeWorkaroundRect.width;
            position.height = chromeWorkaroundRect.height;
            position.visible = true;
            position.confidence = 'high';
            return position;
          }
        }
        
        // Force aggressive layout recalculation
        await forceLayoutRecalculationAggressive(element, 5);
        
        // Re-measure after forced recalculation
        const recalculatedPosition = await measureElementPosition(element);
        if (recalculatedPosition.width > 0 || recalculatedPosition.height > 0) {
          console.log(`[PositionDetection] Aggressive layout recalculation successful, got dimensions: ${recalculatedPosition.width}x${recalculatedPosition.height}`);
          position.x = recalculatedPosition.x;
          position.y = recalculatedPosition.y;
          position.width = recalculatedPosition.width;
          position.height = recalculatedPosition.height;
          position.visible = recalculatedPosition.visible;
          position.confidence = recalculatedPosition.confidence;
        } else {
          console.warn(`[PositionDetection] Aggressive layout recalculation failed, dimensions still zero`);
          
          // Final fallback: use CSS dimensions if available
          const computedStyle = getComputedStyle(element);
          const cssWidth = parseFloat(computedStyle.width);
          const cssHeight = parseFloat(computedStyle.height);
          
          if (cssWidth > 0 && cssHeight > 0) {
            console.warn(`[PositionDetection] Using CSS dimensions as final fallback: ${cssWidth}x${cssHeight}`);
            position.x = 0;
            position.y = 0;
            position.width = cssWidth;
            position.height = cssHeight;
            position.visible = true;
            position.confidence = 'low';
            return position;
          }
        }
      }
      
      // Step 6: Validate position
      const validation = validatePosition(position);
      
      if (validation.isValid || validation.confidence === 'medium') {
        console.log(`[PositionDetection] Got position on attempt ${attempt}:`, {
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height,
          confidence: position.confidence,
          visible: position.visible
        });
        return position;
      }
      
      // Log validation issues
      if (attempt === 1 || attempt === maxAttempts) {
        console.warn(`[PositionDetection] Position validation failed on attempt ${attempt}:`, validation.issues);
      }
      
    } catch (error) {
      if (attempt === 1 || attempt === maxAttempts) {
        console.warn(`[PositionDetection] Error on attempt ${attempt}:`, error);
      }
    }
    
    // Shorter delay
    const delay = Math.min(20 * attempt, 100); // Reduced delays
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Final fallback: return a reasonable position
  console.error('[PositionDetection] Failed to get reliable position, using fallback');
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
export async function getElementPositions(
  fromElement: HTMLElement,
  toElement: HTMLElement
): Promise<{ from: ElementPosition; to: ElementPosition }> {
  console.log('[PositionDetection] Getting positions for animation');
  
  const [fromPosition, toPosition] = await Promise.all([
    getElementPosition(fromElement),
    getElementPosition(toElement)
  ]);
  
  // Validate both positions
  const fromValidation = validatePosition(fromPosition);
  const toValidation = validatePosition(toPosition);
  
  if (!fromValidation.isValid || !toValidation.isValid) {
    console.warn('[PositionDetection] Position validation issues:', {
      from: fromValidation.issues,
      to: toValidation.issues
    });
  }
  
  return { from: fromPosition, to: toPosition };
} 

/**
 * Calculate absolute coordinates by recursively summing parent offsets
 * This gives us the true absolute position relative to document body (0,0)
 */
export function calculateAbsolutePosition(element: HTMLElement): { x: number, y: number } {
  console.group('[PositionDetection] Absolute Position Calculation');
  
  console.log(`Starting with element: ${element.tagName}${element.id ? `#${element.id}` : ''}${element.className ? `.${element.className.split(' ').join('.')}` : ''}`);
  
  // Use the same approach as getElementPosition - force layout recalculation first
  console.log('Forcing layout recalculation...');
  element.offsetHeight; // Force reflow
  element.offsetWidth; // Force reflow
  element.getBoundingClientRect(); // Force reflow
  
  // Method 1: Use getBoundingClientRect + scroll (most reliable)
  const rect = element.getBoundingClientRect();
  const boundingRectPosition = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY
  };
  
  console.log(`getBoundingClientRect + scroll: (${boundingRectPosition.x}, ${boundingRectPosition.y})`);
  
  // Method 2: Use the same CSS dimensions fallback as getElementPosition
  const computedStyle = getComputedStyle(element);
  const cssWidth = parseFloat(computedStyle.width);
  const cssHeight = parseFloat(computedStyle.height);
  const hasCssDimensions = cssWidth > 0 && cssHeight > 0;
  
  console.log(`CSS dimensions: ${cssWidth}x${cssHeight}, hasCssDimensions: ${hasCssDimensions}`);
  
  // If getBoundingClientRect returns zeros but we have CSS dimensions, use Chrome mobile view workaround
  if (boundingRectPosition.x === 0 && boundingRectPosition.y === 0 && hasCssDimensions) {
    console.warn('⚠️ Chrome mobile view detected! getBoundingClientRect returns zeros but CSS dimensions exist.');
    console.warn('Applying Chrome mobile view workaround...');
    
    // Use the same workaround as getElementPosition
    // Force multiple layout recalculations
    for (let i = 0; i < 10; i++) {
      element.offsetHeight;
      element.offsetWidth;
      element.getBoundingClientRect();
    }
    
    // Re-measure after workaround
    const workaroundRect = element.getBoundingClientRect();
    const workaroundPosition = {
      x: workaroundRect.left + window.scrollX,
      y: workaroundRect.top + window.scrollY
    };
    
    console.log(`After Chrome mobile view workaround: (${workaroundPosition.x}, ${workaroundPosition.y})`);
    
    if (workaroundPosition.x === 0 && workaroundPosition.y === 0) {
      console.warn('⚠️ Chrome mobile view workaround failed, using CSS dimensions as fallback');
      console.log(`Final absolute position (CSS fallback): (0, 0) - using CSS dimensions: ${cssWidth}x${cssHeight}`);
      console.groupEnd();
      return { x: 0, y: 0 }; // We can't get real position, but we know the element exists
    } else {
      console.log(`✅ Chrome mobile view workaround successful!`);
      console.log(`Final absolute position (workaround): (${workaroundPosition.x}, ${workaroundPosition.y})`);
      console.groupEnd();
      return workaroundPosition;
    }
  }
  
  // Method 3: Use offsetParent chain (for comparison)
  let currentElement: HTMLElement | null = element;
  let offsetX = 0;
  let offsetY = 0;
  let level = 0;
  const maxLevels = 20; // Prevent infinite loops
  
  console.log('OffsetParent chain calculation:');
  
  while (currentElement && level < maxLevels) {
    const offsetLeft = currentElement.offsetLeft;
    const offsetTop = currentElement.offsetTop;
    const scrollLeft = currentElement.scrollLeft || 0;
    const scrollTop = currentElement.scrollTop || 0;
    
    // Add this element's offset to our running total
    offsetX += offsetLeft - scrollLeft;
    offsetY += offsetTop - scrollTop;
    
    console.log(`Level ${level}:`, {
      element: currentElement.tagName + 
        (currentElement.id ? `#${currentElement.id}` : '') + 
        (currentElement.className ? `.${currentElement.className.split(' ').join('.')}` : ''),
      offsetLeft,
      offsetTop,
      scrollLeft,
      scrollTop,
      runningTotal: { x: offsetX, y: offsetY },
      offsetParent: currentElement.offsetParent ? 
        (currentElement.offsetParent as HTMLElement).tagName + 
        ((currentElement.offsetParent as HTMLElement).id ? `#${(currentElement.offsetParent as HTMLElement).id}` : '') : 
        'null'
    });
    
    // Move to parent
    currentElement = currentElement.offsetParent as HTMLElement;
    level++;
    
    // Stop if we reach body or html
    if (currentElement && (currentElement.tagName === 'BODY' || currentElement.tagName === 'HTML')) {
      console.log(`🏁 Reached ${currentElement.tagName} at level ${level}`);
      break;
    }
  }
  
  const offsetPosition = { x: offsetX, y: offsetY };
  console.log(`OffsetParent calculation: (${offsetPosition.x}, ${offsetPosition.y})`);
  
  // Compare methods
  const discrepancy = {
    x: Math.abs(boundingRectPosition.x - offsetPosition.x),
    y: Math.abs(boundingRectPosition.y - offsetPosition.y)
  };
  
  console.log(`Discrepancy between methods: x=${discrepancy.x}, y=${discrepancy.y}`);
  
  if (discrepancy.x > 5 || discrepancy.y > 5) {
    console.warn('⚠️ Large discrepancy detected! Using getBoundingClientRect method.');
    console.log(`Final absolute position (getBoundingClientRect): (${boundingRectPosition.x}, ${boundingRectPosition.y})`);
    console.groupEnd();
    return boundingRectPosition;
  } else {
    console.log('✅ Methods agree within 5px tolerance');
    console.log(`Final absolute position (offsetParent): (${offsetPosition.x}, ${offsetPosition.y})`);
    console.groupEnd();
    return offsetPosition;
  }
}

/**
 * Compare getBoundingClientRect vs absolute position calculation
 */
export function comparePositionMethods(element: HTMLElement): void {
  console.group('[PositionDetection] Position Method Comparison');
  
  // Method 1: getBoundingClientRect
  const rect = element.getBoundingClientRect();
  const boundingRectPosition = {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY
  };
  
  // Method 2: Absolute position calculation
  const absolutePosition = calculateAbsolutePosition(element);
  
  // Method 3: getBoundingClientRect without scroll adjustment
  const boundingRectRaw = {
    x: rect.left,
    y: rect.top
  };
  
  console.log('Position Comparison Results:');
  console.log(`Element: ${element.tagName}${element.id ? `#${element.id}` : ''}${element.className ? `.${element.className.split(' ').join('.')}` : ''}`);
  console.log(`getBoundingClientRect + scroll: (${boundingRectPosition.x}, ${boundingRectPosition.y})`);
  console.log(`getBoundingClientRect raw: (${boundingRectRaw.x}, ${boundingRectRaw.y})`);
  console.log(`Absolute calculation: (${absolutePosition.x}, ${absolutePosition.y})`);
  console.log(`Window scroll: (${window.scrollX}, ${window.scrollY})`);
  
  // Check for discrepancies
  const boundingVsAbsolute = {
    xDiff: Math.abs(boundingRectPosition.x - absolutePosition.x),
    yDiff: Math.abs(boundingRectPosition.y - absolutePosition.y)
  };
  
  console.log(`Discrepancy (bounding vs absolute): x=${boundingVsAbsolute.xDiff}, y=${boundingVsAbsolute.yDiff}`);
  
  if (boundingVsAbsolute.xDiff > 1 || boundingVsAbsolute.yDiff > 1) {
    console.warn('⚠️ Significant discrepancy detected between position methods!');
  } else {
    console.log('✅ Position methods agree within 1px tolerance');
  }
  
  console.groupEnd();
} 