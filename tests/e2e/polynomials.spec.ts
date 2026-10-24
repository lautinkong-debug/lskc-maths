import { expect, test } from "@playwright/test";

const url = "/apps/polynomials#textbook:e=10D-34b";

test("playback, speed, pause, previous and replay cancel old timers", async ({
  page,
}) => {
  await page.goto(url);
  const player = page.getByTestId("polynomial-player");
  await expect(player).toBeVisible();
  await page.clock.install({ time: new Date("2026-10-23T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-23T12:00:01Z"));
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.runFor(1400);
  await expect(player).toHaveAttribute("data-step", "1");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(3000);
  await expect(player).toHaveAttribute("data-step", "1");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.runFor(700);
  await page
    .getByRole("combobox", { name: "Speed", exact: true })
    .selectOption("2600");
  await page.clock.runFor(1400);
  await expect(player).toHaveAttribute("data-step", "1");
  await page.clock.runFor(1100);
  await expect(player).toHaveAttribute("data-step", "1");
  await page.clock.runFor(100);
  await expect(player).toHaveAttribute("data-step", "2");
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await page.clock.runFor(3000);
  await expect(player).toHaveAttribute("data-step", "1");
  await expect(player).toHaveAttribute("data-playing", "false");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .click();
  await page.clock.runFor(3000);
  await expect(player).toHaveAttribute("data-step", "0");
  await expect(player).toHaveAttribute("data-playing", "false");
  await page
    .getByRole("combobox", { name: "Speed", exact: true })
    .selectOption("1400");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  for (let i = 1; i <= 15; i++) {
    await page.clock.runFor(1400);
    await expect(player).toHaveAttribute("data-step", String(i));
  }
  await expect(player).toHaveAttribute("data-playing", "false");
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeDisabled();
});

test("source crop, keyboard, reload, deep links and folded sidebar work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/apps/polynomials");
  await expect(page.getByTestId("polynomial-board")).toBeVisible();
  await expect(page).toHaveURL(/#textbook:e=10D-34b$/);
  const next = page.getByRole("button", { name: "Next step", exact: true });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "1",
  );
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "1",
  );
  await page
    .getByRole("button", { name: "Show lesson menu", exact: true })
    .click();
  await page.getByText("View source question", { exact: true }).click();
  const source = page.getByRole("img", { name: /Exercise 10D Q34, textbook/ });
  await expect(source).toBeVisible();
  await expect
    .poll(() => source.evaluate((el) => (el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(1000);
  await page.reload();
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "0",
  );
  await page.goto("/apps/polynomials#missing-question");
  await expect(
    page.getByText(/This question link was not recognised/),
  ).toBeVisible();
});

for (const [width, height] of [
  [1366, 900],
  [390, 844],
  [360, 640],
  [844, 390],
]) {
  test(`readable teaching board and reachable controls at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto(url);
    const player = page.getByTestId("polynomial-player");
    const board = page.getByTestId("polynomial-board");
    const next = page.getByRole("button", { name: "Next step", exact: true });
    await expect(board).toBeVisible();
    for (let i = 0; i < 6; i++) await next.click();
    await board.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `out/polynomials-preview/products-${width}x${height}.png`,
      animations: "disabled",
      fullPage: width > 1000,
    });
    for (let i = 6; i < 13; i++) await next.click();
    await expect(player).toHaveAttribute("data-step", "13");
    await board.scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const rect = await next.boundingBox();
    expect(rect!.y).toBeGreaterThanOrEqual(0);
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(height);
    await page.screenshot({
      path: `out/polynomials-preview/signs-${width}x${height}.png`,
      animations: "disabled",
      fullPage: width > 1000,
    });
    await next.click();
    await next.click();
    await expect(page.getByTestId("working-line")).toHaveCount(8);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("projection preserves progress and makes the full working readable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url);
  const next = page.getByRole("button", { name: "Next step", exact: true });
  for (let i = 0; i < 13; i++) await next.click();
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "13",
  );
  await expect(page.locator('[data-presentation="true"]')).toBeVisible();
  await page.getByTestId("polynomial-board").scrollIntoViewIfNeeded();
  await page.screenshot({
    animations: "disabled",
    path: "out/polynomials-preview/projection-signs.png",
  });
  await next.click();
  await next.click();
  await expect(page.getByTestId("working-line")).toHaveCount(8);
  const last = page.getByTestId("working-line").last();
  expect(
    await last
      .locator('[role="math"]')
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(24);
  await page.screenshot({
    animations: "disabled",
    path: "out/polynomials-preview/projection-answer.png",
  });
  await page
    .getByRole("button", { name: "Leave projection mode", exact: true })
    .click();
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "15",
  );
});

test("touch and reduced motion retain the same teaching sequence", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(url);
  const next = page.getByRole("button", { name: "Next step", exact: true });
  for (let i = 0; i < 3; i++) await next.tap();
  const arrow = page.getByTestId("polynomial-board").locator("svg > path");
  await expect(arrow).toBeVisible();
  expect(await arrow.evaluate((el) => getComputedStyle(el).animationName)).toBe(
    "none",
  );
  await next.tap();
  await expect(page.getByTestId("product-value")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .tap();
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "0",
  );
  await context.close();
});

test("the F1 library finds the integrated polynomial app by chapter code", async ({
  page,
}) => {
  await page.goto("/apps");
  await page
    .getByRole("combobox", { name: "Level", exact: true })
    .selectOption("F1");
  await page
    .getByRole("searchbox", { name: "Search apps", exact: true })
    .fill("1A10");
  await page.getByRole("link", { name: /Polynomials/ }).click();
  await expect(page.getByTestId("polynomial-board")).toBeVisible();
});
test("the pilot starts with the question and no answer in the DOM", async ({
  page,
}) => {
  await page.goto(url);
  await expect(page.getByTestId("polynomial-board")).toBeVisible();
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "0",
  );
  await expect(page.getByTestId("working-line")).toHaveCount(1);
  await expect(page.locator('[aria-label="-7x^{2}-24x-16"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Previous step", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeEnabled();
});

test("each factor pair is highlighted before its product and every equality is retained", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  const next = page.getByRole("button", { name: "Next step", exact: true });
  for (let i = 0; i < 3; i++) await next.click();
  await expect(page.getByTestId("product-cell-0")).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(page.getByTestId("product-value")).toHaveCount(0);
  for (let i = 0; i < 4; i++) {
    await next.click();
    await expect(page.getByTestId("product-value")).toHaveCount(i + 1);
    if (i < 3) await next.click();
  }
  await expect(page.getByTestId("working-line")).toHaveCount(4);
  await next.click();
  await next.click();
  await expect(page.getByTestId("polynomial-player")).toHaveAttribute(
    "data-step",
    "12",
  );
  await expect(page.getByTestId("minus-rule")).toHaveAttribute(
    "data-revealed",
    "false",
  );
  await next.click();
  await expect(page.getByTestId("minus-rule")).toHaveAttribute(
    "data-revealed",
    "true",
  );
  await expect(page.getByTestId("changed-sign")).toHaveCount(3);
  await next.click();
  await next.click();
  await expect(page.getByTestId("working-line")).toHaveCount(8);
  await expect(next).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByTestId("polynomial-player").locator(".katex-error"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(page.getByTestId("working-line")).toHaveCount(7);
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .click();
  await expect(page.getByTestId("working-line")).toHaveCount(1);
  expect(errors).toEqual([]);
});
