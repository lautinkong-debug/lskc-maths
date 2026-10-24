# Surface Area Studio: full chapter verification

Date: 23/10/2026. Local route: `http://localhost:3004/apps/surface-area`.

## Delivered coverage

The chapter bank contains all **54 numbered surface-area questions, five worked examples and Activity 9.3** from the source audit: **60 presets and 69 selectable variants**. Consolidation Q2 has two solids; Exercise 9B Q18 has all nine positive ordered integer triples, representing permutations of two cuboid shapes. Required volume, unknown-dimension, cost and judgement subparts are retained.

The three source ledgers document every final answer: `surface-area-lessons-verification.md`, `surface-area-exercises-verification.md`, and `surface-area-revision-verification.md`. Intermediate practice working is independently authored using the chapter's methods; it is not claimed as a printed worked solution. Activity dimensions are explicitly illustrative, and unspecified base shapes are marked schematic.

The selector supports section and solid-type filters, text search, source page references and links of the form `#question-id/variant-id`. Selecting another preset resets the stage, unfolding and answer visibility. Source givens remain available before solutions. Unknowns stay symbolic until final working is revealed.

## Geometry and classroom behaviour

- Polygon boundary segments retain their lengths throughout unfolding; the flat widths sum to the base perimeter. Concave boundaries include every segment.
- Hollow prisms unfold outer and inner walls separately. Base areas subtract the hole.
- Open boxes retain one base. The file holder instead omits its actual sloping lateral face and keeps both trapezium bases; only retained widths are used in its early working.
- Wetted-area examples include the bottom and submerged walls. MC11 uses only the added wall band, without caps.
- Joined cubes separate into cube nets; two copies of each internal contact patch are removed. The app does not apply one PH formula to the composite.
- Source altitudes and right angles are visible. Teacher controls retain face correspondence, hide/reveal working, dimensions, face labels, zoom, clean view and projection.
- SVG and 2400-pixel-wide PNG exports include the selected current/comparison view and only the working revealed by the teacher. Source givens are independent of answer visibility.

## Executed checks

- **82 focused unit checks passed:** 77 bank/geometry checks and five original pilot checks. Coverage includes all 69 geometries, 60-entry inventory, exact Q18 solution coverage, rigid unfolding, omitted faces, holes, wetted areas, cube contacts and source-given/symbolic-working regressions.
- **19 browser scenarios passed:** all 69 variants, selection/filter/deep-link fallback, final answers, partial unfolding, source givens, absence of caps on the new wet band, original-face correspondence, keyboard/touch/reduced-motion controls, hidden answers, clean view and 360/390/1366/1920px layouts.
- Actual downloads were read from Chrome's temporary artifact folder and reopened as images. Tests validate PNG dimensions/signature, standalone SVG colour resolution, and the absence/presence of exported working. Cases include notched, open, hollow, wetted, composite and inverse-dimension examples.
- After visual refinements, all 13 affected export/layout cases passed again, followed by the final two measurement-label/layout rechecks. Images were inspected for the inner-hole labels, actual missing side face, newly wetted band, complex notches, joined cubes and source givens. Projection uses readable full-width diagrams with vertical scrolling when the complete figure exceeds its viewport; exports contain the complete figure.
- Scoped ESLint, TypeScript, production build and `git diff --check` passed. The build used the existing dependencies and environment configuration.
- Fresh independent review identified three material issues: hidden essential givens, incomplete symbolic perimeter sums, and extra caps on the wet band. All were fixed with regression coverage. Re-review found no material remaining findings and independently checked all 30 unknown-bearing variants and 47 intentionally blank source edge labels.

Evidence is in ignored `out/surface-area-bank-preview/` and `out/surface-area-preview/`. The original scanned textbook remains local in ignored `out/surface-area-source/`; app diagrams are reconstructed vectors.

## Release status

Local implementation only. No commit, push or deployment was requested or performed. Other tasks' workspace changes are preserved.

## Classroom usability correction (23/10/2026)

The owner's subsequent classroom review identified issues that the earlier checks did not cover: Next step moved when new lesson panels appeared, and the reconstructed diagrams were difficult to read. The earlier passing browser checks used locator clicks, which automatically followed the moving button. They therefore did not demonstrate a stable teaching workflow.

The reproduced desktop baseline placed the top of Next step at y=783, y=824 and y=1075 for the first three steps, with the third position offscreen. The browser then scrolled by 473 pixels to reach it. Baseline screenshots and measurements are saved in ignored `out/surface-area-classroom-fix/`.

Two agents were assigned as requested: an independent teacher reviewer and an implementation fixer. The navigation and Show working controls now occupy a persistent toolbar. Slider and face-control regions reserve their space, and the diagram frame stays fixed as stages change. New regressions click one unchanged screen coordinate through all five stages, forward and backward, on normal and projection layouts.

The prism uses opaque faces with ordered drawing and a consistent projection direction. Hidden faces no longer put their numbers through visible faces; a selected hidden face gets a dashed outline. Dimension callouts avoid face identifiers, named vertices are restored, and detached bases have their own space with explicit addition. The drawing is fitted to each stage inside the stable frame rather than being reduced to fit the complete motion envelope. Desktop and phone views use different proportions. Dense measurement keys and source givens are normal HTML text below the board; standalone images retain their own complete labels and givens.

The teacher reviewer inspected the repaired pilot, notched, hollow, open/file-holder, wetted-band and cube cases, including native 390px phone and 1920px projection screenshots. The final review reported no remaining material findings in that scope. Narrow panels intentionally omit crowded interior numerals; numbered face buttons and the selected highlight retain correspondence. Screenshots are in ignored `out/surface-teacher-review/targeted-final/`.

Actual image inspection also identified and repaired the base-caption gap and a wrapping regression that inserted spaces before unit superscripts. The export preserves text such as `338 cm².` exactly.

Final checks for the correction:

- **82 focused mathematical checks passed.** The question data and underlying surface-area calculations are unchanged.
- **29 browser scenarios passed in the final complete run**, including all 69 variants, all ten new classroom regressions, actual PNG/SVG downloads and reopening, responsive layouts, and existing keyboard/touch/reduced-motion controls. The new cases cover stationary clicks at 390/1366/1920px in normal/projection modes, stable diagram bounds, working reveals, restored vertex names, face/measurement collision checks, independent dimension visibility, and text clipping on 390/1366px diagrams.
- Scoped ESLint, formatting, TypeScript, whitespace checks and the production build passed. The local preview remains `http://localhost:3004/apps/surface-area`; no commit, push or deployment was performed.
