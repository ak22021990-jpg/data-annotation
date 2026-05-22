# Research Summary: Email Abuse Annotation Test

**Synthesized:** 2026-05-22
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
**Overall confidence:** HIGH — stack, architecture, and content spec come directly from first-party files (flagmail1 codebase + HTML prototype).

## Executive Summary

A custom browser-based hiring assessment presenting 10 email-abuse annotation scenarios
under a 2-minute per-scenario timer, scored on a deterministic three-component rubric
(severity + signals + action, max 3 pts/scenario, 30 total). The approach is a deliberate
mirror of the sibling codebase `flagmail1`: React 19 + Vite 7 + plain JS, a `SCREENS`
enum state machine with no router, one hook per concern composed in `App.jsx`, and a
Google Apps Script + Google Sheets backend.

Treat this as an **adaptation project, not greenfield**. Roughly half the components and
all four key hooks (`useTimer`, `useBadges`, `useLeaderboard`, `useProctoring`) are
direct reuses from flagmail1. New work concentrates in the scoring engine, the annotation
form, the email display with Reply-To mismatch highlighting, and the content data layer.
Scope is fixed — 14 MVP features, all P1, no iterative roadmap. Partial delivery has no
value for a hiring screen.

Dominant risks: **content correctness** and **integration reliability**. The HTML
prototype's answer keys contain 7 inconsistencies across 10 scenarios — including a
critical gap in Scenario 9. These must be fixed before any code is written. GAS silent
data loss is the second major risk.

## Recommended Stack

- **React 19.2 + Vite 7.3** — exact match to flagmail1; Vite 8 / framer-motion v12 upgrades deferred post-launch
- **animejs v3.2 (LOCKED)** — do NOT bump to v4 (breaking API rewrite)
- **GSAP 3.x** — semver-stable, auto-resolves to 3.15.0
- **Google Apps Script + Sheets** — zero-cost backend; action-dispatch pattern identical to flagmail1, schema adapted for annotation scores
- **Not used:** TypeScript, React Router, Redux/state library, Tailwind/CSS framework, new backend service
- One required deviation from a literal flagmail1 copy: `base: '/annotation/'` in `vite.config.js`

## Table Stakes (all P1, fixed scope)

Registration, tutorial, 10-scenario flow + progress bar, email display with Reply-To
highlight, per-scenario context note, three-field annotation form (severity/signals/
action), submit lock on severity+action, 2-minute timer with auto-submit, partial-credit
scoring, per-scenario feedback, results screen with band/title, badge system,
leaderboard, passcode-gated reviewer screen, proctoring (tab-switch tracking), GAS backend.

**Differentiators in scope:** Reply-To mismatch highlight (fairness mechanism),
scenario-specific required vs partial signal sets, Foundation/Proficient/Advanced band
vocabulary, animated score reveal, violation count in reviewer screen.

**Anti-features (explicitly excluded):** free-text notes, hints/clues, zones, SOC/SPL
queries, L1/L2 classification.

**Defer to v2+:** per-category competency breakdown, time-on-task analytics, reviewer
write-back to Sheets.

## Architecture

- 6-screen state machine: `LANDING → TUTORIAL → ROUND (x10, EXPLANATION between each) → RESULTS`, plus `REVIEWER` from landing. No zones, no SOC screens.
- `useGameState` → `useAnnotationState`: drop zone state; round state holds `severity`/`signals`/`action`; `advanceZone` → `nextScenario` (checks `scenarioIndex === 9`).
- No Context API — prop drilling acceptable. All annotation state in `useAnnotationState` (fully controlled form pattern — `AnnotationForm` has no internal state, so the timer's auto-submit can read current answers).
- Pure `scoreRound()` in `src/utils/scoring.js`. Static scenario array in `src/data/scenarios.js`; taxonomy in `src/data/taxonomy.js` (5 severity, 10 signals, 4 actions).
- Scoring: 3 pts/scenario (1 severity + 1 signals + 1 action), 0.5 partial. Special case: scenarios with `required signals = []` award full signal credit only if candidate selects nothing (over-annotation is itself a mistake). `MAX_SCORE = 30`, `displayScore = round((total/30)*100)`.
- Build order: data → config → pure utils → hooks → leaf components → screens → App.jsx.

## Top Pitfalls

1. **Scenario 9 `auth-fail` critical omission** — context says "SPF fails. DKIM fails." but `auth-fail` is absent from both the model answer and the scoring rubric. Fix all 7 inconsistencies in `scenarios.js` before writing scoring code. (Others: S4 `financial-harm` gap, S7 `urgency`/`impersonation` gap, S2 `spoofed-sender` evidence gap, S5/S8 empty `severity.partial`.)
2. **Timer auto-submit race** — use a `useRef` submitted flag mutated synchronously; check the ref (not state) in the timer callback; call `clearInterval` inside `submit()` first.
3. **GAS silent data loss** — `no-cors` fetch gives no success signal. Write the full payload to `localStorage` keyed by email before every GAS POST.
4. **Stale flagmail1 terminology** — add an ESLint `no-restricted-syntax` rule banning `flag`/`zone`/`clue`/`classif`/`hint`/`moderat` at Phase 1 setup, before any component is copied.
5. **Signal taxonomy ID drift** — build `taxonomy.js` by direct copy from the HTML prototype with zero ID modification; validate every `scoring.signals.required` value against taxonomy IDs at import time.

Accessibility: pill multi-select needs `role="checkbox"` + `aria-checked`; `none-detected` should be mutually exclusive with other signals in the UI.

## Suggested Phases (6)

1. **Project Setup + Content Audit** — scaffold, ESLint banned-terminology rule, fix all 7 rubric inconsistencies in `scenarios.js`, `taxonomy.js` as single source of truth, config constants. Zero UI, highest leverage.
2. **Scoring Engine** — pure `scoreRound()` + `useScoring.js` + unit tests (none-detected mutual exclusion, band boundary on raw value, timer-expiry partial path).
3. **Annotation Round Flow** — `useAnnotationState`, `useTimer` (reuse), `EmailCard` (Reply-To highlight), `ContextNote`, `AnnotationForm` (controlled, accessible pills), `TimerBar` (reuse), `ProgressBar`, `AnnotationRound`.
4. **Feedback + Results** — `ExplanationCard`, `ResultsScreen`, `LandingScreen` (reuse + copy changes), `TutorialScreen` (new), `useBadges` (reuse, redefine unlock conditions), badge components, score reveal, `App.jsx` wiring.
5. **Backend + Reviewer** — GAS adaptation (annotation schema), `localStorage` backup before POST, `useLeaderboard`/`Leaderboard` (reuse), `useProctoring` (new, session-accumulating), `ReviewerScreen` (passcode gate, per-scenario rows).
6. **QA + Polish** — axe-core scan, VoiceOver test, Playwright timer-race test, scoring verification all 10 scenarios, banned-terminology grep audit, band boundary test, localStorage recovery test.

## Research Flags

- **Phase 5 needs research:** GAS `LockService` concurrent-write behaviour; confirm GAS `Utilities.computeDigest` SHA-256 hex format matches browser `crypto.subtle` for passcode comparison.
- **Phases 1–4, 6:** standard patterns sourced from flagmail1 / HTML prototype — no research phase needed.

## Open Questions for Roadmap

- Badge unlock conditions for the flat flow need precise trigger logic before Phase 4 (e.g. "all signals correct on a critical scenario", "no timeouts across 10", "first submission perfect").
- S2 `spoofed-sender` required vs partial is a content judgment call — needs domain-expert sign-off before `scenarios.js` is finalised in Phase 1.
- Band thresholds (80% / 60%) inherited from the HTML prototype — confirm or recalibrate for the annotation task type.
