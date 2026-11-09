import type { DragKey } from "./geometry";
export { vocabularyView } from "./reasonVocabulary";
import { placeDiagramLabel, type LayoutBox } from "./diagramLayout";
import {
  FLOW_CENTRE,
  FLOW_RADIUS,
  getReasonScene,
  initialReasonParameters,
  matchingCentreAngleLabel,
  normaliseReasonParameters,
  toFlowPoint,
  type ReasonParameters,
} from "./reasonExploration";

export type ReasonFlow = {
  startingFact: string;
  resultFact: string;
  contrast: string;
};

/** Keep the direction of each textbook reason explicit. */
export const reasonFlow: Record<string, ReasonFlow> = {
  r1: {
    startingFact: "O is the centre. ON is perpendicular to the non-diameter chord AB at N.",
    resultFact: "AN = NB: N is the mid-point.",
    contrast:
      "Start with the right-angle mark. The equal-length marks are what you obtain.",
  },
  r2: {
    startingFact:
      "O is the centre. N is the mid-point of the non-diameter chord AB, so AN = NB. Join ON.",
    resultFact: "ON ⊥ AB.",
    contrast:
      "Start with the equal-length marks. The right-angle mark is what you obtain.",
  },
  r3: {
    startingFact: "At the mid-point N of chord AB, AN = NB and ℓ ⊥ AB.",
    resultFact: "The centre O lies on line ℓ.",
    contrast:
      "Both mid-point and perpendicular are already given. This reason locates the centre; O is not a starting point.",
  },
  r4: {
    startingFact: "AB = CD; OM and ON are perpendicular distances from O.",
    resultFact: "OM = ON.",
    contrast: "Start with equal chords; obtain equal perpendicular distances.",
  },
  r5: {
    startingFact: "OM = ON; both distances are perpendicular to their chords.",
    resultFact: "AB = CD.",
    contrast: "Start with equal perpendicular distances; obtain equal chords.",
  },
  r6: {
    startingFact: "∠APB = θ; the centre angle follows the same arc AB.",
    resultFact: "∠AOB = 2θ.",
    contrast:
      "The highlighted arc excludes P. For a major intercepted arc, use the matching reflex centre angle.",
  },
  r7: {
    startingFact:
      "P and Q are on the circumference, on the same side of AB; ∠APB = θ.",
    resultFact: "∠AQB = θ, so ∠APB = ∠AQB.",
    contrast:
      "Both angles stand on AB in the same segment. Moving one vertex to the other side changes the condition.",
  },
  r8: {
    startingFact: "AB is a diameter: A, O and B lie on one straight line.",
    resultFact: "∠ACB = 90°.",
    contrast: "The diameter is given. The right angle is the conclusion.",
  },
  r9: {
    startingFact: "A, B and C are on the circle and ∠ACB = 90°.",
    resultFact: "AB is a diameter: it passes through the centre O.",
    contrast:
      "The right angle is given. Identifying the diameter is the conclusion: use the converse.",
  },
  r10: {
    startingFact: "∠AOB = ∠COD = θ.",
    resultFact: "Minor arc AB = minor arc CD.",
    contrast: "Start with equal angles; obtain equal corresponding arcs.",
  },
  r11: {
    startingFact: "Minor arc AB = minor arc CD.",
    resultFact: "∠AOB = ∠COD = θ.",
    contrast: "Start with equal arcs; obtain equal corresponding angles.",
  },
  r12: {
    startingFact: "∠AOB = ∠COD = θ.",
    resultFact: "AB = CD.",
    contrast: "Start with equal angles; obtain equal straight chords.",
  },
  r13: {
    startingFact: "AB = CD.",
    resultFact: "The minor centre angles ∠AOB and ∠COD are equal.",
    contrast:
      "Start with equal chords; compare minor angles with minor angles, or reflex with reflex.",
  },
  r14: {
    startingFact: "AB = CD.",
    resultFact: "Minor arc AB = minor arc CD.",
    contrast:
      "Start with equal straight chords; compare minor arcs with minor arcs, or major with major.",
  },
  r15: {
    startingFact: "Minor arc AB = minor arc CD.",
    resultFact: "AB = CD.",
    contrast: "Start with equal curved arcs; obtain equal straight chords.",
  },
  r16: {
    startingFact:
      "In this circle, the turn at O for arc AB is θ. The turn at O for arc CD is φ.",
    resultFact: "Arc AB : arc CD = θ : φ.",
    contrast:
      "Use the ratio of angles at O. This is an arc-length ratio, not a chord-length ratio.",
  },
  r17: {
    startingFact:
      "∠APB = θ intercepts arc AB. ∠CQD = φ intercepts arc CD in the same circle.",
    resultFact: "Arc AB : arc CD = θ : φ.",
    contrast:
      "Use the ratio of angles at P and Q. Each intercepted arc excludes its own angle vertex.",
  },
};

export type FlowPoint = { x: number; y: number };
/** Match the notation to the actual intercepted arc as the pupil moves P. */
export function reasonResultFact(id: string, parameters: ReasonParameters) {
  if (id !== "r6") return reasonFlow[id].resultFact;
  const sweep = getReasonScene(id, parameters).arcs[0].sweep;
  return `${matchingCentreAngleLabel(sweep)} = 2θ.`;
}

export type FlowStage = "base" | "given" | "result";
type MarkBase = { id: string; stage: FlowStage };
export type FlowMark = MarkBase &
  (
    | {
        kind: "line";
        a: FlowPoint;
        b: FlowPoint;
        dashed?: boolean;
        highlightOnReveal?: boolean;
      }
    | { kind: "path"; d: string; vertex?: FlowPoint }
    | { kind: "circle"; at: FlowPoint; radius: number }
    | { kind: "dot"; at: FlowPoint }
    | {
        kind: "text";
        at: FlowPoint;
        text: string;
        anchor?: FlowPoint;
        leader?: FlowPoint;
      }
  );
export type ReasonFlowModel = {
  points: Record<string, FlowPoint>;
  marks: FlowMark[];
  handles: { name: string; key: DragKey; point: FlowPoint }[];
};

const O = FLOW_CENTRE;
const R = FLOW_RADIUS;
const onCircle = (degrees: number, radius = R): FlowPoint => ({
  x: O.x + radius * Math.cos((degrees * Math.PI) / 180),
  y: O.y + radius * Math.sin((degrees * Math.PI) / 180),
});
const arcPath = (start: number, sweep: number) => {
  const a = onCircle(start),
    b = onCircle(start + sweep);
  return `M ${a.x} ${a.y} A ${R} ${R} 0 ${sweep > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
};

/** Reserve the actual displayed glyphs, including the arc sign above AB/CD. */
export function reasonTextBox(
  mark: Extract<FlowMark, { kind: "text" }>,
): LayoutBox {
  const arc = /^arc /i.test(mark.text);
  return {
    x: mark.at.x,
    y: mark.at.y - 8,
    width: (arc ? mark.text.slice(4).length : mark.text.length) * 14 + 6,
    height: arc ? 32 : 28,
  };
}

function arrangeReasonLabels(
  marks: FlowMark[],
  points: ReasonFlowModel["points"],
) {
  const occupied: LayoutBox[] = [];
  const bounds = { left: 16, right: 404, top: 14, bottom: 346 };
  // Names retain priority; later labels move without changing any geometry.
  const texts = marks.filter(
    (mark): mark is Extract<FlowMark, { kind: "text" }> => mark.kind === "text",
  );
  const ordered = [
    ...texts.filter((mark) => mark.id.startsWith("label-")),
    ...texts.filter((mark) => !mark.id.startsWith("label-")),
  ];
  for (const mark of ordered) {
    const name = mark.id.startsWith("label-") ? mark.text : undefined;
    const vertices = Object.entries(points)
      .filter(([key]) => key !== name)
      .map(([key, point]) => ({
        ...point,
        width: key === "O" ? 10 : 28,
        height: key === "O" ? 10 : 28,
      }));
    const preferred = reasonTextBox(mark);
    const label = placeDiagramLabel(
      preferred,
      [...occupied, ...vertices],
      bounds,
    );
    if (Math.hypot(label.x - preferred.x, label.y - preferred.y) > 4) {
      mark.leader =
        mark.anchor ??
        (name ? points[name] : { x: preferred.x, y: preferred.y });
    }
    mark.at = { x: label.x, y: label.y + 8 };
    occupied.push(label);
  }
}

/** Schematic marks carry their inference stage; the result layer is removable. */
export function buildReasonFlow(
  reasonId: string,
  input?: ReasonParameters,
): ReasonFlowModel {
  const marks: FlowMark[] = [];
  const points: Record<string, FlowPoint> = {};
  const handles: ReasonFlowModel["handles"] = [];
  if (!reasonFlow[reasonId]) return { points, marks, handles };
  const p = normaliseReasonParameters(
    reasonId,
    input ?? initialReasonParameters(reasonId),
  );
  const scene = getReasonScene(reasonId, p);
  const pos = (name: string) => toFlowPoint(scene.points[name]);
  marks.push({ id: "circle", kind: "circle", at: O, radius: R, stage: "base" });
  const line = (
    id: string,
    a: FlowPoint,
    b: FlowPoint,
    stage: FlowStage = "base",
    dashed = false,
  ) => marks.push({ id, kind: "line", a, b, stage, dashed });
  // A chord or distance exists before its equality is proved. Keep its neutral
  // outline visible until the matching ticks and their colour are revealed.
  const measuredSegment = (
    id: string,
    a: FlowPoint,
    b: FlowPoint,
    equality: FlowStage,
  ) =>
    marks.push({
      id,
      kind: "line",
      a,
      b,
      stage: equality === "result" ? "base" : equality,
      highlightOnReveal: equality === "result",
    });
  const text = (
    id: string,
    at: FlowPoint,
    value: string,
    stage: FlowStage = "base",
    anchor?: FlowPoint,
  ) =>
    marks.push({
      id,
      kind: "text",
      at,
      text: value,
      stage,
      ...(anchor ? { anchor } : {}),
    });
  const namedPoint = (
    name: string,
    p: FlowPoint,
    stage: FlowStage = "base",
    dx?: number,
    dy?: number,
  ) => {
    points[name] = p;
    const length = Math.hypot(p.x - O.x, p.y - O.y) || 1;
    const source = scene.points[name];
    const labelDx =
      source?.labelDx === undefined ? undefined : (source.labelDx * R) / 160;
    const labelDy =
      source?.labelDy === undefined ? undefined : (source.labelDy * R) / 160;
    marks.push({ id: `point-${name}`, kind: "dot", at: p, stage });
    text(
      `label-${name}`,
      {
        x: p.x + (dx ?? labelDx ?? ((p.x - O.x) / length) * 20),
        y: p.y + (dy ?? labelDy ?? ((p.y - O.y) / length) * 20 + 6),
      },
      name,
      stage,
      p,
    );
  };
  const tick = (
    id: string,
    a: FlowPoint,
    b: FlowPoint,
    stage: FlowStage,
    count = 1,
    fraction = 0.5,
  ) => {
    const dx = b.x - a.x,
      dy = b.y - a.y,
      length = Math.hypot(dx, dy);
    for (let i = 0; i < count; i++) {
      const shift = (i - (count - 1) / 2) * 9;
      const x = a.x + dx * fraction + (dx / length) * shift;
      const y = a.y + dy * fraction + (dy / length) * shift;
      line(
        `${id}-${i}`,
        { x: x - (dy / length) * 9, y: y + (dx / length) * 9 },
        { x: x + (dy / length) * 9, y: y - (dx / length) * 9 },
        stage,
      );
    }
  };
  const square = (
    id: string,
    at: FlowPoint,
    a: FlowPoint,
    b: FlowPoint,
    stage: FlowStage,
  ) => {
    const lenA = Math.hypot(a.x - at.x, a.y - at.y);
    const lenB = Math.hypot(b.x - at.x, b.y - at.y);
    const size = Math.min(24, lenA, lenB);
    const u = {
      x: ((a.x - at.x) / lenA) * size,
      y: ((a.y - at.y) / lenA) * size,
    };
    const v = {
      x: ((b.x - at.x) / lenB) * size,
      y: ((b.y - at.y) / lenB) * size,
    };
    marks.push({
      id,
      kind: "path",
      stage,
      vertex: at,
      d: `M ${at.x + u.x} ${at.y + u.y} l ${v.x} ${v.y} l ${-u.x} ${-u.y}`,
    });
  };
  const angle = (
    id: string,
    at: FlowPoint,
    a: FlowPoint,
    b: FlowPoint,
    value: string,
    stage: FlowStage,
    radius = 28,
    explicitSweep?: number,
  ) => {
    const begin = Math.atan2(a.y - at.y, a.x - at.x);
    const end = Math.atan2(b.y - at.y, b.x - at.x);
    const sweep =
      explicitSweep === undefined
        ? ((end - begin + 3 * Math.PI) % (2 * Math.PI)) - Math.PI
        : (explicitSweep * Math.PI) / 180;
    const polar = (angle: number, r: number) => ({
      x: at.x + r * Math.cos(angle),
      y: at.y + r * Math.sin(angle),
    });
    const pa = polar(begin, radius),
      pb = polar(begin + sweep, radius);
    marks.push({
      id,
      kind: "path",
      stage,
      vertex: at,
      d: `M ${pa.x} ${pa.y} A ${radius} ${radius} 0 ${Math.abs(sweep) > Math.PI ? 1 : 0} ${sweep > 0 ? 1 : 0} ${pb.x} ${pb.y}`,
    });
    const label = polar(begin + sweep / 2, radius + 20);
    text(
      `${id}-value`,
      { x: label.x, y: label.y + 7 },
      value,
      stage,
      polar(begin + sweep / 2, radius),
    );
  };
  const markedArc = (
    id: string,
    start: number,
    sweep: number,
    stage: FlowStage,
    equal = false,
  ) => {
    marks.push({ id, kind: "path", d: arcPath(start, sweep), stage });
    if (equal)
      for (const shift of [-1.8, 1.8])
        line(
          `${id}-equal-${shift}`,
          onCircle(start + sweep / 2 + shift, R - 9),
          onCircle(start + sweep / 2 + shift, R + 9),
          stage,
        );
  };

  const outsideRightAngle = (at: FlowPoint, a: FlowPoint, b: FlowPoint) => {
    const la = Math.hypot(a.x - at.x, a.y - at.y),
      lb = Math.hypot(b.x - at.x, b.y - at.y);
    const x = (a.x - at.x) / la + (b.x - at.x) / lb,
      y = (a.y - at.y) / la + (b.y - at.y) / lb;
    const size = Math.hypot(x, y);
    // Place the point name across the vertex, away from the 90-degree square.
    return { dx: (-x / size) * 32, dy: (-y / size) * 32 + 7 };
  };

  if (["r1", "r2", "r3"].includes(reasonId)) {
    const A = pos("A"),
      B = pos("B"),
      N = pos("N");
    namedPoint("A", A);
    namedPoint("B", B);
    const labelN = outsideRightAngle(N, B, O);
    namedPoint("N", N, "base", labelN.dx, labelN.dy);
    const halfStage = reasonId === "r1" ? "result" : "given";
    measuredSegment("chord-AB", A, B, halfStage);
    let perpendicularArm = O;
    if (reasonId === "r3") {
      const theta = (((p.rotation ?? 0) - 90) * Math.PI) / 180;
      const start = {
        x: O.x + 145 * Math.cos(theta),
        y: O.y + 145 * Math.sin(theta),
      };
      const end = {
        x: O.x - 145 * Math.cos(theta),
        y: O.y - 145 * Math.sin(theta),
      };
      line("line-ell", start, end, "given");
      // A full bisector continues beyond O even for a chord close to the centre.
      perpendicularArm =
        Math.hypot(start.x - N.x, start.y - N.y) >
        Math.hypot(end.x - N.x, end.y - N.y)
          ? start
          : end;
      text(
        "line-name",
        { x: start.x + 18, y: start.y + 10 },
        "ℓ",
        "given",
        start,
      );
      namedPoint("O", O, "result", 20, 5);
    } else {
      line("join-ON", O, N, "given");
      namedPoint("O", O, "given", 20, 5);
    }
    tick("equal-AN", A, N, halfStage);
    tick("equal-NB", N, B, halfStage);
    square(
      "right-angle-N",
      N,
      B,
      perpendicularArm,
      reasonId === "r2" ? "result" : "given",
    );
  } else if (reasonId === "r4" || reasonId === "r5") {
    const A = pos("A"),
      B = pos("B"),
      C = pos("C"),
      D = pos("D"),
      M = pos("M"),
      N = pos("N");
    for (const [name, p] of Object.entries({ A, B, C, D })) namedPoint(name, p);
    namedPoint("O", O, "given", 20, 6);
    const labelM = outsideRightAngle(M, B, O),
      labelN = outsideRightAngle(N, D, O);
    namedPoint("M", M, "base", labelM.dx, labelM.dy);
    namedPoint("N", N, "base", labelN.dx, labelN.dy);
    const chordStage = reasonId === "r4" ? "given" : "result";
    const distanceStage = reasonId === "r5" ? "given" : "result";
    measuredSegment("chord-AB", A, B, chordStage);
    measuredSegment("chord-CD", C, D, chordStage);
    measuredSegment("distance-OM", O, M, distanceStage);
    measuredSegment("distance-ON", O, N, distanceStage);
    square("right-angle-M", M, B, O, "given");
    square("right-angle-N", N, D, O, "given");
    tick("equal-chord-AB", A, B, chordStage, 2, 0.3);
    tick("equal-chord-CD", C, D, chordStage, 2, 0.3);
    tick("equal-distance-OM", O, M, distanceStage);
    tick("equal-distance-ON", O, N, distanceStage);
  } else if (reasonId === "r6" || reasonId === "r7") {
    const A = pos("A"),
      B = pos("B"),
      P = pos("P");
    for (const [name, p] of Object.entries({ A, B, P })) namedPoint(name, p);
    line(
      "chord-AB",
      A,
      B,
      reasonId === "r7" ? "given" : "base",
      reasonId === "r6",
    );
    line("PA", P, A);
    line("PB", P, B);
    angle("angle-P", P, A, B, "θ", "given");
    if (reasonId === "r6") {
      namedPoint("O", O, "given", 19, 18);
      line("OA", O, A);
      line("OB", O, B);
      const arc = scene.arcs[0];
      markedArc("same-arc-AB", arc.start, arc.sweep, "given");
      angle(
        "angle-O",
        O,
        A,
        B,
        "2θ",
        "result",
        33,
        p.alternate ? -arc.sweep : arc.sweep,
      );
    } else {
      const Q = pos("Q");
      namedPoint("Q", Q);
      line("QA", Q, A);
      line("QB", Q, B);
      angle("angle-Q", Q, A, B, "θ", "result");
    }
  } else if (reasonId === "r8" || reasonId === "r9") {
    const A = pos("A"),
      B = pos("B"),
      C = pos("P");
    namedPoint("A", A);
    namedPoint("B", B);
    const labelC = outsideRightAngle(C, A, B);
    namedPoint("C", C, "base", labelC.dx, labelC.dy);
    line("chord-AB", A, B);
    line("CA", C, A);
    line("CB", C, B);
    const diameterStage = reasonId === "r8" ? "given" : "result";
    line("diameter-AB", A, B, diameterStage);
    namedPoint("O", O, diameterStage, 0, 24);
    square("right-angle-C", C, A, B, reasonId === "r9" ? "given" : "result");
  } else {
    const ratio = reasonId === "r16" || reasonId === "r17";
    const sweepA = scene.arcs[0].sweep,
      sweepB = scene.arcs[1].sweep;
    const startA = scene.arcs[0].start,
      startB = scene.arcs[1].start;
    const A = pos("A"),
      B = pos("B"),
      C = pos("C"),
      D = pos("D");
    for (const [name, p] of Object.entries({ A, B, C, D })) namedPoint(name, p);
    const chordEquality = ["r13", "r14"].includes(reasonId)
      ? "given"
      : ["r12", "r15"].includes(reasonId)
        ? "result"
        : "base";
    measuredSegment("chord-AB", A, B, chordEquality);
    measuredSegment("chord-CD", C, D, chordEquality);
    if (reasonId === "r17") {
      const P = pos("P"),
        Q = pos("Q");
      namedPoint("P", P);
      namedPoint("Q", Q);
      line("PA", P, A);
      line("PB", P, B);
      line("QC", Q, C);
      line("QD", Q, D);
      angle("angle-P", P, A, B, "θ", "given");
      angle("angle-Q", Q, C, D, "φ", "given");
    } else {
      const chordAndArcOnly = reasonId === "r14" || reasonId === "r15";
      namedPoint("O", O, chordAndArcOnly ? "base" : "given", 20, 8);
      if (!chordAndArcOnly)
        for (const [name, p] of Object.entries({ A, B, C, D }))
          line(`radius-O${name}`, O, p);
      if (["r10", "r11", "r12", "r13", "r16"].includes(reasonId)) {
        const stage = ["r11", "r13"].includes(reasonId) ? "result" : "given";
        angle("angle-AOB", O, A, B, "θ", stage, 30, sweepA);
        angle("angle-COD", O, C, D, ratio ? "φ" : "θ", stage, 30, sweepB);
      }
    }
    if (["r10", "r11", "r14", "r15", "r16", "r17"].includes(reasonId)) {
      const stage = ["r11", "r15"].includes(reasonId) ? "given" : "result";
      markedArc("arc-AB", startA, sweepA, stage, !ratio);
      markedArc("arc-CD", startB, sweepB, stage, !ratio);
      if (ratio) {
        const labelA = onCircle(startA + sweepA / 2, R + 29);
        const labelB = onCircle(startB + sweepB / 2, R + 29);
        text(
          "arc-AB-name",
          { x: labelA.x, y: labelA.y + 6 },
          "arc AB",
          stage,
          onCircle(startA + sweepA / 2),
        );
        text(
          "arc-CD-name",
          { x: labelB.x, y: labelB.y + 6 },
          "arc CD",
          stage,
          onCircle(startB + sweepB / 2),
        );
      }
    }
    if (["r12", "r13", "r14", "r15"].includes(reasonId)) {
      const stage = ["r13", "r14"].includes(reasonId) ? "given" : "result";
      tick("equal-chord-AB", A, B, stage);
      tick("equal-chord-CD", C, D, stage);
    }
  }
  for (const [name, point] of Object.entries(points)) {
    if (name === "O") continue;
    const key: DragKey =
      (reasonId === "r8" || reasonId === "r9") && name === "C"
        ? "P"
        : (name as DragKey);
    if (scene.points[key]?.drag || ["N", "M"].includes(name))
      handles.push({ name, key, point });
  }
  arrangeReasonLabels(marks, points);
  return { points, marks, handles };
}

export const visibleReasonMarks = (model: ReasonFlowModel, reveal: boolean) =>
  model.marks.filter((mark) => reveal || mark.stage !== "result");
