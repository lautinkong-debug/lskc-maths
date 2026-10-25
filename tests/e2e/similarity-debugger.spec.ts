import { expect, test } from "@playwright/test";

for (const { id, steps } of [
  { id: "rev8-33", steps: [0, 4, 12] },
  { id: "rev8-38", steps: [3, 9] },
  { id: "ex8c-19", steps: [25] },
]) {
  test(`short portrait keeps the whole current ${id} statement and reason in view`, async ({
    page,
  }) => {
    let delayedFonts = 0;
    if (id === "rev8-33")
      await page.route(/KaTeX.*\.woff2$/, async (route) => {
        delayedFonts++;
        // Reproduce the first equation growing after its initial layout.
        await new Promise((resolve) => setTimeout(resolve, 700));
        await route.continue();
      });
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(`/apps/similarity#${id}`);
    await page.evaluate(() => document.fonts.ready);
    const proof = page.getByTestId("diagram-reasons");
    const next = proof.getByRole("button", { name: "Next step", exact: true });
    for (let index = 0; index <= steps.at(-1)!; index++) {
      await next.click();
      if (!steps.includes(index)) continue;
      await page.evaluate(() => document.fonts.ready);
      const row = proof.locator(`tr[data-step-index="${index}"]`);
      await expect(proof.locator("tbody tr:visible")).toHaveCount(1);
      await expect
        .poll(
          () =>
            row.evaluate((element) => {
              const viewport = element.closest("table")!.parentElement!;
              const body = viewport.getBoundingClientRect();
              const current = element.getBoundingClientRect();
              return Math.max(
                body.top - current.top,
                current.bottom - body.bottom,
              );
            }),
          {
            message: `${id} step ${index + 1} must not be clipped`,
            timeout: 3000,
          },
        )
        .toBeLessThanOrEqual(1);
      const controls = await next.boundingBox();
      expect(controls!.y + controls!.height).toBeLessThanOrEqual(640);
    }
    if (id === "rev8-33") expect(delayedFonts).toBeGreaterThan(0);
  });
}
