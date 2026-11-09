import { test, expect } from "@playwright/test";

test("all six forms open a resource page and keep the selected form across libraries", async ({
  page,
}) => {
  await page.goto("/");
  const forms = page.getByRole("navigation", {
    name: "Browse by form",
    exact: true,
  });
  await expect(forms.getByRole("link")).toHaveCount(6);
  for (let n = 1; n <= 6; n++) {
    await forms.getByRole("link", { name: "Form " + n, exact: true }).click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Form " + n + " mathematics",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Browse apps for this form" }),
    ).toHaveAttribute("href", "/apps?level=F" + n);
    await expect(
      page.getByRole("link", { name: "Browse books for this form" }),
    ).toHaveAttribute("href", "/mistakes-book?level=F" + n);
    await page.getByRole("link", { name: "Browse all forms" }).click();
  }
});

test("a Form 5 pupil can open Circle Lab and return to the same form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const form = page.getByRole("link", { name: "Form 5", exact: true });
  await expect(form).toBeInViewport();
  await form.click();
  const circle = page.getByRole("link", { name: /Circle Lab/ });
  await expect(circle).toHaveAttribute(
    "href",
    "/apps/circle-properties?from=form&level=F5",
  );
  await circle.click();
  await expect(
    page.getByRole("link", { name: "Student class link" }),
  ).toHaveAttribute("href", "/apps/circle-properties/classroom");
  await page.getByRole("link", { name: /Back to Form 5/i }).click();
  await expect(page).toHaveURL(/\/forms\/f5$/);
  await page.getByRole("link", { name: "Browse books for this form" }).click();
  await expect(
    page.getByRole("button", { name: "F5", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: "Join with code", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("unrecognised form URLs lead to a 404", async ({ page }) => {
  const response = await page.goto("/forms/f7");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Form 7 mathematics" }),
  ).toHaveCount(0);
});
