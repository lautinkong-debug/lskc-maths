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

## Status at initial local verification

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

## Production release (24/10/2026)

The owner explicitly requested publication to the maths website and Vercel. Commit `aa1d086954320684615a6b7e538f11e92caf7c18` contains only Surface Area Studio, its registry/copy entries, source audit and tests. It was pushed to the existing GitHub `main` branch and triggered the existing Vercel production project. Unrelated polynomial work remains local. The 82 focused mathematical checks passed again before live verification.

Vercel deployment `dpl_6f49YUsEuTyJM9ELBSyaJ5KTNgid` is Ready and aliases `https://lskc-maths.vercel.app`. Its clean production build and TypeScript checks passed. The public app-index entry links to the lesson; both routes return HTTP 200, all 60 presets are present, and the index/lesson audit records no browser errors or emulator requests. All 29 browser scenarios passed across the first run and a focused recheck: one initial navigation was interrupted by `ERR_CONNECTION_CLOSED` before the application loaded; that case passed when rerun. The checks include all 69 variants and actual PNG/SVG exports. Evidence: ignored `out/surface-area-release/`.

Visual inspection of the live 390px hollow-prism view identified an additional readability defect that the earlier checks missed: the outer/inner captions touched, and face numerals were taller than the shallow strips. A teacher reviewer and fixer were assigned to that final correction. Its publication verification is recorded separately below.

The focused correction wraps each boundary caption to the strip's available width and omits interior numerals when a strip is too short to contain them. It retains all numbered face buttons, selected-face highlights, source measurements, formulas and exported legends. The independent teacher review passed the native phone diagram, selected inner face and reopened standalone export. Three focused local browser scenarios passed: the new thin-strip regression (including current/comparison SVG downloads, selection and ordinary taller-panel numerals), existing representative-label clipping, and original-face correspondence. The production follow-up is recorded after publication.

### Perimeter lengths and detached-base spacing

The owner's next screenshot identified Revision Exercise 9 Q26 at Cut and unfold. Its six supplied 3 cm step lengths were hidden by the dense-diagram and partial-unfolding label gates. The two overall 9 cm lengths are calculated values and must remain unrevealed until the teacher reveals working. The detached-base B caption also overlapped the addition sign in the vertical desktop arrangement.

The repair exposes the supplied edge lengths through folding/unfolding and separates the base caption and addition sign without moving the diagram frame or navigation. Bounded leader callouts reserve space for vertex names, altitude measurements, face numbers, the height label and headings. Individual flat-strip widths are placed below the panels, separate from the whole-perimeter bracket above. When space is needed, the whole diagram is fitted uniformly and continuously through unfolding; width and height are never stretched independently.

An independent audit checks every prism at 390/1366px across folded, partly unfolded and flat views (816 views). Its first run found additional dimension collisions with headings, vertex names, altitude measurements and the height label. The bounded-placement rerun passed all 816 views. The strengthened final regression also requires individual widths to remain below the flat strips; all 816 views passed again with zero findings. Results are kept in ignored `out/surface-area-release/label-sweep.json` and `label-sweep-width-band.log`.

Three focused regressions cover the staircase at 390/1366/1920px through every step and 0/50/100% unfolding, B/operator separation across every prism with bases, and real current/comparison SVG and PNG downloads. They also check that the calculated 9 cm lengths appear only after final working is revealed, and that exported base captions remain inside the complete image. Review caught and repaired a pre-existing stage-2 comparison-height omission that clipped the bases. Independent teacher sign-off covers the staircase, Example 9.11, complex notches, hollow prisms and symbolic lengths on phone/desktop screens and exports.

### Final published verification

Correction `34f70bd92dd0b37302f9c4591cc28d8e863e6238` was built on the latest production parent `cacd1d12ebdb843a78f5d240c80df4bd705bb4bf`, preserving the concurrently published polynomial and similarity updates. Only six Surface Area source, test and verification files changed. The shared working tree and its other tasks' pending edits were preserved.

Vercel production deployment `dpl_GyANetZ6qCtf55deYvXY3ZMiiwk5` is Ready; the official `https://lskc-maths.vercel.app` alias and GitHub main revision were rechecked after publication. **All 14 affected live browser scenarios passed in 3.5 minutes**, including the strengthened **816-view sweep with zero findings**, source-given/revealed dimensions, every-prism B/operator spacing, stationary controls at 390/1366/1920px, face correspondence, and actual current/comparison PNG/SVG downloads and reopening. The public index and app return HTTP 200, all 60 presets are present, and Q26 displays exactly six given 3 cm labels. The independent live audit records no browser errors or emulator requests.

Final evidence: ignored `out/surface-area-release/live-final-layout-export.log`, `live-audit.json`, `live-desktop.png`, `label-sweep.json` and the `label-layout/` exported images. The 82 mathematical tests passed earlier in this release; the source bank and mathematical calculation functions were not changed by the label corrections.

### Ordered dimensions and visible water (24/10/2026)

The next classroom screenshot showed that avoiding text collisions alone did not make Exercise 9B Q24 readable: its flat-strip leaders were diagonal and the labels appeared scattered. Flat dimensions now retain exact horizontal alignment with their own panel centres and use a regular sequence of shared rows. Leaders remain vertical, with gaps where they would otherwise cross another label. Uniform fitting reserves enough room without changing panel proportions or moving the teaching controls. Source unknowns remain hidden until the teacher reveals working.

The three water presets now show water inside the full tank in the first two steps and in the original-solid reference. Depth brackets reach from the bottom to the waterline; the tank height has a separate measurement. The free water surface is explicitly excluded. Exercise 9B Q35 shows the tank after rotation, with its given 20 cm height and 16 cm × 12 cm bottom. Revision Q31 shows the original 40% level and submerged stones. MC11 shows the original and new levels, highlights only the newly wetted gold wall band, excludes the bottom from the increase, and marks its unspecified tank height/starting depth as schematic. Symbolic d/Δd remain unrevealed until working is shown. The unfolded strip uses the same wet surface colour, with H = d or H = Δd explaining the connection.

The independent teacher reviewer approved the reported crowded strip, phone/projector layouts and actual current/comparison exports. The reviewer independently reopened all three water comparison SVGs, checked the revealed 7.5 cm, 7.8 cm and 3 cm depths/rise, and confirmed the correct bottom inclusion/exclusion. Phone annotations were separated into stacked rows after the first visual review found an overlap.

The 82 mathematical unit checks, TypeScript and scoped ESLint passed. The strengthened layout sweep passed all 816 views, including transformed SVG text. New browser checks verify panel-centre alignment, vertical leaders avoiding text, full tank/waterline/bracket geometry, the four counted wet wall portions, excluded free surfaces, schematic values, source context and real PNG/SVG downloads. Evidence is in ignored `out/surface-area-release/ordered-dimensions/` and `water/`.

All 38 Surface Area browser scenarios passed across the complete run and the targeted recheck, including the 816-view sweep. The initial run of an older clipping test falsely flagged the rotated tank-height text because it used local, untransformed bounds; the test now transforms all four text-box corners into the canvas coordinate system, and its full representative-solid matrix passed. The other 36 scenarios passed in the complete run, covering all 69 variants, stationary controls, phone/projector layouts, source-given/revealed answers, actual exports and keyboard/touch/reduced-motion behaviour. Logs: `local-water-full.log`, `local-water-clipping-recheck.log`, and `label-sweep.json` in the ignored release evidence folder.

The final local production build passed compilation, TypeScript, all 20 generated pages and route optimisation (`local-water-build.log`). The release is prepared over the latest production tree with only the Surface Area implementation, copy, tests and verification document included; unrelated local work is preserved.

### Independent depth reveal (24/10/2026)

The owner requested the numerical water depth without showing the worked solution, so pupils can calculate the wetted area themselves. A separate Show water depth checkbox now appears beside the diagram controls for Exercise 9B Q35 and Revision Q31; MC11 uses Show water-level rise. It reveals only the height measurement, keeps full-working and other derived-dimension state separate, and applies to the live tank, unfolded strip, clean view and current/comparison PNG/SVG exports. Stage navigation preserves the choice; Reset lesson and a different preset clear it. The Dimensions switch continues to control measurement visibility.

Focused browser coverage checks all three values at phone/projector sizes, no surface-area answer or working leakage, stable navigation coordinates, clean view, switching/revealing/hiding working independently, reset/preset changes, absence of the checkbox on ordinary solids, and actual downloads reopened as standalone images. An initial clean-view test exposed duplicate navigation keys because water lessons repeat their first/final titles; the navigation now uses its fixed step indices and the entire depth-only workflow passes.

The final 10 focused browser scenarios, 82 mathematical checks, scoped ESLint, TypeScript and production build pass. Evidence: `depth-toggle-final-local.log`, `depth-toggle-unit.log`, `depth-toggle-build.log` and `water/depth-only-*` in the ignored release folder. The release changes only the depth control, its diagram/export state, repeated navigation keys, copy and regression/verification records.

### Independent base perimeter and base area (24/10/2026)

The owner additionally requested separate base-perimeter and base-area reveals without the worked solution or final surface area. Every prism now offers Show base perimeter and Show base area beside the existing controls. Each flag is independent of water-depth and full-working state; selections persist across steps and clear on reset/preset change. The live diagram, clean view and current/comparison image exports share a reserved value band, so toggling a value never changes the canvas proportions or moves the navigation. The source-given dimensions remain visible according to the existing Dimensions setting.

P is the complete base boundary length, including outer and inner boundaries for a hollow prism. B is the area of one base, with any hole removed. Prisms that do not add base area label B as not added; the open file holder additionally shows retained widths excluding its opening, avoiding an incorrect full-PH calculation. Joined cubes have no single prism base and do not show these controls. None of these reveals sets the diagram's solved state or releases other unknown dimensions, worked steps or the final area.

Rounded irrational perimeter values use an approximation sign. The initial three new browser scenarios passed, including all 408 prism views at 390/1366px and reopened water/hollow/open-holder image exports. The final focused run retains the revised approximation check alongside depth-reveal, navigation and export regressions.

All 13 final focused browser scenarios pass, including all 69 textbook variants, stationary phone/projector controls, separate base/depth reveals, resets, clean view and actual current/comparison PNG/SVG downloads. The 82 mathematical checks, TypeScript, scoped ESLint, whitespace checks and production build also pass. Evidence is in `base-values-final-local.log`, `base-values-unit.log`, `base-values-build.log` and the `base-values/` image/layout audit folder under the ignored release directory.
