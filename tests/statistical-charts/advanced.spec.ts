import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
const sessionKey = "lskc-statistical-session-v1";
async function setup(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
}
async function advanced(page: Page) {
  await page.getByRole("button", { name: /06 ·/ }).click();
}
async function saved(page: Page) {
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), sessionKey))
    .not.toBeNull();
  await page.waitForTimeout(350);
}
test("quartile guides, smooth inversion and flat graph readings", async ({
  page,
}) => {
  await setup(page);
  await advanced(page);
  await expect(page.getByTestId("percentile-estimate")).toHaveText("29.5");
  await page.getByRole("button", { name: /Lower quartile/ }).click();
  await expect(page.getByTestId("percentile-estimate")).toHaveText("22.36");
  await page
    .getByLabel("Construction method", { exact: true })
    .selectOption("curve");
  const estimate = Number(
    await page.getByTestId("percentile-estimate").innerText(),
  );
  expect(estimate).toBeGreaterThan(19.5);
  expect(estimate).toBeLessThan(29.5);
  await expect(page.locator("[data-percentile-guide]")).toHaveCount(1);
  await page.getByRole("link", { name: /02 ·/ }).click();
  for (const [i, f] of [3, 0, 0, 3].entries())
    await page
      .getByRole("group", { name: `Class interval ${i + 1}`, exact: true })
      .getByLabel("Frequency", { exact: true })
      .fill(String(f));
  await advanced(page);
  await page.getByRole("button", { name: /^Median/ }).click();
  await expect(page.getByTestId("percentile-estimate")).toHaveText("19.5–39.5");
  await expect(
    page.getByText(/Every value in the displayed interval/),
  ).toBeVisible();
});
test("two groups use distinguishable lines and percentage scales with unequal totals", async ({
  page,
}) => {
  await setup(page);
  await advanced(page);
  await page.getByLabel("Exploration", { exact: true }).selectOption("twoData");
  await page.getByLabel("Group B · 10–19", { exact: true }).fill("25");
  await expect(page.locator("[data-second-series]")).toHaveCount(1);
  const chart = page.getByRole("region", {
    name: "Further Explorations",
    exact: true,
  });
  await expect(chart.locator("svg")).toHaveAttribute(
    "data-scale",
    "9.5,49.5,100",
  );
  await page
    .getByLabel("Comparison scale", { exact: true })
    .selectOption("count");
  await expect(chart.locator("svg")).toHaveAttribute(
    "data-scale",
    "9.5,49.5,40",
  );
  await page
    .getByLabel("Distribution view", { exact: true })
    .selectOption("frequency");
  await expect(chart.locator("svg")).toContainText("Frequency");
  await page.getByLabel("Group B · 10–19", { exact: true }).fill("-1");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(chart.locator("svg")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Reset B to current classes", exact: true })
    .click();
  await expect(chart.locator("svg")).toHaveCount(1);
});
test("construction draft, level and join style survive reload and clear together", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: /04 ·/ }).click();
  await page
    .getByLabel("Activity chart", { exact: true })
    .selectOption("polygon");
  await page.getByLabel("Practice level", { exact: true }).selectOption("3");
  await page.getByRole("button", { name: "Add point", exact: true }).click();
  await page.getByLabel("Horizontal coordinate 1", { exact: true }).fill("4.5");
  await page.getByLabel("Vertical coordinate 1", { exact: true }).fill("0");
  await page.getByLabel("Join style", { exact: true }).selectOption("straight");
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Practice level", { exact: true })).toHaveValue(
    "3",
  );
  await expect(
    page.getByLabel("Horizontal coordinate 1", { exact: true }),
  ).toHaveValue("4.5");
  await expect(page.getByLabel("Join style", { exact: true })).toHaveValue(
    "straight",
  );
  await page.getByRole("button", { name: "Add point", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove item 2", exact: true }),
  ).toBeVisible();
  await page.getByText("My activities & progress", { exact: false }).click();
  await page
    .getByRole("button", { name: "Clear practice progress", exact: true })
    .click();
  await expect(page.getByLabel("Practice level", { exact: true })).toHaveValue(
    "1",
  );
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Practice level", { exact: true })).toHaveValue(
    "1",
  );
});
test("tutorial stage and scalar answer restore without exposing worked answers", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: /03 ·/ }).click();
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await page.getByLabel("Your answer", { exact: true }).fill("9.5");
  await saved(page);
  await page.reload();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    "9.5",
  );
  await expect(
    page.getByText("Worked correction", { exact: true }),
  ).toHaveCount(0);
});
test("teacher activity library reopens instructions, starting level and exact data", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: /04 ·/ }).click();
  await page.getByText("My activities & progress", { exact: false }).click();
  await page
    .getByLabel("Activity name", { exact: true })
    .fill("Median investigation");
  await page
    .getByLabel("Instructions for students", { exact: true })
    .fill("Use boundaries. Explain your construction.");
  await page
    .getByLabel("Starting practice level", { exact: true })
    .selectOption("3");
  await page
    .getByRole("button", { name: "Save to my activities", exact: true })
    .click();
  await page.reload();
  await page.getByText("My activities & progress", { exact: false }).click();
  await page
    .getByRole("button", { name: "Open: Median investigation", exact: true })
    .click();
  await expect(page.getByLabel("Practice level", { exact: true })).toHaveValue(
    "3",
  );
  await expect(page.getByTestId("lab-total")).toHaveText("20");
  await expect(
    page
      .locator("p")
      .filter({ hasText: /^Use boundaries\. Explain your construction\.$/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete: Median investigation", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Open: Median investigation",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Undo last deletion", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Open: Median investigation",
      exact: true,
    }),
  ).toBeVisible();
});
test("advanced activity link carries group B and task but no attempts", async ({
  page,
  browser,
}) => {
  await setup(page);
  await advanced(page);
  await page.getByLabel("Exploration", { exact: true }).selectOption("twoData");
  await page.getByLabel("Group B · 10–19", { exact: true }).fill("25");
  await page.getByText("My activities & progress", { exact: false }).click();
  await page
    .getByLabel("Activity name", { exact: true })
    .fill("Compare the cohorts");
  await page
    .getByLabel("Instructions for students", { exact: true })
    .fill("Explain why percentages help.");
  await page.getByText("Teacher & sharing tools", { exact: false }).click();
  await page
    .getByRole("button", { name: "Copy activity link", exact: true })
    .click();
  const link = await page
    .getByLabel("Activity link", { exact: true })
    .inputValue();
  const context = await browser.newContext(),
    recipient = await context.newPage();
  await recipient.goto(link);
  await expect(
    recipient.getByLabel("Group B · 10–19", { exact: true }),
  ).toHaveValue("25");
  await expect(
    recipient.getByLabel("Exploration", { exact: true }),
  ).toHaveValue("twoData");
  await expect(
    recipient.getByRole("heading", {
      name: "Compare the cohorts",
      exact: true,
    }),
  ).toBeVisible();
  const encoded = JSON.parse(
    Buffer.from(link.split("#activity=")[1], "base64url").toString("utf8"),
  );
  expect(encoded).not.toHaveProperty("progress");
  await recipient.getByRole("button", { name: /04 ·/ }).click();
  await recipient.getByLabel("Your answer", { exact: true }).fill("17");
  await saved(recipient);
  await recipient.reload();
  await expect(
    recipient.getByLabel("Your answer", { exact: true }),
  ).toHaveValue("17");
  // A different incoming link replaces the saved attempt, including in this same tab.
  await page
    .getByLabel("Activity name", { exact: true })
    .fill("A fresh comparison");
  await page
    .getByRole("button", { name: "Copy activity link", exact: true })
    .click();
  await recipient.goto(
    await page.getByLabel("Activity link", { exact: true }).inputValue(),
  );
  await expect(
    recipient.getByRole("heading", { name: "A fresh comparison", exact: true }),
  ).toBeVisible();
  await recipient.getByRole("button", { name: /04 ·/ }).click();
  await expect(
    recipient.getByLabel("Your answer", { exact: true }),
  ).toHaveValue("");
  await context.close();
});
test("blocked browser storage keeps the app usable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await setup(page);
  await advanced(page);
  await expect(page.getByTestId("percentile-estimate")).toHaveText("29.5");
  await page.getByText("My activities & progress", { exact: false }).click();
  await expect(
    page.getByText(/Browser storage is unavailable/).first(),
  ).toBeVisible();
});
test("corrupt saved session recovers with a usable workspace", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(
    (key) => localStorage.setItem(key, '{"version":1,"activity":null}'),
    sessionKey,
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
  await advanced(page);
  await expect(page.getByTestId("percentile-estimate")).toHaveText("29.5");
  await saved(page);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).activity.mode,
        sessionKey,
      ),
    )
    .toBe("advanced");
});

test("two-group exports retain the legend and printing includes both frequency tables", async ({
  page,
}) => {
  await setup(page);
  await advanced(page);
  await page.getByLabel("Exploration", { exact: true }).selectOption("twoData");
  await page.getByLabel("Group B · 10–19", { exact: true }).fill("25");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  const download = await pending;
  let svg = "";
  await expect(async () => {
    svg = await readFile((await download.path())!, "utf8");
    expect(svg).toContain("data-second-series");
  }).toPass();
  expect(svg).toContain("Group A");
  expect(svg).toContain("Group B");
  expect(svg).toContain("stroke-dasharray");
  await download.saveAs("test-results/statistical-phase4-export.svg");
  await page.getByText("Teacher & sharing tools", { exact: false }).click();
  await page
    .getByRole("button", { name: "Printable view", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Printable view",
    exact: true,
  });
  await expect(dialog.getByRole("table")).toHaveCount(2);
  await expect(dialog.getByRole("heading", { name: /Group B/ })).toBeVisible();
  await expect(dialog.getByRole("table").nth(1)).toContainText("40");
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "test-results/statistical-phase4-print.pdf",
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
  });
});

for (const [name, width, height] of [
  ["phone", 360, 800],
  ["tablet", 820, 1180],
  ["desktop", 1440, 1000],
] as const)
  test(`Phase 4 ${name} visual review`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await setup(page);
    await advanced(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/statistical-phase4-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByLabel("Exploration", { exact: true })
      .selectOption("twoData");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/statistical-phase4-two-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  });
