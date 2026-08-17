import { useEffect, useRef } from 'react';

export function useIntegrityMonitoring(attemptId, currentQuestionId, silentLog) {
  const blurTimeRef = useRef(null);
  const qIdRef = useRef(currentQuestionId);

  useEffect(() => {
    qIdRef.current = currentQuestionId;
  }, [currentQuestionId]);

  // INTEG-01: Tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        blurTimeRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        if (blurTimeRef.current !== null) {
          const durationMs = Date.now() - blurTimeRef.current;
          blurTimeRef.current = null;
          silentLog('tab_switch', {
            questionId: qIdRef.current,
            durationMs,
            description: `Candidate switched tab / window hidden for ${Math.round(durationMs / 1000)} seconds`
          });
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [silentLog]);

  // INTEG-02: Copy-paste blocked + logged
  useEffect(() => {
    const handleCopyPaste = (e) => {
      e.preventDefault();
      silentLog('copy_paste', {
        eventType: e.type,
        questionId: qIdRef.current,
        description: `Candidate attempted to ${e.type} content`
      });
    };
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [silentLog]);

  // INTEG-03: DevTools heuristic
  useEffect(() => {
    const threshold = 160;
    const checkDevTools = () => {
      const isDevToolsOpen =
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;
      if (isDevToolsOpen) {
        silentLog('devtools_check', { description: 'Developer tools opening detected' });
      }
    };
    window.addEventListener('resize', checkDevTools);
    const interval = setInterval(checkDevTools, 4000);
    return () => {
      window.removeEventListener('resize', checkDevTools);
      clearInterval(interval);
    };
  }, [silentLog]);

  // INTEG-04: Fullscreen exit
  useEffect(() => {
    const handleFullscreenExit = () => {
      if (!document.fullscreenElement) {
        silentLog('fullscreen_exit', { description: 'Candidate exited fullscreen mode' });
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenExit);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenExit);
  }, [silentLog]);
}
