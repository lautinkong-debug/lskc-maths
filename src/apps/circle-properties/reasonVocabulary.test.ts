import { expect, it } from "vitest";
import { angleAt, distance } from "./geometry";
import {
  buildReasonFlow,
  vocabularyView,
  type FlowMark,
  type FlowPoint,
} from "./reasonFlow";
import {
  FLOW_CENTRE as O,
  dragReasonPoint,
  initialReasonParameters,
  type ReasonParameters,
} from "./reasonExploration";
import { theoremLessons, type GuidedReasonId } from "./theoremLessonData";

function word(id: GuidedReasonId, index: number, shape?: ReasonParameters) {
  return vocabularyView(
    buildReasonFlow(id, shape),
    theoremLessons[id].terms[index].marks,
  );
}

// Assert each word identifies the feature the pupil is asked to trace, not merely a visible mark.
const features: [GuidedReasonId, string[][]][] = [
  [
    "r3",
    [
      ["chord-AB"],
      ["half-AN", "half-NB", "equal-AN-0", "equal-NB-0"],
      ["line-ell", "right-angle-N", "equal-AN-0", "equal-NB-0"],
    ],
  ],
  [
    "r4",
    [
      ["chord-AB"],
      ["distance-OM", "right-angle-M"],
      ["example-radius-1", "example-radius-2"],
    ],
  ],
  [
    "r5",
    [
      ["distance-OM", "right-angle-M"],
      ["chord-AB"],
      ["example-radius-1", "example-radius-2"],
    ],
  ],
  [
    "r6",
    [
      ["PA", "PB", "point-P", "angle-P"],
      ["OA", "OB", "point-O", "angle-O"],
      ["same-arc-AB"],
    ],
  ],
  [
    "r7",
    [
      ["chord-AB"],
      ["PA", "PB", "point-P"],
      ["same-segment-boundary", "point-P", "point-Q", "chord-AB"],
    ],
  ],
  [
    "r8",
    [
      ["diameter-AB", "point-O"],
      ["semicircular-arc", "diameter-AB"],
      ["CA", "CB", "turn-at-C"],
    ],
  ],
  [
    "r9",
    [
      ["right-angle-C", "point-C"],
      ["chord-AB"],
      ["example-diameter-EF", "example-point-K"],
    ],
  ],
  [
    "r10",
    [
      ["radius-OA", "radius-OB", "angle-AOB"],
      ["arc-AB"],
      ["example-radius-1", "example-radius-2"],
    ],
  ],
  [
    "r11",
    [
      ["arc-AB"],
      ["radius-OA", "radius-OB", "angle-AOB"],
      ["example-radius-1", "example-radius-2"],
    ],
  ],
  [
    "r12",
    [
      ["radius-OA", "radius-OB", "angle-AOB"],
      ["chord-AB"],
      ["example-radius-1", "example-radius-2"],
    ],
  ],
  [
    "r13",
    [
      ["chord-AB"],
      ["radius-OA", "radius-OB", "angle-AOB"],
      ["example-radius-1", "example-radius-2"],
    ],
  ],
  ["r14", [["chord-AB"], ["arc-AB"], ["example-radius-1", "example-radius-2"]]],
  ["r15", [["arc-AB"], ["chord-AB"], ["example-radius-1", "example-radius-2"]]],
  [
    "r16",
    [
      ["radius-OA", "radius-OB", "angle-AOB", "arc-AB"],
      ["radius-OC", "radius-OD", "angle-COD", "arc-CD"],
      ["arc-AB", "arc-CD"],
    ],
  ],
  [
    "r17",
    [
      ["PA", "PB", "point-P"],
      ["PA", "PB", "QC", "QD", "arc-AB", "arc-CD"],
      ["arc-AB", "arc-CD"],
    ],
  ],
];
it.each(features)(
  "%s teaches the terms using the correct diagram features in order",
  (id, groups) => {
    expect(groups).toHaveLength(theoremLessons[id].terms.length);
    groups.forEach((ids, index) => {
      const { selected, marks } = word(id, index);
      const highlightedIds = marks
        .filter((mark) => selected.has(mark.id))
        .map((mark) => mark.id);
      expect(highlightedIds).toEqual(expect.arrayContaining(ids));
    });
  },
);

// Each single SVG arc here has the form M x y A rx ry 0 large clockwise x y.
function readArc(marks: FlowMark[], id: string) {
  const mark = marks.find((mark) => mark.id === id);
  if (mark?.kind !== "path") throw new Error("Missing arc " + id);
  const [x, y, , , , large, clockwise, endX, endY] = mark.d
    .split(" ")
    .filter((part) => part !== "M" && part !== "A")
    .map(Number);
  return {
    a: { x, y },
    b: { x: endX, y: endY },
    large,
    clockwise,
    vertex: mark.vertex,
  };
}
const bearing = (p: FlowPoint) =>
  (Math.atan2(p.y - O.y, p.x - O.x) * 180) / Math.PI;
const wrap = (deg: number) => ((deg % 360) + 360) % 360;
const along = (p: FlowPoint, from: FlowPoint, clockwise: number) =>
  wrap((bearing(p) - bearing(from)) * (clockwise ? 1 : -1));

it("16.6 follows P across the chord: the selected arc excludes P and the marked centre turn doubles the actual angle", () => {
  const initial = initialReasonParameters("r6");
  const { P } = buildReasonFlow("r6", initial).points;
  const across = dragReasonPoint("r6", initial, "P", {
    x: 2 * O.x - P.x,
    y: 2 * O.y - P.y,
  });
  const largeFlags = [];
  for (const shape of [initial, across]) {
    const { A, B, P } = buildReasonFlow("r6", shape).points;
    const arc = readArc(word("r6", 2, shape).marks, "same-arc-AB");
    const turn = readArc(word("r6", 1, shape).marks, "angle-O");
    const sweep = along(arc.b, arc.a, arc.clockwise);
    expect(along(P, arc.a, arc.clockwise)).toBeGreaterThan(sweep);
    expect(turn.vertex).toEqual(O);
    expect(along(turn.b, turn.a, turn.clockwise)).toBeCloseTo(sweep, 8);
    expect(sweep).toBeCloseTo(2 * angleAt(A, P, B), 8);
    expect(
      word("r6", 1, shape).marks.some((m) => m.id === "angle-O-value"),
    ).toBe(false);
    largeFlags.push(turn.large);
  }
  expect(largeFlags).toEqual([0, 1]);
});

it("16.7 marks the boundary containing both vertices, and 16.8 shows the half-circle excluding C", () => {
  for (const rotation of [0, 76, 213]) {
    const segment = {
      ...initialReasonParameters("r7"),
      rotation,
      primary: 285,
    };
    const { P, Q } = buildReasonFlow("r7", segment).points;
    const edge = readArc(word("r7", 2, segment).marks, "same-segment-boundary");
    for (const vertex of [P, Q])
      expect(along(vertex, edge.a, edge.clockwise)).toBeLessThan(
        along(edge.b, edge.a, edge.clockwise),
      );
    const semicircle = { ...initialReasonParameters("r8"), rotation };
    const { C } = buildReasonFlow("r8", semicircle).points;
    const half = readArc(word("r8", 1, semicircle).marks, "semicircular-arc");
    expect(along(half.b, half.a, half.clockwise)).toBeCloseTo(180, 8);
    expect(along(C, half.a, half.clockwise)).toBeGreaterThan(180);
  }
});

it("gives 16.9 a separate true diameter and demonstrates equal radii on two equally sized circles", () => {
  const diagram = word("r9", 2).marks;
  expect(diagram.every((mark) => mark.id.startsWith("example-"))).toBe(true);
  const ef = diagram.find((mark) => mark.id === "example-diameter-EF");
  const rim = diagram.find((mark) => mark.id === "example-circle");
  if (ef?.kind !== "line" || rim?.kind !== "circle")
    throw new Error("Missing diameter definition");
  expect(distance(ef.a, ef.b)).toBeCloseTo(2 * rim.radius);
  expect((ef.a.x + ef.b.x) / 2).toBe(rim.at.x);
  expect((ef.a.y + ef.b.y) / 2).toBe(rim.at.y);
  const equalCircles = word("r5", 2).marks;
  expect(equalCircles.every((mark) => mark.id.startsWith("example-"))).toBe(
    true,
  );
  const radii = [1, 2].map((n) => {
    const circle = equalCircles.find((mark) => mark.id === "example-rim-" + n);
    const segment = equalCircles.find(
      (mark) => mark.id === "example-radius-" + n,
    );
    if (circle?.kind !== "circle" || segment?.kind !== "line")
      throw new Error("Missing circle/radius");
    expect(segment.a).toEqual(circle.at);
    expect(distance(segment.a, segment.b)).toBeCloseTo(circle.radius);
    return circle.radius;
  });
  expect(radii[0]).toEqual(radii[1]);
});

it("16.16 pairs each selected turn with its arc, even for a reflex angle, without showing a ratio answer", () => {
  const shape = {
    ...initialReasonParameters("r16"),
    primary: 250,
    secondary: 75,
    rotation: 61,
  };
  for (const [i, angle, arc, expected] of [
    [0, "angle-AOB", "arc-AB", 250],
    [1, "angle-COD", "arc-CD", 75],
  ] as const) {
    const { marks, selected } = word("r16", i, shape);
    const turn = readArc(marks, angle);
    const rim = readArc(marks, arc);
    expect(along(turn.b, turn.a, turn.clockwise)).toBeCloseTo(expected);
    expect(along(rim.b, rim.a, rim.clockwise)).toBeCloseTo(expected);
    expect(selected.has(i ? "arc-AB" : "arc-CD")).toBe(false);
    expect(marks.some((mark) => mark.stage === "result")).toBe(false);
  }
});
