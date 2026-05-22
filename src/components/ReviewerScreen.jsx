import { useState, useEffect } from 'react';
import { useReviewer } from '../hooks/useReviewer.js';

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
  const [sortField, setSortField] = useState('timestamp'); // 'timestamp', 'displayScore', 'violations', 'name'
  const [sortAsc, setSortAsc] = useState(false);

  // Authenticate submission
  const handleSubmitPasscode = (e) => {
    e.preventDefault();
    authenticate(passcodeVal);
  };

  // Fetch candidates when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCandidates();
    }
  }, [isAuthenticated, fetchCandidates]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(prev => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'timestamp') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
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
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button id="btn-reviewer-auth" type="submit" className="submit-btn">
              Authenticate
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
                      // Formatting timestamp
                      const dateStr = cand.timestamp
                        ? new Date(cand.timestamp).toLocaleString()
                        : 'N/A';

                      return (
                        <tr key={idx}>
                          <td><strong>{cand.name}</strong></td>
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
