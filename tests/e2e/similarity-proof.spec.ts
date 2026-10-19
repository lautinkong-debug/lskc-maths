import { expect, test } from "@playwright/test";

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
      await expect(proof.getByTestId("similarity-conclusion")).toContainText(
        "△AFE ∼ △ABC (AAA)",
      );
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
