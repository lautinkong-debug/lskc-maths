import { expect, test } from "@playwright/test";

test("the library filters by topic text and level, then clears both", async ({
  page,
}) => {
  await page.goto("/apps");
  await expect(page.getByText("5 apps found", { exact: true })).toBeVisible();
  await page.getByLabel("Search apps", { exact: true }).fill("directed");
  await expect(
    page.getByRole("heading", { name: "Directed number operations" }),
  ).toBeVisible();
  await expect(page.getByText("1 app found", { exact: true })).toBeVisible();
  await page.getByLabel("Level", { exact: true }).selectOption("F2");
  await expect(page.locator(".studio-app-card")).toHaveCount(0);
  await page.getByRole("button", { name: /Clear filters/ }).click();
  await expect(page.locator(".studio-app-card")).toHaveCount(5);
  await page.getByLabel("Level", { exact: true }).selectOption("F2");
  await expect(
    page.getByRole("heading", { name: "Statistical Charts Lab" }),
  ).toBeVisible();
  await expect(page.locator(".studio-app-card")).toHaveCount(1);
});

test("phone navigation and the graph work with reduced motion and keyboard input", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const vertex = page.getByRole("slider", { name: /Vertex/ });
  await vertex.focus();
  await page.keyboard.press("ArrowRight");
  await expect(vertex).toHaveAttribute("aria-valuenow", "1.5");
  await page.getByRole("button", { name: /Reset graph/ }).click();
  await expect(vertex).toHaveAttribute("aria-valuenow", "1");
  await expect(page.locator(".studio-canvas")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .locator("#mobile-nav")
    .getByRole("link", { name: "Web apps", exact: true })
    .click();
  await expect(page).toHaveURL(/\/apps$/);
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".studio-app-card")).toHaveCount(5);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("the graph and routes remain usable without WebGL", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const vertex = page.getByRole("slider", { name: /Vertex/ });
  await vertex.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(vertex).toHaveAttribute("aria-valuenow", "0.5");
  await page.getByRole("link", { name: /Explore the apps/ }).click();
  await expect(
    page.getByRole("heading", { name: "Web apps", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
