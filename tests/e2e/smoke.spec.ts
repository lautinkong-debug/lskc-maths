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
  await expect(page.getByText("Teacher access is active.")).toBeVisible();
  await page.goto("/manage/topics");
  await expect(
    page.getByRole("heading", { name: "Manage topics" }),
  ).toBeVisible();
});

test("a visitor can browse seeded Mistakes Book topics", async ({ page }) => {
  await page.goto("/mistakes-book");
  await expect(page).toHaveTitle(/Mistakes book/);
  await expect(
    page.getByRole("heading", { name: "Mistakes book" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /1A02 Directed Numbers and the Number Line/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Directed Numbers and the Number Line" }),
  ).toBeVisible();
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
  const vertex = page.getByRole("slider", { name: /Vertex/ });
  await expect(vertex).toHaveAttribute("aria-valuenow", "1");
  await vertex.focus();
  await page.keyboard.press("ArrowRight");
  await expect(vertex).toHaveAttribute("aria-valuenow", "1.5");
});
