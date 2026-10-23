import { expect, test } from "@playwright/test";
import { questions } from "../../src/apps/similarity/data";
import { questionGivens } from "../../src/apps/similarity/givens";

for (const viewport of [
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
]) {
  test(`given conditions stay in the top left at ${viewport.width}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/apps/similarity#ex8c-19");
    const panel = page
      .getByTestId("given-conditions")
      .filter({ visible: true });
    await expect(panel).toBeVisible();
    const toggle = panel.getByRole("button", { name: "Given conditions" });
    if ((await toggle.getAttribute("aria-expanded")) === "false")
      await toggle.click();
    await expect(panel.locator("li")).toHaveCount(5);
    await expect(panel).toContainText("is a rectangle.");
    const pos = await panel.boundingBox();
    const board = await page.getByTestId("original-board").boundingBox();
    expect(board!.height).toBeGreaterThan(viewport.height < 500 ? 180 : 300);
    expect(pos!.x - board!.x).toBeLessThan(15);
    expect(pos!.y - board!.y).toBeLessThan(15);
    const stage = page
      .getByTestId("original-board")
      .locator("..")
      .locator("..");
    await stage
      .getByRole("button", { name: /Zoom in.*Original diagram/ })
      .click();
    expect(await panel.boundingBox()).toEqual(pos);
    await toggle.click();
    await expect(panel.locator("ul")).toBeHidden();
    await toggle.click();
    await page
      .getByRole("button", { name: "Extracted triangles", exact: true })
      .click();
    await expect(panel.locator("li")).toHaveCount(5);
    expect(
      (await page.getByTestId("manipulation-board").boundingBox())!.height,
    ).toBeGreaterThan(180);
    await page.screenshot({
      path: `out/similarity-givens/conditions-${viewport.width}.png`,
    });
  });
}

test("earlier steps remain open through selecting lines, Next and Previous", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/apps/similarity#ex8c-19");
  const proof = page.getByTestId("diagram-reasons");
  const next = proof.getByRole("button", { name: "Next step", exact: true });
  for (let i = 0; i < 12; i++) await next.click();
  await proof
    .getByRole("button", { name: "Show earlier steps", exact: true })
    .click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(12);
  await proof.getByTestId("solution-step-3").click();
  await expect(
    proof.getByRole("button", { name: "Hide earlier steps", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(proof.locator("tbody tr:visible")).toHaveCount(12);
  await expect(proof.locator('tr[data-active="true"]')).toHaveAttribute(
    "data-step-index",
    "3",
  );
  await proof.getByTestId("solution-step-3").click();
  await expect(proof.locator('tr[data-active="true"]')).toHaveAttribute(
    "data-step-index",
    "3",
  );
  await next.click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(13);
  const body = proof.locator("table").locator("..");
  const row = await proof.locator('tr[data-active="true"]').boundingBox();
  const box = await body.boundingBox();
  expect(row!.y + row!.height).toBeLessThanOrEqual(box!.y + box!.height + 1);
  await proof
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(12);
  await proof
    .getByRole("button", { name: "Hide earlier steps", exact: true })
    .click();
  await expect(proof.locator("tbody tr:visible")).toHaveCount(1);
  await page.screenshot({ path: "out/similarity-givens/history.png" });
});

test("all 72 questions have their own givens without the proof conclusion", async ({
  page,
}) => {
  expect(Object.keys(questionGivens).sort()).toEqual(
    questions.map((q) => q.id).sort(),
  );
  await page.goto("/apps/similarity#ex8c-19");
  const selector = page.getByRole("combobox", {
    name: "Choose a question",
    exact: true,
  });
  for (const q of questions) {
    await selector.selectOption(q.id);
    const panel = page
      .getByTestId("given-conditions")
      .filter({ visible: true });
    await expect(panel.locator("li")).toHaveCount(questionGivens[q.id].length);
  }
});
