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
test("separate clicks animate the magnitude beside a stationary sign", async ({
  page,
}, testInfo) => {
  await page.goto("/apps/directed-numbers#sign-magnitude:e=(+50)-(+60)");
  await next(page, 7);
  const prefix = page.getByTestId("result-sign-prefix");
  const term = page.getByTestId("result-magnitude-term");
  const formula = page
    .getByTestId("signed-magnitude-equation")
    .getByRole("math");
  await expect(formula).toHaveAttribute("aria-label", "= -");
  await expect(term).toBeHidden();
  await page.screenshot({
    path: testInfo.outputPath("first-click-sign.png"),
    fullPage: true,
    animations: "disabled",
  });
  await prefix.evaluate((node) => node.setAttribute("data-retained", "yes"));
  const before = await prefix.boundingBox();
  await next(page);
  await expect(formula).toHaveAttribute(
    "aria-label",
    "= -\\left(60 - 50\\right)",
  );
  await expect(prefix).toHaveAttribute("data-retained", "yes");
  const opacity = await term.evaluate((node) => {
    const animation = node
      .getAnimations()
      .find(
        (a) => a instanceof CSSTransition && a.transitionProperty === "opacity",
      );
    if (!animation) return null;
    animation.pause();
    animation.currentTime = 325;
    const value = Number(getComputedStyle(node).opacity);
    animation.finish();
    return value;
  });
  expect(opacity).not.toBeNull();
  expect(opacity!).toBeGreaterThan(0);
  expect(opacity!).toBeLessThan(1);
  expect((await prefix.boundingBox())!.x).toBeCloseTo(before!.x, 1);
  await page.screenshot({
    path: testInfo.outputPath("second-click-magnitude.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(term).toBeHidden();
  await expect(formula).toHaveAttribute("aria-label", "= -");
  await page.clock.install();
  await page
    .getByRole("button", { name: "Play demonstration", exact: true })
    .click();
  await advanceAutoplay(page, 1);
  await expect(term).toBeVisible();
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .click();
  await expect(page.getByTestId("signed-magnitude-equation")).toHaveCount(0);
});
for (const [id, phase, sign, magnitude, answer] of [
  ["2C-2a", 1, "-", "3 \\times 2", "-6"],
  ["2C-1b", 1, "+", "8 \\times 5", "40"],
  ["2C-6a", 1, "-", "24 \\div 3", "-8"],
  ["2C-7a", 1, "+", "64 \\div 8", "8"],
  ["2C-4a", 1, "-", "5 \\times 0.3", "-1.5"],
  ["2C-8a", 1, "+", "14 \\div \\frac{7}{5}", "10"],
  ["2C-8b", 3, "-", "40 \\div \\frac{8}{3}", "-15"],
] as const) {
  test(`textbook product/quotient split reveal: ${id}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({
      reducedMotion: id === "2C-2a" ? "no-preference" : "reduce",
    });
    await page.goto(`/apps/directed-numbers#textbook:e=${id}`);
    await next(page, phase);
    const row = page.getByTestId("operation-sign-magnitude");
    const term = row.locator('.katex-html [style*="color"]').first();
    await expect(row.getByRole("math")).toHaveAttribute(
      "aria-label",
      `= ${sign}`,
    );
    await expect(term).toBeHidden();
    await row.evaluate((node) => node.setAttribute("data-retained", "yes"));
    const before = await page
      .locator('[data-equation-line]:not([data-magnitude-shown="false"])')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-tex")));
    await page.screenshot({
      path: testInfo.outputPath("sign-only.png"),
      fullPage: true,
      animations: "disabled",
    });
    await next(page);
    await expect(row).toHaveAttribute("data-retained", "yes");
    await expect(row.getByRole("math")).toHaveAttribute(
      "aria-label",
      `= ${sign}\\left(${magnitude}\\right)`,
    );
    await expect(term).toBeVisible();
    if (id === "2C-2a") {
      const opacity = await term.evaluate((node) => {
        const animation = node
          .getAnimations()
          .find(
            (a) =>
              a instanceof CSSTransition && a.transitionProperty === "opacity",
          );
        if (!animation) return null;
        animation.pause();
        animation.currentTime = 325;
        const value = Number(getComputedStyle(node).opacity);
        animation.finish();
        return value;
      });
      expect(opacity).not.toBeNull();
      expect(opacity!).toBeGreaterThan(0);
      expect(opacity!).toBeLessThan(1);
    }
    expect(
      (
        await page
          .locator("[data-equation-line]")
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-tex")))
      ).slice(0, before.length),
    ).toEqual(before);
    await page
      .getByRole("button", { name: "Previous step", exact: true })
      .click();
    await expect(term).toBeHidden();
    await next(page, 3);
    await expect(
      page.getByTestId("after-equation").getByRole("math"),
    ).toHaveAttribute("aria-label", `= ${answer}`);
    await expect(row.getByRole("math")).toHaveAttribute(
      "aria-label",
      `= ${sign}\\left(${magnitude}\\right)`,
    );
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page
      .getByRole("button", { name: "Projection mode", exact: true })
      .click();
    await expect(page.getByTestId("after-equation")).toBeInViewport({
      ratio: 1,
    });
    await page.screenshot({
      path: testInfo.outputPath("complete-projector.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Leave projection mode", exact: true })
      .click();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("complete-phone.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Replay from start", exact: true })
      .click();
    await expect(page.getByTestId("operation-sign-magnitude")).toHaveCount(0);
  });
}
test("chained products and quotients retain each earlier reveal during autoplay", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/apps/directed-numbers#textbook:e=2C-23a");
  await page.clock.install();
  await page
    .getByRole("button", { name: "Play demonstration", exact: true })
    .click();
  await advanceAutoplay(page, 2);
  const first = page.getByTestId("operation-sign-magnitude").first();
  const firstText = await first.getAttribute("data-tex");
  const retained = await page
    .locator("[data-equation-line]")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-tex")));
  await advanceAutoplay(page, 3);
  const second = page.getByTestId("operation-sign-magnitude").nth(1);
  await expect(first).toHaveAttribute("data-tex", firstText!);
  await expect(second.getByRole("math")).toHaveAttribute("aria-label", "= -");
  await expect(
    second.locator('.katex-html [style*="color"]').first(),
  ).toBeHidden();
  await advanceAutoplay(page, 1);
  await expect(second.getByRole("math")).toHaveAttribute(
    "aria-label",
    "= -\\left(7.5 \\div 3\\right)",
  );
  await advanceAutoplay(page);
  const lines = page.locator("[data-equation-line]");
  expect(
    (
      await lines.evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("data-tex")),
      )
    ).slice(0, retained.length),
  ).toEqual(retained);
  for (const line of await lines.all()) await expect(line).toBeVisible();
  await expect(
    page.getByTestId("after-equation").getByRole("math"),
  ).toHaveAttribute("aria-label", "= -2.5");
  await page.screenshot({
    path: testInfo.outputPath("chained-working.png"),
    fullPage: true,
  });
});
for (const [route, working, result] of [
  ["sign-magnitude:e=(+3.1)-(+4.9)", "-\\left(4.9 - 3.1\\right)", "-1.8"],
  ["textbook:e=2B-15a", "+\\left(43 - 21\\right)", "+22"],
  [
    "sign-magnitude:e=(+1/2)-(+3/4)",
    "-\\left(\\frac{3}{4} - \\frac{1}{2}\\right)",
    "-\\frac{1}{4}",
  ],
]) {
  test(`sign precedes magnitude and retains number format: ${route}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/apps/directed-numbers#${route}`);
    await next(page, 7);
    const line = page.getByTestId("signed-magnitude-equation");
    await expect(line.getByRole("math")).toHaveAttribute(
      "aria-label",
      `= ${working[0]}`,
    );
    await expect(page.getByTestId("result-magnitude-term")).toBeHidden();
    await expect(page.getByTestId("result-sign")).toBeVisible();
    await expect(page.getByTestId("graph-calculation")).toHaveCount(0);
    await expect(page.getByTestId("final-equation")).toHaveCount(0);
    const previous = await page
      .locator("[data-equation-line]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-tex")));
    if (route.includes("3.1")) {
      expect(previous).toEqual([
        "\\left(+3.1\\right) - \\left(+4.9\\right)",
        "= 3.1 - \\left(+4.9\\right)",
        "= 3.1 - 4.9",
      ]);
    }
    await page.screenshot({
      path: testInfo.outputPath("sign-before-magnitude.png"),
      fullPage: true,
    });
    await next(page);
    await expect(line).toBeVisible();
    await expect(line.getByRole("math")).toHaveAttribute(
      "aria-label",
      `= ${working}`,
    );
    await expect(page.getByTestId("result-magnitude-term")).toBeVisible();
    expect(
      await page
        .getByTestId("result-magnitude-term")
        .evaluate((node) =>
          Math.max(
            ...getComputedStyle(node)
              .transitionDuration.split(",")
              .map(Number.parseFloat),
          ),
        ),
    ).toBeLessThanOrEqual(0.001);
    await expect(page.getByTestId("graph-calculation")).toBeVisible();
    await expect(page.getByTestId("final-equation")).toHaveCount(0);
    await next(page);
    await expect(
      page.getByTestId("final-equation").getByRole("math"),
    ).toHaveAttribute("aria-label", `= ${result}`);
    expect(
      await page
        .locator("[data-equation-line]")
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-tex"))),
    ).toEqual(previous);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page
      .getByRole("button", { name: "Projection mode", exact: true })
      .click();
    await expect(page.getByTestId("final-equation")).toBeInViewport({
      ratio: 1,
    });
    await expect(page.getByTestId("magnitude-result")).toBeInViewport({
      ratio: 1,
    });
    await page.screenshot({
      path: testInfo.outputPath("sign-magnitude-complete.png"),
      fullPage: true,
    });
  });
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
    await expect(page.getByTestId("result-sign")).toContainText(sign);
    if (sign.startsWith("Zero")) {
      await expect(page.getByTestId("signed-magnitude-equation")).toBeHidden();
    } else {
      await expect(page.getByTestId("signed-magnitude-equation")).toBeVisible();
    }
    await expect(page.getByTestId("result-magnitude-term")).toBeHidden();
    await expect(page.getByTestId("graph-calculation")).toHaveCount(0);
    await expect(page.getByTestId("result-magnitude")).toHaveCount(0);
    await expect(page.getByTestId("final-equation")).toHaveCount(0);
    await next(page);
    await expect(page.getByTestId("result-magnitude-term")).toBeVisible();
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
  await expect(page.getByTestId("magnitude-line")).toBeVisible();
  await page.clock.install();
  await page.getByRole("button", { name: "Play demonstration" }).click();
  await advanceAutoplay(page);
  await expect(
    page.getByTestId("final-equation").getByRole("math"),
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
  await next(page, 6);
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
    const partialCount = await page
      .locator('[data-equation-line][data-magnitude-shown="false"]')
      .count();
    await expect(lines).toHaveCount(1 + Math.floor(phase / 2) + partialCount);
    const current = await lines.evaluateAll((nodes) =>
      nodes
        .filter((n) => n.getAttribute("data-magnitude-shown") !== "false")
        .map((n) => n.getAttribute("data-tex")),
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

test("two arrows reveal the resulting sign without replacing earlier equations", async ({
  page,
}) => {
  await page.goto("/apps/directed-numbers#sign-magnitude:e=(-50)-(-60)");
  await next(page, 3);
  const pair = page.getByTestId("sign-combination");
  await pair.evaluate((node) => node.setAttribute("data-retained", "yes"));
  await next(page);
  await expect(pair).toHaveAttribute("data-retained", "yes");
  const blend = await pair.evaluate((node) => {
    const first = node.querySelector("[data-result-sign]") as SVGTextElement;
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
  await next(page, 5);
  await expect(lines).toHaveCount(3);
  expect(
    await lines.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-tex")),
    ),
  ).toEqual(before);
  await expect(page.getByTestId("final-equation")).toHaveText(/10/);
});

test("custom number line accepts exact decimals, fractions and mixed numbers", async ({
  page,
}, testInfo) => {
  await page.goto("/apps/directed-numbers#sign-magnitude");
  for (const [a, op, b, calculation, result] of [
    ["50", "-", "60", "60 − 50 = 10", "= -10"],
    ["3", "-", "3.1", "3.1 − 3 = 0.1", "= -0.1"],
    ["1/3", "+", "1/6", "1/3 + 1/6 = 1/2", "= +\\frac{1}{2}"],
    ["-1 1/2", "+", "0.25", "3/2 − 1/4 = 5/4", "= -\\frac{5}{4}"],
  ]) {
    await page.getByLabel("Starting value", { exact: true }).fill(a);
    await page
      .getByRole("combobox", { name: "Operation", exact: true })
      .selectOption(op);
    await page.getByLabel("Second number", { exact: true }).fill(b);
    await page.getByRole("button", { name: "Draw my number line" }).click();
    await expect(
      page.getByLabel("Starting value", { exact: true }),
    ).toHaveValue(a);
    await expect(page.getByLabel("Second number", { exact: true })).toHaveValue(
      b,
    );
    await expect(
      page.getByRole("alert").filter({ hasText: "Enter valid numbers" }),
    ).toHaveCount(0);
    await expect(page.getByTestId("magnitude-line")).toHaveAttribute(
      "data-stage",
      "0",
    );
    await next(page, 9);
    await expect(page.getByTestId("graph-calculation")).toHaveText(calculation);
    await expect(
      page.getByTestId("final-equation").getByRole("math"),
    ).toHaveAttribute("aria-label", result);
    if (a === "1/3") {
      expect(
        (await page
          .getByTestId("distance-movement")
          .locator("path")
          .boundingBox())!.width,
      ).toBeGreaterThan(80);
      await page.screenshot({
        path: testInfo.outputPath("fraction-number-line.png"),
        fullPage: true,
      });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("mixed-number-phone.png"),
    fullPage: true,
  });
  for (const invalid of ["1/0", "", "101"]) {
    await page.getByLabel("Second number", { exact: true }).fill(invalid);
    await page.getByRole("button", { name: "Draw my number line" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Enter valid numbers" }),
    ).toBeVisible();
    await expect(page.getByTestId("graph-calculation")).toHaveText(
      "3/2 − 1/4 = 5/4",
    );
  }
});

for (const expression of ["50-60", "-50+60", "-50-30", "50+(-50)"]) {
  test(`magnitude highlight measures zero to endpoint: ${expression}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(
      `/apps/directed-numbers#sign-magnitude:e=${encodeURIComponent(expression)}`,
    );
    const progress = page.getByText(/^Step \d+ of \d+$/);
    await expect(progress).toBeVisible();
    const last = Number((await progress.innerText()).match(/\d+/g)![1]);
    await next(page, last - 2);
    const band = page.getByTestId("magnitude-highlight");
    await expect(band).toHaveCount(0);
    await next(page);
    await expect(band).toHaveCount(1);
    const geometry = await page
      .getByTestId("magnitude-line")
      .evaluate((svg) => {
        const rect = svg.querySelector(
          '[data-testid="magnitude-highlight"] rect',
        ) as SVGRectElement;
        const bar = svg.querySelector(
          '[data-testid="distance-result"] path',
        ) as SVGPathElement;
        const box = bar.getBBox();
        const calculation = svg.querySelector(
          '[data-testid="graph-calculation"]',
        ) as SVGTextElement;
        return {
          x: rect.x.baseVal.value,
          width: rect.width.baseVal.value,
          barX: box.x,
          barWidth: box.width,
          calculationX: calculation.x.baseVal.getItem(0).value,
        };
      });
    expect(geometry.x).toBeCloseTo(geometry.barX, 2);
    expect(geometry.width).toBeCloseTo(geometry.barWidth, 2);
    expect(geometry.calculationX).toBeCloseTo(
      geometry.barX + geometry.barWidth / 2,
      2,
    );
    if (expression === "50+(-50)") expect(geometry.width).toBe(0);
    else expect(geometry.width).toBeGreaterThan(0);
    await next(page);
    await expect(band).toHaveCount(1);
    if (expression === "50-60") {
      await expect(page.getByTestId("graph-finish")).toHaveAttribute(
        "fill",
        "#6d28d9",
      );
      await expect(page.getByTestId("graph-calculation")).toHaveAttribute(
        "fill",
        "#6d28d9",
      );
      await expect(
        page.getByTestId("distance-result").locator("path"),
      ).toHaveAttribute("stroke", "#6d28d9");
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page
        .getByRole("button", { name: "Projection mode", exact: true })
        .click();
      await page.screenshot({
        path: testInfo.outputPath("highlight-projector.png"),
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page
      .getByRole("button", { name: "Replay from start", exact: true })
      .click();
    await expect(band).toHaveCount(0);
  });
}

test("revision exercise selection keeps textbook references and restores the question", async ({
  page,
}) => {
  await page.goto("/apps/directed-numbers#textbook");
  await page
    .getByRole("combobox", { name: "Exercise", exact: true })
    .selectOption("R2");
  await expect(
    page.getByRole("heading", { name: "Revision Exercise 2 · Q7(a)" }),
  ).toBeVisible();
  await expect(
    page.getByText("Question 1 of 58", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Difficulty", exact: true })
    .selectOption("2");
  await expect(
    page.getByRole("heading", { name: "Revision Exercise 2 · Q25(a)" }),
  ).toBeVisible();
  await expect(
    page.getByText("Question 1 of 28", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Question", exact: true })
    .selectOption({ label: "Q38(b)" });
  await expect(page).toHaveURL(/#textbook:e=R2-38b$/);
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Exercise", exact: true }),
  ).toHaveValue("R2");
  await expect(
    page.getByRole("heading", { name: "Revision Exercise 2 · Q38(b)" }),
  ).toBeVisible();
  await expect(
    page.getByText("Textbook p. 2.58 · Level 2", { exact: true }),
  ).toBeVisible();
});

for (const [id, answer] of [
  ["R2-32b", "0.05"],
  ["R2-37b", "-4"],
  ["R2-38b", "-29"],
]) {
  test(`revision animated working completes: ${id}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/apps/directed-numbers#textbook:e=${id}`);
    await expect(
      page.getByRole("button", { name: "Play demonstration", exact: true }),
    ).toBeVisible();
    await page.clock.install();
    await page
      .getByRole("button", { name: "Play demonstration", exact: true })
      .click();
    await advanceAutoplay(page);
    await expect(
      page.getByTestId("after-equation").getByRole("math"),
    ).toHaveAttribute("aria-label", `= ${answer}`);
    const arrows = page.getByTestId("sign-combination");
    expect(await arrows.count()).toBeGreaterThan(0);
    for (const arrow of await arrows.all())
      await expect(arrow.locator("[data-result-sign]")).toHaveCSS(
        "opacity",
        "1",
      );
    if (id === "R2-32b") {
      const working = await page
        .locator("[data-equation-line]")
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute("data-tex")).join(" "),
        );
      expect(working).not.toContain("\\frac");
    }
    await page.screenshot({
      path: testInfo.outputPath("revision-complete.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

for (const [id, phase, pair, sign] of [
  ["2C-33b", 5, "−+", "−"],
  ["2C-23a", 5, "+−", "−"],
  ["2C-1b", 1, "−−", "+"],
  ["2C-8a", 1, "−−", "+"],
] as const) {
  test(`exercise arrows connect operand signs: ${id}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/apps/directed-numbers#textbook:e=${id}`);
    await next(page, phase);
    const arrows = page.getByTestId("sign-combination").last();
    await expect(arrows.locator("[data-result-sign]")).toHaveText(sign);
    await expect(arrows.locator("[data-result-sign]")).toHaveCSS(
      "opacity",
      "1",
    );
    // Fraction glyphs can load a separate KaTeX font on production. Let the
    // font/ResizeObserver positioning pass finish before reading coordinates.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    });
    const geometry = await arrows.evaluate((svg) => {
      const root = svg.closest("[data-arrows-positioned]")!;
      const box = svg.getBoundingClientRect();
      const signs = [
        ...root.querySelectorAll(
          '[role="math"] > .katex > .katex-html [style*="color"]',
        ),
      ].filter((el) => /^[+−-]$/.test(el.textContent ?? ""));
      return {
        signs: signs.map((el) => el.textContent).join(""),
        visible: signs.every(
          (el) =>
            getComputedStyle(el.closest('[role="math"]')!).opacity === "1",
        ),
        offsets: [...svg.querySelectorAll("[data-arrow]")].map((path, i) => {
          const start = (path as SVGPathElement).getPointAtLength(0);
          const r = signs[i].getBoundingClientRect();
          return Math.abs(box.left + start.x - r.left - r.width / 2);
        }),
      };
    });
    expect(geometry.signs).toBe(pair);
    expect(geometry.visible).toBe(true);
    expect(geometry.offsets).toHaveLength(2);
    expect(
      geometry.offsets.every((offset) => offset < 2),
      JSON.stringify(geometry),
    ).toBe(true);
    const magnitude = page
      .getByTestId("operation-sign-magnitude")
      .last()
      .locator('.katex-html [style*="color"]')
      .first();
    await expect(magnitude).toBeHidden();
    await arrows.evaluate((node) => node.setAttribute("data-retained", "yes"));
    await next(page);
    await expect(magnitude).toBeVisible();
    await expect(arrows).toHaveAttribute("data-retained", "yes");
    await page.screenshot({
      path: testInfo.outputPath("exercise-arrows.png"),
      fullPage: true,
    });
    await next(page, 2);
    await expect(arrows).toHaveAttribute("data-retained", "yes");
    await expect(arrows.locator("[data-result-sign]")).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

for (const [expression, sign] of [
  ["(+4)-(+2)", "−"],
  ["(+4)-(-2)", "+"],
  ["(+4)+(-2)", "−"],
  ["(+4)+(+2)", "+"],
]) {
  test(`two arrows point from the signs in ${expression} to ${sign}`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(
      `/apps/directed-numbers#sign-magnitude:e=${encodeURIComponent(expression)}`,
    );
    await next(page, 4);
    const arrows = page.getByTestId("sign-combination");
    await expect(arrows.locator("[data-arrow]")).toHaveCount(2);
    await expect(arrows.locator("[data-result-sign]")).toHaveText(sign);
    const geometry = await arrows.evaluate((svg) => {
      const box = svg.getBoundingClientRect();
      const root = svg.closest("[data-arrows-positioned]")!;
      const signs = [
        ...root.querySelectorAll(
          '[role="math"] > .katex > .katex-html [style*="color"]',
        ),
      ].filter((el) => /^[+−-]$/.test(el.textContent ?? ""));
      return [...svg.querySelectorAll("[data-arrow]")].map((path, i) => {
        const start = (path as SVGPathElement).getPointAtLength(0);
        const r = signs[i].getBoundingClientRect();
        return Math.abs(box.left + start.x - r.left - r.width / 2);
      });
    });
    expect(geometry.every((offset) => offset < 2)).toBe(true);
    if (expression === "(+4)-(+2)") {
      await page.screenshot({
        path: testInfo.outputPath("two-sign-arrows.png"),
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(arrows.locator("[data-result-sign]")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}
