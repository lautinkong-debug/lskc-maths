import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "08 · Animated walkthroughs", exact: true })
    .click();
});
test("leaf counting plays, pauses, replays and finishes with frequencies and shape", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Animated walkthroughs",
    exact: true,
  });
  await lab.getByLabel("Playback speed").selectOption("900");
  await lab
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await expect(lab.getByTestId("animation-step")).not.toHaveText("0 / 16");
  await lab
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  const stopped = await lab.getByTestId("animation-step").textContent();
  await page.waitForTimeout(1100);
  await expect(lab.getByTestId("animation-step")).toHaveText(stopped!);
  await lab
    .getByRole("button", { name: "Replay animation", exact: true })
    .click();
  await expect(lab.getByTestId("animation-step")).toHaveText("0 / 16");
  await lab
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  for (let i = 0; i < 16; i++)
    await lab.getByRole("button", { name: "Next step", exact: true }).click();
  expect(
    await lab
      .locator("[data-animation-bar]")
      .evaluateAll((nodes) =>
        nodes.map((n) => Number(n.getAttribute("data-frequency"))),
      ),
  ).toEqual([2, 4, 6, 3]);
  await expect(lab.getByTestId("animation-narration")).toContainText(
    "left-skewed",
  );
  await page.waitForTimeout(1100);
  await lab.screenshot({ path: "test-results/statistics-animated-leaves.png" });
});
test("cumulative increases include zero-frequency intervals; weight table reveals all five answers", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Animated walkthroughs",
    exact: true,
  });
  await lab.getByLabel("Teaching sequence").selectOption("1");
  for (let i = 0; i < 3; i++)
    await lab.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(lab.getByTestId("animation-narration")).toContainText(
    "8 − 8 = 0",
  );
  await expect(lab.locator('[data-animation-bar="2"]')).toHaveAttribute(
    "data-frequency",
    "0",
  );
  await lab.getByLabel("Teaching sequence").selectOption("2");
  for (let i = 0; i < 5; i++)
    await lab.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(lab.getByTestId("animation-narration")).toContainText(
    "z = 33 + 3 = 36",
  );
  expect(
    await lab
      .locator("table")
      .first()
      .locator("tbody tr td:last-child")
      .allTextContents(),
  ).toEqual(["5", "12", "11", "5", "3"]);
  expect(
    await lab
      .locator("table")
      .last()
      .locator("tbody tr td:last-child")
      .allTextContents(),
  ).toEqual(["5", "17", "28", "33", "36"]);
  await page.waitForTimeout(600);
  await lab.screenshot({ path: "test-results/statistics-animated-tables.png" });
});
test("reading guides animate across then down, explain the complement and support reduced motion", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Animated walkthroughs",
    exact: true,
  });
  await lab.getByLabel("Teaching sequence").selectOption("3");
  for (let i = 0; i < 3; i++)
    await lab.getByRole("button", { name: "Next step", exact: true }).click();
  const guide = lab.locator('[data-reading-guide="horizontal"]');
  await expect(guide).toHaveCount(1);
  await expect(lab.locator('[data-reading-guide="vertical"]')).toHaveCount(0);
  await expect
    .poll(() =>
      guide.evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).strokeDashoffset),
      ),
    )
    .toBeLessThan(1);
  await lab.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(lab.getByTestId("animation-narration")).toContainText("560.5");
  await expect(lab.locator('[data-reading-guide="vertical"]')).toHaveCount(1);
  await page.waitForTimeout(1100);
  await lab.screenshot({ path: "test-results/statistics-animated-median.png" });
  for (let i = 0; i < 3; i++)
    await lab.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(lab.getByTestId("animation-narration")).toContainText("750.5");
  for (let i = 0; i < 3; i++)
    await lab.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(lab.getByTestId("animation-narration")).toContainText(
    "80 − 25 = 55",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await guide.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "none",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await lab.screenshot({ path: "test-results/statistics-animated-phone.png" });
});
