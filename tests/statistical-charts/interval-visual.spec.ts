import { test, expect } from "@playwright/test";
test("limits use a narrower span on the same scale as boundaries for each example", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "09 · Four words, one class", exact: true })
    .click();
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  for (const [i, lower, upper] of [
    [0, "36", "40"],
    [1, "11", "15"],
    [2, "7.1", "7.5"],
    [3, "1.23", "1.27"],
  ] as const) {
    await lab.getByLabel("Class example").selectOption(String(i));
    const bar = lab.getByTestId("boundary-bar"),
      strip = lab.getByTestId("limit-strip-1");
    const bx = Number(await bar.getAttribute("x")),
      bw = Number(await bar.getAttribute("width"));
    const sx = Number(await strip.getAttribute("x")),
      sw = Number(await strip.getAttribute("width"));
    expect(sw / bw).toBeCloseTo(0.8, 6);
    expect((sx - bx) / bw).toBeCloseTo(0.1, 6);
    expect((bx + bw - sx - sw) / bw).toBeCloseTo(0.1, 6);
    await expect(lab.getByTestId("diagram-lower-limit")).toHaveText(lower);
    await expect(lab.getByTestId("diagram-upper-limit")).toHaveText(upper);
    await expect(
      lab.getByRole("button", { name: /W Width is the Whole bar/ }),
    ).not.toContainText("Subtract the lower boundary");
  }
  await lab.getByLabel("Class example").selectOption("1");
  await lab.getByRole("button", { name: /B Boundaries are Between/ }).click();
  await page.waitForTimeout(450);
  await lab.screenshot({ path: "test-results/interval-visual-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await lab.screenshot({ path: "test-results/interval-visual-phone.png" });
  await lab
    .getByRole("button", { name: "Hide and recall", exact: true })
    .click();
  await expect(lab.getByTestId("diagram-lower-limit")).toHaveText("?");
  await expect(lab.getByTestId("vocabulary-diagram")).not.toContainText("10.5");
});
