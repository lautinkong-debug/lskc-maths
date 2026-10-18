import styles from "../DirectedNumbers.module.css";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import {
  SignMagnitude,
  type ExplanationMethod,
} from "../components/SignMagnitude";
import { button, field, primary } from "../components/ui";
import { teachingCaseGroups } from "../lib/teachingCases";
import {
  simpleMove,
  readMagnitudeMove,
  magnitudeModel,
  type SimpleMove,
} from "../lib/textbook";
const c = copy.apps.directedNumbers.magnitudeLesson;
function inputExpression(a: string, op: SimpleMove["op"], b: string) {
  // Only signed inputs need brackets. Do not invent a unary plus for an
  // unsigned input; keep the original decimal or fraction notation as well.
  const operand = (value: string) =>
    /^[+−–-]/.test(value) ? `(${value})` : value;
  return `${operand(a)} ${op} ${operand(b)}`;
}
export default function SignMagnitudeMode({
  initialExpression,
}: {
  initialExpression?: string;
}) {
  const presenting = usePresentation();
  const initialMove = initialExpression
    ? simpleMove(initialExpression, true)
    : null;
  const initial = initialMove ?? { start: 50, op: "-" as const, b: 60 };
  const [caseGroup, setCaseGroup] = useState(0);
  const [method, setMethod] = useState<ExplanationMethod>("number-line");
  const group = teachingCaseGroups[caseGroup];
  const initialA = magnitudeModel(initial).labels.start.replace(/^\+/, "");
  const initialB = magnitudeModel(initial).labels.b.replace(/^\+/, "");
  const [move, setMove] = useState(initial);
  const [expression, setExpression] = useState(
    initialMove
      ? initialExpression
      : inputExpression(initialA, initial.op, initialB),
  );
  const [startLabel, setStartLabel] = useState<string | undefined>(
    initialMove ? undefined : initialA,
  );
  const [a, setA] = useState(
      magnitudeModel(initial).labels.start.replace(/^\+/, ""),
    ),
    [b, setB] = useState(magnitudeModel(initial).labels.b.replace(/^\+/, "")),
    [op, setOp] = useState(initial.op);
  const [error, setError] = useState(false),
    [version, setVersion] = useState(0);
  function load(
    value: SimpleMove,
    entered?: { a: string; b: string; expression?: string },
  ) {
    const labels = magnitudeModel(value).labels;
    const nextA = entered?.a ?? labels.start.replace(/^\+/, "");
    const nextB = entered?.b ?? labels.b.replace(/^\+/, "");
    setMove(value);
    setExpression(
      entered?.expression ?? inputExpression(nextA, value.op, nextB),
    );
    setStartLabel(
      nextA.startsWith("+") ? labels.start : labels.start.replace(/^\+/, ""),
    );
    setA(nextA);
    setB(nextB);
    setOp(value.op);
    setError(false);
    setVersion((n) => n + 1);
  }
  return (
    <section className={`min-w-0 space-y-4 ${presenting ? "text-xl" : ""}`}>
      {!presenting && <p className="text-pencil">{c.intro}</p>}
      <SignMagnitude
        key={version}
        move={move}
        expression={expression}
        startLabel={startLabel}
        method={method}
        onMethodChange={setMethod}
        wide
      />
      <section
        className={`${styles.examplePanel} space-y-3`}
        aria-label={c.examples}
      >
        <h3 className="font-semibold">{c.examples}</h3>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={c.caseTypes}
        >
          {teachingCaseGroups.map((value, i) => (
            <button
              key={value.id}
              className={caseGroup === i ? primary : button}
              aria-pressed={caseGroup === i}
              onClick={() => setCaseGroup(i)}
            >
              {c.caseGroups[value.id]}
            </button>
          ))}
        </div>
        {(["plain", "signed"] as const).map(
          (form) =>
            group[form].length > 0 && (
              <div
                key={form}
                className="space-y-2"
                data-testid={`cases-${form}`}
              >
                <p className="text-pencil text-sm">{c.caseForms[form]}</p>
                <div className="flex flex-wrap gap-2">
                  {group[form].map((value) => (
                    <button
                      key={value.expression}
                      className={`${button} py-3 text-lg`}
                      aria-pressed={expression === value.expression}
                      onClick={() => load(value.move, value)}
                    >
                      <Tex>{value.tex}</Tex>
                    </button>
                  ))}
                </div>
              </div>
            ),
        )}
      </section>
      <form
        className={`${styles.exampleForm} grid items-end gap-3 sm:grid-cols-4`}
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
        <button className={primary}>
          {method === "owe" ? c.applyOwe : c.apply}
        </button>
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
