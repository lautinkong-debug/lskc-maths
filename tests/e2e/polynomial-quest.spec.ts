import { expect, test, type Page } from "@playwright/test";
import { parseExpression } from "../../src/apps/polynomials/algebra";
import { mkdirSync } from "node:fs";

const url = "/apps/polynomials#play";
const names = [
  "Term Collector",
  "Sign Guardian",
  "Expansion Gate",
  "The Polynomial Guardian",
];
const key = "lskc.polynomial-quest.v1";
const evidence = "out/polynomial-quest-preview";
test("four one-tap choices retain their order and selected answer on resume", async ({
  page,
}) => {
  await page.goto(url);
  await page
    .getByRole("button", { name: `Start ${names[0]}`, exact: true })
    .click();
  const choices = page.getByTestId("quest-choice");
  await expect(choices).toHaveCount(4);
  await expect(
    page.getByTestId("quest-battle").getByRole("textbox"),
  ).toHaveCount(0);
  const sources = await choices.evaluateAll((buttons) =>
    buttons.map((b) => b.getAttribute("data-source")),
  );
  await page
    .getByRole("button", { name: "Back to quest", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Resume battle", exact: true })
    .click();
  expect(
    await choices.evaluateAll((buttons) =>
      buttons.map((b) => b.getAttribute("data-source")),
    ),
  ).toEqual(sources);
  await answer(page, true);
  const selected = page.locator(
    '[data-testid="quest-choice"][data-selected="true"]',
  );
  const selectedSource = await selected.getAttribute("data-source");
  await expect(selected).toContainText("Your choice");
  await expect(
    page.locator('[data-testid="quest-choice"][data-correct="true"]'),
  ).toContainText("Correct answer");
  await page
    .getByRole("button", { name: "Back to quest", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Resume battle", exact: true })
    .click();
  await expect(selected).toHaveAttribute("data-source", selectedSource!);
  for (const choice of await choices.all()) await expect(choice).toBeDisabled();
});
test("active Play keeps the remembered textbook question", async ({ page }) => {
  await page.goto("/apps/polynomials#textbook:e=10D-34a");
  const play = page.getByRole("link", {
    name: "Polynomial Quest",
    exact: true,
  });
  await play.click();
  await play.click();
  await page
    .getByRole("link", { name: "Textbook lessons", exact: true })
    .click();
  await expect(page).toHaveURL(/#textbook:e=10D-34a$/);
});
function evaluate(node: ReturnType<typeof parseExpression>, x: number): number {
  switch (node.kind) {
    case "number":
      return Number(node.value);
    case "symbol":
      return x;
    case "group":
      return evaluate(node.value, x);
    case "negative":
      return -evaluate(node.value, x);
    case "binary": {
      const a = evaluate(node.left, x),
        b = evaluate(node.right, x);
      if (node.op === "+") return a + b;
      if (node.op === "-") return a - b;
      if (node.op === "*") return a * b;
      if (node.op === "/") return a / b;
      return a ** b;
    }
  }
}
async function choiceFor(page: Page, wrong = false) {
  const source = (await page
    .getByTestId("quest-question")
    .getAttribute("data-source"))!;
  const node = parseExpression(source);
  const choices = page.getByTestId("quest-choice");
  await expect(choices).toHaveCount(4);
  const matches: boolean[] = [];
  for (const choice of await choices.all()) {
    const option = parseExpression((await choice.getAttribute("data-source"))!);
    matches.push(
      [0, 1, -1].every((x) => evaluate(node, x) === evaluate(option, x)),
    );
  }
  expect(matches.filter(Boolean)).toHaveLength(1);
  return choices.nth(matches.indexOf(!wrong));
}
async function answer(page: Page, wrong = false) {
  await (await choiceFor(page, wrong)).click();
}
async function finish(page: Page) {
  for (let i = 0; i < 6; i++) {
    await answer(page);
    await expect(
      page.getByText("Shield broken!", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: i === 5 ? "See results" : "Continue",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Guardian cleared!", exact: true }),
  ).toBeVisible();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}

test("map offers three skill battles and a locked mixed boss", async ({
  page,
}) => {
  await page.goto("/apps/polynomials#play");
  await expect(
    page.getByRole("heading", { name: "Polynomial Quest", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start Term Collector", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Start The Polynomial Guardian",
      exact: true,
    }),
  ).toBeDisabled();
});

test("a perfect battle, replay, saved stars and refresh", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page
    .getByRole("button", { name: `Start ${names[0]}`, exact: true })
    .click();
  await finish(page);
  await expect(
    page.getByText("Solved without help: 6 / 6", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: `${evidence}/victory.png`, fullPage: true });
  await page.getByRole("button", { name: "Play again", exact: true }).click();
  await expect(page.getByText("Round 1 of 6", { exact: true })).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Best: 6 / 6 without help", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("hint and fresh multiple-choice recovery preserve honest scoring", async ({
  page,
}) => {
  await page.goto(url);
  await page
    .getByRole("button", { name: `Start ${names[1]}`, exact: true })
    .click();
  await page.getByRole("button", { name: "Show a hint", exact: true }).click();
  await expect(
    page.getByText("A useful first step", { exact: true }),
  ).toBeVisible();
  const original = await page
    .getByTestId("quest-question")
    .getAttribute("data-source");
  await answer(page, true);
  await expect(
    page.getByRole("region", { name: "Follow the working", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: `${evidence}/correction.png`, fullPage: true });
  await page
    .getByRole("button", { name: "Try a similar question", exact: true })
    .click();
  expect(
    await page.getByTestId("quest-question").getAttribute("data-source"),
  ).not.toBe(original);
  await answer(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (let i = 1; i < 6; i++) {
    if (i === 1)
      await page
        .getByRole("button", { name: "Show a hint", exact: true })
        .click();
    await answer(page);
    await page
      .getByRole("button", {
        name: i === 5 ? "See results" : "Continue",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByText("Solved without help: 4 / 6", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("2 of 3 stars", { exact: true })).toBeVisible();
});

test("all skill battles complete and unlock a playable boss", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto(url);
  for (let stage = 0; stage < 4; stage++) {
    await page
      .getByRole("button", { name: `Start ${names[stage]}`, exact: true })
      .click();
    await finish(page);
    await page
      .getByRole("button", { name: "Back to quest", exact: true })
      .click();
  }
  await expect(page.getByText("12 / 12 stars", { exact: true })).toBeVisible();
});

test("Learn/Play, back, resume and restart keep the game coherent", async ({
  page,
}) => {
  await page.goto(url);
  await page
    .getByRole("button", { name: `Start ${names[2]}`, exact: true })
    .click();
  await answer(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const source = await page
    .getByTestId("quest-question")
    .getAttribute("data-source");
  await page
    .getByRole("link", { name: "Textbook lessons", exact: true })
    .click();
  await expect(page.getByTestId("polynomial-player")).toBeVisible();
  await page.goBack();
  await expect(page.getByText("Round 2 of 6", { exact: true })).toBeVisible();
  expect(
    await page.getByTestId("quest-question").getAttribute("data-source"),
  ).toBe(source);
  await page
    .getByRole("button", { name: "Back to quest", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Resume battle", exact: true })
    .click();
  await expect(page.getByText("Round 2 of 6", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Start again", exact: true }).click();
  await page.getByRole("button", { name: "Start fresh", exact: true }).click();
  await expect(page.getByText("Round 1 of 6", { exact: true })).toBeVisible();
});

test("corrupt, blocked and cross-tab storage have clear outcomes", async ({
  page,
  context,
}) => {
  await page.addInitScript((key) => localStorage.setItem(key, "corrupt"), key);
  await page.goto(url);
  await expect(page.getByText("0 / 12 stars", { exact: true })).toBeVisible();
  const other = await context.newPage();
  await other.goto(url);
  await other.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          stages: [
            { stars: 3, best: 6 },
            { stars: 3, best: 6 },
            { stars: 1, best: 0 },
            { stars: 0, best: 0 },
          ],
        }),
      ),
    key,
  );
  await expect(
    page.getByRole("button", { name: `Start ${names[3]}`, exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Reset game progress", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Clear quest stars", exact: true })
    .click();
  await expect(other.getByText("0 / 12 stars", { exact: true })).toBeVisible();
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    }),
  );
  await page.reload();
  await expect(page.getByText(/Progress cannot be saved/)).toBeVisible();
  await page
    .getByRole("button", { name: `Start ${names[0]}`, exact: true })
    .click();
  await answer(page);
  await expect(page.getByText("Shield broken!", { exact: true })).toBeVisible();
});

for (const [width, height] of [
  [360, 740],
  [390, 844],
  [844, 390],
  [1920, 1080],
])
  test(`readable layout at ${width}x${height}`, async ({ page }) => {
    mkdirSync(evidence, { recursive: true });
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(url);
    await expect(
      page.getByRole("heading", { name: "Polynomial Quest", exact: true }),
    ).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
      path: `${evidence}/map-${width}.png`,
      fullPage: true,
    });
    if (width === 1920)
      await page
        .getByRole("button", { name: "Projection mode", exact: true })
        .click();
    await page
      .getByRole("button", { name: `Start ${names[2]}`, exact: true })
      .click();
    await noOverflow(page);
    const choice = await choiceFor(page, true);
    for (const button of await page.getByTestId("quest-choice").all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(60);
      expect(
        await button.evaluate((b) => b.scrollWidth <= b.clientWidth + 1),
      ).toBe(true);
    }
    await page.screenshot({
      path: `${evidence}/choices-${width}.png`,
      fullPage: true,
    });
    await choice.focus();
    await page.keyboard.press("Enter");
    await noOverflow(page);
    await page.screenshot({
      path: `${evidence}/battle-${width}.png`,
      fullPage: true,
    });
  });

test("existing textbook route and malformed hashes still work", async ({
  page,
}) => {
  await page.goto("/apps/polynomials");
  await expect(page).toHaveURL(/#textbook:e=10D-34b$/);
  await expect(page.getByTestId("polynomial-player")).toBeVisible();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.goto("/apps/polynomials#play-unknown");
  await expect(page.getByTestId("polynomial-player")).toBeVisible();
  await expect(
    page.getByText(/This question link was not recognised/),
  ).toBeVisible();
});
