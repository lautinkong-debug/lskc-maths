import { expect, test } from "@playwright/test";
import { textbookSolutions } from "../../src/apps/similarity/textbook";
import { questions } from "../../src/apps/similarity/data";
import { modelPoints } from "../../src/apps/similarity/geometry";
import { edgeCrossesLabel } from "../../src/apps/similarity/vertexLabels";

test("Q33 has a 2:1 desk, separate condition bullets and small names next to their own vertices", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/apps/similarity#rev8-33");
  const board = page.getByTestId("original-board");
  const proof = page.getByTestId("diagram-reasons");
  const graph = (await board.boundingBox())!;
  expect(Math.abs(graph.width / (1920 - graph.width) - 2)).toBeLessThan(0.01);
  const givens = page.getByTestId("given-conditions").filter({ visible: true });
  await expect(givens.locator("li")).toHaveCount(8);
  expect(
    await givens
      .locator("ul")
      .evaluate((el) => getComputedStyle(el).listStyleType),
  ).toBe("disc");
  await expect(givens.locator("li").nth(1)).toHaveText("DE meets AB at F.");
  await expect(givens.locator("li").nth(2)).toHaveText("DE meets AC at G.");
  const points = modelPoints(questions.find((q) => q.id === "rev8-33")!);
  const inspect = async () => {
    const data = await board.evaluate((svg) => ({
      labels: [
        ...svg.querySelectorAll<SVGTextElement>(
          '[data-testid="reference-vertex-name"]',
        ),
      ].map((el) => {
        const b = el.getBBox();
        return {
          name: el.textContent,
          x: b.x,
          y: b.y,
          width: b.width,
          height: b.height,
          screenHeight: el.getBoundingClientRect().height,
        };
      }),
      polygons: [...svg.querySelectorAll<SVGPolygonElement>("polygon")].map(
        (p) => [...p.points].map((p) => ({ x: p.x, y: p.y, label: "" })),
      ),
      rings: [...svg.querySelectorAll<SVGCircleElement>("circle[stroke]")].map(
        (el) => ({
          x: el.cx.baseVal.value,
          y: el.cy.baseVal.value,
          radius: el.r.baseVal.value,
        }),
      ),
    }));
    expect(data.labels).toHaveLength(points.length);
    for (const label of data.labels) {
      const centre = {
        x: label.x + label.width / 2,
        y: label.y + label.height / 2,
      };
      const nearest = [...points].sort(
        (a, b) =>
          Math.hypot(a.x - centre.x, a.y - centre.y) -
          Math.hypot(b.x - centre.x, b.y - centre.y),
      )[0];
      expect(
        nearest.label,
        `${label.name} must be nearest its own vertex`,
      ).toBe(label.name);
      expect(
        Math.hypot(nearest.x - centre.x, nearest.y - centre.y),
        label.name!,
      ).toBeLessThan(label.height * 2.4);
      expect(label.screenHeight).toBeLessThan(40);
      for (const ring of data.rings) {
        const dx = Math.max(
          label.x - ring.x,
          0,
          ring.x - label.x - label.width,
        );
        const dy = Math.max(
          label.y - ring.y,
          0,
          ring.y - label.y - label.height,
        );
        expect(
          Math.hypot(dx, dy),
          `${label.name} overlaps a vertex ring`,
        ).toBeGreaterThan(ring.radius);
      }
      for (const ps of data.polygons)
        for (let i = 0; i < ps.length; i++)
          expect(
            edgeCrossesLabel(ps[i], ps[(i + 1) % ps.length], label),
            `${label.name} crosses a graph edge`,
          ).toBe(false);
    }
  };
  await inspect();
  for (let i = 0; i < 17; i++)
    await proof.getByRole("button", { name: "Next step", exact: true }).click();
  await proof
    .getByRole("button", { name: "Show earlier steps", exact: true })
    .click();
  await expect(proof.getByTestId("solution-step-0")).toBeHidden();
  await inspect();
  await page.screenshot({ path: "out/similarity-parts/q33-readable.png" });
});

test("the next triangle proof hides the completed proof while history stays open", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/apps/similarity#ex8c-17");
  const proof = page.getByTestId("diagram-reasons");
  const next = proof.getByRole("button", { name: "Next step", exact: true });
  const previous = proof.getByRole("button", {
    name: "Previous step",
    exact: true,
  });
  for (let i = 0; i < 5; i++) await next.click();
  await proof
    .getByRole("button", { name: "Show earlier steps", exact: true })
    .click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(5);
  await next.click();
  await next.click();
  await expect(proof.getByTestId("solution-step-0")).toBeHidden();
  await expect(proof.getByTestId("solution-step-4")).toBeHidden();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(2);
  await expect(proof.getByTestId("solution-step-5")).toBeVisible();
  await expect(
    proof.getByRole("button", { name: "Hide earlier steps", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await proof.getByTestId("solution-step-5").click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(2);
  await expect(proof.getByTestId("solution-step-0")).toBeHidden();
  await previous.click();
  await previous.click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(5);
  await expect(proof.getByTestId("solution-step-0")).toBeVisible();
  await expect(proof.getByTestId("solution-step-5")).toHaveCount(0);
});

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
]) {
  test(`part b shows only its own revealed working at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/apps/similarity#ex8c-19");
    const source = textbookSolutions["ex8c-19"];
    const partB = source.steps.findIndex((s) => s.heading?.startsWith("(b)"));
    const proof = page.getByTestId("diagram-reasons");
    const next = proof.getByRole("button", { name: "Next step", exact: true });
    for (let i = 0; i < partB; i++) await next.click();
    await proof
      .getByRole("button", { name: "Show earlier steps", exact: true })
      .click();
    await next.click();
    await expect(proof.locator("tbody tr:visible")).toHaveCount(1);
    await expect(proof.getByTestId("solution-step-0")).toBeHidden();
    await next.click();
    await next.click();
    await expect(proof.locator("tbody tr:visible")).toHaveCount(3);
    const current = proof.getByTestId(`solution-step-${partB + 2}`);
    await expect(current).toBeVisible();
    const row = current.locator("xpath=ancestor::tr");
    await expect(row.getByTestId("proof-reason")).toHaveText(
      source.steps[partB + 2].reason ?? "",
    );
    const box = await row.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
    await proof
      .getByRole("button", { name: "Hide earlier steps", exact: true })
      .click();
    await expect(proof.locator("tbody tr:visible")).toHaveCount(1);
    await proof
      .getByRole("button", { name: "Show earlier steps", exact: true })
      .click();
    await expect(proof.locator("tbody tr:visible")).toHaveCount(3);
    await page.screenshot({
      path: `out/similarity-parts/part-b-${viewport.width}.png`,
    });
    await proof
      .getByRole("button", { name: "Reset solution", exact: true })
      .click();
    await next.click();
    await expect(proof.getByTestId("solution-step-0")).toBeVisible();
    await expect(proof.getByTestId(`solution-step-${partB}`)).toHaveCount(0);
  });
}
