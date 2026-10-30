import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /^Admin:/ }).click();
  await expect(page.getByText("Teacher access is active.")).toBeVisible();
}

test.beforeEach(async ({ baseURL }) => {
  // This suite uploads an actual fixture; it must never write to production.
  expect(new URL(baseURL!).hostname).toBe("localhost");
});

test("teacher-only topic buttons preselect the chapter, level and student edition", async ({
  page,
}) => {
  await page.goto("/manage/topics");
  await expect(
    page.getByRole("heading", { name: "This page is for teachers." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Upload mistakes/ }),
  ).toHaveCount(0);
  await signIn(page);
  await page.goto("/manage/topics");
  await expect(
    page.getByRole("link", { name: /^Upload mistakes/ }),
  ).toHaveCount(13);
  await page.getByRole("button", { name: "F2", exact: true }).click();
  await page.getByRole("link", { name: /^Upload mistakes — 2A01 / }).click();
  await expect(
    page.getByRole("heading", { name: "Upload a Mistakes Book" }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Level", exact: true }),
  ).toHaveValue("F2");
  await expect(
    page.getByRole("combobox", { name: "Edition", exact: true }),
  ).toHaveValue("student");
  const topicId = new URL(page.url()).searchParams.get("topic")!;
  await expect(
    page.getByRole("combobox", { name: "Topic", exact: true }),
  ).toHaveValue(topicId);
  await expect(
    page.locator("select option:checked").filter({ hasText: /^2A01/ }),
  ).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Level", exact: true })
    .selectOption("F1");
  await expect(
    page.getByRole("combobox", { name: "Topic", exact: true }),
  ).toHaveValue("");
});

test("a teacher uploads from the chapter and a separate student can find and read it", async ({
  page,
  browser,
  baseURL,
}) => {
  await signIn(page);
  await page.goto("/manage/topics");
  await page.getByRole("link", { name: /^Upload mistakes — 1A04 / }).click();
  const title = "Equation corrections " + Date.now();
  await page.getByRole("textbox", { name: "Title", exact: true }).fill(title);
  await page.locator('input[type="file"]').setInputFiles({
    name: "equation-corrections.html",
    mimeType: "text/html",
    buffer: Buffer.from(
      "<!doctype html><html lang='en'><title>Corrections</title><body><h1>Keep both sides equal</h1><p>3x + 2 = 11, so 3x = 9 and x = 3.</p></body></html>",
    ),
  });
  await expect(
    page.getByRole("combobox", { name: "Edition", exact: true }),
  ).toHaveValue("student");
  await page.getByRole("button", { name: "Upload book", exact: true }).click();
  await expect(page).toHaveURL(/\/mistakes-book\/[^/?]+$/);
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  const student = await browser.newContext({ baseURL });
  try {
    const reader = await student.newPage();
    await reader.goto("/mistakes-book");
    await reader
      .getByRole("button", { name: /1A04 Linear Equation in One Unknown/ })
      .click();
    await reader.getByRole("link", { name: new RegExp(title) }).click();
    await expect(
      reader.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(
      reader.getByText("Student edition", { exact: true }),
    ).toBeVisible();
    await expect(
      reader
        .frameLocator("iframe")
        .getByRole("heading", { name: "Keep both sides equal" }),
    ).toBeVisible();
    await reader.screenshot({
      path: "out/linear-equations/student-mistakes-preview.png",
    });
  } finally {
    await student.close();
  }
});

test("topic upload buttons fit on a phone and keep their chapter identity", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.goto("/manage/topics");
  const upload = page.getByRole("link", { name: /^Upload mistakes — 1A04 / });
  await upload.scrollIntoViewIfNeeded();
  await expect(upload).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "out/linear-equations/topic-upload-phone.png",
  });
  await upload.click();
  await expect(
    page.locator("select option:checked").filter({ hasText: /^1A04/ }),
  ).toHaveCount(1);
  await page.screenshot({
    path: "out/linear-equations/topic-upload-form-phone.png",
  });
});

test("stale topic links leave a valid empty selection", async ({ page }) => {
  await signIn(page);
  await page.goto("/manage/upload?topic=missing-topic&level=invalid");
  await expect(
    page.getByRole("combobox", { name: "Topic", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("combobox", { name: "Topic", exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("combobox", { name: "Level", exact: true }),
  ).toHaveValue("F1");
  await expect(
    page.getByRole("combobox", { name: "Edition", exact: true }),
  ).toHaveValue("student");
});
