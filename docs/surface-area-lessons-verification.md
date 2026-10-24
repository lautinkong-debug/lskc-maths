# Surface Area Studio: lessons and early Exercise 9B verification

Date: 23/10/2026. Data file: `src/apps/surface-area/data-lessons.ts`.

## Coverage and source inspection

This file contains **21 question records and 22 solid variants**: Activity 9.3; five worked examples (9.11–9.13, Chapter Summary Example 2, Exam Corner Sample Question); Quick Practice 9.11–9.13; Consolidation Corner Q1–3 (Q2 has variants a and b); Exercise 9B Q1–6, Q8, Q11 and Q12.

The original full-page renders `out/surface-area-source/page-26.png` through `page-31.png`, plus `page-37.png`, `page-47.png` and the answer page `page-51.png`, were visually inspected. OCR was used only as a reading aid. Diagram orientation, actual openings, right angles, source units and matching parallel bases were checked from the images. The five printed worked solutions were inspected directly. The final practice/exercise answers were checked against p. 9.51. Practice intermediate steps are independently authored, not represented as printed solutions.

The numeric geometry uses the solved dimensions for inverse questions. The displayed labels retain `a`, `h`, `x`, or the printed solution's `y`. Where a question gives no symbol for its unknown height, the label is `height`. These choices allow the solid to be drawn without presenting the unknown as an initial numerical given.

## Independent arithmetic ledger

`B` is the area of the chosen polygonal base; `P` its perimeter; `H` the distance between the two parallel bases. `L = PH`. The final area is `L + 2B` for a closed prism or `L + B` for these two open boxes.

| Record / variant | Unit | B | P | H | L | Final surface area | Other required result |
|---|---|---:|---:|---:|---:|---:|---|
| Activity 9.3 illustration | cm | 24 | 20 | 3 | 60 | 108 | Illustrative dimensions only |
| Example 9.11 | cm | 26 | 22 | 13 | 286 | 338 | Lateral area 286 cm² |
| Example 9.12 | cm | 48 | 28 | 10 | 280 | 376 | a = 6 |
| Example 9.13 | cm | 28 | 22 | 6 | 132 | 160 | 9 boxes cost $288 < $300 |
| Summary Example 2 | cm | 6 | 12 | 7 | 84 | 96 | Volume 42 cm³ |
| Exam Corner Sample | cm | 102 | 42 | 10 | 420 | 624 | AD = 11 cm |
| Quick Practice 9.11 | cm | 54 | 36 | 5 | 180 | 288 | Lateral area 180 cm² |
| Quick Practice 9.12 | cm | 28 | 24 | 13 | 312 | 368 | h = 13 |
| Quick Practice 9.13 | cm | 60 | 40 | 6 | 240 | 300 | 8 boxes cost $240 < $250 |
| Consolidation Q1 | mm | 127 given | 42 | 20 | 840 | 1094 | Both bases total 254 mm² |
| Consolidation Q2(a) | m | 50 | 30 | 8 | 240 | 340 | Source uses metres |
| Consolidation Q2(b) | cm | 24 | 24 | 7 | 168 | 216 | BF = CE = 8 cm |
| Consolidation Q3 | cm | 21 given | 24 given | 9 | 216 | 258 | Volume 189 cm³ |
| Exercise 9B Q1 | cm | 16 | 16 | 4 | 64 | 96 | Volume 64 cm³ |
| Exercise 9B Q2 | cm | 21 | 20 | 12 | 240 | 282 | Volume 252 cm³ |
| Exercise 9B Q3 | cm | 6 | 12 | 6 | 72 | 84 | Volume 36 cm³ |
| Exercise 9B Q4 | cm | 60 | 36 | 8 | 288 | 408 | Volume 480 cm³ |
| Exercise 9B Q5 | cm | 32 | 26 | 8 | 208 | 272 | Volume 256 cm³ |
| Exercise 9B Q6 | m | 165 | 54 | 10 | 540 | 870 | Volume 1650 m³ |
| Exercise 9B Q8 | cm | Not supplied / unused | 24 given | 7 | 168 | 168 lateral only | Height 7 cm; total area not determined |
| Exercise 9B Q11 | cm | 40 | 26 | 6 | 156 | 236 | x = 8 |
| Exercise 9B Q12 | cm | 18 | 20 | 7 | 140 | 176 | x = 7 |

## Source decisions and caveats

- Activity 9.3 provides no numerical dimensions. The app explicitly labels its 6 cm × 4 cm × 3 cm cuboid as an illustration. The actual textbook net names are: bases KLMN and CDEF; lateral rectangles ABCN, NCFK, KFGJ and JGHI; combined lateral rectangle ABHI. AI equals the base perimeter, and AB equals the box height. The source net may use a different cut from the interactive unfolding.
- Example 9.13 is open at a rectangular base. Quick Practice 9.13 is open at a triangular base. Both therefore retain one base and every lateral face. The latter is **not** a triangular trough with a missing 17 cm × 6 cm rectangle: that would contradict both the pictured opening and the printed 300 cm² answer.
- Consolidation Q1 deliberately preserves the supplied B = 127 mm². Exact regular-hexagon coordinates with side 7 mm have area 73.5√3 ≈ 127.305734 mm². `areaIsGiven: true` documents the source rounding; it is not a coordinate mistake.
- Consolidation Q3 supplies only the base perimeter and base area, not individual dimensions. Its trapezium drawing is explicitly schematic, all individual edge labels are hidden, and `perimeterGiven: 24` and `areaIsGiven: true` preserve the actual givens.
- Exercise 9B Q8 has no diagram and gives only the triangular base perimeter and lateral area. Its unlabelled triangle is explicitly schematic. Its computational coordinate area is not a source given and must not be displayed as one. `target: "lateral"` and `baseCount: 0` count only the walls; they do not claim the physical prism has missing bases. A total surface area cannot be determined from the source information.
- Quick Practice 9.12 has parallelogram side 5 cm and perpendicular altitude 4 cm. Exercise 9B Q4 has parallelogram side 6 cm and perpendicular altitude 5 cm, with prism height 8 cm. Exercise 9B Q5 has trapezium sides 11 cm, 5 cm, 5 cm, 5 cm and perpendicular altitude 4 cm, with prism height 8 cm. Dashed internal measurement segments retain those essential source altitudes.
- Exercise 9B Q6 has parallel trapezium sides 7 m and 15 m, perpendicular altitude 15 m, sloping side 17 m, and prism height 10 m. Consolidation Q2(a) and Exercise 9B Q6 use metres; Consolidation Q1 uses millimetres. These source units were verified visually rather than inferred from nearby exercises.
- Exercise 9B Q12 uses the 3 cm separation of the parallel 8 cm and 4 cm sides to find the base area. The unknown x is the prism height. The 5 cm edge is sloping, not a base altitude.
- No arithmetic discrepancy was found between this subset and the printed worked solutions or answer key. No unstated individual dimensions are presented as source givens.

## Verification boundary

Source inspection and the arithmetic ledger are complete. An independent Node verification loaded the TypeScript data and recomputed all polygon areas with the shoelace formula, all boundary lengths with coordinate distances, all lateral areas and all counted surface areas. It found 21 records / 22 variants and zero failures; intentional schematic/given-area overrides were excluded only from the geometric area equality check. Edge-label and vertex-name counts also matched each polygon. A focused strict TypeScript check of this data file and its imported schema passed, and the data file was formatted with the installed Prettier.

Runtime rendering, question-selector integration, staged answer reveals and exported images are verified by the integrating task; this document does not claim those checks from data inspection alone.
