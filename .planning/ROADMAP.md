# Roadmap: Email Abuse Annotation Test

## Overview

Six phases take the project from a verified data foundation through a live, scorable
annotation test with an admin panel for hiring managers. Phase 1 corrects all seven
answer-key inconsistencies before any scoring code exists. Phase 2 builds and verifies
the pure scoring engine with calibrated weights and thresholds. Phases 3-4 layer on UI,
persistence, candidate efficiency stats, and design. Phase 5 adds the admin panel with
routing, candidate review, and report downloads. Phase 6 locks in quality across the
full stack before the test goes live.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Data Foundation** - Scaffold the project, fix all 7 scenario rubric inconsistencies, and establish the single-source-of-truth data layer
- [ ] **Phase 2: Scoring Engine** - Build and verify the pure `scoreRound()` function with calibrated weights/thresholds and `useScoring` hook in isolation, before any UI exists
- [ ] **Phase 3: Annotation Round Flow** - Implement the full 10-scenario annotation experience: email display, form, timer, progress, and per-scenario feedback
- [ ] **Phase 4: Results, Efficiency Stats & Design** - Results screen, candidate efficiency metrics, backend submission, localStorage safeguard, badges, and full flagmail1 design language
- [ ] **Phase 5: Admin Panel, Reviewer & Integrity** - Lightweight router, admin panel at `/annotation/admin` with candidate review and report downloads, passcode-gated reviewer screen, and proctoring violation tracking
- [ ] **Phase 6: QA & Polish** - Accessibility audit, scoring verification across all 10 scenarios, timer race test, and terminology clean sweep

## Phase Details

### Phase 1: Data Foundation
**Goal**: The project scaffolds correctly and all scenario content is verified, corrected, and locked as the authoritative data layer before any scoring or UI code is written
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04, CONTENT-01, CONTENT-02, CONTENT-03
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts the Vite dev server with `base: '/annotation/'` and no console errors
  2. The ESLint banned-terminology rule fires an error on any use of `flag`, `zone`, `clue`, `hint`, `classif`, or `moderat` in source files
  3. All 10 scenarios are importable from `src/data/scenarios.js` with no undefined fields; every signal ID in every rubric exists in `src/data/taxonomy.js`
  4. Scenario 9 includes `auth-fail` in both `answer.signals` and `scoring.signals.required`; no other scenario has a model-answer signal that is absent from its scoring rubric
  5. `src/data/taxonomy.js` exports `SEVERITY_OPTS`, `SIGNAL_OPTS`, and `ACTION_OPTS` as the sole source of truth consumed by both the scoring engine and the annotation form
**Plans**: TBD

### Phase 2: Scoring Engine
**Goal**: A deterministic, verified scoring function exists with calibrated weights and thresholds that correctly scores any annotation for any of the 10 scenarios, including all edge cases, with no UI dependency
**Depends on**: Phase 1
**Requirements**: SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05, SCORE-06
**Success Criteria** (what must be TRUE):
  1. Running `scoreRound(scenario, answers)` in Node returns a `scoreRecord` with `severityPoints`, `signalPoints`, `actionPoints`, and `points` (0–3) for any valid input
  2. A scenario with `scoring.signals.required = []` awards 1.0 signal point when the candidate selects nothing or `none-detected`, and 0.5 points when any other signal is selected
  3. `displayScore` equals `Math.round((totalPoints / 30) * 100)` and band classification uses the raw (unrounded) percentage — a 24/30 candidate lands in Advanced, a 17.9/30 candidate lands in Foundation
  4. The scoring function is pure: identical inputs always produce identical outputs with no network call or external state
  5. Severity, signal, and action point weights are calibrated to differentiate candidate skill levels — high performers score in Advanced, marginal candidates land in Proficient or Foundation
**Plans**: TBD

### Phase 3: Annotation Round Flow
**Goal**: A candidate can work through all 10 annotation scenarios in sequence — reading each email, filling the form, watching the timer, submitting, and reading per-scenario feedback — within the React application
**Depends on**: Phase 2
**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05, FLOW-06, FLOW-07, FLOW-08, FLOW-09, TIMER-01, TIMER-02, TIMER-03
**Success Criteria** (what must be TRUE):
  1. A candidate can register with name and email on the landing screen, read the tutorial, then reach Scenario 1 with a live 2-minute countdown timer visible
  2. The email display shows From, Reply-To, To, Subject, and body; any Reply-To that differs from From is visually highlighted in red; the annotator context note is shown when present
  3. The annotation form accepts severity selection, multi-signal selection (with `none-detected` mutually exclusive from other signals), and action selection; the Submit button is disabled until both severity and action are chosen
  4. When the 2-minute timer expires, the current annotation auto-submits with whatever is selected (including nothing) — exactly once, with no double-submission
  5. After each submission the candidate sees per-scenario feedback with the model-answer reasoning, then advances to the next scenario; after Scenario 10 the flow moves to results
**Plans**: TBD
**UI hint**: yes

### Phase 4: Results, Efficiency Stats & Design
**Goal**: A candidate receives a complete results screen with score, band, per-scenario breakdown, and efficiency metrics (accuracy %, time efficiency, signal detection rate); the full submission is persisted to localStorage and the Google Sheets backend; the entire app uses flagmail1's visual design language with annotation-correct copy
**Depends on**: Phase 3
**Requirements**: RESULT-01, RESULT-02, RESULT-03, STATS-01, STATS-02, BADGE-01, BADGE-02, DESIGN-01, DESIGN-02
**Success Criteria** (what must be TRUE):
  1. The results screen shows total score, displayScore percentage, band/title (Foundation / Proficient / Advanced), and a row-by-row breakdown of all 10 scenarios
  2. Candidate efficiency stats are displayed: overall accuracy %, time efficiency, signal detection rate, and severity judgment accuracy — giving hiring managers a clear picture of candidate competence
  3. Before every backend POST, the full annotation payload is written to `localStorage` keyed by candidate email; the POST fires with no-cors and does not block the results screen from rendering
  4. Badge unlock conditions fire correctly for the flat 10-scenario flow (accuracy-based, speed-based, perfect-run triggers); badge art and animations are reused from flagmail1
  5. No candidate-facing copy uses moderation, classification, flag, hint, zone, or clue language; the app visually matches flagmail1's theme and design tokens
**Plans**: TBD
**UI hint**: yes

### Phase 5: Admin Panel, Reviewer & Integrity
**Goal**: A lightweight router serves `/annotation` (candidate flow) and `/annotation/admin` (admin panel); hiring managers can review all candidates, view detailed individual reports, and download individual/overall reports; the passcode-gated reviewer screen shows candidate results with proctoring violation counts; proctoring events are tracked throughout the test
**Depends on**: Phase 4
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06, ROUTE-01, ROUTE-02, REV-01, REV-02, PROCTOR-01, PROCTOR-02
**Success Criteria** (what must be TRUE):
  1. The router correctly serves the candidate flow at `/annotation` and the admin panel at `/annotation/admin` without interfering with in-app navigation
  2. The admin panel displays a list of all candidates with their scores, bands, and efficiency metrics
  3. Admin can drill into any candidate to see their per-scenario breakdown and individual annotation answers
  4. Admin can download individual candidate reports and an overall summary report (PDF or CSV)
  5. The reviewer screen is unreachable without the correct passcode; entering an incorrect passcode shows an error and does not reveal any candidate data
  6. Tab-switch and focus-loss events during the test increment a violation counter that persists across all 10 scenarios and is included in the GAS submission payload
**Plans**: 4 plans
Plans:
- [ ] 05-01-PLAN.md — Routing setup: react-router-dom replaces screen-state, 3 routes defined
- [ ] 05-02-PLAN.md — Admin panel: passcode auth, candidate list, detail drill-down
- [ ] 05-03-PLAN.md — Proctoring integration: wire violations into candidate flow + submission
- [ ] 05-04-PLAN.md — Report downloads: PDF (@react-pdf/renderer) + CSV client-side export
**UI hint**: yes

### Phase 6: QA & Polish
**Goal**: The app passes accessibility standards, all 10 scenarios score correctly on all answer paths, the timer auto-submit path has no race conditions, and no banned terminology exists in the codebase
**Depends on**: Phase 5
**Requirements**: QA-01, QA-02, QA-03
**Success Criteria** (what must be TRUE):
  1. Every signal pill in the annotation form announces `role="checkbox"` and `aria-checked` (checked/unchecked) to screen readers; the form is fully keyboard-operable
  2. Manual scoring verification confirms each of the 10 scenarios produces the correct `points` value for the correct-answer path, at least one partial-credit path, and the zero-point path
  3. Simulating a Submit click at T=1s before timer expiry results in exactly one score record — no double-submission, no dropped scenario
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation | 1/1 | Done | 2026-05-22 |
| 2. Scoring Engine | 0/TBD | Not started | - |
| 3. Annotation Round Flow | 0/TBD | Not started | - |
| 4. Results, Efficiency Stats & Design | 0/TBD | Not started | - |
| 5. Admin Panel, Reviewer & Integrity | 0/TBD | Not started | - |
| 6. QA & Polish | 0/TBD | Not started | - |
