import { test, expect } from "@playwright/test";
import { lessons } from "../../src/apps/polynomials/bank";

test("table keeps signed terms visible and reveals degree sums", async ({
  page,
}) => {
  await page.goto("/apps/polynomials#textbook:e=10B-19d");
  const next = page.getByRole("button", { name: "Next step", exact: true });
  await next.click();
  await expect(page.getByTestId("table-polynomial")).toBeVisible();
  await expect(page.getByTestId("signed-term")).toHaveCount(4);
  await expect(page.getByTestId("term-degree")).toHaveCount(0);
  await next.click();
  await next.click();
  await expect(page.getByTestId("term-degree")).toHaveCount(4);
  await expect(
    page.getByTestId("term-degree").first().getByRole("math"),
  ).toHaveAttribute("aria-label", /3\+4/);
  await page.screenshot({
    path: "out/polynomials-full-bank/table-degree-sums.png",
    fullPage: true,
    animations: "disabled",
  });
});

test("Q55 highlights the triangle used in each area product", async ({
  page,
}) => {
  await page.goto("/apps/polynomials#textbook:e=REV-55b");
  const next = page.getByRole("button", { name: "Next step", exact: true });
  for (let i = 0; i < 12; i++) await next.click();
  await expect(page.getByTestId("triangle-ADC")).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(page.getByTestId("triangle-ABC")).toHaveAttribute(
    "data-active",
    "false",
  );
  await page.screenshot({
    path: "out/polynomials-full-bank/Q55-second-triangle.png",
    fullPage: true,
    animations: "disabled",
  });
  while (await next.isEnabled()) await next.click();
  for (const triangle of ["ABC", "ADC"]) {
    await expect(page.getByTestId(`triangle-${triangle}`)).toHaveAttribute(
      "data-active",
      "true",
    );
  }
  await page.screenshot({
    path: "out/polynomials-full-bank/Q55-combined-area.png",
    fullPage: true,
    animations: "disabled",
  });
});

test("all five banks are searchable and navigation resets playback", async ({
  page,
}) => {
  await page.goto("/apps/polynomials#textbook:e=10D-34b");
  await expect(page.getByText("158 questions", { exact: true })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Exercise", exact: true })
    .selectOption("10A");
  await page.getByRole("button", { name: "Q21(a)", exact: true }).click();
  await expect(page).toHaveURL(/e=10A-21a/);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page
    .getByRole("button", { name: "Next question", exact: true })
    .click();
  await expect(page).toHaveURL(/e=10A-21b/);
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "0",
  );
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-playing",
    "false",
  );
  await page
    .getByRole("searchbox", { name: "Find a question", exact: true })
    .fill("no matching question");
  await expect(
    page.getByText("No questions match these filters."),
  ).toBeVisible();
});

test("question search accepts displayed labels and compact references", async ({
  page,
}) => {
  await page.goto("/apps/polynomials#textbook:e=10D-34b");
  const search = page.getByRole("searchbox", {
    name: "Find a question",
    exact: true,
  });
  const matches = page.getByRole("button", { name: "Q34(b)", exact: true });
  for (const query of ["Q34(b)", "34(b)", " q34(b) ", "Q34b", "34b"]) {
    await search.fill(query);
    await expect(matches, query).toHaveCount(3);
  }
  await page
    .getByRole("combobox", { name: "Exercise", exact: true })
    .selectOption("10D");
  await search.fill("Q34(b)");
  await expect(matches).toHaveCount(1);
  await search.fill("10D-34b");
  await expect(matches).toHaveCount(1);
  await matches.click();
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-question",
    "10D-34b",
  );
});

test("skip to content preserves the current question and playback", async ({
  page,
}) => {
  await page.goto("/apps/polynomials#textbook:e=10D-26a");
  const player = page.getByTestId("polynomial-player");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.clock.install({ time: new Date("2026-10-25T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-25T12:00:01Z"));
  await page.getByRole("button", { name: "Play", exact: true }).click();
  const skip = page.getByRole("link", { name: "Skip to content", exact: true });
  await skip.focus();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#textbook:e=10D-26a$/);
  await expect(page.locator("#site-content")).toBeFocused();
  await expect(player).toHaveAttribute("data-question", "10D-26a");
  await expect(player).toHaveAttribute("data-step", "1");
  await expect(player).toHaveAttribute("data-playing", "true");
  await expect(
    page.getByText(
      "This question link was not recognised. Exercise 10D Q34(b) is shown.",
    ),
  ).toHaveCount(0);
  await page.clock.runFor(1400);
  await expect(player).toHaveAttribute("data-step", "2");
});

test("every textbook entry opens, starts hidden and reaches its complete working", async ({
  page,
}) => {
  test.setTimeout(600000);
  await page.goto("/apps/polynomials");
  await expect(page).toHaveURL(/#textbook:e=10D-34b$/);
  let verified = 0;
  for (const lesson of lessons) {
    await page.goto(`/apps/polynomials#textbook:e=${lesson.id}`);
    const player = page.getByTestId("polynomial-player");
    await expect(player).toHaveAttribute("data-question", lesson.id);
    await expect(player).toHaveAttribute("data-step", "0");
    await expect(page.getByTestId("working-line")).toHaveCount(
      lesson.id === "10D-34b" ? 1 : 0,
    );
    const next = page.getByRole("button", { name: "Next step", exact: true });
    let advances = 0;
    while (await next.isEnabled()) {
      await next.click();
      if (++advances > 90) throw new Error(`Unbounded lesson ${lesson.id}`);
    }
    await expect(page.getByTestId("working-line")).toHaveCount(
      lesson.id === "10D-34b" ? 8 : lesson.steps.length,
    );
    expect(await page.locator(".katex-error").count(), lesson.id).toBe(0);
    await page.getByText("View source question", { exact: true }).click();
    const source = page.getByTestId("source-question");
    await expect(source).toBeVisible();
    await expect
      .poll(() =>
        source.evaluate((el) => (el as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(100);
    if (++verified % 20 === 0 || verified === lessons.length)
      console.log(
        `Verified ${verified}/${lessons.length} complete demonstrations.`,
      );
  }
});

for (const [id, width, height] of [
  ["10C-25b", 390, 844],
  ["10B-19d", 360, 640],
  ["10D-30a", 844, 390],
  ["REV-54a", 1366, 900],
  ["REV-55b", 1920, 1080],
  ["REV-56b", 390, 844],
] as const) {
  test(`${id} specialist teaching layout ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto(`/apps/polynomials#textbook:e=${id}`);
    if (width === 1920)
      await page
        .getByRole("button", { name: "Projection mode", exact: true })
        .click();
    const next = page.getByRole("button", { name: "Next step", exact: true });
    for (let i = 0; i < 4 && (await next.isEnabled()); i++) await next.click();
    await page.getByTestId("polynomial-board").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const box = await next.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    await page.screenshot({
      path: `out/polynomials-full-bank/${id}-${width}.png`,
      fullPage: width > 1000,
      animations: "disabled",
    });
  });
}
