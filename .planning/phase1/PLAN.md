# Phase 1 Plan: Data Foundation

## Goal
Project scaffolds correctly. All scenario content verified, corrected, locked as authoritative data layer before scoring/UI code.

## Requirements
SETUP-01, SETUP-02, SETUP-03, SETUP-04, CONTENT-01, CONTENT-02, CONTENT-03

## Tasks

### 1.1 Scaffold Vite + React 19 project
- `npm create vite@latest` with React template, plain JS
- Set `base: '/annotation/'` in vite.config.js
- Verify `npm run dev` starts clean

### 1.2 ESLint banned-terminology rule
- Flat config: restrict `flag`, `zone`, `clue`, `hint`, `classif`, `moderat`
- Verify by committing a test violation then reverting

### 1.3 Create src/data/taxonomy.js
- SEVERITY_OPTS (5): not-abusive, low, medium, high, critical
- SIGNAL_OPTS (10): spoofed-sender, fake-domain, urgency, impersonation, unsolicited, vulnerable-target, financial-harm, malware-link, auth-fail, none-detected
- ACTION_OPTS (4): no-action, filter, remove, escalate
- Direct copy from HTML prototype, zero ID modification

### 1.4 Create src/data/scenarios.js — all 10 scenarios with corrected answer keys
Inherits from HTML prototype. Apply 7 fixes:

| # | Scenario | Fix |
|---|----------|-----|
| S1 | Apple ID phishing | Add `auth-fail` to `scoring.signals.partial` (inferred in reasoning but not evidenced by context) |
| S2 | Developer phishing | Move `spoofed-sender` from required to partial; keep `impersonation` as required (spoofing is inferred, not directly observable) |
| S4 | Tech support scam | Add `financial-harm` to `scoring.signals.required` (explicitly states $299 fee) |
| S5 | 9to5Mac newsletter | Add `medium` to `severity.partial` |
| S7 | Reply-To phishing | Add `urgency`, `impersonation` to `scoring.signals.partial` |
| S8 | Apple TV+ promo | Add `medium` to `severity.partial` |
| S9 | Fake subscription renewal | **CRITICAL**: Add `auth-fail` to `answer.signals` and `scoring.signals.required`; add `impersonation` to `scoring.signals.partial` |

### 1.5 Verification
- Import scenarios in Node, verify all signal IDs exist in taxonomy
- Verify no undefined fields
- Verify Scenario 9 auth-fail presence
- Verify every signal in answer.signals appears in scoring (required ∪ partial)
