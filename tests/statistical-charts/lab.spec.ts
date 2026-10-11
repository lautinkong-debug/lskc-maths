import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
test("edit table frequencies beside the chart without changing raw observations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  const table = page.getByRole("table", {
    name: "Frequency distribution",
    exact: true,
  });
  await page
    .getByRole("button", { name: "Table & chart view", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit frequencies", exact: true })
    .click();
  const input = table.getByLabel("Frequency: 34–50", { exact: true });
  await expect(input).toHaveValue("17");
  await input.fill("8");
  await expect(page.locator('[data-bar="2"]')).toHaveAttribute(
    "data-frequency",
    "8",
  );
  await expect(table.locator("tfoot td").first()).toHaveText("21");
  await expect(
    table.locator("tbody tr").nth(2).locator("td").last(),
  ).toHaveText("8");
  await input.fill("-1");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(table.locator("tfoot td").first()).toHaveText("21");
  await input.fill("1.5");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.fill("0");
  await expect(table.locator("tfoot td").first()).toHaveText("13");
  const a = (await table.boundingBox())!,
    b = (await page.locator("#lab-chart svg[role=group]").boundingBox())!;
  expect(Math.max(a.y + a.height, b.y + b.height)).toBeLessThanOrEqual(720);
  await page.screenshot({
    path: "test-results/statistical-edit-frequencies.png",
  });
  await page.getByRole("button", { name: "Done editing", exact: true }).click();
  await expect(input).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Raw observations", exact: true })
    .click();
  await expect(page.getByTestId("lab-total")).toHaveText("30");
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
  await expect(page.getByTestId("lab-total")).toHaveText("13");
  await page.reload();
  await expect(page.getByTestId("lab-total")).toHaveText("13");
});
test("boundary axis labels preserve the histogram and restore with the workspace", async ({
  page,
}) => {
  const labels = page.getByLabel("Horizontal axis labels", { exact: true });
  const bars = page.locator("[data-bar]");
  await expect(bars).toHaveCount(6);
  const geometry = () =>
    bars.evaluateAll((nodes) =>
      nodes.map((n) => ["x", "width", "height"].map((k) => n.getAttribute(k))),
    );
  const before = await geometry();
  await labels.selectOption("boundaries");
  await expect(page.locator("[data-axis-mark]")).toHaveCount(0);
  expect(
    await page
      .locator("[data-axis-boundary]")
      .evaluateAll((nodes) =>
        nodes.map((n) => Number(n.getAttribute("data-axis-boundary"))),
      ),
  ).toEqual([-0.5, 16.5, 33.5, 50.5, 67.5, 84.5, 101.5]);
  expect(await geometry()).toEqual(before);
  await expect(page.getByTestId("lab-total")).toHaveText("30");
  await page.reload();
  await expect(labels).toHaveValue("boundaries");
  await page
    .getByRole("button", { name: "Table & chart view", exact: true })
    .click();
  await expect(labels).toBeVisible();
  await labels.selectOption("marks");
  await expect(page.locator("[data-axis-boundary]")).toHaveCount(0);
  await expect(page.locator("[data-axis-mark]")).toHaveCount(6);
  await page
    .getByLabel("Chart type", { exact: true })
    .selectOption("cumulativePolygon");
  await expect(labels).toHaveValue("boundaries");
  await expect(labels).toBeDisabled();
  await expect(page.locator("[data-axis-boundary]")).toHaveCount(7);
  await page
    .getByLabel("Chart type", { exact: true })
    .selectOption("histogram");
  await expect(labels).toHaveValue("marks");
  await labels.selectOption("boundaries");
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({ path: "test-results/statistical-boundary-axis.png" });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(labels).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("dataset settings precede data, and deletion uses a bin icon", async ({
  page,
}) => {
  const remove = page.getByRole("button", {
    name: "Remove Observation 1",
    exact: true,
  });
  await expect(remove.locator("svg")).toHaveCount(1);
  await expect(remove).not.toHaveText("×");
  await remove.click();
  await expect(page.getByTestId("lab-total")).toHaveText("29");
  const settings = await page.getByTestId("lab-settings").boundingBox();
  const data = await page.getByTestId("lab-data").boundingBox();
  const results = await page.getByTestId("lab-results").boundingBox();
  expect(settings!.y + settings!.height).toBeLessThanOrEqual(data!.y);
  expect(data!.y + data!.height).toBeLessThanOrEqual(results!.y);
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
  const removeClass = page.getByRole("button", {
    name: "Remove Class interval 4",
    exact: true,
  });
  await expect(removeClass.locator("svg")).toHaveCount(1);
  await removeClass.click();
  await expect(page.getByTestId("lab-total")).toHaveText("15");
});

for (const [width, height] of [
  [1280, 720],
  [1920, 1080],
]) {
  test(`table and chart are both visible at ${width} by ${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const enter = page.getByRole("button", {
      name: "Table & chart view",
      exact: true,
    });
    await enter.click();
    const table = page.getByRole("table", {
      name: "Frequency distribution",
      exact: true,
    });
    const graph = page.locator("#lab-chart svg[role=group]");
    await expect(table).toBeVisible();
    await expect(graph).toBeVisible();
    await expect
      .poll(async () => {
        const a = (await table.boundingBox())!,
          b = (await graph.boundingBox())!;
        return Math.max(a.y + a.height, b.y + b.height);
      })
      .toBeLessThanOrEqual(height);
    const a = (await table.boundingBox())!,
      b = (await graph.boundingBox())!;
    expect(a.x + a.width).toBeLessThanOrEqual(b.x);
    await table.getByRole("button", { name: "34–50", exact: true }).click();
    await expect(page.locator('tr[data-selected="true"]')).toHaveCount(1);
    await page.screenshot({
      path: `test-results/statistical-table-chart-${width}.png`,
      fullPage: true,
    });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(enter).toBeFocused();
  });
}
test("same grouped dataset drives all five numerical charts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
  await expect(page.getByTestId("lab-total")).toHaveText("20");
  const bars = page.locator("[data-bar]");
  await expect(bars).toHaveCount(4);
  expect(
    await bars.evaluateAll((nodes) =>
      nodes.map((n) => [
        n.getAttribute("data-low"),
        n.getAttribute("data-high"),
        n.getAttribute("data-frequency"),
      ]),
    ),
  ).toEqual([
    ["9.5", "19.5", "3"],
    ["19.5", "29.5", "7"],
    ["29.5", "39.5", "5"],
    ["39.5", "49.5", "5"],
  ]);
  const select = page.getByLabel("Chart type", { exact: true });
  await select.selectOption("polygon");
  await expect(page.locator('[data-point="4.5,0"]')).toHaveCount(1);
  await expect(page.locator('[data-point="54.5,0"]')).toHaveCount(1);
  await expect(page.locator("polyline[data-chart-line]")).toHaveCount(1);
  await select.selectOption("curve");
  await expect(page.locator('path[data-chart-line="curve"]')).toHaveAttribute(
    "d",
    / C /,
  );
  for (const type of ["cumulativePolygon", "cumulativeCurve"]) {
    await select.selectOption(type);
    await expect(page.locator('[data-point="9.5,0"]')).toHaveCount(1);
    await expect(page.locator('[data-point="49.5,20"]')).toHaveCount(1);
  }
  await page
    .getByRole("group", { name: "Class interval 2", exact: true })
    .getByLabel("Frequency", { exact: true })
    .fill("10");
  await expect(page.getByTestId("lab-total")).toHaveText("23");
  await expect(page.locator('[data-point="49.5,23"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test("editing, importing, grouping and invalid input", async ({ page }) => {
  await page
    .getByLabel("Paste numbers or numeric CSV")
    .fill("10, 15, 20, 25, 30, 35, 40, 45");
  await page.getByRole("button", { name: "Use these values" }).click();
  await page.getByLabel("First lower limit / boundary").fill("10");
  await page.getByLabel("Class width", { exact: true }).fill("10");
  await page.getByLabel("Number of classes", { exact: true }).fill("4");
  await expect(page.getByTestId("lab-total")).toHaveText("8");
  await page.getByLabel("Observation 1", { exact: true }).fill("45");
  await expect(page.locator('[data-bar="0"]')).toHaveAttribute(
    "data-frequency",
    "1",
  );
  await expect(page.locator('[data-bar="3"]')).toHaveAttribute(
    "data-frequency",
    "3",
  );
  await page.getByLabel("Observation 1", { exact: true }).fill("100");
  await expect(page.getByRole("alert")).toContainText("outside");
  await expect(page.locator("[data-bar]")).toHaveCount(0);
  await page.getByRole("button", { name: "Fit classes to data" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByLabel("Import numeric CSV").setInputFiles({
    name: "scores.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("10,20\n30,40"),
  });
  await page.getByRole("button", { name: "Fit classes to data" }).click();
  await expect(page.getByTestId("lab-total")).toHaveText("4");
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Class interval 4", exact: true })
    .getByLabel("Upper limit", { exact: true })
    .fill("59");
  await expect(page.getByRole("alert")).toContainText("unequal widths");
  await expect(page.locator("[data-bar]")).toHaveCount(0);
});
test("seed replay, shape generation and display controls", async ({ page }) => {
  await page.getByLabel("Reproducible seed").fill("lesson-one");
  await page.getByRole("button", { name: "Reproduce Seed" }).click();
  const snapshot = await page
    .locator('input[aria-label^="Observation "]')
    .evaluateAll((ns) => ns.map((n) => (n as HTMLInputElement).value));
  await page.getByRole("button", { name: "Generate New Data" }).click();
  await page.getByLabel("Reproducible seed").fill("lesson-one");
  await page.getByRole("button", { name: "Reproduce Seed" }).click();
  expect(
    await page
      .locator('input[aria-label^="Observation "]')
      .evaluateAll((ns) => ns.map((n) => (n as HTMLInputElement).value)),
  ).toEqual(snapshot);
  await page.getByText("Chart display", { exact: true }).click();
  await page.getByLabel("Frequency labels", { exact: true }).check();
  await page.getByLabel("Chart type", { exact: true }).selectOption("polygon");
  await page.getByLabel("Histogram underneath", { exact: true }).check();
  await expect(page.locator("[data-bar]")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Select class 0–16, Frequency", exact: false })
    .focus();
  await expect(page.locator('tr[data-selected="true"]')).toHaveCount(1);
  await page
    .getByRole("button", { name: "Enlarge chart", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Show workspace", exact: true }),
  ).toBeVisible();
});
for (const [name, width, height] of [
  ["phone", 360, 800],
  ["tablet", 820, 1180],
  ["desktop", 1440, 1000],
] as const) {
  test(`${name} layout remains inside the viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Grouped frequencies", exact: true })
      .click();
    await page
      .getByLabel("Chart type", { exact: true })
      .selectOption("cumulativeCurve");
    await page.locator("#lab-chart").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `test-results/statistical-${name}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
