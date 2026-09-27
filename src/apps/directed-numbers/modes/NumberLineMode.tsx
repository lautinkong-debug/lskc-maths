import { useState } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { signed } from "../lib/moves";
import {
  comparisonRule,
  moveItem,
  orderMistake,
  orderSets,
  type Point,
} from "../lib/points";
import { PointLine } from "../components/PointLine";
import { button, field, primary } from "../components/ui";
import { usePrediction } from "../components/usePrediction";
import { lessonKey } from "../components/LessonKeys";
const c = copy.apps.directedNumbers,
  p = c.numberLesson;
export default function NumberLineMode() {
  const [orderView, setOrderView] = useState(false);
  const presenting = usePresentation(),
    [predict, setPredict] = usePrediction(presenting);
  const [points, setPoints] = useState<Point[]>([
      { id: "A", value: -4 },
      { id: "B", value: -2 },
      { id: "C", value: 3 },
    ]),
    [selected, setSelected] = useState("A");
  const [input, setInput] = useState("-4"),
    [error, setError] = useState(""),
    [opposites, setOpposites] = useState(false),
    [vertical, setVertical] = useState(false),
    [skin, setSkin] = useState<"plain" | "thermometer" | "lift">("plain");
  const [first, setFirst] = useState("A"),
    [second, setSecond] = useState("B"),
    [revealed, setRevealed] = useState(false),
    [comparisonNote, setComparisonNote] = useState("");
  const [exercise, setExercise] = useState(0),
    [count, setCount] = useState(4),
    [ascending, setAscending] = useState(true),
    [order, setOrder] = useState(orderSets[0].slice(0, 4)),
    [orderNote, setOrderNote] = useState(""),
    [dragged, setDragged] = useState<number | null>(null);
  const active = points.find((v) => v.id === selected)!,
    a = points.find((v) => v.id === first)!.value,
    b = points.find((v) => v.id === second)!.value;
  const relation = a === b ? "=" : a > b ? ">" : "<",
    show = !predict || revealed;
  const rule = p[comparisonRule(a, b)];
  function select(id: string) {
    setSelected(id);
    setInput(String(points.find((v) => v.id === id)!.value));
    setError("");
  }
  function move(id: string, value: number) {
    setPoints(points.map((v) => (v.id === id ? { ...v, value } : v)));
    setSelected(id);
    setInput(String(value));
    setError("");
    setRevealed(false);
    setComparisonNote("");
  }
  function apply() {
    const value = Number(input.replace(/[−–]/g, "-"));
    if (
      !/^[+−–-]?\d+$/.test(input.trim()) ||
      !Number.isInteger(value) ||
      Math.abs(value) > 100
    ) {
      setError(p.range);
      return;
    }
    move(selected, value);
  }
  function addPoint() {
    const id = "ABCDEF"
      .split("")
      .find((id) => !points.some((v) => v.id === id))!;
    setPoints([...points, { id, value: 0 }]);
    setSelected(id);
    setInput("0");
    setError("");
  }
  function removePoint() {
    const next = points.filter((v) => v.id !== selected);
    setPoints(next);
    setSelected(next[0].id);
    setInput(String(next[0].value));
    if (first === selected) setFirst(next[0].id);
    if (second === selected)
      setSecond(next.find((v) => v.id !== next[0].id)!.id);
    setRevealed(false);
    setComparisonNote("");
  }
  function choose(value: string) {
    if (value === relation) {
      setRevealed(true);
      setComparisonNote(p.correct);
    } else setComparisonNote(p.checkPositions);
  }
  function checkOrder() {
    const index = orderMistake(order, ascending);
    setOrderNote(
      index < 0
        ? p.ordered
        : p.orderHint(
            signed(order[index - 1]),
            signed(order[index]),
            ascending,
          ) +
            " " +
            p[comparisonRule(order[index - 1], order[index])],
    );
  }
  function fresh() {
    const index = (exercise + 1) % orderSets.length;
    setExercise(index);
    setOrder(orderSets[index].slice(0, count));
    setOrderNote("");
  }
  function reorder(from: number, to: number) {
    setOrder(moveItem(order, from, to));
    setOrderNote("");
  }
  return (
    <section
      tabIndex={0}
      aria-label={p.title}
      className={`min-w-0 space-y-4 ${presenting ? "text-xl" : ""}`}
      onKeyDown={(e) =>
        lessonKey(e, presenting, {
          next: () => (orderView ? checkOrder() : setRevealed(true)),
          back: () => setRevealed(false),
          reveal: () => {
            if (orderView) {
              setOrder([...order].sort((a, b) => (ascending ? a - b : b - a)));
              setOrderNote(p.ordered);
            } else setRevealed(true);
          },
          newExample: fresh,
          predict: () => {
            setPredict(!predict);
            setRevealed(false);
          },
        })
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-navy text-2xl font-semibold">
          {p.title}
        </h2>
        {presenting && (
          <div className="flex gap-2">
            <button
              className={button}
              aria-pressed={!orderView}
              onClick={() => setOrderView(false)}
            >
              {p.explore}
            </button>
            <button
              className={button}
              aria-pressed={orderView}
              onClick={() => setOrderView(true)}
            >
              {p.order}
            </button>
          </div>
        )}
      </div>
      {!presenting && <p>{p.intro}</p>}
      <div
        className={`${presenting && orderView ? "hidden" : "grid"} min-w-0 gap-4 lg:grid-cols-[3fr_2fr]`}
      >
        <div className="graph-paper border-grid min-w-0 rounded border p-3">
          <PointLine
            points={points}
            selected={selected}
            onSelect={select}
            onMove={move}
            opposites={opposites}
            vertical={vertical}
            skin={skin}
            presenting={presenting}
          />
          {!presenting && <p className="text-pencil text-sm">{p.drag}</p>}
          {opposites && (
            <p className="mt-2" aria-live="polite">
              {p.oppositeNote(
                signed(active.value),
                signed(-active.value),
                Math.abs(active.value),
              )}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex min-h-12 items-center gap-2">
              <input
                type="checkbox"
                checked={opposites}
                onChange={(e) => setOpposites(e.target.checked)}
              />
              {p.opposites}
            </label>
            <label className="flex min-h-12 items-center gap-2">
              <input
                type="checkbox"
                checked={vertical}
                onChange={(e) => setVertical(e.target.checked)}
              />
              {p.vertical}
            </label>
            <label>
              {p.skin}
              <select
                className={field}
                value={skin}
                onChange={(e) => {
                  const next = e.target.value as typeof skin;
                  setSkin(next);
                  if (next !== "plain") setVertical(true);
                }}
              >
                {(["plain", "thermometer", "lift"] as const).map((v) => (
                  <option key={v} value={v}>
                    {p[v]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <aside className="min-w-0 space-y-4">
          <section className="border-grid rounded border p-4">
            <h3 className="font-display text-navy text-xl font-semibold">
              {p.selected}: {active.id}
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-2" aria-live="polite">
              <dt>{p.sign}</dt>
              <dd>
                {active.value === 0
                  ? p.zero
                  : active.value > 0
                    ? p.positive
                    : p.negative}
              </dd>
              <dt>{p.magnitude}</dt>
              <dd>
                <Tex>{String(Math.abs(active.value))}</Tex>
              </dd>
              <dt>{p.opposite}</dt>
              <dd>
                <Tex>{signed(-active.value).replaceAll("−", "-")}</Tex>
              </dd>
            </dl>
          </section>
          <section className="border-grid rounded border p-4">
            <h3 className="font-display text-navy text-xl font-semibold">
              {p.compare}
            </h3>
            <div className="mt-2 flex gap-4">
              {[
                { label: p.first, value: first, set: setFirst },
                { label: p.second, value: second, set: setSecond },
              ].map((s, i) => (
                <label key={i} className="min-w-0 flex-1">
                  {s.label}
                  <select
                    className={field}
                    value={s.value}
                    onChange={(e) => {
                      s.set(e.target.value);
                      setRevealed(false);
                      setComparisonNote("");
                    }}
                  >
                    {points.map((point) => (
                      <option key={point.id} value={point.id}>
                        {point.id}: {signed(point.value)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label className="my-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={predict}
                onChange={(e) => {
                  setPredict(e.target.checked);
                  setRevealed(false);
                  setComparisonNote("");
                }}
              />
              {c.predict}
            </label>
            {!show ? (
              <>
                <p>{p.predict}</p>
                <div className="my-3 flex gap-2">
                  {["<", "=", ">"].map((r) => (
                    <button
                      className={button}
                      key={r}
                      onClick={() => choose(r)}
                    >
                      <Tex>{r}</Tex>
                    </button>
                  ))}
                </div>
                <button className={button} onClick={() => setRevealed(true)}>
                  {c.showMe}
                </button>
              </>
            ) : (
              <>
                <div className={`my-3 ${presenting ? "text-4xl" : "text-3xl"}`}>
                  <Tex>
                    {`${signed(a)} ${relation} ${signed(b)}`.replaceAll(
                      "−",
                      "-",
                    )}
                  </Tex>
                </div>
                <p>
                  {a === b
                    ? p.equal
                    : p.position(
                        signed(Math.max(a, b)),
                        signed(Math.min(a, b)),
                        vertical,
                      )}
                </p>
                <p className="border-highlight mt-3 border-l-4 pl-3">{rule}</p>
              </>
            )}
            <p role="status" className="text-crimson-deep mt-2">
              {comparisonNote}
            </p>
          </section>
        </aside>
      </div>
      <div
        className={`${presenting && orderView ? "hidden" : "flex"} flex-wrap items-end gap-3`}
      >
        <label>
          {p.selected}
          <select
            value={selected}
            className={field}
            onChange={(e) => select(e.target.value)}
          >
            {points.map((point) => (
              <option key={point.id} value={point.id}>
                {p.point(point.id)}
              </option>
            ))}
          </select>
        </label>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
        >
          <label>
            {p.value}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              inputMode="numeric"
              className={`${field} max-w-40`}
              aria-invalid={!!error}
            />
          </label>
          <button className={button}>{c.apply}</button>
        </form>
        <button
          className={button}
          onClick={addPoint}
          disabled={points.length === 6}
        >
          {p.add}
        </button>
        <button
          className={button}
          disabled={points.length <= 2}
          onClick={removePoint}
        >
          {p.remove}
        </button>
      </div>
      <p className="text-crimson-deep" role="status">
        {error}
      </p>
      <details
        open
        className={`border-grid rounded border p-4 ${presenting && !orderView ? "hidden" : ""}`}
      >
        <summary className="font-display text-navy min-h-12 cursor-pointer text-xl font-semibold">
          {p.order}
        </summary>
        <p>{p.orderHelp}</p>
        <div className="my-3 flex flex-wrap gap-3">
          <label>
            {p.count}
            <select
              value={count}
              className={field}
              onChange={(e) => {
                const next = Number(e.target.value);
                setCount(next);
                setOrder(orderSets[exercise].slice(0, next));
                setOrderNote("");
              }}
            >
              {[4, 5, 6].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            {p.order}
            <select
              className={field}
              value={ascending ? "ascending" : "descending"}
              onChange={(e) => {
                setAscending(e.target.value === "ascending");
                setOrderNote("");
              }}
            >
              <option value="ascending">{p.ascending}</option>
              <option value="descending">{p.descending}</option>
            </select>
          </label>
        </div>
        <ol className="flex flex-wrap items-center gap-2">
          {order.map((value, i) => (
            <li key={value} className="flex items-center gap-2">
              <div
                draggable
                onDragStart={() => setDragged(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragged !== null) reorder(dragged, i);
                  setDragged(null);
                }}
                onDragEnd={() => setDragged(null)}
                className="bg-paper border-grid-strong rounded border-2 p-2 text-center"
              >
                <Tex className="text-2xl">
                  {signed(value).replaceAll("−", "-")}
                </Tex>
                <div className="mt-2 flex gap-1">
                  <button
                    className={`${button} px-3`}
                    disabled={i === 0}
                    aria-label={p.earlier(signed(value))}
                    onClick={() => reorder(i, i - 1)}
                  >
                    ←
                  </button>
                  <button
                    className={`${button} px-3`}
                    disabled={i === order.length - 1}
                    aria-label={p.later(signed(value))}
                    onClick={() => reorder(i, i + 1)}
                  >
                    →
                  </button>
                </div>
              </div>
              {i < order.length - 1 && <Tex>{ascending ? "<" : ">"}</Tex>}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={primary} onClick={checkOrder}>
            {p.check}
          </button>
          <button
            className={button}
            onClick={() => {
              setOrder([...order].sort((a, b) => (ascending ? a - b : b - a)));
              setOrderNote(p.ordered);
            }}
          >
            {p.show}
          </button>
          <button
            className={button}
            onClick={() => {
              setOrder(orderSets[exercise].slice(0, count));
              setOrderNote("");
            }}
          >
            {p.retry}
          </button>
          <button className={button} onClick={fresh}>
            {c.newExample}
          </button>
        </div>
        <p className="text-crimson-deep mt-3" role="status">
          {orderNote}
        </p>
      </details>
      {!presenting && (
        <details>
          <summary className="min-h-12 cursor-pointer py-3 font-semibold">
            {p.think}
          </summary>
          <p>{p.thought}</p>
        </details>
      )}
      <details>
        <summary className="min-h-12 cursor-pointer py-3">{c.keys}</summary>
        <p>{c.bracketLesson.keys}</p>
      </details>
      <div className="flex flex-wrap gap-3">
        <a href="#add-subtract" className={button}>
          {p.next}
        </a>
        <a href="#play" className={button}>
          {p.play}
        </a>
      </div>
    </section>
  );
}
