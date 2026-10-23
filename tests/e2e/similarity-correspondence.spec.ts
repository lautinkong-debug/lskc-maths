import { expect, test, type Page } from "@playwright/test";
import { textbookSolutions } from "../../src/apps/similarity/textbook";

const conclusion = textbookSolutions["ex8c-19"].steps.findIndex(
  (s) => s.conclusion,
);
async function reveal(page: Page) {
  await page.goto("/apps/similarity#ex8c-19");
  const proof = page.getByTestId("diagram-reasons");
  const panel = page.getByTestId("similarity-correspondence");
  for (let i = 0; i < conclusion; i++)
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(panel).toHaveCount(0);
  await proof.getByRole("button", { name: "Next step", exact: true }).click();
  return { proof, panel };
}

test("similarity Q19 focuses one accurate pair without equal-side ticks and follows rigid copies", async ({
  page,
}) => {
  const { proof, panel } = await reveal(page);
  const board = page.getByTestId("original-board");
  await expect(panel).toContainText("A ↔ A · F ↔ B · E ↔ C");
  await expect(board.locator("[data-highlight-figure]")).toHaveCount(0);
  await expect(board.locator("[data-highlight-side]")).toHaveCount(2);
  await expect(board.locator('[data-highlight-side="AF"]')).toHaveCount(1);
  await expect(board.locator('[data-highlight-side="AB"]')).toHaveCount(1);
  await expect(board.locator("[data-condition]")).toHaveCount(0);
  await expect(panel).toContainText("their lengths may differ");
  await panel.getByRole("button", { name: "FE ↔ BC", exact: true }).click();
  await expect(board.locator('[data-highlight-side="FE"]')).toHaveCount(1);
  await expect(board.locator('[data-highlight-side="AF"]')).toHaveCount(0);
  await page.screenshot({ path: "out/similarity-clarity/side-pair.png" });
  await panel.getByRole("button", { name: "Angles", exact: true }).click();
  await panel.getByRole("button", { name: "∠AFE = ∠ABC", exact: true }).click();
  await expect(board.locator("[data-highlight-angle]")).toHaveCount(2);
  await expect(board.getByTestId("step-right-angle")).toHaveCount(2);
  await expect(board.locator("[data-highlight-side]")).toHaveCount(0);
  await page.screenshot({ path: "out/similarity-clarity/angle-pair.png" });
  const shape = board.getByTestId("original-shape-0");
  const before = await board
    .locator('[data-highlight-angle="AFE"] path')
    .first()
    .getAttribute("d");
  await shape.focus();
  await shape.press("ArrowRight");
  await shape.press("r");
  await shape.press("h");
  await expect(board.locator("[data-highlight-angle]")).toHaveCount(2);
  await expect(
    board.locator('[data-highlight-angle="AFE"] path').first(),
  ).not.toHaveAttribute("d", before!);
  await page
    .getByRole("button", { name: "Extracted triangles", exact: true })
    .click();
  const extracted = page.getByTestId("manipulation-board");
  await expect(extracted.locator("[data-highlight-angle]")).toHaveCount(2);
  await panel.getByRole("button", { name: "∠EAF = ∠CAB", exact: true }).click();
  await expect(
    extracted.getByTestId("shape-0").locator('[data-highlight-angle="EAF"]'),
  ).toHaveCount(1);
  await expect(
    extracted.getByTestId("shape-0").locator('[data-highlight-angle="CAB"]'),
  ).toHaveCount(0);
  await expect(
    extracted.getByTestId("shape-1").locator('[data-highlight-angle="CAB"]'),
  ).toHaveCount(1);
  await page.screenshot({ path: "out/similarity-clarity/extracted-pair.png" });
  await page
    .getByRole("button", { name: "Diagram controls", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Match first side length", exact: true })
    .click();
  await page.getByRole("button", { name: "Solution", exact: true }).click();
  const labels = extracted.locator("[data-correspondence-angle-label]");
  await expect(labels).toHaveCount(2);
  const [a, b] = await labels.evaluateAll((nodes) =>
    nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }),
  );
  expect(
    a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y,
  ).toBe(false);
  await page
    .getByRole("button", { name: "Fit triangles", exact: true })
    .filter({ visible: true })
    .click();
  for (const label of await labels.all())
    await expect(label).toBeInViewport({ ratio: 1 });
  await page.screenshot({
    path: "out/similarity-clarity/overlapping-pair.png",
  });
  await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(panel).toHaveCount(0);
  await page.getByRole("button", { name: "Question", exact: true }).click();
  const sourceDetails = page
    .getByTestId("classroom-question")
    .locator("..")
    .locator("details");
  await sourceDetails.locator("summary").click();
  const source = sourceDetails.locator("img");
  await expect(source).toBeVisible();
  expect(
    await source.evaluate(async (img: HTMLImageElement) => {
      await img.decode();
      return img.naturalWidth;
    }),
  ).toBeGreaterThan(3000);
});

test("deselecting a moved similar triangle restores its corresponding reference mark", async ({
  page,
}) => {
  const { panel } = await reveal(page);
  await panel.getByRole("button", { name: "Angles", exact: true }).click();
  const board = page.getByTestId("original-board");
  const moved = board.getByTestId("original-shape-0");
  await moved.focus();
  await moved.press("ArrowRight");
  await expect(moved.locator("[data-highlight-angle]")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Diagram controls", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Choose up to three shapes", exact: true })
    .getByRole("button", { name: "△AFE", exact: true })
    .click();
  await page.getByRole("button", { name: "Solution", exact: true }).click();
  await expect(board.locator("[data-highlight-angle]")).toHaveCount(2);
  await expect(moved.locator("[data-highlight-angle]")).toHaveCount(0);
  await expect(
    board.locator('[data-context="source"] [data-highlight-angle="EAF"]'),
  ).toHaveCount(1);
});

for (const [width, height] of [
  [1920, 1080],
  [390, 844],
  [844, 390],
]) {
  test(`similarity correspondence keeps the conclusion and pair visible at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const { proof, panel } = await reveal(page);
    if (width < 760 || height < 550) {
      const select = panel.getByRole("combobox", {
        name: "Choose a corresponding pair",
      });
      await expect(select).toBeInViewport({ ratio: 1 });
      await select.selectOption({ label: "∠EAF = ∠CAB" });
      await expect(select).toBeInViewport({ ratio: 1 });
    } else {
      await panel.getByRole("button", { name: "Angles", exact: true }).click();
    }
    await expect(proof.locator('tr[data-active="true"]')).toBeInViewport({
      ratio: 1,
    });
    await expect(
      proof.getByRole("button", { name: "Next step", exact: true }),
    ).toBeInViewport({ ratio: 1 });
    await expect(
      page.getByTestId("original-board").locator("[data-highlight-angle]"),
    ).toHaveCount(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `out/similarity-clarity/correspondence-${width}x${height}.png`,
    });
  });
}
