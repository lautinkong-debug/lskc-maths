import { expect, test, type Page } from "@playwright/test";
async function next(page: Page, times = 1) {
  for (let i = 0; i < times; i++)
    await page.getByRole("button", { name: "Next step", exact: true }).click();
}
async function advanceAutoplay(page: Page, count?: number) {
  const progress = page.getByText(/^Step \d+ of \d+$/);
  const numbers = (await progress.innerText()).match(/\d+/g)!.map(Number);
  const end = count === undefined ? numbers[1] : numbers[0] + count;
  for (let i = numbers[0] + 1; i <= end; i++) {
    await page.clock.runFor(1800);
    await expect(progress).toHaveText(`Step ${i} of ${numbers[1]}`);
  }
}
for (const [expression, sign, calculation] of [
  ["(+50)-(+60)", "Negative: left of 0", "60 − 50 = 10"],
  ["(-50)+(+30)", "Negative: left of 0", "50 − 30 = 20"],
  ["(-50)+(+60)", "Positive: right of 0", "60 − 50 = 10"],
  ["(-50)-(+30)", "Negative: left of 0", "50 + 30 = 80"],
  ["(-50)-(-60)", "Positive: right of 0", "60 − 50 = 10"],
  ["(+50)+(-50)", "Zero: neither positive nor negative", "50 − 50 = 0"],
] as const) {
  test(`brackets before graph: ${expression}`, async ({ page }) => {
    await page.goto(
      `/apps/directed-numbers#sign-magnitude:e=${encodeURIComponent(expression)}`,
    );
    const graph = page.getByTestId("magnitude-line");
    await expect(graph).toHaveAttribute("data-stage", "0");
    await expect(
      page.getByRole("button", { name: "Check prediction" }),
    ).toHaveCount(0);
    await next(page);
    await expect(page.getByTestId("equation-frame")).toHaveAttribute(
      "data-phase",
      "highlight",
    );
    await next(page, 2);
    await expect(
      page
        .getByTestId("before-equation")
        .locator('.katex [style*="background-color"]'),
    ).toBeVisible();
    await expect(graph).toHaveAttribute("data-stage", "0");
    await next(page);
    await expect(page.getByTestId("after-equation")).toBeVisible();
    await expect(page.getByTestId("graph-calculation")).toHaveCount(0);
    await next(page);
    await expect(page.getByTestId("distance-start")).toBeVisible();
    await expect(page.getByTestId("distance-movement")).toHaveCount(0);
    await next(page);
    await expect(page.getByTestId("distance-movement")).toBeVisible();
    await next(page);
    await expect(page.getByTestId("graph-calculation")).toHaveText(calculation);
    await expect(page.getByTestId("distance-result")).toBeVisible();
    await next(page);
    await expect(page.getByTestId("magnitude-result")).toContainText(sign);
    await expect(
      page.getByRole("button", { name: "Next step", exact: true }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Replay from start" }).click();
    await expect(graph).toHaveAttribute("data-stage", "0");
    await expect(page.getByTestId("graph-calculation")).toHaveCount(0);
  });
}

test("textbook is a demonstration; autoplay pauses and changing question clears the timer", async ({
  page,
}) => {
  await page.goto("/apps/directed-numbers#textbook");
  await expect(
    page.getByRole("heading", { name: "Exercise 2B · Q1(a)" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Check answer" })).toHaveCount(
    0,
  );
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveCount(0);
  await page.clock.install();
  await page.getByRole("button", { name: "Play demonstration" }).click();
  await advanceAutoplay(page, 3);
  await expect(page.getByTestId("equation-frame")).toHaveAttribute(
    "data-phase",
    "highlight",
  );
  await page.getByRole("button", { name: "Pause demonstration" }).click();
  await page.clock.runFor(8000);
  await expect(page.getByTestId("equation-frame")).toHaveAttribute(
    "data-phase",
    "highlight",
  );
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(page.getByTestId("equation-frame")).toHaveAttribute(
    "data-phase",
    "applied",
  );
  await page.getByRole("button", { name: "Play demonstration" }).click();
  await page
    .getByRole("combobox", { name: "Question", exact: true })
    .selectOption({ label: "Q4(c)" });
  await page.clock.runFor(10000);
  await expect(page.getByTestId("equation-frame")).toHaveAttribute(
    "data-phase",
    "start",
  );
  await expect(
    page.getByRole("heading", { name: "Exercise 2B · Q4(c)" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Explore with the bird/ }).click();
  await expect(page.getByTestId("walking-bird")).toHaveAttribute(
    "data-position",
    "-3",
  );
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Exercise 2B · Q4(c)" }),
  ).toBeVisible();
});

test("fractions and mixed operations animate complete exact working", async ({
  page,
}) => {
  await page.goto("/apps/directed-numbers#textbook:e=2B-24d");
  await expect(
    page.getByRole("region", { name: "Animated working" }),
  ).toBeVisible();
  await page.clock.install();
  await page.getByRole("button", { name: "Play demonstration" }).click();
  await advanceAutoplay(page);
  await expect(
    page.getByText("Demonstration complete", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByTestId("after-equation").getByRole("math"),
  ).toHaveAttribute("aria-label", "= -\\frac{7}{6}");
  await page
    .getByRole("combobox", { name: "Exercise", exact: true })
    .selectOption("2C");
  await page
    .getByRole("combobox", { name: "Question", exact: true })
    .selectOption({ label: "Q33(b)" });
  await expect(page.getByTestId("equation-frame")).toHaveAttribute(
    "data-phase",
    "start",
  );
  await page.getByRole("button", { name: "Play demonstration" }).click();
  await advanceAutoplay(page);
  await expect(
    page.getByTestId("after-equation").getByRole("math"),
  ).toHaveAttribute("aria-label", "= -\\frac{9}{4}");
  await expect(
    page.getByRole("button", { name: /Next question/ }),
  ).toBeDisabled();
});

test("teacher controls and calculation fit phone and projector; reduced motion is respected", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/apps/directed-numbers#textbook:e=2B-4c");
  await expect(
    page.getByRole("button", { name: "Next step", exact: true }),
  ).toBeVisible();
  await next(page, 3);
  await page.screenshot({
    path: testInfo.outputPath("brackets-phone.png"),
    fullPage: true,
  });
  await next(page, 5);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByTestId("graph-calculation")).toHaveText("8 − 3 = 5");
  expect(
    await page
      .getByTestId("graph-calculation")
      .evaluate((node) => getComputedStyle(node).animationName),
  ).toBe("none");
  await page.screenshot({
    path: testInfo.outputPath("magnitude-phone.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(page.getByTestId("magnitude-line")).toBeInViewport({ ratio: 1 });
  await expect(page.getByTestId("magnitude-result")).toBeInViewport({
    ratio: 1,
  });
  await page.screenshot({
    path: testInfo.outputPath("magnitude-projection.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Replay from start" }).click();
  await next(page, 3);
  await page.screenshot({
    path: testInfo.outputPath("brackets-projection.png"),
    fullPage: true,
  });
});

test("all worked lines stay visible as each new step unfolds", async ({
  page,
}, testInfo) => {
  await page.goto("/apps/directed-numbers#textbook:e=2C-33a");
  const lines = page.locator("[data-equation-line]");
  let previous = await lines.evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute("data-tex")),
  );
  const first = await lines
    .first()
    .evaluate((node) => node.getBoundingClientRect().top + window.scrollY);
  for (let phase = 1; phase <= 8; phase++) {
    await next(page);
    await expect(lines).toHaveCount(1 + Math.floor(phase / 2));
    const current = await lines.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-tex")),
    );
    expect(current.slice(0, previous.length)).toEqual(previous);
    for (const line of await lines.all()) await expect(line).toBeVisible();
    expect(
      await lines
        .first()
        .evaluate((node) => node.getBoundingClientRect().top + window.scrollY),
    ).toBeCloseTo(first, 0);
    previous = current;
  }
  await expect(page.locator("details")).toHaveCount(0);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(lines.last()).toBeInViewport({ ratio: 1 });
  await page.screenshot({
    path: testInfo.outputPath("all-working-projector.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Leave projection mode", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("all-working-phone.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Replay from start" }).click();
  await expect(lines).toHaveCount(1);
});

test("signs blend smoothly without replacing the previous equations or sign elements", async ({
  page,
}) => {
  await page.goto("/apps/directed-numbers#sign-magnitude:e=(-50)-(-60)");
  await next(page, 3);
  const pair = page.getByTestId("sign-combination");
  await pair.evaluate((node) => node.setAttribute("data-retained", "yes"));
  await next(page);
  await expect(pair).toHaveAttribute("data-retained", "yes");
  const blend = await pair.evaluate((node) => {
    const first = node.children[0] as HTMLElement;
    const animation = first
      .getAnimations()
      .find(
        (a) => a instanceof CSSTransition && a.transitionProperty === "opacity",
      );
    if (!animation) return null;
    animation.pause();
    animation.currentTime = 400;
    const opacity = Number(getComputedStyle(first).opacity);
    animation.finish();
    return opacity;
  });
  expect(blend).not.toBeNull();
  expect(blend!).toBeGreaterThan(0);
  expect(blend!).toBeLessThan(1);
  const lines = page.locator("[data-equation-line]");
  const before = await lines.evaluateAll((nodes) =>
    nodes.map((n) => n.getAttribute("data-tex")),
  );
  await next(page, 4);
  await expect(lines).toHaveCount(3);
  expect(
    await lines.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-tex")),
    ),
  ).toEqual(before);
  await expect(page.getByTestId("final-equation")).toHaveText(/10/);
});
