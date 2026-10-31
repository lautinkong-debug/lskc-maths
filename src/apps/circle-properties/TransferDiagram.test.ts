import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { reasons, reasonQuestions } from "./content";
import { questionFor } from "./practice";
import ReasonDiagram from "./ReasonDiagram";
import { CheckDiagram } from "./TransferCheck";
import { transferQuestion } from "./transfer";

describe("transfer diagrams preserve the direction of a converse", () => {
  for (const variant of [0, 1, 2]) {
    it(`does not locate the centre on the perpendicular bisector until r3 is reviewed, case ${variant + 1}`, () => {
      const q = transferQuestion("r3", variant);
      const before = renderToStaticMarkup(createElement(CheckDiagram, { q }));
      const after = renderToStaticMarkup(
        createElement(CheckDiagram, { q, reviewed: true }),
      );
      expect(before).toContain('stroke-dasharray="6 5"');
      expect(before).not.toContain('<circle cx="240" cy="180" r="3"');
      expect(after).toContain('<circle cx="240" cy="180" r="3"');
      expect(before).not.toMatch(/<text\b[^>]*x="240"[^>]*y="200"/);
      expect(after).toMatch(/<text\b[^>]*x="240"[^>]*y="200"/);
    });

    it(`does not mark AB as passing through O until r9 is reviewed, case ${variant + 1}`, () => {
      const q = transferQuestion("r9", variant);
      const before = renderToStaticMarkup(createElement(CheckDiagram, { q }));
      const after = renderToStaticMarkup(
        createElement(CheckDiagram, { q, reviewed: true }),
      );
      expect(before).toContain("90°");
      expect(before).toContain('aria-label="Right angle at P"');
      expect(before).not.toContain("A 126 126");
      expect(after).toContain("A 126 126");
      expect(before).not.toMatch(/<text\b[^>]*x="240"[^>]*y="163"/);
      expect(after).toMatch(/<text\b[^>]*x="240"[^>]*y="163"/);
    });

    it(`shows the diameter first and the right angle on review for r8, case ${variant + 1}`, () => {
      const q = transferQuestion("r8", variant);
      const before = renderToStaticMarkup(createElement(CheckDiagram, { q }));
      const after = renderToStaticMarkup(
        createElement(CheckDiagram, { q, reviewed: true }),
      );
      expect(before).toContain("A 126 126");
      expect(before).not.toContain('aria-label="Right angle at P"');
      expect(before).not.toContain("90°");
      expect(after).toContain('aria-label="Right angle at P"');
      expect(after).toContain("90°");
    });
  }

  it("keeps the centre visible when it belongs to the original givens", () => {
    for (const id of ["r1", "r2", "r8"]) {
      const html = renderToStaticMarkup(
        createElement(CheckDiagram, { q: transferQuestion(id) }),
      );
      expect(html).toMatch(/<tspan[^>]*>O<\/tspan>/);
    }
  });

  it("renders all 51 generated transfer diagrams with finite geometry", () => {
    for (const reason of reasons)
      for (const variant of [0, 1, 2]) {
        const q = transferQuestion(reason.id, variant);
        const html = renderToStaticMarkup(createElement(CheckDiagram, { q }));
        expect(html, q.id).not.toMatch(/NaN|Infinity|undefined/);
        expect(html, q.id).toContain('role="img"');
      }
  });
});

describe("reason relay diagrams show givens only", () => {
  it("does not show O for the two converse questions in any authored variant", () => {
    for (const questionId of ["q3", "q9"])
      for (const variant of [0, 1, 2]) {
        const question = questionFor({ questionId, variant });
        const html = renderToStaticMarkup(
          createElement(ReasonDiagram, { question }),
        );
        expect(html).not.toMatch(/<tspan[^>]*>O<\/tspan>/);
      }
  });

  it("renders all 69 authored relay diagrams without invalid coordinates or missing values", () => {
    for (const base of reasonQuestions)
      for (const variant of [0, 1, 2]) {
        const question = questionFor({ questionId: base.id, variant });
        const html = renderToStaticMarkup(
          createElement(ReasonDiagram, { question }),
        );
        expect(html, `${base.id}:${variant}`).not.toMatch(
          /NaN|Infinity|undefined/,
        );
      }
  });
});
