import type { Point } from "../types";

export type Criterion = "aaa" | "sides" | "included" | "insufficient";
export type Mission = Exclude<Criterion, "insufficient">;
type Triple<T> = [T, T, T];
export type Triangle = {
  names: Triple<string>;
  /** AB, BC, CA; index i joins vertex i to vertex (i + 1) mod 3. */
  sides: Triple<number>;
  /** Angles at A, B, C respectively. */
  angles: Triple<number>;
  points: Point[];
};
export type Evidence = {
  id: string;
  kind: "angle" | "side";
  index: number;
  values: [number, number];
};
export type Round = {
  id: string;
  criterion: Criterion;
  triangles: [Triangle, Triangle];
  evidence: Evidence[];
  required: string[];
  proof: {
    tex: string;
    reasonKey: string;
    evidence: string[];
    members?: number[];
  }[];
  explanationKey: string;
};
export type Changes = {
  angleA?: number;
  angleB?: number;
  thirdSide?: number;
  hinge?: number;
};
export type LessonSetup = {
  start: Changes;
  goal: Changes;
  limits: Partial<
    Record<keyof Changes, { min: number; max: number; step: number }>
  >;
};
export type Grade = {
  correct: boolean;
  code: "correct" | "condition" | "evidence" | "repair" | "included";
};

const degrees = Math.PI / 180;
const sourceNames: Triple<string> = ["A", "B", "C"];
const targetNames: Triple<string> = ["D", "E", "F"];

/**
 * This only absorbs floating-point construction noise. It does not round angles
 * or ratios to their displayed precision before comparing them.
 */
function same(a: number, b: number) {
  return (
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    Math.abs(a - b) <=
      64 * Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b))
  );
}

function positive(values: number[]) {
  return values.every((value) => Number.isFinite(value) && value > 0);
}

export function triangleFromSides(
  sides: Triple<number>,
  names: Triple<string>,
): Triangle {
  if (!positive(sides))
    throw new RangeError("Triangle sides must be finite and positive.");
  // Normalise before squaring, so ordinary construction does not overflow.
  const scale = Math.max(...sides);
  const [ab, bc, ca] = sides.map((side) => side / scale);
  if (ab + bc <= ca || bc + ca <= ab || ca + ab <= bc) {
    throw new RangeError(
      "Triangle sides must satisfy the strict triangle inequalities.",
    );
  }
  const x = (ab * ab + ca * ca - bc * bc) / (2 * ab);
  const heightSquared = ca * ca - x * x;
  if (!(heightSquared > 0))
    throw new RangeError("Triangle is too flat to construct.");
  const y = Math.sqrt(heightSquared);
  const angleA = Math.atan2(y, x) / degrees;
  const angleB = Math.atan2(y, ab - x) / degrees;
  const points = [
    { x: 0, y: 0, label: names[0] },
    { x: sides[0], y: 0, label: names[1] },
    { x: x * scale, y: -y * scale, label: names[2] },
  ];
  if (
    points.some(
      (point) => !Number.isFinite(point.x) || !Number.isFinite(point.y),
    )
  ) {
    throw new RangeError("Triangle coordinates must be finite.");
  }
  return {
    names: [...names],
    sides: [...sides],
    angles: [angleA, angleB, 180 - angleA - angleB],
    points,
  };
}

export function triangleFromAngles(
  angles: Triple<number>,
  names: Triple<string>,
  base = 6,
): Triangle {
  if (
    !positive([...angles, base]) ||
    !same(angles[0] + angles[1] + angles[2], 180)
  ) {
    throw new RangeError("Positive triangle angles must sum to 180 degrees.");
  }
  const sineC = Math.sin(angles[2] * degrees);
  const triangle = triangleFromSides(
    [
      base,
      (base * Math.sin(angles[0] * degrees)) / sineC,
      (base * Math.sin(angles[1] * degrees)) / sineC,
    ],
    names,
  );
  // The assigned angles are the givens, not their floating-point reconstructions.
  triangle.angles = [...angles];
  return triangle;
}

function triangleFromHinge(
  ab: number,
  bc: number,
  hinge: number,
  names: Triple<string>,
): Triangle {
  if (!Number.isFinite(hinge) || hinge <= 0 || hinge >= 180) {
    throw new RangeError(
      "The included angle must lie strictly between 0 and 180 degrees.",
    );
  }
  const ca = Math.sqrt(
    ab * ab + bc * bc - 2 * ab * bc * Math.cos(hinge * degrees),
  );
  const triangle = triangleFromSides([ab, bc, ca], names);
  triangle.angles[1] = hinge;
  triangle.angles[2] = 180 - triangle.angles[0] - hinge;
  return triangle;
}

const angleLessons = [
  {
    goal: [60, 50],
    start: [50, 60],
    bounds: [
      [35, 75],
      [30, 75],
    ],
    base: 9,
  },
  {
    goal: [40, 80],
    start: [55, 65],
    bounds: [
      [25, 60],
      [45, 100],
    ],
    base: 4,
  },
  {
    goal: [100, 35],
    start: [85, 50],
    bounds: [
      [70, 115],
      [20, 60],
    ],
    base: 8,
  },
] as const;
const sideLessons = [
  { sides: [6, 5, 7], scale: 2, start: 13, bounds: [8, 18] },
  { sides: [5, 7, 8], scale: 1.5, start: 10, bounds: [5, 17] },
  { sides: [8, 6, 10], scale: 0.5, start: 4, bounds: [2, 6] },
] as const;
const hingeLessons = [
  { sides: [6, 4], scale: 2, goal: 60, start: 65, bounds: [30, 110] },
  { sides: [5, 7], scale: 1.5, goal: 45, start: 70, bounds: [25, 100] },
  { sides: [8, 5], scale: 0.5, goal: 110, start: 85, bounds: [60, 140] },
] as const;

function validLevel(level: number) {
  if (!Number.isInteger(level) || level < 0 || level > 2) {
    throw new RangeError("Lesson level must be 0, 1 or 2.");
  }
}

/** Every call returns independent objects so UI state cannot alter future resets. */
export function lessonSetup(mission: Mission, level: number): LessonSetup {
  validLevel(level);
  if (mission === "aaa") {
    const item = angleLessons[level];
    return {
      start: { angleA: item.start[0], angleB: item.start[1] },
      goal: { angleA: item.goal[0], angleB: item.goal[1] },
      limits: {
        angleA: { min: item.bounds[0][0], max: item.bounds[0][1], step: 1 },
        angleB: { min: item.bounds[1][0], max: item.bounds[1][1], step: 1 },
      },
    };
  }
  if (mission === "sides") {
    const item = sideLessons[level];
    return {
      start: { thirdSide: item.start },
      goal: { thirdSide: item.sides[2] * item.scale },
      limits: {
        thirdSide: { min: item.bounds[0], max: item.bounds[1], step: 0.5 },
      },
    };
  }
  const item = hingeLessons[level];
  return {
    start: { hinge: item.start },
    goal: { hinge: item.goal },
    limits: { hinge: { min: item.bounds[0], max: item.bounds[1], step: 1 } },
  };
}

function clues(
  triangles: [Triangle, Triangle],
  kind: Evidence["kind"],
  indices: number[],
) {
  return indices.map((index): Evidence => ({
    id: `${kind}-${index}`,
    kind,
    index,
    values: triangles.map((triangle) =>
      kind === "angle" ? triangle.angles[index] : triangle.sides[index],
    ) as [number, number],
  }));
}

function proportionate(sides: Evidence[]) {
  if (sides.length < 2 || !sides.every((side) => positive(side.values)))
    return false;
  // Cross-products preserve the actual given values, without decimal ratio rounding.
  return sides.every((side) =>
    same(
      side.values[0] * sides[0].values[1],
      sides[0].values[0] * side.values[1],
    ),
  );
}

function isIncluded(sides: Evidence[], angle: Evidence) {
  return sides.every(
    (side) =>
      side.index === angle.index || (side.index + 1) % 3 === angle.index,
  );
}

function supports(criterion: Mission, evidence: Evidence[]) {
  const sides = evidence.filter((clue) => clue.kind === "side");
  const angles = evidence.filter((clue) => clue.kind === "angle");
  if (criterion === "aaa") {
    return (
      sides.length === 0 &&
      angles.length === 3 &&
      new Set(angles.map((angle) => angle.index)).size === 3 &&
      angles.every((angle) => same(...angle.values))
    );
  }
  if (criterion === "sides") {
    return (
      angles.length === 0 &&
      sides.length === 3 &&
      new Set(sides.map((side) => side.index)).size === 3 &&
      proportionate(sides)
    );
  }
  return (
    sides.length === 2 &&
    new Set(sides.map((side) => side.index)).size === 2 &&
    angles.length === 1 &&
    same(...angles[0].values) &&
    proportionate(sides) &&
    isIncluded(sides, angles[0])
  );
}

export function lessonSolved(round: Round) {
  if (round.criterion === "insufficient") return true;
  return supports(
    round.criterion,
    round.evidence.filter((clue) => round.required.includes(clue.id)),
  );
}

function numberTex(value: number) {
  // Remove only machine noise from constructions such as atan2(...)=29.999999999999996.
  const integer = Math.round(value);
  return same(value, integer) ? String(integer) : String(value);
}

function sideName(triangle: Triangle, index: number) {
  return triangle.names[index] + triangle.names[(index + 1) % 3];
}

function angleName(triangle: Triangle, index: number) {
  return (
    triangle.names[(index + 2) % 3] +
    triangle.names[index] +
    triangle.names[(index + 1) % 3]
  );
}

function proofFor(round: Round): Round["proof"] {
  if (!lessonSolved(round)) return [];
  const [a, b] = round.triangles;
  const proof: Round["proof"] = [];
  const sides = round.evidence.filter((clue) => clue.kind === "side");
  const angles = round.evidence.filter((clue) => clue.kind === "angle");
  for (const angle of angles) {
    const derived = round.id.startsWith("lesson-aaa-") && angle.index === 2;
    if (derived) {
      for (const [member, triangle] of round.triangles.entries()) {
        proof.push({
          tex: `\\angle ${angleName(triangle, 2)} = 180^{\\circ} - ${numberTex(triangle.angles[0])}^{\\circ} - ${numberTex(triangle.angles[1])}^{\\circ} = ${numberTex(triangle.angles[2])}^{\\circ}`,
          reasonKey: "angleSum",
          evidence: ["angle-0", "angle-1", "angle-2"],
          members: [member],
        });
      }
    }
    proof.push({
      tex: `\\angle ${angleName(a, angle.index)} = \\angle ${angleName(b, angle.index)} = ${numberTex(angle.values[0])}^{\\circ}`,
      reasonKey: derived ? "angleSum" : "givenAngles",
      evidence: [angle.id],
    });
  }
  if (sides.length) {
    for (const side of sides) {
      proof.push({
        tex: `\\frac{${sideName(a, side.index)}}{${sideName(b, side.index)}} = \\frac{${numberTex(side.values[0])}}{${numberTex(side.values[1])}}`,
        reasonKey: "givenLengths",
        evidence: [side.id],
      });
    }
    proof.push({
      tex:
        sides
          .map(
            (side) =>
              `\\frac{${sideName(a, side.index)}}{${sideName(b, side.index)}}`,
          )
          .join(" = ") +
        ` = \\frac{${numberTex(sides[0].values[0])}}{${numberTex(sides[0].values[1])}}`,
      reasonKey: "equalRatios",
      evidence: sides.map((side) => side.id),
    });
  }
  proof.push({
    tex: `\\triangle ${a.names.join("")} ${round.criterion === "insufficient" ? "\\mathrel{?}" : "\\sim"} \\triangle ${b.names.join("")}`,
    reasonKey: round.criterion,
    evidence: [...round.required],
  });
  return proof;
}

function makeRound(
  id: string,
  criterion: Criterion,
  triangles: [Triangle, Triangle],
  sideIndices: number[],
  angleIndices: number[],
  explanationKey = criterion as string,
): Round {
  const evidence = [
    ...clues(triangles, "side", sideIndices),
    ...clues(triangles, "angle", angleIndices),
  ];
  const round: Round = {
    id,
    criterion,
    triangles,
    evidence,
    required: evidence.map((clue) => clue.id),
    proof: [],
    explanationKey,
  };
  round.proof = proofFor(round);
  return round;
}

export function lessonRound(
  mission: Mission,
  level: number,
  changes: Changes = {},
): Round {
  const values = { ...lessonSetup(mission, level).start, ...changes };
  const id = `lesson-${mission}-${level + 1}`;
  if (mission === "aaa") {
    const item = angleLessons[level];
    return makeRound(
      id,
      mission,
      [
        triangleFromAngles(
          [item.goal[0], item.goal[1], 180 - item.goal[0] - item.goal[1]],
          sourceNames,
        ),
        triangleFromAngles(
          [
            values.angleA!,
            values.angleB!,
            180 - values.angleA! - values.angleB!,
          ],
          targetNames,
          item.base,
        ),
      ],
      [],
      [0, 1, 2],
    );
  }
  if (mission === "sides") {
    const item = sideLessons[level];
    return makeRound(
      id,
      mission,
      [
        triangleFromSides([...item.sides], sourceNames),
        triangleFromSides(
          [
            item.sides[0] * item.scale,
            item.sides[1] * item.scale,
            values.thirdSide!,
          ],
          targetNames,
        ),
      ],
      [0, 1, 2],
      [],
    );
  }
  const item = hingeLessons[level];
  return makeRound(
    id,
    mission,
    [
      triangleFromHinge(item.sides[0], item.sides[1], item.goal, sourceNames),
      triangleFromHinge(
        item.sides[0] * item.scale,
        item.sides[1] * item.scale,
        values.hinge!,
        targetNames,
      ),
    ],
    [0, 1],
    [1],
  );
}

function anglesRound(
  id: string,
  angles: Triple<number>,
  otherNames: Triple<string>,
  base: number,
) {
  return makeRound(
    id,
    "aaa",
    [
      triangleFromAngles(angles, sourceNames),
      triangleFromAngles(angles, otherNames, base),
    ],
    [],
    [0, 1, 2],
  );
}

function sidesRound(
  id: string,
  lengths: Triple<number>,
  scale: number,
  otherNames: Triple<string>,
) {
  return makeRound(
    id,
    "sides",
    [
      triangleFromSides(lengths, sourceNames),
      triangleFromSides(
        lengths.map((side) => side * scale) as Triple<number>,
        otherNames,
      ),
    ],
    [0, 1, 2],
    [],
  );
}

function hingeRound(
  id: string,
  ab: number,
  bc: number,
  hinge: number,
  scale: number,
) {
  return makeRound(
    id,
    "included",
    [
      triangleFromHinge(ab, bc, hinge, sourceNames),
      triangleFromHinge(ab * scale, bc * scale, hinge, targetNames),
    ],
    [0, 1],
    [1],
  );
}

/** Authored givens determine the answer. Hidden measurements in the drawing do not. */
export const mixedRounds: Round[] = [
  anglesRound("mixed-1", [45, 65, 70], ["P", "Q", "R"], 9),
  sidesRound("mixed-2", [3, 4, 5], 2, targetNames),
  makeRound(
    "mixed-3",
    "insufficient",
    [
      triangleFromAngles([50, 60, 70], sourceNames),
      triangleFromAngles([50, 80, 50], targetNames, 8),
    ],
    [],
    [0],
    "oneAngle",
  ),
  hingeRound("mixed-4", 6, 4, 60, 2),
  anglesRound("mixed-5", [90, 35, 55], ["X", "Y", "Z"], 4),
  makeRound(
    "mixed-6",
    "insufficient",
    [
      triangleFromSides([6, 5, 7], sourceNames),
      triangleFromSides([12, 10, 14], ["L", "M", "N"]),
    ],
    [0, 1],
    [],
    "twoSides",
  ),
  sidesRound("mixed-7", [5, 7, 8], 1.5, ["P", "Q", "R"]),
  hingeRound("mixed-8", 5, 7, 45, 1.5),
  makeRound(
    "mixed-9",
    "insufficient",
    [
      // Two intersections of the same 30-degree ray with a circle centred at B.
      triangleFromSides([8, 5, 4 * Math.sqrt(3) + 3], sourceNames),
      triangleFromSides([16, 10, 2 * (4 * Math.sqrt(3) - 3)], targetNames),
    ],
    [0, 1],
    [0],
    "nonIncluded",
  ),
  anglesRound("mixed-10", [110, 30, 40], targetNames, 8),
  sidesRound("mixed-11", [8, 6, 10], 0.5, ["L", "M", "N"]),
  hingeRound("mixed-12", 8, 5, 110, 0.5),
];

export function gradeEvidence(
  round: Round,
  criterion: Criterion,
  selected: readonly string[],
): Grade {
  if (round.id.startsWith("lesson-") && !lessonSolved(round)) {
    return { correct: false, code: "repair" };
  }
  const evidence = round.evidence.filter((clue) => selected.includes(clue.id));
  const sides = evidence.filter((clue) => clue.kind === "side");
  const angles = evidence.filter((clue) => clue.kind === "angle");
  if (
    criterion === "included" &&
    sides.length === 2 &&
    angles.length === 1 &&
    !isIncluded(sides, angles[0])
  ) {
    return { correct: false, code: "included" };
  }
  if (criterion !== round.criterion)
    return { correct: false, code: "condition" };
  if (
    selected.length !== round.required.length ||
    new Set(selected).size !== selected.length ||
    !round.required.every((id) => selected.includes(id)) ||
    evidence.length !== selected.length
  ) {
    return { correct: false, code: "evidence" };
  }
  if (criterion !== "insufficient" && !supports(criterion, evidence)) {
    return { correct: false, code: "condition" };
  }
  return { correct: true, code: "correct" };
}
