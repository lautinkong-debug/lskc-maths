import { expect, test } from "@playwright/test";
import { questions } from "../../src/apps/congruence/data";

test("the department library opens congruence under F2 and 2A05", async ({
  page,
}) => {
  await page.goto("/apps");
  await page
    .getByRole("combobox", { name: "Level", exact: true })
    .selectOption("F2");
  await page
    .getByRole("searchbox", { name: "Search apps", exact: true })
    .fill("2A05");
  await page.getByRole("link", { name: /Congruent Triangles/ }).click();
  await expect(page).toHaveURL(/\/apps\/congruence/);
  await expect(page.getByTestId("congruence-source-board")).toBeVisible();
});

test("redrawn diagrams retain all givens and the source question remains available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  for (const id of ["ex5a-27", "ex5c-12"]) {
    await page.goto(`/apps/congruence#${id}`);
    const board = page.getByTestId("congruence-source-board");
    await expect(board.getByTestId("clean-congruence-diagram")).toBeVisible();
    await expect(board.locator("image")).toHaveCount(0);
    for (const label of id === "ex5a-27"
      ? ["A", "B", "C", "D", "E", "5 cm", "2 cm", "x cm", "31°", "y"]
      : ["P", "Q", "R", "S"])
      await expect(
        board.locator("text").filter({ hasText: new RegExp(`^${label}$`) }),
      ).toBeVisible();
    await page.screenshot({ path: `out/congruence-preview/clean-${id}.png` });
    await page.getByRole("button", { name: "Question", exact: true }).click();
    const source = page.getByRole("img", { name: /^Exercise 5[AC] · Q/ });
    await expect(source).toBeVisible();
    await expect
      .poll(() =>
        source.evaluate((img) => (img as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
});

test("all 66 questions load source diagrams and reveal their solution without errors", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/apps/congruence#qp5-14");
  const dialog = page.getByTestId("practice-classroom");
  await expect(dialog).toHaveAttribute("data-classroom", "true");
  const picker = page.getByRole("combobox", {
    name: "Choose a question",
    exact: true,
  });
  const proof = page.getByTestId("congruence-solution");
  for (const q of questions) {
    await picker.selectOption(q.id);
    await expect(proof.locator("tbody tr")).toHaveCount(0);
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
    await expect(proof.locator("tbody tr:visible")).toHaveCount(1);
    expect(
      await page.request
        .get(`/congruence/questions/${q.id}.webp`)
        .then((r) => r.status()),
    ).toBe(200);
    await dialog
      .getByRole("button", { name: "Extracted triangles", exact: true })
      .click();
    await expect(
      page.getByTestId("congruence-copy-board").locator("polygon").first(),
    ).toBeVisible();
    await expect(proof.locator(".katex-error")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("one-line reveals, rewinding, source marks and hidden answers work together", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-14");
  const proof = page.getByTestId("congruence-solution");
  const board = page.getByTestId("congruence-source-board");
  await expect(proof.locator("tbody tr")).toHaveCount(0);
  await expect(board.getByTestId("step-highlights")).toHaveCount(0);
  for (let i = 0; i < 3; i++)
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(1);
  await expect(board.locator("[data-highlight-angle]").first()).toBeVisible();
  await proof.getByRole("button", { name: "Show earlier steps" }).click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(3);
  await proof
    .getByRole("button", { name: "Highlight step 1", exact: true })
    .click();
  await expect(proof.locator("tbody tr")).toHaveCount(1);
  await proof.getByRole("button", { name: "Reset solution" }).click();
  await expect(proof.locator("tbody tr")).toHaveCount(0);
});

test("moving, turning, flipping and vertex gestures preserve triangle lengths", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-14");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const board = page.getByTestId("congruence-copy-board");
  const shape = board.getByTestId("congruence-shape-0");
  const sides = () =>
    shape.locator(":scope > polygon").evaluate((element) => {
      const points = (element as SVGPolygonElement).points;
      return Array.from({ length: 3 }, (_, i) => {
        const a = points.getItem(i),
          b = points.getItem((i + 1) % 3);
        return Math.hypot(a.x - b.x, a.y - b.y);
      });
    });
  const before = await sides();
  await shape.focus();
  await shape.press("ArrowRight");
  await shape.press("r");
  await shape.press("h");
  const circle = shape.locator("circle").first();
  const rect = await circle.boundingBox();
  await page.mouse.move(rect!.x + rect!.width / 2, rect!.y + rect!.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect!.x + 45, rect!.y + 60, { steps: 8 });
  await page.mouse.up();
  (await sides()).forEach((length, i) =>
    expect(length).toBeCloseTo(before[i], 3),
  );
  await page
    .getByRole("button", { name: "Diagram controls", exact: true })
    .click();
  await expect(
    page.getByRole("slider", { name: "Scale", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  (await sides()).forEach((length, i) =>
    expect(length).toBeCloseTo(before[i], 3),
  );
});

test("adding a custom triangle never changes the sizes of existing copies", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-6");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const polygon = page
    .getByTestId("congruence-copy-board")
    .getByTestId("congruence-shape-0")
    .locator(":scope > polygon");
  const side = () =>
    polygon.evaluate((e) => {
      const ps = (e as SVGPolygonElement).points,
        a = ps.getItem(0),
        b = ps.getItem(1);
      return Math.hypot(a.x - b.x, a.y - b.y);
    });
  const before = await side();
  await page
    .getByRole("button", { name: "Diagram controls", exact: true })
    .click();
  await page.getByText("Make another triangle", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "First vertex", exact: true })
    .selectOption("P");
  await page
    .getByRole("combobox", { name: "Second vertex", exact: true })
    .selectOption("B");
  await page
    .getByRole("combobox", { name: "Third vertex", exact: true })
    .selectOption("A");
  await page.getByRole("button", { name: "Add triangle", exact: true }).click();
  expect(await side()).toBeCloseTo(before, 8);
});

test("classroom and board switches retain poses and revealed steps; search filters the bank", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-14");
  const proof = page.getByTestId("congruence-solution");
  await proof.getByRole("button", { name: "Next step", exact: true }).click();
  const shape = page
    .getByTestId("congruence-source-board")
    .getByTestId("congruence-shape-0");
  await shape.focus();
  await shape.press("ArrowRight");
  const x = await shape.getAttribute("data-x");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Original diagram", exact: true })
    .click();
  await expect(shape).toHaveAttribute("data-x", x!);
  await page
    .getByRole("button", { name: "Question bank", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Classroom view", exact: true })
    .click();
  await expect(shape).toHaveAttribute("data-x", x!);
  await expect(proof.locator("tbody tr:visible")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await page
    .getByRole("searchbox", { name: "Find a question", exact: true })
    .fill("5.33");
  const bank = page.getByRole("navigation", {
    name: "Question bank",
    exact: true,
  });
  await expect(bank.getByRole("button")).toHaveCount(1);
});

test("selection keeps existing positions and straight-line vertices cannot become a triangle", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-14");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const board = page.getByTestId("congruence-copy-board");
  const shape = board.getByTestId("congruence-shape-0");
  const x = await shape.getAttribute("data-x");
  await page
    .getByRole("button", { name: "Diagram controls", exact: true })
    .click();
  await page.locator("fieldset").getByRole("button").nth(1).click();
  await expect(shape).toHaveAttribute("data-x", x!);
  await page.getByText("Make another triangle", { exact: true }).click();
  await page
    .getByRole("combobox", { name: "First vertex", exact: true })
    .selectOption("P");
  await page
    .getByRole("combobox", { name: "Second vertex", exact: true })
    .selectOption("R");
  await page
    .getByRole("combobox", { name: "Third vertex", exact: true })
    .selectOption("T");
  await page.getByRole("button", { name: "Add triangle", exact: true }).click();
  await expect(
    page.getByTestId("practice-classroom").getByRole("alert"),
  ).toHaveText("Choose three different, non-collinear vertices.");
});

for (const [width, height] of [
  [1366, 768],
  [1920, 1080],
  [390, 844],
  [360, 640],
  [844, 390],
]) {
  test(`diagram and solution remain usable at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/apps/congruence#rev5-34");
    const proof = page.getByTestId("congruence-solution");
    const next = proof.getByRole("button", { name: "Next step", exact: true });
    const source = page.getByTestId("congruence-source-board");
    for (let i = 0; i < 14; i++) {
      await next.click();
      const rect = await next.boundingBox();
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(height);
      const diagram = await source.boundingBox();
      expect(diagram!.height).toBeGreaterThan(width < 600 ? 170 : 180);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `out/congruence-preview/classroom-${width}x${height}.png`,
    });
  });
}

test("later proof pairs appear in the extracted board", async ({ page }) => {
  await page.goto("/apps/congruence#qp5-12");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const board = page.getByTestId("congruence-copy-board");
  const proof = page.getByTestId("congruence-solution");
  for (let i = 0; i < 6; i++)
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board.locator('[data-shape="△EDF"]')).toBeVisible();
  await expect(board.locator('[data-shape="△ZYX"]')).toBeVisible();
});

test("phone touch moves a copy and question changes clear the solution", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/apps/congruence#qp5-14");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .tap();
  const board = page.getByTestId("congruence-copy-board");
  const shape = board.getByTestId("congruence-shape-0");
  const point = await shape.locator(":scope > polygon").evaluate((element) => {
    const polygon = element as SVGPolygonElement,
      ps = polygon.points;
    const centre = new DOMPoint(
      (ps.getItem(0).x + ps.getItem(1).x + ps.getItem(2).x) / 3,
      (ps.getItem(0).y + ps.getItem(1).y + ps.getItem(2).y) / 3,
    );
    const actual = centre.matrixTransform(polygon.getScreenCTM()!);
    return { x: actual.x, y: actual.y };
  });
  const startX = Number(await shape.getAttribute("data-x"));
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  for (let i = 1; i <= 8; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: point.x + 4 * i, y: point.y + 2 * i }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  expect(Number(await shape.getAttribute("data-x"))).toBeGreaterThan(startX);
  await page
    .getByRole("combobox", { name: "Choose a question" })
    .selectOption("ex5b-30");
  await expect(
    page.getByTestId("congruence-solution").locator("tbody tr"),
  ).toHaveCount(0);
  await context.close();
});
