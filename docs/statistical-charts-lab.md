# Statistical Charts Lab — Phases 1–4

Implemented 09/10/2026. School app route: `/apps/statistical-charts` (F2, topic 2A06, Data Handling).

Phase 2 adds interactive construction tutorials and three practice levels, following the owner's request to continue.
Phase 3 adds classroom comparison, teacher controls, presentation, exports, printing and portable activities.
Phase 4 (10/10/2026) adds percentile readings, two-group comparison, local progress and teacher activity authoring.

Department-site integration and GitHub continuation are documented in [the handoff](statistical-charts-handoff.md).
The lab is listed under F2 / Data Handling / 2A06 and uses the existing website route and availability controls.
Its projection layout responds to the department's **Projection mode** as well as its standalone presentation control.

Classroom layout update (10/10/2026): Dataset settings now spans the top of the workspace,
followed by Data Explorer, then the frequency table beside Chart type and the graph.
Observation and class deletion uses labelled bin icons. **Table & chart view** keeps the
table and graph together and hides editing controls; Escape returns focus to its button.
The department's **Projection mode** also retains both panels. The default six-class table
and full graph fit at 1280x720 and 1920x1080. Longer tables scroll within the focused view;
phones stack the panels to keep text readable.

## Open it locally

The standalone lab needs no login, Firebase emulator, database, API key or network service.
In PowerShell, from the project folder:

```powershell
npm.cmd run build:statistics
npm.cmd run preview:statistics
```

Open **http://127.0.0.1:3216/**. Keep that terminal running; Ctrl+C stops it.
If dependencies are missing on a fresh checkout, run `npm.cmd ci` first (Node 24).

For the existing department website, use the usual `npm.cmd run dev:all`, then open
**http://localhost:3000/apps/statistical-charts**. The existing website's app-visibility
lookup uses its local Firestore emulator; the teaching component itself has no Firebase imports.
Do not switch `.env.local` to a real project for this test.

## What to try

1. Change the context, range, sample size and shape; click **Generate New Data**.
2. Copy the seed and use **Reproduce Seed** with the same range, size, shape and precision.
3. Select each of the five chart types. The active dataset stays the same.
4. Edit an observation. The table, histogram heights and all derived points update immediately.
5. Paste `10, 15, 20, 25, 30, 35, 40, 45`, then set the first lower limit to 10,
   width to 10 and number of classes to 4. Each frequency should be 2.
6. Select **Grouped frequencies** to load the independent 20-observation example from the brief.
   The frequencies should be 3, 7, 5, 5 and cumulative frequencies 3, 10, 15, 20.
7. In that table change the last upper limit from 49 to 59. An unequal-width warning replaces
   the chart. Restore 49 to recover the graph.
8. Select a bar, point or table interval using a pointer, touch or keyboard. The same class is highlighted.
9. Open **Chart display** to see labels, grids, construction guides, histogram overlays and curve/polygon comparisons.
10. Use **Table & chart view** to teach from the table and graph together, **Enlarge chart**
    for the graph alone, or the department site's **Projection mode**.

### Phase 2 local review

No account is needed. Start with **Grouped frequencies** for the reproducible 20-observation example.

1. Select **03 · Step-by-Step Learning**, then choose **Frequency polygon** in **Activity chart**.
2. Use **Next Step**. In the calculation step, enter 10 for the first class mark: feedback should explain
   the midpoint mistake. Enter 14.5 and check again to see the worked calculation.
3. Continue to **Add zero-frequency classes**: the extra marks are 4.5 and 54.5.
4. At **Plot the data**, use **Reveal next point**. Each coordinate appears individually.
   The next step draws straight segments; a curve lesson then shows the smoothing step.
5. Try all five chart tutorials. **Previous Step**, **Show Hint**, **Show Answer** and **Restart** work throughout.
6. Select **04 · Practice Mode**. Level 1 checks class marks, lower boundaries, widths and cumulative frequencies.
   **Try the next class** clears the answer and feedback for a similar retry.
7. Level 2 provides some fixed points or rectangles. Complete the rest by tapping the graph or entering numbers.
   For histograms, select the class and enter/tap its height; given boundaries remain fixed.
8. Level 3 starts without plotted data. Enter each point's horizontal/vertical coordinates or each rectangle's
   lower boundary, upper boundary and height. The original interval/frequency table stays visible.
9. Choose **Straight line segments** for polygons or **Smooth curve** for curves, then **Check construction**.
   Correct coordinates with the wrong join style must not pass.
10. Following a check, **Reveal correct solution** shows the correct graph and numerical coordinates.
    **Retry this construction** clears the learner's attempt and restores only the given Level 2 items.

The graph also supports keyboard plotting: focus the plotting area, move the crosshair with arrow keys,
then press Enter/Space. Exact coordinate fields provide an alternative to pointer snapping. Select a plotted
item or its fields to edit it; given Level 2 items are read-only. Pointer snapping is declared below the graph:
half the recording precision horizontally (class width/20 for unrounded continuous data), and one frequency unit vertically.
An incomplete/out-of-range item produces a warning and still counts in the numerical submission; hiding it outside the plot cannot earn a pass.

Learning and practice use the active validated dataset. Each chart, dataset and practice level has its own draft.
Tutorial steps, scalar answers, construction drafts and join styles are now retained locally when changing modes
or refreshing. Hints, marking feedback and revealed model solutions are not reopened automatically.

Raw and grouped editors retain separate datasets when switching; grouped data are never expanded into invented observations.
CSV import accepts numeric cells only (commas, whitespace/newlines or semicolons), without headers or quoted fields.
Generation allows 1–10,000 observations; charts allow 1–24 equal-width classes. The individual grid shows
up to 100 values; **Edit all observations** loads the complete dataset into the bulk editor.
Imported or edited data outside the current intervals show a warning; **Fit classes to data** recalculates a covering grouping.

## Source and construction conventions

Reference inspected visually: `G:/My Drive/02_Mathematics/F2/01_Textbook/2A06_More about Statistical Charts.pdf`.
This scanned chapter's text layer mainly contains copyright watermarks, so the construction pages were rendered and read.
Relevant printed pages (also PDF page numbers):

- 6.7: class limits, marks, boundaries, width, and lower-inclusive/upper-exclusive membership.
- 6.11: touching histogram rectangles; class-mark labels are standard and boundary labels are also allowed.
- 6.22: extra equal-width zero-frequency classes at both ends; class marks; straight segments.
- 6.27: a smooth frequency curve may pass through or near polygon vertices.
- 6.35–6.36: initial lower-boundary point at zero, subsequent upper boundaries, cumulative total, non-decreasing segments.
- 6.39: smoothing the cumulative frequency polygon.

The app uses original generated datasets, original SVG graphs and original explanatory wording.
The textbook and rendered pages are not included in the source or the distributable build.

## Calculation model

`src/apps/statistical-charts/statistics.ts` is the pure shared model:

- For precision `p`, lower boundary = lower limit − p/2; upper boundary = upper limit + p/2.
  Supported recording precisions are 1, 0.1 and 0.01.
- For continuous unrounded data, `p = 0`; the entered endpoints are boundaries. Every interval
  is `[lower, upper)`, including the last. An observation equal to an internal boundary belongs
  to the following class; one equal to the final boundary is uncovered. Automatic fitting extends
  the final boundary beyond the maximum. This preserves less-than cumulative counts.
- Class mark = (lower limit + upper limit)/2. Class width = upper boundary − lower boundary.
- Cumulative frequency is a running integer sum. The final value is the total frequency.
- Histogram x positions and widths use the numerical boundaries, regardless of the selected labels.
- Frequency polygon points use class marks, with one extra class-width step and frequency zero at each end.
- Cumulative points start at `(first lower boundary, 0)` and then use `(upper boundary, cumulative frequency)`.
- Both curves use cubic Hermite segments with weighted harmonic-mean interior slopes when neighbouring
  secants have the same sign, and zero slopes at extrema/endpoints. This gives continuous tangents,
  bounded segments and no negative frequency or cumulative overshoot. It is one defensible smoothing,
  not a unique statistical estimate. Straight polygons always use SVG polylines.
- Blank/non-finite values, negative/fractional frequencies, overlaps, gaps, mismatched precision,
  unequal widths and uncovered observations prevent drawing. No values are silently omitted.
- Numerical limits and class counts bound computational work. Dense graphs thin axis labels while retaining
  every bar and point at its actual coordinate; the table and selectable points retain exact values.

## Architecture

- `index.tsx`: client workspace and source state; no server calls.
- `Editors.tsx`: generator, raw editor, grouped editor and accessible shared fields.
- `FrequencyTable.tsx`: compact/full tables derived from validated rows.
- `Chart.tsx`: shared SVG renderer for all five chart types, numeric scales, overlays and controls.
- `statistics.ts`: parsing, grouping, validation, seeded generation and interpolation.
- `learning.ts`: pure question answers, lesson sequence, construction targets, parsing, snapping and grading.
- `LearningSteps.tsx`: progressive construction tutorials, given table and guided calculations with KaTeX corrections.
- `PracticeQuestions.tsx`: three practice levels, given items, editable coordinate lists, feedback and gated solution reveal.
- `ConstructionGraph.tsx`: scalable graph paper, numerical coordinate transforms, pointer/touch/keyboard plotting,
  animated joins (respecting reduced-motion preferences) and model constructions.
- `lab.module.css`: scoped responsive styling using the department's navy/graph-paper tokens.
- `src/lib/copy.ts`: English UI text.
- `registry.ts` and `Thumbnail.tsx`: integration with the department's existing app listing.
- `standalone.tsx` and `scripts/build-statistical-lab.mjs`: independent static build using the existing
  locked esbuild dependency. No dependency was added. The standalone build reuses the shared design tokens,
  with local system fonts so it needs no font service.

## Validation performed

Phase 2 verification (09/10/2026):

- **35 new unit tests** cover correct/incorrect constructions for all five chart types, missing/extra/duplicate points,
  negative values, class limits versus marks, zero endpoints, cumulative start/direction/total, histogram gaps/boundaries/heights,
  wrong join styles, numeric parsing, decimals, negatives, zero-frequency/single-class cases, scaffolds, snapping and lesson sequences.
- **263 project unit tests passed** across 12 files (including the 42 Phase 1 statistical tests).
- **19 Chrome browser tests passed**: the six Phase 1 tests plus all five lesson walkthroughs, guided error/correction/retry,
  all five independent constructions, partial histogram completion, actual mouse/touch/keyboard plotting, editing/removing items,
  dataset resets, reveal gating, and phone/tablet/desktop layouts.
- Phase 2 screenshots inspected at 360×800, 820×1180 and 1440×1000; lint, TypeScript and the Next.js production build passed.
- Browser tests now start their own fresh server on port 3217. The teacher preview remains on port 3216.

Phase 1 baseline verification:

- **42 numerical tests** in `statistics.test.ts`: required original example, every point and boundary,
  touching bars, zero-frequency classes, decimals, hundredths, negatives, continuous boundary membership,
  uncovered values, sample-size/width/start changes, 10,000 observations, one/zero observations,
  invalid input, grouped-only inputs, all five seeded shapes, and dense sampling of curve bounds/monotonicity.
- **228 project unit tests passed**, including the 42 new numerical tests.
- **6 Chrome browser tests passed**: all five chart types and rendered coordinates, live grouped/raw edits,
  invalid input withholding graphs, CSV import and regrouping, seed replay, display controls, keyboard
  selection, chart enlargement and layouts at 360×800, 820×1180 and 1440×1000.
- Desktop, tablet and phone screenshots inspected. The chart resizes its numeric plot to fit a phone;
  wide optional tables scroll within their panel.
- ESLint, TypeScript and the Next.js production build passed. The standalone production bundle passed browser tests.
- Windows sandbox limitations initially blocked the Next compiler, local HTTP and some Vitest temporary imports;
  rerunning the same checks with approved local process access resolved these environment failures.

Reproduce the checks:

```powershell
npm.cmd run test
npm.cmd run test:statistics:e2e
npm.cmd run test:statistics:site
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

The dedicated browser config tests the actual standalone production bundle without seeding any database.
The department integration suite builds and serves the actual Next.js site with local Firebase emulators, checking
listing/filter/navigation/projection and mobile shared-activity restoration. It does not replace the separate authenticated
teacher/challenge suite, which was not rerun for this teaching-app addition.

## Firebase Hosting deployment (instructions only)

The **standalone** build is static and suitable for Firebase Hosting. The full department Next.js
application still uses its existing deployment architecture; do not attempt to upload its server routes as static files.

1. Build with `npm.cmd run build:statistics`.
2. Select a dedicated Firebase project/Hosting site for this lab; check the project ID before publishing.
3. Sign in to the Firebase CLI if required using `npx.cmd firebase login`.
4. When ready to publish, replace the placeholder below with that project's ID:

```powershell
npx.cmd firebase deploy --only hosting --config firebase.statistical-lab.json --project YOUR_DEDICATED_LAB_PROJECT_ID
```

The config uploads only `out/statistical-charts`. It has no Firestore, Storage, Functions or rules deployment.
This work has not deployed to any production project.

## Marking conventions and remaining scope

Construction grading compares the entered numerical values with the validated table, with an absolute floating-point
tolerance of 0.0000001. Entry order is irrelevant: points are joined from left to right. Duplicates and additional
items are rejected. Rectangle positions, widths and heights are all checked; a correct-looking graph is insufficient.
The feedback distinguishes common misconceptions rather than only reporting an incorrect result.

Curve practice deliberately asks students to construct the corresponding polygon's anchor points and then choose
the smooth construction method. The app checks those anchors and method; it does not assess arbitrary freehand curves
or claim that its smooth curve is the only valid one. Given Level 2 items are included in the displayed correct-item count.
The independent exercise supplies automatically scaled graph paper; independent manual axis design is not assessed.

Phases 1–4 are implemented. Manual axis overrides, automatically marked interpretation questions and cloud progress
remain outside this delivery. The active valid workspace and bounded practice history are saved in the current
browser. Save an activity file to keep a portable backup of its configuration; attempts are local only.
Browser testing used Chrome (including emulated touch and phone/tablet viewport sizes); iOS Safari and actual classroom
projector/device testing remain for teacher review. Dense frequency labels can be switched off to reduce clutter.

## Phase 3 classroom review

1. Select **Grouped frequencies**, then **05 · Compare Charts**. Try each of the five layouts.
   Every panel uses the same x domain and count scale; frequency and cumulative frequency retain their respective axis labels.
   Selecting the second class highlights its frequency 7 and cumulative frequency 10. The all-five layout includes a linked reading panel.
2. Open **Teacher & sharing tools**. Set the dataset, grouping and chart in the lab, then select **Fix lesson dataset**.
   The data, context and grouping controls become disabled. **Unlock dataset** restores editing.
3. **Hide model answers** disables worked-answer/reveal controls in tutorials and practice. Hints, marking and normal tutorial
   demonstrations still work. These local controls are teaching aids, not authenticated assessment restrictions.
4. In practice, enter an answer and use **Reset student workspace**. The attempt clears; a fixed lesson restores its saved
   data, chart and display configuration. **Another teaching example** generates data when the dataset is unlocked.
5. Open **Presentation View**. Controls are reduced, both comparison graphs fit a 1280×720 viewport, and Escape exits.
   On smaller screens comparison panels stack vertically. This is an in-page presentation overlay; browser fullscreen is optional.
6. Use **SVG** or **PNG** under a chart. Both contain the plotted data, full title and axis labels. SVG styles are self-contained;
   PNG renders at twice the chart's numerical viewport size. In comparison mode each panel exports separately with its shared scales.
7. **Printable view** shows the selected chart, or all charts in the active comparison, plus the full frequency table.
   **Print / Save PDF** opens the browser print dialog. Comparison scales are preserved. Escape or **Back to workspace** returns.
8. Download the **Frequency table CSV** and check the boundaries, marks and cumulative frequencies.
   **Raw data CSV** is enabled only for individual observations; grouped counts never fabricate observations.
9. **Copy activity link** encodes the active data, class settings, chart, mode, comparison, display options and lesson/answer flags
   in a versioned URL fragment. Open it in another browser context and verify the same example. Clipboard denial leaves a selectable link.
10. For large examples, use **Save activity file** and **Open activity file**. Links are limited to 8,000 characters; JSON import is
    capped at 250 KB and validates numerical limits, grouping, counts and all schema fields before changing the workspace.
    Invalid files keep the current example. Files do not include practice attempts or the inactive source dataset.

A localhost link works only on the same computer. To share with students, host the static app or give them an activity file
to open in their copy of the lab. All sharing is local encoding/file export; there is no upload or backend storage.
Only numeric observations and generic dataset labels should be entered. There are no student-name fields; user-entered titles
are included in links and files. Encoded links are reproducible, not secret or encrypted.

## Phase 3 visual and technical review

The review uses design, usability and originality as separate concerns, informed by
[Awwwards](https://www.awwwards.com/websites/single-page-1/),
[the Webby judging criteria](https://www.webbyawards.com/judging-criteria/) and
[FWA's curated examples](https://thefwa.com/FWA25/RobFWA.html). This is a design reference, not an award claim.

The school exercise-book identity remains: navy rules, restrained graph paper, serif headings and clear numeric typography.
Actual screenshot review led to a shorter comparison header, an informative sixth panel in the five-chart spread,
chart-first mobile ordering, consistent 44 px buttons, and a compact presentation header. Selection uses linked visual feedback;
transitions are brief and respect reduced-motion preferences. Wide tables scroll within their panels, not the page.

- 31 new transport/CSV unit tests; 294 project unit tests passed.
- 11 additional Chrome browser scenarios cover every comparison layout, shared-scale and selection consistency, fresh-context
  link restoration, file round trips, invalid imports, 10,000-row fallback, actual downloaded CSV/SVG/PNG readback, teacher controls,
  reset, presentation, print PDF, and layouts at 360, 820, 1440 and 1920 px. Together with the prior phases: 30 browser tests.
- Exported PNG and both pages of the sample printed PDF were rendered and visually inspected.
- The Windows download scanner can briefly lock completed downloads. Acceptance tests retry readback for up to 15 seconds;
  no security settings are changed or bypassed.
- The standalone production bundle and Next.js build are checked; no dependency, Firebase schema or production deployment was added.

## Phase 4 review

1. Start with **Grouped frequencies → 06 · Further Explorations → Percentiles & quartiles**.
   The example has Q1 ≈ 22.36, median ≈ 29.5 and Q3 ≈ 39.5 on the straight polygon.
   Select a quartile card or move the percentile slider. The dashed guides follow pN/100 across to the graph, then down.
2. Switch between the straight polygon and smooth curve. Each estimate inverts the graph actually displayed.
   A horizontal section at the target frequency produces an interval of readings. The app does not silently choose
   one endpoint. With raw data, the exact median of the ordered observations is shown separately from the grouped estimate.
3. Choose **Compare two groups**. Group A is the lab dataset; Group B initially reverses its frequencies and can be edited.
   Both use matching class boundaries, the same variable and units, and shared numeric axes. Solid navy/circle and dashed
   graphite/square series remain distinguishable without colour. Change between frequency/cumulative views and counts/percentages.
   Percentages divide each group's counts by its own total, making unequal sample sizes comparable.
4. A zero total has no percentile or percentage distribution. Invalid frequencies or changed class boundaries with an old
   Group B suppress the comparison and its export. **Reset B to current classes** restores a compatible second dataset.
5. Enter a practice answer or construction and reload. The active dataset, mode, chart, tutorial stage, difficulty, draft
   and join style resume. **Clear practice progress** clears attempts while retaining the activity and saved activity library.
6. Open **My activities & progress**. Add a name, instructions and starting practice level, then **Save to my activities**.
   Open the saved activity to begin a fresh attempt using that level. Delete has an undo option. Up to 12 activities are stored.
7. Links and JSON activity files include the teacher instructions, advanced settings and Group B, but exclude attempts.
   Opening a different incoming activity link replaces the current attempt. Reloading the same link resumes that browser's
   attempt. Opening a library activity or JSON file starts afresh and removes the previous shared fragment.
8. Advanced SVG/PNG exports retain the percentile guide or both series and their legend. The printable comparison includes
   both complete frequency tables. **Print / Save PDF** uses the browser print dialog.

### Calculation and storage details

Textbook reference: pp. 6.43 (percentiles), 6.46 (quartiles) and 6.55 (comparing cumulative distributions).
No textbook artwork is bundled. Straight segments assume a uniform spread within each class; smooth readings invert the
shape-preserving Hermite curve using bisection. Both are labelled estimates, rounded to two decimal places. Raw median uses
the middle observation, or the mean of the two middle observations. No raw-data quartile convention is implied.

`advanced.ts` contains the pure calculations and validation. `AdvancedGraph.tsx` shares one renderer between exploration and
print. `progress.tsx` scopes drafts by mode, chart and the actual frequency table. `storage.ts` validates persisted records.
The active session has at most 160 progress entries, evicting oldest entries at the limit; the library holds 12 configurations.
Only the active raw/grouped dataset is restored after reload. Inactive editor data and generator settings are not a saved seed preset.
Autosave occurs after 250 ms and on page exit. Invalid edits keep the last valid saved workspace. Storage failures leave the
lab usable with a visible message. Clearing browser data removes local progress and activities; activity files back up settings only.
There are no student accounts, named student records, cross-device syncing, Firebase writes or new dependencies.

### Phase 4 verification

- 42 new unit cases cover linear and smooth inversion, quartiles, zero-frequency plateaus, zero totals, invalid inputs,
  negative/continuous data, exact raw medians, percentage conversion, matching classes, optional activity extensions,
  local-record validation, library limits and bounded progress. All 336 project unit tests passed.
- All 42 Chrome browser scenarios passed, including 12 Phase 4 cases: advanced readings and unequal-total comparison;
  draft/tutorial restoration and clearing; library reopening, starting levels, delete/undo; portable teacher instructions;
  same-link resumption versus fresh-link resets; excluded attempts; blocked/corrupt storage; exports and two printed tables;
  phone, tablet and desktop layouts.
- Screenshots at 360×800, 820×1180 and 1440×1000 were reviewed. The compact advanced header, navy reading panel, responsive
  controls and non-colour series distinctions retain the established exercise-book design. The two-page print sample was
  rendered; table sections now stay together instead of orphaning Group B's heading on the previous page.
- TypeScript, ESLint and the full Next.js production build passed. The final print pagination correction also passed its
  targeted browser test and a second rendered PDF inspection. No live student account, cloud persistence,
  actual iOS Safari or physical classroom device is claimed to have been tested.
