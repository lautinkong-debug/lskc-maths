# Circle Lab handover: Claude Code to Codex (4 November 2026)

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
- **`ChordSketch.tsx`:** a small diagram per question that marks only the given fact.
- **`ReasonLabel.tsx`, `reasonParts()` in `content.ts`:** reasons split into condition (blue) and result (green).
- **`MathText.tsx`, `mathNotation.ts`:** ½ as a vertical fraction, √(...) as a real root sign.
- **`CircleDiagram.tsx`:** equal-length ticks on AN and NB; `showAngleMarks` hides the angle mark in the lesson.
- **`useTouchDrag.ts`:** finger dragging on touch screens.

## Owner decisions: please keep these

- Condition first, then the deduction. The graph must never show both before the button is pressed.
- A finished step always replays. `found` only colours the step buttons. `revealedStep` in `index.tsx` is deliberately not saved.
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

Last results in `out\circle-release-main`: 2,657 unit tests, 7 browser tests, typecheck and lint all pass. The site smoke, layout and challenge tests, 24 rules tests and 11 challenge tests passed before the last few layout changes.

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
