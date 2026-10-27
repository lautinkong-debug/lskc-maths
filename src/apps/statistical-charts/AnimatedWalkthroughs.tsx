import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { useAnswers } from "./answers";
import { ageExamples, ageRows, conceptRows, stemLeaves } from "./concepts";
import { percentileEstimate } from "./advanced";
import { billRows, weightRows, walkthroughLengths } from "./walkthroughs";
import { histogramWalkthroughChoices } from "./walkthroughChoiceData";
import { WalkthroughChoices } from "./WalkthroughChoices";
import {
  cumulativePoints,
  curvePath,
  format,
  frequencyPoints,
  type Row,
} from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts.animation;
function Plot({
  rows,
  cumulative = false,
  count = rows.length,
  active = -1,
  curve = false,
  guide,
  title,
  axis,
  scalePeak,
}: {
  rows: Row[];
  cumulative?: boolean;
  count?: number;
  active?: number;
  curve?: boolean;
  guide?: {
    value: number;
    target: number;
    horizontal: boolean;
    vertical: boolean;
    reverse?: boolean;
  };
  title: string;
  axis: string;
  scalePeak?: number;
}) {
  const limits = frequencyPoints(rows);
  const xmin = curve ? limits[0].x : rows[0].low,
    xmax = curve ? limits.at(-1)!.x : rows.at(-1)!.high;
  const x = (n: number) => 68 + ((n - xmin) / (xmax - xmin)) * 610;
  const peak =
    scalePeak ??
    (cumulative
      ? rows.at(-1)!.cumulative
      : Math.ceil(Math.max(6, ...rows.map((r) => r.frequency)) / 4) * 4);
  const y = (n: number) => 310 - (n / peak) * 250;
  const points = cumulativePoints(rows);
  return (
    <div className={s.animationPlot}>
      <h4>{title}</h4>
      <svg viewBox="0 0 740 400" role="img" aria-label={title}>
        <path d="M68 42V310H690" fill="none" stroke="#263645" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={68}
              x2={678}
              y1={y(t * peak)}
              y2={y(t * peak)}
              stroke="#d9e5ed"
            />
            <text x={58} y={y(t * peak) + 5} textAnchor="end" fontSize={15}>
              {format(t * peak)}
            </text>
          </g>
        ))}
        {[rows[0].low, ...rows.map((r) => r.high)].map((v) => (
          <text key={v} x={x(v)} y={334} fontSize={15} textAnchor="middle">
            {format(v)}
          </text>
        ))}
        {cumulative ? (
          <>
            <polyline
              points={points.map((p) => `${x(p.x)},${y(p.y)}`).join(" ")}
              fill="none"
              stroke="#0f4574"
              strokeWidth={3}
            />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={x(p.x)}
                cy={y(p.y)}
                r={4}
                fill="white"
                stroke="#0f4574"
                strokeWidth={2}
              />
            ))}
            {active >= 0 && (
              <line
                key={active}
                x1={x(points[active].x)}
                y1={y(points[active].y)}
                x2={x(points[active + 1].x)}
                y2={y(points[active + 1].y)}
                stroke="#da2127"
                strokeWidth={5}
                pathLength={1}
                className={s.animatedGuide}
              />
            )}
          </>
        ) : (
          rows.map((r, i) => (
            <rect
              key={i}
              data-animation-bar={i}
              data-frequency={i < count ? r.frequency : 0}
              x={x(r.low)}
              width={x(r.high) - x(r.low)}
              y={y(i < count ? r.frequency : 0)}
              height={310 - y(i < count ? r.frequency : 0)}
              fill={i === active ? "#f4dd45" : "#b7cddd"}
              stroke="#0f4574"
              className={s.animatedBar}
            />
          ))
        )}
        {curve && (
          <path
            d={curvePath(frequencyPoints(rows), x, y)}
            fill="none"
            stroke="#da2127"
            strokeWidth={3}
            pathLength={1}
            className={s.animatedGuide}
          />
        )}
        {guide?.horizontal && (
          <line
            key={`h${guide.target}-${guide.reverse}`}
            data-reading-guide="horizontal"
            x1={guide.reverse ? x(guide.value) : 68}
            x2={guide.reverse ? 68 : x(guide.value)}
            y1={y(guide.target)}
            y2={y(guide.target)}
            stroke="#da2127"
            strokeWidth={3}
            pathLength={1}
            className={s.animatedGuide}
          />
        )}
        {guide?.vertical && (
          <line
            key={`v${guide.target}-${guide.reverse}`}
            data-reading-guide="vertical"
            x1={x(guide.value)}
            x2={x(guide.value)}
            y1={guide.reverse ? 310 : y(guide.target)}
            y2={guide.reverse ? y(guide.target) : 310}
            stroke="#da2127"
            strokeWidth={3}
            pathLength={1}
            className={s.animatedGuide}
          />
        )}
        {guide && (
          <>
            <text
              x={58}
              y={y(guide.target) - 8}
              textAnchor="end"
              fill="#da2127"
              fontSize={17}
            >
              {format(guide.target)}
            </text>
            {guide.vertical && (
              <text
                x={x(guide.value)}
                y={360}
                textAnchor="middle"
                fill="#da2127"
                fontSize={18}
              >
                {format(guide.value)}
              </text>
            )}
          </>
        )}
        <text x={380} y={391} textAnchor="middle" fontSize={18}>
          {axis}
        </text>
        <text
          transform="translate(19 177) rotate(-90)"
          textAnchor="middle"
          fontSize={16}
        >
          {cumulative
            ? copy.statisticalCharts.cumulative
            : copy.statisticalCharts.frequency}
        </text>
      </svg>
    </div>
  );
}
export function AnimatedWalkthroughs() {
  const [lesson, setLesson] = useState(0),
    [step, setStep] = useState(0),
    [playing, setPlaying] = useState(false),
    [delay, setDelay] = useState(2200);
  const [histogramChoice, setHistogramChoice] = useState(1);
  const [curveChoice, setCurveChoice] = useState<number | null>(null);
  const answers = useAnswers(),
    max = walkthroughLengths[lesson],
    current = answers ? step : 0;
  useEffect(() => {
    if (!playing || !answers || step >= max) return;
    const timer = setTimeout(() => setStep((n) => Math.min(max, n + 1)), delay);
    return () => clearTimeout(timer);
  }, [playing, answers, step, max, delay]);
  function move(to: number) {
    setPlaying(false);
    setStep(Math.max(0, Math.min(max, to)));
  }
  const ages = [...ageExamples[0]].sort((a, b) => a - b),
    ageData = ageRows(ages.slice(0, Math.min(15, current))),
    fullAges = ageRows(ages);
  const cumulative = conceptRows(histogramWalkthroughChoices[histogramChoice]),
    active = Math.max(0, current - 1);
  const median = percentileEstimate(billRows, 50, "polygon")!,
    percentile = percentileEstimate(billRows, 85, "polygon")!;
  const reading =
    current >= 8
      ? {
          value: 500.5,
          target: 25,
          horizontal: current >= 9,
          vertical: true,
          reverse: true,
        }
      : current >= 5
        ? {
            value: percentile.low,
            target: percentile.target,
            horizontal: current >= 6,
            vertical: current >= 7,
          }
        : {
            value: median.low,
            target: median.target,
            horizontal: current >= 3,
            vertical: current >= 4,
          };
  return (
    <section
      className={s.walkthrough}
      aria-label={c.title}
      data-comparison={lesson < 2}
    >
      <div className={s.activityHeader}>
        <div>
          <p className={s.chapter}>{c.eyebrow}</p>
          <h3>{c.title}</h3>
        </div>
        <label className={s.field}>
          {c.lesson}
          <select
            value={lesson}
            onChange={(e) => {
              setLesson(Number(e.target.value));
              setStep(0);
              setPlaying(false);
            }}
          >
            {c.lessons.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={s.animationToolbar}>
        <button
          disabled={!answers}
          onClick={() => {
            if (step >= max) setStep(0);
            setPlaying(!playing || step >= max);
          }}
        >
          {playing && step < max && answers ? c.pause : c.play}
        </button>
        <button
          disabled={!answers || current === 0}
          onClick={() => move(step - 1)}
        >
          {c.back}
        </button>
        <button
          disabled={!answers || current >= max}
          onClick={() => move(step + 1)}
        >
          {c.next}
        </button>
        <button
          disabled={!answers}
          onClick={() => {
            setStep(0);
            setPlaying(true);
          }}
        >
          {c.replay}
        </button>
        <label>
          {c.speed}
          <select
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          >
            <option value={3500}>{c.slow}</option>
            <option value={2200}>{c.normal}</option>
            <option value={900}>{c.fast}</option>
          </select>
        </label>
        <output data-testid="animation-step" aria-live="polite">
          {current} / {max}
        </output>
      </div>
      {!answers && (
        <p className={s.scaleNote}>
          {copy.statisticalCharts.classroom.answersHidden}
        </p>
      )}
      <p
        className={s.animationNarration}
        aria-live="polite"
        data-testid="animation-narration"
      >
        {lesson === 0
          ? current === 0
            ? c.leafStart
            : current <= 15
              ? `${c.countLeaf} ${ages[current - 1]} → ${Math.floor(ages[current - 1] / 10) * 10}–${Math.floor(ages[current - 1] / 10) * 10 + 9}. ${c.counted} ${current}.`
              : c.leafFinish
          : lesson === 1
            ? current === 0
              ? c.riseStart
              : `${c.interval} ${current}: ${cumulative[active].cumulative} − ${cumulative[active - 1]?.cumulative ?? 0} = ${cumulative[active].frequency}. ${cumulative[active].frequency === 0 ? c.zeroRise : c.positiveRise}`
            : lesson === 2
              ? c.weightSteps[current]
              : c.billSteps[current]}
      </p>
      {lesson === 0 && (
        <div className={s.conceptGrid}>
          <section className={s.conceptCard}>
            <h4>{copy.statisticalCharts.concepts.ages}</h4>
            <table className={s.stemTable}>
              <caption>{copy.statisticalCharts.concepts.key}</caption>
              <thead>
                <tr>
                  <th>{copy.statisticalCharts.concepts.stem}</th>
                  <th>{copy.statisticalCharts.concepts.leaf}</th>
                </tr>
              </thead>
              <tbody>
                {stemLeaves(ages).map(({ stem, leaves }) => (
                  <tr key={stem}>
                    <th>{stem}</th>
                    <td>
                      {leaves.map((leaf, j) => {
                        const n = ages.filter((v) => v < stem * 10).length + j;
                        return (
                          <span
                            key={j}
                            className={`${s.animatedLeaf} ${n < current ? s.countedLeaf : ""}`}
                            data-current={n === current - 1}
                          >
                            {leaf}
                          </span>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <Plot
            rows={current === 16 ? fullAges : ageData}
            curve={current === 16}
            active={
              current > 0 && current <= 15
                ? Math.floor(ages[current - 1] / 10) - 2
                : -1
            }
            title={c.lessons[0]}
            axis={copy.statisticalCharts.concepts.age}
          />
        </div>
      )}
      {lesson === 1 && (
        <div className={s.conceptGrid}>
          <Plot
            rows={cumulative}
            cumulative
            scalePeak={32}
            active={current ? current - 1 : -1}
            title={`${c.sourceGraph} · ${"ABCD"[histogramChoice]}`}
            axis={copy.statisticalCharts.concepts.value}
          />
          <Plot
            rows={cumulative}
            count={current}
            active={current ? current - 1 : -1}
            title={c.resultGraph}
            axis={copy.statisticalCharts.concepts.value}
          />
        </div>
      )}
      {lesson < 2 && (
        <WalkthroughChoices
          cumulative={lesson === 1}
          selected={lesson === 1 ? histogramChoice : curveChoice}
          answers={answers}
          onSelect={(i) => {
            if (lesson === 1) {
              setHistogramChoice(i);
              setStep(0);
              setPlaying(false);
            } else setCurveChoice(i);
          }}
        />
      )}
      {lesson === 2 && (
        <div className={s.conceptGrid}>
          <section className={s.conceptCard}>
            <h4>{copy.statisticalCharts.table}</h4>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>{c.weight}</th>
                  <th>{copy.statisticalCharts.frequency}</th>
                </tr>
              </thead>
              <tbody>
                {weightRows.map((r, i) => (
                  <tr
                    key={i}
                    data-selected={i === [-1, 0, 1, 2, 3, 4][current]}
                  >
                    <td>
                      {r.lower}–{r.upper}
                    </td>
                    <td>
                      <span key={`${current}-${i}`} className={s.revealValue}>
                        {i === 0 && current < 1
                          ? "a"
                          : i === 2 && current < 3
                            ? "b"
                            : r.frequency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className={s.conceptCard}>
            <h4>{copy.statisticalCharts.cumulative}</h4>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>{c.weightBelow}</th>
                  <th>{copy.statisticalCharts.cumulative}</th>
                </tr>
              </thead>
              <tbody>
                {weightRows.map((r, i) => (
                  <tr
                    key={i}
                    data-selected={i === [-1, 0, 1, 2, 3, 4][current]}
                  >
                    <td>{r.high}</td>
                    <td>
                      <span key={`${current}-${i}`} className={s.revealValue}>
                        {i === 1 && current < 2
                          ? "x"
                          : i === 3 && current < 4
                            ? "y"
                            : i === 4 && current < 5
                              ? "z"
                              : r.cumulative}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
      {lesson === 3 && (
        <>
          <p className={s.scaleNote}>{c.billNote}</p>
          <Plot
            rows={billRows}
            cumulative
            title={c.billTitle}
            axis={c.amount}
            guide={current >= 2 ? reading : undefined}
          />
          <details>
            <summary>{c.coordinates}</summary>
            <p>{c.billCoordinates}</p>
          </details>
        </>
      )}
    </section>
  );
}
