// src/styles/tokens.js — shared design tokens matching flagmail1

/** Canonical glass surface style */
export const glass = {
  background: 'rgba(255,255,255,0.74)',
  backdropFilter: 'blur(28px) saturate(165%)',
  WebkitBackdropFilter: 'blur(28px) saturate(165%)',
  border: '1px solid rgba(255,255,255,0.86)',
  boxShadow: '0 24px 80px rgba(32,52,89,0.11), 0 8px 24px rgba(32,52,89,0.06)',
};

/** Stronger blur variant used for main panels */
export const surface = {
  ...glass,
  backdropFilter: 'blur(30px) saturate(165%)',
  WebkitBackdropFilter: 'blur(30px) saturate(165%)',
  border: '1px solid rgba(255,255,255,0.84)',
};

/** Brand accent */
export const ACCENT = '#0A84FF';

/** Severity color map */
export const SEVERITY_COLOR = {
  'not-abusive': '#34C759',
  low: '#30B0C7',
  medium: '#FF9500',
  high: '#FF3B30',
  critical: '#AF52DE',
};
