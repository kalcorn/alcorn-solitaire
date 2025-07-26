import React, { useEffect, useState } from 'react';
import { useIsClient } from '@/utils/hydrationUtils';

/**
 * Component to test and verify proper hydration
 * This component should not cause any hydration mismatches
 */
export const HydrationTest: React.FC = () => {
  const isClient = useIsClient();
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [randomValue, setRandomValue] = useState<number | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>('');

  useEffect(() => {
    if (isClient) {
      setTimestamp(Date.now());
      setRandomValue(Math.random());
      if (typeof document !== 'undefined') {
        setDocumentTitle(document.title);
      }
    }
  }, [isClient]);

  // During SSR and initial render, show consistent content
  if (!isClient) {
    return (
      <div className="p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Hydration Test</h3>
        <p>Server-side render: Static content</p>
        <p>Timestamp: Loading...</p>
        <p>Random: Loading...</p>
        <p>Document title: Loading...</p>
      </div>
    );
  }

  // Client-side content
  return (
    <div className="p-4 bg-green-100 rounded">
      <h3 className="font-bold">Hydration Test ✅</h3>
      <p>Client-side render: Dynamic content</p>
      <p>Timestamp: {timestamp}</p>
      <p>Random: {randomValue?.toFixed(4)}</p>
      <p>Document title: {documentTitle}</p>
    </div>
  );
};

export default HydrationTest;