import { glass } from '../styles/tokens.js';

// FeedbackScreen uses softer surface style similar to ResultsScreen
const surface = {
  ...glass,
  background: 'rgba(255,255,255,0.76)',
  backdropFilter: 'blur(22px) saturate(150%)',
  WebkitBackdropFilter: 'blur(22px) saturate(150%)',
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 24px 80px rgba(32, 52, 89, 0.10), 0 8px 24px rgba(32, 52, 89, 0.05)',
};

/**
 * FeedbackScreen - Shows grading details immediately after scenario submission.
 * Styled to match flagmail1 glassmorphic UI.
 *
 * @param {Object} props - { scenario, scoreRecord, onNext, isLast }
 */
export default function FeedbackScreen({ scenario, scoreRecord, onNext, isLast }) {
  if (!scoreRecord) return null;

  const { points, severityPoints, signalPoints, actionPoints } = scoreRecord;

  // Determine feedback style classes
  let statusColor = '#FF3B30';
  let statusBg = 'rgba(255,59,48,0.1)';
  let heading = 'Needs Improvement';
  let icon = '✗';

  if (points >= 2.5) {
    statusColor = '#34C759';
    statusBg = 'rgba(52,199,89,0.1)';
    heading = 'Strong Annotation';
    icon = '✓';
  } else if (points >= 1.5) {
    statusColor = '#FF9500';
    statusBg = 'rgba(255,149,0,0.1)';
    heading = 'Partially Correct';
    icon = '~';
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        padding: 'clamp(18px, 2.8vw, 28px)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: [
            'radial-gradient(circle at 12% 14%, rgba(10,132,255,0.12), transparent 24%)',
            'radial-gradient(circle at 88% 12%, rgba(255,149,0,0.10), transparent 20%)',
            'radial-gradient(circle at 50% 84%, rgba(52,199,89,0.08), transparent 24%)',
          ].join(','),
        }}
      />

      <div className="anim-fadeSlideUp" style={{ ...surface, borderRadius: 34, padding: 'clamp(24px, 3vw, 36px)', maxWidth: 720, width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gap: 24 }}>
          
          <div style={{
            borderRadius: 20, padding: 20, background: statusBg, border: `1px solid ${statusColor}33`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', background: statusColor, color: '#fff',
              display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800,
            }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{heading}</div>
              <div style={{ fontSize: 14, color: 'rgba(17,24,39,0.64)' }}>{points} / 3.0 points earned</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            <div style={{ borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(13,26,51,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.52)', marginBottom: 6 }}>Severity</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{severityPoints} <span style={{ fontSize: 14, color: 'rgba(17,24,39,0.4)' }}>/ 1.0</span></div>
            </div>
            <div style={{ borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(13,26,51,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.52)', marginBottom: 6 }}>Signals</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{signalPoints} <span style={{ fontSize: 14, color: 'rgba(17,24,39,0.4)' }}>/ 1.0</span></div>
            </div>
            <div style={{ borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(13,26,51,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.52)', marginBottom: 6 }}>Action</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{actionPoints} <span style={{ fontSize: 14, color: 'rgba(17,24,39,0.4)' }}>/ 1.0</span></div>
            </div>
          </div>

          <div style={{ borderRadius: 18, padding: 20, background: 'rgba(249,250,252,0.88)', border: '1px solid rgba(13,26,51,0.06)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 14, fontWeight: 700, color: '#111827' }}>Model Answer Reasoning:</h4>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'rgba(17,24,39,0.72)' }}>
              {scenario.answer.reasoning}
            </p>
          </div>

          <button
            onClick={onNext}
            style={{
              padding: '16px 20px', borderRadius: 18, border: 'none',
              background: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
              color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em',
              boxShadow: '0 18px 32px rgba(10,132,255,0.22)', cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isLast ? 'View Assessment Results' : 'Proceed to Next Scenario'}
          </button>

        </div>
      </div>
    </div>
  );
}
