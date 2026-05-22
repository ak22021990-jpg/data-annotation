/**
 * EmailDisplay — Full flagmail1-style email card.
 *
 * Left panel of the annotate screen:
 *  - Scenario title/badge at the top
 *  - Sender avatar (initials + color hash)
 *  - Large subject heading
 *  - From / To metadata cards
 *  - Collapsible email-headers accordion
 *  - Annotator context as blue ℹ info banner (flagmail1 userContext slot)
 *  - Message body
 */
import { useState } from 'react';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function avatarColor(str) {
  const colors = ['#0A84FF', '#30B0C7', '#FF7A1A', '#34C759', '#F25F4C', '#5AC8FA'];
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function EmailHeaderAccordion({ email }) {
  const [open, setOpen] = useState(false);

  const rows = [
    { label: 'From', value: email.from || '-', mono: true },
    { label: 'Reply-To', value: email.replyTo || email.from || '-', mono: true },
    { label: 'To', value: email.to || '-', mono: true },
    { label: 'Subject', value: email.subject || '-', mono: false },
  ];

  const hasReplyMismatch = email.replyTo && email.replyTo !== email.from;

  return (
    <div style={{
      borderBottom: '1px solid rgba(10,132,255,0.16)',
      background: 'rgba(10,132,255,0.06)',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span aria-hidden="true" style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '1.5px solid rgba(10,132,255,0.78)',
          color: '#0A84FF',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, lineHeight: 1,
          background: 'rgba(255,255,255,0.82)',
          boxShadow: '0 1px 2px rgba(10,132,255,0.10)',
          flexShrink: 0,
        }}>i</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#0A84FF', letterSpacing: '0.04em' }}>
          Email Headers
          {hasReplyMismatch && (
            <span style={{
              marginLeft: 8, fontSize: 10, fontWeight: 700,
              color: '#FF3B30', background: 'rgba(255,59,48,0.10)',
              borderRadius: 6, padding: '2px 6px',
            }}>Reply-To mismatch</span>
          )}
        </span>
        <span aria-hidden="true" style={{
          marginLeft: 'auto',
          width: 18, height: 18, borderRadius: '50%',
          border: '1px solid rgba(10,132,255,0.22)',
          background: 'rgba(255,255,255,0.78)',
          color: '#0A84FF',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {rows.map(({ label, value, mono }) => {
              const isReplyMismatch = label === 'Reply-To' && hasReplyMismatch;
              return (
                <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 11, color: 'rgba(10,132,255,0.72)', fontWeight: 600, width: 64, flexShrink: 0 }}>
                    {label}:
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: isReplyMismatch ? '#FF3B30' : '#1F2937',
                    fontFamily: mono ? 'ui-monospace, "SF Mono", monospace' : 'inherit',
                    fontWeight: isReplyMismatch ? 700 : 400,
                    wordBreak: 'break-all',
                  }}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailDisplay({ email, context, scenarioIndex, totalScenarios, scenarioTitle }) {
  if (!email) return null;

  const displayName = email.fromName || email.from || 'Unknown';
  const initials = getInitials(displayName);
  const color = avatarColor(displayName);

  return (
    <div
      className="anim-envelopeOpen"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,251,253,0.98) 100%)',
        border: '1px solid rgba(13,26,51,0.08)',
        borderRadius: 26,
        boxShadow: '0 18px 44px rgba(18,28,45,0.08), 0 4px 12px rgba(18,28,45,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Top bar: scenario badge + timestamp */}
      <div style={{
        padding: '20px 22px 18px',
        background: 'linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(244,247,250,0.88) 100%)',
        borderBottom: '1px solid rgba(13,26,51,0.07)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: 12,
          alignItems: 'center', marginBottom: 14, flexWrap: 'wrap',
        }}>
          {/* Scenario badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(17,24,39,0.48)',
            }}>
              {scenarioTitle || 'Annotate this email'}
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: 999,
              background: 'rgba(10,132,255,0.10)', color: '#0A84FF',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            }}>
              {scenarioIndex + 1} of {totalScenarios}
            </span>
          </div>

          {/* Timestamp pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(13,26,51,0.06)',
            color: 'rgba(17,24,39,0.56)', fontSize: 12, fontWeight: 600,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: color, boxShadow: `0 0 0 4px ${color}20`,
            }} />
            Today at {formatTime()}
          </div>
        </div>

        {/* Sender avatar + subject + metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: 14, alignItems: 'start' }}>
          {/* Avatar */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `linear-gradient(180deg, ${color} 0%, ${color}CC 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 700,
            letterSpacing: '-0.03em',
            boxShadow: `0 10px 24px ${color}35`,
            flexShrink: 0,
          }}>
            {initials}
          </div>

          <div style={{ minWidth: 0 }}>
            {/* Subject */}
            <div style={{
              fontSize: 22, lineHeight: 1.12, letterSpacing: '-0.03em',
              fontWeight: 700, color: '#111827', marginBottom: 14, maxWidth: 760,
            }}>
              {email.subject}
            </div>

            {/* From / To metadata cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              <div style={{
                padding: '12px 14px', borderRadius: 18,
                background: 'rgba(255,255,255,0.86)', border: '1px solid rgba(13,26,51,0.06)',
              }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700, color: 'rgba(17,24,39,0.46)', marginBottom: 6 }}>From</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{displayName}</div>
                <div style={{ fontSize: 11, color: 'rgba(17,24,39,0.56)', fontFamily: 'ui-monospace,"SF Mono",monospace', wordBreak: 'break-all' }}>{email.from}</div>
              </div>
              <div style={{
                padding: '12px 14px', borderRadius: 18,
                background: 'rgba(255,255,255,0.86)', border: '1px solid rgba(13,26,51,0.06)',
              }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700, color: 'rgba(17,24,39,0.46)', marginBottom: 6 }}>To</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 3 }}>Annotation Reviewer</div>
                <div style={{ fontSize: 11, color: 'rgba(17,24,39,0.56)', fontFamily: 'ui-monospace,"SF Mono",monospace', wordBreak: 'break-all' }}>{email.to}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible header accordion */}
      <EmailHeaderAccordion email={email} />

      {/* Annotator context banner — same slot as flagmail1's userContext */}
      {context && (
        <div style={{
          padding: '12px 20px',
          background: 'linear-gradient(90deg, rgba(10,132,255,0.08) 0%, rgba(255,255,255,0.92) 50%)',
          borderBottom: '1px solid rgba(13,26,51,0.06)',
          display: 'grid', gridTemplateColumns: '18px minmax(0, 1fr)',
          gap: 10, alignItems: 'start',
        }}>
          <span style={{ fontSize: 13, color: '#0A84FF', lineHeight: 1.3, fontWeight: 800 }}>i</span>
          <span style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(17,24,39,0.66)' }}>
            {context}
          </span>
        </div>
      )}

      {/* Message body */}
      <div style={{ padding: '26px 22px 28px', background: '#FFFFFF' }}>
        <div style={{
          fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.10em',
          fontWeight: 700, color: 'rgba(17,24,39,0.46)', marginBottom: 14,
        }}>
          Message body
        </div>
        <div style={{
          fontSize: 15, color: '#273142', lineHeight: 1.72,
          whiteSpace: 'pre-wrap', fontWeight: 400,
        }}>
          {email.body}
        </div>
      </div>
    </div>
  );
}
