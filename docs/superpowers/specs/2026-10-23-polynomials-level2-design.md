# Level 2 Polynomials: demonstration app design

Date: 23/10/2026. Status: owner approved the integrated Q34(b) local prototype; implementation and verification complete. The remaining bank awaits pilot review. No publication requested or performed.

Review: an independent builder review found no material unanswered questions. A separate local check confirmed the inventory totals and the pilot/secondary polynomial coefficients, plus representative exact fractional substitutions and application calculations. Evidence: ignored `out/polynomials-source/audit-checks.json`. This is design/source validation, not browser or full-bank validation.

## Intent and confirmed requirements

Build an English-language F1 teaching app for every explicitly labelled Level 2 question in the supplied Chapter 10 textbook. The owner requested a practice app with the steps for each question, like Directed Numbers, and explicitly chose **step-by-step demonstrations only** in this chat.

Use the existing LSKC Mathematics site, chapter code `1A10`, and its school palette, KaTeX typography, lesson menu and Presentation mode. The user can select a textbook question and reveal the explanation one mathematical action at a time. Every completed working line remains visible.

The audited scope is **81 numbered questions / 158 parts or table rows**, including indices, vocabulary/table questions, substitutions, vertical operations, word problems, geometry applications and the blue-diamond questions inside Level 2. See `docs/polynomials-level2-source-audit.md` for the full inventory and counting rule.

No answer entry, marking, scores, games, random-question generation, custom-expression parser, accounts, saved classroom records or new challenge backend is part of this request. This follows the owner's explicit demonstration-only choice; additional features would be a separate decision.

## Approaches

1. **Recommended: one app in the existing website**, using a shared lesson player with specialist mathematical visuals. It matches the requested Directed Numbers experience and keeps all 158 entries in one searchable bank. The project already supplies navigation, maths rendering and projection support.
2. Separate apps for indices, simplification and multiplication would split one textbook chapter across several places and repeat the playback/navigation controls. This is not recommended for the stated task.
3. Independent HTML pages could provide a throwaway preview but would not automatically inherit the site's lesson menu and presentation controls. This is not recommended as the final delivery.

The owner confirmed demonstration-only behaviour and approved building the integrated Q34(b) prototype. The full-bank navigation described below is the subsequent phase, after pilot review.

## Screen and navigation

Proposed title: **Polynomials**. Proposed route: `/apps/polynomials`. Proposed pilot deep link: `/apps/polynomials#textbook:e=10D-34b`.

- Collapsible lesson menu groups the material by the five textbook banks: Exercise 10A, 10B, 10C, 10D and Revision Exercise 10. Show each bank's topic label and question count.
- The question picker supports bank, question number/part and a secondary skill filter. Preserve the original exercise order. Show book reference, printed page and the complete prompt.
- A dedicated teaching board shows the current mathematical action: e.g. distribution arrows, highlighted signed terms, index cancellation, substitution, vertical columns or a geometry diagram.
- Beside it on desktop, the growing worked solution shows each completed equation and a brief reason. The current line receives emphasis; previous lines stay readable without a disclosure/dropdown.
- Controls: Previous step, Next step, Play/Pause, Replay from start and Normal/Slow speed, plus Previous/Next question. Pause is the default. Answers start hidden.
- “View source question” exposes the selected source crop only. The final-answer key remains outside the initial visible question/accessible text.
- Direct links restore the selected question. Reload begins paused at its first frame. Changing questions cancels the old playback. Folding the sidebar or switching projection retains the current question and step.
- Previous/Next question traverses the active filtered list; controls disable at its ends. An empty filter shows a clear empty state. Invalid deep links fall back to the first covered question with understandable messaging.
- On phones the board precedes the worked solution, while the controls remain reachable. Long maths may scroll within its own container; the page itself must not overflow horizontally. Desktop/projection gives the maths most of the available width.

## Teaching methods

### Indices (10A and revision)

Highlight coefficients and identical variable bases separately. Show the sign calculation, index addition/subtraction and exact coefficient reduction in distinct actions. Use numerator/denominator cancellation where the denominator retains powers. A cancelled factor becomes 1. Simplify brackets before outer operations; otherwise multiplication/division proceeds left to right. Retain the nonzero restrictions from the original denominator. Finish with positive indices as in this chapter.

### Terms, degree and ordering (10B)

A signed term moves as a unit. Like terms share an explicit variable/index label and visual pattern; colour alone is not the explanation. Show `ab = ba` when relevant, but never combine `ab²` with `a²b`.

For total degree, show the sum of all variable indices within each term, then take the maximum. For ascending/descending powers of a named variable, sort only by that variable, leaving the other variables in its coefficient. Q19's table reveals term count, constant and degree as separate actions within each selected row.

### Addition and subtraction (10C and revision)

Follow the textbook sequence: remove brackets, group like terms, combine coefficients, then arrange if requested. Each bracket removal is a distinct teacher action. A minus before a bracket changes every enclosed term's sign; show its effect on the complete bracket. Nested brackets start inside. Preserve a separate step for cancellation to zero.

For printed vertical operations, keep aligned columns and missing-term placeholders, with a companion equivalent horizontal explanation if useful. Never silently replace the requested vertical operation with only an answer.

### Multiplication (10D and revision)

Show distribution arrows from the active factor to each term. One action highlights the factor pair; the next reveals its signed product. Retain the surrounding expression and brackets so every displayed equality is valid. A binomial square is first rewritten as a repeated product, including both cross terms.

Expand before grouping like terms. Preserve an outside minus until the complete expansion is enclosed and ready for subtraction. For three factors and “hence” questions, reuse the previous result visibly.

### Substitution, applications and diagrams

Substitute with brackets around negative values, evaluate powers, then products and sums. Keep rational numbers exact and use stacked fractions. For word problems, reveal the formula/model before the algebra and show units and a written conclusion.

When part (b) depends on part (a), a direct link to (b) begins with a teacher-controlled recap of the result from (a); it does not expose (b)'s final answer. Show comparison evidence for yes/no conclusions.

Include clean diagrams for the triangle perimeter, rectangle, L-shaped squares, quadrilateral and cuboid. Highlight only the lengths/faces involved in the current step. The L-shaped perimeter includes its two inner edges. Revision Q55 uses the two given right angles and diagonal AC; a drawing alone does not establish extra equalities. Diagrams are schematic; algebraic dimensions and given relations determine the solution.

## Pilot for approval: Exercise 10D Q34(b), p.10.35

Question: expand and simplify `2x² − (3x + 4)²`, arranging terms in descending powers of x. Printed answer: `−7x² − 24x − 16`, p.10.52.

| Stage | Displayed working | Reason / visual |
| --- | --- | --- |
| Start | `2x² − (3x + 4)²` | Prompt only; final answer hidden. |
| 1 | `= 2x² − [(3x + 4)(3x + 4)]` | Write the square as a repeated product. |
| 2 | `= 2x² − [3x(3x + 4) + 4(3x + 4)]` | Distribute each term in the first bracket. |
| 3a | Highlight `3x × 3x` inside the product working | Keep the minus outside; identify the active pair before revealing `9x²`. |
| 3b | Highlight `3x × 4`, then reveal `12x` | Preserve the positive sign. |
| 3c | Highlight `4 × 3x`, then reveal `12x` | Make the second cross term explicit. |
| 3d | `= 2x² − [9x² + 12x + 12x + 16]` | Complete all four products; partial product annotations are not presented as incomplete equalities. |
| 4 | `= 2x² − (9x² + 24x + 16)` | Combine like terms inside the bracket. |
| 5 | `= 2x² − 9x² − 24x − 16` | Reverse all three signs when removing the subtracted bracket. |
| 6 | `= (2 − 9)x² − 24x − 16` | Group the x² terms and combine their coefficients. |
| 7 | `= −7x² − 24x − 16` | Simplify; descending powers already satisfied. |

The product highlights/reveals above are individual clicks in the player. Exact animation duration and spacing are builder choices. Motion must explain the operation; reduced-motion keeps the same mathematical stages with static highlights.

Secondary regression example for the pilot: 10C Q23(b), `(4x−7)−(−2x²+3−8x)+(5x−2)`, gives `2x²+17x−12`. This checks subtraction sign reversals independently of square expansion; it is not a second full UI scope before the first review.

## Content and correctness architecture

- Store immutable question records with stable ID, bank, number, part, source/answer page, prompt, task kind, skill tags, requested ordering variable/direction, dependencies and denominator restrictions.
- Transcribe printed final answers independently of the authored steps. Store exact expressions/values in a validation-friendly form. Preserve equivalent mathematical answers without losing the task's required ordering.
- Author deterministic walkthroughs, using small reusable helpers for routine transformations. Specialised question types receive explicit steps/visual data. A general arbitrary-expression solver is not required.
- Each step records its valid mathematical state, short reason, active terms/factors and visual instruction. Product substeps may reveal annotations without adding a new equation line until that line is complete.
- Use exact rational coefficients and exact polynomial/monomial comparison for checking equalities. Also verify the requested final ordering, missing/zero terms, units, degree and conclusions. Numerical spot checks alone are insufficient.
- Existing Directed Numbers rational utilities may be reused only after checking their interfaces and applicable cases. Do not force polynomial expressions into its number-only parser.
- All UI copy and shared teaching-reason templates belong in `src/lib/copy.ts`. Source-specific prompts, formulae and mathematical records live with the question bank. KaTeX renders all maths.
- Proposed source folder: `src/apps/polynomials/`; add its registry entry and thumbnail with F1, topic `1A10`, strand `number-algebra`. Reuse `LessonWorkspace`, `PresentationFrame` and `<Math>` without altering their public behaviour.
- No new dependency is anticipated. Read the installed Next.js guide before implementation. Preserve existing unrelated Congruence edits and current copy changes.

## Delivery phases and review

1. **Source/design phase (this review):** identify every Level 2 question, document the teaching methods, independently check representative tricky answers, and review this design.
2. **Local pilot after approval:** build the Q34(b) demonstration and verify its mathematics, Previous/Next/Play/Pause/Replay behaviour, answer hiding, touch/keyboard access and phone/projector layout. Stop for owner review with a running local preview and clear instructions.
3. **Full bank after pilot review:** transcribe, independently verify and implement all 158 entries; preserve every question reference, part dependency and diagram. Stop for local review after full validation.
4. **Publication only when requested:** use the existing authorised site/project and verify the live route. This conversation has not requested deployment.

Local preview uses the existing demo Firebase emulators. The new app itself is pure client-side and needs no sign-in or Firebase writes. Do not change production, rules, environment configuration or dependencies as part of the design phase.

## Acceptance criteria

- An inventory check proves 81 numbered questions and 158 unique entries with no gaps or duplicates, matching the audited ranges and nonuniform part counts.
- Every prompt and final answer is checked against a legible source render. Every authored equation preserves exact value, and each final output satisfies the requested order/units/interpretation.
- All entries open, render valid KaTeX, start with answers hidden and can reach their complete checked solution. Required prior-part context appears in the correct order.
- Browser checks cover the major question types, nested/successive divisions, sign changes, fractional substitution, parameter coefficients, binomial squares, zero cancellation, vertical operations and diagram applications.
- Playback stops at the end; Previous and Replay restore the right visuals; question/filter changes cancel stale timers; reload/deep links and sidebar/projection changes behave as specified.
- Keyboard focus, touch targets, screen-reader answer hiding and reduced-motion are checked. Inspect actual screenshots at 360/390 px phone widths, a short landscape phone, ordinary desktop and 1920×1080 projection. Active maths and controls must remain readable/reachable.
- Run focused mathematical tests, browser checks, scoped lint, TypeScript, production build and `git diff --check`. Broaden regressions only for shared components that actually change. Static checks alone do not establish the teaching interactions work.

## Status of decisions

Confirmed by owner: all Level 2 questions from the specified chapter; demonstration-only behaviour like Directed Numbers; proceed with the integrated Exercise 10D Q34(b) prototype and show a local preview.

Completed pilot: `/apps/polynomials#textbook:e=10D-34b`, 15 teacher-controlled advances, eight valid working lines, separate pair/result reveals, sign-first subtraction, source crop and shared projection controls. All 1,059 unit tests and 11 browser scenarios pass; production build, TypeScript and scoped ESLint pass. Desktop, phone and projection screenshots were inspected. Independent review found no material implementation issues; its timer-test observation was resolved with a paused virtual clock and an active speed-change check.

Owner approved the pilot and explicitly requested the full chapter rollout. All 158 entries and full-bank navigation are now implemented and verified. All 169 focused mathematical tests and all 21 final browser scenarios pass, including every complete demonstration. Source comparisons, crop review and independent application review are complete. The isolated production build and TypeScript/scoped lint checks pass.

Current local preview: `http://localhost:3007/apps/polynomials#textbook:e=10D-34b`. Verification details, isolation rationale and restart instructions are in `docs/polynomials-full-bank.md`. Publication remains a separate owner decision.
