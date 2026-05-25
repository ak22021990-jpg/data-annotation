# Phase 05: Admin Panel, Reviewer & Integrity - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

## Phase Boundary

Phase 5 delivers: a lightweight URL router serving `/annotation` (candidate flow) and `/annotation/admin` (admin panel); an admin panel with candidate list, drill-down detail pages, and CSV/PDF report downloads; a passcode-gated reviewer screen showing candidate results with proctoring violation counts; proctoring event tracking persisted across all 10 scenarios and included in GAS submission.

## Implementation Decisions

### Routing
- **D-01:** Use `react-router-dom` for URL-based routing. Routes: `/annotation` (candidate flow), `/annotation/admin` (admin panel), `/annotation/admin/candidate/:id` (candidate detail drill-down).
- **D-02:** Replace screen-state routing in App.jsx with react-router-dom. Candidate flow components remain the same, just wrapped in route definitions.

### Admin Authentication
- **D-03:** Admin panel uses shared passcode — same pattern as reviewer screen (`apple-reviewer-2026` in `useReviewer.js`). Consistent, simple, no identity provider needed.

### Admin Data Source
- **D-04:** New GAS endpoint for admin data — richer than raw submissions. Includes efficiency stats (accuracy %, time efficiency, signal detection rate, severity judgment accuracy) and per-scenario breakdowns. Not just the leaderboard data.

### Reports & Downloads
- **D-05:** Admin can download individual candidate reports and overall summary report in both CSV and PDF formats.
- **D-06:** Use `@react-pdf/renderer` for PDF generation — React-friendly, JSX-to-PDF. CSV generated client-side from candidate data.

### Candidate Detail View
- **D-07:** Click candidate row → navigate to `/annotation/admin/candidate/:id` with full per-scenario breakdown and annotation answers. Clean URL, browser back button works.

### Admin Visual Style
- **D-08:** Reuse flagmail1 design system — same tokens, cards, typography as candidate flow. Consistent visual language throughout.

### Proctoring Display
- **D-09:** Violation count displayed in candidate table with red visual indicator when count > 0. Simple, scannable. Detailed violation log not needed — just the count.

### Claude's Discretion
- None — all gray areas discussed and decided.

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Configuration
- `.planning/ROADMAP.md` — Phase 5 goal, requirements (ADMIN-01 through ADMIN-06, ROUTE-01, ROUTE-02, REV-01, REV-02, PROCTOR-01, PROCTOR-02), success criteria
- `.planning/REQUIREMENTS.md` — Detailed requirement specifications for admin, routing, reviewer, and proctoring
- `.planning/PROJECT.md` — Tech stack constraints (React 19 + Vite + plain JS, no TypeScript, no CSS framework, GAS backend)

### Existing Code (Reusable)
- `src/hooks/useProctoring.js` — Tab-switch/focus-loss detection with double-fire guard. Already built, needs integration into candidate flow.
- `src/hooks/useReviewer.js` — Passcode authentication, candidate fetch from GAS. Reuse for admin auth pattern.
- `src/utils/api.js` — `fetchReviewerResults`, `submitResults` with violations payload, localStorage safeguard. Extend with new admin endpoint.
- `src/components/ReviewerScreen.jsx` — Passcode login + candidate table with sorting. Reference for admin panel layout.
- `src/components/LeaderboardScreen.jsx` — Existing component (currently unused). May be replaced by admin panel.

### Design System
- `../flagmail1` — Sibling project. Source of visual theme, design tokens, component styling to reuse.

## Existing Code Insights

### Reusable Assets
- `useProctoring` hook: Already implements visibilitychange + blur double-fire guard. Returns `{ violations, switchedAway, reset }`. Needs to be wired into candidate flow and violations persisted across scenarios.
- `useReviewer` hook: Passcode auth + GAS fetch pattern. Can be adapted for admin auth.
- `api.js` submission pipeline: Already includes `violations` in payload, localStorage safeguard. Extend with admin-specific endpoints.
- `ReviewerScreen` component: Passcode login form + sortable candidate table. Layout reference for admin panel.

### Established Patterns
- GAS integration: `no-cors` POST, localStorage fallback, passcode-gated GET queries
- flagmail1 design tokens: `surface` style object, card layouts, badge components
- Screen-state routing: Current App.jsx uses `SCREENS` enum + `screen` state. Will be replaced by react-router-dom.

### Integration Points
- App.jsx: Needs react-router-dom wrapper. Current screen-state logic maps to routes.
- `useAnnotationState.js`: Candidate state management. Violations need to be accumulated and passed to `submitResults`.
- `api.js`: New `fetchAdminCandidates` endpoint needed for admin panel data.
- GAS backend: New `action=getAdminData` endpoint (or similar) for richer candidate data.

## Specific Ideas

No specific requirements — open to standard approaches within the decisions above.

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 05-Admin Panel, Reviewer & Integrity*
*Context gathered: 2026-05-25*
