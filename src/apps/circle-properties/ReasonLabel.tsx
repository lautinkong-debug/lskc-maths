import type { ReactNode } from "react";
import { reasonParts, type Reason } from "./content";
import MathText from "./MathText";
import s from "./reason-label.module.css";

/** Highlighter pen: blue for what must be given, green for what you then get. */
export function Highlight({
  kind,
  children,
}: {
  kind: "given" | "get";
  children: ReactNode;
}) {
  return <mark className={s[kind]}>{children}</mark>;
}

/**
 * A reason split into its condition and its result, so students can memorise
 * the two halves. Worked solutions drop the arrow: the words stay as written.
 */
export default function ReasonLabel({
  reason,
  arrow = true,
}: {
  reason: Reason;
  arrow?: boolean;
}) {
  const parts = reasonParts(reason);
  if (!parts) return <MathText>{reason.label}</MathText>;
  return (
    <>
      <Highlight kind="given">
        <MathText>
          {arrow ? parts.condition.replace(/,$/, "") : parts.condition}
        </MathText>
      </Highlight>{" "}
      {arrow && (
        <>
          <span className={s.arrow} aria-hidden="true">
            →
          </span>{" "}
        </>
      )}
      <Highlight kind="get">
        <MathText>{parts.result}</MathText>
      </Highlight>
    </>
  );
}
