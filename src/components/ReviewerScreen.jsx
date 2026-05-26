import React, { useState } from 'react';
import { useReviewer } from '../hooks/useReviewer.js';

/**
 * Generates a CSV string from an array of candidate submission objects.
 */
function candidatesToCSV(candidates) {
  const headers = [
    'Name', 'Email', 'Status', 'Score (%)', 'Total Points',
    'Band', 'Severity Acc (%)', 'Signal Acc (%)', 'Action Acc (%)',
    'Proctoring Violations', 'Date Submitted'
  ];

  const escapeCSV = (val) => {
    const s = String(val == null ? '' : val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const rows = candidates.map((c) => [
    escapeCSV(c.name),
    escapeCSV(c.email),
    escapeCSV(c.status || 'Completed'),
    c.displayScore ?? '',
    c.totalPoints ?? '',
    escapeCSV(c.band),
    c.severityAcc ?? '',
    c.signalAcc ?? '',
    c.actionAcc ?? '',
    c.violations ?? 0,
    c.timestamp ? new Date(c.timestamp).toLocaleString() : ''
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser download of a CSV file.
 */
function downloadCSV(csvString, filename) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReviewerScreen({ onBack }) {
  const {
    isAuthenticated,
    candidates,
    loading,
    error,
    authenticate,
    fetchCandidates,
    logout
  } = useReviewer();

  const [passcodeVal, setPasscodeVal] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedEmail, setExpandedEmail] = useState(null);

  const toggleExpand = (email) => {
    setExpandedEmail(prev => prev === email ? null : email);
  };

  // Authenticate submission -- now async
  const handleSubmitPasscode = async (e) => {
    e.preventDefault();
    await authenticate(passcodeVal);
  };

  // No useEffect needed -- authenticate now fetches data on success

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(prev => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Handle CSV download
  const handleDownloadCSV = () => {
    if (candidates.length === 0) return;
    const csv = candidatesToCSV(candidates);
    const timestamp = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `annotation_results_${timestamp}.csv`);
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'timestamp') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    } else if (typeof aVal === 'string') {
      aVal = (aVal || '').toLowerCase();
      bVal = (bVal || '').toLowerCase();
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="reviewer-screen-container">
      <div className="reviewer-card card">
        <div className="reviewer-card-header">
          <h2>Reviewer Dashboard</h2>
          <button className="submit-btn outline-btn compact-btn" onClick={onBack}>
            Exit Dashboard
          </button>
        </div>

        {!isAuthenticated ? (
          <form className="reviewer-login-form" onSubmit={handleSubmitPasscode}>
            <p className="screen-desc">
              Please enter the reviewer passcode to access candidate submissions.
            </p>
            <div className="form-group">
              <label htmlFor="reviewer-passcode">Reviewer Passcode</label>
              <input
                id="reviewer-passcode"
                type="password"
                value={passcodeVal}
                onChange={(e) => setPasscodeVal(e.target.value)}
                placeholder="Enter passcode"
                required
                className="input-field"
                disabled={loading}
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button
              id="btn-reviewer-auth"
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>
        ) : (
          <div className="reviewer-dashboard-content">
            <div className="reviewer-meta-row">
              <span className="candidate-count">
                Total Submissions: <strong>{candidates.length}</strong>
              </span>
              <div className="reviewer-actions">
                <button
                  className="submit-btn outline-btn compact-btn"
                  style={{ marginRight: '10px' }}
                  onClick={handleDownloadCSV}
                  disabled={candidates.length === 0}
                  title="Download all submissions as CSV"
                >
                  Download CSV
                </button>
                <button
                  className="submit-btn outline-btn compact-btn"
                  style={{ marginRight: '10px' }}
                  onClick={fetchCandidates}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button className="submit-btn compact-btn" onClick={logout}>
                  Log Out
                </button>
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {loading ? (
              <div className="loading-indicator">Fetching submissions data...</div>
            ) : sortedCandidates.length === 0 ? (
              <p className="no-data">No candidate submissions recorded yet.</p>
            ) : (
              <div className="table-wrap">
                <table className="breakdown-table reviewer-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                        Candidate Name {sortField === 'name' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                        Email {sortField === 'email' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('displayScore')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                        Score {sortField === 'displayScore' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th>Band</th>
                      <th onClick={() => handleSort('violations')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                        Violations {sortField === 'violations' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }}>
                        Date Submitted {sortField === 'timestamp' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCandidates.map((cand, idx) => {
                      const dateStr = cand.timestamp
                        ? new Date(cand.timestamp).toLocaleString()
                        : 'N/A';
                      const isExpanded = expandedEmail === cand.email;
                      const scenarios = cand.perScenario || [];

                      return (
                        <React.Fragment key={idx}>
                          <tr
                            onClick={() => toggleExpand(cand.email)}
                            style={{ cursor: 'pointer' }}
                            className={isExpanded ? 'expanded-row' : ''}
                          >
                            <td>
                              <span className="expand-indicator">{isExpanded ? '▾' : '▸'}</span>
                              <strong>{cand.name}</strong>
                            </td>
                            <td>{cand.email}</td>
                            <td style={{ textAlign: 'right' }}>{cand.displayScore}% ({cand.totalPoints}/30)</td>
                            <td>
                              <span className={`band-badge compact ${cand.band?.toLowerCase()}`}>
                                {cand.band}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', color: cand.violations > 0 ? '#ff5252' : 'inherit' }}>
                              <strong>{cand.violations || 0}</strong>
                            </td>
                            <td>{dateStr}</td>
                          </tr>
                          {isExpanded && (
                            <tr className="raw-data-row">
                              <td colSpan={6} style={{ padding: 0 }}>
                                <div className="raw-data-panel">
                                  <div className="raw-data-summary">
                                    <h4>Candidate Details</h4>
                                    <div className="raw-data-grid">
                                      <div className="raw-data-item">
                                        <span className="raw-label">Status</span>
                                        <span className="raw-value">{cand.status || 'Completed'}</span>
                                      </div>
                                      <div className="raw-data-item">
                                        <span className="raw-label">Final Score</span>
                                        <span className="raw-value">{cand.finalScore ?? cand.displayScore}%</span>
                                      </div>
                                      <div className="raw-data-item">
                                        <span className="raw-label">Severity Accuracy</span>
                                        <span className="raw-value">{cand.severityAcc ?? '—'}%</span>
                                      </div>
                                      <div className="raw-data-item">
                                        <span className="raw-label">Signal Accuracy</span>
                                        <span className="raw-value">{cand.signalAcc ?? '—'}%</span>
                                      </div>
                                      <div className="raw-data-item">
                                        <span className="raw-label">Action Accuracy</span>
                                        <span className="raw-value">{cand.actionAcc ?? '—'}%</span>
                                      </div>
                                      <div className="raw-data-item">
                                        <span className="raw-label">Proctoring Violations</span>
                                        <span className="raw-value" style={{ color: cand.violations > 0 ? '#ff5252' : 'inherit' }}>
                                          {cand.violations || 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {scenarios.length > 0 ? (
                                    <div className="raw-data-scenarios">
                                      <h4>Per-Scenario Breakdown</h4>
                                      <table className="breakdown-table scenario-detail-table">
                                        <thead>
                                          <tr>
                                            <th>#</th>
                                            <th>Scenario</th>
                                            <th>Severity (Selected / Correct)</th>
                                            <th style={{ textAlign: 'right' }}>Sev Pts</th>
                                            <th>Signals (Selected / Required)</th>
                                            <th style={{ textAlign: 'right' }}>Sig Pts</th>
                                            <th>Action (Selected / Correct)</th>
                                            <th style={{ textAlign: 'right' }}>Act Pts</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {scenarios.map((sc, sIdx) => (
                                            <tr key={sIdx}>
                                              <td>{sc.scenarioId || sIdx + 1}</td>
                                              <td>{sc.scenarioTitle || `Scenario ${sIdx + 1}`}</td>
                                              <td>
                                                <span className={sc.selectedSeverity === sc.correctSeverity ? 'match-correct' : 'match-incorrect'}>
                                                  {sc.selectedSeverity || '—'}
                                                </span>
                                                {' / '}{sc.correctSeverity || '—'}
                                              </td>
                                              <td style={{ textAlign: 'right' }}>{sc.severityPoints}</td>
                                              <td>
                                                <span className="raw-signals">{sc.selectedSignals || '—'}</span>
                                                {' / '}<span className="raw-signals">{sc.requiredSignals || '—'}</span>
                                              </td>
                                              <td style={{ textAlign: 'right' }}>{sc.signalPoints}</td>
                                              <td>
                                                <span className={sc.selectedAction === sc.correctAction ? 'match-correct' : 'match-incorrect'}>
                                                  {sc.selectedAction || '—'}
                                                </span>
                                                {' / '}{sc.correctAction || '—'}
                                              </td>
                                              <td style={{ textAlign: 'right' }}>{sc.actionPoints}</td>
                                              <td style={{ textAlign: 'right', fontWeight: 600 }}>{sc.totalPoints}/3</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p className="no-data" style={{ marginTop: '1rem' }}>
                                      No per-scenario data available for this candidate.
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
