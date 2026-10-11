import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { Math as MathText } from "@/components/Math";
import { useAnswers } from "./answers";
import { format, tidy } from "./statistics";
import {
  boundaryMembership,
  boundarySteps,
  classVocabulary,
} from "./vocabularyModel";
import s from "./boundary.module.css";

const c = copy.statisticalCharts.vocabulary.boundaryLesson;
type Example = { lower: number; upper: number; precision: number };

export function BoundaryLesson({ example }: { example: Example }) {
  const { lower, upper, precision } = example;
  const allowed = useAnswers();
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [manual, setManual] = useState<number | null>(null);
  const v = classVocabulary(lower, upper, precision);
  const values = boundarySteps(lower, upper, precision);
  const value = manual ?? values[stage];
  const member = boundaryMembership(value, lower, upper, precision);
  const joined = stage > 0;
  const start = tidy(v.low - v.width);
  const x = (n: number) => 65 + ((n - start) / (3 * v.width)) * 690;
  const labels = [c.previousClass, c.thisClass, c.nextClass];

  useEffect(() => {
    if (!playing || !allowed) return;
    const timer = setTimeout(() => {
      if (stage === values.length - 1) setPlaying(false);
      else setStage((n) => n + 1);
    }, 2600);
    return () => clearTimeout(timer);
  }, [playing, stage, allowed, values.length]);

  function go(next: number) {
    setStage(next);
    setManual(null);
    setPlaying(false);
  }

  return (
    <section className={s.lesson} aria-label={c.title}>
      <div className={s.heading}>
        <h4>{c.title}</h4>
        <p>{c.intro}</p>
      </div>
      {!allowed ? (
        <p>{copy.statisticalCharts.classroom.answersHidden}</p>
      ) : (
        <>
          <div className={s.controls}>
            <button
              onClick={() => {
                setManual(null);
                if (!playing && stage === values.length - 1) setStage(0);
                setPlaying(!playing);
              }}
            >
              {playing ? c.pause : c.play}
            </button>
            <button disabled={stage === 0} onClick={() => go(stage - 1)}>
              {c.previous}
            </button>
            <button
              disabled={stage === values.length - 1}
              onClick={() => go(stage + 1)}
            >
              {c.next}
            </button>
            <button onClick={() => go(0)}>{c.replay}</button>
            <span>
              {stage + 1} / {values.length}
            </span>
          </div>
          <div className={s.grid}>
            <div className={s.plot}>
              <p className={s.caption}>{c.listed}</p>
              <svg
                viewBox="0 0 820 365"
                role="img"
                aria-label={c.diagram}
                data-testid="boundary-animation"
              >
                {[-1, 0, 1].map((i) => (
                  <g key={i}>
                    <rect
                      x={x(v.low + i * v.width)}
                      y={8}
                      width={230}
                      height={50}
                      fill={
                        joined && member.index === i ? "#fff0a3" : "#eef3f7"
                      }
                      stroke="#0f4574"
                    />
                    <text
                      x={x(v.mark + i * v.width)}
                      y={41}
                      textAnchor="middle"
                      fontSize={24}
                      fill="#0f4574"
                    >
                      {format(lower + i * v.width)}–
                      {format(upper + i * v.width)}
                    </text>
                  </g>
                ))}
                <text x={65} y={106} fontSize={19} fill="#0f4574">
                  {c.continuous}
                </text>
                {[-1, 0, 1].map((i) => {
                  const left = joined ? v.low : lower;
                  const right = joined ? v.high : upper;
                  return (
                    <rect
                      key={i}
                      data-testid={`boundary-range-${i + 1}`}
                      className={s.range}
                      x={x(left + i * v.width)}
                      y={185}
                      width={x(right) - x(left)}
                      height={70}
                      fill={
                        joined && member.index === i ? "#fff0a3" : "#eef3f7"
                      }
                      stroke="#0f4574"
                      strokeWidth={2}
                    />
                  );
                })}
                {!joined && (
                  <>
                    <path
                      d={`M${x(lower - precision)} 268v9H${x(lower)}v-9`}
                      fill="none"
                      stroke="#da2127"
                      strokeWidth={3}
                    />
                    <text
                      x={x(v.low)}
                      y={314}
                      textAnchor="middle"
                      fontSize={19}
                      fill="#b31921"
                    >
                      {c.gap}
                    </text>
                  </>
                )}
                {(joined
                  ? [start, v.low, v.high, tidy(v.high + v.width)]
                  : [tidy(upper - v.width), lower, upper, tidy(lower + v.width)]
                ).map((n) => (
                  <g key={n}>
                    <line
                      x1={x(n)}
                      x2={x(n)}
                      y1={185}
                      y2={264}
                      stroke="#0f4574"
                      strokeDasharray="3 4"
                    />
                    <text
                      x={x(n)}
                      y={joined ? 286 : n === lower || n === upper ? 295 : 275}
                      textAnchor="middle"
                      fontSize={22}
                      fill="#0f4574"
                    >
                      {format(n)}
                    </text>
                  </g>
                ))}
                {joined && (
                  <text
                    x={410}
                    y={330}
                    textAnchor="middle"
                    fontSize={20}
                    fill="#0f4574"
                  >
                    {c.noGaps}
                  </text>
                )}
                <g
                  className={s.measurement}
                  style={{ transform: `translateX(${x(value)}px)` }}
                  data-testid="boundary-pointer"
                >
                  <rect
                    x={-49}
                    y={122}
                    width={98}
                    height={36}
                    rx={18}
                    fill="#0f4574"
                  />
                  <text y={147} textAnchor="middle" fontSize={23} fill="white">
                    {format(value)}
                  </text>
                  <path
                    d="M0 158V174 M-6 168L0 177L6 168"
                    fill="none"
                    stroke="#da2127"
                    strokeWidth={3}
                  />
                </g>
              </svg>
              <div
                className={s.narration}
                aria-live="polite"
                data-testid="boundary-narration"
              >
                <strong>{manual === null ? c.stages[stage] : c.drag}</strong>
                <p>{manual === null ? c.explanations[stage] : c.endpoint}</p>
                {stage === 1 && manual === null && (
                  <MathText
                    label={`(${format(lower - precision)} + ${lower}) ÷ 2 = ${v.low}`}
                  >{`\\dfrac{${format(lower - precision)}+${lower}}{2}=${v.low}`}</MathText>
                )}
              </div>
            </div>
            <div className={s.assignment}>
              <h4>{c.assignment}</h4>
              <dl>
                <div>
                  <dt>{c.actual}</dt>
                  <dd>{format(value)}</dd>
                </div>
                <div>
                  <dt>{c.recorded}</dt>
                  <dd>{joined ? format(member.recorded) : "?"}</dd>
                </div>
              </dl>
              <p className={s.rounding}>
                {c.rounding} {precision}.
              </p>
              <div className={s.classes}>
                {[-1, 0, 1].map((i) => (
                  <div
                    key={i}
                    className={s.classRow}
                    data-active={joined && member.index === i}
                    data-testid={`boundary-class-${i + 1}`}
                  >
                    <span>
                      {labels[i + 1]}{" "}
                      <b>
                        {format(lower + i * v.width)}–
                        {format(upper + i * v.width)}
                      </b>
                    </span>
                    <strong>
                      {joined
                        ? `${format(v.low + i * v.width)} ≤ x < ${format(v.high + i * v.width)}`
                        : "?"}
                    </strong>
                  </div>
                ))}
              </div>
              <p
                role="status"
                className={s.result}
                data-testid="boundary-membership"
              >
                {joined
                  ? `${format(value)} → ${c.belongs} ${format(member.lower)}–${format(member.upper)}`
                  : c.unassigned}
              </p>
              <p className={s.convention}>{c.convention}</p>
              {joined && (
                <label className={s.slider}>
                  {c.drag}: <b>{format(value)}</b>
                  <input
                    type="range"
                    min={tidy(v.low - precision / 2)}
                    max={tidy(v.high + precision / 2)}
                    step={precision / 10}
                    value={value}
                    onChange={(e) => {
                      setManual(Number(e.target.value));
                      setPlaying(false);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
