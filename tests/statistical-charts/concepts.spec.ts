import { test, expect } from "@playwright/test";
test("stem-and-leaf counts, shape feedback, custom ages and next example", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "07 · Connect the representations",
      exact: true,
    })
    .click();
  const lab = page.getByRole("region", {
    name: "Connect the representations",
    exact: true,
  });
  await expect(
    lab.getByText("Key: 2 | 3 represents 23 years", { exact: true }),
  ).toBeVisible();
  await lab
    .getByRole("button", { name: "Option C: Right-skewed", exact: true })
    .click();
  await lab
    .getByRole("button", { name: "Check and explain", exact: true })
    .click();
  await expect(lab.getByText(/Look again at the evidence/)).toBeVisible();
  await expect(
    lab.getByTestId("concept-explanation").locator("tfoot td").first(),
  ).toHaveText("15");
  await lab
    .getByRole("button", { name: "Option A: Left-skewed", exact: true })
    .click();
  await lab
    .getByRole("button", { name: "Check and explain", exact: true })
    .click();
  await expect(lab.getByText(/Correct. Follow/)).toBeVisible();
  await page.screenshot({
    path: "test-results/statistical-stem-concept.png",
    fullPage: true,
  });
  await lab.getByRole("button", { name: "Next example", exact: true }).click();
  await expect(lab.getByTestId("concept-explanation")).toHaveCount(0);
  await lab
    .getByRole("button", { name: "Option C: Right-skewed", exact: true })
    .click();
  await lab
    .getByRole("button", { name: "Check and explain", exact: true })
    .click();
  await expect(lab.getByText(/Correct. Follow/)).toBeVisible();
  await lab.getByText("Edit the ages", { exact: true }).click();
  await lab
    .getByRole("textbox", { name: "Ages of staff in a company", exact: true })
    .fill("20, 20, 31, 45, 59");
  await lab.getByRole("button", { name: "Apply ages", exact: true }).click();
  await expect(page.getByTestId("lab-total")).toHaveText("5");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("cumulative plateau gives zero bars and edited frequencies update the polygon", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "07 · Connect the representations",
      exact: true,
    })
    .click();
  const lab = page.getByRole("region", {
    name: "Connect the representations",
    exact: true,
  });
  await lab
    .getByRole("button", {
      name: "Cumulative frequency → histogram",
      exact: true,
    })
    .click();
  await lab.getByRole("button", { name: /Option B:/ }).click();
  await lab
    .getByRole("button", { name: "Check and explain", exact: true })
    .click();
  await expect(lab.getByText(/Correct. Follow/)).toBeVisible();
  await expect(lab.locator('[data-bar="2"]')).toHaveAttribute(
    "data-frequency",
    "0",
  );
  await expect(lab.locator('[data-bar="3"]')).toHaveAttribute(
    "data-frequency",
    "0",
  );
  await lab.getByLabel("Frequency: 20 ≤ x < 30", { exact: true }).fill("5");
  await expect(lab.locator('[data-bar="2"]')).toHaveAttribute(
    "data-frequency",
    "5",
  );
  await expect(lab.locator("tfoot td").first()).toHaveText("21");
  await page.screenshot({
    path: "test-results/statistical-cumulative-concept.png",
    fullPage: true,
  });
  await page.reload();
  await expect(lab).toBeVisible();
  await expect(page.getByTestId("lab-total")).toHaveText("21");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
