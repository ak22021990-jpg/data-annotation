/**
 * BadgeDisplay - Renders the list of unlocked achievements/badges.
 *
 * @param {Object} props - { badges }
 */
export default function BadgeDisplay({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="badges-earned-container">
      <style>{`
        @keyframes badgePop {
          0% { opacity: 0; transform: scale(0.7) translateY(12px); }
          60% { transform: scale(1.06) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
          50% { box-shadow: 0 0 18px 4px rgba(212,175,55,0.15); }
        }
        .badge-item {
          animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .badge-item:nth-child(1) { animation-delay: 0.05s; }
        .badge-item:nth-child(2) { animation-delay: 0.15s; }
        .badge-item:nth-child(3) { animation-delay: 0.25s; }
        .badge-item:nth-child(4) { animation-delay: 0.35s; }
        .badge-item.unlocked {
          animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both,
                     badgeGlow 2s ease-in-out 0.6s 2;
        }
      `}</style>
      <h3 style={{ margin: '0 0 14px 0', fontSize: 15, fontWeight: 700, color: '#111827' }}>Badges Unlocked</h3>
      <div className="badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {badges.map(badge => (
          <div
            key={badge.id}
            className="badge-item unlocked"
            style={{
              borderLeft: `3px solid ${badge.color}`,
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255,255,255,0.6)',
            }}
          >
            <div
              className="badge-icon-wrap"
              style={{
                width: 42, height: 42, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                backgroundColor: `${badge.color}15`,
                color: badge.color,
                flexShrink: 0,
              }}
            >
              {badge.icon}
            </div>
            <div className="badge-details">
              <div className="badge-title" style={{ fontSize: 13, fontWeight: 700, color: badge.color }}>
                {badge.title}
              </div>
              <div className="badge-description" style={{ fontSize: 12, color: 'rgba(17,24,39,0.55)', lineHeight: 1.4, marginTop: 2 }}>
                {badge.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
