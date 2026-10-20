import { expect, test } from "@playwright/test";
import { edgeCrossesLabel } from "../../src/apps/similarity/vertexLabels";

test("each proof starts with only its required angle and side conditions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  for (const [id, angles, sides, criterion] of [
    ["ex8c-19", 3, 0, "AAA"],
    ["qp8-6", 0, 3, "3 sides prop."],
    ["qp8-8", 1, 2, "ratio of 2 sides, inc. ∠"],
    ["ex8d-17", 4, 4, "Equal angles + proportional sides"],
    ["ex8d-20", 0, 2, "Not similar"],
  ] as const) {
    await page.goto(`/apps/similarity#${id}`);
    const proof = page.getByTestId("diagram-reasons");
    await expect(proof).toBeVisible();
    await expect(proof).toContainText(criterion);
    await expect(
      proof.getByRole("button", { name: "Proof conditions", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    for (const board of ["original-board", "manipulation-board"]) {
      const svg = page.getByTestId(board);
      await expect(svg.locator('[data-condition^="angle-"]')).toHaveCount(
        angles * 2,
      );
      await expect(svg.locator('[data-condition^="side-"]')).toHaveCount(
        sides * 2,
      );
    }
    await expect(
      page.getByTestId("original-board").locator("image"),
    ).toHaveCount(0);
    if (id === "ex8c-19") {
      await expect(page.getByTestId("corresponding-ratio-key")).toHaveCount(0);
      await expect(page.getByTestId("original-board")).not.toContainText("cm");
      await expect(proof).toContainText("90° − ∠CAF");
      await expect(proof).toContainText("AF // BC");
      const conclusion = proof.getByTestId("similarity-conclusion");
      await expect(conclusion.locator("td").nth(0)).toHaveText("∴ △AFE ∼ △ABC");
      await expect(conclusion.locator("td").nth(1)).toHaveText("AAA");
    }
  }
  await page.goto("/apps/similarity#qp8-3");
  await expect(page.getByTestId("diagram-reasons")).toContainText(
    "Similarity is given in this question",
  );
  await expect(page.getByTestId("diagram-reasons")).not.toContainText(
    "Therefore",
  );
});

test("proof stays beside the enlarged diagram and can highlight, hide and restore without moving shapes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/apps/similarity#ex8c-19");
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enlarge original diagram", exact: true })
    .click();
  const proof = page.getByTestId("diagram-reasons");
  const original = page.getByTestId("original-board");
  const before = await page
    .getByTestId("original-shape-0")
    .locator("polygon")
    .getAttribute("points");
  const graphBox = await original.boundingBox(),
    proofBox = await proof.boundingBox();
  expect(proofBox!.x).toBeGreaterThanOrEqual(graphBox!.x + graphBox!.width);
  await proof.getByTestId("condition-angle-1").click();
  await expect(original.locator('[data-condition^="angle-"]')).toHaveCount(2);
  await expect(original.getByTestId("right-angle-mark")).toHaveCount(2);
  await proof
    .getByRole("button", { name: "Clear step highlight", exact: true })
    .click();
  await expect(original.locator('[data-condition^="angle-"]')).toHaveCount(6);
  await page.getByRole("button", { name: "Hide proof", exact: true }).click();
  await expect(proof).toHaveCount(0);
  await expect(
    page.getByTestId("original-shape-0").locator("polygon"),
  ).toHaveAttribute("points", before!);
  await page.getByRole("button", { name: "Show proof", exact: true }).click();
  await expect(proof).toBeVisible();
  await proof.getByTestId("condition-angle-1").click();
  await page
    .getByRole("button", { name: "Show lengths & ratios", exact: true })
    .click();
  await expect(original.locator('[data-condition^="side-"]')).toHaveCount(6);
  await proof
    .getByRole("button", { name: "Proof conditions", exact: true })
    .click();
  await expect(original.locator('[data-condition^="side-"]')).toHaveCount(0);
  await expect(page.getByTestId("corresponding-ratio-key")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await original.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "out/similarity-preview/proof-beside-diagram.png",
  });
});

test("proof and diagrams fit a phone and multiple comparisons use their own proof", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/apps/similarity#ex8c-19");
  await expect(page.getByTestId("diagram-reasons")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "out/similarity-preview/proof-phone.png",
    fullPage: true,
  });
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

test("textbook proof places stacked fractions and reasons beside each step on desktop and phone", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/apps/similarity#qp8-8");
    const proof = page.getByTestId("diagram-reasons");
    const rows = proof.locator("tbody tr");
    await expect(rows).toHaveCount(5);
    await expect(proof.locator(".mfrac")).toHaveCount(8);
    await expect(rows.nth(2)).toHaveAttribute(
      "data-testid",
      "proof-ratio-summary",
    );
    await expect(rows.nth(3)).toContainText("35°");
    await expect(rows.nth(4).locator("td").nth(1)).toHaveText(
      "ratio of 2 sides, inc. ∠",
    );
    for (const row of await rows.all()) {
      const cells = row.locator("td");
      const left = await cells.nth(0).boundingBox(),
        right = await cells.nth(1).boundingBox();
      expect(right!.x).toBeGreaterThanOrEqual(left!.x + left!.width - 1);
      expect(Math.abs(left!.y - right!.y)).toBeLessThan(1);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await proof.screenshot({
      path: `out/similarity-preview/textbook-proof-${width}.png`,
    });
  }
});

test("Q17 vertex names clear graph edges in the original and moved diagrams", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/apps/similarity#ex8c-17");
  const original = page.getByTestId("original-board");
  const inspect = async (board: typeof original, selector: string) => {
    const data = await board.evaluate(
      (svg, selector) => ({
        labels: [...svg.querySelectorAll<SVGTextElement>(selector)].map(
          (text) => {
            const b = text.getBBox();
            return {
              text: text.textContent,
              x: b.x,
              y: b.y,
              width: b.width,
              height: b.height,
            };
          },
        ),
        polygons: [...svg.querySelectorAll<SVGPolygonElement>("polygon")].map(
          (p) => [...p.points].map((v) => ({ x: v.x, y: v.y, label: "" })),
        ),
      }),
      selector,
    );
    expect(data.labels.length).toBeGreaterThan(0);
    for (const label of data.labels)
      for (const polygon of data.polygons)
        for (let i = 0; i < polygon.length; i++)
          expect(
            edgeCrossesLabel(
              polygon[i],
              polygon[(i + 1) % polygon.length],
              label,
            ),
            label.text ?? "",
          ).toBe(false);
  };
  await inspect(original, '[data-testid="reference-vertex-name"]');
  await page
    .getByRole("button", { name: "Enlarge original diagram", exact: true })
    .click();
  const withinFrame = await original.evaluate((svg) => {
    const frame = (svg as unknown as SVGSVGElement).viewBox.baseVal;
    return [
      ...svg.querySelectorAll<SVGTextElement>(
        '[data-testid="reference-vertex-name"]',
      ),
    ].every((label) => {
      const b = label.getBBox();
      return (
        b.x >= frame.x &&
        b.y >= frame.y &&
        b.x + b.width <= frame.x + frame.width &&
        b.y + b.height <= frame.y + frame.height
      );
    });
  });
  expect(withinFrame).toBe(true);
  await original.screenshot({
    path: "out/similarity-preview/q17-vertex-spacing.png",
  });
  const shape = page.getByTestId("original-shape-0");
  await shape.focus();
  await shape.press("r");
  await shape.press("h");
  await inspect(original, '[data-testid="vertex-name"]');
  await page
    .getByRole("button", { name: "Show both boards", exact: true })
    .click();
  await inspect(
    page.getByTestId("manipulation-board"),
    '[data-testid="vertex-name"]',
  );
});
