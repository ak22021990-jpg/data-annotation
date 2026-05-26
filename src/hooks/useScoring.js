import { useState, useCallback } from 'react';
import { scoreRound, calculateOverallResults } from '../utils/score.js';

/**
 * Hook to manage scoring state across all scenarios.
 *
 * @param {number} scenariosCount - Total number of scenarios
 * @returns {Object} Scoring state and scoreScenario setter
 */
export function useScoring(scenariosCount = 10) {
  const [scores, setScores] = useState(() => Array(scenariosCount).fill(null));

  const scoreScenario = useCallback((scenarioIndex, scenario, answers) => {
    const record = scoreRound(scenario, answers);
    setScores(prev => {
      const next = [...prev];
      next[scenarioIndex] = record;
      return next;
    });
    return record;
  }, []);

  const resetScores = useCallback(() => {
    setScores(Array(scenariosCount).fill(null));
  }, [scenariosCount]);

  // Calculate derived overall metrics
  const totalPoints = scores.reduce((sum, record) => sum + (record ? record.points : 0), 0);
  const maxPossiblePoints = scenariosCount * 3;
  const { displayScore, band, rawPercentage } = calculateOverallResults(totalPoints, maxPossiblePoints);

  return {
    scores,
    scoreScenario,
    resetScores,
    totalPoints,
    displayScore,
    band,
    rawPercentage
  };
}
