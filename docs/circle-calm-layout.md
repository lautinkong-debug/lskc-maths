# Circle Lab: calm layout for Explore, Reasons Relay and Reasons Play

Design record and handover notes. Work done on 13–14 Nov 2026 on branch
`claude/circle-lab-mastery-path`, on top of the Learn path (`docs/circle-mastery-path.md`).
Nothing here is committed or pushed.

## Why

The owner said the older activities were very cluttered. The Learn path is the model: one
main task on a screen, white cards on the pale blue page, large type, few borders, and colour
only for meaning (blue = given, green = what you get).

Nothing that is taught or marked has changed. Every question, hint, reason wording, score and
saved record is the same. Only the layout, and where a control lives, has changed.

## Explore

| Before | Now |
| --- | --- |
| Five rows of menus above the task: tabs, How to use, Property, Guided lesson / Tasks / Free play, 16.1–16.2 / 16.3 | Two rows: tabs, then one row with the Property menu, the lesson numbers and Guided lesson / Tasks / Free play |
| Seven step buttons wrapped in two or three rows inside the yellow panel | One step bar across the page, as in Learn, under Concrete, Pictorial and Abstract bands |
| A row with Pen and Focus above the task, and "Tools: measurements, snapping and sliders" below the circle | One **Tools** control below the circle |
| Yellow task band, cream panel, borders round every box | The task as one bold sentence on a white card; a white lesson card |
| On wide screens, a column of seven large property buttons | The same Property menu at every size |
| iPad upright: circle and lesson squeezed side by side, about 390 px each | Circle on top at full width, lesson card below (under 860 px wide) |

### Behind Tools (below the circle)

Pen, Focus, Auto-snap, Show / Hide lengths, Show / Hide angles, the live measurements, Try a
new shape, Reset shape, Fine-tune / keyboard controls, and the "What if …?" condition test.

- Tools is closed at the start of every step.
- Choosing Pen or Focus closes Tools. The pen's own tool row, with **Hide pen**, then appears
  above the task. Focus shows **Show mission panel** there.
- On the paper circle steps (Words, Fold, Mirror proof) Tools holds only Pen and Focus.

### Behind More (top right, where Settings was)

How to use (the same three lines, shown in Explore), Appearance, Your game progress, and
New here?. The footer still has "For teachers" with Reset game progress.

### Removed from view

- The yellow How to use banner on a first visit, and its Got it button. The three lines are
  in More. Each board already states its task in one sentence. The saved `welcomeDismissed`
  flag is still read and written, so the banner can come back without a data change.
- The column of property buttons on screens 1400 px and wider, with the nicknames (Chord
  balance, Twin chords …). The nicknames were never shown on an iPad or a laptop.
- The lesson titles on the 16.x buttons. A button now shows the number only ("16.3"). Its
  full name ("16.3 · Locate the centre") is still the button's accessible name and tooltip,
  and the lesson card's heading shows the title.

### Kept by name

The tabs Explore, Reasons Relay and Reasons Play; the seven steps Words, Fold, Mirror proof,
16.1 Right angle, 16.2 Mid-point, Which one?, Write it; and the lesson buttons Fold it, Open
it, Flip it, Start the proof, Next line, Show the reason, Show the answer, Next step. Pen,
Focus, Tasks, Free play, Guided lesson and Reveal the reasons also keep their names.

## Concrete, Pictorial, Abstract in the guided lessons

The bands and tags reuse the Learn path's wording (`circlePathCopy.cpa`) and colours.

| Lesson | Concrete | Pictorial | Abstract |
| --- | --- | --- | --- |
| 16.1–16.2 (seven steps) | Words, Fold: a paper circle is tagged, folded and measured | Mirror proof, 16.1 Right angle, 16.2 Mid-point: the proof and each reason are read from the diagram, blue given then green result | Which one?, Write it: the reason is chosen and written in ∵ / ∴ lines |
| 16.3 to 16.17 (five steps) | Words, Investigate: tap each part, then drag the diagram | Predict: read the new green marks | Which reason?, Write it |

The mapping is `chordStepCpa` in `ChordLesson.tsx` and `stepCpa` in `TheoremLesson.tsx`.
Dragging is Concrete in Investigate, as it is in Learn's Discover. In 16.1 Right angle and
16.2 Mid-point the step exists to read the picture of the reason, after the paper folding, so
those two are Pictorial.

## Reasons Relay

- The banner, the points box and the chain badge are gone from the level screen. Points and
  chain show in one quiet line while a set is being played.
- Eight level cards of four lines each became a plain list (two columns, one on a phone).
  The mixed level no longer repeats all seventeen reason numbers under "All 17 reasons".
- One row to start: the chosen level, Pace, Start level.
- One **More** at the foot holds View question set, New set · same level, the scoring
  paragraph, the note about saved sets and Reset Reasons Relay record. It closes when the
  screen changes between the levels and a question.
- "Restart level with new questions" is removed. It did exactly what New set · same level
  does (both call `start()`).
- In a question: two white cards. The diagram card shows the question, the given (blue), the
  diagram, then the conclusion (green) once it is unlocked; locked, that is one quiet line.
  The four padlocks are small pills. The reasons are a plain list like the other two choices,
  without the "Reason card" label, gradient and shadow.
- The four steps, their order, the wording of every choice and the marking are unchanged.

## Reasons Play

- Title, "Mixed circle reasons" and "Question 1 of 5 · Round 1" are one heading block, with
  Previous and Next beside it. The description line and the blue bar are gone.
- One **More** at the foot holds New set, Review due reasons, Go to question, Recall before
  choices and the review record.
- "Start a mixed round" is removed. It did exactly what New set does (both call
  `startMixed()`).
- After an answer the diagram card gets a blue ring (given) where it used to turn yellow.

## Code

- `LessonSteps.tsx` and `lesson-steps.module.css` (new): the step bar with its CPA bands, and
  `LessonWhere`, the line above a step's work (stage tag, heading, "Step 4 of 7"). Both guided
  lessons use them. On a phone the bands are hidden and each step cell carries its stage
  colour; the steps wrap to two rows.
- `ChordLesson.tsx`: the step bar is now `ChordLessonSteps`, rendered by `index.tsx` above the
  board and the card. The card (`section` "Guided lesson") keeps its heading and content.
- `index.tsx`: the Property menu is passed into `Playground` as `picker` and shares
  `.contextBar` with the lesson numbers and the play style. The rail is gone. Tools is one
  `<details>` with a `key` per step.
- `TheoremLesson.tsx`: the 16.x buttons are sent through a portal into `.lessonSlot` in the
  row above (`selectorSlot`). In mixed practice they stay folded in "Choose a theorem", as
  before, so the lesson's own reason is not given away.
- `circle.module.css` is rewritten: about 930 lines instead of 2,140. Some twenty-five unused
  blocks from earlier versions are gone. `reason-challenge.module.css` and
  `practice.module.css` are rewritten in the same way; the diagram drawing rules in
  `practice.module.css` are untouched.
- The shell sets `margin: 0` on every heading and paragraph with one class and one element.
  In the other stylesheets a rule that gives a heading or paragraph a margin must start with
  the root class (`.game …`) or it loses, depending on file order.
- Wording: `circleCopy.settings` → `more`, `tools` is now "Tools", `compareReasons` is new,
  `gotIt` is removed. `circleReasonGameCopy` gains `more` and loses `kicker`, `reasonCard`
  and `restart`. `circleReviewCopy` gains `more`. `circlePathCopy` is not touched.

## Tests changed, and why

Selectors for controls that moved, and three small new checks (nothing sits above the task
until the pen is out; How to use is not on the page until More is opened; Focus hides the step
bar and the lesson card):

- `circle-reason-challenge.spec.ts`: step buttons are found in the "Lesson steps" bar, not
  inside the "Guided lesson" card; Tools is opened by its new one-word label; the pen test
  opens Tools first and no longer expects Focus in the pen's row.
- The "laptop layout" test in that file was already failing before this work. It looked for
  `dd mark`, markup that commit `a85dc4a` removed. It now looks for the two highlighted
  halves inside the reason panel.
- `circle-ipad.spec.ts`: step buttons are checked against the step bar; Tools is opened before
  Pen and Focus are measured or pressed; the How to use list is opened from More; Got it is
  no longer pressed; Focus must hide the lesson card.
- `circle-site-load.spec.ts`: the step buttons are checked against the step bar.

## Measured on the first screen

The same script measured the old build and the new one
(`node out/circle-calm-layout/shots.mjs before|after <port>`; screenshots are in
`out/circle-calm-layout/`, which git ignores).

A "row of buttons" is a set of buttons or menus level with each other on the first screen.
A "framed box" is anything on the first screen with a visible border.

| Screen | Size | Rows of buttons | Framed boxes | Diagram starts at | Page height |
| --- | --- | --- | --- | --- | --- |
| Explore, first screen | 1280×800 | 10 → 6 | 16 → 2 | 434 → 333 px | 955 → 915 px |
| | 820×1180 | 13 → 7 | 16 → 2 | 553 → 429 px | 1180 → 1257 px |
| | 360×740 | 9 → 7 | 6 → 0 | 738 → 511 px | 1661 → 1348 px |
| Explore, Tasks | 1280×800 | 9 → 8 | 11 → 6 | 294 → 218 px | 836 → 800 px |
| | 820×1180 | 10 → 9 | 11 → 6 | 346 → 266 px | 1180 → 1180 px |
| | 360×740 | 7 → 5 | 4 → 0 | 415 → 343 px | 1177 → 1164 px |
| Relay, choose a level | 1280×800 | – | 15 → 3 | – | 1053 → 800 px |
| | 820×1180 | – | 15 → 3 | – | 1419 → 1180 px |
| | 360×740 | – | 8 → 1 | – | 1997 → 1583 px |
| Relay, a question | 1280×800 | – | 17 → 7 | 712 → 420 px | 1837 → 1434 px |
| | 820×1180 | – | 12 → 6 | 756 → 443 px | 2517 → 2131 px |
| | 360×740 | – | 9 → 1 | 973 → 656 px | 2984 → 2627 px |
| Play, first screen | 1280×800 | 5 → 5 | 8 → 3 | 340 → 218 px | 995 → 800 px |
| | 820×1180 | 8 → 6 | 9 → 3 | 392 → 260 px | 1180 → 1180 px |
| | 360×740 | 6 → 3 | 6 → 2 | 513 → 316 px | 1628 → 1306 px |

- No screen scrolls sideways: 60 screens were measured, 20 at each size.
- The level screen of Relay now fits one laptop or iPad screen. Its words on the first screen
  went from 245 to 196.
- The number of buttons on the first screen of Explore hardly changes (23 → 21 on a laptop),
  because the four tabs, the seven steps and the three play styles all stay by name. On a
  phone it rises (14 → 18): the step bar now fits on the first screen. What changed is how
  they are arranged: fewer rows, almost no frames, and the circle starts higher.
- On an upright iPad the Explore page is a little taller than the screen (1257 px against
  1180 px), because the circle is now full width. The lesson card's heading is on the first
  screen and its text is one short scroll away.
- A Relay question is drawn at random, so its numbers move a little from run to run.
- `Circle-Lab.html`, the single-file build, went from 868 KB to 851 KB (252 KB to 248 KB
  compressed). Its styles went from 103 KB to 88 KB. Loading time is in effect unchanged.

## Checked on 14 Nov 2026

All run on 14 Nov 2026 (log: `out/circle-calm-layout/final-checks.log`). One line was changed
after that run and has only been built, not re-tested or photographed: in
`reason-challenge.module.css` the Relay level list becomes one column below 900 px (it was
760 px), so an upright iPad shows one level to a row. The `compare-4` sheet still shows two
columns on the iPad. Run the two browser suites once more before committing.

- `npx tsc --noEmit`: no errors.
- `npx eslint src/apps/circle-properties src/lib/copy.ts` and the three changed test files: no
  errors.
- `npx vitest run src/apps/circle-properties`: 1,010 tests in 31 files pass.
- `npm run build`: the production build passes.
- `npx playwright test --config playwright.circle-reason.config.ts` (Edge): 73 pass. Before
  this work the same command gave 72 passed and 1 failed (the stale "laptop layout" test).
- `npx playwright test --config playwright.circle-site.config.ts` (Edge, on the production
  build): 31 pass.
- Sixty first screens and thirty-nine opened panels (Tools, More, the pen, Focus, the Property
  menu, a topic with six lessons, mixed practice, the reasons) were photographed at 1280×800,
  820×1180 and 360×740. None scrolls sideways.
- Files that were in Prettier style before still are. `index.tsx`, `TheoremLesson.tsx` and the
  three test files were not in Prettier style before and were not reformatted.

## Not done

- A physical iPad or phone. Edge with touch emulation only.
- The teacher's printed lesson script, if it says "Tools: measurements, snapping and sliders",
  "Settings" or "Got it": those three labels changed or went.
- Relay still asks four decisions on one screen. Showing one step at a time would change how
  the activity is worked, so it was left for the owner to decide.
- Reasons Play keeps several hard-coded English strings in `ReasonPractice.tsx`. They were
  there before and belong in `copy.ts`.
- Learn's own stage bands fade the two stages that are not current to 55% opacity, which
  leaves their words near 2.7:1 against the background. The guided lessons use a paler
  background with full-strength words (`.bands li` in `lesson-steps.module.css`). The same
  change would suit `path/path.module.css`; it belongs to the Learn path work.

## To undo any part

Every changed file as it was before this work is in
`out/circle-calm-layout/pre-calm-backup/` (ignored by git). The How to use banner, the
property column and the old Relay and Play screens can each be restored from there.
