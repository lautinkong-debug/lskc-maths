import { MathSvgText } from "./MathText";
import { placeDiagramLabel } from "./diagramLayout";
import { FLOW_CENTRE as O } from "./reasonExploration";
import { reasonTextBox, type ReasonFlowModel } from "./reasonFlow";

export const proofLineHints: Record<string, string> = {
  r3: "OA and OB are equal radii.",
  r4: "OA and OC are the hypotenuses of the two right triangles.",
  r5: "Compare the right triangles OMA and ONC.",
  r6: "Follow PO through O to the opposite point on the circle.",
  r7: "Join O to A and B. Trace the centre angle on the arc intercepted by both circumference angles.",
  r8: "Trace the half-turn from OA to OB on the semicircle opposite C.",
  r9: "The centre angle on the semicircle opposite C is a half-turn.",
  r17: "Follow OA and OB for the first arc, then OC and OD for the second.",
};

/** The grey construction remains underneath the theorem's coloured marks and handles. */
export default function ReasonProofLines({
  reasonId,
  model,
}: {
  reasonId: string;
  model: ReasonFlowModel;
}) {
  const p = model.points;
  const endpoints =
    reasonId === "r4" || reasonId === "r5"
      ? [p.A, p.C]
      : reasonId === "r6"
        ? [p.P, { x: 2 * O.x - p.P.x, y: 2 * O.y - p.P.y }]
        : reasonId === "r17"
          ? [p.A, p.B, p.C, p.D]
          : [p.A, p.B];
  const halfTurn = reasonId === "r8" || reasonId === "r9";
  // Their diameter already displays OA and OB. Use the semicircle which excludes C.
  const across =
    halfTurn &&
    (p.A.x - O.x) * (p.C.y - O.y) - (p.A.y - O.y) * (p.C.x - O.x) < 0;
  const onArm = (v: { x: number; y: number }) => {
    const scale = 27 / Math.hypot(v.x - O.x, v.y - O.y);
    return `${O.x + scale * (v.x - O.x)} ${O.y + scale * (v.y - O.y)}`;
  };
  const centreWasHidden = !p.O;
  const centreLabel = centreWasHidden
    ? placeDiagramLabel(
        { x: O.x + 18, y: O.y + 12, width: 24, height: 26 },
        model.marks.flatMap((mark) =>
          mark.kind === "text" ? [reasonTextBox(mark)] : [],
        ),
        { left: 4, right: 416, top: 4, bottom: 356 },
      )
    : null;
  return (
    <g
      data-proof-guide={reasonId}
      pointerEvents="none"
      stroke="#4f506f"
      strokeWidth="2.2"
      fill="none"
    >
      <title>{proofLineHints[reasonId]}</title>
      {halfTurn ? (
        <path
          d={`M ${onArm(p.A)} A 27 27 0 0 ${across ? 1 : 0} ${onArm(p.B)}`}
          strokeDasharray="4 3"
        />
      ) : (
        endpoints.map((end, i) => (
          <line
            key={i}
            x1={O.x}
            y1={O.y}
            x2={end.x}
            y2={end.y}
            strokeDasharray="6 4"
          />
        ))
      )}
      {centreLabel && (
        <>
          <circle cx={O.x} cy={O.y} r="3" stroke="none" fill="#4f506f" />
          <MathSvgText
            x={centreLabel.x}
            y={centreLabel.y + 6}
            textAnchor="middle"
            fontSize={21}
            fill="#4f506f"
            stroke="#fff"
            strokeWidth={3}
            style={{ paintOrder: "stroke" }}
          >
            O
          </MathSvgText>
        </>
      )}
    </g>
  );
}
