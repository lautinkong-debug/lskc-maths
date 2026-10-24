# Polynomial Quest Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task by task. The owner approved the design and delegated remaining choices; proceed through local verification and preview without another approval gate.

**Goal:** Deliver the four-stage local Polynomial Quest game beside the existing textbook lessons.

**Architecture:** Pure deterministic questions and battle transitions, a small versioned browser progress adapter, and a React game view inside the existing polynomial host. Exact coefficient answers; fresh recovery questions after revealed solutions. No service integration.

**Tech Stack:** Existing TypeScript, React 19, Next 16, KaTeX, CSS modules, Vitest and Playwright.

**Spec:** `docs/superpowers/specs/2026-10-23-polynomial-quest-design.md`.

## Owner amendment: multiple-choice play

The owner requested choices because pupils find typing difficult. This amendment supersedes the original typed-input interface below; other rules remain unchanged.

- [x] Add a stable four-option generator, preserving modelled misconceptions and rejecting mathematical duplicates. Independently test 2,400 option sets, cancellation, exactly one correct answer and varied correct letters.
- [x] Replace inputs with large A–D answer buttons, one-tap submission, selected/correct labels, keyboard support and responsive layouts. Keep the existing state and saved records.
- [x] Adapt browser checks and verify all four stages, recovery, scoring, resume, storage and phone/projector views. All 1,339 unit tests and 13 production browser scenarios pass; build, TypeScript, scoped lint and formatting pass. Reopen the updated local preview on port 3028.

## Global constraints

- Four stages, six rounds, integer coefficients, degree at most two, no timing/lives.
- English UI copy in `src/lib/copy.ts`; original geometric artwork, school navy/crimson, graph-paper setting.
- Preserve the current textbook bank, links and unfinished work; retain all changes locally, uncommitted.
- No dependencies, Firebase changes, deployment or publication.
- User delegated execution choices. Work inline in the current checkout because the integrated polynomial app is uncommitted here; use isolated build output and scoped edits rather than losing that work in a new checkout. Keep the execution record in ignored `out/polynomial-quest-preview/progress.md`.

## Review focus

1. Rapid repeated Check/Continue clicks must not award damage twice or skip questions (task 2).
2. A revealed answer must not count as a new independent success; retries must differ (tasks 1–2).
3. Storage can throw, be corrupted, or change in another tab without breaking the game (task 2).
4. Learn/Play navigation and browser Back must preserve the game and stop hidden lesson playback (task 3).
5. Phone number keyboards may omit minus; provide accessible sign controls and no page overflow (task 3).

## Task 1: Verified question engine

**Files:** `quest/algebra.ts`, `quest/questions.ts`; tests `tests/unit/polynomial-quest-questions.test.ts`.

**Interfaces:** `Coefficients = [number, number, number]` in x²,x,1 order; `generateQuestion(stage: Stage, round: number, seed: number, previousSource?: string): Question`; `Question` has id, source, answer, steps, template, hint and optional distribution grid/misconception answers. `parseAnswer(values: string[]): Coefficients | null`, `polynomialSource(value): string`.

- [x] Write tests for reproducibility, distinct recovery, every stage/round template, exact equivalence of all working lines across at least 2,400 generated questions, coefficient bounds and cancellation; valid/malformed answers and canonical zero/unit/negative forms.
- [x] Run focused Vitest and observe missing-engine failure.
- [x] Implement question generation and helpers using bounded integer arithmetic; central explanation identifiers map to copy in task 3. Correctness tests use the existing independent exact symbolic evaluator.
- [x] Run focused tests; expect all pass.

## Task 2: Battle state and progress

**Files:** `quest/session.ts`, `quest/progress.ts`; tests `tests/unit/polynomial-quest-session.test.ts`.

**Interfaces:** `newSession(stage, seed, id): Session`; `transition(session, action): Session`; actions include hint, submit with question ID and coefficient answer, next with question ID, retry with question ID. Session records phase, round, question, supported flag, unaided count, combo and cleared shields. `starsFor(unaided)` gives 1/2/3 at 0/4/6. Progress adapter reads/merges validated version-1 records and reports storage failure.

- [x] Write tests: six successes complete, all supported yields one star, four originals yields two, perfect yields three; wrong answers and hints reset combo; invalid inputs never reach reducer; stale/duplicate actions are ignored; retries differ and cannot inflate original counts; storage parsing, maxima merge, repeated results and throwing storage.
- [x] Run tests, then implement pure transitions and storage functions; expect all tests pass.

## Task 3: Game experience and integration

**Files:** `quest/Quest.tsx`, `quest/Battle.tsx`, `quest/Guardian.tsx`, `quest/Working.tsx`, `quest/quest.module.css`; modify `polynomials/index.tsx`, `src/lib/copy.ts`; add `tests/e2e/polynomial-quest.spec.ts`, `playwright.polynomial-quest.config.ts`.

**Interfaces:** `Quest({active: boolean})`; consumes question, session and storage contracts. Keep Quest mounted while hidden; mount lesson views only when Learn is active to cancel their playback. Save/merge completed records and subscribe to storage changes. Navigation uses `#play` or the current textbook hash.

**Design tokens:** navy #0F4574, crimson #DA2127, paper #FAF9F6, ink #253443, pale grid #DCE5EC. Spectral headings and IBM Plex Sans controls. A connected four-stop trail and prominent guardian shield give the game its identity; maths occupies the main arena. Left-aligned copy, centred problem, calm supporting panels. Avoid a generic dashboard tile grid.

- [x] Write browser tests for map, typed answers, complete/recovery flows, reload/boss unlock, hints, reset/corrupt/blocked storage, default textbook routes, Learn/Play/back, and keyboard/touch/responsive/reduced-motion flows. Run the first smoke against the existing preview to prove Play is absent.
- [x] Implement original SVG guardian, map and arena, three signed coefficient inputs, live preview, accessible correction/distribution view, stars, resume/restart/reset and storage messages. Add all wording centrally.
- [x] Add narrowly scoped Learn/Play host integration without changing textbook data. Copy summary mentions both teaching and Quest.
- [x] Run focused browser tests against a fresh isolated local build; inspect desktop/phone/projector screenshots. Expect all pass with no page overflow.

## Task 4: Verification and handover

- [x] Run focused and full unit suite, TypeScript, scoped ESLint/Prettier and production build. Preserve logs/screenshots in ignored `out/polynomial-quest-preview/`.
- [x] Obtain one fresh whole-change review as required by executing-plans, address important findings with regression checks.
- [x] Record evidence in PLAN and the execution ledger. Mark design implemented, leave source uncommitted.
- [x] Start the tested local production preview and open `/apps/polynomials#play` for the owner. Provide a short test path and verified limits.
