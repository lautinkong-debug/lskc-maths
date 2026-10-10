import { copy } from "@/lib/copy";
import { Chart, interval, type Display } from "./Chart";
import { comparisons, comparisonScale, type Comparison } from "./classroom";
import { Field } from "./Editors";
import { FrequencyTable } from "./FrequencyTable";
import { format, type Row } from "./statistics";
import { ChartExport } from "./ClassroomTools";
import s from "./lab.module.css";
const c = copy.statisticalCharts.classroom;
export function CompareCharts({
  rows,
  title,
  axisLabel,
  display,
  comparison,
  onChange,
  selected,
  onSelect,
  precision,
}: {
  rows: Row[];
  title: string;
  axisLabel: string;
  display: Display;
  comparison: Comparison;
  onChange: (c: Comparison) => void;
  selected: number | null;
  onSelect: (i: number) => void;
  precision: number;
}) {
  const types = comparisons[comparison];
  const row = rows[selected ?? 0] ?? rows[0];
  // All panels share an x domain and y units/count scale, including frequency vs cumulative.
  const scale = comparisonScale(rows, types);
  return (
    <section className={s.comparison} aria-label={c.compare}>
      <div className={s.comparisonHeading}>
        <div>
          <p className={s.chapter}>{c.sameData}</p>
          <h3>{c.compareTitle}</h3>
          <p>{c.compareIntro}</p>
        </div>
        <Field label={c.layout}>
          <select
            value={comparison}
            onChange={(e) => onChange(e.target.value as Comparison)}
          >
            {(Object.keys(comparisons) as Comparison[]).map((k) => (
              <option key={k} value={k}>
                {c.layouts[k]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <p className={s.scaleNote}>{c.scaleNote}</p>
      <div className={s.compareGrid}>
        {types.map((type, i) => (
          <section
            className={s.compareCard}
            key={type}
            data-comparison-chart={type}
          >
            <div className={s.compareNumber}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>
                {
                  copy.statisticalCharts.chartNames[
                    comparisons.all.indexOf(type)
                  ]
                }
              </strong>
            </div>
            <Chart
              rows={rows}
              type={type}
              title={title}
              axisLabel={axisLabel}
              display={display}
              selected={selected}
              onSelect={onSelect}
              sharedScale={scale}
            />
            <p className={s.chartNote}>
              {copy.statisticalCharts.chartNotes[comparisons.all.indexOf(type)]}
            </p>
            <ChartExport type={type} />
          </section>
        ))}
        {comparison === "all" && (
          <aside className={s.readingPanel} aria-live="polite">
            <p className={s.chapter}>{c.reading}</p>
            <h3>{interval(row, precision === 0)}</h3>
            <div className={s.readingCounts}>
              <div>
                <strong>{row.frequency}</strong>
                <span>{copy.statisticalCharts.frequency}</span>
              </div>
              <div>
                <strong>{row.cumulative}</strong>
                <span>{copy.statisticalCharts.cumulative}</span>
              </div>
            </div>
            <p>{c.countInClass}</p>
            <p>
              <strong>{row.cumulative}</strong> {c.belowBoundary}{" "}
              <strong>{format(row.high)}</strong>.
            </p>
            <div className={s.readingRule} />
            <p>{c.readingHelp}</p>
          </aside>
        )}
      </div>
      <section className={s.tablePanel}>
        <div className={s.sectionHeader}>
          <h3>{copy.statisticalCharts.table}</h3>
          <span>{c.linked}</span>
        </div>
        <FrequencyTable
          rows={rows}
          full
          continuous={precision === 0}
          selected={selected}
          onSelect={onSelect}
        />
      </section>
    </section>
  );
}
