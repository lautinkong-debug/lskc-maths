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

test("the mid-point is given in 16.2; the centre is concluded in 16.3", async ({
  page,
}) => {
  await page.goto("/apps/circle-properties");
  const activity = await openExperiment(page);
  const choose = activity.getByRole("combobox");
  await choose.selectOption("midpoint");
  const diagram = activity.getByTestId("midpoint-chord-diagram");
  await expect(diagram.locator("[data-right-angle]")).toHaveCount(0);
  await activity
    .getByRole("button", { name: "Put N at the mid-point" })
    .click();
  await expect(
    diagram.locator('[data-role="given"] [data-equal-half]'),
  ).toHaveCount(2);
  await expect(
    diagram.locator('[data-right-angle="conclusion"]'),
  ).toBeVisible();
  await expect(activity.getByRole("complementary")).toContainText(
    /ON\s*⊥\s*AB/,
  );
  await activity.getByRole("slider").press("ArrowLeft");
  await expect(diagram.locator("[data-right-angle]")).toHaveCount(0);
  await choose.selectOption("centre");
  const centre = activity.getByTestId("hidden-centre-construction");
  await expect(centre.locator('[data-given="equal-half"]')).toHaveCount(2);
  await expect(centre.locator('[data-given="right-angle"]')).toHaveCount(1);
  const rhs = activity.locator('[data-evidence-for="r3"]');
  await expect(rhs.locator('[data-proof-stage="reason"]')).toHaveCount(0);
  await activity.getByRole("button", { name: "Show where O must lie" }).click();
  await expect(centre.locator('[data-result="locus"]')).toBeVisible();
  await expect(centre.locator('[data-result="centre"]')).toHaveCount(0);
  await expect(rhs).toContainText("One line does not locate the exact point");
  await activity
    .getByRole("checkbox", { name: "Second perpendicular bisector" })
    .check();
  await expect(centre.locator('[data-given="right-angle"]')).toHaveCount(2);
  await activity
    .getByRole("button", { name: "Reveal O and the reason" })
    .click();
  await expect(centre.locator('[data-result="centre"]')).toBeVisible();
  await expect(rhs).toContainText("Their unique intersection is the centre");
  await expect(rhs).toContainText("Reason 16.3");
});

test("equal centre angles imply equal lengths only in equal circles", async ({
  page,
}) => {
  await page.goto("/apps/circle-properties");
  const activity = await openExperiment(page);
  await activity.getByRole("combobox").selectOption("radii");
  await activity.getByRole("button", { name: /reveal lengths/i }).click();
  const rhs = activity.getByRole("complementary", { name: /comparing arcs/ });
  await expect(rhs).toContainText("different radii");
  await expect(activity.locator("[data-result]")).toHaveCount(0);
  await activity.getByRole("button", { name: "Make the radii equal" }).click();
  await expect(rhs).toContainText("16.10");
  await expect(rhs).toContainText("16.12");
  await expect(activity.locator('[data-result="equal-chords"]')).toHaveCount(2);
  await expect(activity.locator('[data-result="equal-arcs"]')).toHaveCount(2);
  await activity
    .getByRole("slider", { name: "Second circle radius" })
    .press("ArrowLeft");
  await expect(activity.locator("[data-result]")).toHaveCount(0);
});

test("moving a vertex to the opposite segment removes the inapplicable reason", async ({ page }) => {
  await page.goto("/apps/circle-properties");
  const topics = page.locator('button[aria-controls="circle-property-menu"]');
  await expect(page.getByTestId("paper-circle")).toBeVisible();
  if (await topics.isVisible()) await topics.click();
  await page.getByRole("button", { name: "Angles in the same segment", exact: true }).click();
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  await page.locator("summary", { hasText: "More to try" }).click();
  await page.getByRole("button", { name: /What if Q crosses chord/ }).click();
  const evidence = page.locator('[data-evidence-for="r7"]');
  const board = page.getByRole("region").filter({ has: page.getByRole("button", { name: "Back to my circle" }) }).last();
  // A class may start with the vertices on either side.
  const restore = page.getByRole("button", { name: "Move Q back to P's side" });
  if (await restore.isVisible()) await restore.click();
  await evidence.getByRole("button", { name: "Reveal the conclusion" }).click();
  await expect(evidence).toContainText("Reason 16.7");
  await board.getByRole("button", { name: "Move Q to the opposite side" }).click();
  await expect(evidence).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "Check the condition" })).toContainText("opposite sides");
  await page.getByRole("button", { name: "Compare this topic’s reasons" }).click();
  await expect(page.getByRole("region", { name: "See how each reason works" })).toBeVisible();
});

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
