# PLAN.md — LSKC Mathematics Department Website

Status legend: `[ ]` to do · `[x]` done. Work one phase at a time and stop for the owner's review at the end of each phase.

## Similarity two-agent bug audit (25/10/2026)

- Requested roles: an independent read-only bug finder and a separate debugger. Audited all 72 initial questions, first proof steps, vertex labels, equation fitting, game constructions, and triangle pose retention.
- Found one P2 defect: six current proof rows in Q19 and Revision Q33/Q38 were clipped on a 360 x 640 phone. The row fit, but the table heading used remaining height; the first revealed KaTeX equation also grew after its fonts loaded.
- Fixed only proof-panel visibility: align the current row and observe size changes while showing one step. Earlier-step history retains normal manual scrolling, with observer cleanup on mode and step changes. Textbook wording, proof order, reasons, and diagrams are unchanged.
- Verification: revised production build and TypeScript passed; scoped 90 Similarity unit tests passed; three browser regressions cover all six affected rows and deliberately delayed KaTeX fonts. Independent recheck passed four fresh browser contexts, 16 timed snapshots, and 198 proof-row states with zero browser errors. Seven focused integration checks passed for history, Previous/Reset, part boundaries, phone landscape, and controls/game pose retention. Scoped formatting, lint, and whitespace checks passed.
- The first immediate-alignment fix passed warm-font checks but failed cold-load verification; the released version observes late row resizing. Before/after evidence remains under ignored out/similarity-bug-audit/.
- Scoped GitHub/Vercel publication is authorized by the existing Similarity Studio release request. Exact release and live-verification results are recorded in out/similarity-bug-audit/release.json.


## Similarity readable vertices and current proof parts (24/10/2026)

- [x] Owner requests smaller, nearby vertex names, a 2:1 graph/solution split, and point-form givens in the top-left. Replace equal desktop halves with 2:1, retain phone layouts and larger phone labels, split independent givens into separate bullets, and keep internal vertex labels near their points while avoiding edges, other labels and drag rings. Reserve the actual italic font height; verify the reported Revision Q33 figure.
- [x] Restrict classroom history to the current printed part/subpart or triangle comparison. Reaching part (b) hides part (a); going back restores its revealed rows. Retain the earlier-step toggle and exact textbook statements, reasons and order. Fit long complete equations to the narrower statement column.
- [x] Reproduce the original history defect on production. Verify 21 focused unit checks, lint/formatting and production builds. The 31-scenario release run passes 30 and finds an italic F bounding-box collision; correct the bounds and pass all 17 affected proof/label/correspondence scenarios. Verify all 72 question choices and condition lists, Q19 equation widths at 1366/1920px, phone/landscape layouts, Q33 label-to-vertex proximity, ring/edge clearance and part navigation. Inspect projector and phone screenshots in ignored `out/similarity-parts/`.
- [x] Prepare a scoped release on the current production branch, preserving concurrent Polynomial releases and unrelated local work. The owner previously authorised GitHub/Vercel publication; record the resulting commit, deployment readiness and live checks in ignored `out/similarity-parts/release.json`.


## Polynomial demonstrations publication (24/10/2026)

- [x] Owner approved publication of the reviewed complete Level 2 bank: 81 numbered questions / 158 demonstrations across 10A–10D and Revision Exercise 10.
- [x] Prepare the release from current origin/main using the verified demonstration snapshot. Preserve the published Surface Area and Similarity updates; ongoing game work stays in its original workspace.
- [x] Verify release integration: 1,306 unit tests, 20 browser scenarios, production build/TypeScript, scoped ESLint and whitespace checks pass; all 17 app/data files match the reviewed snapshot.
- [ ] Publish the exact commit and verify the live question bank, controls, source images and phone/projection layouts.


## Similarity question conditions and persistent proof history (23/10/2026)

- [x] Add a fixed top-left Given conditions panel to both classroom boards for all 72 questions. Use question premises rather than proof deductions; check diagram-only entries against the printed question crops. Retain mathematical italics and // notation. Keep it collapsible, initially compact on phones and short screens.
- [x] Keep Show earlier steps enabled through selecting a line, Next, Previous and Reset. Selecting an older line retains all previously revealed rows and highlights only the selected step. Scroll within the proof panel to keep the active line visible.
- [x] Verify the isolated production build and TypeScript, scoped ESLint, 25 focused unit tests, desktop/phone/landscape layouts and all 72 question choices. Preserve concurrent Polynomial and Surface Area work outside this release. Browser and release evidence: ignored out/similarity-givens/.

## Similarity complete proof rows (23/10/2026)

- [x] Reproduce the owner's missing Q19 continuation on the live site and a failing regression. Invisible textbook alignment boxes pushed the remainder of an equation out of view; the classroom solution rail was limited to 470px.
- [x] Owner requests equal graph/solution halves and each calculation in one row. Use equal columns on wide classroom screens, prevent equation wrapping, and join the five invisible-alignment continuations to their complete equations without changing the raw source, visible symbols, reasons or order. Q19 now has 26 complete rows; its similarity conclusion is row 16.
- [x] Verify 1,055 unit tests, scoped lint/formatting and the isolated production build. The initial ten focused preview checks pass, including Q19 at 1366/1920px, phone/landscape layouts and correspondence interactions.
- [x] Verify all 22 production-build classroom/proof/correspondence scenarios: 21 pass initially; replace the navigation test's obsolete hard-coded step number with its actual calculation and confirm its recheck passes. Every Q19 equation fits at 1366/1920px; all 72 question choices, phone/landscape layouts, history, reset and corresponding parts pass. The correction is authorised for the existing GitHub main/Vercel production site; retain exact-commit live verification in ignored `out/similarity-proof-layout/live-audit.json`.
## Similarity diagram clarity and correspondence (23/10/2026)

- [x] Owner explicitly requests the published Congruent Triangles pattern for Similarity Studio and authorises GitHub/Vercel publication. Preserve all 72 source questions, literal solutions and existing games. Use Q19 as the representative pilot.
- [x] Regenerate the 72 source crops at four times their previous width and height using lossless WebP. Keep original PDF, crops, givens and geometry unchanged; keep the teaching background neutral.
- [x] At a printed triangle-similarity statement, derive correspondence from vertex order. Offer one side or angle pair at a time: amber focus, navy/red triangle identities, equal-angle arcs, and corresponding-side arrows/ratios without equal-length ticks. Retain readable current statement/reason and a compact phone selector; highlights follow moved/rotated/reflected copies.
- [x] Verify the Q19 pilot, shared vertices, no premature conclusions and the full source bank. All 1,054 unit tests and all 56 browser scenarios pass against the isolated production build, including the existing games and all 72 literal solutions. Scoped ESLint, formatting and the production build pass. Fresh review also verifies coincident angle labels and deselected moved copies; inspect 1920px projection, 390px portrait and 844px landscape screenshots. Evidence: ignored `out/similarity-clarity/production-browser.log`, `unit.log`, `resolution-audit.json` and correspondence screenshots.
- [x] Publish implementation `57f75c096dad8f5bfdf1d094b5986ebbfe7776ab` to GitHub `main`. Vercel production deployment `dpl_D5HgaSErme82zzGc19HoEPofaCqt` is Ready on the official site. All six focused live browser scenarios pass: all 72 question choices and their printed first steps/reasons, Q19 side/angle mapping and 4164px source image, transformed and deselected copies, overlapping labels and 1920px projection / 390px portrait / 844px landscape layouts. Visually inspect live screenshots; the current conclusion, reason and pair selector remain visible. Official route returns HTTP 200. Evidence: ignored `out/similarity-clarity/live-browser.log`, `live-audit.json` and correspondence screenshots. This completion record changes documentation only.


## Surface Area Studio — design review (23/10/2026)

- [x] Inspect the owner's `1A09_Area and Volumes.pdf`: screen all 52 pages, OCR the full chapter, inspect relevant diagrams and answer pages, and catalogue 54 surface-area practice/exercise entries plus five worked examples and Activity 9.3. Record inclusions, exceptions and independently recalculated teaching cases in `docs/surface-area-source-audit.md`.
- [x] Owner chose an integrated LSKC Maths app with textbook presets and image export. Prepare `docs/superpowers/specs/2026-10-23-surface-area-studio-design.md`, including perimeter-to-strip unfolding, separate base-area reveals, clean PNG/SVG exports, local Example 9.11 pilot and subsequent chapter rollout. Fresh builder review found no material open choices.
- [ ] Obtain approval of the written design, then build and verify the Example 9.11 pilot locally at `/apps/surface-area`. Stop for owner review before the full question bank. No publication requested.

## F1 Level 2 polynomial demonstrations — source/design review (23/10/2026)

- [x] Read the supplied `1A10_Manipulation of Simple Polynomials.pdf`: survey all 53 pages, then inspect every Level 2 question page and the answer pages. Coverage: 10A Q21–32, 10B Q19–30, 10C Q20–35, 10D Q26–42 and Revision 10 Q33–56 — 81 numbered questions / 158 parts or table rows. Full inventory and verification limits: `docs/polynomials-level2-source-audit.md`.
- [x] Owner confirmed step-by-step demonstrations only, like Directed Numbers. Prepare the proposed integrated app, teacher-controlled working/visuals and Q34(b) square-expansion/sign-reversal pilot in `docs/superpowers/specs/2026-10-23-polynomials-level2-design.md`.
- [ ] Owner reviews the proposed design; then implement and verify the local 10D Q34(b) pilot before expanding the bank. No polynomial app code or deployment is included in the source/design phase.
- [ ] After pilot review, transcribe and independently verify all 158 entries and their authored intermediate steps; cover tables, vertical operations, word problems and diagrams as well as routine expressions. Validate phone/projector layouts and playback locally.

Decision: the textbook provides final-answer keys, not full worked solutions for every Level 2 question. Author and verify intermediate working using the chapter's demonstrated methods. Keep the source PDF/renders in ignored `out/polynomials-source/`; preserve unrelated Congruence work. Publication remains a later owner decision.

## Clear diagrams and conclusion correspondence (23/10/2026)

- [x] Owner requests sharper original diagrams and visible side/angle correspondence at each congruence conclusion, with restrained colours. Pilot Revision Exercise 5 Q35, part (a). Preserve literal solution lines and reasons.
- [x] Render all 66 native textbook crops at four times the previous width and height, with lossless WebP output (3.38 MB in total). Verify every image dimension, all 80 PDF drawing streams and the unchanged original PDF hash. Retain source coordinates and all givens. Clip adjacent prose from Q35's teaching diagram and display the background in greyscale; its full Question tab keeps the original colours.
- [x] At each recognised congruence statement, use its vertex order to offer three side pairs and three angle pairs. Show one pair at a time, with the same amber focus on both members; keep triangle identity navy/red and earlier evidence neutral. Preserve literal solutions. Use large angle labels, pin the current statement/reason, and provide a compact pair selector on phones and short screens.
- [x] Verify the Q35 pilot and shared E vertex before applying the pattern across the bank. All 1,047 unit tests and all 31 production-build browser scenarios pass, including every question and the existing games. Scoped ESLint, formatting and compilation pass; repeat the four correspondence layout checks after the final background-colour change. Evidence: ignored `out/congruence-improvements/clarity-local-browser.log`, `resolution-audit.json` and `correspondence-*.png`.
- [x] Publish implementation `37721d2112c66383b79844a4251f94b3b00f4ae3` to GitHub `main`. Vercel production deployment `dpl_9WzHjtMysTKynXQk9z4o74cT8rTE` is Ready on the official site. All five focused live browser scenarios pass: all 66 question assets/reveals, Q35's exact side/angle mapping and 4072px source image, extracted triangles, and 1920px projector / 390px portrait / 844px landscape layouts. Visually inspect the live screenshots; the current conclusion and reason remain visible with the pair selector. Evidence: ignored `out/congruence-improvements/clarity-live-browser.log`, `clarity-live-audit.json` and `correspondence-*.png`. This completion record changes documentation only.

## Congruence teaching interactions and games (21/10/2026)

- [x] Owner supplied the consolidated Similarity Studio brief and asked to apply it, including games and publication. Preserve the approved 66 triangle-only Quick Practice / Level 2 questions and literal textbook solutions.
- [x] Design: retain the paper/navy classroom and shared collapsible lesson menu. Use Quick Practice 5.14 (AAS, overlapping triangles) as the interaction pilot. Add transformation-aware evidence with angle/side visibility and pair dismissal, rigid magnetic alignment, horizontal/vertical reflection and merged corresponding vertex labels. Keep camera zoom separate from lengths.
- [x] Verify Quick Practice 5.14, then apply the data-driven evidence layer to all 66 questions. Retain source wording, clean diagrams and current-step statement/reason layout. Marks follow rigid transforms; hide/restore pairs, right-angle squares, merged labels and snap alignment pass the pilot browser checks.
- [x] Add five three-round condition activities (SSS, SAS, ASA, AAS, RHS) and a twelve-round mixed challenge containing unequal AAA and ambiguous SSA examples, with large diagrams, corrective feedback and focused proof reveals. Keep camera Fit/Reset independent of triangle poses and sizes.
- [x] All 1,042 unit tests, scoped ESLint, formatting and the production build pass. All 27 browser scenarios pass against the local production build, including every source question, all five games and mixed rounds, real touch, rigid transforms, camera controls, current-step evidence, hidden pairs and 360/390px portrait, 844px landscape and 1366/1920px desktop layouts. Three shared-menu browser checks also pass. Visually inspect the screenshots in ignored `out/congruence-improvements/`.
- [x] Publish implementation `29f259444d3c4c29eb8009e3d3c619347379b4c7` to GitHub `main`. Vercel production deployment `dpl_3cy9ZZTnnKfH8ggRZYszAFy3kjdC` is Ready on `https://lskc-maths.vercel.app/apps/congruence`. All 27 live browser scenarios pass, including all 66 questions, five condition activities, twelve mixed rounds and phone layouts. The Git webhook did not create a deployment, so start the existing project's production build from that exact GitHub commit through the Vercel API. Evidence: ignored `out/congruence-improvements/live-browser.log` and proof screenshots.
- [x] On 23/10, resume the final visual correction: retain navy background and white text when hovering a game's primary button. Production compilation, formatting and a focused desktop/phone browser check pass; only this CSS rule and this verification record differ from the fully checked release.

## Chapter 5 congruent-triangle practice (20/10/2026)

- [x] Owner approved integration and publication to GitHub and Vercel. Target the existing `lautinkong-debug/lskc-maths` production branch `main` and Vercel project `lautinkong-4501/lskc-maths`, route `/apps/congruence`.
- [x] Owner requested the Similarity practice format for Chapter 5 and confirmed triangle practice only. Cover Quick Practice 5.1–5.17; Exercise 5A Q15–27, 5B Q19–30, 5C Q12–20; Revision 5 Q22–35 and Q38: **66 questions**. Exclude the polygon sections and revision polygon questions.
- [x] Register **Congruent Triangles** under F2 / 2A05 at `/apps/congruence`. Reuse the full-window practice classroom with the source diagram, extracted triangles, searchable bank, teacher-controlled statement/reason steps and phone layout. Keep separate diagram-control and question tabs.
- [x] Preserve size during dragging, turning, reflection and vertex alignment. Apply camera zoom to the whole comparison. Custom triangles and selection changes retain existing sizes and poses; later printed comparisons select their relevant shapes. Use the stated givens and proofs because source figures are not to scale.
- [x] Visually check the supplied questions and solution pages, transcribe intermediate working and reasons, and validate all geometry references and KaTeX expressions. Keep source PDFs in ignored `tmp/congruence/`; publish only selected question crops. Redraw the board figures for 5A Q27 and 5C Q12 to clear the publisher footer; retain their untouched question crops. Record the solution's Quick Practice 5.1 page-reference typo separately.
- [x] All 986 unit tests, scoped ESLint, TypeScript and production compilation pass. All 15 browser scenarios pass against the local production build: library entry, all 66 question assets/reveals, current-step marks, mouse/touch/keyboard transforms, stable custom geometry, proof-pair changes, saved view state, and 1366/1920px desktop plus 360/390px portrait and 844px landscape layouts. Visually inspect the source redraws and desktop/phone screenshots in ignored `out/congruence-preview/`.
- [x] Owner requested removal of the diagonal school watermark. Regenerate all 66 crops from a derivative PDF with only the native `STFALSKC` watermark Form cleared. Verify the other drawing streams on all 80 pages and the original PDF hash are unchanged; retain mathematical content and publisher footer. The regeneration script now preserves this setting. Reload the owner's local browser and visually verify Quick Practice 5.14 in both the original-diagram and full-question views; evidence: ignored `out/congruence-preview/no-watermark.png`.
- [x] Keep each reason on one horizontal line beside its statement: let the reason column take its content width instead of constraining it to 32%. Verify Revision Q34 step 14 on desktop and phone. Fresh release checks pass: 986 unit tests, all 15 browser scenarios, scoped ESLint, formatting and production build.
- [x] Publish implementation `b31c906daac5c82c420162871b8008b211cae6c7` to GitHub `main`. Vercel production deployment `dpl_ELiPDJAcuk6Z1NymENp46epcYo5j` is Ready and owns `https://lskc-maths.vercel.app`. The live browser suite passes 14 scenarios initially; the remaining image assertion ran before decoding completed, so make it wait for the actual image width and rerun it successfully. All 15 scenarios are verified on production, including all 66 questions and desktop/phone proof rows. Seven public routes return HTTP 200, and all 66 published WebP checksums match the checked watermark-free local assets. Evidence: ignored `out/congruence-release/live-audit.json`, `live-proof-desktop.png` and `live-proof-phone.png`. This final record and image-wait correction do not change the application or Firebase.

Local review: open `http://localhost:3001/apps/congruence#qp5-14` while the local development server and demo Firebase emulators are running. Use **Next step**, switch to **Extracted triangles**, then drag or turn a triangle; **Question bank** exposes section/search filters. To restart, run `npm.cmd run emulators` and `npm.cmd run dev -- --port 3001` in separate terminals. No sign-in is needed for this practice tool. The owner has approved publication.

## Textbook practice classroom layout (20/10/2026)

- [x] Apply the approved games layout to all 72 textbook questions: a full-window classroom with larger original/extracted diagrams, the current printed solution line and its reason alongside, and persistent Previous/Next/Reset controls. Keep earlier lines available on request.
- [x] Put diagram adjustments and the question/source in adjacent tabs. Preserve the same mounted lesson, triangle poses, step progress, zoom and snapping when switching views or visiting the games. Retain the existing inline studio and question bank through Back to studio.
- [x] Keep the diagram pinned above the panel on portrait phones; use compact columns on landscape phones. Independent review identified landscape height and proof-scroll issues; reserve a usable current-step area and reset its scroll on every step transition.
- [x] Preserve source solutions, proof order, reasons, fractions and mathematical highlights. All 77 focused maths/source checks pass; all 72 classroom question choices open correctly. Long-proof inspection covers 81 successive lines across five representative questions.
- [x] Production build and formatting pass. The full 51-scenario browser suite passed 50 checks and exposed an inline sidebar landmark conflict; after that correction, all 11 affected classroom, navigation and sidebar scenarios pass on the final production build. The complete source audit covers all 72 printed solutions, fractions, reasons, question images and step highlights. Keep the game exit callback stable so direct question links close its dialog reliably.

Approved release target: GitHub `lautinkong-debug/lskc-maths` main and the existing Vercel site, route `/apps/similarity#ex8c-19`. Verify the deployment is Ready and run the seven classroom scenarios on the official address after publishing. No dependencies, backend, Firebase rules, environment or textbook source records changed.

## Similarity games classroom layout (20/10/2026)

- [x] Owner requested larger triangles, controls and proof beside the graph, and a more attractive game experience. Use the linked gamedev-skills game-ui-ux and game-feel guidance for responsive framing and restrained action feedback. Retain the school navy/crimson palette, textbook terminology and existing mathematics.
- [x] Open missions in an accessible full-window classroom, size triangles to the available canvas, and keep Explore/Solve controls and the current proof step in an adjacent rail. Keep earlier proof lines available on demand. Portrait phones retain a visible graph above an independently scrollable control panel. Dock the primary action, preserve keyboard focus on exit, and close cleanly when navigating to textbook practice.
- [x] All 16 game browser scenarios pass against the production build, covering all nine missions/twelve mixed rounds, 1024/1366/1920px layouts, 360/390px phones, projection, focus/exit, touch/mouse/keyboard transforms and proof/history. All 35 maths checks, scoped ESLint, TypeScript and production compilation pass. Independent review led to larger phone text, retained help, and a compact short-phone mission selector with dismissible feedback; measurement labels stay in frame and the action remains visible. Evidence: ignored `out/similarity-preview/classroom-*.png`.

Approved release target: GitHub `lautinkong-debug/lskc-maths` main, existing Vercel `lskc-maths`, route `/apps/similarity#games`. Confirm the production deployment is Ready and verify the live classroom flow after the push. No backend, Firebase, environment or dependency changes.

## Approved Similarity Detective games (20/10/2026)

The owner approved all three games and a mixed challenge, integration into Similarity Studio, and publication to GitHub/Vercel. Reference: gMath's three interactive similarity-condition activities, inspected in-browser. Build original activities with the existing school palette and large mathematical diagrams.

- [x] Add a Games mode alongside the retained textbook practice. Include Angle Match (AAA), Ratio Repair (3 sides prop.), Find the Hinge (ratio of 2 sides, inc. ∠), and a 12-round mixed evidence challenge.
- [x] Use Explore → Solve → Explain: manipulate accurate triangles, select the supporting angle/side evidence and condition, receive specific feedback, then reveal a statement/reason proof one step at a time. Include insufficient-information cases and the non-included-angle misconception.
- [x] Preserve direct triangle movement, rotation/reflection, clear labels, mouse/touch/keyboard access and projection readability. Show stacked fractions. Keep progress local with no timer or new backend. Separate temporary number-input drafts from valid geometry; show equality markings only when corresponding angles are equal.
- [x] Verify the model with 35 new unit tests; all 880 unit tests pass. Check all nine guided missions and twelve mixed rounds, partial/incorrect evidence, typed answers, real touch/mouse/keyboard transforms, saved completion and member-specific proof highlights. Inspect desktop and 390px phone diagrams and statement/reason tables. The 28 existing browser scenarios also pass, including the 72-question source audit.
- [x] Production build, TypeScript, scoped ESLint and formatting pass. Publish implementation commit `b66072fd1ea6d9a1a0ef494dfbc1793fbcfecfe7` to GitHub `main`; Vercel deployment `dpl_74rNdco7hPZCebbDLR6bLnDX86qS` is Ready on `https://lskc-maths.vercel.app/apps/similarity#games`. All 11 game browser scenarios also pass on that official address, including every mission/mixed round, sequential typing, touch gestures, proof focus and saved progress. The live menu has no browser console errors. Evidence: ignored `out/similarity-preview/games-proof-phone.png` and `games-proof-desktop.png`. This completion record changes documentation only. No Firebase data, rules, environment or dependency changes.

## Similarity one-line reveals and clear angle symbols (20/10/2026)

- [x] Start every solution with no revealed lines or matching marks. Next step reveals one printed line and highlights only its geometry; Previous step and selecting an earlier line rewind the reveal, and Reset solution returns to the blank start. Keep the literal textbook equations, stacked fractions and reason column unchanged. Move the optional Show all steps control into Diagram marks.
- [x] Narrow a final angle answer or named side ratio to the references on that line. Preserve the angles used as numerical substitutions in an angle-sum calculation. Keep all-marks exploration available explicitly, separate from the current step.
- [x] Lay out angle symbols together, reduce arc spacing on small triangles, and use external leader lines when text cannot fit clearly inside. Reserve actual vertex/paired-side label boxes, preserve upright text and mark interactions, and include external labels in Fit triangles.
- [x] All 42 similarity unit checks, scoped ESLint, TypeScript and production build pass. Inspect Q17 original and moved angle symbols: no label overlaps, and enlarged-view labels remain within the frame.
- [x] All 28 browser scenarios pass against the production build, including the 72-question source-order/reason audit, sequential reveals, current-line geometry, transformed symbols, phone controls and existing snapping. Release through the existing approved GitHub/Vercel project. Evidence: ignored `out/similarity-preview/q17-angle-spacing.png`, `q17-angle-copies.png` and `textbook-step-desktop.png`.

## Literal similarity solutions and step highlights (20/10/2026)

- [x] Replace generated proof summaries with visually checked transcriptions of all 72 Level 2 / Quick Practice solutions from the supplied PDF. Preserve printed reading order, ratio direction, intermediate calculation lines, alternative solutions and blank reason cells; use stacked KaTeX fractions. Keep the original solutions PDF outside the published repository.
- [x] Make every printed line selectable. Highlight source angles, sides, figures and points on the original diagram and relevant movable copies, including known right angles and equivalent angle names on the same ray. Keep existing transforms when highlighting or exposing another comparison; add previous/next, reveal, show-all and reset controls, with calculation reveals controlled by the teacher.
- [x] Preserve the printed Revision Q25(b) angle-label typo and explain separately that ∠ACE should read ∠DCE. The transcription itself remains unchanged.
- [x] Independent source checks, all 72 source records, strict KaTeX parsing, valid geometry references, literal Q19 / QP8.8 regression checks, TypeScript and production build pass. Browser checks verify source order, fractions/reasons, focus overlays, right-angle marks, later comparison selection and phone fit.
- [x] All 29 unit checks and 25 Chrome scenarios pass against the production build, including the full 72-question sweep, transformed highlights, source order, mobile layout and existing drag/snap controls. Prepared for release through the approved GitHub/Vercel project. Evidence: ignored `out/similarity-preview/textbook-step-desktop.png` and `literal-proof-390.png`.

## Similarity textbook proof layout and vertex spacing (20/10/2026)

- [x] Use the supplied textbook solutions as the layout reference. The resupplied PDF has the same SHA-256 as the source already used for the question bank. Render each similarity proof in a statement/reason table, with stacked mathematical fractions, equal-ratio deductions and the textbook criterion beside the conclusion. Keep each condition clickable and distinguish conclusions drawn from given similarity. Apply fraction rendering to prompts and revealed working as well.
- [x] Place vertex names in clear space around graph edges on the original and manipulation boards, including rotated, reflected and overlapping copies. Preserve paired names and reserve space for paired side callouts. Fit the original diagram with its complete reference figure and labels so the outer Q17 triangle is retained.
- [x] Sixteen mathematics/formatting checks, scoped ESLint and the production build pass. Fraction coverage includes all 72 questions, numbered vertices, radicals, grouped denominators and fractions of fractions; `//` remains the parallel sign. Inspect desktop and phone proof tables and Q17 label positions.
- [x] All 25 final local Chrome scenarios pass, including loading all 72 questions, paired labels, snapping, touch gestures, Q17 edge clearance, complete source-diagram fitting and desktop/phone proof columns. Evidence: ignored `out/similarity-release/format-*.log` and `out/similarity-preview/textbook-proof-*.png`, `q17-vertex-spacing.png`. Release through the previously approved GitHub/Vercel workflow.

## Similarity textbook proof terminology (19/10/2026)

- [x] Owner supplied the textbook's conditions and corrected the displayed terminology. Use **AAA**, **3 sides prop.**, and **ratio of 2 sides, inc. ∠** in proof headings, conclusions and explanatory notes. Internal criterion keys continue to control the same required marks; no SSS/SAS abbreviations are shown to students.
- [x] Scoped ESLint, TypeScript and production build pass. Four existing browser scenarios pass with the textbook labels. Inspect the two-side/included-angle proof on desktop and a 390px phone, including the longer conclusion and revealed consequence notes; phone layout has no horizontal overflow. Release this correction through the already approved GitHub/Vercel integration. Evidence: ignored `out/similarity-release/terminology-*.log` and `out/similarity-preview/textbook-criterion-phone.png`.

## Similarity proof beside the diagram (19/10/2026)

- [x] Owner requested a visible explanation beside the current diagram, then asked to hide angles/sides that are not used in that proof. Show the question-specific reason panel by default, alongside an enlarged diagram on desktop and stacked on phones. Include matching symbols, reasons for each condition and the final ordered similarity statement; clicking a step highlights its corresponding marks. Keep calculation answers under their existing reveal controls.
- [x] Default to proof conditions for every proof: AAA shows only three angle pairs; SSS only three side ratios; SAS only the included angle and its two adjacent sides; squares retain both equal angles and proportional sides; counterexamples show the unequal ratios. Given-similarity questions are explicitly labelled as givens. Filter both boards, ratio summaries and source backgrounds; teachers can reveal other measurements with Angles & sides or Show lengths & ratios. Reset and changing comparisons restore the appropriate proof filter.
- [x] Verify 13 focused mathematics tests, scoped ESLint and the production build. All 23 local Chrome scenarios pass, covering all 72 activities, proof criteria, independent reveals, touch/mouse manipulation, snapping, zoom, lesson-menu state and phone layout. Seven affected scenarios pass after increasing proof text for projection; all three proof scenarios also pass after keeping Q19 vertex names clear of the angle marks. Inspect the final desktop and phone screenshots. Evidence: ignored `out/similarity-release/proof-*.log` and `out/similarity-preview/proof-*.png`.
- [x] Publish implementation commit `a20f72d1bb40e48a8d84d85261eed58ce851c4dc` through GitHub `main`. Vercel production deployment `dpl_55H5m9XG9MA1bvFw3BNykmcFv74Q` is Ready at `https://lskc-maths.vercel.app`. All three new proof scenarios pass on the official address: criterion-specific default marks, the adjacent enlarged-diagram proof with step/reveal controls, and phone/multiple-pair behaviour. Release evidence: `out/similarity-release/proof-deployment.json`, `proof-live-tests.log` and final screenshots. No Firebase data, rules or environment changes.

## Approved Similarity Studio release (19/10/2026)

- [x] Owner explicitly requested integration into the Mathematics Department website and publication to GitHub and Vercel. Include all 72 Level 2 / Quick Practice activities, source and extracted-shape manipulation, matching angles/right angles/side ratios, independent reveal controls, snapping, paired vertex/side labels, camera zoom/pan, and the shared lesson-menu toggle.
- [x] Confirm the existing GitHub repository `lautinkong-debug/lskc-maths`, production branch `main`, and Vercel project `lautinkong-4501/lskc-maths`. Similarity Studio is listed under F2 / 2B08 at `/apps/similarity`; the Q19 deep link is `/apps/similarity#ex8c-19`. Keep local Firebase emulators separate from the existing production settings; no Firebase data, rules or environment changes.
- [x] Resolve the release build's Google font URL parsing failure (Next.js #99114) by bundling the same IBM Plex Sans and Spectral Latin WOFF2 files with their SIL licences and source/hash record. Load through `next/font/local`; preserve the existing CSS variables and font weights without adding dependencies. Fresh checks: all 815 unit tests, scoped ESLint, TypeScript and the production build pass.
- [x] All 20 browser scenarios pass against the local production build, covering the department library, all 72 questions, phone touch, shared lesson menus, matching marks, snap/paired labels and classroom magnification. Correct the automated phone drag to emit continuous touch movement; its instantaneous CDP jump suppressed Chrome's next click. No application gesture workaround was needed. Inspect the enlarged paired-side render; evidence is in ignored `out/similarity-release/` and `out/similarity-preview/`.
- [x] Publish implementation commit `0740e0a309ff833520bef951f5e3ebf830da22fe` to GitHub `main`. Vercel deployment `dpl_7sU8EFysQmRpEp1GRDsepPzf21wF` is Ready in production, and its aliases include `https://lskc-maths.vercel.app`. Verify HTTP 200 on Home, the app library, Similarity, Directed Numbers, Statistics and Mistakes Book, and all 72 WebP question assets. The live desktop/390px phone audit reports no browser errors, emulator requests, font failures or horizontal phone overflow; inspect the saved screenshots.
- [x] All 20 Chrome scenarios also pass on the official production address (5.7 minutes), including rendering, proof reveals and assets for every question, real mouse/touch manipulation, snapping and readable paired labels, zoom/pan, projection, independent angle/length controls, the F2/2B08 library link, and shared lesson-menu state in Directed Numbers and Statistics. Release evidence: `out/similarity-release/live-browser-tests.log`, `live/audit.json`, `deployment.json` and screenshots. Publication is complete; this final record changes documentation only.

## Approved website and lesson layout release (17/10/2026)

- [x] Owner explicitly requested deployment to GitHub and Vercel. Include the homepage, shared navigation, app library, Directed Numbers and Statistics redesigns reviewed below. Exclude the separate Similarity work in progress.
- [x] Refresh the release checks: 803 maths/teaching tests, scoped ESLint, production compilation and TypeScript checks pass. The previous layout review passed 26 teaching/layout browser scenarios and seven site/navigation scenarios. Publish through GitHub `main` to the existing `lautinkong-4501/lskc-maths` project, then verify the production pages and teaching flows. No Firebase data, rules or production configuration changes.
- [x] Published commit `a9638024d569c91f65c161669e33ac2e731d228f` on GitHub `main`; Vercel production deployment `dpl_AS9mWcBPctRWvj467z5rYwaonGM3` is Ready at `https://lskc-maths.vercel.app`. All 29 live Chrome scenarios pass. Home, app library, Mistakes Book and both lesson routes return HTTP 200; unauthenticated challenge joining returns HTTP 401. Screenshot checks report no browser errors, horizontal overflow or emulator requests; the homepage uploads finish loading. Bounded Vercel error-log query returned no entries. Evidence: ignored `out/production-ui-release/`. Separate Similarity files remain local and are not part of this deployment.

## Similarity teaching studio — source audit, Q19 pilot and complete bank (17/10/2026)

The owner requested planning, then a tested Exercise 8C Q19 pilot (p. 8.32), followed by all Level 2 questions and Quick Practice. The local implementation below was approved for publication on 19/10/2026.

- [x] Audit both supplied PDFs. Scope: 14 Quick Practice, 8A Q12–22, 8B Q16–26, 8C Q10–19, 8D Q11–20, Revision 8 Q23–38: 72 questions, including polygon questions.
- [x] Design: retain a source diagram beside a manipulation board; extract labelled shapes; independently move, rotate and reflect them; preserve scale unless the teacher explicitly enlarges. Reveal correspondence and proof only on request. Use English UI, responsive controls, keyboard alternatives, existing school theme and presentation mode.
- [x] Pilot Q19: mathematically exact geometry, selectable △AFE / △ABC, quarter turns, reflections, dragging, separate scale control, vertex correspondence, complement-angle proof and area 27/2 cm². Check browser interaction and transformation invariants before extending the bank.
- [x] Add all 72 source questions with original question crops, traced shape presets, source page references and checked teaching notes; support custom triangle selection and polygon comparisons. Clearly distinguish schematic source outlines from measured mathematical geometry.
- [x] Review revisions: drag shapes directly on the original diagram, with turn/flip controls, keyboard alternatives, an enlarged view and restore-original positions. Keep the original figure as a faded reference after moving. Use mathematical italic names and vertex letters in questions, shape controls, diagrams and working.
- [x] Verify four maths/catalogue checks and six browser scenarios across the final runs, including rendering and revealing all 72 questions, direct mouse and touch dragging, keyboard movement, reset, hidden answers, phone fit, projection, custom triangles and polygons. Scoped ESLint and the production build pass. Inspect screenshots in ignored `out/similarity-preview/`. Preview: `http://localhost:3000/apps/similarity#ex8c-19`.
- [x] Review revisions: add vertex rings on both boards to rotate and uniformly resize the selected shape about its centre. Offer combined, rotation-only and resize-only gestures plus keyboard alternatives; ordinary shape dragging still moves the whole shape. Rotations/reflections do not alter lengths, and resizing does not deform angles or side ratios.
- [x] Add optional graph proof overlays with matching angle arcs and proportional-side highlights. Explicit source metadata distinguishes AAA, three proportional sides, two proportional sides with an included angle, given similarity, squares and polygon counterexamples. Let the teacher isolate each condition and choose the relevant pair in multiple-pair questions; never mark a distractor or custom shape as proven similar. Keep original-length values separate from the scale of a dragged copy.
- [x] Replace footer-obscured interactive figures in Quick Practice 8.2, Quick Practice 8.5 and Exercise 8B Q23 with clean vector lines, italic vertex labels and the original given lengths/angles. Keep the full supplied question crops in the source disclosure.
- [x] Move the shared Hide lesson menu control onto the sidebar itself and place Show lesson menu beside the active lesson after collapsing. Apply through LessonWorkspace to Similarity, Directed Numbers and Statistics; preserve teaching state and keyboard focus, with the existing phone menu controls.
- [x] Review verification: six maths/catalogue tests and 14 browser scenarios pass across the final runs. Coverage includes actual mouse/touch vertex gestures, rigid transformations and uniform scaling, all 72 questions, AAA/SSS/SAS/given/counterexample markings, clean source givens, hidden answers, desktop/phone layouts, and sidebar state in all three teaching apps. Scoped ESLint, TypeScript and production build pass. Updated screenshots are in ignored `out/similarity-preview/`.
- [x] Owner approved publication on 19/10/2026; release tracked above.

Review refinement (18/10/2026): matching marks now appear by default on both the original and extracted diagrams, independently of the explanation panel. Equal angles share their arc pattern and label; source-verified right angles carry a square and 90° label through moving, turning, reflecting and uniform scaling. All corresponding sides are highlighted, with a readable original-length ratio key (Q19: AF/AB = FE/BC = EA/CA = 2/3). Keep proof conditions distinct from consequences of similarity, support hiding marks, and display parallel notation as `//` in question text and explanations. Eight geometry/proof tests and all 15 browser scenarios passed across the final runs, including all 72 questions, both transformation boards, touch/phone fit, hidden explanations, counterexamples and shared sidebar state. Scoped ESLint, TypeScript and the production build passed. Screenshot evidence remains in `out/similarity-preview/`.

Design decisions: mathematical similarity is established from givens and proof, not from a visual fit. Reflections keep text upright. Original labels remain attached to vertices. The Q19 pilot uses an exact model; other source tracings preserve the textbook drawing and are explicitly not to scale. Persist only browser-local teaching state; no new dependencies, Firebase records or rules.

Further classroom controls (18/10/2026): all 72 questions now have annotated comparison figures, including constructed teaching diagrams for 8A Q12–13, which have no printed figures. Expand source-checked numerical angles, right-angle squares, lengths and ratios; unknown ratios remain symbolic. Polygon counterexamples show equal angles alongside unequal ratios. Independent Hide angles and Hide lengths & ratios controls apply to both diagrams; click or tap one mark to hide its corresponding pair, and Restore hidden marks brings it back. Keep clean reference outlines when printed labels are hidden. A drag starting on a mark still moves the shape; a tap hides it.

Snapping is on by default and can be switched off. Releasing near a documented similar triangle aligns the corresponding vertices through position, rotation and uniform scale, within 22 screen pixels, 10 degrees and 13 percent of the target scale. It never silently reflects or deforms a figure, never uses a distractor/custom shape/counterexample as a target, and respects the rotation-only and resize-only modes. Source tracings can still differ slightly; a visual fit remains separate from the proof. Ten maths/metadata tests, 18 browser scenarios, scoped ESLint, TypeScript and production build passed. Browser coverage includes all 72 questions, mouse snapping on both diagrams, phone touch snapping and dragging, independent and individual hiding, restoring marks, and phone layouts. Evidence is in `out/similarity-preview/`. Local preview restarted with demo emulators at `http://localhost:3000/apps/similarity#ex8c-19`; no publication requested.

Paired vertex names (18/10/2026): when documented corresponding figures overlap after snapping or matching, replace duplicate vertex text with one colour-coded label per vertex, e.g. A ↔ A, F ↔ B and E ↔ C. Keep letters italic and the arrow upright, draw labels above both figures and within the board, and restore separate names when figures move apart. Apply to both the original and manipulation diagrams, including three aligned shapes. Shared original vertices alone and counterexamples never trigger paired names. Eleven maths tests and five focused browser scenarios pass, including real mouse and phone-touch snapping, separation, reset, multiple shapes, polygons and proof overlays; scoped ESLint, TypeScript and production build pass. Inspected desktop and phone screenshots in `out/similarity-preview/`. Local preview only.

Paired sides and classroom magnification (18/10/2026): overlapping documented pairs show one callout per corresponding side with both names and available original values, e.g. FE = 2 ↔ BC = 3, followed by Ratio 2:3. Unknown lengths remain symbolic; partly known values are retained. Suppress the duplicate individual side text. Tapping a callout hides its matching condition on both diagrams; dragging it moves the active triangle, preserving pointer capture when the paired overlay disappears. Both diagrams now have a 50–400% zoom slider, +/−, Fit triangles, Reset view and background panning. Snap and side-length matching fit the figures and callouts into view. Enlarge original diagram fits the selected figures and uses up to 74vh/860px, including projection mode. Camera adjustments never alter shape poses, source lengths or ratios; the board keeps a stable physical size during camera changes. Twelve maths/metadata checks and all 19 browser scenarios pass, including all 72 questions, touch, paired-label hiding/dragging and camera invariants; the final focused projection check also passes. Scoped ESLint, TypeScript and production build pass. Inspected enlarged source, paired-side and phone screenshots in `out/similarity-preview/`. Local preview only.

Source qualifications: Quick Practice 8.14 uses the pictured upright orientation, and Exercise 8D Q15 uses a bounding rectangle aligned as shown. Their conclusions are not claims about every possible rotation. Exercise 8B Q23 retains its original crop in the source disclosure; its interactive figure is redrawn with the complete givens. Exercise 8A Q12–13 have no printed diagrams.

## Directed Numbers and Statistics lesson layouts — local review (15/10/2026)

- [x] Add a shared lesson workspace with an active lesson menu, collapsible desktop rail, accessible phone menu and a wider teaching area. Folding the menu keeps the active lesson mounted; projection automatically uses the full teaching width.
- [x] Refresh Directed Numbers teaching boards, the Number line / Owe choice, example collections and textbook selectors. Move Add & subtract step controls above the activity and keep them sticky. Preserve bird turns, teacher-controlled signs/highlights, magnitude reveals, optional steps, exact fractions and working columns.
- [x] Redesign Statistics around the frequency table and chart, with data preparation in an expandable panel. Group teacher/sharing tools and saved activities; refresh learning headers, vocabulary cards and visual panels. Preserve all eight activity modes, data edits, teaching reveals, correction, exports and projection.
- [x] Verify 26 browser scenarios: 14 existing teaching regressions, three new layout/state/navigation scenarios, the department table/chart projection check and eight bird checks. Inspect desktop, 390px phone and 1920×1080 projection screenshots. Scoped ESLint, TypeScript, production build and standalone Statistics build pass. Review screenshots: ignored `out/lesson-preview/`.
- [x] Owner approved publishing the Directed Numbers and Statistics layouts together with the website redesign on 17/10/2026. Release to the existing GitHub `main` branch and Vercel production project; keep unrelated Similarity work out of this release.

## Canvas UI / Mathematics studio redesign — local review (15/10/2026)

- [x] Inspect the requested `DavidHDev/canvas-ui` repository. It has no Codex skill; install its dependency-free Grid WebGL engine as local application source, preserving its MIT + Commons Clause licence and upstream revision. No new npm dependencies or experimental browser flags.
- [x] Redesign the homepage with a larger editorial heading, interactive parabola card, three learning routes and visible app previews. Keep teacher-edited content and app visibility settings. Refresh shared navigation, the app library with a filter sidebar, Mistakes Book discovery styling and lesson headers; preserve lesson controls and fullscreen presentation.
- [x] Retain keyboard graph movement, add graph reset, skip navigation, accessible filter labels, responsive phone layouts and a reduced-motion / no-WebGL fallback. Load the Canvas effect only on the homepage and only when motion is permitted. Keep animation idle until pointer interaction.
- [x] Verify 14 Directed Numbers / Statistics browser scenarios plus seven site/navigation/filter/fallback scenarios. Correct filter accessible names and the development overlay obscuring the phone menu. Check the teacher content editor, real WebGL context without GL errors, 375/390px phone fit and 1920×1080 projection locally. No browser page errors in the preview pass; lint, TypeScript and local production build pass.
- [x] Save review screenshots under ignored `out/studio-preview/`; local website and demo Firebase emulators run at `http://localhost:3000`. The preview uses demo data, so production uploads are not displayed here.
- [x] Owner approved publishing the redesign to GitHub and Vercel on 17/10/2026.

## Combined Directed Numbers and Statistical Charts release (12/10/2026)

- [x] Owner explicitly approved publishing both updates together. Confirm the existing `lautinkong-4501/lskc-maths` Vercel project, linked to `lautinkong-debug/lskc-maths` on production branch `main`.
- [x] Verify the combined snapshot: 785 maths/teaching checks, 14 browser scenarios on the integrated local site, scoped ESLint, whitespace checks and the full production build pass. Check that application files have not changed since verification.
- [x] Publish approved commit `27d54e9` from GitHub `main` to Vercel production deployment `dpl_BKmcWkN3sKouhrH66EuVCsT255ok` (`https://lskc-maths.vercel.app`). All 14 combined Chrome scenarios pass on the official site, covering both teaching methods, the Quick rule, sign/magnitude and optional-step reveals, columns, Statistics calculations and correction/retry. Home and both lesson routes return HTTP 200; unsigned challenge joining returns HTTP 401. No Firebase data or rules changes. Previous production: `dpl_HwSRqy64KjotwYrJH1iPPfnUfWqD`.

## Directed Numbers magnitude visuals and reusable cases — local review (12/10/2026)

- [x] Add a teacher-controlled Quick rule button to the Sign & magnitude toolbar, shared with simple textbook practice. Reveal an optional navy/purple reminder: same signs add magnitudes and keep the common sign; different signs subtract the smaller magnitude from the larger and keep the larger magnitude's sign. Show the current expression as addition (including the opposite of a subtracted operand), with zero/cancellation reminders. Keep the current step and explanation method, and pause playback when toggling.
- [x] Verify two focused browser scenarios covering all eight sign/operation pairs, exact fractions, zero, hidden-by-default behaviour, stable controls/progress, both explanation methods and textbook availability. Review desktop and phone renders. Scoped ESLint, whitespace checks and the local production build pass. Local preview only; Vercel publication still requires owner confirmation.

- [x] Review revision: before asking sum/difference, show a case-specific everyday cue and its magnitude connection (owe/have less or more, settled, unchanged, or crossing zero). Treat crossing zero separately so a final magnitude is never incorrectly described as smaller. Add symbolic debt-note, wallet, receive/pay and cancelled-debt pictures inside the existing amount cards.
- [x] Verify 232 maths checks and four focused browser scenarios, including the supplied −2.6 + 0.9 example, hidden calculations until Next step, all sign/operation cases, exact fractions, method persistence, replay/reduced motion and phone fit. Inspect desktop/phone pictures and working; scoped lint, whitespace checks and the local production build pass. Still local pending owner approval.

- [x] Review revision: highlight newly revealed result signs in red/yellow while optional written steps are hidden; the next click fills the magnitudes in the same row. Add a Number line / Owe choice in Sign & magnitude and simple textbook practice, retain progress when switching and remember the choice across cases/questions. Show one explanation at a time.
- [x] Simplify the money explanation to a starting balance, transaction and teacher-controlled question. Ask about sum or difference before revealing it; connect two debts/two credits to addition, and paying off or offsetting amounts to subtraction. Keep decimal/fraction notation and reduced-motion support. Check the actual rendered maths remains visible after switching methods.
- [x] Verify 211 maths checks, six focused browser scenarios including all eight money sign/operation combinations and zero cases, projector/phone rendering, same-row sign highlights, method persistence, and existing optional-step/column behaviour. Scoped lint and local production build pass. Preview: `http://localhost:3000/apps/directed-numbers#sign-magnitude`; choose Owe and use Next step. Keep local for owner review.

- [x] Review revision: remove the extra magnitude bar. Add money-account analogies for receiving money, recording borrowed debt, payments and repaid/cancelled debt, with a consistent credit-minus-debt model. Reveal the outcome sign before its amount; retain decimal/fraction notation and reduced-motion support.
- [x] Review revision: with optional lines hidden, reveal evaluated result signs first, then fill the numerical magnitudes on the same row on the next click. Reserve highlight height to prevent vertical movement. Verify 211 maths checks (including all 180 textbook answers), displayed compact-equation values, all eight money sign/operation cases, cancellation, phone fit, replay, compact Q38(a), and large-column regressions. Local production build passes; publication still awaits owner approval.

- [x] Replace the long magnitude explanation with a replayable bar animation: align and remove the smaller magnitude for opposite signs; join magnitudes for same signs. Keep exact decimal/fraction notation, separate sign reveal, and a static completed view for reduced motion.
- [x] Add 36 reusable cases in four groups: ordinary integers, signed integers, decimals, and fractions. Use consistent pairs 20/30, 0.2/0.3, and 2/5 with 3/5; include plain and signed-bracket variants for decimals and fractions.
- [x] Add one toolbar toggle to hide/show all optional written lines in textbook practice. Keep sign arrows, highlights and results; remove redundant clicks, preserve progress, and carry the preference between questions.
- [x] Verify all 180 textbook answers and compact-progress mapping, all 36 presets, animation/replay/reduced-motion and phone fit, optional-toggle persistence, and existing large-column layout. Five focused browser scenarios passed across the final runs; scoped ESLint, TypeScript, local production build, and diff whitespace checks passed.
- [x] Owner approved Vercel publication together with the Statistical Charts update on 12/10/2026.

## Statistical Charts extra practice and animated correction (12/10/2026)

- [x] Add lower-boundary walkthroughs from lower limit minus half the recording step and upper boundary minus class width, retaining the same graph and red operand/result highlights. Use formal Class limit / Class boundary / Class mark / Class width card headings and remove the repeated Class interval sentence.
- [x] Verify nine maths checks and fifteen focused browser scenarios, scoped lint, diff whitespace and the full local build. All six calculation views fit the 1920×1080 projector; phone layout has no horizontal overflow or browser errors. Keep local pending approval.
- [x] Add Class interval as a fifth right-hand card and include it in word playback. Add four calculation walkthroughs on the unchanged graph: class mark from limits or boundaries, and upper boundary from upper limit plus half the recording step or lower boundary plus class width. Include Play/Pause, Previous/Next, Replay, stacked fractions and operand/result highlights; reset when changing examples or modes.
- [x] Verify seven mathematical checks and ten focused browser scenarios, including decimal calculations, five-word playback, graph retention, reduced motion, hidden answers and existing correction/retry flows. Keep this addition local pending owner approval.
- [x] Review all four calculation methods in the production preview: the graph, five cards and working fit a 1920×1080 projector. Phone checks report no horizontal overflow or browser errors. Full build and scoped lint pass.
- [x] Add four sets: 21–30, 51–70, 2.4–2.9 and 0.42–0.49. The eight total sets use varied class widths and distinct recall orders; keep the recording precision visible in every mode.
- [x] Wrong recall/calculation answers keep the original graph and add red circles, edges and arrows to its matching element. Each Show me button targets the specific lower/upper limit or boundary, midpoint or width arrow. Keep stacked fractions, replay, reduced motion, hidden-answer controls and a focused retry that preserves entered values.
- [x] Confirm the same SVG remains mounted and the graph geometry stays fixed across all six correction buttons; animate only the highlight and hide it again for retries or hidden answers.
- [x] Verify five maths tests and twelve focused browser scenarios across the final runs, including all new answer sets, motion, replay, retry/reset, decimal boundaries and hidden answers. Scoped lint and the production build pass. Review phone and all four projector correction states; shorten repeated error text so even six wrong answers fit on a 1920×1080 screen.
- [x] Owner approved Vercel publication together with the Directed Numbers update on 12/10/2026.

## Statistical Charts intervals and boundary animation (11/10/2026)

- [x] Draw the listed-limit spans and continuous boundaries on one numeric scale, with half-step insets and direct lower/upper class-limit arrows. Move definitions into an optional disclosure and remove repeated card prose.
- [x] Render both class-mark formulas, their worked examples and the boundary midpoint calculation as stacked fractions. Keep accessible maths labels and enlarge fractions in projection mode.
- [x] Verify eight focused browser scenarios, scoped ESLint and the production build. Review desktop/phone renders and recheck full projection fit, recall and hundredths after enlarging fractions.
- [x] Introduce a class interval and distinguish its lower and upper class limits as the recorded values allowed at either end.
- [x] Show both class-mark formulas, averaging limits or boundaries, with worked calculations for every whole-number/decimal example.
- [x] Add Why boundaries? with gap-closing animation, shared boundaries, 35.4/35.5/35.6 and 40.4/40.5 assignment, manual measurement movement, Play/Pause, Previous/Next and Replay.
- [x] State round-half-up for these positive recorded measurements and the half-open membership rule: include the lower boundary, exclude the upper. Respect hidden answers and reduced motion.
- [x] Pass 35 focused maths/activity checks, seven browser scenarios across the final focused runs, scoped lint and production build. Review phone and projector layouts, including intermediate motion and exact decimal endpoints.


## Directed Numbers teacher demonstrations (11/10/2026)

- [x] Enlarge long-practice equations up to 32px and explanations to 16px. Measure the complete question at a fixed reference size, fit long formulae within the column, and fill the first column to the available screen height before continuing on the right. Keep the continuation heading hidden until its first step, preserve every revealed line, and reserve the completion-message space to prevent the final click from shifting the viewport. Verify all exercise collections, the supplied fractional example, long expressions, phone/laptop and projector layouts.
- [x] Continue long textbook demonstrations down a left column and then a right column on wide screens, across Exercises 2B, 2C and Revision Exercise 2. Choose the break from the complete question so Next/Previous/Replay never rebalance earlier working. Reserve the writing area, retain the sticky controls, all earlier equations and arrows, and click-only highlights. Short number-line demonstrations keep their graph layout; phones retain sequential single-column working. Eight new browser checks cover every collection, the longest revision working, laptop/phone and projection layouts, clipping, retained lines and stationary controls; four existing animation/number-line/navigation checks also passed. Projector and laptop screenshots were reviewed.
- [x] Apply click-only calculation highlighting to every textbook demonstration: the original expression and each newly revealed line stay unhighlighted until Next step. Preserve simultaneous product reveals, optional written steps and all previous working. Add operation/operand sign-combination arrows when addition or subtraction follows multiplication, division or grouped calculations, including all four sign pairs. Stop automatic scrolling on Next so the teacher's viewport and sticky controls stay steady. The exact-arithmetic checks cover all 180 question parts; focused browser checks verify all exercise collections, retained arrows, replay and late-step scroll positions.
- [x] Polish graph fractions with the same KaTeX typography as the working, give their labels extra vertical clearance, and place Finish beside its endpoint. Keep the zero badge above the axis and retain the narrow magnitude shading.
- [x] Reveal independent products and quotients together: one click shows all operand-sign arrows and resulting signs, and the next shows their magnitudes. Revision Exercise 2 Q37(b) now uses 12 clicks instead of 24; its three product signs are negative, positive and positive, with the preceding subtraction kept separate. Yellow highlights identify the next calculations; blue magnitude terms and an Optional written step badge identify intermediate notation that students may omit.
- [x] Keep demonstration controls visible while scrolling and follow each newly revealed line. Preserve every earlier equation, arrow and sign/magnitude reveal. Mathematical/rendering checks cover all 180 textbook answers; focused browser checks cover grouped work, normal-motion split reveals, exact fractions, graph label clearance and phone/projector presentation.
- [x] Reduce result shading to a narrow strip above the axis. Separate Start, Finish, zero and distance-label rows. Render stacked fractions throughout the graph, calculation and magnitude summary; allow extra space and projector height for fractions. Eleven focused browser checks passed, including the supplied -50 - 60 and -4/3 + 1/6 examples, zero/cancellation, decimals, custom inputs and phone/projector views. Checked all graph labels for overlap and retained step-by-step reveals.
- [x] Keep custom unsigned operands unsigned in the displayed expression and starting-point label; preserve explicitly entered signs and decimal/fraction notation. Add directional arrowheads to the blue zero-to-start, red start-to-finish and purple zero-to-result distance bars, with no arrowhead for zero distance. The custom-input browser check passed for unsigned/signed integers, decimals, fractions and mixed numbers. Seven graph geometry checks passed; the projector arrow layout was visually reviewed. Scoped lint and production build passed.
- [x] Strengthen zero with a solid navy vertical reference and a large white-backed zero badge. Relocate the purple Finish label below the axis, outside the result shading; offset close start/finish labels onto separate rows and clamp labels within the graph. Seven focused browser checks passed for negative/positive results, nearby endpoints, cancellation and zero, with projector screenshots reviewed. Scoped lint and production build passed.
- [x] Preserve unsigned custom operands as entered (including decimals and fractions); examples no longer prefill a plus sign. Highlight the exact endpoint-to-zero interval at the magnitude step with pale purple hatching, use purple for the finish/result distance/calculation, and align the calculation beneath its distance bar. Zero retains a zero-width interval. Five focused browser scenarios passed, with the final purple projector view checked separately; scoped lint and production build passed.
- [x] Add all 58 numerical calculation parts from Revision Exercise 2 Q7–21 and Q25–38 (pp. 2.56–2.58), checked against the printed p. 2.69 answers. Preserve difficulty, question references, decimal/fraction working and deep links; the bank now has 180 parts.
- [x] Draw converging operand-sign arrows in textbook multiplication/division, including Exercise 2C Q33(b). First click reveals arrows and sign; next click reveals magnitude. Earlier arrows and working stay visible. Show implicit positive signs explicitly and bracket reduced negative factors in nested expressions.
- [x] Revision/arrows checks: 534 maths/rendering tests passed, including all 180 printed answers and mathematical equivalence of every sign-arrow expression. Fifteen focused local browser scenarios passed across final runs: revision selection/reload, decimal/fraction/nested completion, arrow geometry/retention, split animation, phone layout and existing projector/additive behaviour. TypeScript, scoped ESLint and production build passed. One initial selector test used the wrong locator; the corrected accessible-combobox check passed.
- [x] Extend the two-click sign/magnitude reveal to textbook products and quotients, including fractional division, decimals, mixed numbers and nested operations. Keep every earlier sign and calculation line visible; group signed subexpressions correctly and leave zero unsigned.
- [x] Product/quotient verification: 418 maths/rendering checks passed, including all 122 printed answers, numerical equivalence of every displayed sign formula and the existing reciprocal-working lesson. All 13 focused browser scenarios passed across final local runs, including chained autoplay, retained equations, backwards/replay, decimal/fraction inputs and phone/projector layouts. Scoped ESLint and TypeScript/production build checks passed.
- [x] Split the signed-magnitude line across two clicks: reveal only the sign, then animate the bracketed magnitude beside it without moving or replacing the sign. Previous step hides the magnitude again; Replay clears the line. Preserve decimal/fraction formats, zero handling and reduced-motion support.
- [x] Split-reveal verification: all 11 focused browser scenarios passed across final local runs, including intermediate animation opacity, sign retention, backwards/replay/autoplay behaviour, reduced motion, decimal/fraction examples and phone/projector views. Scoped ESLint, 163 textbook maths checks and the TypeScript/production build passed.
- [x] Preserve decimals through every intermediate bracket/sign/calculation line, and preserve fraction working. Add the sign-first expression, e.g. `-21 + 43 = +(43 - 21)`, before calculating the magnitude and revealing the signed answer. Route simple decimal/fraction textbook questions through the same number-line demonstration; keep zero unsigned.
- [x] Formatting/sign-first verification: 376 maths/rendering checks, TypeScript, scoped ESLint and production build passed. All 19 focused browser scenarios passed across final local runs, including the corrected integer-only fractional quotient. Reviewed decimal/fraction projector views, sign-before-magnitude timing and phone layout.
- [x] Accept decimal, fraction and mixed-number operands in Sign & magnitude with exact arithmetic and labels. Rescale small distances. Show two animated arrows from the original signs to their combined sign under the equation; retain all previous working. Verify input validation, all four sign pairs and phone/projector layouts.
- [x] Follow-up: keep the original expression and every completed line visible, including during number-line stages. Remove the collapsed history and use stable sign elements, crossfading highlights and smoothly expanding rows. All 11 focused browser scenarios passed across final local runs, including retained equations, intermediate animation opacity, reset, fractions, phone and projector layouts; TypeScript and scoped lint passed.
- [x] Remove prediction from Sign & magnitude and replace textbook answer-entry/marking with teacher-controlled demonstrations.
- [x] Animate each bracket separately: highlight the adjacent signs, combine them, and reveal the rewritten expression before moving on the number line.
- [x] Draw starting, movement and remaining/total distance bars with an explicit magnitude calculation in the graph. Retain zero, equal-sign and opposite-sign cases.
- [x] Add Play/Pause, Previous/Next step, Replay, Normal/Slow speed and reduced-motion support; cancel playback on question changes. Preserve exact fractions and operation order for all 122 textbook questions.
- [x] 343 mathematical/rendering checks, TypeScript, scoped lint and production build passed. All 17 browser scenarios passed across focused runs; reviewed phone and 1920×1080 projector screenshots and ensured the full magnitude graph is visible.
- [x] Published from canonical `main` commit `b06071d` as production deployment `dpl_CsAGM7HzGsPGG33GrT1h9VmtAtLm`. All 17 Chrome scenarios passed on the official domain, including bracket-first timing, in-graph magnitude calculations, textbook playback, bird regressions and phone/projector layouts. Home, Directed Numbers and Statistical Charts returned HTTP 200; unsigned challenge joining returned 401. No Firebase data or rules changes.

## Canonical GitHub source for Dot (11/10/2026)

- [x] Consolidate the latest published Directed Numbers source with the vocabulary activity, retaining all previous department features.
- [x] Compare the full application against the combined production snapshot and rerun 337 focused maths/activity checks successfully.
- [x] Update README and the handoff documents to identify `main` as the canonical source; retain commit history for recovery.
- Repository policy requested by the owner: `main` is the only GitHub branch and the default branch. Superseded department/vocabulary branches are removed after their commits are preserved in `main`.

## Directed Numbers textbook practice and magnitude diagrams (10/10/2026)

- [x] Read the supplied scan and transcribe all 122 numerical calculation parts from Exercise 2B Q1–15/Q21–28 and Exercise 2C Q1–16/Q20–33, preserving references and checking the printed answer key.
- [x] Add Textbook practice with exercise/difficulty/question selection, exact equivalent-answer marking, sign feedback, worked solutions and valid links to the bird and magnitude lessons. State the included coverage explicitly.
- [x] Add the teacher's four number-line cases, negative subtraction and zero: proportional movement arrows, predictions, sign from endpoint position and magnitude from distance to zero. Show this explanation after the bird completes a move.
- [x] All 217 focused maths tests, scoped ESLint, TypeScript and the local production build passed.
- [x] All 17 focused browser scenarios passed across the final targeted runs (eight bird regressions, six sign/magnitude cases, and three textbook/prediction flows). Reviewed textbook and magnitude screenshots on 390px phones and 1920×1080 projection. Adjusted projection layout so the full diagram and explanation are simultaneously visible, then rechecked it and TypeScript.
- [x] Published to `https://lskc-maths.vercel.app` with owner approval: production deployment `dpl_B4cpxr5ZKXgdjHRpKxSBLggMHUf4`, built from `d83356e` plus the tested Directed Numbers changes. All 17 live Chrome scenarios passed, including textbook marking, sign/magnitude cases, bird playback, phone and projection. Home, Directed Numbers and Statistical Charts returned HTTP 200; unsigned challenge joining returned 401. No Firebase data or rules changes. Release manifest: `out/textbook-release.json`; coverage: `docs/directed-numbers-textbook.md`.

## Statistical Charts four-word memory activity

- [x] Add 09 · Four words, one class with animated highlighting and the teacher's Limits are Listed / Boundaries are Between / Mark is the Middle / Width is the Whole bar mnemonic.
- [x] Add Hide and recall with targeted feedback, plus six-value calculations and further whole-number, tenths and hundredths examples. Respect the teacher's hidden-answer control.
- [x] Verify 33 mathematical/activity checks, three focused browser scenarios, scoped ESLint and the complete production build. Review phone and 1920×1080 projector renders; the whole projected activity fits without scrolling.
- [x] Publish deployment dpl_B5e3cLveCsScaLS2eXvst2cYRDDS to https://lskc-maths.vercel.app/apps/statistical-charts. Preserve the latest published Directed Numbers snapshot. Verify live recall, decimal calculations, mobile layout, projection and textbook availability; no browser errors or Firebase changes.

## Statistical Charts representation connections (10/10/2026)

- [x] Add an immediately visible class-mark / lower-and-upper-boundary axis selector, retaining saved display settings and cumulative-graph boundary conventions.
- [x] Edit frequency cells beside the graph, converting raw counts to an independent grouped table without changing the current raw observations. Validate whole, non-negative frequencies and retain automatic cumulative totals.
- [x] Add stem-and-leaf shape prediction with the supplied 15 ages, repeated leaves, four schematic shapes, editable ages, explanations and further examples.
- [x] Add cumulative-polygon to histogram prediction, linked frequency differences, flat sections, equal-width/equal-rise explanation, editable frequencies and further examples. Respect hidden-answer and fixed-lesson settings.
- [x] Add four animated walkthroughs with Play/Pause, Previous/Next, Replay, speed and reduced-motion support: leaf counting, cumulative rises, the supplied weight tables, and median/percentile/complement readings on an explicitly reconstructed electricity-bill graph.
- [x] Standalone browser scenarios, mathematical checks, production build, TypeScript and scoped lint passed. Four department integration tests passed on isolated port 3019 after the default local server conflicted. Final animation checks and release verification follow below.
- [x] Reviewed desktop and phone renders and settled animation frames. Across the focused suites, 52 standalone browser scenarios, 35 mathematical/activity checks, four department integration tests, production build and lint passed. Published implementation `9b5ce47` to GitHub main and the department branch; production deployment `dpl_DsRB7YwzKJBkGxPwPhgwBQX2QNTG` is READY. Fresh signed-out Chrome checks on the public domain passed for boundaries, direct editing, both concept lessons, animation playback, weight-table answers, bill complements, projection and phone layouts, with no browser errors. Walkthroughs hide the main lab's unrelated dataset count. No production Firebase data or rules were changed.

## Statistical Charts classroom layout (10/10/2026)

- [x] Replace multiplication-like removal symbols with labelled bin icons for observations and grouped classes.
- [x] Arrange the workspace in reading order: horizontal Dataset settings, Data Explorer, then Frequency distribution beside Chart type and graph.
- [x] Add a direct Table & chart view, preserve both panels in department Projection mode, and restore keyboard focus on exit.
- [x] All 45 standalone browser scenarios passed, including both panels within 1280x720 and 1920x1080, linked selection, keyboard exit and existing chart/lesson/export functions.
- [x] Next.js production build, TypeScript, ESLint and four emulator-backed department browser tests passed. Reviewed settings, bin controls and department projection screenshots.
- [x] Published implementation `3a2f90c` to both GitHub branches and production deployment `dpl_28s8JKwz9PNxtZo5U24Dwkts4whw`. Fresh signed-out Chrome checks on `https://lskc-maths.vercel.app/apps/statistical-charts` passed: vertical section order, bin deletion, linked selection, histogram/cumulative graph fit, Escape focus return, department projection and 390px phone layout. Reviewed live screenshots; no browser errors. No production Firebase data or rules changed.

## Web Apps textbook topic filter (10/10/2026)

- [x] Replace Strand filtering with all textbook topics from the same live catalogue as Mistakes Book, grouped by F1-F6 and ordered identically.
- [x] Narrow chapters by level, clear stale chapter selections when switching levels, and retain chapters without apps with an explicit empty state.
- [x] Associate apps with chapter codes, including both junior and compound inequalities; allow chapter-code searches.
- [x] Production build, TypeScript and ESLint passed. Three emulator-backed browser tests passed, including all 69 chapters, level changes, multiple chapter mappings and mobile long-title layout. Desktop/phone screenshots reviewed.
- [x] Published implementation `39157ff` through GitHub main to `https://lskc-maths.vercel.app/apps` (deployment `dpl_691PqReKUb1VhUY83DMXWEk4ru5N`). Live Chrome checks confirmed all 69 chapter names and their order match Mistakes Book exactly, chapter mappings work, level changes reset the selection, and long titles fit the phone layout. Both GitHub branches are synchronised; no production Firebase data or rules were changed.

## Statistical Charts Lab — department integration and GitHub handoff (10/10/2026)

Owner asked to include the lab in the mathematics department website, then requested a GitHub upload for later processing.

- [x] Registered in Web apps under F2 / Data Handling / 2A06, using the existing `/apps/statistical-charts` host.
- [x] Add production-build integration coverage for listing/search, navigation, projection, shared links and mobile progress restoration.
- [x] Honour the department Projection mode with reduced lab controls and a viewport-sized graph.
- [x] Exclude local environment files, generated output and test artifacts from Vercel uploads.
- [x] Prepare `docs/statistical-charts-handoff.md`, including the 21 earlier local commits absent from GitHub main.
- [x] Upload branch `codex/statistical-charts-lab` and verify remote implementation commit `e2945cd`.
- [x] Owner renamed the uploaded branch to `LSKC-Mathematics-Department-Website`.
- [x] Owner authorised updating the existing production website on 10/10/2026 after an old-main deployment restored placeholder routes.
- [x] Stage and verify the complete production website, fast-forward GitHub main, and publish to the existing Vercel domain. No Firebase database/rules changes were required.

Published at `https://lskc-maths.vercel.app` on 10/10/2026. Verified production-configured build
`dpl_2PCge2tfjdGYg4qUF1Y6ssqGH2J9` from release commit `0dd44c2`; GitHub main and the renamed branch
were fast-forwarded to that complete website. Fresh signed-out Chrome checks passed for five app cards,
F2/Data Handling navigation, percentile calculations, browser progress restoration, mobile overflow, and
69 Mistakes Book topics across F1-F6. Requests used production Firebase project `lskc-maths-2026`.
The selected Directed Numbers topic had no published books; signed-in teacher editing was not exercised.

## Statistical Charts Lab — Phase 4 (10/10/2026)

Owner requested the next phase, retaining the responsive design and rendered-output review requirement.

- [x] Percentiles, quartiles and median estimates from the displayed cumulative polygon or curve; plateau intervals and separate raw median.
- [x] Two frequency distributions with aligned classes, count/percentage scales and distinguishable series; SVG/PNG and both printed tables.
- [x] Validated local workspace restoration, tutorial/answer/construction progress, fresh-link precedence and explicit progress reset.
- [x] Local teacher activity library, instructions, starting level, delete/undo, portable links and files without student attempts.
- [x] 42 new mathematical/storage tests; 336 project unit tests and 42 Chrome browser tests passed; responsive and PDF review.
- [x] TypeScript, ESLint and Next.js production build passed; final print pagination rechecked.
- [x] Owner authorised department-site integration and GitHub handoff. Optional cloud syncing remains outside this delivery.

Review at `http://127.0.0.1:3216/`: **Grouped frequencies → 06 · Further Explorations**.
Open **My activities & progress** to author or reopen an activity. Refresh practice to verify local resumption.
The app has no student accounts or new backend writes. Full calculation, persistence and test details are in `docs/statistical-charts-lab.md`.

## Statistical Charts Lab — Phase 3 (09/10/2026)

Owner authorised Phase 3 and requested design review against international website-award standards.

- [x] Five comparison layouts with shared numeric scales, linked class selection and an explanatory reading panel.
- [x] Fixed lesson dataset, answer controls, student reset, new example and classroom presentation view.
- [x] Self-contained SVG, 2x PNG, printable charts/table and raw/frequency CSV exports.
- [x] Validated activity links and JSON file fallback; exact configuration restoration without a backend.
- [x] Responsive hierarchy, spacing, touch targets, reduced motion, print/keyboard behaviour and rendered-output review.
- [x] 31 new transport tests; 294 project unit tests and 30 browser tests passed; production build and lint checked.
- [x] Owner authorised progression to Phase 4.

Review at `http://127.0.0.1:3216/`: **Grouped frequencies → Compare Charts → All five charts**.
Open **Teacher & sharing tools** for presentation, answer control, print, CSV and portable activities.
See `docs/statistical-charts-lab.md` for the full review route, design refinements and sharing limits.
No dependencies, backend writes or public deployment were added.

## Statistical Charts Lab — Phase 2 (09/10/2026)

Owner requested the next phase and then confirmed continuation.

- [x] All five construction tutorials, progressive point/bar reveal, animated joins, curve smoothing, hints, answers and restart.
- [x] Guided calculations, partially completed graphs and independent coordinate/boundary construction.
- [x] Numerical grading with misconception-specific feedback, worked corrections, model graphs and retries.
- [x] Mouse, touch and keyboard plotting; exact numeric entry; fixed given items; dataset/level/chart reset behaviour.
- [x] 35 new unit tests, 263 passing project unit tests, 19 passing browser tests, responsive visual review, lint/typecheck/build.
- [x] Owner authorised progression to Phase 3 comparison layouts, exports, printing, sharing and dedicated teacher controls.

Review at `http://127.0.0.1:3216/` using `npm.cmd run build:statistics` then `npm.cmd run preview:statistics`.
Choose **Grouped frequencies**, then **Step-by-Step Learning** or **Practice Mode**. Try the first class mark
as 10 (midpoint feedback), then 14.5 (correct). In independent frequency-polygon practice include zero endpoints
(4.5, 0) and (54.5, 0), and choose straight segments. See `docs/statistical-charts-lab.md` for the full review route.
Curve exercises assess anchor calculations and the smoothing method, not arbitrary freehand curves. No new dependencies,
backend writes or public deployments were made.

## Statistical Charts Lab — Phase 1 (09/10/2026)

Owner supplied a full F2 Chapter 6 brief with an explicit first delivery of working Phase 1, plus the textbook PDF.

- [x] Check the textbook construction conventions visually (pp. 6.7, 6.11, 6.22, 6.27, 6.35–6.39).
- [x] Seeded generator with eight contexts, custom ranges, five distribution shapes, precision and sample-size controls.
- [x] Raw-cell/bulk/CSV input; separate grouped-frequency editor; validation and automatic full/compact frequency tables.
- [x] All five SVG charts with numeric scales, linked highlighting, safe curves and basic display controls.
- [x] Register `/apps/statistical-charts`; provide an independent static build and Firebase Hosting instructions.
- [x] 42 new numerical tests, 228 project unit tests, six browser tests, responsive screenshot review, lint/typecheck/build.
- [x] Owner authorised progression to Phase 2; classroom/export/sharing tools remain Phase 3.

Local review: `npm.cmd run build:statistics`, then `npm.cmd run preview:statistics`; open
`http://127.0.0.1:3216/` without an account. Select **Grouped frequencies**: total 20, frequencies
3/7/5/5; switch charts to inspect the extra zero endpoints and final cumulative total. Edit a value
and observe all representations update. See `docs/statistical-charts-lab.md` for the complete test route,
source conventions, implementation details and limitations. No real Firebase data or deployment was changed.

## Answers from the owner (2026-09-21)

| question | answer |
|---|---|
| Who can view the site? | **Everyone, for now** — no login needed to browse. Built as `NEXT_PUBLIC_ACCESS_MODE=public`, switchable to `school` later without code changes. |
| First admin | `t28ltk@lskc.edu.hk` |
| Teacher sign-in domain | `lskc.edu.hk` |
| School logo | Supplied. Saved to `assets/school-logo.png` (transparent), `-512.png`, `-original.jpg`. Crest colours **#DA2127 red**, **#0F4574 navy** — now the palette. |
| Topic list | Taken from the owner's `Topic.docx`. Written up in [`docs/topics.md`](docs/topics.md): 69 topics across F1–F6, with the department's own chapter codes (`1A01`, `2B07`, `Ch13`…). |
| Chinese topic names? | **No.** English only, throughout. No `nameZh` field. |
| M2? | **Not now.** The `M2` level and its strands stay in the constants, but no M2 topics are seeded and nothing is built for M2 until the owner asks. |
| Google Workspace sign-in | Not blocked — teachers can sign in with Google without IT changing anything. |

**Every planning question is answered. Nothing blocks any phase.**

Two things to keep in view rather than decide now:

- In public mode, student-edition PDFs can be downloaded by anyone on the internet who has the link, not only LSKC students. Accepted; worth a second look before the first real upload in Phase 4.
- M2 and Chinese topic names are both small, additive changes later — they are not being designed out.

## Architecture

```
Browser (Next.js app on Vercel)
  ├─ Firebase Auth ──── Google sign-in for TEACHERS only (lskc.edu.hk)
  ├─ Firestore ──────── teachers, topics, mistakeBooks, siteContent, appSettings
  └─ Cloud Storage ─── uploaded PDF / DOCX / HTML files
          ▲
   Security rules enforce every permission (access mode, role, edition, size, type)

Reading (public mode):  visitor ── no sign-in ──> topics, site content, student-edition books
Writing (always):       teacher ─ Google sign-in ─> everything, incl. teacher-edition books
```

The web apps are bundled with the site and need no backend.

## Data model

### Firestore

**`teachers/{email}`** — document ID is the lowercased email
| field | type | notes |
|---|---|---|
| name | string | display name |
| isAdmin | boolean | can manage the teacher list |
| addedBy | string | email of admin who added them |
| addedAt | timestamp | |

**`topics/{topicId}`**
| field | type | notes |
|---|---|---|
| code | string | department chapter code, e.g. `1A01`, `2B07`, `Ch13` — matches the file names teachers already use |
| name | string | English, e.g. "Quadratic Equations and Number Systems" |
| levels | string[] | subset of `F1`–`F6`, `M2` (only F1–F6 are used for now) |
| strand | string | see Strands |
| order | number | sort order within a level (follows `docs/topics.md`) |
| createdAt / updatedAt | timestamp | |

**`mistakeBooks/{bookId}`**
| field | type | notes |
|---|---|---|
| title | string | |
| description | string | short summary |
| level | string | one of the levels |
| topicId | string | ref to `topics` |
| topicName | string | denormalised for listing |
| edition | `"student"` \| `"teacher"` | controls visibility |
| fileType | `"pdf"` \| `"docx"` \| `"html"` | |
| fileName | string | original name |
| fileSize | number | bytes, ≤ 20 MB |
| storagePath | string | `mistake-books/{edition}/{bookId}/{fileName}` |
| uploadedBy | `{ uid, email, name }` | |
| createdAt / updatedAt | timestamp | |

**`siteContent/home`** — single document, teacher-editable
| field | type | notes |
|---|---|---|
| heroTitle | string | |
| intro | string | limited Markdown + KaTeX |
| announcement | `{ text, link?, active }` | banner on Home |
| updatedBy / updatedAt | string / timestamp | |

**`appSettings/{slug}`** — overrides for one Web App listing, teacher-editable
| field | type | notes |
|---|---|---|
| title | string? | overrides registry default |
| summary | string? | overrides registry default |
| featured | boolean | shown first / on Home |
| visible | boolean | `false` hides it from students |
| order | number | display order |
| updatedBy / updatedAt | string / timestamp | |

Indexes: `(edition, createdAt desc)` for "Latest uploads"; `(edition, level, topicId, createdAt desc)` for browsing.

### Constants (`src/lib/constants.ts`)

- Levels: `F1 F2 F3 F4 F5 F6 M2` — `M2` is defined but carries no topics yet; filters hide a level with no topics
- Strands (compulsory part): `number-algebra` (Number and Algebra), `measures-shape-space` (Measures, Shape and Space), `data-handling` (Data Handling)
- Strands (M2): `m2-foundation` (Foundation Knowledge), `m2-calculus` (Calculus), `m2-algebra` (Algebra)
- Upload: max 20 MB; types `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/html`

### Permissions matrix

Columns are the four kinds of user in **public mode** (the current setting).

| action | visitor (not signed in) | signed in, not a teacher | teacher | admin |
|---|---|---|---|---|
| view Home, Web Apps, Mistakes Book | ✓ | ✓ | ✓ | ✓ |
| read `topics` | ✓ | ✓ | ✓ | ✓ |
| read `siteContent`, `appSettings` | ✓ | ✓ | ✓ | ✓ |
| read student-edition books + files | ✓ | ✓ | ✓ | ✓ |
| read teacher-edition books + files | ✗ | ✗ | ✓ | ✓ |
| see apps marked hidden | ✗ | ✗ | ✓ | ✓ |
| see "Edit page" toggle and Manage menu | ✗ | ✗ | ✓ | ✓ |
| write `siteContent`, `appSettings` | ✗ | ✗ | ✓ | ✓ |
| write `topics` | ✗ | ✗ | ✓ | ✓ |
| upload / edit / delete books | ✗ | ✗ | ✓ | ✓ |
| read `teachers` | ✗ | own doc | own doc | ✓ |
| write `teachers` | ✗ | ✗ | ✗ | ✓ |

In **school mode** (`NEXT_PUBLIC_ACCESS_MODE=school`) the first column becomes all ✗ and the
second column applies only to verified accounts on an allowed domain. Nothing else changes —
the rule templates take the mode as a build-time switch, so both modes ship from the same source.

## Routes

Below, "everyone" means public mode; in school mode those rows become "signed-in school user".

| route | who | purpose |
|---|---|---|
| `/login` | everyone | Google sign-in **for teachers**; clear message if the account isn't `lskc.edu.hk` or isn't on the teacher list. Visitors never need this page. |
| `/` | everyone | Hero, two entry points, latest 5 uploads |
| `/apps` | everyone | Grid of apps, filter by level/strand, search |
| `/apps/[slug]` | everyone | One app inside PresentationFrame |
| `/mistakes-book` | everyone | Browse by level → topic (student edition; teachers also see teacher edition) |
| `/mistakes-book/[id]` | everyone / teacher | Preview (PDF/HTML) or download (DOCX); teacher-edition items require a teacher |
| `/manage/upload` | teacher | Upload form |
| `/manage/books` | teacher | Edit / delete books |
| `/manage/topics` | teacher | Add / edit / reorder topics |
| `/admin/teachers` | admin | Add / remove teachers, set admin |

---

## Phase 0 — Project setup — DONE (2026-09-21)

- [x] Create Next.js app (App Router, TS strict, Tailwind, ESLint, `src/` dir) — Next 16.3.5, React 19.2.8, Tailwind v4
- [x] Add Prettier, Vitest — **Playwright deferred to Phase 7**, where the smoke tests are actually written; installing a browser runtime now would add ~400 MB for nothing
- [x] Firebase config for Firestore, Storage, Emulators (auth 9099, firestore 8080, storage 9199, UI 4000) under the demo project ID `demo-lskc-maths`, so nothing can reach a real project
- [x] `src/lib/firebase.ts` with emulator wiring; `.env.example` and `.env.local`
- [x] npm scripts — `dev`, `build`, `start`, `lint`, `format`, `typecheck`, `emulators`, `dev:all`, `test`. **`seed`, `rules:build` and `test:rules` are not wired yet**; they arrive with their scripts in Phases 2–3.
- [x] Crest copied into `public/`; `src/app/icon.png` + `apple-icon.png` generated from it
- [x] Git initialised (`main`), first commit made; `.gitignore` covers `.env.local`, emulator data, Playwright output

**Test:** `npm run dev:all` → site on :3000, Emulator UI on :4000. Verified: both
respond 200, all three emulators (Auth / Firestore / Storage) report ready, the page
renders with no console errors, `npm run build`, `npm run lint` and `npm run typecheck`
are all clean.

## Phase 1 — Design system, layout and Home — DONE (2026-09-21)

- [x] Tailwind v4 tokens in `src/app/globals.css` (palette, type scale, graph-paper utilities, one global focus ring, `prefers-reduced-motion`); Spectral + IBM Plex Sans via `next/font`
- [x] Design plan shown as a rendered mock-up and approved by the owner; recorded below
- [x] `SiteHeader` (crest + school name, three nav links, active state, `Sign in` placeholder, mobile menu) and `SiteFooter`
- [x] `<Math>` KaTeX component (`trust: false`, never renders user HTML)
- [x] Home: graph-paper hero with a draggable parabola, two entry cards, "Latest uploads" on stand-in rows
- [x] `PagePlaceholder` + pages for all nine remaining routes, each naming the phase that builds it
- [x] Checked at 360, 760, 900, 1440 and 1920 px; no horizontal overflow at 360 px

**Test:** `npm run dev:all`, then browse Home and click through to every page. Drag the
yellow vertex, or tab to it and use the arrow keys — the equation, vertex and roots
follow. Verified: `npm run build`, `npm run lint`, `npm run typecheck` clean; no console
errors.

## Phase 2 — Sign-in, roles and security rules — DONE (2026-09-25)

- [x] `AuthProvider` + `useAuth()` returning `{ user, role: 'visitor' | 'viewer' | 'teacher' | 'admin' }`
- [x] `/login` with Google (`hd` hint); clear message + sign-out for accounts outside `lskc.edu.hk`, and for `lskc.edu.hk` accounts not on the teacher list ("You're signed in, but you don't have teacher access yet — ask an admin.")
- [x] `<AuthGate>` honouring `NEXT_PUBLIC_ACCESS_MODE`: pass-through in `public`, login wall in `school`; `<RequireRole role="teacher">` / `"admin"` always enforced on `/manage/*` and `/admin/*`
- [x] Rule templates + `scripts/build-rules.ts` (substitutes both the access mode and the allowed domains)
- [x] `firestore.rules` and `storage.rules` implementing the permissions matrix
- [x] `/admin/teachers` page; header shows "Sign in" for visitors, account menu for teachers
- [x] `npm run seed`: admin `t28ltk@lskc.edu.hk`, a second teacher, a non-teacher `lskc.edu.hk` account (emulator accounts)
- [x] Rules tests covering Firestore and Storage permissions **in both access modes**, plus other-domain and unverified-email accounts. UI behaviour for hidden apps and the Edit toggle is tested when those features are built in Phases 5–6.

**Test:** `npm run dev:all` starts the site on :3000 and Emulator UI on :4000. In another terminal run `npm run seed` after each emulator restart. Open Home signed out: it remains readable. On `/login`, use the local test buttons for admin, teacher and viewer (password is `LocalTest123!` in the seed script); admin sees Manage and Teachers, viewer sees neither. `/admin/teachers` loads the list for admin and refuses viewer. The Web Apps and Mistakes Book content pages are still placeholders until Phases 4–5, so actual student/teacher editions cannot yet be checked in the UI. Stop `dev:all`, then run `npm run test:rules`; the command starts disposable emulators and all 14 tests should pass. Verified: `npm run build`, `npm run lint`, `npm run typecheck` and the standalone `npm run test:rules` command pass. The admin list's add/remove flow was checked against the local emulator.

## Phase 3 — Topics management — DONE (2026-09-25)

- [x] Typed helpers in `src/lib/db/topics.ts` for listing, live updates, adding, editing, guarded deletion and reordering
- [x] `/manage/topics`: add, edit, delete (blocked if books use the topic), reorder within a level
- [x] Seed script loads `docs/topics.md` (the 69 F1–F6 topics) into `topics/`

**Test:** `npm.cmd run dev:all`, then in a second PowerShell window run `npm.cmd run seed`.
The seed reports 69 topics. Open `/login`, choose the local Teacher account, then open
`/manage/topics`: F1 has 13 topics, F6 has 6. Add a temporary topic, edit its name,
move it up or down and delete it. Sign out and open `/manage/topics` directly: the
teacher-only gate refuses access. Stop `dev:all`, then run `npm.cmd run test:rules`;
the rules still reject visitor/viewer writes. Verified in the demo emulator: 69 topic
documents exist, F5 Ch18 is Measures of Dispersion, create/edit/reorder/delete work,
rerunning the seed updates existing source records without duplicating them, and
`npm run build`, `npm run lint`, `npm run typecheck` and `npm run test` pass.

## Phase 4 — Mistakes Book

- [x] Typed helpers in `src/lib/db/books.ts` (student queries always filter `edition == 'student'`)
- [x] `/manage/upload`: title, description, level, topic (filtered by level), edition, file; client-side checks for type/size; progress bar; write Firestore doc + Storage file, clean up on failure
- [x] `/manage/books`: list, edit metadata, replace file, delete (doc + file)
- [x] `/mistakes-book`: level tabs → topics → books, edition badge (teachers see both)
- [x] `/mistakes-book/[id]`: PDF via react-pdf; HTML via sandboxed `srcdoc` iframe; DOCX download via `getBlob`
- [x] Home "Latest uploads" wired to real data
- [x] Rules tests for Storage uploads (size, type, role, edition path)

**Test:** upload one of each type as teacher; view them signed out in a private window; confirm a signed-out visitor cannot open a teacher-edition link directly, even with the exact URL.

**DONE (2026-09-26):** The demo emulator check uploaded PDF and DOCX student editions and an HTML teacher edition. PDF rendering, sandboxed HTML rendering, teacher browsing of both editions, PDF replacement and metadata edit, student-only Home latest uploads, signed-out student PDF access, and direct teacher-book denial were verified in the local browser. `npm run test:rules` passed all 18 public/school mode tests. `npm run lint`, `npm run typecheck`, and `npm run build` passed. The owner should now run the Phase 4 test above with their own files, including a DOCX download and book deletion, before Phase 5.

## Phase 5 — Web Apps — DONE (2026-09-26)

- [x] `registry.ts` type + `/apps` index with level/strand filters and search
- [x] `<PresentationFrame>` + `usePresentation()`
- [x] App: **Quadratic explorer** — sliders for a, b, c; plot of y = ax² + bx + c; vertex, axis of symmetry, roots (or "no real roots" with discriminant); equation shown in KaTeX
- [x] App: **Unit circle** — drag a point around the circle; angle in degrees; live sin θ, cos θ, tan θ with projections drawn; quadrant signs
- [x] App: **Inequality number line** — enter e.g. `2x - 3 > 5` or compound `-1 ≤ x < 4`; show solving steps and the solution on a number line with open/closed dots
- [x] SVG thumbnails for each app
- [x] A short `src/apps/README.md` explaining how to add a new app

**Test:** use each app with mouse, on a phone-sized window, and in Presentation mode at 1920×1080.

**DONE (2026-09-26):** In the local demo project, the index filters and search, quadratic controls and no-real-roots case, unit-circle angle controls and undefined tangent, and inequality steps/endpoints were checked in the browser. Each app and the index fit a 360 px viewport without horizontal scrolling; the enlarged Presentation layout fit 1920×1080. The in-app browser does not expose native fullscreen, so the owner should also check the Fullscreen API in Chrome. Lint, typecheck, tests and production build pass. No real Firebase project was changed.

## Phase 6 — Teacher edit mode — DONE (2026-09-26)

- [x] Typed helpers `src/lib/db/siteContent.ts`, `src/lib/db/appSettings.ts`
- [x] Rules: `siteContent` and `appSettings` readable per the access mode, writable only by teachers; field validation (types, string lengths)
- [x] Header "Edit page" toggle, rendered only for teachers; edit state in a React context
- [x] `<EditableText>` component: dashed outline in edit mode, inline editor, Save / Cancel, "Saved" confirmation, "Last edited by … on …"
- [x] Home: hero title, intro, announcement banner editable
- [x] Web Apps index: edit title/summary, toggle featured and visible, drag to reorder; registry defaults merged with `appSettings`
- [x] Non-teachers: hidden apps filtered out of the index; `/apps/[slug]` for a hidden app shows "This app isn't available right now"
- [x] Seed default `siteContent/home`
- [x] Rules tests: write attempts to `siteContent`, `appSettings`, `topics`, `mistakeBooks` and Storage by a visitor and by a signed-in non-teacher are all rejected; teacher writes succeed

**Test:** sign in as teacher → toggle Edit page → change the Home intro and hide one app → open the site in a private window → see the new intro, no hidden app, no edit controls.

**DONE (2026-09-26):** On the demo emulator, the admin test account saved a Home introduction and announcement, changed an app listing, featured one app and reordered listings. After sign-out, the visitor view showed the saved Home content and featured app, omitted the hidden app from the index and denied its direct URL. No browser errors or warnings appeared. Rules tests passed in both public and school modes (20 tests); unit tests (8), lint, typecheck and production build passed. No real Firebase project was changed.

## Phase 7 — Polish and hardening — DONE (2026-09-26)

- [x] Accessibility pass (keyboard, focus, contrast, labels)
- [x] Empty/error states on every page
- [x] Playwright smoke tests: login gate, browse books, open an app
- [x] Lighthouse check on Home and one app

**DONE (2026-09-26):** Focus indicators now have a dark outline and yellow outer ring on light and navy surfaces; the Home graph's keyboard control exposes its numeric range. The main routes have descriptive page titles. Teacher, topic, upload, book, and featured-app loading failures show errors instead of misleading empty states. Four Chrome Playwright smoke tests pass against the local demo emulators, including mobile keyboard navigation. Lint, typecheck, unit tests and production build pass. A local production-build Lighthouse mobile audit scored Home 78 performance / 100 accessibility / 100 best practices / 100 SEO, and Quadratic Explorer 77 / 100 / 100 / 100. Lighthouse flagged unused JavaScript as the main performance opportunity. No real Firebase project was changed.

## Phase 8 — Go live

- [x] README, plain-English, step by step: create Firebase project; enable Google sign-in; upgrade to Blaze and **set a budget alert (e.g. HK$20/month) — not optional in public mode**; create Firestore + Storage; set `NEXT_PUBLIC_ACCESS_MODE` and `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`; `npm run rules:build`; deploy rules; create the first admin document `teachers/t28ltk@lskc.edu.hk` by hand; connect GitHub to App Hosting; add the App Hosting domain to Auth authorised domains (instructions prepared; live actions pending)
- [x] `apphosting.yaml` with the public env vars
- [x] `firebase.json` rules and indexes deploy config (already present and verified)
- [ ] Post-launch checklist: open the live site signed out, sign in as teacher, upload one test file, check it appears signed out, delete it
- [ ] Configure Storage bucket CORS for the site's origin so SDK `getBlob` previews and downloads work in production; verify with the post-launch test file
- [x] Dedicated project `lskc-maths-2026`: Google and Anonymous sign-in enabled; Google support email `t28ltk@lskc.edu.hk`; stable Vercel domains authorised. If switching to school mode, confirm the students' domain first.
- [ ] In **Firestore Database → Time-to-live**, create an `expireAt` TTL policy for each challenge collection group: `rooms`, `roomCodes`, `entries`, `private`, `runs`, `stats` and `classBoards`. Confirm all seven policies are enabled. TTL deletion is asynchronous, so check the school's privacy policy and the exact join-page notice in `copy.ts` before real students join.
- [x] Use **Vercel**, as requested by the owner, for Next.js and Node 24 challenge routes. Firebase Admin reads an encrypted server-only Secret backed by a dedicated `roles/datastore.user` service account.
- [ ] Complete a real teacher-created challenge through join/start/submit/delete on Vercel, after TTL and the privacy check are complete.
- [ ] Decide whether to add Firebase App Check if abuse appears; it is not required or enabled for the first classroom trial. Set the Blaze budget alert before opening public reads and challenge traffic.
- [x] Note in the README how to switch to `school` mode later (one variable, rebuild rules, redeploy)

---

## Directed numbers — Stage A (27/09/2026)

**Deployment update (06/10/2026):** `https://lskc-maths.vercel.app` is live.
Dedicated Firebase project `lskc-maths-2026`, Hong Kong Firestore, deployed rules
and ready indexes, 69 approved topics and first admin record are configured.
Google sign-in uses the requested school support email; Anonymous is enabled.
186 unit tests, lint, typecheck and the Vercel build pass. Live checks confirm
unsigned API requests fail with 401, anonymous tokens reach the server's
Firestore lookup, all 69 topics are readable, teacher records are private,
and direct student score writes are denied. The temporary test Auth user was
removed. Vercel needs `NODE_OPTIONS=--experimental-require-module` for Firebase
Admin; this is recorded in `vercel.json` alongside the Node 24 engine pin.
Storage, its CORS/rules, budget alert, and all seven TTL
policies remain pending because the project is still on Spark. Do not run a
real student challenge while the join notice's automatic deletion is pending.

- [x] Exact rational-number engine, safe parser, answer equivalence and movement helpers, with tests covering the supplied arithmetic fixtures and all 3,362 start/operation/move combinations in the lesson range.
- [x] Registered F1 app, SVG thumbnail, English copy, hash navigation and expression bookmarks. Unfinished modes explicitly show a later-stage panel.
- [x] Add & subtract: keyboard/keypad/number controls; four direction rules; teacher-paced hops and long arcs; backwards stepping; up to four chained moves; equivalent-move comparison; thermometer and lift views; worked answers with double underline.
- [x] Additional student interactions: predict direction, distance and landing; simple correction notes; Show me, retry and a similar question; change only the operation or signed number.
- [x] Projection controls and scoped clicker keys; session prediction preference; keyboard controls; reduced-motion-safe hop reveal; mobile number-line scrolling with the current point kept visible.
- [x] Final verification: lint, typecheck, all 82 unit tests and production build pass; reviewed changes are ready for the Stage A commit.

**DONE (27/09/2026):** Browser checks covered wrong direction/distance/landing feedback, a correct landing, Show me, backward/forward steps, a three-move journey ending at +4, the change-one-thing activity, keypad entry, invalid-input messages, expression bookmarks, prediction preferences surviving refresh, and later-stage placeholders. At 360 px there is no horizontal page overflow; the diagram scrolls internally and follows the current point. At 1920×1080, the enlarged lesson and controls fit, including the equivalent-move comparison with the lift view. PageDown/PageUp/R/P and ordinary keyboard buttons were checked. The final browser session reported no console errors or warnings. Hop animation has an explicit reduced-motion override. Review on an actual classroom projector remains the owner's acceptance check.

**Working checkout:** `C:\Users\t28ltk\Projects\lskc-maths (Chatgpt)` is an isolated Git worktree on `apps/directed-numbers`, created from `bee9597`. The original `C:\Users\t28ltk\Projects\lskc-maths` checkout and its untracked v2 brief remain untouched. The brief at that original checkout's `docs/codex-prompt-directed-numbers.md` is the source of requirements. No new dependencies, Firebase permissions or production services were changed in Stage A.

**Run locally:** open PowerShell in the working checkout and run `npm.cmd run dev:all`. Visit `http://localhost:3000/apps/directed-numbers`. No seed or sign-in is needed for this stage. Stop an existing copy of the development servers first if the ports are already in use. A fresh dependency installation needs `npx.cmd next typegen` before a standalone `npm.cmd run typecheck`; `next dev` and `next build` also generate those existing Next.js route types.

**Owner test (Stage A):**

1. Open Web apps and filter to F1: Directed number operations appears. Open it: Add & subtract is ready; the other modes explain that they arrive later.
2. On the default `(−3) + (+5)`, turn Predict first off and press Next five times: the point moves from −3 to +2 and the final answer is double-underlined. Back removes a hop.
3. Enter `5 − (−3)` and press Show on number line. Turn on Predict first. Choose Left: the explanation says subtraction reverses the negative addition movement. Choose Right: the distance and landing questions appear.
4. Enter `−3` for distance: feedback explains that the distance is 3 units. Enter `2` for the landing point: use Show me to see +8, then Try this step again or Try a similar question. These are learning activities without scores.
5. Turn on Same move, two ways: subtraction of −3 is paired with addition of +3. Expand Change one thing and change only the operation or number's sign; predict again.
6. Choose Lift, then Thermometer: labels and wording change to floors/up/down and temperature/rises/drops. The arithmetic stays the same.
7. Expand Use these numbers and choose the three-move journey. Step through +9, −11 and +6: the final position is +4; the 11-unit move uses one long arc.
8. Try `3 × −2` and an unmatched bracket: a clear input correction appears; the existing diagram remains intact. A valid expression can be bookmarked as `#add-subtract:e=5%20-%20(-3)`.
9. At phone width, use the mode selector and keypad. The number line can scroll inside its own box, without horizontal page scrolling. Use Tab and Enter to operate controls without a mouse.
10. On a 1920×1080 screen, enter Projection mode, focus the lesson area, then use PageDown/PageUp, R, N and P. The keypad is hidden, and arrow keys inside a typing field do not advance the lesson. The detailed student prediction forms remain in the normal view; projection is teacher paced.

**Stage boundary:** Only Add & subtract is delivered in Stage A. Number-line comparison/ordering, bracket lessons, multiplication/division, mixed working, games and challenges remain for B–G. The engine already handles fractions and mixed arithmetic, but this visual lesson deliberately accepts integer addition/subtraction within its specified bounds. Stop for the owner's review before Stage B.

**Later-stage design notes from the brief review:** Preserve time to read correction feedback; compare classes under matching question/scoring conditions; the currently specified submit API updates boards on completed runs; expiry must cover all challenge subcollections; no-time-pressure tie-breaking and division-by-zero precedence need explicit treatment. The owner's latest request hides the student's numerical rank on their phone, showing only the gap to the next place. These do not require backend work in Stage A.

## Directed numbers — Stage B (27/09/2026)

- [x] Number line: two to six movable points, keyboard sliders (arrows ±1, Shift+arrows ±5), typed values, automatic range, selected sign/magnitude/opposite, and opposite-point distance braces.
- [x] Comparing: select two points, predict < / = / >, reveal the matching explanation, including the smaller-magnitude rule for two negatives and the special case of zero.
- [x] Ordering: shuffled sets of four to six integers, ascending/descending checks, drag controls and keyboard/touch earlier/later buttons, targeted feedback, Show me and retry. Projection has a separate ordering view.
- [x] Horizontal and vertical lines, plain/thermometer/lift labels, point collision lanes, and internal phone scrolling that follows the selected point.
- [x] Brackets: tap the highlighted number or remove the next bracket, combine signs with the matching rule highlighted, predict before revealing, and step backwards/forwards at the teacher's pace.
- [x] Exact additive working for up to five terms, nested/square brackets, fractions and decimals. Decimal questions keep decimal notation in the lesson; equivalent fraction answers are still accepted. Reordering keeps each sign attached to its number.
- [x] Sign-then-size explanations and gain/loss bars, targeted wrong-sign/wrong-size hints, Show me, and hidden discussion answers. Invalid inputs preserve the current demonstration.
- [x] Lazy-loaded modes, expression bookmarks, explicit mode/history synchronisation, scoped clicker keys, session prediction preference, and English copy in `copy.ts`.

**Working checkout:** `C:\Users\t28ltk\Projects\lskc-maths (Chatgpt)`, branch `apps/directed-numbers`. Stage B adds no dependencies or Firebase access. Number-line exploration uses integer points from −100 to +100; arrow keys move by whole units. The bracket lesson supports exact rational values within the arithmetic engine's safe limits. Multiplication/division remain Stage C.

**Run locally:** open PowerShell in this checkout and run `npm.cmd run dev:all`. Open `http://localhost:3000/apps/directed-numbers#number-line`. No sign-in or seed is needed. If the local servers are already running, use the existing preview.

**Owner test (Stage B):**

1. Open **Number line**. A is −4 and B is −2. Turn Predict first on and choose >: read the correction. Choose <: the explanation says that −2 is further right and has the smaller magnitude.
2. Select A and enable **Show opposites**: its opposite is +4 and both distances are 4. Focus A and press Right, then Shift+Right: its value becomes +2. Set it to 0 to see that zero is neither positive nor negative and is its own opposite.
3. Add points until six are present, drag one, then remove it. Switch Appearance to **Lift**, then **Thermometer**: the labels change and greater numbers are higher. Try −100 or +100 using the value field; the range expands.
4. In **Put the numbers in order**, check the initial shuffled set. Read the hint, then move the chips using their arrows or drag them. **Show me the order** reveals −8 < −2 < 0 < +3. Change to six numbers and descending order, then retry.
5. Open **Brackets**. On `(+2) + (−3) − (−8)`, remove the first bracket. With Predict first on, choose + for `+ (−3)`: read the correction, then choose −. Continue to see `2 − 3 + 8`, then −1 + 8, then the double-underlined 7.
6. Enter `−3/2 + [4 + (−5)]`. Step through: the square bracket becomes −1 before the outer addition is simplified, and the answer is −5/2. Enter −2.5 or −2 1/2 in the answer field: either is accepted. A +2.5 answer gets the specific sign hint.
7. Enter `(−1) − (+3.8) − (−1.5)`. Show me gives −3.3, with gains 1.5 and losses 4.8. **Reorder the signed terms** keeps the same total. Try `3 × 2` or an unmatched bracket: a clear input message appears without replacing the lesson.
8. At phone width, switch modes with the selector and enter `5 − (−3)` using the keypad. Check that the page has no horizontal overflow and that the diagrams scroll within their own panels.
9. In Projection mode at 1920×1080, use **Explore points** / **Put the numbers in order**. In Brackets, focus the lesson area and use PageDown, PageUp, R, N and P. Typing in a field must not advance the lesson; controls and the latest working should remain visible.
10. Switch modes, use browser Back/Forward, and open a bookmark such as `#brackets:e=%E2%88%923%2F2%20%2B%20%5B4%20%2B%20(%E2%88%925)%5D`. The correct lesson and expression should load.

**Verification (passed):** All 128 unit tests, lint, typecheck, production build and `git diff --check`. Unit tests include step-by-step equality, all four sign combinations, left-to-right working, nested brackets, exact decimals, equivalent fractions, zero, unsafe intermediate totals, rendered highlight spans, ordering and range helpers. Browser review covers phone and projection layouts, keyboard point movement and clicker keys, pointer dragging, sign correction, exact answer entry, keypad input, expression bookmarks, mode changes and browser history. At 360 px, the document width is 345 px with no horizontal page overflow. At 1920×1080, the point controls, ordering controls and bracket input fit in the viewport; the working panel follows its latest line. The final browser check reported no console warnings or errors. Classroom-projector acceptance remains the owner's check.

**Stage boundary:** Stage B completes Number line and Brackets only. Stop for review before Stage C.

**Owner-requested bird method for Add & subtract (27/09/2026):** The [linked number-line video](https://www.youtube.com/watch?v=DBSviXhkubg&t=1s) inspired the bird visual. The owner's clarified teaching rule is: place the bird at the first number facing right; read the operation sign, then the second number's sign; turn around once for each minus sign; finally walk forwards by the second number's magnitude. The first number's sign only locates the starting point. Thus `(+3) − (−5)` turns right → left → right and moves forwards to `+8`. The original SVG bird turns on the teacher-paced number line one sign at a time, while Predict first asks students where it faces after each sign and gives specific correction notes. The lesson includes `+3 + (−7) = −4`, `−2 − (−4) = +2`, and `+3 − (−5) = +8`. Zero has a stay-put explanation. The original direction table, thermometer and lift remain available.

**Quick review of the bird method:** Open `http://localhost:3000/apps/directed-numbers#add-subtract`. Choose **+3 − (−5)** in **Follow the bird**. The bird starts at +3 facing right. Use **Read the operation sign** to turn it left, then **Read the second sign** to turn it right again; **Next** walks it forwards to +8. Turn on **Predict first** and retry: answer each facing question, including a wrong answer, to check the correction text. Try **+3 + (−7)** for one turn left and seven forwards steps to −4; **−2 − (−4)** starts facing right at −2 despite its negative first number and ends at +2. Try `(+4) + (0)` for no movement. On a phone, the page should fit at 360 px with the line scrolling inside its own box; in projection mode the step controls should remain visible at 1920×1080.

**Verification of clarified turn rule:** 135 unit tests, lint, typecheck, production build, and `git diff --check` pass. Browser review confirmed right → left → right and the final `+8` for `(+3) − (−5)`, the specific correction after each wrong facing choice, the one-turn `+3 + (−7)` explanation, a negative starting point, and the zero case. At 360 px there is no page-wide horizontal overflow; at 1920×1080 the projection controls fit after removing duplicate guide controls.

## Directed numbers — Stage C (27/09/2026)

- [x] × and ÷ **Pattern**: extend a fixed-factor table and column chart through zero; students predict the first negative multiplier's product and receive a change-per-row hint.
- [x] **Repeated addition**: adjustable negative hop size and 0–8 equal leftward hops, with one hop per click and cumulative working.
- [x] **Sign rules**: the four sign pairs for × or ÷, with a highlighted pair, sign-then-magnitude working, exact fraction answers, wrong-sign/wrong-size hints, and a clear division-by-zero message.
- [x] **Many factors**: build 2–6 factors joined by × or ÷, count negative signs, handle zero, show a reciprocal when dividing by a fraction, and reveal exact working one line at a time. A custom ×÷ expression is available outside projection mode.
- [x] **Mixed operations**: eight worked examples and custom input; choose the next operation, then reveal one line at a time. Innermost brackets, ×÷ before +−, left-to-right within a level, mixed-to-improper conversion, reciprocal division, exact fractions, written decimal notation until calculation, optional sign working and decimal form, and final-answer feedback are supported.
- [x] Full-arithmetic working engine and textbook fixtures, including printed minus signs and keyboard hyphens. Existing additive Brackets working remains intact.

**Working checkout:** `C:\Users\t28ltk\Projects\lskc-maths (Chatgpt)`, branch `apps/directed-numbers`. This stage changes only the directed-numbers app, English copy, and this plan. It adds no dependencies or Firebase access.

**Run locally:** open PowerShell in this checkout and run `npm.cmd run dev:all`, then visit `http://localhost:3000/apps/directed-numbers#multiply-divide`. No sign-in or seed is needed. Reuse the local servers if they are already running.

**Owner test (Stage C):**

1. In **× and ÷ → Pattern**, keep +5 and advance to `+5 × 0 = 0`. Predict `+5 × (−1)` incorrectly as +5; read the −5-per-row correction. Enter −5 and continue to −4. Change the fixed factor to −3 and watch the pattern cross zero in the other direction.
2. In **Repeated addition**, use size 3 and count 4. Press Next hop four times: the marker should land at −3, −6, −9 and −12, with one more `−3` in the sum each time. Set the count to 0 and check the stay-at-zero explanation.
3. In **Sign rules**, try `−6 × +3` with +18: the feedback should say the size is right but the sign is wrong. Reveal −18. Switch to `−6 ÷ +3`, then test same-sign examples. Set the second number to 0 for the division-by-zero message; try a fractional quotient.
4. In **Many factors**, use the initial `−2 × +3 ÷ −4`: two negative signs give a positive result; step through to +3/2. Add factors up to six, change one sign and observe odd/even parity, then try 0 and a zero divisor. Enter `(+6) ÷ (−3/5) × (+5)` as a custom expression and inspect the reciprocal and exact working.
5. Open **Mixed**. For `(+4) + (+3) × (−2)`, choose addition first to see the order correction. Choose multiplication and step to −2. Turn on **Show sign working** and repeat to see the sign before the magnitude calculation.
6. Choose the bracket example `[(+5) − (−4)] × (−2)` and the mixed-number example `(−2 1/4) ÷ (+3/2) + (+1)`. Check that brackets and mixed-to-improper conversion appear before the remaining arithmetic. Try a wrong final sign in the answer field.
7. Enter `12/(5 + (−8)) − (−3)` and `[(−15) + (+7) × (−2)] / [(−3)(+2) + 1]`; use Back, Next and Show me. Try invalid input or division by zero: the current lesson should stay in place with a clear message.
8. At 360 px, switch panels and modes using the phone controls; the page should have no horizontal overflow. At 1920×1080, turn on Projection mode and check that the Mixed step controls and Many-factors step controls remain visible. Try an expression bookmark such as `#mixed:e=%28%2B4%29%20%2B%20%28%2B3%29%20%C3%97%20%28%E2%88%922%29`.

**Verification (passed):** 166 unit tests, typecheck, lint without warnings, production build, and `git diff --check`. Browser review covered the zero-crossing prediction and correction, leftward SVG hop, sign-rule correction and reveal, factor-chain sign and reciprocal working, mixed-order wrong-choice correction, 360 px phone width without document overflow, 1920×1080 projector controls, and no browser-console warnings or errors. Classroom-projector acceptance remains the owner's check.

**Stage boundary:** Stage C completes × and ÷ and Mixed only. Stop for review before Stage D.

## Directed numbers — Stage D: Play framework (28/09/2026)

**Built:** Play hub with six open worlds, three levels per world, 54 possible stars, XP, six rank titles, avatar frames and device-only progress/settings. Worlds 1 and 5 use the shared Run format, with first-operation choices in mixed questions, short mistake feedback, answer review and links back to the matching Learn mode. Challenge Run uses an eight-character set code that reproduces the same questions. The ten-question daily set uses the Hong Kong date and tracks a streak. Lift Rush has a 16-floor tower, floor-by-floor movement, keyboard controls and a 12-passenger Relaxed option. Pure generators, 11 misconception patterns, nickname/code helpers and directed scoring are ready for the later server challenge stage. No Firebase schema, rules or packages changed.

**Run locally:** open PowerShell in this checkout and run `npm.cmd run dev:all`, then visit `http://localhost:3000/apps/directed-numbers#play`. No sign-in or seed is needed. The local Firebase emulators are needed for the site's app-availability check, but Play progress stays on this device.

**Owner test (Stage D):**

1. Open **Play ★**. Check six worlds and three level buttons in each. Every level should open; World 1 should be recommended at first. The header shows 0 of 54 stars and the Novice rank on a fresh device.
2. Start **Number Line Town → Level 1**. Answer a comparison, an ordering question and the marked line. Choose a wrong comparison sign once: read the short number-line hint and use **Show me** to open the Learn mode.
3. Start **Order Castle → Level 1**. Choose **Add first** for a sum that includes multiplication, then enter the correct final number. The answer is still marked wrong because the first step matters; the feedback says to multiply first. Try another question with the correct first step and press Enter in the answer box.
4. Finish a Run and inspect the directed-number score expression, stars, XP and **Review answers**. Try **Next level**. Progress should remain after a reload, and a replay should keep the higher star count and personal-best score.
5. Open **Challenge Run**, select five questions and make a set code. Copy the eight characters, finish or leave the run, then enter the same code. The questions should be identical and in the same order. Enter a code containing `O` for the validation message.
6. Open **Today's challenge**. It should contain ten mixed questions; after completion, the hub says today's challenge is complete and shows the streak. Another device on the same Hong Kong date gets the same questions.
7. Start **Lift Rush → Level 1**. For a passenger sum, tap the destination floor from B5 through G to 10/F. Also focus the game and use ↑, ↓ and Enter. A wrong floor should reveal the correct destination with a short explanation. Let the 60-second run end and inspect the stars and score.
8. Open **Settings**. Change nickname, avatar and frame; turn on **Relaxed mode** and play Lift Rush again. It should use 12 passengers without a timer. Reset progress only if you want to erase this device's test stars and XP.
9. At 360 px, try the map, Run and Lift Rush without horizontal page scrolling. At 1920×1080, enable Projection mode and check the question, controls and feedback from the back of the room. Repeat a Run and Lift Rush using only the keyboard.

**Verification (passed):** 182 unit tests, typecheck, lint without warnings, production build and mobile/projector browser checks. In the browser, the 360 px map, Lift Rush and Order Castle had no document overflow; the 1920×1080 Lift Rush controls fit the viewport. Arrow keys plus Enter reached the correct Lift floor, and keyboard selection plus Enter submitted a correct Order Castle answer. A wrong first-operation choice displayed the correction; a five-question coded Run reached the score/review screen. Classroom-projector acceptance and use on student phones remain the owner's checks.

**Known limitations:** Sign Snap, Target Hop, Red Pen Hero and the full 15-stamp book are Stage E; optional sound/vibration and Relaxed mode still need checks in those games. Class challenge persistence, teacher controls and leaderboards are Stages F–G. On a new device, progress starts afresh because it is local storage, not a student account.

**Stage boundary:** Stage D stops here for owner review. Build Stage E only after approval.

## Directed numbers — Stage E: games and rewards (28/09/2026)

**Built:** Sign Snap now uses sign cards for × and ÷, left/right/down keyboard controls, swipe, an occasional zero card, a 45-second timed round with faster correct-card pacing, and exact-value boss cards. Target Hop has ten solvable puzzles per level, an animated −12 to +12 line, reusable-card prevention, Undo, a shortest-route hint and per-puzzle stars. Red Pen Hero has four ordinary pages and a two-mistake boss page per level, with one clean page, three red pens, reason choices and corrected working. The 15-stamp book shows conditions for locked stamps and awards new stamps from saved device progress; new stamp inks unlock with ranks and a certificate appears on collecting all 54 stars. Game feedback uses short, specific sign and operation explanations. Optional sound, vibration and Relaxed mode are wired into the new timed game, and reduced-motion settings reach the shared game effects. Firebase and packages are unchanged.

**Run locally:** in this checkout run `npm.cmd run dev:all`, then open `http://localhost:3000/apps/directed-numbers#play`. If those servers are already running, open the URL directly. The local Firebase emulators provide the site's app-availability check; Play progress is stored only in this browser.

**Owner test (Stage E):**

1. Open **Play ★**. Select **Sign Snap → Level 1**. On a negative card, swipe left or focus the game and press ←; use → for positive and ↓ or 0 for zero. Check that the card moves towards the matching side of the line and a wrong choice explains the sign in simple terms.
2. Let a Sign Snap round end. Check its score expression, stars and XP. In **Settings**, turn on **Relaxed mode** and replay: 12 cards replace the timer. Try Level 3 and enter the exact value on a fifth-card bonus question.
3. Select **Hop Island → Level 1**. Use the move cards to reach the flag, press **Undo**, then try **Hint**. Check the avatar moves along the number line, used cards cannot be replayed, and a shortest route earns three puzzle stars. Try **Show solution** on another puzzle.
4. Select **Red Pen HQ → Level 1**. Tap a wrong line and choose its reason; read the corrected line beneath it. Tap a correct line on another page and check that one red pen is used. Page 2 should accept **All correct!**, and page 5 should ask for two mistakes.
5. Open **Stamp book**. Check all 15 names and conditions. Earn a world-level result and verify the new stamp appears; reload and check it remains. Rank up to see additional stamp-ink choices in Settings.
6. With sound and vibration off, then on, compare game feedback. Enable **Reduce motion** and check that card movement, stars and confetti stop animating. Vibration requires a device and browser that support it.
7. At 360 px, check Sign Snap, Target Hop, Red Pen Hero and the stamp book for page-wide horizontal scrolling. At 1920×1080, enable **Projection mode** and check the working and controls from classroom viewing distance. Try each game using only the keyboard (Tab, Enter or Space; Sign Snap also uses arrow keys).

**Verification (passed):** 186 unit tests, typecheck, lint and production build. Live browser checks at 360 px found no page-wide horizontal scroll in the hub, Sign Snap, Target Hop, Red Pen Hero or the stamp book; a Sign Snap arrow-key answer, a shortest Target Hop route, and a Red Pen correction were exercised. Sign Snap's Relaxed mode showed 12 cards and no timer. Red Pen Hero also worked with keyboard Enter and fit a 1920×1080 projection view with no horizontal scroll. Browser console reported no errors or warnings.

**Known limitations:** The three class-related stamp conditions will unlock only when Stage G connects class challenge results. Progress remains local to one browser/device. The owner's classroom projection, sound and phone-vibration checks are still needed.

**Stage boundary:** Stage E stops here for owner review. Stage F needs separate approval.

## Directed numbers — Stage F: challenge backend (28/09/2026)

**Built:** Firebase Admin verifies student ID tokens and re-marks every answer in Node API routes. Join, start and submit use server transactions; the server measures time, limits attempts and starts, keeps optional class numbers in a teacher-only collection, updates question stats and class averages, and returns the student's rank. Teachers can close, extend or delete rooms; closing and extending align existing child records' 60-day expiry dates. Firestore rules keep every score write server-only and prohibit listing join codes. Anonymous Firebase users appear as visitors without an account menu. The local seed adds a lobby room with code `MATH23` and five generated players. The 15-question set-code option keeps old codes compatible. The exact join-page privacy wording is ready in `copy.ts` for Stage G.

**Run locally:** in this checkout run `npm.cmd run dev:all`. In another PowerShell window run `npm.cmd run seed`, then open `http://localhost:3000/apps/directed-numbers#play` and `http://127.0.0.1:4000/firestore`. The local Firebase project must be `demo-lskc-maths`. The challenge join and leaderboard pages arrive in Stage G, so the Stage F owner check uses the emulator and existing Play page.

**Owner test (Stage F):**

1. Open **Play ★**. The six worlds and games should still open. **Join a class challenge** remains disabled until Stage G.
2. Open the **Firebase Emulator UI → Firestore → rooms → demoDirectedNumbers01**. Check that the code is `MATH23`, status is `lobby`, playerCount is 5 and the setting uses five questions.
3. Open **entries** under that room. Check that the five players have generated nicknames and avatars, with no student emails or real names.
4. Open **private** under the same room. Check that class numbers are separate from the public entries. The rules tests verify that students cannot read this collection.
5. Open **roomCodes → MATH23**. It should point to `demoDirectedNumbers01` and show an expiry date 60 days after the room's scheduled close.
6. At a 360 px browser width, reopen Play and a game; check for page-wide horizontal scrolling. At 1920×1080, turn on **Projection mode** and use Tab and Enter to open a game and answer a question.
7. Stop `dev:all`, then run `npm.cmd run test:rules` and `npm.cmd run test:challenges`. Expect 24 rules tests and six challenge tests to pass, including denied score writes, replay rejection, server re-marking and expiry alignment.

**Verification (passed):** 186 unit tests, 24 public/school rules tests, six emulator challenge tests, lint, typecheck, production build and `git diff --check`. A local anonymous Auth token joined `MATH23` through the HTTP API as `Swift Fox 2`; Start correctly refused the lobby room. The Play page had no horizontal overflow at 360 px or 1920×1080. In projection mode, keyboard Enter opened Red Pen Hero, selected the wrong line and chose a reason; the correction appeared. A browser-injected `data-pdffiller-skip` attribute produced one hydration warning in the in-app browser; the warning points to that injected attribute, not an app component.

**Known limitations:** Stage G adds the teacher and student pages, live boards, QR codes and an end-to-end two-window test. Before real students use them, enable Firebase Anonymous sign-in and Firestore TTL policies for `expireAt` on room, code, entry, private, run, stats and class-board collection groups, and compare the join-page notice with the school's data-privacy policy. No real Firebase project was changed. The numeric rank key resolves elapsed time to 10 ms and submission order into one million intervals across the room's open period; very close submissions can share a rank. The classroom projector and student-phone check remain for the owner.

**Stage boundary:** Stage F stops here for owner review. Stage G needs separate approval.

## Directed numbers — Stage G: challenge experience and boards (28/09/2026)

**Built:** Teachers can create and list live or homework challenges, project a lobby code and QR code, follow a live top-10 board, reveal the podium one place at a time, inspect a per-question accuracy chart with **Show me** links, and see class numbers in a teacher-only result table. Students can join with a generated nickname and avatar, wait for the teacher, complete a server-marked run, see their directed-number score and gap to the next place, and review their answers. A run and result survive a page refresh in the same tab. `/boards` shows seasonal class averages after five players. The Play hub and site header link to these routes. The teacher form offers one-tap Gentle scoring, No timer and Avatars only presets.

**Run locally:** open PowerShell in this checkout and run `npm.cmd run dev:all`. In a second PowerShell window in the same checkout, run `npm.cmd run seed`. Keep the first window open while testing. All challenge data is in the local `demo-lskc-maths` emulators.

**Owner test (Stage G):**

1. Open two browser windows, one signed in as the seeded teacher and one private window as a student, and join room `MATH23`. In the teacher window, go to `http://localhost:3000/login` and choose the **Teacher** local-test button; the student window needs no sign-in.
2. In the teacher window open `http://localhost:3000/challenges/demoDirectedNumbers01`. Check that the lobby shows `MATH23`, a QR code, five demo avatars, and the new student's avatar after joining.
3. In the private window open `http://localhost:3000/join`, enter `MATH23`, choose a generated nickname and avatar, and click **Join challenge**. Check the privacy notice and waiting screen; only the teacher should see an optional class number.
4. Back in the teacher window click **Start**. The student should see **Start my questions**, a 3–2–1 countdown, then five questions. Answer or skip them, and refresh once during the run: it should return to the same question.
5. Finish the student run. Check the score expression, personal-best stamp, gap to the next place and **Review answers**; wrong answers show a correction and **Show me**. Refresh the result page and confirm it remains visible. The phone should not show how far the student is from first place.
6. In the teacher window, check the live board shows the student's server-marked score and no ranks below 10th. Click **End now**, then **Reveal next podium place** until all finishers are shown (once if only one student finished). Check the podium, accuracy bars, and a **Show me** link that opens the matching Learn mode.
7. Open **Teacher details** to see class numbers privately, then open `http://localhost:3000/boards`. A class needs five completed players before it appears; check that classes are sorted by average score, not total score.
8. Open `http://localhost:3000/challenges/new?app=directed-numbers`, try the **Gentle scoring**, **No timer** and **Avatars only** presets, and create a fresh room. Check the new code and QR code. At 360 px there should be no horizontal page scrolling; at 1920×1080 the lobby, live board and podium should be readable from the back of the classroom. Use Tab and Enter to operate the form and main controls.

**Verification (passed):** Lint, typecheck, 186 unit tests, production build, 24 rules tests, six challenge backend tests, five Playwright browser tests, and `git diff --check`. The new browser test uses separate teacher and anonymous-student contexts; it checks room creation, joining, refresh during a run, refresh after results, and a score on the teacher board. Manual browser checks found no page-wide overflow at 360 px on Join and the teacher form; the lobby QR and avatars rendered at 1920×1080. Production-build Lighthouse mobile scores were `/join`: 51 performance / 100 accessibility / 100 best practices / 100 SEO, and the directed-numbers app: 65 / 100 / 100 / 100. Lighthouse warned that this local device's CPU is slower than its expected calibration; unused JavaScript and main-thread work remain performance opportunities.

**Known limitations:** The school's data-privacy policy has not been provided for comparison with the join-page notice. Real Firebase still needs Anonymous sign-in and seven Firestore TTL policies before students use the boards. The owner should verify actual phones, classroom projector legibility, QR scanning and the school's Google domain if school-only mode is planned. No real Firebase project was changed. Progress and avatar frames remain local to one browser/device.

**Stage boundary:** Stage G completes the seven-stage directed-numbers brief. Stop for owner review; do not deploy or change real Firebase without a separate request.

## Directed numbers — design refinement (02/10/2026)

**Built:** Learn, Play and Compete now have distinct primary navigation, with lesson navigation beneath Learn. Number Line Quest has a clearer profile and XP panel, daily challenge, six individually illustrated world cards, aligned level controls, and a keyboard-accessible shortcut to the map. The palette remains the school's navy, paper, pencil and yellow highlighter; the six landmarks are original lightweight SVGs. Hover movement respects the device and game reduced-motion settings.

The join page explains the three steps before a large code field; loading and disabled states are visible, and successful code lookup moves focus to the challenge heading. Nickname controls wrap on narrow phones. Teacher presets show their selected state. Class-average labels remain legible over every bar, including zero and negative scores. A compact live join strip leaves room for ten ranks in two columns on large displays; rank movement accounts for both horizontal and vertical changes. The podium puts first place in the centre, with distinct heights and medal-colour rules.

**Review and iteration:** Checked the layout at 360, 768, 1440 and 1920 pixels. Reduced the mobile introduction, added the direct map shortcut, corrected nickname wrapping and button alignment, and fixed the shared header overflowing at tablet widths when a teacher is signed in. The tablet now uses the expandable menu. Original design references were the [Awwwards evaluation criteria](https://www.awwwards.com/about-evaluation/) and [Webby judging criteria](https://www.webbyawards.com/judging-criteria/): visual clarity, usability, audience-appropriate interaction and coherent overall experience. This is a design benchmark, not an award or score claim.

**Verification:** Lint, TypeScript, 186 unit tests and the production build passed. Browser inspection confirmed no page-wide horizontal overflow on the checked phone/tablet views, keyboard access to the map and a game, reduced-motion behaviour, readable positive/zero/negative class averages, the live top ten fitting a 1920×1080 viewport, and the staged podium reveal. The bird example `(+3) − (−5)` still turns left at the first minus and back to the right at the second minus. No browser errors or warnings were reported in the inspected session. All five Playwright end-to-end tests, 24 security-rules tests and six challenge backend tests also passed; `git diff --check` is clean. The existing two-window test exercised teacher room creation, anonymous joining, refresh recovery, server marking, the live board and podium reveal after the design changes.

**Owner test:** Run `npm.cmd run dev:all` in this checkout and `npm.cmd run seed` in a second PowerShell window. Open `http://localhost:3000/apps/directed-numbers#play`. Try **Choose a world**, a level, **Settings → Reduce motion**, and **Learn**. Resize to a phone and tablet width and check the menu, spacing and touch targets. Open `/join`, enter `MATH23`, and follow the nickname form. For the teacher flow, sign in at `/login` using a local test account, then use `/challenges/demoDirectedNumbers01` and the Stage G two-window test above. Class averages require five completed players. Check the final appearance on the actual classroom projector and student phones.

**Scope:** Local design and interaction refinement only. No new packages, production data changes or deployment. The temporary populated-board fixtures were confined to the demo emulator. Stage G's launch and privacy checks remain applicable.

## Decision log

- 20/10/2026 — The owner approved publishing Chapter 5 practice, including watermark removal and single-line proof reasons, through the existing GitHub/Vercel website. Keep production Firebase data, rules and configuration unchanged.

- 20/10/2026 — Chapter 5 uses the existing Similarity practice classroom, restricted to congruent-triangle Quick Practice and Level 2 questions. Transformations cannot resize individual triangles. Keep this addition local for owner review; publication of earlier Similarity work does not authorise a new release.

- 2026-10-11: Boundary teaching distinguishes recorded limits from continuous measurements before rounding. Its positive examples use round-half-up and lower-inclusive/upper-exclusive classes, so 35.5 enters 36–40 and 40.5 enters 41–45 exactly once. The exploration uses separate examples and does not alter the main dataset.

- 2026-10-11: The owner requested one latest GitHub version for Dot. Consolidate the production source into `main`, make it the default, and remove superseded remote branches only after verifying their commits are ancestors of `main`. Preserve Git history and all local checkouts.

- Four-word vocabulary uses a separate teaching example so raw lab data is untouched; class width is boundary-to-boundary, and half-step corrections follow the stated recording precision. Release preserves the already-published Directed Numbers snapshot, which is not yet on GitHub main.

- 10/10/2026 — Directed numbers: animate the bird reading the operation sign and the second number's sign separately. Each minus turns it around; the starting number only sets its position. Play/Pause/Replay follow the same steps as manual controls. Walking covers one number-line unit per step for all supported integer magnitudes (0–20), including magnitudes above 10. Show the active sign and distance counter, retain reduced-motion support, and keep the projector explanation compact. Published to the official website on the owner's explicit request; release details below.

  Owner test: run `npm.cmd run dev:all`, then open `/apps/directed-numbers#add-subtract`. Select `−2 − (−4)` and press **Play animation**: start at −2 facing right, turn left, turn right, then walk four units to +2. Try Pause, Replay, Restart, the ± controls, zero and a magnitude above 10. Check the phone layout and Projection mode.

  Verification: 82 directed-number maths tests and eight browser tests passed, covering all four sign combinations, pause/replay/restart, zero, 14 unit steps, reduced motion, keyboard use, 360 px phone and 1920 px projection layouts, and intermediate CSS transforms during turns and walking. Production build and TypeScript passed; phone and projector screenshots were inspected.

  Production release (10/10/2026): Vercel project `prj_gDfV3Ghov8KxYuPORUZ6J4DyIEIc`, team `team_uV3gE1tXDyPLZgD0VVTk3BNh`; deployment `dpl_GHsz5exfFmk9Zb6RRQ1Zw62Y1VEm` is READY and promoted to `https://lskc-maths.vercel.app`. Source snapshot: base `00e888a5c00730447aeb1a656b5d1e471016d9b2` plus the directed-number animation files and the bird copy block; unrelated statistical-chart drafts were excluded. The local manifest is `out/bird-release.json`. Vercel built with the existing production settings; local emulator configuration and Firebase rules/data were not changed. Home, Directed Numbers and Statistical Charts returned HTTP 200; an unsigned POST to `/api/challenges/join` returned 401. No error logs were returned for this deployment during the release check. Previous production deployment: `dpl_DcHqpQK36nnNZx1cbrCCV522QARa`.

  Live browser verification: all eight animation checks passed on the official domain. Three passed initially; five timed out at the initial app-loading screen with the local 5-second expectation and passed when rerun with a 20-second production loading allowance. No animation code or assertions were changed for the rerun. Production test configuration and screenshots are in `out/bird-live.config.ts` and `out/bird-live-results/`.

- 2026-10-09: Statistical Charts Phase 3 keeps classroom controls local and unauthenticated. Shared activities use a validated
  versioned URL fragment (8,000-character limit) or JSON file fallback (250 KB). Only the active data source is exported;
  practice attempts and personal-name fields are not stored. Comparisons share numeric domains, including print/export.
  Award-site references inform visual QA while preserving the LSKC exercise-book design. No public deployment is implied.

- 09/10/2026 — Owner requested Statistical Charts Lab Phase 2. Keep all activities tied to the active data; grade mathematical coordinates and histogram extents, reject the wrong join method, and show misconception-specific correction/retry routes. Curve practice constructs and smooths polygon anchors; freehand curve grading and manual axis design are not claimed. Browser tests use a fresh isolated local server on port 3217.

- 09/10/2026 — Statistical Charts Lab follows the owner's supplied brief: deliver tested Phase 1 first. Use a pure shared calculation module and numerical SVG rendering, keep the department palette, and add a backend-free static build. All classes use lower-inclusive/upper-exclusive boundaries for consistent less-than cumulative frequencies; automatic fitting covers the maximum. Later-phase features are explicitly deferred.

- 02/10/2026 — The owner requested an iterative visual-quality review. Retain the exercise-book identity and calm Learn screens, give the six Play worlds distinct illustrated landmarks, and improve navigation and competition readability. Use a collapsed shared menu below 1280 px to accommodate all teacher links without page overflow.

- 28/09/2026 — Stage G keeps the student's phone focused on the gap to the next place, following the owner's explicit request; the teacher board shows at most the top 10. Correct-answer review uses the same pure grader as the server, so equivalent answers do not get an unnecessary correction. The class board offers the current and previous five school terms.
- 28/09/2026 — Challenge result and in-progress question state are held in per-tab `sessionStorage` so a refresh returns to the same point; the server remains authoritative for the run and score. Phase 8 must enable Anonymous Authentication, the seven `expireAt` TTL policies, and App Hosting Node routes with Admin default credentials. App Check remains a later abuse-control option.
- 28/09/2026 — Stage F challenge scores are re-marked on the server and browser-supplied scores and timings are ignored. A student can still calculate answers outside the app or inspect generated questions in developer tools; this is acceptable for class practice. App Check remains an option if abuse appears. The 60-day privacy promise requires launch-time Firestore TTL policies, and early closing or extending a room updates every existing child document's expiry.
- 27/09/2026 — Directed numbers Stage B: preserve decimal notation for decimal-only bracket questions, retain exact fractions internally, and give the ordering activity its own projection view so all six chips stay visible. Point exploration stays on integer positions; fractions and decimals are available in Brackets. Native history updates keep mode links and browser Back/Forward in sync without reloading the lesson shell.

- Hosting: Firebase App Hosting (one platform with Auth/Firestore/Storage). Requires Blaze plan.
- UI language: English only — no Chinese topic names (owner's decision, 2026-09-21). Re-addable later as one optional field.
- M2 deferred: the level and strands exist in the constants, but nothing is seeded or built for M2 until asked.
- **Access: public for now.** The owner asked that anyone be able to view the site. Reading is open to the internet for topics, site content, app listings and student-edition books; teacher-edition material and every write still require a teacher sign-in. Built as a build-time switch (`NEXT_PUBLIC_ACCESS_MODE`) so it can be closed to `lskc.edu.hk` later without touching page code. A Blaze budget alert is required at launch because public read means public egress.
- Palette taken from the school crest (#DA2127 red, #0F4574 navy) rather than invented colours; the exercise-book theme is rendered in those.
- Topic codes (`1A01`, `2B07`, `Ch13`) are stored on each topic, so the site matches the file names the department already uses. Senior forms share one Ch0–Ch31 sequence across F4–F6.
- Phase 2 (2026-09-25): Teacher status requires a verified email on an allowed domain **and** `teachers/{lowercased email}`; `isAdmin` on that document grants admin status. The first admin is seeded only in the demo emulator. In a real project the first admin document must be created manually during Phase 8.
- Phase 2 (2026-09-25): `npm run rules:build` validates the mode/domains from `.env.local` and generates both rules files. The tests render the same templates in `public` and `school` modes. Storage denies file listing, limits writes to teacher accounts, approved types and 20 MB, and reads teacher editions only for teachers.
- Phase 2 (2026-09-25): The login page offers password-based **local emulator test buttons** for three seeded, verified accounts; normal sign-in uses Google. `npm run seed` hard-stops unless emulator mode and the `demo-lskc-maths` project ID are set. The seeded viewer has no teacher document. An admin cannot remove or demote their own account in the UI or rules.
- Phase 3 (2026-09-25): The topic editor handles one level per topic, matching all 69 source rows; `levels` remains an array in Firestore for a future shared-topic feature. Reordering saves sequential `order` values for the selected level. The seeded rows use stable IDs such as `f5-ch18`, so reseeding updates their code, name, strand and order without duplicating them or deleting topics added in the editor.
- Phase 3 (2026-09-25): Deleting a topic first queries `mistakeBooks` for a matching `topicId` and refuses deletion when any book uses it. Firestore rules still restrict topic writes to teachers. This is an editor integrity check; Phase 4's book workflow must preserve valid topic references when books are added or moved.
- Phase 4 (2026-09-26): A book uses a fixed Storage path `mistake-books/{edition}/{bookId}/{bookId}.{fileType}`. Edition, file type, uploader and path cannot be changed after creation; replacing a file keeps its path. Storage reads require a matching book record and its exact path, so orphan or unrecorded files remain unreadable. Teachers may upload only the three approved types up to 20 MB. Files are read through `getBlob`, not shared download tokens; HTML uses an iframe with `allow-scripts` and no same-origin permission.
- Phase 4 (2026-09-26): The public access decision still applies to student-edition files, including downloads by signed-out visitors. The Home latest list includes student editions only. `react-pdf` is used for in-page PDF rendering. Real-bucket CORS setup is deferred to Phase 8; no real Firebase project was changed.
- Phase 5 (2026-09-26): Web Apps are registered in a static typed list and lazy-loaded on their detail pages. The index reads the registry directly; Phase 6 will merge saved teacher settings for visibility and ordering. The apps do not use Firebase. New apps add their wording to the central `copy.ts` file and one registry entry.
- Phase 5 (2026-09-26): The inequality tool accepts a small documented grammar for one linear inequality or a bounded compound inequality; it parses input without evaluating code. Presentation mode enlarges the tool in the page when the browser cannot enter fullscreen, and its button waits for the lazy app to hydrate.
- Phase 6 (2026-09-26): Home copy lives in `siteContent/home`; per-app title, summary, featured, visible and order settings live in `appSettings/{slug}`. The static app registry supplies defaults and available routes. Teachers can edit in the page; Firestore rules validate every saved field and authorize writes. The seed script creates default Home content only when absent, preserving teacher edits on later runs.
- Phase 6 (2026-09-26): Hidden apps remain visible to teachers for editing. Visitors and viewers cannot see them in the index or open their direct routes. Saved settings are loaded before a detail app renders, so a hidden app is never briefly exposed while loading. The edit toggle resets on sign-out.
- Phase 7 (2026-09-26): `npm run test:e2e` uses the installed Chrome browser, starts the local app and demo emulators on free ports, waits for all emulators, and seeds the three local test accounts before running four smoke tests. A hard check on the emulator flag and `demo-lskc-maths` project ID prevents this setup from seeding any real Firebase project. Lighthouse was run as a one-off CLI tool against the local production build; it was not added as a project dependency.
- Phase 7 (2026-09-26): Production Lighthouse mobile performance is 78 on Home and 77 on Quadratic Explorer, with accessibility, best practices and SEO at 100 on both. The report's largest opportunity is unused JavaScript; a larger bundle split was deferred because these pages need the Firebase Auth and Firestore clients and Phase 7 has no performance-score target. Recheck with real content after launch.
- Phase 8 preparation (2026-09-26): App Hosting uses `apphosting.yaml` for the public access mode, teacher domain and emulator-off flag. The linked Firebase web app supplies `FIREBASE_WEBAPP_CONFIG` at build time; `next.config.ts` maps it to the site's six `NEXT_PUBLIC_FIREBASE_*` values, keeping real project values out of git. The existing `firebase.json` already names both generated rule files and Firestore indexes. README now records the exact live setup, CORS and verification steps. No real Firebase project has been changed; live setup and tests remain open.
- Phase 8 preparation (2026-09-26): Read-only Firebase CLI inspection found an existing LSKC project with a Claim Tracker web app and default Firestore, on the Spark plan. Deploying this site's rules there would replace rules used by that project. The launch guide therefore calls for a dedicated Mathematics project; no existing Firebase project was modified.

### Phase 1 design decisions (2026-09-21, approved by the owner)

Type: **Spectral** for headings (a text face, not a UI face — keeps the exercise-book
feel), **IBM Plex Sans** for everything else (unambiguous digits and `1 / l / 7`, which
matters on a maths site), KaTeX's own fonts for notation. Scale: hero
`clamp(2rem, 4.6vw, 3.25rem)`, section 1.375rem, card 1.125rem, body 1rem, meta 0.8125rem.

Home, top to bottom:

```
+--------------------------------------------------------------+
| [crest] LSKC Mathematics          Home  Web apps  Mistakes    |  navy bar
|         S.T.F.A. Lee Shau Kee College            book [Sign in]
+--------------------------------------------------------------+
|  . . . . . . . . . . graph paper . . . . . . . . . . . . . .  |
|   Mathematics Department        |        \        /           |
|   Interactive tools for the     |         \      /            |
|   classroom, and every          |          \____/  <- drag    |
|   Mistakes Book in one place.   |      [ y = 0.5(x-1)^2 - 2 ] |
+--------------------------------------------------------------+
|  =========== navy              |  =========== crimson         |
|  Web apps                      |  Mistakes book               |
|  Interactive tools by level... |  Correction notes by topic...|
+--------------------------------------------------------------+
|  Latest uploads                                               |
|  [F5] Ch18  Measures of dispersion - quiz 3           18 Sep  |
|  [F3] 3A03  Linear inequalities in one unknown        15 Sep  |
+--------------------------------------------------------------+
```

- The draggable parabola is the one bold element; everything else stays quiet. It links
  through to the full quadratic explorer (Phase 5) rather than duplicating it.
- Entry cards carry their identity as a 3px top rule (navy / crimson), not as shadowed
  boxes. No gradients, no entrance animations.
- The hero band is literal graph paper (CSS grid lines); the parabola is drawn straight
  onto it, so there is only ever one grid on screen.
- **Deviation from the approved mock-up:** on a phone the title and intro come first and
  the graph follows, rather than the graph on top. A 270 px graph above the title pushed
  everything below the fold. Easy to flip back if the owner prefers the original.
- The vertex is keyboard operable (`role="slider"`, arrow keys, 0.5 steps) and
  touch-draggable; pointer capture keeps a drag alive outside the circle.

### Phase 0 decisions (2026-09-21)

- **The project lives on local disk**, `C:\Users\t28ltk\Projects\lskc-maths`, not in Google Drive. `node_modules` is tens of thousands of small files and would keep Drive syncing constantly. Backup is GitHub, which App Hosting needs anyway. A `MOVED - read me.txt` note was left in the old Drive folder.
- Installed on the owner's machine via `winget`: **Node.js 24.19.0 LTS** and **Microsoft OpenJDK 21** (the Firestore and Storage emulators are Java programs).
- `@types/node` raised from create-next-app's `^20` to `^24`, matching the installed Node and required by Vitest 5.
- npm 11 blocks package install scripts by default. Five are approved by name in `package.json` → `allowScripts` (`@firebase/util`, `protobufjs`, `unrs-resolver`, `esbuild`, `re2`). Adding a dependency with install scripts will need the same approval.
- `firebase-tools` is a **dev dependency**, not a global install, so the version is pinned in the repo and survives a new machine. Call it via `npx firebase` or an npm script.
- Next.js telemetry disabled.
- Markdown files are excluded from Prettier so the hand-written tables in `CLAUDE.md`, `PLAN.md` and `docs/topics.md` keep their layout.
- File access via SDK `getBlob`, not persistent download URLs, so rules apply on every read.
- Uploaded HTML rendered only in a sandboxed `srcdoc` iframe without `allow-same-origin`.
- Teachers edit, students view: every browser-editable collection is teacher-write-only in the rules; students have no write path.
- Hiding a Web App is a display choice, not a secret: the app code ships with the site, so hidden apps are simply removed from students' lists and pages.


### Polynomial games release (24/10/2026)

- Owner approved publication to the existing Vercel project.
- Added multiple-choice Polynomial Quest and a 32-device class room with eight independent two-versus-two tug matches. Both partners must solve before a pull; four skill tiers increase pulling power.
- Verified 32 identities, concurrent scoring and ownership in the demo emulator; teacher plus four browser contexts completed all levels, refresh, retries and pause/resume. The 32-token HTTP/eight-group projector test and 13 solo-game browser checks pass.
- Fresh review corrected predictable option order and mismatched room-code alphabets. The projector overview fits all eight groups at 1920 by 1080; 360/390px student views were inspected.
- Production verification and release evidence are recorded in docs/polynomial-tug-verification.md.

### Polynomial Arcade and timed force (24/10/2026)

- Colourful original tug crews and Quest guardians; flexible attendance; shared energy and three activatable skills.
- Difficulty plus server-timed first-try completion determines force. Whole-pair time excludes teacher pauses; harder levels allow longer windows. New games use 48-unit goals, existing games retain untimed 24-unit rules.
- Final local matrix: 1372 unit tests,5 demo integration tests,5 classroom browser flows (32 independent students, 384 correct answers through all four levels),13 solo browser checks, types/lint/build and rendered phone/projector QA pass.
- Production Firebase still returns quota errors; final live 32-student completion is pending. Release evidence: docs/polynomial-arcade-verification.md.

### Polynomial demonstration bug audit (25/10/2026)

- Owner requested two agents: independent bug finder and debugger. Both confirmed defects were reproduced, fixed and independently rechecked.
- Search now accepts displayed references such as `Q34(b)`. The shared Skip to content link preserves lesson hashes and playback while transferring focus.
- Verification: 169 polynomial unit checks; all 158 demonstrations and source images on the production build; both new browser regressions; shared-header checks on the app list, Polynomial Quest and Directed Numbers; lint, TypeScript and production build passed.
- Owner reviewed the preview on port 3043 and approved publication on 25/10/2026. Release scope is the two fixes, their regression tests and audit notes. Evidence and test-run limitations are recorded in `docs/polynomials-bug-audit.md`.

### Polynomial two-agent bug audit (25/10/2026)

- Owner requested one bug-finding agent and one debugging agent. They reproduced and repaired solo retry exhaustion and indefinitely stalled classroom requests, then independently reviewed the fixes.
- Regression evidence: 1,377 unit tests, five demo integration tests, seven classroom browser cases and 13 solo browser cases passed, including 32 independent pupils through all four levels. Production build, TypeScript and scoped lint passed. Some initial browser cases required isolated reruns; the full record preserves those failures and their limits.
- The classroom test now waits for the rendered question and choices before answering, after a separate deterministic reproduction established a test race. No scoring assertions were relaxed.
- Findings, fixes and evidence: docs/polynomial-bug-audit-2026-10-25.md. Live Firebase verification remains blocked by quota; no billing, rules or production-data changes were made.
