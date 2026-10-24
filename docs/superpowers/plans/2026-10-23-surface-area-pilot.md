# Surface Area Studio Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally reviewable, mathematically accurate Example 9.11 unfolding lesson with image export.

**Architecture:** Pure geometry supplies rigid lateral faces to an SVG diagram. A client lesson controls staged reveals and exports the same SVG state. Register it in the existing app library.

**Tech Stack:** Existing Next.js 16, React 19, TypeScript, CSS modules, SVG, KaTeX, Vitest and Playwright; no dependencies.

**Spec:** `docs/superpowers/specs/2026-10-23-surface-area-studio-design.md`.

## Global constraints

- User approved proceeding with judgement and no further design questions on 23/10/2026; implement the local pilot, then classroom review before full bank rollout.
- English UI in `src/lib/copy.ts`; F1 / 1A09; route `/apps/surface-area`; preserve unrelated Congruence edits.
- No production writes/deployment; use demo emulators; no new dependencies.
- Diagram proportions preserve source lengths; camera zoom never changes mathematics; downloaded images must reopen correctly.

## Review focus

- Hidden answers must not appear in current-stage or comparison exports (Task 3 browser checks).
- Intermediate unfolding must preserve all four side lengths and H (Task 1 model checks).
- Repeated stage changes and Reset must keep folds/reveals consistent (Task 2 browser checks).
- Large zoom must remain recoverable with Fit, and exports must include all labels (Task 3 screenshot/download checks).
- 360px phones, keyboard and reduced-motion must retain operable controls (Task 3 browser checks).

## Task 1: Rigid geometry and teaching model

Files: `src/apps/surface-area/model.ts`, `tests/unit/surface-area.test.ts`.

Interfaces: `Point`, `PILOT`, `unfoldChain(progress: number): Point[]`, `surfaceMetrics(): {perimeter,height,baseArea,lateralArea,totalArea}`, `workingLines(stage: number): string[]`.

- [x] Write and run failing tests for P=22, H=13, B=26, lateral=286, total=338; edge lengths 5/4/8/5 at multiple fold values; closed/open endpoints; hidden working before reveal.
- [x] Implement source coordinates and angle-based hinge opening. Clamp fold progress; return fresh coordinates. Mathematical dimensions stay independent of projection.
- [x] Run `npm.cmd test -- tests/unit/surface-area.test.ts`; all five pass.

## Task 2: Integrated lesson and visual controls

Files: `src/apps/surface-area/{index.tsx,Diagram.tsx,surface-area.module.css,Thumbnail.tsx}`, `src/apps/registry.ts`, `src/lib/copy.ts`, `tests/e2e/surface-area.spec.ts`.

Interfaces: `Diagram` accepts `stage`, `unfold`, `selectedFace`, `showDimensions`, `showFaces`, `showWorking`, `comparison`, `onSelectFace`; renders one self-contained SVG. Lesson state manages steps 0–4, fold percentage and UI visibility.

- [x] Write and run a failing route/next/reset browser check before app registration.
- [x] Add central copy, registry and thumbnail. Render a persistent small original solid beside the main unfolding diagram, two separate base insets at the final step and a compact calculation rail. On phones stack panels.
- [x] Add step controls, boundary/face selection, fold slider, dimensions/face/working toggles, zoom/Fit and clean view. Stage defaults: folded at identify/trace, initially folded on cut, flat on rectangle/bases. Hide all computed working until requested; changing stage hides its answer again.
- [x] Verify true hinge geometry, text contrast, visible focus and no clipped dimensions.

## Task 3: Exports and local verification

Files: `src/apps/surface-area/export.ts`, `playwright.surface-area.config.ts`, existing test file and documentation.

Interfaces: `downloadDiagram(svg: SVGSVGElement, format: 'svg' | 'png', filename: string): Promise<void>`; clone SVG, inline resolved colour/font presentation, fixed 2400px PNG output, download with object URL and delayed cleanup.

- [x] Add PNG/SVG export of current or before/after comparison state; no hidden working and no controls in output. Show busy/error/download-request feedback.
- [x] Run real browser downloads, inspect SVG content and reopen PNG/SVG; check 1366px and 1920px desktop plus 360/390px phone, touch, keyboard, reduced motion and Presentation mode.
- [x] Run scoped ESLint, TypeScript, production build, focused model/browser tests and whitespace checks. Inspect rendered screenshots.
- [x] Obtain a fresh read-only review of changed files, fix material findings, record evidence in PLAN.md and hand over the local pilot with an exported image. Keep changes uncommitted for owner review; do not stage unrelated files.

## Execution ledger

- Pre-flight: Tasks 2 and 3 consume Task 1 geometry and Diagram state; interfaces agree. Export uses the rendered SVG so reveal state is shared.
- Ruling: execute in the existing `LSKC-Mathematics-Department-Website` feature branch. All app files are new; shared edits are additive and unrelated work is preserved. No commit/push is part of local review.
- Ruling: preserve the stage as the source of truth; no autoplay is needed. A manually controlled hinge slider supports reduced motion without unsolicited animation.
- Task 1 complete: focused five-test geometry suite passed after the missing-model failure. Independent source values are P=22, H=13, B=26, lateral=286, total=338.
- Task 2 complete: missing-route browser check failed before registration; lesson controls, reset and hidden working subsequently pass. A fresh reviewer identified the absent persistent original reference as Important. The new correspondence regression failed on the missing reference, then passed after adding `OriginalPrism` with the shared selected face.
- Task 3 export evidence: actual downloaded files are saved under `out/surface-area-preview/`; both formats reopen in Chrome. PNG width is 2400 pixels. Hidden-working exports have no working group or computed area text. Explicitly check the text with units, because SVG coordinate 338.4615 is not an answer reveal.
- Ruling: use the normal Windows temporary directory for Playwright artifacts. Direct browser downloads there complete with real, nonempty files; repository-local download artifacts caused EPERM/canceled/empty-stream failures. The application export needs no workaround. Cost: test failure artifacts live outside the repo; named teaching images and screenshots remain in `out/surface-area-preview/`.
- Final review: fresh read-only reviewer found no Critical issues, one Important correspondence gap (fixed above), and a Minor status wording issue. Status now says “Download requested. Check your downloads.” rather than asserting the browser saved it. No deferred minor findings.
- Final review limits: actual disk persistence and desktop projection are verified by the implementer's browser checks; keyboard and touch checks supplement, but do not constitute a full screen-reader audit. Geometry is checked across fold values; visual QA samples intermediate folds rather than claiming exhaustive pose coverage.
- Final verification: all 1,065 unit tests pass; all eight browser scenarios pass. After the last spacing/projection refinements, the three affected export/desktop cases and three affected projection/touch cases pass again. Final scoped ESLint, TypeScript, production build and `git diff --check` pass. Visual inspection confirms comparison labels are separated and the original prism, revealed working and navigation fit the projector view.
- Task 3 complete: local preview `http://localhost:3004/apps/surface-area`; example output `out/surface-area-preview/example-9-11.png`, `example-9-11.svg` and `comparison.png`. Browser exports are actual downloaded files, not reconstructed substitutes. Source PDF and inspection images remain ignored. No dependencies, production data, commit, push or deployment changes.
- Finish: owner already chose a local pilot review, so keep the feature branch and files in place without another integration menu. The full audited question bank remains the subsequent rollout scope.
