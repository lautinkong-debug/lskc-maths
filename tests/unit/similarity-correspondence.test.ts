import { describe, expect, it } from "vitest";
import { questions } from "../../src/apps/similarity/data";
import { textbookSolutions } from "../../src/apps/similarity/textbook";
import {
  conclusionCorrespondence,
  correspondenceHighlights,
  layoutCorrespondenceLabels,
} from "../../src/apps/similarity/correspondence";
import type { TextbookStep } from "../../src/apps/similarity/textbook-types";

const question = questions.find((q) => q.id === "ex8c-19")!;
const step = textbookSolutions[question.id].steps.find((s) => s.conclusion)!;

describe("similarity conclusion correspondence", () => {
  it("allocates separate readable angle labels when both triangles coincide", () => {
    const pair = conclusionCorrespondence(question, step)!.pairs[3];
    const shapes = ["AFE", "ABC"].map((names) =>
      [...names].map((label, i) => ({
        label,
        x: [0, 100, 100][i],
        y: [0, 0, -100][i],
      })),
    );
    const labels = [
      ...layoutCorrespondenceLabels(pair, question.points, shapes).values(),
    ];
    expect(labels).toHaveLength(2);
    const [a, b] = labels;
    expect(
      a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y,
    ).toBe(false);
  });
  it("uses the printed vertex order, retaining the shared A", () => {
    const result = conclusionCorrespondence(question, step)!;
    expect(result.vertices).toEqual([
      ["A", "A"],
      ["F", "B"],
      ["E", "C"],
    ]);
    expect(result.pairs.map((p) => p.label)).toEqual([
      "AF ↔ AB",
      "FE ↔ BC",
      "EA ↔ CA",
      "∠EAF = ∠CAB",
      "∠AFE = ∠ABC",
      "∠FEA = ∠BCA",
    ]);
    expect(result.pairs.slice(0, 3).every((p) => !p.label.includes("="))).toBe(
      true,
    );
  });
  it("does not reveal correspondence from a heading or an ordinary proof line", () => {
    for (const s of textbookSolutions[question.id].steps.slice(0, 15))
      if (!s.math?.some((m) => m.includes("\\sim")))
        expect(conclusionCorrespondence(question, s)).toBeUndefined();
    expect(conclusionCorrespondence(question, undefined)).toBeUndefined();
  });
  it("rejects negated similarity, congruence, repeated vertices and unknown points", () => {
    for (const math of [
      String.raw`\triangle AFE\not\sim\triangle ABC`,
      String.raw`\triangle AFE\cong\triangle ABC`,
      String.raw`\triangle AAE\sim\triangle ABC`,
      String.raw`\triangle XYZ\sim\triangle ABC`,
    ])
      expect(
        conclusionCorrespondence(question, { math: [math], highlights: {} }),
      ).toBeUndefined();
  });
  it("keeps each angle on its own extracted triangle, including a common vertex", () => {
    const pair = conclusionCorrespondence(question, step)!.pairs[3];
    expect(correspondenceHighlights(pair)).toEqual({ angles: ["EAF", "CAB"] });
    expect(correspondenceHighlights(pair, ["A", "F", "E"])).toEqual({
      angles: ["EAF"],
    });
    expect(correspondenceHighlights(pair, ["A", "B", "C"])).toEqual({
      angles: ["CAB"],
    });
    expect(correspondenceHighlights(pair, ["A", "C", "D", "E"])).toEqual({
      angles: [],
    });
    expect(correspondenceHighlights(pair, undefined, ["AFE"])).toEqual({
      angles: ["CAB"],
    });
  });
  it("gives six valid pairs for every recognised triangle statement in the bank", () => {
    let count = 0;
    for (const q of questions)
      for (const s of textbookSolutions[q.id].steps) {
        const result = conclusionCorrespondence(q, s);
        if (!result) continue;
        count++;
        expect(result.pairs).toHaveLength(6);
        for (const pair of result.pairs)
          for (const member of pair.members)
            expect(
              [...member.name].every((v) =>
                q.points.some((p) => p.label === v),
              ),
            ).toBe(true);
      }
    expect(count).toBeGreaterThan(50);
  });
  it("updates correspondence for a differently ordered printed statement", () => {
    const s: TextbookStep = {
      math: [String.raw`\triangle EFA\sim\triangle CBA`],
      highlights: {},
    };
    expect(conclusionCorrespondence(question, s)!.pairs[0].label).toBe(
      "EF ↔ CB",
    );
  });
});
