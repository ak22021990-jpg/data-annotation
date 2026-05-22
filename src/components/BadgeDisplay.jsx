/**
 * BadgeDisplay - Renders the list of unlocked achievements/badges.
 *
 * @param {Object} props - { badges }
 */
export default function BadgeDisplay({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="badges-earned-container">
      <h3>Badges Unlocked</h3>
      <div className="badges-grid">
        {badges.map(badge => (
          <div
            key={badge.id}
            className="badge-item"
            style={{ borderLeftColor: badge.color }}
          >
            <div
              className="badge-icon-wrap"
              style={{ backgroundColor: `${badge.color}15`, color: badge.color }}
            >
              {badge.icon}
            </div>
            <div className="badge-details">
              <div className="badge-title" style={{ color: badge.color }}>
                {badge.title}
              </div>
              <div className="badge-description">
                {badge.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
