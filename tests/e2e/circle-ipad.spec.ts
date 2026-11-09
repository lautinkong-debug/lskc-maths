import { expect, test, type Page } from "@playwright/test";

/**
 * Finger-only checks at iPad sizes, in Edge with touch emulation. Real Safari
 * and a real iPad remain untested: these guard the layout and the logic.
 */
test.use({ actionTimeout: 10_000 });

const ipads = [
  [744, 1133],
  [768, 1024],
  [810, 1080],
  [820, 1180],
  [834, 1112],
  [834, 1194],
  [1024, 1366],
] as const;
const sizes = [
  ...ipads.map(([width, height]) => ({ width, height })),
  ...ipads.map(([height, width]) => ({ width, height })),
  // Split View.
  { width: 320, height: 1024 },
  { width: 507, height: 1024 },
  { width: 678, height: 1024 },
];

async function open(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("paper-circle")).toBeVisible();
}

const steps = (page: Page) =>
  page.getByRole("navigation", { name: "Lesson steps" }).getByRole("button");

/** Runs in the page: anything in the lesson panel that leaves its box. */
function lessonEscapes(): string[] {
  const problems: string[] = [];
  const screen = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > screen + 1)
    problems.push("the page scrolls sideways");
  const lesson = document.querySelector('section[aria-label="Guided lesson"]')!;
  const panel = lesson.closest("aside")!.getBoundingClientRect();
  const words = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect();
  };
  const buttons = lesson.querySelectorAll('nav[aria-label="Lesson steps"] button');
  for (const button of buttons) {
    const label = button.textContent ?? "";
    const box = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    const text = words(button);
    if (text.right > box.right - parseFloat(style.paddingRight) + 1)
      problems.push(`"${label}" reaches past its padding`);
    if (text.left < box.left + parseFloat(style.paddingLeft) - 1)
      problems.push(`"${label}" starts before its padding`);
    if (text.bottom > box.bottom || text.top < box.top)
      problems.push(`"${label}" is taller than its button`);
    if (box.right > panel.right || box.left < panel.left)
      problems.push(`"${label}" leaves the panel`);
    // Rounded: a button easing back from a press measures 43.9999.
    if (Math.round(box.height) < 44) problems.push(`"${label}" is too short`);
  }
  for (const heading of lesson.querySelectorAll("h3, h4")) {
    const text = words(heading);
    if (text.right > panel.right || text.left < panel.left)
      problems.push(`heading "${heading.textContent}" leaves the panel`);
  }
  const table = lesson.querySelector("table")?.getBoundingClientRect();
  if (table && table.right > panel.right) problems.push("the table leaves the panel");
  return problems;
}

async function everyLessonStepFits(page: Page) {
  const count = await steps(page).count();
  expect(count).toBe(7);
  for (let step = 0; step < count; step++) {
    await steps(page).nth(step).tap();
    expect(await page.evaluate(lessonEscapes), `step ${step + 1}`).toEqual([]);
  }
}

for (const { width, height } of sizes) {
  test.describe(`iPad at ${width}x${height}`, () => {
    test.use({
      viewport: { width, height },
      isMobile: true,
      hasTouch: true,
    });

    test("every lesson step fits its box, clean and with saved progress", async ({
      page,
    }) => {
      await open(page);
      await everyLessonStepFits(page);
      await page.reload();
      await expect(steps(page).first()).toBeVisible();
      await everyLessonStepFits(page);
      for (const name of [/Pen$/, /^Focus$/, /^Tasks$/, /^Free play$/]) {
        const box = await page
          .getByRole("button", { name })
          .first()
          .boundingBox();
        // Browsers report layout in fractions of a pixel: 44 can read as 43.99997.
        expect(box!.height, String(name)).toBeGreaterThanOrEqual(43.99);
      }
    });
  });
}

// Safari's text can run wider than Edge's. These are the tightest panels.
for (const [width, height] of [
  [744, 1133],
  [768, 1024],
  [1024, 768],
  [320, 1024],
]) {
  test.describe(`wider text at ${width}x${height}`, () => {
    test.use({ viewport: { width, height }, isMobile: true, hasTouch: true });

    test("nothing leaves the panel", async ({ page }) => {
      await open(page);
      await page.addStyleTag({
        content: "body, body * { letter-spacing: 0.035em !important; }",
      });
      await everyLessonStepFits(page);
    });
  });
}

test.describe("on an iPad", () => {
  test.use({
    viewport: { width: 820, height: 1180 },
    isMobile: true,
    hasTouch: true,
  });

  test("the how-to strip keeps its numbers apart from the item before", async ({
    page,
  }) => {
    await open(page);
    const items = page
      .getByRole("note", { name: "How to use" })
      .getByRole("listitem");
    await expect(items).toHaveCount(3);
    const layout = await items.evaluateAll((list) =>
      list.map((item) => ({
        number: getComputedStyle(item, "::before").content,
        rect: item.getBoundingClientRect().toJSON() as DOMRect,
      })),
    );
    for (const item of layout) expect(item.number).toContain("counter(");
    for (let i = 1; i < layout.length; i++) {
      const [before, item] = [layout[i - 1].rect, layout[i].rect];
      if (Math.abs(before.top - item.top) < 4)
        expect(item.left - before.right).toBeGreaterThanOrEqual(16);
    }
  });

  test("two quick taps cannot zoom, and typed answers are left alone", async ({
    page,
  }) => {
    await open(page);
    expect(
      await page
        .locator("[data-appearance]")
        .evaluate((app) => getComputedStyle(app).touchAction),
    ).toBe("manipulation");
    await page
      .getByRole("button", { name: "Reasons Relay", exact: true })
      .tap();
    await page.getByRole("button", { name: "Start level", exact: true }).tap();
    const answer = page.locator("#reason-challenge-value");
    await expect(answer).toHaveAttribute("autocorrect", "off");
    await expect(answer).toHaveAttribute("autocapitalize", "off");
    await expect(answer).toHaveAttribute("spellcheck", "false");
    expect(
      await answer.evaluate((input) => getComputedStyle(input).fontSize),
    ).toBe("16px");
  });

  test("rotating mid-lesson keeps the step and the finger on the point", async ({
    page,
  }) => {
    await open(page);
    await steps(page).nth(3).tap();
    const cdp = await page.context().newCDPSession(page);
    const point = (label: string) =>
      page.locator(`[data-point="${label}"] circle`).first();
    const centre = async (label: string) => {
      const box = (await point(label).boundingBox())!;
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    async function drag(to: { x: number; y: number }) {
      const from = await centre("N");
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [from],
      });
      for (let i = 1; i <= 10; i++) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [
            {
              x: from.x + ((to.x - from.x) * i) / 10,
              y: from.y + ((to.y - from.y) * i) / 10,
            },
          ],
        });
      }
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    }
    await point("N").scrollIntoViewIfNeeded();
    await page.setViewportSize({ width: 1180, height: 820 });
    await point("N").scrollIntoViewIfNeeded();
    await expect(steps(page).nth(3)).toHaveAttribute("aria-current", "step");

    const a = await centre("A");
    const b = await centre("B");
    const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    await drag(middle);
    const deduce = page.getByRole("button", {
      name: "Show what we can deduce →",
    });
    await expect(deduce).toBeVisible();
    const landed = await centre("N");
    expect(Math.abs(landed.x - middle.x)).toBeLessThan(12);

    // Turned back the other way, the result and the step are still there.
    await page.setViewportSize({ width: 820, height: 1180 });
    await expect(deduce).toBeVisible();
    await deduce.tap();
    const proof = page.locator('[data-evidence-for="r1"] [data-proof-stage="conclusion"]');
    await expect(proof).toContainText("AN = NB");
    await cdp.detach();
  });

  for (const [name, step] of [
    ["a demonstration", 0],
    ["the circle", 3],
  ] as const) {
    test(`Focus keeps ${name} and its buttons on the screen`, async ({
      page,
    }) => {
      await open(page);
      await steps(page).nth(step).tap();
      await page.getByRole("button", { name: "Focus", exact: true }).tap();
      const unfocus = page.getByRole("button", {
        name: "Show mission panel",
        exact: true,
      });
      await expect(unfocus).toBeInViewport();
      if (step === 0) {
        await expect(
          page
            .getByRole("group", { name: "Demonstration controls" })
            .getByRole("button")
            .first(),
        ).toBeInViewport({ ratio: 1 });
      }
    });
  }

  // Chromium only: when the panel grew mid-drag it scrolled to follow its anchor,
  // moving the circle from under the finger. Safari has no scroll anchoring.
  test("a growing panel cannot pull the circle away mid-drag", async ({
    page,
  }) => {
    await open(page);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).overflowAnchor,
      ),
    ).toBe("none");
  });

  test("a teacher's reset gives the next class a fresh start", async ({
    page,
  }) => {
    await open(page);
    await page.getByRole("button", { name: "Got it", exact: true }).tap();
    await steps(page).nth(4).tap();
    await page.getByText("For teachers", { exact: true }).tap();
    await page
      .getByRole("button", { name: "Reset game progress", exact: true })
      .tap();
    await page.getByRole("button", { name: "Reset progress", exact: true }).tap();
    await expect(page.getByTestId("paper-circle")).toBeVisible();
    await expect(steps(page).first()).toHaveAttribute("aria-current", "step");
    await expect(page.getByRole("note", { name: "How to use" })).toBeVisible();
  });
});

for (const [name, block] of [
  [
    "blocked, as with Safari's cookies turned off",
    `Object.defineProperty(window, "localStorage", {
      get() { throw new DOMException("Denied", "SecurityError"); },
    });`,
  ],
  [
    "full",
    `Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };`,
  ],
] as const) {
  test.describe(`storage ${name}`, () => {
    test.use({
      viewport: { width: 820, height: 1180 },
      isMobile: true,
      hasTouch: true,
    });

    test("the lesson still works and can still be reset", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(block);
      await open(page);
      await expect(
        page.getByText("Progress cannot be saved in this browser.").first(),
      ).toBeVisible();
      await steps(page).nth(1).tap();
      await expect(steps(page).nth(1)).toHaveAttribute("aria-current", "step");
      await page
        .getByRole("button", { name: "Reasons Relay", exact: true })
        .tap();
      await page.getByRole("button", { name: "Explore", exact: true }).tap();
      await expect(steps(page).nth(1)).toHaveAttribute("aria-current", "step");
      await page.getByText("For teachers", { exact: true }).tap();
      await page
        .getByRole("button", { name: "Reset game progress", exact: true })
        .tap();
      await page
        .getByRole("button", { name: "Reset progress", exact: true })
        .tap();
      await expect(steps(page).first()).toHaveAttribute("aria-current", "step");
      expect(errors).toEqual([]);
    });
  });
}
