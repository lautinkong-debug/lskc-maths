import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReasonFlowDiagram from "./ReasonFlowDiagram";
import { reasons } from "./content";
import { angleAt, distance } from "./geometry";
import {
  buildReasonFlow,
  reasonFlow,
  reasonTextBox,
  visibleReasonMarks,
} from "./reasonFlow";
import {
  initialReasonParameters,
  normaliseReasonParameters,
} from "./reasonExploration";

describe("reason inference diagrams", () => {
  it("withholds a displaced centre label and its aria-hidden leader until the conclusion", () => {
    const parameters = {
      primary: 0.5,
      secondary: 5,
      rotation: 0,
      alternate: false,
    };
    const before = renderToStaticMarkup(
      createElement(ReasonFlowDiagram, {
        reasonId: "r3",
        parameters,
        reveal: false,
      }),
    );
    const after = renderToStaticMarkup(
      createElement(ReasonFlowDiagram, {
        reasonId: "r3",
        parameters,
        reveal: true,
      }),
    );
    expect(before).not.toContain('data-label-leader="label-O"');
    expect(before).not.toContain('data-stage="result"');
    expect(after).toMatch(
      /<line[^>]*aria-hidden="true"[^>]*data-label-leader="label-O"[^>]*data-stage="result"/,
    );
  });

  it("covers every canonical reason once with an explicit given-to-conclusion direction", () => {
    expect(Object.keys(reasonFlow)).toEqual(reasons.map((reason) => reason.id));
    for (const reason of reasons) {
      const flow = reasonFlow[reason.id];
      expect(flow.startingFact.trim()).not.toBe("");
      expect(flow.resultFact.trim()).not.toBe("");
      expect(flow.contrast.trim()).not.toBe("");
      expect(flow.startingFact).not.toBe(flow.resultFact);
    }
  });

  it.each(reasons.map((reason) => reason.id))(
    "%s contains separate given and result layers without prematurely exposing a result mark",
    (id) => {
      const model = buildReasonFlow(id);
      expect(model.marks.some((mark) => mark.stage === "given")).toBe(true);
      expect(model.marks.some((mark) => mark.stage === "result")).toBe(true);
      const before = visibleReasonMarks(model, false);
      const after = visibleReasonMarks(model, true);
      expect(before.every((mark) => mark.stage !== "result")).toBe(true);
      expect(after.length).toBeGreaterThan(before.length);
      for (const mark of before) expect(after).toContain(mark);
      expect(new Set(after.map((mark) => mark.id)).size).toBe(after.length);
      const circle = model.marks.find((mark) => mark.kind === "circle");
      expect(circle?.kind).toBe("circle");
      if (circle?.kind !== "circle") return;
      for (const [name, point] of Object.entries(model.points))
        if (["A", "B", "C", "D", "P", "Q"].includes(name))
          expect(distance(point, circle.at)).toBeCloseTo(circle.radius, 10);
    },
  );

  it("r1 starts with the centre and perpendicular, then reveals only the midpoint marks", () => {
    const model = buildReasonFlow("r1");
    const before = visibleReasonMarks(model, false);
    expect(before.some((m) => m.id === "point-O" && m.stage === "given")).toBe(
      true,
    );
    expect(
      before.some((m) => m.id === "right-angle-N" && m.stage === "given"),
    ).toBe(true);
    expect(before.some((m) => m.id.startsWith("equal-"))).toBe(false);
    expect(
      model.marks.filter((m) => m.stage === "result").map((m) => m.id),
    ).toEqual(["equal-AN-0", "equal-NB-0"]);
    expect(reasonFlow.r1.resultFact).toContain("AN = NB");
  });

  it("r2 reverses r1: the equal halves are given and the right angle appears last", () => {
    const model = buildReasonFlow("r2");
    const before = visibleReasonMarks(model, false);
    expect(before.filter((m) => m.id.startsWith("equal-")).length).toBe(2);
    expect(before.some((m) => m.id === "right-angle-N")).toBe(false);
    expect(
      model.marks.filter((m) => m.stage === "result").map((m) => m.id),
    ).toEqual(["right-angle-N"]);
    expect(reasonFlow.r2.resultFact).toBe("ON ⊥ AB.");
  });

  it("r3 withholds both the point O and its name until the centre-location conclusion", () => {
    const model = buildReasonFlow("r3");
    const before = visibleReasonMarks(model, false);
    expect(before.some((m) => m.id === "line-ell")).toBe(true);
    expect(before.some((m) => m.id === "right-angle-N")).toBe(true);
    expect(before.filter((m) => m.id.startsWith("equal-")).length).toBe(2);
    expect(before.some((m) => m.id === "point-O" || m.id === "label-O")).toBe(
      false,
    );
    const results = model.marks.filter((m) => m.stage === "result");
    expect(results.map((m) => m.id)).toEqual(["point-O", "label-O"]);
    const line = model.marks.find((m) => m.id === "line-ell");
    if (line?.kind !== "line")
      throw new Error("Missing perpendicular bisector");
    const O = model.points.O;
    expect(
      (line.b.x - line.a.x) * (O.y - line.a.y) -
        (line.b.y - line.a.y) * (O.x - line.a.x),
    ).toBeCloseTo(0, 10);
    expect(reasonFlow.r3.resultFact).toContain("centre O");
  });

  it.each(["r1", "r2", "r3"])(
    "%s shows geometrically valid equal halves and perpendicular",
    (id) => {
      const p = buildReasonFlow(id).points;
      expect(distance(p.A, p.N)).toBeCloseTo(distance(p.N, p.B), 10);
      expect(angleAt(p.O, p.N, p.B)).toBeCloseTo(90, 10);
    },
  );

  it("r4 and r5 reverse the equal-chord and equal-distance marks", () => {
    for (const [id, given, result] of [
      ["r4", "equal-chord-", "equal-distance-"],
      ["r5", "equal-distance-", "equal-chord-"],
    ]) {
      const model = buildReasonFlow(id);
      expect(
        model.marks
          .filter((m) => m.id.startsWith(given))
          .every((m) => m.stage === "given"),
      ).toBe(true);
      expect(
        model.marks
          .filter((m) => m.id.startsWith(result))
          .every((m) => m.stage === "result"),
      ).toBe(true);
      const p = model.points;
      expect(distance(p.A, p.B)).toBeCloseTo(distance(p.C, p.D), 10);
      expect(distance(p.O, p.M)).toBeCloseTo(distance(p.O, p.N), 10);
      expect(angleAt(p.O, p.M, p.B)).toBeCloseTo(90, 10);
      expect(angleAt(p.O, p.N, p.D)).toBeCloseTo(90, 10);
    }
  });

  it("r6 reveals 2θ at the centre, with the correct same-arc geometry", () => {
    const model = buildReasonFlow("r6"),
      p = model.points;
    expect(angleAt(p.A, p.O, p.B)).toBeCloseTo(2 * angleAt(p.A, p.P, p.B), 10);
    expect(
      visibleReasonMarks(model, false).some(
        (m) => m.kind === "text" && m.text === "2θ",
      ),
    ).toBe(false);
    expect(
      model.marks.some(
        (m) => m.kind === "text" && m.text === "2θ" && m.stage === "result",
      ),
    ).toBe(true);
  });

  it("r7 places P and Q in the same segment and reveals the second equal angle", () => {
    const model = buildReasonFlow("r7"),
      p = model.points;
    expect(angleAt(p.A, p.P, p.B)).toBeCloseTo(angleAt(p.A, p.Q, p.B), 10);
    const side = (point: { x: number; y: number }) =>
      (p.B.x - p.A.x) * (point.y - p.A.y) - (p.B.y - p.A.y) * (point.x - p.A.x);
    expect(side(p.P) * side(p.Q)).toBeGreaterThan(0);
    expect(model.marks.find((m) => m.id === "angle-P")?.stage).toBe("given");
    expect(model.marks.find((m) => m.id === "angle-Q")?.stage).toBe("result");
  });

  it("r8 and r9 reverse diameter and right-angle information without giving away O in r9", () => {
    for (const id of ["r8", "r9"]) {
      const model = buildReasonFlow(id),
        p = model.points;
      expect(angleAt(p.A, p.C, p.B)).toBeCloseTo(90, 10);
      expect(distance(p.A, p.B)).toBeCloseTo(250, 10);
      expect(model.marks.find((m) => m.id === "diameter-AB")?.stage).toBe(
        id === "r8" ? "given" : "result",
      );
      expect(model.marks.find((m) => m.id === "right-angle-C")?.stage).toBe(
        id === "r9" ? "given" : "result",
      );
    }
    const before = visibleReasonMarks(buildReasonFlow("r9"), false);
    expect(before.some((m) => m.id === "point-O" || m.id === "label-O")).toBe(
      false,
    );
  });

  it.each([
    ["r10", "angle-AOB", "arc-AB"],
    ["r11", "arc-AB", "angle-AOB"],
    ["r12", "angle-AOB", "equal-chord-AB-0"],
    ["r13", "equal-chord-AB-0", "angle-AOB"],
    ["r14", "equal-chord-AB-0", "arc-AB"],
    ["r15", "arc-AB", "equal-chord-AB-0"],
  ])("%s preserves the given and conclusion direction", (id, given, result) => {
    const model = buildReasonFlow(id),
      p = model.points;
    expect(model.marks.find((m) => m.id === given)?.stage).toBe("given");
    expect(model.marks.find((m) => m.id === result)?.stage).toBe("result");
    expect(angleAt(p.A, p.O, p.B)).toBeCloseTo(angleAt(p.C, p.O, p.D), 10);
    expect(distance(p.A, p.B)).toBeCloseTo(distance(p.C, p.D), 10);
    expect(angleAt(p.A, p.O, p.B)).toBeLessThan(180);
  });

  it.each(["r16", "r17"])(
    "%s uses genuinely unequal corresponding angles and arcs, without equal-arc ticks",
    (id) => {
      const model = buildReasonFlow(id),
        p = model.points;
      const a = id === "r16" ? angleAt(p.A, p.O, p.B) : angleAt(p.A, p.P, p.B);
      const b = id === "r16" ? angleAt(p.C, p.O, p.D) : angleAt(p.C, p.Q, p.D);
      expect(a / b).toBeCloseTo(60 / 100, 10);
      expect(a).not.toBeCloseTo(b, 5);
      expect(model.marks.some((m) => m.id.includes("equal"))).toBe(false);
      expect(model.marks.find((m) => m.id === "arc-AB")?.stage).toBe("result");
      expect(reasonFlow[id].resultFact).toBe("Arc AB : arc CD = θ : φ.");
    },
  );

  it.each(reasons.map((reason) => reason.id))(
    "%s keeps edge-case labels separate without changing the theorem or exposing result marks",
    (id) => {
      const failures: string[] = [];
      const number = Number(id.slice(1));
      for (const fraction of [0, 0.1, 0.5, 0.9, 1])
        for (const rotation of [0, 37, 90, 180, 270])
          for (const alternate of [false, true]) {
            const parameters = normaliseReasonParameters(id, {
              ...initialReasonParameters(id),
              primary:
                number < 6 ? -9.2 + 18.4 * fraction : 20 + 320 * fraction,
              secondary: number < 6 ? 5 : 5 + 90 * fraction,
              tertiary: 5 + 90 * fraction,
              qPosition: 95 - 90 * fraction,
              rotation,
              rotation2: rotation + 180,
              alternate,
            });
            const model = buildReasonFlow(id, parameters);
            const texts = model.marks.filter((mark) => mark.kind === "text");
            const boxes = texts.map(reasonTextBox);
            for (let i = 0; i < boxes.length; i++)
              for (let j = i + 1; j < boxes.length; j++) {
                const a = boxes[i],
                  b = boxes[j];
                if (
                  Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
                  Math.abs(a.y - b.y) < (a.height + b.height) / 2
                )
                  failures.push(
                    `${fraction}/${rotation}/${alternate}: ${texts[i].id}/${texts[j].id}`,
                  );
              }
            for (const box of boxes) {
              expect(box.x - box.width / 2).toBeGreaterThanOrEqual(15.99);
              expect(box.x + box.width / 2).toBeLessThanOrEqual(404.01);
              expect(box.y - box.height / 2).toBeGreaterThanOrEqual(13.99);
              expect(box.y + box.height / 2).toBeLessThanOrEqual(346.01);
            }
            expect(
              visibleReasonMarks(model, false).every(
                (mark) => mark.stage !== "result",
              ),
            ).toBe(true);
            const p = model.points;
            for (const point of Object.values(p))
              expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(
                true,
              );
            if (number <= 3) {
              expect(distance(p.A, p.N)).toBeCloseTo(distance(p.N, p.B), 8);
              expect(angleAt(p.O, p.N, p.B)).toBeCloseTo(90, 8);
            } else if (number <= 5) {
              expect(distance(p.A, p.B)).toBeCloseTo(distance(p.C, p.D), 8);
              expect(distance(p.O, p.M)).toBeCloseTo(distance(p.O, p.N), 8);
              expect(angleAt(p.O, p.M, p.B)).toBeCloseTo(90, 8);
            } else if (number === 6) {
              expect(2 * angleAt(p.A, p.P, p.B)).toBeCloseTo(
                parameters.alternate
                  ? 360 - parameters.primary
                  : parameters.primary,
                8,
              );
            } else if (number === 7) {
              expect(angleAt(p.A, p.P, p.B)).toBeCloseTo(
                angleAt(p.A, p.Q, p.B),
                8,
              );
            } else if (number <= 9) {
              expect(angleAt(p.A, p.C, p.B)).toBeCloseTo(90, 8);
              expect(distance(p.A, p.B)).toBeCloseTo(250, 8);
            } else if (number <= 15) {
              expect(distance(p.A, p.B)).toBeCloseTo(distance(p.C, p.D), 8);
              expect(angleAt(p.A, p.O, p.B)).toBeCloseTo(
                angleAt(p.C, p.O, p.D),
                8,
              );
            } else if (number === 16) {
              expect(angleAt(p.A, p.O, p.B)).toBeCloseTo(
                Math.min(parameters.primary, 360 - parameters.primary),
                8,
              );
              expect(angleAt(p.C, p.O, p.D)).toBeCloseTo(
                Math.min(parameters.secondary, 360 - parameters.secondary),
                8,
              );
            } else {
              expect(angleAt(p.A, p.P, p.B)).toBeCloseTo(
                parameters.primary / 2,
                8,
              );
              expect(angleAt(p.C, p.Q, p.D)).toBeCloseTo(
                parameters.secondary / 2,
                8,
              );
            }
          }
      expect(failures).toEqual([]);
    },
  );
});
