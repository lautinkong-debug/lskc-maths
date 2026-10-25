# Polynomial demonstration bug audit — 25/10/2026

The owner requested two agents: one to find bugs and one to debug them. The reviewer examined the published textbook demonstrations and independently rechecked the debugger's local fixes. Work used the isolated `codex/polynomials-bug-audit` branch based on `fb6fcb7`.

## Confirmed defects fixed

1. **Displayed question labels failed in search.** Typing `Q34(b)` returned no results, although `34b` returned the three matching entries. The search index now includes the same formatted label shown on the question buttons. Displayed labels, compact references, case/whitespace variants, exercise filtering and exact IDs are covered.
2. **Skip to content discarded the current lesson.** The shared skip link replaced the URL fragment with `#site-content`, resetting a non-default polynomial lesson to the pilot. It now focuses and scrolls to the existing focusable content target while preserving the URL, lesson, working and playback timer. Its ordinary anchor target remains the fallback.

Product changes are limited to `src/apps/polynomials/index.tsx` and `src/components/SiteHeader.tsx`. Browser regressions are in `tests/e2e/polynomials-bank.spec.ts`. The 158 question entries, mathematical working, diagrams, Quest and Tug code are unchanged.

## Verification

- Both new regressions failed before their fixes and passed afterwards; the reviewer separately verified the fixes.
- All 169 polynomial mathematics and lesson-sequence unit checks passed. Their source and fixtures were unchanged by the fixes.
- The final production build passed compilation, TypeScript and static-page generation. Temporary local worktree settings were restored byte-for-byte afterwards.
- The production-build browser run passed both regressions and the complete 158-entry walkthrough: every question started at its intended initial state, reached its full worked solution without KaTeX errors, and displayed its source image.
- The other 22 checks in the full development-server suite passed, covering playback, timer cancellation, replay, keyboard/touch controls, deep links, question navigation, source display, projection, reduced motion and representative phone layouts. This count includes the two new regressions; the exhaustive sweep was the remaining test.
- Production-build smoke checks confirmed the shared skip link preserves the URL and focuses content on `/apps`, Polynomial Quest and Directed Numbers. Returning from Quest retained the chosen textbook lesson.
- The independent reviewer checked seven 360px phone states, three projector states, browser history, timer resets and actual horizontal scrolling to both ends of long equations.
- Changed-file ESLint and `git diff --check` passed.

The first development-server sweep timed out waiting five seconds for the 10C-31b source image. Nine targeted cases subsequently loaded and decoded correctly (HTTP 200, 1470 by 138). An additional fully traced sweep became unusually slow and was deliberately stopped after 80 completed entries. No production or timeout change was made for this unconfirmed loading issue. The unchanged exhaustive test then passed all 158 entries on the production build in 2.2 minutes.

## Preview and evidence

Local production-build preview: http://localhost:3043/apps/polynomials#textbook:e=10D-34b

Ignored evidence is under `out/polynomials-bug-audit/`: reviewer `finder/findings.md`, before/after regression logs in `debugger/`, `unit-baseline.log`, `browser-final.log`, `production-browser.log`, `production-smoke.log`, `shared-skip-smoke.json`, `lint-final.log`, `build-final.log`, and screenshots.

The audit used Chromium and existing mathematical fixtures; it was not a fresh transcription of the source textbook, a Safari/physical-device certification, or a backend/game audit. No confirmed defect remains from this bounded review. The owner approved publication of these reviewed fixes on 25/10/2026. The release is being prepared on top of the current production branch; live deployment verification will be recorded separately.
