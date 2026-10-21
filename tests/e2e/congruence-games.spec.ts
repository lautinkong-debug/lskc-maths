import { expect, test } from "@playwright/test";
import {
  conditions,
  lessonSetup,
  mixedRounds,
} from "../../src/apps/congruence/games/model";
import { copy } from "../../src/lib/copy";

const c = copy.congruenceGames;

test("game transforms and camera preserve lengths; only true matches merge their labels", async ({
  page,
}) => {
  await page.goto("/apps/congruence#games");
  await page
    .getByRole("button", { name: c.missions.SSS.title, exact: true })
    .click();
  const board = page.getByTestId("congruence-game-board");
  const polygon = board
    .getByTestId("congruence-game-triangle-1")
    .locator("polygon");
  const points = () => polygon.getAttribute("points");
  const lengths = () =>
    polygon.evaluate((el) => {
      const ps = Array.from((el as SVGPolygonElement).points);
      return ps.map((p, i) =>
        Math.hypot(p.x - ps[(i + 1) % 3].x, p.y - ps[(i + 1) % 3].y),
      );
    });
  await page
    .getByTestId("congruence-game-classroom")
    .getByText(c.diagramControls, { exact: true })
    .click();
  const before = await lengths();
  await page
    .getByRole("button", { name: new RegExp(c.flipHorizontal) })
    .click();
  await page.getByRole("button", { name: new RegExp(c.flipVertical) }).click();
  const beforeFit = await points();
  await page.getByRole("button", { name: c.fit, exact: true }).click();
  expect(await points()).toBe(beforeFit);
  await page.getByRole("button", { name: c.zoomIn, exact: true }).click();
  await page.getByRole("button", { name: c.resetView, exact: true }).click();
  expect(await points()).toBe(beforeFit);
  (await lengths()).forEach((length, i) =>
    expect(length).toBeCloseTo(before[i], 3),
  );
  const field = page.getByRole("spinbutton", {
    name: c.missions.SSS.control,
    exact: true,
  });
  await field.fill("7");
  await field.blur();
  await page.getByRole("button", { name: c.snap, exact: true }).click();
  await expect(board.getByTestId("paired-vertex-label")).toHaveCount(3);
  await expect(
    board.locator("text").filter({ hasText: "AB = DE = 6" }),
  ).toBeVisible();
  await field.fill("7.1");
  await field.blur();
  await page.getByRole("button", { name: c.snap, exact: true }).click();
  await expect(board.getByTestId("paired-vertex-label")).toHaveCount(0);
});

test("all five activities require a valid repair and lead to a focused proof", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/apps/congruence#games");
  for (const condition of conditions) {
    await page
      .getByRole("button", { name: c.missions[condition].title, exact: true })
      .click();
    const classroom = page.getByTestId("congruence-game-classroom");
    const facts = classroom.locator(
      'button[data-testid^="congruence-evidence-"]',
    );
    for (const fact of await facts.all()) await fact.click();
    await classroom
      .getByRole("button", { name: condition, exact: true })
      .click();
    await classroom.getByRole("button", { name: c.check, exact: true }).click();
    await expect(classroom).toContainText(c.feedback.repair);
    const field = classroom.getByRole("spinbutton", {
      name: c.missions[condition].control,
      exact: true,
    });
    await field.fill(String(lessonSetup(condition, 0).goal));
    await field.blur();
    for (const fact of await facts.all()) await fact.click();
    await classroom
      .getByRole("button", { name: condition, exact: true })
      .click();
    await classroom.getByRole("button", { name: c.check, exact: true }).click();
    const proof = page.getByTestId("congruence-game-proof");
    await expect(proof).toBeVisible();
    await proof.getByRole("button", { name: c.nextStep, exact: true }).click();
    await expect(
      classroom.locator('[data-game-mark][data-lit="true"]'),
    ).toHaveCount(2);
    await proof.getByRole("button", { name: c.nextStep, exact: true }).click();
    await proof
      .getByRole("button", { name: c.previousStep, exact: true })
      .click();
    await expect(
      classroom.locator('[data-game-mark][data-lit="true"]'),
    ).toHaveCount(2);
    await page.screenshot({
      path: `out/congruence-improvements/game-${condition}.png`,
    });
    await page.keyboard.press("Escape");
    await expect(classroom).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("mixed challenge includes real AAA and SSA counterexamples and saves completed cases", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/apps/congruence#games");
  await page.locator('[data-mission="mixed"]').click();
  const classroom = page.getByTestId("congruence-game-classroom");
  for (const [index, round] of mixedRounds.entries()) {
    const facts = classroom.locator(
      'button[data-testid^="congruence-evidence-"]',
    );
    for (const fact of await facts.all()) await fact.click();
    if (round.explanationKey === "aaa" || round.explanationKey === "ssa") {
      await classroom.getByRole("button", { name: "SSS", exact: true }).click();
      await classroom
        .getByRole("button", { name: c.check, exact: true })
        .click();
      await expect(classroom).toContainText(c.feedback[round.explanationKey]);
    }
    await classroom
      .getByRole("button", {
        name:
          round.criterion === "insufficient" ? c.insufficient : round.criterion,
        exact: true,
      })
      .click();
    await classroom.getByRole("button", { name: c.check, exact: true }).click();
    const proof = page.getByTestId("congruence-game-proof");
    await expect(proof).toBeVisible();
    for (let step = 0; step < round.proof.length; step++)
      await proof
        .getByRole("button", { name: c.nextStep, exact: true })
        .click();
    await expect(proof).toContainText(c.explanations[round.explanationKey]);
    await proof
      .getByRole("button", {
        name: index === mixedRounds.length - 1 ? c.finish : c.next,
        exact: true,
      })
      .click();
  }
  await expect(classroom).toContainText(c.completed);
  const saved = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem("congruence-detective-progress-v1") || "[]",
    ),
  );
  expect(saved).toHaveLength(12);
  await page.reload();
  await expect(page.locator('[data-mission="mixed"]')).toContainText("12 / 12");
});

for (const [width, height] of [
  [1366, 768],
  [1920, 1080],
  [390, 844],
  [360, 800],
  [844, 390],
]) {
  test(`games keep diagrams and controls visible at ${width} by ${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/apps/congruence#games");
    await page
      .getByRole("button", { name: c.missions.RHS.title, exact: true })
      .click();
    const classroom = page.getByTestId("congruence-game-classroom");
    await expect(classroom).toHaveAttribute("data-reduced", "true");
    const board = page.getByTestId("congruence-game-board");
    const controls = page.getByRole("complementary", { name: c.controlPanel });
    await expect(board).toBeVisible();
    await expect(controls).toBeVisible();
    const a = (await board.boundingBox())!,
      b = (await controls.boundingBox())!;
    expect(a.height).toBeGreaterThan(150);
    expect(a.y + a.height).toBeLessThanOrEqual(height + 2);
    expect(b.y).toBeLessThan(height - 100);
    expect(await classroom.evaluate((el) => el.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: `out/congruence-improvements/game-${width}x${height}.png`,
    });
  });
}

test("switching modes and folding the lesson menu preserves the practice step", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-14");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page
    .getByTestId("practice-classroom")
    .getByRole("button", { name: "Games", exact: true })
    .click();
  await expect(page.getByTestId("congruence-games")).toBeVisible();
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show lesson menu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Textbook practice", exact: true })
    .click();
  await expect(page.getByTestId("congruence-solution")).toContainText(
    "Step 1 / 5",
  );
});
