import { expect, test } from "@playwright/test";

const groups = [
  ["Perpendiculars and chord mid-points", [1, 2, 3]],
  ["Equal chords and distances", [4, 5]],
  ["Centre and circumference angles", [6]],
  ["Angles in the same segment", [7]],
  ["Angle in a semicircle", [8, 9]],
  ["Angles, arcs and chords", [10, 11, 12, 13, 14, 15]],
  ["Arc and angle ratios", [16, 17]],
] as const;

for (const layout of ["desktop", "phone"] as const) {
  test.describe(layout, () => {
    const phone = layout === "phone";
    test.use({
      viewport: { width: phone ? 390 : 1366, height: 844 },
      isMobile: phone,
      hasTouch: phone,
    });
    test("each diagram reveals and hides the corresponding deduction", async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await page.goto("/apps/circle-properties");
      await expect(page.getByTestId("paper-circle")).toBeVisible();
      const gallery = page.getByRole("region", {
        name: "See how each reason works",
      });
      for (const [topic, numbers] of groups) {
        const menu = page.locator('[aria-controls="circle-property-menu"]');
        if (await menu.isVisible()) {
          await menu.click();
          await page
            .locator("#circle-property-menu")
            .getByRole("button", { name: topic, exact: true })
            .click();
        } else {
          await page.getByRole("button", { name: topic, exact: true }).click();
        }
        await page.getByRole("button", { name: "Tasks", exact: true }).click();
        if (!(await gallery.isVisible()))
          await page
            .getByRole("button", { name: /Reveal the reasons/ })
            .click();
        for (const n of numbers) {
          await gallery
            .getByRole("button", { name: new RegExp(`^Reason 16\\.${n}:`) })
            .click();
          const diagram = gallery.getByTestId(`reason-flow-r${n}`);
          const panel = gallery.locator(`[data-evidence-for="r${n}"]`);
          await expect(diagram).toHaveCount(1);
          await expect(diagram).toBeVisible();
          expect(
            await diagram.locator('[data-stage="given"]').count(),
          ).toBeGreaterThan(0);
          await expect(diagram.locator('[data-stage="result"]')).toHaveCount(0);
          await expect(
            panel.locator('[data-proof-stage="given"]'),
          ).toBeVisible();
          await expect(
            panel.locator('[data-proof-stage="reason"]'),
          ).toHaveCount(0);
          await expect(
            panel.locator('[data-proof-stage="conclusion"]'),
          ).toHaveCount(0);

          if (n === 2 || n === 3) {
            await expect(diagram.locator('[data-mark="point-O"]')).toHaveCount(
              n === 2 ? 1 : 0,
            );
            await expect(
              diagram.locator('[data-mark="right-angle-N"]'),
            ).toHaveCount(n === 2 ? 0 : 1);
          }
          await panel
            .getByRole("button", { name: "Reveal the conclusion" })
            .click();
          await expect(diagram).toHaveAttribute("data-revealed", "true");
          expect(
            await diagram.locator('[data-stage="result"]').count(),
          ).toBeGreaterThan(0);
          await expect(
            panel.getByRole("heading", { name: `Reason 16.${n}`, exact: true }),
          ).toBeVisible();
          await expect(
            panel.locator('[data-proof-stage="conclusion"]'),
          ).toBeVisible();
          const picture = (await diagram.boundingBox())!;
          const rhs = (await panel.boundingBox())!;
          if (phone)
            expect(rhs.y).toBeGreaterThan(picture.y + picture.height - 1);
          else expect(rhs.x).toBeGreaterThan(picture.x + picture.width - 1);
          expect(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
          ).toBe(true);

          if (n === 2) {
            await panel
              .getByRole("button", { name: "Compare with 16.3" })
              .click();
            await expect(gallery.getByTestId("reason-flow-r3")).toHaveAttribute(
              "data-revealed",
              "false",
            );
          } else {
            await panel
              .getByRole("button", { name: "Replay from the givens" })
              .click();
            await expect(diagram.locator('[data-stage="result"]')).toHaveCount(
              0,
            );
          }
        }
      }
    });
  });
}
