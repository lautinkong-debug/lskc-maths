import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "09 · Four words, one class", exact: true })
    .click();
});
test("all four new sets accept their six independently checked values", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await expect(lab.getByLabel("Class example").locator("option")).toHaveCount(
    8,
  );
  await lab
    .getByRole("button", { name: "Calculate and check", exact: true })
    .click();
  for (const [i, values] of [
    [4, ["21", "30", "20.5", "30.5", "25.5", "10"]],
    [5, ["51", "70", "50.5", "70.5", "60.5", "20"]],
    [6, ["2.4", "2.9", "2.35", "2.95", "2.65", "0.6"]],
    [7, ["0.42", "0.49", "0.415", "0.495", "0.455", "0.08"]],
  ] as const) {
    await lab.getByLabel("Class example").selectOption(String(i));
    for (const [j, value] of values.entries())
      await lab.getByRole("textbox").nth(j).fill(value);
    await lab
      .getByRole("button", { name: "Check my values", exact: true })
      .click();
    await expect(lab.getByRole("status")).toContainText(
      "All six values are correct",
    );
  }
  await lab
    .getByRole("button", { name: "Try another interval", exact: true })
    .click();
  await expect(lab.getByLabel("Class example")).toHaveValue("0");
  await expect(lab.getByRole("textbox").first()).toHaveValue("");
});
test("wrong recall animates the concept, then retries without revealing the diagram answers", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await lab
    .getByRole("button", { name: "Hide and recall", exact: true })
    .click();
  for (const [right, wrong, term] of [
    ["Class boundaries", "Class limits", "1"],
    ["Class width", "Class mark", "3"],
    ["Class limits", "Class boundaries", "0"],
    ["Class mark", "Class width", "2"],
  ]) {
    await lab.getByRole("button", { name: wrong, exact: true }).click();
    const correction = lab.getByTestId("vocabulary-correction");
    await expect(correction).toHaveAttribute("data-term", term);
    await expect(
      lab.getByRole("button", { name: "Next prompt", exact: true }),
    ).toBeDisabled();
    await correction
      .getByRole("button", { name: "Replay the visual", exact: true })
      .click();
    await correction
      .getByRole("button", { name: "Let me try again", exact: true })
      .click();
    await expect(correction).toHaveCount(0);
    await expect(lab.getByTestId("vocabulary-diagram")).not.toContainText(
      "35.5",
    );
    await lab.getByRole("button", { name: right, exact: true }).click();
    await lab.getByRole("button", { name: "Next prompt", exact: true }).click();
  }
  await expect(lab.getByText(/All four recalled/)).toBeVisible();
});
test("calculation review preserves drafts, focuses the error and resets between sets", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await lab
    .getByRole("button", { name: "Calculate and check", exact: true })
    .click();
  for (const [i, value] of ["36", "40", "35.5", "40.5", "38", "4"].entries())
    await lab.getByRole("textbox").nth(i).fill(value);
  await lab
    .getByRole("button", { name: "Check my values", exact: true })
    .click();
  await expect(lab.getByTestId("vocabulary-correction")).toHaveAttribute(
    "data-term",
    "3",
  );
  await lab
    .getByRole("button", { name: "Let me try again", exact: true })
    .click();
  await expect(lab.getByLabel("Class width", { exact: true })).toBeFocused();
  await expect(lab.getByLabel("Class mark", { exact: true })).toHaveValue("38");
  await lab.getByLabel("Class width", { exact: true }).fill("5");
  await lab
    .getByRole("button", { name: "Check my values", exact: true })
    .click();
  await expect(lab.getByRole("status")).toContainText(
    "All six values are correct",
  );
  await lab.getByLabel("Class example").selectOption("4");
  await lab
    .getByRole("button", { name: "Check my values", exact: true })
    .click();
  await lab
    .getByRole("button", { name: "Show me: Class mark", exact: true })
    .click();
  await expect(
    lab.getByTestId("vocabulary-correction").locator(".mfrac"),
  ).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await lab
    .getByRole("button", { name: "Show me: Class width", exact: true })
    .click();
  await expect(lab.getByTestId("vocabulary-correction")).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/correction-phone.png" });
  await lab
    .getByRole("button", { name: "Try another interval", exact: true })
    .click();
  await expect(lab.getByTestId("vocabulary-correction")).toHaveCount(0);
});
test("the original graph stays fixed while each exact element is circled, and hidden answers suppress correction", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await lab
    .getByRole("button", { name: "Calculate and check", exact: true })
    .click();
  const diagram = lab.getByTestId("vocabulary-diagram");
  const original = await diagram.elementHandle();
  const bar = lab.getByTestId("boundary-bar");
  const documentPosition = () =>
    bar.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return {
        x: box.x + scrollX,
        y: box.y + scrollY,
        width: box.width,
        height: box.height,
      };
    });
  const position = await documentPosition();
  await lab
    .getByRole("button", { name: "Check my values", exact: true })
    .click();
  for (const [i, field] of [
    "Lower class limit",
    "Upper class limit",
    "Lower class boundary",
    "Upper class boundary",
    "Class mark",
    "Class width",
  ].entries()) {
    await lab
      .getByRole("button", { name: `Show me: ${field}`, exact: true })
      .click();
    await expect(lab.getByTestId(`focus-ring-${i}`)).toBeVisible();
    await expect(
      lab.getByTestId("diagram-emphasis").locator("ellipse, rect"),
    ).toHaveCount(1);
    expect(await original!.evaluate((el) => el.isConnected)).toBe(true);
    const current = await documentPosition();
    for (const axis of ["x", "y", "width", "height"] as const)
      expect(current[axis]).toBeCloseTo(position[axis], 2);
    await expect(lab.locator("svg")).toHaveCount(1);
  }
  const correction = lab.getByTestId("vocabulary-correction");
  const highlight = lab.getByTestId("diagram-emphasis");
  await page.waitForTimeout(1800);
  await correction
    .getByRole("button", { name: "Replay the visual", exact: true })
    .click();
  expect(
    Number(await highlight.evaluate((el) => getComputedStyle(el).opacity)),
  ).toBeLessThan(1);
  await page.waitForTimeout(1800);
  expect(
    Number(await highlight.evaluate((el) => getComputedStyle(el).opacity)),
  ).toBe(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await correction
    .getByRole("button", { name: "Replay the visual", exact: true })
    .click();
  expect(
    await highlight.evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page
    .locator("summary")
    .filter({ hasText: "Teacher & sharing tools" })
    .click();
  await page
    .getByRole("button", { name: "Hide model answers", exact: true })
    .click();
  await expect(correction).toHaveCount(0);
  await expect(highlight).toHaveCount(0);
  await expect(diagram).not.toContainText("35.5");
});
