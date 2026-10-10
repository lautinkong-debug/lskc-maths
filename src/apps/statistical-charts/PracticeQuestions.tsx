import { useRef, useState } from "react";
import { useAnswers } from "./answers";
import { useProgressState, validInteger, validBoolean } from "./progress";
import { copy } from "@/lib/copy";
import { Field } from "./Editors";
import { interval } from "./Chart";
import { ConstructionGraph } from "./ConstructionGraph";
import {
  GivenTable,
  ScalarExercise,
  type ActivityProps,
} from "./LearningSteps";
import {
  expectedConnection,
  gradeConstruction,
  numberAnswer,
  practiceScaffold,
  targets,
  type Connection,
  type DraftItem,
  type Grade,
} from "./learning";
import s from "./lab.module.css";
const c = copy.statisticalCharts,
  l = c.learning;

function Construct({
  rows,
  type,
  title,
  axisLabel,
  precision,
  level,
}: ActivityProps & { level: number }) {
  const allowAnswers = useAnswers();
  const histogram = type === "histogram";
  const initial = () =>
    practiceScaffold(rows, type, level).map((p) => ({
      ...p,
      classIndex: histogram
        ? rows.findIndex((r) => r.low === Number(p.x))
        : undefined,
    }));
  const [draft, setDraft] = useProgressState<DraftItem[]>(
      `draft-${level}`,
      initial,
      (v): v is DraftItem[] =>
        Array.isArray(v) &&
        v.length <= targets(rows, type).length + 3 &&
        new Set(v.map((p) => p?.id)).size === v.length &&
        v.every(
          (p) =>
            p &&
            Number.isInteger(p.id) &&
            p.id >= 0 &&
            p.id < 1e7 &&
            [p.x, p.y, p.end].every(
              (x) => typeof x === "string" && x.length <= 80,
            ) &&
            (!p.given ||
              initial().some(
                (g) =>
                  g.given &&
                  g.id === p.id &&
                  g.x === p.x &&
                  g.y === p.y &&
                  g.end === p.end,
              )) &&
            (p.classIndex === undefined ||
              (Number.isInteger(p.classIndex) &&
                p.classIndex >= 0 &&
                p.classIndex < rows.length)),
        ) &&
        initial()
          .filter((g) => g.given)
          .every((g) =>
            v.some(
              (p) =>
                p.given &&
                p.id === g.id &&
                p.x === g.x &&
                p.y === g.y &&
                p.end === g.end,
            ),
          ),
    ),
    [connection, setConnection] = useProgressState<Connection>(
      `connection-${level}`,
      "none",
      (v): v is Connection =>
        ["none", "straight", "smooth"].includes(v as string),
    ),
    [selected, setSelected] = useState(-1),
    [barIndex, setBarIndex] = useState(
      level === 2 ? Math.min(1, rows.length - 1) : 0,
    );
  const [grade, setGrade] = useState<Grade | null>(null),
    [attempted, setAttempted] = useProgressState(
      `construction-attempted-${level}`,
      false,
      validBoolean,
    ),
    [reveal, setReveal] = useState(false),
    [hint, setHint] = useState(false);
  const nextId = useRef(Math.max(100, ...draft.map((p) => p.id + 1)));
  const all = targets(rows, type),
    limit = all.length + 3;
  function update(next: DraftItem[]) {
    setDraft(next);
    setGrade(null);
    setReveal(false);
  }
  function add(x?: number, y?: number) {
    if (histogram) {
      const existing = draft.findIndex((p) => p.classIndex === barIndex);
      if (existing >= 0) {
        if (!draft[existing].given && y !== undefined)
          update(
            draft.map((p, i) => (i === existing ? { ...p, y: String(y) } : p)),
          );
        setSelected(existing);
        return;
      }
      if (draft.length >= limit) return;
      update([
        ...draft,
        {
          id: nextId.current++,
          classIndex: barIndex,
          x: level === 2 ? String(rows[barIndex].low) : "",
          end: level === 2 ? String(rows[barIndex].high) : "",
          y: y === undefined ? "" : String(y),
        },
      ]);
    } else {
      if (draft.length >= limit) return;
      update([
        ...draft,
        {
          id: nextId.current++,
          x: x === undefined ? "" : String(x),
          y: y === undefined ? "" : String(y),
          end: "",
        },
      ]);
    }
    setSelected(draft.length);
  }
  function reset() {
    setDraft(initial());
    setConnection("none");
    setSelected(-1);
    setGrade(null);
    setAttempted(false);
    setReveal(false);
    setHint(false);
  }
  const plotted = draft.map((p) => ({
    x: numberAnswer(p.x) ?? NaN,
    y: numberAnswer(p.y) ?? NaN,
    ...(histogram ? { end: numberAnswer(p.end) ?? NaN } : {}),
  }));
  return (
    <>
      <p className={s.chartNote}>{histogram ? l.barHelp : l.coordinateHelp}</p>
      {(type === "curve" || type === "cumulativeCurve") && (
        <p className={s.small}>{l.curvePractice}</p>
      )}
      {histogram && (
        <Field label={l.chooseBar}>
          <select
            value={barIndex}
            onChange={(e) => setBarIndex(Number(e.target.value))}
          >
            {rows.map((r, i) => (
              <option
                key={i}
                value={i}
                disabled={draft.some((p) => p.given && p.classIndex === i)}
              >
                {interval(r, precision === 0)}
              </option>
            ))}
          </select>
        </Field>
      )}
      <ConstructionGraph
        rows={rows}
        type={type}
        title={title}
        axisLabel={axisLabel}
        precision={precision}
        items={plotted}
        connection={connection}
        selected={selected}
        onSelect={setSelected}
        onPlace={add}
      />
      {!draft.length && <p className={s.small}>{l.noPoints}</p>}
      <div className={s.toolbar}>
        <button disabled={draft.length >= limit} onClick={() => add()}>
          {histogram ? l.addBar : l.addPoint}
        </button>
        <button
          disabled={!draft.some((p) => !p.given)}
          onClick={() => {
            const last = draft.findLastIndex((p) => !p.given);
            update(draft.filter((_, i) => i !== last));
            setSelected(-1);
          }}
        >
          {l.undo}
        </button>
      </div>
      <div className={s.draftList}>
        {draft.map((p, i) => (
          <fieldset
            key={p.id}
            className={s.editRow}
            data-active={selected === i}
          >
            <legend>
              {histogram ? l.bar : l.point} {i + 1}
              {p.given ? ` · ${l.given}` : ""}
              {histogram && p.classIndex !== undefined
                ? ` · ${interval(rows[p.classIndex], precision === 0)}`
                : ""}
            </legend>
            <div className={s.draftFields}>
              {(
                ["x", ...(histogram ? (["end"] as const) : []), "y"] as const
              ).map((key) => (
                <Field
                  key={key}
                  label={`${key === "x" ? (histogram ? c.lowerBoundary : l.x) : key === "end" ? c.upperBoundary : l.y} ${i + 1}`}
                >
                  <input
                    disabled={
                      p.given || (level === 2 && histogram && key !== "y")
                    }
                    inputMode="decimal"
                    value={p[key]}
                    onFocus={() => setSelected(i)}
                    onChange={(e) =>
                      update(
                        draft.map((old, j) =>
                          i === j ? { ...old, [key]: e.target.value } : old,
                        ),
                      )
                    }
                  />
                </Field>
              ))}
              {!p.given && (
                <button
                  aria-label={`${l.remove} ${i + 1}`}
                  onClick={() => {
                    update(draft.filter((_, j) => j !== i));
                    setSelected(-1);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </fieldset>
        ))}
      </div>
      {!histogram && (
        <Field label={l.connection}>
          <select
            value={connection}
            onChange={(e) => {
              setConnection(e.target.value as Connection);
              setGrade(null);
              setReveal(false);
            }}
          >
            {(["none", "straight", "smooth"] as const).map((k) => (
              <option key={k} value={k}>
                {l.connections[k]}
              </option>
            ))}
          </select>
        </Field>
      )}
      <div className={s.lessonActions}>
        <button
          className={s.primaryAction}
          onClick={() => {
            setGrade(gradeConstruction(rows, type, draft, connection));
            setAttempted(true);
          }}
        >
          {l.submit}
        </button>
        <button onClick={() => setHint(!hint)} aria-expanded={hint}>
          {l.hint}
        </button>
        <button
          disabled={!allowAnswers || !attempted}
          onClick={() => setReveal(!reveal)}
        >
          {reveal ? l.hideSolution : l.reveal}
        </button>
        <button onClick={reset}>{l.reset}</button>
      </div>
      {hint && (
        <p className={s.chartNote}>
          {histogram
            ? l.hintHistogram
            : type.startsWith("cumulative")
              ? l.hintCumulative
              : l.hintFrequency}
        </p>
      )}
      {!attempted && <p className={s.small}>{l.revealFirst}</p>}
      {grade && (
        <div role="status" className={grade.correct ? s.success : s.error}>
          <strong>{l.submitted}</strong>
          <p>{l.feedback[grade.code]}</p>
          <p>
            {l.matched}: {grade.matched} / {grade.total}
          </p>
        </div>
      )}
      {allowAnswers && reveal && (
        <section className={s.worked}>
          <h4>{l.solution}</h4>
          <ConstructionGraph
            rows={rows}
            type={type}
            title={title}
            axisLabel={axisLabel}
            precision={precision}
            items={all}
            connection={expectedConnection(type)}
            model
            showCoordinates
          />
          <button onClick={reset}>{l.retry}</button>
        </section>
      )}
    </>
  );
}
export function PracticeQuestions(props: ActivityProps) {
  const [level, setLevel] = useProgressState(
    "practice-level",
    props.initialLevel ?? 1,
    validInteger(1, 3),
  );
  return (
    <section className={s.activity} aria-label={l.practice}>
      <div className={s.sectionHeader}>
        <h3>{l.practice}</h3>
        <Field label={l.difficulty}>
          <select
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            {l.levels.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <p className={s.lessonText}>
        {level === 1
          ? l.guidedText
          : level === 2
            ? l.partialText
            : l.independentText}
      </p>
      <p className={s.small}>{l.draftReset}</p>
      <div className={s.learningLayout}>
        <aside className={s.lessonAside}>
          <h4>{l.sourceTable}</h4>
          <GivenTable rows={props.rows} precision={props.precision} />
        </aside>
        <div className={s.lessonBody}>
          {level === 1 ? (
            <ScalarExercise
              key="guided"
              rows={props.rows}
              precision={props.precision}
              requireAttempt
            />
          ) : (
            <Construct key={level} {...props} level={level} />
          )}
        </div>
      </div>
    </section>
  );
}
