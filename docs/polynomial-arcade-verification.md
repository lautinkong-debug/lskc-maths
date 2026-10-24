# Polynomial Arcade verification — 24/10/2026

## Release scope
Original colourful island crews and four coloured solo Quest guardians; four-choice answers; shared energy and Power Pull, Anchor Shield and Team Surge; start with at least one pupil and safely queue late partners. No new dependencies, third-party artwork, Firebase billing or rules changes. NumSprite research remained public-code only.

## Difficulty and answer-time force
Base power is 1/2/3/4 at levels 1/2/3/4. First-try correct completion by every active partner earns +2 within 20/30/40/50 seconds, +1 within 40/60/80/100 seconds, otherwise +0. A wrong attempt removes that round's time bonus, while a correct retry still earns difficulty power. No timeout removes the question. Power Pull adds 2; Team Surge doubles difficulty plus time; the opponent's Anchor Shield blocks up to 2. The UI shows the arithmetic and current team timer.

The server clock starts at teacher Start, an empty side's first live arrival, or when all active partners advance. Teacher pauses are subtracted. Refresh, retries and skills cannot reset time; supplied client timing is ignored. Reads do not write timer state. New matches have a 48-unit goal so fast solo players reach level 4. Legacy matches retain their 24-unit goal and untimed rules; missing historical force fields are reconstructed accurately.

## Final local verification
Verified source 4294e3688349008404ef9808a7562fc1338c1337, including incoming main 11599eb. An 809-file SHA256-checked snapshot under the primary workspace was used because the managed worktree dependency junction is outside Turbopack's root. No unrelated statistical-chart CSS was edited.

- Full unit suite: 1372 tests across 50 files passed.
- Local demo Firebase integration: 5 tests passed, including 32 seats, concurrency, skills, solo/late joins, pause exclusion and observational reads.
- Classroom browser suite: 5 flows passed. Test roomFB63NJ used 32 independent browser contexts, 8 groups, 12 rounds (3 per level), 384 correct submissions, 8 wrong/retry flows, refresh and every skill. Each team's force was independently recomputed from reported elapsed time and checked against rope position. All students reached all four levels; teacher-end result screens matched the final positions.
- Remaining classroom flows covered a played-through terminal victory, teacher pause/resume,32 authenticated identities and protected controls, partial attendance, and stale terminal-response polling.
- Solo Quest: 13 browser regressions passed on the same build, including 360/390px phones, landscape and 1920px projection.
- TypeScript, scoped ESLint, git diff checks and default production Turbopack build passed.
- Rendered QA: timed-force and skill controls readable on 360/390px phones; all eight teacher group cards fit 1920x1080. Evidence in out/polynomial-arcade-32, out/polynomial-tug-preview and out/polynomial-quest-preview.

Independent review fixed accepted-terminal polling before the timing addition. A fresh timing review reproduced and fixed legacy clock activation and incorrect historical force arithmetic; both regressions failed first and now pass. The old shield-feedback minor is resolved by displaying breakdowns only for completed pulls and clearing blocked power on Next. Final win screens retain the winner rather than the preceding question's detailed arithmetic.

## Live Firebase limitation
The earlier authorised live room P9BQVN joined 32 unique students and completed 11 rounds/352 correct answers; all eight groups reachedlevel 4, but round 12 failed with HTTP 429 RESOURCE_EXHAUSTED / Quota exceeded. This was not an all-level live pass. User room QXZKVC was untouched. A fresh public document read on 24/10/2026 still returned 429, so the final full production matrix remains pending quota availability.

Read load is reduced by returning only a seated pupil's own match, short shared read caching, no cached missing membership, exponential retry delay and 60-second quota backoff. Closed/finished student sessions stop polling after accepting terminal state. Write transactions remain fresh.

Publication identity and live route smoke checks are recorded after deployment; local emulators do not certify production quota availability.
