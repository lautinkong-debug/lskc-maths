import { test, expect, type Page } from "@playwright/test";

test.describe("touch interaction", () => {
  test.use({ hasTouch: true });
  test("a touch plots the snapped numerical coordinate", async ({ page }) => {
    await practice(page, "polygon", 3);
    await page.locator("[data-plot-surface]").scrollIntoViewIfNeeded();
    const box = await page.locator("[data-plot-surface]").boundingBox();
    await page.touchscreen.tap(
      box!.x + box!.width / 2,
      box!.y + box!.height / 2,
    );
    await expect(
      page.getByLabel("Horizontal coordinate 1", { exact: true }),
    ).toHaveValue("29.5");
    await expect(
      page.getByLabel("Vertical coordinate 1", { exact: true }),
    ).toHaveValue("5");
  });
});
const types = [
  "histogram",
  "polygon",
  "curve",
  "cumulativePolygon",
  "cumulativeCurve",
] as const;
const points = {
  histogram: [
    [9.5, 3, 19.5],
    [19.5, 7, 29.5],
    [29.5, 5, 39.5],
    [39.5, 5, 49.5],
  ],
  polygon: [
    [4.5, 0],
    [14.5, 3],
    [24.5, 7],
    [34.5, 5],
    [44.5, 5],
    [54.5, 0],
  ],
  curve: [
    [4.5, 0],
    [14.5, 3],
    [24.5, 7],
    [34.5, 5],
    [44.5, 5],
    [54.5, 0],
  ],
  cumulativePolygon: [
    [9.5, 0],
    [19.5, 3],
    [29.5, 10],
    [39.5, 15],
    [49.5, 20],
  ],
  cumulativeCurve: [
    [9.5, 0],
    [19.5, 3],
    [29.5, 10],
    [39.5, 15],
    [49.5, 20],
  ],
};
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
});
async function practice(page: Page, type: string, level: number) {
  await page
    .getByRole("button", { name: "04 · Practice Mode", exact: true })
    .click();
  await page.getByLabel("Activity chart", { exact: true }).selectOption(type);
  await page
    .getByLabel("Practice level", { exact: true })
    .selectOption(String(level));
}
test("guided calculation gives specific feedback, worked correction and fresh retry", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await practice(page, "polygon", 1);
  await expect(
    page.getByRole("button", { name: "Show Answer", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Your answer", { exact: true }).fill("10");
  await page.getByRole("button", { name: "Check Answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("midpoint");
  await page.getByRole("button", { name: "Show Answer", exact: true }).click();
  await expect(page.getByRole("math")).toHaveAttribute("aria-label", /14.5/);
  await page.getByLabel("Your answer", { exact: true }).fill("14.5");
  await page.getByLabel("Your answer", { exact: true }).press("Enter");
  await expect(page.getByRole("status")).toContainText("Correct —");
  await page
    .getByRole("button", { name: "Try the next class", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue("");
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByLabel("Calculation type").selectOption("cumulative");
  await page.getByLabel("Your answer", { exact: true }).fill("7");
  await page.getByRole("button", { name: "Check Answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("adds all frequencies");
  expect(errors).toEqual([]);
});
test("all five tutorials reveal progressively and finish with the correct construction", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "03 · Step-by-Step Learning", exact: true })
    .click();
  for (const type of types) {
    await page.getByLabel("Activity chart").selectOption(type);
    await page.getByRole("button", { name: "Restart", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Prepare the data", exact: true }),
    ).toBeVisible();
    for (
      let i = 0;
      i < 5 &&
      !(await page
        .getByRole("heading", { name: "Plot the data", exact: true })
        .count());
      i++
    )
      await page
        .getByRole("button", { name: "Next Step", exact: true })
        .click();
    await expect(
      page.locator("[data-construction-point],[data-construction-bar]"),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: type === "histogram" ? "Reveal next bar" : "Reveal next point",
        exact: true,
      })
      .click();
    await expect(
      page.locator("[data-construction-point],[data-construction-bar]"),
    ).toHaveCount(1);
    for (
      let i = 0;
      i < 4 &&
      !(await page
        .getByRole("heading", { name: "Complete the chart", exact: true })
        .count());
      i++
    )
      await page
        .getByRole("button", { name: "Next Step", exact: true })
        .click();
    await expect(
      page.getByText("Construction complete", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("[data-construction-point],[data-construction-bar]"),
    ).toHaveCount(points[type].length);
    if (type !== "histogram")
      await expect(
        page
          .locator(
            `[data-construction-line="${type === "curve" || type === "cumulativeCurve" ? "smooth" : "straight"}"]`,
          )
          .first(),
      ).toBeVisible();
    await page
      .getByRole("button", { name: "Previous Step", exact: true })
      .click();
    await expect(
      page.getByText("Construction complete", { exact: true }),
    ).toHaveCount(0);
  }
});
for (const type of types) {
  test(`independent ${type} grades actual coordinates and join style`, async ({
    page,
  }) => {
    await practice(page, type, 3);
    await expect(
      page.getByRole("button", {
        name: "Reveal correct solution",
        exact: true,
      }),
    ).toBeDisabled();
    for (let i = 0; i < points[type].length; i++) {
      const [x, y, end] = points[type][i];
      if (type === "histogram")
        await page
          .getByLabel("Class for the next rectangle")
          .selectOption(String(i));
      await page
        .getByRole("button", {
          name: type === "histogram" ? "Add rectangle" : "Add point",
          exact: true,
        })
        .click();
      await page
        .getByLabel(
          `${type === "histogram" ? "Lower boundary" : "Horizontal coordinate"} ${i + 1}`,
          { exact: true },
        )
        .fill(String(x));
      if (type === "histogram")
        await page
          .getByLabel(`Upper boundary ${i + 1}`, { exact: true })
          .fill(String(end));
      await page
        .getByLabel(`Vertical coordinate ${i + 1}`, { exact: true })
        .fill(String(y));
    }
    if (type !== "histogram") {
      await page
        .getByRole("button", { name: "Check construction", exact: true })
        .click();
      await expect(page.getByRole("status")).toContainText(
        type === "curve" || type === "cumulativeCurve"
          ? "Choose Smooth"
          : "Choose Straight",
      );
      await page
        .getByLabel("Join style")
        .selectOption(
          type === "curve" || type === "cumulativeCurve"
            ? "smooth"
            : "straight",
        );
    }
    await page
      .getByRole("button", { name: "Check construction", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Correct —");
    await page.getByLabel("Vertical coordinate 2", { exact: true }).fill("1");
    await page
      .getByRole("button", { name: "Check construction", exact: true })
      .click();
    await expect(page.getByRole("status")).not.toContainText("Correct —");
    await page
      .getByRole("button", { name: "Reveal correct solution", exact: true })
      .click();
    await expect(
      page.getByRole("group", { name: "Model answer", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Retry this construction", exact: true })
      .click();
    await expect(
      page.locator("[data-construction-point],[data-construction-bar]"),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "Reveal correct solution",
        exact: true,
      }),
    ).toBeDisabled();
  });
}
test("partial histogram retains given rectangles and accepts the missing heights", async ({
  page,
}) => {
  await practice(page, "histogram", 2);
  await expect(page.locator("[data-construction-bar]")).toHaveCount(2);
  await expect(
    page.getByLabel("Vertical coordinate 1", { exact: true }),
  ).toBeDisabled();
  for (const [classIndex, height, item] of [
    [1, 7, 3],
    [3, 5, 4],
  ]) {
    await page
      .getByLabel("Class for the next rectangle")
      .selectOption(String(classIndex));
    await page
      .getByRole("button", { name: "Add rectangle", exact: true })
      .click();
    await expect(
      page.getByLabel(`Lower boundary ${item}`, { exact: true }),
    ).toBeDisabled();
    await page
      .getByLabel(`Vertical coordinate ${item}`, { exact: true })
      .fill(String(height));
  }
  await page
    .getByRole("button", { name: "Check construction", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Correct —");
});
test("pointer and keyboard plotting, selection, deletion and data reset", async ({
  page,
}) => {
  await practice(page, "polygon", 3);
  const surface = page.locator("[data-plot-surface]");
  await surface.click({ position: { x: 100, y: 100 } });
  await expect(page.locator("[data-construction-point]")).toHaveCount(1);
  await surface.focus();
  await surface.press("ArrowRight");
  await surface.press("ArrowUp");
  await surface.press("Enter");
  await expect(page.locator("[data-construction-point]")).toHaveCount(2);
  await page.getByRole("button", { name: "Edit item 1", exact: true }).click();
  await expect(page.locator('fieldset[data-active="true"]')).toHaveCount(1);
  await page
    .getByRole("button", { name: "Remove item 1", exact: true })
    .click();
  await expect(page.locator("[data-construction-point]")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Back to the lab", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Class interval 1", exact: true })
    .getByLabel("Frequency", { exact: true })
    .fill("4");
  await practice(page, "polygon", 3);
  await expect(page.locator("[data-construction-point]")).toHaveCount(0);
  await expect(page.getByTestId("lab-total")).toHaveText("21");
});
for (const [name, width, height] of [
  ["phone", 360, 800],
  ["tablet", 820, 1180],
  ["desktop", 1440, 1000],
] as const) {
  test(`Phase 2 ${name} layout and solution render`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await practice(page, "cumulativeCurve", 2);
    await page
      .getByRole("button", { name: "Check construction", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Reveal correct solution", exact: true })
      .click();
    await expect(
      page.getByRole("group", { name: "Model answer", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/statistical-phase2-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  });
}
