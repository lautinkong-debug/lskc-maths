# Directed Numbers: textbook practice and sign/magnitude

## Coverage

Source: the teacher-supplied `1A02_Directed Numbers and the Number Line.pdf`.
The PDF is scanned; questions and answers were read from rendered pages.

| Bank | Questions | Parts | Source pages | Answer pages |
| --- | --- | ---: | --- | --- |
| Exercise 2B | 1–15, 21–28 | 62 | 2.32–2.34 | 2.68 |
| Exercise 2C | 1–16, 20–33 | 60 | 2.46–2.48 | 2.68–2.69 |

All 122 parts retain their question/part references and difficulty. Operands,
brackets and operation order are preserved. Printed division bars are rendered
as equivalent division expressions with grouped numerators/denominators where
needed. Expected answers are transcribed from the printed answer key, separate
from the evaluator. Exact rational arithmetic keeps integer, decimal, fraction
and mixed-number working correct throughout each animation.

Word problems, Exercise 2A, Quick Practice, Revision Exercise 2 and multiple-choice
questions are not in this bank. The interface states the exact coverage.

## Teaching sequence

The Sign & magnitude lesson uses the four cases supplied in the teacher's image:
50 − 60; −50 + 30; −50 + 60; −50 − 30. Additional examples cover subtracting a
negative number and cancellation to zero. Custom operands are integers from
−100 to +100, with a number line scaled to include the start, finish and zero.

1. Highlight the adjacent signs and animate one bracket removal at a time.
2. Measure the starting point's distance from zero.
3. Animate movement using the operation after bracket removal.
4. Draw the starting, movement and remaining/total distance bars on the same
   number-line scale. Show the magnitude calculation inside the graph, such as
   `50 - 30 = 20`, `60 - 50 = 10`, or `50 + 30 = 80`.
5. Read the final side of zero and attach the sign to the magnitude.

This is a teacher demonstration. Sign & magnitude has no prediction controls;
Textbook practice has no answer-entry form, marking or score counter. Both use
Play/Pause, Previous/Next step, Replay from start and Normal/Slow speed.
Changing a question or example cancels the old timeline. Reduced-motion settings
retain the mathematical sequence while removing movement effects.

For subtraction, show addition of the opposite before comparing magnitudes.
For equal signs, add magnitudes. For opposite signs, subtract magnitudes and
use the sign of the larger magnitude. Treat zero explicitly as neither positive
nor negative. Do not confuse the movement distance with the result's magnitude.

The bird lesson shows the final diagram after each completed move. Textbook
questions link to the bird only when the existing integer journey parser accepts
them; a single integer addition/subtraction can also open Sign & magnitude.
Fractions and compound expressions use animated, highlighted algebra working.
Every additive bracket change remains separate; nested brackets and mixed
operations retain the correct operation order. Completed steps can be expanded.

## Local review

Start the existing local website and demo Firebase emulators with `npm.cmd run dev:all`.
Use the normal emulator seed if the local database is empty.

- `/apps/directed-numbers#textbook` — textbook selection and teacher demonstration.
- `/apps/directed-numbers#textbook:e=2B-4c` — a specific textbook question.
- `/apps/directed-numbers#sign-magnitude` — the four illustrated cases.
- `/apps/directed-numbers#sign-magnitude:e=-50-(-60)` — subtract a negative.

Checks: `lib/textbook.test.ts` validates every question and every working step
against the printed key, plus sign/magnitude and visual eligibility cases.
`lib/demonstration.test.ts` checks all 122 question animations against the printed
key and verifies every highlighted TeX frame renders. The browser suite checks
bracket-first timing, magnitude calculations, playback, reset, filters, fractions,
lesson links, question restoration, mobile and projection views.
The existing bird animation suite covers regression of sign turns and unit steps.

## Initial production release

Published with the owner's approval at `https://lskc-maths.vercel.app/apps/directed-numbers`.
Deployment: `dpl_B4cpxr5ZKXgdjHRpKxSBLggMHUf4`.
The snapshot preserves the latest Statistical Charts release (`d83356e`) and
adds the tested Directed Numbers changes. All 17 focused Chrome scenarios passed
against the official domain. Home, Directed Numbers and Statistical Charts returned
HTTP 200; an unsigned challenge-join request returned 401. No Firebase data or
rules were changed. The source hashes and previous deployment are recorded in
`out/textbook-release.json`.

## Teacher demonstration release — 11/10/2026

Published from canonical `main` commit `b06071d` as deployment
`dpl_CsAGM7HzGsPGG33GrT1h9VmtAtLm` at the official domain.
The previous deployment was `dpl_B66NVH5WCVBurzWR5r5v1WnrQomq`.

All 17 live Chrome scenarios passed: bracket removal precedes graph movement;
the graph displays the magnitude calculation; textbook playback supports pause,
previous/next, replay and question changes; fractions and mixed operations retain
exact working; bird movement, phone and projector layouts continue to work.
Local verification also passed 343 mathematical/rendering checks, TypeScript,
scoped lint and a production build. Vercel's production build passed.

Home, Directed Numbers and Statistical Charts returned HTTP 200. An unsigned
challenge-join request returned 401. These checks do not include a signed-in
classroom challenge. No Firebase data or rules were changed.
