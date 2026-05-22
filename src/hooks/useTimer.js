import { useState, useEffect, useRef } from 'react';

/**
 * useTimer - Countdown timer hook.
 *
 * NOTE: To reset this timer, use a React 'key' attribute on the component
 * rendering it, which resets the state cleanly without effect-synchronization.
 *
 * @param {number} durationSeconds - Countdown starting time in seconds
 * @param {Function} onExpire - Callback executed exactly once when timer reaches 0
 * @returns {Object} { timeRemaining, isExpired, reset }
 */
export function useTimer(durationSeconds, onExpire) {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  // Keep callback ref updated
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeRemaining]);

  const reset = () => {
    setTimeRemaining(durationSeconds);
    hasExpiredRef.current = false;
  };

  return {
    timeRemaining,
    isExpired: timeRemaining <= 0,
    reset
  };
}
