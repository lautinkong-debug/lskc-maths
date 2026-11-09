import { expect, test } from "@playwright/test";

test("the library remembers form and search on reload and return from a lesson", async ({
  page,
}) => {
  await page.goto("/apps?level=F5");
  const search = page.getByRole("searchbox", { name: "Search apps" });
  await search.fill("Circle");
  const circle = page.getByRole("link", { name: /Circle Lab/ });
  await expect(circle).toBeVisible();
  await circle.click();
  await expect(page).toHaveURL(/\/apps\/circle-properties\?level=F5&q=Circle/);
  await page.getByRole("link", { name: /All web apps/i }).click();
  await expect(search).toHaveValue("Circle");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "F5", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "F2", exact: true }).click();
  await expect(circle).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/apps$/);
  await expect(circle).toBeVisible();
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
    .locator("#portal-menu")
    .getByRole("link", { name: "Web apps", exact: true })
    .click();
  await expect(page).toHaveURL(/\/apps$/);
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("link", { name: /Circle Lab/ }).first()).toBeVisible();
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
  await page.getByRole("link", { name: /All web apps/ }).click();
  await expect(
    page.getByRole("heading", { name: "Web apps", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
