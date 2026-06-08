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
- [x] **Phase 3: Nginx Container Security Hardening** - Replace nginx:latest (Debian) with a hardened nginx:alpine image that eliminates the 2 CRITICAL and 30 HIGH CVEs identified in the container scan; add a production Dockerfile, nginx.conf with security headers, and verify with trivy
  - *Note: Annotation Round Flow (FLOW-01–FLOW-09, TIMER-01–TIMER-03) was implemented outside the GSD workflow prior to Phase 3 planning; all 12 requirements are present in the codebase.*
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
**Plans**: 1 plan (implemented inline with Phase 1 scaffold, verified 2026-06-08)
Plans:
- [x] score.js + useScoring.js — Pure scoring engine, calibrated weights, band thresholds

### Phase 3: Nginx Container Security Hardening
**Goal**: The production nginx container uses a hardened alpine-based image with zero CRITICAL and zero HIGH CVEs; a production Dockerfile + nginx.conf are checked into the repository; trivy scan passes clean
**Depends on**: Phase 2
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05
**Success Criteria** (what must be TRUE):
  1. `trivy image annotation-app:hardened` reports 0 CRITICAL and 0 HIGH vulnerabilities
  2. `docker build -t annotation-app:hardened .` completes without error
  3. `docker run --rm -p 8080:80 annotation-app:hardened` serves the annotation app at `http://localhost:8080/data-annotation/` with HTTP 200
  4. `curl -I http://localhost:8080/data-annotation/` response headers include `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and do not expose `Server: nginx/...` version string
  5. The container runs as non-root (uid 101, the `nginx` user); `docker inspect --format='{{.Config.User}}'` returns `nginx` or `101`
**Plans**: 1 plan
Plans:
- [ ] 03-00-PLAN.md — Dockerfile (node:22-alpine + nginx:1.27-alpine), nginx.conf security headers, .dockerignore, trivy verification

*Note: Annotation Round Flow (FLOW-01–FLOW-09, TIMER-01–TIMER-03) was fully implemented in the codebase prior to Phase 3 planning (all components present: RegisterScreen, TutorialScreen, EmailDisplay, AnnotationForm, FeedbackScreen, Timer, useAnnotationState, App.jsx). Those 12 requirements are satisfied but were not planned through GSD.*

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
| 2. Scoring Engine | 1/1 | Done | 2026-06-08 |
| 3. Nginx Container Security Hardening | 0/1 | Not started | - |
| 4. Results, Efficiency Stats & Design | 0/TBD | Not started | - |
| 5. Admin Panel, Reviewer & Integrity | 0/TBD | Not started | - |
| 6. QA & Polish | 0/TBD | Not started | - |
