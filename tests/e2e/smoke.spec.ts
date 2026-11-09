import { expect, test } from "@playwright/test";

test("teacher pages require sign-in, then admit a seeded admin", async ({
  page,
}) => {
  await page.goto("/manage/topics");
  await expect(page).toHaveTitle(/Manage topics/);
  await expect(
    page.getByRole("heading", { name: "This page is for teachers." }),
  ).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByRole("button", { name: /^Admin:/ }).click();
  await expect(page).toHaveURL(/\/manage\/topics$/);
  await expect(
    page.getByRole("heading", { name: "Manage topics" }),
  ).toBeVisible();
});

test("a visitor can open a form-filtered correction library and clear the search", async ({
  page,
}) => {
  await page.goto("/mistakes-book?level=F5&q=unmatchedbooktitle");
  await expect(page).toHaveTitle(/Mistakes book/);
  await expect(
    page.getByRole("heading", { name: "Mistakes book" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "F5", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("searchbox", { name: "Search correction books" }),
  ).toHaveValue("unmatchedbooktitle");
  await expect(page.getByText("0 books found", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/mistakes-book$/);
});

test("a visitor can open and use a Web App", async ({ page }) => {
  await page.goto("/apps");
  await page.getByRole("link", { name: /Quadratic explorer/ }).click();
  await expect(
    page.getByRole("heading", { name: "Quadratic explorer" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Quadratic explorer/);
  const presentation = page.getByRole("button", { name: "Projection mode" });
  await expect(presentation).toBeEnabled();
  await presentation.click();
  await expect(presentation).toHaveAttribute("aria-pressed", "true");
});

test("the Home graph and mobile menu work with a keyboard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  const vertex = page.getByRole("slider", { name: /Vertex/ });
  await expect(vertex).toHaveAttribute("aria-valuenow", "1");
  await vertex.focus();
  await page.keyboard.press("ArrowRight");
  await expect(vertex).toHaveAttribute("aria-valuenow", "1.5");
});
