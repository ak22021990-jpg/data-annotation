import { GAS_URL } from '../config/config.js';

function safeguardSubmission(payload) {
  try {
    const key = `abuse_test_submission_${payload.email}`;
    localStorage.setItem(key, JSON.stringify(payload));
    localStorage.setItem('abuse_test_last_email', payload.email);
  } catch (e) {
    console.error('Failed to write to localStorage safeguard:', e);
  }
}

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
 * Registers the candidate at the start of the assessment.
 * Creates an "In Progress" row in the Summary sheet.
 */
export async function registerCandidate(name, email) {
  if (!GAS_URL) return { success: true, backend: 'LocalOnly' };

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', name, email }),
    });
    return { success: true, backend: 'GAS' };
  } catch (error) {
    console.error('Register failed:', error);
    return { success: true, backend: 'LocalOnly' };
  }
}

/**
 * Checks if an email has already been used for the assessment.
 */
export async function checkEmail(email) {
  if (!GAS_URL) return { exists: false };

  try {
    const response = await fetch(`${GAS_URL}?checkEmail=${encodeURIComponent(email)}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('checkEmail failed:', error);
  }
  return { exists: false };
}

/**
 * Builds per-scenario payload from answers, scores, and scenario definitions.
 */
function buildPerScenarioData(scenarios, answersList, scores) {
  return scenarios.map((sc, idx) => {
    const ans = answersList[idx] || {};
    const score = scores[idx] || {};
    return {
      scenarioId: sc.id,
      scenarioTitle: sc.title || `Scenario ${sc.id}`,
      selectedSeverity: ans.severity || '',
      correctSeverity: (sc.scoring.severity.correct || []).join(', '),
      severityPoints: score.severityPoints || 0,
      selectedSignals: (ans.signals || []).join(', '),
      requiredSignals: (sc.scoring.signals.required || []).join(', '),
      signalPoints: score.signalPoints || 0,
      selectedAction: ans.action || '',
      correctAction: (sc.scoring.action.correct || []).join(', '),
      actionPoints: score.actionPoints || 0,
      totalPoints: score.points || 0,
    };
  });
}

/**
 * Submits the completed test results and triggers email notification to reviewers.
 *
 * @param {Object} params
 * @param {Object} params.candidate - { name, email }
 * @param {Array} params.answers - Array of 10 answer objects
 * @param {Array} params.scores - Array of 10 score records
 * @param {number} params.totalPoints - Raw points total (out of 30)
 * @param {number} params.displayScore - Rounded percentage
 * @param {string} params.band - 'Advanced', 'Proficient', 'Foundation'
 * @param {number} params.violations - Proctoring violation count
 * @param {Array} params.scenarios - Scenario definitions (for building per-scenario data)
 * @returns {Promise<Object>}
 */
export async function submitResults({ candidate, answers, scores, totalPoints, displayScore, band, violations, scenarios }) {
  let sevCorrect = 0, actCorrect = 0, sigPoints = 0;
  scenarios.forEach((sc, idx) => {
    const ans = answers[idx];
    if (ans) {
      if (sc.scoring.severity.correct.includes(ans.severity)) sevCorrect++;
      if (sc.scoring.action.correct.includes(ans.action)) actCorrect++;
    }
    if (scores[idx]) sigPoints += scores[idx].signalPoints || 0;
  });

  const severityAcc = Math.round((sevCorrect / scenarios.length) * 100);
  const signalAcc = Math.round((sigPoints / scenarios.length) * 100);
  const actionAcc = Math.round((actCorrect / scenarios.length) * 100);

  const perScenario = buildPerScenarioData(scenarios, answers, scores);

  const payload = {
    timestamp: new Date().toISOString(),
    name: candidate.name,
    email: candidate.email,
    totalPoints,
    displayScore,
    band,
    violations,
    severityAcc,
    signalAcc,
    actionAcc,
    finalScore: displayScore,
    perScenario,
    answers: JSON.stringify(answers),
    scores: JSON.stringify(scores),
  };

  safeguardSubmission(payload);

  if (GAS_URL) {
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submitFinal', ...payload }),
      });
      return { success: true, backend: 'GAS' };
    } catch (error) {
      console.error('GAS submitFinal failed, using local fallback:', error);
    }
  }

  saveLocalLeaderboard({ name: candidate.name, displayScore, band });
  return { success: true, backend: 'LocalFallback' };
}

/**
 * Fetches the leaderboard.
 */
export async function fetchLeaderboard() {
  if (GAS_URL) {
    try {
      const response = await fetch(`${GAS_URL}?action=getLeaderboard`);
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
 */
export async function fetchReviewerResults(passcode) {
  if (GAS_URL) {
    const response = await fetch(`${GAS_URL}?action=getResults&passcode=${encodeURIComponent(passcode)}`);
    if (!response.ok) {
      throw new Error('Authentication failed or server error');
    }
    const data = await response.json();
    if (data.ok === false) throw new Error(data.error || 'Invalid passcode');
    return data.submissions || data;
  }

  const localKeyPrefix = 'abuse_test_submission_';
  const submissions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(localKeyPrefix)) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        submissions.push(item);
      } catch { /* ignore malformed items */ }
    }
  }
  return submissions.sort((a, b) => b.displayScore - a.displayScore);
}
