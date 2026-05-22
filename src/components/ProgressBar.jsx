/**
 * ProgressBar - Displays current scenario progress.
 *
 * @param {Object} props - { current, total }
 */
export default function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-bar-container">
      <div className="progress-info">
        <span className="progress-label">Progress:</span>
        <span className="progress-ratio">{current} of {total} Scenarios</span>
      </div>
      <div className="prog-bg" role="progressbar" aria-valuenow={current} aria-valuemin="0" aria-valuemax={total}>
        <div className="prog-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
