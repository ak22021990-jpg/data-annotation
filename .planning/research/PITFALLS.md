# Pitfalls Research

**Domain:** Browser-based hiring screening test — email abuse annotation
**Researched:** 2026-05-22
**Confidence:** HIGH (content audit from source HTML; build pitfalls from domain knowledge of React timer apps, GAS integrations, and annotation UX)

---

## Part 1: Content Correctness — Answer-Key / Rubric Audit

Each of the 10 scenarios was audited for internal consistency: does the scoring rubric
(`scoring.signals.required`, `scoring.signals.partial`) match the model answer
(`answer.signals`) and the visible email evidence?

### Scenario 1 — Apple ID locked phishing

**Status: INCONSISTENCY**

- Model answer signals: `["urgency","spoofed-sender","fake-domain"]`
- Scoring required: `["urgency","spoofed-sender","fake-domain"]` — signals match.
- `answer.reasoning` states: "SPF/DKIM would fail." The `auth-fail` signal exists in the taxonomy but is absent from `scoring.signals.required` and `scoring.signals.partial`.
- Secondary issue: `scoring.signals.partial` is `["fake-domain","urgency"]` — both values already appear in `required`. This makes the partial-credit path always reachable by anyone who hits two of three required signals, which is fine logically, but the overlap is confusing. It would be clearer to list only the minimal acceptable subset as partial.

**Fix required:**
1. Decide: should `auth-fail` be a required or accepted signal for this scenario? The reasoning says SPF/DKIM "would" fail (inferred, not stated in context note). Because no explicit context note confirms the failure, `auth-fail` should be listed as `partial` (acceptable but not required), not `required`. Update reasoning to clarify it is inferred.
2. Restructure partial signals to avoid overlap with required (e.g. `partial: ["urgency","fake-domain"]` means "if you get at least these two, you get half-credit" — currently this reads correctly but the intent should be documented).

---

### Scenario 2 — Developer phishing (app removal notice)

**Status: INCONSISTENCY**

- Sender is `no-reply@apple.com` — a visually legitimate apple.com address.
- The context note only says "I checked and my app is still live" — it does NOT state that SPF or DKIM fail.
- Scoring requires `spoofed-sender` as a required signal.
- The model answer reasoning acknowledges: "possible header spoofing or display name forgery" — hedged language that indicates the spoofing is not directly observable by the candidate.
- A candidate who reads the evidence rigorously cannot confirm `spoofed-sender` from visible information alone; they can only infer it from the fact that the app is confirmed live.

**Fix required:**
1. Either add a context note stating "SPF fails" or "header analysis shows display-name forgery" so `spoofed-sender` is evidenced — OR change `scoring.signals.required` to `["impersonation"]` and move `spoofed-sender` to `partial`.
2. The current rubric penalises a candidate who correctly notes the discrepancy (app is live) but reasonably annotates `impersonation` without selecting `spoofed-sender` due to lack of direct evidence.

---

### Scenario 3 — Third-party app newsletter (unsolicited spam)

**Status: CLEAN**

- Model answer: severity `low`, signals `["unsolicited"]`, action `filter`.
- Scoring: severity correct `["low"]`, partial `["medium"]`; signals required `["unsolicited"]`; action correct `["filter"]`, partial `["remove"]`.
- All three dimensions are internally consistent. The distinction from S5/S8 (both `no-action`-eligible) is correct: this sender is not Apple, so filtering rather than no-action is the appropriate policy distinction.
- No `auth-fail` mention anywhere — appropriate, as SPF/DKIM are not discussed.

---

### Scenario 4 — Tech support scam targeting elderly user

**Status: INCONSISTENCY**

- Model answer signals: `["urgency","impersonation","vulnerable-target","financial-harm"]` — four signals.
- Scoring required: `["urgency","impersonation","vulnerable-target"]` — only three signals.
- `financial-harm` is in the model answer but absent from both `required` and `partial` in scoring.
- A candidate who correctly identifies all four signals scores identically to one who identifies three — `financial-harm` contributes nothing to the score despite being present in the authoritative answer.
- Secondary: the sender is `applesupport-care@gmail.com`. There is no `auth-fail` discussion. A gmail.com sender impersonating Apple would fail DMARC alignment checks. Consider whether `auth-fail` should be a partial signal.

**Fix required:**
1. Add `financial-harm` to `scoring.signals.required` (it is an unambiguous, observable signal — the email explicitly states "$299 fee") — OR move it to `partial` if the intent is that it is secondary to the three required signals.
2. Confirm whether `auth-fail` should be in `partial` given the gmail sender.

---

### Scenario 5 — 9to5Mac newsletter (legitimate, well-known outlet)

**Status: MINOR INCONSISTENCY**

- Context explicitly states: "email passes SPF and DKIM."
- Model answer signals: `["unsolicited"]`. Scoring required: `["unsolicited"]`. — Consistent.
- Scoring severity: `correct: ["low","not-abusive"]`, `partial: []` — an empty partial array.
- A candidate who selects "medium" severity gets 0 points for this dimension. Given that "medium" is the adjacent option, and this email genuinely feels borderline to a non-expert (unknown sender, no subscription memory), a 0.5 partial credit for "medium" would better reflect calibration quality.
- Note: `answer.severity` is `"low"` but `"not-abusive"` is equally accepted by the rubric. The answer key should reflect the wider acceptable set to avoid misleading candidates during feedback.

**Fix required:**
1. Add `partial: ["medium"]` to severity scoring (matching the pattern used by S1, S2, S4, S6).
2. Update `answer.severity` to `"not-abusive"` or clarify in reasoning that both are acceptable.

---

### Scenario 6 — Legitimate Apple receipt (no abuse)

**Status: CLEAN**

- Context states: "SPF and DKIM both pass." Signals are correctly `[]` — auth passing is not a signal.
- Scoring: severity correct `["low","not-abusive"]`; signals required `[]`; action correct `["no-action"]`, partial `["escalate"]`.
- The `signals.required = []` path in the scoring engine correctly awards 1 point for `signals.length === 0` or `signals.includes("none-detected")`.
- No discrepancies.

---

### Scenario 7 — Sign-in attempt with Reply-To mismatch

**Status: INCONSISTENCY**

- Context is `null` — no SPF/DKIM information provided.
- Model answer signals: `["spoofed-sender","fake-domain","urgency","impersonation"]` — four signals.
- Scoring required: `["spoofed-sender","fake-domain"]` — only two signals.
- `urgency` and `impersonation` are in the model answer but absent from scoring required and partial.
- A candidate who identifies all four signals (the full model answer) scores the same as one who identifies two. This deflates the signal quality of the rubric.
- `auth-fail` is absent. The Reply-To mismatch is a form of sender authentication evasion, but there is no context note about SPF/DKIM for this scenario, so excluding `auth-fail` is defensible.

**Fix required:**
1. Add `urgency` and `impersonation` to `scoring.signals.partial` so that identifying all four signals is rewarded over identifying two.
2. Alternatively, add them to `required` if the intent is that both signals are expected from a competent annotator (geolocation fear tactic and Apple brand impersonation are both clearly present in the email).

---

### Scenario 8 — Apple TV+ promotional email (legitimate Apple promo)

**Status: MINOR INCONSISTENCY**

- Context: "SPF and DKIM pass."
- Model answer: severity `low`, signals `["unsolicited"]`, action `no-action`.
- Scoring severity: `correct: ["low","not-abusive"]`, `partial: []` — same empty-partial issue as S5.
- Selecting "medium" gets 0 points for severity. Same reasoning as S5 applies.

**Fix required:**
1. Add `partial: ["medium"]` to severity scoring (matching pattern of S1, S2, S4, S6, S9).

---

### Scenario 9 — Fake subscription renewal with auth failures

**Status: CRITICAL INCONSISTENCY — highest priority fix**

- Context explicitly states: "SPF fails. DKIM fails."
- The `auth-fail` signal (`id: "auth-fail"`, `label: "SPF / DKIM failure"`) is directly available in the taxonomy.
- Model answer signals: `["spoofed-sender","fake-domain","urgency","impersonation"]` — `auth-fail` is NOT in the model answer despite being directly evidenced by the context.
- Scoring required: `["spoofed-sender","fake-domain","urgency"]` — `auth-fail` is also absent from required and partial.
- This is the clearest instance of the PROJECT.md concern: "some scenarios' context says SPF fails / DKIM fails but the scoring rubric does NOT list `auth-fail` as required."
- Secondary: `impersonation` is in the model answer but NOT in `scoring.signals.required` or `partial` — same gap as S7.

**Fix required:**
1. Add `auth-fail` to `scoring.signals.required`. The evidence is explicit and unambiguous in the context note — a competent annotator MUST select it.
2. Add `impersonation` to `scoring.signals.partial` (it is in the model answer and is clearly evidenced by the apple.com claim on a non-apple domain).
3. Add `auth-fail` to `answer.signals` to make the model answer match the rubric.

---

### Scenario 10 — Family Sharing email (legitimate, misdirected)

**Status: CLEAN**

- Context: "SPF and DKIM both pass." Signals are `[]` — correct.
- Scoring: severity correct `["low","not-abusive"]`, partial `["medium"]`; signals required `[]`; action correct `["no-action","escalate"]`, partial `["escalate"]`.
- Note: `escalate` appears in both `correct` and `partial` arrays. The scoring engine checks `correct` first, so it correctly awards 1 full point. Intentional and appropriate.
- No discrepancies.

---

### Audit Summary Table

| Scenario | Title (short) | Severity OK? | Signals OK? | Action OK? | Overall |
|----------|---------------|-------------|-------------|------------|---------|
| S1 | Apple ID locked phishing | Yes | WARN: `auth-fail` inferred in reasoning but not in rubric; partial array overlaps required | Yes | INCONSISTENCY |
| S2 | Developer phishing | Yes | FAIL: `spoofed-sender` required but not directly observable from evidence | Yes | INCONSISTENCY |
| S3 | Third-party newsletter spam | Yes | Yes | Yes | CLEAN |
| S4 | Tech support scam (elderly) | Yes | FAIL: `financial-harm` in answer but not in scoring | Yes | INCONSISTENCY |
| S5 | 9to5Mac newsletter | WARN: empty partial | Yes | Yes | MINOR INCONSISTENCY |
| S6 | Legitimate Apple receipt | Yes | Yes | Yes | CLEAN |
| S7 | Reply-To mismatch phishing | Yes | WARN: `urgency`+`impersonation` in answer, not in scoring | Yes | INCONSISTENCY |
| S8 | Apple TV+ promo | WARN: empty partial | Yes | Yes | MINOR INCONSISTENCY |
| S9 | Fake subscription renewal | Yes | CRITICAL: explicit `auth-fail` context ignored in both answer and rubric; `impersonation` in answer but not rubric | Yes | CRITICAL INCONSISTENCY |
| S10 | Family Sharing misdirected | Yes | Yes | Yes | CLEAN |

**Score: 3 clean, 2 minor, 4 inconsistent, 1 critical**

---

## Part 2: Build and UX Pitfalls

---

## Critical Pitfalls

### Pitfall 1: Timer Auto-Submit Race Condition

**What goes wrong:**
The per-scenario 2-minute countdown timer calls `submit()` on expiry. If the candidate has already pressed Submit milliseconds earlier, the timer fires a second `submit()` call. With React state, the second call may operate on stale state (the scenario not yet marked `submitted: true`) and score the scenario twice or overwrite the first score.

**Why it happens:**
`setInterval` / `setTimeout` callbacks close over the initial state reference, not the updated one. In React, if `submit()` reads from a `useRef`-backed state copy and the timer callback holds a stale closure, the guard `if (!canSubmit()) return` may pass on the stale check.

**How to avoid:**
Use a `useRef` for the submitted flag that is mutated synchronously before any async operation. Check the ref, not the state, inside the timer callback. Clear the timer immediately inside `submit()` before setting state. Pattern: `timerRef.current && clearInterval(timerRef.current); timerRef.current = null;`

**Warning signs:**
Scenarios showing `score > 3` in the breakdown, or a scenario scoring twice in the GAS sheet.

**Phase to address:**
Phase implementing the per-scenario timer (scenario player phase).

---

### Pitfall 2: GAS Submission Failure Silent Data Loss

**What goes wrong:**
Google Apps Script endpoints return HTTP 302 redirects on success (or on CORS errors). `fetch()` in no-cors mode silently swallows both success and failure, so the UI shows "submitted" but nothing landed in the Sheet. On quota exhaustion (GAS has a 20,000-request/day limit for free Workspace accounts), every submission after the limit silently fails.

**Why it happens:**
The GAS `doPost` pattern returns `ContentService.createTextOutput(JSON.stringify({status:"ok"}))`, but the browser's fetch in no-cors mode makes the response body opaque. Developers assume a lack of error = success.

**How to avoid:**
Use `mode: "cors"` with proper GAS CORS headers, OR use `mode: "no-cors"` but implement a verification re-fetch GET endpoint that confirms the row was written. Store the full annotation payload in `localStorage` keyed by candidate ID before every GAS call; if the sheet row is missing on the reviewer screen, fall back to the local payload.

**Warning signs:**
GAS sheet has fewer rows than candidates who reached the results screen. Reviewer screen shows no data for candidates who completed the test.

**Phase to address:**
Phase implementing GAS / Sheets backend integration.

---

### Pitfall 3: Stale Terminology Leak from flagmail1

**What goes wrong:**
The React rebuild copies flagmail1 components (hooks, UI primitives) that contain "flag", "moderation", "classification", "zone", "clue", "hint", or "classifier" in variable names, component names, prop names, comments, and aria-labels. These leak into the compiled output, the reviewer screen, and error messages visible to candidates.

**Why it happens:**
Copy-paste component reuse without a systematic terminology audit. String searches miss computed keys (`flagType`, `modLabel`), JSX comments, and aria attributes.

**How to avoid:**
Before copying any flagmail1 file, run a grep audit for the banned terms: `flag`, `moderat`, `classif`, `zone`, `clue`, `hint`. Create a linting rule (ESLint `no-restricted-syntax` or a custom plugin) that errors on these identifiers in the `annotation/` workspace. Write a single find-and-replace pass as part of the component migration plan.

**Warning signs:**
Any use of `flagType`, `moderationLabel`, `classifyEmail`, `zoneId`, `hintButton`, or `clueText` in annotation source files.

**Phase to address:**
Phase 1 (project setup) — enforce via linting before any component work begins.

---

### Pitfall 4: Partial-Credit Scoring Edge Cases

**What goes wrong:**
The scoring engine in the HTML prototype has an undocumented edge case: when `required.length > 0`, partial credit is awarded if any single signal from the `partial` array is matched. But if a candidate selects ALL correct signals AND extra wrong ones (signal pollution), the current engine still awards full credit because it only checks that all required are present, not that no irrelevant ones are selected. This is intentional for generosity but may inflate scores for candidates who spam-select signals.

Separately: if a candidate selects `none-detected` AND other signals simultaneously, the scoring engine's `signals.length === 0` check fails but the `includes("none-detected")` path handles it. However, the UI does not prevent this contradiction — a candidate can select both `none-detected` and `spoofed-sender` simultaneously.

**Why it happens:**
The original prototype has no mutual-exclusion logic for `none-detected` vs. other signals. The React rebuild may carry this forward.

**How to avoid:**
Implement mutual exclusion: selecting `none-detected` deselects all other signals and vice versa. Add a visual indicator when `none-detected` is active to communicate exclusivity. Document in the scoring module that signal pollution does not penalise — this is intentional.

**Warning signs:**
A candidate's annotation shows `none-detected` alongside `spoofed-sender` in the stored state. Results with artificially high signal scores.

**Phase to address:**
Phase implementing the annotation form component.

---

### Pitfall 5: Proctoring False Positives Undermining Hiring Decisions

**What goes wrong:**
Tab-switch / focus-loss detection fires on legitimate candidate actions: switching to a reference email client to compare headers, switching to a dictionary to verify a technical term, or the OS triggering a system notification. Each such event increments a violation counter. The reviewer screen shows "3 violations" and the hiring manager dismisses an otherwise strong candidate.

**Why it happens:**
`visibilitychange` and `blur` events fire for any focus loss, including OS-level events. Developers typically track every event equally.

**How to avoid:**
Debounce focus-loss events (ignore losses shorter than 2 seconds — system notifications are brief). Distinguish between `visibilitychange` (tab actually hidden) and `blur` (window lost focus temporarily). Show the reviewer the raw event log with timestamps, not just a count, so context is recoverable. Add a disclaimer on the test start screen: "We track tab switches — stay in this window." This reduces innocent violations.

**Warning signs:**
Multiple candidates with violation counts of 1–2 despite strong scores. Reviewer feedback that violations seem high across the board.

**Phase to address:**
Phase implementing the proctoring / reviewer screen.

---

## Moderate Pitfalls

### Pitfall 6: Signal Taxonomy Mismatch Between Prototype and React Data Model

**What goes wrong:**
The HTML prototype defines `signalOpts` as a flat array of 10 items. If the React rebuild imports or reconstructs this list from memory, signal IDs may drift (e.g. `"fake-domain"` becomes `"fakeDomain"` or `"lookalike-domain"`). The scoring engine uses strict string equality on signal IDs. A drift of one ID silently breaks scoring for multiple scenarios.

**Why it happens:**
Developers normalise ID casing (camelCase convention) without realising the content data uses kebab-case IDs.

**How to avoid:**
Define the signal taxonomy (and severity/action taxonomies) as a single source-of-truth constant file (`src/data/taxonomy.js`) generated directly from the HTML prototype with zero ID modification. Add a test that validates every `scoring.signals.required` value against the taxonomy ID list at import time.

**Warning signs:**
Any scenario that always scores 0 on signals regardless of selection. Signals that appear selected in the UI but do not affect scoring.

**Phase to address:**
Phase implementing scenario data and scoring engine.

---

### Pitfall 7: `displayScore` Rounding Creates Band Boundary Injustice

**What goes wrong:**
The prototype uses `Math.round(total)` on the score screen but shows `Math.round(total*10)/10` as the display. The band thresholds (80% and 60%) are computed from the rounded integer. A candidate who scores 23.5 / 30 (78.3%) rounds to 78% and misses the "Strong pass" band; a candidate who scores 23.8 / 30 (79.3%) rounds to 79% — also misses. The threshold is not transparent to candidates and may feel arbitrary.

**Why it happens:**
`Math.round()` on percentage introduces a ±0.5% error window at band boundaries.

**How to avoid:**
Use the raw percentage (no rounding) for band classification. Display the rounded value for aesthetics. Document the band thresholds in the results screen as "80% or above = Strong pass" so candidates understand.

**Warning signs:**
Candidates at exactly 24/30 (80%) or 18/30 (60%) who end up in the wrong band.

**Phase to address:**
Phase implementing the results/scoring screen.

---

### Pitfall 8: Accessibility of Pill-Based Multi-Select

**What goes wrong:**
The HTML prototype renders signal pills as `<button>` elements with `onclick` handlers but no `role="checkbox"`, no `aria-checked` attribute, and no `aria-describedby` pointing to the field label. Screen readers announce them as buttons with no selected/unselected state. Keyboard navigation works (buttons are focusable) but the state is not communicated.

**Why it happens:**
Pills look like checkboxes but are built as buttons. Developers treat visual appearance as equivalent to accessible semantics.

**How to avoid:**
Either use real `<input type="checkbox">` elements styled as pills, or add `role="checkbox"` + `aria-checked={isActive}` to each pill button. Group signals under a `<fieldset>` + `<legend>` with the field label as the legend text. Ensure the `none-detected` pill has `aria-controls` pointing to the other signal pills it deselects.

**Warning signs:**
VoiceOver / NVDA announces "button" rather than "checkbox, checked/unchecked" for signal pills.

**Phase to address:**
Phase implementing the annotation form component.

---

### Pitfall 9: Reviewer Passcode Stored Client-Side

**What goes wrong:**
With "no identity provider" and a shared passcode, the passcode check happens entirely in JavaScript. The passcode is visible in the bundle to anyone who opens DevTools. A determined candidate can access the reviewer screen before the hiring manager.

**Why it happens:**
The constraint "shared passcode only" implies client-side implementation by default. Developers don't see this as a security concern for an internal hiring tool.

**How to avoid:**
Hash the passcode (SHA-256 via `crypto.subtle`) and compare against the stored hash rather than the plaintext. This does not prevent a determined developer from extracting the hash and brute-forcing a short passcode, but it removes the plaintext from the bundle. Alternatively, gate the reviewer screen behind a GAS URL parameter that the passcode unlocks on the backend — the reviewer data is then only fetched on correct passcode entry, not held in the client.

**Warning signs:**
Passcode visible via `grep -r "passcode"` in built bundle. Reviewer route accessible by any candidate who reads the source.

**Phase to address:**
Phase implementing the reviewer screen.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline scenario data in JS constant | No API needed, deterministic scoring | Content changes require a code deploy; no CMS | Acceptable for fixed 10-scenario test |
| No-cors GAS fetch without verification | Simple integration | Silent data loss undetectable | Never — add localStorage fallback |
| Shared passcode for reviewer | Zero auth infrastructure | Any candidate can access reviewer data | Acceptable if passcode is rotated per cohort |
| `Math.round()` for score display | Looks clean | Band-boundary injustice at 80% / 60% | Never for classification — use floor for bands |
| `disabled` attribute on pills post-submit | Simple UX lock | Disabled elements not announced by screen readers | Fix with `aria-disabled` + `pointer-events: none` |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Apps Script doPost | Fetch in `no-cors`, assume opaque = success | Add localStorage backup; use GET verify endpoint |
| GAS CORS | Return plain text output without CORS headers | `ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON)` + add `Access-Control-Allow-Origin` via HtmlService wrapper if needed |
| Sheets row ordering | Append rows naively; concurrent submissions create race | Use `LockService.getScriptLock()` in GAS before `appendRow` |
| GAS quotas | No quota monitoring | Log submission count to a named range; alert at 80% of daily quota |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering entire scenario on every signal toggle | Pill click causes full email re-render | Separate annotation form into its own component with local state | Noticeable at 10 signals × 10 scenarios; acceptable but avoidable |
| Timer leak on scenario navigation | Timer from S1 fires on S3's submit | Clear timer in useEffect cleanup on scenario index change | Every navigation event |
| localStorage write on every keystroke (if notes field added later) | Input lag on slow devices | Debounce localStorage writes to 500ms | Any device at 10 writes/second |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Plaintext passcode in JS bundle | Candidates access reviewer screen | SHA-256 hash in bundle; verify on GAS side |
| Candidate ID from URL param without sanitisation | XSS via crafted URL shared between candidates | Sanitise URL params; use `encodeURIComponent` / `textContent` not `innerHTML` |
| Score manipulation via DevTools localStorage | Candidate edits their stored score | GAS backend is authoritative; never trust client-side score for hiring decisions |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Timer expiry with no warning | Candidate loses work mid-annotation | Show countdown colour change at 30s; shake/pulse at 10s |
| Auto-submit on timer expiry submits empty annotation | Score of 0/3 for timeout; candidate has no idea why | Submit whatever is selected at expiry; show "Time's up — partial answer submitted" in feedback |
| No confirmation before navigating away from unsaved scenario | Candidate loses selected signals | Warn on navigation if severity or signals selected but not submitted |
| Feedback shown immediately after submit with no transition | Cognitive whiplash; candidate reads answer before processing their own | Brief 300ms delay before revealing result panel |
| "View results" button only enabled after all 10 submitted | Candidate blocked if timer skipped them past a scenario | Allow viewing results with a warning if fewer than 10 are submitted |

---

## "Looks Done But Isn't" Checklist

- [ ] **Scoring engine:** Verify all 10 scenario IDs match taxonomy IDs exactly — no camelCase drift. Run unit tests for each scenario's correct/partial/fail cases.
- [ ] **auth-fail signal:** Confirm S9 (and S1 if inferred) rubric includes `auth-fail` before shipping content data.
- [ ] **Timer cleanup:** Verify `clearInterval` is called in the `useEffect` return for every scenario mount/unmount. Test rapid navigation.
- [ ] **GAS fallback:** Confirm localStorage backup is written before every fetch call, and the reviewer screen can recover from it.
- [ ] **Stale terminology:** Run `grep -r "flag\|moderat\|classif\|zone\|clue\|hint" src/` — zero results expected.
- [ ] **Pill accessibility:** Run VoiceOver + Chrome on the annotation form — every pill must announce checked/unchecked state.
- [ ] **Band thresholds:** Test a 24/30 (80%) candidate — must land in "Strong pass", not "Borderline".
- [ ] **Proctoring log:** Reviewer screen shows per-event timestamps, not just a count.
- [ ] **`none-detected` mutual exclusion:** Select `none-detected` then `spoofed-sender` — verify only `spoofed-sender` remains active.
- [ ] **Results screen rounding:** `Math.round(total)` display vs. raw `total` for band classification — verify they are separate.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| auth-fail missing from S9 rubric post-launch | MEDIUM | Deploy updated scenario data constant; all scores already collected are stale — re-run affected candidates or adjust manually |
| GAS data loss discovered after cohort | HIGH | Recover from localStorage exports if available; re-invite candidates with data loss |
| Stale terminology discovered by hiring manager | LOW | String replace in source, redeploy; no data impact |
| Timer race double-score | MEDIUM | Audit Sheets for duplicate rows per candidate; discard second submission |
| Reviewer passcode leaked | LOW | Rotate passcode; redeploy with new hash |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Answer-key / rubric inconsistencies (S1, S2, S4, S7, S9) | Phase 1: Content audit before any code | Unit test every scenario against expected score outcomes |
| Stale flagmail1 terminology | Phase 1: Setup — add lint rule before first component copy | `grep` audit on every PR |
| Signal taxonomy ID drift | Phase 2: Data layer — single taxonomy constant | Import-time validation test |
| Partial-credit edge cases (none-detected conflict) | Phase 2: Scoring engine | Scoring unit tests cover all edge cases |
| Timer race condition | Phase 3: Scenario player | Playwright test: click Submit at T-1s, verify single submission |
| Pill accessibility | Phase 3: Annotation form | axe-core automated scan + manual VoiceOver test |
| Band rounding injustice | Phase 4: Results screen | Unit test: 24/30 = Strong pass, 23.9/30 = Borderline |
| GAS silent data loss | Phase 5: Backend integration | Integration test: kill network mid-submit, verify localStorage recovery |
| Proctoring false positives | Phase 5: Reviewer screen | Manual test: OS notification during test, verify not counted |
| Reviewer passcode in bundle | Phase 5: Reviewer screen | Bundle grep for passcode string; GAS-side verification |

---

## Sources

- Direct source audit: `apple_email_abuse_annotation_workspace (1).html` — all 10 scenario objects read line by line
- Project constraints: `.planning/PROJECT.md`
- GAS silent-failure pattern: known issue with `fetch` + `no-cors` + Google Apps Script (confirmed via community reports on Stack Overflow and GAS docs)
- React timer cleanup: React docs on `useEffect` cleanup functions
- WCAG 2.1 SC 4.1.2: Name, Role, Value — pill-as-button accessibility requirement

---
*Pitfalls research for: Email Abuse Annotation Hiring Test*
*Researched: 2026-05-22*
