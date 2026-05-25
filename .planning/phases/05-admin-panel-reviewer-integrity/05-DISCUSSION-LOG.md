# Phase 05: Admin Panel, Reviewer & Integrity - Discussion Log

**Date:** 2026-05-25
**Mode:** Default (interactive)

## Discussion Areas

### 1. Routing
- **Question:** How should we handle routing? App.jsx currently uses screen-state (no URL router).
- **Options:** react-router-dom, Hash router (custom), Keep screen-state + URL param
- **Decision:** react-router-dom — URL-based routing at /annotation and /annotation/admin

### 2. Admin Auth
- **Question:** Admin panel at /annotation/admin — how should access be controlled?
- **Options:** Shared passcode (like reviewer), Separate admin passcode, No auth hidden route
- **Decision:** Shared passcode (like reviewer) — same pattern as reviewer screen

### 3. Reports
- **Question:** Admin needs to download individual candidate reports and overall summary. What format?
- **Options:** CSV only, CSV + PDF (library), Download from GAS backend
- **Decision:** CSV + PDF (library) — both formats, client-side generation

### 4. Admin Data Source
- **Question:** Where does admin panel get candidate data?
- **Options:** GAS API + localStorage fallback, localStorage only, New GAS endpoint for admin
- **Decision:** New GAS endpoint for admin — richer data with efficiency stats and per-scenario breakdowns

### 5. Admin Layout (additional)
- **Question:** Admin panel visual style — match candidate flow or look distinct?
- **Options:** Reuse flagmail1 design system, Distinct admin styling
- **Decision:** Reuse flagmail1 design system (user skipped — defaulted to consistency)

### 6. Candidate Detail (additional)
- **Question:** Admin drills into individual candidate — how should detailed view work?
- **Options:** Drill-down page with react-router, Modal/overlay, Expandable row inline
- **Decision:** Drill-down page with react-router — /annotation/admin/candidate/:id

### 7. PDF Library (additional)
- **Question:** Which PDF library for report generation?
- **Options:** jsPDF, @react-pdf/renderer, html2canvas + browser print
- **Decision:** @react-pdf/renderer — React-friendly, JSX-to-PDF

### 8. Proctoring Display (additional)
- **Question:** How should proctoring violations be displayed in admin?
- **Options:** Violation count + visual indicator, Detailed violation log
- **Decision:** Violation count + visual indicator — red highlight when > 0

## Deferred Ideas

None.

---

*Discussion completed: 2026-05-25*
*8 areas discussed, 9 decisions captured*
