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
from the evaluator. Equivalent integer, decimal, fraction and mixed-number
answers are accepted by the existing exact rational arithmetic engine.

Word problems, Exercise 2A, Quick Practice, Revision Exercise 2 and multiple-choice
questions are not in this bank. The interface states the exact coverage.

## Teaching sequence

The Sign & magnitude lesson uses the four cases supplied in the teacher's image:
50 − 60; −50 + 30; −50 + 60; −50 − 30. Additional examples cover subtracting a
negative number and cancellation to zero. Custom operands are integers from
−100 to +100, with a number line scaled to include the start, finish and zero.

1. Start at the first number.
2. Read both the operation and the second number's sign to determine movement.
3. Animate an arrow whose length is proportional to the movement distance.
4. Read the result's sign from its side of zero.
5. Mark the result's magnitude as the distance between zero and the endpoint.

For subtraction, show addition of the opposite before comparing magnitudes.
For equal signs, add magnitudes. For opposite signs, subtract magnitudes and
use the sign of the larger magnitude. Treat zero explicitly as neither positive
nor negative. Do not confuse the movement distance with the result's magnitude.

The bird lesson shows the final diagram after each completed move. Textbook
questions link to the bird only when the existing integer journey parser accepts
them; a single integer addition/subtraction can also open Sign & magnitude.
Fractions and compound expressions use the exact step-by-step working instead.

## Local review

Start the existing local website and demo Firebase emulators with `npm.cmd run dev:all`.
Use the normal emulator seed if the local database is empty.

- `/apps/directed-numbers#textbook` — textbook selection, grading and working.
- `/apps/directed-numbers#textbook:e=2B-4c` — a specific textbook question.
- `/apps/directed-numbers#sign-magnitude` — the four illustrated cases.
- `/apps/directed-numbers#sign-magnitude:e=-50-(-60)` — subtract a negative.

Checks: `lib/textbook.test.ts` validates every question and every working step
against the printed key, plus sign/magnitude and visual eligibility cases.
`tests/e2e/textbook-practice.spec.ts` exercises staged movement, prediction,
grading, filters, lesson links, question restoration, mobile and projection views.
The existing bird animation suite covers regression of sign turns and unit steps.

## Production release

Published with the owner's approval at `https://lskc-maths.vercel.app/apps/directed-numbers`.
Deployment: `dpl_B4cpxr5ZKXgdjHRpKxSBLggMHUf4`.
The snapshot preserves the latest Statistical Charts release (`d83356e`) and
adds the tested Directed Numbers changes. All 17 focused Chrome scenarios passed
against the official domain. Home, Directed Numbers and Statistical Charts returned
HTTP 200; an unsigned challenge-join request returned 401. No Firebase data or
rules were changed. The source hashes and previous deployment are recorded in
`out/textbook-release.json`.
