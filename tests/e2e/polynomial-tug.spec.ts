import {
  test,
  expect,
  type Page,
  type APIRequestContext,
} from "@playwright/test";
import { equivalent } from "../../src/apps/polynomials/algebra";
import { mkdirSync } from "node:fs";
import type { RoomView } from "../../src/lib/polynomial-tug/types";
const evidence = "out/polynomial-tug-preview";
async function answer(page: Page, wrong = false) {
  const source = (await page
    .getByTestId("tug-question")
    .getAttribute("data-source"))!;
  const choices = page.getByTestId("tug-choice");
  await expect(choices).toHaveCount(4);
  for (const choice of await choices.all()) {
    const match = equivalent(
      source,
      (await choice.getAttribute("data-source"))!,
    );
    if (match !== wrong) {
      await choice.click();
      return;
    }
  }
  throw new Error("No valid option");
}
test("teacher and four separate pupils complete cooperative pulls, level up, reconnect and pause", async ({
  page,
  browser,
}) => {
  test.setTimeout(240000);
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  mkdirSync(evidence, { recursive: true });
  await page.goto("/polynomial-tug");
  await expect(
    page.getByRole("heading", { name: "Polynomial Tug", exact: true }),
  ).toBeVisible();
  await page.goto("/login");
  await page.getByRole("button", { name: /^Teacher:/ }).click();
  await expect(page.getByText("Teacher access is active.")).toBeVisible();
  await page.goto("/polynomial-tug");
  await page.getByLabel("Number of groups").selectOption("1");
  await page
    .getByRole("button", { name: "Create class room", exact: true })
    .click();
  const code = await page.getByTestId("tug-code").innerText();
  const contexts = await Promise.all(
    [0, 1, 2, 3].map(() => browser.newContext()),
  );
  try {
    const students: Page[] = [];
    for (let seat = 0; seat < 4; seat++) {
      const student = await contexts[seat].newPage();
      student.on("pageerror", (error) => runtimeErrors.push(error.message));
      students.push(student);
      await student.goto(`/polynomial-tug?room=${code}`);
      await student
        .getByRole("button", {
          name: `Join Group 1 Pair ${seat < 2 ? "A" : "B"}`,
          exact: true,
        })
        .click();
      await expect(
        student.getByText("Waiting for the teacher to start", { exact: true }),
      ).toBeVisible();
    }
    await expect(
      page.getByText("4 / 4 seats filled", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Start all matches", exact: true })
      .click();
    await answer(students[0]);
    await expect(
      students[0].getByText("Your partner is still solving.", { exact: false }),
    ).toBeVisible();
    await answer(students[1], true);
    await expect(
      students[1].getByText("Check the working, then try again", {
        exact: true,
      }),
    ).toBeVisible();
    await students[1]
      .getByRole("button", { name: "Try a fresh question", exact: true })
      .click();
    await answer(students[1]);
    for (const student of students.slice(0, 2))
      await expect(
        student.getByText("Together you pulled 1 unit!", { exact: true }),
      ).toBeVisible();
    for (let round = 1; round < 3; round++) {
      await Promise.all(
        students.slice(0, 2).map((s) =>
          s
            .getByRole("button", {
              name: "Ready for next question",
              exact: true,
            })
            .click(),
        ),
      );
      await Promise.all(
        students
          .slice(0, 2)
          .map((s) =>
            expect(s.getByTestId("tug-choice").first()).toBeEnabled(),
          ),
      );
      await Promise.all(students.slice(0, 2).map((s) => answer(s)));
      for (const student of students.slice(0, 2))
        await expect(
          student.getByText("Together you pulled 1 unit!", { exact: true }),
        ).toBeVisible();
    }
    await expect(
      students[0].getByText("Level 2", { exact: true }).first(),
    ).toBeVisible();
    await students[0].reload();
    await expect(
      students[0].getByText("Together you pulled 1 unit!", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Pause class", exact: true })
      .click();
    await expect(
      students[2].getByText("Class paused — wait for your teacher", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(students[2].getByTestId("tug-choice").first()).toBeDisabled();
    await page
      .getByRole("button", { name: "Resume class", exact: true })
      .click();
    await expect(students[2].getByTestId("tug-choice").first()).toBeEnabled();
    await students[2].setViewportSize({ width: 390, height: 844 });
    expect(
      await students[2].evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await students[2].screenshot({
      path: `${evidence}/student-390.png`,
      fullPage: true,
    });
    await students[2].setViewportSize({ width: 360, height: 800 });
    expect(
      await students[2].evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await expect(students[2].getByTestId("tug-choice")).toHaveCount(4);
    await students[2].screenshot({
      path: `${evidence}/student-360.png`,
      fullPage: true,
    });
    // Complete every remaining tier through the actual four independent clients.
    for (let round = 3; round < 11; round++) {
      await Promise.all(
        students.slice(0, 2).map((s) =>
          s
            .getByRole("button", {
              name: "Ready for next question",
              exact: true,
            })
            .click(),
        ),
      );
      await Promise.all(
        students
          .slice(0, 2)
          .map((s) =>
            expect(s.getByTestId("tug-choice").first()).toBeEnabled(),
          ),
      );
      await Promise.all(students.slice(0, 2).map((s) => answer(s)));
      if (round < 10) {
        const power = Math.min(4, Math.floor(round / 3) + 1);
        await expect(
          students[0].getByText(`Together you pulled ${power} units!`, {
            exact: true,
          }),
        ).toBeVisible();
      }
    }
    for (const student of students) {
      await expect(
        student.getByRole("heading", { name: "Pair A wins!", exact: true }),
      ).toBeVisible();
      await expect(student.getByTestId("tug-choice")).toHaveCount(0);
    }
    await students[0].screenshot({
      path: `${evidence}/student-level-4-win.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({
      path: `${evidence}/teacher-1920.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "End class", exact: true }).click();
    await page
      .getByRole("button", { name: "End matches", exact: true })
      .click();
    await expect(
      students[0].getByText("Pair A wins!", { exact: true }).first(),
    ).toBeVisible();
    expect(runtimeErrors).toEqual([]);
  } finally {
    for (const context of contexts) await context.close();
  }
});

test("32 authenticated pupils play across eight groups with protected controls and a projector overview", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  const authEndpoint =
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1";
  async function token(teacher = false) {
    const response = await request.post(
      `${authEndpoint}/accounts:${teacher ? "signInWithPassword" : "signUp"}?key=demo-api-key`,
      {
        data: teacher
          ? {
              email: "teacher2@lskc.edu.hk",
              password: "LocalTest123!",
              returnSecureToken: true,
            }
          : { returnSecureToken: true },
      },
    );
    expect(response.ok()).toBe(true);
    return (await response.json()).idToken as string;
  }
  async function post(
    client: APIRequestContext,
    bearer: string,
    data: object,
    status = 200,
  ) {
    const response = await client.post("/api/polynomial-tug", {
      headers: { Authorization: `Bearer ${bearer}` },
      data,
    });
    expect(response.status(), await response.text()).toBe(status);
    return (await response.json()).state as RoomView;
  }
  const teacher = await token(true),
    pupils = await Promise.all(Array.from({ length: 33 }, () => token()));
  const created = await post(request, teacher, { action: "create", groups: 8 }),
    code = created.code;
  expect((await request.get(`/api/polynomial-tug?code=${code}`)).status()).toBe(
    401,
  );
  await post(request, pupils[0], { action: "create", groups: 8 }, 403);
  await Promise.all(
    pupils.slice(0, 32).map((bearer, i) =>
      post(request, bearer, {
        action: "join",
        code,
        group: Math.floor(i / 4),
        side: Math.floor((i % 4) / 2),
      }),
    ),
  );
  await post(
    request,
    pupils[32],
    { action: "join", code, group: 0, side: 0 },
    409,
  );
  await post(request, pupils[0], { action: "start", code }, 403);
  await post(request, teacher, { action: "start", code });
  const views = await Promise.all(
    pupils.slice(0, 32).map(async (bearer) => {
      const response = await request.get(`/api/polynomial-tug?code=${code}`, {
        headers: { Authorization: `Bearer ${bearer}` },
      });
      expect(response.status()).toBe(200);
      const text = await response.text();
      expect(text).not.toMatch(
        /"seed"|"secret"|"members"|"correctOption"|"answer"/,
      );
      return (JSON.parse(text) as { state: RoomView }).state;
    }),
  );
  expect(
    new Set(views.map((view) => `${view.you!.group}:${view.you!.seat}`)).size,
  ).toBe(32);
  const privateRead = await request.get(
    `http://127.0.0.1:8080/v1/projects/demo-lskc-maths/databases/(default)/documents/polynomialTugRooms/${code}/matches/0`,
    { headers: { Authorization: `Bearer ${pupils[0]}` } },
  );
  expect(privateRead.status()).toBe(403);
  await post(
    request,
    pupils[0],
    {
      action: "answer",
      code,
      questionId: views[1].player!.question.id,
      option: 0,
    },
    409,
  );
  await Promise.all(
    pupils.slice(0, 32).map((bearer, i) => {
      const q = views[i].player!.question;
      return post(request, bearer, {
        action: "answer",
        code,
        questionId: q.id,
        option: q.choices.findIndex((choice) => equivalent(q.source, choice)),
      });
    }),
  );
  const boardResponse = await request.get(`/api/polynomial-tug?code=${code}`, {
    headers: { Authorization: `Bearer ${teacher}` },
  });
  const board = (await boardResponse.json()).state as RoomView;
  expect(board.groups).toHaveLength(8);
  expect(
    board.groups.every(
      (group) =>
        group.position === 0 && group.pairs.every((pair) => pair.pulls === 1),
    ),
  ).toBe(true);
  await page.goto("/login");
  await page.getByRole("button", { name: /^Teacher:/ }).click();
  await expect(page.getByText("Teacher access is active.")).toBeVisible();
  await page.goto(`/polynomial-tug?room=${code}`);
  await expect(
    page.getByText("32 / 32 seats filled", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("tug-rope")).toHaveCount(8);
  await page.setViewportSize({ width: 1920, height: 1080 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  expect(
    await page
      .locator("article")
      .last()
      .evaluate((element) => element.getBoundingClientRect().bottom),
  ).toBeLessThanOrEqual(1080);
  await page.screenshot({
    path: `${evidence}/teacher-eight-groups-1920.png`,
    fullPage: true,
  });
  await post(request, teacher, { action: "pause", code });
  await post(
    request,
    pupils[0],
    { action: "next", code, questionId: views[0].player!.question.id },
    409,
  );
  await post(request, teacher, { action: "end", code });
  await expect(
    page.getByText("A balanced finish — draw", { exact: true }),
  ).toHaveCount(8);
});
