import { useState, useCallback } from 'react';
import { useScoring } from './useScoring.js';
import { useProctoring } from './useProctoring.js';
import { registerCandidate } from '../utils/api.js';

export const SCREENS = {
  REGISTER: 'REGISTER',
  TUTORIAL: 'TUTORIAL',
  ANNOTATE: 'ANNOTATE',
  FEEDBACK: 'FEEDBACK',
  RESULTS: 'RESULTS',
  REVIEWER: 'REVIEWER'
};

export function useAnnotationState(scenarios, options = {}) {
  const { onFinished } = options;
  const [screen, setScreen] = useState(SCREENS.REGISTER);
  const [candidate, setCandidate] = useState({ name: '', email: '' });
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [answersList, setAnswersList] = useState(() => Array(scenarios.length).fill(null));
  const [proctorActive, setProctorActive] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [_elapsedSeconds, setElapsedSeconds] = useState(0);

  const [currentSeverity, setCurrentSeverity] = useState(null);
  const [currentSignals, setCurrentSignals] = useState([]);
  const [currentAction, setCurrentAction] = useState(null);

  const scoring = useScoring(scenarios.length);
  const { violations, switchedAway, reset: resetProctoring } = useProctoring({ active: proctorActive });

  const register = useCallback((name, email) => {
    setCandidate({ name, email });
    registerCandidate(name, email);
    setScreen(SCREENS.TUTORIAL);
  }, []);

  const startTest = useCallback(() => {
    setScenarioIndex(0);
    setCurrentSeverity(null);
    setCurrentSignals([]);
    setCurrentAction(null);
    setScreen(SCREENS.ANNOTATE);
    setProctorActive(true);
    setTestStartTime(Date.now());
  }, []);

  const submitAnnotation = useCallback((autoSubmittedAnswers = null) => {
    const severity = autoSubmittedAnswers ? autoSubmittedAnswers.severity : currentSeverity;
    const signals = autoSubmittedAnswers ? autoSubmittedAnswers.signals : currentSignals;
    const action = autoSubmittedAnswers ? autoSubmittedAnswers.action : currentAction;

    const answers = { severity, signals, action };
    const record = scoring.scoreScenario(scenarioIndex, scenarios[scenarioIndex], answers);

    let updatedAnswersList;
    setAnswersList(prev => {
      const next = [...prev];
      next[scenarioIndex] = answers;
      updatedAnswersList = next;
      return next;
    });

    setScreen(SCREENS.FEEDBACK);
    return { answers, record, updatedAnswersList };
  }, [scenarioIndex, currentSeverity, currentSignals, currentAction, scenarios, scoring]);

  const nextScenario = useCallback(() => {
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex(prev => prev + 1);
      setCurrentSeverity(null);
      setCurrentSignals([]);
      setCurrentAction(null);
      setScreen(SCREENS.ANNOTATE);
    } else {
      setProctorActive(false);
      const elapsed = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 0;
      setElapsedSeconds(elapsed);
      setScreen(SCREENS.RESULTS);
      if (onFinished) {
        onFinished({
          candidate,
          answers: answersList,
          scores: scoring.scores,
          totalPoints: scoring.totalPoints,
          displayScore: scoring.displayScore,
          band: scoring.band,
          violations,
          scenarios,
          elapsedSeconds: elapsed,
        });
      }
    }
  }, [scenarioIndex, scenarios, candidate, answersList, scoring, onFinished, violations, testStartTime]);

  const toggleSignal = useCallback((signalId) => {
    setCurrentSignals(prev => {
      if (signalId === 'none-detected') {
        return prev.includes('none-detected') ? [] : ['none-detected'];
      } else {
        const next = prev.filter(s => s !== 'none-detected');
        if (next.includes(signalId)) {
          return next.filter(s => s !== signalId);
        } else {
          return [...next, signalId];
        }
      }
    });
  }, []);

  const resetAll = useCallback(() => {
    setScreen(SCREENS.REGISTER);
    setCandidate({ name: '', email: '' });
    setScenarioIndex(0);
    setAnswersList(Array(scenarios.length).fill(null));
    setCurrentSeverity(null);
    setCurrentSignals([]);
    setCurrentAction(null);
    setProctorActive(false);
    setTestStartTime(null);
    setElapsedSeconds(0);
    scoring.resetScores();
    resetProctoring();
  }, [scenarios.length, scoring, resetProctoring]);

  return {
    screen,
    setScreen,
    candidate,
    scenarioIndex,
    currentSeverity,
    currentSignals,
    currentAction,
    setCurrentSeverity,
    setCurrentAction,
    toggleSignal,
    answersList,
    register,
    startTest,
    submitAnnotation,
    nextScenario,
    resetAll,
    violations,
    switchedAway,
    ...scoring
  };
}
