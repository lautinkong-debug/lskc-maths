import { expect, test, type Page } from "@playwright/test";
import { getReasonChallenge } from "../../src/apps/circle-properties/reasonChallenge";

test.use({ actionTimeout: 10_000 });

async function open(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("paper-circle")).toBeVisible();
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
  expect(legends[0]).toContain("Check the condition");
  expect(legends[1]).toContain("Identify the target");
  expect(legends[2]).toContain("Choose the reason");
  expect(legends[3]).toContain("Find the value");
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

async function placeNAtMidpoint(page: Page) {
  const tools = page.getByText("Tools: measurements, snapping and sliders");
  const fine = page.getByText("Fine-tune / keyboard controls");
  if (!(await fine.isVisible())) await tools.click();
  const exact = page.getByLabel("Position of N along AB: exact value");
  if (!(await exact.isVisible())) await fine.click();
  await exact.fill("0");
  await exact.press("Enter");
}

test("topic 1 guided lesson reveals the result only after the given fact is made true", async ({
  page,
}) => {
  await open(page);
  const lesson = page.getByRole("region", { name: "Guided lesson" });
  await expect(lesson).toBeVisible();
  await lesson.getByRole("button", { name: "16.1 Right angle" }).click();
  await expect(
    lesson.getByText("First make the condition true: the angle at N is 90°."),
  ).toBeVisible();
  const diagram = page.getByTestId("circle-diagram");
  await expect(diagram).not.toContainText("AN =");

  // A teacher can reveal or hide a reading; the step's reveal still works afterwards.
  await page.getByText("Tools: measurements, snapping and sliders").click();
  await page.getByRole("button", { name: "Show lengths" }).click();
  await expect(diagram).toContainText("AN =");
  await page.getByRole("button", { name: "Hide lengths" }).click();
  await expect(diagram).not.toContainText("AN =");

  // The condition comes first, on its own. The class then asks what follows.
  const deduce = lesson.getByRole("button", {
    name: "Show what we can deduce →",
  });
  await placeNAtMidpoint(page);
  await expect(diagram.locator("[data-angle-square]")).toHaveCount(1);
  await expect(diagram).not.toContainText("AN =");
  await expect(diagram.locator("[data-equal-tick]")).toHaveCount(0);
  await expect(lesson.getByText("You found: AN = NB")).toHaveCount(0);
  await deduce.click();
  await expect(lesson.getByText("You found: AN = NB")).toBeVisible();
  await expect(diagram).toContainText("AN =");
  await expect(diagram.locator("[data-equal-tick]")).toHaveCount(2);

  // A finished step replays from the start, for the next class.
  const again = async () => {
    await expect(lesson.getByText("You found: AN = NB")).toHaveCount(0);
    await expect(
      lesson.getByText("First make the condition true: the angle at N is 90°."),
    ).toBeVisible();
    await expect(diagram).not.toContainText("AN =");
    await expect(diagram.locator("[data-angle-square]")).toHaveCount(0);
    await expect(
      lesson.getByRole("button", { name: "16.1 Right angle" }),
    ).toHaveAttribute("data-done", "true");
  };
  await page.reload();
  await again();
  await placeNAtMidpoint(page);
  await deduce.click();
  await lesson.getByRole("button", { name: "↺ Show this again" }).click();
  await again();
  await placeNAtMidpoint(page);
  await deduce.click();
  await lesson.getByRole("button", { name: "Next step →" }).click();
  await expect(
    lesson.getByText("16.2 · Start with the mid-point"),
  ).toBeVisible();
  await expect(diagram).not.toContainText("90°");

  await expect(diagram.locator("[data-equal-tick]")).toHaveCount(0);
  await placeNAtMidpoint(page);
  await expect(diagram).toContainText("AN =");
  await expect(diagram.locator("[data-equal-tick]")).toHaveCount(2);
  await expect(diagram).not.toContainText("90°");
  await expect(diagram.locator("[data-angle-square]")).toHaveCount(0);
  await deduce.click();
  await expect(lesson.getByText("You found: ∠ONB = 90°")).toBeVisible();
  await expect(diagram).toContainText("90°");
  await expect(diagram.locator("[data-angle-square]")).toHaveCount(1);
  await lesson.getByRole("button", { name: "Next step →" }).click();
  const questions = page.getByRole("region", { name: "Lesson questions" });
  await expect(questions.locator("[data-chord-sketch]")).toHaveCount(6);

  // The cards use the whole width below the circle, and each question stays one paragraph.
  const wide = (await questions.boundingBox())!.width;
  expect(wide).toBeGreaterThan(1.5 * (await lesson.boundingBox())!.width);
  const paragraph = await questions
    .locator("ol > li p")
    .first()
    .evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      line: parseFloat(getComputedStyle(element).lineHeight) || 24,
    }));
  expect(paragraph.height).toBeLessThan(3 * paragraph.line);

  const first = questions.getByRole("group", {
    name: "Question 1",
    exact: true,
  });
  await first.getByRole("button", { name: /mid-pt/ }).click();
  await expect(
    questions.getByText(
      "Look again: ⊥ is given, so the line from the centre bisects the chord.",
    ),
  ).toBeVisible();
  await expect(questions.getByText("✗ Not yet")).toBeVisible();
  await first.getByRole("button", { name: /bisects chord/ }).click();
  await expect(
    questions.getByText("✓ ⊥ is given, so the chord is cut in half."),
  ).toBeVisible();
  await expect(questions.getByText("✓ Correct")).toBeVisible();

  await questions.getByRole("button", { name: "Next step →" }).click();
  await expect(questions.locator("[data-chord-sketch]")).toHaveCount(4);
  await expect(questions.locator("[data-math-sqrt]")).toHaveCount(1);
  await expect(questions.locator("[data-math-fraction]").first()).toBeVisible();
  await expect(questions.getByText("½")).toHaveCount(0);
  const hidden = questions.getByRole("group", {
    name: "Question 1, reason 1",
    exact: true,
  });
  await hidden.getByRole("button", { name: /mid-pt/ }).click();
  await expect(questions.getByText("✗ Not yet")).toBeVisible();
  await hidden.getByRole("button", { name: /bisects chord/ }).click();
  await expect(hidden).toHaveCount(0);
  await expect(questions.getByText("✓ Correct")).toBeVisible();
});

test("the paper circle demonstrations move on one stage per press", async ({
  page,
}) => {
  await open(page);
  const lesson = page.getByRole("region", { name: "Guided lesson" });
  const controls = page.getByRole("group", { name: "Demonstration controls" });
  const press = (name: string) =>
    controls.getByRole("button", { name, exact: true }).click();

  // Words: each tag shows before its word.
  await press("Show the next tag →");
  await expect(lesson).toContainText("the fixed point O");
  await expect(lesson).not.toContainText("centre");
  await press("Show the word");
  await expect(lesson).toContainText("centre");
  for (let tag = 0; tag < 3; tag++) {
    await press("Show the next tag →");
    await press("Show the word");
  }
  await press("How are they linked? →");
  await expect(lesson).toContainText("Diameter = 2 × radius");
  await press("Next step →");

  // Fold: A lands on B, then the crease is measured.
  const paper = page.getByTestId("paper-circle");
  await press("Fold it →");
  await expect(paper.locator('[data-flipped="true"]')).toHaveCount(1);
  await expect(paper).toContainText("A lands on B");
  await press("Open it →");
  await expect(paper.locator('[data-flipped="true"]')).toHaveCount(0);
  await press("(a) Check the crease →");
  await expect(lesson).toContainText("O, the centre");
  await press("(b) Measure AN and BN →");
  await expect(paper).toContainText("4 cm");
  await expect(paper.locator("[data-paper-square]")).toHaveCount(0);
  await press("(c) Measure ∠ONA →");
  await expect(paper.locator("[data-paper-square]")).toHaveCount(1);
  await press("(d) Measure ON →");
  await expect(lesson).toContainText("9 + 16 = 25");
  await press("What do we see? →");
  await expect(lesson).toContainText("Is measuring enough?");

  // Another chord restarts the fold, with its own numbers.
  await press("Try another chord");
  await expect(paper).toHaveAttribute("data-stage", "0");
  await lesson.getByRole("button", { name: "Mirror proof" }).click();

  // Mirror: the triangle flips, then each blank waits for a press.
  await press("Flip it →");
  await expect(paper.locator('[data-flipped="true"]')).toHaveCount(1);
  await press("Start the proof →");
  await expect(lesson).toContainText("∠ONA = ∠ONB = 90°");
  await press("Next line →");
  await expect(lesson).toContainText("(______)");
  await expect(lesson).not.toContainText("radii");
  await press("Show the reason →");
  await expect(lesson).toContainText("( radii )");
  await press("Next line →");
  await press("Next line →");
  await press("Show the reason →");
  await expect(lesson).toContainText("( RHS )");
  await press("Next line →");
  await expect(lesson).toContainText("∴ AN = ____");
  await press("Show the answer →");
  await expect(lesson).toContainText("Theorem 16.1: if ON ⊥ AB, then AN = BN.");
  await press("Next step →");
  await expect(page.getByTestId("circle-diagram")).toBeVisible();
  await expect(lesson).toContainText("16.1 · Start with a right angle");
});

test.describe("laptop layout", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("the pen tools share the top row, and a whole reason fits on one row", async ({
    page,
  }) => {
    await open(page);
    await page.getByRole("button", { name: /Pen$/ }).first().click();
    const top = async (name: string | RegExp) =>
      (await page.getByRole("button", { name }).first().boundingBox())!.y;
    const undo = await top("Undo");
    expect(Math.abs((await top("Hide pen")) - undo)).toBeLessThan(20);
    expect(Math.abs((await top("Focus")) - undo)).toBeLessThan(20);

    await page.evaluate(() =>
      localStorage.setItem(
        "lskc-circle-workspace-v3:lesson-chords-16-1-16-2-v2",
        JSON.stringify({ step: 4, found: [true, false] }),
      ),
    );
    await page.reload();
    await placeNAtMidpoint(page);
    const lesson = page.getByRole("region", { name: "Guided lesson" });
    await lesson
      .getByRole("button", { name: "Show what we can deduce →" })
      .click();
    const marks = lesson.locator("dd mark");
    await expect(marks).toHaveCount(2);
    const given = (await marks.first().boundingBox())!;
    const result = (await marks.last().boundingBox())!;
    expect(Math.abs(given.y - result.y)).toBeLessThan(4);
  });
});

test.describe("touch screens", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  type Spot = { x: number; y: number };
  async function swipe(page: Page, from: Spot, to: Spot) {
    const cdp = await page.context().newCDPSession(page);
    const touch = (
      type: "touchStart" | "touchMove" | "touchEnd",
      points: Spot[],
    ) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
    await touch("touchStart", [from]);
    for (let step = 1; step <= 12; step++) {
      await touch("touchMove", [
        {
          x: from.x + ((to.x - from.x) * step) / 12,
          y: from.y + ((to.y - from.y) * step) / 12,
        },
      ]);
      await page.waitForTimeout(16);
    }
    await touch("touchEnd", []);
    await cdp.detach();
  }
  async function centre(page: Page, selector: string): Promise<Spot> {
    const box = (await page.locator(selector).first().boundingBox())!;
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }
  const point = (label: string) => `[data-point="${label}"] circle`;

  test("a finger drags points and draws, and still scrolls away from them", async ({
    page,
  }) => {
    await open(page);
    await page.getByRole("button", { name: "16.1 Right angle" }).tap();
    const diagram = page.getByTestId("circle-diagram");
    await diagram.scrollIntoViewIfNeeded();
    const place = async () => (await diagram.boundingBox())!.y;
    const before = await place();
    const a = await centre(page, point("A"));
    const b = await centre(page, point("B"));
    await swipe(page, await centre(page, point("N")), {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
    });
    await expect(
      page.getByRole("button", { name: "Show what we can deduce →" }),
    ).toBeVisible();
    // The circle stays under the finger, even if a shorter task line shifts the page.
    expect(Math.abs((await place()) - before)).toBeLessThan(2);

    await page.getByRole("button", { name: /Pen$/ }).first().tap();
    await page.getByRole("button", { name: "Pen", exact: true }).tap();
    // Tapping the buttons above may scroll them into view; drawing must not.
    const drawing = await page.evaluate(() => scrollY);
    const box = (await diagram.boundingBox())!;
    const middle = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await swipe(page, middle, { x: middle.x + 60, y: middle.y + 60 });
    await expect(
      page.locator('[aria-label="Teacher annotations"] path'),
    ).toHaveCount(1);
    expect(await page.evaluate(() => scrollY)).toBe(drawing);
    await page.getByRole("button", { name: "Move", exact: true }).tap();

    const low = { x: box.x + box.width / 2, y: box.y + box.height * 0.9 };
    await swipe(page, low, { x: low.x, y: low.y - 200 });
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(drawing + 50);
  });

  test("a finger drags the points in the reason explorer", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: /Reveal the reasons/ }).tap();
    const handle = page.locator("[data-flow-handle]").first();
    await handle.scrollIntoViewIfNeeded();
    const place = () =>
      handle.locator("circle").first().getAttribute("cx") as Promise<string>;
    const before = await place();
    const start = (await handle.boundingBox())!;
    const from = {
      x: start.x + start.width / 2,
      y: start.y + start.height / 2,
    };
    await swipe(page, from, { x: from.x + 40, y: from.y + 40 });
    await expect.poll(place).not.toBe(before);
  });
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
