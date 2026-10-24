import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { equivalent } from "../../src/apps/polynomials/algebra";
import type { RoomView } from "../../src/lib/polynomial-tug/types";

test("32 independent browsers join eight groups and complete all four levels with every skill", async ({
  page,
  browser,
}) => {
  test.setTimeout(600000);
  const output = "out/polynomial-arcade-32";
  mkdirSync(output, { recursive: true });
  const errors: string[] = [];
  const rounds: object[] = [];
  const contexts: BrowserContext[] = [];
  const students: {
    page: Page;
    view: RoomView | null;
    levels: Set<number>;
    index: number;
  }[] = [];
  let fatal = "";
  const watch = (p: Page) =>
    p.on("pageerror", (error) => errors.push(error.message));
  watch(page);
  async function until(condition: () => boolean, label: string) {
    const end = Date.now() + 60000;
    while (!condition()) {
      if (fatal) throw new Error(fatal);
      if (Date.now() > end) throw new Error("Timed out: " + label);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  async function answer(s: (typeof students)[number], wrong = false) {
    const source = (await s.page
      .getByTestId("tug-question")
      .getAttribute("data-source"))!;
    const choices = s.page.getByTestId("tug-choice");
    await expect(choices).toHaveCount(4);
    const correct: number[] = [];
    for (let i = 0; i < 4; i++)
      if (
        equivalent(source, (await choices.nth(i).getAttribute("data-source"))!)
      )
        correct.push(i);
    expect(correct).toHaveLength(1);
    await choices.nth(wrong ? (correct[0] + 1) % 4 : correct[0]).click();
    await until(
      () => s.view?.player?.phase === (wrong ? "wrong" : "correct"),
      "answer " + s.index,
    );
  }
  await page.goto("/login");
  await page.getByRole("button", { name: /^Teacher:/ }).click();
  await expect(page.getByText("Teacher access is active.")).toBeVisible();
  await page.goto("/polynomial-tug");
  await page
    .getByRole("button", { name: "Create class room", exact: true })
    .click();
  const code = await page.getByTestId("tug-code").innerText();
  try {
    for (let group = 0; group < 8; group++) {
      await Promise.all(
        Array.from({ length: 4 }, async (_, local) => {
          const context = await browser.newContext({
            viewport: { width: 390, height: 844 },
          });
          contexts.push(context);
          const p = await context.newPage();
          watch(p);
          const s: (typeof students)[number] = {
            page: p,
            view: null,
            levels: new Set(),
            index: group * 4 + local,
          };
          students.push(s);
          p.on("response", async (response) => {
            if (!response.url().includes("/api/polynomial-tug")) return;
            try {
              const body = await response.json();
              if (response.status() >= 500) {
                fatal = body.message || "Classroom service failed";
                errors.push(fatal);
                return;
              }
              const next = body.state as RoomView | undefined;
              if (!next) return;
              const old = s.view;
              if (
                !old ||
                (next.revision >= old.revision &&
                  !(old.you && !next.you) &&
                  (next.match?.revision ?? 0) >= (old.match?.revision ?? 0))
              )
                s.view = next;
            } catch {
              /* Navigation may abort a response. */
            }
          });
          await p.goto(`/polynomial-tug?room=${code}`);
          await p
            .getByRole("button", {
              name: `Join Group ${group + 1} Pair ${local < 2 ? "A" : "B"}`,
              exact: true,
            })
            .click();
          await until(() => !!s.view?.you, "join " + s.index);
        }),
      );
    }
    expect(
      new Set(students.map((s) => `${s.view!.you!.group}:${s.view!.you!.seat}`))
        .size,
    ).toBe(32);
    await expect(
      page.getByText("32 / 32 seats filled", { exact: true }),
    ).toBeVisible();
    const original = students[0].view!.you;
    await students[0].page.reload();
    await expect(
      students[0].page.getByRole("heading", {
        name: /Group 1 · Pair A · Student/,
      }),
    ).toBeVisible();
    expect(students[0].view!.you).toEqual(original);
    await page
      .getByRole("button", { name: "Start all matches", exact: true })
      .click();
    for (let round = 0; round < 12; round++) {
      const level = Math.min(4, 1 + Math.floor(round / 3));
      await until(
        () =>
          students.every(
            (s) =>
              s.view!.player?.phase === "answering" &&
              s.view!.match!.pairs[Math.floor(s.view!.you!.seat / 2)].pulls ===
                round,
          ),
        "ready round " + round,
      );
      for (const s of students) {
        expect(s.view!.groups).toHaveLength(0);
        expect(
          s.view!.match!.pairs[Math.floor(s.view!.you!.seat / 2)].level,
        ).toBe(level);
        expect(s.view!.player!.question.hint).toBe(
          ["like", "subtract", "expand", "mixed"][level - 1],
        );
        s.levels.add(level);
      }
      const skill =
        round === 3
          ? "Power Pull"
          : round === 6
            ? "Anchor Shield"
            : round === 9
              ? "Team Surge"
              : null;
      if (skill) {
        await Promise.all(
          students
            .filter((s) => s.view!.you!.seat % 2 === 0)
            .map(async (s) => {
              await s.page
                .getByRole("button", { name: "Activate " + skill, exact: true })
                .click();
              await until(
                () =>
                  s.view!.match!.pairs[Math.floor(s.view!.you!.seat / 2)]
                    .skillUsed,
                "activate skill",
              );
            }),
        );
        await until(
          () =>
            students.every((s) =>
              s.view!.match!.pairs.every((p) => p.skillUsed),
            ),
          "partner sees skill",
        );
      }
      if (round === 9)
        await students[0].page.screenshot({
          path: `${output}/level-4-surge-390.png`,
          fullPage: true,
        });
      const wrong =
        round === 0 ? students.filter((s) => s.view!.you!.seat === 1) : [];
      await Promise.all(students.map((s) => answer(s, wrong.includes(s))));
      if (wrong.length) {
        for (const s of wrong) expect(s.view!.match!.pairs[0].pulls).toBe(0);
        await Promise.all(
          wrong.map(async (s) => {
            const id = s.view!.player!.question.id;
            await s.page
              .getByRole("button", {
                name: "Try a fresh question",
                exact: true,
              })
              .click();
            await until(
              () =>
                s.view!.player!.phase === "answering" &&
                s.view!.player!.question.id !== id,
              "retry",
            );
            await answer(s);
          }),
        );
      }
      await until(
        () =>
          students.every(
            (s) =>
              s.view!.match!.position === 0 &&
              s.view!.match!.pairs.every(
                (p) => p.pulls === round + 1 && p.resolved,
              ),
          ),
        "completed round " + round,
      );
      const power = round === 3 ? 4 : round === 6 ? 1 : round === 9 ? 8 : level;
      for (const s of students)
        expect(s.view!.match!.pairs.every((p) => p.lastPower === power)).toBe(
          true,
        );
      rounds.push({
        round: round + 1,
        level,
        skill,
        power,
        correctAnswers: 32,
        pairs: 16,
      });
      console.log(
        `32 students completed round ${round + 1}, level ${level}${skill ? ", " + skill : ""}`,
      );
      if (round < 11)
        await Promise.all(
          students.map(async (s) => {
            const id = s.view!.player!.question.id;
            await s.page
              .getByRole("button", {
                name: "Ready for next question",
                exact: true,
              })
              .click();
            await until(() => s.view!.player!.question.id !== id, "next round");
          }),
        );
    }
    for (const s of students) expect([...s.levels]).toEqual([1, 2, 3, 4]);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByTestId("tug-rope")).toHaveCount(8);
    expect(
      await page
        .locator("article")
        .last()
        .evaluate((el) => el.getBoundingClientRect().bottom),
    ).toBeLessThanOrEqual(1080);
    await page.screenshot({
      path: `${output}/teacher-eight-groups.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "End class", exact: true }).click();
    await page
      .getByRole("button", { name: "End matches", exact: true })
      .click();
    await Promise.all(
      students.map((s) =>
        expect(
          s.page.getByRole("heading", {
            name: "A balanced finish — draw",
            exact: true,
          }),
        ).toBeVisible(),
      ),
    );
    expect(errors).toEqual([]);
    writeFileSync(
      `${output}/report.json`,
      JSON.stringify(
        {
          passed: true,
          code,
          clients: 32,
          groups: 8,
          correctAnswers: 384,
          wrongRetries: 8,
          refresh: true,
          rounds,
          errors,
        },
        null,
        2,
      ),
    );
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
});
