import type { Boundary, PrismGeometry, SurfaceQuestion } from "./types";

const boundary = (
  xy: number[][],
  edgeLabels?: (string | null)[],
): Boundary => ({
  points: xy.map(([x, y]) => ({ x, y })),
  ...(edgeLabels ? { edgeLabels } : {}),
});
const rectangle = (width: number, depth: number): Boundary =>
  boundary([
    [0, 0],
    [width, 0],
    [width, depth],
    [0, depth],
  ]);
const prism = (
  outer: Boundary,
  height: number,
  baseArea: number,
  extra: Partial<PrismGeometry> = {},
): PrismGeometry => ({
  kind: "prism",
  outer,
  height,
  baseArea,
  baseCount: 2,
  ...extra,
});

/**
 * Source: Book 1B, Chapter 9, pp. 9.38–9.49; answers pp. 9.51–9.52.
 * Intermediate working is independently authored, not a verbatim worked key.
 * All coordinates use centimetres unless the variant explicitly says metres.
 */
export const revisionQuestions: SurfaceQuestion[] = [
  {
    id: "check-5",
    section: "Check Yourself",
    label: "Q5",
    page: 38,
    prompt:
      "Find the volume and the total surface area of the right triangular prism.",
    variants: [
      {
        id: "main",
        label: "Right triangle",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 0],
            [4, 0],
            [4, 3],
          ]),
          8,
          6,
        ),
        baseWorking: "B = ½ × 4 × 3 = 6 cm²",
        working: [
          "B = ½ × 4 × 3 = 6 cm²",
          "Volume = 6 × 8 = 48 cm³",
          "P = 4 + 3 + 5 = 12 cm",
          "Lateral area = 12 × 8 = 96 cm²",
          "Total surface area = 96 + 2 × 6 = 108 cm²",
        ],
        answer: "Volume = 48 cm³; total surface area = 108 cm².",
        expected: { perimeter: 12, lateralArea: 96, surfaceArea: 108 },
      },
    ],
  },
  {
    id: "check-6",
    section: "Check Yourself",
    label: "Q6",
    page: 38,
    prompt:
      "Find the volume and the total surface area of the right prism with a trapezium base.",
    variants: [
      {
        id: "main",
        label: "Trapezium",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 0],
            [15, 0],
            [15, 6],
            [8, 6],
          ]),
          5,
          66,
        ),
        baseWorking: "B = ½ × (7 + 15) × 6 = 66 cm²",
        working: [
          "B = ½ × (7 + 15) × 6 = 66 cm²",
          "Volume = 66 × 5 = 330 cm³",
          "P = 15 + 6 + 7 + 10 = 38 cm",
          "Lateral area = 38 × 5 = 190 cm²",
          "Total surface area = 190 + 2 × 66 = 322 cm²",
        ],
        answer: "Volume = 330 cm³; total surface area = 322 cm².",
        expected: { perimeter: 38, lateralArea: 190, surfaceArea: 322 },
      },
    ],
  },
  {
    id: "check-8",
    section: "Check Yourself",
    label: "Q8",
    page: 38,
    prompt: "The cuboid has total surface area 352 cm². Find x.",
    variants: [
      {
        id: "main",
        label: "Find the prism height",
        unit: "cm",
        target: "total",
        geometry: prism(rectangle(12, 4), 8, 48, { heightLabel: "x cm" }),
        baseWorking: "B = 12 × 4 = 48 cm²",
        working: [
          "B = 12 × 4 = 48 cm²",
          "P = 2 × (12 + 4) = 32 cm",
          "32x + 2 × 48 = 352",
          "32x = 256",
          "x = 8",
        ],
        answer: "x = 8.",
        expected: { perimeter: 32, lateralArea: 256, surfaceArea: 352 },
      },
    ],
  },
  {
    id: "revision-10",
    section: "Revision Exercise 9",
    label: "Q10",
    page: 40,
    prompt: "Find the volume and the total surface area of the cuboid.",
    variants: [
      {
        id: "main",
        label: "Cuboid",
        unit: "cm",
        target: "total",
        geometry: prism(rectangle(8, 3), 2, 24),
        baseWorking: "B = 8 × 3 = 24 cm²",
        working: [
          "B = 8 × 3 = 24 cm²",
          "Volume = 24 × 2 = 48 cm³",
          "P = 2 × (8 + 3) = 22 cm",
          "Lateral area = 22 × 2 = 44 cm²",
          "Total surface area = 44 + 2 × 24 = 92 cm²",
        ],
        answer: "Volume = 48 cm³; total surface area = 92 cm².",
        expected: { perimeter: 22, lateralArea: 44, surfaceArea: 92 },
      },
    ],
  },
  {
    id: "revision-11",
    section: "Revision Exercise 9",
    label: "Q11",
    page: 40,
    prompt:
      "Find the volume and the total surface area of the right triangular prism.",
    variants: [
      {
        id: "main",
        label: "Right triangle",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 0],
            [12, 0],
            [0, 5],
          ]),
          18,
          30,
        ),
        baseWorking: "B = ½ × 12 × 5 = 30 cm²",
        working: [
          "B = ½ × 12 × 5 = 30 cm²",
          "Volume = 30 × 18 = 540 cm³",
          "P = 12 + 13 + 5 = 30 cm",
          "Lateral area = 30 × 18 = 540 cm²",
          "Total surface area = 540 + 2 × 30 = 600 cm²",
        ],
        answer: "Volume = 540 cm³; total surface area = 600 cm².",
        expected: { perimeter: 30, lateralArea: 540, surfaceArea: 600 },
      },
    ],
  },
  {
    id: "revision-12",
    section: "Revision Exercise 9",
    label: "Q12",
    page: 40,
    prompt:
      "Find the volume and the total surface area of the right prism with a parallelogram base.",
    variants: [
      {
        id: "main",
        label: "Parallelogram",
        givens: ["The parallelogram base has perpendicular altitude 4 cm."],
        unit: "cm",
        target: "total",
        geometry: prism(
          {
            ...boundary([
              [0, 0],
              [6, 0],
              [3, 4],
              [-3, 4],
            ]),
            measurements: [
              { a: { x: -3, y: 0 }, b: { x: -3, y: 4 }, label: "4 cm" },
            ],
          },
          9,
          24,
        ),
        note: "The 4 cm measurement is the perpendicular altitude of the parallelogram. The prism height is 9 cm.",
        baseWorking: "B = 6 × 4 = 24 cm²",
        working: [
          "B = 6 × 4 = 24 cm²",
          "Volume = 24 × 9 = 216 cm³",
          "P = 2 × (6 + 5) = 22 cm",
          "Lateral area = 22 × 9 = 198 cm²",
          "Total surface area = 198 + 2 × 24 = 246 cm²",
        ],
        answer: "Volume = 216 cm³; total surface area = 246 cm².",
        expected: { perimeter: 22, lateralArea: 198, surfaceArea: 246 },
      },
    ],
  },
  {
    id: "revision-13",
    section: "Revision Exercise 9",
    label: "Q13",
    page: 40,
    prompt:
      "Find the volume and the total surface area of the right prism with a trapezium base.",
    variants: [
      {
        id: "main",
        label: "Trapezium",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 6],
            [8, 0],
            [11, 0],
            [11, 6],
          ]),
          12,
          42,
        ),
        baseWorking: "B = ½ × (11 + 3) × 6 = 42 cm²",
        working: [
          "B = ½ × (11 + 3) × 6 = 42 cm²",
          "Volume = 42 × 12 = 504 cm³",
          "P = 10 + 3 + 6 + 11 = 30 cm",
          "Lateral area = 30 × 12 = 360 cm²",
          "Total surface area = 360 + 2 × 42 = 444 cm²",
        ],
        answer: "Volume = 504 cm³; total surface area = 444 cm².",
        expected: { perimeter: 30, lateralArea: 360, surfaceArea: 444 },
      },
    ],
  },
  {
    id: "revision-14",
    section: "Revision Exercise 9",
    label: "Q14",
    page: 40,
    prompt: "The cuboid has total surface area 104 m². Find x.",
    variants: [
      {
        id: "main",
        label: "Find the prism height",
        unit: "m",
        target: "total",
        geometry: prism(rectangle(6, 5), 2, 30, { heightLabel: "x m" }),
        baseWorking: "B = 6 × 5 = 30 m²",
        working: [
          "B = 6 × 5 = 30 m²",
          "P = 2 × (6 + 5) = 22 m",
          "22x + 2 × 30 = 104",
          "22x = 44",
          "x = 2",
        ],
        answer: "x = 2.",
        expected: { perimeter: 22, lateralArea: 44, surfaceArea: 104 },
      },
    ],
  },
  {
    id: "revision-15",
    section: "Revision Exercise 9",
    label: "Q15",
    page: 40,
    prompt:
      "The right triangular prism has volume 840 cm³. (a) Find x. (b) Find its total surface area.",
    variants: [
      {
        id: "main",
        label: "Volume gives a base dimension",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary(
            [
              [0, 0],
              [24, 0],
              [24, 7],
            ],
            [null, "x cm", null],
          ),
          10,
          84,
        ),
        baseWorking: "B = 840 ÷ 10 = 84 cm²",
        working: [
          "½ × 24 × x × 10 = 840",
          "120x = 840",
          "x = 7",
          "B = ½ × 24 × 7 = 84 cm²",
          "P = 24 + 7 + 25 = 56 cm",
          "Total surface area = 56 × 10 + 2 × 84 = 728 cm²",
        ],
        answer: "(a) x = 7. (b) Total surface area = 728 cm².",
        expected: { perimeter: 56, lateralArea: 560, surfaceArea: 728 },
      },
    ],
  },
  {
    id: "revision-24",
    section: "Revision Exercise 9",
    label: "Q24",
    page: 42,
    prompt:
      "Find the volume and the total surface area of the right prism with a house-shaped base.",
    variants: [
      {
        id: "main",
        label: "Rectangle and triangle",
        givens: ["The triangular roof has perpendicular altitude 12 cm."],
        unit: "cm",
        target: "total",
        geometry: prism(
          {
            ...boundary([
              [0, 0],
              [10, 0],
              [10, 5],
              [5, 17],
              [0, 5],
            ]),
            measurements: [
              { a: { x: 5, y: 5 }, b: { x: 5, y: 17 }, label: "12 cm" },
            ],
          },
          7,
          110,
        ),
        baseWorking: "B = 10 × 5 + ½ × 10 × 12 = 110 cm²",
        working: [
          "B = 10 × 5 + ½ × 10 × 12 = 110 cm²",
          "Volume = 110 × 7 = 770 cm³",
          "P = 10 + 5 + 13 + 13 + 5 = 46 cm",
          "Lateral area = 46 × 7 = 322 cm²",
          "Total surface area = 322 + 2 × 110 = 542 cm²",
        ],
        answer: "Volume = 770 cm³; total surface area = 542 cm².",
        expected: { perimeter: 46, lateralArea: 322, surfaceArea: 542 },
      },
    ],
  },
  {
    id: "revision-25",
    section: "Revision Exercise 9",
    label: "Q25",
    page: 42,
    prompt:
      "Find the volume and the total surface area of the right prism with the concave base shown.",
    variants: [
      {
        id: "main",
        label: "Concave base",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 0],
            [8, 6],
            [12, 6],
            [12, 10],
            [0, 10],
          ]),
          10,
          72,
        ),
        baseWorking: "B = 12 × 4 + ½ × (12 − 4) × (10 − 4) = 72 cm²",
        working: [
          "Lower triangle: base = 12 − 4 = 8 cm; altitude = 10 − 4 = 6 cm",
          "B = 12 × 4 + ½ × 8 × 6 = 72 cm²",
          "Volume = 72 × 10 = 720 cm³",
          "P = 10 + 4 + 4 + 12 + 10 = 40 cm",
          "Total surface area = 40 × 10 + 2 × 72 = 544 cm²",
        ],
        answer: "Volume = 720 cm³; total surface area = 544 cm².",
        expected: { perimeter: 40, lateralArea: 400, surfaceArea: 544 },
      },
    ],
  },
  {
    id: "revision-26",
    section: "Revision Exercise 9",
    label: "Q26",
    page: 42,
    prompt:
      "Find the volume and the total surface area of the three-step right prism.",
    variants: [
      {
        id: "main",
        label: "Three steps",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary(
            [
              [0, 0],
              [9, 0],
              [9, 3],
              [6, 3],
              [6, 6],
              [3, 6],
              [3, 9],
              [0, 9],
            ],
            ["", null, null, null, null, null, null, ""],
          ),
          8,
          54,
        ),
        note: "Each tread and rise in the source diagram is 3 cm. Trace all eight boundary edges; decomposition lines are not edges.",
        baseWorking: "B = 3 × 9 + 3 × 6 + 3 × 3 = 54 cm²",
        working: [
          "Overall width = overall height = 3 + 3 + 3 = 9 cm",
          "B = 3 × 9 + 3 × 6 + 3 × 3 = 54 cm²",
          "Volume = 54 × 8 = 432 cm³",
          "P = 9 + 3 + 3 + 3 + 3 + 3 + 3 + 9 = 36 cm",
          "Total surface area = 36 × 8 + 2 × 54 = 396 cm²",
        ],
        answer: "Volume = 432 cm³; total surface area = 396 cm².",
        expected: { perimeter: 36, lateralArea: 288, surfaceArea: 396 },
      },
    ],
  },
  {
    id: "revision-27",
    section: "Revision Exercise 9",
    label: "Q27",
    page: 42,
    prompt:
      "Find the volume and the total surface area of the right prism with a square hole passing through it.",
    variants: [
      {
        id: "main",
        label: "Square frame",
        unit: "cm",
        target: "total",
        geometry: prism(rectangle(10, 10), 2, 64, {
          holes: [
            boundary([
              [2, 2],
              [2, 8],
              [8, 8],
              [8, 2],
            ]),
          ],
        }),
        note: "Both the outer boundary and the inner boundary produce lateral faces. Each base is a frame, with the hole removed.",
        baseWorking: "B = 10² − 6² = 64 cm²",
        working: [
          "B = 10² − 6² = 64 cm²",
          "Volume = 64 × 2 = 128 cm³",
          "Outer perimeter = 4 × 10 = 40 cm",
          "Inner perimeter = 4 × 6 = 24 cm",
          "Lateral area = (40 + 24) × 2 = 128 cm²",
          "Total surface area = 128 + 2 × 64 = 256 cm²",
        ],
        answer: "Volume = 128 cm³; total surface area = 256 cm².",
        expected: { perimeter: 64, lateralArea: 128, surfaceArea: 256 },
      },
    ],
  },
  {
    id: "revision-29",
    section: "Revision Exercise 9",
    label: "Q29",
    page: 42,
    prompt: "The H-shaped right prism has total surface area 167 cm². Find x.",
    variants: [
      {
        id: "main",
        label: "H-shaped base",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary(
            [
              [0, 0],
              [1, 0],
              [1, 2],
              [3.5, 2],
              [3.5, 0],
              [4.5, 0],
              [4.5, 7],
              [3.5, 7],
              [3.5, 5],
              [1, 5],
              [1, 7],
              [0, 7],
            ],
            [
              null,
              null,
              "x cm",
              null,
              null,
              null,
              null,
              null,
              "x cm",
              null,
              null,
              null,
            ],
          ),
          4,
          21.5,
        ),
        baseWorking: "B = 7(x + 2) − 2(2x) = 3x + 14 cm²",
        working: [
          "B = 7(x + 2) − 2(2x) = 3x + 14 cm²",
          "P = 2(x + 2 + 7) + 4 × 2 = 2x + 26 cm",
          "4(2x + 26) + 2(3x + 14) = 167",
          "14x + 132 = 167",
          "x = 2.5",
          "Check: 31 × 4 + 2 × 21.5 = 167 cm²",
        ],
        answer: "x = 2.5.",
        expected: { perimeter: 31, lateralArea: 124, surfaceArea: 167 },
      },
    ],
  },
  {
    id: "revision-30",
    section: "Revision Exercise 9",
    label: "Q30",
    page: 42,
    prompt:
      "A right prism has a right-angled triangular base. Its lateral area is 3 times the sum of the areas of its two bases. (a) Find the prism height. (b) Harry claims its volume is less than 0.2 m³. Do you agree? Explain.",
    variants: [
      {
        id: "main",
        label: "Lateral area gives the height",
        unit: "cm",
        target: "lateral",
        geometry: prism(
          boundary([
            [0, 0],
            [120, 0],
            [0, 50],
          ]),
          60,
          3000,
          { baseCount: 0, heightLabel: "h cm" },
        ),
        note: "The unfolding shows the lateral faces used in the given relation. The two triangular bases are used to calculate their combined area, not added to the lateral-area target.",
        baseWorking: "B = ½ × 50 × 120 = 3000 cm²",
        working: [
          "B = ½ × 50 × 120 = 3000 cm²",
          "Lateral area = 3 × (2 × 3000) = 18 000 cm²",
          "P = 50 + 120 + 130 = 300 cm",
          "300h = 18 000, so h = 60 cm",
          "Volume = 3000 × 60 = 180 000 cm³",
          "180 000 cm³ = 0.18 m³ < 0.2 m³; agree with Harry",
        ],
        answer: "(a) 60 cm. (b) Yes: the volume is 0.18 m³.",
        expected: { perimeter: 300, lateralArea: 18000, surfaceArea: 18000 },
      },
    ],
  },
  {
    id: "revision-31",
    section: "Revision Exercise 9",
    label: "Q31",
    page: 42,
    prompt:
      "A 25 cm × 15 cm × 10 cm rectangular tank is 40% full of water. Stones of total volume 1425 cm³ are fully submerged, with no overflow. (a) Find the new water depth. (b) George claims the tank's wetted surface area exceeds 1000 cm². Do you agree? Explain.",
    variants: [
      {
        id: "main",
        label: "Wetted tank surfaces",
        unit: "cm",
        target: "wetted",
        geometry: prism(rectangle(25, 15), 7.8, 375, {
          baseCount: 1,
          heightLabel: "water depth",
          heightName: "water depth",
          water: {
            tankHeight: 10,
            initialDepth: 4,
            initialLabel: "40% full",
            contents: "stones",
          },
        }),
        note: "The visualised height is the new water depth, not the 10 cm tank height. Count the inner bottom and four wet wall portions; the water's free surface is not tank material.",
        baseWorking: "Bottom area = 25 × 15 = 375 cm²",
        working: [
          "Water volume = 40% × 25 × 15 × 10 = 1500 cm³",
          "Volume below the new water level = 1500 + 1425 = 2925 cm³",
          "Water depth = 2925 ÷ (25 × 15) = 7.8 cm",
          "Wet wall area = 2 × (25 + 15) × 7.8 = 624 cm²",
          "Wetted surface area = 25 × 15 + 624 = 999 cm²",
          "999 < 1000; disagree with George",
        ],
        answer: "(a) 7.8 cm. (b) No: the wetted surface area is 999 cm².",
        expected: { perimeter: 80, lateralArea: 624, surfaceArea: 999 },
      },
    ],
  },
  {
    id: "revision-33",
    section: "Revision Exercise 9",
    label: "Q33",
    page: 43,
    prompt:
      "A solid is formed by joining cubes of sides 3 cm, 4 cm and 5 cm as shown. Find the total surface area to be painted.",
    variants: [
      {
        id: "main",
        label: "Three joined cubes",
        unit: "cm",
        target: "composite",
        geometry: {
          kind: "cubes",
          cubes: [
            { side: 5, origin: [0, 0, 0] },
            { side: 4, origin: [0.5, 0.5, 5] },
            { side: 3, origin: [1, 1, 9] },
          ],
          contacts: [
            { cubes: [0, 1], area: 16 },
            { cubes: [1, 2], area: 9 },
          ],
        },
        note: "The cubes are stacked as in the source. Each contact patch hides one face area on each of two cubes. This solid is not a prism with one uniform cross-section.",
        working: [
          "Sum of separate cube surface areas = 6 × (3² + 4² + 5²) = 300 cm²",
          "Contact patches have areas 3² = 9 cm² and 4² = 16 cm²",
          "Hidden surface area = 2 × (9 + 16) = 50 cm²",
          "Area to be painted = 300 − 50 = 250 cm²",
        ],
        answer: "250 cm².",
        expected: { surfaceArea: 250 },
      },
    ],
  },
  {
    id: "mc-7",
    section: "Multiple Choice",
    label: "Q7",
    page: 45,
    prompt:
      "The right triangular prism has total surface area 840 cm². Find x. A: 15; B: 18; C: 19.5; D: 21.",
    variants: [
      {
        id: "main",
        label: "Find the prism height",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 0],
            [8, 0],
            [0, 15],
          ]),
          18,
          60,
          { heightLabel: "x cm" },
        ),
        baseWorking: "B = ½ × 8 × 15 = 60 cm²",
        working: [
          "B = ½ × 8 × 15 = 60 cm²",
          "P = 8 + 15 + 17 = 40 cm",
          "40x + 2 × 60 = 840",
          "40x = 720",
          "x = 18; answer B",
        ],
        answer: "B: x = 18.",
        expected: { perimeter: 40, lateralArea: 720, surfaceArea: 840 },
      },
    ],
  },
  {
    id: "mc-8",
    section: "Multiple Choice",
    label: "Q8",
    page: 45,
    prompt:
      "Find the total surface area of the right prism. A: 600 cm²; B: 700 cm²; C: 740 cm²; D: 780 cm².",
    variants: [
      {
        id: "main",
        label: "Triangle with a rectangular notch",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 5],
            [10, 5],
            [10, 0],
            [24, 0],
            [0, 10],
          ]),
          10,
          70,
        ),
        baseWorking: "B = ½ × (10 + 14) × (5 + 5) − 10 × 5 = 70 cm²",
        working: [
          "B = ½ × 24 × 10 − 10 × 5 = 70 cm²",
          "P = 10 + 5 + 14 + 26 + 5 = 60 cm",
          "Lateral area = 60 × 10 = 600 cm²",
          "Total surface area = 600 + 2 × 70 = 740 cm²",
          "Answer C",
        ],
        answer: "C: 740 cm².",
        expected: { perimeter: 60, lateralArea: 600, surfaceArea: 740 },
      },
    ],
  },
  {
    id: "mc-11",
    section: "Multiple Choice",
    label: "Q11",
    page: 46,
    prompt:
      "A rectangular tank has a 20 cm × 12 cm base and contains some water. Two metal balls, each of volume 360 cm³, become fully submerged with no overflow. Find the increase in the tank's wetted surface area. A: 96 cm²; B: 192 cm²; C: 336 cm²; D: 432 cm².",
    variants: [
      {
        id: "main",
        label: "Newly wetted wall band",
        unit: "cm",
        target: "increase",
        geometry: prism(rectangle(20, 12), 3, 240, {
          baseCount: 0,
          heightLabel: "rise in water level",
          heightName: "rise in water level",
          water: { contents: "balls" },
        }),
        note: "This prism represents only the extra wet band around the four tank walls. The bottom was already wet and adds zero to the increase. The balls' surfaces are not tank surfaces.",
        baseWorking: "Tank bottom area = 20 × 12 = 240 cm²",
        working: [
          "Displaced volume = 2 × 360 = 720 cm³",
          "Rise in water level = 720 ÷ (20 × 12) = 3 cm",
          "Perimeter of tank bottom = 2 × (20 + 12) = 64 cm",
          "Increase in wetted surface area = 64 × 3 = 192 cm²",
          "The bottom contributes no increase; answer B",
        ],
        answer: "B: 192 cm².",
        expected: { perimeter: 64, lateralArea: 192, surfaceArea: 192 },
      },
    ],
  },
  {
    id: "exam-2",
    section: "Exam-type Questions",
    label: "Q2",
    page: 47,
    prompt:
      "Find (a) the volume and (b) the total surface area of the L-shaped right prism.",
    variants: [
      {
        id: "main",
        label: "L-shaped base",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 0],
            [8, 0],
            [8, 4],
            [4, 4],
            [4, 8],
            [0, 8],
          ]),
          12,
          48,
        ),
        baseWorking: "B = 8 × 8 − 4 × 4 = 48 cm²",
        working: [
          "Missing rectangle: width = 8 − 4 = 4 cm; height = 8 − 4 = 4 cm",
          "B = 8 × 8 − 4 × 4 = 48 cm²",
          "Volume = 48 × 12 = 576 cm³",
          "P = 8 + 4 + 4 + 4 + 4 + 8 = 32 cm",
          "Total surface area = 32 × 12 + 2 × 48 = 480 cm²",
        ],
        answer: "(a) 576 cm³. (b) 480 cm².",
        expected: { perimeter: 32, lateralArea: 384, surfaceArea: 480 },
      },
    ],
  },
  {
    id: "exam-3",
    section: "Exam-type Questions",
    label: "Q3",
    page: 48,
    prompt:
      "The cuboid has volume 480 cm³, AB = 6 cm and AE = 10 cm. Find (a) AD and (b) its total surface area.",
    variants: [
      {
        id: "main",
        label: "Volume gives the prism height",
        unit: "cm",
        target: "total",
        geometry: prism(
          { ...rectangle(6, 10), vertexNames: ["A", "B", "F", "E"] },
          8,
          60,
          { heightLabel: "AD", heightName: "AD" },
        ),
        note: "Choose the front rectangle ABFE as a base. AD is then the distance between the two parallel bases.",
        baseWorking: "B = AB × AE = 6 × 10 = 60 cm²",
        working: [
          "6 × 10 × AD = 480",
          "AD = 480 ÷ 60 = 8 cm",
          "B = 6 × 10 = 60 cm²",
          "P = 2 × (6 + 10) = 32 cm",
          "Total surface area = 32 × 8 + 2 × 60 = 376 cm²",
        ],
        answer: "(a) AD = 8 cm. (b) 376 cm².",
        expected: { perimeter: 32, lateralArea: 256, surfaceArea: 376 },
      },
    ],
  },
  {
    id: "exam-7",
    section: "Exam-type Questions",
    label: "Q7",
    page: 48,
    prompt:
      "Find the total surface area of the solid right prism. A: 112 cm²; B: 448 cm²; C: 504 cm²; D: 560 cm².",
    variants: [
      {
        id: "main",
        label: "Trapezium",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary([
            [0, 0],
            [8, 0],
            [8, 10],
            [0, 4],
          ]),
          14,
          56,
        ),
        baseWorking: "B = ½ × (4 + 10) × 8 = 56 cm²",
        working: [
          "B = ½ × (4 + 10) × 8 = 56 cm²",
          "P = 8 + 10 + 10 + 4 = 32 cm",
          "Lateral area = 32 × 14 = 448 cm²",
          "Total surface area = 448 + 2 × 56 = 560 cm²",
          "Answer D",
        ],
        answer: "D: 560 cm².",
        expected: { perimeter: 32, lateralArea: 448, surfaceArea: 560 },
      },
    ],
  },
  {
    id: "public-2",
    section: "Public Exam Questions",
    label: "Q2 · HKCEE 2010",
    page: 49,
    prompt:
      "Find the total surface area of the solid right prism. A: 560 cm²; B: 621 cm²; C: 682 cm²; D: 854 cm².",
    variants: [
      {
        id: "main",
        label: "L-shaped base",
        unit: "cm",
        target: "total",
        geometry: prism(
          boundary(
            [
              [0, 0],
              [8, 0],
              [8, 5],
              [3, 5],
              [3, 12],
              [0, 12],
            ],
            [null, "", null, null, "", null],
          ),
          14,
          61,
        ),
        baseWorking: "B = 8 × 12 − 5 × 7 = 61 cm²",
        working: [
          "Unlabelled outer edges: 12 − 7 = 5 cm and 8 − 5 = 3 cm",
          "B = 8 × 12 − 5 × 7 = 61 cm²",
          "P = 8 + 5 + 5 + 7 + 3 + 12 = 40 cm",
          "Lateral area = 40 × 14 = 560 cm²",
          "Total surface area = 560 + 2 × 61 = 682 cm²",
          "Answer C",
        ],
        answer: "C: 682 cm².",
        expected: { perimeter: 40, lateralArea: 560, surfaceArea: 682 },
      },
    ],
  },
];
