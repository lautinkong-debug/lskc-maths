# Topic list — source of truth for seeding `topics/`

Extracted from the owner's `Topic.docx` (screenshots of the department's chapter files,
`C:\Users\t28ltk\OneDrive\11_AI\Mistakes Book\Topic.docx`) on 2026-09-21.

- `code` is the department's own chapter code, exactly as used in the file names
  (`1A01`, `2B07`, `Ch13`, …). It is stored on the topic document and shown as a small
  label, so uploads line up with the files teachers already have.
- `strand` is one of `number-algebra`, `measures-shape-space`, `data-handling`
  (compulsory part) or `m2-foundation`, `m2-calculus`, `m2-algebra` (M2).
- Spelling was tidied where the file names had typos ("Numberical" → "Numerical").
  The codes were **not** changed.

Edit this file, then run `npm run seed` (Phase 3) to load it into the emulator.
Running the seed again updates the original chapter records to match this file,
including their order. Topics added in the website editor are left alone.

---

## F1 — 13 topics

| code | name | strand |
|---|---|---|
| 1A00 | Revision on Fundamental Arithmetic | number-algebra |
| 1A01 | Basic Mathematics | number-algebra |
| 1A02 | Directed Numbers and the Number Line | number-algebra |
| 1A03 | Introduction to Algebra | number-algebra |
| 1A04 | Linear Equation in One Unknown | number-algebra |
| 1A05 | Introduction to Geometry | measures-shape-space |
| 1A06 | Introduction to Statistics and Statistical Charts | data-handling |
| 1A07 | Percentages | number-algebra |
| 1A08 | Approximate Values and Numerical Estimation | measures-shape-space |
| 1A09 | Area and Volumes | measures-shape-space |
| 1A10 | Manipulation of Simple Polynomials | number-algebra |
| 1A11 | Angles Related to Lines | measures-shape-space |
| 1A12 | Introduction to Coordinates | measures-shape-space |

## F2 — 12 topics

| code | name | strand |
|---|---|---|
| 2A01 | Errors in Measurement | measures-shape-space |
| 2A02 | Identities and Factorization | number-algebra |
| 2A03 | Algebraic Fractions and Formulas | number-algebra |
| 2A04 | Angles Related to Rectilinear Figures | measures-shape-space |
| 2A05 | Congruence | measures-shape-space |
| 2A06 | More about Statistical Charts | data-handling |
| 2B07 | Rate, Ratio and Proportion | number-algebra |
| 2B08 | Similarity | measures-shape-space |
| 2B09 | Linear Equations in Two Unknowns | number-algebra |
| 2B10 | Pythagoras' Theorem and Irrational Numbers | measures-shape-space |
| 2B11 | Areas and Volumes (II) | measures-shape-space |
| 2B12 | Trigonometric Ratios | measures-shape-space |

## F3 — 12 topics

| code | name | strand |
|---|---|---|
| 3A01 | More about Factorization of Polynomials | number-algebra |
| 3A02 | Laws of Integral Indices | number-algebra |
| 3A03 | Linear Inequalities in One Unknown | number-algebra |
| 3A04 | Percentages (II) | number-algebra |
| 3A05 | Quadrilaterals | measures-shape-space |
| 3A06 | Special Lines and Centres in a Triangle | measures-shape-space |
| 3B07 | Areas and Volumes (III) | measures-shape-space |
| 3B08 | Coordinate Geometry of Straight Lines | measures-shape-space |
| 3B09 | Trigonometric Relations | measures-shape-space |
| 3B10 | Applications of Trigonometry | measures-shape-space |
| 3B11 | Measures of Central Tendency | data-handling |
| 3B12 | Introduction to Probability | data-handling |

## F4 — 13 topics

Senior-form chapters run in one sequence, Ch0 – Ch31, across F4 / F5 / F6.
"Ch0 Basic Mathematics" appears in both the 4A and 4B file sets; it is one topic here.

| code | name | strand |
|---|---|---|
| Ch0 | Basic Mathematics | number-algebra |
| Ch1 | Quadratic Equations and Number Systems | number-algebra |
| Ch2 | Equations of Straight Lines | measures-shape-space |
| Ch3 | Basic Knowledge of Functions | number-algebra |
| Ch4 | Quadratic Functions and their Graphs | number-algebra |
| Ch5 | More about Polynomials | number-algebra |
| Ch6 | Trigonometric Functions and their Graphs | measures-shape-space |
| Ch7 | More about Quadratic Functions, Quadratic Equations and Complex Numbers | number-algebra |
| Ch8 | Rational Functions | number-algebra |
| Ch9 | More about Equations | number-algebra |
| Ch10 | Exponential Functions | number-algebra |
| Ch11 | Logarithms and Logarithmic Functions | number-algebra |
| Ch12 | Solving Triangles and Trigonometric Equations | measures-shape-space |

## F5 — 13 topics

| code | name | strand |
|---|---|---|
| Ch13 | Compound Linear Inequalities in One Unknown | number-algebra |
| Ch14 | Solving Equations and Inequalities by Graphical Method | number-algebra |
| Ch15 | Variations | number-algebra |
| Ch16 | Basic Properties of Circles | measures-shape-space |
| Ch17 | Loci and Equations of Circles | measures-shape-space |
| Ch18 | Measures of Dispersion | data-handling |
| Ch19 | More about Dispersion | data-handling |
| Ch20 | Uses and Abuses of Statistics | data-handling |
| Ch21 | Permutation and Combination | data-handling |
| Ch22 | More about Probability | data-handling |
| Ch23 | More about Quadratic Inequalities | number-algebra |
| Ch24 | Concyclic Points and Tangents of Circles | measures-shape-space |
| Ch25 | More about Equations of Circles | measures-shape-space |

## F6 — 6 topics

| code | name | strand |
|---|---|---|
| Ch26 | Transformations of Functions | number-algebra |
| Ch27 | Arithmetic Sequences and their Sums | number-algebra |
| Ch28 | Geometric Sequences and their Sums | number-algebra |
| Ch29 | Applications of Trigonometry | measures-shape-space |
| Ch30 | Linear Programming | number-algebra |
| Ch31 | Further Applications of Mathematics | number-algebra |

## M2 — not yet

The owner deferred M2 on 2026-09-21. `Topic.docx` had no M2 list either.

The `M2` level and the `m2-foundation` / `m2-calculus` / `m2-algebra` strands stay in
`src/lib/constants.ts`, so adding M2 later means adding rows to this file and re-running
the seed — no code change. Until then, no M2 topics exist and filters skip the level.

---

Total: **69** topics, all compulsory part (F1–F6).
