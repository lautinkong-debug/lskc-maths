import { expect, test } from "@playwright/test";

test("pilot evidence follows the selected step and hides/restores corresponding pairs", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-14");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const board = page.getByTestId("congruence-copy-board");
  const next = page.getByRole("button", { name: "Next step", exact: true });
  await next.click();
  await expect(board.locator("[data-evidence-key]")).toHaveCount(0);
  await next.click();
  await expect(board.locator("[data-evidence-angle]")).toHaveCount(2);
  await board.locator("[data-evidence-angle]").first().press("Enter");
  await expect(board.locator("[data-evidence-angle]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Diagram controls", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Restore hidden evidence", exact: true })
    .click();
  await expect(board.locator("[data-evidence-angle]")).toHaveCount(2);
  await page
    .getByRole("checkbox", { name: "Show angle evidence", exact: true })
    .uncheck();
  await expect(board.locator("[data-evidence-angle]")).toHaveCount(0);
  await page
    .getByRole("checkbox", { name: "Show angle evidence", exact: true })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Keep earlier evidence visible",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Solution", exact: true }).click();
  await next.click();
  await next.click();
  await expect(board.locator("[data-evidence-angle]")).toHaveCount(4);
  await expect(board.locator("[data-evidence-side]")).toHaveCount(2);
  await expect(board.locator("[data-highlight-angle]")).toHaveCount(0);
  await expect(board.locator("[data-highlight-side]")).toHaveCount(2);
  await page.screenshot({
    path: "out/congruence-improvements/pilot-evidence.png",
  });
  await page
    .getByRole("button", { name: "Reset solution", exact: true })
    .click();
  await expect(board.locator("[data-evidence-key]")).toHaveCount(0);
});

test("right-angle squares and 90 degree labels follow rotation and vertical reflection", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-7");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const board = page.getByTestId("congruence-copy-board");
  for (let i = 0; i < 5; i++)
    await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board.getByTestId("right-angle-mark")).toHaveCount(2);
  await expect(board.getByTestId("evidence-angle-label").first()).toHaveText(
    "90°",
  );
  const shape = board.getByTestId("congruence-shape-0");
  await shape.focus();
  await shape.press("r");
  await page
    .getByRole("button", { name: "Diagram controls", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Flip vertically", exact: true })
    .click();
  await expect(shape).toHaveAttribute("data-reflected", "true");
  await expect(board.getByTestId("right-angle-mark")).toHaveCount(2);
  await expect(board.getByTestId("evidence-angle-label").first()).toHaveText(
    "90°",
  );
  await page.screenshot({
    path: "out/congruence-improvements/right-angle.png",
  });
});

test("dragging nearby triangles snaps rigidly and combines corresponding labels", async ({
  page,
}) => {
  await page.goto("/apps/congruence#qp5-14");
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const board = page.getByTestId("congruence-copy-board");
  const first = board.getByTestId("congruence-shape-0");
  const lengths = () =>
    first.locator(":scope > polygon").evaluate((polygon) => {
      const points = Array.from((polygon as SVGPolygonElement).points);
      return points.map((p, i) =>
        Math.hypot(p.x - points[(i + 1) % 3].x, p.y - points[(i + 1) % 3].y),
      );
    });
  const before = await lengths();
  const centres = await board.evaluate((svg) => {
    const matrix = (svg as SVGSVGElement).getScreenCTM()!;
    return [...svg.querySelectorAll<SVGGElement>("[data-shape]")].map(
      (shape) => {
        const p = new DOMPoint(
          Number(shape.dataset.x),
          Number(shape.dataset.y),
        ).matrixTransform(matrix);
        return { x: p.x, y: p.y };
      },
    );
  });
  await page.mouse.move(centres[0].x, centres[0].y);
  await page.mouse.down();
  await page.mouse.move(centres[1].x + 5, centres[1].y + 4, { steps: 12 });
  await page.mouse.up();
  await expect(board.getByTestId("paired-vertex-label")).toHaveCount(3);
  await expect(board.getByTestId("paired-vertex-label").first()).toContainText(
    "↔",
  );
  (await lengths()).forEach((length, i) =>
    expect(length).toBeCloseTo(before[i], 3),
  );
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board.getByTestId("evidence-side-label")).toHaveCount(1);
  await expect(board.getByTestId("evidence-side-label")).toContainText(
    "QR = TR",
  );
  await page.screenshot({ path: "out/congruence-improvements/snapped.png" });
});
