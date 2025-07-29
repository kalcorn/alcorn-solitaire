import { useCallback, useRef } from 'react';

// Simple pile registry for the new animation system
class PileRegistry {
  private piles = new Map<string, HTMLElement>();

  registerPile(id: string, element: HTMLElement | null) {
    if (element) {
      // Check if this element is in a visible layout
      const isInVisibleLayout = this.isElementInVisibleLayout(element);
      
      if (isInVisibleLayout) {
        this.piles.set(id, element);
      }
    } else {
      this.piles.delete(id);
    }
  }

  private isElementInVisibleLayout(element: HTMLElement): boolean {
    // Check if element is in a hidden container
    const isInHiddenContainer = element.closest('.hidden, [style*="display: none"], [style*="display:none"]');
    
    if (isInHiddenContainer) {
      return false;
    }

    // Check if element is in the currently visible layout
    const isInMobileLayout = element.closest('.block.md\\:hidden');
    const isInDesktopLayout = element.closest('.hidden.md\\:block');
    
    // For mobile view (width < 768px), mobile layout should be visible
    // For desktop view (width >= 768px), desktop layout should be visible
    const isMobileView = window.innerWidth < 768;
    
    if (isMobileView) {
      return !!isInMobileLayout && !isInDesktopLayout;
    } else {
      return !!isInDesktopLayout && !isInMobileLayout;
    }
  }

  getPile(id: string): HTMLElement | null {
    const element = this.piles.get(id);
    return element || null;
  }

  getAllPiles(): Map<string, HTMLElement> {
    return new Map(this.piles);
  }
}

// Global registry instance
const pileRegistry = new PileRegistry();

// Hook for registering pile elements
export function usePileRegistration(pileId: string) {
  const setElementRef = useCallback((element: HTMLElement | null) => {
    pileRegistry.registerPile(pileId, element);
  }, [pileId]);

  return { setElementRef };
}

// Hook for getting pile elements
export function usePileElements() {
  const getPileElement = useCallback((pileId: string): HTMLElement | null => {
    return pileRegistry.getPile(pileId);
  }, []);

  const getAllPileElements = useCallback((): Map<string, HTMLElement> => {
    return pileRegistry.getAllPiles();
  }, []);

  return { getPileElement, getAllPileElements };
}

// Export the registry for direct access if needed
export { pileRegistry }; 