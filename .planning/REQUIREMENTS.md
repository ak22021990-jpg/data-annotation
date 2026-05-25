# Requirements: Email Abuse Annotation Test

**Defined:** 2026-05-22
**Core Value:** A candidate can complete a realistic email-abuse annotation test and receive an automatic, defensible score plus a per-scenario breakdown that a reviewer can trust.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Setup & Content

- [ ] **SETUP-01**: Project scaffolds as a React 19 + Vite 7 plain-JS app with `base: '/annotation/'`
- [ ] **SETUP-02**: ESLint flat config bans flagmail1 terminology (`flag`, `zone`, `clue`, `hint`, `classif`, `moderat`)
- [ ] **SETUP-03**: The 10 scenarios load from a static `src/data/scenarios.js` data file
- [ ] **SETUP-04**: The annotation taxonomy (5 severity, 10 signals, 4 actions) lives in `src/data/taxonomy.js` as the single source of truth
- [ ] **CONTENT-01**: All 10 scenario answer keys are verified and corrected for severity/signals/action accuracy
- [ ] **CONTENT-02**: Scenario 9 includes the `auth-fail` signal in both model answer and scoring rubric (context states SPF/DKIM fail)
- [ ] **CONTENT-03**: All scoring rubrics are internally consistent — every required/partial signal exists in the taxonomy, every model-answer signal contributes to scoring weight

### Scoring

- [ ] **SCORE-01**: A pure `scoreRound()` function scores one annotation: severity, signals, action, 0–3 points with 0.5 partial credit
- [ ] **SCORE-02**: Scenarios with no required signals award full signal credit only when the candidate selects nothing (or `none-detected`)
- [ ] **SCORE-03**: Total score aggregates to 30 max; `displayScore` is `round((total/30)*100)`
- [ ] **SCORE-04**: Results are banded into Foundation / Proficient / Advanced titles by calibrated displayScore thresholds
- [ ] **SCORE-05**: Scoring is deterministic — no external API call at grade time
- [ ] **SCORE-06**: Scoring weights and band thresholds are calibrated for hiring accuracy — severity, signal, and action point contributions tuned to differentiate candidate skill levels

### Test Flow

- [ ] **FLOW-01**: Candidate registers with name and email on a landing screen before starting
- [ ] **FLOW-02**: A tutorial screen explains how to annotate before scenarios begin
- [ ] **FLOW-03**: Candidate works through 10 flat scenarios with a progress bar
- [ ] **FLOW-04**: Each scenario renders the reported email — From, Reply-To, To, Subject, body — with a Reply-To mismatch visually highlighted
- [ ] **FLOW-05**: Each scenario shows any annotator context note when present
- [ ] **FLOW-06**: Candidate sets severity, selects abuse signals (multi-select), and chooses a recommended action
- [ ] **FLOW-07**: Submit is locked until severity and action are both chosen
- [ ] **FLOW-08**: After submitting, the candidate sees per-scenario feedback with the model-answer reasoning
- [ ] **FLOW-09**: Candidate advances scenario by scenario; after scenario 10 the test moves to results

### Timer

- [ ] **TIMER-01**: Each scenario runs a 2-minute countdown timer
- [ ] **TIMER-02**: When the timer expires, the current annotation auto-submits with whatever is selected (including nothing)
- [ ] **TIMER-03**: The timer countdown is shown to the candidate during each scenario

### Results & Persistence

- [ ] **RESULT-01**: A results screen shows total score, displayScore percentage, band/title, and a per-scenario breakdown
- [ ] **RESULT-02**: Registration and final score submit to a Google Apps Script + Google Sheets backend
- [ ] **RESULT-03**: The full submission payload is written to `localStorage` before every backend POST as a data-loss safeguard
- [ ] **STATS-01**: Candidate efficiency statistics display hiring-relevant metrics: overall accuracy %, time efficiency, signal detection rate, and severity judgment accuracy
- [ ] **STATS-02**: Efficiency metrics are computed from the candidate's annotation data and shown on the results screen

### Reviewer & Integrity

- [ ] **REV-01**: A reviewer screen is gated behind a shared passcode
- [ ] **REV-02**: The reviewer screen shows candidate results including proctoring violation counts
- [ ] **PROCTOR-01**: Tab-switch / focus-loss violations are tracked during the test
- [ ] **PROCTOR-02**: Proctoring violations accumulate across all 10 scenarios and are included in the score submission

### Admin

- [ ] **ADMIN-01**: Admin panel accessible at `/annotation/admin` route
- [ ] **ADMIN-02**: Admin panel displays a list of all candidates with their scores, bands, and efficiency metrics
- [ ] **ADMIN-03**: Admin can view detailed individual candidate report showing per-scenario breakdown and annotation answers
- [ ] **ADMIN-04**: Admin can download individual candidate report (PDF or CSV)
- [ ] **ADMIN-05**: Admin can download overall report summarizing all candidates' results and efficiency metrics
- [ ] **ADMIN-06**: Admin panel is protected — unauthorized access redirects to candidate flow or shows access denied

### Routing

- [ ] **ROUTE-01**: Lightweight router handles `/annotation` (candidate flow) and `/annotation/admin` (admin panel)
- [ ] **ROUTE-02**: Router does not interfere with existing navigation within the candidate flow

### Badges & Design

- [ ] **BADGE-01**: Badge art and animations are reused from flagmail1
- [ ] **BADGE-02**: Badge unlock conditions are redefined for the flat 10-scenario flow (accuracy, speed, perfect-run triggers)
- [ ] **DESIGN-01**: The app reuses flagmail1's visual theme, design tokens, and component styling
- [ ] **DESIGN-02**: All candidate-facing copy uses annotation terminology — no moderation/classification/flag/hint/zone language

### Quality

- [ ] **QA-01**: Pill-based multi-select controls are accessible (`role`, `aria-checked`/`aria-pressed`, keyboard operable)
- [ ] **QA-02**: Scoring is verified against all 10 scenarios' correct-answer and partial-answer paths
- [ ] **QA-03**: The timer auto-submit path is verified to not double-submit or drop the final scenario

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics

- **ANALYTICS-01**: Per-category competency breakdown on the results screen
- **ANALYTICS-02**: Time-on-task analytics per scenario

### Reviewer

- **REV-03**: Reviewer write-back of hiring decisions to Google Sheets

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Zones / zone intro / zone-complete screens | Flat 10-scenario flow chosen; zones add no value |
| SOC investigation level / SPL query writing | flagmail1 mechanic not carried into annotation |
| Classifier (L1/L2 category picker) | Annotation form replaces it; category test is separate |
| Clue / hint system and hint button | Explicitly removed by request |
| Free-text notes / reasoning field | Annotation is severity + signals + action only |
| New scenarios beyond the fixed 10 | Content is locked — verify only |
| New backend service | Reuse existing Google Apps Script + Sheets pattern |
| TypeScript / router / state library / CSS framework | Match flagmail1 plain-JS conventions |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1 | Done |
| SETUP-02 | Phase 1 | Done |
| SETUP-03 | Phase 1 | Done |
| SETUP-04 | Phase 1 | Done |
| CONTENT-01 | Phase 1 | Done |
| CONTENT-02 | Phase 1 | Done |
| CONTENT-03 | Phase 1 | Done |
| SCORE-01 | Phase 2 | Pending |
| SCORE-02 | Phase 2 | Pending |
| SCORE-03 | Phase 2 | Pending |
| SCORE-04 | Phase 2 | Pending |
| SCORE-05 | Phase 2 | Pending |
| SCORE-06 | Phase 2 | Pending |
| FLOW-01 | Phase 3 | Pending |
| FLOW-02 | Phase 3 | Pending |
| FLOW-03 | Phase 3 | Pending |
| FLOW-04 | Phase 3 | Pending |
| FLOW-05 | Phase 3 | Pending |
| FLOW-06 | Phase 3 | Pending |
| FLOW-07 | Phase 3 | Pending |
| FLOW-08 | Phase 3 | Pending |
| FLOW-09 | Phase 3 | Pending |
| TIMER-01 | Phase 3 | Pending |
| TIMER-02 | Phase 3 | Pending |
| TIMER-03 | Phase 3 | Pending |
| RESULT-01 | Phase 4 | Pending |
| RESULT-02 | Phase 4 | Pending |
| RESULT-03 | Phase 4 | Pending |
| STATS-01 | Phase 4 | Pending |
| STATS-02 | Phase 4 | Pending |
| ADMIN-01 | Phase 5 | Pending |
| ADMIN-02 | Phase 5 | Pending |
| ADMIN-03 | Phase 5 | Pending |
| ADMIN-04 | Phase 5 | Pending |
| ADMIN-05 | Phase 5 | Pending |
| ADMIN-06 | Phase 5 | Pending |
| ROUTE-01 | Phase 5 | Pending |
| ROUTE-02 | Phase 5 | Pending |
| BADGE-01 | Phase 4 | Pending |
| BADGE-02 | Phase 4 | Pending |
| DESIGN-01 | Phase 4 | Pending |
| DESIGN-02 | Phase 4 | Pending |
| REV-01 | Phase 5 | Pending |
| REV-02 | Phase 5 | Pending |
| PROCTOR-01 | Phase 5 | Pending |
| PROCTOR-02 | Phase 5 | Pending |
| QA-01 | Phase 6 | Pending |
| QA-02 | Phase 6 | Pending |
| QA-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-22*
*Last updated: 2026-05-25 after scope change: admin panel, efficiency stats, router, scoring tweaks*
