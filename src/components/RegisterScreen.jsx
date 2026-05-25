import { useState } from 'react';
import { glass } from '../styles/tokens.js';

// LandingScreen uses slightly more transparent glass
const localGlass = { ...glass, background: 'rgba(255,255,255,0.72)' };

const STATS = [
  { value: '10', label: 'emails' },
  { value: '2 Mins', label: 'per round' },
  { value: '3', label: 'points/email' },
];

/**
 * RegisterScreen - flagmail1-style landing screen.
 *
 * @param {Object} props - { onRegister }
 */
export default function RegisterScreen({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onRegister(name.trim(), email.trim());
    }
  };

  const isFormValid = name.trim().length > 0 && email.trim().length > 0;

  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 16px',
    borderRadius: 16,
    border: focusedField === field
      ? '1.5px solid rgba(10,132,255,0.6)'
      : '1.5px solid rgba(13,26,51,0.08)',
    background: focusedField === field
      ? 'rgba(255,255,255,0.92)'
      : 'rgba(249,250,252,0.88)',
    fontSize: 15,
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
    boxShadow: focusedField === field
      ? '0 0 0 4px rgba(10,132,255,0.10)'
      : 'none',
  });

  return (
    <div
      className="landing-screen"
      style={{
        minHeight: '100dvh',
        padding: 'clamp(16px, 2.8vw, 32px)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      <style>{`
        @media (max-width: 1080px) {
          .landing-shell {
            grid-template-columns: minmax(0, 1fr) !important;
            max-width: 860px !important;
          }
        }
        @media (max-width: 720px) {
          .landing-root {
            minHeight: auto !important;
          }
          .landing-card {
            padding: 22px !important;
          }
          .landing-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: [
            'radial-gradient(circle at 16% 20%, rgba(10,132,255,0.14), transparent 28%)',
            'radial-gradient(circle at 84% 16%, rgba(255,122,26,0.13), transparent 24%)',
            'radial-gradient(circle at 50% 80%, rgba(48,176,199,0.10), transparent 32%)',
            'radial-gradient(circle at 20% 80%, rgba(123,45,142,0.10), transparent 30%)',
          ].join(','),
        }}
      />

      <div
        className="landing-root anim-fadeSlideUp"
        style={{
          width: '100%', maxWidth: 1220, margin: '0 auto',
          minHeight: 'calc(100dvh - (2 * clamp(16px, 2.8vw, 32px)))',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div
          className="landing-shell"
          style={{
            display: 'grid', gridTemplateColumns: 'minmax(0, 1.08fr) minmax(360px, 0.92fr)',
            gap: 20, alignItems: 'stretch', width: '100%',
          }}
        >
          {/* Left card: Context & Stats */}
          <div
            className="landing-card"
            style={{
              ...localGlass,
              borderRadius: 34, padding: 'clamp(24px, 2.8vw, 34px)',
              display: 'grid', gap: 22, alignContent: 'space-between',
            }}
          >
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(13,26,51,0.07)', justifySelf: 'start',
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'linear-gradient(180deg, #0A84FF 0%, #0066CC 100%)',
                  boxShadow: '0 0 0 6px rgba(10,132,255,0.12)',
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'rgba(17,24,39,0.62)',
                }}>
                  Annotation Assessment
                </span>
              </div>

              <div style={{ display: 'grid', gap: 12, maxWidth: 680 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: 'rgba(17,24,39,0.48)',
                }}>
                  Sharpen Judgment, Not Just Recall
                </div>
                <h1 style={{
                  margin: 0, fontSize: 'clamp(42px, 5.4vw, 68px)', lineHeight: 0.96,
                  letterSpacing: '-0.05em', color: '#111827', fontWeight: 700,
                  maxWidth: '13.5ch', textWrap: 'balance',
                }}>
                  Prove your judgment against real email threats.
                </h1>
                <p style={{
                  margin: 0, fontSize: 'clamp(15px, 1.5vw, 18px)', lineHeight: 1.55,
                  color: 'rgba(17,24,39,0.68)', maxWidth: 620,
                }}>
                  10 timed scenarios. Each decision is scored, reviewed, and translated into a competency tier.
                </p>
              </div>

              <div
                className="landing-stats"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}
              >
                {STATS.map(stat => (
                  <div key={stat.label} style={{
                    background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(13,26,51,0.06)',
                    borderRadius: 22, padding: '14px 16px 12px',
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: '#111827', lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 10, lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(17,24,39,0.54)', marginTop: 6 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right card: Auth Form */}
          <div
            className="landing-card"
            style={{
              ...localGlass,
              borderRadius: 32, padding: 'clamp(24px, 2.6vw, 30px)',
              display: 'grid', gap: 18, alignContent: 'start',
            }}
          >
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: 'rgba(17,24,39,0.52)' }}>
                Your Details
              </div>
              <div style={{ fontSize: 'clamp(28px, 2.7vw, 38px)', fontWeight: 700, letterSpacing: '-0.05em', color: '#111827', lineHeight: 0.98 }}>
                Begin the assessment
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'rgba(17,24,39,0.66)', maxWidth: 420 }}>
                Enter your details to begin. Your name and email are used to record the final assessment result.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: '0.02em' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your full name"
                  style={inputStyle('name')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 8, letterSpacing: '0.02em' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  style={inputStyle('email')}
                />
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                style={{
                  width: '100%', marginTop: 4, padding: '15px 18px', borderRadius: 18,
                  border: '1px solid rgba(10,132,255,0.32)',
                  background: !isFormValid
                    ? 'rgba(10,132,255,0.5)'
                    : 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '0.01em',
                  boxShadow: '0 18px 32px rgba(10,132,255,0.22)',
                  cursor: !isFormValid ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                Start Assessment
              </button>
            </form>

            <div style={{
              borderRadius: 24, background: 'rgba(249,250,252,0.78)', border: '1px solid rgba(13,26,51,0.06)',
              padding: '16px', display: 'grid', gap: 10,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.48)' }}>
                Assessment flow
              </div>
              {[
                'Enter your details and start the assessment.',
                'Classify each email in a timed round.',
                'Receive your competency result.',
              ].map((line, index) => (
                <div key={line} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: 10, alignItems: 'start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 999, background: 'rgba(17,24,39,0.06)',
                    display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: '#111827',
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.45, color: 'rgba(17,24,39,0.64)' }}>
                    {line}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
