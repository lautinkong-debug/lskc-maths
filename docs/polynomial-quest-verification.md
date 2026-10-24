# Polynomial Quest local verification

Verified 23/10/2026. Owner approved the game design and requested a tested local preview. No commit, push or deployment was performed.

## Play

Open `http://localhost:3028/apps/polynomials#play` and choose **Start Term Collector**. Tap one of the four expressions labelled A–D; the answer is checked immediately. No typing is required. Each battle has six rounds. Completing Term Collector, Sign Guardian and Expansion Gate unlocks the mixed Polynomial Guardian.

An incorrect answer labels both the selected and correct options, gives worked feedback and offers a different question of the same kind. Hints and recovery do not inflate the six-original-question unaided score. Completed results save in this browser; refreshing ends an unfinished battle. The textbook lessons remain available from the lesson menu.

## Evidence

- Latest full unit suite: **1,339 passed across 45 files**. The 21 question checks cover 2,400 seeded questions, every working-line equality, distribution products, bounds, cancellation, input utilities and meaningful scalar distribution. Seven further checks cover transitions and saved progress. Five new choice checks independently validate 2,400 sets of four distinct expressions, exactly one correct option, modelled-error inclusion, stable shuffling, varied correct positions and complete cancellation.
- Latest production browser run: **13 game scenarios passed**, including perfect/helped battles, all four stages, boss unlock, saved results, replay/resume/restart/reset, storage failure/corruption/cross-tab updates, one-tap answers, stable option order on resume, selected/correct labels, keyboard activation, no typing fields, navigation and responsive/reduced-motion views. Answer buttons measure at least 68px high on phones.
- Existing textbook regression: **11 scenarios passed**, including Q34(b), playback timers, speed, deep links, keyboard/touch controls, source image, projection and phone layouts.
- TypeScript, scoped ESLint and Prettier, `git diff --check`, and the isolated default Next production build passed.
- Visually inspected the loaded map and correction screens at 390px and 1920px, plus the 360px and landscape checks. Manual browser interaction confirmed that a correct answer removes one shield and exposes Continue.
- Fresh independent review identified accessible-label concatenation, lost draft/submitted values after map/resume, and repeated Play losing the remembered lesson. All were fixed and covered by passing regressions. No review findings were deferred.

Latest multiple-choice evidence lives in ignored `out/polynomial-quest-preview/`: `choices-unit-all.log`, `choices-browser-production.log`, `choices-build.log`, `choices-lint.log`, `choices-typecheck.log`, `choices-*.png`, `map-*.png`, `battle-*.png`, `victory.png`, and `progress.md`. The earlier complete textbook regression is retained in `textbook-regression.log`; this amendment does not alter the textbook host or lesson data.

## Preview restart

The tested snapshot is `out/polynomial-quest-preview/site`; it contains the source and public files, with emulator-only environment settings. It resolves installed dependencies from this repository. It deliberately isolates build output from other tasks sharing the checkout.

From PowerShell in the repository root, run these sequentially when the preview server is not already running:

```powershell
Set-Location 'out/polynomial-quest-preview/site'
node ../../../node_modules/next/dist/bin/next start -p 3028
```

The existing snapshot is already built. Updating source files does not update this snapshot automatically: copy the relevant source changes into it, run `node ../../../node_modules/next/dist/bin/next build`, then restart the server. Do not point its environment at production services.

Local verification covers gameplay and device-only records. Account-based student records and classroom attainment validation are outside this pilot.
