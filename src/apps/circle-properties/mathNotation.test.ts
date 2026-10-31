import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MathText, { MathArc, MathFraction, MathSvgText } from "./MathText";
import { parseNotation } from "./mathNotation";
import styles from "./math-text.module.css";

describe("circle mathematical notation", () => {
  it("parses the arc ratio in a mission without swallowing the instruction", () => {
    expect(
      parseNotation("Arc AB ÷ arc CD = 2. Inspect the chord ratio."),
    ).toEqual([
      { kind: "fraction", numerator: "Arc AB", denominator: "arc CD" },
      { kind: "text", text: " = 2. Inspect the chord ratio." },
    ]);
  });

  it("accepts explicit fraction notation and preserves numerator grouping", () => {
    expect(parseNotation("\\frac{arc AB}{arc CD} = (10 + 8) ÷ 2")).toEqual([
      { kind: "fraction", numerator: "arc AB", denominator: "arc CD" },
      { kind: "text", text: " = " },
      { kind: "fraction", numerator: "(10 + 8)", denominator: "2" },
    ]);
  });

  it("stacks named-quantity colon ratios on both sides of the circle proportion", () => {
    expect(parseNotation("Arc AB : arc CD = θ : φ.")).toEqual([
      { kind: "fraction", numerator: "Arc AB", denominator: "arc CD" },
      { kind: "text", text: " = " },
      { kind: "fraction", numerator: "θ", denominator: "φ" },
      { kind: "text", text: "." },
    ]);
    const html = renderToStaticMarkup(
      createElement(MathText, null, "Arc AB : arc CD = θ : φ"),
    );
    expect(html.match(/data-math-fraction=/g)).toHaveLength(2);
    expect(html).toContain('aria-label="θ divided by φ"');
  });

  it("preserves numeric times/scores and ordinary colons", () => {
    for (const text of [
      "Lesson at 10:30",
      "Score 2 : 1",
      "Reason 16.1: ON ⊥ AB",
      "AB: 7 cm",
      "Given: AB = CD",
    ])
      expect(parseNotation(text)).toEqual([{ kind: "text", text }]);
  });

  it("includes minor/major qualifiers inside an arc fraction rather than losing the ratio", () => {
    for (const operator of [":", "÷", "/"])
      expect(
        parseNotation(`Minor arc AB ${operator} minor arc CD = 2`),
      ).toEqual([
        {
          kind: "fraction",
          numerator: "Minor arc AB",
          denominator: "minor arc CD",
        },
        { kind: "text", text: " = 2" },
      ]);
    const html = renderToStaticMarkup(
      createElement(MathText, null, "Major arc AB : major arc CD = 2 : 1"),
    );
    expect(html.match(/data-math-fraction=/g)).toHaveLength(1);
    expect(html.match(/data-math-arc=/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Major arc AB divided by major arc CD"');
    expect(html).toContain(" = 2 : 1");
  });

  it("formats degree calculations, slash fractions and two sides of a proportion", () => {
    expect(
      parseNotation("θ / 360° = 250° ÷ 2").filter(
        (part) => part.kind === "fraction",
      ),
    ).toEqual([
      { kind: "fraction", numerator: "θ", denominator: "360°" },
      { kind: "fraction", numerator: "250°", denominator: "2" },
    ]);
    expect(parseNotation("first arc length ÷ second arc length")).toEqual([
      {
        kind: "fraction",
        numerator: "first arc length",
        denominator: "second arc length",
      },
    ]);
  });

  it("keeps minor/major descriptions while marking both named arcs", () => {
    expect(parseNotation("Minor arc AB = minor arc CD")).toEqual([
      { kind: "text", text: "Minor " },
      { kind: "arc", name: "AB" },
      { kind: "text", text: " = minor " },
      { kind: "arc", name: "CD" },
    ]);
    expect(parseNotation("The arcs AB and CD are equal.")).toEqual([
      { kind: "text", text: "The " },
      { kind: "arc", name: "AB" },
      { kind: "text", text: " and " },
      { kind: "arc", name: "CD" },
      { kind: "text", text: " are equal." },
    ]);
  });

  it("does not turn prose or interface separators into notation", () => {
    for (const text of [
      "Support / Core / Stretch",
      "Teacher / study guide",
      "The arc and chord lengths change.",
      "An arc ABCD is not a supported endpoint name.",
    ])
      expect(parseNotation(text)).toEqual([{ kind: "text", text }]);
  });

  it("renders semantic fractions with two curved arc signs and no division glyph", () => {
    const html = renderToStaticMarkup(
      createElement(MathText, null, "Arc AB ÷ arc CD = 2"),
    );
    expect(html).toContain('aria-label="Arc AB divided by arc CD"');
    expect(html.match(/data-math-arc=/g)).toHaveLength(2);
    expect(html.match(/<path /g)).toHaveLength(2);
    expect(html).toContain('data-math-fraction="true"');
    expect(html).not.toContain("÷");
    expect(html).toContain(" = 2");
  });

  it("offers explicit reusable fraction and arc components", () => {
    const fraction = renderToStaticMarkup(
      createElement(MathFraction, { numerator: "AB", denominator: "CD" }),
    );
    expect(fraction).toContain('aria-label="AB divided by CD"');
    expect(fraction.match(/<var /g)).toHaveLength(2);
    const arc = renderToStaticMarkup(createElement(MathArc, null, "ABC"));
    expect(arc).toContain('data-math-arc="ABC"');
    expect(arc).toContain('preserveAspectRatio="none"');
  });

  it("keeps numbers/operators/units upright and prose articles unitalicised", () => {
    const prose = renderToStaticMarkup(
      createElement(MathText, null, "A perpendicular from O gives AB = 10 cm."),
    );
    expect(prose).toMatch(/^A perpendicular from /);
    expect(prose.match(/<var /g)).toHaveLength(2);
    expect(prose).toContain(" = 10 cm.");
  });

  it("adds visual space at prose boundaries while keeping one copyable, breakable space", () => {
    const text = "O is the centre. AN = NB and ℓ is perpendicular.";
    const html = renderToStaticMarkup(createElement(MathText, null, text));
    for (const symbol of ["O", "NB", "ℓ"])
      expect(html).toContain(`class="${styles.beforeProse}">${symbol}</var> `);
    expect(html.replace(/<[^>]+>/g, "")).toBe(text);
    const arc = renderToStaticMarkup(
      createElement(MathText, null, "Arc AB subtends θ."),
    );
    expect(arc).toContain(`class="${styles.arc} ${styles.beforeProse}"`);
    expect(arc).toContain("</span> subtends ");
  });

  it("keeps equations, units, punctuation, stacked fractions and SVG labels compact", () => {
    for (const text of [
      "AB = CD.",
      "x cm",
      "AB, CD",
      "2r sin(θ/2)",
      "Arc AB : arc CD",
      "ℓ ⊥ AB",
    ])
      expect(
        renderToStaticMarkup(createElement(MathText, null, text)),
      ).not.toContain(styles.beforeProse);
    expect(
      renderToStaticMarkup(createElement(MathSvgText, null, "O is the centre")),
    ).not.toContain(styles.beforeProse);
  });

  it("keeps SVG notation valid, centres native text and preserves explicit spacing", () => {
    const svg = renderToStaticMarkup(
      createElement(
        MathSvgText,
        {
          x: 200,
          y: 250,
          textAnchor: "middle",
        },
        "Arc AB = 7 cm",
      ),
    );
    expect(svg).toContain('text-anchor="middle"');
    expect(svg).toContain('xml:space="preserve"');
    expect(svg).toContain('data-math-arc="AB"');
    expect(svg).toContain(" = 7 cm");
    expect(svg).not.toMatch(/<(?:span|var)\b/);
    expect(svg).toContain('data-arc-decoration="true"');
    const fallback = renderToStaticMarkup(
      createElement(
        "text",
        null,
        createElement(MathText, { svg: true }, "arc CD"),
      ),
    );
    expect(fallback).toContain("C͡D");
  });
});
