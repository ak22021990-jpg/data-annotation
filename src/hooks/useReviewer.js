import { useState, useCallback } from 'react';
import { fetchReviewerResults } from '../utils/api.js';

const VALID_PASSCODE = 'apple-reviewer-2026';

export function useReviewer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePasscode, setActivePasscode] = useState('');

  const authenticate = useCallback((passcode) => {
    setError(null);
    if (passcode === VALID_PASSCODE) {
      setIsAuthenticated(true);
      setActivePasscode(passcode);
      return true;
    } else {
      setError('Invalid passcode. Access denied.');
      return false;
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    if (!isAuthenticated && !activePasscode) {
      setError('Unauthorized');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviewerResults(activePasscode || VALID_PASSCODE);
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch candidate results.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activePasscode]);

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
