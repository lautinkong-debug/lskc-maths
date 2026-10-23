# Chapter 5 practice source record

Route: `/apps/congruence` · F2 · chapter `2A05`.

The owner supplied these references and confirmed triangle practice only:

| Reference | SHA-256 |
| --- | --- |
| `2A05_Congruence_compressed.pdf` | `8d37867e11df16c73e9fcb0ac14df5d70f9c901c4fd3201b8f5e418ec1df0748` |
| `2A05_Textbook Solution.pdf` | `4dd89d402a36a505c058fde15ddc3f36a64593bef309e59b0a920122d5c1869b` |

## Coverage

| Section | Included questions | Count |
| --- | --- | --- |
| Quick Practice | 5.1–5.17 | 17 |
| Exercise 5A, Level 2 | 15–27 | 13 |
| Exercise 5B, Level 2 | 19–30 | 12 |
| Exercise 5C, Level 2 | 12–20 | 9 |
| Revision Exercise 5, Level 2 | 22–35, 38 | 15 |
| Total | | 66 |

Polygon questions, including revision 36, 37 and 39, are outside the agreed scope.

## Source and display conventions

Each data record stores the textbook page, crop rectangle, traced vertices, triangle presets, solution PDF pages, and statement/reason lines with geometric highlights. The three source data files divide Quick Practice, Exercises 5A/5B, and Exercise 5C/Revision.

Textbook page `n` is printed page `5.n` and PDF page `n`. Coordinates use a 1225-pixel-wide rendering of the supplied textbook. The solution file's page references are PDF page numbers. Quick Practice 5.1 is on textbook page 5.8; the solution's heading incorrectly gives 5.7, recorded in its source note.

At the owner's request, question crops omit the separate diagonal `STFALSKC` watermark. Their mathematical content and publisher footer are retained. Board diagrams for Exercise 5A Q27 and Exercise 5C Q12 are redrawn because the publisher footer overlaps the figures. Questions without a printed diagram use explicitly labelled illustrative geometry. Traced figures are not measurements: congruence follows from the givens and proof. Moving, turning, flipping and alignment preserve each triangle's size; a shared camera zoom magnifies the view.

Solutions retain printed intermediate steps, reasons, alternatives and correspondence. Answers start hidden. Source notes appear after the last step. Extra valid conditions for Exercise 5B Q29 are explained separately from the printed example.

## Teaching interactions and games

The 23/10 clarity update renders the original native PDF artwork at four times the previous width and height (16 times the pixels), with lossless WebP encoding. The board still uses the original 1225-pixel coordinate system, so the overlays and rigid movements remain aligned. Q35's teaching view clips away adjacent question prose; its full question crop remains available in the Question tab.

At an explicit congruence statement, **Match the corresponding parts** follows the order of the two printed triangle names. Teachers select one of three side pairs or three angle pairs. Only that pair is emphasised in amber; navy/red retain triangle identity and earlier evidence uses neutral marks. The original artwork displays in greyscale on the teaching board; the Question tab retains its printed colours. The conclusion and its reason stay pinned above a compact selector on phones. No new numerical values are inferred from the illustration, and the literal printed solution is unchanged.

The 21/10 update uses Quick Practice 5.14 as the AAS pilot. The same evidence layer supports all 66 questions. It reads explicit equalities and evaluated values from revealed solution lines, never measures the pixel drawings or invents facts from arithmetic operands. Marks follow each displayed triangle. Right angles use squares with 90° labels. Teachers can separately hide angles or sides, retain earlier evidence, dismiss a corresponding pair, and restore hidden evidence. Earlier evidence remains unhighlighted while only the current line is emphasised.

Horizontal and vertical reflection, turning, dragging and automatic alignment are rigid transformations. Snapping rejects distinctly different sizes/shapes. Corresponding vertex names and equal side labels combine on overlap. Camera zoom and Fit include annotation bounds. The question bank and games share the existing department-wide collapsible `LessonWorkspace` menu.

The Games tab (`/apps/congruence#games`) contains three rounds each for SSS, SAS, ASA, AAS and RHS, plus a 12-round mixed challenge. These are generated teaching activities separate from the transcribed textbook solutions. A labelled measurement control rebuilds the red triangle; movement controls always preserve its current lengths. The mixed challenge contains concrete unequal AAA and ambiguous SSA counterexamples, two-fact insufficiency, and a similar-but-unequal side set. The grader uses marked facts and checks the included angle/side and hypotenuse. Proof steps, feedback, optional sound (off initially), reduced motion and progress stored locally support classroom use without Firebase score writes.

## Regenerating question images

Keep the supplied PDFs outside version control, for example in ignored `tmp/congruence/`.

```powershell
npm.cmd exec tsx -- scripts/export-congruence-catalogue.ts tmp/congruence/catalogue.json
python scripts/prepare-congruence-assets.py tmp/congruence/textbook.pdf tmp/congruence/catalogue.json public/congruence/questions
```

The Python runtime needs `pypdf`, `pypdfium2` and Pillow. The script identifies the native PDF Form tagged `/Watermark` containing `(STFALSKC) Tj`, clears only its drawing stream in an intermediate PDF beside the source, and generates the 66 selected lossless WebP question crops at 4× sampling density. An optional final argument changes that density from 1 to 8. Rendering retains only one page in memory. It checks all 80 saved PDF pages: the page drawing streams and every other image/Form stream must match the original, and the original PDF's hash must remain unchanged. Both PDFs stay outside the website assets and version control.

Focused browser checks use `npm.cmd exec playwright -- test --config playwright.congruence.config.ts`, defaulting to localhost port 3001. Set `PLAYWRIGHT_BASE_URL` to test a different local server. Unit checks are included in `npm.cmd test`.
