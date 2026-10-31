import { describe, expect, it } from "vitest";
import { reasons } from "./content";
import { angleAt, circlePoint, distance, type Parameters } from "./geometry";
import { buildReasonFlow, visibleReasonMarks } from "./reasonFlow";
import {
  dragReasonPoint,
  getReasonScene,
  initialReasonParameters,
  normaliseReasonParameters,
  reasonConstraint,
  reasonControls,
  reasonDragHint,
  reasonMeasurements,
  toFlowPoint,
} from "./reasonExploration";

const cross = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  q: { x: number; y: number },
) => (b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x);

function checkInvariant(id: string, parameters: Parameters) {
  const scene = getReasonScene(id, parameters),
    s = scene.points;
  for (const point of Object.values(s)) {
    expect(Number.isFinite(point.x)).toBe(true);
    expect(Number.isFinite(point.y)).toBe(true);
    if (["A", "B", "C", "D", "P", "Q"].includes(point.label))
      expect(distance(s.O, point)).toBeCloseTo(160, 8);
  }
  if (["r1", "r2", "r3"].includes(id)) {
    expect(distance(s.A, s.N)).toBeCloseTo(distance(s.N, s.B), 8);
    expect(angleAt(s.O, s.N, s.B)).toBeCloseTo(90, 8);
    expect(distance(s.O, s.N)).toBeGreaterThan(0);
  } else if (id === "r4" || id === "r5") {
    expect(distance(s.A, s.B)).toBeCloseTo(distance(s.C, s.D), 8);
    expect(distance(s.O, s.M)).toBeCloseTo(distance(s.O, s.N), 8);
    expect(angleAt(s.O, s.M, s.B)).toBeCloseTo(90, 8);
    expect(angleAt(s.O, s.N, s.D)).toBeCloseTo(90, 8);
  } else if (id === "r6") {
    expect(2 * angleAt(s.A, s.P, s.B)).toBeCloseTo(scene.arcs[0].sweep, 7);
  } else if (id === "r7") {
    expect(cross(s.A, s.B, s.P) * cross(s.A, s.B, s.Q)).toBeGreaterThan(0);
    expect(angleAt(s.A, s.P, s.B)).toBeCloseTo(angleAt(s.A, s.Q, s.B), 7);
  } else if (id === "r8" || id === "r9") {
    expect(angleAt(s.A, s.P, s.B)).toBeCloseTo(90, 8);
    expect(distance(s.A, s.B)).toBeCloseTo(320, 8);
  } else if (Number(id.slice(1)) <= 15) {
    expect(distance(s.A, s.B)).toBeCloseTo(distance(s.C, s.D), 8);
    expect(angleAt(s.A, s.O, s.B)).toBeCloseTo(angleAt(s.C, s.O, s.D), 8);
    expect(scene.arcs[0].sweep).toBeCloseTo(scene.arcs[1].sweep, 8);
    expect(scene.arcs[0].sweep).toBeLessThan(180);
  } else {
    const a = id === "r17" ? angleAt(s.A, s.P, s.B) : scene.arcs[0].sweep;
    const b = id === "r17" ? angleAt(s.C, s.Q, s.D) : scene.arcs[1].sweep;
    expect(a / b).toBeCloseTo(scene.arcs[0].sweep / scene.arcs[1].sweep, 7);
  }
  for (const reading of reasonMeasurements(id, parameters))
    expect(Number.isFinite(reading.value)).toBe(true);
}

describe("constrained reason exploration", () => {
  it("keeps signed chord offsets within the exposed control range while distances stay positive", () => {
    const p = normaliseReasonParameters("r4", {
      ...initialReasonParameters("r4"),
      primary: -6,
    });
    const control = reasonControls("r4").find((c) => c.key === "primary")!;
    expect(control.label).toBe("Shared chord offset from O");
    expect(p.primary).toBeGreaterThanOrEqual(control.min);
    expect(p.primary).toBeLessThanOrEqual(control.max);
    expect(
      reasonMeasurements("r4", p)
        .filter((m) => m.label === "OM" || m.label === "ON")
        .map((m) => m.value),
    ).toEqual([6, 6]);
  });
  it.each(reasons.map((r) => r.id))(
    "%s permits movement from every handle with at least one arrow-key direction",
    (id) => {
      const p = initialReasonParameters(id);
      for (const handle of buildReasonFlow(id, p).handles) {
        const moves = [
          [-3, 0],
          [3, 0],
          [0, -3],
          [0, 3],
        ].map(([dx, dy]) => {
          const next = dragReasonPoint(id, p, handle.key, {
            x: handle.point.x + dx,
            y: handle.point.y + dy,
          });
          checkInvariant(id, next);
          return buildReasonFlow(id, next).handles.find(
            (h) => h.name === handle.name,
          )!.point;
        });
        expect(
          moves.some((point) => distance(point, handle.point) > 0.01),
        ).toBe(true);
      }
    },
  );
  it.each(reasons.map((r) => r.id))(
    "%s keeps the given valid across every draggable handle and varied pointer positions",
    (id) => {
      const initial = initialReasonParameters(id);
      const handles = buildReasonFlow(id, initial).handles;
      expect(handles.length).toBeGreaterThanOrEqual(3);
      expect(handles.some((h) => h.name === "O")).toBe(false);
      expect(reasonConstraint(id)).not.toBe("");
      expect(reasonDragHint(id)).not.toBe("");
      for (const handle of handles) {
        let p = initial;
        for (const degrees of [13, 47, 91, 156, 204, 267, 316, 359]) {
          p = dragReasonPoint(
            id,
            p,
            handle.key,
            toFlowPoint(circlePoint(degrees)),
          );
          checkInvariant(id, p);
        }
      }
    },
  );

  it.each(reasons.map((r) => r.id))(
    "%s offers only finite constrained keyboard-control states",
    (id) => {
      for (const control of reasonControls(id)) {
        for (const value of [
          control.min,
          (control.min + control.max) / 2,
          control.max,
        ]) {
          const p = normaliseReasonParameters(id, {
            ...initialReasonParameters(id),
            [control.key]: value,
          });
          checkInvariant(id, p);
        }
      }
    },
  );

  it.each(["r3", "r9"])(
    "%s keeps hidden-centre inference marks absent after movement",
    (id) => {
      const p = dragReasonPoint(
        id,
        initialReasonParameters(id),
        "A",
        toFlowPoint(circlePoint(235)),
      );
      const model = buildReasonFlow(id, p);
      const before = visibleReasonMarks(model, false);
      expect(before.some((m) => m.id === "point-O" || m.id === "label-O")).toBe(
        false,
      );
      expect(model.handles.some((h) => h.name === "O")).toBe(false);
      expect(
        visibleReasonMarks(model, true).some((m) => m.id === "point-O"),
      ).toBe(true);
      if (id === "r3")
        expect(
          reasonMeasurements(id, p).every((m) => !m.label.includes("O")),
        ).toBe(true);
    },
  );

  it("preserves the stationary chord endpoint while r1 resizes a valid non-diameter chord", () => {
    const p = initialReasonParameters("r1"),
      before = buildReasonFlow("r1", p);
    const moved = dragReasonPoint("r1", p, "A", toFlowPoint(circlePoint(195)));
    const after = buildReasonFlow("r1", moved);
    expect(distance(before.points.B, after.points.B)).toBeLessThan(1e-8);
    expect(distance(before.points.A, after.points.A)).toBeGreaterThan(10);
    checkInvariant("r1", moved);
  });

  it("moves both ends of the diameter when either endpoint is dragged", () => {
    for (const key of ["A", "B"] as const) {
      const before = initialReasonParameters("r9");
      const p = dragReasonPoint(
        "r9",
        before,
        key,
        toFlowPoint(circlePoint(55)),
      );
      const model = getReasonScene("r9", p);
      expect(distance(model.points[key], circlePoint(55))).toBeLessThan(1e-8);
      checkInvariant("r9", p);
    }
  });

  it("uses the matching reflex centre angle after P crosses to the other arc", () => {
    const p = dragReasonPoint(
      "r6",
      initialReasonParameters("r6"),
      "P",
      toFlowPoint(circlePoint(270)),
    );
    expect(p.alternate).toBe(true);
    const readings = reasonMeasurements("r6", p);
    expect(
      readings.find((m) => m.label === "Matching ∠AOB")?.value,
    ).toBeCloseTo(240, 8);
    expect(readings.find((m) => m.label === "∠APB")?.value).toBeCloseTo(120, 8);
    expect(
      buildReasonFlow("r6", p).marks.find((m) => m.id === "angle-O"),
    ).toMatchObject({ stage: "result", kind: "path" });
  });

  it("clamps P and Q to the permitted arc rather than changing the same-side given", () => {
    for (const key of ["P", "Q"] as const) {
      const p = dragReasonPoint(
        "r7",
        initialReasonParameters("r7"),
        key,
        toFlowPoint(circlePoint(270)),
      );
      expect(p.alternate).toBe(false);
      checkInvariant("r7", p);
    }
  });

  it("r17 lets both viewpoints move without changing fixed arcs or their angles", () => {
    const p = initialReasonParameters("r17"),
      before = getReasonScene("r17", p);
    for (const key of ["P", "Q"] as const) {
      const moved = dragReasonPoint(
        "r17",
        p,
        key,
        toFlowPoint(circlePoint(key === "P" ? 120 : 330)),
      );
      const after = getReasonScene("r17", moved);
      expect(distance(before.points[key], after.points[key])).toBeGreaterThan(
        10,
      );
      for (const name of ["A", "B", "C", "D"])
        expect(after.points[name]).toEqual(before.points[name]);
      checkInvariant("r17", moved);
      expect(reasonMeasurements("r17", moved).map((m) => m.value)).toEqual(
        expect.arrayContaining([expect.any(Number)]),
      );
    }
  });

  it("retains the independent Q position on unrelated r17 endpoint drags", () => {
    const q = dragReasonPoint(
      "r17",
      initialReasonParameters("r17"),
      "Q",
      toFlowPoint(circlePoint(330)),
    );
    const p = dragReasonPoint("r17", q, "A", toFlowPoint(circlePoint(225)));
    expect(p.qPosition).toBe(q.qPosition);
  });
});
