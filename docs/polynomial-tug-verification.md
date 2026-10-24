# Polynomial Tug local pilot

The owner confirmed one device per student and delegated implementation judgement. Publication to the existing Vercel project was authorised on 24/10/2026.

## Release verification — 24/10/2026

The final integration checks below supersede the earlier environment failures recorded later in this document.

- **1,344 unit tests across 46 files pass** on the isolated release worktree.
- Fresh isolated Next.js production build passes; TypeScript and scoped ESLint pass on the tested source.
- **Two backend emulator tests pass**, covering 32 seats, simultaneous partner submissions, exactly-once pulls, rejoin/capacity, ownership, expiry and private state.
- **Two classroom browser scenarios pass** against the local production server: a teacher plus four isolated student browser contexts complete retries, all four power levels, refresh, pause/resume and victory; 32 authenticated student identities fill eight groups and submit concurrently through the real API. Unauthorised writes and stale/foreign submissions are rejected.
- **13 solo Quest browser scenarios pass.** Student screens at 360px and 390px have four answer buttons and no horizontal overflow.
- A further **eight-group projector scenario passes** after the final desktop spacing adjustment. All eight group cards fit within a 1920 by 1080 viewport; the screenshot was visually checked.
- Independent review findings about predictable answer order and inconsistent room-code alphabets were fixed before these final integration checks.

Evidence is saved locally under `out/polynomial-tug-preview/`: `release-unit.log`, `classroom-final.log`, `solo-final.log` and `projector-final.log`, alongside emulator logs and screenshots. Tests use the fake Firebase project `demo-lskc-maths` without clearing existing emulator data. This verifies independent simulated clients; a lesson with 32 physical devices has not been run.

Release is being prepared from the latest published `origin/main` in a separate managed worktree, preserving other teaching-app releases. A CLI upload was blocked by Vercel's author-attribution check and is **not** a published deployment. Publication uses the existing GitHub integration; production READY status and live interactions must be verified separately.

## Classroom flow

- Teacher creates one room with eight groups for 32 students; one to eight groups are supported for smaller trials.
- Each student opens the room code/QR link and selects their assigned group and pair. Each group has two seats in Pair A and two in Pair B.
- Start requires all configured seats. Each student receives four answer buttons and a separate question from their partner.
- Both partners must be correct before the pair earns one pull. A wrong answer shows working and requires a fresh question; the partner's correct answer is preserved.
- After both partners acknowledge the pull, the next questions appear. Every three successful pulls increases the level, capped at four: collecting like terms, subtracting brackets, expanding, mixed polynomials. Pull powers are 1, 2, 3 and 4 rope units.
- The flag wins at either end (24 units from centre). A teacher can pause, resume or end all matches. An early end uses current rope position; zero is a draw. A finished group does not stop the other groups.
- Refresh in the same browser restores the seat. No student names are collected. Rooms expire after four hours. Closing a tab does not release a reserved seat; teachers should create a new room if devices are changed before a match.

## Earlier local development record — 23/10/2026

The following was recorded before the successful 24/10/2026 verification above:

- Full unit suite: **1,344 tests across 46 files**, using `vitest run --pool=threads --maxWorkers=1`. Five new Tug checks cover cooperative scoring, duplicate/stale submissions, retry isolation, both-partner advancement, every power level, terminal victory and the public-ID answer-order regression.
- TypeScript and scoped ESLint pass. The local launcher passes Node syntax checking and ESLint.
- Fresh independent review found inconsistent code alphabets and publicly predictable answer positions. Both were reproduced and fixed. Codes now use the existing shared alphabet; answers use a private 256-bit match secret with separate HMAC seeds.

Integration verification was pending at that earlier checkpoint:

- Earlier development-stage emulator tests filled 32 seats and exercised concurrent scoring and ownership checks. The final rerun could not reach the stopped emulators; these earlier results do not certify the final source.
- The expanded Playwright suite covers a teacher and four isolated student browser contexts through all four levels, wrong-answer recovery, refresh, pause/resume, victory, 360/390px screens, and a separate 32-token/eight-group HTTP and projector flow. It has not completed on the final source.
- The native local-run permission service repeatedly timed out, including after explicit user approval and on a read-only Node version probe. Restricted execution rejects localhost connections with `EACCES`; Firebase's hub and Turbopack's worker sockets cannot run there.
- The restricted webpack fallback was tried and failed on a pre-existing global selector in `src/apps/statistical-charts/lab.module.css:1712`. That unrelated source was left unchanged. A successful final production build has not yet been confirmed.
- No final classroom screenshots or real 32-device classroom session have been verified. Existing solo Quest's previous verification is in `docs/polynomial-quest-verification.md` and is distinct from this new mode.

Evidence and logs are in ignored `out/polynomial-tug-preview/`. `privacy-red.log` records the reproduced public-ID attack before its fix; `all-unit.log` records the full passing unit run. `backend-final.log` and `browser-dev.log` record the environment failures, not successful integration tests.

## Finish local verification

From a normal PowerShell terminal in the repository:

```powershell
node scripts/preview-polynomial-tug.mjs
```

The launcher checks the isolated snapshot is emulator-only, starts or reuses local auth/Firestore emulators without clearing data, copies only this feature's changes, builds the snapshot with the project's default Next builder, and starts port **3030**. It runs the 32-seat emulator tests, the expanded classroom browser tests and the existing solo game regression. It writes each log and `out/polynomial-tug-preview/local-run.json`. It prints **Preview ready** only after all checks pass. Services it starts remain running for inspection, even if a check fails; it never kills existing processes.

Preview after the launcher succeeds: `http://localhost:3030/polynomial-tug`. Use **Teacher sign-in**, then the emulator-only **Teacher** button. This fixture is added only to the fake demo project. Other isolated browsers can join as pupils.

The localhost QR code is for same-computer testing. Actual student devices use the hosted release once verified. Production Firestore TTL cleanup has not been configured; the API already rejects expired rooms.
