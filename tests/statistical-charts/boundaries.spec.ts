import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "09 · Four words, one class", exact: true })
    .click();
});
test("labels limits directly, keeps definitions optional and shows both midpoint calculations", async ({
  page,
}) => {
  const lab = page.getByRole("region", {
    name: "Four words, one class",
    exact: true,
  });
  await expect(lab.getByTestId("diagram-lower-limit")).toHaveText("36");
  await expect(lab.getByTestId("diagram-upper-limit")).toHaveText("40");
  await expect(
    lab.getByText(
      "A class interval is one group of values in a frequency table.",
    ),
  ).toBeHidden();
  await lab
    .locator("summary")
    .filter({ hasText: "Definitions & rounding" })
    .click();
  await expect(
    lab.getByText(
      "A class interval is one group of values in a frequency table.",
    ),
  ).toBeVisible();
  const mark = lab.getByRole("button", { name: /M Mark is the Middle/ });
  for (const name of [
    "Class mark = (lower class limit + upper class limit) ÷ 2",
    "(36 + 40) ÷ 2 = 38",
    "Class mark = (lower class boundary + upper class boundary) ÷ 2",
    "(35.5 + 40.5) ÷ 2 = 38",
  ])
    await expect(mark.getByRole("math", { name, exact: true })).toBeVisible();
  await expect(mark.locator(".mfrac")).toHaveCount(4);
});
test("closes the gap and assigns exact boundaries once to the class on the right", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Why boundaries?", exact: true })
    .click();
  const lab = page.getByRole("region", {
    name: "Why do we need class boundaries?",
    exact: true,
  });
  await expect(lab.getByTestId("boundary-membership")).toHaveText(
    "Between the listed limits",
  );
  const bar = lab.getByTestId("boundary-range-1");
  const oldWidth = await bar.getAttribute("width");
  await lab
    .getByRole("button", { name: "Next boundary step", exact: true })
    .click();
  await expect(lab.getByTestId("boundary-membership")).toHaveText(
    "35.4 → Belongs to class 31–35",
  );
  await expect(bar).not.toHaveAttribute("width", oldWidth!);
  await expect(
    lab.getByTestId("boundary-narration").getByRole("math", {
      name: "(35 + 36) ÷ 2 = 35.5",
      exact: true,
    }),
  ).toBeVisible();
  for (const [value, group, index] of [
    ["35.5", "36–40", 1],
    ["35.6", "36–40", 1],
    ["40.4", "36–40", 1],
    ["40.5", "41–45", 2],
  ] as const) {
    await lab
      .getByRole("button", { name: "Next boundary step", exact: true })
      .click();
    await expect(lab.getByTestId("boundary-membership")).toHaveText(
      `${value} → Belongs to class ${group}`,
    );
    await expect(lab.getByTestId(`boundary-class-${index}`)).toHaveAttribute(
      "data-active",
      "true",
    );
  }
  await expect(lab.getByTestId("boundary-class-1")).toContainText(
    "35.5 ≤ x < 40.5",
  );
  await page.waitForTimeout(900);
  await lab.screenshot({ path: "test-results/boundaries-desktop.png" });
  await page.getByLabel("Class example").selectOption("2");
  await expect(lab.getByTestId("boundary-membership")).toHaveText(
    "Between the listed limits",
  );
  await lab
    .getByRole("button", { name: "Next boundary step", exact: true })
    .click();
  await lab
    .getByRole("button", { name: "Next boundary step", exact: true })
    .click();
  await expect(lab.getByTestId("boundary-membership")).toHaveText(
    "7.05 → Belongs to class 7.1–7.5",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.waitForTimeout(900);
  await lab.screenshot({ path: "test-results/boundaries-phone.png" });
});
test("autoplay pauses, manual movement updates membership, and hidden answers suppress the lesson", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Why boundaries?", exact: true })
    .click();
  const lab = page.getByRole("region", {
    name: "Why do we need class boundaries?",
    exact: true,
  });
  await lab
    .getByRole("button", { name: "Play boundary animation", exact: true })
    .click();
  await expect(lab.getByTestId("boundary-narration")).toContainText(
    "Meet halfway",
    { timeout: 5000 },
  );
  await lab
    .getByRole("button", { name: "Pause boundary animation", exact: true })
    .click();
  await page.waitForTimeout(2700);
  await expect(lab.getByTestId("boundary-narration")).toContainText(
    "Meet halfway",
  );
  const slider = lab.getByRole("slider");
  await slider.fill("35.5");
  await expect(lab.getByTestId("boundary-membership")).toHaveText(
    "35.5 → Belongs to class 36–40",
  );
  await slider.fill("40.5");
  await expect(lab.getByTestId("boundary-membership")).toHaveText(
    "40.5 → Belongs to class 41–45",
  );
  await page
    .locator("summary")
    .filter({ hasText: "Teacher & sharing tools" })
    .click();
  await page
    .getByRole("button", { name: "Hide model answers", exact: true })
    .click();
  await expect(lab.getByTestId("boundary-animation")).toHaveCount(0);
});

test("the measurement visibly travels and respects reduced motion", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Why boundaries?", exact: true })
    .click();
  const lab = page.getByRole("region", {
    name: "Why do we need class boundaries?",
    exact: true,
  });
  const next = lab.getByRole("button", {
    name: "Next boundary step",
    exact: true,
  });
  for (let i = 0; i < 3; i++) await next.click();
  const pointer = lab.getByTestId("boundary-pointer");
  await page.waitForTimeout(900);
  const start = (await pointer.boundingBox())!.x;
  await next.click();
  await page.waitForTimeout(180);
  const during = (await pointer.boundingBox())!.x;
  await page.waitForTimeout(850);
  const end = (await pointer.boundingBox())!.x;
  expect(during).toBeGreaterThan(start + 2);
  expect(during).toBeLessThan(end - 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await lab
    .getByRole("button", { name: "Previous boundary step", exact: true })
    .click();
  expect(
    await pointer.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await expect(lab.getByTestId("boundary-membership")).toHaveText(
    "35.6 → Belongs to class 36–40",
  );
});
