import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "08 · Animated walkthroughs", exact: true })
    .click();
});
test("all four histograms have their own polygons and animate independently", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Animated walkthroughs",
    exact: true,
  });
  await lab.getByLabel("Teaching sequence").selectOption("1");
  await expect(lab.locator("[data-choice-polygon]")).toHaveCount(4);
  const expected = [
    [2, 4, 4, 4, 4, 8],
    [4, 4, 0, 0, 4, 4],
    [6, 3, 0, 0, 3, 6],
    [8, 4, 4, 4, 4, 8],
  ];
  const polygons = await lab
    .locator("[data-choice-polygon]")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("points")));
  expect(new Set(polygons).size).toBe(4);
  for (let i = 0; i < 4; i++) {
    const button = lab.getByRole("button", {
      name: `Histogram choice ${"ABCD"[i]}`,
      exact: true,
    });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(lab.getByTestId("animation-step")).toHaveText("0 / 6");
    for (let j = 0; j < 6; j++)
      await lab.getByRole("button", { name: "Next step", exact: true }).click();
    expect(
      await lab
        .locator("[data-animation-bar]")
        .evaluateAll((nodes) =>
          nodes.map((n) => Number(n.getAttribute("data-frequency"))),
        ),
    ).toEqual(expected[i]);
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(1400);
  await lab.screenshot({ path: "out/statistics-choices-histograms.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await lab
    .getByRole("region", { name: "Compare all four choices" })
    .screenshot({ path: "out/statistics-choices-phone.png" });
});
test("all curve choices retain the original table, explain shape and respect hidden answers", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Animated walkthroughs",
    exact: true,
  });
  const table = await lab.locator("table").textContent();
  for (const [i, text] of [
    "Left-skewed",
    "symmetric",
    "Right-skewed",
    "Bimodal",
  ].entries()) {
    await lab
      .getByRole("button", {
        name: `Frequency curve choice ${"ABCD"[i]}`,
        exact: true,
      })
      .click();
    await expect(lab.getByRole("status").last()).toContainText(text);
    expect(await lab.locator("table").textContent()).toBe(table);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  const selectedPath = lab
    .getByRole("button", { name: "Frequency curve choice D", exact: true })
    .locator("svg path")
    .last();
  expect(
    await selectedPath.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await lab.screenshot({ path: "out/statistics-choices-curves.png" });
  await page
    .locator("summary")
    .filter({ hasText: "Teacher & sharing tools" })
    .click();
  await page
    .getByRole("button", { name: "Hide model answers", exact: true })
    .click();
  await expect(lab.getByText("D: Bimodal", { exact: false })).toHaveCount(0);
  await lab.getByLabel("Teaching sequence").selectOption("1");
  await expect(lab.locator("[data-choice-polygon]")).toHaveCount(0);
});
