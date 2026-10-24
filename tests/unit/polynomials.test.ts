import { describe, expect, it } from "vitest";
import katex from "katex";
import { copy } from "../../src/lib/copy";
import {
  equations,
  frames,
  products,
  question,
  toTex,
  type Expression,
} from "../../src/apps/polynomials/model";

// Independent exact integer coefficient arithmetic, constant first.
function add(a: number[], b: number[]): number[] {
  const r = Array.from(
    { length: Math.max(a.length, b.length) },
    (_, i) => (a[i] ?? 0) + (b[i] ?? 0),
  );
  while (r.length > 1 && r.at(-1) === 0) r.pop();
  return r;
}
function multiply(a: number[], b: number[]): number[] {
  const r = Array(a.length + b.length - 1).fill(0) as number[];
  a.forEach((x, i) =>
    b.forEach((y, j) => {
      r[i + j] += x * y;
    }),
  );
  return add(r, [0]);
}
function coefficients(e: Expression): number[] {
  switch (e.kind) {
    case "term":
      return [...Array(e.power).fill(0), e.coefficient];
    case "sum":
      return e.terms.map(coefficients).reduce(add, [0]);
    case "product":
      return e.factors.map(coefficients).reduce(multiply, [1]);
    case "difference":
      return add(
        coefficients(e.left),
        coefficients(e.right).map((n) => -n),
      );
    case "group":
      return coefficients(e.value);
    case "square":
      return multiply(coefficients(e.value), coefficients(e.value));
  }
}

describe("Exercise 10D Q34(b) source and teaching mathematics", () => {
  it("provides a visible action and explanation for every frame, including the start", () => {
    for (const frame of frames) {
      const titles: Record<string, string> = copy.polynomials.nextActions;
      const reasons: Record<string, string> = copy.polynomials.reasons;
      expect(titles[frame.mode], frame.id).toBeTruthy();
      expect(reasons[frame.mode], frame.id).toBeTruthy();
    }
  });
  it("retains the exact source reference and independently printed answer", () => {
    expect(question.id).toBe("10D-34b");
    expect(question.page).toBe("10.35");
    expect(question.answerPage).toBe("10.52");
    expect(question.printedAnswer).toBe("-7x^{2}-24x-16");
    expect(toTex(equations[0].expression)).toBe("2x^{2}-(3x+4)^{2}");
    expect(toTex(equations.at(-1)!.expression)).toBe(question.printedAnswer);
  });
  it("every displayed equation has the printed answer's exact coefficients", () => {
    for (const row of equations)
      expect(coefficients(row.expression), row.id).toEqual([-16, -24, -7]);
  });
  it("accounts for all four products including both cross terms", () => {
    expect(products.map((p) => coefficients(p.result))).toEqual([
      [0, 0, 9],
      [0, 12],
      [0, 12],
      [16],
    ]);
    for (const product of products)
      expect(
        multiply(coefficients(product.left), coefficients(product.right)),
      ).toEqual(coefficients(product.result));
  });
  it("keeps each product hidden until after its factor-pair highlight", () => {
    expect(frames[0].equation).toBe(0);
    for (let i = 0; i < 4; i++) {
      const highlight = frames.findIndex(
        (f) => f.activeProduct === i && f.revealedProducts === i,
      );
      expect(highlight).toBeGreaterThan(0);
      expect(frames[highlight + 1].activeProduct).toBe(i);
      expect(frames[highlight + 1].revealedProducts).toBe(i + 1);
    }
    expect(frames.find((f) => f.revealedProducts === 3)!.equation).toBeLessThan(
      equations.findIndex((e) => e.id === "expanded"),
    );
  });
  it("focuses the outside minus before reversing all signs, then combines coefficients", () => {
    const focus = frames.findIndex((f) => f.mode === "minus-focus");
    expect(equations[frames[focus].equation].id).toBe("collected");
    expect(equations[frames[focus + 1].equation].id).toBe("removed");
    expect(equations[frames.at(-2)!.equation].id).toBe("grouped");
    expect(equations[frames.at(-1)!.equation].id).toBe("answer");
  });
  it("renders all equation and product notation without KaTeX errors", () => {
    const expressions = [
      ...equations.map((e) => e.expression),
      ...products.flatMap((p) => [p.left, p.right, p.result]),
    ];
    for (const expression of expressions)
      expect(() =>
        katex.renderToString(toTex(expression), {
          throwOnError: true,
          trust: false,
        }),
      ).not.toThrow();
  });
});
