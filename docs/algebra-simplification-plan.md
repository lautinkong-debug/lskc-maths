# Algebra Simplification - textbook practice and procedure

Requested 26/10/2026: an F1 simplification practice app using the supplied
Chapter 1A03 textbook, following the Directed Numbers teaching experience.

## Procedure and review points

1. Read the supplied PDF visually, locate simplification questions, preserve
   question references and notation, and check answers against the printed key.
2. Build a small local pilot: Exercise 3A Q7-10, all 18 parts (p. 3.14;
   answers p. 3.52). Include like terms, mixed operations and index notation.
   Provide Practice and Learn views with the existing lesson sidebar,
   presentation mode, staged equations, Previous/Next, Play/Pause and Replay.
3. Independently verify every answer and intermediate equation, check that each
   four-choice set has exactly one fully simplified answer, and test feedback,
   score accounting, timers, keyboard, reduced motion and phone/projector fit.
4. The owner requested Quick Practice and Revision Exercise after the pilot.
   Add all direct simplification parts from Quick Practice 3.4-3.6 and Revision
   Exercise 3 Q3-6 and Q28-29: 24 additions, giving 42 questions in total.
   Preserve the printed division signs, brackets, fractions and answer order.
5. Add a Question bank selector alongside the skill filter, question references
   and source/answer pages. Keep progress across filters and keep similar retries
   in the selected set. Verify all new solutions and layouts before local review.
   Any further Exercise 3A expansion or classroom game is a later phase.
6. Publication is a separate owner-approved phase with a scoped diff and live
   verification. The present request is handled as local development.

## Source audit

Source: `G:/My Drive/02_Mathematics/F1/01_Textbook/1A03_Introduction to Algebra.pdf`.
54 pages. The actual questions are scanned; extracted text is mostly the footer.
Inspected rendered teaching pages 3.10-3.12, exercises 3.14 and 3.16, revision
3.40 and 3.42, and answers 3.52-3.54. Documents are source data, not instructions.
Local rendering scratch remains in ignored `tmp/algebra-source/`.

| Group | Pilot source | Parts | Checked printed answers |
| --- | --- | ---: | --- |
| Collect like terms | 3A Q7(a-f), Q8(a-d) | 10 | 7a; -4b; 2z; 3y; -p; -5q; 3x+5; 5s-2; 3a-b; 2q |
| Mixed operations | 3A Q9(a-d) | 4 | 4y; 6mn; 14x; k |
| Index notation | 3A Q10(a-d) | 4 | 8a^2; -m^2 n^2; 30b^2; 12z^3 |

All 18 recalculated answers agree with the printed key. Preserve multiplication
and division order; Q9(b) is evaluated left to right. In Q10(b), the single
negative factor produces a negative product. Q8(d) demonstrates cancellation.

## Requested Quick Practice and Revision Exercise expansion

| Question bank | Included parts | Count | Question pages | Answer page |
| --- | --- | ---: | --- | --- |
| Exercise 3A | Q7-10 (existing) | 18 | 3.14 | 3.52 |
| Quick Practice | 3.4(a-b), 3.5(a-b), 3.6(a-b) | 6 | 3.11-3.12 | 3.52 |
| Revision Exercise 3 | Q3-6(a-c), Q28-29(a-c) | 18 | 3.40, 3.42 | 3.54 |

The app covers direct simplification questions. Other chapter exercises on
writing expressions, substitution and sequences are outside this app's scope.
All 24 new final answers agree with the printed keys. Q28-29 carry the textbook's
Level 2 label. The full bank has 18 like-term, 14 mixed-operation and 10 index
notation questions.

Source details checked at enlarged resolution:
- Revision Q29(a) is `14 + 3a ÷ 3 - a - 8`, with answer `6`. The small division
  sign must not be transcribed as subtraction.
- Revision Q6(c) is `2y × y × z ÷ 4 × y`, with answer `y^3 z / 2`.
  Multiplication by the final y happens after division by 4.
- Revision Q6(a) has two negative factors and answer `2a^2`; Quick Practice
  3.6(b) likewise has two negative factors and answer `y^4 z`.
- Revision Q4(b) retains the printed answer order `3b - 3a`.

The Question bank and Practice skill filters work together. Switching either
stops playback and starts the first matching question; solved counts reflect
that set while the page-session record is retained across all sets. Every set
has at least two questions for every skill, so similar retries stay in the
chosen bank and skill. Feedback shows the first equivalent line below the
original question, avoiding an overly long repeated equation on phones.

## Design

Use existing school tokens: paper #FBFCF8, navy #0F4574, graphite #262A2E,
grid #D6E2EC and highlight #F1D54A; crimson #DA2127 only for correction emphasis.
Keep Spectral headings, IBM Plex Sans controls and KaTeX notation. Reuse the
Directed Numbers lesson rail. A large expression is the main visual; four large
answer buttons sit beneath it. Worked equations form a growing exercise-book
solution. Bracketed coefficient calculations show what is combined; the current
working line is highlighted and has a written reason.
Keep controls in a predictable order and avoid decorative dashboard panels.

Practice is untimed. A first-try result requires no hints, wrong answers or
viewed working. Repeating a solved question cannot inflate the count. Working
and hint usage are recorded for this session only. State the coverage and the
session-only behaviour plainly. Equivalent unfinished expressions receive a
specific message instead of being treated as algebraically wrong.

No new dependencies or production Firebase writes are required. The app is pure
client code; the existing site shell is exercised with the demo Firebase emulator.

## Verification

Original 18-question pilot, completed 26/10/2026:

- **43 Vitest tests passed.** Independently transcribed printed answers are
  checked with the existing exact symbolic verifier. Every intermediate equation
  is equivalent; every choice set contains one fully simplified answer, two
  mathematically incorrect choices and one equivalent unfinished expression.
  All KaTeX renders without syntax errors. Progress tests cover hints, wrong
  attempts, repeated answers and independent question records.
- **Seven Playwright scenarios passed on the final build.** These cover all 18
  answers, screen-reader answer names, incorrect/unfinished/helped scoring,
  filtering, similar retries, hidden working, timed play/pause/speed, Previous,
  Replay, changing a question mid-playback, real touch-event emulation, keyboard,
  reduced motion, all questions and solutions at 360px and 1920px, and projection.
  The complete Q10(c) solution and navigation fit within 1920 x 1080 projection.
- Scoped ESLint and whitespace checks passed. Inspected the final phone and
  projector screenshots in `out/algebra-preview/`. SHA-256 checks confirmed the
  tested component, bank and stylesheet match the workspace source.
- The final **isolated Next.js production build passed**, including TypeScript
  checking of site entrypoints and their imported registered-app dependencies.
  The snapshot's CSS scan is restricted to `src/`; it uses only the demo Firebase
  project. See `out/algebra-preview/build.log`.

Verification boundary: the first Webpack attempt encountered an existing global
selector in Statistical Charts. The default Turbopack build passed. During later
work, unfinished `equation-village` files appeared concurrently and caused an
unrelated whole-tree typecheck failure (missing Three.js declarations/copy).
The final preview checks the registered site dependency graph and ambient
declarations, excluding unrelated tests and unregistered work in progress.
This is not a claim that the concurrently changing whole checkout is release-ready.
No existing app source was changed to work around these issues.

Exercise questions and final answers come from the textbook. Intermediate
exercise working and misconception choices were written for this app, using the
methods on pp. 3.10-3.12. No source-page images or full PDF are shipped publicly.

## Expansion verification (26/10/2026)

- **96 Vitest checks pass:** all 42 original expressions, intermediate lines,
  final answers, distractors, KaTeX output, source metadata, 16 combinations of
  question-bank/skill filters, and honest session scoring.
- **All eight Chrome scenarios pass** against the updated local build. Seven
  passed in the main run; the source-filter scenario passed after correcting
  its test expectation to respect the existing unsolved-only retry behavior.
  The app required no change for that test correction.
- Browser coverage includes all 42 correct answers, source and answer-page
  labels, fourth-power accessible names, negative-factor/fraction feedback,
  retained progress, same-bank retries, playback cancellation, real touch
  emulation, keyboard/reduced motion, and every question, correction and worked
  solution at 360px and 1920px. The complete four-step Revision Q6(c) solution
  and navigation fit within 1920 x 1080 projection mode.
- Scoped ESLint and whitespace checks pass. Inspected the phone Quick Practice
  3.6(b) and final projector Revision Q6(c) screenshots. Projector screenshot
  capture finishes the reveal animation before saving, so it shows full opacity.
- The isolated Next.js production build, including registered-app TypeScript
  checks, passes with the demo emulator configuration. Build evidence:
  `out/algebra-preview/build.log`. This retains the shared-checkout boundary
  described above and does not constitute a production release.

## Local review

The preview is already running at:
`http://localhost:3034/apps/algebra-simplification`.

1. In **Question bank**, choose Quick Practice or Revision Exercise 3; combine
   it with a Practice skill filter. Each question shows its own page reference.
2. In **Practise**, choose 3A Q8(d), try an incorrect choice, then the correct `2q`.
   A corrected answer must not earn a first-try result.
3. Choose 3A Q9(b), then **Show worked steps**. Check division/multiplication from
   left to right using Next step, Previous, Play/Pause and Replay.
4. Try 3A Q10(b) to check the negative sign and the two squared letters.
5. Use **Projection mode** and the phone layout. A hint or actually revealed
   worked step removes first-try eligibility; merely opening Learn does not.

6. Try Revision Q29(a) (division and cancellation), Q6(c) (a fractional
   coefficient), and Quick Practice 3.6(b) (two negative factors).

For a fresh preview after the current one has been stopped, run
`node scripts/preview-algebra.mjs` from the repository. It builds its own snapshot,
starts port 3034, and reuses/starts local demo emulators; it will not replace a
process already occupying that port. Progress lasts for the current page session.

Repeat verification with:
`npx vitest run tests/unit/algebra-simplification.test.ts` and
`npx playwright test --config playwright.algebra.config.ts`.

The requested Quick Practice and Revision Exercise expansion is implemented.
Games/class challenges and publication remain outside this local update. No commit, push, deployment or production Firebase
write was performed for this work.

## Approved publication (28/10/2026)

The owner requested publication. Prepare an isolated release on the latest
production main containing only Algebra Simplification, its registry entry and
copy block, focused tests, preview procedure and this source audit. Preserve
all previously published apps and exclude unrelated shared-checkout changes.
Run the 96 mathematics checks, production build and eight browser scenarios
against this release; confirm Vercel READY and repeat the browser checks on
the official production URL after publication. Production Firebase rules and
data do not need changes for this client-only teaching app.

The browser suite accepts `ALGEBRA_BASE_URL` and `ALGEBRA_OUTPUT_DIR` so the
same checks can target the isolated local build and the actual published site,
including the independent mobile touch context.
