---
phase: quick
plan: 260608-mra
type: execute
wave: 1
depends_on: []
files_modified:
  - src/data/scenarios.js
  - src/hooks/useAnnotationState.js
  - src/utils/api.js
  - src/hooks/useReviewer.js
  - src/components/LeaderboardScreen.jsx
  - verify-phase1.mjs
  - .github/workflows/sast.yml
  - src/utils/score-verification.test.js
autonomous: true
requirements: [SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05]

must_haves:
  truths:
    - "All uncommitted changes are committed with a clean, descriptive message"
    - "The SAST CI workflow is committed and will run on the next push"
    - "Phase 2 is formally verified: scoreRound and useScoring are tested and passing"
    - "ROADMAP.md Phase 2 status reflects the existing implementation"
  artifacts:
    - path: ".github/workflows/sast.yml"
      provides: "Bearer SAST CI job"
    - path: "src/utils/score.test.js"
      provides: "Unit tests for scoreRound and calculateOverallResults"
    - path: "src/utils/score-verification.test.js"
      provides: "Exhaustive 10-scenario scoring verification"
  key_links:
    - from: "src/utils/score-verification.test.js"
      to: "src/data/scenarios.js"
      via: "import scenarios"
      pattern: "import scenarios"
---

<objective>
Tidy three streams of uncommitted work, verify Phase 2 is actually complete, and land
in a clean state ready to begin Phase 3.

Purpose: Six files were modified (security hardening + branding anonymisation) and one
new file was added (SAST CI workflow) — none of it committed. Meanwhile Phase 2 code
(score.js, useScoring.js, two test files) exists in the repo but was never formally
run, verified, or recorded as done. This plan commits the pending work, runs the Phase
2 test suite, and updates the roadmap so STATE.md reflects reality.

Output:
- One git commit with all security/branding/SAST changes
- Verified passing Phase 2 test suite
- ROADMAP.md and STATE.md updated to record Phase 2 as complete
</objective>

<execution_context>
@C:\Users\anoop\.claude\get-shit-done\workflows\execute-plan.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Commit pending security, branding, and SAST changes</name>
  <files>
    src/data/scenarios.js
    src/hooks/useAnnotationState.js
    src/utils/api.js
    src/hooks/useReviewer.js
    src/components/LeaderboardScreen.jsx
    verify-phase1.mjs
    .github/workflows/sast.yml
  </files>
  <action>
Stage and commit all seven modified/untracked files as a single atomic security and
housekeeping commit. The changes form three coherent sub-themes that belong together:

1. Branding anonymisation (scenarios.js): All Apple-specific proper nouns (Apple ID,
   iCloud, App Store, Apple Support, 9to5Mac, GarageBand, Apple TV+, iTunes, Family
   Sharing, Guideline 4.3, Apple Care) replaced with neutral "Orange" equivalents.
   This makes the test usable without revealing the client name to candidates.

2. Security hardening (useAnnotationState.js, api.js, useReviewer.js,
   LeaderboardScreen.jsx):
   - CSPRNG shuffle: Math.random() replaced with crypto.getRandomValues() in
     shuffleArray() — prevents a predictable scenario order that could be
     pre-memorised (useAnnotationState.js).
   - CWE-312 fix: safeguardSubmission() in api.js no longer writes the full
     submission payload (including name, email, scores) to localStorage keyed by
     email. Only a boolean pending flag is kept. submitViaBeacon() is now a no-op
     stub; the beacon read path that depended on the persisted payload is also
     removed.
   - Log-leak hardening: All console.error calls that passed the raw Error object as
     a second argument have been stripped to message-only strings (useReviewer.js,
     api.js, LeaderboardScreen.jsx, useAnnotationState.js). This prevents stack
     traces, file paths, and error internals from appearing in browser DevTools
     during a supervised hiring test.

3. SAST CI (.github/workflows/sast.yml, verify-phase1.mjs): A Bearer SAST workflow
   fires on every push and PR to main, scanning for secrets and SAST findings at
   critical/high/medium severity. verify-phase1.mjs gained bearer:disable comments
   on the console.log lines that trigger javascript_lang-logger_leak false positives
   (these are intentional summary output lines in a dev-only verification script, not
   production code).

Use this exact commit message:
  security: CSPRNG shuffle, CWE-312 localStorage fix, log-leak hardening, SAST CI

  - Replace Math.random() with crypto.getRandomValues() in shuffleArray
  - Remove full payload persistence from safeguardSubmission (CWE-312)
  - Stub out submitViaBeacon (payload no longer available in localStorage)
  - Strip Error objects from all console.error calls (log-leak)
  - Add Bearer SAST GitHub Actions workflow (.github/workflows/sast.yml)
  - Add bearer:disable suppressions to verify-phase1.mjs dev script
  - Anonymise scenario branding: Apple -> Orange throughout scenarios.js

Stage with explicit file paths (do not use git add -A):
  git add src/data/scenarios.js src/hooks/useAnnotationState.js src/utils/api.js \
    src/hooks/useReviewer.js src/components/LeaderboardScreen.jsx \
    verify-phase1.mjs .github/workflows/sast.yml
  git commit -m "..."
  </action>
  <verify>
    <automated>cd "C:\Users\anoop\OneDrive\Desktop\apple\annotation" && git log --oneline -1 && git status --short 2>&1</automated>
  </verify>
  <done>
    git log --oneline -1 shows the security commit as HEAD; git status shows no
    remaining unstaged changes for the seven files listed above.
  </done>
</task>

<task type="auto">
  <name>Task 2: Run Phase 2 test suite and record Phase 2 as complete</name>
  <files>
    .planning/ROADMAP.md
    .planning/STATE.md
  </files>
  <action>
Phase 2 (Scoring Engine) code is fully written — src/utils/score.js,
src/hooks/useScoring.js, src/utils/score.test.js, and
src/utils/score-verification.test.js all exist. The phase was never formally verified
or recorded as done. Do this now:

Step A — Run the test suite:

  npx vitest run src/utils/score.test.js src/utils/score-verification.test.js

All tests must pass. score.test.js has 6 unit tests covering perfect scores, partial
credit, proportional signal credit, zero points, no-required-signals edge case, and
band classification. score-verification.test.js runs 4 tests per scenario across all
10 scenarios (40 tests total) exercising the correct-answer, partial, wrong, and
empty-submission paths.

If any test fails, read the failure output and fix the defect in score.js or the
test expectation before proceeding. Do not mark Phase 2 complete until all 46 tests
pass.

Step B — Also run the Phase 1 verification to confirm nothing regressed:

  node verify-phase1.mjs

All criteria must still pass. If the "Apple" -> "Orange" branding change broke any
verify-phase1.mjs text-search check (it may check for literal strings), update the
verification script to match the new "Orange" branding rather than reverting scenarios.

Step C — Update .planning/ROADMAP.md:

In the Phase 2 block, change:
  **Plans**: TBD
to:
  **Plans**: 1 plan (implemented inline with Phase 1 scaffold, verified 2026-06-08)
  Plans:
  - [x] score.js + useScoring.js — Pure scoring engine, calibrated weights, band thresholds

In the Progress table, update Phase 2 row from "Not started" to "Done" with today's
date (2026-06-08).

Step D — Update .planning/STATE.md:

Change "Current focus: Phase 1" to "Current focus: Phase 3 — Annotation Round Flow"

Update progress section:
  completed_phases: 2
  percent: 33

Add to Accumulated Context > Decisions:
  - Phase 2 scoring engine verified 2026-06-08: scoreRound() is pure, 46/46 tests
    pass; band thresholds 80%/60% confirmed correct per ROADMAP criteria; CWE-312
    localStorage fix removed submitViaBeacon relay path — GAS is now the sole
    durable submission channel

Update last_activity:
  "2026-06-08 — Phase 2 verified: 46 scoring tests pass; security hardening + SAST CI committed"
  </action>
  <verify>
    <automated>cd "C:\Users\anoop\OneDrive\Desktop\apple\annotation" && npx vitest run src/utils/score.test.js src/utils/score-verification.test.js 2>&1 | tail -20</automated>
  </verify>
  <done>
    vitest run exits 0 with all 46 tests passing; ROADMAP.md shows Phase 2 as done;
    STATE.md current_focus is Phase 3; no regressions in verify-phase1.mjs output.
  </done>
</task>

<task type="auto">
  <name>Task 3: Commit the planning state updates</name>
  <files>
    .planning/ROADMAP.md
    .planning/STATE.md
  </files>
  <action>
Stage and commit the planning file updates from Task 2:

  git add .planning/ROADMAP.md .planning/STATE.md
  git commit -m "docs(planning): record Phase 2 as complete, advance focus to Phase 3"

No other files should be staged.
  </action>
  <verify>
    <automated>cd "C:\Users\anoop\OneDrive\Desktop\apple\annotation" && git log --oneline -3 2>&1</automated>
  </verify>
  <done>
    git log -3 shows two new commits on top of d764d64: the security commit (Task 1)
    and the planning docs commit (Task 3). Working tree is clean.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser console | Error objects previously leaked to DevTools during supervised tests; now message-only |
| localStorage | Previously stored full submission payload (name, email, scores) — now only a boolean flag |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-01 | Information Disclosure | console.error calls | mitigate | Strip Error object arg from all console.error — already done in the pending diff |
| T-quick-02 | Information Disclosure | safeguardSubmission localStorage | mitigate | Remove payload persistence (CWE-312) — already done in pending diff |
| T-quick-03 | Tampering | Math.random() shuffle | mitigate | Replace with crypto.getRandomValues() CSPRNG — already done in pending diff |
| T-quick-SC | Tampering | npm/pip installs | accept | No new packages installed in this plan; no package legitimacy audit needed |
</threat_model>

<verification>
After all three tasks complete, the repo is in this state:

1. `git status` is clean (no unstaged or untracked files from the security/branding pass)
2. `npx vitest run src/utils/score.test.js src/utils/score-verification.test.js` exits 0, 46 tests pass
3. `node verify-phase1.mjs` exits with 0 failures
4. `git log --oneline -3` shows the two new commits on top of d764d64
5. ROADMAP.md Phase 2 progress row shows "Done" with date 2026-06-08
6. STATE.md current_focus is "Phase 3 — Annotation Round Flow"
</verification>

<success_criteria>
- Security/branding/SAST changes committed atomically with a traceable message
- 46 Phase 2 scoring tests pass without modification
- Planning artifacts reflect actual project state (Phase 2 done, Phase 3 next)
- Working tree is clean; repo is ready for `/gsd:plan-phase 3`
</success_criteria>

<output>
No SUMMARY.md needed for quick tasks. Return ## PLANNING COMPLETE to orchestrator.
</output>
