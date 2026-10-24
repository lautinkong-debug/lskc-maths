# Polynomials Full Level 2 Bank Implementation Plan

> Execute the approved full-bank expansion continuously. Use independent source-research agents for separate textbook banks, then integrate and review the application here.

**Goal:** All 158 Level 2 parts/table rows in one locally running demonstration app, preserving the approved Q34(b) pacing and classroom design.

**Spec:** `docs/superpowers/specs/2026-10-23-polynomials-level2-design.md` and `docs/polynomials-level2-source-audit.md`.

**Architecture:** Checked question records feed a shared player and specialist distribution/sign/vertical/table/diagram visuals. Preserve the existing Q34(b) implementation. Add exercise/skill/search navigation with deep links and sequential question controls. Source crops remain local assets; no PDF or answer-key pages are served.

## Global constraints

- User approved full-bank expansion after reviewing Q34(b). No further design approval needed. Local preview only; no commit, push, deployment, dependencies or production Firebase changes.
- Preserve all concurrent Similarity and Surface Area edits. Existing non-main workspace contains the approved pilot and must be retained.
- English UI; shared labels/reasons in copy.ts, source-specific question text and authored explanations in question records.
- Original question wording, exact fractions, positive-index final answers, nonzero restrictions, all part dependencies, diagrams, units and requested ordering must survive.
- Answers start hidden; each reveal teaches one operation. Previous, Replay, filters and question changes cancel playback. Preserve phone/projector readability and reduced motion.

## Tasks

- [x] 1. Independently transcribe and solve 10A/10B (51), 10C (32), 10D (32), Revision (43), recording source crops and key comparisons. Research artifacts use the contract in `out/polynomials-full-bank/content-contract.md`; separate agents own separate files. This is source research, not parallel application implementation.
- [x] 2. Add exact rational multivariable validation and lesson compilation tests; observe missing-bank/engine failures, implement, then check all 158 records and every authored expression. Render KaTeX and validate inventory/source metadata.
- [x] 3. Integrate navigation and shared player; retain Q34(b), implement distribution pairs, sign reveals, vertical columns, table facts and diagram highlights. Add browser tests first for bank selection, dependencies, filters, invalid links and answer hiding.
- [x] 4. Generate source crops, verify all questions through the browser, test navigation/timers, touch, phone/landscape/projection and inspect screenshots. Run lint/typecheck/build/whitespace checks.
- [x] 5. Fresh independent content/application review, targeted fixes and final local-preview handover.

## Execution ledger

Ruling: retain the current non-main workspace and make narrow shared-file edits; a separate checkout would omit the approved uncommitted pilot. No git commits in this local-preview task.

Ruling: use parallel source-research agents with disjoint output artifacts; application implementation remains coordinated here. This avoids conflicting shared-file edits and keeps mathematical checks independent.

Pre-flight: Task 1 produces the documented JSON schema; Tasks 2 and 3 consume it unchanged. Task 4 source crops use Task 1 page-relative rectangles. Task 5 reviews all records and changes. Each task's checks match its outputs; no conflicting interface found.


Completed: all 158 entries, 169 focused tests, 1,304-test wider snapshot, 21 final browser scenarios and independent follow-up review pass. Final source snapshot production build/TypeScript and scoped ESLint pass. See docs/polynomials-full-bank.md for the port 3007 preview, evidence and restart instructions. No commit or publication.
