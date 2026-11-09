import { expect, test } from "@playwright/test";

test("a student can choose the activity for a code and return to the classroom", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/join");
  const code = page.getByRole("textbox", { name: "Six-character code" });
  await code.fill("math23");
  await page.getByRole("radio", { name: /Polynomial Tug/ }).check();
  await expect(code).toHaveValue("MAT H23");
  await page.getByRole("button", { name: "Find Tug room" }).click();
  await expect(page).toHaveURL(/\/polynomial-tug\?room=MATH23$/);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Join a class", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Class results/ }).click();
  await expect(
    page.getByRole("heading", { name: "Class results" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Back to classroom/ }).click();
  await expect(page).toHaveURL(/\/join$/);
  await page.getByRole("radio", { name: /Directed Numbers/ }).check();
  await code.fill("math23");
  await page.getByRole("button", { name: "Find challenge" }).click();
  await expect(page).toHaveURL(/\/join\/MATH23$/);
  await expect(
    page.getByRole("heading", { name: "Choose your game identity" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Choose another activity/ }).click();
  await expect(
    page.getByRole("heading", { name: "Join a class", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
