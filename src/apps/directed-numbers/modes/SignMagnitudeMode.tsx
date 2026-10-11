import { useState } from "react";
import { copy } from "@/lib/copy";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { SignMagnitude } from "../components/SignMagnitude";
import { button, field, primary } from "../components/ui";
import { magnitudeModel, simpleMove, type SimpleMove } from "../lib/textbook";
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
  const [a, setA] = useState(String(initial.start)),
    [b, setB] = useState(String(initial.b)),
    [op, setOp] = useState(initial.op);
  const [error, setError] = useState(false),
    [version, setVersion] = useState(0);
  const [sign, setSign] = useState(""),
    [magnitude, setMagnitude] = useState(""),
    [feedback, setFeedback] = useState("");
  function load(value: SimpleMove) {
    setMove(value);
    setA(String(value.start));
    setB(String(value.b));
    setOp(value.op);
    setError(false);
    setVersion((n) => n + 1);
    setSign("");
    setMagnitude("");
    setFeedback("");
  }
  return (
    <section className={`min-w-0 space-y-5 ${presenting ? "text-xl" : ""}`}>
      {!presenting && <p className="text-pencil max-w-3xl">{c.intro}</p>}
      <div
        className={`grid min-w-0 gap-5 ${presenting ? "lg:grid-cols-[minmax(0,4fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"}`}
      >
        <SignMagnitude key={version} move={move} wide={presenting} />
        <div className="min-w-0 space-y-4">
          <form
            className={
              presenting ? "hidden" : "border-grid space-y-3 rounded border p-4"
            }
            onSubmit={(e) => {
              e.preventDefault();
              const model = magnitudeModel(move);
              if (
                !sign ||
                !magnitude.trim() ||
                !Number.isFinite(Number(magnitude)) ||
                Number(magnitude) < 0
              )
                setFeedback(c.required);
              else
                setFeedback(
                  sign !== model.sign
                    ? c.wrongSign
                    : Number(magnitude) !== model.magnitude
                      ? c.wrongMagnitude
                      : c.correct,
                );
            }}
          >
            <p className="font-semibold">{c.prompt}</p>
            <label className="block">
              {c.signChoice}
              <select
                className={field}
                value={sign}
                onChange={(e) => {
                  setSign(e.target.value);
                  setFeedback("");
                }}
              >
                <option value="">—</option>
                {(["positive", "negative", "zero"] as const).map((s) => (
                  <option key={s} value={s}>
                    {c[`${s}Choice`]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              {c.magnitudeChoice}
              <input
                className={field}
                inputMode="numeric"
                value={magnitude}
                onChange={(e) => {
                  setMagnitude(e.target.value);
                  setFeedback("");
                }}
              />
            </label>
            <button className={primary}>{c.check}</button>
            {feedback && <p role="status">{feedback}</p>}
          </form>
          <div className="space-y-3">
            <h3 className="font-semibold">{c.examples}</h3>
            <p className="text-sm">{c.sourceCases}</p>
            <div className="flex flex-wrap gap-2">
              {examples.slice(0, 4).map((value, i) => (
                <button className={button} key={i} onClick={() => load(value)}>
                  <Tex>{`${value.start} ${value.op} ${value.b}`}</Tex>
                </button>
              ))}
            </div>
            <p className="text-sm">{c.extraCases}</p>
            <div className="flex flex-wrap gap-2">
              {examples.slice(4).map((value, i) => (
                <button className={button} key={i} onClick={() => load(value)}>
                  <Tex>{`${value.start} ${value.op} (${value.b})`}</Tex>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <form
        className="border-grid grid items-end gap-3 border-t pt-5 sm:grid-cols-4"
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
      <a className={`${button} inline-flex`} href="#textbook">
        {c.textbookLink} →
      </a>
    </section>
  );
}
