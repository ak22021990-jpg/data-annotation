# Brand Audit Report — Email Abuse Annotation Test
**Generated:** 2026-08-17  
**Auditor:** Automated scan + manual review  
**Scope:** All files served to candidates and reviewers at runtime

---

## Executive Summary

**No brand violations exist in any file served to candidates or reviewers.**

The assessment is fully brand-neutral from the perspective of test-takers and hiring managers. Brand-specific content exists only in internal planning documents and raw data archives that are never loaded or served by the application.

---

## Verdict by File Category

| Category | Files | Brand-neutral? | Notes |
|----------|-------|:--------------:|-------|
| **Scenario content** | `src/data/scenarios.js` | ✅ YES | All brand names replaced with "Orange" |
| **App components** | `src/components/*.jsx` | ✅ YES | No brand references |
| **Hooks** | `src/hooks/*.js` | ✅ YES | No brand references |
| **Utilities** | `src/utils/*.js` | ✅ YES | No brand references |
| **Config** | `src/config/config.js` | ✅ YES | No brand references |
| **Styles** | `src/index.css`, `src/App.css` | ✅ YES | `-apple-system` font stack is a generic CSS system font fallback, not a brand disclosure (see note below) |
| **Backend (GAS)** | `google-apps-script.js` | ✅ YES | No brand references |
| **Build output** | `dist/` | ✅ YES | Built from brand-neutral source |

---

## Served Application — Detail

### `src/data/scenarios.js` (10 email scenarios)
All Apple-specific proper nouns were replaced with the neutral "Orange" brand equivalent in a prior anonymisation pass:

| Original | Replaced With |
|----------|---------------|
| Apple ID | Orange ID |
| iCloud | OrangeCloud |
| App Store | Orange Store |
| Apple Support | Orange Support |
| Apple TV+ | Orange TV+ |
| apple.com domains | orange.com domains |
| iTunes | Orange Music |
| Family Sharing | Orange Family |
| GarageBand | Orange Studio |
| 9to5Mac | OrangeNews |
| Apple Care | Orange Care |

**Status: CLEAN ✅**

### CSS Font Stack — `-apple-system`
Occurrences in `src/App.jsx`, `src/index.css`, and component files:
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
```
This is a **standard CSS system font fallback keyword**, not a brand disclosure. It is:
- Invisible to end users (no text rendered)
- Industry-standard practice used by virtually all web applications
- Functionally equivalent to `system-ui` in modern browsers

**Assessment: NOT a brand violation. No action required.**

---

## Non-Served Files — Known References (Internal Only)

These files contain Apple references but are **never served, bundled, or shown** to candidates or reviewers:

| File | Type | Accessible to candidates? | Accessible to reviewers? |
|------|------|:------------------------:|:------------------------:|
| `.planning/**/*.md` | Internal planning docs | ❌ No | ❌ No |
| `scenarios.csv` | Raw source data (not imported) | ❌ No | ❌ No |
| `CLAUDE.md` | AI assistant context file | ❌ No | ❌ No |
| `apple_email_abuse_annotation_workspace (1).html` | Legacy prototype | ❌ No | ❌ No |
| `src/utils/score.test.js` | Test file (dev only) | ❌ No | ❌ No |

> **Note:** `CLAUDE.md` previously contained "Apple Email Abuse Annotation team" — this was corrected to "Email Abuse Annotation team" on 2026-08-17 as part of this audit.

---

## Conclusion

✅ **The assessment is brand-neutral for all participants.**  
✅ No Apple, iPhone, iOS, Mac, iCloud, or Apple-specific branding appears in any runtime-served file.  
✅ The `-apple-system` CSS font keyword is a technical system directive, not a brand disclosure.  
✅ Internal planning artifacts with historical brand references are excluded from the build and inaccessible to any participant.

No further remediation required.
