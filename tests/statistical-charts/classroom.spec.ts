import { test, expect, type Download, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function bytesOf(download: Download) {
  expect(await download.failure()).toBeNull();
  const path = (await download.path())!;
  let bytes: Buffer = Buffer.alloc(0);
  // Windows download scanning may briefly hold a completed file; keep its protection intact.
  await expect
    .poll(
      async () => {
        try {
          bytes = await readFile(path);
          return bytes.length > 0;
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "EPERM") return false;
          throw error;
        }
      },
      { timeout: 15000, intervals: [100, 250, 500, 1000] },
    )
    .toBe(true);
  return bytes;
}
async function setup(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
}
async function tools(page: Page) {
  await page.getByText("Teacher & sharing tools", { exact: false }).click();
}
async function compare(page: Page) {
  await page.getByRole("button", { name: /05 · Compare Charts/ }).click();
}
test("all comparison layouts share numeric scales and linked selection", async ({
  page,
}) => {
  await setup(page);
  await compare(page);
  for (const [layout, count] of [
    ["shape", 2],
    ["smooth", 2],
    ["cumulative", 2],
    ["totals", 2],
    ["all", 5],
  ] as const) {
    await page.getByLabel("Comparison layout").selectOption(layout);
    const graphs = page.locator("[data-comparison-chart] svg");
    await expect(graphs).toHaveCount(count);
    const scales = await graphs.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-scale")),
    );
    expect(new Set(scales).size).toBe(1);
  }
  await page
    .locator('[data-comparison-chart="histogram"]')
    .getByRole("button", { name: /Select.*20–29/ })
    .click();
  await expect(
    page.locator(
      'section[aria-label="Compare Charts"] tr[data-selected="true"]',
    ),
  ).toHaveCount(1);
  await expect(
    page.locator(
      '[data-comparison-chart="cumulativePolygon"] [data-point="29.5,10"]',
    ),
  ).toHaveAttribute("r", "7");
});
test("shared link restores exact lesson in a fresh browser context", async ({
  page,
  browser,
}) => {
  await setup(page);
  await compare(page);
  await page.getByLabel("Comparison layout").selectOption("all");
  await tools(page);
  await page
    .getByRole("button", { name: "Fix lesson dataset", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Hide model answers", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Copy activity link", exact: true })
    .click();
  const link = await page
    .getByLabel("Activity link", { exact: true })
    .inputValue();
  const context = await browser.newContext();
  const recipient = await context.newPage();
  await recipient.goto(link);
  await expect(recipient.getByTestId("lab-total")).toHaveText("20");
  await expect(recipient.getByLabel("Comparison layout")).toHaveValue("all");
  await expect(
    recipient.getByText("Model answers are hidden by the teacher controls."),
  ).toBeVisible();
  await recipient.getByRole("link", { name: /02 ·/ }).click();
  await expect(
    recipient.getByLabel("First lower limit / boundary"),
  ).toHaveCount(0);
  await expect(
    recipient
      .getByRole("group", { name: "Class interval 1", exact: true })
      .getByLabel("Frequency", { exact: true }),
  ).toBeDisabled();
  await context.close();
});
test("activity file, CSV and invalid import keep faithful data", async ({
  page,
}) => {
  await setup(page);
  await tools(page);
  await expect(
    page.getByRole("button", { name: "Raw data CSV", exact: true }),
  ).toBeDisabled();
  let pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Frequency table CSV", exact: true })
    .click();
  const csv = (await bytesOf(await pending)).toString("utf8");
  expect(csv).toContain("20,29,19.5,29.5,24.5,10,7,10");
  pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Save activity file", exact: true })
    .click();
  const saved = (await bytesOf(await pending)).toString("utf8");
  await page
    .getByRole("group", { name: "Class interval 1", exact: true })
    .getByLabel("Frequency", { exact: true })
    .fill("9");
  await page.getByLabel("Open activity file", { exact: true }).setInputFiles({
    name: "lesson.json",
    mimeType: "application/json",
    buffer: Buffer.from(saved),
  });
  await expect(page.getByTestId("lab-total")).toHaveText("20");
  await page.getByLabel("Open activity file", { exact: true }).setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1,"data":[]}'),
  });
  await expect(
    page.getByText(/This activity could not be loaded/),
  ).toBeVisible();
  await expect(page.getByTestId("lab-total")).toHaveText("20");
});
test("large raw example uses file fallback and raw CSV", async ({ page }) => {
  await page.goto("/");
  await tools(page);
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Save activity file", exact: true })
    .click();
  const a = JSON.parse((await bytesOf(await pending)).toString("utf8"));
  a.data = Array(10000).fill(10);
  await page.getByLabel("Open activity file", { exact: true }).setInputFiles({
    name: "large.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(a)),
  });
  await expect(page.getByTestId("lab-total")).toHaveText("10000");
  await page
    .getByRole("button", { name: "Copy activity link", exact: true })
    .click();
  await expect(page.getByText(/too large for a reliable link/)).toBeVisible();
  const csvDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Raw data CSV", exact: true }).click();
  const csv = (await bytesOf(await csvDownload)).toString("utf8");
  expect(csv.trim().split(/\r?\n/)).toHaveLength(10000);
});
test("model answer policy, fixed lesson and workspace reset", async ({
  page,
}) => {
  await setup(page);
  await tools(page);
  await page
    .getByRole("button", { name: "Fix lesson dataset", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Another teaching example", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Hide model answers", exact: true })
    .click();
  await page.getByRole("button", { name: /04 · Practice/ }).click();
  await expect(
    page.getByRole("button", { name: "Show Answer", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Allow model answers", exact: true })
    .click();
  await page.getByLabel("Your answer", { exact: true }).fill("14.5");
  await page.getByRole("button", { name: "Check Answer", exact: true }).click();
  await expect(
    page.getByText("Worked correction", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reset student workspace", exact: true })
    .click();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue("");
  await expect(page.getByTestId("lab-total")).toHaveText("20");
});
test("PNG and standalone SVG contain visible painted data and complete labels", async ({
  page,
}) => {
  await setup(page);
  await page
    .getByLabel("Dataset title", { exact: true })
    .fill("A complete chart title for export with forty characters");
  const chart = page.locator("#lab-chart");
  const svgPending = page.waitForEvent("download");
  await chart.getByRole("button", { name: "SVG", exact: true }).click();
  const svg = (await bytesOf(await svgPending)).toString("utf8");
  expect(svg).toContain(
    "A complete chart title for export with forty characters",
  );
  expect(svg).toContain("rgb(15, 69, 116)");
  expect(svg).toContain('data-frequency="7"');
  const pngPending = page.waitForEvent("download");
  await chart.getByRole("button", { name: "PNG", exact: true }).click();
  const png = await pngPending;
  const bytes = await bytesOf(png);
  await png.saveAs("test-results/statistical-export.png");
  expect(bytes.subarray(1, 4).toString()).toBe("PNG");
  expect(bytes.readUInt32BE(16)).toBeGreaterThan(600);
  expect(bytes.length).toBeGreaterThan(10000);
});
test("print preview renders comparison pages and keyboard exits presentation", async ({
  page,
}) => {
  await setup(page);
  await compare(page);
  await tools(page);
  await page
    .getByRole("button", { name: "Presentation View", exact: true })
    .click();
  const panels = page.locator("[data-comparison-chart]");
  const bottoms = await panels.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().bottom),
  );
  expect(Math.max(...bottoms)).toBeLessThanOrEqual(720);
  await expect(
    page.getByRole("button", { name: "Exit presentation", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/statistical-presentation.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Exit presentation", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Printable view", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Printable view",
    exact: true,
  });
  await expect(dialog.locator("svg")).toHaveCount(2);
  const printScales = await dialog
    .locator("svg")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-scale")),
    );
  expect(new Set(printScales).size).toBe(1);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#root")).toBeHidden();
  await page.pdf({
    path: "test-results/statistical-print.pdf",
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
  });
  await page.emulateMedia({ media: "screen" });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});
for (const [name, width, height] of [
  ["phone", 360, 800],
  ["tablet", 820, 1180],
  ["desktop", 1440, 1000],
  ["projector", 1920, 1080],
] as const) {
  test(`Phase 3 ${name} visual layout and reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setup(page);
    await compare(page);
    await page.getByLabel("Comparison layout").selectOption("all");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/statistical-phase3-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await tools(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
