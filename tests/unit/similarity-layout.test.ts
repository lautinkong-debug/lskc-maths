import { describe, expect, it } from "vitest";
import katex from "katex";
import {
  fractionTokens,
  fractionTermTex,
} from "../../src/apps/similarity/fractions";
import {
  placeVertexLabels,
  edgeCrossesLabel,
} from "../../src/apps/similarity/vertexLabels";
import { questions } from "../../src/apps/similarity/data";
import {
  modelPoints,
  shapePoints,
  transform,
  identityPose,
  centre,
} from "../../src/apps/similarity/geometry";
import { conditions, reasonPairs } from "../../src/apps/similarity/reasons";

describe("Textbook proof layout", () => {
  it("preserves grouped expressions, decimals, radicals and the parallel symbol", () => {
    const input =
      "AB // CD; RQ/AB = 5.6/4.2 = 4/3; 2.5/(x + 4.5); 3/(9/7); 2√13/3√13";
    const tokens = fractionTokens(input);
    expect(tokens.map((t) => t.text).join("")).toBe(input);
    expect(
      tokens
        .filter((t) => t.numerator)
        .map((t) => [t.numerator, t.denominator]),
    ).toEqual([
      ["RQ", "AB"],
      ["5.6", "4.2"],
      ["4", "3"],
      ["2.5", "(x + 4.5)"],
      ["3", "(9/7)"],
      ["2√13", "3√13"],
    ]);
    expect(fractionTermTex("(9/7)")).toBe("\\dfrac{9}{7}");
    expect(fractionTermTex("2√13")).toBe("2\\sqrt{13}");
  });
  it("renders every source proof's fractions as valid KaTeX without losing text", () => {
    for (const q of questions) {
      const text = [
        q.prompt,
        ...q.proof,
        q.result,
        ...reasonPairs(q).flatMap((p) =>
          conditions(q, p, "both").flatMap((r) => [r.text, r.note]),
        ),
      ];
      for (const line of text) {
        const tokens = fractionTokens(line);
        expect(tokens.map((t) => t.text).join(""), q.id).toBe(line);
        const prose = tokens
          .filter((t) => !t.numerator)
          .map((t) => t.text)
          .join("")
          .replaceAll("//", "");
        expect.soft(prose, `${q.id}: ${line}`).not.toContain("/");
        for (const token of tokens.filter((t) => t.numerator)) {
          const tex = `\\dfrac{${fractionTermTex(token.numerator!)}}{${fractionTermTex(token.denominator!)}}`;
          expect(
            () => katex.renderToString(tex, { throwOnError: true }),
            `${q.id}: ${tex}`,
          ).not.toThrow();
        }
      }
    }
  });
});

describe("Vertex labels", () => {
  it("clears all edges in the reported nested Q17 figure, including after turns, resizing and reflection", () => {
    const q = questions.find((q) => q.id === "ex8c-17")!;
    const original = modelPoints(q);
    for (const angle of [0, 35, 90, 225])
      for (const flipX of [1, -1])
        for (const scale of [0.7, 1, 2]) {
          const ps = transform(original, {
            ...identityPose,
            ...centre(original),
            angle,
            flipX,
            scale,
          });
          const polygons = q.shapes.map((s) => shapePoints(s, ps));
          const labels = placeVertexLabels(
            ps.map((p) => ({
              key: p.label,
              point: p,
              text: p.label,
              fontSize: 20,
            })),
            polygons,
          );
          expect(labels.size).toBe(ps.length);
          for (const [name, box] of labels) {
            for (const poly of polygons)
              for (let i = 0; i < poly.length; i++)
                expect(
                  edgeCrossesLabel(poly[i], poly[(i + 1) % poly.length], box),
                  `${name}: ${angle}/${scale}/${flipX}`,
                ).toBe(false);
          }
        }
  });
});
