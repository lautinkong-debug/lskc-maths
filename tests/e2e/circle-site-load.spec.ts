import { expect, test, type Page, type Request } from "@playwright/test";

/**
 * What a class costs to open, on the production build. Run after `npx next build`.
 * These numbers are what let 32 iPads open the lesson together on one Wi-Fi link.
 */
const lesson = "/apps/circle-properties";
const firebase =
  /firestore|identitytoolkit|securetoken|firebaseinstallations|127\.0\.0\.1:(8080|9099|9199)/;

test.use({
  actionTimeout: 10_000,
  viewport: { width: 820, height: 1180 },
  isMobile: true,
  hasTouch: true,
});

async function ready(page: Page) {
  await expect(page.getByTestId("paper-circle")).toBeVisible();
  const next = page
    .getByRole("group", { name: "Demonstration controls" })
    .getByRole("button")
    .first();
  await next.tap();
  await expect(page.getByTestId("paper-circle")).toHaveAttribute(
    "data-stage",
    "1",
  );
}

test("a student opens the lesson without touching Firebase or other apps", async ({
  page,
}) => {
  const requests: Request[] = [];
  const scripts: string[] = [];
  page.on("request", (request) => requests.push(request));
  page.on("response", async (response) => {
    if (response.request().resourceType() === "script")
      scripts.push(await response.text().catch(() => ""));
  });
  await page.goto(lesson);
  await ready(page);
  // Long enough for anything put off until after the first screen.
  await page.waitForTimeout(4000);
  // A visitor is settled as signed out without the SDK having been loaded.
  await page.getByRole("button", { name: "Menu" }).tap();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  expect(requests.map((r) => r.url()).filter((u) => firebase.test(u))).toEqual(
    [],
  );
  expect(requests.length).toBeLessThanOrEqual(25);
  // Next's small background fetches of other pages are switched off here.
  expect(requests.filter((r) => r.url().includes("_rsc="))).toEqual([]);
  const code = scripts.join("\n");
  expect(code).not.toContain("WebGLRenderer");
  expect(code).not.toContain("village-module");
  expect(code).not.toContain("surface-area-module");
  expect(code).not.toContain("KaTeX parse error");
});

test("the lesson opens with Firebase completely unreachable", async ({
  page,
}) => {
  await page.route(firebase, (route) => route.abort());
  await page.route(/googleapis|firebaseapp/, (route) => route.abort());
  await page.goto(lesson);
  await ready(page);
});

test("a whole class is served from the cache, not one request each", async ({
  request,
}) => {
  for (const path of [lesson, `${lesson}/classroom`]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const cache = response.headers()["cache-control"];
    expect(cache, path).toContain("s-maxage=");
    expect(cache, path).not.toContain("no-store");
    expect(cache, path).not.toContain("private");
  }
});

test("the small favicon stays small", async ({ page, request }) => {
  await page.goto(lesson);
  const href = await page
    .locator('link[rel="icon"]')
    .first()
    .getAttribute("href");
  const icon = await request.get(href!);
  expect((await icon.body()).length).toBeLessThan(20_000);
});

test("an unknown app is still a 404", async ({ request }) => {
  expect((await request.get("/apps/no-such-app")).status()).toBe(404);
});

test("a download cut off by the Wi-Fi offers a way back", async ({ page }) => {
  const html = await (await page.request.get(lesson)).text();
  const onPage = (url: string) => html.includes(new URL(url).pathname);
  await page.route("**/_next/static/chunks/*.js", (route) =>
    onPage(route.request().url()) ? route.continue() : route.abort(),
  );
  await page.goto(lesson);
  const reload = page.getByRole("button", { name: "Reload the page" });
  await expect(reload).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole("alert").filter({ hasText: "did not finish downloading" }),
  ).toBeVisible();
  await page.unroute("**/_next/static/chunks/*.js");
  await reload.tap();
  await ready(page);
});

test("the sign-in page still starts Firebase for teachers", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", async (response) => {
    if (response.request().resourceType() === "script")
      scripts.push(await response.text().catch(() => ""));
  });
  await page.goto("/login");
  await expect
    .poll(() => scripts.join("\n").includes("identitytoolkit"), {
      timeout: 15_000,
    })
    .toBe(true);
});

for (const [width, height] of [
  [744, 1133],
  [1024, 768],
  [1180, 820],
]) {
  test.describe(`on the website at ${width}x${height}`, () => {
    test.use({ viewport: { width, height } });

    test("the step buttons and heading stay inside the panel", async ({
      page,
    }) => {
      await page.goto(lesson);
      const steps = page
        .getByRole("navigation", { name: "Lesson steps" })
        .getByRole("button");
      await expect(steps).toHaveCount(7);
      const panel = (await page.locator("aside").last().boundingBox())!;
      for (let i = 0; i < 7; i++) {
        await steps.nth(i).tap();
        const box = (await steps.nth(i).boundingBox())!;
        expect(box.x + box.width).toBeLessThanOrEqual(panel.x + panel.width);
        // Browsers report layout in fractions of a pixel: 44 can read as 43.99997.
        expect(box.height).toBeGreaterThanOrEqual(43.99);
      }
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });
  });
}
