# Directed Numbers: textbook practice and sign/magnitude

## Coverage

Source: the teacher-supplied `1A02_Directed Numbers and the Number Line.pdf`.
The PDF is scanned; questions and answers were read from rendered pages.

| Bank | Questions | Parts | Source pages | Answer pages |
| --- | --- | ---: | --- | --- |
| Exercise 2B | 1–15, 21–28 | 62 | 2.32–2.34 | 2.68 |
| Exercise 2C | 1–16, 20–33 | 60 | 2.46–2.48 | 2.68–2.69 |
| Revision Exercise 2 | 7–21, 25–38 | 58 | 2.56–2.58 | 2.69 |

All 180 parts retain their question/part references and difficulty. Operands,
brackets and operation order are preserved. Printed division bars are rendered
as equivalent division expressions with grouped numerators/denominators where
needed. Expected answers are transcribed from the printed answer key, separate
from the evaluator. Exact rational arithmetic keeps integer, decimal, fraction
and mixed-number working correct throughout each animation.

Word problems, Exercise 2A, Quick Practice and multiple-choice
questions are not in this bank. The interface states the exact coverage.

## Teaching sequence

The Sign & magnitude lesson uses the four cases supplied in the teacher's image:
50 − 60; −50 + 30; −50 + 60; −50 − 30. Additional examples cover subtracting a
negative number and cancellation to zero. Custom operands are numbers from
−100 to +100, with a number line scaled to include the start, finish and zero.

1. Highlight the adjacent signs and animate one bracket removal at a time.
2. Measure the starting point's distance from zero.
3. Animate movement using the operation after bracket removal.
4. Determine the sign from the endpoint's side of zero. One Next step click
   reveals only `= +` or `= -` and the sign card. The magnitude expression is
   still hidden visually and from screen readers. Zero has no sign prefix.
5. The next click fades and slides the bracketed magnitude beside the stationary
   sign, for example `= +(43 - 21)` or `= -(4.9 - 3.1)`. Reveal the magnitude
   card and draw the starting, movement and remaining/total distance bars on the same
   number-line scale. Show the magnitude calculation inside the graph, such as
   `50 - 30 = 20`, `60 - 50 = 10`, or `50 + 30 = 80`.
6. Write the signed answer. Keep the sign-first expression visible above it.
   Zero receives no positive or negative sign.

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
them. Single additions/subtractions, including decimal and fraction textbook
questions, use Sign & magnitude. Compound expressions use animated, highlighted
algebra working.
Every additive bracket change remains separate; nested brackets and mixed
operations retain the correct operation order. Every completed equation and its
explanation remain visible in a growing worked solution; no dropdown is needed.
Sign & magnitude keeps the bracket working visible through the graph stages.
New rows expand gently. Two arrows run from the operation sign and the sign
inside the bracket to the resulting sign immediately below the equation.
The original signs and arrows stay visible with the completed working.
Highlighted equations reserve their space to avoid shifting the text.

Multiplication and division use the same two-click reveal in Textbook practice:
the first click shows the sign, and the second fades/slides in the parenthesised
magnitude beside that stationary sign. Each sign line stays visible when later
operations are highlighted or calculated. Signed subexpressions in longer
questions remain grouped. Fractional division stays as division in the teacher
demonstration; the general worked-solution engine still supports reciprocal steps.
Decimal working keeps decimals, fraction working keeps fractions, and zero has
no invented positive or negative sign. Previous, Replay and autoplay follow the
same sequence.

Textbook product/quotient steps also draw two converging arrows from the operand
signs to the resulting sign on the first click. The next click adds the magnitude;
the arrows and earlier equations remain visible. Implicit positive factors receive
an explicit plus sign for the arrow anchor. Reduced negative factors stay grouped
inside compound expressions, preventing ambiguous adjacent subtraction signs.

Custom Sign & magnitude inputs accept integers, decimals, fractions such as
`1/3`, and mixed numbers such as `-1 1/2`, between -100 and +100. Arithmetic,
sign decisions and labels use exact rational values; decimal-only inputs retain
decimals in every bracket-removal line, sign diagram, calculation and result.
Fraction inputs retain fractions. The same formatting policy applies to textbook
demonstrations, including mixed operations. Coordinates alone use
numeric values. The graph rescales for small fractional distances. Invalid
inputs, including zero denominators, leave the current demonstration intact.
Unsigned positive entries stay as typed after submitting the custom form; an
explicit plus sign is optional. At the magnitude step, a pale purple hatched band
marks the exact interval from the endpoint to zero. The finish marker, remaining
or total distance and calculation share purple; the starting distance stays navy
and movement distance red. The calculation is centred beneath its distance bar,
with edge clamping for longer labels. Zero receives a line at zero, not a band
suggesting a non-zero distance. Replay clears the highlight with the working.
Zero uses a solid navy reference line and a larger white-backed badge. The purple
Finish label sits below the axis on the outer side of the shaded result interval;
nearby start/finish labels use separate rows, and long finish labels stay inside
the graph edges.

## Local review

Start the existing local website and demo Firebase emulators with `npm.cmd run dev:all`.
Use the normal emulator seed if the local database is empty.

- `/apps/directed-numbers#textbook` — textbook selection and teacher demonstration.
- `/apps/directed-numbers#textbook:e=2B-4c` — a specific textbook question.
- `/apps/directed-numbers#textbook:e=R2-7a` — Revision Exercise 2, first calculation.
- `/apps/directed-numbers#textbook:e=R2-38b` — nested fraction revision calculation.
- `/apps/directed-numbers#sign-magnitude` — the four illustrated cases.
- `/apps/directed-numbers#sign-magnitude:e=-50-(-60)` — subtract a negative.

Checks: `lib/textbook.test.ts` validates every question and every working step
against the printed key, plus sign/magnitude and visual eligibility cases.
`lib/demonstration.test.ts` checks all 180 question animations against the printed
key and verifies every highlighted TeX frame renders. The browser suite checks
bracket-first timing, magnitude calculations, playback, reset, filters, fractions,
lesson links, question restoration, mobile and projection views.
The existing bird animation suite covers regression of sign turns and unit steps.

## Revision bank and exercise arrows — 11/10/2026

Application source commit `77dc2b5` was published as
`dpl_BxDrUZZdjJkcBwy2GQ6oWPQZmFMB` on the official domain. All nine focused live
scenarios passed across final runs, covering revision selection/reload, decimal
and nested fraction completion, split animation, and exercise-arrow alignment
and retention. The fraction-arrow test waits for KaTeX fonts and layout before
measuring; its first production attempt measured during font loading. No
application change was needed for the passing recheck. Local verification passed
534 maths/rendering checks, 15 browser scenarios, TypeScript, scoped lint and build.

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
