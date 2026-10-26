import { expect, test } from "@playwright/test";

const printedFractions = [
  "2C-5a",
  "2C-5b",
  "2C-6a",
  "2C-12a",
  "2C-12b",
  "2C-16b",
  "2C-27a",
  "2C-31b",
  "2C-32a",
  "2C-32b",
  "2C-33a",
  "2C-33b",
  "R2-13b",
  "R2-14b",
  "R2-19b",
  "R2-26b",
  "R2-27a",
  "R2-27b",
  "R2-32b",
  "R2-33a",
  "R2-33b",
  "R2-36a",
  "R2-36b",
  "R2-37a",
  "R2-37b",
];

test("all 25 printed fractions have a horizontal line, with original divide signs retained", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1600, height: 1000 });
  for (const id of printedFractions) {
    await page.goto(`/apps/directed-numbers#textbook:e=${id}`);
    const original = page.locator("[data-equation-line]").first();
    await expect(
      original.locator(".katex-html .frac-line:visible").first(),
      id,
    ).toBeVisible();
    await expect(original.locator(".katex-html").last(), id).not.toContainText(
      "÷",
    );
    await expect(page.locator(".katex-error"), id).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      id,
    ).toBe(true);
  }
  await page.goto("/apps/directed-numbers#textbook:e=R2-38a");
  await expect(
    page.locator("[data-equation-line]").first().locator(".katex-html").last(),
  ).toContainText("÷");
  await expect(
    page.locator("[data-equation-line]").first().locator(".frac-line"),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
]) {
  test(`fraction lines survive highlights, sign-first reveals and optional-step hiding at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const id of ["2C-5a", "R2-37b"]) {
      await page.goto(`/apps/directed-numbers#textbook:e=${id}`);
      const projection = page.getByRole("button", {
        name: "Projection mode",
        exact: true,
      });
      if (viewport.width === 1920 && (await projection.isVisible()))
        await projection.click();
      await page
        .getByRole("button", {
          name: "Hide optional written steps",
          exact: true,
        })
        .click();
      const next = page.getByRole("button", { name: "Next step", exact: true });
      await expect(next).toBeEnabled();
      const original = page.locator("[data-equation-line]").first();
      await expect(
        original.locator(".frac-line:visible").first(),
      ).toBeVisible();
      let count = 0;
      while (await next.isEnabled()) {
        await next.click();
        expect(++count).toBeLessThan(50);
        await expect(page.locator(".katex-error")).toHaveCount(0);
        await expect(
          original.locator(".frac-line:visible").first(),
        ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        if (count === 1 && id === "R2-37b") {
          await expect(
            original.locator('[data-arrows-positioned="true"]'),
          ).toHaveCount(1);
          const boxes = await original
            .locator("[data-arrow-group]")
            .evaluateAll((groups) =>
              groups.map((group) => {
                const box = group.getBoundingClientRect();
                return {
                  left: box.left,
                  right: box.right,
                  top: box.top,
                  bottom: box.bottom,
                };
              }),
            );
          for (let a = 0; a < boxes.length; a++)
            for (let b = a + 1; b < boxes.length; b++) {
              const overlap =
                Math.min(boxes[a].right, boxes[b].right) >
                  Math.max(boxes[a].left, boxes[b].left) &&
                Math.min(boxes[a].bottom, boxes[b].bottom) >
                  Math.max(boxes[a].top, boxes[b].top);
              expect(overlap, `sign arrow groups ${a} and ${b}`).toBe(false);
            }
        }
        if (count === 1)
          await page.screenshot({
            path: testInfo.outputPath(`${id}-signs.png`),
            animations: "disabled",
          });
      }
      await expect(
        page.getByText("Demonstration complete", { exact: true }),
      ).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(`${id}-complete.png`),
        fullPage: true,
        animations: "disabled",
      });
      await page
        .getByRole("button", {
          name: "Show optional written steps",
          exact: true,
        })
        .click();
      await expect(
        page.getByText("Demonstration complete", { exact: true }),
      ).toBeVisible();
      await expect(page.locator(".katex-error")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
}
