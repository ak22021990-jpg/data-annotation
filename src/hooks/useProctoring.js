import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to monitor candidate integrity by tracking tab switches (visibility change)
 * and window focus loss (blur events).
 */
export function useProctoring() {
  const [violations, setViolations] = useState(0);
  const isTracking = useRef(false);

  const handleViolation = useCallback(() => {
    if (isTracking.current) {
      setViolations(prev => prev + 1);
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!isTracking.current) {
      isTracking.current = true;
      window.addEventListener('visibilitychange', handleViolation);
      window.addEventListener('blur', handleViolation);
    }
  }, [handleViolation]);

  const stopTracking = useCallback(() => {
    if (isTracking.current) {
      isTracking.current = false;
      window.removeEventListener('visibilitychange', handleViolation);
      window.removeEventListener('blur', handleViolation);
    }
  }, [handleViolation]);

  const resetViolations = useCallback(() => {
    setViolations(0);
  }, []);

  // Ensure clean up of event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('visibilitychange', handleViolation);
      window.removeEventListener('blur', handleViolation);
    };
  }, [handleViolation]);

  return {
    violations,
    startTracking,
    stopTracking,
    resetViolations
  };
}
