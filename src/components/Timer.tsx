import React, { useState, useEffect } from 'react';

export function useTimer(isActive: boolean) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return seconds;
}

interface TimerProps {
  seconds: number;
}

const Timer: React.FC<TimerProps> = ({ seconds }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <time
      dateTime={`PT${mins}M${secs}S`}
      aria-label={`Timer: ${mins} minutes and ${secs} seconds`}
      className="font-mono"
    >
      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </time>
  );
};

export default React.memo(Timer);
