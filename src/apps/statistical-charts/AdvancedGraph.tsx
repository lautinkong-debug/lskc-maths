import { copy } from "@/lib/copy";
import { Chart, type Display } from "./Chart";
import {
  defaultSecond,
  matchingClasses,
  percentageRows,
  percentileEstimate,
  type AdvancedSettings,
} from "./advanced";
import { format, groupedTable, type Row } from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts.advanced;
export function AdvancedGraph({
  rows,
  settings,
  title,
  axisLabel,
  precision,
  display,
  fullText = false,
}: {
  rows: Row[];
  settings: AdvancedSettings;
  title: string;
  axisLabel: string;
  precision: number;
  display: Display;
  fullText?: boolean;
}) {
  const two = settings.panel === "twoData",
    percent = two && settings.measure === "percent",
    cumulative = !two || settings.graph === "cumulative";
  const b = groupedTable(settings.second ?? defaultSecond(rows), precision);
  if (two && (b.error || !matchingClasses(rows, b.rows)))
    return (
      <p role="alert" className={s.error}>
        {c.mismatch}
      </p>
    );
  if (rows.at(-1)!.cumulative === 0 || (two && b.total === 0))
    return <p className={s.empty}>{c.noTotal}</p>;
  const aRows = percent ? percentageRows(rows) : rows,
    bRows = percent ? percentageRows(b.rows) : b.rows;
  const type = cumulative
    ? settings.method === "curve"
      ? "cumulativeCurve"
      : "cumulativePolygon"
    : settings.method === "curve"
      ? "curve"
      : "polygon";
  const peak = cumulative
    ? Math.max(aRows.at(-1)!.cumulative, two ? bRows.at(-1)!.cumulative : 0)
    : Math.max(
        ...aRows.map((r) => r.frequency),
        ...bRows.map((r) => r.frequency),
      );
  const estimate = percentileEstimate(
    rows,
    settings.percentile,
    settings.method,
  );
  return (
    <Chart
      rows={aRows}
      secondRows={two ? bRows : undefined}
      type={type}
      title={title}
      axisLabel={axisLabel}
      display={{ ...display, labels: false, overlay: false, both: false }}
      selected={null}
      onSelect={() => {}}
      fullText={fullText}
      sharedScale={{
        min: cumulative ? rows[0].low : rows[0].mark - rows[0].width,
        max: cumulative ? rows.at(-1)!.high : rows.at(-1)!.mark + rows[0].width,
        peak,
      }}
      verticalLabel={
        percent
          ? cumulative
            ? c.cumulativePercent
            : c.frequencyPercent
          : undefined
      }
      guide={
        !two && estimate
          ? {
              ...estimate,
              label: `P${settings.percentile} · ${format(estimate.target)}`,
            }
          : undefined
      }
    />
  );
}
