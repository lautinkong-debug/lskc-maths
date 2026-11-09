import { expect, test, type Page } from "@playwright/test";

async function signInFromGate(
  page: Page,
  account: "Teacher" | "Admin" | "Viewer",
) {
  await page
    .getByRole("main")
    .getByRole("link", { name: "Sign in", exact: true })
    .click();
  await page
    .getByRole("button", { name: new RegExp("^" + account + ":") })
    .click();
}

test.beforeEach(async ({ baseURL }) => {
  expect(["127.0.0.1", "localhost"]).toContain(new URL(baseURL!).hostname);
});

test("teacher returns to the selected chapter upload and can prepare or run a lesson", async ({
  page,
}) => {
  await page.goto("/manage/topics");
  await signInFromGate(page, "Teacher");
  await expect(page).toHaveURL(/\/manage\/topics$/);
  await page.getByRole("button", { name: "F2", exact: true }).click();
  const chapter = page.getByRole("link", { name: /^Upload mistakes — 2A01/ });
  const uploadUrl = await chapter.getAttribute("href");
  expect(uploadUrl).toMatch(/^\/manage\/upload\?/);
  await page.goto("/login");
  await page
    .getByRole("main")
    .getByRole("button", { name: "Sign out", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Continue with Google", exact: true }),
  ).toBeVisible();
  await page.goto(uploadUrl! + "#upload");
  await signInFromGate(page, "Teacher");
  await expect(page).toHaveURL(
    (url) => url.pathname + url.search + url.hash === uploadUrl + "#upload",
  );
  await expect(
    page.getByRole("combobox", { name: "Level", exact: true }),
  ).toHaveValue("F2");
  await expect(
    page.getByRole("combobox", { name: "Topic", exact: true }),
  ).toHaveValue(new URL(page.url()).searchParams.get("topic")!);
  await expect(
    page.getByRole("combobox", { name: "Edition", exact: true }),
  ).toHaveValue("student");
  await page.goto("/manage");
  const main = page.getByRole("main");
  await expect(
    main.getByRole("heading", { name: "Teacher workspace", exact: true }),
  ).toBeVisible();
  await expect(
    main.getByRole("link", { name: /Browse by form/ }),
  ).toHaveAttribute("href", "/");
  await expect(
    main.getByRole("link", { name: /Polynomial Tug/ }),
  ).toHaveAttribute("href", "/polynomial-tug");
  await expect(main.getByRole("link", { name: /Teacher access/ })).toHaveCount(
    0,
  );
  await main.getByRole("link", { name: /Directed Numbers challenges/ }).click();
  await expect(
    page.getByRole("heading", { name: "Class challenges", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "New Directed Numbers challenge", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Start a class challenge", exact: true }),
  ).toBeVisible();
});

test("a viewer cannot enter the teacher workspace, while an admin can open staff management", async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto("/manage");
  await signInFromGate(page, "Viewer");
  await expect(
    page.getByRole("main").getByText(/don't have teacher access yet/),
  ).toBeVisible();
  await page.goto("/manage");
  await expect(
    page.getByRole("heading", {
      name: "This page is for teachers.",
      exact: true,
    }),
  ).toBeVisible();
  const ctx = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
  });
  try {
    const admin = await ctx.newPage();
    await admin.goto("/manage");
    await signInFromGate(admin, "Admin");
    await admin
      .getByRole("main")
      .getByRole("link", { name: /Teacher access/ })
      .click();
    await expect(
      admin.getByRole("heading", { name: "Manage teachers", exact: true }),
    ).toBeVisible();
    expect(
      await admin.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  } finally {
    await ctx.close();
  }
});
