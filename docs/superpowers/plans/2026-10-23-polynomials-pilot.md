# Polynomials Q34(b) Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this approved local pilot task-by-task.

**Goal:** Show the checked Q34(b) demonstration locally with teacher-controlled reveals and readable phone/projector layouts.

**Architecture:** A typed expression/step model drives a dedicated teaching board and persistent worked-solution list. One client app plugs into the existing registry and shared lesson/presentation components. No dependency or backend additions.

**Tech Stack:** Existing Next.js 16, React, TypeScript, CSS modules, KaTeX, Vitest and Playwright.

**Spec:** `docs/superpowers/specs/2026-10-23-polynomials-level2-design.md` (pilot only).

## Global Constraints

- Owner approved building Q34(b) and showing its local preview on 23/10/2026; proceed through implementation without a further approval gate.
- Demonstrations only. One source question, no invented bank entries or answer form.
- English UI copy in `src/lib/copy.ts`; pure client app; existing demo emulators only.
- School tokens: paper #FBFCF8, navy #0F4574, graphite #262A2E, grid #D6E2EC, crimson #DA2127, highlight #F1D54A. Spectral headings, IBM Plex Sans UI, KaTeX maths.
- Layout: a prominent live algebra board beside the growing solution, controls above both; stack on phones. Highlight colour means active operation, not correctness.
- Preserve concurrent Congruence/Surface Area changes. Work in the existing non-main project branch, with narrow patches to shared registry/copy/PLAN. No commits or deployment in this local-preview task.

## Review Focus

- No final-answer text in the initial DOM/accessibility tree.
- Rapid Play/Pause/Previous/Replay and speed changes must not leave stale timers.
- Each intermediate displayed equality remains valid, including during product reveals.
- Phone scrolling and projection must retain reachable controls and legible maths.
- Direct links, reload, sidebar folding and projection must preserve the intended selected question/state.

### Task 1: Checked mathematical timeline

**Files:** Create `src/apps/polynomials/model.ts`, `tests/unit/polynomials.test.ts`.

**Interfaces:** `Expression` typed algebra tree; `toTex(expression): string`; `equations` with AST per completed line; `frames` with equation index, board mode, active product and revealed-product count; `question` source metadata; `products` factor pairs.

- [x] Write tests independently evaluating AST polynomial coefficients and comparing every equation with the printed answer `[-16,-24,-7]` (constant first); validate each partial product, sign transition and KaTeX render.
- [x] Run `npm.cmd test -- tests/unit/polynomials.test.ts`; observe the missing-model failure.
- [x] Implement the fixed, deterministic Q34(b) model. No arbitrary-expression parser.
- [x] Run the focused tests and confirm every displayed equality is equivalent.

### Task 2: Demonstration interface and integration

**Files:** Create `src/apps/polynomials/{index.tsx,TeachingBoard.tsx,polynomials.module.css,Thumbnail.tsx}`; narrowly edit `src/apps/registry.ts` and `src/lib/copy.ts`; add selected source crop under `public/polynomials/`.

**Consumes:** Task 1's immutable frame/equation/product data.

**Produces:** Default client component at `/apps/polynomials#textbook:e=10D-34b`.

- [x] Add browser scenarios for hidden answers, ordered pair/result reveals, minus-sign focus, complete working and replay before building the UI; confirm the absent route/board failure.
- [x] Implement the board, signed distribution arrows/grid, current operation, persistent solution and playback controls (Normal 1400 ms; Slow 2600 ms). Pause by default; manual navigation cancels playback; Replay resets and pauses; finish disables Play/Next.
- [x] Add source disclosure and one-question navigation, integration/thumbnail and deep-link normalisation. Reuse the existing shared shell without changing it.
- [x] Verify keyboard/touch, timer cancellation, reload and projection/sidebar state; capture phone/desktop screenshots.

### Task 3: Local verification and handover

**Files:** Create `playwright.polynomials.config.ts`, `tests/e2e/polynomials.spec.ts`; update this plan, spec approval status and polynomial section of `PLAN.md` only.

- [x] Run focused unit/browser checks, scoped ESLint, TypeScript, production build and `git diff --check`. Use separate local ports/build directory if other work is running.
- [x] Inspect screenshots at 360/390px phone, 844×390 landscape, 1366px desktop and 1920×1080 projection. Correct any visual defects and rerun affected checks.
- [x] Obtain the executing-plans final independent review; address material findings with targeted checks.
- [x] Leave a local preview running, open it in Codex and report the link and controls. Stop at the pilot review boundary.

## Execution record

Pre-flight: Tasks 1 and 2 share `frames`, `equations`, `products` and `toTex`; tests consume exactly those exports. Task 3 exercises the integrated route. No interface conflicts.

Ruling: keep the existing non-main workspace and use narrow patches, rather than creating a checkout that omits the user's current approved UI refinements. No shared component changes or broad formatting.

Ruling: the existing TypeScript Playwright project is the native browser harness; use its installed browser and configs rather than introducing a separate Python harness.

Completion: all 1,059 unit tests (37 files), 11 production-build browser scenarios, scoped ESLint, TypeScript, production build and whitespace checks pass. Independently checked the maths and inspected desktop/phone/projection screenshots. Final review found no material implementation defects. Its timer-test observation was addressed with a paused virtual clock and a speed change during playback; the complete browser suite then passed.

Preview: http://localhost:3002/apps/polynomials#textbook:e=10D-34b. The Codex browser-opening request was queued. Leave the local server running for owner review. No commit, push or deployment was performed for this pilot. Full-bank expansion awaits pilot review.
