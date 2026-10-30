# Equation Studio: procedure and local pilot

Historical pilot record. The current expanded app, coverage and procedure are documented in [linear-equations.md](linear-equations.md).

Date: 26/10/2026. Topic: F1 / 1A04, Linear Equation in One Unknown.

## Delivery procedure

1. Read the existing Directed Numbers app and project conventions.
2. Inspect the supplied textbook visually. Its mathematics is scanned; the PDF text layer contains only the publisher footer.
3. Establish a representative teaching example: Exercise 4B Q18, -(2q-5)=3q+10. Show expansion, subtract 3q, subtract 5, divide by -5, then check in the original equation.
4. Build a local Learn and Practise pilot with 16 verified textbook questions, exact fraction/decimal marking, misconception feedback and separately labelled generated retries.
5. Independently solve every original and every displayed working line; compare the printed answer key. Test keyboard entry, invalid answers, hints, reveals, device progress, question switching, generated retries and phone/projector rendering.
6. Stop after the tested pilot for the owner's local review, as required by CLAUDE.md.
7. After review, expand textbook coverage and add Play activities. Add Compete only as a separate phase using the existing server-marked challenge system and independent teacher/student emulator clients.
8. Publish only when requested, then verify the actual live deployment and route.

## Source audit

Supplied source: G:/My Drive/02_Mathematics/F1/01_Textbook/1A04_Linear Equation in One Unknown.pdf.
Read-only local copy and rendered inspection pages: out/linear-equations/.
The PDF has 41 pages. Detailed source inspection for this pilot covers printed pp. 4.11, 4.20 and answer key p. 4.40. Chapter contact sheets were used only to locate sections.
The source PDF and page images are not part of the app's public assets.

| Exercise | Included questions | Printed page | Independently checked answers |
|---|---|---|---|
| 4A | 1, 4, 10, 17, 19, 27, 34, 38 | 4.11 | -17, 7, 4, -4, 23, 13, 5, 1/5 (=0.2) |
| 4B | 1, 3, 7, 11, 13, 18, 19, 20 | 4.20 | 3, 4, -1/2, -6, 1, -1, 3, 1/10 |

All 16 printed answers on p. 4.40 agree. Original variables and values are retained. The displayed worked solutions are app-authored explanations using the textbook's operations; they are not claimed to be verbatim textbook solutions. Generated retries are labelled as generated, with no textbook attribution.

## Teaching and design

- Reuse LessonWorkspace and PresentationFrame, central English copy and the school's paper/navy palette. Use the existing Spectral, IBM Plex Sans and KaTeX typefaces.
- The equation is the main visual. Working is left aligned; a nearby explanation states the operation preserving equality.
- Use Next step / Previous step / Restart. Keep future steps and final answers out of the rendered lesson until revealed.
- Q18 explicitly shows (-1) times 2q and (-1) times (-5). Final substitution checks use the original equation.
- Practise accepts exact integers, fractions, decimals and an optional matching-variable assignment. No floating-point tolerance and no executable input.
- Track independent textbook solves on this browser only. Wrong numerical attempts, hints and revealed working make the current solve assisted. Invalid formatting can be corrected without penalty.
- Reset progress affects only this app. Practice remains usable if browser storage is unavailable.
- No new dependency, Firebase schema, production rules or deployment is required for this pilot.

## Review checklist

- Open the local app and try Exercise 4B Q18 in Learn.
- Reveal each step: -2q+5=3q+10, -5q+5=10, -5q=5, q=-1.
- Confirm both original sides evaluate to 7.
- In Practise, enter 1 first, then -1; inspect the sign feedback and assisted result.
- Try Exercise 4B Q7 with -0.5 and Exercise 4B Q20 with 2/20.
- Use a hint, reveal a solution, switch skill/question, try a generated question, and reload to check saved progress.
- Review phone width 360 px and Presentation mode at 1920 by 1080.

## Verification

Passed on 26/10/2026:

- 53 focused unit tests: all 16 originals, every authored intermediate equation, exact fraction/decimal parsing, invalid input and 1,600 generated retry cases.
- Nine Chrome scenarios passed in the final full run. They cover teacher reveals, answer hiding, exact answers, keyboard submission, local progress after reload, misconception feedback, invalid input, assisted/revealed scores, generated source labels, filters/history, corrupted storage, every textbook question and revealed solution at 360/390/1920 px, Projection mode and reduced-motion phone use.
- A final focused rerun verifies that a generated retry returns to the original, clearly labelled textbook method.
- Scoped ESLint and TypeScript passed. The full Next.js production build passed locally. This is build verification, not publication.
- Visually inspected screenshots in out/linear-equations/: practice-360.png, practice-390.png, practice-1920.png, learn-phone.png and projector.png. The last substitution was moved beside the working in projection, and mathematical text no longer inherits small label styling.

Local preview: http://localhost:3000/apps/linear-equations#practice/4b-18
Teacher example: http://localhost:3000/apps/linear-equations#learn/4b-18
If the preview has stopped, run npm.cmd run dev:all from this checkout. No sign-in or seed is needed. Use the existing preview if it is already running.

Recheck commands:
- npm.cmd exec -- vitest run tests/unit/linear-equations.test.ts
- npm.cmd exec -- playwright test --config playwright.linear-equations.config.ts
- npm.cmd exec -- eslint src/apps/linear-equations tests/unit/linear-equations.test.ts tests/e2e/linear-equations.spec.ts
- npm.cmd run build

The full textbook bank, dedicated Play games, class challenges and publication remain later phases. The current pilot is ready for local owner review.
