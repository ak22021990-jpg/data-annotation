import { useState, useCallback } from 'react';
import { useScoring } from './useScoring.js';
import { useProctoring } from './useProctoring.js';
import { registerCandidate } from '../utils/api.js';

export const SCREENS = {
  REGISTER: 'REGISTER',
  TUTORIAL: 'TUTORIAL',
  ANNOTATE: 'ANNOTATE',
  FEEDBACK: 'FEEDBACK',
  SUBMITTING: 'SUBMITTING',
  RESULTS: 'RESULTS',
  REVIEWER: 'REVIEWER'
};

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const rand = new Uint32Array(1);
    crypto.getRandomValues(rand);
    const j = Math.floor((rand[0] / 0x100000000) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useAnnotationState(scenarios, options = {}) {
  const { onFinished } = options;
  const [screen, setScreen] = useState(SCREENS.REGISTER);
  const [candidate, setCandidate] = useState({ name: '', email: '' });
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [shuffledScenarios, setShuffledScenarios] = useState(() => shuffleArray(scenarios));
  const [answersList, setAnswersList] = useState(() => Array(scenarios.length).fill(null));
  const [proctorActive, setProctorActive] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [_elapsedSeconds, setElapsedSeconds] = useState(0);

  const [currentSeverity, setCurrentSeverity] = useState(null);
  const [currentSignals, setCurrentSignals] = useState([]);
  const [currentAction, setCurrentAction] = useState(null);

  const [integrityLog, setIntegrityLog] = useState([]);

  const scoring = useScoring(scenarios.length);
  const { violations: proctoringViolations, switchedAway, reset: resetProctoring } = useProctoring({ active: proctorActive });

  const incrementViolation = useCallback((entry) => {
    setIntegrityLog(prev => [...prev, entry]);
  }, []);

  const register = useCallback((name, email) => {
    setCandidate({ name, email });
    registerCandidate(name, email);
    setScreen(SCREENS.TUTORIAL);
  }, []);

  const startTest = useCallback(() => {
    setShuffledScenarios(shuffleArray(scenarios));
    setScenarioIndex(0);
    setCurrentSeverity(null);
    setCurrentSignals([]);
    setCurrentAction(null);
    setScreen(SCREENS.ANNOTATE);
    setProctorActive(true);
    setTestStartTime(Date.now());
  }, [scenarios]);

  const submitAnnotation = useCallback((autoSubmittedAnswers = null) => {
    const severity = autoSubmittedAnswers ? autoSubmittedAnswers.severity : currentSeverity;
    const signals = autoSubmittedAnswers ? autoSubmittedAnswers.signals : currentSignals;
    const action = autoSubmittedAnswers ? autoSubmittedAnswers.action : currentAction;

    const answers = { severity, signals, action };
    const record = scoring.scoreScenario(scenarioIndex, shuffledScenarios[scenarioIndex], answers);

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

  const nextScenario = useCallback(async () => {
    if (scenarioIndex < shuffledScenarios.length - 1) {
      setScenarioIndex(prev => prev + 1);
      setCurrentSeverity(null);
      setCurrentSignals([]);
      setCurrentAction(null);
      setScreen(SCREENS.ANNOTATE);
    } else {
      setProctorActive(false);
      const elapsed = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 0;
      setElapsedSeconds(elapsed);
      setScreen(SCREENS.SUBMITTING);
      if (onFinished) {
        const timeout = new Promise(resolve => setTimeout(resolve, 15000));
        try {
          await Promise.race([
            onFinished({
              candidate,
              answers: answersList,
              scores: scoring.scores,
              totalPoints: scoring.totalPoints,
              displayScore: scoring.displayScore,
              band: scoring.band,
              violations: proctoringViolations,
              integrityLog,
              scenarios: shuffledScenarios,
              elapsedSeconds: elapsed,
            }),
            timeout,
          ]);
        } catch (e) {
          console.error('Submission error');
        }
      }
      setScreen(SCREENS.RESULTS);
    }
  }, [scenarioIndex, shuffledScenarios, candidate, answersList, scoring, onFinished, proctoringViolations, integrityLog, testStartTime]);

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
    setShuffledScenarios(shuffleArray(scenarios));
    setAnswersList(Array(scenarios.length).fill(null));
    setCurrentSeverity(null);
    setCurrentSignals([]);
    setCurrentAction(null);
    setProctorActive(false);
    setTestStartTime(null);
    setElapsedSeconds(0);
    setIntegrityLog([]);
    scoring.resetScores();
    resetProctoring();
  }, [scenarios, scoring, resetProctoring]);

  return {
    screen,
    setScreen,
    candidate,
    scenarioIndex,
    shuffledScenarios,
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
    violations: proctoringViolations,
    integrityLog,
    incrementViolation,
    switchedAway,
    ...scoring
  };
}
