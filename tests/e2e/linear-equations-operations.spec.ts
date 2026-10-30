import { test, expect, type Page } from "@playwright/test";
const url = "/apps/linear-equations#learn/";
const board = (p: Page) => p.getByTestId("equation-animation");
async function next(p: Page) {
  await p.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board(p)).toHaveAttribute("data-busy", "false");
}
async function expectClearArrows(p: import("@playwright/test").Page) {
  const geometry = await board(p)
    .locator("[data-arrows]")
    .evaluate((svg) => {
      const stage = svg.parentElement!;
      const glyphs = [...stage.querySelectorAll(".katex-html span")]
        .filter((el) => el.children.length === 0 && el.textContent?.trim())
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0);
      const paths = [...svg.querySelectorAll<SVGPathElement>("[data-arrow]")];
      const sampled = paths.map((path) => {
        const matrix = path.getScreenCTM()!;
        const points: { x: number; y: number }[] = [];
        for (let d = 0; d <= path.getTotalLength(); d += 2) {
          const point = path.getPointAtLength(d).matrixTransform(matrix);
          points.push({ x: point.x, y: point.y });
        }
        return points;
      });
      return {
        collisions: sampled
          .flat()
          .filter((p) =>
            glyphs.some(
              (r) =>
                p.x > r.left - 3 &&
                p.x < r.right + 3 &&
                p.y > r.top - 3 &&
                p.y < r.bottom + 3,
            ),
          ).length,
        gap: Math.min(
          ...sampled.flatMap((a, i) =>
            sampled
              .slice(i + 1)
              .flatMap((b) =>
                a.map((p) =>
                  Math.min(...b.map((q) => Math.hypot(p.x - q.x, p.y - q.y))),
                ),
              ),
          ),
        ),
      };
    });
  expect(
    geometry.collisions,
    "Arrows must clear every numerator, denominator and other glyph",
  ).toBe(0);
  expect(
    geometry.gap,
    "Each arrow must have a separate lane and starting point",
  ).toBeGreaterThan(3);
}

test("arrows pause on their own stage; only the next click writes each result", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url + "revision-52");
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Speed", exact: true })
    .selectOption("slow");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-phase", "arrows");
  await expect(board(page).locator("[data-frame]")).toHaveCount(1);
  await page.waitForTimeout(550);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const arrow = board(page).locator("[data-arrow]").first();
  const progress = await arrow.evaluate(
    (e) => getComputedStyle(e).strokeDashoffset,
  );
  await page.waitForTimeout(300);
  expect(
    await arrow.evaluate((e) => getComputedStyle(e).strokeDashoffset),
  ).toBe(progress);
  expect(parseFloat(progress)).toBeGreaterThan(0);
  expect(parseFloat(progress)).toBeLessThan(1);
  await expectClearArrows(page);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-busy", "false");
  await expect(board(page).locator("[data-frame]")).toHaveCount(1);
  await expect(board(page).locator("[data-product]")).toHaveCount(0);
  await page.waitForTimeout(400);
  await expect(board(page).locator("[data-frame]")).toHaveCount(1);
  await page.screenshot({ path: "out/linear-equations/arrows-only.png" });
  await next(page);
  await expect(board(page)).toHaveAttribute("data-phase", "result");
  await expect(board(page).locator("[data-frame]")).toHaveCount(2);
  await expect(board(page).locator('[data-frame="1"]')).toContainText(
    "Multiply each term",
  );
  await page.screenshot({ path: "out/linear-equations/next-click-result.png" });
  await next(page); // Simplify the first products.
  await next(page); // Arrows from the negative fractional factor.
  await expect(board(page).locator("[data-frame]")).toHaveCount(3);
  await expectClearArrows(page);
  const origin = await board(page)
    .locator('[data-arrow="0"]')
    .evaluate((e) => {
      const path = e as SVGPathElement,
        scene = path.closest("[data-operation]")!;
      const fraction = scene
        .querySelector('[data-eq-anchor="' + path.dataset.from + '"] .mfrac')!
        .getBoundingClientRect();
      const point = path
        .getPointAtLength(0)
        .matrixTransform(path.getScreenCTM()!);
      return Math.abs(point.x - (fraction.left + fraction.right) / 2);
    });
  expect(origin).toBeLessThan(5);
  await page.screenshot({
    path: "out/linear-equations/negative-fraction-arrows.png",
  });
  await next(page);
  await expect(board(page).locator("[data-frame]")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(board(page)).toHaveAttribute("data-phase", "arrows");
  await expect(board(page).locator("[data-frame]")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .click();
  await expect(board(page).locator("[data-frame]")).toHaveCount(1);
});
test("LCM arrows, explicit products and cancellation have separate reveals", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(url + "qp-4.8a");
  await next(page);
  await expect(board(page)).toHaveAttribute("data-kind", "denominators");
  await expect(board(page).locator('[data-from="lfactor"]')).toHaveCount(2);
  await expect(board(page).locator('[data-from="rfactor"]')).toHaveCount(1);
  await expect(board(page).locator("[data-frame]")).toHaveCount(1);
  await expectClearArrows(page);
  await next(page);
  await expect(board(page).locator("[data-frame]")).toHaveCount(2);
  await next(page);
  await expect(board(page)).toHaveAttribute("data-kind", "cancel");
  await expect(board(page).locator("[data-frame]")).toHaveCount(3);
  await expect(
    board(page).locator("[data-operation=cancel] .katex svg"),
  ).toHaveCount(4);
  await page.screenshot({
    path: "out/linear-equations/visible-cancellation.png",
  });
  await next(page);
  await expect(
    board(page).locator("[data-operation=cancel] .katex svg"),
  ).toHaveCount(4);
});

test("Q20 crosses out both threes and keeps the cancellation history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url + "4b-20");
  await next(page); // Show multiplication arrows.
  await next(page); // Write 3((1 - 4y)/3) = 3(2y).
  const crosses = board(page).locator("[data-operation=cancel] .katex svg");
  await expect(crosses).toHaveCount(0);
  await next(page);
  await expect(crosses).toHaveCount(2);
  for (const cross of await crosses.all()) {
    await expect(cross).toBeVisible();
    await expect(cross).toHaveCSS("color", "rgb(218, 33, 39)");
  }
  await expect(
    board(page).locator('[data-frame="2"] [role="math"]').first(),
  ).toHaveAttribute("aria-label", "1-4\\,y=6\\,y");
  await page.screenshot({ path: "out/linear-equations/q20-cancellation.png" });
  await next(page);
  await expect(crosses).toHaveCount(2);
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(crosses).toHaveCount(2);
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(crosses).toHaveCount(0);
  await next(page);
  await expect(crosses).toHaveCount(2);
  await page
    .getByRole("button", { name: "Replay from start", exact: true })
    .click();
  await expect(crosses).toHaveCount(0);
  await expect(board(page).locator("[data-frame]")).toHaveCount(1);
});

test("autoplay still moves terms after the separate arrow and cancellation stages", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(url + "4b-20");
  await next(page);
  await next(page);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(board(page)).toHaveAttribute("data-kind", "move");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const moving = board(page).locator('[data-moving="true"]');
  await expect(moving).toHaveCount(1);
  expect(
    await moving.evaluate((el) =>
      el
        .getAnimations()
        .some(
          (animation) =>
            animation.effect instanceof KeyframeEffect &&
            animation.effect
              .getKeyframes()
              .some(
                (frame) =>
                  typeof frame.transform === "string" &&
                  frame.transform !== "translate(0,0)",
              ),
        ),
    ),
  ).toBe(true);
  await expect(
    board(page).locator("[data-operation=cancel] .katex svg"),
  ).toHaveCount(2);
});
for (const width of [360, 1366, 1920])
  test(
    "plain working stays in reading order and fits at " + width,
    async ({ page }) => {
      await page.setViewportSize({
        width,
        height: width === 1920 ? 1080 : width === 1366 ? 768 : 800,
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(url + "revision-52");
      if (width === 1920)
        await page
          .getByRole("button", { name: "Projection mode", exact: true })
          .click();
      let initialScroll = 0;
      for (let i = 0; i < 36; i++) {
        if (
          await page
            .getByRole("button", { name: "Next step", exact: true })
            .isDisabled()
        )
          break;
        await next(page);
        const frame = Number(
          await board(page).getAttribute("data-frame-index"),
        );
        const phase = await board(page).getAttribute("data-phase");
        await expect(board(page).locator("[data-frame]")).toHaveCount(
          frame + (phase === "arrows" ? 0 : 1),
        );
        expect(await page.locator(".katex-error").count()).toBe(0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        if (width >= 900) {
          await expect
            .poll(() =>
              page.getByTestId("working-viewport").evaluate((box) => {
                const bounds = box.getBoundingClientRect();
                return [...box.querySelectorAll("[data-frame]")].every((el) => {
                  const r = el.getBoundingClientRect();
                  return (
                    r.top >= bounds.top - 1 &&
                    r.bottom <= bounds.bottom + 1 &&
                    r.left >= bounds.left - 1 &&
                    r.right <= bounds.right + 1
                  );
                });
              }),
            )
            .toBe(true);
          const bounds = await board(page).boundingBox();
          expect(bounds!.y).toBeGreaterThanOrEqual(0);
          expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(
            (width === 1920 ? 1080 : 768) + 1,
          );
          const scroll = await page.evaluate(() => scrollY);
          if (i === 0) initialScroll = scroll;
          else expect(scroll).toBe(initialScroll);
        }
      }
      await expect(
        page.getByText("L.H.S. = R.H.S. The solution checks."),
      ).toBeVisible();
      expect(
        await board(page)
          .locator("[data-column]")
          .evaluateAll((els) =>
            els.every((el) => getComputedStyle(el).backgroundImage === "none"),
          ),
      ).toBe(true);
      if (width >= 900) {
        const layout = await board(page)
          .locator("[data-frame]")
          .evaluateAll((rows) =>
            rows.map((el) => {
              const r = el.getBoundingClientRect();
              return {
                column: el
                  .closest("[data-column]")!
                  .getAttribute("data-column"),
                x: r.x,
                y: r.y,
              };
            }),
          );
        const left = layout.filter((r) => r.column === "0"),
          right = layout.filter((r) => r.column === "1");
        expect(right[0].x).toBeGreaterThan(left[0].x);
        for (const col of [left, right])
          for (let i = 1; i < col.length; i++)
            expect(col[i].y).toBeGreaterThan(col[i - 1].y);
      }
      if (width >= 900)
        expect(
          await board(page)
            .locator("[data-equation-row]")
            .first()
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
        ).toBeGreaterThanOrEqual(13);
      await page.screenshot({
        path: "out/linear-equations/two-columns-" + width + ".png",
      });
      expect(errors).toEqual([]);
    },
  );
test("decimal equations transpose directly then divide, with no LCM stage", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url + "4a-38");
  await next(page);
  await expect(board(page)).toHaveAttribute("data-kind", "move");
  await expect(
    board(page).locator('[data-frame="1"] [role="math"]').first(),
  ).toHaveAttribute("aria-label", "3\\,x=1.4-0.8");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByText("L.H.S. = R.H.S. The solution checks."),
  ).toBeVisible();
  await expect(
    board(page).getByRole("math", { name: "x=0.2", exact: true }),
  ).toBeVisible();
  await expect(board(page).locator("[data-operation]")).toHaveCount(0);
  await page.screenshot({ path: "out/linear-equations/decimal-direct.png" });
  await page
    .getByRole("button", { name: "Check by substitution", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
