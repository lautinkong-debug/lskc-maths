import { expect, test, type Page } from "@playwright/test";
import { getReasonChallenge } from "../../src/apps/circle-properties/reasonChallenge";

test.use({ actionTimeout: 10_000 });

async function open(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("circle-diagram")).toBeVisible();
}

test("reason game keeps four-step drafts and checked answers when returning to question one", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("button", { name: "Reasons Relay", exact: true })
    .click();
  await page.getByRole("button", { name: "Start level", exact: true }).click();
  const game = page.getByRole("region", {
    name: "Reasons Relay",
    exact: true,
  });
  const questionId = (await game
    .locator("[data-question-id]")
    .getAttribute("data-question-id"))!;
  const [reasonId, variant] = questionId.split("-");
  const challenge = getReasonChallenge(reasonId, Number(variant));
  const answer = game.locator("#reason-challenge-value");
  const wrongReason = challenge.reasonChoices.find((id) => id !== reasonId)!;
  async function choose(group: string, choice: string) {
    const buttons = game
      .getByRole("group", { name: group, exact: true })
      .getByRole("button");
    for (let i = 0; i < (await buttons.count()); i++) {
      if ((await buttons.nth(i).getAttribute("data-choice")) === choice) {
        await buttons.nth(i).click();
        return;
      }
    }
    throw new Error("Missing challenge choice " + choice);
  }
  await expect(
    game.getByRole("img", { name: /Question diagram/ }),
  ).toBeVisible();
  const legends = await game.locator("fieldset legend").allTextContents();
  expect(legends).toHaveLength(4);
  expect(legends[0]).toContain("Find the value");
  expect(legends[1]).toContain("Check the condition");
  expect(legends[2]).toContain("Identify the target");
  expect(legends[3]).toContain("Choose the reason");
  await answer.fill(String(challenge.q.answer));
  await choose("Condition choices", challenge.q.condition);
  await choose("Target choices", challenge.target);
  await choose("Reason choices", wrongReason);

  await game
    .getByRole("button", { name: "Go to question 2", exact: true })
    .click();
  await expect(answer).toHaveValue("");
  await game
    .getByRole("button", { name: "Go to question 1", exact: true })
    .click();
  await expect(answer).toHaveValue(String(challenge.q.answer));
  await expect(
    game
      .getByRole("group", { name: "Reason choices", exact: true })
      .locator('button[aria-pressed="true"]'),
  ).toHaveAttribute("data-choice", wrongReason);

  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page
    .getByRole("button", { name: "Reasons Relay", exact: true })
    .click();
  await expect(answer).toHaveValue(String(challenge.q.answer));
  await game
    .getByRole("button", { name: "Check all four steps", exact: true })
    .click();
  await expect(
    game.getByRole("heading", { name: "Repair your argument", exact: true }),
  ).toBeVisible();
  await expect(
    game.getByText("70/100 for this answer", { exact: false }),
  ).toBeVisible();
  await game
    .getByRole("button", { name: "Go to question 2", exact: true })
    .click();
  await game
    .getByRole("button", { name: "Go to question 1", exact: true })
    .click();
  await expect(answer).toBeDisabled();
  await page.reload();
  await expect(answer).toHaveValue(String(challenge.q.answer));
  await expect(answer).toBeDisabled();
  await expect(
    game.getByRole("heading", { name: "Repair your argument", exact: true }),
  ).toBeVisible();
  await game
    .getByRole("button", { name: "Try the steps again", exact: true })
    .click();
  await choose("Reason choices", reasonId);
  await game
    .getByRole("button", { name: "Check all four steps", exact: true })
    .click();
  await expect(
    game.getByRole("heading", { name: "Argument complete!", exact: true }),
  ).toBeVisible();
  await expect(
    game.getByText("100/100 for this answer", { exact: false }),
  ).toBeVisible();
});

test("topic 1 guided lesson reveals the result only after the given fact is made true", async ({
  page,
}) => {
  await open(page);
  const lesson = page.getByRole("region", { name: "Guided lesson" });
  await expect(lesson).toBeVisible();
  await expect(
    lesson.getByText("AN and NB appear when the angle is 90°."),
  ).toBeVisible();
  const diagram = page.getByTestId("circle-diagram");
  await expect(diagram).not.toContainText("AN =");

  // A teacher can reveal or hide a reading; the step's reveal still works afterwards.
  await page.getByText("Tools: measurements, snapping and sliders").click();
  await page.getByRole("button", { name: "Show lengths" }).click();
  await expect(diagram).toContainText("AN =");
  await page.getByRole("button", { name: "Hide lengths" }).click();
  await expect(diagram).not.toContainText("AN =");

  async function placeNAtMidpoint() {
    const tools = page.getByText("Tools: measurements, snapping and sliders");
    const fine = page.getByText("Fine-tune / keyboard controls");
    if (!(await fine.isVisible())) await tools.click();
    if (
      !(await page
        .getByLabel("Position of N along AB: exact value")
        .isVisible())
    )
      await fine.click();
    const exact = page.getByLabel("Position of N along AB: exact value");
    await exact.fill("0");
    await exact.press("Enter");
  }

  await placeNAtMidpoint();
  await expect(lesson.getByText("You found: AN = NB")).toBeVisible();
  await expect(diagram).toContainText("AN =");
  await lesson.getByRole("button", { name: "Next step →" }).click();
  await expect(
    lesson.getByText("16.2 · Start with the mid-point"),
  ).toBeVisible();
  await expect(diagram).not.toContainText("90°");

  await placeNAtMidpoint();
  await expect(lesson.getByText("You found: ∠ONB = 90°")).toBeVisible();
  await lesson.getByRole("button", { name: "Next step →" }).click();
  await expect(lesson.locator("[data-chord-sketch]")).toHaveCount(6);
  const first = lesson.getByRole("group", { name: "Question 1", exact: true });
  await first.getByRole("button", { name: "16.2", exact: true }).click();
  await expect(
    lesson.getByText("Look again: ⊥ is given, so use 16.1."),
  ).toBeVisible();
  await expect(lesson.getByText("✗ Not yet")).toBeVisible();
  await first.getByRole("button", { name: "16.1", exact: true }).click();
  await expect(
    lesson.getByText("✓ ⊥ is given, so the chord is cut in half."),
  ).toBeVisible();
  await expect(lesson.getByText("✓ Correct")).toBeVisible();

  await lesson.getByRole("button", { name: "Next step →" }).click();
  await expect(lesson.locator("[data-chord-sketch]")).toHaveCount(4);
  await expect(lesson.locator("[data-math-sqrt]")).toHaveCount(2);
  await expect(lesson.locator("[data-math-fraction]").first()).toBeVisible();
  await expect(lesson.getByText("½")).toHaveCount(0);
  const hidden = lesson.getByRole("group", {
    name: "Question 1, reason 1",
    exact: true,
  });
  await hidden.getByRole("button", { name: /mid-pt/ }).click();
  await expect(lesson.getByText("✗ Not yet")).toBeVisible();
  await hidden.getByRole("button", { name: /bisects chord/ }).click();
  await expect(hidden).toHaveCount(0);
  await expect(lesson.getByText("✓ Correct")).toBeVisible();
});

for (const width of [360, 390]) {
  test.describe(`phone typography at ${width}px`, () => {
    test.use({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
    });

    test("condition, target and reason choices keep mathematical names and prose readable", async ({
      page,
    }) => {
      await open(page);
      await page
        .getByRole("button", { name: "Reasons Relay", exact: true })
        .tap();
      await page
        .getByRole("button", { name: "Start level", exact: true })
        .tap();
      const game = page.getByRole("region", {
        name: "Reasons Relay",
        exact: true,
      });
      const readQueue = () =>
        page.evaluate(() => {
          const raw = localStorage.getItem(
            "lskc-circle-workspace-v3:reason-challenge-v1",
          );
          return raw ? (JSON.parse(raw).queue as string[]) : [];
        });
      await expect.poll(readQueue).toHaveLength(3);
      const questionIndex = (await readQueue()).indexOf("r3");
      expect(questionIndex).toBeGreaterThanOrEqual(0);
      await game
        .getByRole("button", {
          name: `Go to question ${questionIndex + 1}`,
          exact: true,
        })
        .tap();
      await expect(game.locator("[data-question-id]")).toHaveAttribute(
        "data-question-id",
        /^r3-/,
      );

      let sawChordName = false;
      for (const name of [
        "Condition choices",
        "Target choices",
        "Reason choices",
      ]) {
        const choices = game.getByRole("group", { name, exact: true });
        await choices.scrollIntoViewIfNeeded();
        const layout = await choices
          .getByRole("button")
          .evaluateAll((buttons) =>
            buttons.map((button) => {
              const words: { text: string; x: number; y: number }[] = [];
              function walk(node: Node) {
                if (node instanceof Element) {
                  // Fractions intentionally use two-dimensional notation. The
                  // card heading and decorative icons are not sentence content.
                  if (
                    node.hasAttribute("data-math-fraction") ||
                    node.getAttribute("aria-hidden") === "true" ||
                    node.tagName === "SVG" ||
                    node.tagName === "SMALL"
                  )
                    return;
                  node.childNodes.forEach(walk);
                } else if (node.nodeType === Node.TEXT_NODE) {
                  for (const match of (node.textContent ?? "").matchAll(
                    /\S+/g,
                  )) {
                    const range = document.createRange();
                    range.setStart(node, match.index);
                    range.setEnd(node, match.index + match[0].length);
                    for (const rect of range.getClientRects()) {
                      words.push({ text: match[0], x: rect.x, y: rect.y });
                    }
                  }
                }
              }
              walk(button);
              const backwards = words.flatMap((word, index) => {
                const previous = words[index - 1];
                if (
                  previous &&
                  (word.y < previous.y - 7 ||
                    (Math.abs(word.y - previous.y) < 7 &&
                      word.x < previous.x - 4))
                )
                  return [{ previous: previous.text, next: word.text }];
                return [];
              });
              return {
                text: button.textContent,
                backwards,
                variables: Array.from(button.querySelectorAll("var"), (v) => ({
                  text: v.textContent,
                  lines: v.getClientRects().length,
                  height: v.getBoundingClientRect().height,
                  fontSize: parseFloat(getComputedStyle(v).fontSize),
                })),
              };
            }),
          );
        expect(layout).toHaveLength(3);
        for (const choice of layout) {
          expect(
            choice.backwards,
            `${width}px ${name}: prose must read across, then down: ${choice.text}`,
          ).toEqual([]);
          for (const variable of choice.variables) {
            if (variable.text === "AB") sawChordName = true;
            expect(
              variable.lines,
              `${width}px ${name}: ${variable.text} must stay on one line`,
            ).toBeLessThanOrEqual(1);
            expect(variable.height).toBeLessThan(1.9 * variable.fontSize);
          }
        }
      }
      expect(sawChordName).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
      ).toBe(false);
    });
  });
}
