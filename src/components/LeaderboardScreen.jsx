import { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../utils/api.js';

/**
 * LeaderboardScreen - Fetches and displays rankings.
 */
export default function LeaderboardScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchLeaderboard()
      .then(data => {
        if (active) {
          setEntries(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        console.error('Failed to load leaderboard'); // bearer:disable javascript_lang_logger_leak
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="leaderboard-section">
      <h3>Leaderboard</h3>

      {loading ? (
        <div className="loading-indicator">Loading leaderboard entries...</div>
      ) : entries.length === 0 ? (
        <p className="no-data">No submissions yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Candidate Name</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Score</th>
                <th style={{ width: '150px' }}>Band</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                let badgeClass = '';
                if (index === 0) badgeClass = 'rank-gold';
                else if (index === 1) badgeClass = 'rank-silver';
                else if (index === 2) badgeClass = 'rank-bronze';

                return (
                  <tr key={index} className={badgeClass}>
                    <td><strong>#{index + 1}</strong></td>
                    <td>{entry.name}</td>
                    <td style={{ textAlign: 'right' }}>{entry.displayScore}%</td>
                    <td>
                      <span className={`band-pill ${entry.band?.toLowerCase()}`}>
                        {entry.band}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
