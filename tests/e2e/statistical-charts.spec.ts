import { expect, test } from "@playwright/test";

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
    .getByRole("combobox", { name: "Strand", exact: true })
    .selectOption("data-handling");
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
