import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "09 · Four words, one class", exact: true })
    .click();
});
test("class interval is the fifth word and outlines the listed group", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  const interval = lab.getByRole("button", { name: /I Class interval/ });
  await expect(interval).not.toContainText("one group of values");
  for (const name of [
    /L Class limit/,
    /B Class boundary/,
    /M Class mark/,
    /W Class width/,
  ])
    await expect(lab.getByRole("button", { name })).toBeVisible();
  await interval.click();
  await expect(interval).toHaveAttribute("aria-pressed", "true");
  await expect(lab.getByTestId("limit-strip-1")).toHaveAttribute(
    "stroke",
    "#da2127",
  );
  await expect(lab.getByTestId("limit-strip-1")).toHaveAttribute(
    "stroke-width",
    "5",
  );
  await expect(
    lab.getByRole("button", { name: "Play the five words", exact: true }),
  ).toBeVisible();
});
test("six calculation methods retain the graph and reveal the right operands and results", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  const original = await lab.getByTestId("vocabulary-diagram").elementHandle();
  await lab
    .getByRole("button", { name: "Animate a calculation", exact: true })
    .click();
  const lesson = lab.getByRole("region", {
    name: "Animate a calculation",
    exact: true,
  });
  for (const [kind, result, field] of [
    ["markLimits", "38", 4],
    ["markBoundaries", "38", 4],
    ["upperLimit", "40.5", 3],
    ["upperBoundary", "40.5", 3],
    ["lowerLimit", "35.5", 2],
    ["lowerBoundary", "35.5", 2],
  ] as const) {
    await lesson.getByRole("combobox").selectOption(kind);
    await expect(lesson.getByRole("status")).toContainText("1 / 4");
    for (let i = 0; i < 3; i++)
      await lesson
        .getByRole("button", { name: "Next step", exact: true })
        .click();
    await expect(lesson.getByRole("status")).toContainText("4 / 4");
    await expect(lesson.getByRole("math")).toContainText(result);
    await expect(lab.getByTestId(`focus-ring-${field}`)).toBeVisible();
    expect(await original!.evaluate((el) => el.isConnected)).toBe(true);
    await expect(lab.locator("svg")).toHaveCount(1);
  }
  await lab.getByLabel("Class example").selectOption("7");
  await expect(lesson).toHaveCount(0);
  await lab
    .getByRole("button", { name: "Animate a calculation", exact: true })
    .click();
  await lesson.getByRole("combobox").selectOption("lowerLimit");
  for (let i = 0; i < 3; i++)
    await lesson
      .getByRole("button", { name: "Next step", exact: true })
      .click();
  await expect(lesson.getByRole("math")).toContainText("0.415");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await lesson.screenshot({ path: "test-results/calculation-mobile.png" });
});
test("calculation playback pauses, replays, goes backwards and respects hidden answers", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await lab
    .getByRole("button", { name: "Animate a calculation", exact: true })
    .click();
  const lesson = lab.getByRole("region", {
    name: "Animate a calculation",
    exact: true,
  });
  await lesson
    .getByRole("button", { name: "Play calculation", exact: true })
    .click();
  await expect(lesson.getByRole("status")).toContainText("2 / 4", {
    timeout: 4000,
  });
  await lesson
    .getByRole("button", { name: "Pause calculation", exact: true })
    .click();
  await page.waitForTimeout(2400);
  await expect(lesson.getByRole("status")).toContainText("2 / 4");
  await lesson.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(lesson.getByRole("status")).toContainText("3 / 4");
  await lesson
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(lesson.getByRole("status")).toContainText("2 / 4");
  await lesson.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(lesson.getByRole("status")).toContainText("1 / 4");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await lesson
      .getByRole("status")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page
    .locator("summary")
    .filter({ hasText: "Teacher & sharing tools" })
    .click();
  await page
    .getByRole("button", { name: "Hide model answers", exact: true })
    .click();
  await expect(lesson).toHaveCount(0);
  await expect(lab.getByTestId("diagram-emphasis")).toHaveCount(0);
});
