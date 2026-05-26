/**
 * Badge definitions for the annotation test.
 */
export const BADGES = [
  {
    id: 'perfect-score',
    title: 'Eagle Eye',
    description: 'Scored a perfect 30/30 points on the assessment.',
    icon: '🦅',
    color: '#D4AF37' // Gold
  },
  {
    id: 'high-accuracy',
    title: 'Master Annotator',
    description: 'Scored 24 or more points (80%+).',
    icon: '🛡️',
    color: '#C0C0C0' // Silver
  },
  {
    id: 'speed-demon',
    title: 'Rapid Response',
    description: 'Completed the test with plenty of time remaining.',
    icon: '⚡',
    color: '#E0115F' // Ruby/Pink-Red
  },
  {
    id: 'clean-sheet',
    title: 'Action Specialist',
    description: 'Recommended correct actions across all 10 scenarios.',
    icon: '🎯',
    color: '#4B9CD3' // Steel Blue
  }
];

/**
 * Calculates which badges are unlocked.
 *
 * @param {Object} results - { scores, totalPoints, elapsedSeconds }
 * @returns {Array} Unlocked badge objects
 */
export function checkBadges({ scores, totalPoints, elapsedSeconds }) {
  const unlocked = [];

  if (!scores || scores.length === 0) return unlocked;

  // 1. Perfect Score
  if (totalPoints === 30) {
    const perfectBadge = BADGES.find(b => b.id === 'perfect-score');
    if (perfectBadge) unlocked.push(perfectBadge);
  }

  // 2. High Accuracy (>= 80% or >= 24 points)
  if (totalPoints >= 24) {
    const accuracyBadge = BADGES.find(b => b.id === 'high-accuracy');
    if (accuracyBadge) unlocked.push(accuracyBadge);
  }

  // 3. Speed Demon (finished in under 60% of total time — < 720s for 10×2min)
  const totalAvailable = scores.length * 120;
  if (elapsedSeconds != null && elapsedSeconds < totalAvailable * 0.6) {
    const speedBadge = BADGES.find(b => b.id === 'speed-demon');
    if (speedBadge) unlocked.push(speedBadge);
  }

  // 4. Action Specialist (Action points = 1.0 for all scenarios)
  const allActionsCorrect = scores.every(s => s && s.actionPoints === 1.0);
  if (allActionsCorrect) {
    const actionBadge = BADGES.find(b => b.id === 'clean-sheet');
    if (actionBadge) unlocked.push(actionBadge);
  }

  return unlocked;
}
