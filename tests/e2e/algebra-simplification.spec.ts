import { expect, test } from "@playwright/test";
import { questions } from "../../src/apps/algebra-simplification/bank";

const url = "/apps/algebra-simplification";

test("touch input can open the lesson menu, reveal working and answer", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(url);
    await page.getByRole("button", { name: /^Lesson menu/ }).tap();
    await page.getByRole("button", { name: "Learn", exact: true }).tap();
    await page.getByRole("button", { name: "Next step", exact: true }).tap();
    await expect(page.getByTestId("algebra-player")).toHaveAttribute(
      "data-step",
      "1",
    );
    await page
      .getByRole("button", { name: "Back to practice", exact: true })
      .tap();
    await option(page, "7a").tap();
    await expect(page.getByTestId("algebra-feedback")).toContainText(
      "Solved with support",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});
async function choose(page: import("@playwright/test").Page, id: string) {
  await page
    .getByRole("combobox", { name: "Textbook question", exact: true })
    .selectOption(id);
}
function option(page: import("@playwright/test").Page, tex: string) {
  return page
    .getByTestId("algebra-choice")
    .filter({ has: page.getByRole("math", { name: tex, exact: true }) });
}

test("all 42 textbook answers are marked correctly, once each, without browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await expect(page.getByTestId("algebra-app")).toBeVisible();
  for (const q of questions) {
    await choose(page, q.id);
    for (const button of await page.getByTestId("algebra-choice").all()) {
      await expect(button).toHaveAccessibleName(/^Answer [A-D]:/);
    }
    await expect(
      page.getByRole("math", { name: q.original.tex, exact: true }),
    ).toBeVisible();
    await option(page, q.answer.tex).click();
    await expect(page.getByTestId("algebra-feedback")).toContainText(
      "Correct — fully simplified.",
    );
    await expect(option(page, q.answer.tex)).toBeDisabled();
  }
  await expect(
    page.getByText("42 of 42 solved", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("42 on the first try", { exact: true }),
  ).toBeVisible();
  await choose(page, questions[0].id);
  await expect(option(page, questions[0].answer.tex)).toBeDisabled();
  expect(errors).toEqual([]);
  await page.reload();
  await expect(page.getByText("0 of 42 solved", { exact: true })).toBeVisible();
});

test("wrong, unfinished and supported answers have distinct feedback and honest scores", async ({
  page,
}) => {
  await page.goto(url);
  await choose(page, "3A-7(b)");
  await option(page, "4b").click();
  await expect(page.getByTestId("algebra-feedback")).toContainText(
    "Keep the sign attached",
  );
  await expect(
    page.getByTestId("algebra-feedback").getByRole("math"),
  ).toBeVisible();
  await option(page, "-4b").click();
  await expect(page.getByTestId("algebra-feedback")).toContainText(
    "Solved with support",
  );
  await choose(page, "3A-7(a)");
  await option(page, "(4+3)a").click();
  await expect(page.getByTestId("algebra-feedback")).toContainText(
    "Equivalent, but not fully simplified",
  );
  await page
    .getByRole("button", { name: "Try a similar question", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Textbook question", exact: true }),
  ).not.toHaveValue("3A-7(a)");
  await choose(page, "3A-7(c)");
  await page.getByRole("button", { name: "Show a hint", exact: true }).click();
  await option(page, "2z").click();
  await expect(
    page.getByText("0 on the first try", { exact: true }),
  ).toBeVisible();
  await choose(page, "3A-7(d)");
  await page
    .getByRole("button", { name: "Show worked steps", exact: true })
    .click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page
    .getByRole("button", { name: "Back to practice", exact: true })
    .click();
  await option(page, "3y").click();
  await expect(
    page.getByText("0 on the first try", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Practice skill", exact: true })
    .selectOption("indices");
  await expect(
    page
      .getByRole("combobox", { name: "Textbook question", exact: true })
      .locator("option"),
  ).toHaveCount(10);
  await expect(page.getByText("0 of 10 solved", { exact: true })).toBeVisible();
});

test("source and skill filters preserve progress, keep retries in the chosen set, and stop playback", async ({
  page,
}) => {
  await page.goto(url);
  const source = page.getByRole("combobox", {
    name: "Question bank",
    exact: true,
  });
  const skill = page.getByRole("combobox", {
    name: "Practice skill",
    exact: true,
  });
  const question = page.getByRole("combobox", {
    name: "Textbook question",
    exact: true,
  });
  for (const [collection, counts] of [
    ["exercise", [18, 10, 4, 4]],
    ["quick", [6, 2, 2, 2]],
    ["revision", [18, 6, 8, 4]],
  ] as const) {
    await source.selectOption(collection);
    for (const [i, value] of (
      ["all", "terms", "mixed", "indices"] as const
    ).entries()) {
      await skill.selectOption(value);
      await expect(question.locator("option")).toHaveCount(counts[i]);
      await expect(
        page.getByText(`0 of ${counts[i]} solved`, { exact: true }),
      ).toBeVisible();
    }
  }
  await source.selectOption("quick");
  await expect(
    page.getByRole("region", {
      name: "Quick Practice 3.6(a) · p. 3.12",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Answers checked against the textbook, p. 3.52/),
  ).toBeVisible();
  await option(page, "8d^2").click();
  await page
    .getByRole("button", { name: "Try a similar question", exact: true })
    .click();
  await expect(question).toHaveValue("QP-3.6(b)");
  await option(page, "-y^4z").click();
  await expect(page.getByTestId("algebra-feedback")).toContainText(
    "Two negative factors give a positive product",
  );
  await page
    .getByRole("button", { name: "Try a similar question", exact: true })
    .click();
  await expect(question).toHaveValue("QP-3.6(a)");
  await option(page, "8d^3").click();
  await choose(page, "QP-3.6(b)");
  await option(page, "-y^4z").click();
  await expect(
    page.getByRole("button", { name: "Try a similar question", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("1 of 2 solved", { exact: true })).toBeVisible();
  await source.selectOption("revision");
  await choose(page, "R3-6(c)");
  await expect(
    page.getByText(/Answers checked against the textbook, p. 3.54/),
  ).toBeVisible();
  await option(page, "\\frac{yz}{2}").click();
  await expect(page.getByTestId("algebra-feedback")).toContainText(
    "Work from left to right",
  );
  await page
    .getByRole("button", { name: "Show worked steps", exact: true })
    .click();
  await page.clock.install({ time: new Date("2026-10-26T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-26T12:00:01Z"));
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await source.selectOption("quick");
  await page.clock.runFor(5000);
  await expect(page.getByTestId("algebra-player")).toHaveAttribute(
    "data-step",
    "0",
  );
  await expect(page.getByTestId("algebra-player")).toHaveAttribute(
    "data-playing",
    "false",
  );
  await expect(page.getByText("1 of 2 solved", { exact: true })).toBeVisible();
  await source.selectOption("all");
  await skill.selectOption("all");
  await expect(page.getByText("1 of 42 solved", { exact: true })).toBeVisible();
});

test("working preserves hidden answers, play/pause, speed, replay and question-change cancellation", async ({
  page,
}) => {
  await page.goto(url);
  await choose(page, "3A-10(b)");
  await page
    .getByRole("button", { name: "Show worked steps", exact: true })
    .click();
  const player = page.getByTestId("algebra-player");
  await expect(player).toHaveAttribute("data-step", "0");
  await expect(player.getByRole("math")).toHaveCount(0);
  await page.clock.install({ time: new Date("2026-10-26T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-10-26T12:00:01Z"));
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.runFor(1800);
  await expect(player).toHaveAttribute("data-step", "1");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(4000);
  await expect(player).toHaveAttribute("data-step", "1");
  await page
    .getByRole("combobox", { name: "Speed", exact: true })
    .selectOption("3200");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.runFor(3199);
  await expect(player).toHaveAttribute("data-step", "1");
  await page.clock.runFor(1);
  await expect(player).toHaveAttribute("data-step", "2");
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(player).toHaveAttribute("data-step", "1");
  await expect(player).toHaveAttribute("data-playing", "false");
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .click();
  await expect(player.getByRole("math")).toHaveCount(0);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await choose(page, "3A-8(d)");
  await page.clock.runFor(5000);
  await expect(player).toHaveAttribute("data-step", "0");
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(player).toHaveAttribute("data-step", "3");
  await expect(
    player.getByRole("math", { name: "=2q", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next step", exact: true }),
  ).toBeDisabled();
});

for (const [width, height] of [
  [360, 800],
  [1920, 1080],
]) {
  test(`every question and solution fits at ${width}px, with keyboard and reduced motion`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(url);
    for (const q of questions) {
      await choose(page, q.id);
      await expect(page.getByTestId("algebra-choice")).toHaveCount(4);
      const problemBounds = await page
        .getByRole("math")
        .evaluateAll((elements) =>
          elements.map((el) => {
            const r = el.querySelector(".katex")!.getBoundingClientRect();
            return { left: r.left, right: r.right };
          }),
        );
      expect(problemBounds.every((r) => r.left >= 0 && r.right <= width)).toBe(
        true,
      );
      await option(
        page,
        q.choices.find((choice) => choice.id === "wrong-0")!.tex,
      ).click();
      const correction = await page
        .getByTestId("algebra-feedback")
        .getByRole("math")
        .locator(".katex")
        .boundingBox();
      expect(correction!.x).toBeGreaterThanOrEqual(0);
      expect(correction!.x + correction!.width).toBeLessThanOrEqual(width);
      await page
        .getByRole("button", { name: "Show worked steps", exact: true })
        .click();
      const next = page.getByRole("button", { name: "Next step", exact: true });
      for (const line of q.steps) {
        await next.focus();
        await page.keyboard.press("Enter");
        await expect(
          page
            .getByTestId("algebra-player")
            .getByRole("math", { name: `=${line.tex}`, exact: true }),
        ).toBeVisible();
      }
      const rowBounds = await page
        .getByTestId("algebra-working-line")
        .evaluateAll((rows) =>
          rows.map((row) => {
            const formula = row
              .querySelector(".katex")!
              .getBoundingClientRect();
            const text = row.querySelector("p")!.getBoundingClientRect();
            return {
              left: formula.left,
              right: formula.right,
              textLeft: text.left,
              formulaBottom: formula.bottom,
              textTop: text.top,
            };
          }),
        );
      for (const r of rowBounds) {
        expect(r.left).toBeGreaterThanOrEqual(0);
        expect(r.right).toBeLessThanOrEqual(width);
        expect(r.formulaBottom <= r.textTop + 2 || r.right <= r.textLeft).toBe(
          true,
        );
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page
        .getByRole("button", { name: "Back to practice", exact: true })
        .click();
    }
    await choose(page, "QP-3.6(b)");
    await page.screenshot({
      path: `${process.env.ALGEBRA_OUTPUT_DIR || "out/algebra-preview"}/practice-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Show worked steps", exact: true })
      .click();
    for (let i = 0; i < 3; i++)
      await page
        .getByRole("button", { name: "Next step", exact: true })
        .click();
    await page.screenshot({
      path: `${process.env.ALGEBRA_OUTPUT_DIR || "out/algebra-preview"}/learn-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
  });
}

test("presentation controls and lesson navigation remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url);
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show lesson menu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(page.getByTestId("algebra-app")).toHaveAttribute(
    "data-presenting",
    "true",
  );
  await choose(page, "R3-6(c)");
  await page
    .getByRole("button", { name: "Show worked steps", exact: true })
    .click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.getByTestId("algebra-player")).toHaveAttribute(
    "data-step",
    "1",
  );
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  const controls = await page
    .getByRole("button", { name: "Next question", exact: true })
    .boundingBox();
  expect(controls!.y + controls!.height).toBeLessThanOrEqual(1080);
  await page.screenshot({
    path: `${process.env.ALGEBRA_OUTPUT_DIR || "out/algebra-preview"}/projector.png`,
    fullPage: true,
    animations: "disabled",
  });
});
