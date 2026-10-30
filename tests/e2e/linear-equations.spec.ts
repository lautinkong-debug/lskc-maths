import { test, expect } from "@playwright/test";
const path = "/apps/linear-equations";
const board = (page: import("@playwright/test").Page) =>
  page.getByTestId("equation-animation");
test("terms physically cross the equals sign; pause, resume, previous and replay work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(path + "#learn/4b-11");
  await expect(
    page.getByRole("combobox", { name: "Choose a skill", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Speed", exact: true })
    .selectOption("slow");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-busy", "false");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-busy", "false");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-busy", "false");
  const token = board(page)
    .locator("[data-frame]")
    .last()
    .locator('[data-token="t2"]');
  const start = await token.boundingBox();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.waitForTimeout(1400);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-paused", "true");
  const paused = await token.boundingBox();
  await page.waitForTimeout(400);
  const still = await token.boundingBox();
  expect(Math.abs(still!.x - paused!.x)).toBeLessThan(1);
  expect(Math.abs(paused!.x - start!.x)).toBeGreaterThan(5);
  await page.screenshot({
    path: "out/linear-equations/animated-crossing.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-busy", "false");
  expect((await token.boundingBox())!.x).toBeLessThan(start!.x);
  await expect(token.locator("[data-new-sign]")).toContainText("−y");
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(board(page)).toHaveAttribute("data-step", "3");
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .click();
  await expect(board(page)).toHaveAttribute("data-step", "0");
  await expect(
    page.getByRole("heading", { name: "Check by substitution", exact: true }),
  ).toHaveCount(0);
});
test("autoplay reaches the checked solution and reduced motion works", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(path + "#learn/qp-4.5b");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByText("L.H.S. = R.H.S. The solution checks."),
  ).toBeVisible();
  await expect(
    page.getByRole("math", { name: "q=-2", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Question collection", exact: true })
    .selectOption("revision");
  await page
    .getByRole("combobox", { name: "Textbook question", exact: true })
    .selectOption("revision-52");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByText("L.H.S. = R.H.S. The solution checks."),
  ).toBeVisible();
});
test("exact fractions, wrong signs, generated retries and saved progress", async ({
  page,
}) => {
  await page.goto(path + "#practice/4b-7");
  await page.getByLabel("Your answer", { exact: true }).fill("-0.5");
  await page.getByLabel("Your answer", { exact: true }).press("Enter");
  await expect(
    page.getByText("Solved independently", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("1 / 106 textbook questions solved independently").first(),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Textbook question", exact: true })
    .selectOption("4b-18");
  await page.getByLabel("Your answer", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByText("The magnitude is right.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("Your answer", { exact: true }).fill("-1");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByText("Solved with practice", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Try a similar question", exact: true })
    .click();
  await expect(
    page.getByText("Similar practice · generated question"),
  ).toBeVisible();
  await expect(page.getByText("Exercise 4B Q18 · p. 4.20")).toHaveCount(0);
});
test("all word-problem parts are answerable, including models, units and reasoning", async ({
  page,
}) => {
  await page.goto(path + "#practice/qp-4.11");
  await page.getByLabel("(a) Equation in x", { exact: true }).fill("x-5=32");
  await page
    .getByLabel("(b) Polly's candies (candies)", { exact: true })
    .fill("37");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByText("Solved independently", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Question collection", exact: true })
    .selectOption("revision");
  await page
    .getByRole("combobox", { name: "Textbook question", exact: true })
    .selectOption("revision-27");
  await page
    .getByLabel("(a) Perimeter in terms of L (m)", { exact: true })
    .fill("2(L+7)");
  await page.getByLabel("(b) L", { exact: true }).fill("13");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByText("Solved independently", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Textbook question", exact: true })
    .selectOption("revision-62");
  await page.getByLabel("(a) Wrong answers", { exact: true }).fill("7");
  await page
    .getByLabel("(b) Agree or disagree?", { exact: true })
    .selectOption("Agree");
  await page
    .getByLabel("(b) Number of correct answers needed for 0 marks", {
      exact: true,
    })
    .fill("50/3");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await expect(
    page.getByText("which is not a whole number.", { exact: false }),
  ).toBeVisible();
});
test("collections, browser history and corrupt storage are handled", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("lskc-equations-independent-v1", '{"broken":true}'),
  );
  await page.goto(path + "#practice/4b-11");
  await page
    .getByRole("combobox", { name: "Question collection", exact: true })
    .selectOption("quick");
  await expect(
    page
      .getByRole("combobox", { name: "Textbook question", exact: true })
      .locator("option"),
  ).toHaveCount(27);
  await page
    .getByRole("combobox", { name: "Question collection", exact: true })
    .selectOption("revision");
  await expect(
    page
      .getByRole("combobox", { name: "Textbook question", exact: true })
      .locator("option"),
  ).toHaveCount(63);
  await page.goBack();
  await expect(
    page.getByRole("combobox", { name: "Question collection", exact: true }),
  ).toHaveValue("quick");
  await page.goBack();
  await expect(
    page.getByRole("combobox", { name: "Textbook question", exact: true }),
  ).toHaveValue("4b-11");
});
for (const width of [360, 1920])
  test(
    "all 106 questions and solutions fit at " + width + "px",
    async ({ page }) => {
      test.setTimeout(240000);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({
        width,
        height: width === 1920 ? 1080 : 844,
      });
      await page.goto(path + "#practice/qp-4.1a");
      let count = 0;
      for (const collection of ["quick", "revision", "4A", "4B"]) {
        await page
          .getByRole("combobox", { name: "Question collection", exact: true })
          .selectOption(collection);
        const ids = await page
          .getByRole("combobox", { name: "Textbook question", exact: true })
          .locator("option")
          .evaluateAll((nodes) =>
            nodes.map((n) => (n as HTMLOptionElement).value),
          );
        for (const id of ids) {
          await page
            .getByRole("combobox", { name: "Textbook question", exact: true })
            .selectOption(id);
          await page
            .getByRole("button", { name: "Reveal solution", exact: true })
            .click();
          await expect(
            page.getByText("L.H.S. = R.H.S. The solution checks."),
          ).toBeVisible();
          expect(await page.locator(".katex-error").count(), id).toBe(0);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            id,
          ).toBe(true);
          count++;
        }
      }
      expect(count).toBe(106);
      expect(errors).toEqual([]);
      await page.screenshot({
        path: "out/linear-equations/full-bank-" + width + ".png",
        fullPage: true,
      });
    },
  );
test("projection and narrow animated lessons retain readable controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(path + "#learn/4b-11");
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-busy", "false");
  await page.screenshot({
    path: "out/linear-equations/animation-projector.png",
    fullPage: true,
  });
  const box = await board(page).boundingBox();
  expect(box!.y + box!.height).toBeLessThan(1080);
  await page
    .getByRole("button", { name: "Leave projection mode", exact: true })
    .click();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-busy", "false");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "out/linear-equations/animation-phone.png",
    fullPage: true,
  });
});
