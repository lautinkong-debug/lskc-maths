import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolvePreset } from "../../src/apps/surface-area/bank";
import { faces } from "../../src/apps/surface-area/geometry";

const output = "out/surface-area-classroom-fix";
mkdirSync(output, { recursive: true });

test("face identifiers do not collide with measurement labels", async ({
  page,
}) => {
  for (const id of ["example-9-11", "revision-31", "mc-11"]) {
    await page.goto(`/apps/surface-area#${id}`);
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toHaveAttribute("data-preset", id);
    const collisions = await lesson
      .getByTestId("surface-diagram")
      .first()
      .evaluate((svg) => {
        const ids = [
          ...svg.querySelectorAll<SVGTextElement>("[data-face] text"),
        ];
        const dimensions = [
          ...svg.querySelectorAll<SVGTextElement>(
            "[data-dimension-label] text",
          ),
        ];
        return ids.flatMap((id) =>
          dimensions
            .filter((dimension) => {
              const a = id.getBBox(),
                b = dimension.getBBox();
              return (
                Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) >
                  1 &&
                Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) >
                  1
              );
            })
            .map((dimension) => `${id.textContent} / ${dimension.textContent}`),
        );
      });
    expect(collisions, id).toEqual([]);
  }
});

test("named textbook edges retain their vertex labels", async ({ page }) => {
  await page.goto("/apps/surface-area");
  const diagram = page.getByTestId("surface-diagram").first();
  for (const name of ["A", "B", "C", "D"])
    await expect(diagram.getByText(name, { exact: true })).toBeVisible();
});

test("turning off face identifiers preserves the selected dimension labels", async ({
  page,
}) => {
  await page.goto("/apps/surface-area#ex9b-24");
  const lesson = page.getByTestId("surface-area-lesson");
  await expect(lesson).toHaveAttribute("data-preset", "ex9b-24");
  await lesson.getByRole("navigation").getByRole("button").nth(3).click();
  const annotations = lesson.getByTestId("surface-annotations");
  await lesson.getByLabel("Face labels", { exact: true }).uncheck();
  const { variant } = resolvePreset("#ex9b-24");
  for (const label of new Set(
    faces(variant)
      .map((face) => face.label)
      .filter(Boolean),
  ))
    await expect(annotations).toContainText(label);
  await lesson.getByLabel("Dimensions", { exact: true }).uncheck();
  await expect(annotations).not.toContainText("17 cm");
  await expect(annotations).toContainText("rectangular notch is 13 cm wide");
});

for (const [width, height, presenting] of [
  [1366, 900, false],
  [1366, 768, true],
  [1920, 1080, true],
  [390, 844, false],
  [390, 844, true],
] as const) {
  test(`teacher can keep the cursor still at ${width}px${presenting ? " projection" : " normal"}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/apps/surface-area");
    const lesson = page.getByTestId("surface-area-lesson");
    await expect(lesson).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    if (presenting) {
      await page
        .getByRole("button", { name: "Projection mode", exact: true })
        .click();
      await expect(lesson).toHaveAttribute("data-presenting", "true");
    }
    const next = lesson.getByRole("button", { name: "Next step", exact: true });
    const previous = lesson.getByRole("button", {
      name: "Previous step",
      exact: true,
    });
    const steps = lesson.getByRole("navigation").getByRole("button");
    await next.scrollIntoViewIfNeeded();
    const origin = (await next.boundingBox())!;
    const x = origin.x + origin.width / 2;
    const y = origin.y + origin.height / 2;
    const assertStationary = async () => {
      const box = (await next.boundingBox())!;
      expect(Math.abs(box.x - origin.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(box.y - origin.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(box.width - origin.width)).toBeLessThanOrEqual(1);
      expect(Math.abs(box.height - origin.height)).toBeLessThanOrEqual(1);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(height);
    };
    for (let stage = 1; stage <= 4; stage++) {
      // A real stationary cursor: locator.click() would silently follow a
      // moving target and could never catch the reported classroom bug.
      await page.mouse.click(x, y);
      await expect(steps.nth(stage)).toHaveAttribute("aria-current", "step");
      await assertStationary();
    }
    const back = (await previous.boundingBox())!;
    for (let stage = 3; stage >= 0; stage--) {
      await page.mouse.click(back.x + back.width / 2, back.y + back.height / 2);
      await expect(steps.nth(stage)).toHaveAttribute("aria-current", "step");
      await assertStationary();
    }
    await page.screenshot({
      path: `${output}/stationary-${width}-${presenting ? "projection" : "normal"}.png`,
      fullPage: true,
    });
  });
}

test("diagram stays in place when changing stages and revealing working", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/apps/surface-area");
  const lesson = page.getByTestId("surface-area-lesson");
  await expect(lesson).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const next = lesson.getByRole("button", { name: "Next step", exact: true });
  const steps = lesson.getByRole("navigation").getByRole("button");
  const diagram = lesson.getByTestId("surface-diagram").first();
  await next.scrollIntoViewIfNeeded();
  const before = await diagram.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  });
  for (let stage = 1; stage <= 4; stage++) {
    await next.click();
    await expect(steps.nth(stage)).toHaveAttribute("aria-current", "step");
    const bounds = await diagram.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    });
    for (const key of ["x", "y", "width", "height"] as const)
      expect(
        Math.abs(bounds[key] - before[key]),
        `${key} changed at step ${stage + 1}`,
      ).toBeLessThanOrEqual(1);
    const nextBefore = (await next.boundingBox())!;
    await lesson
      .getByRole("button", { name: "Show working", exact: true })
      .click();
    const nextAfter = (await next.boundingBox())!;
    expect(Math.abs(nextAfter.y - nextBefore.y)).toBeLessThanOrEqual(1);
    await lesson
      .getByRole("button", { name: "Hide working", exact: true })
      .click();
  }
});

test("teaching labels remain inside the diagram across representative solids", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of [
      "example-9-11",
      "ex9b-24",
      "ex9b-27",
      "revision-27",
      "revision-31",
      "revision-33",
      "mc-11",
      "example-9-12",
    ]) {
      await page.goto(`/apps/surface-area#${id}`);
      const lesson = page.getByTestId("surface-area-lesson");
      await expect(lesson).toHaveAttribute("data-preset", id);
      const steps = lesson.getByRole("navigation").getByRole("button");
      for (const stage of [0, 2, 3, 4]) {
        await steps.nth(stage).click();
        if (stage === 2) await lesson.locator("#surface-unfold").fill("50");
        const outside = await lesson
          .getByTestId("surface-diagram")
          .first()
          .evaluate((svg) => {
            const bounds = (svg as SVGSVGElement).viewBox.baseVal;
            return [...svg.querySelectorAll("text")]
              .filter((node) => {
                if (
                  !node.textContent?.trim() ||
                  getComputedStyle(node).visibility === "hidden"
                )
                  return false;
                const local = node.getBBox();
                const matrix = (svg as SVGSVGElement)
                  .getScreenCTM()!
                  .inverse()
                  .multiply(node.getScreenCTM()!);
                const corners = [
                  new DOMPoint(local.x, local.y),
                  new DOMPoint(local.x + local.width, local.y),
                  new DOMPoint(local.x, local.y + local.height),
                  new DOMPoint(local.x + local.width, local.y + local.height),
                ].map((point) => point.matrixTransform(matrix));
                const xs = corners.map((point) => point.x),
                  ys = corners.map((point) => point.y);
                const box = {
                  x: Math.min(...xs),
                  y: Math.min(...ys),
                  width: Math.max(...xs) - Math.min(...xs),
                  height: Math.max(...ys) - Math.min(...ys),
                };
                return (
                  box.width > 0 &&
                  (box.x < bounds.x - 1 ||
                    box.y < bounds.y - 1 ||
                    box.x + box.width > bounds.x + bounds.width + 1 ||
                    box.y + box.height > bounds.y + bounds.height + 1)
                );
              })
              .map((node) => node.textContent);
          });
        expect(
          outside,
          `${id}, step ${stage + 1}, ${width}px: labels must not be clipped`,
        ).toEqual([]);
      }
    }
  }
});
