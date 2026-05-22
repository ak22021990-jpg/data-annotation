// Google Apps Script Web App URL (empty by default, can be set as needed)
export const BACKEND_URL = '';

/**
 * Saves candidate results to localStorage as a safeguard.
 */
function safeguardSubmission(payload) {
  try {
    const key = `abuse_test_submission_${payload.email}`;
    localStorage.setItem(key, JSON.stringify(payload));
    localStorage.setItem('abuse_test_last_email', payload.email);
  } catch (e) {
    console.error('Failed to write to localStorage safeguard:', e);
  }
}

/**
 * Mock local leaderboard handler.
 */
function getLocalLeaderboard() {
  try {
    const data = localStorage.getItem('abuse_test_leaderboard');
    return data ? JSON.parse(data) : [
      { name: 'Alex Rivera', displayScore: 93, band: 'Advanced' },
      { name: 'Taylor Chen', displayScore: 87, band: 'Advanced' },
      { name: 'Jordan Patel', displayScore: 73, band: 'Proficient' },
      { name: 'Morgan Vance', displayScore: 63, band: 'Proficient' },
      { name: 'Casey Smith', displayScore: 50, band: 'Foundation' }
    ];
  } catch {
    return [];
  }
}

function saveLocalLeaderboard(entry) {
  try {
    const current = getLocalLeaderboard();
    const updated = [...current, entry].sort((a, b) => b.displayScore - a.displayScore);
    localStorage.setItem('abuse_test_leaderboard', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update local leaderboard:', e);
  }
}

/**
 * Submits the completed test results.
 *
 * @param {Object} candidate - { name, email }
 * @param {Array} answers - Array of 10 answer objects
 * @param {Array} scores - Array of 10 score records
 * @param {number} totalPoints - Raw points total (out of 30)
 * @param {number} displayScore - Rounded percentage
 * @param {string} band - 'Advanced', 'Proficient', 'Foundation'
 * @param {number} violations - Proctoring tab-switch violation count
 * @returns {Promise<Object>} Response confirmation
 */
export async function submitResults({ candidate, answers, scores, totalPoints, displayScore, band, violations }) {
  const payload = {
    timestamp: new Date().toISOString(),
    name: candidate.name,
    email: candidate.email,
    totalPoints,
    displayScore,
    band,
    violations,
    answers: JSON.stringify(answers),
    scores: JSON.stringify(scores)
  };

  // 1. Write to localStorage safeguard first
  safeguardSubmission(payload);

  // 2. Post to backend if URL configured
  if (BACKEND_URL) {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        mode: 'no-cors', // Standard GAS web app POST config
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'submit',
          ...payload
        })
      });

      return { success: true, backend: 'GAS', response };
    } catch (error) {
      console.error('GAS backend post failed, using local fallback:', error);
    }
  }

  // 3. Fallback to localStorage leaderboard update
  saveLocalLeaderboard({
    name: candidate.name,
    displayScore,
    band
  });

  return { success: true, backend: 'LocalFallback' };
}

/**
 * Fetches the leaderboard.
 *
 * @returns {Promise<Array>} List of scores
 */
export async function fetchLeaderboard() {
  if (BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}?action=getLeaderboard`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('GAS leaderboard fetch failed, using local fallback:', error);
    }
  }

  return getLocalLeaderboard();
}

/**
 * Reviewer helper to fetch all submissions (gated by passcode).
 *
 * @param {string} passcode - The shared reviewer passcode
 * @returns {Promise<Array>} List of all candidates and details
 */
export async function fetchReviewerResults(passcode) {
  if (BACKEND_URL) {
    const response = await fetch(`${BACKEND_URL}?action=getResults&passcode=${encodeURIComponent(passcode)}`);
    if (!response.ok) {
      throw new Error('Authentication failed or server error');
    }
    return await response.json();
  }

  // Local mock submissions list for reviewer
  const localKeyPrefix = 'abuse_test_submission_';
  const submissions = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(localKeyPrefix)) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        submissions.push(item);
      } catch {
        // ignore malformed items
      }
    }
  }

  // Return a sorted list
  return submissions.sort((a, b) => b.displayScore - a.displayScore);
}
