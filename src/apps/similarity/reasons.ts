import { copy } from "@/lib/copy";
import type { Shape, SourceQuestion } from "./types";

export type Criterion =
  "AAA" | "SSS" | "SAS" | "given" | "polygon" | "not-similar";
/** Textbook proof names; internal criterion keys are never shown to students. */
export const criterionNames: Record<Criterion, string> = {
  AAA: copy.similarity.aaaCriterion,
  SSS: copy.similarity.sssReason,
  SAS: copy.similarity.sasReason,
  given: copy.similarity.givenReason,
  polygon: copy.similarity.polygonReason,
  "not-similar": copy.similarity.notSimilarReason,
};
export type ReasonView = "proof" | "angles" | "sides" | "both";
export type ReasonPair = {
  shapes: [number, number];
  criterion: Criterion;
  angleReasons?: string[];
  included?: number;
  /** Original question lengths, in consecutive edge order. Never measured from a tracing. */
  lengths?: [string[], string[]];
  ratio?: string;
  angleValues?: Record<number, number>;
};
export type Condition = {
  id: string;
  kind: "angle" | "side";
  index: number;
  text: string;
  note: string;
  edge?: [number, number];
  values?: [string, string];
  degrees?: number;
  consequence?: boolean;
};
const third = "Angle sum of a triangle: 180°.";
const common = "Common angle.";
const given = "Given equal angles.";
const right = "Both angles are 90°.";
const base = "Base angles of an isosceles triangle.";
const alternate = "Alternate angles between parallel lines.";
const corresponding = "Corresponding angles between parallel lines.";
const opposite = "Vertically opposite angles.";
const aaa = (
  angleReasons: string[],
  shapes: [number, number] = [0, 1],
): ReasonPair => ({ shapes, criterion: "AAA", angleReasons });
const sss = (a: string[], b: string[], ratio: string): ReasonPair => ({
  shapes: [0, 1],
  criterion: "SSS",
  lengths: [a, b],
  ratio,
});
const sas = (
  included: number,
  a: string[],
  b: string[],
  ratio: string,
  reason: string,
): ReasonPair => ({
  shapes: [0, 1],
  criterion: "SAS",
  included,
  lengths: [a, b],
  ratio,
  angleReasons: [reason, reason, reason],
});

/** Explicit source-proof metadata. Do not infer similarity from a rendered shape or an arbitrary selection. */
const proofs: Record<string, ReasonPair[]> = {
  "qp8-4": [
    aaa([
      "180° − 110° − 25° = 45°.",
      "Both given as 110°.",
      "Both given as 25°.",
    ]),
  ],
  "qp8-5": [
    aaa([
      "Both angles are 56° (angle sum in △PRS).",
      "Both angles are 60° (angle sum in △PQR).",
      "Both given as 64°.",
    ]),
  ],
  "qp8-6": [sss(["3", "6", "5"], ["4.2", "8.4", "7"], "5/7")],
  "qp8-7": [sss(["5", "8", "10"], ["10", "16", "20"], "1/2")],
  "qp8-8": [
    sas(
      0,
      ["4.2", "", "2.7"],
      ["5.6", "", "3.6"],
      "3/4",
      "The included angles are both 35° (given).",
    ),
  ],
  "qp8-9": [
    sas(
      1,
      ["24", "32", ""],
      ["6", "8", ""],
      "4",
      "Common angle at C. AC = 16 + 8; CF = 26 + 6.",
    ),
  ],
  "qp8-10": [aaa([common, corresponding, corresponding])],
  "qp8-11": [
    aaa([common, "Supplements of the given equal exterior angles.", third]),
  ],
  "qp8-12": [
    sas(
      2,
      ["", "18", "15"],
      ["", "12", "10"],
      "3/2",
      "Common angle at S. QS = 6 + 12; PS = 5 + 10.",
    ),
  ],
  "ex8b-16": [
    aaa([
      "Both angles are 56° (angle sum in △ABC).",
      "Both given as 70°.",
      "Both angles are 54° (angle sum in △CDE).",
    ]),
  ],
  "ex8b-17": [sss(["8", "12", "18"], ["12", "18", "27"], "2/3")],
  "ex8b-18": [
    sas(
      2,
      ["", "16", "12"],
      ["", "4", "3"],
      "4",
      "Both included angles are 63° (given).",
    ),
  ],
  "ex8b-19": [
    sas(
      0,
      ["15", "", "18"],
      ["25", "", "30"],
      "3/5",
      "Common angle at A. AC = 15 + 10; AE = 18 + 12.",
    ),
  ],
  "ex8b-20": [aaa([common, "Both given as 28°.", third])],
  "ex8b-21": [
    aaa([common, third, "Both angles are 90° (perpendicular lines)."]),
  ],
  "ex8b-22": [sas(1, ["4", "6", ""], ["6", "9", ""], "2/3", given)],
  "ex8b-23": [
    sas(
      0,
      ["4", "", "3"],
      ["8", "", "6"],
      "1/2",
      "Common angle at A. AD = 3 + 5; AC = 4 + 2.",
    ),
  ],
  "ex8b-24": [aaa([common, given, third])],
  "ex8b-25": [sss(["20", "12", "28"], ["15", "9", "21"], "4/3")],
  "ex8b-26": [
    sas(
      0,
      ["2", "", "4"],
      ["4", "", "8"],
      "1/2",
      "Common angle at A. AB = 6 + 2 = 8.",
    ),
  ],
  "ex8c-10": [
    sas(
      1,
      ["30", "14", ""],
      ["15", "7", ""],
      "2",
      "AB = AC, so the included angles are equal base angles.",
    ),
  ],
  "ex8c-11": [aaa([given, base, third])],
  "ex8c-12": [sss(["35", "25", "15"], ["21", "15", "9"], "5/3")],
  "ex8c-13": [sas(0, ["15", "", "9"], ["5", "", "3"], "3", opposite)],
  "ex8c-14": [sss(["4", "6", "8"], ["8", "12", "16"], "1/2")],
  "ex8c-15": [sss(["5", "3", "4"], ["10", "6", "8"], "1/2")],
  "ex8c-16": [
    aaa([third, given, "CF = DF, so the base angles at D and C are equal."]),
  ],
  "ex8c-17": [
    aaa([opposite, alternate, alternate]),
    aaa([common, corresponding, corresponding], [1, 2]),
    aaa(
      [
        "Follows from the two AAA comparisons.",
        "Follows from the two AAA comparisons.",
        "Follows from the two AAA comparisons.",
      ],
      [0, 2],
    ),
  ],
  "ex8c-18": [
    aaa([corresponding, corresponding, common]),
    aaa([third, opposite, given], [1, 2]),
    aaa(
      [
        "Follows from the two AAA comparisons.",
        "Follows from the two AAA comparisons.",
        "Follows from the two AAA comparisons.",
      ],
      [0, 2],
    ),
  ],
  "ex8c-19": [
    {
      ...aaa([
        "Both equal 90° − ∠CAF: ACDE is a rectangle and ∠BAF = 90°.",
        "∠AFE = 90°; AF ∥ BC and ∠BAF = 90° give ∠ABC = 90°.",
        third,
      ]),
      angleValues: { 1: 90 },
      lengths: [
        ["", "2", "3"],
        ["", "3", "4.5"],
      ],
      ratio: "2/3",
    },
  ],
  "ex8d-17": [
    {
      shapes: [0, 1],
      criterion: "polygon",
      angleReasons: Array(4).fill("Interior angles of squares are 90°."),
    },
  ],
  "ex8d-19": [{ shapes: [0, 1], criterion: "not-similar" }],
  "ex8d-20": [{ shapes: [0, 1], criterion: "not-similar" }],
  "rev8-25": [sss(["14", "16", "10"], ["7", "8", "5"], "2")],
  "rev8-26": [sas(1, ["8", "6", ""], ["12", "9", ""], "2/3", given)],
  "rev8-27": [aaa([base, third, "Both angles are 90° (perpendicular lines)."])],
  "rev8-28": [aaa([third, given, common])],
  "rev8-29": [sas(2, ["", "4", "3"], ["", "8", "6"], "1/2", opposite)],
  "rev8-30": [sss(["12", "9", "18"], ["8", "6", "12"], "3/2")],
  "rev8-31": [sas(1, ["16", "20", ""], ["12", "15", ""], "4/3", right)],
  "rev8-32": [
    aaa([common, third, right]),
    aaa([third, common, right], [0, 2]),
    aaa(
      [
        "Corresponding angles from the two AAA proofs.",
        "Corresponding angles from the two AAA proofs.",
        right,
      ],
      [1, 2],
    ),
  ],
  "rev8-33": [
    aaa([alternate, alternate, opposite]),
    aaa([given, third, right], [2, 3]),
  ],
  "rev8-34": [aaa([third, right, common])],
  "rev8-35": [aaa([third, right, common]), aaa([third, right, common], [2, 3])],
};

// Stated or proved angle values, never inferred from a schematic drawing.
const angleValues: Record<string, Record<number, number>[]> = {
  "qp8-1": [{ 0: 29 }],
  "qp8-2": [{ 0: 47, 1: 108, 2: 25 }],
  "qp8-4": [{ 0: 45, 1: 110, 2: 25 }],
  "qp8-5": [{ 0: 56, 1: 60, 2: 64 }],
  "qp8-8": [{ 0: 35 }],
  "ex8a-12": [{ 0: 60, 1: 50, 2: 70 }],
  "ex8a-14": [{ 0: 15, 1: 135, 2: 30 }],
  "ex8a-15": [{ 0: 90 }],
  "ex8a-17": [{ 0: 23, 1: 85, 2: 72 }],
  "ex8a-18": [{ 0: 77, 1: 63, 2: 40 }],
  "ex8a-20": [{ 0: 61, 1: 70, 2: 49 }],
  "ex8a-21": [{ 0: 117, 1: 36, 2: 27 }],
  "ex8b-16": [{ 0: 56, 1: 70, 2: 54 }],
  "ex8b-18": [{ 2: 63 }],
  "ex8b-20": [{ 1: 28 }],
  "ex8b-21": [{ 2: 90 }],
  "ex8b-26": [{ 0: 60, 1: 90, 2: 30 }],
  "ex8c-12": [{ 2: 120 }],
  "ex8c-15": [{ 2: 90 }],
  "ex8d-12": [{ 3: 113 }],
  "ex8d-16": [{ 0: 90, 1: 90, 2: 90, 3: 90 }],
  "ex8d-17": [{ 0: 90, 1: 90, 2: 90, 3: 90 }],
  "ex8d-19": [{ 0: 120, 1: 120, 2: 120, 3: 120, 4: 120, 5: 120 }],
  "ex8d-20": [{ 0: 110, 1: 80, 2: 70, 3: 100 }],
  "rev8-23": [{ 0: 75 }],
  "rev8-24": [{ 0: 100, 1: 50, 2: 30 }],
  "rev8-25": [{ 2: 60 }],
  "rev8-27": [{ 2: 90 }],
  "rev8-28": [{ 0: 90 }],
  "rev8-31": [{ 1: 90 }],
  "rev8-32": [{ 2: 90 }, { 2: 90 }, { 2: 90 }],
  "rev8-33": [{ 1: 90 }, { 2: 90 }],
  "rev8-34": [{ 1: 90 }],
  "rev8-35": [{ 1: 90 }, { 1: 90 }],
  "rev8-37": [{ 0: 60, 1: 120, 4: 120 }],
  "rev8-38": [{ 0: 90, 1: 90, 2: 90, 3: 90 }],
};

// Original lengths and ratios, read from the question or calculated in its checked working.
// Blank entries mean the length is not specified; never substitute a measurement of the drawing.
const measurements: Record<string, Partial<ReasonPair>[]> = {
  "qp8-1": [
    {
      ratio: "2/3",
      lengths: [
        ["8", "4", "6"],
        ["12", "6", "9"],
      ],
    },
  ],
  "qp8-3": [
    {
      ratio: "1/3",
      lengths: [
        ["3", "4", "2.5"],
        ["9", "12", "7.5"],
      ],
    },
  ],
  "qp8-9": [
    {
      lengths: [
        ["24", "32", "16"],
        ["6", "8", "4"],
      ],
    },
  ],
  "qp8-13": [
    {
      ratio: "4/3",
      lengths: [
        ["24", "28", "", ""],
        ["18", "21", "", ""],
      ],
    },
  ],
  "qp8-14": [{ ratio: "2/3" }],
  "ex8a-13": [
    {
      ratio: "12/5",
      lengths: [
        ["12", "19.2", "28.8"],
        ["5", "8", "12"],
      ],
    },
  ],
  "ex8a-15": [
    {
      ratio: "4/3",
      lengths: [
        ["8", "10", "6"],
        ["6", "7.5", "4.5"],
      ],
    },
  ],
  "ex8a-16": [
    {
      ratio: "5/4",
      lengths: [
        ["10", "20", ""],
        ["8", "16", ""],
      ],
    },
  ],
  "ex8a-19": [
    {
      ratio: "2",
      lengths: [
        ["8", "10", ""],
        ["4", "5", ""],
      ],
    },
  ],
  "ex8a-20": [
    {
      ratio: "3/5",
      lengths: [
        ["6", "", "7.5"],
        ["10", "", "12.5"],
      ],
    },
  ],
  "ex8a-21": [
    {
      ratio: "3/2",
      lengths: [
        ["3", "6", "4"],
        ["2", "4", "8/3"],
      ],
    },
  ],
  "ex8a-22": [
    {
      ratio: "3/4",
      lengths: [
        ["12", "9", "15"],
        ["16", "12", "20"],
      ],
    },
  ],
  "ex8b-24": [
    {
      ratio: "2/5",
      lengths: [
        ["10", "", "8"],
        ["25", "", "20"],
      ],
    },
  ],
  "ex8c-16": [
    {
      ratio: "3",
      lengths: [
        ["9", "7.5", ""],
        ["3", "2.5", ""],
      ],
    },
  ],
  "ex8c-17": [
    {
      ratio: "2/3",
      lengths: [
        ["", "8/3", "2"],
        ["", "4", "3"],
      ],
    },
    {
      ratio: "2/3",
      lengths: [
        ["", "4", "3"],
        ["", "6", "4.5"],
      ],
    },
    {
      ratio: "4/9",
      lengths: [
        ["", "8/3", "2"],
        ["", "6", "4.5"],
      ],
    },
  ],
  "ex8c-18": [
    {
      ratio: "9/5",
      lengths: [
        ["9", "13.5", ""],
        ["5", "7.5", ""],
      ],
    },
    {
      ratio: "5/6",
      lengths: [
        ["5", "7.5", ""],
        ["6", "9", ""],
      ],
    },
    {
      ratio: "3/2",
      lengths: [
        ["9", "13.5", ""],
        ["6", "9", ""],
      ],
    },
  ],
  "ex8d-11": [
    {
      ratio: "3/2",
      lengths: [
        ["6", "9", "6", "9"],
        ["4", "6", "4", "6"],
      ],
    },
  ],
  "ex8d-12": [
    {
      ratio: "3/5",
      lengths: [
        ["", "2.7", "", "1.2"],
        ["", "4.5", "", "2"],
      ],
    },
  ],
  "ex8d-13": [{ ratio: "5/9" }],
  "ex8d-14": [{ ratio: "10/7" }],
  "ex8d-15": [{ ratio: "5/4" }],
  "ex8d-16": [
    {
      ratio: "3/4",
      lengths: [
        ["a", "3", "a", "3"],
        ["4a/3", "4", "4a/3", "4"],
      ],
    },
  ],
  "ex8d-17": [
    { ratio: "7/5", lengths: [Array(4).fill("10.5"), Array(4).fill("7.5")] },
  ],
  "ex8d-18": [
    {
      ratio: "3",
      lengths: [
        ["6", "", "2", "5"],
        ["2", "", "2/3", "5/3"],
      ],
    },
  ],
  "rev8-23": [
    {
      ratio: "2",
      lengths: [
        ["10", "14", ""],
        ["5", "7", ""],
      ],
    },
  ],
  "rev8-26": [
    {
      lengths: [
        ["8", "6", "12"],
        ["12", "9", "18"],
      ],
    },
  ],
  "rev8-32": [
    { ratio: "√13/2" },
    { ratio: "√13/3" },
    {
      ratio: "2/3",
      lengths: [
        ["2√13", "6", "4"],
        ["3√13", "9", "6"],
      ],
    },
  ],
  "rev8-33": [{ ratio: "2" }, { ratio: "1" }],
  "rev8-34": [
    {
      ratio: "7/3",
      lengths: [
        ["3", "7", ""],
        ["9/7", "3", ""],
      ],
    },
  ],
  "rev8-35": [
    {
      ratio: "35/8",
      lengths: [
        ["7", "13.125", ""],
        ["1.6", "3", ""],
      ],
    },
    {
      ratio: "5",
      lengths: [
        ["8", "10", ""],
        ["1.6", "2", ""],
      ],
    },
  ],
  "rev8-36": [
    {
      ratio: "2/3",
      lengths: [
        ["4", "", "8", "", ""],
        ["6", "", "12", "", ""],
      ],
    },
  ],
  "rev8-38": [
    {
      ratio: "6/5",
      lengths: [
        ["12", "9.6", "12", "9.6"],
        ["10", "8", "10", "8"],
      ],
    },
  ],
};

export function reasonPairs(q: SourceQuestion): ReasonPair[] {
  if (q.shapes.length < 2 || (q.similar === false && !proofs[q.id])) return [];
  const pairs: ReasonPair[] = proofs[q.id] ?? [
    { shapes: [0, 1], criterion: "given" },
  ];
  return pairs.map((pair, i) => ({
    ...pair,
    ...measurements[q.id]?.[i],
    angleValues: angleValues[q.id]?.[i] ?? pair.angleValues,
  }));
}
export const angleName = (s: Shape, i: number) => {
  const v = s.vertices,
    n = v.length;
  return `∠${v[(i + n - 1) % n]}${v[i]}${v[(i + 1) % n]}`;
};
export const sideName = (s: Shape, edge: [number, number]) =>
  edge.map((i) => s.vertices[i]).join("");

export function conditions(
  q: SourceQuestion,
  pair: ReasonPair,
  view: ReasonView,
): Condition[] {
  const [a, b] = pair.shapes.map((i) => q.shapes[i]);
  const n = a.vertices.length;
  if (pair.criterion === "not-similar") {
    const indices = q.id === "ex8d-19" ? [5, 2] : [0, 1];
    const values =
      q.id === "ex8d-19"
        ? [
            ["4", "7"],
            ["2", "4"],
          ]
        : [
            ["12", "16"],
            ["15", "24"],
          ];
    const sides: Condition[] = indices.map((index, j) => {
      const edge: [number, number] = [index, (index + 1) % n];
      return {
        id: `side-${index}`,
        kind: "side",
        index,
        edge,
        values: values[j] as [string, string],
        text: `${sideName(a, edge)}/${sideName(b, edge)} = ${values[j][0]}/${values[j][1]}`,
        note: "These two ratios are unequal, so the polygons are not similar.",
      };
    });
    const angles: Condition[] = Array.from({ length: n }, (_, i) => ({
      id: `angle-${i}`,
      kind: "angle",
      index: i,
      degrees: pair.angleValues?.[i],
      text: `${angleName(a, i)} = ${angleName(b, i)} = ${pair.angleValues?.[i]}°`,
      note: "These angles are equal, but the unequal side ratios show that the polygons are not similar.",
    }));
    return view === "angles"
      ? angles
      : view === "both"
        ? [...angles, ...sides]
        : sides;
  }
  const angles =
    view === "angles" ||
    view === "both" ||
    (view === "proof" && pair.criterion !== "SSS");
  const sides =
    view === "sides" ||
    view === "both" ||
    (view === "proof" && ["SSS", "SAS", "polygon"].includes(pair.criterion));
  const rows: Condition[] = [];
  if (angles) {
    for (let i = 0; i < n; i++) {
      if (view === "proof" && pair.criterion === "SAS" && i !== pair.included)
        continue;
      const consequence =
        pair.criterion === "SSS" ||
        (pair.criterion === "SAS" && i !== pair.included);
      rows.push({
        id: `angle-${i}`,
        kind: "angle",
        index: i,
        text: `${angleName(a, i)} = ${angleName(b, i)}${pair.angleValues?.[i] !== undefined ? ` = ${pair.angleValues[i]}°` : ""}`,
        degrees: pair.angleValues?.[i],
        consequence,
        note: consequence
          ? `Corresponding angles are equal after establishing similarity (${criterionNames[pair.criterion]}).`
          : (pair.angleReasons?.[i] ??
            "Corresponding angles in the given similar figures are equal."),
      });
    }
  }
  if (sides) {
    for (let i = 0; i < n; i++) {
      if (
        view === "proof" &&
        pair.criterion === "SAS" &&
        i !== pair.included &&
        (i + 1) % n !== pair.included
      )
        continue;
      const edge: [number, number] = [i, (i + 1) % n];
      const av = pair.lengths?.[0][i],
        bv = pair.lengths?.[1][i];
      const fraction = av && bv ? ` = ${av}/${bv}` : "";
      const consequence =
        pair.criterion === "AAA" ||
        (pair.criterion === "SAS" &&
          i !== pair.included &&
          (i + 1) % n !== pair.included);
      rows.push({
        id: `side-${i}`,
        kind: "side",
        index: i,
        edge,
        values: av && bv ? [av, bv] : undefined,
        consequence,
        text: `${sideName(a, edge)}/${sideName(b, edge)}${av && bv && `${av}/${bv}` === pair.ratio ? "" : fraction} = ${pair.ratio ?? "k"}`,
        note: consequence
          ? `Follows from similarity (${criterionNames[pair.criterion]}): all corresponding sides have the same ratio.${q.id === "ex8c-19" ? " FE/BC = 2/3; EA = 3 and CA = 4.5 cm." : ""}`
          : pair.criterion === "given"
            ? "The same ratio k for all corresponding sides follows from the given similarity."
            : pair.criterion === "polygon"
              ? "All sides within each square are equal, so every corresponding-side ratio is the same."
              : "Ratio of original lengths, using the given lengths and any sums on a straight line.",
      });
    }
  }
  return rows;
}
