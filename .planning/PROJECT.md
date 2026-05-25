# Email Abuse Annotation Test

## What This Is

A browser-based hiring screening test for the Apple Email Abuse Annotation team.
Candidates work through 10 reported-email scenarios — reading full headers, body, and
any annotator context note — and fill an annotation form for each: severity, abuse
signals, and recommended action. The test auto-scores every annotation, shows a
per-scenario results breakdown, and exposes an admin panel for hiring managers to
review candidate efficiency and download reports.

It is a fresh React rebuild that reuses the **visual theme and design language** of the
sibling project `flagmail1` — but not its game mechanics. The content and game logic
come from the standalone `apple_email_abuse_annotation_workspace` HTML prototype.

## Core Value

A candidate can complete a realistic email-abuse annotation test and receive an
automatic, defensible score plus a per-scenario breakdown that a reviewer can trust.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Candidate registers (name + email) on a landing screen before starting
- [ ] Tutorial screen explains how to annotate before scenarios begin
- [ ] Candidate works through 10 flat scenarios with a progress bar
- [ ] Each scenario renders the reported email (From, Reply-To, To, Subject, body) and any annotator context note
- [ ] Annotation form per scenario: severity, abuse signals (multi-select), recommended action
- [ ] Per-scenario countdown timer (2 minutes max) that auto-submits on expiry
- [ ] Automatic scoring with partial credit, using a flagmail1-adapted points/displayScore model
- [ ] Per-scenario feedback showing the model answer reasoning after submission
- [ ] Results screen with total score, band/title (Foundation / Proficient / Advanced), and per-scenario breakdown
- [ ] Badge system reusing flagmail1 badge art/animations with unlock conditions redefined for the flat annotation flow
- [ ] Candidate efficiency statistics showing hiring-relevant performance metrics (accuracy, time, signal detection rate)
- [ ] Admin panel at `/annotation/admin` for reviewing candidate results and downloading individual/overall reports
- [ ] Reviewer screen (passcode-gated) showing candidate results and proctoring violations
- [ ] Proctoring: track tab-switch / focus-loss violations during the test
- [ ] Google Apps Script + Sheets backend for registration and score submission
- [ ] All email-moderation / classification / "flag" language rephrased to annotation terminology
- [ ] All 10 scenario answer keys and signal-taxonomy rubrics verified for correctness

### Out of Scope

- Zones / zone intro / zone-complete screens — flat 10-scenario flow chosen instead
- SOC investigation level / SPL query writing — flagmail1 mechanic not carried over
- Classifier (L1/L2 category picker) — annotation form replaces it
- Clue / hint system and hint button — explicitly removed
- Free-text notes / reasoning field — annotation is severity + signals + action only
- Adding new scenarios beyond the fixed 10 — content is locked, verify only
- New backend service — reuse the existing Google Apps Script + Sheets pattern

## Context

- **Sibling project** `flagmail1` (`../flagmail1`) — a polished React 19 + Vite hiring
  game for email abuse classification. Source of the visual theme, design tokens, and
  component styling to reuse. Its game mechanics (zones, SOC level, classifier, clues)
  are deliberately *not* reused.
- **Content source** `apple_email_abuse_annotation_workspace (1).html` — standalone
  single-file prototype holding the 10 scenarios, signal taxonomy, scoring logic, and
  results screen. This is the authoritative content/game-logic spec.
- **Origin** `Claude.pdf` — the manager's chat that generated the HTML prototype. The
  test deliberately excludes classification questions (a separate test covers category
  annotation) and focuses on severity, signal identification, edge-case judgment, and
  action selection.
- The annotation form taxonomy: 5 severity levels, 10 abuse signals, 4 recommended
  actions. Scenarios span obvious phishing, Reply-To spoofing, legitimate Apple emails
  wrongly reported, spam-vs-phishing edge cases, a tech-support scam targeting an
  elderly user, and genuinely ambiguous over-labelling traps.

## Constraints

- **Tech stack**: React 19 + Vite + plain JavaScript — no TypeScript, lightweight router
  for `/annotation` and `/annotation/admin` routes, no state library, no CSS framework.
  Match flagmail1's hook/component conventions.
- **Backend**: Reuse the Google Apps Script + Sheets integration pattern — no new
  backend service.
- **Auth**: Reviewer access is a shared passcode only — no identity provider.
- **Scoring**: Must be deterministic (no external API at grade time).
- **Content**: The 10 scenarios are fixed — verify and correct answer keys, do not
  add or remove scenarios.
- **Design**: Reuse flagmail1's theme and design language; do not reuse its game
  structure.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full React 19 + Vite rebuild in `annotation/` | Match flagmail1 quality; HTML prototype too thin to ship | — Pending |
| Reuse flagmail1 theme/design only, not mechanics | Annotation is a different task than classification | — Pending |
| Flat 10-scenario flow, no zones | Content is 10 flat scenarios; zones add no value | — Pending |
| Per-scenario 2-minute timer with auto-submit | Realistic time pressure per case | — Pending |
| flagmail1-adapted scoring model | Reuse proven points/displayScore + title bands | — Pending |
| Annotation form: severity + signals + action only | Notes field unused in prototype; not required | — Pending |
| No hint/clue button | Explicitly removed by request | — Pending |
| Reuse flagmail1 badge art, redefine unlock conditions | No zones/streaks to trigger original badges | — Pending |
| Keep Google Apps Script + Sheets backend | No new backend; reuse working pattern | — Pending |
| Include proctoring (tab-switch tracking) | Reviewer needs integrity signal for hiring | — Pending |
| Add lightweight router | Admin panel needs separate route at `/annotation/admin` | — Pending |
| Replace leaderboard with candidate efficiency stats | Hiring test is one-time; efficiency metrics more useful than ranked scores | — Pending |
| Tweak scoring weights/thresholds | Existing scoring model needs calibration for hiring accuracy | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-25 after scope change: admin panel, efficiency stats, router, scoring tweaks*
