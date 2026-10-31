import { describe, expect, it } from "vitest";
import {
  MAX_INK_STROKES,
  MAX_STROKE_POINTS,
  inkPath,
  inkReducer,
  parseInkDocument,
  pointSegmentDistance,
  strokeAtPoint,
  strokeAlongSegment,
  type InkHistory,
  type InkStroke,
} from "./ink";

const stroke = (id = "a", changes: Partial<InkStroke> = {}): InkStroke => ({
  id,
  colour: "#b52a4d",
  width: 3,
  points: [
    { x: 10, y: 20 },
    { x: 110, y: 20 },
  ],
  ...changes,
});
const empty = (): InkHistory => ({ past: [], present: [], future: [] });

describe("whiteboard ink geometry", () => {
  it("detects a stroke between sampled points, including its width", () => {
    expect(strokeAtPoint(stroke(), { x: 60, y: 27 }, 6)).toBe(true);
    expect(strokeAtPoint(stroke(), { x: 60, y: 29 }, 6)).toBe(false);
  });
  it("does not erase the extension beyond a segment endpoint", () => {
    expect(
      pointSegmentDistance(
        { x: 130, y: 20 },
        { x: 10, y: 20 },
        { x: 110, y: 20 },
      ),
    ).toBe(20);
    expect(strokeAtPoint(stroke(), { x: 130, y: 20 }, 6)).toBe(false);
  });
  it("handles a pen tap and zero-length segments", () => {
    const tap = stroke("tap", { points: [{ x: 42, y: 70 }] });
    expect(strokeAtPoint(tap, { x: 43, y: 70 }, 2)).toBe(true);
    expect(
      pointSegmentDistance(
        { x: 45, y: 74 },
        { x: 42, y: 70 },
        { x: 42, y: 70 },
      ),
    ).toBe(5);
    expect(inkPath(tap.points)).toBe("M 42 70 L 42 70");
  });
  it("erases strokes crossed between fast eraser pointer samples", () => {
    expect(
      strokeAlongSegment(stroke(), { x: 60, y: -50 }, { x: 60, y: 80 }, 2),
    ).toBe(true);
    expect(
      strokeAlongSegment(stroke(), { x: 120, y: -50 }, { x: 120, y: 80 }, 2),
    ).toBe(false);
  });
  it("handles parallel swipes, pen taps and stationary erasers", () => {
    expect(
      strokeAlongSegment(stroke(), { x: 40, y: 22 }, { x: 80, y: 22 }, 2),
    ).toBe(true);
    expect(
      strokeAlongSegment(stroke(), { x: 40, y: 28 }, { x: 80, y: 28 }, 2),
    ).toBe(false);
    expect(
      strokeAlongSegment(stroke(), { x: 60, y: 20 }, { x: 60, y: 20 }, 2),
    ).toBe(true);
    expect(
      strokeAlongSegment(
        stroke("tap", { points: [{ x: 50, y: 20 }] }),
        { x: 0, y: 20 },
        { x: 100, y: 20 },
        2,
      ),
    ).toBe(true);
  });
  it("keeps SVG coordinates outside the circle viewBox for whiteboard annotations", () => {
    const result = parseInkDocument({
      strokes: [
        stroke("blank", {
          points: [
            { x: -240, y: 50 },
            { x: 760, y: 65 },
          ],
        }),
      ],
    });
    expect(result?.strokes[0].points).toEqual([
      { x: -240, y: 50 },
      { x: 760, y: 65 },
    ]);
  });
});

describe("whiteboard undo and erasing", () => {
  it("treats erasing several strokes in one gesture as one undoable change", () => {
    let history = inkReducer(
      inkReducer(empty(), { type: "add", stroke: stroke("a") }),
      { type: "add", stroke: stroke("b") },
    );
    history = inkReducer(history, { type: "erase", ids: ["a", "b"] });
    expect(history.present).toHaveLength(0);
    history = inkReducer(history, { type: "undo" });
    expect(history.present.map((s) => s.id)).toEqual(["a", "b"]);
    expect(inkReducer(history, { type: "redo" }).present).toHaveLength(0);
  });
  it("can undo Clear ink without changing the original stroke points", () => {
    const original = stroke();
    const written = inkReducer(empty(), { type: "add", stroke: original });
    const cleared = inkReducer(written, { type: "clear" });
    expect(inkReducer(cleared, { type: "undo" }).present).toEqual([original]);
  });
  it("drops redo after drawing a new stroke following undo", () => {
    let history = inkReducer(empty(), { type: "add", stroke: stroke("a") });
    history = inkReducer(history, { type: "undo" });
    history = inkReducer(history, { type: "add", stroke: stroke("b") });
    expect(history.future).toEqual([]);
    expect(history.present[0].id).toBe("b");
  });
  it("does not add empty history entries for clear/erase/undo/redo no-ops", () => {
    const state = empty();
    for (const action of [
      { type: "clear" },
      { type: "erase", ids: ["missing"] },
      { type: "undo" },
      { type: "redo" },
    ] as const)
      expect(
        inkReducer(
          state,
          action.type === "erase"
            ? { ...action, ids: [...action.ids] }
            : action,
        ),
      ).toBe(state);
  });
  it("refuses strokes beyond the board limit without silently discarding old writing", () => {
    const state = {
      past: [],
      present: Array.from({ length: MAX_INK_STROKES }, (_, i) =>
        stroke(`s${i}`),
      ),
      future: [],
    } satisfies InkHistory;
    expect(inkReducer(state, { type: "add", stroke: stroke("too-many") })).toBe(
      state,
    );
  });
});

describe("stored ink validation", () => {
  it("ignores unsafe colours, nonfinite points, invalid widths and duplicate ids", () => {
    expect(
      parseInkDocument({
        strokes: [
          stroke("valid"),
          stroke("valid"),
          stroke("badColour", { colour: "url(https://invalid)" }),
          stroke("badWidth", { width: 0 }),
          stroke("badPoint", { points: [{ x: NaN, y: 0 }] }),
          stroke("outside", { points: [{ x: 10001, y: 0 }] }),
        ],
      })?.strokes.map((s) => s.id),
    ).toEqual(["valid"]);
  });
  it("bounds long stored gestures while preserving both ends", () => {
    const points = Array.from({ length: 5000 }, (_, i) => ({
      x: i / 10,
      y: i % 20,
    }));
    const saved = parseInkDocument({ strokes: [stroke("long", { points })] })!
      .strokes[0];
    expect(saved.points).toHaveLength(MAX_STROKE_POINTS);
    expect(saved.points[0]).toEqual(points[0]);
    expect(saved.points.at(-1)).toEqual(points.at(-1));
  });
  it("rejects malformed documents and strips unrecognised fields", () => {
    expect(parseInkDocument(null)).toBeUndefined();
    expect(parseInkDocument({ strokes: "bad" })).toBeUndefined();
    expect(
      parseInkDocument({
        strokes: [{ ...stroke(), secret: "ignored" }],
        mode: "pen",
      }),
    ).toEqual({ strokes: [stroke()] });
  });
});
