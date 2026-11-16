# Circle Lab: Learn path and Chapter test

Design record and handover notes for the student learning path on branch
`claude/circle-lab-mastery-path` (cut from `a85dc4a`). Nothing here is committed or pushed
yet. Explore, Reasons Relay and Reasons Play teach and mark as before; their layout was
calmed afterwards, see `docs/circle-calm-layout.md`.

## Who it is for

The weakest F5 students: weak junior geometry, weak English reading, low confidence. They
memorise the 17 reasons as strings, so they mix up each reason with its converse, cannot say
why a reason is true, and lose marks for wrong or missing reasons.

## What was missing (audit of a85dc4a)

1. No path. Three modes, seven properties and three sub-tabs, with nothing saying where to
   start or what is finished. The first screen is crowded.
2. Proofs are hidden. Only 16.1 has a line-by-line proof. The other sixteen have a paragraph
   under "Why does this follow?".
3. Reasons are recognised, never built. Every activity picks a reason from a list. Nothing
   practises producing the exact wording.
4. No assessment with a report. Relay gives points; nothing says which reasons a student has
   mastered or what to revise.
5. Heavy reading. Relay asks four decisions on one screen.

## Concrete, Pictorial, Abstract (CPA)

Every station moves through the three stages in order, and the interface names the stage:
coloured bands sit above the step bar, a tag sits beside the step name, and the home screen
shows the three stages.

| Stage | Steps | What the student does |
| --- | --- | --- |
| Concrete: touch it and move it | 1 Wonder, 2 Discover | Meets a real object (a broken plate, a goal, a pizza), then does a task with real paper, a ruler or string, then drags the live diagram |
| Pictorial: see it in a diagram | 3 Prove, 4 Remember | Follows the proof on a figure that lights up line by line; keeps one picture for each reason, blue for given and green for what follows |
| Abstract: write it in symbols | 5 Use, 6 Check | Writes ∵ / ∴ lines with the exact reason; finds x; is marked |

Each Discover step starts with a "Hands on" task that uses real objects before any diagram
is dragged: fold a paper circle (16.1–16.3), measure distances to two equal chords
(16.4–16.5), lay two traced copies of an angle at the centre (16.6), slide a traced angle
round the circle (16.7), fit the corner of an A4 sheet on a diameter (16.8–16.9), stack two
of eight folded slices (16.10–16.15), compare string along the crust with a ruler across the
chord (16.16–16.17). A unit test fails if a station's Discover does not start this way.

## Other design principles

- One small action per screen, with kind and specific feedback. After two wrong tries the
  answer is shown and explained; nothing is locked and nothing is lost.
- The same six steps in every station, so the routine is learnt once:
  **Wonder → Discover → Prove → Remember → Use → Check**.
- Predict before seeing. Every Wonder ends with a guess, and the guess is shown again when
  the puzzle is settled.
- A proof is a story told on the diagram. Each line lights up its part of the figure and has
  one blank to fill from two or three choices. Junior-form tools (RHS, base ∠s, ext. ∠ …)
  are explained one tap away. On a phone the figure stays pinned while the lines scroll.
- A reason is a sentence: **what you have, then what you get**. Blue marks given facts and
  green marks what you get, the same colours as the worksheets and the existing diagrams.
  Students build each wording from word tiles, so they produce it and do not only recognise it.
- Seventeen reasons become seven pictures in three families: Chords (16.1–16.5), Angles
  (16.6–16.9) and Arcs, chords and angles (16.10–16.17). Station 6 makes six reasons from
  one rule with the "reason maker".
- Worked example first, then alone with hints. Use steps include two-step DSE-style
  questions (a chord with Pythagoras, radii with an isosceles triangle, the k-method).
- Common mistakes are met on purpose: the whole chord in Pythagoras, the wrong direction, a
  perpendicular that misses the centre, a slanted "distance", the reflex centre angle, a
  chord that is not a diameter, circles of different sizes, chord ratio ≠ arc ratio. A wrong
  number that matches a known slip gets a sentence about that slip.
- Stars, not lives. Three stars a station: finish the lesson, pass Check (4 of 5), perfect
  Check (5 of 5). New numbers on every retry.

## Stations

| # | Station | Reasons | Big idea |
| --- | --- | --- | --- |
| 1 | A line from the centre to a chord | 16.1 16.2 16.3 | Two facts give the third |
| 2 | Equal chords, equal distances | 16.4 16.5 | Equal chords ⇄ equal distances |
| 3 | Angle at the centre | 16.6 | Same arc: the centre angle is double |
| 4 | Angles in the same segment | 16.7 | Same arc, same side: equal angles |
| 5 | Angle in a semi-circle | 16.8 16.9 | Diameter ⇄ right angle |
| 6 | Equal angles, arcs and chords | 16.10–16.15 | Say what you have, then what you get |
| 7 | Arcs in proportion | 16.16 16.17 | Arcs share like angles; chords do not |

Proofs follow Book 5A (teacher's edition pp. 16.2–16.38): RHS and SSS for 16.1–16.2, the
perpendicular-bisector converse for 16.3, half chords with RHS for 16.4–16.5, isosceles
triangles and exterior angles for 16.6 (with x and y for the base angles), "both are half of
the same centre angle" for 16.7, the straight angle at O for 16.8–16.9, rotation for
16.10–16.11 (the copy of the sector turns on screen), SAS and SSS for 16.12–16.13,
two-reason chains for 16.14–16.15, equal 10° slices for 16.16 and doubling for 16.17.

## Assessment

- **Check**, at the end of each station: five questions, marked one at a time, new numbers
  on every try. It mixes "which reason goes in the brackets", "find x" and one trap.
- **Chapter test**: twelve questions drawn from all seven stations, no hints, nothing marked
  until it is handed in, and answers can be changed before that. The report gives the mark,
  a bar for each section, each tested reason right or wrong, the slips made with a tip for
  each, and buttons back to the stations to revise. A student can add a name, then copy the
  result as text or print it. The last five papers are kept in this browser only.
- **My reason map**: all 17 reasons on one page with their pictures and a mastery label
  (not tested yet / revise / nearly / secure) from Check and test answers. "Hide the words"
  turns it into a self-test.

Nothing is uploaded. Collecting a class's results needs a backend and is not built.

## What changed in existing files

- `src/apps/circle-properties/session.ts`: new mode `"learn"`, now the first-visit default;
  `modeFromHash`.
- `src/apps/circle-properties/index.tsx`: a Learn tab, `<LearnPath>`, and the start-up link.
- `src/lib/copy.ts`: `circlePathCopy` appended.
- `tests/e2e/circle-*.spec.ts`: each `goto` now ends in `#explore`, because those tests are
  about Explore. `playwright.circle-reason.config.ts` also runs `circle-learn.spec.ts`.

**Links.** Circle Lab opens on Learn for a new visitor and remembers the last activity after
that. A link can choose: `…/apps/circle-properties#explore` (or `/classroom#explore`) for a
teacher-led lesson with the guided lesson, `#learn` for self-study, `#relay`, `#play`. The
link is read as the page opens and then removed from the address, so a reload returns to
wherever the student has moved on to. It still applies after "Reset progress" on that visit.

## Code

All new code is in `src/apps/circle-properties/path/`.

- `figureModel.ts` and `Figure.tsx`: one small SVG language for every static diagram. A
  figure lists its parts once; a step only changes tones (base, given, get, aux) and focus.
- `StepPlayer.tsx`: proofs and worked examples. `TileBuilder.tsx`: reason wording.
  `NumberTask.tsx`, `Choice.tsx`, `SimpleTasks.tsx`, `ExploreTask.tsx` (wraps
  `ReasonFlowDiagram` and `reasonMeasurements`), `ReasonMaker.tsx`.
- `Quiz.tsx`: Check (marks each answer) and the Chapter test (marks at the end).
  `test.ts` builds a paper and its summary.
- `stations/s1.ts` … `s7.ts`: all content as data; `stations/kit.ts`: shared helpers.
- `pathSession.ts`: progress, stars and mastery, saved with `useLocalSession` under `path`.
- `content.test.ts`: 169 checks. Every proof step names parts that exist in its figure;
  every blank has one answer; tiles join to the official wording; every reason is proved,
  pictured and reachable in a Check; tap targets do not overlap; generators give sound
  numbers for sixty seeds.

To add or change content, edit the station file and run
`npx vitest run src/apps/circle-properties/path`.

## Checked on 15 Nov 2026

Run on the combined work in this folder: the Learn path and the calm layout of the older
activities (`docs/circle-calm-layout.md`).

- `npx tsc --noEmit` and `npx eslint src/apps/circle-properties`: no errors.
- `npx vitest run src/apps/circle-properties`: 1,010 tests in 31 files pass.
- `npm run build`: the production build passes. Standalone `Circle-Lab.html` is 0.85 MB
  (0.66 MB at `a85dc4a`).
- `npx playwright test --config playwright.circle-reason.config.ts`: 73 tests pass in Edge,
  including the 14 Learn tests at 360 and 375 px phones and an iPad upright and on its side
  (no sideways scrolling in any step; the figure stays in view while a proof is read).
- `npx playwright test --config playwright.circle-site.config.ts`: 31 tests pass against the
  production build. The server logged one `NoFallbackError` line during the run; no test
  failed, and it has not been traced.

Not done: a physical iPad or phone.

## Not built yet

- Reasons Relay still asks four decisions on one screen (its layout is calmer now: see
  `docs/circle-calm-layout.md`).
- Class results for the teacher (a challenge definition, or a results code).
- Sound, and Chinese help for vocabulary.
