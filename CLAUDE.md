<!-- GSD:project-start source:PROJECT.md -->
## Project

**Email Abuse Annotation Test**

A browser-based hiring screening test for the Apple Email Abuse Annotation team.
Candidates work through 10 reported-email scenarios — reading full headers, body, and
any annotator context note — and fill an annotation form for each: severity, abuse
signals, and recommended action. The test auto-scores every annotation, shows a
per-scenario results breakdown, and exposes a reviewer screen for hiring decisions.

It is a fresh React rebuild that reuses the **visual theme and design language** of the
sibling project `flagmail1` — but not its game mechanics. The content and game logic
come from the standalone `apple_email_abuse_annotation_workspace` HTML prototype.

**Core Value:** A candidate can complete a realistic email-abuse annotation test and receive an
automatic, defensible score plus a per-scenario breakdown that a reviewer can trust.

### Constraints

- **Tech stack**: React 19 + Vite + plain JavaScript — no TypeScript, no router, no
  state library, no CSS framework. Match flagmail1's hook/component conventions.
- **Backend**: Reuse the Google Apps Script + Sheets integration pattern — no new
  backend service.
- **Auth**: Reviewer access is a shared passcode only — no identity provider.
- **Scoring**: Must be deterministic (no external API at grade time).
- **Content**: The 10 scenarios are fixed — verify and correct answer keys, do not
  add or remove scenarios.
- **Design**: Reuse flagmail1's theme and design language; do not reuse its game
  structure.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Context
## Recommended Stack
### Core Technologies
| Technology | flagmail1 Version | Current npm | Recommendation | Why |
|------------|-------------------|-------------|----------------|-----|
| **React** | `^19.2.0` | `19.2.6` | Pin to `^19.2.0` — already correct | React 19 is the current stable major. `^19.2.0` picks up 19.2.6 automatically. No action needed. |
| **react-dom** | `^19.2.0` | `19.2.6` | Same as React | Must match React version exactly. |
| **Vite** | `^7.3.1` | `8.0.14` | Stick with `^7.3.1` for now | Vite 8 ships Rolldown as the bundler (replaces Rollup). It is production-ready but is an architectural shift. flagmail1 is already on the newest Vite 7 patch. Bump to Vite 8 is a worthwhile future upgrade but not worth the risk mid-project. |
| **@vitejs/plugin-react** | `^5.1.1` | `6.0.2` (for Vite 8), `5.1.1` (for Vite 7) | Keep `^5.1.1` | v6 uses Oxc instead of Babel and is paired with Vite 8. v5 continues to work with Vite 7 and is the correct pairing. Do not bump independently. |
| **JavaScript (ES2020+)** | — | — | No TypeScript | Plain JS is an explicit project constraint. All files `.js` / `.jsx`. |
| **Node.js** | — | — | Dev toolchain only | No server runtime. Node runs Vite and ESLint only. |
### Animation Libraries
| Library | flagmail1 Version | Current npm | Bump? | Notes |
|---------|-------------------|-------------|-------|-------|
| **framer-motion** | `^11.18.2` | `12.40.0` | Optional — medium risk | v12 has no React-side breaking changes. Import path changes from `"framer-motion"` to `"motion/react"`. If you bump, do a search-replace on imports. Staying on v11 is safer during initial build. |
| **gsap** | `^3.12.5` | `3.15.0` | Safe to bump | GSAP 3.x is semver-stable. `^3.12.5` will resolve to 3.15.0 automatically. No action needed. |
| **animejs** | `^3.2.2` | `4.4.1` (v4 is new major) | Do NOT bump | v4 is a breaking rewrite with new API. flagmail1 uses v3 API. Lock to `^3.2.2` explicitly. |
| **lottie-react** | `^2.4.1` | `2.4.1` | No bump available | Package has had no release in ~1 year. Stable and adequate for Lottie JSON playback. No action needed. Consider `@lottiefiles/dotlottie-react` only if new Lottie features are required. |
| **matter-js** | `^0.19.0` | `0.20.0` | Safe to bump | Minor version bump. `^0.19.0` resolves to `0.20.0` automatically. No breaking changes reported. |
### Data & Utilities
| Library | flagmail1 Version | Current npm | Bump? | Notes |
|---------|-------------------|-------------|-------|-------|
| **papaparse** | `^5.5.3` | `5.5.3` | No bump available | Mature CSV parsing library. No new release. `^5.5.3` is already current. |
| **prop-types** | `^15.8.1` | `15.8.1` | No bump available | Runtime prop validation. The project uses plain JS (no TypeScript), so prop-types fills the gap for dev-time safety. Retained from flagmail1 even though flagmail1's CLAUDE.md says "No PropTypes or TypeScript interfaces" in component patterns — the package is present in package.json and should be available. |
### Development Tools
| Tool | flagmail1 Version | Current npm | Bump? | Notes |
|------|-------------------|-------------|-------|-------|
| **eslint** | `^9.39.1` | `9.39.1` (latest v9) | No bump needed | ESLint v9 with flat config is the current standard. v9 EOL is 2026-08-06 — well past this project timeline. |
| **@eslint/js** | `^9.39.1` | same | Already current | Must match eslint version. |
| **eslint-plugin-react-hooks** | `^7.0.1` | `7.0.1` | Already current | Provides `rules-of-hooks` and `exhaustive-deps`. |
| **eslint-plugin-react-refresh** | `^0.4.24` | `0.4.24` | Already current | Enforces HMR-safe component exports. |
| **globals** | `^16.5.0` | `16.5.0` | Already current | Browser globals list for ESLint flat config. |
| **vitest** | `^4.1.7` | `4.1.7` (5.0.0-beta.2 exists) | No bump needed | v4 is stable. v5 is beta. Match flagmail1 exactly. |
| **playwright** | `^1.59.1` | `1.60.0` | Safe to bump | Used for headless screenshots and layout audits, not full E2E test suite. `^1.59.1` will not auto-resolve to 1.60.0 (semver minor). Bump to `^1.60.0` when convenient but it is not blocking. |
| **@types/react** | `^19.2.7` | current | Already current | Type stubs only — not used in code, just improves editor autocomplete. |
| **@types/react-dom** | `^19.2.3` | current | Already current | Same — editor stubs only. |
## Vite Configuration
## ESLint Configuration
## Google Apps Script + Google Sheets Backend
### Pattern Summary
### How It Works
### Adaptation for This Project
- Replace `zone1Score`, `zone2Score`, `zone3Score` fields with per-scenario annotation data
- Replace `RawData` column headers with annotation-specific columns (scenarioId, severity, signals, action, correct severity, partial credit, etc.)
- Keep `Summary` tab structure (Timestamp, Name, Email, Status, Score, DisplayScore, Title, Proctoring Violations)
- Keep the `register` / `submit` / `checkEmail` action dispatch pattern unchanged
- Add a `getResults` GET action (passcode-gated) for the reviewer screen — same pattern as `getSOCSubmissions`
### Frontend Integration Pattern
## Installation
# Production dependencies
# Dev dependencies
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **TypeScript** | Explicit project constraint. flagmail1 is plain JS. Adding TS mid-project breaks the "match flagmail1" requirement and doubles setup cost. | Plain JavaScript (ES2020+), JSDoc comments for editor hints |
| **React Router** | The app is a linear flow with 5-7 screens. A custom `SCREENS` enum + `useState` switch (flagmail1 pattern) is 10 lines and zero dependencies. | `SCREENS` enum in `useAnnotationState.js` |
| **Redux / Zustand / Jotai** | Overkill for a single-session, no-persistence app. flagmail1 uses only `useState` and hook composition. | `useState` + `useCallback` in domain hooks composed in `App.jsx` |
| **Tailwind / CSS Modules / CSS-in-JS** | flagmail1 uses plain CSS with CSS variables. The visual theme lives in those variables. Using a framework would require porting the entire design system. | Plain CSS, `src/index.css`, `--annotation-*` CSS variables |
| **animejs v4** | Major breaking API rewrite. flagmail1 uses v3 API. `^3.2.2` resolves correctly; bumping to v4 breaks existing animations if any are copied from flagmail1. | Lock to `animejs@^3.2.2` |
| **framer-motion v12 (motion)** | Safe upgrade path exists but requires import path changes throughout. Low value during initial build. | Stay on `framer-motion@^11.18.2` initially |
| **Vite 8** | Rolldown-based bundler is a new architecture. The Vite 7 → 8 path is recommended via `rolldown-vite` shim first. Low value during initial build. | Stay on `vite@^7.3.1` |
| **@vitejs/plugin-react v6** | Drops Babel, uses Oxc. Paired with Vite 8 only. v5 is correct for Vite 7. | `@vitejs/plugin-react@^5.1.1` |
| **New backend service (Express, Supabase, Firebase)** | Explicit constraint: reuse the GAS + Sheets pattern. A new backend adds cost, infrastructure, and auth complexity for no additional value in a hiring-test context. | Google Apps Script web app |
| **External scoring API** | Scoring must be deterministic and offline-safe. An API call at grade time creates a network dependency that can fail during a timed test. | All scoring logic in `src/data/scenarios.js` and `src/utils/score.js` |
## Alternatives Considered
| Recommended | Alternative | When Alternative Makes Sense |
|-------------|-------------|------------------------------|
| Vite 7 | Vite 8 | After project ships and stabilises — Vite 8 is the better long-term choice |
| framer-motion v11 | motion v12 | Future milestone — no-breaking-changes upgrade, update imports when convenient |
| animejs v3 | animejs v4 | Only if rebuilding all animation code from scratch — v4 is a cleaner API |
| lottie-react | @lottiefiles/dotlottie-react | If Lottie JSON assets are replaced with .lottie format (smaller, encrypted) |
| GAS + Sheets | Supabase | If the project needs real auth, row-level security, or >10K candidates |
| Custom SCREENS enum | React Router | If the project grows to 10+ distinct URL-addressable views |
## Version Compatibility Matrix
| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `vite@^7.3.1` | `@vitejs/plugin-react@^5.1.1` | v5 plugin is the correct pairing for Vite 7 |
| `vite@^8.x` | `@vitejs/plugin-react@^6.x` | v6 plugin required for Vite 8 (Oxc-based transforms) |
| `react@^19.2.0` | `framer-motion@^11.x` | v11 supports React 19; v12 also supports React 19 |
| `react@^19.2.0` | `lottie-react@^2.4.1` | Tested; no known React 19 incompatibility |
| `animejs@^3.2.2` | Any React version | Vanilla JS library, no React dependency |
| `eslint@^9.39.1` | `globals@^16.5.0` | `globals` v16 is the required companion for ESLint v9 flat config |
| `vitest@^4.1.7` | `vite@^7.3.1` | Vitest 4.x is designed for Vite 7 |
## Sources
- flagmail1 `package.json` — ground truth for all versions (HIGH confidence, first-party)
- flagmail1 `vite.config.js` — Vite configuration pattern (HIGH confidence, first-party)
- flagmail1 `eslint.config.js` — ESLint flat config pattern (HIGH confidence, first-party)
- flagmail1 `google-apps-script.js` — GAS backend implementation (HIGH confidence, first-party)
- flagmail1 `CLAUDE.md` — stack documentation and conventions (HIGH confidence, first-party)
- [npmjs.com/package/vite](https://www.npmjs.com/package/vite) — Vite 8.0.14 is latest (verified 2026-05-22)
- [vite.dev/blog/announcing-vite8](https://vite.dev/blog/announcing-vite8) — Vite 8 breaking changes and migration path
- [react.dev/blog/2025/10/01/react-19-2](https://react.dev/blog/2025/10/01/react-19-2) — React 19.2.6 is current stable
- [motion.dev/docs/react-upgrade-guide](https://motion.dev/docs/react-upgrade-guide) — framer-motion v11 → motion v12 has no React breaking changes
- [eslint.org/blog/2025/10/eslint-v9.38.0-released](https://eslint.org/blog/2025/10/eslint-v9.38.0-released/) — ESLint v9.38/39 is current stable
- [npmjs.com/package/animejs](https://www.npmjs.com/package/animejs) — animejs v4.4.1 is latest (major breaking rewrite vs v3)
- [npmjs.com/package/gsap](https://www.npmjs.com/package/gsap) — gsap 3.15.0 is latest; 3.x range resolves safely
- [vitest.dev/blog/vitest-4-1](https://vitest.dev/blog/vitest-4-1.html) — vitest 4.1.7 is current stable (v5 is beta)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
