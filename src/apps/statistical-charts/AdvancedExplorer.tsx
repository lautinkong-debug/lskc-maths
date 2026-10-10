import { copy } from "@/lib/copy";
import { Math as Tex } from "@/components/Math";
import { Field, NumberField } from "./Editors";
import { interval, type Display } from "./Chart";
import { AdvancedGraph } from "./AdvancedGraph";
import { ChartExport } from "./ClassroomTools";
import {
  defaultSecond,
  percentileEstimate,
  matchingClasses,
  rawMedian,
  type AdvancedSettings,
  type Estimate,
} from "./advanced";
import { format, groupedTable, type Row } from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts.advanced;
export function estimateText(e: Estimate | null) {
  if (!e) return "—";
  const f = (n: number) => format(Number(n.toFixed(2)));
  return Math.abs(e.high - e.low) < 1e-7
    ? f(e.low)
    : `${f(e.low)}–${f(e.high)}`;
}
export function AdvancedExplorer({
  rows,
  title,
  axisLabel,
  precision,
  display,
  settings,
  onChange,
  raw,
  fixed,
}: {
  rows: Row[];
  title: string;
  axisLabel: string;
  precision: number;
  display: Display;
  settings: AdvancedSettings;
  onChange: (s: AdvancedSettings) => void;
  raw?: number[];
  fixed: boolean;
}) {
  const two = settings.panel === "twoData",
    second = settings.second ?? defaultSecond(rows),
    b = groupedTable(second, precision),
    estimate = percentileEstimate(rows, settings.percentile, settings.method);
  const update = (patch: Partial<AdvancedSettings>) =>
    onChange({ ...settings, ...patch });
  const type =
    !two || settings.graph === "cumulative"
      ? settings.method === "curve"
        ? "cumulativeCurve"
        : "cumulativePolygon"
      : settings.method === "curve"
        ? "curve"
        : "polygon";
  return (
    <section className={s.advanced} aria-label={c.title}>
      <div className={s.comparisonHeading}>
        <div>
          <p className={s.chapter}>{c.eyebrow}</p>
          <h3>{two ? c.twoTitle : c.percentileTitle}</h3>
          <p>{two ? c.twoIntro : c.percentileIntro}</p>
        </div>
        <Field label={c.exploration}>
          <select
            value={settings.panel}
            onChange={(e) =>
              update({ panel: e.target.value as AdvancedSettings["panel"] })
            }
          >
            <option value="percentiles">{c.percentiles}</option>
            <option value="twoData">{c.twoData}</option>
          </select>
        </Field>
      </div>
      <div className={s.advancedLayout}>
        <div>
          <div className={s.advancedControls}>
            <Field label={c.method}>
              <select
                value={settings.method}
                onChange={(e) =>
                  update({
                    method: e.target.value as AdvancedSettings["method"],
                  })
                }
              >
                <option value="polygon">{c.polygon}</option>
                <option value="curve">{c.curve}</option>
              </select>
            </Field>
            {two ? (
              <>
                <Field label={c.graph}>
                  <select
                    value={settings.graph}
                    onChange={(e) =>
                      update({
                        graph: e.target.value as AdvancedSettings["graph"],
                      })
                    }
                  >
                    <option value="cumulative">{c.cumulativeGraph}</option>
                    <option value="frequency">{c.frequencyGraph}</option>
                  </select>
                </Field>
                <Field label={c.scale}>
                  <select
                    value={settings.measure}
                    onChange={(e) =>
                      update({
                        measure: e.target.value as AdvancedSettings["measure"],
                      })
                    }
                  >
                    <option value="percent">{c.percent}</option>
                    <option value="count">{c.count}</option>
                  </select>
                </Field>
              </>
            ) : (
              <Field label={`${c.percentile}: ${settings.percentile}%`}>
                <input
                  aria-label={c.percentile}
                  type="range"
                  min={1}
                  max={99}
                  value={settings.percentile}
                  onChange={(e) =>
                    update({ percentile: Number(e.target.value) })
                  }
                />
              </Field>
            )}
          </div>
          <section className={s.chartPanel}>
            <AdvancedGraph
              rows={rows}
              settings={settings}
              title={title}
              axisLabel={axisLabel}
              precision={precision}
              display={display}
            />
            <p className={s.chartNote}>
              {two
                ? c.fairComparison
                : settings.method === "curve"
                  ? c.curveNote
                  : c.polygonNote}
            </p>
            <ChartExport
              type={type}
              disabled={
                rows.at(-1)!.cumulative === 0 ||
                (two &&
                  (!!b.error ||
                    b.total === 0 ||
                    !matchingClasses(rows, b.rows)))
              }
            />
          </section>
        </div>
        <aside className={s.analysisAside}>
          {two ? (
            <>
              <h3>{c.sampleSizes}</h3>
              <div className={s.readingCounts}>
                <div>
                  <strong>{rows.at(-1)!.cumulative}</strong>
                  <span>{c.groupA}</span>
                </div>
                <div>
                  <strong>{b.error ? "—" : b.total}</strong>
                  <span>{c.groupB}</span>
                </div>
              </div>
              <p>{c.fairComparison}</p>
              <p>{c.sameVariable}</p>
              <button
                disabled={fixed}
                onClick={() => update({ second: defaultSecond(rows) })}
              >
                {c.resetB}
              </button>
            </>
          ) : (
            <>
              <h3>{c.reading}</h3>
              <p>{c.step1}</p>
              <Tex>{`N=${rows.at(-1)!.cumulative},\\quad \\frac{${settings.percentile}}{100}\\times N=${format(estimate?.target ?? 0)}`}</Tex>
              <p>{c.step2}</p>
              <div
                className={s.estimateValue}
                data-testid="percentile-estimate"
              >
                {estimateText(estimate)}
              </div>
              <p>{c.estimateNote}</p>
              {estimate && estimate.high - estimate.low > 1e-7 && (
                <p className={s.chartNote}>{c.flatNote}</p>
              )}
              {raw && (
                <p>
                  {c.rawMedian}: <strong>{format(rawMedian(raw) ?? 0)}</strong>
                  <br />
                  {c.rawNote}
                </p>
              )}
            </>
          )}
        </aside>
      </div>
      {!two && (
        <div className={s.quartiles}>
          {[25, 50, 75].map((p, i) => (
            <button
              key={p}
              aria-pressed={settings.percentile === p}
              onClick={() => update({ percentile: p })}
            >
              <span>{c.quartiles[i]}</span>
              <strong>
                {estimateText(percentileEstimate(rows, p, settings.method))}
              </strong>
              <small>
                P{p} · {p}%
              </small>
            </button>
          ))}
        </div>
      )}
      {two && (
        <section className={s.tablePanel}>
          <div className={s.sectionHeader}>
            <h3>{c.editB}</h3>
            <span>{c.sameClasses}</span>
          </div>
          <fieldset disabled={fixed} className={s.settingsFieldset}>
            <div className={s.secondEditor}>
              {second.map((g, i) => (
                <NumberField
                  key={`${g.lower}-${g.upper}`}
                  label={`${c.groupB} · ${interval({ ...g, low: g.lower - precision / 2, high: g.upper + precision / 2, mark: 0, width: 0, cumulative: 0 }, precision === 0)}`}
                  value={g.frequency}
                  onChange={(frequency) =>
                    update({
                      second: second.map((v, j) =>
                        i === j ? { ...v, frequency } : v,
                      ),
                    })
                  }
                />
              ))}
            </div>
          </fieldset>
        </section>
      )}
    </section>
  );
}
