import { copy } from "@/lib/copy";
import { conceptRows } from "./concepts";
import { cumulativePoints, curvePath, frequencyPoints } from "./statistics";
import {
  curveWalkthroughChoices,
  histogramWalkthroughChoices,
} from "./walkthroughChoiceData";
import s from "./walkthroughChoices.module.css";

const c = copy.statisticalCharts.animation;
export function WalkthroughChoices({
  cumulative,
  selected,
  answers,
  onSelect,
}: {
  cumulative: boolean;
  selected: number | null;
  answers: boolean;
  onSelect: (index: number) => void;
}) {
  const choices = cumulative
    ? histogramWalkthroughChoices
    : curveWalkthroughChoices;
  return (
    <section className={s.comparison} aria-label={c.choicesTitle}>
      <div className={s.heading}>
        <h4>{c.choicesTitle}</h4>
        <p>{cumulative ? c.histogramChoiceHelp : c.curveChoiceHelp}</p>
      </div>
      <div className={s.choices}>
        {choices.map((frequencies, i) => {
          const rows = conceptRows(frequencies);
          const points = frequencyPoints(rows);
          const x = (n: number) => 32 + (n / 60) * 236;
          const y = (n: number) => 104 - n * 10;
          const cy = (n: number) => 104 - n * 2.5;
          const curveX = (n: number) =>
            32 + ((n - points[0].x) / (points.at(-1)!.x - points[0].x)) * 236;
          return (
            <button
              key={i}
              className={s.choice}
              data-cumulative={cumulative}
              aria-pressed={selected === i}
              aria-label={`${cumulative ? c.histogramChoice : c.curveChoice} ${"ABCD"[i]}`}
              onClick={() => onSelect(i)}
            >
              <span className={s.choiceHeading}>
                <b>{"ABCD"[i]}</b>
                <span>{cumulative ? c.histogramLabel : c.curveLabel}</span>
              </span>
              <svg viewBox="0 0 300 138" aria-hidden="true">
                <path d="M32 15V104H280" fill="none" stroke="#263645" />
                <text x="25" y="110" textAnchor="end">
                  0
                </text>
                <text x="150" y="133" textAnchor="middle">
                  {cumulative
                    ? copy.statisticalCharts.concepts.value
                    : copy.statisticalCharts.concepts.age}
                </text>
                <text
                  transform="translate(13 60) rotate(-90)"
                  textAnchor="middle"
                >
                  {copy.statisticalCharts.frequency}
                </text>
                {cumulative ? (
                  rows.map((r, j) => (
                    <rect
                      key={j}
                      data-choice-frequency={r.frequency}
                      x={x(r.low)}
                      y={y(r.frequency)}
                      width={x(r.high) - x(r.low)}
                      height={104 - y(r.frequency)}
                      fill="#b7cddd"
                      stroke="#0f4574"
                    />
                  ))
                ) : (
                  <path
                    key={`${selected}-${i}`}
                    className={selected === i ? s.draw : undefined}
                    d={curvePath(points, curveX, y)}
                    pathLength={1}
                    fill="none"
                    stroke={selected === i ? "#da2127" : "#0f4574"}
                    strokeWidth={3}
                  />
                )}
              </svg>
              {cumulative && (
                <>
                  <span className={s.plotLabel}>{c.polygonLabel}</span>
                  {answers ? (
                    <svg viewBox="0 0 300 138" aria-hidden="true">
                      <path d="M32 15V104H280" fill="none" stroke="#263645" />
                      <text x="25" y="110" textAnchor="end">
                        0
                      </text>
                      <text x="150" y="133" textAnchor="middle">
                        {copy.statisticalCharts.concepts.value}
                      </text>
                      <text
                        transform="translate(13 60) rotate(-90)"
                        textAnchor="middle"
                      >
                        {copy.statisticalCharts.cumulative}
                      </text>
                      <polyline
                        key={`${selected}-${i}`}
                        data-choice-polygon={"ABCD"[i]}
                        className={selected === i ? s.draw : undefined}
                        pathLength={1}
                        points={cumulativePoints(rows)
                          .map((p) => `${x(p.x)},${cy(p.y)}`)
                          .join(" ")}
                        fill="none"
                        stroke={selected === i ? "#da2127" : "#0f4574"}
                        strokeWidth={3}
                      />
                    </svg>
                  ) : (
                    <span className={s.hidden}>
                      {copy.statisticalCharts.classroom.answersHidden}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
      {selected !== null && answers && (
        <p className={s.explanation} role="status">
          {
            (cumulative ? c.histogramExplanations : c.curveExplanations)[
              selected
            ]
          }
        </p>
      )}
      {cumulative && <p className={s.note}>{c.illustrationNote}</p>}
    </section>
  );
}
