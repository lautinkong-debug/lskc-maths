import type { LabId } from "./content";
import {
  angleAt,
  distance,
  getScene,
  RADIUS,
  UNIT,
  type Parameters,
  type Point,
} from "./geometry";

export type Mission = {
  id: string;
  lab: LabId;
  title: string;
  instruction: string;
  hint: string;
  target: string;
};
export const missions: Record<LabId, Mission[]> = {
  bisector: [
    {
      id: "bisector-1",
      lab: "bisector",
      title: "Find the balance point",
      instruction:
        "Drag N until ON meets AB at a right angle. What happens to AN and NB?",
      hint: "N stays on the chord. Watch the angle as you move N towards the middle.",
      target: "Make ∠ONB = 90°. Compare the two lengths.",
    },
    {
      id: "bisector-2",
      lab: "bisector",
      title: "Stretch the chord",
      instruction:
        "Make AB longer than 18 cm, then move N to its mid-point. What happens to the angle?",
      hint: "Move A or B so the chord comes closer to O. Then adjust N.",
      target: "AB > 18 cm; place N at the mid-point.",
    },
    {
      id: "bisector-3",
      lab: "bisector",
      title: "Turn it sideways",
      instruction:
        "Make AB clearly slanting, then restore the right angle at N.",
      hint: "Turn the chord by about 45°, then slide N while watching the angle.",
      target: "A slanting chord with ∠ONB = 90°",
    },
  ],
  chords: [
    {
      id: "chords-1",
      lab: "chords",
      title: "Match the chords",
      instruction:
        "Make AB and CD the same length. Compare their perpendicular distances from O.",
      hint: "Move the more distant chord towards O until the two lengths match.",
      target: "Match AB and CD. Compare OM and ON.",
    },
    {
      id: "chords-2",
      lab: "chords",
      title: "Long versus short",
      instruction: "Make AB longer than 18 cm and CD shorter than 12 cm.",
      hint: "Bring AB closer to the centre and move CD further away.",
      target: "AB > 18 cm; CD < 12 cm",
    },
    {
      id: "chords-3",
      lab: "chords",
      title: "Equal, at an angle",
      instruction:
        "Keep the two chords equal, but turn them so they point in different directions.",
      hint: "Rotate just one chord by about 60°. Check that their perpendicular distances still match.",
      target: "Equal chords with different directions",
    },
  ],
  centre: [
    {
      id: "centre-1",
      lab: "centre",
      title: "Make forty",
      instruction:
        "Make the angle at P equal to 40°. Read the matching angle at O.",
      hint: "Change the arc AB. Keep P on the other arc.",
      target: "Make ∠APB = 40°. What do you notice at O?",
    },
    {
      id: "centre-2",
      lab: "centre",
      title: "Go reflex",
      instruction:
        "Make the angle at P equal to 120°. Find the centre angle that follows the highlighted arc.",
      hint: "Move P onto the shorter arc. The matching centre angle must follow the longer arc.",
      target: "Make ∠APB = 120°. Follow the highlighted arc.",
    },
    {
      id: "centre-3",
      lab: "centre",
      title: "Move the viewpoint",
      instruction:
        "Make the angle at P equal to 65°, with P well to the left or right of O.",
      hint: "Adjust AB until the angle at P is 65°. Now move P along its arc while keeping A and B fixed.",
      target: "∠APB = 65° with P away from the vertical centre line",
    },
  ],
  segment: [
    {
      id: "segment-1",
      lab: "segment",
      title: "One angle, two viewpoints",
      instruction:
        "Put P and Q on the same side of AB. Make the angle at P equal to 60° and inspect the angle at Q.",
      hint: "Both points must be on the same arc. Change AB to adjust both angles together.",
      target: "∠APB = 60°; P and Q on the same side.",
    },
    {
      id: "segment-2",
      lab: "segment",
      title: "Cross the chord",
      instruction:
        "Keep the angle at P equal to 60°. Move Q to the opposite side of AB and compare the two angles.",
      hint: "Keep P's angle at 60°, then move Q onto the opposite arc.",
      target: "∠APB = 60°; move Q to the opposite side.",
    },
    {
      id: "segment-3",
      lab: "segment",
      title: "Far-apart viewpoints",
      instruction:
        "Make the angle at P equal to 45°. Separate P and Q by at least 10 cm on the same side of AB. Inspect Q's angle.",
      hint: "Choose the same arc, then move P and Q towards different ends of it. Their distance should be at least 10 cm.",
      target: "∠APB = 45°; same side; PQ ≥ 10 cm",
    },
  ],
  semicircle: [
    {
      id: "semicircle-1",
      lab: "semicircle",
      title: "Hunt for ninety",
      instruction: "Move A or B until the angle at P is a right angle.",
      hint: "What happens when AB passes through O?",
      target: "Find ∠APB = 90°. Inspect where AB passes.",
    },
    {
      id: "semicircle-2",
      lab: "semicircle",
      title: "Tilt the chord",
      instruction:
        "Keep the right angle at P while making AB steeply slanting.",
      hint: "Rotate the construction by about 60°. Move P too, if you like.",
      target: "A steeply slanting AB with ∠APB = 90°",
    },
    {
      id: "semicircle-3",
      lab: "semicircle",
      title: "Break the right angle",
      instruction:
        "Change AB so it is no longer a diameter and make the angle at P equal to 60°.",
      hint: "A 120° highlighted arc gives 60° at P. Check that AB is shorter than 20 cm.",
      target: "∠APB = 60°; AB is not a diameter",
    },
  ],
  "equal-arcs": [
    {
      id: "equal-arcs-1",
      lab: "equal-arcs",
      title: "Two quarter-turns",
      instruction:
        "Make both highlighted arcs correspond to 90° at O. Compare their arcs and chords.",
      hint: "Adjust A or B, then C or D, until both selected centre angles are 90°.",
      target: "Two 90° centre angles. Compare arcs and chords.",
    },
    {
      id: "equal-arcs-2",
      lab: "equal-arcs",
      title: "Ten-centimetre twins",
      instruction:
        "Make AB and CD each 10 cm long, using the shorter highlighted arcs.",
      hint: "Try centre angles of 60°. The radius is 10 cm too.",
      target: "AB = CD = 10 cm; both arcs are minor",
    },
    {
      id: "equal-arcs-3",
      lab: "equal-arcs",
      title: "Match the long way round",
      instruction: "Make both highlighted major arcs correspond to 240° at O.",
      hint: "Increase each selected arc beyond a semicircle. Match major arc with major arc.",
      target: "Two 240° centre angles. Compare the major arcs.",
    },
  ],
  ratios: [
    {
      id: "ratios-1",
      lab: "ratios",
      title: "Twice the arc",
      instruction:
        "Make arc AB twice as long as arc CD using centre angles. Check whether the chords also have ratio 2.",
      hint: "Try 120° for arc AB and 60° for arc CD. Compare the arc and chord ratios.",
      target: "Arc AB ÷ arc CD = 2. Inspect the chord ratio.",
    },
    {
      id: "ratios-2",
      lab: "ratios",
      title: "Same ratio, new viewpoint",
      instruction:
        "Switch to circumference angles and make arc AB twice as long as arc CD.",
      hint: "Use the circumference-angle switch. Each angle must face its own highlighted arc.",
      target: "Arc ratio = 2. Compare circumference angles.",
    },
    {
      id: "ratios-3",
      lab: "ratios",
      title: "Triple trouble",
      instruction:
        "Make arc AB three times as long as arc CD. Keep the smaller arc at least 40°.",
      hint: "Try 180° and 60°. Compare the arc ratio with the chord ratio again.",
      target: "Arc ratio = 3; smaller arc at least 40°.",
    },
  ],
};

export const allMissions: Mission[] = Object.values(missions).flat();
const angleTolerance = 0.6;
const lengthTolerance = 0.08;
const near = (value: number, target: number, tolerance = angleTolerance) =>
  Number.isFinite(value) && Math.abs(value - target) <= tolerance;
const side = (a: Point, b: Point, p: Point) =>
  (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

/** Numerical targets award task completion, never proof or mathematical mastery. */
export function evaluateMission(
  mission: Mission,
  parameters: Parameters,
): { complete: boolean; feedback: string } {
  const canonical = allMissions.find(
    (item) => item.id === mission.id && item.lab === mission.lab,
  );
  if (!canonical)
    return { complete: false, feedback: "Choose a Circle Lab mission." };
  const scene = getScene(mission.lab, parameters);
  const p = scene.points;
  const cm = (a: Point, b: Point) => distance(a, b) / UNIT;
  const ab = cm(p.A, p.B);
  const slant = Math.abs(p.A.y - p.B.y) / distance(p.A, p.B);
  const arcA = Math.abs(scene.arcs[0]?.sweep ?? NaN);
  const arcB = Math.abs(scene.arcs[1]?.sweep ?? NaN);
  const angleP = p.P ? angleAt(p.A, p.P, p.B) : NaN;
  let complete = false;
  switch (mission.lab) {
    case "bisector": {
      const midpoint =
        near(cm(p.A, p.N), cm(p.N, p.B), lengthTolerance) &&
        near(angleAt(p.O, p.N, p.B), 90);
      complete =
        midpoint &&
        (mission.id === "bisector-1" ||
          (mission.id === "bisector-2" ? ab > 18 : slant > 0.45));
      break;
    }
    case "chords": {
      const cd = cm(p.C, p.D);
      const equal =
        near(ab, cd, lengthTolerance) &&
        near(cm(p.O, p.M), cm(p.O, p.N), lengthTolerance);
      const cross = Math.abs(
        (p.B.x - p.A.x) * (p.D.y - p.C.y) - (p.B.y - p.A.y) * (p.D.x - p.C.x),
      );
      const differentDirections =
        cross / (distance(p.A, p.B) * distance(p.C, p.D)) > 0.45;
      complete =
        mission.id === "chords-1"
          ? equal
          : mission.id === "chords-2"
            ? ab > 18 && cd < 12
            : equal && differentDirections;
      break;
    }
    case "centre":
      complete =
        mission.id === "centre-1"
          ? near(angleP, 40) && near(arcA, 80)
          : mission.id === "centre-2"
            ? near(angleP, 120) && near(arcA, 240)
            : near(angleP, 65) &&
              near(arcA, 130) &&
              Math.abs(p.P.x - p.O.x) > RADIUS * 0.55;
      break;
    case "segment": {
      const angleQ = angleAt(p.A, p.Q, p.B);
      const sameSide = side(p.A, p.B, p.P) * side(p.A, p.B, p.Q) > 0;
      complete =
        mission.id === "segment-1"
          ? sameSide && near(angleP, 60) && near(angleQ, 60)
          : mission.id === "segment-2"
            ? !sameSide && near(angleP, 60) && near(angleQ, 120)
            : sameSide &&
              near(angleP, 45) &&
              near(angleQ, 45) &&
              cm(p.P, p.Q) >= 10;
      break;
    }
    case "semicircle": {
      const diameter =
        near(ab, (2 * RADIUS) / UNIT, lengthTolerance) && near(angleP, 90);
      complete =
        mission.id === "semicircle-1"
          ? diameter
          : mission.id === "semicircle-2"
            ? diameter && slant > 0.7
            : near(angleP, 60) && ab < 19;
      break;
    }
    case "equal-arcs": {
      const cd = cm(p.C, p.D);
      complete =
        mission.id === "equal-arcs-1"
          ? near(arcA, 90) && near(arcB, 90) && near(ab, cd, lengthTolerance)
          : mission.id === "equal-arcs-2"
            ? near(ab, 10, lengthTolerance) &&
              near(cd, 10, lengthTolerance) &&
              arcA < 180 &&
              arcB < 180
            : near(arcA, 240) &&
              near(arcB, 240) &&
              near(ab, cd, lengthTolerance);
      break;
    }
    case "ratios": {
      const ratio = arcA / arcB;
      const circumferenceMode = Boolean(p.P && p.Q);
      complete =
        mission.id === "ratios-1"
          ? !circumferenceMode && near(ratio, 2, 0.015)
          : mission.id === "ratios-2"
            ? circumferenceMode &&
              near(ratio, 2, 0.015) &&
              near(angleP / angleAt(p.C, p.Q, p.D), 2, 0.015)
            : near(ratio, 3, 0.015) && arcB >= 40;
      break;
    }
  }
  return {
    complete,
    feedback: complete
      ? "Target reached within the drag tolerance. Compare the measurements, then try a new position."
      : canonical.hint,
  };
}
