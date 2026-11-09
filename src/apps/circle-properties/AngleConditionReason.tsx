import { useState } from "react";
import { type LabId } from "./content";
import { normalise, type Parameters } from "./geometry";
import MathText from "./MathText";
import ReasonEvidencePanel from "./ReasonEvidencePanel";
import s from "./conditions.module.css";

/** Read the actual construction: a missing given must not earn a theorem. */
export default function AngleConditionReason({
  lab,
  parameters,
}: {
  lab: LabId;
  parameters: Parameters;
}) {
  const [revealed, setRevealed] = useState(false);
  const p = normalise(lab, parameters);
  let reasonId: string, given: string, conclusion: string, hint: string;
  let missing: string | undefined;
  if (lab === "centre") {
    reasonId = "r6";
    const sweep = p.alternate ? 360 - p.primary : p.primary;
    given =
      "O is the centre. The angle at P and the marked turn at O stand on the same arc AB.";
    conclusion = (sweep > 180 ? "Reflex ∠AOB" : "∠AOB") + " = 2 × ∠APB.";
    hint =
      "Trace the arc from A to B that does not contain P. Use the turn at O facing that arc.";
  } else if (lab === "segment") {
    reasonId = "r7";
    given = "P and Q are on the circumference, on the same side of chord AB.";
    conclusion = "∠APB = ∠AQB.";
    hint = "Trace both angles back to the same endpoints A and B.";
    if (p.alternate)
      missing =
        "P and Q are on opposite sides of AB. The same-segment reason does not apply. Move Q back to the same side as P.";
    else if (Math.abs(p.tertiary - p.secondary) < 1e-8)
      missing =
        "P and Q coincide. Move one point along the arc to compare two distinct vertices.";
  } else {
    reasonId = "r8";
    given = "AB passes through the centre O and P lies on the circumference.";
    conclusion = "∠APB = 90°.";
    hint = "AB is the diameter. The right angle is at P, opposite AB.";
    if (Math.abs(p.primary - 180) > 1e-8)
      missing =
        "AB misses the centre O, so it is not a diameter. Make AB a diameter to use the angle in a semi-circle.";
  }
  return missing ? (
    <aside className={s.chordReason} aria-label="Check the condition">
      <h3>Check the condition</h3>
      <p>
        <MathText>{missing}</MathText>
      </p>
    </aside>
  ) : (
    <ReasonEvidencePanel
      reasonId={reasonId}
      revealed={revealed}
      given={given}
      conclusion={conclusion}
      hint={hint}
      onToggle={() => setRevealed((v) => !v)}
    />
  );
}
