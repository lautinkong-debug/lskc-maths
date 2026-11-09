import { expect, test, type Locator, type Page } from "@playwright/test";
import { sessionPrefix } from "../../src/apps/circle-properties/session";

const lesson = "/apps/circle-properties";
const question = "Where is the centre of this circle?";
const correct = "Where the two perpendicular bisectors meet";

async function touchMove(page: Page, handle: Locator) {
  await handle.scrollIntoViewIfNeeded();
  const bounds = (await handle.boundingBox())!;
  const from = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [from],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: from.x + 25, y: from.y - 15 }],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  } finally {
    await session.detach();
  }
}

async function assertConstruction(diagram: Locator) {
  const [first, second] = await diagram
    .locator("[data-bisector]")
    .evaluateAll((lines) =>
      lines.map((line) => ({
        x: Number(line.getAttribute("x2")) - Number(line.getAttribute("x1")),
        y: Number(line.getAttribute("y2")) - Number(line.getAttribute("y1")),
      })),
    );
  // Independent bisectors have distinct directions, even at the rotation limits.
  const sine =
    Math.abs(first.x * second.y - first.y * second.x) /
    (Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y));
  expect(sine).toBeGreaterThan(0.01);
  for (const [chord, mid] of [
    ["AB", "N"],
    ["CD", "M"],
  ]) {
    await expect(diagram.locator(`[data-equal-half="${chord}"]`)).toHaveCount(
      2,
    );
    await expect(diagram.locator(`[data-right-angle="${mid}"]`)).toBeVisible();
    const endpoints = await diagram
      .locator(`[data-chord="${chord}"]`)
      .evaluate((line) =>
        ["x1", "y1", "x2", "y2"].map((name) => Number(line.getAttribute(name))),
      );
    const centre = await diagram
      .locator(`[data-point="${mid}"] circle`)
      .evaluate((dot) =>
        ["cx", "cy"].map((name) => Number(dot.getAttribute(name))),
      );
    expect(centre[0]).toBeCloseTo((endpoints[0] + endpoints[2]) / 2);
    expect(centre[1]).toBeCloseTo((endpoints[1] + endpoints[3]) / 2);
  }
}

async function assertDiagramLabels(diagram: Locator, names: string[]) {
  const boxes = await diagram.locator("text").evaluateAll(
    (text, labels) =>
      text.flatMap((tag) => {
        const name = tag.closest("[data-point]")?.getAttribute("data-point");
        if (!name || !labels.includes(name)) return [];
        const { x, y, width, height } = tag.getBoundingClientRect();
        return [{ name, x, y, width, height }];
      }),
    names,
  );
  expect(boxes.map((box) => box.name).sort()).toEqual([...names].sort());
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i];
    expect(
      a.height,
      `label ${a.name} should be legible`,
    ).toBeGreaterThanOrEqual(12);
    for (const b of boxes.slice(i + 1)) {
      const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
      const height =
        Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      expect(width > 0 && height > 0, `${a.name} overlaps ${b.name}`).toBe(
        false,
      );
    }
  }
}

async function assertVisibleIntersection(diagram: Locator) {
  await expect(diagram.locator('[data-point="O"] text')).toHaveText(
    /Centre\s*O/,
  );
  await assertConstruction(diagram);
  const offsets = await diagram.evaluate((root) => {
    const centre = root.querySelector(
      '[data-point="O"] circle',
    ) as SVGCircleElement;
    const circle = root.querySelector("svg > circle") as SVGCircleElement;
    const x = centre.cx.baseVal.value,
      y = centre.cy.baseVal.value;
    const outside = Math.hypot(
      x - circle.cx.baseVal.value,
      y - circle.cy.baseVal.value,
    );
    const distances = [
      ...root.querySelectorAll<SVGLineElement>("[data-bisector]"),
    ].map((line) => {
      const a = line.x1.baseVal.value,
        b = line.y1.baseVal.value;
      const dx = line.x2.baseVal.value - a,
        dy = line.y2.baseVal.value - b;
      return Math.abs(dx * (y - b) - dy * (x - a)) / Math.hypot(dx, dy);
    });
    return [outside, ...distances];
  });
  for (const offset of offsets) expect(offset).toBeLessThan(0.01);
}

for (const [device, viewport] of [
  ["phone", { width: 390, height: 844 }],
  ["iPad", { width: 820, height: 1180 }],
] as const) {
  test.describe(device, () => {
    test.use({ viewport, isMobile: true, hasTouch: true });
    for (const path of [lesson, lesson + "/classroom"]) {
      for (const previous of [false, true]) {
        test(`16.3 Investigate opens with crossing bisectors (${previous ? "old coincident lines" : "fresh pupil"}) at ${path}`, async ({
          page,
        }) => {
          await page.goto(path);
          await page.getByRole("button", { name: /^16\.3 ·/ }).tap();
          const guide = page.getByTestId("theorem-lesson");
          if (previous) {
            // Reproduce a pupil's old saved construction in which the two rays overlapped.
            await page.evaluate((key) => {
              const shape = { primary: 5, secondary: 0.5, rotation: 23 };
              localStorage.setItem(
                key,
                JSON.stringify({
                  stage: 1,
                  term: 0,
                  shape,
                  firstLine: shape,
                  prediction: null,
                }),
              );
            }, sessionPrefix + "guided-theorem-r3-v1");
            await page.reload();
          } else {
            await guide
              .getByRole("button", { name: "Investigate", exact: true })
              .tap();
          }
          const pair = guide.getByTestId("two-bisectors");
          await expect(
            guide.getByRole("button", { name: "Investigate", exact: true }),
          ).toHaveAttribute("aria-current", "step");
          await assertVisibleIntersection(pair);
          if (previous)
            await expect(pair.getByText(/CD has been turned/)).toBeVisible();
          const draw = pair.getByRole("button", {
            name: "Trace the bisectors",
          });
          await draw.tap();
          await expect(pair.locator("[data-trace]")).toHaveCount(2);
          const bisector = pair.locator('[data-bisector="CD"]');
          const before = await bisector.getAttribute("x1");
          await touchMove(page, pair.locator('[data-midpoint="M"]'));
          await expect.poll(() => bisector.getAttribute("x1")).not.toBe(before);
          await assertVisibleIntersection(pair);
          await guide
            .getByRole("button", { name: "Show one chord", exact: true })
            .tap();
          await expect(pair).toHaveCount(0);
          await expect(guide.getByTestId("reason-flow-r3")).toBeVisible();
          await guide
            .getByRole("button", { name: "Show both bisectors", exact: true })
            .tap();
          await assertVisibleIntersection(pair);
          await guide
            .getByRole("button", { name: "Predict", exact: true })
            .tap();
          const answers = guide.getByRole("group", {
            name: question,
            exact: true,
          });
          await expect(answers).toBeVisible();
          await expect(pair.locator('[data-point="O"]')).toHaveCount(0);
          await expect(draw).toHaveCount(0);
          await answers
            .getByRole("button")
            .filter({ hasNotText: correct })
            .first()
            .tap();
          await expect(pair.locator('[data-point="O"]')).toHaveCount(0);
          await answers
            .getByRole("button", { name: new RegExp(correct) })
            .tap();
          await assertVisibleIntersection(pair);
        });
      }
      test(`16.3 locates the centre with two chords at ${path}`, async ({
        page,
      }) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(path);
        await page.getByRole("button", { name: /^16\.3 ·/ }).tap();
        // A class can keep working after its single-file lesson has loaded.
        if (path.endsWith("/classroom")) await page.context().setOffline(true);
        const guide = page.getByTestId("theorem-lesson");
        await guide.getByRole("button", { name: "Predict", exact: true }).tap();
        const add = guide.getByRole("button", {
          name: "Add a second chord",
          exact: true,
        });
        await add.tap();

        const choices = guide.getByRole("group", {
          name: question,
          exact: true,
        });
        const right = choices.getByRole("button", {
          name: new RegExp(correct),
        });
        const wrong = choices
          .getByRole("button")
          .filter({ hasNotText: correct })
          .first();
        const diagram = guide.getByTestId("two-bisectors");
        const centreLabel = diagram.locator('[data-point="O"]');
        await expect(choices).toBeVisible();
        await expect(centreLabel).toHaveCount(0);
        await assertDiagramLabels(diagram, ["A", "B", "N", "C", "D", "M"]);
        const secondBisector = diagram.locator('[data-bisector="CD"]');
        const before = await secondBisector.getAttribute("x1");
        await touchMove(page, diagram.locator('[data-midpoint="M"]'));
        await expect
          .poll(() => secondBisector.getAttribute("x1"))
          .not.toBe(before);
        const slider = diagram.getByRole("slider", { name: "Turn chord CD" });
        await slider.press("End");
        await assertConstruction(diagram);
        await slider.press("Home");
        await assertConstruction(diagram);
        const answerBox = await right.boundingBox();
        expect(answerBox?.height).toBeGreaterThanOrEqual(43.99);
        await wrong.tap();
        await expect(choices.locator('[data-correct="false"]')).toBeVisible();
        await expect(centreLabel).toHaveCount(0);
        await right.tap();
        await expect(choices.locator('[data-correct="true"]')).toBeVisible();
        await expect(centreLabel).toBeVisible();
        await assertDiagramLabels(diagram, ["A", "B", "N", "C", "D", "M", "O"]);

        const back = guide.getByRole("button", { name: /one chord/i });
        await back.tap();
        await expect(choices).toHaveCount(0);
        await add.tap();
        await expect(choices).toBeVisible();
        if (path.endsWith("/classroom")) await page.context().setOffline(false);
        await page.reload();
        await expect(choices).toBeVisible();
        await expect(right).toHaveAttribute("aria-pressed", "true");
        await expect(centreLabel).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        ).toBe(true);
        expect(errors).toEqual([]);
      });
    }
  });
}
