import { useState } from "react";
import { copy } from "@/lib/copy";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { SignMagnitude } from "../components/SignMagnitude";
import { button, field, primary } from "../components/ui";
import { simpleMove, type SimpleMove } from "../lib/textbook";
const c = copy.apps.directedNumbers.magnitudeLesson;
const examples: SimpleMove[] = [
  { start: 50, op: "-", b: 60 },
  { start: -50, op: "+", b: 30 },
  { start: -50, op: "+", b: 60 },
  { start: -50, op: "-", b: 30 },
  { start: -50, op: "-", b: -60 },
  { start: 50, op: "+", b: -50 },
];
export default function SignMagnitudeMode({
  initialExpression,
}: {
  initialExpression?: string;
}) {
  const presenting = usePresentation();
  const initial = initialExpression
    ? (simpleMove(initialExpression) ?? examples[0])
    : examples[0];
  const [move, setMove] = useState(initial);
  const [expression, setExpression] = useState(initialExpression);
  const [a, setA] = useState(String(initial.start)),
    [b, setB] = useState(String(initial.b)),
    [op, setOp] = useState(initial.op);
  const [error, setError] = useState(false),
    [version, setVersion] = useState(0);
  function load(value: SimpleMove) {
    setMove(value);
    setExpression(undefined);
    setA(String(value.start));
    setB(String(value.b));
    setOp(value.op);
    setError(false);
    setVersion((n) => n + 1);
  }
  return (
    <section className={`min-w-0 space-y-4 ${presenting ? "text-xl" : ""}`}>
      {!presenting && <p className="text-pencil">{c.intro}</p>}
      <SignMagnitude key={version} move={move} expression={expression} wide />
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="mr-2 font-semibold">{c.examples}</h3>
        {examples.map((value, i) => (
          <button className={button} key={i} onClick={() => load(value)}>
            <Tex>{`${value.start} ${value.op} (${value.b})`}</Tex>
          </button>
        ))}
      </div>
      <form
        className="border-grid grid items-end gap-3 border-t pt-4 sm:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            ![a, b].every(
              (value) =>
                /^[+-]?\d+$/.test(value) && Math.abs(Number(value)) <= 100,
            )
          ) {
            setError(true);
            return;
          }
          load({ start: Number(a), op, b: Number(b) });
        }}
      >
        <label>
          {c.start}
          <input
            className={field}
            type="number"
            min="-100"
            max="100"
            step="1"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </label>
        <label>
          {c.operation}
          <select
            className={field}
            value={op}
            onChange={(e) => setOp(e.target.value as SimpleMove["op"])}
          >
            <option value="+">+</option>
            <option value="-">−</option>
          </select>
        </label>
        <label>
          {c.operand}
          <input
            className={field}
            type="number"
            min="-100"
            max="100"
            step="1"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </label>
        <button className={primary}>{c.apply}</button>
        {error && (
          <p className="sm:col-span-4" role="alert">
            {c.range}
          </p>
        )}
      </form>
      {!presenting && (
        <a className={`${button} inline-flex`} href="#textbook">
          {c.textbookLink} →
        </a>
      )}
    </section>
  );
}
