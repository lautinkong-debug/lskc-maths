import styles from "../DirectedNumbers.module.css";
import { useMemo, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { ArithmeticInput } from "../components/ArithmeticInput";
import { button, field, primary } from "../components/ui";
import { evaluate, parse, parseAnswer, type Ast } from "../lib/parse";
import {
  abs,
  div,
  equals,
  mul,
  rational,
  toTex,
  toText,
} from "../lib/rational";
import { expressionTex, workOut } from "../lib/steps";

const c = copy.apps.directedNumbers;
const m = c.multiplyLesson;
type Panel = keyof typeof m.panels;
const panels = Object.keys(m.panels) as Panel[];
const signed = (n: number) => toText(rational(n), { signed: true });
const firstChain = "(−2) × (+3) ÷ (−4)";

function multiplicationOnly(ast: Ast): boolean {
  if (ast.kind === "number") return true;
  if (ast.kind === "group" || ast.kind === "unary")
    return multiplicationOnly(ast.child);
  return (
    (ast.op === "*" || ast.op === "/") &&
    multiplicationOnly(ast.left) &&
    multiplicationOnly(ast.right)
  );
}

function PatternPanel() {
  const [fixed, setFixed] = useState(5);
  const [shown, setShown] = useState(4);
  const [prediction, setPrediction] = useState("");
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);
  const multipliers = [4, 3, 2, 1, 0, -1, -2, -3, -4];
  const needsPrediction = shown === 5 && !ready;
  function setFactor(value: number) {
    setFixed(value);
    setShown(4);
    setReady(false);
    setPrediction("");
    setNote("");
  }
  function check() {
    const answer = parseAnswer(prediction);
    if (answer.ok && equals(answer.value, rational(fixed * -1))) {
      setReady(true);
      setNote(m.pattern.correct);
    } else setNote(m.pattern.wrong(signed(-fixed)));
  }
  return (
    <section className="space-y-4" aria-label={m.pattern.title}>
      <h3 className="font-display text-navy text-2xl font-semibold">
        {m.pattern.title}
      </h3>
      <p>{m.pattern.intro}</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="font-semibold">
          {m.pattern.fixed}
          <input
            type="number"
            min={-9}
            max={9}
            value={fixed}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && Math.abs(value) <= 9)
                setFactor(value);
            }}
            className={`${field} w-28`}
          />
        </label>
        <button className={button} onClick={() => setFactor(5)}>
          {m.pattern.positivePreset}
        </button>
        <button className={button} onClick={() => setFactor(-3)}>
          {m.pattern.negativePreset}
        </button>
      </div>
      <p className="text-pencil text-sm">{m.pattern.range}</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="border-grid bg-paper rounded border p-4">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="p-2">{m.pattern.multiplier}</th>
                <th className="p-2">{m.pattern.product}</th>
              </tr>
            </thead>
            <tbody>
              {multipliers.slice(0, shown).map((n) => (
                <tr
                  key={n}
                  className={
                    n === 0 ? "bg-highlight/40" : "border-grid border-t"
                  }
                >
                  <td className="p-2">
                    <Tex>{`${toTex(rational(fixed), { signed: true })}\\times(${toTex(rational(n), { signed: true })})`}</Tex>
                  </td>
                  <td className="p-2 font-semibold">{signed(fixed * n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-grid bg-paper rounded border p-4">
          <p className="font-semibold">{m.pattern.chart}</p>
          <div
            className="mt-3 flex h-44 items-center gap-1 overflow-x-auto"
            role="img"
            aria-label={m.pattern.chart}
          >
            {multipliers.slice(0, shown).map((n) => {
              const product = fixed * n;
              return (
                <div
                  key={n}
                  className="flex h-full min-w-9 flex-1 flex-col items-center"
                >
                  <span className="border-grid-strong flex h-[45%] w-full items-end justify-center border-b">
                    {product > 0 && (
                      <span
                        className="bg-navy block w-5"
                        style={{
                          height: `${(Math.abs(product) / 36) * 100}%`,
                          minHeight: 3,
                        }}
                      />
                    )}
                  </span>
                  <span className="flex h-[45%] w-full items-start justify-center">
                    {product < 0 && (
                      <span
                        className="bg-crimson-deep block w-5"
                        style={{
                          height: `${(Math.abs(product) / 36) * 100}%`,
                          minHeight: 3,
                        }}
                      />
                    )}
                  </span>
                  <span className="text-sm">{signed(n)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {needsPrediction && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            check();
          }}
          className="border-highlight rounded border-2 p-4"
        >
          <label htmlFor="dn-pattern-prediction" className="font-semibold">
            {m.pattern.predict(signed(-1))}
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <input
              id="dn-pattern-prediction"
              className={`${field} max-w-40`}
              value={prediction}
              onChange={(event) => setPrediction(event.target.value)}
            />
            <button className={primary} type="submit">
              {m.pattern.check}
            </button>
            <button
              className={button}
              type="button"
              onClick={() => {
                setReady(true);
                setNote(m.pattern.conclusion(signed(fixed), signed(-fixed)));
              }}
            >
              {c.showMe}
            </button>
          </div>
          {note && (
            <p className="mt-2" role="status">
              {note}
            </p>
          )}
        </form>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          className={button}
          disabled={shown <= 1}
          onClick={() => {
            setShown(shown - 1);
            setNote("");
          }}
        >
          {m.pattern.back}
        </button>
        <button
          className={primary}
          disabled={shown === multipliers.length || needsPrediction}
          onClick={() => {
            setShown(shown + 1);
            setNote("");
          }}
        >
          {m.pattern.next}
        </button>
      </div>
      {shown === multipliers.length && (
        <p className="border-highlight border-l-4 pl-3 font-semibold">
          {m.pattern.conclusion(signed(fixed), signed(-fixed))}
        </p>
      )}
    </section>
  );
}

function RepeatedPanel() {
  const [size, setSize] = useState(3);
  const [count, setCount] = useState(4);
  const [shown, setShown] = useState(0);
  const width = 760;
  const left = 35;
  const stepWidth = count ? Math.min(84, (width - 70) / count) : 84;
  const x = (index: number) => width - left - index * stepWidth;
  return (
    <section className="space-y-4" aria-label={m.repeated.title}>
      <h3 className="font-display text-navy text-2xl font-semibold">
        {m.repeated.title}
      </h3>
      <p>{m.repeated.intro}</p>
      <div className="flex flex-wrap gap-3">
        <label className="font-semibold">
          {m.repeated.magnitude}
          <input
            className={`${field} w-24`}
            type="number"
            min={1}
            max={9}
            value={size}
            onChange={(event) => {
              const n = Number(event.target.value);
              if (Number.isInteger(n) && n >= 1 && n <= 9) {
                setSize(n);
                setShown(0);
              }
            }}
          />
        </label>
        <label className="font-semibold">
          {m.repeated.count}
          <input
            className={`${field} w-24`}
            type="number"
            min={0}
            max={8}
            value={count}
            onChange={(event) => {
              const n = Number(event.target.value);
              if (Number.isInteger(n) && n >= 0 && n <= 8) {
                setCount(n);
                setShown(0);
              }
            }}
          />
        </label>
      </div>
      <div className="graph-paper border-grid overflow-x-auto rounded border p-3">
        <svg
          viewBox={`0 0 ${width} 170`}
          className="w-full min-w-[540px]"
          role="img"
          aria-label={m.repeated.line(size, count, shown)}
        >
          <defs>
            <marker
              id="dn-hop-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
            >
              <path
                d="M8 0 L0 4 L8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </marker>
          </defs>
          <line
            x1="18"
            y1="105"
            x2={width - 12}
            y2="105"
            stroke="currentColor"
            strokeWidth="2"
          />
          {Array.from({ length: count + 1 }, (_, index) => (
            <g key={index}>
              <line
                x1={x(index)}
                y1="99"
                x2={x(index)}
                y2="111"
                stroke="currentColor"
              />
              <text x={x(index)} y="137" textAnchor="middle" fontSize="18">
                {signed(-size * index)}
              </text>
            </g>
          ))}
          {Array.from({ length: shown }, (_, index) => (
            <g key={index}>
              <path
                d={`M${x(index) - 3} 88 Q${(x(index) + x(index + 1)) / 2} 20 ${x(index + 1) + 5} 88`}
                fill="none"
                stroke="var(--color-navy)"
                strokeWidth="3"
                markerEnd="url(#dn-hop-arrow)"
              />
              <text
                x={(x(index) + x(index + 1)) / 2}
                y="58"
                textAnchor="middle"
                fontSize="16"
              >
                {signed(-size)}
              </text>
            </g>
          ))}
          <circle
            cx={x(shown)}
            cy="105"
            r="7"
            fill="var(--color-crimson-deep)"
          />
        </svg>
      </div>
      <p aria-live="polite">{m.repeated.line(size, count, shown)}</p>
      <div className="overflow-x-auto text-xl">
        <strong>{m.repeated.working}: </strong>
        <Tex>
          {shown
            ? `${Array.from({ length: shown }, () => `(-${size})`).join("+")}=${toTex(rational(-size * shown))}`
            : "0"}
        </Tex>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={button}
          disabled={shown === 0}
          onClick={() => setShown(shown - 1)}
        >
          {m.repeated.back}
        </button>
        <button
          className={primary}
          disabled={shown === count}
          onClick={() => setShown(shown + 1)}
        >
          {m.repeated.next}
        </button>
        <button className={button} onClick={() => setShown(0)}>
          {m.repeated.reset}
        </button>
      </div>
      {shown === count && (
        <p className="font-semibold">
          {count ? m.repeated.result(signed(-size * count)) : m.repeated.zero}
        </p>
      )}
    </section>
  );
}

function SignsPanel() {
  const [first, setFirst] = useState("−6");
  const [second, setSecond] = useState("+3");
  const [op, setOp] = useState<"*" | "/">("*");
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState("");
  const [revealed, setRevealed] = useState(false);
  const a = parseAnswer(first),
    b = parseAnswer(second);
  const valid = a.ok && b.ok && (op === "*" || b.value.n !== 0);
  const result = valid
    ? op === "*"
      ? mul(a.value, b.value)
      : div(a.value, b.value)
    : null;
  const value =
    result && "ok" in result ? (result.ok ? result.value : null) : result;
  const same = a.ok && b.ok && Math.sign(a.value.n) === Math.sign(b.value.n);
  function check() {
    const given = parseAnswer(answer);
    setNote(
      !valid
        ? a.ok && b.ok
          ? m.signs.dividingZero
          : m.signs.invalid
        : !given.ok
          ? given.message
          : value && equals(given.value, value)
            ? m.signs.correct
            : value && equals(abs(given.value), abs(value))
              ? m.signs.wrongSign
              : m.signs.wrongSize,
    );
  }
  return (
    <section className="space-y-4" aria-label={m.signs.title}>
      <h3 className="font-display text-navy text-2xl font-semibold">
        {m.signs.title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="font-semibold">
          {m.signs.first}
          <input
            className={field}
            value={first}
            onChange={(event) => {
              setFirst(event.target.value);
              setRevealed(false);
              setNote("");
            }}
          />
        </label>
        <label className="font-semibold">
          {m.signs.operation}
          <select
            className={field}
            value={op}
            onChange={(event) => {
              setOp(event.target.value as "*" | "/");
              setRevealed(false);
              setNote("");
            }}
          >
            <option value="*">×</option>
            <option value="/">÷</option>
          </select>
        </label>
        <label className="font-semibold">
          {m.signs.second}
          <input
            className={field}
            value={second}
            onChange={(event) => {
              setSecond(event.target.value);
              setRevealed(false);
              setNote("");
            }}
          />
        </label>
      </div>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        aria-label={m.signs.title}
      >
        {(
          [
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
          ] as const
        ).map(([left, right]) => (
          <div
            key={`${left}-${right}`}
            className={`border-grid rounded border p-3 text-center ${a.ok && b.ok && Math.sign(a.value.n) === left && Math.sign(b.value.n) === right ? "bg-highlight/50 border-navy font-bold" : "bg-paper"}`}
          >
            <div>
              {left > 0 ? "+" : "−"} {op === "*" ? "×" : "÷"}{" "}
              {right > 0 ? "+" : "−"}
            </div>
            <div>{left === right ? m.signs.same : m.signs.different}</div>
          </div>
        ))}
      </div>
      {!valid && (
        <p role="status" className="text-crimson-deep">
          {a.ok && b.ok ? m.signs.dividingZero : m.signs.invalid}
        </p>
      )}
      {valid && value && (
        <>
          <p className="text-xl">
            <Tex>{`${toTex(a.value, { signed: true })}${op === "*" ? "\\times" : "\\div"}${toTex(b.value, { signed: true })}`}</Tex>
          </p>
          {a.value.n === 0 || b.value.n === 0 ? (
            <p>{m.signs.zero}</p>
          ) : (
            <p>{same ? m.signs.same : m.signs.different}</p>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              check();
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <label className="font-semibold">
              {m.signs.product}
              <input
                className={`${field} max-w-48`}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
              />
            </label>
            <button className={primary} type="submit">
              {m.signs.check}
            </button>
            <button
              className={button}
              type="button"
              onClick={() => setRevealed(true)}
            >
              {m.signs.reveal}
            </button>
          </form>
          {note && <p role="status">{note}</p>}
          {revealed && (
            <div className="border-highlight border-l-4 pl-3 text-xl">
              <Tex>{`${same || value.n === 0 ? "+" : "-"}(${toTex(abs(a.value))}${op === "*" ? "\\times" : "\\div"}${toTex(abs(b.value))})=${toTex(value, { signed: true })}`}</Tex>
              {op === "/" && (
                <p className="mt-2 text-base">
                  {m.signs.fraction}{" "}
                  <Tex>{`\\frac{${toTex(a.value)}}{${toTex(b.value)}}`}</Tex>
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ManyPanel({
  initialExpression,
  presenting,
}: {
  initialExpression?: string;
  presenting: boolean;
}) {
  const [factors, setFactors] = useState(["−2", "+3", "−4"]);
  const [operators, setOperators] = useState<Array<"*" | "/">>(["*", "/"]);
  const [source, setSource] = useState(initialExpression ?? firstChain);
  const [loaded, setLoaded] = useState(() => {
    const parsed = parse(initialExpression ?? firstChain);
    const fallback = parse(firstChain);
    if (!fallback.ok) throw new Error("Invalid lesson example");
    return parsed.ok && multiplicationOnly(parsed.value)
      ? parsed.value
      : fallback.value;
  });
  const [position, setPosition] = useState(0);
  const parsed = factors.map(parseAnswer);
  const valid =
    parsed.every((item) => item.ok) &&
    operators.every(
      (op, index) =>
        op !== "/" || (parsed[index + 1].ok && parsed[index + 1].value.n !== 0),
    );
  const values = valid
    ? parsed.map((item) => {
        if (!item.ok) throw new Error("Invalid factor");
        return item.value;
      })
    : [];
  const negatives = values.filter((item) => item.n < 0).length;
  const zero = values.some((item) => item.n === 0);
  const working = useMemo(
    () => workOut(loaded, { signWorking: true }),
    [loaded],
  );
  const reciprocal = values.find(
    (value, index) =>
      index > 0 && operators[index - 1] === "/" && value.d !== 1,
  );
  function loadChain() {
    if (!valid) return;
    const expression = values
      .map(
        (value, index) =>
          `${index ? (operators[index - 1] === "*" ? " × " : " ÷ ") : ""}(${toText(value, { signed: true })})`,
      )
      .join("");
    const next = parse(expression);
    if (next.ok) {
      setSource(expression);
      setLoaded(next.value);
      setPosition(0);
    }
  }
  return (
    <section className="space-y-4" aria-label={m.many.title}>
      <h3 className="font-display text-navy text-2xl font-semibold">
        {m.many.title}
      </h3>
      <p>{m.many.intro}</p>
      {presenting && (
        <div className="flex flex-wrap gap-2">
          <button
            className={button}
            disabled={position === 0}
            onClick={() => setPosition(position - 1)}
          >
            {c.back}
          </button>
          <button
            className={primary}
            disabled={position === working.length}
            onClick={() => setPosition(position + 1)}
          >
            {m.many.step}
          </button>
          <button
            className={button}
            onClick={() => setPosition(working.length)}
          >
            {c.showMe}
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-end gap-2">
        {factors.map((factor, index) => (
          <div key={index} className="flex items-end gap-2">
            {index > 0 && (
              <label className="font-semibold">
                {m.many.operation(index)}
                <select
                  className={`${field} w-20`}
                  value={operators[index - 1]}
                  onChange={(event) =>
                    setOperators(
                      operators.map((op, position) =>
                        position === index - 1
                          ? (event.target.value as "*" | "/")
                          : op,
                      ),
                    )
                  }
                >
                  <option value="*">×</option>
                  <option value="/">÷</option>
                </select>
              </label>
            )}
            <label className="font-semibold">
              {m.many.factor(index + 1)}
              <input
                className={`${field} w-24 ${valid && parsed[index].ok && parsed[index].value.n < 0 ? "bg-highlight/40" : ""}`}
                value={factor}
                onChange={(event) =>
                  setFactors(
                    factors.map((old, position) =>
                      position === index ? event.target.value : old,
                    ),
                  )
                }
              />
            </label>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={button}
          disabled={factors.length >= 6}
          onClick={() => {
            setFactors([...factors, "+2"]);
            setOperators([...operators, "*"]);
          }}
        >
          {m.many.add}
        </button>
        <button
          className={button}
          disabled={factors.length <= 2}
          onClick={() => {
            setFactors(factors.slice(0, -1));
            setOperators(operators.slice(0, -1));
          }}
        >
          {m.many.remove}
        </button>
        <button className={primary} disabled={!valid} onClick={loadChain}>
          {m.many.apply}
        </button>
      </div>
      {!valid ? (
        <p className="text-crimson-deep" role="status">
          {m.many.invalid}
        </p>
      ) : (
        <div className="space-y-2" aria-live="polite">
          <p className="font-semibold">
            {zero ? m.many.zero : m.many.count(negatives)}
          </p>
          {reciprocal && (
            <p>
              {m.many.reciprocal(
                toText(
                  rational(
                    reciprocal.d * Math.sign(reciprocal.n),
                    Math.abs(reciprocal.n),
                  ),
                ),
              )}
            </p>
          )}
        </div>
      )}
      {!presenting && (
        <ArithmeticInput
          value={source}
          onChange={setSource}
          onLoad={(ast) => {
            setLoaded(ast);
            setPosition(0);
          }}
          presenting={presenting}
          accepts={multiplicationOnly}
          scopeMessage={m.many.scope}
        />
      )}
      <div className="border-grid bg-paper min-w-0 overflow-x-auto rounded border p-4">
        <h4 className="font-display text-navy text-xl font-semibold">
          {c.working}
        </h4>
        <div className="mt-3 space-y-2 text-xl">
          <div>
            <Tex className="whitespace-nowrap">{expressionTex(loaded)}</Tex>
          </div>
          {working.slice(0, position).map((step, index) => (
            <div key={index}>
              <Tex className="whitespace-nowrap">{`= ${step.tex}`}</Tex>
              <p className="text-pencil text-sm">
                {c.arithmetic.notes[
                  step.noteKey as keyof typeof c.arithmetic.notes
                ] ??
                  c.bracketLesson.notes[
                    step.noteKey as keyof typeof c.bracketLesson.notes
                  ]}
              </p>
            </div>
          ))}
        </div>
      </div>
      {!presenting && (
        <div className="flex flex-wrap gap-2">
          <button
            className={button}
            disabled={position === 0}
            onClick={() => setPosition(position - 1)}
          >
            {c.back}
          </button>
          <button
            className={primary}
            disabled={position === working.length}
            onClick={() => setPosition(position + 1)}
          >
            {m.many.step}
          </button>
          <button
            className={button}
            onClick={() => setPosition(working.length)}
          >
            {c.showMe}
          </button>
        </div>
      )}
      {position === working.length && (
        <p className="font-semibold">
          {m.many.complete}{" "}
          <Tex>{toTex(evaluate(loaded), { signed: true })}</Tex>
        </p>
      )}
    </section>
  );
}

export default function MultiplyDivideMode({
  initialExpression,
}: {
  initialExpression?: string;
}) {
  const presenting = usePresentation();
  const [panel, setPanel] = useState<Panel>(
    initialExpression ? "many" : "pattern",
  );
  return (
    <section className={`min-w-0 space-y-5 ${presenting ? "text-xl" : ""}`}>
      <h2 className="font-display text-navy text-2xl font-semibold">
        {m.title}
      </h2>
      <p>{m.intro}</p>
      <nav className="flex flex-wrap gap-2" aria-label={m.title}>
        {panels.map((item) => (
          <button
            key={item}
            className={`${button} ${panel === item ? "border-navy bg-navy-wash" : ""}`}
            aria-current={panel === item ? "page" : undefined}
            onClick={() => setPanel(item)}
          >
            {m.panels[item]}
          </button>
        ))}
      </nav>
      <div className={styles.graphBoard}>
        {panel === "pattern" ? (
          <PatternPanel />
        ) : panel === "repeated" ? (
          <RepeatedPanel />
        ) : panel === "signs" ? (
          <SignsPanel />
        ) : (
          <ManyPanel
            initialExpression={initialExpression}
            presenting={presenting}
          />
        )}
      </div>
      <details>
        <summary className="min-h-12 cursor-pointer py-2 font-semibold">
          {m.think}
        </summary>
        <p>{m.thought}</p>
      </details>
      <a className={`${button} inline-flex items-center`} href="#mixed">
        {m.next} →
      </a>
    </section>
  );
}
