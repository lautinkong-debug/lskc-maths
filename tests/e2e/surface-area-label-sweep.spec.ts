import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { questions } from "../../src/apps/surface-area/bank";

mkdirSync("out/surface-area-release", { recursive: true });

test("every prism keeps dimension text inside the teaching canvas", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const findings: unknown[] = [];
  let views = 0;
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 1080 });
    for (const question of questions)
      for (const variant of question.variants) {
        if (variant.geometry.kind !== "prism") continue;
        await page.goto(`/apps/surface-area#${question.id}/${variant.id}`);
        const lesson = page.getByTestId("surface-area-lesson");
        await expect(lesson).toHaveAttribute("data-preset", question.id);
        const steps = lesson.getByRole("navigation").getByRole("button");
        for (const [stage, progress] of [
          [0, 0],
          [2, 0],
          [2, 50],
          [2, 100],
          [3, 100],
          [4, 100],
        ]) {
          await steps.nth(stage).click();
          await expect(steps.nth(stage)).toHaveAttribute(
            "aria-current",
            "step",
          );
          if (stage === 2) {
            await expect(lesson.locator("#surface-unfold")).toBeEnabled();
            await lesson.locator("#surface-unfold").fill(String(progress));
          }
          const defects = await lesson
            .getByTestId("surface-diagram")
            .first()
            .evaluate((node) => {
              const svg = node as SVGSVGElement;
              const frame = svg.viewBox.baseVal;
              const inSvg = (element: SVGGraphicsElement) => {
                const box = element.getBBox(),
                  root = svg.getScreenCTM()!,
                  current = element.getScreenCTM()!;
                const transform = root.inverse().multiply(current);
                const corners = [
                  new DOMPoint(box.x, box.y),
                  new DOMPoint(box.x + box.width, box.y),
                  new DOMPoint(box.x, box.y + box.height),
                  new DOMPoint(box.x + box.width, box.y + box.height),
                ].map((point) => point.matrixTransform(transform));
                const xs = corners.map((p) => p.x),
                  ys = corners.map((p) => p.y);
                return {
                  x: Math.min(...xs),
                  y: Math.min(...ys),
                  width: Math.max(...xs) - Math.min(...xs),
                  height: Math.max(...ys) - Math.min(...ys),
                };
              };
              const texts = [
                ...svg.querySelectorAll<SVGTextElement>("text"),
              ].filter((t) => t.textContent?.trim());
              const outside = texts
                .filter((t) => {
                  const b = inSvg(t);
                  return (
                    b.x < -1 ||
                    b.y < -1 ||
                    b.x + b.width > frame.width + 1 ||
                    b.y + b.height > frame.height + 1
                  );
                })
                .map((t) => t.textContent);
              const labels = [
                ...svg.querySelectorAll<SVGTextElement>(
                  "[data-dimension-label] text",
                ),
              ];
              const clashes = labels.flatMap((label) =>
                texts
                  .filter((other) => {
                    if (other === label) return false;
                    const a = inSvg(label),
                      b = inSvg(other);
                    return (
                      Math.min(a.x + a.width, b.x + b.width) -
                        Math.max(a.x, b.x) >
                        2 &&
                      Math.min(a.y + a.height, b.y + b.height) -
                        Math.max(a.y, b.y) >
                        2
                    );
                  })
                  .map((other) => [label.textContent, other.textContent]),
              );
              const flatFaces = [
                ...svg.querySelectorAll<SVGPolygonElement>(
                  '[data-unfold="1"] [data-face] polygon',
                ),
              ];
              const flatBottom = Math.max(
                ...flatFaces.map((face) => {
                  const b = inSvg(face);
                  return b.y + b.height;
                }),
              );
              const aboveFlatStrip = flatFaces.length
                ? labels
                    .filter((label) => inSvg(label).y < flatBottom - 1)
                    .map((label) => label.textContent)
                : [];
              return { outside, clashes, aboveFlatStrip };
            });
          views++;
          if (
            defects.outside.length ||
            defects.clashes.length ||
            defects.aboveFlatStrip.length
          )
            findings.push({
              question: question.id,
              variant: variant.id,
              width,
              stage,
              progress,
              ...defects,
            });
        }
      }
  }
  writeFileSync(
    "out/surface-area-release/label-sweep.json",
    JSON.stringify({ views, findings }, null, 2),
  );
  expect(findings).toEqual([]);
});
