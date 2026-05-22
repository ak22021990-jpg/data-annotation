import { describe, it, expect } from 'vitest';
import scenarios from '../data/scenarios.js';
import { scoreRound } from './score.js';

describe('Exhaustive Score Verification for All 10 Scenarios', () => {
  scenarios.forEach((scenario, index) => {
    const scNumber = index + 1;

    describe(`Scenario #${scNumber}: ${scenario.title}`, () => {
      
      it('awards perfect score (3.0 points) for correct answers', () => {
        // Construct perfect answers from scenario.answer (which contains the correct responses)
        const perfectAnswers = {
          severity: scenario.answer.severity,
          signals: scenario.answer.signals,
          action: scenario.answer.action
        };
        const result = scoreRound(scenario, perfectAnswers);
        expect(result.points).toBe(3.0);
        expect(result.severityPoints).toBe(1.0);
        expect(result.signalPoints).toBe(1.0);
        expect(result.actionPoints).toBe(1.0);
      });

      it('awards partial credit when matching partial criteria', () => {
        // Find a partial severity or action option to test
        const partialSeverity = scenario.scoring.severity.partial?.[0] || 'medium';
        const partialAction = scenario.scoring.action.partial?.[0] || 'filter';

        // Select partial options where possible, otherwise use correct to isolate partial signals
        const partialAnswers = {
          severity: scenario.scoring.severity.partial?.length > 0 ? partialSeverity : scenario.answer.severity,
          signals: scenario.scoring.signals.partial?.length > 0 ? [scenario.scoring.signals.partial[0]] : scenario.answer.signals,
          action: scenario.scoring.action.partial?.length > 0 ? partialAction : scenario.answer.action
        };

        const result = scoreRound(scenario, partialAnswers);
        
        // It must earn some points but less than 3.0
        expect(result.points).toBeGreaterThan(0.0);
        expect(result.points).toBeLessThan(3.0);
      });

      it('awards zero points for completely wrong answers', () => {
        const wrongAnswers = {
          severity: 'wrong-severity-value',
          signals: ['wrong-signal-1', 'wrong-signal-2'],
          action: 'wrong-action-value'
        };
        const result = scoreRound(scenario, wrongAnswers);
        
        // If there are no required signals (like in Scenarios 3, 5, 6, 8, 10),
        // selecting a wrong signal will award 0.5 points instead of 1.0 (empty or none-detected is 1.0).
        // Let's handle this edge case in our assertions.
        if (scenario.scoring.signals.required.length === 0) {
          expect(result.severityPoints).toBe(0.0);
          expect(result.signalPoints).toBe(0.5);
          expect(result.actionPoints).toBe(0.0);
          expect(result.points).toBe(0.5);
        } else {
          expect(result.severityPoints).toBe(0.0);
          expect(result.signalPoints).toBe(0.0);
          expect(result.actionPoints).toBe(0.0);
          expect(result.points).toBe(0.0);
        }
      });

      it('handles empty submission (expired timer) correctly', () => {
        const emptyAnswers = {
          severity: null,
          signals: [],
          action: null
        };
        const result = scoreRound(scenario, emptyAnswers);

        expect(result.severityPoints).toBe(0.0);
        expect(result.actionPoints).toBe(0.0);

        // For signals, if required is empty, selecting empty/none-detected gives 1.0 points
        if (scenario.scoring.signals.required.length === 0) {
          expect(result.signalPoints).toBe(1.0);
          expect(result.points).toBe(1.0);
        } else {
          expect(result.signalPoints).toBe(0.0);
          expect(result.points).toBe(0.0);
        }
      });

    });
  });
});
