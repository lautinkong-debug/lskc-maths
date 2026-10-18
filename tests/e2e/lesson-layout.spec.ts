import { expect, test } from "@playwright/test";

test("folding the lesson menu preserves the active reveal and explanation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/apps/directed-numbers#sign-magnitude:e=50-60");
  const next = page.getByRole("button", { name: "Next step", exact: true });
  await next.click();
  await next.click();
  const controls = page.getByTestId("teaching-controls");
  const progress = controls.getByText(/^Step \d+ of/);
  const before = await progress.innerText();
  await page.getByRole("button", { name: "Owe", exact: true }).click();
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  await expect(progress).toHaveText(before);
  await expect(
    page.getByRole("button", { name: "Owe", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await next.click();
  await expect(progress).toHaveText("Step 3 of 5");
  await page
    .getByRole("button", { name: "Show lesson menu", exact: true })
    .click();
  await expect(progress).toHaveText("Step 3 of 5");
  await expect(page.getByTestId("result-sign-prefix")).toContainText("−");
});

test("statistics preparation, chart editing and view switching keep the dataset", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/apps/statistical-charts");
  await expect(page.getByTestId("lab-settings")).toBeHidden();
  await expect(
    page.getByRole("table", { name: "Frequency distribution", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "01 · Data Explorer", exact: true })
    .click();
  await expect(page.getByTestId("lab-settings")).toBeVisible();
  await expect(page.getByTestId("lab-data")).toBeVisible();
  await page.getByText("Prepare the data", { exact: true }).click();
  await page
    .getByRole("button", { name: "Edit frequencies", exact: true })
    .click();
  const frequency = page
    .getByRole("spinbutton", { name: /^Frequency:/ })
    .first();
  const before = Number(await page.getByTestId("lab-total").innerText());
  const old = Number(await frequency.inputValue());
  await frequency.fill(String(old + 3));
  await frequency.blur();
  await expect(page.getByTestId("lab-total")).toHaveText(String(before + 3));
  await page
    .getByRole("combobox", { name: "Chart type", exact: true })
    .selectOption("polygon");
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Chart type", exact: true }),
  ).toHaveValue("polygon");
  await page
    .getByRole("button", { name: "Show lesson menu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "05 · Compare Charts", exact: true })
    .click();
  await page
    .getByRole("link", { name: "02 · Chart Builder", exact: true })
    .click();
  await expect(page.getByTestId("lab-total")).toHaveText(String(before + 3));
  await expect(frequency).toHaveValue(String(old + 3));
});

test("phone lesson menus reach every activity without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/apps/directed-numbers#sign-magnitude");
  for (const name of [
    "Textbook practice",
    "Brackets",
    "× and ÷",
    "Mixed",
    "Number line",
    "Add & subtract",
  ]) {
    await page
      .getByRole("button", { name: "Lesson menu", exact: true })
      .click();
    await page
      .getByRole("complementary")
      .getByRole("link", { name, exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Lesson menu", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Loading app…", { exact: true })).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/apps/statistical-charts");
  for (const prefix of ["03", "04", "05", "06", "07", "08", "09"]) {
    await page
      .getByRole("button", { name: "Lesson menu", exact: true })
      .click();
    await page
      .getByRole("complementary")
      .getByRole("button", { name: new RegExp(`^${prefix} ·`) })
      .click();
    await expect(
      page.getByRole("button", { name: "Lesson menu", exact: true }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
