# Architecture Research

**Domain:** Browser-based hiring screening test — flat 10-scenario annotation flow
**Researched:** 2026-05-22
**Confidence:** HIGH (derived directly from verified sibling codebase flagmail1 + HTML prototype)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (React 19 + Vite)                    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                          App.jsx                             │    │
│  │   (screen switch, callback wiring, proctoring violations)    │    │
│  └──┬─────────────┬──────────────┬──────────────┬──────────────┘    │
│     │             │              │              │                    │
│  ┌──▼───────┐ ┌───▼──────┐ ┌────▼─────┐ ┌─────▼────┐              │
│  │useAnnot- │ │useScoring│ │useBadges │ │useTimer  │              │
│  │State.js  │ │.js       │ │.js       │ │.js       │              │
│  │(screen   │ │(per-round│ │(unlock   │ │(2-min    │              │
│  │ flow,    │ │ points,  │ │ checks,  │ │ countdown│              │
│  │ round    │ │ totals,  │ │ toast    │ │ per      │              │
│  │ answers) │ │ bands)   │ │ queue)   │ │ scenario)│              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                                                                       │
│  ┌──────────────────── Screen Components ─────────────────────────┐  │
│  │  LandingScreen  TutorialScreen  AnnotationRound  ExplanationCard│  │
│  │  ResultsScreen  ReviewerScreen                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌───────────── Supporting Components ────────────────────────────┐  │
│  │  EmailCard  AnnotationForm  TimerBar  ProgressBar              │  │
│  │  BadgeToast  BadgeCollection  Leaderboard                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──── Data Layer ────┐  ┌──── Config ────┐                         │
│  │  scenarios.js      │  │  game.js       │                         │
│  │  (10 scenario      │  │  tokens.js     │                         │
│  │   objects)         │  │  config.js     │                         │
│  └────────────────────┘  └────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
         │  POST (no-cors)        │  GET leaderboard
         ▼                        ▼
┌────────────────────────────────────────────────────────────────────┐
│            Google Apps Script + Sheets (existing pattern)           │
│   doPost: register, submit_score    doGet: leaderboard, reviewer   │
└────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component / Hook | Responsibility | Notes |
|-----------------|----------------|-------|
| `App.jsx` | Screen switch, callback wiring, violation count state | No logic — pure composition |
| `useAnnotationState.js` | Screen enum, player, current scenario index, round answers (severity/signals/action), submit/next/timeout actions, GAS POST | Replaces `useGameState.js`; no zones, no shuffle |
| `useScoring.js` | Per-scenario points (0–3), running total, displayScore (0–100%), title band | Adapted from flagmail1; new rubric (severity 1pt + signals 1pt + action 1pt) |
| `useTimer.js` | 120s countdown per scenario, fires `onTimeout` callback | Reuse flagmail1 `useTimer.js` unchanged |
| `useBadges.js` | Badge unlock checks after each submission, toast queue | Reuse flagmail1 hook; redefine unlock conditions |
| `useLeaderboard.js` | Fetch leaderboard from GAS, submit final score | Reuse flagmail1 hook unchanged |
| `useProctoring.js` | `visibilitychange` + `blur` listener, violation counter | New hook; returns `{ violations, resetViolations }` |
| `LandingScreen.jsx` | Name + email form, "Reviewer" button | Reuse flagmail1 component with copy changes |
| `TutorialScreen.jsx` | Explains annotation form fields (severity/signals/action), skippable | New component; replaces classification tutorial |
| `AnnotationRound.jsx` | Full scenario view: email card + context note + annotation form + timer | Main gameplay screen; new, no equivalent in flagmail1 |
| `ExplanationCard.jsx` | Post-submission feedback: score, model reasoning, "Next" button | Adapted from flagmail1 `ExplanationCard.jsx` |
| `ResultsScreen.jsx` | Total score, displayScore %, title band, per-scenario breakdown, badges, leaderboard | Adapted from flagmail1 |
| `ReviewerScreen.jsx` | Passcode gate, candidate results table, proctoring violations column | Adapted from flagmail1 |
| `EmailCard.jsx` | Renders From/Reply-To/To/Subject headers + body; highlights mismatched Reply-To in red | New component (HTML prototype CSS pattern); no equivalent in flagmail1 |
| `ContextNote.jsx` | Renders the annotator context note (blue left-border callout) | New small component |
| `AnnotationForm.jsx` | Severity pills + signals multi-select pills + action pills + Submit button | New component; core interaction |
| `TimerBar.jsx` | Visual countdown bar | Reuse flagmail1 `TimerBar.jsx` unchanged |
| `ProgressBar.jsx` | `n of 10` scenario progress | Simple new component (no zones) |
| `BadgeToast.jsx` | Badge unlock notification animation | Reuse flagmail1 unchanged |
| `BadgeCollection.jsx` | Earned badge grid on Results screen | Reuse flagmail1 unchanged |
| `Leaderboard.jsx` | Candidate scores table | Reuse flagmail1 unchanged |
| `scenarios.js` | 10 scenario objects with email data, context note, answer key, scoring rubric | New data file; content extracted from HTML prototype |
| `game.js` | `ROUND_DURATION_SECONDS = 120`, `SCENARIOS_COUNT = 10`, band thresholds | Adapted config |
| `tokens.js` | `MAX_POINTS_PER_SCENARIO = 3`, `MAX_SCORE = 30`, CSS variables, title band labels | Adapted from flagmail1 |
| `config.js` | GAS URL | Reuse flagmail1 pattern |

---

## Screen-Flow State Machine

### SCREENS Enum

```js
export const SCREENS = {
  LANDING:      'landing',       // name + email registration
  TUTORIAL:     'tutorial',      // annotation instructions
  ROUND:        'round',         // scenario N — email + form + timer
  EXPLANATION:  'explanation',   // per-scenario feedback after submission
  RESULTS:      'results',       // final score + breakdown
  REVIEWER:     'reviewer',      // passcode-gated reviewer panel
};
```

### Transition Table

```
LANDING
  onStart(name, email)
    → POST register to GAS
    → if !tutorialSeen  → TUTORIAL
    → if tutorialSeen   → ROUND (index 0)

TUTORIAL
  onSkip / onComplete
    → ROUND (index 0)

ROUND  [scenarioIndex 0–9, 2-minute timer running]
  onSubmit(answers)  OR  onTimeout()
    → scoreRound()
    → checkBadges()
    → EXPLANATION

EXPLANATION  [shows score + model reasoning]
  onNext()
    → if scenarioIndex < 9  → ROUND (index+1)
    → if scenarioIndex === 9
        → POST final score to GAS
        → RESULTS

RESULTS  [final score, breakdown, leaderboard]
  (no outbound transition for candidate)

REVIEWER  (reachable from LANDING via "Reviewer" button)
  onBack()  → LANDING
```

### State Transitions — `useAnnotationState` Internals

```
startGame(name, email)
  setPlayer, setScenarioIndex(0), setRound(initialRoundState()), setTutorialSeen check

completeTutorial()
  setTutorialSeen(true), setScreen(ROUND)

selectSeverity(id)    → setRound({ ...round, severity: id })
toggleSignal(id)      → setRound({ ...round, signals: toggle(id) })
selectAction(id)      → setRound({ ...round, action: id })

submitRound(timedOut)
  → scoreRound({ scenarioIndex, severity, signals, action, timedOut })
  → setRound({ ...round, submitted: true, lastRecord: record })
  → setScreen(EXPLANATION)

nextScenario()
  → if scenarioIndex < 9:  setScenarioIndex(+1), setRound(initial), setScreen(ROUND)
  → if scenarioIndex === 9: submitToSheet(...), setScreen(RESULTS)
```

---

## Annotation Data Model

### Scenario Object (in `src/data/scenarios.js`)

Each of the 10 items in the `scenarios` array follows this shape:

```js
{
  id: 1,                         // 1-based integer; stable identifier

  // ── Email being reported ───────────────────────────────────────────
  email: {
    from:    'apple-security@secure-appleid-verify.net',
    replyTo: 'no-reply@appleid-verify.net',  // null if same as from
    to:      'user@icloud.com',
    subject: 'Your Apple ID has been locked — verify immediately',
    body:    `Dear Customer,\n\nYour Apple ID was suspended…`,
  },

  // ── Annotator context note (optional; null if absent) ─────────────
  context: 'Reporter note: "I never received this via App Store Connect…"',

  // ── Model answer (shown in ExplanationCard after submission) ───────
  answer: {
    severity:  'high',
    signals:   ['urgency', 'spoofed-sender', 'fake-domain'],
    action:    'remove',
    reasoning: 'Classic Apple ID phishing. Sender domain is not apple.com…',
  },

  // ── Scoring rubric ─────────────────────────────────────────────────
  scoring: {
    severity: {
      correct: ['high'],       // 1.0 pt
      partial: ['medium'],     // 0.5 pt
    },
    signals: {
      // required = full credit: all must be present
      required: ['urgency', 'spoofed-sender', 'fake-domain'],
      // partial = 0.5 pt: at least one of these present
      partial:  ['fake-domain', 'urgency'],
    },
    action: {
      correct: ['remove'],     // 1.0 pt
      partial: ['escalate'],   // 0.5 pt  (not present on all scenarios)
    },
  },
}
```

**Maximum per scenario: 3.0 pts** (1 severity + 1 signals + 1 action).  
**Maximum total: 30.0 pts** across 10 scenarios.

### Signals-Special Rule (empty required list)

Scenarios 6 and 10 have `scoring.signals.required = []`, meaning the expected answer is "no signals". Scoring logic:

```
if required.length === 0:
  candidate selected nothing OR "none-detected"  → 1.0 pt (full)
  candidate selected anything else               → 0.5 pt (partial)
```

This rule preserves the HTML prototype behaviour exactly.

### `roundState` (live annotation in progress)

```js
{
  severity:   null,   // string id or null
  signals:    [],     // array of string ids
  action:     null,   // string id or null
  submitted:  false,
  timedOut:   false,
  lastRecord: null,   // populated by scoreRound()
}
```

### `scoreRecord` (produced by `useScoring.scoreRound()`)

```js
{
  scenarioId:       1,
  severity:         'high',
  signals:          ['urgency', 'spoofed-sender', 'fake-domain'],
  action:           'remove',
  correctSeverity:  'high',
  correctSignals:   ['urgency', 'spoofed-sender', 'fake-domain'],
  correctAction:    'remove',
  severityPoints:   1.0,
  signalPoints:     1.0,
  actionPoints:     1.0,
  points:           3.0,          // sum (0–3)
  timedOut:         false,
}
```

### Taxonomy Constants (in `src/data/taxonomy.js`)

```js
export const SEVERITY_OPTS = [
  { id: 'not-abusive', label: 'Not abusive',  cls: '' },
  { id: 'low',         label: 'Low',          cls: 'sev-low' },
  { id: 'medium',      label: 'Medium',        cls: 'sev-med' },
  { id: 'high',        label: 'High',          cls: 'sev-high' },
  { id: 'critical',    label: 'Critical',      cls: 'sev-crit' },
];

export const SIGNAL_OPTS = [
  { id: 'spoofed-sender',   label: 'Spoofed sender' },
  { id: 'fake-domain',      label: 'Fake/lookalike domain' },
  { id: 'urgency',          label: 'Urgency / threat language' },
  { id: 'impersonation',    label: 'Brand impersonation' },
  { id: 'unsolicited',      label: 'Unsolicited (spam)' },
  { id: 'vulnerable-target',label: 'Vulnerable population targeted' },
  { id: 'financial-harm',   label: 'Financial harm / fee requested' },
  { id: 'malware-link',     label: 'Malware / suspicious link' },
  { id: 'auth-fail',        label: 'SPF / DKIM failure' },
  { id: 'none-detected',    label: 'No abuse signals detected' },
];

export const ACTION_OPTS = [
  { id: 'no-action', label: 'No action' },
  { id: 'filter',    label: 'Filter to junk' },
  { id: 'remove',    label: 'Remove / block sender' },
  { id: 'escalate',  label: 'Escalate for review' },
];
```

---

## Recommended Project Structure

```
annotation/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
└── src/
    ├── main.jsx                  # createRoot → <App />
    ├── App.jsx                   # screen switch, hook composition
    │
    ├── hooks/
    │   ├── useAnnotationState.js # screen flow, round answers, GAS POST
    │   ├── useScoring.js         # per-round scoring, totals, bands
    │   ├── useTimer.js           # 2-min countdown (reuse flagmail1)
    │   ├── useBadges.js          # badge unlock + toast queue (reuse)
    │   ├── useLeaderboard.js     # GAS GET + leaderboard data (reuse)
    │   └── useProctoring.js      # visibility/blur violation tracking
    │
    ├── components/
    │   ├── LandingScreen.jsx
    │   ├── TutorialScreen.jsx
    │   ├── AnnotationRound.jsx   # composes EmailCard + ContextNote + AnnotationForm + TimerBar
    │   ├── ExplanationCard.jsx
    │   ├── ResultsScreen.jsx
    │   ├── ReviewerScreen.jsx
    │   ├── ErrorBoundary.jsx     # reuse flagmail1
    │   │
    │   ├── EmailCard.jsx         # headers + body; red Reply-To highlight
    │   ├── ContextNote.jsx       # blue-bar annotator context callout
    │   ├── AnnotationForm.jsx    # severity pills + signals + action + submit
    │   ├── TimerBar.jsx          # reuse flagmail1
    │   ├── ProgressBar.jsx       # "Scenario N of 10" bar
    │   ├── BadgeToast.jsx        # reuse flagmail1
    │   ├── BadgeCollection.jsx   # reuse flagmail1
    │   └── Leaderboard.jsx       # reuse flagmail1
    │
    ├── data/
    │   ├── scenarios.js          # 10 scenario objects (content from HTML prototype)
    │   └── taxonomy.js           # SEVERITY_OPTS, SIGNAL_OPTS, ACTION_OPTS
    │
    ├── config/
    │   ├── game.js               # ROUND_DURATION_SECONDS=120, SCENARIOS_COUNT=10, band thresholds
    │   ├── tokens.js             # MAX_SCORE=30, CSS glass surface, title band labels
    │   └── config.js             # LEADERBOARD_URL (GAS endpoint)
    │
    ├── styles/
    │   ├── index.css             # CSS variables, resets (adapted from flagmail1)
    │   └── animations.css        # .anim-* utility classes (reuse flagmail1)
    │
    ├── utils/
    │   └── scoring.js            # pure scoreRound() function (deterministic, testable)
    │
    └── assets/
        └── animation/            # Lottie badge JSON files (copy from flagmail1)
```

---

## Architectural Patterns

### Pattern 1: Screen State Machine (no router)

**What:** A `SCREENS` enum in `useAnnotationState.js` drives which component renders. `App.jsx` conditionally renders screens based on `as.screen`. No React Router.

**When to use:** Linear, guided flows with no deep linking requirement. This test has no URLs to share, no back-button semantics, no bookmarkable states.

**Trade-offs:** Simpler than a router for this use case. Cannot deep-link to a specific scenario (not required).

**Example:**
```js
// App.jsx
const as = useAnnotationState();
const sc = useScoring();
// ...
return (
  <>
    {as.screen === SCREENS.LANDING    && <LandingScreen    onStart={as.startGame} />}
    {as.screen === SCREENS.TUTORIAL   && <TutorialScreen   onComplete={as.completeTutorial} />}
    {as.screen === SCREENS.ROUND      && <AnnotationRound  scenario={as.currentScenario} round={as.round} ... />}
    {as.screen === SCREENS.EXPLANATION && <ExplanationCard record={as.round.lastRecord} ... />}
    {as.screen === SCREENS.RESULTS    && <ResultsScreen    perScenario={sc.perScenario} ... />}
    {as.screen === SCREENS.REVIEWER   && <ReviewerScreen   onBack={() => as.setScreen(SCREENS.LANDING)} />}
  </>
);
```

### Pattern 2: One Hook Per Concern

**What:** Each hook owns exactly one slice of state. `App.jsx` composes them and passes data/callbacks down as props. No Context API.

**When to use:** When the app is small enough that prop drilling is not painful (6 screens, 4 hooks).

**Trade-offs:** Explicit and debuggable. Avoids provider tree complexity. Prop drilling is acceptable at this scale.

### Pattern 3: Static Dataset in Source

**What:** All 10 scenarios live in `src/data/scenarios.js` as a JS array. No API fetch during the test.

**When to use:** Fixed, small, non-user-generated content that must work offline. The 10 scenarios are locked by spec.

**Trade-offs:** Content updates require a code deploy. Acceptable here because scenarios are verified once and frozen.

### Pattern 4: Pure Scoring Function

**What:** `src/utils/scoring.js` exports a pure `scoreRound(scenario, answers)` function. `useScoring.js` calls it and manages the accumulated state.

**When to use:** Scoring is deterministic and must be verifiable without a running React app.

**Trade-offs:** Separating the pure function from the hook makes scoring logic unit-testable in isolation even without a test framework (manual verification in Node).

---

## Data Flow

### Annotation Round Flow

```
Candidate fills AnnotationForm
    ↓  onChange props
useAnnotationState.round state (severity, signals, action)
    ↓  onSubmit or onTimeout
App.handleSubmit(timedOut)
    ↓
useScoring.scoreRound({ scenario: scenarios[index], answers: round, timedOut })
    ↓  returns scoreRecord
useAnnotationState.submitRound(record)
    → round.lastRecord = record
    → screen = EXPLANATION
    → useBadges.checkBadges(record)
```

### End-of-Test Flow

```
ExplanationCard onNext() when scenarioIndex === 9
    ↓
App.handleFinalNext()
    → useAnnotationState.submitToSheet({ player, perScenario, displayScore, title, violations })
    → POST (no-cors) to GAS
    → screen = RESULTS
ResultsScreen mounts
    → useLeaderboard.fetchLeaderboard() fires GAS GET
```

### Reviewer Flow

```
Landing "Reviewer" button
    → screen = REVIEWER
ReviewerScreen mounts
    → useLeaderboard.fetchLeaderboard() fires GAS GET with reviewer token
    → passcode gate shown before data revealed
```

---

## Component Boundaries (What Talks to What)

```
App.jsx
  ├── reads:  useAnnotationState (screen, player, currentScenario, round)
  ├── reads:  useScoring (totalScore, displayScore, perScenario)
  ├── reads:  useBadges (toastQueue, earnedBadges)
  ├── reads:  useProctoring (violations)
  ├── owns:   handleSubmit, handleFinalNext callbacks
  │
  ├── AnnotationRound
  │     ├── receives: scenario, round, totalScore, onSelectSeverity,
  │     │             onToggleSignal, onSelectAction, onSubmit, onViolationChange
  │     ├── renders:  EmailCard (receives email object)
  │     ├── renders:  ContextNote (receives context string | null)
  │     ├── renders:  AnnotationForm (receives round state + handlers)
  │     ├── renders:  TimerBar (receives secondsLeft from useTimer)
  │     └── renders:  ProgressBar (receives scenarioIndex)
  │
  ├── ExplanationCard
  │     └── receives: record (scoreRecord), scenario, totalScore, onNext
  │
  ├── ResultsScreen
  │     ├── receives: player, displayScore, perScenario, earnedBadges
  │     ├── renders:  BadgeCollection
  │     └── renders:  Leaderboard (fetches own data via useLeaderboard)
  │
  └── ReviewerScreen
        └── receives: onBack; fetches own data via useLeaderboard
```

`AnnotationForm` is a controlled component: it receives the current `round` state and four handler callbacks (`onSelectSeverity`, `onToggleSignal`, `onSelectAction`, `onSubmit`). It renders three pill groups and a submit button; all state lives in `useAnnotationState`.

`EmailCard` is purely presentational: it receives the `email` object and applies the red Reply-To highlight when `email.replyTo !== email.from`.

---

## Scoring Formula

Derived directly from the HTML prototype `submit()` function, faithfully mapped to React:

```
severityPts = scoring.severity.correct.includes(answer.severity)  ? 1.0
            : scoring.severity.partial.includes(answer.severity)   ? 0.5
            : 0

signalPts   = (scoring.signals.required.length === 0)
              ? (answer.signals.length === 0 || answer.signals.includes('none-detected') ? 1.0 : 0.5)
              : requiredMatched === required.length  ? 1.0
              : partialMatched >= 1                  ? 0.5
              : 0

actionPts   = scoring.action.correct.includes(answer.action)  ? 1.0
            : scoring.action.partial?.includes(answer.action) ? 0.5
            : 0

points = severityPts + signalPts + actionPts   // 0.0 – 3.0
```

**displayScore** = `Math.round((totalPoints / 30) * 100)` → 0–100 %

**Title bands** (adapted from flagmail1 pattern):

| displayScore | Band | Reviewer label |
|---|---|---|
| >= 80 | Advanced | Strong pass — recommend for interview |
| >= 60 | Proficient | Borderline — consider calibration session |
| < 60 | Foundation | Does not meet threshold |

---

## Build Order (Phase Dependencies)

Build order respects component dependencies — lower layers before higher layers.

```
1. Data layer first
   scenarios.js + taxonomy.js
   Reason: every other file imports from here; content must be verified before any UI.

2. Config + tokens
   game.js, tokens.js, config.js
   Reason: hooks import constants; must exist before hooks compile.

3. Pure scoring util
   utils/scoring.js
   Reason: useScoring.js imports it; isolates scoring logic for manual verification.

4. Hooks (no UI dependency)
   useAnnotationState.js → useScoring.js → useTimer.js → useBadges.js
                        → useLeaderboard.js → useProctoring.js
   Reason: hooks have no JSX; can be written and tested (via console) before screens exist.

5. Leaf components (no child components)
   EmailCard, ContextNote, TimerBar, ProgressBar, BadgeToast, AnnotationForm
   Reason: these components receive only primitives/objects as props; no circular deps.

6. Screen-level components (compose leaves)
   AnnotationRound, ExplanationCard, LandingScreen, TutorialScreen
   Reason: depend on leaf components above.

7. App-level screens (compose everything)
   ResultsScreen, ReviewerScreen
   Reason: depend on Leaderboard, BadgeCollection which depend on hooks.

8. App.jsx + main.jsx
   Reason: ties all screens and hooks together; written last.
```

---

## Anti-Patterns

### Anti-Pattern 1: Mixing Zones Concept into the Flat Flow

**What people do:** Copy flagmail1's `zone`, `zoneStart`, `zoneEnd`, `advanceZone` logic wholesale.
**Why it's wrong:** There are no zones. Adding dead code for zone tracking will confuse future maintainers and create incorrect progress calculations.
**Do this instead:** Use `scenarioIndex` (0–9) exclusively. Progress is `scenarioIndex + 1 / 10`. "Zone complete" has no equivalent — after index 9, go directly to RESULTS.

### Anti-Pattern 2: Shuffling Scenarios

**What people do:** Port flagmail1's `shuffleEmails()` utility to randomise scenario order.
**Why it's wrong:** The 10 scenarios have a deliberate progression (obvious phishing first, ambiguous "is this legitimate?" cases mid-set, edge cases last). Shuffling destroys that calibration arc and makes per-scenario scoring comparisons across candidates meaningless.
**Do this instead:** Always present scenarios in fixed order (index 0–9).

### Anti-Pattern 3: Storing Annotation State Inside AnnotationForm

**What people do:** Put `severity`, `signals`, `action` as local `useState` inside `AnnotationForm`.
**Why it's wrong:** The timer's auto-submit callback in `useAnnotationState` needs access to the current answers at the moment of timeout. If answers live inside `AnnotationForm`, the hook cannot read them without a ref forwarding hack.
**Do this instead:** Keep all round answers in `useAnnotationState.round`. `AnnotationForm` is fully controlled — receives state + handlers as props.

### Anti-Pattern 4: Computing displayScore in the Template

**What people do:** Inline `Math.round((total/30)*100)` in ResultsScreen JSX.
**Why it's wrong:** The same formula is needed in at least three places: ResultsScreen, the GAS POST payload, and the band/title determination. Duplication risks inconsistency.
**Do this instead:** Derive `displayScore` and `title` once in `useScoring` and export them.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Apps Script | `fetch(GAS_URL, { method:'POST', body: JSON.stringify(payload), mode:'no-cors' })` | Silent failure via `console.warn` on error — same as flagmail1 |
| Google Sheets (leaderboard) | `fetch(GAS_URL + '?action=leaderboard')` via `useLeaderboard` | Reviewer mode sends `?action=reviewer&passcode=X` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `useAnnotationState` ↔ `useScoring` | `App.jsx` calls `sc.scoreRound(...)` then passes `record` to `as.submitRound(record)` | Hooks are independent; App.jsx orchestrates |
| `useAnnotationState` ↔ `useTimer` | `App.jsx` passes `as.currentScenarioIndex` as a key to `TimerBar`; timer reset is handled by React key remounting | Cleanest approach: `<TimerBar key={scenarioIndex} />` triggers unmount/remount |
| `useAnnotationState` ↔ `useProctoring` | `App.jsx` reads `proctoring.violations` and includes it in the final GAS POST payload | Violations are display-only in ResultsScreen; not used in scoring |
| `AnnotationRound` ↔ timer | `useTimer` runs inside `AnnotationRound` (or passed as seconds-left prop from App); fires `onTimeout` → `App.handleSubmit(timedOut=true)` | Timer must reset between scenarios |

---

## Scaling Considerations

This is a single-session test for sequential individual candidates. Concurrency and horizontal scale are not concerns. The only realistic scaling axis is:

| Scale | Architecture Adjustment |
|-------|------------------------|
| 1–100 candidates/day | Current architecture; GAS + Sheets sufficient |
| 100–1000 candidates/day | GAS rate limits (20 req/min free tier) become a problem; replace GAS with a lightweight Express endpoint + Postgres |
| 1000+ candidates/day | Out of scope; this is a hiring screen, not a product |

---

## Sources

- `../flagmail1/src/App.jsx` — App composition pattern (direct read, HIGH confidence)
- `../flagmail1/src/hooks/useGameState.js` — screen state machine pattern (direct read, HIGH confidence)
- `../flagmail1/src/hooks/useScoring.js` — scoring hook pattern (direct read, HIGH confidence)
- `../flagmail1/CLAUDE.md` (Architecture section) — flagmail1 layer inventory (direct read, HIGH confidence)
- `apple_email_abuse_annotation_workspace (1).html` — authoritative content spec: 10 scenarios, scoring formula, taxonomy (direct read, HIGH confidence)
- `.planning/PROJECT.md` — requirements and constraints (direct read, HIGH confidence)

---

*Architecture research for: browser-based email-abuse annotation hiring screening test*
*Researched: 2026-05-22*
