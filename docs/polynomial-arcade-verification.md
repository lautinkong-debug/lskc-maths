# Polynomial Arcade verification — 24/10/2026

## Scope
Original colourful island crews and four coloured solo Quest guardians; shared energy and three activatable skills; start with at least one pupil; late joins during live/paused play; retain server-side marking and ownership. No new dependencies or Firebase billing/rules changes.

## Production baseline limitation
The authorised live test used a separate room P9BQVN and 32 isolated browser contexts. All 32 joined unique seats; refresh/rejoin and eight deliberate mistakes/retries passed. Eight groups completed 11 full rounds (352 correct answers) and reached level 4. The last round failed when production Firestore returned HTTP 429 RESOURCE_EXHAUSTED / Quota exceeded. This is not an all-level live pass. The user's existing room QXZKVC was not modified. The test room was left to expire because quota prevented closing it.

Original polling read all eight matches for every pupil every two seconds. The upgrade scopes seated pupils to their own match, caches short shared reads, caches only existing memberships, backs off after failures (60 seconds on quota), and stops polling closed or finished student matches. Transactions always read fresh state. A missing-membership cache regression was reproduced before being fixed; UI revision checks also prevent a stale lobby response from undoing a successful join.

## Local evidence
- Initial new rules: 17 focused unit tests passed; full suite 1,361 tests across 49 files passed before the additional cache regression.
- Demo emulator: four integration tests passed, including 32 seats, protected controls, solo start/late join and duplicate concurrent skills/shield consumption.
- Production Turbopack snapshot built successfully. The worktree dependency junction is outside Turbopack's root, so build snapshots live under the primary workspace. A webpack fallback failed on existing unrelated statistical-chart print CSS and was abandoned without editing that app.
- 32 independent browser contexts completed 12 rounds, three per level, 384 correct submissions and eight deliberate mistakes/retries. Both teams activated Power Pull, Anchor Shield and Team Surge; power was 4, 1 after shielding, and 8 respectively. All eight groups balanced and the teacher ended the room. Evidence: out/polynomial-arcade-32/report.json and screenshots.
- Solo Quest: all 13 browser regressions passed, including 360/390px phones, landscape and 1920px projection. Original artwork and legible answer buttons visually inspected.
- TypeScript and scoped ESLint passed before the final cache regression.

Final whole-branch review, merged-source checks, publication and updated live verification are recorded below when completed. A local emulator pass does not certify live Firebase quota availability.
