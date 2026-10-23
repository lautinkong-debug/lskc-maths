import { expect, test } from "@playwright/test";

test("Q35 shows one accurate correspondence pair and uses a high-resolution source", async ({
  page,
}) => {
  await page.goto("/apps/congruence#rev5-35");
  const proof = page.getByTestId("congruence-solution");
  const panel = page.getByTestId("conclusion-correspondence");
  const next = proof.getByRole("button", { name: "Next step", exact: true });
  for (let i = 0; i < 4; i++) await next.click();
  await expect(panel).toHaveCount(0);
  await next.click();
  await expect(panel).toContainText("B ↔ C · E ↔ E · F ↔ G");
  const board = page.getByTestId("congruence-source-board");
  const check = async (kind: string, names: string[]) => {
    expect(
      await board
        .locator(`[data-highlight-${kind}]`)
        .evaluateAll(
          (nodes, attr) => nodes.map((node) => node.getAttribute(attr)).sort(),
          `data-highlight-${kind}`,
        ),
    ).toEqual([...names].sort());
    await expect(board.locator("[data-highlight-figure]")).toHaveCount(0);
    expect(
      await board
        .locator(`[data-highlight-${kind}] [stroke]`)
        .evaluateAll(
          (nodes) =>
            new Set(
              nodes
                .filter((node) => node.tagName !== "text")
                .map((node) => node.getAttribute("stroke")),
            ).size,
        ),
    ).toBe(1);
  };
  await check("side", ["BE", "CE"]);
  await panel.getByRole("button", { name: "EF = EG", exact: true }).click();
  await check("side", ["EF", "EG"]);
  await panel.getByRole("button", { name: "Angles", exact: true }).click();
  await panel.getByRole("button", { name: "∠BEF = ∠CEG", exact: true }).click();
  await check("angle", ["BEF", "CEG"]);
  await expect(board.locator("[data-highlight-side]")).toHaveCount(0);
  const sourceWidth = await board.locator("image").evaluate(async (element) => {
    const image = new Image();
    image.src = element.getAttribute("href")!;
    await image.decode();
    return image.naturalWidth;
  });
  expect(sourceWidth).toBe(4072);
  await page.screenshot({
    path: "out/congruence-improvements/correspondence-original.png",
  });
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  await expect(
    page.getByTestId("congruence-copy-board").locator("[data-highlight-angle]"),
  ).toHaveCount(2);
  await page.screenshot({
    path: "out/congruence-improvements/correspondence-extracted.png",
  });
  await next.click();
  await expect(panel).toHaveCount(0);
});

for (const [width, height] of [
  [1920, 1080],
  [390, 844],
  [844, 390],
]) {
  test(`conclusion and corresponding parts stay readable at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/apps/congruence#rev5-35");
    const proof = page.getByTestId("congruence-solution");
    for (let i = 0; i < 5; i++)
      await proof
        .getByRole("button", { name: "Next step", exact: true })
        .click();
    const panel = page.getByTestId("conclusion-correspondence");
    if (width < 600 || height < 550) {
      await panel
        .getByRole("combobox", { name: "Choose a corresponding pair" })
        .selectOption({ label: "∠BEF = ∠CEG" });
      await expect(panel.getByRole("combobox")).toBeInViewport({ ratio: 1 });
    } else {
      await panel.getByRole("button", { name: "Angles", exact: true }).click();
      await panel
        .getByRole("button", { name: "∠BEF = ∠CEG", exact: true })
        .click();
    }
    await expect(proof.locator('tr[data-active="true"]')).toBeInViewport({
      ratio: 1,
    });
    const diagram = await page
      .getByTestId("congruence-source-board")
      .boundingBox();
    expect(diagram!.height).toBeGreaterThan(170);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `out/congruence-improvements/correspondence-${width}x${height}.png`,
    });
  });
}
