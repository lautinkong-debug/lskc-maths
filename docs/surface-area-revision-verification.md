# Surface Area Studio: checks, revision and exam data

Verified on 23/10/2026 against the owner's local scanned textbook, Book 1B Chapter 9. Source question pages inspected visually: 9.38, 9.40, 9.42, 9.43 and 9.45–9.49. Final answers were compared with the actual images of pages 9.51–9.52. OCR was used only as a reading aid.

The implementation is `src/apps/surface-area/data-revision.ts`: **24 numbered entries and 24 variants**. It covers Check Yourself Q5, Q6, Q8; Revision Exercise 9 Q10–15, Q24–27, Q29–31, Q33; Multiple Choice Q7, Q8, Q11; Exam-type Q2, Q3, Q7; and Public Exam Q2. There are no omitted subparts in these entries. Volume, inverse-dimension, water-displacement and judgement subparts have working and answers alongside the surface-area work.

The textbook gives final answers for these questions. The app's intermediate steps are independently authored and checked; they are not described as printed textbook solutions. Question prompts are concise transcriptions/paraphrases, preserving the numerical givens and requested results. The source images remain in the ignored source folder and are not application assets.

## Numerical verification

All lengths below are in cm except Revision Q14, which uses metres. `A` is the surface quantity displayed by the variant: total surface area unless the row specifies lateral, wetted or increase. `H` is the chosen prism height, water depth or depth increase, as appropriate. Only source-requested volumes are included in the final-answer column.

| Question | B | P | H | Lateral area | A | Printed final answer / independently checked result |
|---|---:|---:|---:|---:|---:|---|
| Check Yourself 5 | 6 | 12 | 8 | 96 | 108 | V = 48 cm³; A = 108 cm² |
| Check Yourself 6 | 66 | 38 | 5 | 190 | 322 | V = 330 cm³; A = 322 cm² |
| Check Yourself 8 | 48 | 32 | 8 | 256 | 352 | x = 8 |
| Revision 10 | 24 | 22 | 2 | 44 | 92 | V = 48 cm³; A = 92 cm² |
| Revision 11 | 30 | 30 | 18 | 540 | 600 | V = 540 cm³; A = 600 cm² |
| Revision 12 | 24 | 22 | 9 | 198 | 246 | V = 216 cm³; A = 246 cm² |
| Revision 13 | 42 | 30 | 12 | 360 | 444 | V = 504 cm³; A = 444 cm² |
| Revision 14 (m) | 30 | 22 | 2 | 44 | 104 | x = 2 |
| Revision 15 | 84 | 56 | 10 | 560 | 728 | x = 7; A = 728 cm² |
| Revision 24 | 110 | 46 | 7 | 322 | 542 | V = 770 cm³; A = 542 cm² |
| Revision 25 | 72 | 40 | 10 | 400 | 544 | V = 720 cm³; A = 544 cm² |
| Revision 26 | 54 | 36 | 8 | 288 | 396 | V = 432 cm³; A = 396 cm² |
| Revision 27 | 64 | 64 | 2 | 128 | 256 | V = 128 cm³; A = 256 cm² |
| Revision 29 | 21.5 | 31 | 4 | 124 | 167 | x = 2.5 |
| Revision 30 | 3000 | 300 | 60 | 18000 | 18000 lateral | H = 60 cm; yes, V = 0.18 m³ < 0.2 m³ |
| Revision 31 | 375 | 80 | 7.8 | 624 | 999 wetted | Depth 7.8 cm; no, 999 cm² is not more than 1000 cm² |
| Revision 33 | — | — | — | — | 250 | 250 cm² |
| MC 7 | 60 | 40 | 18 | 720 | 840 | B, x = 18 |
| MC 8 | 70 | 60 | 10 | 600 | 740 | C, 740 cm² |
| MC 11 | 240 | 64 | 3 | 192 | 192 increase | B, 192 cm² |
| Exam-type 2 | 48 | 32 | 12 | 384 | 480 | V = 576 cm³; A = 480 cm² |
| Exam-type 3 | 60 | 32 | 8 | 256 | 376 | AD = 8 cm; A = 376 cm² |
| Exam-type 7 | 56 | 32 | 14 | 448 | 560 | D, 560 cm² |
| Public Exam 2 | 61 | 40 | 14 | 560 | 682 | C, 682 cm² |

No final-answer discrepancy was found. In Revision Q31 the answer key says only “no” for part (b); 999 cm² is the independently calculated supporting value. Similarly, Revision Q30's 0.18 m³ calculation supports the printed “yes”.

## Geometry and source checks

- Every prism uses real, dimensionally consistent polygon coordinates. A separate calculation from those coordinates, using Euclidean edge lengths and shoelace areas, reproduced every stored `baseArea`, `expected.perimeter`, `expected.lateralArea` and `expected.surfaceArea`. All **24 variants passed** this calculation (23 prisms and one cube assembly). The checks were run by importing the actual TypeScript data with Node; they did not reuse the application's geometry functions.
- All outer boundaries have positive signed area and no crossing edges. The frame's inner boundary has the reverse orientation. Hole area is subtracted, while its perimeter is added.
- Revision Q12's parallelogram has sides 6 and 5, altitude 4 and prism height 9. Its 4 cm altitude is stored as a separate measurement, not an extra boundary segment. Revision Q24 similarly stores its 12 cm roof altitude as a separate measurement; both sloping sides are 13 cm and each wall is 5 cm.
- Revision Q25 has five edges and one concave vertex. The lower 8-by-6 right triangle and upper 12-by-4 rectangle give B = 72. The perimeter includes both 4 cm notch edges.
- Revision Q26 has eight edges and two concave vertices. The source's paired 3 cm leaders identify the successive treads and rises. Thus the overall width and height are both 9 cm, B = 3(9 + 6 + 3) = 54 and P = 36. Derived 9 cm outer edges start without printed dimension labels; working explains them.
- Revision Q27 uses an outer 10-by-10 square and an inner 6-by-6 square, centred with 2 cm border widths for the drawing. The hole's placement within the frame does not affect these results. Its four inner walls are included: P = 40 + 24, B = 100 − 36, H = 2. Two frame-shaped bases are counted.
- Revision Q29 has 12 edges and four concave vertices. Its symbolic base area is 7(x + 2) − 4x = 3x + 14; its boundary length is 2x + 26. Solving 4(2x + 26) + 2(3x + 14) = 167 gives x = 2.5. Both equal notch widths retain the symbolic `x cm` label, so neither exposes the solved value prematurely.
- Revision Q30's requested unknown comes from a lateral-area relation. The variant therefore unfolds only the three lateral faces (`baseCount: 0`) with area 18000 cm². The total surface area of the complete closed prism would be 24000 cm², but that is not the area used in the given relation or requested by the question. The volume conversion uses 1 m³ = 1000000 cm³.
- Revision Q31 counts the bottom and four wet wall portions (`baseCount: 1`) at depth 7.8 cm. The original tank is 10 cm high. The visualised occupied volume 2925 cm³ includes both water and submerged stones; the water itself remains 1500 cm³. The water's free surface is excluded.
- Revision Q33 uses actual stacked cubes with z as the vertical axis: side 5 at z = 0, side 4 at z = 5, and side 3 at z = 9. The 4 cm and 3 cm cubes are centred on the cubes below, with contact areas 16 and 9 cm². Each contact patch is counted twice in the separate-cube totals and removed twice: 300 − 2(16 + 9) = 250. There is no fictitious single prism perimeter or height.
- MC Q8 has five edges and one concave vertex. Its base is the 24-by-10 right triangle minus a 10-by-5 rectangle: B = 70 and P = 60. The 26 cm sloping edge is preserved.
- MC Q11 represents only the newly wetted band around the tank. Its height is the 3 cm water rise and `baseCount` is zero. The previously wet bottom does not increase in area; the balls are not tank material.
- Exam-type Q2 and Public Exam Q2 each have six boundary edges and one concave vertex. Public Exam Q2 preserves the inner 5 cm and 7 cm labels and derives the remaining outer 3 cm and 5 cm lengths in working.
- Exam-type Q3 chooses ABFE as the rectangular base, making AD the prism height. That valid choice makes the inverse volume step explicit while retaining the source vertex names and dimensions.

The data check does not establish browser rendering or export quality. The parent implementation still needs to exercise these entries in the integrated app and inspect the actual SVG/PNG output.
