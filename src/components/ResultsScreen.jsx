import { checkBadges } from '../config/badges.js';
import BadgeDisplay from './BadgeDisplay.jsx';
import LeaderboardScreen from './LeaderboardScreen.jsx';
import { glass } from '../styles/tokens.js';
import { calculateAccuracy } from '../utils/score.js';

// ResultsScreen uses softer surface style
const surface = {
  ...glass,
  background: 'rgba(255,255,255,0.76)',
  backdropFilter: 'blur(22px) saturate(150%)',
  WebkitBackdropFilter: 'blur(22px) saturate(150%)',
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 24px 80px rgba(32, 52, 89, 0.10), 0 8px 24px rgba(32, 52, 89, 0.05)',
};

function titleTone(score) {
  if (score >= 80) return { accent: '#34C759', bg: 'rgba(52,199,89,0.10)' };
  if (score >= 50) return { accent: '#FF9500', bg: 'rgba(255,149,0,0.12)' };
  return { accent: '#8E8E93', bg: 'rgba(142,142,147,0.10)' };
}

/**
 * ResultsScreen - Full scorecard, badge, and leaderboard view.
 */
export default function ResultsScreen({
  candidate,
  answersList,
  scores,
  totalPoints,
  displayScore,
  band,
  scenarios,
  onRetake: _onRetake,
  elapsedSeconds,
}) {
  const earnedBadges = checkBadges({ scores, totalPoints, elapsedSeconds });
  const tone = titleTone(displayScore);

  const { sevCorrect, actCorrect, sigPoints, severityAcc, signalAcc, actionAcc } =
    calculateAccuracy(scenarios, answersList, scores);

  const totalAvailableSeconds = scenarios.length * 120;
  const timeRemaining = Math.max(0, totalAvailableSeconds - (elapsedSeconds || 0));
  const timeEfficiency = Math.round((timeRemaining / totalAvailableSeconds) * 100);

  const summaryCards = [
    { label: 'Severity', name: 'Severity Judgment', score: severityAcc, max: 100, accent: '#0A84FF', desc: 'Accuracy' },
    { label: 'Signals', name: 'Abuse Signal Detection', score: signalAcc, max: 100, accent: '#FF7A1A', desc: 'Accuracy' },
    { label: 'Action', name: 'Action Recommendation', score: actionAcc, max: 100, accent: '#30B0C7', desc: 'Accuracy' },
    { label: 'Time', name: 'Time Efficiency', score: timeEfficiency, max: 100, accent: '#34C759', desc: 'Remaining' },
  ];

  return (
    <div
      style={{
        minHeight: '100dvh',
        padding: 'clamp(18px, 2.8vw, 28px)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        position: 'relative',
      }}
    >
      <style>{`
        @media (max-width: 960px) {
          .results-top-grid, .results-mid-grid, .results-actions {
            grid-template-columns: 1fr !important;
          }
          .results-metric-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 720px) {
          .results-metric-grid {
            grid-template-columns: 1fr !important;
          }
          .breakdown-table th, .breakdown-table td {
            padding: 10px !important;
          }
        }
        .breakdown-table {
          width: 100%; border-collapse: collapse; text-align: left;
        }
        .breakdown-table th {
          padding: 14px 16px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: rgba(17,24,39,0.5);
          border-bottom: 1px solid rgba(13,26,51,0.08);
        }
        .breakdown-table td {
          padding: 16px; font-size: 14px; border-bottom: 1px solid rgba(13,26,51,0.06);
          vertical-align: top;
        }
      `}</style>

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

      <div className="anim-fadeSlideUp" style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gap: 16 }}>
        {/* Top Hero */}
        <div style={{ ...surface, borderRadius: 34, padding: 'clamp(22px, 3vw, 30px)', overflow: 'hidden' }}>
          <div className="results-top-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.08fr) minmax(260px, 0.92fr)', gap: 18, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(17,24,39,0.46)', marginBottom: 8 }}>
                Assessment complete
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 0.94, letterSpacing: '-0.06em', color: '#111827' }}>
                {candidate.name}'s final judgment score.
              </h1>
              <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.6, color: 'rgba(17,24,39,0.64)', maxWidth: 560 }}>
                Based on how accurately you judged severity, signals, and actions across {scenarios.length} scenarios.
              </p>
            </div>

            <div style={{
              borderRadius: 28, padding: '20px',
              background: `linear-gradient(180deg, ${tone.bg} 0%, rgba(255,255,255,0.92) 100%)`,
              border: `1px solid ${tone.accent}20`, display: 'grid', gap: 10, alignContent: 'start',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, color: '#111827' }}>
                <span style={{ fontSize: 'clamp(64px, 9vw, 92px)', lineHeight: 0.9, fontWeight: 800, letterSpacing: '-0.07em' }}>
                  {displayScore}
                </span>
                <span style={{ fontSize: 22, fontWeight: 500, color: 'rgba(17,24,39,0.48)' }}>%</span>
              </div>
              <div style={{
                display: 'inline-flex', justifySelf: 'start', padding: '8px 14px',
                borderRadius: 999, background: tone.bg, color: tone.accent,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>
                Band: {band}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="results-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          {summaryCards.map((card) => (
            <div key={card.label} style={{ ...surface, borderRadius: 26, padding: 18, display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: card.accent }}>
                {card.label}
              </div>
              <div style={{ fontSize: 24, lineHeight: 1, fontWeight: 700, letterSpacing: '-0.04em', color: '#111827' }}>
                {card.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 34, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.05em', color: '#111827' }}>{card.score}</span>
                <span style={{ fontSize: 16, color: 'rgba(17,24,39,0.34)' }}>%</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(17,24,39,0.58)' }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Badges section */}
        {earnedBadges.length > 0 && (
          <div style={{ ...surface, borderRadius: 26, padding: 20 }}>
            <BadgeDisplay badges={earnedBadges} />
          </div>
        )}

        {/* Statistics section */}
        <div style={{ ...surface, borderRadius: 28, padding: 24, overflow: 'hidden' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>Detailed Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(10,132,255,0.06)', border: '1px solid rgba(10,132,255,0.1)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0A84FF', marginBottom: 8 }}>Severity Choices</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'rgba(17,24,39,0.7)' }}>Correct:</span>
                <span style={{ fontWeight: 600, color: '#34C759' }}>{sevCorrect}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(17,24,39,0.7)' }}>Incorrect:</span>
                <span style={{ fontWeight: 600, color: '#FF3B30' }}>{scenarios.length - sevCorrect}</span>
              </div>
            </div>
            
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(48,176,199,0.06)', border: '1px solid rgba(48,176,199,0.1)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#30B0C7', marginBottom: 8 }}>Action Choices</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'rgba(17,24,39,0.7)' }}>Correct:</span>
                <span style={{ fontWeight: 600, color: '#34C759' }}>{actCorrect}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(17,24,39,0.7)' }}>Incorrect:</span>
                <span style={{ fontWeight: 600, color: '#FF3B30' }}>{scenarios.length - actCorrect}</span>
              </div>
            </div>

            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,122,26,0.06)', border: '1px solid rgba(255,122,26,0.1)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FF7A1A', marginBottom: 8 }}>Abuse Signals (Points)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'rgba(17,24,39,0.7)' }}>Earned:</span>
                <span style={{ fontWeight: 600, color: '#34C759' }}>{sigPoints}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(17,24,39,0.7)' }}>Points missed:</span>
                <span style={{ fontWeight: 600, color: '#FF3B30' }}>{(scenarios.length - sigPoints).toFixed(1)} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Per-Scenario Breakdown Table */}
        <div style={{ ...surface, borderRadius: 28, padding: 24, overflow: 'hidden' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>Per-Scenario Breakdown</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Scenario</th>
                  <th>Severity</th>
                  <th>Signals</th>
                  <th>Action</th>
                  <th style={{ textAlign: 'right' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((sc, idx) => {
                  const ans = answersList[idx] || {};
                  const scScore = scores[idx] || {};
                  const sevOk = ans.severity && sc.scoring.severity.correct.includes(ans.severity);
                  const actOk = ans.action && sc.scoring.action.correct.includes(ans.action);
                  const pts = scScore.points || 0;
                  return (
                    <tr key={sc.id}>
                      <td style={{ fontWeight: 600, color: 'rgba(17,24,39,0.4)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600, color: '#111827' }}>{sc.title || `Scenario ${sc.id}`}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: sevOk ? 'rgba(52,199,89,0.10)' : 'rgba(255,59,48,0.08)',
                          color: sevOk ? '#34C759' : '#FF3B30',
                        }}>
                          {ans.severity || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'rgba(17,24,39,0.65)', maxWidth: 200 }}>
                        {(ans.signals || []).length > 0 ? (ans.signals || []).join(', ') : 'None'}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: actOk ? 'rgba(52,199,89,0.10)' : 'rgba(255,59,48,0.08)',
                          color: actOk ? '#34C759' : '#FF3B30',
                        }}>
                          {ans.action || '—'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: pts >= 2 ? '#34C759' : pts >= 1 ? '#FF9500' : '#FF3B30' }}>
                        {pts.toFixed(1)} / 3
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leaderboard section */}
        <div style={{ ...surface, borderRadius: 28, padding: 24 }}>
          <LeaderboardScreen />
        </div>


      </div>
    </div>
  );
}
