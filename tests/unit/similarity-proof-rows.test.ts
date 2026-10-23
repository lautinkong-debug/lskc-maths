import { expect, it } from "vitest";
import { textbookSolutions } from "../../src/apps/similarity/textbook";

it("keeps Q19's wrapped angle-sum calculations complete in a single reveal", () => {
  const steps = textbookSolutions["ex8c-19"].steps;
  const angleSum = steps.find((step) =>
    step.math?.[0].startsWith(String.raw`\because\quad \angle AEF=`),
  );
  expect(angleSum?.math).toEqual([
    String.raw`\because\quad \angle AEF=180^\circ-\angle AFE -\angle EAF`,
  ]);
  expect(angleSum?.reason).toBe("∠ sum of △");
  expect(
    steps.some((step) => step.math?.some((line) => line.includes("\\phantom"))),
  ).toBe(false);
  expect(
    steps.find((step) =>
      step.math?.[0].startsWith(String.raw`\therefore\quad AE=CD`),
    )?.math,
  ).toEqual([String.raw`\therefore\quad AE=CD =3\text{ cm}`]);
});
