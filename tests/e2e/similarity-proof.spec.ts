import { expect, test } from "@playwright/test";
import { edgeCrossesLabel } from "../../src/apps/similarity/vertexLabels";
import { textbookSolutions } from "../../src/apps/similarity/textbook";

test("source proof order and reasons remain exact when diagram options change", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  for (const id of ["ex8c-19", "qp8-8", "ex8b-18", "rev8-31"]) {
    await page.goto(`/apps/similarity#${id}`);
    const proof = page.getByTestId("diagram-reasons");
    const source = textbookSolutions[id];
    await expect(proof.locator("tbody tr")).toHaveCount(source.initialVisible);
    const show = proof.getByRole("button", {
      name: "Show all steps",
      exact: true,
    });
    if (await show.isEnabled()) await show.click();
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
    await proof.getByText("Diagram marks", { exact: true }).click();
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
  await proof.getByTestId(`solution-step-${index}`).click();
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
  ).toHaveCount(2);
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
    await expect(proof.locator("tbody tr")).toHaveCount(source.steps.length);
    expect(await proof.locator(".mfrac").count()).toBeGreaterThanOrEqual(8);
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
    for (const row of await proof.locator("tbody tr").all()) {
      const left = await row.locator("td").nth(0).boundingBox(),
        right = await row.locator("td").nth(1).boundingBox();
      expect(right!.x).toBeGreaterThanOrEqual(left!.x + left!.width - 1);
      expect(Math.abs(left!.y - right!.y)).toBeLessThan(1);
    }
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
  await proof.getByTestId(`solution-step-${second}`).click();
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
  await page
    .getByRole("button", { name: "Show all steps", exact: true })
    .click();
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
