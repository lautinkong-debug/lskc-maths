import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { angleAt, distance, type Point } from "./geometry";
import {
  FLOW_CENTRE as O,
  getReasonScene,
  initialReasonParameters,
  toFlowPoint,
} from "./reasonExploration";
import {
  chordConstruction,
  moveMidpoint,
  startingChords,
  turnChord,
  type ChordPair,
} from "./twoBisectors";
import TwoBisectorsDiagram from "./TwoBisectorsDiagram";

const input = initialReasonParameters("r3");
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;

function checkConstruction(pair: ChordPair) {
  const constructions = [
    chordConstruction(pair.AB),
    chordConstruction(pair.CD),
  ];
  for (const chord of constructions) {
    expect(distance(chord.a, chord.mid)).toBeCloseTo(
      distance(chord.mid, chord.b),
      8,
    );
    expect(angleAt(chord.b, chord.mid, O)).toBeCloseTo(90, 8);
    expect(
      cross(
        { x: chord.line[0].x - O.x, y: chord.line[0].y - O.y },
        chord.normal,
      ),
    ).toBeCloseTo(0, 8);
    expect(
      cross(
        { x: chord.line[1].x - O.x, y: chord.line[1].y - O.y },
        chord.normal,
      ),
    ).toBeCloseTo(0, 8);
  }
  expect(
    Math.abs(cross(constructions[0].normal, constructions[1].normal)),
  ).toBeGreaterThan(1e-8);
}

describe("locating the centre with two chord bisectors", () => {
  it("starts from exactly the labelled positive or negative-offset chord used in Investigate", () => {
    for (const primary of [-9.2, -3, 0.5, 6, 9.2]) {
      const first = { ...input, rotation: 147, primary };
      const original = getReasonScene("r3", first).points;
      const pair = startingChords(first);
      const chord = chordConstruction(pair.AB);
      expect([chord.a, chord.b, chord.mid]).toEqual(
        ["A", "B", "N"].map((k) => toFlowPoint(original[k])),
      );
      checkConstruction(pair);
    }
  });
  it("keeps clearly separated saved comparisons and turns an almost parallel saved chord without resizing it", () => {
    for (const rotation of [16, 37, 164, 196]) {
      const other = { ...input, primary: -2, rotation };
      expect(startingChords(input, other).CD).toEqual(other);
    }
    for (const rotation of [0, 1, 15.9, 165, 179, 180, 195, 359, 360]) {
      const pair = startingChords(input, { ...input, primary: -4, rotation });
      expect(pair.CD.rotation).not.toEqual(rotation);
      expect(pair.CD.primary).toBe(-4);
      checkConstruction(pair);
    }
  });
  it("places the new chord clear of the ends and the bisector of the original chord", () => {
    const initial = startingChords(input);
    const first = chordConstruction(initial.AB),
      second = chordConstruction(initial.CD);
    for (const p of [second.a, second.b]) {
      expect(
        Math.abs(cross({ x: p.x - O.x, y: p.y - O.y }, first.normal)),
      ).toBeGreaterThan(18);
      expect(
        Math.min(distance(p, first.a), distance(p, first.b)),
      ).toBeGreaterThan(18);
    }
  });
  it("preserves the other chord, both midpoint conditions and a unique intersection throughout dragging or rotation", () => {
    let pair = startingChords({ ...input, rotation: 345 });
    for (const key of ["AB", "CD"] as const) {
      const still = key === "AB" ? "CD" : "AB";
      const unchanged = pair[still];
      for (const angle of [0, 16, 45, 90, 165, 180, 270, 359, 720]) {
        pair = turnChord(pair, key, angle);
        checkConstruction(pair);
      }
      for (const point of [
        O,
        { x: 21, y: 0 },
        { x: 210, y: 350 },
        { x: -400, y: 900 },
      ]) {
        pair = moveMidpoint(pair, key, point);
        checkConstruction(pair);
      }
      expect(pair[still]).toEqual(unchanged);
    }
  });
  it("shows the givens on both chords and adds the centre mark only after the prediction", () => {
    const render = (reveal: boolean) =>
      renderToStaticMarkup(
        createElement(TwoBisectorsDiagram, { first: input, reveal }),
      );
    const before = render(false);
    expect(before).toContain('data-right-angle="N"');
    expect(before).toContain('data-right-angle="M"');
    expect(before.match(/data-equal-half="AB"/g)?.length).toBe(2);
    expect(before.match(/data-equal-half="CD"/g)?.length).toBe(2);
    expect(before).not.toContain('data-point="O"');
    expect(before).not.toContain("intersect at the centre O");
    expect(render(true)).toContain('data-point="O"');
  });
});
