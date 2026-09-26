"use client";

import { useState, type FormEvent } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import {
  formatNumber,
  solveInequality,
  type Endpoint,
  type InequalitySolution,
} from "./solve";

const LEFT = 55;
const RIGHT = 665;
const Y = 95;

function EndpointDot({ endpoint, x }: { endpoint: Endpoint; x: number }) {
  return (
    <circle
      cx={x}
      cy={Y}
      r="8"
      className={
        endpoint.included ? "fill-navy stroke-navy" : "stroke-navy fill-white"
      }
      strokeWidth="3"
    />
  );
}

function NumberLine({ solution }: { solution: InequalitySolution }) {
  const lower = solution.lower;
  const upper = solution.upper;
  const min =
    lower && upper
      ? lower.value - Math.max(2, (upper.value - lower.value) * 0.25)
      : (lower?.value ?? upper?.value ?? 0) - 5;
  const max =
    lower && upper
      ? upper.value + Math.max(2, (upper.value - lower.value) * 0.25)
      : (lower?.value ?? upper?.value ?? 0) + 5;
  const position = (value: number) =>
    LEFT + ((value - min) / (max - min)) * (RIGHT - LEFT);
  const tickStep = Math.max(1, Math.ceil((max - min) / 10));
  const ticks: number[] = [];
  for (
    let tick = Math.ceil(min / tickStep) * tickStep;
    tick <= max && ticks.length < 15;
    tick += tickStep
  ) {
    ticks.push(tick);
  }

  return (
    <div className="border-grid overflow-x-auto border bg-white p-2 sm:p-4">
      <svg
        viewBox="0 0 720 180"
        className="h-auto w-full min-w-[320px]"
        role="img"
        aria-label={copy.apps.inequality.numberLine}
      >
        <line
          x1={LEFT}
          x2={RIGHT}
          y1={Y}
          y2={Y}
          className="stroke-grid-strong"
          strokeWidth="3"
        />
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={position(tick)}
              x2={position(tick)}
              y1={Y - 8}
              y2={Y + 8}
              className="stroke-pencil"
              strokeWidth="1.5"
            />
            <text
              x={position(tick)}
              y={Y + 28}
              textAnchor="middle"
              className="fill-pencil text-[12px]"
            >
              {formatNumber(tick)}
            </text>
          </g>
        ))}
        {solution.kind !== "empty" && (
          <>
            {solution.kind === "interval" && (
              <>
                <line
                  x1={lower ? position(lower.value) : LEFT}
                  x2={upper ? position(upper.value) : RIGHT}
                  y1={Y}
                  y2={Y}
                  className="stroke-navy"
                  strokeWidth="6"
                />
                {!lower && (
                  <path d={`M${LEFT} ${Y}l13 -9v18Z`} className="fill-navy" />
                )}
                {!upper && (
                  <path d={`M${RIGHT} ${Y}l-13 -9v18Z`} className="fill-navy" />
                )}
              </>
            )}
            {lower && (
              <EndpointDot endpoint={lower} x={position(lower.value)} />
            )}
            {upper && solution.kind !== "point" && (
              <EndpointDot endpoint={upper} x={position(upper.value)} />
            )}
          </>
        )}
      </svg>
      <div className="text-pencil flex flex-wrap gap-x-5 gap-y-1 px-2 text-xs">
        <span>{copy.apps.inequality.openDot}</span>
        <span>{copy.apps.inequality.closedDot}</span>
      </div>
    </div>
  );
}

export default function InequalityNumberLine() {
  const presenting = usePresentation();
  const [input, setInput] = useState<string>(copy.apps.inequality.sampleSimple);
  const [submitted, setSubmitted] = useState<string>(
    copy.apps.inequality.sampleSimple,
  );
  const solution = solveInequality(submitted);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(input);
  }

  function chooseExample(value: string) {
    setInput(value);
    setSubmitted(value);
  }

  return (
    <div className="space-y-7">
      <p>{copy.apps.inequality.intro}</p>
      <form
        onSubmit={submit}
        className="border-grid grid gap-4 border bg-white p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
      >
        <label className="block font-semibold">
          {copy.apps.inequality.input}
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          className="bg-navy hover:bg-navy-deep rounded px-5 py-2.5 font-semibold text-white"
        >
          {copy.apps.inequality.solve}
        </button>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={() => chooseExample(copy.apps.inequality.sampleSimple)}
            className="border-grid-strong hover:bg-navy-wash rounded border px-3 py-1.5 text-sm"
          >
            {copy.apps.inequality.exampleSimple}
          </button>
          <button
            type="button"
            onClick={() => chooseExample(copy.apps.inequality.sampleCompound)}
            className="border-grid-strong hover:bg-navy-wash rounded border px-3 py-1.5 text-sm"
          >
            {copy.apps.inequality.exampleCompound}
          </button>
        </div>
      </form>
      {!solution ? (
        <p role="alert" className="border-grid border bg-white p-5">
          {copy.apps.inequality.invalid}
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
          <section className="border-grid border bg-white p-5">
            <h2 className="font-display text-card text-navy font-semibold">
              {copy.apps.inequality.steps}
            </h2>
            <ol className="mt-4 space-y-4">
              {solution.steps.map((step, index) => (
                <li
                  key={`${step.kind}-${index}`}
                  className="border-grid border-b pb-4 last:border-0 last:pb-0"
                >
                  <p className="text-pencil text-sm">
                    {step.kind === "move"
                      ? copy.apps.inequality.subtractConstant
                      : step.kind === "divide"
                        ? copy.apps.inequality.divideCoefficient
                        : copy.apps.inequality.compoundStep}
                  </p>
                  <Tex className="mt-1 block text-xl">{step.tex}</Tex>
                </li>
              ))}
            </ol>
            {solution.reversed && (
              <p className="text-navy mt-4 text-sm font-medium">
                {copy.apps.inequality.reverseSign}
              </p>
            )}
            <h3 className="text-navy mt-6 font-semibold">
              {copy.apps.inequality.solution}
            </h3>
            <Tex
              className={
                presenting ? "mt-1 block text-3xl" : "mt-1 block text-2xl"
              }
            >
              {solution.tex}
            </Tex>
            {solution.kind === "empty" && (
              <p className="mt-2">{copy.apps.inequality.noSolution}</p>
            )}
          </section>
          {solution.kind !== "empty" && <NumberLine solution={solution} />}
        </div>
      )}
    </div>
  );
}
