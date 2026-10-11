import { copy } from "@/lib/copy";
import { useState } from "react";
import { format, type Row } from "./statistics";
import { interval } from "./Chart";
import s from "./lab.module.css";
const c = copy.statisticalCharts;
function FrequencyInput({
  value,
  maximum,
  label,
  onChange,
  onSelect,
}: {
  value: number;
  maximum: number;
  label: string;
  onChange: (value: number) => void;
  onSelect: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const valid = (text: string) => /^\d+$/.test(text) && Number(text) <= maximum;
  const invalid = draft !== null && !valid(draft);
  return (
    <>
      <input
        className={s.frequencyInput}
        type="number"
        min={0}
        max={maximum}
        step={1}
        aria-label={label}
        aria-invalid={invalid}
        value={draft ?? value}
        onFocus={onSelect}
        onChange={(e) => {
          const text = e.target.value;
          setDraft(text);
          if (valid(text)) onChange(Number(text));
        }}
        onBlur={() => setDraft(null)}
      />
      {invalid && (
        <span className={s.frequencyError} role="status">
          {c.frequencyInputHelp}
        </span>
      )}
    </>
  );
}
export function FrequencyTable({
  rows,
  full,
  continuous,
  selected,
  onSelect,
  onFrequencyChange,
}: {
  rows: Row[];
  full: boolean;
  continuous: boolean;
  selected: number | null;
  onSelect: (i: number) => void;
  onFrequencyChange?: (i: number, frequency: number) => void;
}) {
  return (
    <div className={s.tableScroll}>
      <table className={s.table}>
        <caption>{c.table}</caption>
        <thead>
          <tr>
            <th>{c.interval}</th>
            {full && (
              <>
                <th>{c.lower}</th>
                <th>{c.upper}</th>
                <th>{c.lowerBoundary}</th>
                <th>{c.upperBoundary}</th>
                <th>{c.mark}</th>
                <th>{c.width}</th>
              </>
            )}
            <th>{c.frequency}</th>
            <th>{c.cumulative}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              data-selected={selected === i}
              onPointerEnter={() => onSelect(i)}
            >
              <td>
                <button
                  aria-pressed={selected === i}
                  onClick={() => onSelect(i)}
                  onFocus={() => onSelect(i)}
                >
                  {interval(r, continuous)}
                </button>
              </td>
              {full && (
                <>
                  {[r.lower, r.upper, r.low, r.high, r.mark, r.width].map(
                    (n, j) => (
                      <td key={j}>{format(n)}</td>
                    ),
                  )}
                </>
              )}
              <td>
                {onFrequencyChange ? (
                  <FrequencyInput
                    value={r.frequency}
                    maximum={1e6 - (rows.at(-1)!.cumulative - r.frequency)}
                    label={`${c.frequency}: ${interval(r, continuous)}`}
                    onChange={(frequency) => onFrequencyChange(i, frequency)}
                    onSelect={() => onSelect(i)}
                  />
                ) : (
                  r.frequency
                )}
              </td>
              <td>{r.cumulative}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={full ? 7 : 1}>{c.total}</th>
            <td>{rows.at(-1)?.cumulative ?? 0}</td>
            <td>{rows.at(-1)?.cumulative ?? 0}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
