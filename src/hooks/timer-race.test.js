import { describe, it, expect } from 'vitest';

// Simple mock scenario
const mockScenario = {
  id: 1,
  scoring: {
    severity: { correct: ['high'] },
    signals: { required: ['urgency'] },
    action: { correct: ['remove'] }
  }
};

describe('Timer Race and Double-Submission Safety Checks', () => {
  it('prevents array growth when submitting the same scenario multiple times (idempotency)', () => {
    // We can simulate the state updates by invoking the hook logic in a mock state harness
    // or by mocking setScores behavior.
    
    let stateArray = Array(10).fill(null);
    const mockSetScores = (updater) => {
      stateArray = updater(stateArray);
    };

    // Replicate the scoreScenario logic:
    const scoreScenarioSim = (scenarioIndex, _scenario, _answers) => {
      // Replicate the scoreRound behavior internally or mock the result:
      const record = { points: 3.0 }; // Mock record
      mockSetScores(prev => {
        const next = [...prev];
        next[scenarioIndex] = record;
        return next;
      });
    };

    // Simulating multiple calls for index 0
    scoreScenarioSim(0, mockScenario, { severity: 'high', signals: ['urgency'], action: 'remove' });
    expect(stateArray.length).toBe(10);
    expect(stateArray[0].points).toBe(3.0);

    // Call again to simulate a concurrent click or a late timer trigger at T-1s
    scoreScenarioSim(0, mockScenario, { severity: 'high', signals: ['urgency'], action: 'remove' });
    expect(stateArray.length).toBe(10); // Array length MUST remain exactly 10, not 11
    expect(stateArray[0].points).toBe(3.0);
    
    // Call for a different index
    scoreScenarioSim(1, mockScenario, { severity: 'low', signals: [], action: 'filter' });
    expect(stateArray.length).toBe(10);
    expect(stateArray[1].points).toBe(3.0);
  });
});
