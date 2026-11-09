import { circleReviewCopy as copy } from "@/lib/copy";
import { reasons } from "./content";
import MathText from "./MathText";
import ReasonLabel from "./ReasonLabel";
import type { ReasonParameters } from "./reasonExploration";
import { reasonFlow, reasonResultFact } from "./reasonFlow";
import { reasonWorking } from "./reasonWorkingData";
import s from "./reason-evidence.module.css";

/** Each chord reason starts from a different set of diagram marks. */
const chordHints: Record<string, string> = {
  r1: "The square marks the given right angle. The matching ticks show that N is the mid-point.",
  r2: "The centre is given. The two ticks mark the given mid-point. The new square at N shows what you proved.",
  r3: "The ticks and the right-angle square are both given. The new centre mark shows where O must lie.",
};

type Props = {
  reasonId: string;
  parameters?: ReasonParameters;
  revealed: boolean;
  given?: string;
  conclusion?: string;
  hint?: string;
  onToggle?: () => void;
  onCompare?: () => void;
};

export default function ReasonEvidencePanel({
  reasonId,
  parameters,
  revealed,
  given,
  conclusion,
  hint,
  onToggle,
  onCompare,
}: Props) {
  const reason = reasons.find((item) => item.id === reasonId)!;
  const flow = reasonFlow[reasonId];
  const result =
    conclusion ??
    (reasonId === "r6" && parameters
      ? reasonResultFact(reasonId, parameters)
      : reasonWorking[reasonId].conclusion);
  return (
    <aside
      className={s.panel}
      aria-label={copy.writtenProof}
      data-evidence-for={reasonId}
    >
      <section className={s.given} data-proof-stage="given">
        <h4>
          <span aria-hidden="true">∵</span> Given
        </h4>
        <p>
          <MathText>{given ?? flow.startingFact}</MathText>
        </p>
      </section>
      {revealed ? (
        <>
          <section className={s.conclusion} data-proof-stage="conclusion">
            <h4>
              <span aria-hidden="true">∴</span> Conclusion
            </h4>
            <p>
              <MathText>{result}</MathText>
            </p>
          </section>
          <section className={s.reason} data-proof-stage="reason">
            <h4>{copy.reason(reason.number)}</h4>
            <p className={s.label}>
              <ReasonLabel reason={reason} arrow={false} />
            </p>
            <p className={s.hint}>
              <MathText>
                {hint ?? chordHints[reasonId] ?? flow.contrast}
              </MathText>
            </p>
          </section>
          {(onToggle || onCompare) && (
            <div className={s.actions}>
              {onToggle && (
                <button type="button" onClick={onToggle}>
                  Replay from the givens
                </button>
              )}
              {onCompare && (
                <button type="button" onClick={onCompare}>
                  Compare with {reasonId === "r2" ? "16.3" : "16.2"}
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        onToggle && (
          <section className={s.predict}>
            <h4>What can you conclude?</h4>
            <p>Drag a point. Which new fact stays true?</p>
            <button type="button" onClick={onToggle}>
              Reveal the conclusion
            </button>
          </section>
        )
      )}
    </aside>
  );
}
