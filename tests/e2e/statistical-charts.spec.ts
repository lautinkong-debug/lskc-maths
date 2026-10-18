import { expect, test } from "@playwright/test";

test("department projection keeps the frequency table and chart together", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/apps/statistical-charts");
  await page.getByText("Prepare the data", { exact: true }).click();
  await expect(page.getByTestId("lab-settings")).toBeVisible();
  await page
    .getByTestId("lab-settings")
    .screenshot({ path: "test-results/statistical-settings-horizontal.png" });
  await page
    .getByTestId("lab-data")
    .screenshot({ path: "test-results/statistical-data-trash-buttons.png" });
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  const table = page.getByRole("table", {
    name: "Frequency distribution",
    exact: true,
  });
  const graph = page.locator("#lab-chart svg[role=group]");
  await expect(table).toBeVisible();
  await expect(graph).toBeVisible();
  await expect(page.getByTestId("lab-settings")).toBeHidden();
  await expect(page.getByTestId("lab-data")).toBeHidden();
  await expect
    .poll(async () => {
      const a = (await table.boundingBox())!,
        b = (await graph.boundingBox())!;
      return Math.max(a.y + a.height, b.y + b.height);
    })
    .toBeLessThanOrEqual(720);
  await page.screenshot({
    path: "test-results/statistical-department-table-chart.png",
  });
  await page
    .getByRole("button", { name: "Leave projection mode", exact: true })
    .click();
  await expect(page.getByTestId("lab-settings")).toBeVisible();
});

test("textbook filter includes every chapter and resets when the level changes", async ({
  page,
}) => {
  await page.goto("/apps");
  const level = page.getByRole("combobox", { name: "Level", exact: true });
  const topic = page.getByRole("combobox", {
    name: "Textbook topic",
    exact: true,
  });
  await expect(topic).toBeEnabled();
  await expect(topic.locator("optgroup")).toHaveCount(6);
  await expect(topic.locator("option")).toHaveCount(70);

  for (const [form, count] of [
    ["F1", 13],
    ["F2", 12],
    ["F3", 12],
    ["F4", 13],
    ["F5", 13],
    ["F6", 6],
  ] as const) {
    await level.selectOption(form);
    await expect(topic.locator("option")).toHaveCount(count + 1);
  }
  await level.selectOption("F1");
  await topic.selectOption({
    label: "1A02 · Directed Numbers and the Number Line",
  });
  await expect(
    page.getByRole("link", { name: /Directed number operations/ }),
  ).toHaveCount(1);
  await level.selectOption("F2");
  await expect(topic).toHaveValue("all");
  await topic.selectOption({ label: "2A01 · Errors in Measurement" });
  await expect(
    page.getByText("No web apps for this textbook topic yet.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator('main a[href^="/apps/"]')).toHaveCount(0);

  await level.selectOption("F5");
  await topic.selectOption({
    label: "Ch13 · Compound Linear Inequalities in One Unknown",
  });
  await expect(
    page.getByRole("link", { name: /Inequality number line/ }),
  ).toHaveCount(1);
  await level.selectOption("all");
  await page.getByLabel("Search apps", { exact: true }).fill("Ch4");
  await expect(
    page.getByRole("link", { name: /Quadratic explorer/ }),
  ).toHaveCount(1);
  await expect(page.locator('main a[href^="/apps/"]')).toHaveCount(1);
  await page.getByLabel("Search apps", { exact: true }).clear();
  await page.screenshot({
    path: "test-results/apps-textbook-desktop.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await level.selectOption("F4");
  await topic.selectOption({
    label:
      "Ch7 · More about Quadratic Functions, Quadratic Equations and Complex Numbers",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page
      .getByText(
        "Ch7 · More about Quadratic Functions, Quadratic Equations and Complex Numbers",
        { exact: true },
      )
      .last(),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/apps-textbook-phone.png",
    fullPage: true,
  });
});

test("department listing filters lead to the complete statistical charts lab", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/apps");
  await page
    .getByRole("combobox", { name: "Level", exact: true })
    .selectOption("F2");
  await page
    .getByRole("combobox", { name: "Textbook topic", exact: true })
    .selectOption({ label: "2A06 · More about Statistical Charts" });
  await page.getByLabel("Search apps", { exact: true }).fill("2A06");
  const entry = page.getByRole("link", { name: /Statistical Charts Lab/ });
  await expect(entry).toHaveCount(1);
  await entry.click();
  await expect(page).toHaveURL(/\/apps\/statistical-charts$/);
  await expect(page).toHaveTitle(/Statistical Charts Lab/);
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
  await expect(page.getByTestId("lab-total")).toHaveText("20");
  await page.getByRole("button", { name: /06 ·/ }).click();
  await expect(page.getByTestId("percentile-estimate")).toHaveText("29.5");
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Leave projection mode", exact: true }),
  ).toBeVisible();
  const plot = page
    .getByRole("region", { name: "Further Explorations", exact: true })
    .locator("svg");
  await expect
    .poll(
      async () =>
        (await plot.boundingBox())!.y + (await plot.boundingBox())!.height,
    )
    .toBeLessThanOrEqual(720);
  await page.screenshot({
    path: "test-results/statistical-department-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Leave projection mode", exact: true })
    .click();
  await page.getByRole("link", { name: "All web apps", exact: false }).click();
  await expect(page).toHaveURL(/\/apps$/);
  expect(errors).toEqual([]);
});

test("department activity links open in the same app route and restore on mobile", async ({
  page,
  browser,
}) => {
  await page.goto("/apps/statistical-charts");
  await page
    .getByRole("button", { name: "Grouped frequencies", exact: true })
    .click();
  await page.getByRole("button", { name: /04 ·/ }).click();
  await page.getByText("Teacher & sharing tools", { exact: false }).click();
  await page
    .getByRole("button", { name: "Copy activity link", exact: true })
    .click();
  const link = await page
    .getByLabel("Activity link", { exact: true })
    .inputValue();
  expect(new URL(link).pathname).toBe("/apps/statistical-charts");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const student = await context.newPage();
  await student.goto(link);
  await expect(student.getByTestId("lab-total")).toHaveText("20");
  await student.getByLabel("Your answer", { exact: true }).fill("14.5");
  await expect
    .poll(() =>
      student.evaluate(() =>
        localStorage.getItem("lskc-statistical-session-v1"),
      ),
    )
    .toContain("14.5");
  await student.reload();
  await expect(student.getByLabel("Your answer", { exact: true })).toHaveValue(
    "14.5",
  );
  expect(
    await student.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await student.screenshot({
    path: "test-results/statistical-department-phone.png",
    fullPage: true,
  });
  await context.close();
});
