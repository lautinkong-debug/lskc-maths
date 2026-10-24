import { describe, expect, it } from "vitest";
import { equivalent, expressionTex } from "../../src/apps/polynomials/algebra";
import katex from "katex";

describe("exact textbook algebra validation", () => {
  it("checks multivariable fractions and preserves division order", () => {
    expect(equivalent("30*m^4/(4*m^3*n^5)/(-5*m*n^2)", "-3/(2*n^7)")).toBe(
      true,
    );
    expect(equivalent("8*x*y^2/(7*x^5*y^2/(14*x^3*y^4))", "16*y^4/x")).toBe(
      true,
    );
    expect(equivalent("a*b^2", "a^2*b")).toBe(false);
    expect(equivalent("1/(x+1)", "1/x+1")).toBe(false);
  });
  it("evaluates exact fractions and powers before unary minus", () => {
    expect(
      equivalent(
        "2*(-2/3)^2*(1/2)-(1/4)*(-2/3)^2*(1/2)^2+5*(-2/3)*(1/2)^2",
        "-5/12",
      ),
    ).toBe(true);
    expect(equivalent("-x^2", "(-x)^2")).toBe(false);
    expect(equivalent("a^(4+1)*b^3", "a^5*b^3")).toBe(true);
    expect(
      equivalent(
        "(2-3*p*x)*(4*x^4+5*x^3-x)",
        "-12*p*x^5+(8-15*p)*x^4+10*x^3+3*p*x^2-2*x",
      ),
    ).toBe(true);
  });
  it("renders the authored grouping and rejects unsupported input", () => {
    expect(expressionTex("(3*x+4)^2")).toContain("^{2}");
    for (const s of [
      "30*m^4/(4*m^3*n^5)/(-5*m*n^2)",
      "2*x^2-(3*x+4)^2",
      "a^(4+1)*b^3",
    ])
      expect(() =>
        katex.renderToString(expressionTex(s), { throwOnError: true }),
      ).not.toThrow();
    expect(() => expressionTex("x=2")).toThrow();
  });
});
