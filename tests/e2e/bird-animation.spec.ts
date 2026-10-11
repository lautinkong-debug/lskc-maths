import { expect, test, type Page } from "@playwright/test";

async function openBird(page: Page, expression: string) {
  await page.goto(
    `/apps/directed-numbers#add-subtract:e=${encodeURIComponent(expression)}`,
  );
  await expect(
    page.getByRole("button", { name: "Play animation", exact: true }),
  ).toBeVisible();
  await page.clock.install();
  return page.getByTestId("walking-bird");
}

async function readSigns(page: Page) {
  for (const label of ["Operation sign", "Number sign"]) {
    await page.clock.runFor(1200);
    await expect(page.locator('[data-active="true"]')).toContainText(label);
  }
}

for (const example of [
  { expression: "(-2)-(-4)", operation: "left", facing: "right", end: 2 },
  { expression: "(-2)+(-4)", operation: "right", facing: "left", end: -6 },
  { expression: "(-2)-(+4)", operation: "left", facing: "left", end: -6 },
  { expression: "(-2)+(+4)", operation: "right", facing: "right", end: 2 },
]) {
  test(`animates both signs before walking: ${example.expression}`, async ({
    page,
  }) => {
    const bird = await openBird(page, example.expression);
    await expect(bird).toHaveAttribute("data-facing", "right");
    await page
      .getByRole("button", { name: "Play animation", exact: true })
      .click();
    await page.clock.runFor(1200);
    await expect(bird).toHaveAttribute("data-facing", example.operation);
    await expect(bird).toHaveAttribute("data-position", "-2");
    await page.clock.runFor(1200);
    await expect(bird).toHaveAttribute("data-facing", example.facing);
    await expect(bird).toHaveAttribute("data-position", "-2");
    await page.clock.runFor(1200);
    await expect(bird).toHaveAttribute(
      "data-position",
      example.facing === "right" ? "-1" : "-3",
    );
    await expect(
      page.getByText("1 / 4 units walked", { exact: true }),
    ).toBeVisible();
    await page.clock.runFor(3000);
    await expect(bird).toHaveAttribute("data-position", String(example.end));
    await expect(
      page.getByText("4 / 4 units walked", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Replay animation", exact: true }),
    ).toBeVisible();
  });
}

test("pause, replay and reset cancel pending movement", async ({ page }) => {
  const bird = await openBird(page, "(-2)-(-4)");
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await readSigns(page);
  await page.clock.runFor(1200);
  await expect(bird).toHaveAttribute("data-position", "-1");
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  await page.clock.runFor(5000);
  await expect(bird).toHaveAttribute("data-position", "-1");
  await page
    .getByRole("button", { name: "Replay animation", exact: true })
    .click();
  await expect(bird).toHaveAttribute("data-position", "-2");
  await expect(bird).toHaveAttribute("data-facing", "right");
  await page.clock.runFor(1200);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await page.clock.runFor(5000);
  await expect(bird).toHaveAttribute("data-position", "-2");
  await expect(bird).toHaveAttribute("data-facing", "right");
});

test("walks all 14 units and stays still for zero with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const bird = await openBird(page, "(-6)+(+14)");
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await readSigns(page);
  await page.clock.runFor(1200);
  await expect(bird).toHaveAttribute("data-position", "-5");
  expect(
    await bird.evaluate((node) =>
      parseFloat(getComputedStyle(node).transitionDuration),
    ),
  ).toBeLessThan(0.001);
  for (let step = 2; step <= 14; step++) {
    await page.clock.runFor(750);
    await expect(
      page.getByText(`${step} / 14 units walked`, { exact: true }),
    ).toBeVisible();
  }
  await expect(bird).toHaveAttribute("data-position", "8");
  await expect(
    page.getByText("14 / 14 units walked", { exact: true }),
  ).toBeVisible();
  await page.goto(
    `/apps/directed-numbers#add-subtract:e=${encodeURIComponent("(-2)-(0)")}`,
  );
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await readSigns(page);
  await page.clock.runFor(1200);
  await expect(
    page.getByText("The bird does not move. It stays at −2.", { exact: true }),
  ).toBeVisible();
  await expect(bird).toHaveAttribute("data-position", "-2");
  await expect(
    page.getByText("0 / 0 units walked", { exact: true }),
  ).toBeVisible();
});

test("animation is keyboard accessible on a phone and in projection mode", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await openBird(page, "(-2)-(-4)");
  const play = page.getByRole("button", {
    name: "Play animation",
    exact: true,
  });
  await play.focus();
  await page.keyboard.press("Enter");
  await readSigns(page);
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("bird-phone.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Replay animation", exact: true })
    .click();
  await page.clock.runFor(1200);
  await expect(page.getByTestId("walking-bird")).toHaveAttribute(
    "data-facing",
    "left",
  );
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("bird-projection.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("bird visibly turns and walks between number-line marks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(
    `/apps/directed-numbers#add-subtract:e=${encodeURIComponent("(-2)-(-4)")}`,
  );
  const bird = page.getByTestId("walking-bird");
  await expect(bird).toBeVisible();
  const turn = bird.locator(":scope > g");
  const scale = () =>
    turn.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).a);
  const x = () =>
    bird.evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).e);
  await page
    .getByRole("button", { name: "Read the operation sign", exact: true })
    .first()
    .click();
  await expect.poll(scale).toBeLessThan(0.9);
  expect(await scale()).toBeGreaterThan(-1);
  await expect.poll(scale).toBe(-1);
  await page
    .getByRole("button", { name: "Read the second sign", exact: true })
    .first()
    .click();
  await expect.poll(scale).toBe(1);
  const before = await x();
  await page.getByRole("button", { name: "Next →", exact: true }).click();
  const target = await bird.evaluate(
    (node) => new DOMMatrix((node as SVGElement).style.transform).e,
  );
  await expect.poll(x).toBeGreaterThan(before);
  expect(await x()).toBeLessThan(target);
  await expect.poll(x).toBeCloseTo(target, 1);
});
