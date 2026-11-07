# Circle Lab handover: Claude Code to Codex (4 November 2026)

## iPad and loading update (6 November 2026, afternoon)

These changes are committed on `fix/circle-relay-feedback-and-timer`, one commit after `3889a09`. Publishing was left to the owner. The sections below predate them.

**After publishing, check these on the live site.** Vercel's caching was tested only on `next start` with a simulator. `/apps/circle-properties` and `/apps/circle-properties/classroom` must both return 200, and a second request to each should show `X-Vercel-Cache: HIT` or `STALE`. The class link is now built ahead, so `out/circle-properties/Circle-Lab.html` must exist when `next build` runs: `npm run build` makes it first, but a bare `next build` does not.

**Corrections:** `3889a09` is already on `origin/main` and live, so the live site is no longer `d7b4831`. The owner's iPad screenshot came from the single-file build, which has no Tailwind reset and uses Arial, so check that build as well as the website.

**Owner decisions to keep:** the rules below are new, and the owner should confirm the first two.

- Below 1400 px wide, including 1366 px laptops, the property list is a drop-down. The teacher script may need a word changed if it says "the list on the left".
- A teacher's Hide or new title takes about a minute to reach students, and a hidden lesson stays open if Firestore cannot be read. Teachers still see their own changes live.
- A student on an app page must not load Firebase. Do not import `@/lib/firebase`, `@/lib/authClient` or `@/lib/db/*` at the top of anything `AppHost` or the header uses.

**New traps:**

- `src/app/apps/[slug]/page.tsx` must never import `registry.ts`. Add each new app to `src/apps/appRoutes.ts` as well.
- `copy.ts` must contain nothing that runs as it loads, such as a tagged template or a function call. One `String.raw` kept the whole file in every bundle.
- Single-column grids in Circle Lab need `grid-template-columns: minmax(0, 1fr)`, not an implicit column.
- This PC's NordVPN Threat Protection unpacks gzip before Edge's own throttling sees it, so DevTools throttling overstates load times here. Pace the compressed bytes before they reach the browser.
- Running 32 browsers on this PC measures the PC, not iPads. Compare old and new with a few students on a share of the link.
- A teacher already signed in before this update shows as signed out on an app page until they open any other page once (the `lskc-signed-in` hint).
- WebKit copies from earlier work are in `out/ipad-qa-browsers`, `out/ipad15-probe/browsers` and `out/ipad-legacy-probe/browsers`. The owner declined that browser, so they were not used.

**New tests:** `tests/e2e/circle-ipad.spec.ts` runs in `playwright.circle-reason.config.ts`. `tests/e2e/circle-site-load.spec.ts` has its own `playwright.circle-site.config.ts` and needs `npx next build` first.

## Paper circle update (6 November 2026)

The paper circle demonstrations for Lesson 1 (Words, Fold, Mirror proof) are committed on `fix/circle-relay-feedback-and-timer`, on top of `d7b4831`. They are **not pushed and not on the live website**, which still has `d7b4831`. Publish only if the owner asks.

The main working folder has the same files. `src/lib/copy.ts` and `PLAN.md` there received only this change. The previous versions are in `out\backup-before-claude-paper-circle-2026-11-06`.

For Monday's lesson the owner uses the single file `out\circle-release-main\out\circle-properties\Circle-Lab.html` from a USB stick, unless the website is updated first. The lesson plan (`Lesson_Plan_16.1_Chords_Lesson_Observation_v2.docx`, in the owner's Google Drive worksheet folder) follows the seven steps and uses their exact button names, so tell the owner before renaming a button or changing a step.

## Publication update (5 November 2026)

The owner explicitly approved pushing the 12 commits to `lautinkong-debug/lskc-maths` main. Commit `d7b483159fc971c50d267a132b9ad0e456ede684` is now published at `https://lskc-maths.vercel.app/apps/circle-properties`. Vercel deployment `dpl_6XHFSCbDMDmEqvRV8Dmo4p1QdesQ` is Ready and assigned to the production domain.

Codex rechecked 730 Circle Lab tests, full-site lint, the production build with TypeScript, and seven browser scenarios both locally and on production. Live checks also covered all seven topics, projection mode, old saved-tab migration and Reasons Play. Touch checks used desktop Edge touch emulation; real iPad/Safari remains unverified. Release evidence is in `out/circle-release-main/out/circle-publication-tests/`.

The original handover below records the state before publication.

Read `CLAUDE.md`, then this file, then the November sections at the top of `PLAN.md`.

The owner is a maths teacher, not a programmer: explain things in plain English. **The owner teaches this lesson to the principal on Monday 9 November 2026**, so avoid risky changes to Topic 1 before then.

## Where the code is

| Place | State |
| --- | --- |
| `C:\Users\t28ltk\Projects\lskc-maths (Chatgpt)` (main working folder, branch `LSKC-Mathematics-Department-Website`) | Circle Lab files updated in the working tree. As before the handover, `src/apps/circle-properties/` is untracked there and `src/lib/copy.ts` is uncommitted. |
| `...\out\circle-release-main` (separate release clone) | The full history: branch `fix/circle-relay-feedback-and-timer`, on top of `main` at `231fd2c`. Committed, **not pushed**. |
| Branch `fix/circle-relay-feedback-and-timer` in the main repository | The same commits, added so every worktree can see them. No worktree has it checked out. |
| `...\out\backup-before-claude-circle-handover-2026-11-04` | The main folder's Circle Lab files as they were before this handover. |

`src/lib/copy.ts` in the main folder is older than `main` (it lacks some Polynomial Tug strings). Only the Circle Lab changes were applied to it. Do not replace it with the release copy.

Nothing has been pushed or deployed. The live website is unchanged.

## What was done

All in `src/apps/circle-properties/`, with wording in `src/lib/copy.ts`.

- **Reasons Relay:** fixed feedback, retry history and timers. The steps are now condition, target, reason, value. Wording is "∠ONB = x°. Find x." and "AN = x cm. Find x.", with an `x =` answer box.
- **Instructions:** one task line above the circle, Tools in one section, a short "How to use" strip, descriptions on the tabs.
- **Guided lesson (`ChordLesson.tsx`, `chordLessonData.ts`), Topic 1 only:**
  - Steps 1 and 2: the student makes the condition true, the lesson pauses on "What can we deduce?", and the result appears only after "Show what we can deduce".
  - Steps 3 and 4 (`ChordLessonQuestions`): question cards across the full width, with the circle and the Given / You get table above them.
  - Answers are full-sentence reasons, not 16.1 / 16.2.
  - "Write it" solutions match Lesson Worksheet 16.1 version 3 line for line, with key reasons hidden.
- **Paper circle demonstrations (`PaperCircleDemo.tsx`, `PaperCirclePanel.tsx`, `paperCircle.ts`):** Words, Fold and Mirror proof, from worksheet v4 Part A Steps 1 – 3. One press moves one stage. These are lesson steps 0 – 2; 16.1 and 16.2 are now steps 3 and 4, Which one? 5, Write it 6.
- **`ChordSketch.tsx`:** a small diagram per question that marks only the given fact.
- **`ReasonLabel.tsx`, `reasonParts()` in `content.ts`:** reasons split into condition (blue) and result (green).
- **`MathText.tsx`, `mathNotation.ts`:** ½ as a vertical fraction, √(...) as a real root sign.
- **`CircleDiagram.tsx`:** equal-length ticks on AN and NB; `showAngleMarks` hides the angle mark in the lesson.
- **`useTouchDrag.ts`:** finger dragging on touch screens.

## Owner decisions: please keep these

- Condition first, then the deduction. The graph must never show both before the button is pressed.
- A finished step always replays. `seen` and `found` only colour the step buttons. `revealedStep` and `paper` in `index.tsx` are deliberately not saved.
- Demonstrations ask before showing: each tag, blank and measurement waits for a press.
- Full-sentence reasons in question cards. The numbers stay only in step names, headings and the table.
- In Reasons Relay the value comes last.
- x with its unit: x° and x cm, with `x =` as a plain number.
- Fractions vertical, roots drawn properly.
- Single ticks, as the owner drew them. The worksheet uses double ticks, so this may change.

## Traps

- **Touch:** browsers ignore `touch-action` on parts inside an SVG. A drag then becomes a page scroll and fires `pointercancel`. Use `useTouchDrag`, not CSS. Mouse tests will not show this: drive real touch through CDP `Input.dispatchTouchEvent`, as in `tests/e2e/circle-reason-challenge.spec.ts`.
- **Saved progress:** test with a used browser, not only a clean one. This hid a real fault here.
- **`npm run test:rules` on shared emulators** leaves school-mode rules and dummy records behind. Run it on its own emulators.
- **Stopping `npm run dev:all`** by killing the parent leaves `next dev` broken ("Jest worker encountered child process exceptions"). Those failures are not code faults.
- **`src/apps/directed-numbers/lib/generate.test.ts`** has a fixed 20-second limit and can time out under load. It takes about 5 seconds alone.
- **Windows:** file names differing only in case collide, which is why the data file is `chordLessonData.ts` beside `ChordLesson.tsx`.
- **`playwright.circle-reason.config.ts`** reuses a running server, so rebuild first.
- **`MathText`:** "x: AN" is read as a ratio; `/` and `÷` between operands become fractions.
- **Commits:** git has no identity set here. Use `git -c user.name="Tin Kong Lau" -c user.email="t28ltk@lskc.edu.hk" commit`.

## How to check

```
npx tsc --noEmit
npm run lint
npx vitest run --no-file-parallelism
node scripts/build-circle-lab.mjs
npx playwright test --config=playwright.circle-reason.config.ts
```

Last results in `out\circle-release-main` (6 November 2026): 2,662 unit tests, 8 browser tests, typecheck, lint and the production build all pass. The site smoke, layout and challenge tests, 24 rules tests and 11 challenge tests passed before the last few layout changes.

## iPad status

- 198 checks pass at six iPad sizes, portrait and landscape, using Edge with touch input: lesson, pen, reason explorer, all 7 topics, Reasons Relay and Reasons Play.
- **Not yet run on real Safari.** The WebKit test browser is not installed, and no real iPad has been tried.
- **Minimum is iPadOS 16.4.** The builds use regex lookbehind, class static blocks and `@property`. On older versions the page would fail to load. iPad Air 2 and iPad mini 4 stop at iPadOS 15.
- Projection mode's fullscreen and Firebase sign-in were not tested on iPad.
- A Wi-Fi link for a real iPad was not set up: opening a local server to the network needs the owner's permission.

## Waiting for the owner

1. How the classroom computer opens Circle Lab on Monday: publish the website, or `out\circle-properties\Circle-Lab.html` on a USB stick (no Projection mode button; press F11).
2. Whether to delete the title "16.1 or 16.2? Read what is given.", and whether to move the 16.1 / 16.2 buttons next to the circle. The owner's drawing was unclear on both.
3. Single or double ticks.
4. A real iPad test.

## Possible next jobs

- Similarity (`.vertexHandle`), Surface Area (`BankDiagram.tsx`), Congruence and Statistical Charts use `touch-action` the same way. They may have the same finger-drag fault. Test with real touch first.
- The lesson plan and teacher script are a Claude Doc and a Word file. If the lesson changes, tell the owner so they can be updated.

## Local servers left running

Started during testing, and safe to stop: ports 3000 (broken `next dev`), 3100 and 3101 (old `next start` builds), 3217 (Circle Lab), and the Firebase emulators on 4000, 4400, 4500, 8080, 9099 and 9199. `npm run dev:all` will not start until they are stopped; restarting the computer clears them.
