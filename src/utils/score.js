/**
 * Pure scoring function to grade a single scenario annotation.
 *
 * @param {Object} scenario - Scenario definition containing scoring rules
 * @param {Object} answers - Candidate's answers { severity, signals, action }
 * @returns {Object} Score record containing points breakdown
 */
export function scoreRound(scenario, answers) {
  const scoring = scenario.scoring;
  const ansSeverity = answers?.severity;
  const ansAction = answers?.action;
  const ansSignals = answers?.signals || [];

  let severityPoints = 0;
  let signalPoints = 0;
  let actionPoints = 0;

  // 1. Severity points (max 1.0)
  if (scoring.severity.correct.includes(ansSeverity)) {
    severityPoints = 1.0;
  } else if (scoring.severity.partial && scoring.severity.partial.includes(ansSeverity)) {
    severityPoints = 0.5;
  }

  // 2. Action points (max 1.0)
  if (scoring.action.correct.includes(ansAction)) {
    actionPoints = 1.0;
  } else if (scoring.action.partial && scoring.action.partial.includes(ansAction)) {
    actionPoints = 0.5;
  }

  // 3. Signals points (max 1.0)
  const requiredSignals = scoring.signals.required || [];
  const partialSignals = scoring.signals.partial || [];

  if (requiredSignals.length === 0) {
    if (ansSignals.length === 0 || ansSignals.includes('none-detected')) {
      signalPoints = 1.0;
    } else {
      signalPoints = 0.5;
    }
  } else {
    const matchedRequired = requiredSignals.filter(r => ansSignals.includes(r)).length;
    if (matchedRequired === requiredSignals.length) {
      signalPoints = 1.0;
    } else if (partialSignals.length > 0 && partialSignals.some(p => ansSignals.includes(p))) {
      signalPoints = 0.5;
    }
  }

  const points = severityPoints + signalPoints + actionPoints;

  return {
    severityPoints,
    signalPoints,
    actionPoints,
    points,
    maxPoints: 3.0
  };
}

/**
 * Calculates display score and performance band.
 * Band classification uses the raw (unrounded) percentage, while display score is rounded.
 *
 * @param {number} totalPoints - Sum of all scenario scores
 * @param {number} maxPoints - Maximum possible points (default 30)
 * @returns {Object} { displayScore, band }
 */
export function calculateOverallResults(totalPoints, maxPoints = 30) {
  const rawPercentage = (totalPoints / maxPoints) * 100;
  const displayScore = Math.round(rawPercentage);

  let band = 'Foundation';
  if (rawPercentage >= 80) {
    band = 'Advanced';
  } else if (rawPercentage >= 60) {
    band = 'Proficient';
  }

  return {
    displayScore,
    band,
    rawPercentage
  };
}
