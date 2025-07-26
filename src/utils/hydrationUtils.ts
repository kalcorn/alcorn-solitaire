import React from 'react';
import { createInitialGameState } from './gameUtils';

/**
 * Utility functions for handling hydration safely
 */

/**
 * Hook to determine if code is running on the client
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Safe wrapper for client-only operations
 */
export function clientOnly<T>(fn: () => T, fallback?: T): T | undefined {
  if (typeof window === 'undefined') {
    return fallback;
  }
  return fn();
}

/**
 * Safe document access
 */
export function safeDocument() {
  return typeof document !== 'undefined' ? document : null;
}

/**
 * Safe window access
 */
export function safeWindow() {
  return typeof window !== 'undefined' ? window : null;
}

/**
 * Creates a deterministic game state for SSR
 */
export function createSSRSafeGameState() {
  // Use the canonical initial state, but ensure no randomization for SSR if needed
  // If dealInitialCards is deterministic, this is fine; otherwise, you may want to mock it for SSR
  return createInitialGameState();
}

/**
 * Prevents hydration mismatches by delaying random operations
 */
export function withHydrationDelay<T>(
  operation: () => T,
  fallback: T,
  delay: number = 0
): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  if (delay > 0) {
    setTimeout(operation, delay);
    return fallback;
  }

  return operation();
}