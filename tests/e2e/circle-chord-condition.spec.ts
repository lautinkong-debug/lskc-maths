import { expect, test, type Page } from "@playwright/test";

async function openExperiment(page: Page) {
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  await page.locator("summary", { hasText: "More to try" }).click();
  await page
    .getByRole("button", { name: /What if the perpendicular misses/ })
    .click();
  const activity = page.getByRole("region", {
    name: "Change one condition",
    exact: true,
  });
  await expect(
    activity.getByRole("combobox", { name: "Condition experiment" }),
  ).toHaveValue("perpendicular");
  return activity;
}

for (const [device, viewport] of [
  ["desktop", { width: 1366, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test.describe(device, () => {
    test.use({
      viewport,
      isMobile: device === "phone",
      hasTouch: device === "phone",
    });
    for (const route of [
      "/apps/circle-properties",
      "/apps/circle-properties/classroom",
    ]) {
      test(`16.1 marks equal chord halves only through the centre at ${route}`, async ({
        page,
      }) => {
        await page.goto(route);
        const activity = await openExperiment(page);
        const diagram = activity.getByTestId("perpendicular-chord-diagram");
        const reason = activity.getByRole("complementary", {
          name: "Reason for the chord halves",
        });
        const slider = activity.getByRole("slider", {
          name: "Foot of perpendicular line",
        });
        const centre = activity.getByRole("button", {
          name: /Put the perpendicular through O/,
        });
        await expect(
          reason.getByRole("heading", { name: "Reason 16.1" }),
        ).toBeVisible();
        await expect(reason).toHaveAttribute("data-through-centre", "false");
        await expect(reason).toContainText(/AN\s*≠\s*NB/);
        await expect(diagram.locator("[data-equal-half]")).toHaveCount(0);
        await centre.click();
        await expect(slider).toHaveValue("0");
        await expect(reason).toHaveAttribute("data-through-centre", "true");
        await expect(reason).toContainText(/AN\s*=\s*NB/);
        await expect(reason).toContainText(
          /line from centre\s*⊥\s*chord bisects chord/i,
        );
        for (const half of ["AN", "NB"])
          await expect(
            diagram.locator(`[data-equal-half="${half}"]`),
          ).toBeVisible();
        const tickX = await diagram
          .locator("[data-equal-half]")
          .evaluateAll((ticks) =>
            ticks
              .map((tick) => {
                const b = (tick as SVGGraphicsElement).getBBox();
                return b.x + b.width / 2;
              })
              .sort((a, b) => a - b),
          );
        const circleX = await diagram
          .locator("circle")
          .first()
          .evaluate((circle) => (circle as SVGCircleElement).cx.baseVal.value);
        expect(tickX[0]).toBeLessThan(circleX);
        expect(tickX[1]).toBeGreaterThan(circleX);
        expect((tickX[0] + tickX[1]) / 2).toBeCloseTo(circleX, 3);
        const proofBox = (await reason.boundingBox())!;
        if (device === "phone") {
          const rangeBox = (await slider.boundingBox())!;
          expect(proofBox.y).toBeGreaterThanOrEqual(
            rangeBox.y + rangeBox.height - 1,
          );
        } else {
          const svgBox = (await diagram.boundingBox())!;
          expect(proofBox.x).toBeGreaterThanOrEqual(
            svgBox.x + svgBox.width - 1,
          );
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await page.reload();
        await openExperiment(page);
        await expect(slider).toHaveValue("0");
        await expect(reason).toHaveAttribute("data-through-centre", "true");
        await expect(diagram.locator("[data-equal-half]")).toHaveCount(2);
        await slider.press("ArrowRight");
        await expect(slider).toHaveValue("0.25");
        await expect(reason).toHaveAttribute("data-through-centre", "false");
        await expect(reason).toContainText(/AN\s*≠\s*NB/);
        await expect(diagram.locator("[data-equal-half]")).toHaveCount(0);
      });
    }
  });
}
