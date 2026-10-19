import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { questions } from "../../src/apps/similarity/data";
import { reasonPairs, conditions } from "../../src/apps/similarity/reasons";

test("department app library opens Similarity Studio under F2 and 2B08", async ({
  page,
}) => {
  await page.goto("/apps");
  await page
    .getByRole("combobox", { name: "Level", exact: true })
    .selectOption("F2");
  await page
    .getByRole("searchbox", { name: "Search apps", exact: true })
    .fill("2B08");
  const link = page.getByRole("link", { name: /Similarity Studio/ });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/apps\/similarity/);
  await expect(page.getByTestId("original-board")).toBeVisible();
  await expect(page.getByTestId("manipulation-board")).toBeVisible();
});

async function vertexGesture(
  page: Page,
  shape: Locator,
  handle: Locator,
  angle = 25,
  scale = 1.25,
) {
  await handle.scrollIntoViewIfNeeded();
  const centre = await shape.evaluate((el) => {
    const p = el as SVGGElement;
    const mid = new DOMPoint(
      Number(p.dataset.x),
      Number(p.dataset.y),
    ).matrixTransform(p.getScreenCTM()!);
    return { x: mid.x, y: mid.y };
  });
  const vertex = await handle
    .locator("circle")
    .first()
    .evaluate((el) => {
      const p = el as SVGCircleElement;
      const v = new DOMPoint(
        p.cx.baseVal.value,
        p.cy.baseVal.value,
      ).matrixTransform(p.getScreenCTM()!);
      return { x: v.x, y: v.y };
    });
  const r = (angle * Math.PI) / 180,
    x = vertex.x - centre.x,
    y = vertex.y - centre.y;
  const end = {
    x: centre.x + scale * (x * Math.cos(r) - y * Math.sin(r)),
    y: centre.y + scale * (x * Math.sin(r) + y * Math.cos(r)),
  };
  await page.mouse.move(vertex.x, vertex.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 12 });
  await page.mouse.up();
}

async function screenCentre(shape: Locator) {
  return shape.locator("polygon").evaluate((el) => {
    const polygon = el as SVGPolygonElement,
      points = Array.from(polygon.points);
    const p = new DOMPoint(
      points.reduce((s, p) => s + p.x, 0) / points.length,
      points.reduce((s, p) => s + p.y, 0) / points.length,
    ).matrixTransform(polygon.getScreenCTM()!);
    return { x: p.x, y: p.y };
  });
}

test("angles and lengths hide independently and individual matching marks can be restored", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1100 });
  for (const id of [
    "qp8-1",
    "ex8b-21",
    "ex8a-12",
    "rev8-27",
    "rev8-38",
    "ex8c-19",
  ]) {
    await page.goto(`/apps/similarity#${id}`);
    await page
      .getByRole("button", { name: "Angles & sides", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Hide angles", exact: true })
      .click();
    await expect(page.locator('svg [data-condition^="angle-"]')).toHaveCount(0);
    await expect(page.getByTestId("corresponding-ratio-key")).toHaveCount(2);
    await page
      .getByRole("button", { name: "Hide lengths & ratios", exact: true })
      .click();
    await expect(page.locator('svg [data-condition^="side-"]')).toHaveCount(0);
    await expect(page.getByTestId("corresponding-ratio-key")).toHaveCount(0);
    await expect(
      page.getByTestId("original-board").locator("image"),
    ).toHaveCount(0);
    if (["rev8-27", "rev8-38", "ex8c-19"].includes(id))
      await expect(page.getByTestId("reference-context")).toBeVisible();
    await page
      .getByRole("button", { name: "Show angles", exact: true })
      .click();
    await expect(
      page.locator('svg [data-condition^="angle-"]').first(),
    ).toBeVisible();
    await expect(page.locator('svg [data-condition^="side-"]')).toHaveCount(0);
    await page
      .getByRole("button", { name: "Show lengths & ratios", exact: true })
      .click();
  }
  const shape = page.getByTestId("shape-0"),
    before = await shape.locator("polygon").getAttribute("points");
  await shape
    .getByRole("button", { name: "Hide matching angle at F", exact: true })
    .press("Enter");
  await expect(page.locator('svg [data-condition="angle-1"]')).toHaveCount(0);
  await expect(page.locator('svg [data-condition="angle-0"]')).toHaveCount(4);
  await shape
    .getByRole("button", { name: "Hide matching side FE", exact: true })
    .click();
  await expect(page.locator('svg [data-condition="side-1"]')).toHaveCount(0);
  await expect(shape.locator("polygon")).toHaveAttribute("points", before!);
  await page
    .getByRole("button", { name: "Restore hidden marks", exact: true })
    .click();
  await expect(page.getByTestId("right-angle-mark")).toHaveCount(4);
  await expect(page.locator('svg [data-condition="side-1"]')).toHaveCount(4);
});

test("nearby triangles snap position, rotation and size on both boards and can be released", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1100 });
  for (const original of [false, true]) {
    await page.goto("/apps/similarity#ex8c-19");
    await page
      .getByRole("button", { name: "Angles & sides", exact: true })
      .click();
    await page
      .getByRole("checkbox", { name: "Snap matching triangles", exact: true })
      .check();
    const prefix = original ? "original-shape-" : "shape-";
    const actor = page.getByTestId(`${prefix}0`),
      target = page.getByTestId(`${prefix}1`);
    if (original) {
      await page
        .getByRole("button", { name: "Enlarge original diagram", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Turn original 90°", exact: true })
        .click();
    } else
      await page
        .getByRole("button", { name: "Match orientation", exact: true })
        .click();
    await vertexGesture(
      page,
      actor,
      page.getByTestId(`${prefix}0-vertex-E`),
      original ? -3 : -5,
      1.45,
    );
    await actor.scrollIntoViewIfNeeded();
    const start = await screenCentre(actor),
      end = await screenCentre(target);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x + 6, end.y + 4, { steps: 15 });
    await page.mouse.up();
    expect(Number(await actor.getAttribute("data-angle"))).toBeCloseTo(90);
    expect(Number(await actor.getAttribute("data-scale"))).toBeCloseTo(1.5);
    for (const attribute of ["data-x", "data-y"])
      expect(Number(await actor.getAttribute(attribute))).toBeCloseTo(
        Number(await target.getAttribute(attribute)),
      );
    await expect(
      page.getByText("Snapped to the corresponding triangle.", { exact: true }),
    ).toBeVisible();
    const board = page.getByTestId(
      original ? "original-board" : "manipulation-board",
    );
    await expect(board.getByTestId("paired-vertex-label")).toHaveText([
      "A ↔ A",
      "F ↔ B",
      "E ↔ C",
    ]);
    await expect(actor.getByTestId("vertex-name")).toHaveCount(0);
    await expect(target.getByTestId("vertex-name")).toHaveCount(0);
    await expect(
      board
        .getByTestId("paired-side-label")
        .filter({ hasText: "FE = 2 ↔ BC = 3" }),
    ).toContainText("Ratio 2:3");
    await expect(
      board
        .getByTestId("paired-side-label")
        .filter({ hasText: "EA = 3 ↔ CA = 4.5" }),
    ).toContainText("Ratio 2:3");
    await page
      .getByTestId(original ? "original-board" : "manipulation-board")
      .screenshot({
        path: `out/similarity-preview/snapped-${original ? "original" : "board"}.png`,
      });
    await page
      .getByRole("checkbox", { name: "Snap matching triangles", exact: true })
      .uncheck();
    await actor.scrollIntoViewIfNeeded();
    const at = await screenCentre(actor);
    await page.mouse.move(at.x, at.y);
    await page.mouse.down();
    await page.mouse.move(at.x + 10, at.y + 4, { steps: 4 });
    await page.mouse.up();
    expect(
      Math.abs(
        Number(await actor.getAttribute("data-x")) -
          Number(await target.getAttribute("data-x")),
      ),
    ).toBeGreaterThan(1);
    await expect(board.getByTestId("paired-vertex-label")).toHaveCount(0);
    await expect(board.getByTestId("paired-side-label")).toHaveCount(0);
    await expect(actor.getByTestId("vertex-name")).toHaveText(["A", "F", "E"]);
  }
});

test("touch snapping and independent marks work on a phone", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/apps/similarity#ex8c-19");
  await page.getByRole("button", { name: "Angles & sides", exact: true }).tap();
  await page
    .getByRole("button", { name: "Match first side length", exact: true })
    .tap();
  const actor = page.getByTestId("shape-0"),
    target = page.getByTestId("shape-1");
  await actor.focus();
  await actor.press("Shift+ArrowLeft");
  await page.getByTestId("shape-0-vertex-E").press("ArrowLeft");
  await page.getByTestId("shape-0-vertex-E").press("ArrowDown");
  await actor.scrollIntoViewIfNeeded();
  const start = await screenCentre(actor),
    end = await screenCentre(target),
    cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [start],
  });
  // Model a continuous finger drag. A single instantaneous CDP jump can leave
  // Chrome's tap recogniser suppressing the next otherwise independent click.
  for (let step = 1; step <= 8; step++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: start.x + ((end.x + 3 - start.x) * step) / 8,
          y: start.y + ((end.y + 2 - start.y) * step) / 8,
        },
      ],
    });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect(Number(await actor.getAttribute("data-angle"))).toBeCloseTo(90);
  expect(Number(await actor.getAttribute("data-scale"))).toBeCloseTo(1.5);
  await expect(
    page.getByTestId("manipulation-board").getByTestId("paired-vertex-label"),
  ).toHaveText(["A ↔ A", "F ↔ B", "E ↔ C"]);
  await page.getByRole("button", { name: "Hide angles", exact: true }).tap();
  await expect(page.getByTestId("right-angle-mark")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Hide lengths & ratios", exact: true })
    .tap();
  await expect(page.getByTestId("corresponding-ratio-key")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "out/similarity-preview/mark-controls-phone.png",
    fullPage: true,
  });
  await context.close();
});

test("zoom, fit and pan enlarge both diagrams without changing shapes or original lengths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1100 });
  for (const original of [false, true]) {
    await page.goto("/apps/similarity#ex8c-19");
    await page
      .getByRole("button", { name: "Reset question", exact: false })
      .click();
    await page
      .getByRole("button", { name: "Angles & sides", exact: true })
      .click();
    const title = original ? "Original diagram" : "Move the shapes";
    const board = page.getByTestId(
      original ? "original-board" : "manipulation-board",
    );
    const actor = page.getByTestId(original ? "original-shape-0" : "shape-0");
    const controls = page.getByRole("group", {
      name: `${title} view`,
      exact: true,
    });
    if (original) {
      await page
        .getByRole("button", { name: "Projection mode", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Enlarge original diagram", exact: true })
        .click();
      expect((await board.boundingBox())!.height).toBeGreaterThan(500);
    } else
      await page
        .getByRole("button", { name: "Match first side length", exact: true })
        .click();
    await controls
      .getByRole("button", { name: "Fit triangles", exact: true })
      .click();
    const points = await actor.locator("polygon").getAttribute("points");
    const before = (await actor.locator("polygon").boundingBox())!.height;
    const frame = await board.getAttribute("viewBox");
    const height = (await board.boundingBox())!.height;
    await controls
      .getByRole("button", { name: `Zoom in — ${title}`, exact: true })
      .click();
    expect(
      (await actor.locator("polygon").boundingBox())!.height / before,
    ).toBeCloseTo(1.25, 1);
    expect((await board.boundingBox())!.height).toBeCloseTo(height, 0);
    await expect(actor.locator("polygon")).toHaveAttribute("points", points!);
    await expect(board).not.toHaveAttribute("viewBox", frame!);
    await controls
      .getByRole("button", { name: "Fit triangles", exact: true })
      .click();
    await board.scrollIntoViewIfNeeded();
    const rect = (await board.boundingBox())!;
    const fitted = await board.getAttribute("viewBox");
    await page.mouse.move(rect.x + 24, rect.y + 24);
    await page.mouse.down();
    await page.mouse.move(rect.x + 70, rect.y + 55, { steps: 6 });
    await page.mouse.up();
    await expect(board).not.toHaveAttribute("viewBox", fitted!);
    await expect(actor.locator("polygon")).toHaveAttribute("points", points!);
    await controls
      .getByRole("button", { name: "Fit triangles", exact: true })
      .click();
    if (!original) {
      const label = board
        .getByTestId("paired-side-label")
        .filter({ hasText: "FE = 2 ↔ BC = 3" });
      await expect(label).toContainText("Ratio 2:3");
      for (const box of await board
        .getByTestId("paired-side-label")
        .locator("rect")
        .evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
          }),
        )) {
        const b = (await board.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(b.x);
        expect(box.y).toBeGreaterThanOrEqual(b.y);
        expect(box.right).toBeLessThanOrEqual(b.x + b.width);
        expect(box.bottom).toBeLessThanOrEqual(b.y + b.height);
      }
      await label.click();
      await expect(label).toHaveCount(0);
      await page
        .getByRole("button", { name: "Restore hidden marks", exact: true })
        .click();
      await expect(label).toBeVisible();
      await board.screenshot({
        path: "out/similarity-preview/paired-sides-zoom.png",
      });
      // Starting a drag on a paired label still moves the triangle and restores separate labels.
      await page
        .getByRole("checkbox", { name: "Snap matching triangles", exact: true })
        .uncheck();
      await label.scrollIntoViewIfNeeded();
      const at = (await label.boundingBox())!;
      const startCentre = await screenCentre(actor);
      await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
      await page.mouse.down();
      await page.mouse.move(at.x + at.width / 2 + 60, at.y + at.height / 2, {
        steps: 8,
      });
      await page.mouse.up();
      expect((await screenCentre(actor)).x - startCentre.x).toBeCloseTo(60, 0);
      await expect(board.getByTestId("paired-side-label")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Restore hidden marks", exact: true }),
      ).toHaveCount(0);
    }
    await controls
      .getByRole("button", { name: "Reset view", exact: true })
      .click();
  }
});

test("vertex handles turn and resize both boards, preserve shape and offer keyboard controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1100 });
  await page.goto("/apps/similarity#ex8c-19");
  for (const prefix of ["shape-0", "original-shape-0"]) {
    const shape = page.getByTestId(prefix),
      handle = page.getByTestId(`${prefix}-vertex-E`);
    await expect(handle).toBeVisible();
    const before = await shape
      .locator("polygon")
      .evaluate((el) =>
        Array.from((el as SVGPolygonElement).points).map((p) => [p.x, p.y]),
      );
    await vertexGesture(page, shape, handle);
    expect(Number(await shape.getAttribute("data-angle"))).toBeCloseTo(25, 0);
    expect(Number(await shape.getAttribute("data-scale"))).toBeCloseTo(1.25, 1);
    const after = await shape
      .locator("polygon")
      .evaluate((el) =>
        Array.from((el as SVGPolygonElement).points).map((p) => [p.x, p.y]),
      );
    const ratios = before.map((p, i) => {
      const j = (i + 1) % before.length;
      return (
        Math.hypot(after[i][0] - after[j][0], after[i][1] - after[j][1]) /
        Math.hypot(p[0] - before[j][0], p[1] - before[j][1])
      );
    });
    expect(Math.max(...ratios) - Math.min(...ratios)).toBeLessThan(0.00001);
    const beforeX = await shape.getAttribute("data-x");
    await handle.focus();
    await handle.press("ArrowRight");
    expect(Number(await shape.getAttribute("data-angle"))).toBeCloseTo(30, 0);
    await expect(shape).toHaveAttribute("data-x", beforeX!);
    await handle.press("ArrowUp");
    expect(Number(await shape.getAttribute("data-scale"))).toBeGreaterThan(1.3);
  }
  await page
    .getByRole("combobox", { name: "Vertex drag", exact: true })
    .selectOption("rotate");
  const shape = page.getByTestId("shape-0"),
    handle = page.getByTestId("shape-0-vertex-E");
  const beforeScale = await shape.getAttribute("data-scale");
  await vertexGesture(page, shape, handle, 20, 1.2);
  await expect(shape).toHaveAttribute("data-scale", beforeScale!);
  await page
    .getByRole("combobox", { name: "Vertex drag", exact: true })
    .selectOption("resize");
  const beforeAngle = await shape.getAttribute("data-angle");
  await vertexGesture(page, shape, handle, 15, 1.1);
  await expect(shape).toHaveAttribute("data-angle", beforeAngle!);
});

test("matching angles, right angles and revealed side ratios follow extracted triangles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1100 });
  await page.goto("/apps/similarity#ex8c-19");
  await expect(page.getByTestId("diagram-reasons")).toBeVisible();
  await page
    .getByRole("button", { name: "Angles & sides", exact: true })
    .click();
  await expect(page.getByTestId("similarity-studio")).toContainText("//");
  await expect(page.getByTestId("similarity-studio")).not.toContainText("∥");
  for (const board of ["original-board", "manipulation-board"]) {
    const svg = page.getByTestId(board);
    await expect(svg.getByTestId("right-angle-mark")).toHaveCount(2);
    for (const vertex of ["F", "B"])
      await expect(svg.locator(`[data-vertex="${vertex}"]`)).toHaveText("90°");
    for (const index of [0, 2]) {
      const marks = svg.locator(`[data-condition="angle-${index}"]`);
      await expect(marks).toHaveCount(2);
      expect(await marks.allTextContents()).toEqual(
        index === 0 ? ["α", "α"] : ["γ", "γ"],
      );
      await expect(marks.getByTestId("matching-angle-arc")).toHaveCount(
        2 * (index + 1),
      );
    }
    await expect(svg.locator('[data-condition^="side-"]')).toHaveCount(6);
  }
  await expect(
    page.getByRole("math", {
      name: "AF/AB = FE/BC = EA/CA = 2/3",
      exact: true,
    }),
  ).toHaveCount(2);
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enlarge original diagram", exact: true })
    .click();
  for (const prefix of ["original-shape-0", "shape-0"]) {
    if (prefix === "shape-0") {
      await page
        .getByTestId("original-board")
        .screenshot({ path: "out/similarity-preview/extracted-matches.png" });
      await page
        .getByRole("button", { name: "Show both boards", exact: true })
        .click();
    }
    const shape = page.getByTestId(prefix),
      mark = shape.getByTestId("right-angle-mark");
    const originalMark = await mark.getAttribute("d");
    await shape.focus();
    await shape.press("ArrowRight");
    await shape.press("r");
    await shape.press("h");
    await vertexGesture(
      page,
      shape,
      page.getByTestId(`${prefix}-vertex-E`),
      20,
      1.2,
    );
    await expect(mark).not.toHaveAttribute("d", originalMark!);
    await expect(shape.locator('[data-vertex="F"]')).toHaveText("90°");
    await expect(shape.locator('[data-condition="side-1"]')).toHaveText("FE=2");
  }
  await expect(page.getByTestId("diagram-reasons")).toContainText("AF // BC");
  await page.getByRole("button", { name: "Hide proof", exact: true }).click();
  await expect(page.getByTestId("right-angle-mark")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Hide matching marks", exact: true })
    .click();
  await expect(page.getByTestId("reason-marks")).toHaveCount(0);
  await expect(page.getByTestId("corresponding-ratio-key")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Reset question", exact: false })
    .click();
  await expect(page.getByTestId("right-angle-mark")).toHaveCount(4);
  await expect(page.getByTestId("diagram-reasons")).toBeVisible();
  await page
    .getByTestId("similarity-studio")
    .screenshot({ path: "out/similarity-preview/matching-q19.png" });
});

test("diagram reasons mark the textbook criteria, givens and counterexamples without marking distractors", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1200 });
  for (const [id, title, angles, sides] of [
    ["ex8c-19", "AAA — three equal angle pairs", 3, 0],
    ["qp8-6", "3 sides prop.", 0, 3],
    ["qp8-8", "ratio of 2 sides, inc. ∠", 1, 2],
    ["qp8-3", "Similarity given", 3, 0],
    ["ex8d-20", "Not similar — side ratios differ", 0, 2],
  ] as const) {
    await page.goto(`/apps/similarity#${id}`);
    await expect(page.getByTestId("diagram-reasons")).toBeVisible();
    await expect(page.getByTestId("diagram-reasons")).toContainText(title);
    await page
      .getByRole("button", { name: "Proof conditions", exact: true })
      .click();
    for (const board of ["original-board", "manipulation-board"]) {
      await expect(
        page.getByTestId(board).locator('[data-condition^="angle-"]'),
      ).toHaveCount(angles * 2);
      await expect(
        page.getByTestId(board).locator('[data-condition^="side-"]'),
      ).toHaveCount(sides * 2);
    }
    const condition = page
      .getByTestId("diagram-reasons")
      .locator('[data-testid^="condition-"]')
      .first();
    await condition.click();
    await expect(
      page.getByTestId("manipulation-board").locator("[data-condition]"),
    ).toHaveCount(2);
    await page
      .getByRole("button", { name: "Clear step highlight", exact: true })
      .click();
    if (id === "qp8-6") {
      await page
        .getByRole("group", { name: "Choose up to three shapes", exact: true })
        .getByRole("button", { name: "△XYZ (candidate)", exact: true })
        .click();
      await expect(
        page.getByTestId("shape-2").getByTestId("reason-marks"),
      ).toHaveCount(0);
      await expect(
        page.getByTestId("manipulation-board").locator("[data-condition]"),
      ).toHaveCount(6);
    }
    await page
      .getByTestId("similarity-studio")
      .screenshot({ path: `out/similarity-preview/reasons-${id}.png` });
  }
  await page.goto("/apps/similarity#rev8-35");
  await page
    .getByRole("combobox", { name: "Compare this pair", exact: true })
    .selectOption("1");
  await expect(page.getByTestId("diagram-reasons")).toContainText(
    "Select both named shapes",
  );
  await expect(
    page.getByTestId("manipulation-board").locator("[data-condition]"),
  ).toHaveCount(0);
});

test("clean source diagrams retain givens without printed footer images", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  for (const [id, givens] of [
    ["qp8-2", ["108°", "47°"]],
    ["qp8-5", ["56°", "60°"]],
    ["ex8b-23", ["3 cm", "5 cm", "4 cm", "2 cm"]],
  ] as const) {
    await page.goto(`/apps/similarity#${id}`);
    await page
      .getByRole("button", { name: "Angles & sides", exact: true })
      .click();
    const original = page.getByTestId("original-board");
    await expect(original.getByTestId("clean-source")).toBeVisible();
    await expect(original.locator("image")).toHaveCount(0);
    for (const given of givens) await expect(original).toContainText(given);
    await page
      .getByRole("button", { name: "Enlarge original diagram", exact: true })
      .click();
    await original.screenshot({
      path: `out/similarity-preview/clean-${id}.png`,
    });
  }
});

test("touch vertex gestures and proof overlays fit a phone", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/apps/similarity#ex8c-19");
  await page.getByRole("button", { name: "Angles & sides", exact: true }).tap();
  const cdp = await context.newCDPSession(page);
  for (const prefix of ["original-shape-0", "shape-0"]) {
    const shape = page.getByTestId(prefix),
      handle = page.getByTestId(`${prefix}-vertex-E`);
    await shape.scrollIntoViewIfNeeded();
    const coordinates = await shape.evaluate((el) => {
      const s = el as SVGGElement;
      const handle = s.querySelector(
        '[data-testid$="vertex-E"] circle',
      ) as SVGCircleElement;
      const matrix = s.getScreenCTM()!;
      const centre = new DOMPoint(
        Number(s.dataset.x),
        Number(s.dataset.y),
      ).matrixTransform(matrix);
      const start = new DOMPoint(
        handle.cx.baseVal.value,
        handle.cy.baseVal.value,
      ).matrixTransform(matrix);
      const r = 0.3,
        x = start.x - centre.x,
        y = start.y - centre.y;
      return {
        start: { x: start.x, y: start.y },
        end: {
          x: centre.x + 1.2 * (x * Math.cos(r) - y * Math.sin(r)),
          y: centre.y + 1.2 * (x * Math.sin(r) + y * Math.cos(r)),
        },
      };
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [coordinates.start],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [coordinates.end],
    });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    expect(Number(await shape.getAttribute("data-scale"))).toBeCloseTo(1.2, 1);
    expect(Number(await shape.getAttribute("data-angle"))).toBeGreaterThan(15);
    await expect(shape.locator("[data-condition]")).toHaveCount(6);
    await handle.focus();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "out/similarity-preview/reasons-phone.png",
    fullPage: true,
  });
  await context.close();
});

test("sidebar controls sit on the rail and preserve Similarity state when hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1500, height: 1100 });
  await page.goto("/apps/similarity#ex8c-19");
  await page
    .getByRole("button", { name: "Angles & sides", exact: true })
    .click();
  const shape = page.getByTestId("shape-0");
  await shape.focus();
  await shape.press("ArrowRight");
  const before = await page.getByTestId("manipulation-board").boundingBox();
  const hide = page
    .getByRole("complementary")
    .getByRole("button", { name: "Hide lesson menu", exact: true });
  await hide.click();
  await expect(page.getByRole("complementary")).toBeHidden();
  const show = page.getByRole("button", {
    name: "Show lesson menu",
    exact: true,
  });
  await expect(show).toBeFocused();
  await expect(shape).toHaveAttribute("data-x", "285");
  await expect(page.getByTestId("diagram-reasons")).toBeVisible();
  const after = await page.getByTestId("manipulation-board").boundingBox();
  expect(after!.width).toBeGreaterThan(before!.width);
  await page
    .getByTestId("similarity-studio")
    .screenshot({ path: "out/similarity-preview/sidebar-hidden.png" });
  await show.click();
  await expect(hide).toBeFocused();
  await expect(shape).toHaveAttribute("data-x", "285");
});

test("Q19 pilot: move, turn, reflect, match, reveal and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/apps/similarity#ex8c-19");
  const studio = page.getByTestId("similarity-studio");
  await expect(studio).toBeVisible();
  await expect(page.getByTestId("question-result")).toHaveCount(0);
  const first = page.getByTestId("shape-0");
  await first.focus();
  await first.press("ArrowRight");
  await expect(first).toHaveAttribute("data-x", "285");
  await page.getByRole("button", { name: "Turn 90°", exact: true }).click();
  await expect(first).toHaveAttribute("data-angle", "90");
  await page
    .getByRole("button", { name: "Flip left / right", exact: true })
    .click();
  await expect(first).toHaveAttribute("data-flip-x", "-1");
  await page
    .getByRole("button", { name: "Flip up / down", exact: true })
    .click();
  await expect(first).toHaveAttribute("data-flip-y", "-1");
  await page
    .getByRole("button", { name: "Match orientation", exact: true })
    .click();
  await expect(first).toHaveAttribute("data-angle", "90");
  await expect(first).toHaveAttribute("data-scale", "1");
  await page
    .getByRole("button", { name: "Match first side length", exact: true })
    .click();
  expect(Number(await first.getAttribute("data-scale"))).toBeCloseTo(1.5);
  const overlays = await page
    .getByTestId("manipulation-board")
    .locator("polygon")
    .evaluateAll((ps) =>
      ps.map((p) =>
        p
          .getAttribute("points")!
          .split(" ")
          .map((pair) => pair.split(",").map(Number)),
      ),
    );
  overlays[0].forEach((p, i) => {
    expect(p[0]).toBeCloseTo(overlays[1][i][0]);
    expect(p[1]).toBeCloseTo(overlays[1][i][1]);
  });
  for (let i = 0; i < 6; i++)
    await page
      .getByRole("button", { name: "Reveal next step", exact: true })
      .click();
  await expect(page.getByTestId("question-result")).toContainText("13.5 cm²");
  await page
    .getByRole("button", { name: "Reset question", exact: false })
    .click();
  await expect(page.getByTestId("question-result")).toHaveCount(0);
  await expect(first).toHaveAttribute("data-angle", "0");
  // Drag a point well inside the first triangle using actual rendered geometry.
  const centre = await first.locator("polygon").evaluate((p) => {
    const poly = p as SVGPolygonElement;
    const pts = Array.from(poly.points);
    const point = new DOMPoint(
      pts.reduce((s, p) => s + p.x, 0) / pts.length,
      pts.reduce((s, p) => s + p.y, 0) / pts.length,
    ).matrixTransform(poly.getScreenCTM()!);
    return { x: point.x, y: point.y };
  });
  await page.mouse.move(centre.x, centre.y);
  await page.mouse.down();
  await page.mouse.move(centre.x + 40, centre.y + 30, { steps: 5 });
  await page.mouse.up();
  expect(Number(await first.getAttribute("data-x"))).toBeGreaterThan(280);
  mkdirSync("out/similarity-preview", { recursive: true });
  await studio.screenshot({ path: "out/similarity-preview/q19-desktop.png" });
  expect(errors).toEqual([]);
});

test("phone touch, custom triangle and projection", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/apps/similarity#ex8c-19");
  await expect(page.getByTestId("shape-0")).toBeVisible();
  await page.getByRole("button", { name: "Turn 90°", exact: true }).tap();
  await expect(page.getByTestId("shape-0")).toHaveAttribute("data-angle", "90");
  await page
    .getByRole("button", { name: "Make another shape", exact: false })
    .tap();
  for (const letter of ["A", "C", "E"])
    await page.getByRole("button", { name: letter, exact: true }).tap();
  await page.getByRole("button", { name: "Add shape", exact: true }).tap();
  await expect(
    page.getByRole("button", { name: "Move △ACE", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "out/similarity-preview/q19-phone.png",
    fullPage: true,
  });
  await context.close();
  const desktop = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  await desktop.goto("/apps/similarity#ex8c-19");
  await desktop
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await expect(desktop.locator('[data-presentation="true"]')).toBeVisible();
  await expect(desktop.getByTestId("manipulation-board")).toBeInViewport();
  await desktop.screenshot({
    path: "out/similarity-preview/q19-projector.png",
  });
  await desktop.close();
});

test("original diagram supports direct drag, rotation, reflection, restore and focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/apps/similarity#ex8c-19");
  const original = page.getByTestId("original-shape-0");
  await expect(original).toBeVisible();
  const start = Number(await original.getAttribute("data-x"));
  await original.scrollIntoViewIfNeeded();
  const p = await original.locator("polygon").evaluate((poly) => {
    const el = poly as SVGPolygonElement,
      pts = Array.from(el.points);
    const p = new DOMPoint(
      pts.reduce((s, p) => s + p.x, 0) / pts.length,
      pts.reduce((s, p) => s + p.y, 0) / pts.length,
    ).matrixTransform(el.getScreenCTM()!);
    return { x: p.x, y: p.y };
  });
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 45, p.y + 20, { steps: 8 });
  await page.mouse.up();
  expect(Number(await original.getAttribute("data-x"))).toBeGreaterThan(start);
  await expect(page.getByTestId("shape-0")).toHaveAttribute("data-x", "280");
  await page
    .getByRole("button", { name: "Turn original 90°", exact: true })
    .click();
  await expect(original).toHaveAttribute("data-angle", "90");
  await page
    .getByRole("button", { name: "Flip original left / right", exact: true })
    .click();
  await expect(original).toHaveAttribute("data-flip-x", "-1");
  await original.focus();
  await original.press("v");
  await expect(original).toHaveAttribute("data-flip-y", "-1");
  await page
    .getByRole("button", { name: "Enlarge original diagram", exact: true })
    .click();
  await expect(page.getByTestId("manipulation-board")).toBeHidden();
  await page
    .getByTestId("original-board")
    .screenshot({ path: "out/similarity-preview/direct-original.png" });
  await page
    .getByRole("button", { name: "Restore original positions", exact: false })
    .click();
  await expect(original).toHaveAttribute("data-x", String(start));
  await expect(original).toHaveAttribute("data-angle", "0");
  await page
    .getByRole("button", { name: "Show both boards", exact: true })
    .click();
  await expect(page.getByTestId("manipulation-board")).toBeVisible();
});

test("original diagram supports real touch dragging", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/apps/similarity#ex8c-19");
  const original = page.getByTestId("original-shape-0");
  await expect(original).toBeVisible();
  await original.scrollIntoViewIfNeeded();
  const before = Number(await original.getAttribute("data-x"));
  const p = await original.locator("polygon").evaluate((poly) => {
    const el = poly as SVGPolygonElement,
      pts = Array.from(el.points);
    const p = new DOMPoint(
      pts.reduce((s, p) => s + p.x, 0) / pts.length,
      pts.reduce((s, p) => s + p.y, 0) / pts.length,
    ).matrixTransform(el.getScreenCTM()!);
    return { x: p.x, y: p.y };
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: p.x, y: p.y }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: p.x + 25, y: p.y + 15 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect(Number(await original.getAttribute("data-x"))).toBeGreaterThan(before);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("all 72 source questions, figures and hidden explanations load", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/apps/similarity#ex8c-19");
  await expect(page.getByTestId("similarity-studio")).toBeVisible();
  for (const q of questions) {
    await page.evaluate((id) => {
      window.location.hash = id;
    }, q.id);
    await expect(
      page.getByRole("heading", {
        name: `${q.group} · ${q.group === "Quick Practice" ? q.number : `Q${q.number}`}`,
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByTestId("question-result")).toHaveCount(0);
    await expect(
      page.getByTestId("manipulation-board").locator("polygon"),
    ).toHaveCount(Math.min(2, q.shapes.length));
    const pair = reasonPairs(q)[0],
      annotations = conditions(
        q,
        pair,
        pair.criterion === "given" ? "both" : "proof",
      );
    await expect(
      page
        .getByTestId("manipulation-board")
        .locator('[data-condition^="angle-"]'),
    ).toHaveCount(annotations.filter((r) => r.kind === "angle").length * 2);
    await expect(
      page.getByTestId("manipulation-board").getByTestId("right-angle-mark"),
    ).toHaveCount(annotations.filter((r) => r.degrees === 90).length * 2);
    await expect(
      page
        .getByTestId("manipulation-board")
        .locator('[data-condition^="side-"]'),
    ).toHaveCount(annotations.filter((r) => r.kind === "side").length * 2);
    if (q.constructed) {
      await expect(
        page.getByTestId("original-board").locator("image"),
      ).toHaveCount(0);
      await page
        .getByTestId("original-board")
        .screenshot({ path: `out/similarity-preview/constructed-${q.id}.png` });
    }
    if (q.shapes.length) {
      await page
        .getByRole("button", { name: "Match orientation", exact: true })
        .click();
      const values = await page
        .getByTestId("manipulation-board")
        .locator("polygon")
        .evaluateAll((ps) => ps.map((p) => p.getAttribute("points")!));
      expect(
        values.every((v) => !v.includes("NaN") && !v.includes("Infinity")),
        q.id,
      ).toBe(true);
    }
    for (let i = 0; i < q.proof.length; i++)
      await page
        .getByRole("button", { name: "Reveal next step", exact: true })
        .click();
    await expect(page.getByTestId("question-result")).toHaveText(
      q.result.replace(/[∥‖]/g, "//"),
    );
    const image = await page.request.get(`/similarity/questions/${q.id}.webp`);
    expect(image.status(), q.id).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/webp");
  }
  expect(errors).toEqual([]);
});

test("question filters, triple triangles, polygons and persistence", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/apps/similarity#ex8c-19");
  await page
    .getByRole("combobox", { name: "All sections", exact: true })
    .selectOption("Exercise 8C");
  await expect(
    page.getByText("10 / 72 questions", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Exercise 8C · Q17 p. 8.32", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Choose up to three shapes", exact: true })
    .getByRole("button", { name: "△CGF", exact: true })
    .click();
  await expect(
    page.getByTestId("manipulation-board").locator("polygon"),
  ).toHaveCount(3);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Exercise 8C · Q17", exact: true }),
  ).toBeVisible();
  await page.goto("/apps/similarity#rev8-38");
  await page
    .getByRole("button", { name: "Match orientation", exact: true })
    .click();
  await page
    .getByTestId("similarity-studio")
    .screenshot({ path: "out/similarity-preview/rectangles.png" });
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  await page.setViewportSize({ width: 360, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
