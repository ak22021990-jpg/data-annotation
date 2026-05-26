import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useProctoring — detect and count discrete tab/window departures during an active round.
 *
 * Replicates flagmail1's double-fire guard: visibilitychange + blur both fire on
 * a single "away" action, but we only count one violation per departure.
 *
 * @param {object} options
 * @param {boolean} options.active - When false, listeners are removed (violations not reset).
 * @returns {{ violations: number, switchedAway: boolean, reset: function }}
 */
export function useProctoring({ active = false } = {}) {
  const [violations, setViolations] = useState(0);
  const [switchedAway, setSwitchedAway] = useState(false);
  const lastHiddenRef = useRef(false);

  useEffect(() => {
    if (!active) {
      return;
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        if (!lastHiddenRef.current) {
          lastHiddenRef.current = true;
          setViolations(v => v + 1);
          setSwitchedAway(true);
        }
      } else {
        lastHiddenRef.current = false;
        setSwitchedAway(false);
      }
    }

    function handleWindowBlur() {
      if (!lastHiddenRef.current) {
        lastHiddenRef.current = true;
        setViolations(v => v + 1);
        setSwitchedAway(true);
      }
    }

    function handleWindowFocus() {
      lastHiddenRef.current = false;
      setSwitchedAway(false);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [active]);

  const reset = useCallback(() => {
    setViolations(0);
    setSwitchedAway(false);
    lastHiddenRef.current = false;
  }, []);

  return { violations, switchedAway, reset };
}
