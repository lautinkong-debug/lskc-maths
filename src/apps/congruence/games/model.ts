import {
  triangleFromAngles,
  triangleFromSides,
  type Triangle,
} from "../../similarity/games/model";
import { centre } from "../../similarity/geometry";
import type { Point } from "../../similarity/types";

export const conditions = ["SSS", "SAS", "ASA", "AAS", "RHS"] as const;
export type Condition = (typeof conditions)[number];
export type Criterion = Condition | "insufficient";
export type Mission = Condition | "mixed";
export type Evidence = {
  id: string;
  kind: "side" | "angle";
  index: number;
  values: [number, number];
};
export type ProofStep = {
  tex: string;
  reasonKey: "given" | Criterion;
  evidence: string[];
};
export type Explanation =
  | "SSS"
  | "SAS"
  | "ASA"
  | "AAS"
  | "RHS"
  | "aaa"
  | "ssa"
  | "twoSides"
  | "unequal"
  | "twoAngles";
export type Round = {
  id: string;
  criterion: Criterion;
  triangles: [Triangle, Triangle];
  evidence: Evidence[];
  required: string[];
  proof: ProofStep[];
  explanationKey: Explanation;
};
export type LessonSetup = {
  start: number;
  goal: number;
  min: number;
  max: number;
  step: number;
  kind: "side" | "angle";
  index: number;
};
export type Feedback =
  | "correct"
  | "repair"
  | "evidence"
  | "condition"
  | "includedAngle"
  | "includedSide"
  | "nonIncludedSide"
  | "rightAngle"
  | "hypotenuse"
  | "aaa"
  | "ssa"
  | "unequal";
const sourceNames: [string, string, string] = ["A", "B", "C"];
const targetNames: [string, string, string] = ["D", "E", "F"];
const rad = Math.PI / 180;

// Only floating-point construction noise is tolerated, never display rounding.
export function same(a: number, b: number) {
  return (
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    Math.abs(a - b) <=
      128 * Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b))
  );
}
const sideLessons = [
  { sides: [6, 5, 7], start: 9, min: 3, max: 10 },
  { sides: [8, 6, 9], start: 6, min: 4, max: 12 },
  { sides: [7.5, 6, 10], start: 8, min: 3, max: 12 },
] as const;
const hingeLessons = [
  { ab: 6, ca: 5, angle: 55, start: 80, min: 30, max: 110 },
  { ab: 7, ca: 4, angle: 100, start: 65, min: 40, max: 130 },
  { ab: 5, ca: 8, angle: 40, start: 60, min: 25, max: 100 },
] as const;
const angleLessons = [
  { angles: [50, 65, 65], base: 6, otherSide: 7, start: 9 },
  { angles: [110, 40, 30], base: 8, otherSide: 9, start: 6 },
  { angles: [35, 90, 55], base: 5, otherSide: 6, start: 8 },
] as const;
const rightLessons = [
  { leg: 6, hypotenuse: 10, start: 8, min: 7, max: 13 },
  { leg: 5, hypotenuse: 13, start: 10, min: 7, max: 15 },
  { leg: 8, hypotenuse: 17, start: 13, min: 10, max: 20 },
] as const;

export function lessonSetup(condition: Condition, level: number): LessonSetup {
  if (!Number.isInteger(level) || level < 0 || level > 2)
    throw new RangeError("Lesson level must be 0, 1 or 2.");
  if (condition === "SSS") {
    const item = sideLessons[level];
    return {
      start: item.start,
      goal: item.sides[2],
      min: item.min,
      max: item.max,
      step: 0.5,
      kind: "side",
      index: 2,
    };
  }
  if (condition === "SAS") {
    const item = hingeLessons[level];
    return {
      start: item.start,
      goal: item.angle,
      min: item.min,
      max: item.max,
      step: 1,
      kind: "angle",
      index: 0,
    };
  }
  if (condition === "RHS") {
    const item = rightLessons[level];
    return {
      start: item.start,
      goal: item.hypotenuse,
      min: item.min,
      max: item.max,
      step: 0.5,
      kind: "side",
      index: 2,
    };
  }
  const item = angleLessons[level];
  return {
    start: item.start,
    goal: condition === "ASA" ? item.base : item.otherSide,
    min: 3,
    max: 12,
    step: 0.5,
    kind: "side",
    index: condition === "ASA" ? 0 : 1,
  };
}

function fromHinge(
  ab: number,
  ca: number,
  angle: number,
  names: [string, string, string],
) {
  const triangle = triangleFromSides(
    [
      ab,
      Math.sqrt(ab * ab + ca * ca - 2 * ab * ca * Math.cos(angle * rad)),
      ca,
    ],
    names,
  );
  triangle.angles[0] = angle;
  triangle.angles[2] = 180 - angle - triangle.angles[1];
  return triangle;
}
function fromRight(
  leg: number,
  hypotenuse: number,
  names: [string, string, string],
) {
  const triangle = triangleFromSides(
    [leg, Math.sqrt(hypotenuse ** 2 - leg ** 2), hypotenuse],
    names,
  );
  triangle.angles[1] = 90;
  triangle.angles[2] = 90 - triangle.angles[0];
  return triangle;
}

export function sideName(triangle: Triangle, index: number) {
  return triangle.names[index] + triangle.names[(index + 1) % 3];
}
export function angleName(triangle: Triangle, index: number) {
  return (
    triangle.names[(index + 2) % 3] +
    triangle.names[index] +
    triangle.names[(index + 1) % 3]
  );
}
export function evidenceName(round: Round, evidence: Evidence, member: number) {
  return evidence.kind === "side"
    ? sideName(round.triangles[member], evidence.index)
    : `∠${angleName(round.triangles[member], evidence.index)}`;
}
export function pretty(value: number) {
  return String(Number(value.toFixed(2)));
}

function angleBetween(sides: Evidence[], angle: Evidence) {
  return sides.every(
    (side) =>
      side.index === angle.index || (side.index + 1) % 3 === angle.index,
  );
}
function sideBetween(side: Evidence, angles: Evidence[]) {
  return angles.every(
    (angle) =>
      angle.index === side.index || angle.index === (side.index + 1) % 3,
  );
}

/** Tests exactly the selected, marked facts; hidden drawing measurements are never evidence. */
export function supports(
  condition: Condition,
  evidence: readonly Evidence[],
): boolean {
  if (
    evidence.length !== 3 ||
    new Set(evidence.map((e) => `${e.kind}-${e.index}`)).size !== 3 ||
    evidence.some(
      (e) =>
        !Number.isInteger(e.index) ||
        e.index < 0 ||
        e.index > 2 ||
        !e.values.every((v) => v > 0 && Number.isFinite(v)) ||
        !same(...e.values),
    )
  )
    return false;
  const sides = evidence.filter((e) => e.kind === "side");
  const angles = evidence.filter((e) => e.kind === "angle");
  if (condition === "SSS") return sides.length === 3;
  if (condition === "SAS")
    return (
      sides.length === 2 &&
      angles.length === 1 &&
      angleBetween(sides, angles[0])
    );
  if (condition === "ASA" || condition === "AAS")
    return (
      sides.length === 1 &&
      angles.length === 2 &&
      sideBetween(sides[0], angles) === (condition === "ASA")
    );
  return (
    sides.length === 2 &&
    angles.length === 1 &&
    same(angles[0].values[0], 90) &&
    sides.some((side) => side.index === (angles[0].index + 1) % 3)
  );
}

function makeRound(
  id: string,
  criterion: Criterion,
  triangles: [Triangle, Triangle],
  sides: number[],
  angles: number[],
  explanationKey: Explanation = criterion as Condition,
): Round {
  const evidence: Evidence[] = [
    ...sides.map((index) => ({ kind: "side" as const, index })),
    ...angles.map((index) => ({ kind: "angle" as const, index })),
  ].map(({ kind, index }) => ({
    id: `${kind}-${index}`,
    kind,
    index,
    values: triangles.map((triangle) =>
      kind === "side" ? triangle.sides[index] : triangle.angles[index],
    ) as [number, number],
  }));
  const round: Round = {
    id,
    criterion,
    triangles,
    evidence,
    required: evidence.map((e) => e.id),
    proof: [],
    explanationKey,
  };
  const ready = criterion === "insufficient" || supports(criterion, evidence);
  if (!ready) return round;
  round.proof = evidence.map((e) => {
    const name = (member: number) =>
      evidenceName(round, e, member).replace("∠", "\\angle ");
    const unit = e.kind === "angle" ? "^\\circ" : "";
    return {
      tex: same(...e.values)
        ? `${name(0)} = ${name(1)} = ${pretty(e.values[0])}${unit}`
        : `${name(0)}=${pretty(e.values[0])}${unit},\\quad ${name(1)}=${pretty(e.values[1])}${unit}`,
      reasonKey: "given",
      evidence: [e.id],
    };
  });
  round.proof.push({
    tex:
      criterion === "insufficient"
        ? "\\text{Congruence is not established.}"
        : `\\triangle ${triangles[0].names.join("")} \\cong \\triangle ${triangles[1].names.join("")}`,
    reasonKey: criterion,
    evidence: [...round.required],
  });
  return round;
}

export function lessonRound(
  condition: Condition,
  level: number,
  value?: number,
): Round {
  const setup = lessonSetup(condition, level);
  const changed = value ?? setup.start;
  if (!Number.isFinite(changed) || changed < setup.min || changed > setup.max)
    throw new RangeError(
      "Measurement must be finite and inside the construction range.",
    );
  const id = `lesson-${condition}-${level + 1}`;
  if (condition === "SSS") {
    const item = sideLessons[level];
    return makeRound(
      id,
      condition,
      [
        triangleFromSides([...item.sides], sourceNames),
        triangleFromSides([item.sides[0], item.sides[1], changed], targetNames),
      ],
      [0, 1, 2],
      [],
    );
  }
  if (condition === "SAS") {
    const item = hingeLessons[level];
    return makeRound(
      id,
      condition,
      [
        fromHinge(item.ab, item.ca, item.angle, sourceNames),
        fromHinge(item.ab, item.ca, changed, targetNames),
      ],
      [0, 2],
      [0],
    );
  }
  if (condition === "RHS") {
    const item = rightLessons[level];
    return makeRound(
      id,
      condition,
      [
        fromRight(item.leg, item.hypotenuse, sourceNames),
        fromRight(item.leg, changed, targetNames),
      ],
      [0, 2],
      [1],
    );
  }
  const item = angleLessons[level];
  const base = (side: number) =>
    condition === "ASA"
      ? side
      : (side * Math.sin(item.angles[2] * rad)) /
        Math.sin(item.angles[0] * rad);
  return makeRound(
    id,
    condition,
    [
      triangleFromAngles([...item.angles], sourceNames, base(setup.goal)),
      triangleFromAngles([...item.angles], targetNames, base(changed)),
    ],
    [setup.index],
    [0, 1],
  );
}

function solved(condition: Condition, level: number, id: string): Round {
  return {
    ...lessonRound(condition, level, lessonSetup(condition, level).goal),
    id,
  };
}
export const mixedRounds: Round[] = [
  solved("SSS", 1, "mixed-1"),
  solved("SAS", 1, "mixed-2"),
  solved("ASA", 2, "mixed-3"),
  solved("AAS", 0, "mixed-4"),
  solved("RHS", 1, "mixed-5"),
  makeRound(
    "mixed-6",
    "insufficient",
    [
      triangleFromAngles([45, 65, 70], sourceNames, 5),
      triangleFromAngles([45, 65, 70], targetNames, 7.5),
    ],
    [],
    [0, 1, 2],
    "aaa",
  ),
  // Two intersections of a 30-degree ray from A with a circle of radius 5 at B.
  makeRound(
    "mixed-7",
    "insufficient",
    [
      triangleFromSides([8, 5, 4 * Math.sqrt(3) + 3], sourceNames),
      triangleFromSides([8, 5, 4 * Math.sqrt(3) - 3], targetNames),
    ],
    [0, 1],
    [0],
    "ssa",
  ),
  makeRound(
    "mixed-8",
    "insufficient",
    [
      triangleFromSides([6, 5, 7], sourceNames),
      triangleFromSides([6, 5, 9], targetNames),
    ],
    [0, 1],
    [],
    "twoSides",
  ),
  makeRound(
    "mixed-9",
    "insufficient",
    [
      triangleFromSides([4, 5, 6], sourceNames),
      triangleFromSides([6, 7.5, 9], targetNames),
    ],
    [0, 1, 2],
    [],
    "unequal",
  ),
  solved("AAS", 1, "mixed-10"),
  makeRound(
    "mixed-11",
    "SAS",
    [
      triangleFromSides([3, 4, 5], sourceNames),
      triangleFromSides([3, 4, 5], targetNames),
    ],
    [0, 1],
    [1],
  ),
  makeRound(
    "mixed-12",
    "insufficient",
    [
      triangleFromAngles([55, 75, 50], sourceNames, 6),
      triangleFromAngles([55, 75, 50], targetNames, 8),
    ],
    [],
    [0, 1],
    "twoAngles",
  ),
];

export function gradeEvidence(
  round: Round,
  criterion: Criterion,
  selected: readonly string[],
): { correct: boolean; code: Feedback } {
  if (
    round.id.startsWith("lesson-") &&
    round.criterion !== "insufficient" &&
    !supports(round.criterion, round.evidence)
  )
    return { correct: false, code: "repair" };
  if (
    selected.length !== round.required.length ||
    new Set(selected).size !== selected.length ||
    !round.required.every((id) => selected.includes(id))
  )
    return { correct: false, code: "evidence" };
  if (
    criterion === round.criterion &&
    (criterion === "insufficient" || supports(criterion, round.evidence))
  )
    return { correct: true, code: "correct" };
  const sides = round.evidence.filter((e) => e.kind === "side");
  const angles = round.evidence.filter((e) => e.kind === "angle");
  if (
    criterion === "SAS" &&
    sides.length === 2 &&
    angles.length === 1 &&
    !angleBetween(sides, angles[0])
  )
    return { correct: false, code: "includedAngle" };
  if (
    criterion === "ASA" &&
    sides.length === 1 &&
    angles.length === 2 &&
    !sideBetween(sides[0], angles)
  )
    return { correct: false, code: "includedSide" };
  if (
    criterion === "AAS" &&
    sides.length === 1 &&
    angles.length === 2 &&
    sideBetween(sides[0], angles)
  )
    return { correct: false, code: "nonIncludedSide" };
  if (criterion === "RHS")
    return {
      correct: false,
      code: angles.some((e) => same(e.values[0], 90) && same(e.values[1], 90))
        ? "hypotenuse"
        : "rightAngle",
    };
  if (
    round.explanationKey === "aaa" ||
    round.explanationKey === "ssa" ||
    round.explanationKey === "unequal"
  )
    return { correct: false, code: round.explanationKey };
  return { correct: false, code: "condition" };
}

/** Shared display scale, never separately fitting the two triangles. */
export function sharedDrawingPoints(
  round: Round,
  longest: number,
): [Point[], Point[]] {
  const factor =
    longest /
    Math.max(...round.triangles.flatMap((triangle) => triangle.sides));
  return round.triangles.map((triangle) => {
    const origin = centre(triangle.points);
    return triangle.points.map((point) => ({
      ...point,
      x: (point.x - origin.x) * factor,
      y: (point.y - origin.y) * factor,
    }));
  }) as [Point[], Point[]];
}
