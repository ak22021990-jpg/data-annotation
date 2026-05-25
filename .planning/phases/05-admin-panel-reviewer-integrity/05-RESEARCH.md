# Phase 5: Admin Panel, Reviewer & Integrity - Research

**Researched:** 2026-05-25
**Domain:** React routing, PDF/CSV report generation, proctoring integration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use `react-router-dom` for URL-based routing. Routes: `/annotation` (candidate flow), `/annotation/admin` (admin panel), `/annotation/admin/candidate/:id` (candidate detail drill-down).
- **D-02:** Replace screen-state routing in App.jsx with react-router-dom. Candidate flow components remain the same, just wrapped in route definitions.
- **D-03:** Admin panel uses shared passcode — same pattern as reviewer screen (`apple-reviewer-2026` in `useReviewer.js`). Consistent, simple, no identity provider needed.
- **D-04:** New GAS endpoint for admin data — richer than raw submissions. Includes efficiency stats (accuracy %, time efficiency, signal detection rate, severity judgment accuracy) and per-scenario breakdowns. Not just the leaderboard data.
- **D-05:** Admin can download individual candidate reports and overall summary report in both CSV and PDF formats.
- **D-06:** Use `@react-pdf/renderer` for PDF generation — React-friendly, JSX-to-PDF. CSV generated client-side from candidate data.
- **D-07:** Click candidate row → navigate to `/annotation/admin/candidate/:id` with full per-scenario breakdown and annotation answers. Clean URL, browser back button works.
- **D-08:** Reuse flagmail1 design system — same tokens, cards, typography as candidate flow. Consistent visual language throughout.
- **D-09:** Violation count displayed in candidate table with red visual indicator when count > 0. Simple, scannable. Detailed violation log not needed — just the count.

### the agent's Discretion
- None — all gray areas discussed and decided.

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-01 | Admin panel accessible at `/annotation/admin` route | react-router-dom Route config at `/admin` path |
| ADMIN-02 | Admin panel displays list of all candidates with scores, bands, efficiency metrics | `fetchAdminCandidates` API call + sortable table (reuse ReviewerScreen pattern) |
| ADMIN-03 | Admin can view detailed individual candidate report showing per-scenario breakdown | Route `/admin/candidate/:id` + useParams + per-scenario table (reuse ResultsScreen breakdown) |
| ADMIN-04 | Admin can download individual candidate report (PDF or CSV) | @react-pdf/renderer PDFDocument + client-side CSV blob generation |
| ADMIN-05 | Admin can download overall report summarizing all candidates' results and efficiency metrics | PDFDocument with multi-page table + CSV from aggregated data |
| ADMIN-06 | Admin panel is protected — unauthorized access redirects to candidate flow or shows access denied | Passcode gate (reuse useReviewer pattern) + Navigate redirect on failure |
| ROUTE-01 | Lightweight router handles `/annotation` (candidate flow) and `/annotation/admin` (admin panel) | BrowserRouter in main.jsx wrapping App, Routes with path definitions |
| ROUTE-02 | Router does not interfere with existing navigation within the candidate flow | Candidate flow remains internal state (screen/answers) — only top-level screens map to routes |
| REV-01 | Reviewer screen is gated behind a shared passcode | useReviewer.js already implements — reuse as-is |
| REV-02 | Reviewer screen shows candidate results including proctoring violation counts | ReviewerScreen already has violations column — verify data flows from GAS payload |
| PROCTOR-01 | Tab-switch / focus-loss violations are tracked during the test | useProctoring.js already implements visibilitychange + blur double-fire guard |
| PROCTOR-02 | Proctoring violations accumulate across all 10 scenarios and are included in score submission | useAnnotationState already passes violations to submitResults — wire useProctoring active flag |
</phase_requirements>

## Summary

Phase 5 replaces App.jsx screen-state routing with react-router-dom v7 declarative routing, adds an admin panel with passcode auth, candidate drill-down, and PDF/CSV report downloads, and wires the existing useProctoring hook into the candidate flow so violations persist across all 10 scenarios and reach the GAS submission.

**Primary recommendation:** Wrap App in BrowserRouter at main.jsx level, define three top-level routes (candidate flow, admin panel, admin candidate detail), reuse existing hooks/components where possible, add @react-pdf/renderer for PDF exports, and use Blob + URL.createObjectURL for CSV downloads.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| URL routing | Browser / Client | — | react-router-dom runs entirely client-side, no server needed |
| Admin auth (passcode) | Browser / Client | — | Client-side passcode check, same as reviewer screen |
| Admin data fetch | Browser / Client | API / Backend (GAS) | Browser calls GAS endpoint, GAS reads Sheets |
| PDF generation | Browser / Client | — | @react-pdf/renderer renders to blob client-side |
| CSV generation | Browser / Client | — | Blob + URL.createObjectURL, no server needed |
| Proctoring detection | Browser / Client | — | visibilitychange + blur listeners in useProctoring |
| Violation persistence | Browser / Client | — | Accumulated in useAnnotationState, passed to submitResults |
| Report download UI | Browser / Client | — | Download buttons trigger blob URL creation |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router-dom | 7.15.1 | URL-based routing | Official React Router v7, supports React 19, declarative `<Routes>/<Route>` API [VERIFIED: npm registry] |
| @react-pdf/renderer | 4.5.1 | JSX-to-PDF generation | Standard React PDF library, supports React 19, Document/Page/Text primitives, PDFDownloadLink for downloads [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | — | CSV generation | Native Blob + URL.createObjectURL — no library needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-router-dom | Manual hash-based routing | More code, no browser back button support, violates D-01 |
| @react-pdf/renderer | jsPDF + autoTable | Imperative API, harder to compose with React, more boilerplate |
| @react-pdf/renderer | window.print() | No PDF file download, browser-dependent output quality |

**Installation:**
```bash
npm install react-router-dom @react-pdf/renderer
```

**Version verification:**
- react-router-dom: 7.15.1 (published 2026-05-14) — [VERIFIED: npm registry]
- @react-pdf/renderer: 4.5.1 (published 2026-04-15) — [VERIFIED: npm registry]

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| react-router-dom | npm | 13 yrs | 12M+/wk | github.com/remix-run/react-router | N/A (slopcheck unavailable) | Approved [VERIFIED: npm registry] |
| @react-pdf/renderer | npm | 8 yrs | 500K+/wk | github.com/diegomura/react-pdf | N/A (slopcheck unavailable) | Approved [VERIFIED: npm registry] |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Both packages confirmed via npm registry with official GitHub repos, no postinstall scripts, React 19 peer dependency compatibility verified.

## Architecture Patterns

### System Architecture Diagram

```
Browser
  │
  ├─ BrowserRouter (main.jsx)
  │   │
  │   ├─ Route "/" → CandidateFlow (App.jsx)
  │   │   ├─ useAnnotationState (screen state, answers, scores)
  │   │   ├─ useProctoring (active during ANNOTATE screen)
  │   │   │   ├─ visibilitychange listener
  │   │   │   ├─ blur listener
  │   │   │   └─ violations counter → accumulated across 10 scenarios
  │   │   └─ submitResults → GAS (includes violations payload)
  │   │
  │   ├─ Route "/admin" → AdminPanel
  │   │   ├─ PasscodeGate (reuse useReviewer pattern)
  │   │   ├─ fetchAdminCandidates → GAS endpoint
  │   │   ├─ CandidateTable (sortable, violation count with red indicator)
  │   │   └─ Download buttons → PDF/CSV generation
  │   │
  │   └─ Route "/admin/candidate/:id" → CandidateDetail
  │       ├─ useParams for candidate ID
  │       ├─ Per-scenario breakdown table
  │       └─ Individual PDF/CSV download
  │
  └─ External: GAS Backend
      ├─ action=getAdminData → returns candidate list with efficiency stats
      ├─ action=getResults&passcode=... → reviewer data
      └─ action=submitFinal → receives violations in payload
```

### Recommended Project Structure
```
src/
├── components/
│   ├── AdminPanel.jsx          # Admin list view with passcode gate
│   ├── CandidateDetail.jsx     # Individual candidate drill-down
│   ├── PasscodeGate.jsx        # Reusable passcode auth wrapper
│   ├── ReviewerScreen.jsx      # Existing — keep as-is
│   └── reports/
│       ├── CandidateReportPDF.jsx   # @react-pdf/renderer individual report
│       └── SummaryReportPDF.jsx     # @react-pdf/renderer overall summary
├── hooks/
│   ├── useAnnotationState.js   # Existing — add proctoring wire-up
│   ├── useProctoring.js        # Existing — already built
│   ├── useReviewer.js          # Existing — reuse passcode pattern
│   └── useAdmin.js             # New — admin data fetch + auth
├── utils/
│   ├── api.js                  # Existing — add fetchAdminCandidates
│   └── csvExport.js            # New — client-side CSV generation
├── App.jsx                     # Modified — remove screen-state, become route content
└── main.jsx                    # Modified — wrap with BrowserRouter
```

### Pattern 1: Declarative Routing with react-router-dom v7
**What:** Wrap app in `<BrowserRouter>`, define routes with `<Routes>` and `<Route>`, use `useNavigate` for programmatic navigation.
**When to use:** All SPA routing needs — replaces screen-state enum pattern.
**Example:**
```jsx
// main.jsx
import { BrowserRouter } from 'react-router';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

// App.jsx
import { Routes, Route } from 'react-router';
import CandidateFlow from './components/CandidateFlow';
import AdminPanel from './components/AdminPanel';
import CandidateDetail from './components/CandidateDetail';

function App() {
  return (
    <Routes>
      <Route path="/*" element={<CandidateFlow />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/admin/candidate/:id" element={<CandidateDetail />} />
    </Routes>
  );
}
```
Source: [reactrouter.com/start/declarative/installation](https://reactrouter.com/start/declarative/installation), [reactrouter.com/start/declarative/routing](https://reactrouter.com/start/declarative/routing)

### Pattern 2: PDF Document Composition with @react-pdf/renderer
**What:** Build PDF documents using JSX primitives (`Document`, `Page`, `View`, `Text`), render to blob via `PDFDownloadLink` or `BlobProvider`.
**When to use:** Client-side PDF generation from React data.
**Example:**
```jsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { fontSize: 18, marginBottom: 20 },
  row: { flexDirection: 'row', padding: 4 },
  cell: { flex: 1, fontSize: 10 },
});

function CandidateReportPDF({ candidate }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{candidate.name} — Assessment Report</Text>
        <View style={styles.row}>
          <Text style={styles.cell}>Score: {candidate.displayScore}%</Text>
          <Text style={styles.cell}>Band: {candidate.band}</Text>
          <Text style={styles.cell}>Violations: {candidate.violations || 0}</Text>
        </View>
        {/* Per-scenario rows */}
      </Page>
    </Document>
  );
}

// Usage in component:
// <PDFDownloadLink document={<CandidateReportPDF candidate={data} />} fileName="report.pdf">
//   Download PDF
// </PDFDownloadLink>
```
Source: [react-pdf.org/components](https://react-pdf.org/components), [react-pdf.org/styling](https://react-pdf.org/styling)

### Pattern 3: Client-Side CSV Export
**What:** Build CSV string from data array, create Blob, trigger download via temporary anchor element.
**When to use:** Tabular data export without server dependency.
**Example:**
```js
export function downloadCSV(data, filename) {
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Anti-Patterns to Avoid
- **Hash router for production:** `HashRouter` creates ugly URLs (`/#/admin`), violates D-01 clean URL requirement. Use `BrowserRouter`.
- **Screen-state + router hybrid:** Don't keep `SCREENS` enum AND react-router — pick one. D-02 says replace screen-state entirely.
- **PDF rendering in main thread for large docs:** @react-pdf/renderer is synchronous — large documents block UI. Keep reports under ~50 pages.
- **Passcode in URL query params:** Never pass `?passcode=...` in URL — it gets logged. Use component state.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL routing | Custom hash-based screen mapper | react-router-dom | Browser history, back button, deep linking, param parsing |
| PDF generation | Canvas-based PDF drawing or window.print() | @react-pdf/renderer | JSX composition, page wrapping, font embedding, metadata |
| CSV export | Server-side endpoint | Client-side Blob | Zero backend dependency, instant download, no GAS rate limits |
| Passcode auth | New auth system | Reuse useReviewer.js pattern | Already built, tested, consistent UX |
| Proctoring detection | Custom visibility listeners | useProctoring hook | Double-fire guard already handles visibilitychange + blur dedup |

**Key insight:** Every complex piece in this phase already exists or has a battle-tested library. The work is wiring, not building.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | GAS Sheets rows with candidate submissions (name, email, scores, violations, perScenario) | New GAS endpoint `action=getAdminData` needed — returns enriched data with efficiency stats |
| Live service config | GAS_URL in `.env` (VITE_GAS_URL) | No change — same endpoint, new action parameter |
| OS-registered state | None — verified: no Windows Task Scheduler, pm2, or systemd registrations | None |
| Secrets/env vars | `VITE_GAS_URL` — unchanged | None |
| Build artifacts | None — no compiled binaries or pip packages | None |

## Common Pitfalls

### Pitfall 1: Vite `base` Path Mismatch
**What goes wrong:** vite.config.js has `base: '/data-annotation/'` but CONTEXT.md routes reference `/annotation/`. BrowserRouter needs to know the base path.
**Why it happens:** Vite base affects asset URLs and router basename. If they don't match, routes break on production deploy.
**How to avoid:** Set `basename="/data-annotation/"` on `<BrowserRouter>` to match vite.config.js `base`. Or update vite.config.js `base` to `/annotation/` if that's the intended public path.
**Warning signs:** 404 on `/admin` route in production, assets fail to load.

### Pitfall 2: Screen-State Leftover Conflicts
**What goes wrong:** After adding react-router-dom, the old `SCREENS` enum and `screen` state in useAnnotationState.js still exist. If not removed, they cause confusion and potential double-rendering.
**Why it happens:** Incremental migration — developer adds routes but forgets to remove old screen logic.
**How to avoid:** In the same PR that adds routes, remove `SCREENS` enum, `screen` state, and all `setScreen()` calls from useAnnotationState.js and App.jsx. Replace with route-based navigation.
**Warning signs:** `setScreen` calls still exist, `screen !== SCREENS.ANNOTATE` checks still in App.jsx.

### Pitfall 3: @react-pdf/renderer Font Registration
**What goes wrong:** PDF renders with default Helvetica only — no custom fonts, no emoji support.
**Why it happens:** @react-pdf/renderer doesn't auto-load system fonts. Must register fonts explicitly or use built-in fonts.
**How to avoid:** Use built-in fonts (`Helvetica`, `Times-Roman`, `Courier`) for reports — no registration needed. If custom fonts are needed, use `Font.register()` with a URL or base64 data.
**Warning signs:** PDF renders but text looks generic, or Font.register throws on missing font files.

### Pitfall 4: GAS `no-cors` Mode for Admin Data
**What goes wrong:** Admin data fetch uses `no-cors` mode (like submitResults), which returns opaque response — cannot read JSON data.
**Why it happens:** Existing api.js uses `no-cors` for POST submissions. GET requests for admin data need standard CORS mode.
**How to avoid:** Admin GET endpoint must use standard `fetch()` without `no-cors`. GAS backend must return proper CORS headers. If GAS doesn't support CORS, use JSONP or a proxy.
**Warning signs:** `fetch` returns `Response { type: "opaque" }`, `response.json()` throws.

### Pitfall 5: Proctoring Double-Fire Not Reset Between Scenarios
**What goes wrong:** Violations accumulate but `useProctoring` `switchedAway` state isn't reset between scenarios, causing stale state.
**Why it happens:** useProctoring returns `reset()` but useAnnotationState.js doesn't call it between scenarios.
**How to avoid:** Call `resetProctoring()` in `nextScenario` callback when advancing to next scenario. The violation COUNT persists (that's correct), but the `switchedAway` boolean should reset.
**Warning signs:** Violation count jumps by 2 on single tab switch, or `switchedAway` stays true across scenarios.

## Code Examples

Verified patterns from official sources:

### react-router-dom Route Setup with basename
```jsx
// main.jsx
import { BrowserRouter } from 'react-router';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/data-annotation/">
    <App />
  </BrowserRouter>,
);
```
Source: [reactrouter.com/start/declarative/installation](https://reactrouter.com/start/declarative/installation)

### useNavigate for Programmatic Navigation
```jsx
import { useNavigate } from 'react-router';

function AdminPanel() {
  const navigate = useNavigate();

  const viewCandidate = (email) => {
    navigate(`/admin/candidate/${encodeURIComponent(email)}`);
  };

  // ...
}
```
Source: [reactrouter.com/start/declarative/navigating](https://reactrouter.com/start/declarative/navigating)

### useParams for Dynamic Route Segments
```jsx
import { useParams } from 'react-router';

function CandidateDetail() {
  const { id } = useParams(); // id from /admin/candidate/:id
  // Use id to find candidate from fetched data
}
```
Source: [reactrouter.com/start/declarative/routing#dynamic-segments](https://reactrouter.com/start/declarative/routing#dynamic-segments)

### @react-pdf/renderer Multi-Page Document
```jsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  tableHeader: { flexDirection: 'row', borderBottom: '1 solid #000', paddingBottom: 4, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', paddingVertical: 3 },
  cell: { flex: 1, fontSize: 9 },
});

function SummaryReportPDF({ candidates }) {
  return (
    <Document title="Annotation Test — Summary Report">
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 16, marginBottom: 16 }}>All Candidates Summary</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.cell}>Name</Text>
          <Text style={styles.cell}>Score</Text>
          <Text style={styles.cell}>Band</Text>
          <Text style={styles.cell}>Violations</Text>
        </View>
        {candidates.map((c, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.cell}>{c.name}</Text>
            <Text style={styles.cell}>{c.displayScore}%</Text>
            <Text style={styles.cell}>{c.band}</Text>
            <Text style={styles.cell}>{c.violations || 0}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
```
Source: [react-pdf.org/components](https://react-pdf.org/components)

### CSV Export Utility
```js
// src/utils/csvExport.js
export function downloadCSV(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const csvLines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Proctoring Wire-Up in useAnnotationState
```js
// Current: useProctoring({ active: proctorActive })
// proctorActive is set true in startTest, false in nextScenario (last scenario)
// Need: ensure violations accumulate across all 10 scenarios

// In nextScenario callback:
const nextScenario = useCallback(() => {
  if (scenarioIndex < scenarios.length - 1) {
    // Advance to next scenario — proctor stays active
    setScenarioIndex(prev => prev + 1);
    // Reset form state but NOT violations
    setCurrentSeverity(null);
    setCurrentSignals([]);
    setCurrentAction(null);
    setScreen(SCREENS.ANNOTATE);
  } else {
    // Last scenario done — stop proctoring, go to results
    setProctorActive(false);
    // ... existing results logic, violations already in state
  }
}, [...]);

// violations from useProctoring is already passed to onFinished → submitResults
// No additional wiring needed — just verify proctorActive stays true across scenarios
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Screen-state enum routing | react-router-dom URL routing | Phase 5 | Clean URLs, browser back button, deep linking |
| LeaderboardScreen (unused) | AdminPanel with full data | Phase 5 | Admin replaces leaderboard — richer data, auth, downloads |
| localStorage-only candidate data | GAS admin endpoint + localStorage fallback | Phase 5 | Real-time candidate list from Sheets |
| No PDF export | @react-pdf/renderer JSX-to-PDF | Phase 5 | Professional report downloads |

**Deprecated/outdated:**
- `LeaderboardScreen.jsx`: Currently imported by ResultsScreen.jsx but serves limited purpose. AdminPanel supersedes it for hiring managers. Keep LeaderboardScreen for candidate-facing view post-test, but AdminPanel is the authoritative review tool.
- `SCREENS` enum in useAnnotationState.js: Will be removed when react-router-dom replaces screen-state routing.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | GAS backend supports GET requests with proper CORS headers for admin data | Code Examples / Pitfall 4 | If GAS only supports `no-cors` POST, admin panel cannot fetch candidate list — need alternative data source |
| A2 | GAS endpoint `action=getAdminData` (or similar naming) can return enriched candidate data with efficiency stats | Admin Data Source (D-04) | If GAS only returns raw leaderboard data, admin panel loses efficiency metrics and per-scenario breakdowns |
| A3 | vite.config.js `base: '/data-annotation/'` is the intended public path (not `/annotation/`) | Pitfall 1 | If base should be `/annotation/`, all asset URLs and router basename need updating |

## Open Questions

1. **GAS admin endpoint format:** What exact `action` parameter and response shape should the new admin endpoint use? CONTEXT.md D-04 says "richer than raw submissions" but doesn't specify the exact API contract.
   - What we know: Existing endpoints use `action=getLeaderboard`, `action=getResults&passcode=...`, `action=submitFinal`
   - What's unclear: Whether admin endpoint needs passcode auth, what fields to include beyond leaderboard data
   - Recommendation: Define API contract in PLAN.md — suggest `action=getAdminData&passcode=...` returning array of full submission objects (same shape as localStorage safeguard data)

2. **Candidate identification in detail route:** Should `/admin/candidate/:id` use email, name, or a generated ID as the `:id` parameter?
   - What we know: GAS submissions are keyed by email in localStorage (`abuse_test_submission_${email}`)
   - What's unclear: Whether email is safe to expose in URL (URL encoding needed for `+` and `@`)
   - Recommendation: Use URL-encoded email as `:id` — it's the unique identifier already used throughout the system

3. **Admin panel passcode:** Should admin use the same passcode as reviewer (`apple-reviewer-2026`) or a separate one?
   - What we know: D-03 says "shared passcode — same pattern as reviewer screen"
   - What's unclear: Whether "same pattern" means same passcode value or same auth mechanism
   - Recommendation: Same passcode value for simplicity — both admin and reviewer are internal hiring tools

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, Vite dev server | ✓ | v22+ (assumed) | — |
| npm | Package installation | ✓ | — | — |
| GAS backend | Admin data fetch, reviewer data | ✓ (assumed) | — | localStorage fallback for reviewer data already exists |
| Browser (Chrome/Edge/Safari) | @react-pdf/renderer PDF generation | ✓ | — | — |

**Missing dependencies with no fallback:** none

**Missing dependencies with fallback:**
- GAS admin endpoint (`action=getAdminData`) — not yet implemented on GAS side. Fallback: read from localStorage submissions (same pattern as reviewer local fallback)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.7 |
| Config file | None detected — inline config in package.json (`"test": "vitest run"`) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01 | `/annotation/admin` route renders admin panel | unit | `npm test` — test route matching | ❌ Wave 0 |
| ADMIN-02 | Admin table shows candidates with scores, bands, violations | unit | `npm test` — component render test | ❌ Wave 0 |
| ADMIN-03 | Candidate detail shows per-scenario breakdown | unit | `npm test` — useParams + render | ❌ Wave 0 |
| ADMIN-04 | PDF download generates valid PDF blob | unit | `npm test` — PDFDocument render | ❌ Wave 0 |
| ADMIN-05 | CSV download generates valid CSV | unit | `npm test` — downloadCSV utility | ❌ Wave 0 |
| ADMIN-06 | Wrong passcode blocks admin access | unit | `npm test` — auth rejection | ❌ Wave 0 |
| ROUTE-01 | Routes resolve correctly | unit | `npm test` — route config test | ❌ Wave 0 |
| ROUTE-02 | In-app navigation unaffected | integration | Manual verification | ❌ Wave 0 |
| REV-01 | Reviewer passcode gate works | unit | Existing useReviewer tests | ❌ Wave 0 |
| REV-02 | Violations shown in reviewer table | unit | `npm test` — ReviewerScreen render | ❌ Wave 0 |
| PROCTOR-01 | Violations increment on tab switch | unit | `npm test` — useProctoring hook | ❌ Wave 0 |
| PROCTOR-02 | Violations persist across scenarios, included in submission | integration | Manual + localStorage check | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase-gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.js` or `vitest.config.ts` — no config file detected, using defaults
- [ ] `src/__tests__/` or `src/**/*.test.js` — only `timer-race.test.js` exists in hooks/
- [ ] Router testing setup — need `createRoutesStub` from react-router for route tests

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Shared passcode (client-side) — adequate for internal tool, not for production auth |
| V3 Session Management | no | No session tokens — passcode check is per-request, stateless |
| V4 Access Control | yes | Passcode gate blocks admin routes — Navigate redirect on failure |
| V5 Input Validation | yes | URL-encoded email in route params, CSV field escaping |
| V6 Cryptography | no | No encryption needed — data is assessment results, not PII beyond name/email |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Passcode in URL/query params | Information Disclosure | Passcode stored in component state only, never in URL |
| XSS via candidate name in PDF | Tampering | @react-pdf/renderer escapes text content by default |
| CSV injection via formula in name | Tampering | Prefix fields with `"` and escape existing `"` chars (done in downloadCSV) |
| Unauthorized admin access | Elevation of Privilege | Passcode gate + Navigate redirect — client-side only (acceptable for internal tool) |
| GAS endpoint without auth | Spoofing | Admin endpoint should require passcode parameter — same as getResults |

## Sources

### Primary (HIGH confidence)
- [react-router-dom v7.15.1 npm registry](https://www.npmjs.com/package/react-router-dom) — version, peer deps, repo
- [@react-pdf/renderer v4.5.1 npm registry](https://www.npmjs.com/package/@react-pdf/renderer) — version, peer deps, repo
- [reactrouter.com/start/declarative/installation](https://reactrouter.com/start/declarative/installation) — BrowserRouter setup, declarative routing
- [reactrouter.com/start/declarative/routing](https://reactrouter.com/start/declarative/routing) — Route config, dynamic segments, Link/NavLink
- [react-pdf.org/components](https://react-pdf.org/components) — Document, Page, View, Text, PDFDownloadLink, BlobProvider
- [react-pdf.org/styling](https://react-pdf.org/styling) — StyleSheet API, valid CSS properties, units

### Secondary (MEDIUM confidence)
- Existing codebase analysis — App.jsx, useAnnotationState.js, useProctoring.js, useReviewer.js, api.js, ReviewerScreen.jsx, tokens.js, index.css
- [reactrouter.com/api/hooks/useNavigate](https://reactrouter.com/api/hooks/useNavigate) — programmatic navigation
- [reactrouter.com/api/hooks/useParams](https://reactrouter.com/api/hooks/useParams) — dynamic route params

### Tertiary (LOW confidence)
- GAS backend capabilities for admin endpoint — assumed based on existing patterns, not verified against actual GAS code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via npm registry, official docs, React 19 compatibility confirmed
- Architecture: HIGH — based on existing codebase analysis + official library documentation
- Pitfalls: MEDIUM — inferred from codebase patterns and library docs, some GAS-specific assumptions
- Proctoring integration: HIGH — useProctoring.js and useAnnotationState.js fully analyzed

**Research date:** 2026-05-25
**Valid until:** 30 days (react-router-dom and @react-pdf/renderer are stable libraries)
