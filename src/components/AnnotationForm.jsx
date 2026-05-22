/**
 * AnnotationForm — Right panel with flagmail1 Classifier visual treatment.
 *
 * Three sections in a gradient-backed card:
 *   1. Severity (radio pills, color-coded active state)
 *   2. Abuse signals detected (multi-select checkbox pills)
 *   3. Recommended action (radio pills)
 *
 * Followed by the ClassifyButton-style submit CTA.
 */
import { SEVERITY_OPTS, SIGNAL_OPTS, ACTION_OPTS } from '../data/taxonomy.js';
import { SEVERITY_COLOR } from '../styles/tokens.js';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

const ACTION_COLOR = {
  'no-action': '#34C759',
  filter: '#FF9500',
  remove: '#FF3B30',
  escalate: '#AF52DE',
};

const SECTION_LABEL = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'rgba(17,24,39,0.52)',
};

const SECTION_HINT = {
  fontSize: 11, color: 'rgba(17,24,39,0.60)',
};

// Large pill button used for Severity and Action (single-select)
function RadioPill({ label, active, color, onClick, disabled }) {
  const rgb = hexToRgb(color);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 14px',
        borderRadius: 16,
        fontSize: 13, fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.18s ease',
        display: 'flex', alignItems: 'center', gap: 10,
        textAlign: 'left',
        ...(active ? {
          background: `linear-gradient(180deg, rgba(${rgb},0.20) 0%, rgba(255,255,255,0.97) 100%)`,
          border: `1.5px solid ${color}`,
          boxShadow: `0 10px 24px rgba(${rgb},0.18), 0 0 0 4px rgba(${rgb},0.08)`,
          color: color,
          transform: 'translateY(-1px)',
        } : {
          background: 'rgba(255,255,255,0.88)',
          border: '1.5px solid rgba(13,26,51,0.14)',
          color: '#111827',
          boxShadow: '0 4px 14px rgba(17,24,39,0.06), inset 0 1px 0 rgba(255,255,255,0.72)',
        }),
      }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        border: active ? `5px solid ${color}` : '2px solid rgba(17,24,39,0.30)',
        background: active ? '#fff' : 'transparent',
        boxShadow: active ? `0 0 0 4px rgba(${rgb},0.14)` : 'none',
      }} />
      <span>{label}</span>
    </button>
  );
}

// Rounded chip used for Abuse signals (multi-select)
function CheckPill({ label, active, onClick, disabled }) {
  const color = '#0A84FF';
  const rgb = hexToRgb(color);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '9px 13px',
        borderRadius: 999,
        fontSize: 12, fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.18s ease',
        display: 'flex', alignItems: 'center', gap: 8,
        ...(active ? {
          background: `linear-gradient(180deg, rgba(${rgb},0.14) 0%, rgba(255,255,255,0.94) 100%)`,
          border: `1.5px solid ${color}`,
          color: color,
          boxShadow: `0 6px 16px rgba(${rgb},0.14)`,
        } : {
          background: 'rgba(255,255,255,0.88)',
          border: '1.5px solid rgba(13,26,51,0.12)',
          color: 'rgba(17,24,39,0.78)',
          boxShadow: '0 3px 10px rgba(17,24,39,0.05)',
        }),
      }}
    >
      <span style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
        background: active ? color : 'rgba(17,24,39,0.22)',
        boxShadow: active ? `0 0 0 3px rgba(${rgb},0.12)` : 'none',
      }} />
      {label}
    </button>
  );
}

export default function AnnotationForm({
  selectedSeverity,
  selectedSignals,
  selectedAction,
  onSeveritySelect,
  onSignalToggle,
  onActionSelect,
  onSubmit,
  isSubmitted,
  submitDisabled,
}) {
  const accentColor = selectedSeverity ? (SEVERITY_COLOR[selectedSeverity] || '#0A84FF') : '#0A84FF';
  const accentRgb = hexToRgb(accentColor);

  return (
    <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>

      {/* ── Severity ── */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={SECTION_LABEL}>Severity</div>
          <div style={SECTION_HINT}>Select the severity level of this email</div>
        </div>
        <div style={{
          borderRadius: 22, padding: 14,
          background: `linear-gradient(180deg, ${accentColor}10 0%, rgba(255,255,255,0.94) 100%)`,
          border: `1px solid ${accentColor}18`,
          display: 'flex', flexWrap: 'wrap', gap: 10,
        }}>
          {SEVERITY_OPTS.map(opt => (
            <RadioPill
              key={opt.id}
              label={opt.label}
              active={selectedSeverity === opt.id}
              color={SEVERITY_COLOR[opt.id] || '#0A84FF'}
              onClick={() => !isSubmitted && onSeveritySelect(opt.id)}
              disabled={isSubmitted}
            />
          ))}
        </div>
        <div aria-live="polite" style={{ fontSize: 12, color: 'rgba(17,24,39,0.58)' }}>
          {selectedSeverity
            ? `Severity selected: ${SEVERITY_OPTS.find(o => o.id === selectedSeverity)?.label}.`
            : 'No severity selected yet.'}
        </div>
      </div>

      {/* ── Abuse signals ── */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={SECTION_LABEL}>Abuse signals detected</div>
          <div style={SECTION_HINT}>Select all that apply</div>
        </div>
        <div style={{
          borderRadius: 20,
          background: 'rgba(249,250,252,0.88)',
          border: '1px solid rgba(13,26,51,0.06)',
          padding: '14px 14px 10px',
          display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {SIGNAL_OPTS.map(opt => (
            <CheckPill
              key={opt.id}
              label={opt.label}
              active={selectedSignals.includes(opt.id)}
              onClick={() => !isSubmitted && onSignalToggle(opt.id)}
              disabled={isSubmitted}
            />
          ))}
        </div>
        <div aria-live="polite" style={{ fontSize: 12, color: 'rgba(17,24,39,0.58)' }}>
          {selectedSignals.length > 0
            ? `${selectedSignals.length} signal${selectedSignals.length > 1 ? 's' : ''} selected.`
            : 'No signals selected yet.'}
        </div>
      </div>

      {/* ── Recommended action ── */}
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={SECTION_LABEL}>Recommended action</div>
          <div style={SECTION_HINT}>Choose the enforcement action</div>
        </div>
        <div style={{
          borderRadius: 20,
          background: `linear-gradient(180deg, ${accentColor}0D 0%, rgba(255,255,255,0.82) 100%)`,
          border: `1px solid ${accentColor}1F`,
          padding: 14,
          display: 'flex', flexWrap: 'wrap', gap: 10,
        }}>
          {ACTION_OPTS.map(opt => (
            <RadioPill
              key={opt.id}
              label={opt.label}
              active={selectedAction === opt.id}
              color={ACTION_COLOR[opt.id] || '#0A84FF'}
              onClick={() => !isSubmitted && onActionSelect(opt.id)}
              disabled={isSubmitted}
            />
          ))}
        </div>
        <div aria-live="polite" style={{ fontSize: 12, color: 'rgba(17,24,39,0.58)' }}>
          {selectedAction
            ? `Action selected: ${ACTION_OPTS.find(o => o.id === selectedAction)?.label}.`
            : 'No action selected yet.'}
        </div>
      </div>

      {/* ── Submit CTA ── */}
      {!isSubmitted && (
        <div style={{
          borderRadius: 20,
          background: `linear-gradient(180deg, ${accentColor}0D 0%, rgba(255,255,255,0.82) 100%)`,
          border: `1px solid ${accentColor}1F`,
          padding: 16, display: 'grid', gap: 12,
        }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.46)' }}>
              Ready to submit
            </div>
            <div style={{ fontSize: 13, color: 'rgba(17,24,39,0.60)' }}>
              {selectedSeverity && selectedAction
                ? 'All required fields selected — submit your annotation.'
                : 'Select severity and a recommended action to unlock submission.'}
            </div>
          </div>
          <button
            id="btn-submit-annotation"
            type="button"
            disabled={submitDisabled}
            onClick={onSubmit}
            style={{
              padding: '14px 20px',
              borderRadius: 16,
              fontSize: 14, fontWeight: 700,
              border: 'none', cursor: submitDisabled ? 'default' : 'pointer',
              transition: 'all 0.22s ease',
              position: 'relative', overflow: 'hidden',
              ...(submitDisabled ? {
                background: 'rgba(17,24,39,0.08)',
                color: 'rgba(17,24,39,0.38)',
                boxShadow: 'none',
              } : {
                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}CC 100%)`,
                color: '#fff',
                boxShadow: `0 12px 28px rgba(${accentRgb},0.28), inset 0 1px 0 rgba(255,255,255,0.22)`,
              }),
            }}
          >
            Submit annotation
          </button>
        </div>
      )}
    </div>
  );
}
