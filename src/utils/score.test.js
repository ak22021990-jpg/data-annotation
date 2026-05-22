import { describe, it, expect } from 'vitest';
import { scoreRound, calculateOverallResults } from './score.js';

// Mock scenarios for scoring tests
const mockScenario1 = {
  id: 1,
  title: "Mock Apple ID phishing",
  scoring: {
    severity: { correct: ["high"], partial: ["medium"] },
    signals: { required: ["urgency", "spoofed-sender", "fake-domain"], partial: ["fake-domain", "urgency"] },
    action: { correct: ["remove"], partial: ["filter"] }
  }
};

const mockScenarioWithNoRequiredSignals = {
  id: 3,
  title: "Mock Deals spam",
  scoring: {
    severity: { correct: ["low"], partial: ["medium"] },
    signals: { required: [], partial: [] },
    action: { correct: ["filter"], partial: ["remove"] }
  }
};

describe('scoreRound', () => {
  it('awards perfect score (3.0 points) when all inputs are exactly correct', () => {
    const answers = {
      severity: 'high',
      signals: ['urgency', 'spoofed-sender', 'fake-domain'],
      action: 'remove'
    };
    const result = scoreRound(mockScenario1, answers);
    expect(result.severityPoints).toBe(1.0);
    expect(result.signalPoints).toBe(1.0);
    expect(result.actionPoints).toBe(1.0);
    expect(result.points).toBe(3.0);
  });

  it('awards partial credit (0.5) for severity and action when partial inputs match', () => {
    const answers = {
      severity: 'medium', // partial match
      signals: ['urgency', 'spoofed-sender', 'fake-domain'], // correct
      action: 'filter' // partial match
    };
    const result = scoreRound(mockScenario1, answers);
    expect(result.severityPoints).toBe(0.5);
    expect(result.signalPoints).toBe(1.0);
    expect(result.actionPoints).toBe(0.5);
    expect(result.points).toBe(2.0);
  });

  it('awards partial credit (0.5) for signals when at least one partial signal matches', () => {
    const answers = {
      severity: 'high', // correct
      signals: ['urgency'], // only 1 required, but matches partial
      action: 'remove' // correct
    };
    const result = scoreRound(mockScenario1, answers);
    expect(result.severityPoints).toBe(1.0);
    expect(result.signalPoints).toBe(0.5);
    expect(result.actionPoints).toBe(1.0);
    expect(result.points).toBe(2.5);
  });

  it('awards zero points for fields that do not match correct or partial keys', () => {
    const answers = {
      severity: 'not-abusive', // incorrect
      signals: ['malware-link'], // incorrect, no overlap
      action: 'no-action' // incorrect
    };
    const result = scoreRound(mockScenario1, answers);
    expect(result.severityPoints).toBe(0.0);
    expect(result.signalPoints).toBe(0.0);
    expect(result.actionPoints).toBe(0.0);
    expect(result.points).toBe(0.0);
  });

  it('handles scenarios with no required signals correctly', () => {
    // Correct behavior: 1.0 signal point when selecting nothing or none-detected
    const answersEmpty = {
      severity: 'low',
      signals: [],
      action: 'filter'
    };
    const resultEmpty = scoreRound(mockScenarioWithNoRequiredSignals, answersEmpty);
    expect(resultEmpty.signalPoints).toBe(1.0);

    const answersNoneDetected = {
      severity: 'low',
      signals: ['none-detected'],
      action: 'filter'
    };
    const resultNoneDetected = scoreRound(mockScenarioWithNoRequiredSignals, answersNoneDetected);
    expect(resultNoneDetected.signalPoints).toBe(1.0);

    // 0.5 points when selecting any other signals
    const answersWithOtherSignal = {
      severity: 'low',
      signals: ['spoofed-sender'],
      action: 'filter'
    };
    const resultWithOtherSignal = scoreRound(mockScenarioWithNoRequiredSignals, answersWithOtherSignal);
    expect(resultWithOtherSignal.signalPoints).toBe(0.5);
  });
});

describe('calculateOverallResults', () => {
  it('correctly rounds the display score', () => {
    expect(calculateOverallResults(24).displayScore).toBe(80);
    expect(calculateOverallResults(17.9).displayScore).toBe(60); // Math.round(59.67) = 60
    expect(calculateOverallResults(18).displayScore).toBe(60);
  });

  it('classifies band based on unrounded raw percentage', () => {
    // 24/30 = 80% => Advanced
    const results1 = calculateOverallResults(24);
    expect(results1.band).toBe('Advanced');

    // 18/30 = 60% => Proficient
    const results2 = calculateOverallResults(18);
    expect(results2.band).toBe('Proficient');

    // 17.9/30 = 59.67% => Foundation (rounds to 60 display score, but unrounded is 59.67% < 60%)
    const results3 = calculateOverallResults(17.9);
    expect(results3.band).toBe('Foundation');
  });
});
