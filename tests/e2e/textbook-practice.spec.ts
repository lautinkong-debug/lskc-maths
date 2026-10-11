import { expect, test } from "@playwright/test";

for (const [expression, sign, magnitude] of [
  ["50-60", "Negative: left of 0", 10],
  ["-50+30", "Negative: left of 0", 20],
  ["-50+60", "Positive: right of 0", 10],
  ["-50-30", "Negative: left of 0", 80],
  ["-50-(-60)", "Positive: right of 0", 10],
  ["50+(-50)", "Zero: neither positive nor negative", 0],
] as const) {
  test(`number-line magnitude: ${expression}`, async ({ page }) => {
    await page.goto(
      `/apps/directed-numbers#sign-magnitude:e=${encodeURIComponent(expression)}`,
    );
    const line = page.getByTestId("magnitude-line");
    await expect(line).toHaveAttribute("data-stage", "0");
    await expect(page.getByTestId("magnitude-result")).toHaveCount(0);
    await page.clock.install();
    await page
      .getByRole("button", { name: "Show movement", exact: true })
      .click();
    await expect(line).toHaveAttribute("data-stage", "1");
    await page.clock.runFor(1500);
    const result = page.getByTestId("magnitude-result");
    await expect(result.getByText(sign, { exact: true })).toBeVisible();
    await expect(
      result.getByText(`${magnitude} units from 0`, { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Start again", exact: true })
      .click();
    await expect(line).toHaveAttribute("data-stage", "0");
    await expect(result).toHaveCount(0);
  });
}

test("textbook reference, incorrect sign, equivalent fraction and filters", async ({
  page,
}, testInfo) => {
  await page.goto("/apps/directed-numbers#textbook");
  await expect(
    page.getByRole("heading", { name: "Exercise 2B · Q1(a)" }),
  ).toBeVisible();
  await page.getByLabel("Your answer", { exact: true }).fill("-4");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("magnitude is right");
  await page.getByLabel("Your answer", { exact: true }).fill("8/2");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct.");
  await expect(page.getByText(/Question 1 of 62 · 1 correct/)).toBeVisible();
  await page
    .getByRole("combobox", { name: "Difficulty", exact: true })
    .selectOption("2");
  await page
    .getByRole("combobox", { name: "Question", exact: true })
    .selectOption({ label: "Q24(d)" });
  await expect(
    page.getByRole("heading", { name: "Exercise 2B · Q24(d)" }),
  ).toBeVisible();
  await page.getByLabel("Your answer", { exact: true }).fill("-1 1/6");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct.");
  await page.getByRole("button", { name: "Show working", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Working", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Explore with the bird/ }),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Exercise", exact: true })
    .selectOption("2C");
  await expect(
    page.getByRole("heading", { name: "Exercise 2C · Q20(a)" }),
  ).toBeVisible();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue("");
  await page
    .getByRole("combobox", { name: "Question", exact: true })
    .selectOption({ label: "Q33(b)" });
  await page.getByLabel("Your answer", { exact: true }).fill("-2.25");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Correct.");
  await expect(
    page.getByRole("button", { name: "Next question", exact: false }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Show working", exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath("textbook-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("textbook-phone.png"),
    fullPage: true,
  });
});

test("textbook connects to the correct bird and magnitude examples", async ({
  page,
}) => {
  await page.goto("/apps/directed-numbers#textbook");
  await page
    .getByRole("combobox", { name: "Question", exact: true })
    .selectOption({ label: "Q4(c)" });
  await page.getByRole("link", { name: /Explore with the bird/ }).click();
  await expect(page.getByTestId("walking-bird")).toHaveAttribute(
    "data-position",
    "-3",
  );
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Exercise 2B · Q4(c)" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show working", exact: true }).click();
  await expect(page.getByTestId("magnitude-result")).toContainText(
    "Positive: right of 0",
  );
  await page.getByRole("link", { name: /Explore sign & magnitude/ }).click();
  await expect(page.getByTestId("magnitude-line")).toHaveAttribute(
    "aria-label",
    /start at -3, move 8 units right/,
  );
});

test("prediction, new expression, phone and projection layouts", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/apps/directed-numbers#sign-magnitude");
  await page
    .getByRole("combobox", { name: "Predicted sign", exact: true })
    .selectOption("positive");
  await page.getByLabel("Predicted magnitude", { exact: true }).fill("10");
  await page
    .getByRole("button", { name: "Check prediction", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("which side of zero");
  await page
    .getByRole("combobox", { name: "Predicted sign", exact: true })
    .selectOption("negative");
  await page
    .getByRole("button", { name: "Check prediction", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Correct.");
  await page
    .getByRole("button", { name: "Show movement", exact: true })
    .click();
  await expect(page.getByTestId("magnitude-result")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("magnitude-phone.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(page.getByTestId("magnitude-result")).toBeInViewport({
    ratio: 1,
  });
  await expect(page.getByTestId("magnitude-line")).toBeInViewport({ ratio: 1 });
  await page.screenshot({
    path: testInfo.outputPath("magnitude-projection.png"),
    fullPage: true,
  });
  await page.getByLabel("Starting value", { exact: true }).fill("50");
  await page.getByLabel("Second number", { exact: true }).fill("30");
  await page
    .getByRole("button", { name: "Draw my number line", exact: true })
    .click();
  await expect(page.getByTestId("magnitude-line")).toHaveAttribute(
    "data-stage",
    "0",
  );
  await expect(
    page.getByLabel("Predicted magnitude", { exact: true }),
  ).toHaveValue("");
});
