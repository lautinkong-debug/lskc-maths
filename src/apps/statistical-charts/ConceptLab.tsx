import { useState } from "react";
import { copy } from "@/lib/copy";
import { Chart, defaultDisplay } from "./Chart";
import { FrequencyTable } from "./FrequencyTable";
import { useAnswers } from "./answers";
import {
  ageExamples,
  ageRows,
  conceptRows,
  cumulativeExamples,
  histogramChoices,
  stemLeaves,
} from "./concepts";
import { curvePath, frequencyPoints, type Row } from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts.concepts;
const shapes = [
  [1, 2, 4, 8, 3],
  [1, 4, 8, 4, 1],
  [3, 8, 4, 2, 1],
  [1, 7, 2, 7, 1],
];
function MiniChart({
  frequencies,
  curve,
  peak,
}: {
  frequencies: number[];
  curve: boolean;
  peak?: number;
}) {
  const rows = conceptRows(frequencies),
    points = frequencyPoints(rows);
  const min = curve ? points[0].x : rows[0].low,
    max = curve ? points.at(-1)!.x : rows.at(-1)!.high;
  const x = (v: number) => 28 + ((v - min) / (max - min)) * 208;
  const top = peak ?? Math.max(1, ...frequencies);
  const y = (v: number) => 120 - (v / top) * 96;
  return (
    <svg viewBox="0 0 260 156" aria-hidden="true">
      <path d="M28 16V120H244" fill="none" stroke="#263645" />
      {!curve && (
        <>
          <text x="24" y="28" textAnchor="end" fontSize="10">
            {top}
          </text>
          <text x="24" y="124" textAnchor="end" fontSize="10">
            0
          </text>
        </>
      )}
      {curve ? (
        <path
          d={curvePath(points, x, y)}
          fill="none"
          stroke="#0f4574"
          strokeWidth="3"
        />
      ) : (
        rows.map((r, i) => (
          <rect
            key={i}
            x={x(r.low)}
            y={y(r.frequency)}
            width={x(r.high) - x(r.low)}
            height={120 - y(r.frequency)}
            fill="#b7cddd"
            stroke="#0f4574"
          />
        ))
      )}
      <text x="134" y="148" textAnchor="middle" fontSize="13">
        {c.value}
      </text>
      <text
        transform="translate(13 70) rotate(-90)"
        textAnchor="middle"
        fontSize="12"
      >
        {copy.statisticalCharts.frequency}
      </text>
    </svg>
  );
}
export function ConceptLab({
  kind,
  rows,
  raw,
  fixed,
  onLesson,
  onRaw,
  onFrequency,
}: {
  kind: "raw" | "grouped";
  rows: Row[];
  raw: number[];
  fixed: boolean;
  onLesson: (kind: "raw" | "grouped", example: number) => void;
  onRaw: (values: number[]) => void;
  onFrequency: (i: number, value: number) => void;
}) {
  const [selected, setSelected] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [revealed, setRevealed] = useState(false),
    [example, setExample] = useState(0);
  const [draft, setDraft] = useState<string | null>(null),
    [error, setError] = useState(false);
  const answers = useAnswers(),
    visible = revealed && answers;
  const stem = kind === "raw",
    data = stem ? ageRows(raw) : rows;
  const known = ageExamples.findIndex(
    (v) =>
      [...v].sort((a, b) => a - b).join() ===
      [...raw].sort((a, b) => a - b).join(),
  );
  const correct = stem ? [0, 2, 1, 3][known] : 1;
  const options = stem ? shapes : histogramChoices(data);
  const active = data[Math.min(selected, data.length - 1)];
  function reset() {
    setChoice(null);
    setRevealed(false);
    setSelected(0);
    setDraft(null);
    setError(false);
  }
  function load(nextKind: "raw" | "grouped", next: number) {
    reset();
    setExample(next);
    onLesson(nextKind, next);
  }
  if (!data.length)
    return (
      <section className={s.concepts}>
        <p>{c.ageError}</p>
        <button disabled={fixed} onClick={() => load("raw", 0)}>
          {c.stemTab}
        </button>
        <button disabled={fixed} onClick={() => load("grouped", 0)}>
          {c.cumulativeTab}
        </button>
      </section>
    );
  return (
    <section className={s.concepts} aria-label={c.title}>
      <div className={s.activityHeader}>
        <div>
          <p className={s.chapter}>{c.eyebrow}</p>
          <h3>{c.title}</h3>
        </div>
        <div className={s.lessonActions}>
          <button
            disabled={fixed}
            aria-pressed={stem}
            onClick={() => load("raw", 0)}
          >
            {c.stemTab}
          </button>
          <button
            disabled={fixed}
            aria-pressed={!stem}
            onClick={() => load("grouped", 0)}
          >
            {c.cumulativeTab}
          </button>
          <button
            disabled={fixed}
            onClick={() =>
              load(
                kind,
                (example + 1) %
                  (stem ? ageExamples.length : cumulativeExamples.length),
              )
            }
          >
            {c.next}
          </button>
        </div>
      </div>
      <p>{stem ? c.stemIntro : c.cumulativeIntro}</p>
      <div className={s.conceptGrid}>
        <section className={s.conceptCard}>
          <h4>{stem ? c.ages : c.cumulativeTab}</h4>
          {stem ? (
            <>
              <table className={s.stemTable}>
                <caption>{c.key}</caption>
                <thead>
                  <tr>
                    <th>{c.stem}</th>
                    <th>{c.leaf}</th>
                    {visible && <th>{copy.statisticalCharts.frequency}</th>}
                  </tr>
                </thead>
                <tbody>
                  {stemLeaves(raw).map(({ stem: tens, leaves }, i) => (
                    <tr
                      key={tens}
                      data-selected={selected === i}
                      onPointerEnter={() => setSelected(i)}
                    >
                      <th>
                        <button
                          onClick={() => setSelected(i)}
                          aria-pressed={selected === i}
                        >
                          {tens}
                        </button>
                      </th>
                      <td>{leaves.join("   ") || "—"}</td>
                      {visible && <td>{leaves.length}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              <details>
                <summary>{c.editAges}</summary>
                <label>
                  {c.ages}
                  <textarea
                    disabled={fixed}
                    value={draft ?? raw.join(", ")}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                </label>
                <button
                  disabled={fixed}
                  onClick={() => {
                    const tokens = (draft ?? raw.join(","))
                        .trim()
                        .split(/[\s,;]+/),
                      values = tokens.map(Number);
                    if (
                      !values.length ||
                      values.length > 100 ||
                      values.some(
                        (v) => !Number.isInteger(v) || v < 20 || v > 59,
                      )
                    ) {
                      setError(true);
                      return;
                    }
                    onRaw(values);
                    reset();
                  }}
                >
                  {c.applyAges}
                </button>
                {error && <p role="alert">{c.ageError}</p>}
              </details>
            </>
          ) : (
            <Chart
              rows={data}
              type="cumulativePolygon"
              title={c.cumulativeTab}
              axisLabel={c.value}
              display={{ ...defaultDisplay, boundaries: true, marks: false }}
              selected={selected}
              onSelect={setSelected}
            />
          )}
        </section>
        <section className={s.conceptCard}>
          <h4>{stem ? c.shapeQuestion : c.histogramQuestion}</h4>
          <div className={s.conceptOptions}>
            {options.map((frequencies, i) => (
              <button
                key={i}
                aria-label={`${c.option} ${"ABCD"[i]}${stem ? `: ${c.shapes[i]}` : `: ${frequencies.join(", ")}`}`}
                aria-pressed={choice === i}
                onClick={() => {
                  setChoice(i);
                  setRevealed(false);
                }}
              >
                <strong>{"ABCD"[i]}</strong>
                <MiniChart
                  frequencies={frequencies}
                  curve={stem}
                  peak={stem ? undefined : Math.max(1, ...options.flat())}
                />
                {stem && <span>{c.shapes[i]}</span>}
              </button>
            ))}
          </div>
          <button
            disabled={!answers || choice === null}
            onClick={() => setRevealed(true)}
          >
            {c.check}
          </button>
          <div aria-live="polite">
            {visible && (
              <p className={s.scaleNote}>
                {choice === null
                  ? c.editingEvidence
                  : correct === undefined
                    ? c.customShape
                    : choice === correct
                      ? c.correct
                      : c.tryAgain}{" "}
                {stem ? c.tailRule : c.riseRule}
              </p>
            )}
          </div>
        </section>
      </div>
      {visible && (
        <section className={s.conceptCard} data-testid="concept-explanation">
          <h4>{c.explain}</h4>
          <div className={s.conceptGrid}>
            <div>
              <p>{stem ? c.countLeaves : c.riseRule}</p>
              {!stem && active && (
                <p className={s.conceptEquation}>
                  {active.cumulative} −{" "}
                  {data[Math.min(selected, data.length - 1) - 1]?.cumulative ??
                    0}{" "}
                  = <strong>{active.frequency}</strong>
                </p>
              )}
              <FrequencyTable
                rows={data}
                full={false}
                continuous={!stem}
                selected={selected}
                onSelect={setSelected}
                onFrequencyChange={
                  !stem && !fixed
                    ? (i, v) => {
                        onFrequency(i, v);
                        setChoice(null);
                      }
                    : undefined
                }
              />
              <p>{stem ? c.shapeCaution : c.flatRule}</p>
              {!stem && <p>{c.equalRise}</p>}
            </div>
            <Chart
              rows={data}
              type={stem ? "curve" : "histogram"}
              title={stem ? c.ages : c.recovered}
              axisLabel={stem ? c.age : c.value}
              display={{
                ...defaultDisplay,
                boundaries: true,
                marks: false,
                overlay: stem,
              }}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </section>
      )}
    </section>
  );
}
