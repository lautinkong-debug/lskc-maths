import { describe, expect, it } from "vitest";
import { reasons } from "../content";
import { initialWorkspace, modeFromHash, parseWorkspace } from "../session";
import { figureIds, type Figure } from "./figureModel";
import { closeEnough, readNumber } from "./NumberTask";
import { madeReason } from "./ReasonMaker";
import {
  CHECK_SIZE,
  initialPath,
  parsePath,
  reasonMastery,
  recordAnswer,
  stationStars,
  activityKey,
} from "./pathSession";
import { stations } from "./stations";
import { fill } from "./stations/kit";
import { band, buildPaper, paperPlan, summarise } from "./test";
import {
  cpaOf,
  cpaStages,
  stepIds,
  type Activity,
  type Question,
  type Script,
} from "./types";

const reasonIds = reasons.map((reason) => reason.id);
const seeds = Array.from({ length: 60 }, (_, i) => i * 7919 + 3);

function checkFigure(figure: Figure, where: string) {
  const ids = figure.els.map((el) => el.id);
  expect(new Set(ids).size, `${where}: duplicate figure part`).toBe(ids.length);
  for (const id of Object.keys(figure.tones))
    expect(ids, `${where}: tone for a missing part "${id}"`).toContain(id);
  expect(figure.alt.length, `${where}: alt text`).toBeGreaterThan(10);
  for (const el of figure.els) {
    const numbers =
      JSON.stringify(el).match(/-?\d+(\.\d+)?(e[+-]?\d+)?|NaN|null/gi) ?? [];
    expect(numbers, `${where}: ${el.id}`).not.toContain("NaN");
    expect(JSON.stringify(el), `${where}: ${el.id}`).not.toContain("null");
  }
}

function checkScript(script: Script, where: string) {
  checkFigure(script.figure, where);
  const ids = figureIds(script.figure);
  expect(script.steps.length, where).toBeGreaterThan(1);
  script.steps.forEach((step, i) => {
    const at = `${where} line ${i + 1}`;
    for (const id of [...Object.keys(step.show ?? {}), ...(step.focus ?? [])])
      expect(ids.has(id), `${at}: unknown figure part "${id}"`).toBe(true);
    expect(Boolean(step.blank), `${at}: blank and ___ must come together`).toBe(
      Boolean(step.line?.includes("___")),
    );
    if (step.blank) {
      const { options, answer, why } = step.blank;
      expect(new Set(options).size, `${at}: repeated option`).toBe(
        options.length,
      );
      expect(answer, at).toBeGreaterThanOrEqual(0);
      expect(answer, at).toBeLessThan(options.length);
      expect(why?.length ?? options.length, at).toBe(options.length);
    }
  });
  expect(script.moral.length, where).toBeGreaterThan(20);
}

function checkQuestion(question: Question, where: string) {
  for (const id of question.reasonIds) expect(reasonIds, where).toContain(id);
  if (question.figure) checkFigure(question.figure, where);
  if (question.kind === "choice") {
    expect(
      question.options.filter((option) => option.good).length,
      `${where}: one right answer`,
    ).toBe(1);
    const texts = question.options.map((option) => option.text);
    expect(new Set(texts).size, `${where}: repeated option`).toBe(texts.length);
    for (const option of question.options)
      expect(option.why.length, where).toBeGreaterThan(5);
  } else {
    expect(Number.isFinite(question.answer), where).toBe(true);
    expect(question.answer, where).toBeGreaterThan(0);
    expect(question.solution.length, where).toBeGreaterThan(0);
    for (const slip of question.slips ?? [])
      expect(
        closeEnough(slip.value, question.answer),
        `${where}: a slip equals the answer`,
      ).toBe(false);
  }
}

describe("stations", () => {
  it("cover each of the 17 reasons exactly once, in order", () => {
    expect(stations.flatMap((station) => station.reasonIds)).toEqual(reasonIds);
    expect(stations.map((station) => station.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(Object.keys(paperPlan).sort()).toEqual(
      stations.map((station) => station.id).sort(),
    );
  });

  it("have one picture for every reason", () => {
    for (const station of stations)
      for (const id of station.reasonIds) {
        expect(station.pictures[id], `${station.id} ${id}`).toBeDefined();
        checkFigure(station.pictures[id], `${station.id} picture ${id}`);
      }
  });

  it("prove every reason", () => {
    for (const station of stations) {
      const proved = station.steps.prove.flatMap((activity) =>
        activity.kind === "script" ? [activity.script.reasonId] : [],
      );
      expect(proved, station.id).toEqual(station.reasonIds);
    }
  });

  for (const station of stations)
    describe(`station ${station.n}: ${station.title}`, () => {
      const every: [string, Activity][] = stepIds
        .filter((step) => step !== "check")
        .flatMap((step) =>
          station.steps[step as "wonder"].map(
            (activity): [string, Activity] => [
              `${station.id}.${step}.${activity.id}`,
              activity,
            ],
          ),
        );

      it("has all six steps and unique activity ids", () => {
        for (const step of stepIds)
          if (step !== "check")
            expect(station.steps[step].length, step).toBeGreaterThan(0);
        const keys = every.map(([key]) => key);
        expect(new Set(keys).size).toBe(keys.length);
        expect(station.more.length).toBeGreaterThan(0);
      });

      it("starts Discover with real objects, before any diagram is dragged", () => {
        expect(station.steps.discover[0].kind).toBe("hands");
        expect(
          station.steps.discover.some(
            (activity) => activity.kind === "explore",
          ),
        ).toBe(true);
      });

      it("opens with a guess and shows it again later", () => {
        const guess = station.steps.wonder.find(
          (activity) => activity.kind === "choice" && activity.guess,
        );
        expect(guess).toBeDefined();
        const recalled = every.filter(
          ([, activity]) => activity.recall === guess!.id,
        );
        expect(recalled.length).toBe(1);
      });

      it.each(every)("%s is well formed", (where, activity) => {
        switch (activity.kind) {
          case "script":
            checkScript(activity.script, where);
            break;
          case "choice":
            if (activity.figure) checkFigure(activity.figure, where);
            expect(
              activity.options.filter((option) => option.good).length,
            ).toBe(activity.guess ? 0 : 1);
            if (!activity.guess)
              for (const option of activity.options)
                expect(option.why.length, option.text).toBeGreaterThan(5);
            break;
          case "tiles": {
            if (activity.figure) checkFigure(activity.figure, where);
            const wording = reasons.find(
              (reason) => reason.id === activity.reasonId,
            )!.label;
            expect(activity.tiles.join(" ")).toBe(wording);
            for (const extra of activity.extras)
              expect(activity.tiles).not.toContain(extra);
            break;
          }
          case "pick":
            checkFigure(activity.figure, where);
            expect(activity.spots.map((spot) => spot.id)).toContain(
              activity.answer,
            );
            for (const spot of activity.spots)
              expect(activity.why[spot.id], spot.id).toBeDefined();
            // Tap targets are 25 units in radius; they must not overlap.
            activity.spots.forEach((a, i) =>
              activity.spots
                .slice(i + 1)
                .forEach((b) =>
                  expect(
                    Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y),
                    `${a.id}–${b.id}`,
                  ).toBeGreaterThan(50),
                ),
            );
            break;
          case "slide":
            for (const value of [activity.min, activity.start, activity.max]) {
              checkFigure(activity.figure(value), `${where} at ${value}`);
              expect(activity.readout(value).length).toBeGreaterThan(0);
            }
            expect(
              activity.options.filter((option) => option.good).length,
            ).toBe(1);
            break;
          case "explore":
            expect(reasonIds).toContain(activity.reasonId);
            expect(
              activity.options.filter((option) => option.good).length,
            ).toBe(1);
            break;
          case "number":
            for (const seed of seeds) {
              const question = activity.make(seed);
              checkFigure(question.figure, where);
              expect(
                Number.isFinite(question.answer) && question.answer > 0,
                `${where} seed ${seed}`,
              ).toBe(true);
              expect(question.hints.length).toBeGreaterThan(0);
              expect(question.solution.length).toBeGreaterThan(0);
              for (const slip of question.slips ?? [])
                expect(
                  closeEnough(slip.value, question.answer),
                  `${where} seed ${seed} slip ${slip.value}`,
                ).toBe(false);
            }
            break;
          case "card":
            for (const id of activity.reasonIds)
              expect(reasonIds).toContain(id);
            break;
          case "hands":
            expect(activity.need.length).toBeGreaterThan(0);
            expect(activity.todo.length).toBeGreaterThan(1);
            expect(activity.look.endsWith("?")).toBe(true);
            break;
          default:
            break;
        }
      });

      it("sets a five-question Check that covers every reason over time", () => {
        const seen = new Set<string>();
        for (const seed of seeds) {
          const paper = station.check(seed);
          expect(paper.length).toBe(CHECK_SIZE);
          expect(new Set(paper.map((question) => question.id)).size).toBe(
            CHECK_SIZE,
          );
          paper.forEach((question) => {
            checkQuestion(
              question,
              `${station.id} check ${question.id} seed ${seed}`,
            );
            question.reasonIds.forEach((id) => seen.add(id));
          });
          expect(paper.some((question) => question.kind === "number")).toBe(
            true,
          );
          expect(paper.some((question) => question.kind === "choice")).toBe(
            true,
          );
        }
        for (const id of station.reasonIds) expect(seen, id).toContain(id);
      });

      it("gives the same Check for the same seed", () => {
        expect(JSON.stringify(station.check(42))).toBe(
          JSON.stringify(station.check(42)),
        );
      });
    });
});

describe("where Circle Lab opens", () => {
  it("opens on Learn for a new visitor, unless a link names another activity", () => {
    expect(initialWorkspace.mode).toBe("learn");
    expect(modeFromHash("")).toBeUndefined();
    expect(modeFromHash("#explore")).toBe("explore");
    expect(modeFromHash("#Learn")).toBe("learn");
    expect(modeFromHash("#relay")).toBe("reasons-relay");
    expect(modeFromHash("#reasons-play")).toBe("reasons-play");
    expect(modeFromHash("#somewhere-else")).toBeUndefined();
    expect(parseWorkspace({ mode: "learn" })?.mode).toBe("learn");
    expect(parseWorkspace({ mode: "quest" })?.mode).toBe("reasons-relay");
  });
});

describe("Concrete, Pictorial, Abstract", () => {
  it("puts every step in a stage, in order, two steps to a stage", () => {
    const order = stepIds.map((step) => cpaOf[step]);
    expect(order).toEqual([
      "concrete",
      "concrete",
      "pictorial",
      "pictorial",
      "abstract",
      "abstract",
    ]);
    expect(cpaStages).toEqual(["concrete", "pictorial", "abstract"]);
  });
});

describe("reason maker", () => {
  it("makes exactly the six reasons 16.10 to 16.15, each from what it starts with", () => {
    const made = Object.values(madeReason).flatMap((row) => Object.values(row));
    expect([...made].sort()).toEqual([
      "r10",
      "r11",
      "r12",
      "r13",
      "r14",
      "r15",
    ]);
    const words = {
      angles: "equal ∠s",
      arcs: "equal arcs",
      chords: "equal chords",
    } as const;
    for (const [have, row] of Object.entries(madeReason))
      for (const [get, id] of Object.entries(row))
        expect(reasons.find((reason) => reason.id === id)!.label).toBe(
          `${words[have as keyof typeof words]}, ${words[get as keyof typeof words]}`,
        );
  });
});

describe("helpers", () => {
  it("places the right answer of a blank where it says", () => {
    const blank = fill("radii", ["given", "common side"], { given: "no" });
    expect(blank.options[blank.answer]).toBe("radii");
    expect(blank.options.length).toBe(3);
    expect(blank.why![blank.options.indexOf("given")]).toBe("no");
  });

  it("reads typed numbers and allows small rounding", () => {
    expect(readNumber(" 8 cm")).toBe(8);
    expect(readNumber("3.2")).toBe(3.2);
    expect(readNumber("65°")).toBe(65);
    expect(readNumber("−4")).toBe(-4);
    expect(readNumber("eight")).toBeNull();
    expect(readNumber("")).toBeNull();
    expect(closeEnough(3.2, 3.2000001)).toBe(true);
    expect(closeEnough(12.8, 12.81)).toBe(true);
    expect(closeEnough(6, 8)).toBe(false);
  });
});

describe("chapter test", () => {
  it("sets twelve questions across all three families", () => {
    for (const seed of seeds) {
      const paper = buildPaper(seed);
      expect(paper.length).toBe(12);
      expect(new Set(paper.map((item) => item.question.id)).size).toBe(12);
      expect(new Set(paper.map((item) => item.station)).size).toBe(7);
      paper.forEach((item) =>
        checkQuestion(item.question, `test ${item.question.id} seed ${seed}`),
      );
      const numbers = paper.filter(
        (item) => item.question.kind === "number",
      ).length;
      expect(numbers).toBeGreaterThanOrEqual(5);
      expect(numbers).toBeLessThanOrEqual(9);
    }
  });

  it("reports marks, families, missed reasons and stations to revise", () => {
    const paper = buildPaper(5);
    const marked = paper.map((item, i) => ({
      question: item.question,
      right: i > 1,
      shown: "",
    }));
    const summary = summarise(paper, marked, 5, 1000);
    expect(summary.mark).toBe(10);
    expect(summary.total).toBe(12);
    expect(summary.families.reduce((sum, [, of]) => sum + of, 0)).toBe(12);
    expect(summary.families.reduce((sum, [got]) => sum + got, 0)).toBe(10);
    expect(summary.revise).toEqual(["bisector"]);
    expect(summary.missed.every((id) => ["r1", "r2", "r3"].includes(id))).toBe(
      true,
    );
    expect(summary.slips.length).toBeGreaterThan(0);
    expect(band(12, 12)).toBe("top");
    expect(band(9, 12)).toBe("pass");
    expect(band(6, 12)).toBe("close");
    expect(band(2, 12)).toBe("start");
  });
});

describe("progress", () => {
  it("starts empty and survives a save and reload", () => {
    const state = initialPath();
    expect(parsePath(JSON.parse(JSON.stringify(state)))).toEqual(state);
    expect(parsePath(null)).toBeUndefined();
    expect(parsePath({ v: 2 })).toBeUndefined();
  });

  it("drops damaged values without losing the rest", () => {
    const parsed = parsePath({
      v: 1,
      view: "nowhere",
      station: "not-a-station",
      step: "prove",
      done: { "bisector.prove.p161": true, bad: "yes" },
      checks: { bisector: { best: 4, tries: 2, seed: 9 }, other: { best: 5 } },
      reasons: {
        r1: { right: 3, wrong: 1, mixed: { r2: 1, zz: 4 } },
        zz: { right: 9 },
      },
      tests: [
        {
          at: 5,
          seed: 1,
          total: 12,
          mark: 9,
          families: [[3, 4]],
          missed: ["r2", "zz"],
          slips: ["direction"],
        },
      ],
    })!;
    expect(parsed.view).toBe("home");
    expect(parsed.station).toBe("bisector");
    expect(parsed.step).toBe("prove");
    expect(parsed.done).toEqual({ "bisector.prove.p161": true });
    expect(parsed.checks).toEqual({ bisector: { best: 4, tries: 2, seed: 9 } });
    expect(parsed.reasons).toEqual({
      r1: { right: 3, wrong: 1, mixed: { r2: 1 } },
    });
    expect(parsed.tests[0].missed).toEqual(["r2"]);
  });

  it("awards one star for the lesson and two more for the Check", () => {
    const station = stations[0];
    let state = initialPath();
    expect(stationStars(state, station)).toBe(0);
    for (const step of stepIds)
      if (step !== "check")
        for (const activity of station.steps[step])
          state = {
            ...state,
            done: {
              ...state.done,
              [activityKey(station.id, step, activity.id)]: true,
            },
          };
    expect(stationStars(state, station)).toBe(1);
    state = { ...state, checks: { bisector: { best: 4, tries: 1, seed: 1 } } };
    expect(stationStars(state, station)).toBe(2);
    state = { ...state, checks: { bisector: { best: 5, tries: 2, seed: 1 } } };
    expect(stationStars(state, station)).toBe(3);
  });

  it("records mix-ups and grades mastery", () => {
    let state = initialPath();
    expect(reasonMastery(state.reasons.r1)).toBe("new");
    state = recordAnswer(state, ["r1"], false, "r2", "direction");
    expect(state.reasons.r1).toEqual({ right: 0, wrong: 1, mixed: { r2: 1 } });
    expect(state.slips.direction).toBe(1);
    expect(reasonMastery(state.reasons.r1)).toBe("revise");
    for (let i = 0; i < 2; i++) state = recordAnswer(state, ["r1"], true);
    expect(reasonMastery(state.reasons.r1)).toBe("nearly");
    for (let i = 0; i < 3; i++) state = recordAnswer(state, ["r1"], true);
    expect(reasonMastery(state.reasons.r1)).toBe("secure");
  });
});
