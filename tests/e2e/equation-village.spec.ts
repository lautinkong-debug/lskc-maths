import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

const route = "/apps/equation-village";
const storageKey = "lskc-equation-village-v1";
const evidence = "out/equation-village-verification";

test.use({ reducedMotion: "reduce" });
test.beforeAll(() => mkdirSync(evidence, { recursive: true }));

async function start(page: Page) {
  await page.goto(route);
  await expect(page.getByTestId("equation-village")).toBeVisible();
  await page
    .getByRole("button", { name: "Start bridge repair", exact: true })
    .click();
  await equation(page, "2x+3=11");
}

async function equation(page: Page, expected: string) {
  await expect
    .poll(async () =>
      (
        await page.getByTestId("village-equation").getAttribute("data-equation")
      )?.replace(/\s/g, ""),
    )
    .toBe(expected);
}

async function operation(
  page: Page,
  kind: "Add" | "Subtract" | "Multiply" | "Divide",
  amount: string,
) {
  await page.getByRole("button", { name: kind, exact: true }).click();
  await page.getByLabel("Amount", { exact: true }).fill(amount);
  await page
    .getByRole("button", { name: "Apply operation", exact: true })
    .click();
}

async function solve(page: Page) {
  await operation(page, "Subtract", "3");
  await equation(page, "2x=8");
  await operation(page, "Divide", "2");
  await equation(page, "x=4");
}

async function restore(page: Page) {
  await page.getByLabel("Value of x", { exact: true }).fill("4");
  await page
    .getByRole("button", { name: "Check and restore", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Try a fresh equation", exact: true }),
  ).toBeVisible();
}

async function answerTransfer(page: Page, answer: string) {
  await page.getByLabel("Your value of x", { exact: true }).fill(answer);
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}

test("a full independent bridge repair and fresh equation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await start(page);
  await expect(page.getByTestId("village-scene")).toBeVisible();
  await page.screenshot({
    path: `${evidence}/bridge-start.png`,
    fullPage: true,
  });
  await operation(page, "Multiply", "1000");
  await expect(page.getByTestId("village-feedback")).toContainText(
    "display limit",
  );
  await equation(page, "2x+3=11");
  await solve(page);
  await restore(page);
  await page.screenshot({
    path: `${evidence}/bridge-restored.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Try a fresh equation", exact: true })
    .click();
  await expect(page.getByTestId("village-transfer")).toHaveAttribute(
    "data-equation",
    "3x + 2 = 17",
  );
  await answerTransfer(page, "5");
  await expect(
    page.getByRole("heading", { name: "Harbour restored", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("village-result")).toContainText(
    "Bridge solved without hints or corrections",
  );
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("one-sided, zero and malformed operations cannot change the equation", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("combobox", { name: "Apply to", exact: true })
    .selectOption({ label: "Left side only" });
  await operation(page, "Subtract", "3");
  await expect(page.getByTestId("village-feedback")).toContainText(
    /both sides/i,
  );
  await equation(page, "2x+3=11");
  await page
    .getByRole("combobox", { name: "Apply to", exact: true })
    .selectOption({ label: "Right side only" });
  await operation(page, "Add", "2");
  await expect(page.getByTestId("village-feedback")).toContainText("+ 2");
  await page.getByRole("button", { name: "Divide", exact: true }).click();
  await page.getByLabel("Amount", { exact: true }).fill("7");
  await expect(page.getByTestId("village-feedback")).toContainText("+ 2");
  await expect(page.getByTestId("village-feedback")).not.toContainText("÷ 7");
  await equation(page, "2x+3=11");
  await page
    .getByRole("combobox", { name: "Apply to", exact: true })
    .selectOption({ label: "Both sides" });
  const originalRows = await page
    .getByTestId("village-ledger")
    .locator("li")
    .count();
  await operation(page, "Add", "0");
  await equation(page, "2x+3=11");
  await expect(page.getByTestId("village-ledger").locator("li")).toHaveCount(
    originalRows,
  );
  await operation(page, "Divide", "0");
  await expect(page.getByTestId("village-feedback")).toContainText(/zero|0/i);
  await equation(page, "2x+3=11");
  await operation(page, "Multiply", "0");
  await equation(page, "2x+3=11");
  await operation(page, "Add", "2/0");
  await equation(page, "2x+3=11");
  await solve(page);
  await restore(page);
});

test("a divide-first fractional method is accepted", async ({ page }) => {
  await start(page);
  await operation(page, "Divide", "4");
  await equation(page, "\\frac{1}{2}x+\\frac{3}{4}=\\frac{11}{4}");
  await operation(page, "Subtract", "0.75");
  await equation(page, "\\frac{1}{2}x=2");
  await page.getByRole("button", { name: "Show a hint", exact: true }).click();
  await expect(
    page.getByText("The coefficient of x is 1/2.", { exact: false }),
  ).toBeVisible();
  await operation(page, "Divide", "1/2");
  await equation(page, "x=4");
  await restore(page);
});

test("hints, incorrect substitution and transfer recovery keep honest progress", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "Show a hint", exact: true }).click();
  await solve(page);
  await page.getByLabel("Value of x", { exact: true }).fill("3");
  await page
    .getByRole("button", { name: "Check and restore", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Try a fresh equation", exact: true }),
  ).not.toBeVisible();
  await restore(page);
  await page
    .getByRole("button", { name: "Try a fresh equation", exact: true })
    .click();
  await answerTransfer(page, "6");
  await expect(
    page.getByRole("heading", { name: "Harbour restored", exact: true }),
  ).not.toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Check the working", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Your value of x", { exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Try a similar question", exact: true })
    .click();
  await expect(page.getByTestId("village-transfer")).toHaveAttribute(
    "data-equation",
    "2x + 5 = 17",
  );
  await page.reload();
  await expect(
    page.getByText("Check the working", { exact: true }),
  ).not.toBeVisible();
  await answerTransfer(page, "5");
  await page.reload();
  await expect(
    page.getByText("Check the working", { exact: true }),
  ).toBeVisible();
  await answerTransfer(page, "6");
  await expect(page.getByTestId("village-result")).toContainText(
    /help|support/i,
  );
});

test("undo and replay preserve the working", async ({ page }) => {
  await start(page);
  await page.getByRole("button", { name: "Subtract", exact: true }).click();
  await page.getByLabel("Amount", { exact: true }).fill("3");
  await page
    .getByRole("button", { name: "Apply operation", exact: true })
    .dblclick();
  await equation(page, "2x=8");
  const rows = await page.getByTestId("village-ledger").locator("li").count();
  await page
    .getByRole("button", { name: "Replay last move", exact: true })
    .click();
  await equation(page, "2x=8");
  await expect(page.getByTestId("village-ledger").locator("li")).toHaveCount(
    rows,
  );
  await page
    .getByRole("button", { name: "Undo last step", exact: true })
    .click();
  await equation(page, "2x+3=11");
  await solve(page);
  await restore(page);
});

test("refresh resumes valid working and the transfer task", async ({
  page,
}) => {
  await start(page);
  await operation(page, "Subtract", "3");
  await equation(page, "2x=8");
  await page.reload();
  await equation(page, "2x=8");
  await expect(
    page.getByRole("button", { name: "Start bridge repair", exact: true }),
  ).not.toBeVisible();
  await operation(page, "Divide", "2");
  await restore(page);
  await page
    .getByRole("button", { name: "Try a fresh equation", exact: true })
    .click();
  await page.reload();
  await expect(page.getByTestId("village-transfer")).toHaveAttribute(
    "data-equation",
    "3x + 2 = 17",
  );
  await answerTransfer(page, "5");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Harbour restored", exact: true }),
  ).toBeVisible();
});

test("corrupt local progress starts a fresh repair with an explanation", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "corrupt"),
    storageKey,
  );
  await page.goto(route);
  await expect(
    page.getByText(
      "The saved repair could not be read. A fresh bridge is ready.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start bridge repair", exact: true })
    .click();
  await equation(page, "2x+3=11");
  await solve(page);
  await restore(page);
});

test("blocked storage still permits a complete repair", async ({ page }) => {
  await page.addInitScript((key) => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (name) {
      if (name === key)
        throw new DOMException("Storage blocked", "SecurityError");
      return get.call(this, name);
    };
    Storage.prototype.setItem = function (name, value) {
      if (name === key)
        throw new DOMException("Storage blocked", "SecurityError");
      return set.call(this, name, value);
    };
  }, storageKey);
  await start(page);
  await expect(
    page.getByText(
      "Progress cannot be saved on this device. You can still play.",
      { exact: true },
    ),
  ).toBeVisible();
  await solve(page);
  await restore(page);
});

test("independent student contexts keep separate progress", async ({
  page,
  browser,
  baseURL,
}) => {
  await start(page);
  await operation(page, "Subtract", "3");
  const otherContext = await browser.newContext({
    baseURL,
    reducedMotion: "reduce",
  });
  try {
    const other = await otherContext.newPage();
    await start(other);
    await equation(other, "2x+3=11");
    await equation(page, "2x=8");
    await operation(other, "Divide", "2");
    await equation(other, "x+\\frac{3}{2}=\\frac{11}{2}");
    await equation(page, "2x=8");
  } finally {
    await otherContext.close();
  }
});

test("keyboard operation and phone layouts remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(route);
  const startButton = page.getByRole("button", {
    name: "Start bridge repair",
    exact: true,
  });
  await startButton.focus();
  await page.keyboard.press("Enter");
  const subtract = page.getByRole("button", { name: "Subtract", exact: true });
  await subtract.focus();
  await page.keyboard.press("Enter");
  await page.getByLabel("Amount", { exact: true }).focus();
  await page.keyboard.type("3");
  await page
    .getByRole("button", { name: "Apply operation", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await equation(page, "2x=8");
  await noOverflow(page);
  await page.screenshot({ path: `${evidence}/phone-360.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await operation(page, "Divide", "2");
  await restore(page);
  const allThreeRowsWithinLedger = async () => {
    const ledger = page.getByTestId("village-ledger");
    await expect(ledger.locator("li")).toHaveCount(3);
    const rows = await ledger.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return [...element.querySelectorAll("li")].map((row) => {
        const bounds = row.getBoundingClientRect();
        return {
          top: bounds.top - box.top,
          bottom: box.bottom - bounds.bottom,
        };
      });
    });
    for (const row of rows) {
      expect(row.top).toBeGreaterThanOrEqual(-1);
      expect(row.bottom).toBeGreaterThanOrEqual(-1);
    }
  };
  await allThreeRowsWithinLedger();
  await noOverflow(page);
  await page.screenshot({ path: `${evidence}/phone-390.png`, fullPage: true });
  await page.setViewportSize({ width: 360, height: 780 });
  await allThreeRowsWithinLedger();
  await noOverflow(page);
  await page.screenshot({
    path: `${evidence}/phone-360-restored.png`,
    fullPage: true,
  });
});

test("projection and the simple-view controls retain the mathematics", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await start(page);
  await page
    .getByRole("button", { name: "Projection mode", exact: true })
    .click();
  await page.getByText("Scene options", { exact: true }).click();
  await page.getByLabel("Simple view", { exact: true }).check();
  await equation(page, "2x+3=11");
  await solve(page);
  await restore(page);
  const currentWithinLedger = async () => {
    const bounds = await page
      .getByTestId("village-ledger")
      .evaluate((ledger) => {
        const box = ledger.getBoundingClientRect();
        const current = ledger
          .querySelector('[aria-current="step"]')!
          .getBoundingClientRect();
        return {
          top: current.top - box.top,
          bottom: box.bottom - current.bottom,
        };
      });
    expect(bounds.top).toBeGreaterThanOrEqual(-1);
    expect(bounds.bottom).toBeGreaterThanOrEqual(-1);
  };
  await currentWithinLedger();
  await noOverflow(page);
  await page.screenshot({
    path: `${evidence}/projection-simple-view.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Start this repair again", exact: true })
    .click();
  await page.getByRole("button", { name: "Start fresh", exact: true }).click();
  for (let i = 0; i < 7; i++) await operation(page, "Add", "1");
  await equation(page, "2x+10=18");
  await currentWithinLedger();
});

test("WebGL creation failure provides a usable alternative", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (
        this: HTMLCanvasElement,
        kind: string,
        ...args: unknown[]
      ) {
        if (
          kind === "webgl" ||
          kind === "webgl2" ||
          kind === "experimental-webgl"
        )
          return null;
        return Reflect.apply(original, this, [kind, ...args]);
      },
    });
  });
  await start(page);
  await expect(page.getByTestId("village-scene").locator("svg")).toBeVisible();
  await solve(page);
  await restore(page);
  await page.screenshot({
    path: `${evidence}/webgl-fallback.png`,
    fullPage: true,
  });
});

test("simple-view replay keeps the equation, tokens and notebook in sync", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await start(page);
  await page.getByText("Scene options", { exact: true }).click();
  await page.getByLabel("Simple view", { exact: true }).check();
  await operation(page, "Subtract", "3");
  await equation(page, "2x=8");
  await expect(
    page.getByRole("button", { name: "Replay last move", exact: true }),
  ).toBeEnabled();
  await page.evaluate(() => {
    type ReplaySnapshot = {
      equation: string;
      left: string[];
      right: string[];
      current: number;
    };
    const state = window as typeof window & {
      replaySnapshots: ReplaySnapshot[];
    };
    state.replaySnapshots = [];
    const app = document.querySelector('[data-testid="equation-village"]')!;
    const observer = new MutationObserver(() => {
      const trays = app.querySelector(
        '[role="group"][aria-label="Matching algebra trays"]',
      )!;
      const tokens = (side: Element) =>
        [...side.querySelectorAll("span")]
          .map((token) => token.textContent || "")
          .filter((text) => ["x", "+1", "−1", "−x"].includes(text));
      const rows = [
        ...app.querySelectorAll('[data-testid="village-ledger"] li'),
      ];
      state.replaySnapshots.push({
        equation: app
          .querySelector('[data-testid="village-equation"]')!
          .getAttribute("data-equation")!
          .replace(/\s/g, ""),
        left: tokens(trays.children[0]),
        right: tokens(trays.children[2]),
        current: rows.findIndex(
          (row) => row.getAttribute("aria-current") === "step",
        ),
      });
    });
    observer.observe(app, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    });
    window.setTimeout(() => observer.disconnect(), 3000);
  });
  await page
    .getByRole("button", { name: "Replay last move", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { replaySnapshots: unknown[] })
            .replaySnapshots,
      ),
    )
    .toContainEqual({
      equation: "2x+3=11",
      left: ["x", "x", "+1", "+1", "+1"],
      right: Array(11).fill("+1"),
      current: 0,
    });
  await equation(page, "2x=8");
  await expect(page.getByTestId("village-ledger").locator("li")).toHaveCount(2);
  await expect(
    page.getByTestId("village-ledger").locator("li").nth(1),
  ).toHaveAttribute("aria-current", "step");
});

test("negative coefficients receive a truthful next-step hint", async ({
  page,
}) => {
  await start(page);
  await operation(page, "Multiply", "-1");
  await equation(page, "-2x-3=-11");
  await page.getByRole("button", { name: "Show a hint", exact: true }).click();
  await expect(
    page.getByText("Undo -3: add 3 to both sides.", { exact: false }),
  ).toBeVisible();
  await operation(page, "Add", "3");
  await equation(page, "-2x=-8");
  await page.getByRole("button", { name: "Show a hint", exact: true }).click();
  await expect(
    page.getByText("The coefficient of x is -2.", { exact: false }),
  ).toBeVisible();
  await operation(page, "Divide", "-2");
  await equation(page, "x=4");
  await restore(page);
});
