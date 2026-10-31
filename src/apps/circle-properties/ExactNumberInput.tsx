"use client";

import { useId, useState } from "react";

/** An unfinished or invalid entry cancels rather than silently becoming zero. */
export function readExactNumber(draft: string, min: number, max: number) {
  if (!draft.trim()) return undefined;
  const value = Number(draft);
  return Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : undefined;
}

/** Match a number field's step grid, including typed values between steps. */
export function stepExactNumber(
  value: number,
  min: number,
  max: number,
  step: number,
  direction: 1 | -1,
) {
  const position = (value - min) / step;
  const index =
    direction === 1
      ? Math.floor(position + 1e-9) + 1
      : Math.ceil(position - 1e-9) - 1;
  const next = Number((min + index * step).toPrecision(12));
  return Math.max(min, Math.min(max, next));
}

/** Keep edits local until committed, so typing 60 can pass through 6 safely. */
export default function ExactNumberInput({
  value,
  min,
  max,
  step,
  label,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const instructionsId = useId();
  const instructions =
    "Type a value, then press Enter or leave the field to apply. Escape cancels. Arrow keys change by one step.";

  function commit() {
    if (draft !== null) {
      const next = readExactNumber(draft, min, max);
      if (next !== undefined) onCommit(next);
    }
    setDraft(null);
  }

  return (
    <>
      <input
        type="number"
        inputMode="decimal"
        aria-label={label}
        aria-describedby={instructionsId}
        title={instructions}
        min={min}
        max={max}
        step={step}
        value={draft ?? Number(value.toFixed(2)).toString()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            event.preventDefault();
            setDraft(null);
          } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            const base =
              draft === null
                ? value
                : (readExactNumber(draft, min, max) ?? value);
            onCommit(
              stepExactNumber(
                base,
                min,
                max,
                step,
                event.key === "ArrowUp" ? 1 : -1,
              ),
            );
            setDraft(null);
          }
        }}
      />
      <span id={instructionsId} hidden style={{ display: "none" }}>
        {instructions}
      </span>
    </>
  );
}
