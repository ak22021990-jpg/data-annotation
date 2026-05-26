---
status: issues_found
files_reviewed: 27
depth: deep
findings:
  critical: 2
  warning: 9
  info: 17
  total: 28
---

# Code Review — Phase 1 (Data Foundation + Full App)

## Summary

Reviewed 27 source files across components, hooks, utils, data, config, styles, and infrastructure. Focused on bugs, security, code quality, UI/UX, and text/content issues.

### Finding Counts

| Severity | Count |
|----------|-------|
| Critical | 2 |
| Warning  | 9 |
| Info     | 17 |

---

## Critical

### CR-01: Hardcoded reviewer passcode in client code
**File:** `src/hooks/useReviewer.js:4`
**Severity:** Critical

```js
const VALID_PASSCODE = 'apple-reviewer-2026';
```

The reviewer passcode is hardcoded in JavaScript shipped to every browser. Anyone can open DevTools and read it. For production, move passcode verification entirely server-side (GAS `getResults` already does this). Remove or stub the local fallback check.

**Fix:** Remove `VALID_PASSCODE` constant. When `GAS_URL` is empty (local dev), use a different mechanism — e.g., auto-authenticate with a flag or skip auth entirely in dev.

---

### CR-02: `textAlignment` CSS property typo in LeaderboardScreen
**File:** `src/components/LeaderboardScreen.jsx:45,60`
**Severity:** Critical (layout bug — style silently ignored)

```js
// Line 45 — wrong
<th style={{ textAlignment: 'right', width: '100px' }}>Score</th>
// Line 60 — wrong
<td style={{ textAlignment: 'right' }}>{entry.displayScore}%</td>
```

`textAlignment` is not a valid CSS property. Correct is `textAlign`. The inline style is silently dropped by React. Score and table alignment broken. Same bug at line 60.

**Fix:** Replace `textAlignment` with `textAlign` on both lines.

---

## Warning

### WR-01: Tutorial tips use banned flagmail1 terminology
**File:** `src/components/TutorialScreen.jsx:10-11`
**Severity:** Warning (content policy violation)

```js
title: 'Use hints only when needed',
caption: 'Look out for context clues carefully.',
```

The words "hints" and "clues" violate the flagmail1 banned-terms policy (`/hint|clue/` in eslint). While the ESLint rule only matches code identifiers, the content itself contradicts the anti-flagmail1 policy. These should use annotation-domain language instead.

**Fix:** Reword to annotation-domain terms, e.g., "Review context before annotating" and "Examine the sender, domain, and email body carefully."

---

### WR-02: Tutorial tip "Lock the call in fast" is flagmail1 terminology
**File:** `src/components/TutorialScreen.jsx:21`
**Severity:** Warning (content policy)

```js
title: 'Lock the call in fast',
```

"Lock the call" is flagmail1/phishing-lab terminology. Annotation domain equivalent: "Submit your annotation within the time limit."

**Fix:** Change title to "Submit within the time limit" and caption to "You have exactly 2 minutes per scenario."

---

### WR-03: Score algorithm gives partial signal credit even when zero required signals matched
**File:** `src/utils/score.js:43-48`
**Severity:** Warning (scoring logic)

```js
} else if (partialSignals.length > 0 && partialSignals.some(p => ansSignals.includes(p))) {
  signalPoints = 0.5;
}
```

If user selects 0 of N required signals but picks 1 partial signal, they get 0.5 points. No differentiation between (N-1)/N correct vs 0/N correct when partial signals are present. For example, Scenario 4 requires 4 signals — a user who picks 3/4 required + 1 partial gets the same 0.5 as someone who picks 0/4 required + 1 partial.

**Fix:** Consider proportional partial credit or a minimum-required-match threshold.

---

### WR-04: `submitAnnotation` returns stale `updatedAnswersList`
**File:** `src/hooks/useAnnotationState.js:55-66`
**Severity:** Warning (defensive — not currently consumed)

```js
let updatedAnswersList;
setAnswersList(prev => {
  const next = [...prev];
  next[scenarioIndex] = answers;
  updatedAnswersList = next;
  return next;
});
return { answers, record, updatedAnswersList };
```

`updatedAnswersList` is assigned inside `setAnswersList`'s updater, but by the time the `return` statement runs, React hasn't committed the state update — `updatedAnswersList` may reflect the previous state. This value is currently not consumed by any caller, but if someone reads the return value in the future, they'll get stale data.

**Fix:** Remove the `updatedAnswersList` return value, or compute it synchronously from the current state + the new answer.

---

### WR-05: "Missed" points calculation in ResultsScreen is misleading
**File:** `src/components/ResultsScreen.jsx:225`
**Severity:** Warning (UI data display)

```js
<span style={{ color: 'rgba(17,24,39,0.7)' }}>Missed:</span>
<span style={{ fontWeight: 600, color: '#FF3B30' }}>{scenarios.length - sigPoints}</span>
```

`scenarios.length` is an integer (10) but `sigPoints` is a decimal sum of signalPoints (0.0–10.0). The subtraction gives a confusing value. For example, earning 8.5/10 signal points shows "Missed: 1.5" — which is neither a count of missed signals nor a meaningful percentage.

**Fix:** Display `(scenarios.length - sigPoints).toFixed(1)` as "Points missed" or use a percentage: `Math.round((sigPoints / scenarios.length) * 100)`.

---

### WR-06: Duplicate accuracy calculation in ResultsScreen and submitResults
**File:** `src/components/ResultsScreen.jsx:40-57` and `src/utils/api.js:115-127`
**Severity:** Warning (DRY violation)

Both `ResultsScreen` and `submitResults` independently calculate `sevCorrect`, `actCorrect`, and `sigPoints` using the same logic. If the scoring formula changes, both must be updated.

**Fix:** Extract into a shared utility function — e.g., `calculateAccuracy(scenarios, answersList, scores)` in `utils/score.js`.

---

### WR-07: `useScoring` returns unstable references, degrading memoization
**File:** `src/hooks/useScoring.js:13-21` and `src/hooks/useAnnotationState.js:48`
**Severity:** Warning (performance)

```js
// useScoring.js
const scoreScenario = (scenarioIndex, scenario, answers) => { ... };
return { scores, scoreScenario, resetScores, totalPoints, displayScore, band, rawPercentage };
```

`scoreScenario` and `resetScores` are recreated on every render without `useCallback`. This causes `submitAnnotation` (which depends on `scoring`) to also be recreated on every render, breaking all downstream memoization including child re-renders.

**Fix:** Wrap `scoreScenario` and `resetScores` in `useCallback`.

---

### WR-08: Scenario 4 age/username mismatch in context data
**File:** `src/data/scenarios.js:114`
**Severity:** Warning (data integrity)

```js
context: 'The reporter is 71 years old. ...'
// But username is helen.morris72 — "72" suggests birth year 1972,
// which would make her ~53, not 71.
```

The name `helen.morris72` implies birth year 1972 (age ~53-54). Context says "71 years old." These contradict. Either rename to `helen.morris54` (birth ~1954) for consistency, or update the age.

**Fix:** Align the email username with the context age. If she's 71 in 2025, use a name like `helen.morris54`.

---

### WR-09: `useEffect` with `timeRemaining` as dependency causes interval churn
**File:** `src/hooks/useTimer.js:23-44`
**Severity:** Warning (performance, potential race)

```js
useEffect(() => {
  // ...
  const timerId = setInterval(() => { ... }, 1000);
  return () => clearInterval(timerId);
}, [timeRemaining]);
```

Every second, `timeRemaining` changes → effect cleanup (clear old interval) → new effect (create new interval). This is functionally correct but creates ~120 interval create/destroy cycles per scenario. While harmless in practice, it's unnecessary overhead.

**Fix:** Use `useRef` for the interval ID and manage it without `timeRemaining` in deps, or use `setTimeout` chaining.

---

## Info

### IN-01: Missing `favicon.svg` in `public/`
**File:** `index.html:5`

References `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` but no `public/favicon.svg` file exists. Browsers will show a 404 and use a default icon.

---

### IN-02: Feedback screen tilde icon for "Partially Correct"
**File:** `src/components/FeedbackScreen.jsx:38-39`

The `~` character as a status icon renders as a small squiggle, which is unclear. Consider `△` (triangle) or `≈` (approximately) for better visual communication.

---

### IN-03: `_onRetake` prop is unused in ResultsScreen
**File:** `src/components/ResultsScreen.jsx:33`

```js
onRetake: _onRetake,
```

The retake handler is destructured with underscore prefix (ESLint unused-var escape) but never used in JSX. The "Retake Assessment" button was removed or not yet wired. If retake is planned, wire it. If not, remove the prop.

---

### IN-04: Duplicate style definitions between CSS classes and inline styles
**File:** `src/index.css` vs inline styles in multiple components

`index.css` defines `.card`, `.submit-btn`, `.breakdown-table`, `.band-badge` etc. But most screens use inline styles instead. Only `ReviewerScreen.jsx` uses CSS class names (`.card`, `.submit-btn`, `.breakdown-table`). This creates a split styling approach.

**Fix:** Decide on one approach — either CSS modules / Tailwind, or all inline. Mixed approach causes maintenance confusion.

---

### IN-05: `I'm Ready, Begin Test` — odd comma placement
**File:** `src/components/TutorialScreen.jsx:119`
**Severity:** Info (copy)

Grammatically odd. Consider "I'm Ready — Begin Test" (em dash) or "I'm Ready to Begin."

---

### IN-06: `submitDisabled` logic allows submission without selecting signals
**File:** `src/App.jsx:126`

```js
const submitDisabled = !currentSeverity || !currentAction;
```

Signals are not required to submit. A user can submit with severity + action only, and the scoring engine handles empty signals (giving 0 or 1 point depending on required signals). This is acceptable UX but worth noting — the annotation form says "Complete all fields."

---

### IN-07: No `useCallback` on `fetchCandidates` in useReviewer — will trigger ESLint react-hooks/exhaustive-deps
**File:** `src/hooks/useReviewer.js:25`

The `useEffect` that calls `fetchCandidates` has `[isAuthenticated, fetchCandidates]` as deps. Since `fetchCandidates` itself has `[isAuthenticated, activePasscode]` deps, this creates a stable-ish reference (it only changes when those deps change). But the pattern creates an indirect dependency chain.

---

### IN-08: Scenario 6 and 10 have empty required signals — scoring edge case
**File:** `src/data/scenarios.js:184-188, 306-310`

Scenarios 6 and 10 have `signals: { required: [], partial: [] }`. Per scoring logic, selecting `none-detected` or leaving signals empty gives 1.0 points. Selecting any other signal gives 0.5. This is intentional but the test at `score-verification.test.js:55-58` explicitly handles this edge case with a comment.

---

### IN-09: LocalStorage exposes all candidate submission data
**File:** `src/utils/api.js:3-8`

```js
localStorage.setItem(key, JSON.stringify(payload));
```

When `GAS_URL` is not set (local dev or deployment without backend), full submission data including name, email, scores, and per-scenario answers is stored in localStorage accessible to any script on the same origin. Not exploitable remotely but worth noting for shared-computer scenarios.

---

### IN-10: Google Apps Script `REVIEWER_EMAILS` contains real email addresses
**File:** `google-apps-script.js:26-31`

Three Sutherland Global email addresses are hardcoded. If this file is committed to a public repo, these are exposed. Ensure this file is in `.gitignore` or the repository is private.

---

### IN-11: ESLint `no-restricted-syntax` rule uses `Identifier` selector — misses string content
**File:** `eslint.config.js:27-29`

```js
selector: 'Identifier[name=/flag|zone|clue|hint|classif|moderat/i]',
```

This catches code identifiers (`flag`, `zone`, etc.) but does NOT catch these terms in JSX text content, HTML, or string literals. The tutorial screen's "hints" and "clues" pass the lint check because they're in object property values. Consider adding `Literal` or `TemplateElement` selectors if full content enforcement is needed.

---

### IN-12: `vite.config.js` base path `/data-annotation/` mismatches Phase 1 verification script
**File:** `vite.config.js:5` and `verify-phase1.mjs:36`

```js
// vite.config.js
base: '/data-annotation/',
// verify-phase1.mjs expects
check('base: \'/annotation/\' is set', viteConfig.includes("'/annotation/'"))
```

The base was changed from `/annotation/` to `/data-annotation/` (matching the GitNexus repo name) but the verification script wasn't updated. The verification script will incorrectly fail.

**Fix:** Update `verify-phase1.mjs:36` to check for `'/data-annotation/'`.

---

### IN-13: `ProgressBar.jsx` component exists but is never rendered
**File:** `src/components/ProgressBar.jsx`

`ProgressBar` is imported nowhere and never rendered. The progress bar in the annotate header is built inline inside `App.jsx` (`AnnotateHeader` sub-component). Either wire it up or remove it.

---

### IN-14: `useTimer.reset()` is exported but never consumed
**File:** `src/hooks/useTimer.js:46-49`

The `reset` function is returned from the hook but the `Timer` component never exposes it. The `App.jsx` uses `key={scenarioIndex}` to force remount instead. Either remove the `reset` export or use it via `useImperativeHandle`.

---

### IN-15: `scenarios.csv` has S2 missing context field
**File:** `scenarios.csv:9`

The CSV row for scenario 2 has an empty context cell, but `scenarios.js` has context text. The CSV is for import/export and may be used as source of truth for future edits. Keep it in sync with `scenarios.js`.

---

### IN-16: `cssEscape` function is named `csvEscape` in GAS file
**File:** `google-apps-script.js:377`

Typo in function name — should be `csvEscape` (with 'v') but actual naming is fine since it has 'v'. Actually it's `csvEscape` which is correct. Never mind. (Self-corrected — no issue here.)

---

### IN-17: No `<title>` or `<meta description>` in ReviewerScreen's app-shell path
**File:** `src/App.jsx:159-167`

When `screen === SCREENS.REVIEWER`, the root element has no surrounding environment (no background radial gradients, no document-level styles). The reviewer screen renders inside `.app-shell` and `.card` CSS classes which provide basic styling from `index.css`. This is functional but visually inconsistent with other screens.

---

## Top Issues Summary

1. **CR-01** — Hardcoded reviewer passcode exposed in client code
2. **CR-02** — `textAlignment` CSS typo breaks table alignment
3. **WR-01** — Tutorial text uses banned flagmail1 terms ("hints", "clues")
4. **WR-02** — Tutorial uses flagmail1 phrase "Lock the call in fast"
5. **WR-08** — Scenario 4 age/username data mismatch
