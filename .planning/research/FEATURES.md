# Feature Research

**Domain:** Browser-based hiring screening / annotation assessment tool (email-abuse annotation)
**Researched:** 2026-05-22
**Confidence:** HIGH — based on direct reading of PROJECT.md, HTML prototype (authoritative content spec), and flagmail1 sibling codebase

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist for the test to be credible as a hiring screen. Missing any of these breaks the core use case.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Candidate registration (name + email) | Every proctored/scored assessment captures identity for results attribution | LOW | Mirrors `LandingScreen.jsx` in flagmail1; name+email only, no auth |
| Tutorial / instructions screen | Candidates need to understand the annotation task before being timed; cold-starting into a timed form is disqualifying | LOW | One static screen; explain severity, signals, action fields and that timer is per-scenario |
| Email display with full headers | The annotation task depends on reading From, Reply-To, To, Subject, body — missing Reply-To is a critical gap for spoofing scenarios | LOW | The HTML prototype highlights Reply-To in red when it differs from From; that visual signal is part of the test |
| Annotator context note per scenario | 7 of 10 scenarios include a reporter note that changes the correct answer (e.g. "app is still live", "user is 71 years old") | LOW | Rendered as a labelled callout block, not inline with email body |
| Three-field annotation form (severity, signals, action) | This is the test itself; the annotation form IS the product | MEDIUM | Severity = single-select 5 options; Signals = multi-select 10 options; Action = single-select 4 options; signals allow zero selections (legitimate emails) |
| Submit button locked until severity + action selected | Prevents blank submissions that score zero and give no signal; signals are optional (legitimate emails have none) | LOW | Signals are optional by design — some correct answers require selecting zero signals |
| Per-scenario countdown timer (2 min) with auto-submit | Time pressure is the hiring signal; unlimited time removes the assessment value | MEDIUM | Timer must reset per scenario; auto-submit on expiry with whatever state is selected (partial credit still applies) |
| Auto-submit fires current form state on timeout | If nothing is selected, score 0; if partial selections exist, partial credit applies | LOW | This is a correctness requirement, not a UX feature — the timer callback calls submit with current state |
| Per-scenario feedback shown after submission | Candidates need to learn from each scenario; showing reasoning builds trust in the scoring | LOW | Show: points earned, pass/partial/fail label, model answer reasoning paragraph |
| Progress bar across 10 scenarios | Candidates need orientation in a fixed-length test; no progress bar feels broken | LOW | Simple percentage fill; `(cur+1)/10 * 100%` |
| Total score with band/title on results screen | Hiring decision requires a defensible summary; raw points alone are ambiguous | LOW | Three bands from prototype: Strong pass (>=80%), Borderline (>=60%), Does not meet threshold (<60%). PROJECT.md maps to Foundation/Proficient/Advanced |
| Per-scenario score breakdown on results screen | Reviewer needs to see where the candidate failed, not just the total | LOW | Score per scenario (e.g. 2.5/3) + pass/partial/fail label |
| Leaderboard of candidate scores | Provides competitive context; expected by any assessment that has a registration step | MEDIUM | Fetch from Google Sheets via GAS; show name, score, band, timestamp |
| Passcode-gated reviewer screen | Hiring manager needs a separate view that candidates cannot access | MEDIUM | Client-side passcode check is sufficient for the stated use case (shared passcode, no identity provider); sends passcode to GAS which validates server-side |
| Proctoring: tab-switch / focus-loss violation tracking | Reviewer needs an integrity signal; without it, the test is open-book | LOW | `useProctoring` hook already exists in flagmail1; detection is informational only (browsers cannot block tab switching); show violation count in reviewer screen per candidate |
| Google Apps Script + Sheets backend for registration and score submission | Enables reviewer access to results without deploying a backend service | MEDIUM | Two GAS actions: `register` (name+email) and `submitScore` (full annotation payload + violations); reviewer fetches with `getAnnotationSubmissions` action |
| Annotation terminology throughout (not "flag", "classify", "clue") | Candidates from annotation backgrounds expect domain language; "flag" and "classify" are from a different task | LOW | Global text pass; all flagmail1 game-mechanics language must be replaced |

---

### Differentiators (Competitive Advantage)

Features that distinguish this tool from a generic quiz or a plain HTML form. Not required for basic credibility, but elevate the candidate experience and reviewer confidence.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Partial credit scoring on multi-select signals taxonomy | Deterministic partial credit is fairer than all-or-nothing; rewards candidates who identify the core signals even if they miss secondary ones | MEDIUM | Three-component score per scenario (severity 0/0.5/1 pt, signals 0/0.5/1 pt, action 0/0.5/1 pt); total 3 pts/scenario, 30 pts max; partial thresholds defined per scenario in answer key |
| Reply-To / From mismatch visual highlight | 3 of 10 scenarios hinge on noticing the Reply-To header; surfacing it visually makes the test fair without giving the answer away | LOW | Render Reply-To in a distinct color (amber/red) only when it differs from From — replicates the prototype behavior |
| Scenario-specific signals scoring (required vs partial sets) | Different scenarios have different required and partial signal sets; this makes scoring nuanced and defensible rather than mechanical | MEDIUM | Scoring logic from prototype: `required` signals all matched = 1pt; any `partial` signals matched = 0.5pt; zero-signal correct answers scored differently (select none or "no-abuse-signals" = 1pt) |
| Band/title system (Foundation / Proficient / Advanced) | Translates raw score into a hiring vocabulary the team already uses; removes ambiguity | LOW | Threshold percentages from PROJECT.md; compute from `displayScore` (0-100 normalized) |
| Badge system reusing flagmail1 art with annotation-appropriate conditions | Provides micro-celebrations that make the experience feel polished relative to a plain form | HIGH | Badge unlock conditions must be redefined for flat annotation flow (no zones, no streaks-by-category, no clue reveals); candidate-appropriate triggers: first perfect scenario, all signals correct on hardest case, no timeouts, finishing under budget time per scenario |
| Per-scenario reasoning explanation (model answer) | Shows candidates why their annotation was scored the way it was; builds trust in the assessment and reduces candidate complaints | LOW | Already in the HTML prototype as `answer.reasoning`; render in a styled feedback panel after submission |
| Animated score reveal on results screen | Reinforces the "this is a real assessment, not a Google Form" perception; reuse GSAP counter from flagmail1 | LOW | GSAP number tween already implemented in flagmail1 `GameRound.jsx` score display |
| Violation count surfaced in reviewer screen per candidate | Gives reviewer a lightweight integrity signal without accusing the candidate; reviewer decides what weight to give it | LOW | Store as integer field in Sheets; display inline with candidate row in reviewer table |

---

### Anti-Features (Deliberately Excluded — Cross-Checked With PROJECT.md Out of Scope)

Features that seem natural but are explicitly out of scope or actively harmful to the stated goals.

| Feature | Why Requested | Why Problematic | Alternative / What to Do Instead |
|---------|---------------|-----------------|-----------------------------------|
| Free-text notes / reasoning field | Candidates might want to explain their thinking; reviewers might want richer signal | Introduces subjectivity, makes scoring non-deterministic, and adds reviewer burden; the assessment goal is to score annotation judgment, not written justification | The model answer reasoning shown post-submission gives candidates the explanation they need; reviewers get the scoring rubric |
| Hint / clue button | Candidates in a training context appreciate hints | Explicitly removed by request; hints destroy the assessment signal (does the candidate know this, or did they need help?) | Tutorial screen sets expectations; per-scenario feedback teaches post-submission |
| Zone intro / zone-complete screens | Flagmail1 uses zones; they add narrative structure | Content is 10 flat scenarios with no natural zone boundaries; adding artificial zones would confuse candidates and add nav complexity | Simple progress bar and scenario counter give sufficient orientation |
| SOC investigation level / SPL query writing | Flagmail1 SOC milestone adds depth | Different test, different team; SPL query evaluation is out of scope for annotation screening | A separate test exists for SOC investigation (that is what flagmail1 covers) |
| L1/L2 category classifier | Flagmail1 uses a two-level category picker | The annotation form (severity+signals+action) replaces classification; conflating the two creates a confusing hybrid | Annotation form is the correct UI for this task |
| New scenarios beyond the fixed 10 | More scenarios = more coverage | Content is locked per PROJECT.md; adding unverified scenarios introduces scoring reliability risk | Verify and correct the existing 10 answer keys instead |
| New backend service | A proper API would be more robust | Adds infrastructure maintenance burden; GAS + Sheets already works and is the stated constraint | Reuse the GAS pattern from flagmail1; extend with annotation-specific actions |
| Open retake after results | Candidates often want to retry | Allows score gaming; undermines hiring signal; the leaderboard would be polluted by retry scores | Show results only; "retake" is a reviewer decision made outside the tool |
| AI/LLM scoring for signals | Could handle nuanced or unexpected inputs | Introduces non-determinism; legal and fairness risk for hiring decisions; latency | Deterministic rubric with partial credit is sufficient and auditable |
| Real-time collaborative review | Multiple reviewers simultaneously reviewing results | Adds significant complexity for a use case that is asynchronous by nature | Reviewer screen fetches current Sheets state on load; refresh is sufficient |
| Timer pause / resume | Feels fair if a candidate has a technical issue | Destroys time-pressure signal; creates support burden; easy to abuse | Make timer and auto-submit robust; document that no pause exists in tutorial |
| Identity-provider authentication | "More secure" reviewer access | Unnecessary complexity for a shared hiring tool; a strong passcode is adequate | Environment variable or hardcoded passcode validated server-side in GAS |
| Per-category competency analysis (like flagmail1 CompetencySummary) | Shows candidate which signal types they struggle with | This annotation test has 10 scenarios, not enough volume for per-category statistical signal; also the categories here are severity bands, not L1 categories | Show per-scenario score breakdown instead; reviewer interprets patterns manually |

---

## Feature Dependencies

```
Registration (name + email)
    └──required-before──> Test start
                              └──required-before──> Scenario display
                                                        └──required-before──> Annotation form
                                                                                  └──required-before──> Per-scenario scoring
                                                                                                            └──required-before──> Per-scenario feedback
                                                                                                                                      └──required-before──> Results screen
                                                                                                                                                                └──required-before──> Score submission to GAS

Timer (per-scenario)
    └──activates-with──> Scenario display
    └──triggers──> Auto-submit on expiry

Proctoring (tab-switch tracking)
    └──active-during──> Test (scenario 1 through 10)
    └──accumulated-into──> Score submission payload
    └──displayed-in──> Reviewer screen

Passcode gate
    └──guards──> Reviewer screen
    └──validated-by──> GAS server-side check

Leaderboard
    └──reads-from──> GAS Sheets (same sheet as score submissions)
    └──displayed-on──> Results screen (post-submission) AND as standalone tab

Badge system
    └──evaluated-after──> Each scenario submission AND after all 10 complete
    └──depends-on──> Per-scenario score records
    └──reuses──> flagmail1 badge art (Lottie JSON assets)

GAS backend
    └──accepts──> register action (name, email)
    └──accepts──> submitAnnotation action (name, email, perScenario[], totalScore, violations)
    └──accepts──> getAnnotationSubmissions action (passcode-gated)
    └──writes-to──> Google Sheets
```

### Dependency Notes

- **Signals are optional at submission time**: severity + action are required to unlock the submit button; signals are not. This is by design — legitimate email scenarios have zero correct signals.
- **Auto-submit on timer expiry**: the timer's `onTimeout` callback must invoke the same submit path as the manual submit button, with whatever partial state exists. Scoring handles incomplete state (null selections = 0 points for that component).
- **Proctoring violations accumulate across all 10 scenarios**: unlike flagmail1 (which resets per email), this test should track total violations across the entire session, plus optionally per-scenario for reviewer context.
- **Leaderboard depends on submissions**: leaderboard is read-only until at least one candidate submits; GAS should return empty array rather than an error if the sheet has no rows.
- **Badge conditions depend on per-scenario records**: badge check must run after each scenario submission with access to the full `perScenario` history; badge toast must not overlap with per-scenario feedback panel.

---

## MVP Definition

### Launch With (v1)

All PROJECT.md active requirements constitute the MVP. This is a fixed-scope rebuild, not an iterative product. Every feature below is required before the tool is usable for hiring.

- [x] Registration — without it, scores cannot be attributed
- [x] Tutorial — without it, timed annotation is unfair
- [x] 10 scenario flow with progress bar — the test itself
- [x] Email display with full headers and context note — the stimulus
- [x] Annotation form (severity + signals + action) — the response mechanism
- [x] Per-scenario 2-minute timer with auto-submit — the time-pressure signal
- [x] Deterministic partial-credit scoring (3 pts/scenario, 30 pts max) — the grade
- [x] Per-scenario feedback with reasoning — the learning/trust mechanism
- [x] Results screen with total score, band/title, per-scenario breakdown — the hiring output
- [x] Badge system (reused flagmail1 art, redefined unlock conditions) — polished experience
- [x] Leaderboard — comparative context
- [x] Reviewer screen (passcode-gated) with candidate results and violation count — the hiring decision tool
- [x] Proctoring (tab-switch tracking) — integrity signal for reviewer
- [x] GAS + Sheets backend — persistence without a backend service

### Add After Validation (v1.x)

None specified. Content is locked. Scope is fixed. Post-launch changes require a new PROJECT.md revision.

### Future Consideration (v2+)

Deferred features that are explicitly out of scope or require separate validation:

- [ ] Per-category competency breakdown — requires more scenarios for statistical validity
- [ ] Time-on-task analytics per scenario — requires additional GAS instrumentation
- [ ] Reviewer note / annotation on candidate records — requires write-back to Sheets from reviewer screen

---

## Feature Prioritization Matrix

| Feature | Candidate Value | Implementation Cost | Priority |
|---------|-----------------|---------------------|----------|
| Registration | HIGH | LOW | P1 |
| Tutorial | HIGH | LOW | P1 |
| Email + annotation form | HIGH | MEDIUM | P1 |
| Per-scenario timer with auto-submit | HIGH | MEDIUM | P1 |
| Deterministic partial-credit scoring | HIGH | MEDIUM | P1 |
| Per-scenario feedback | HIGH | LOW | P1 |
| Results screen with band | HIGH | LOW | P1 |
| GAS + Sheets backend | HIGH | MEDIUM | P1 |
| Reviewer screen (passcode-gated) | HIGH (for reviewer) | MEDIUM | P1 |
| Proctoring (tab-switch) | MEDIUM (for reviewer) | LOW | P1 |
| Leaderboard | MEDIUM | MEDIUM | P1 |
| Badge system | LOW-MEDIUM | HIGH | P1 (committed) |
| Reply-To mismatch highlight | MEDIUM | LOW | P1 (fairness) |
| Animated score reveal | LOW | LOW | P2 |

**Priority key:** All features are P1 because they are all in PROJECT.md Active requirements. There is no P3 because scope is fixed.

---

## Implementation Best Practices Per Feature

### Timed Assessment Auto-Submit

**What "good" looks like:**
- Timer is per-scenario, resets when scenario advances, starts immediately when scenario is displayed
- `onTimeout` callback fires the same code path as manual submit — no special case, no separate state branch
- Auto-submit fires with current form state (partial state scores partial credit; null severity = 0 severity points, etc.)
- Timer stops when the scenario is submitted (manually or via timeout) — timer must not continue ticking on the feedback view
- Visual phases: green (>15s remaining), amber (>5s), red (<=5s) — matches flagmail1's `useTimer` phase logic
- A clock label ("1:45") is displayed alongside the timer bar — candidates need to know how much time they have, not just a shrinking bar
- The timer hook (`useTimer`) is already implemented in flagmail1 with the `start/stop/reset` API and `onTimeout` ref pattern — reuse directly

**Pitfall:** Do not call `stop()` inside `onTimeout` — the interval is already cleared before `onTimeout` fires (see flagmail1 `useTimer` line 34: `clearInterval` before calling `onTimeoutRef.current?.()`). Calling `stop()` again is harmless but redundant.

### Deterministic Partial-Credit Scoring of Multi-Select Taxonomies

**What "good" looks like:**
- Three scoring components per scenario: severity (1 pt), signals (1 pt), action (1 pt) — total 3 pts
- Severity: exact match = 1pt; `partial[]` match = 0.5pt; no match = 0
- Signals (multi-select): all `required[]` signals selected = 1pt; any `partial[]` signals selected = 0.5pt; no match = 0
- Special case — zero-required scenarios (legitimate emails): if `required[]` is empty, selecting zero signals OR selecting "none-detected" = 1pt; selecting any signals = 0.5pt (over-annotation penalty)
- Action: exact match = 1pt; `partial[]` match = 0.5pt; no match = 0
- Scoring is pure function: `scoreScenario(answerKey, candidateResponse) => { points, components }` — no side effects, testable in isolation
- `displayScore` = `Math.round((totalPoints / 30) * 100)` — 0 to 100 integer
- Band thresholds (displayScore): >=80 = Advanced, >=60 = Proficient, <60 = Foundation (PROJECT.md terminology)
- Score is computed entirely in-browser at submission time — no network call, no external dependency

**Pitfall:** The signals partial-credit rule is asymmetric: for zero-required scenarios, selecting signals is penalized (0.5pt not 1pt) because over-annotation is itself a mistake. This must be correctly encoded in the scoring function, not inferred.

### Proctoring Without Being Invasive

**What "good" looks like:**
- Use `document.visibilitychange` + `window.blur/focus` events — the same dual-event pattern in flagmail1's `useProctoring`
- De-duplicate with a `lastHiddenRef` guard: one departure = one violation regardless of how many events fire
- Show a non-blocking inline banner when the candidate switches away: "Tab switch detected — stay on this page" — informational, not punitive
- Banner dismisses automatically when the candidate returns (no manual dismiss needed)
- Violations accumulate across all 10 scenarios (unlike flagmail1 which resets per email) — the total is what goes into the submission payload
- Optionally track per-scenario violation array for reviewer context (e.g. "3 violations on scenario 7")
- The reviewer screen shows violation count per candidate as a data point, not an automatic disqualification
- Never block, hide, or interfere with the test content — proctoring is purely observational

**Pitfall:** `window.blur` fires when the user alt-tabs OR when they interact with browser devtools or a system modal. This creates false positives. The `lastHiddenRef` guard prevents double-counting from both events on a single departure, but cannot distinguish devtools from a genuine tab switch. Accept this as a known limitation — document it for reviewers.

### Passcode-Gated Reviewer View

**What "good" looks like:**
- Passcode input is a separate screen state, not a modal overlay — match flagmail1's `ReviewerScreen.jsx` pattern
- Input type="password" so the passcode is not visible in screen recordings
- On submit: send passcode to GAS as a query parameter on a GET request (`?action=getAnnotationSubmissions&passcode=...`) — GET is a "simple" CORS request, no preflight required (same as flagmail1's `ReviewerScreen.jsx` comment)
- GAS validates the passcode server-side against a stored value — never expose the passcode in client-side code
- Invalid passcode shows inline error; successful auth fetches all submissions and renders them
- Each submission row shows: candidate name, email, timestamp, total score, band, per-scenario scores (expandable), violation count
- Per-scenario detail is collapsible (expand/collapse per row) — reviewer does not need all details at once
- "Back to landing" button is always available — reviewer does not need to reload
- No session persistence — reviewer must re-enter passcode if they reload (acceptable for this use case)

**Pitfall:** Hardcoding the passcode in the GAS script (as a `const REVIEWER_PASSCODE = "..."`) is acceptable for this use case but must be changed before sharing the GAS script publicly. Document this clearly.

### Accessible Annotation Form

**What "good" looks like:**
- Pill/button group for severity and action: each option is a `<button>` not a `<div>` — keyboard focusable by default
- Multi-select signals group: each signal is a `<button>` with `aria-pressed={selected}` attribute — communicates toggle state to screen readers
- Submit button has a visible disabled state and `disabled` attribute when locked — prevents confusion about why nothing happens on click
- Section labels ("Severity", "Abuse signals detected", "Recommended action") use `<fieldset>` + `<legend>` or at minimum a visually distinct label with `id` linked to the group via `aria-labelledby`
- Color is not the only indicator of selected state — selected pills have both a border change AND a background change (not just color shift)
- Timer countdown is announced to screen readers via a live region (`aria-live="polite"`) when it enters the amber and red phases — avoid aria-live="assertive" which would interrupt the user every second
- Form submission confirmation is visible — do not silently advance to the next scenario without showing that submission was received

**Pitfall:** Pill buttons that use `onclick` handlers but are rendered as `<div>` or `<span>` are not keyboard accessible. The HTML prototype uses `<button class="pill">` — maintain this in the React version.

---

## Competitor Feature Analysis

This tool occupies a narrow niche: a custom browser-based annotation assessment for a specific internal hiring team. The relevant comparisons are:

| Feature | Generic Quiz Tools (Typeform, Google Forms) | Coding Assessment Tools (HackerRank, Codility) | This Tool |
|---------|---------------------------------------------|------------------------------------------------|-----------|
| Timed per-question | No (typically whole-test timer) | Yes | Yes — per-scenario 2-min timer |
| Partial credit multi-select | No (binary correct/incorrect) | Rarely (domain-specific) | Yes — three-component rubric |
| Domain-specific stimulus (email headers) | No | No | Yes — full email rendering |
| Proctoring | Basic (tab-switch in paid plans) | Yes (webcam, browser lock in enterprise) | Lightweight (tab-switch only, non-invasive) |
| Reviewer screen | No (shared export) | Yes (recruiter dashboard) | Yes (passcode-gated, violation-aware) |
| Per-question feedback | No (shown post-test) | Limited | Yes — immediate per-scenario after submit |
| Badges/gamification | No | No | Yes — reused flagmail1 art |
| Custom scoring rubric | No | No | Yes — scenario-specific required/partial signal sets |

**Our approach** is closer to a custom coding assessment tool in terms of complexity, but operates entirely client-side with a GAS backend — no infrastructure overhead.

---

## Sources

- `PROJECT.md` — authoritative feature list and out-of-scope definitions
- `apple_email_abuse_annotation_workspace (1).html` — content spec, scoring logic, answer keys, signal taxonomy (HIGH confidence — this is the prototype being rebuilt)
- `flagmail1/src/hooks/useTimer.js` — timer implementation pattern (HIGH confidence — direct code)
- `flagmail1/src/hooks/useProctoring.js` — proctoring implementation pattern (HIGH confidence — direct code)
- `flagmail1/src/hooks/useScoring.js` — scoring hook pattern (HIGH confidence — direct code)
- `flagmail1/src/hooks/useBadges.js` — badge unlock pattern (HIGH confidence — direct code)
- `flagmail1/src/components/GameRound.jsx` — annotation form layout and timer integration pattern (HIGH confidence — direct code)
- `flagmail1/src/components/ResultsScreen.jsx` — results screen and band/title pattern (HIGH confidence — direct code)
- `flagmail1/src/components/ReviewerScreen.jsx` — passcode-gated reviewer screen pattern (HIGH confidence — direct code)

---

*Feature research for: Email Abuse Annotation Hiring Screening Test*
*Researched: 2026-05-22*
