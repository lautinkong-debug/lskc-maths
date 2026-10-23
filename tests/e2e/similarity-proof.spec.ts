import { expect, test } from "@playwright/test";
import { edgeCrossesLabel } from "../../src/apps/similarity/vertexLabels";
import { textbookSolutions } from "../../src/apps/similarity/textbook";
import type { Locator } from "@playwright/test";

// Retain the inline studio regression suite; classroom mode has its own suite.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("similarity-classroom", "off"),
  );
});

async function showAll(proof: Locator) {
  const details = proof.locator("details");
  if ((await details.getAttribute("open")) === null)
    await details.locator("summary").click();
  const show = proof.getByRole("button", {
    name: "Show all steps",
    exact: true,
  });
  if (await show.isEnabled()) await show.click();
}

async function advanceTo(proof: Locator, index: number) {
  while ((await proof.locator("tbody tr").count()) <= index)
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
}

test("Next reveals one line, replaces its highlights, and Reset hides the solution", async ({
  page,
}) => {
  await page.goto("/apps/similarity#qp8-8");
  const proof = page.getByTestId("diagram-reasons");
  const board = page.getByTestId("original-board");
  await expect(proof.locator("tbody tr")).toHaveCount(0);
  await expect(
    board.locator(
      "[data-highlight-side], [data-highlight-angle], [data-condition]",
    ),
  ).toHaveCount(0);
  await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(proof.locator("tbody tr")).toHaveCount(1);
  await expect(board.locator("[data-highlight-side]")).toHaveCount(2);
  await expect(board.locator('[data-highlight-side="RQ"]')).toHaveCount(1);
  await expect(board.locator('[data-highlight-side="AB"]')).toHaveCount(1);
  await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(proof.locator("tbody tr")).toHaveCount(2);
  await expect(board.locator("[data-highlight-side]")).toHaveCount(2);
  await expect(board.locator('[data-highlight-side="RQ"]')).toHaveCount(0);
  await expect(board.locator('[data-highlight-side="AB"]')).toHaveCount(0);
  await proof.getByTestId("solution-step-0").click();
  await expect(proof.locator("tbody tr")).toHaveCount(2);
  await expect(board.locator('[data-highlight-side="RQ"]')).toHaveCount(1);
  await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(proof.locator("tbody tr")).toHaveCount(3);
  await proof
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(proof.locator("tbody tr")).toHaveCount(2);
  await proof
    .getByRole("button", { name: "Reset solution", exact: true })
    .click();
  await expect(proof.locator("tbody tr")).toHaveCount(0);
  await expect(
    board.locator(
      "[data-highlight-side], [data-highlight-angle], [data-condition]",
    ),
  ).toHaveCount(0);
});

test("an angle answer focuses only its own angle after the angle-sum line", async ({
  page,
}) => {
  await page.goto("/apps/similarity#qp8-2");
  const proof = page.getByTestId("diagram-reasons");
  const steps = textbookSolutions["qp8-2"].steps;
  const answer = steps.findIndex(
    (s) => s.math?.[0] === String.raw`\angle ACB=25^\circ`,
  );
  await advanceTo(proof, answer - 1);
  const board = page.getByTestId("original-board");
  await expect(board.locator("[data-highlight-angle]")).toHaveCount(3);
  await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(board.locator("[data-highlight-angle]")).toHaveCount(1);
  await expect(board.locator('[data-highlight-angle="ACB"]')).toHaveCount(1);
  await expect(board.locator("[data-condition]")).toHaveCount(0);
});

test("source proof order and reasons remain exact when diagram options change", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  for (const id of ["ex8c-19", "qp8-8", "ex8b-18", "rev8-31"]) {
    await page.goto(`/apps/similarity#${id}`);
    const proof = page.getByTestId("diagram-reasons");
    const source = textbookSolutions[id];
    await expect(proof.locator("tbody tr")).toHaveCount(0);
    await showAll(proof);
    await expect(proof.locator("tbody tr")).toHaveCount(source.steps.length);
    for (let i = 0; i < source.steps.length; i++) {
      const row = proof.locator("tbody tr").nth(i);
      await expect(row.locator("td").nth(1)).toHaveText(
        source.steps[i].reason ?? "",
      );
      if (source.steps[i].math?.length)
        await expect(
          row.locator("td").first().locator('[role="math"]').last(),
        ).toHaveAttribute(
          "aria-label",
          `\\displaystyle ${source.steps[i].math![0]}`,
        );
    }
    const before = await proof.locator("tbody").innerText();
    await proof
      .getByRole("button", { name: "Side ratios", exact: true })
      .click();
    expect(await proof.locator("tbody").innerText()).toBe(before);
  }
});

test("a printed step highlights its angles on both boards and follows movement without changing the pose", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1100 });
  await page.goto("/apps/similarity#ex8c-19");
  await page
    .getByRole("button", { name: "Hide lesson menu", exact: true })
    .click();
  const proof = page.getByTestId("diagram-reasons");
  const source = textbookSolutions["ex8c-19"];
  const index = source.steps.findIndex((s) =>
    s.math?.[0].includes("\\angle AFE=\\angle ABC"),
  );
  expect(index).toBeGreaterThan(0);
  const shape = page.getByTestId("shape-0");
  const before = await shape.getAttribute("data-x");
  await advanceTo(proof, index);
  await expect(shape).toHaveAttribute("data-x", before!);
  for (const board of ["original-board", "manipulation-board"]) {
    await expect(
      page.getByTestId(board).locator("[data-highlight-angle]"),
    ).toHaveCount(2);
    await expect(
      page.getByTestId(board).getByTestId("step-right-angle"),
    ).toHaveCount(2);
    await expect(
      page.getByTestId(board).locator("[data-highlight-side]"),
    ).toHaveCount(0);
  }
  const arc = shape.locator('[data-highlight-angle="AFE"] path').first();
  const old = await arc.getAttribute("d");
  await shape.focus();
  await shape.press("ArrowRight");
  expect(await arc.getAttribute("d")).not.toBe(old);
  await page
    .getByRole("button", { name: "Enlarge original diagram", exact: true })
    .click();
  const graphBox = await page.getByTestId("original-board").boundingBox(),
    proofBox = await proof.boundingBox();
  expect(proofBox!.x).toBeGreaterThanOrEqual(graphBox!.x + graphBox!.width);
  await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(proof.getByTestId(`solution-step-${index + 1}`)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await proof
    .getByRole("button", { name: "Clear step highlight", exact: true })
    .click();
  await expect(
    page.getByTestId("original-board").locator("[data-highlight-angle]"),
  ).toHaveCount(0);
  await expect(
    page.getByTestId("original-board").getByTestId("right-angle-mark"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Hide proof", exact: true }).click();
  await expect(proof).toHaveCount(0);
  await page.getByRole("button", { name: "Show proof", exact: true }).click();
  await expect(proof).toBeVisible();
  await proof.getByTestId(`solution-step-${index}`).click();
  await page.getByTestId("original-board").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "out/similarity-preview/textbook-step-desktop.png",
  });
});

test("stacked fractions and reasons stay alongside each printed line on desktop and phone", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/apps/similarity#qp8-8");
    const proof = page.getByTestId("diagram-reasons");
    const source = textbookSolutions["qp8-8"];
    await showAll(proof);
    await expect(proof.locator("tbody tr")).toHaveCount(source.steps.length);
    expect(await proof.locator(".mfrac").count()).toBeGreaterThanOrEqual(8);
    for (const row of await proof.locator("tbody tr").all()) {
      const left = await row.locator("td").nth(0).boundingBox(),
        right = await row.locator("td").nth(1).boundingBox();
      expect(right!.x).toBeGreaterThanOrEqual(left!.x + left!.width - 1);
      expect(Math.abs(left!.y - right!.y)).toBeLessThan(1);
    }
    const ratioIndex = source.steps.findIndex((s) =>
      s.highlights.sides?.includes("RQ"),
    );
    const ratioStep = proof.getByTestId(`solution-step-${ratioIndex}`);
    if ((await ratioStep.getAttribute("aria-pressed")) !== "true")
      await ratioStep.click();
    await expect(
      page.getByTestId("original-board").locator('[data-highlight-side="RQ"]'),
    ).toHaveCount(1);
    await expect(
      page.getByTestId("original-board").locator('[data-highlight-side="AB"]'),
    ).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await proof.screenshot({
      path: `out/similarity-preview/literal-proof-${width}.png`,
    });
  }
});

test("later proofs reveal the relevant triangles and source errors stay separate", async ({
  page,
}) => {
  await page.goto("/apps/similarity#ex8c-17");
  const proof = page.getByTestId("diagram-reasons");
  const source = textbookSolutions["ex8c-17"];
  const second = source.steps.findIndex((s) => s.heading?.includes("CGF"));
  await advanceTo(proof, second);
  await expect(
    page
      .getByTestId("manipulation-board")
      .locator('[data-highlight-figure="CGF"]'),
  ).toHaveCount(1);
  await expect(
    page
      .getByTestId("manipulation-board")
      .locator('[data-highlight-figure="CED"]'),
  ).toHaveCount(1);
  await page.goto("/apps/similarity#rev8-25");
  await showAll(proof);
  await expect(proof).toContainText("Source note:");
  const typo = textbookSolutions["rev8-25"].steps.findIndex((s) =>
    s.math?.some((m) => m.includes("ACB+\\angle ACE")),
  );
  expect(typo).toBeGreaterThan(0);
  await expect(proof.getByTestId(`solution-step-${typo}`)).toContainText("ACE");
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

test("Q17 angle symbols stay separate from each other and vertex names", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/apps/similarity#ex8c-17");
  await page
    .getByRole("button", { name: "Show matching marks", exact: true })
    .click();
  const inspect = async (board: Locator) => {
    const boxes = await board.evaluate((svg) => {
      const bounds = (element: SVGGraphicsElement) => {
        const box = element.getBBox();
        return {
          text: element.textContent,
          x: box.x,
          y: box.y,
          w: box.width,
          h: box.height,
        };
      };
      return {
        angles: [
          ...svg.querySelectorAll<SVGTextElement>(
            '[data-testid="angle-label"]',
          ),
        ].map(bounds),
        vertices: [
          ...svg.querySelectorAll<SVGTextElement>(
            '[data-testid="reference-vertex-name"], [data-testid="vertex-name"]',
          ),
        ].map(bounds),
      };
    });
    expect(boxes.angles.length).toBeGreaterThan(2);
    const overlap = (a: (typeof boxes.angles)[number], b: typeof a) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    for (let i = 0; i < boxes.angles.length; i++) {
      const angle = boxes.angles[i];
      for (const other of [...boxes.angles.slice(i + 1), ...boxes.vertices])
        expect(
          overlap(angle, other),
          `${angle.text} overlaps ${other.text}`,
        ).toBe(false);
    }
  };
  const original = page.getByTestId("original-board");
  await inspect(original);
  await page
    .getByRole("button", { name: "Enlarge original diagram", exact: true })
    .click();
  await inspect(original);
  expect(
    await original.evaluate((svg) => {
      const frame = (svg as unknown as SVGSVGElement).viewBox.baseVal;
      return [
        ...svg.querySelectorAll<SVGTextElement>('[data-testid="angle-label"]'),
      ].every((text) => {
        const b = text.getBBox();
        return (
          b.x >= frame.x &&
          b.y >= frame.y &&
          b.x + b.width <= frame.x + frame.width &&
          b.y + b.height <= frame.y + frame.height
        );
      });
    }),
  ).toBe(true);
  await original.screenshot({
    path: "out/similarity-preview/q17-angle-spacing.png",
  });
  const shape = page.getByTestId("original-shape-0");
  await shape.focus();
  await shape.press("r");
  await shape.press("h");
  await inspect(original);
  await page
    .getByRole("button", { name: "Show both boards", exact: true })
    .click();
  const board = page.getByTestId("manipulation-board");
  await inspect(board);
  await board.screenshot({
    path: "out/similarity-preview/q17-angle-copies.png",
  });
});
