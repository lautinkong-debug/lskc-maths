import type { SourceQuestion } from "./types";

export const questionsC: SourceQuestion[] = [
  {
    id: "ex8c-19",
    group: "Exercise 8C",
    number: "19",
    page: 32,
    crop: [0.05, 0.754, 0.9, 0.892],
    points: [
      { label: "A", x: 0.727, y: 0.807 },
      { label: "B", x: 0.727, y: 0.877 },
      { label: "C", x: 0.799, y: 0.877 },
      { label: "D", x: 0.857, y: 0.845 },
      { label: "E", x: 0.785, y: 0.773 },
      { label: "F", x: 0.785, y: 0.807 },
    ],
    shapes: [
      { name: "△AFE", vertices: ["A", "F", "E"] },
      { name: "△ABC", vertices: ["A", "B", "C"] },
    ],
    prompt:
      "ACDE is a rectangle. AF ∥ BC and ∠BAF = ∠AFE = 90°. Prove △AFE ∼ △ABC. If BC = CD = 3 cm and EF = 2 cm, find the area of ACDE.",
    proof: [
      "AF ∥ BC, so ∠ABC + ∠BAF = 180°. Hence ∠ABC = 90° = ∠AFE.",
      "ACDE is a rectangle, so ∠EAC = 90°. Thus ∠EAF = 90° − ∠CAF.",
      "∠BAF = 90°, so ∠BAC = 90° − ∠CAF. Therefore ∠EAF = ∠BAC.",
      "The remaining angles are equal: ∠AEF = ∠ACB. Hence △AFE ∼ △ABC (AAA).",
      "AE = CD = 3 cm. AC / AE = BC / FE = 3 / 2, so AC = 9/2 cm.",
      "Area of ACDE = AC × CD = (9/2) × 3 = 27/2 cm² = 13.5 cm².",
    ],
    result: "△AFE ∼ △ABC (AAA); AC = 4.5 cm; area of ACDE = 13.5 cm².",
  },
];
