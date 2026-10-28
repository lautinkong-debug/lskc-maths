import { expect, test } from "@playwright/test";
import { challengeQuestions } from "../../src/apps/directed-numbers/lib/challengePractice";

test("challenge navigation, difficulty, deep links and textbook isolation", async ({
  page,
}) => {
  await page.goto("/apps/directed-numbers#textbook:e=R2-37b");
  await page
    .getByRole("link", { name: "Challenge practice", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Challenge practice · Q1", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("combobox", { name: "Question", exact: true })
      .locator("option"),
  ).toHaveCount(20);
  await expect(
    page.getByRole("combobox", { name: "Exercise", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText(/Original extension questions/)).toBeVisible();
  await page
    .getByRole("combobox", { name: "Difficulty", exact: true })
    .selectOption("2");
  await expect(
    page
      .getByRole("combobox", { name: "Question", exact: true })
      .locator("option"),
  ).toHaveCount(10);
  await expect(page).toHaveURL(/#challenge:e=C-11$/);
  await page
    .getByRole("combobox", { name: "Question", exact: true })
    .selectOption({ label: "Q20" });
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Challenge practice · Q20",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next question", exact: false }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Previous question", exact: false })
    .click();
  await expect(page).toHaveURL(/#challenge:e=C-19$/);
  await page
    .getByRole("link", { name: "Textbook practice", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Exercise", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Original extension questions/)).toHaveCount(0);
  await page.goto("/apps/directed-numbers#challenge:e=missing");
  await expect(
    page.getByRole("heading", { name: "Challenge practice · Q1", exact: true }),
  ).toBeVisible();
});

for (const width of [390, 1920]) {
  test(`all 20 questions and teacher reveals at ${width}px`, async ({
    page,
  }, info) => {
    test.setTimeout(240000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1080 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/apps/directed-numbers#challenge:e=C-1");
    if (width === 1920) {
      await expect(
        page.getByRole("button", {
          name: /^(Projection mode|Leave projection mode)$/,
        }),
      ).toBeVisible();
      const enter = page.getByRole("button", {
        name: "Projection mode",
        exact: true,
      });
      if (await enter.count()) await enter.click();
    }
    for (const question of challengeQuestions) {
      await page
        .getByRole("combobox", { name: "Question", exact: true })
        .selectOption({ label: `Q${question.question}` });
      await expect(page.getByTestId("equation-frame")).toHaveAttribute(
        "data-phase",
        "start",
      );
      await expect(page.locator('[data-next-calculation="true"]')).toHaveCount(
        0,
      );
      const original = page.locator("[data-equation-line]").first();
      await expect(
        original.locator(".frac-line:visible").first(),
      ).toBeVisible();
      await expect(original).toHaveAttribute("data-tex", /\^\{[2-5]\}/);
      if (width === 390) {
        const hide = page.getByRole("button", {
          name: "Hide optional written steps",
          exact: true,
        });
        if (await hide.count()) await hide.click();
      }
      const next = page.getByRole("button", { name: "Next step", exact: true });
      await next.click();
      await expect(page.getByTestId("equation-frame")).toHaveAttribute(
        "data-phase",
        "highlight",
      );
      await expect(page.locator('[data-next-calculation="true"]')).toHaveCount(
        1,
      );
      if ([4, 12, 19, 20].includes(question.question))
        await page.screenshot({
          path: info.outputPath(`${question.id}-highlight.png`),
          animations: "disabled",
        });
      let clicks = 1;
      while (await next.isEnabled()) {
        await next.click();
        expect(++clicks).toBeLessThan(80);
        await expect(page.locator(".katex-error")).toHaveCount(0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          question.id,
        ).toBe(true);
      }
      await expect(
        page.getByText("Demonstration complete", { exact: true }),
      ).toBeVisible();
      const [n, d] = question.answer.split("/");
      const expected = d
        ? `${n.startsWith("-") ? "-" : ""}\\frac{${n.replace("-", "")}}{${d}}`
        : n;
      await expect
        .poll(async () =>
          (
            await page
              .locator("[data-equation-line]")
              .last()
              .getAttribute("data-tex")
          )
            ?.replace(/^=\s*/, "")
            .replace(/^\+/, ""),
        )
        .toBe(expected);
      if ([4, 12, 19, 20].includes(question.question))
        await page.screenshot({
          path: info.outputPath(`${question.id}-complete.png`),
          fullPage: true,
          animations: "disabled",
        });
      await page
        .getByRole("button", { name: "Previous step", exact: true })
        .click();
      await expect(next).toBeEnabled();
      await page
        .getByRole("button", { name: "Replay from start", exact: true })
        .click();
      await expect(page.getByTestId("equation-frame")).toHaveAttribute(
        "data-phase",
        "start",
      );
    }
    expect(errors).toEqual([]);
  });
}
