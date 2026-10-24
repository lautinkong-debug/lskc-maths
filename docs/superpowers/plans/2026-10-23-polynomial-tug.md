# Polynomial Tug Implementation Plan

> Execute inline with superpowers:executing-plans. The owner delegated implementation judgement and confirmed 32 independent devices. Keep all work local and preserve this shared checkout.

**Goal:** A tested 32-player classroom room with eight independent two-versus-two polynomial tug matches.
**Architecture:** Pure group game engine, authenticated server transactions over private emulator Firestore documents, polling teacher/student React screens.
**Tech stack:** Installed Next 16, React, Firebase, KaTeX, Vitest, Playwright; no additions.
**Spec:** `docs/superpowers/specs/2026-10-23-polynomial-tug-design.md`.

## Constraints and review focus

- English copy centrally; original artwork; phone and projection fit.
- Preserve solo Quest, textbook bank and concurrent edits. The owner authorised Vercel publication on 24/10/2026; publish through the existing GitHub integration while preserving concurrent edits.
- Test simultaneous answers, stale IDs, full pairs/rooms, foreign membership/ownership, pause/end races and reconnects. Never send an unanswered key to a pupil.
- Local ledger: `out/polynomial-tug-preview/progress.md`. Use the existing isolated preview snapshot after copying only relevant changes. Never stop shared Firebase emulators.

## Tasks

- [x] 1. Write failing unit tests, then implement `src/lib/polynomial-tug/game.ts` and `types.ts`: group state, question generation, cooperative pulls, retries, level/power progression and public views. Run mathematical/state tests.
- [x] 2. Write failing emulator tests, then implement `src/lib/server/polynomialTug.ts` and `src/app/api/polynomial-tug/route.ts`: room creation, capacity-safe join, private membership, teacher control, server marking and sanitised state. Verify 32 identities and concurrent submissions.
- [x] 3. Implement `src/components/polynomial-tug/` and `/polynomial-tug`, copy and entry links. Add teacher/four-context browser flows and phone/projector checks. Verify the live emulator-backed interaction, not only isolated UI.
- [x] 4. Obtain one fresh whole-change review; fix important findings with regressions. Run applicable suites, lint, types and production build. Record limits and open a local teacher/student preview.

24/10/2026 update: final emulator and classroom browser tests now pass, including 32 identities and all four power levels. Fresh isolated production build, scoped lint/types, 13 solo-game scenarios and the final eight-group projector check pass. Publication is proceeding through the existing GitHub integration after a CLI author-attribution block; do not treat the blocked CLI upload as a release.
