# Equation Studio — textbook practice and animation

Updated 30/10/2026. Topic: F1 / 1A04, Linear Equation in One Unknown.

Publication approved on 30/10/2026. The isolated release preserves the latest production apps and includes the new per-topic Mistakes Book upload shortcut described in `docs/mistakes-upload.md`. All 253 maths checks, all 16 Equation Studio browser scenarios, four upload-flow scenarios, TypeScript, lint and the production build pass against the release. Publication and live verification are recorded in the release evidence.

## What is included

106 selectable textbook questions:
- All Quick Practice 4.1–4.15: 27 entries including every lettered part.
- All Revision Exercise 4 Q1–63, with all subparts.
- Exercise 4A and Exercise 4B as separate collections, with eight selected questions each.

The ordinary Exercises 4A/4B/4C are not complete collections in this phase. Challenging Questions and Multiple Choice Questions are separate textbook sections and are outside this requested expansion.

Source: G:/My Drive/02_Mathematics/F1/01_Textbook/1A04_Linear Equation in One Unknown.pdf.
The scanned mathematics was read visually. Quick Practice pages: 4.7, 4.9–4.10, 4.13–4.16, 4.18–4.19, 4.23–4.26. Revision pages: 4.33–4.36. Printed answer keys: 4.40–4.41.
Word-problem text and quantities are retained; triangle, rectangle and magic-square diagrams are redrawn with the original labels. Decorative photographs are not needed to answer the questions. Q56's plan table is presented as accessible text.

## Procedure followed

1. Compare the existing Directed Numbers teaching controls and inspect all requested textbook sections.
2. Transcribe every equation, word problem and subpart; preserve the variable, printed page and question reference.
3. Independently check the numerical answers against the printed answer key, including contextual quantities (for example, Quick Practice 4.15 asks for 700 g, not the intermediate five bags).
4. Build exact rational algebra steps. Decimal equations keep decimal notation and go directly through transposition and division; for example, `0.8+3x=1.4 → 3x=1.4−0.8 → 3x=0.6 → x=0.6/3 → x=0.2`. Only equations containing written fractions use LCM clearing. Expand brackets, clear denominators where necessary, move unknown terms to the left and constant terms to the right, collect like terms, divide by the coefficient, and check in the original equation.
5. Use round brackets for the innermost groups, square brackets around them and curly brackets for the next level. The fraction line already groups a numerator or denominator, so do not add redundant brackets there. Keep subtraction between distributed products: for example, `2(1/6) − 2[1/3(1−2y)]`. Animate bracket removal one bracket at a time: draw an arrow from the signed factor to every term and stop. The next click writes the distributed products below; another click simplifies them. For fractions, show the LCM multiplying every term on both sides, then animate red cancellation strokes across the multiplier and denominator before showing the cleared equation. Keep these strokes on the earlier product line. Continue with additive-term transposition and signed-coefficient division.
6. Retain the original equation and every revealed equation on one plain-background working board. On desktop, fill the left column from top to bottom, then the right. The board fits the window and adjusts equation size as needed; completed working stays visible without scrolling. Phones use a single column. The new operation is drawn on its preceding equation; the result is added below. Provide Play/Pause, Next/Previous step, Replay and speed, plus a static equivalent for reduced motion. Arrow paths use the full numerator/denominator bounds and separate lanes; fractional multipliers start above the fraction itself, and arrowheads appear as the paths reach their terms. Highlights cover the whole fraction. Pause also freezes distribution arrows. A manual Next step stops after that step; Play continues through the lesson.
7. Test every intermediate equation and every requested answer. Run real Chrome checks for movement, pause/resume, all question/solution layouts, input, progress and history.
8. Leave the local app ready for classroom review. No production services, rules or deployment are changed.

The worked explanations and modeling equations are app-authored teaching material. They are not presented as verbatim textbook solutions.

## How to use it

Open http://localhost:3000/apps/linear-equations#learn/revision-52 for nested brackets, or http://localhost:3000/apps/linear-equations#learn/qp-4.8a for LCM multiplication.

1. Choose a question collection, then a textbook question. Exercise 4A and Exercise 4B have separate collection choices, each containing its eight selected questions. There is no skill selector.
2. In Learn, choose Projection mode for classroom display.
3. Use Next step once for the arrows, then again for the product equation. Play runs through both stages. Desktop working fills two columns in one window; the first action brings the board into view. Pause freezes the moving term itself. Slow gives more time to discuss a sign change.
4. Use Previous step or Replay from start to revisit the explanation. At the end, Check by substitution opens the full check in a dialog; Back to working or Escape returns to the two-column board.
5. Open Practise to enter answers. All word-problem subparts have their own fields; units are shown beside the fields.
6. Equivalent fractions, decimals, linear expressions and equations are accepted. Use 2x or 2*x and parentheses. For explanation questions, pupils explain aloud/on paper and enter a supporting value; the app checks that value and shows the reasoning after completion.

Progress counts independent first-attempt solves on the current device. Hints, working reveals and valid wrong attempts make that attempt assisted. Generated similar equations are available for equation questions and are clearly labelled; they do not inherit word-problem text or textbook attribution.

If the preview has stopped, run npm.cmd run dev:all from this checkout. Use the existing localhost:3000 server if it is already running. No sign-in or seed is needed.

## Verification

- Follow-up on 28/10/2026: verified Exercise 4B Q20's two red cancellation strokes, their persistence, and Previous/Replay behaviour. Fixed autoplay capturing the action number instead of the equation row after arrow-only stages; terms now physically move across the equals sign during the following transposition. The new regression failed before the correction and passed afterwards. All eight focused operation/display browser scenarios and all 253 maths checks pass. Screenshot: out/linear-equations/q20-cancellation.png.
- 253 focused maths checks pass, including all requested printed answers, every animated equation, sign changes on each transposition, safe equivalent-expression input, and the previous generated-retry tests.
- Fourteen Chrome scenarios pass. Actual screen coordinates verify movement, pausing, clearance from mathematical glyphs and separation between distribution/LCM arrow paths; all 106 questions and revealed solutions render without page overflow at 360 px and 1920 px. Word-problem models, multi-answer fields, choice/reasoning, saved progress, generated attribution, collection/history navigation, reduced motion and Projection mode are covered. The full Revision Q52 lesson fits within 1366×768 and 1920×1080 desktop windows, and the 360 px phone layout retains its readable single column. Cancellation strokes remain visible after further steps.
- Every distribution arrow has a verified rendered source and destination across the question bank. Revision Q52 checks the outside 2, the inner signed factor and the later bracket after clearing denominators. Quick Practice 4.8(a) checks LCM 12 on both sides, including the constant 7.
- Scoped ESLint passes.
- Current classroom screenshots: out/linear-equations/arrows-only.png, next-click-result.png, negative-fraction-arrows.png, visible-cancellation.png, two-columns-1366.png, two-columns-1920.png and decimal-direct.png.
- Earlier bracket / LCM screenshots: out/linear-equations/q52-distribution-paused.png, q52-distribution-complete.png, lcm-multiplication.png, lcm-cancellation.png and q52-retained-360.png / q52-retained-1920.png.
- Earlier rendered screenshots reviewed: out/linear-equations/animated-crossing.png, animation-projector.png, animation-phone.png, full-bank-360.png.
- The final full-site Next.js production build passes, including TypeScript and static page generation. This is local build verification, not publication.

Recheck:
- npm.cmd exec -- vitest run tests/unit/linear-equations.test.ts tests/unit/linear-equations-full.test.ts
- npm.cmd exec -- playwright test --config playwright.linear-equations.config.ts
- npm.cmd exec -- eslint src/apps/linear-equations tests/unit/linear-equations-full.test.ts tests/e2e/linear-equations.spec.ts
- npm.cmd run build

The earlier pilot record is preserved in docs/linear-equations-pilot.md.
