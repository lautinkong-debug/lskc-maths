# Manipulation of Simple Polynomials: Level 2 source audit

Inspected on 23/10/2026. This records the source review, not a completed app.

## Source and inspection

- Supplied file: `G:\My Drive\02_Mathematics\F1\01_Textbook\1A10_Manipulation of Simple Polynomials.pdf`.
- Book 1B, Chapter 10, 53 PDF pages. Printed page 10.n corresponds to PDF page n.
- SHA-256: `7CF765E12F499FDAAAC9036246EDCA148DEBA1FCCF8097202AD99ED409B48D9E`.
- Text extraction returns watermarks/footer text rather than the exercises. All 53 pages were surveyed in contact sheets; every Level 2 question page was then read at full-page resolution: 12, 22, 23, 27, 28, 35, 36, 42, 43, 44. The printed answer pages 50–53 were also inspected.
- Analysis copy and page renders are in ignored `out/polynomials-source/`. The Drive original is unchanged. Do not publish this folder or the complete PDF.
- The printed key supplies final answers, not complete worked solutions for each question. Intermediate steps in a future app must be authored and checked against the textbook methods; do not call them verbatim printed solutions.

## Exact coverage

“Level 2” means the explicitly labelled Level 2 portions of the four exercises and Revision Exercise 10, up to the next separately labelled section. Blue-diamond questions inside those portions remain included.

| Bank | Numbered questions | Question pages | Answer page | Numbered questions | Parts / table rows |
| --- | --- | --- | --- | ---: | ---: |
| Exercise 10A | 21–32 | 10.12 | 10.50 | 12 | 24 |
| Exercise 10B | 19–30 | 10.22–10.23 | 10.51 | 12 | 27 |
| Exercise 10C | 20–35 | 10.27–10.28 | 10.52 | 16 | 32 |
| Exercise 10D | 26–42 | 10.35–10.36 | 10.52 | 17 | 32 |
| Revision Exercise 10 | 33–56 | 10.42–10.44 | 10.53 | 24 | 43 |
| **Total** | | | | **81** | **158** |

Counting rule: count each printed lettered part once; a question without lettered parts counts once. Exercise 10B Q19(a)–(d) contributes four table rows, each containing three requested facts. A part requesting several values still counts once (e.g. 10B Q29(a), Revision Q52(a)). Thus 158 is not the number of individual answer boxes.

Excluded: Level 1, Quick Review, Review Exercise 10 on p.10.4, Quick Practice, Classwork, Consolidation Corner, Check Yourself, the separately labelled Challenging Questions, Multiple Choice Questions, Exam Corner and Think and Learn. Their worked examples may inform the teaching method without becoming extra question-bank entries.

## Question-by-question teaching inventory

Each row below names every covered question once. Parts are preserved as printed.

### Exercise 10A — laws of positive integral indices

All questions are on p.10.12; all answers are on p.10.50. Every question has parts (a), (b).

| Question | Required teaching actions |
| --- | --- |
| 21 | Group identical variable bases; add their indices; show an implied index of 1. |
| 22 | Separate the numerical coefficient from variable powers; multiply each group. |
| 23 | Determine the product sign; multiply coefficients; add indices of like bases. |
| 24 | Divide like powers; retain leftover factors in the numerator or denominator. |
| 25 | Reduce coefficients and divide powers of each variable independently. |
| 26 | Handle negative divisors and denominator powers; retain positive indices. |
| 27 | Cancel equal powers completely where appropriate; simplify the signed fraction. |
| 28 | Follow the printed sequence of products and division, preserving grouping. |
| 29 | Apply multiplication/division left to right; show cancellation by variable. |
| 30 | Treat the entire numerator and denominator as products; distinguish sign and magnitude. |
| 31 | Process successive divisions left to right; do not silently multiply the divisors together. |
| 32 | Simplify the bracketed product/quotient first, then carry out the outer division. |

Teaching guardrails: a cancelled variable factor becomes 1, not 0; nonzero denominator restrictions survive cancellation. Use fractions/positive indices as in this chapter, rather than introducing negative indices as the final form.

### Exercise 10B — polynomials

Questions 19–26: p.10.22. Questions 27–30: p.10.23. Answers: p.10.51.

| Question | Parts | Required teaching actions |
| --- | --- | --- |
| 19 | a–d | Identify each signed term, count terms, find the constant term (0 if absent), and obtain total degree by summing indices within each term then taking the largest. Reveal the three table entries separately. |
| 20 | a,b | Recognise reordered products as like terms (`ab = ba`, `xy = yx`) and combine coefficients. |
| 21 | a,b | Recognise `ba = ab`, `ca = ac`, `rq = qr`; keep unlike products separate. |
| 22 | a,b | Match the complete variable-and-index pattern, including reordered factors. |
| 23 | a,b | Combine like powers and arrange in descending powers of x. |
| 24 | a,b | Arrange in powers of x while keeping expressions in a inside the coefficient. |
| 25 | a,b | Combine terms and arrange in ascending powers of y. |
| 26 | a,b | Arrange in powers of y while treating k or h as part of the coefficient. |
| 27 | a–c | Substitute into `2x² − (3/2)x + 6` with brackets, then powers/products/sums; retain exact fractions. |
| 28 | a–c | Substitute both variables into `2x²y − (1/4)x²y² + 5xy²`; retain negative and fractional values exactly. |
| 29 | a,b | Substitute x = 3 into four side expressions, then compare the four lengths. |
| 30 | unlettered | Substitute x = 2, y = 3 into PQ, QR, PR; explain the isosceles conclusion from equal lengths. |

Q24(a) illustrates why “descending powers of x” is not sorting by total multivariable degree. Q26(a) similarly treats k as a parameter when arranging by y.

### Exercise 10C — addition and subtraction

Questions 20–24: p.10.27. Questions 25–35: p.10.28. Answers: p.10.52. Every question has parts (a), (b).

| Question | Required teaching actions |
| --- | --- |
| 20 | Remove a bracket with its preceding sign; group identical quadratic terms and products. |
| 21 | Preserve the sign of every term when adding/subtracting multivariable polynomials. |
| 22 | Match multivariable like terms; explicitly cancel opposite terms. |
| 23 | Remove three brackets separately; group terms; show every sign reversal. |
| 24 | Combine terms in several variables without merging unlike terms. |
| 25 | Preserve the printed vertical addition/subtraction layout and align missing powers. |
| 26 | Preserve the vertical layout with multivariable columns; show signs in subtraction. |
| 27 | Simplify and arrange in descending powers of x. |
| 28 | Remove several signed brackets, including a negative constant, then arrange descending. |
| 29 | Arrange the result in ascending powers, including large gaps between powers. |
| 30 | Simplify three polynomials and arrange in ascending powers. |
| 31 | (a) Simplify; (b) carry that result forward and substitute x = −3. |
| 32 | (a) Simplify; (b) carry that result forward and substitute p = 2, q = −3. |
| 33 | Highlight and add all three triangle sides; form the perimeter, then substitute x = 4. |
| 34 | Add the three amounts of money; simplify and substitute x = 10. Retain dollar units. |
| 35 | Add the three expenses; subtract from the initial amount; substitute x = 4, y = 3 and assess the claim “more than $150”. |

### Exercise 10D — multiplication

Questions 26–34: p.10.35. Questions 35–42: p.10.36. Answers: p.10.52.

| Question | Parts | Required teaching actions |
| --- | --- | --- |
| 26 | a,b | Distribute a monomial to each term, with explicit signs and index calculations. |
| 27 | a,b | Multiply multivariable monomials through every term. |
| 28 | a,b | Expand two brackets and apply the external numerical/sign factor. |
| 29 | a,b | Expand two brackets and apply the external monomial. |
| 30 | a,b | Multiply a binomial and a trinomial; account for every term pair. |
| 31 | a,b | Expand multivariable binomial/trinomial products and combine like terms. |
| 32 | a,b | Expand each product, collect like terms, arrange descending. |
| 33 | a,b | Apply subtraction to the complete second product and arrange descending. |
| 34 | a,b | (a) Product minus a bracket; (b) square expansion followed by subtraction of the entire result. |
| 35 | a,b | Expand signed products and arrange in ascending powers. |
| 36 | a,b | (a) Distinguish a binomial square from a monomial square; (b) subtract one product from another. Arrange ascending. |
| 37 | a,b | Expand multiple products/squares, cancel terms where possible, arrange ascending. |
| 38 | a,b | Expand two factors, then reuse the result for a third factor. |
| 39 | a,b | Expand two factors, then reuse the result for a third factor. |
| 40 | unlettered | Translate “is subtracted from the product” into the correct order before expanding. |
| 41 | unlettered | Form quantity × unit price for pens and rulers, then add and expand. |
| 42 | a,b | Multiply boxes × bags per box × candies per bag; expand, then evaluate at y = 10. |

### Revision Exercise 10

Questions 33–39: p.10.42; 40–53: p.10.43; 54–56: p.10.44. Answers: p.10.53.

| Question | Parts | Required teaching actions |
| --- | --- | --- |
| 33 | a,b | Multiply powers and retain the product sign. |
| 34 | a,b | Divide monomials, including negative coefficients and denominator powers. |
| 35 | a,b | Combine products/division with signs and multivariable powers. |
| 36 | a,b | Follow left-to-right products/divisions and simplify using positive indices. |
| 37 | a,b | Remove signed brackets and arrange in ascending powers. |
| 38 | a,b | Simplify three polynomials and arrange in ascending powers. |
| 39 | a,b | Track negative signs across three brackets and arrange ascending. |
| 40 | unlettered | Remove nested brackets from the inside out; arrange descending. |
| 41 | unlettered | Remove nested brackets with several negative terms; show cancellations. |
| 42 | a,b | Distribute and simplify sums/differences of products. |
| 43 | a,b | Expand multivariable expressions and collect only like terms. |
| 44 | a,b | Expand a square, retain the cross term, then combine/subtract. |
| 45 | a,b | Expand an external monomial times two brackets; arrange descending. |
| 46 | a,b | Expand signed binomial/trinomial products; arrange descending. |
| 47 | unlettered | Expand a quadratic product, add the remaining term and arrange descending. |
| 48 | unlettered | Expand a product then subtract the complete cubic polynomial. |
| 49 | a,b | Expand two factors and reuse the result for three factors. |
| 50 | a,b | Expand a square; identify every contribution to the x² coefficient after multiplying by x + 1. |
| 51 | unlettered | Identify contributions to the x⁴ coefficient, set that coefficient equal to 38, and solve for p. |
| 52 | a,b | Rectangle: distinguish perimeter from area, form both expressions, then substitute a = 5. |
| 53 | a,b | Shopping: form quantity × price for both fruits, then compare the total at x = 4, y = 5 against $100. |
| 54 | a,b | L-shaped shaded region: trace the full exposed boundary, subtract square areas, then substitute x = 3. |
| 55 | a,b | Use the perimeter to obtain AD; introduce AC to split the quadrilateral into the two right triangles indicated by the printed right-angle marks and add their areas. |
| 56 | a,b | Cuboid: distinguish volume from total surface area; show all three pairs of faces. |

## Representative independent checks

These initial checks were deliberately separate from simply reading the answer key. The completed full-bank audit is recorded below.

| Reference | Independently derived result | Printed key |
| --- | --- | --- |
| 10A 31(a) | `30m⁴ ÷ 4m³n⁵ ÷ (−5mn²) = −3/(2n⁷)` (m,n nonzero) | Matches p.10.50 |
| 10A 32(b) | `8xy² ÷ (7x⁵y² ÷ 14x³y⁴) = 16y⁴/x` (x,y nonzero) | Matches p.10.50 |
| 10B 19(d) | Four terms; constant −7; maximum total degree 7 from a³b⁴ | Matches p.10.51 |
| 10B 27(c) | At x = 1/2: `1/2 − 3/4 + 6 = 23/4` | Matches p.10.51 |
| 10B 28(c) | At x = −2/3, y = 1/2: `4/9 − 1/36 − 5/6 = −5/12` | Matches p.10.51 |
| 10B 29 | AB = 16, BC = 18, CD = 41, DA = 50; DA is longest | Matches p.10.51 |
| 10B 30 | PQ = 5, QR = 4, PR = 5; isosceles since PQ = PR | Printed key says yes, p.10.51 |
| 10C 23(b) | `(4x−7)−(−2x²+3−8x)+(5x−2) = 2x²+17x−12` | Matches p.10.52 |
| 10C 35 | Spent `7x²+6xy−3y²`; at (4,3): initial $312, spent $157, remaining $155 > $150 | Printed key says yes, p.10.52 |
| 10D 34(b) | `2x²−(3x+4)² = −7x²−24x−16` | Matches p.10.52 |
| 10D 40 | `(-2x²+x)(x+2)−(-x³+x²+4) = −x³−4x²+2x−4` | Matches p.10.52 |
| 10D 42 | `(y+1)(5y+2)² = 25y³+45y²+24y+4`; at y = 10 gives 29,744 | Matches p.10.52 |
| Revision 51 | x⁴ coefficient is `8−15p`; `8−15p=38` gives p = −2 | Matches p.10.53 |
| Revision 53 | Total `7xy−3x−6y−1`; at (4,5) gives $97, leaving $3 | Printed key says yes, p.10.53 |
| Revision 54 | Perimeter `12x+20`, area `5x²+30x+25`; at x = 3 gives 56 cm and 160 cm² | Matches p.10.53 |
| Revision 55 | AD = `2x−1`; area `[(6x−4)(x²−1)+6x(2x−1)]/2 = 3x³+4x²−6x+2` | Matches p.10.53 |
| Revision 56 | Volume `2x³+x²−50x−25`; surface area `10x²+4x−50` | Matches p.10.53 |

## Full-bank source verification (23/10/2026)

- Complete: visual scope review, every Level 2 question classified, final-answer pages located and inspected, representative independent calculations above.
- A local inventory check confirmed every numbered question appears once and the part counts total 158. Separate coefficient-map checks confirmed the proposed 10D Q34(b) pilot and 10C Q23(b); exact fraction checks covered 10B Q27(c)/Q28(c). Evidence: ignored `out/polynomials-source/audit-checks.json`.
- All 158 entries are transcribed in `src/apps/polynomials/data/`: 24 for 10A, 27 for 10B, 32 for 10C, 32 for 10D and 43 for Revision 10. A fresh independent review compared every source expression and final answer against question pages 12, 22, 23, 27, 28, 35, 36, 42, 43, 44 and answer pages 50–53. No expression or final-answer discrepancy was found.
- The textbook supplies final answers, not a complete worked solution for every question. The app's intermediate explanations are authored teaching steps. Exact rational polynomial comparisons validate every machine-readable equation and individual distribution product; separate source review checks coefficient-only conclusions, tables, units, ordering, restrictions and dependencies.
- All 158 source crops were generated and visually inspected in seven contact sheets. Review corrections tighten the one-row 10D crops, separate Q40/Q41 and restore the bottom margin of Revision Q54. The full PDF and answer-key pages remain in ignored local source storage.
- Content review and exact-check evidence: ignored `out/polynomials-full-bank/content-review.md`, `focused-tests.log` (169 passing tests), and `crop-review-1.jpg` through `crop-review-7.jpg`. Final application verification is recorded separately in `docs/polynomials-full-bank.md`.
