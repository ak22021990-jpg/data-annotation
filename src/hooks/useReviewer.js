import { useState, useCallback } from 'react';
import { fetchReviewerResults } from '../utils/api.js';
import { GAS_URL } from '../config/config.js';

export function useReviewer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePasscode, setActivePasscode] = useState('');

  const authenticate = useCallback(async (passcode) => {
    setError(null);

    if (!passcode) {
      setError('Please enter a passcode.');
      return false;
    }

    // Local-only mode (no backend)
    if (!GAS_URL) {
      setActivePasscode(passcode);
      setIsAuthenticated(true);
      return true;
    }

    // Validate against backend before granting access
    setLoading(true);
    try {
      const data = await fetchReviewerResults(passcode);
      setActivePasscode(passcode);
      setCandidates(data || []);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Authentication failed:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('passcode') || msg.toLowerCase().includes('authentication')) {
        setError('Invalid passcode. Access denied.');
      } else {
        setError('Failed to connect to the server. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    if (!activePasscode && GAS_URL) {
      setError('Unauthorized -- enter a passcode to fetch submissions.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviewerResults(activePasscode);
      setCandidates(data || []);
    } catch (err) {
      console.error('Fetch candidates error:', err);
      // Surface the specific error from the backend when available
      const msg = err.message || 'Failed to fetch candidate results.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activePasscode]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCandidates([]);
    setError(null);
    setActivePasscode('');
  }, []);

  return {
    isAuthenticated,
    candidates,
    loading,
    error,
    authenticate,
    fetchCandidates,
    logout
  };
}
