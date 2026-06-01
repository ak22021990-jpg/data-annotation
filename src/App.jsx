import { useCallback, useEffect } from 'react';
import scenarios from './data/scenarios.js';
import { useAnnotationState, SCREENS } from './hooks/useAnnotationState.js';
import RegisterScreen from './components/RegisterScreen.jsx';
import TutorialScreen from './components/TutorialScreen.jsx';
import EmailDisplay from './components/EmailDisplay.jsx';
import AnnotationForm from './components/AnnotationForm.jsx';
import FeedbackScreen from './components/FeedbackScreen.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import ReviewerScreen from './components/ReviewerScreen.jsx';
import Timer from './components/Timer.jsx';
import { submitResults, submitViaBeacon, retryPendingSubmission } from './utils/api.js';
import { surface } from './styles/tokens.js';
import './App.css';

// Progress/timer top-bar card — mirrors flagmail1 RoundHeader surface
function AnnotateHeader({ scenarioIndex, total, durationSeconds, onExpire }) {
  const progress = ((scenarioIndex + 1) / total) * 100;

  return (
    <div style={{
      ...surface,
      borderRadius: 30,
      padding: '16px 22px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 20,
        alignItems: 'center',
      }}>
        {/* Left: title + progress */}
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: '#111827',
            }}>
              Email Abuse Annotation
            </span>
            <span style={{
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(10,132,255,0.10)', color: '#0A84FF',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            }}>
              Scenario {scenarioIndex + 1} of {total}
            </span>
          </div>
          {/* Progress track */}
          <div style={{
            padding: '10px 14px', borderRadius: 22,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(245,248,252,0.92) 100%)',
            border: '1px solid rgba(13,26,51,0.06)',
          }}>
            <div style={{
              height: 6, borderRadius: 999,
              background: 'rgba(17,24,39,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0A84FF, #30B0C7)',
                borderRadius: 999,
                transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(17,24,39,0.48)' }}>Progress</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(17,24,39,0.58)' }}>
                {scenarioIndex + 1}/{total} complete
              </span>
            </div>
          </div>
        </div>

        {/* Right: timer card */}
        <div style={{
          padding: '14px 18px', borderRadius: 22, minWidth: 120,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(245,248,252,0.92) 100%)',
          border: '1px solid rgba(13,26,51,0.06)',
          display: 'grid', gap: 6,
        }}>
          <div style={{ fontSize: 11, color: 'rgba(17,24,39,0.48)', fontWeight: 500 }}>Time remaining</div>
          <Timer key={scenarioIndex} durationSeconds={durationSeconds} onExpire={onExpire} />
        </div>
      </div>
    </div>
  );
}

/**
 * App - Main router for the Email Abuse Annotation Test.
 */
function App() {
  const handleFinished = useCallback(async ({ candidate, answers, scores, totalPoints, displayScore, band, violations, scenarios: scenarioList, elapsedSeconds }) => {
    return submitResults({
      candidate, answers, scores, totalPoints, displayScore, band, violations, scenarios: scenarioList, elapsedSeconds
    });
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => {
      if (localStorage.getItem('abuse_test_pending')) {
        submitViaBeacon();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => { retryPendingSubmission(); }, []);

  const state = useAnnotationState(scenarios, { onFinished: handleFinished });
  const {
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
    scores,
    totalPoints,
    displayScore,
    band,
  } = state;

  const currentScenario = shuffledScenarios[scenarioIndex];
  const submitDisabled = !currentSeverity || !currentAction;

  const handleTimerExpire = () => { submitAnnotation(); };
  const handleReviewerAccess = () => { setScreen(SCREENS.REVIEWER); };
  const handleReviewerBack = () => { resetAll(); };

  // ─── Non-annotate screens ───
  if (screen !== SCREENS.ANNOTATE) {
    return (
      <>
        {screen === SCREENS.REGISTER && <RegisterScreen onRegister={register} onReviewerAccess={handleReviewerAccess} />}
        {screen === SCREENS.TUTORIAL && <TutorialScreen candidateName={candidate.name} onStart={startTest} />}
        {screen === SCREENS.FEEDBACK && (
          <FeedbackScreen
            scenario={currentScenario}
            scoreRecord={scores[scenarioIndex]}
            onNext={nextScenario}
            isLast={scenarioIndex === shuffledScenarios.length - 1}
          />
        )}
        {screen === SCREENS.SUBMITTING && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100dvh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          }}>
            <style>{`@keyframes annotation-spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{
              ...surface,
              borderRadius: 24,
              padding: '48px 40px',
              textAlign: 'center',
              maxWidth: 400,
            }}>
              <div style={{
                width: 40, height: 40, margin: '0 auto 20px',
                border: '3px solid rgba(10,132,255,0.15)',
                borderTopColor: '#0A84FF',
                borderRadius: '50%',
                animation: 'annotation-spin 0.8s linear infinite',
              }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                Submitting Your Results
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                Please don't close this window.
              </p>
            </div>
          </div>
        )}
        {screen === SCREENS.RESULTS && (
          <ResultsScreen
            candidate={candidate}
            answersList={answersList}
            scores={scores}
            totalPoints={totalPoints}
            displayScore={displayScore}
            band={band}
            scenarios={shuffledScenarios}
            onRetake={resetAll}
          />
        )}
        {screen === SCREENS.REVIEWER && (
          <div className="app-shell">
            <header className="app-header">
              <h1>Email Abuse Annotation Test</h1>
            </header>
            <main className="app-content">
              <ReviewerScreen onBack={handleReviewerBack} />
            </main>
          </div>
        )}
      </>
    );
  }

  // ─── ANNOTATE screen: full flagmail1-style two-column layout ───
  return (
    <div style={{
      minHeight: '100dvh',
      padding: '18px clamp(12px, 2.5vw, 24px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          .annotate-main-grid {
            grid-template-columns: 1fr !important;
          }
          .annotate-email-col,
          .annotate-side-col {
            max-height: none !important;
          }
        }
        @media (max-width: 680px) {
          .annotate-header-card {
            border-radius: 20px !important;
          }
        }
        .annotate-side-col::-webkit-scrollbar { width: 6px; }
        .annotate-side-col::-webkit-scrollbar-thumb { background: rgba(17,24,39,0.12); border-radius: 999px; }
        .annotate-email-col::-webkit-scrollbar { width: 6px; }
        .annotate-email-col::-webkit-scrollbar-thumb { background: rgba(17,24,39,0.12); border-radius: 999px; }
      `}</style>

      {/* Accent radial background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(circle at 14% 18%, rgba(10,132,255,0.14), transparent 26%)',
          'radial-gradient(circle at 82% 10%, rgba(48,176,199,0.10), transparent 22%)',
          'radial-gradient(circle at 50% 84%, rgba(17,24,39,0.05), transparent 28%)',
        ].join(','),
      }} />

      <div style={{ maxWidth: 1440, margin: '0 auto', position: 'relative', display: 'grid', gap: 14 }}>

        {/* Header bar */}
        <AnnotateHeader
          scenarioIndex={scenarioIndex}
          total={shuffledScenarios.length}
          durationSeconds={120}
          onExpire={handleTimerExpire}
        />

        {/* Two-column main */}
        <div
          className="annotate-main-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(340px, 0.9fr)',
            gap: 14,
            alignItems: 'start',
            minHeight: 'calc(100dvh - 170px)',
          }}
        >
          {/* LEFT: Email card */}
          <div
            className="annotate-email-col"
            style={{
              ...surface,
              borderRadius: 30,
              padding: 16,
              minHeight: 0,
              maxHeight: 'calc(100dvh - 184px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(32,52,89,0.10), 0 8px 24px rgba(32,52,89,0.05), inset 0 1px 0 rgba(255,255,255,0.72)',
            }}
          >
            <div style={{ minHeight: 0, overflow: 'auto', paddingRight: 4 }}>
              <EmailDisplay
                email={currentScenario.email}
                context={currentScenario.context}
                scenarioIndex={scenarioIndex}
                totalScenarios={shuffledScenarios.length}
                scenarioTitle={currentScenario.title}
              />
            </div>
          </div>

          {/* RIGHT: Annotation panel */}
          <div
            className="annotate-side-col"
            style={{
              ...surface,
              borderRadius: 28,
              padding: 20,
              minHeight: 0,
              maxHeight: 'calc(100dvh - 184px)',
              overflow: 'auto',
              boxShadow: '0 24px 80px rgba(32,52,89,0.10), 0 8px 24px rgba(32,52,89,0.05)',
            }}
          >
            {/* Side panel header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, marginBottom: 18, paddingBottom: 14,
              borderBottom: '1px solid rgba(13,26,51,0.07)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.52)' }}>
                Annotation
              </div>
              <div style={{ fontSize: 11, color: 'rgba(17,24,39,0.54)' }}>
                Complete all fields to submit
              </div>
            </div>

            <AnnotationForm
              selectedSeverity={currentSeverity}
              selectedSignals={currentSignals}
              selectedAction={currentAction}
              onSeveritySelect={setCurrentSeverity}
              onSignalToggle={toggleSignal}
              onActionSelect={setCurrentAction}
              onSubmit={() => submitAnnotation()}
              isSubmitted={false}
              submitDisabled={submitDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
