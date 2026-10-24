# Surface Area Studio design

Status: approved for local pilot implementation. Date: 23/10/2026. Owner instruction: “Proceed with your judgement; skip further design questions.”

## Intent

Help F1 students see why the total area of a right prism's lateral faces is the perimeter of its base multiplied by its height. Let the teacher capture a clear picture at any reveal step for classroom explanation and notes.

The user chose integration into LSKC Maths with textbook presets and image export. Source: `1A09_Area and Volumes.pdf`; full inclusion inventory is in `docs/surface-area-source-audit.md` (54 numbered practice/exercise entries, five worked examples and Activity 9.3).

## Approaches

1. **Integrated Surface Area Studio — chosen by the user.** One reusable lesson with textbook presets, existing fullscreen presentation and English interface. It stays consistent with the school's other teaching tools and is available in F1 / 1A09.
2. **Standalone offline HTML app — considered.** Convenient without a connection, but separate from the existing lesson navigation and site maintenance. Not selected.

## Teaching interaction

The main canvas is the lesson. Desktop: large prism and unfolding area, with a compact step/calculation rail. Phone: diagram first, controls underneath. Use the school paper/navy theme, one amber active highlight and quiet fill variations. Face numbers, line patterns and labels also establish correspondence, so colour is not the only cue.

Sequence, controlled by Previous / Next / Reset:

1. **Identify the bases.** Show the two congruent parallel faces and mark the prism height H between them. The base can face sideways.
2. **Trace the perimeter.** Highlight one boundary edge at a time; collect its length into P. Distinguish the trapezium/triangle's own altitude from H.
3. **Cut and open.** Detach the bases, mark one lateral seam, and unfold the joined lateral faces into a row of rectangles. A slider allows pausing and reversing the unfolding; buttons provide the same endpoints for keyboard use and reduced motion.
4. **See one rectangle.** Keep internal face boundaries visible and show the total width P and common height H. Hover, click or keyboard-select a face to match its original base edge to its rectangle. The calculation builds from individual rectangles to (a + b + …)H = PH.
5. **Add the bases.** Reveal B + B separately and then the total PH + 2B. The two base diagrams sit separately beside the strip; do not imply an overlapping or invalid physical net.

The teacher may hide or show dimensions, face labels and calculations independently. Answers start hidden. Zoom/fit affects only the camera, never the mathematical lengths. Reset restores the selected example and first step.

## Capture and export

- A Clean diagram mode hides menus/controls and keeps the chosen diagram, visible labels and currently revealed working on a white background for screenshots.
- Download PNG exports the same visible teaching state at high resolution, without app controls; Download SVG provides a sharp scalable alternative.
- Export choices: current stage or a single labelled before/after panel containing the solid and final lateral strip. Do not reveal a hidden answer in either export.
- Default export width: 2400 px PNG, white background, with a small source reference. No scanned textbook artwork in the export.

## Pilot and rollout

**Phase 1: one working example for local review.** Implement Example 9.11, p.9.27, with all teaching controls, unfolding and export. This is a trapezium with parallel sides 5 and 8 cm, perpendicular separation 4 cm and remaining sloping edge 5 cm. Prism height H = 13 cm. The lateral strip has widths 5, 4, 8, 5 cm, total P = 22 cm; lateral area = 286 cm²; each base = 26 cm²; total = 338 cm². Match these source values exactly. Stop for classroom review after the pilot, following the project's phase workflow.

**Phase 2: approved pattern across the chapter.** Populate the audited 54 question entries and five worked examples, with filters by section and geometry. Keep prerequisite volume steps where needed. Group records with several solids/subparts without inflating the question count. Use source-linked presets rather than an unconstrained shape editor. Add the activity's simple rectangular prism as a beginner demonstration.

Full chapter support includes convex and concave polygon bases, holes, open faces and wetted surfaces. Joined cubes require a separate exposed-face view: this is explicitly an exception to applying one PH formula to the whole object. A valid complete lateral strip may have several components when there are holes or omitted faces; never draw missing material to force one rectangle.

Before each preset is marked complete, inspect the source page, record all givens, verify its arithmetic against the printed answers, and check its face count/boundary order. The audit is a source inventory, not a claim that all presets already exist.

## Mathematics and content rules

- Closed right prism: lateral area = PH; total area = PH + 2B.
- Open objects: sum only the faces physically present. A missing lateral face is not equivalent to a missing base.
- Through-hole: sum inner and outer perimeters for lateral area, subtract the hole from B.
- Wetted tank area: count bottom and submerged walls; exclude the water surface.
- Composite joined cubes: sum exposed faces, subtract both copies of each contact area.
- Keep unknown dimensions symbolic until the teacher reveals their derivation. Do not label a base altitude as the prism height.
- Use textbook-supplied rounded areas where provided, with source precision retained.
- Keep all UI English, use the existing mathematical notation component for equations and clear vector labels in diagrams.

## Technical constraints and builder decisions

- Proposed route `/apps/surface-area`, registered under F1, topic code 1A09. New client component under `src/apps/surface-area/`, thumbnail and a separate central copy block.
- Reuse `PresentationFrame` and existing lesson controls as appropriate. No new backend or Firebase writes. No deployment in this phase.
- Use SVG with explicit polygon geometry and deterministic unfolding, rather than adding a 3D package. Model coordinates must preserve edge lengths while unfolding. The builder chooses projection/camera details and fold interpolation, but must verify endpoints and face rigidity.
- Export from the diagram's SVG representation. Any mathematical text included in exported SVG/PNG must render correctly without depending on unsupported external fonts or HTML-only overlays.
- No new dependencies are planned. Read the installed Next.js documentation before implementation.
- There are unrelated uncommitted Congruence changes in this checkout; preserve them. Add a new PLAN.md section without rewriting existing entries, and append the new copy/registry entries carefully.
- The builder decides component boundaries, geometry utilities, internal identifiers and export plumbing. No quiz, competitive mode, login flow, cylinder extension or arbitrary polygon drawing tool in this design.

## Acceptance checks

1. Pilot matches the source: four lateral rectangles, two trapezium bases, P=22, H=13, B=26, lateral=286 and total=338.
2. Selecting any side/face shows correct correspondence in the solid and unfolded strip; hidden edges and labels remain unambiguous.
3. The unfolding can pause/reverse; labels and face dimensions remain consistent. Reduced motion provides immediate deterministic stages.
4. Previous/Next/Reset, dimension and working visibility, zoom/fit and exports work with mouse, touch and keyboard.
5. PNG and SVG files are actually downloaded, reopened and visually checked. Check hidden-answer behaviour, units, cropping, labels and white background.
6. Inspect 360/390px phones and 1366px/1920px classroom views, including Presentation mode, with no overflow or clipped controls.
7. Focused independent geometry tests, browser checks, lint, TypeScript, production build and whitespace checks pass. Report any unrelated pre-existing failures separately.
8. Give the owner a working local preview and example exported image, then stop for pilot review before expanding the question bank.

Approved scope: build the Example 9.11 pilot locally; retain the full audited chapter as the subsequent rollout scope.

## Design review

A fresh builder review found no material unanswered choices and independently confirmed the pilot geometry and the initial inventory arithmetic. A subsequent full-chapter keyword and answer-page cross-check added Exercise 9B Q35 and MC Q11 to the source inventory (54 numbered entries in total). Both use the wetted-surface behaviour already specified above.
