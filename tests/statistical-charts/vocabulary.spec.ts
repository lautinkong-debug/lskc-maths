import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "09 · Four words, one class", exact: true })
    .click();
});
test("the mnemonic highlights each feature and recalls all four without visible worked labels", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await expect(lab.getByTestId("vocabulary-diagram")).toContainText("35.5");
  await lab.getByRole("button", { name: /M Mark is the Middle/ }).click();
  await expect(
    lab.getByRole("button", { name: /M Mark is the Middle/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await lab.screenshot({ path: "test-results/statistics-four-words.png" });
  await lab
    .getByRole("button", { name: "Hide and recall", exact: true })
    .click();
  await expect(lab.getByTestId("vocabulary-diagram")).not.toContainText("35.5");
  await lab.getByRole("button", { name: "Class limits", exact: true }).click();
  await expect(lab.getByText(/Look again./)).toContainText(
    "Boundaries are Between",
  );
  for (const word of [
    "Class boundaries",
    "Class width",
    "Class limits",
    "Class mark",
  ]) {
    await lab.getByRole("button", { name: word, exact: true }).click();
    await lab.getByRole("button", { name: "Next prompt", exact: true }).click();
  }
  await expect(lab.getByText(/All four recalled/)).toBeVisible();
});
test("calculation feedback catches limit-subtraction width and supports decimal transfer", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await lab
    .getByRole("button", { name: "Calculate and check", exact: true })
    .click();
  const names = [
    "Lower class limit",
    "Upper class limit",
    "Lower class boundary",
    "Upper class boundary",
    "Class mark",
    "Class width",
  ];
  for (const [i, value] of ["36", "40", "35.5", "40.5", "38", "4"].entries())
    await lab.getByLabel(names[i], { exact: true }).fill(value);
  await lab
    .getByRole("button", { name: "Check my values", exact: true })
    .click();
  await expect(
    lab.getByText(/Use the whole bar between boundaries/),
  ).toContainText("40.5 − 35.5 = 5");
  await lab.getByLabel("Class width", { exact: true }).fill("5");
  await lab
    .getByRole("button", { name: "Check my values", exact: true })
    .click();
  await expect(lab.getByRole("status")).toContainText(
    "All six values are correct",
  );
  await lab.getByLabel("Class example").selectOption("2");
  for (const [i, value] of [
    "7.1",
    "7.5",
    "7.05",
    "7.55",
    "7.3",
    "0.5",
  ].entries())
    await lab.getByLabel(names[i], { exact: true }).fill(value);
  await lab
    .getByRole("button", { name: "Check my values", exact: true })
    .click();
  await expect(lab.getByRole("status")).toContainText(
    "All six values are correct",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await lab.screenshot({
    path: "test-results/statistics-four-words-phone.png",
  });
});
test("word playback pauses and teacher hidden answers suppress worked values", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await lab
    .getByRole("button", { name: "Play the four words", exact: true })
    .click();
  const boundary = lab.getByRole("button", {
    name: /B Boundaries are Between/,
  });
  await expect(boundary).toHaveAttribute("aria-pressed", "true", {
    timeout: 5000,
  });
  await lab
    .getByRole("button", { name: "Pause the four words", exact: true })
    .click();
  await page.waitForTimeout(2400);
  await expect(boundary).toHaveAttribute("aria-pressed", "true");
  await page
    .locator("summary")
    .filter({ hasText: "Teacher & sharing tools" })
    .click();
  await page
    .getByRole("button", { name: "Hide model answers", exact: true })
    .click();
  await expect(lab.getByTestId("vocabulary-diagram")).not.toContainText("35.5");
  await expect(
    lab.getByRole("button", { name: "Play the four words", exact: true }),
  ).toBeDisabled();
});
