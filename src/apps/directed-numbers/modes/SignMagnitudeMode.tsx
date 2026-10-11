import { useState } from "react";
import { copy } from "@/lib/copy";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { SignMagnitude } from "../components/SignMagnitude";
import { button, field, primary } from "../components/ui";
import {
  simpleMove,
  readMagnitudeMove,
  magnitudeModel,
  type SimpleMove,
} from "../lib/textbook";
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
  const initialMove = initialExpression
    ? simpleMove(initialExpression, true)
    : null;
  const initial = initialMove ?? examples[0];
  const [move, setMove] = useState(initial);
  const [expression, setExpression] = useState(
    initialMove ? initialExpression : undefined,
  );
  const [a, setA] = useState(
      magnitudeModel(initial).labels.start.replace(/^\+/, ""),
    ),
    [b, setB] = useState(magnitudeModel(initial).labels.b.replace(/^\+/, "")),
    [op, setOp] = useState(initial.op);
  const [error, setError] = useState(false),
    [version, setVersion] = useState(0);
  function load(value: SimpleMove, entered?: { a: string; b: string }) {
    setMove(value);
    setExpression(undefined);
    setA(entered?.a ?? magnitudeModel(value).labels.start.replace(/^\+/, ""));
    setB(entered?.b ?? magnitudeModel(value).labels.b.replace(/^\+/, ""));
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
          const value = readMagnitudeMove(a, op, b);
          if (!value) {
            setError(true);
            return;
          }
          load(value, { a: a.trim(), b: b.trim() });
        }}
      >
        <label>
          {c.start}
          <input
            className={field}
            type="text"
            maxLength={80}
            aria-describedby="number-line-input-help"
            autoComplete="off"
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
            type="text"
            maxLength={80}
            aria-describedby="number-line-input-help"
            autoComplete="off"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </label>
        <button className={primary}>{c.apply}</button>
        <p
          id="number-line-input-help"
          className="text-pencil text-sm sm:col-span-4"
        >
          {c.inputHelp}
        </p>
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
