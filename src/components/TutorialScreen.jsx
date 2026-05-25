import { glass } from '../styles/tokens.js';

const TIPS = [
  {
    icon: '🔍',
    title: 'Read the message first',
    caption: 'Check sender, request, and pressure before classifying.',
  },
  {
    icon: '💡',
    title: 'Use hints only when needed',
    caption: 'Look out for context clues carefully.',
  },
  {
    icon: '🗂️',
    title: 'Classify in three layers',
    caption: 'Pick the primary severity, then refine your signals.',
  },
  {
    icon: '⏱️',
    title: 'Lock the call in fast',
    caption: 'You have exactly 2 minutes per scenario.',
  },
];

const localGlass = { ...glass, background: 'rgba(255,255,255,0.72)' };

/**
 * TutorialScreen - flagmail1-style tutorial screen.
 *
 * @param {Object} props - { onStart, candidateName }
 */
export default function TutorialScreen({ onStart, candidateName }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        padding: 'clamp(16px, 2.5vw, 28px)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .tutorial-tips-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: [
            'radial-gradient(circle at 12% 14%, rgba(10,132,255,0.14), transparent 24%)',
            'radial-gradient(circle at 84% 12%, rgba(52,199,89,0.12), transparent 20%)',
            'radial-gradient(circle at 50% 84%, rgba(255,149,0,0.10), transparent 24%)',
          ].join(','),
        }}
      />

      <div
        className="anim-fadeSlideUp"
        style={{
          ...localGlass,
          borderRadius: 34, padding: 'clamp(22px, 3vw, 34px)',
          maxWidth: 680, width: '100%', display: 'grid', gap: 22,
          position: 'relative', zIndex: 1,
        }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.52)' }}>
            Quick Briefing
          </div>
          <div style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', lineHeight: 1, letterSpacing: '-0.05em', fontWeight: 700, color: '#111827' }}>
            Hello, {candidateName}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(17,24,39,0.56)', letterSpacing: '0.02em' }}>
            10 emails &middot; Automatic progression &middot; 120s per round
          </div>
        </div>

        <div className="tutorial-tips-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {TIPS.map((tip) => (
            <div key={tip.title} style={{
              borderRadius: 22, padding: '16px', background: 'rgba(249,250,252,0.88)',
              border: '1px solid rgba(13,26,51,0.06)', display: 'grid', gap: 6,
            }}>
              <div style={{ fontSize: 22, lineHeight: 1 }}>{tip.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827' }}>{tip.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.45, color: 'rgba(17,24,39,0.60)' }}>{tip.caption}</div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 16px', borderRadius: 999,
          background: 'linear-gradient(135deg, rgba(52,199,89,0.10) 0%, rgba(255,255,255,0.90) 100%)',
          border: '1px solid rgba(52,199,89,0.18)', textAlign: 'center',
          fontSize: 14, fontWeight: 600, color: 'rgba(17,24,39,0.64)', letterSpacing: '-0.01em',
        }}>
          Accuracy first. Speed second.
        </div>

        <div style={{ display: 'grid' }}>
          <button
            onClick={onStart}
            style={{
              padding: '14px 16px', borderRadius: 16, border: '1px solid rgba(52,199,89,0.24)',
              background: 'linear-gradient(135deg, #34C759 0%, #23A345 100%)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              boxShadow: '0 16px 28px rgba(52,199,89,0.22)', cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            I'm Ready, Begin Test
          </button>
        </div>
      </div>
    </div>
  );
}
