import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_INK_STROKES,
  MAX_INK_POINTS,
  MAX_STROKE_POINTS,
  type InkDocument,
  type InkStroke,
} from "./ink";

// Run commands from one render before the next render, as with batched events.
// The harness stores state/ref slots and persistence without needing a DOM.
const harness = vi.hoisted(() => ({
  slots: [] as unknown[],
  cursor: 0,
  document: { strokes: [] } as InkDocument,
}));
vi.mock("react", () => ({
  useEffect: () => {},
  useState: (initial: unknown) => {
    const index = harness.cursor++;
    if (!(index in harness.slots))
      harness.slots[index] =
        typeof initial === "function" ? initial() : initial;
    return [
      harness.slots[index],
      (value: unknown) => {
        harness.slots[index] =
          typeof value === "function" ? value(harness.slots[index]) : value;
      },
    ];
  },
  useRef: (initial: unknown) => {
    const index = harness.cursor++;
    if (!(index in harness.slots)) harness.slots[index] = { current: initial };
    return harness.slots[index];
  },
}));
vi.mock("./useLocalSession", () => ({
  useLocalSession: () => [
    harness.document,
    (next: InkDocument) => {
      harness.document = next;
    },
    false,
  ],
}));
import { useInkBoard } from "./useInkBoard";

const stroke = (id: string): InkStroke => ({
  id,
  colour: "#b52a4d",
  width: 3,
  points: [
    { x: 10, y: 20 },
    { x: 40, y: 50 },
  ],
});
function render() {
  harness.cursor = 0;
  // eslint-disable-next-line react-hooks/rules-of-hooks -- React hooks are replaced by this deterministic state harness.
  return useInkBoard("test");
}
beforeEach(() => {
  harness.slots = [];
  harness.document = { strokes: [] };
});

describe("ink controller command sequencing", () => {
  it("keeps successive strokes issued before the next React render", () => {
    const board = render();
    board.addStroke(stroke("a"));
    board.addStroke(stroke("b"));
    expect(render().strokes.map((s) => s.id)).toEqual(["a", "b"]);
    expect(harness.document.strokes.map((s) => s.id)).toEqual(["a", "b"]);
  });
  it("applies successive undo/redo commands to the latest history", () => {
    let board = render();
    board.addStroke(stroke("a"));
    board.addStroke(stroke("b"));
    board = render();
    board.undo();
    board.undo();
    expect(render().strokes).toHaveLength(0);
    board.redo();
    board.redo();
    expect(render().strokes.map((s) => s.id)).toEqual(["a", "b"]);
  });
  it("erases the latest stroke even before it has rendered, then can restore it", () => {
    const board = render();
    board.addStroke(stroke("a"));
    board.eraseAt({ x: 20, y: 30 });
    expect(render().strokes).toHaveLength(0);
    board.undo();
    expect(render().strokes.map((s) => s.id)).toEqual(["a"]);
  });
  it("recovers drawing after a full-board rejection and an erase", () => {
    harness.document = {
      strokes: Array.from({ length: MAX_INK_STROKES }, (_, i) =>
        stroke(`s${i}`),
      ),
    };
    let board = render();
    expect(board.limitReached).toBe(true);
    board.addStroke(stroke("rejected"));
    board.eraseStrokes(["s0"]);
    board = render();
    expect(board.limitReached).toBe(false);
    board.addStroke(stroke("new"));
    expect(render().strokes).toHaveLength(MAX_INK_STROKES);
    expect(render().strokes.at(-1)?.id).toBe("new");
    board.clear();
    expect(render().limitReached).toBe(false);
    board.undo();
    expect(render().limitReached).toBe(true);
  });
  it("recovers after exceeding the point budget without losing existing writing", () => {
    const long = (id: string): InkStroke => ({
      ...stroke(id),
      points: Array.from({ length: MAX_STROKE_POINTS }, (_, i) => ({
        x: i / 10,
        y: 20,
      })),
    });
    harness.document = {
      strokes: Array.from(
        { length: MAX_INK_POINTS / MAX_STROKE_POINTS },
        (_, i) => long(`s${i}`),
      ),
    };
    const board = render();
    board.addStroke(stroke("rejected"));
    expect(render().limitReached).toBe(true);
    expect(render().strokes).toHaveLength(20);
    board.eraseStrokes(["s0"]);
    expect(render().limitReached).toBe(false);
    board.addStroke(stroke("new"));
    expect(render().strokes.at(-1)?.id).toBe("new");
    expect(render().strokes).toHaveLength(20);
  });
});
