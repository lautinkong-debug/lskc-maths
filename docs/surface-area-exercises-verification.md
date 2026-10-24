# Exercise 9B surface-area presets: source and calculation verification

Date: 23/10/2026. Data file: `src/apps/surface-area/data-exercises.ts`.

## Scope and source inspection

This file contributes exactly **15 numbered questions**: Exercise 9B Q16, Q17, Q18, Q19, Q20, Q21, Q22, Q23, Q24, Q25, Q26, Q27, Q28, Q31 and Q35. They comprise **23 selectable variants**, because Q18 contains all nine positive ordered integer solutions.

The supplied textbook is Book 1B, Chapter 9, *Areas and Volumes (I)*, under the site's existing topic code 1A09. Printed pages 9.32-9.35 correspond to PDF pages 32-35. All four full-page diagrams were visually inspected, with OCR used only as an aid. Page 9.33 was also rendered at four times PDF point resolution to resolve the notches in Q24 and the opening in Q27. The final answers for every selected question were visually checked on printed page 9.51. All selected Exercise 9B answers are on 9.51; none relies on the following answer page.

The unchanged local source and inspection images are in ignored `out/surface-area-source/`. No scanned textbook images are added to app assets. The question wording and terminology are transcribed from the source; intermediate working is independently authored because the answer key supplies final answers, not a full worked solution for each question.

## Independently checked results

Here P is the complete base boundary; L is the retained lateral surface area. Thus Q27 excludes its absent sloping rectangle from L while retaining the complete trapezium perimeter in P. Q31's geometry and expected metrics describe one chip; its complete answer explicitly multiplies by 20.

| Question | Page | Base B | P | Prism height | L | Result, including prerequisite and follow-up parts |
| --- | --- | --- | --- | --- | --- | --- |
| 16 | 9.32 | 3.9 cm², supplied rounded value | 9 cm | 5 cm | 45 cm² | Total 52.8 cm²; coating $79.20 |
| 17 | 9.32 | 8 × 2 = 16 cm² | 22 cm | x = 6 cm | 132 cm² | 96 ÷ 16 gives x = 6; total 164 cm² |
| 18 | 9.32 | xy | 2(x + y) | z | 2(x + y)z | xy + xz + yz = 36; every variant has total 72 cm² |
| 19 | 9.32 | 7 × 5 - 5 × 3 = 20 cm² | 24 cm | 3 cm | 72 cm² | Volume 60 cm³; total 112 cm² |
| 20 | 9.32 | ½ × 4 × 3 + 4 × 3 + 2 × 2 = 22 m² | 24 m | 6 m | 144 m² | Volume 132 m³; total 188 m² |
| 21 | 9.32 | 2 × ½ × 7 × 5 = 35 cm² | 24 cm | 8 cm | 192 cm² | Volume 280 cm³; total 262 cm² |
| 22 | 9.32 | 21 × 10 - ½ × 15 × 8 = 150 cm² | 72 cm | 6 cm | 432 cm² | Volume 900 cm³; total 732 cm² |
| 23 | 9.33 | ½ × (4 + 10) × 8 - 3² = 47 cm² | 32 cm | 8 cm | 256 cm² | Volume 376 cm³; total 350 cm² |
| 24 | 9.33 | ½ × 30 × 40 - 13 × 8 - ½ × 12 × 5 = 466 cm² | 142 cm | 10 cm | 1420 cm² | Volume 4660 cm³; total 2352 cm² |
| 25 | 9.33 | 7 × 5 - ½ × 4 × 3 = 29 cm² | 22 cm | x = 6 cm | 132 cm² | Base 29 cm²; 22x + 58 = 190 gives x = 6 |
| 26 | 9.33 | 3x - 1.5(x - 2) = 10.5 cm² | 19 cm | 4 cm | 76 cm² | 4(1.5x + 3) = 42 gives x = 5; total 97 cm² |
| 27 | 9.33 | ½ × (8 + 24) × 18 = 288 cm² | 50 + √580 cm | width 8 cm | 400 cm² | Cardboard 976 cm²; five holders cost $61 |
| 28 | 9.33 | 10 × 5 + ½ × 8 × 6 = 74 cm² | 34 cm | 12 cm | 408 cm² | Total 556 cm²; 12 prisms cost $3336, so Carrie is incorrect |
| 31 | 9.34 | 6 cm², given | 12 cm, given | 3 cm | 36 cm² per chip | Bar volume 360 cm³; each chip 18 cm³; height 3 cm; 48 cm² per chip and 960 cm² for 20 chips |
| 35 | 9.35 | rotated bottom 16 × 12 = 192 cm² | 56 cm | water depth 7.5 cm | 420 cm² | Water volume 1440 cm³; new depth 7.5 cm; wetted area 612 cm² |

All results agree with the printed answer key. Currency trailing zeros are presentation only: $79.20 equals the printed $79.2. No mathematical answer-key discrepancy was found for these 15 questions.

## Geometry and interpretation safeguards

- Q16 uses an exact equilateral triangle of side 3 cm, but `baseArea: 3.9` and `areaIsGiven: true` retain the explicitly supplied rounded base area. The exact coordinate area is approximately 3.897114317 cm² and must not replace 3.9 in this question.
- Q17 retains `x cm` on the prism height; the 2 cm base altitude is an interior measurement. The 3 cm sloping edge is not the altitude.
- Q18 retains `x cm`, `y cm` and `z cm` on the diagram. Variants are named Arrangement 1-9 so the selector does not reveal the solution in its label. Exhaustive ordered solutions are `(2,2,8)`, `(2,3,6)`, `(2,6,3)`, `(2,8,2)`, `(3,2,6)`, `(3,6,2)`, `(6,2,3)`, `(6,3,2)` and `(8,2,2)`. These exhaust the permutations of two cuboid shapes, not nine geometrically distinct cuboids. The source key gives one example from each family and permits other reasonable answers.
- Q20 uses the source's 4 m by 3 m right-angled triangle and two rectangles. The 5 m sloping edge contributes to perimeter; no Pythagoras prerequisite is introduced into the working.
- Q21 is a kite composed of two right-angled triangles with legs 7 cm and 5 cm. Its coordinates preserve all four side lengths and both right angles; it is not replaced by a rectangle.
- Q22's notch is a right-angled triangle with legs 15 cm and 8 cm and hypotenuse 17 cm. All seven true boundary segments contribute to P; the dashed 15 cm span does not.
- Q23's full trapezium has parallel sides 4 cm and 10 cm, altitude 8 cm and sloping edge 10 cm. Its 3 cm by 3 cm lower-left notch changes the boundary without changing the full trapezium perimeter.
- Q24 has **one rectangular notch and one triangular notch**. The right-hand cut is the 5-12-13 triangle, not a 5 cm by 12 cm rectangle. Ordered polygon edges are 10, 8, 13, 8, 7, 11, 13, 5, 17 and 50 cm. The 13 cm rectangle-gap width and 12 cm triangle-gap span are interior measurements, not extra boundary segments.
- Q25 retains the unknown prism height `x cm`. Q26 retains the unknown full base width `x cm`; its rectangular notch has width `x - 2` and height 1.5 cm. Solved numeric values drive accurate geometry but do not replace source symbols in authored labels.
- Q27 uses the two trapezium-shaped side panels as bases (`baseCount: 2`), across the holder's 8 cm width. Ordered base points are `(0,0)`, `(18,0)`, `(18,24)`, `(0,8)`. The sloping edge has index 2, so `omittedEdges: [2]` removes the opening's lateral rectangle. The retained lateral area is `(18 + 24 + 8) × 8 = 400`, and the two side panels contribute 576. No sloping length is required for the source solution.
- Q28 has a 10 cm by 5 cm rectangle plus a 6-8-10 right-angled triangle. Its five outer edges are 10, 5, 6, 8 and 5 cm; the shared 10 cm diagonal is excluded from P.
- Q31's triangle is explicitly schematic because only P and B are supplied. It has `perimeterGiven: 12`, `schematic: true`, `areaIsGiven: true`, and every edge label is hidden. The illustrative 3-4-5 coordinates are not claimed as source givens. One chip's expected surface area is 48 cm²; the requested total for 20 separate chips is 960 cm² in the working and answer.
- Q35 retains the original volume calculation before rotation. After rotation about HE, **HCDE** is the bottom rectangle, with HC = 16 cm and CD = 12 cm; the vertical tank dimension is 20 cm. `heightName: "Water depth"`, `baseCount: 1` and `target: "wetted"` count the bottom and only the wetted wall portions. The free water surface is not counted.

## Executed verification

The data module was imported using the repository's `tsx` loader. For all 23 variants, an independent arithmetic pass calculated perimeter from Euclidean edge lengths, base area by the shoelace formula, retained lateral area after omitted edges, and final area using the retained base count. Every value agreed with its declared expected metrics within `1e-8`; the explicitly supplied rounded area in Q16 was treated as given. The script reported 15 questions and 23 variants.

A separate exhaustive integer search over `1 <= x,y,z <= 36` found exactly the nine Q18 variants. This bound is more than sufficient because `xy + xz + yz = 36` and all three variables are positive. The working also proves completeness by sorting the dimensions, bounding the smallest by 3, and checking the resulting factor pairs.

This is source/data verification. The parent implementation remains responsible for rendering QA, unknown-answer concealment, unfolding, exports, and integration tests against the final shared renderer.
