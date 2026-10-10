import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AdvancedGraph } from "./AdvancedGraph";
import { defaultSecond } from "./advanced";
import { copy } from "@/lib/copy";
import { Chart, chartTypes } from "./Chart";
import {
  activityLink,
  comparisonScale,
  MAX_ACTIVITY_BYTES,
  rawCSV,
  readActivity,
  tableCSV,
  type Activity,
} from "./classroom";
import { download, exportChart } from "./exports";
import { Field } from "./Editors";
import { FrequencyTable } from "./FrequencyTable";
import { groupedTable, type ChartType, type Row } from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts.classroom;
export function ChartExport({
  type,
  disabled = false,
}: {
  type: ChartType;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(format: "svg" | "png") {
    const svg = ref.current?.parentElement?.querySelector("svg");
    if (!svg) return;
    setBusy(true);
    setStatus("");
    try {
      await exportChart(svg, format, `lskc-${type}`);
      setStatus(c.downloaded);
    } catch {
      setStatus(c.exportFailed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.exportBar} ref={ref}>
      <span>{c.exportChart}</span>
      <button disabled={busy || disabled} onClick={() => void save("svg")}>
        {c.svg}
      </button>
      <button disabled={busy || disabled} onClick={() => void save("png")}>
        {c.png}
      </button>
      <span role="status">{status}</span>
    </div>
  );
}
export function ClassroomTools({
  activity,
  rows,
  onApply,
  fixed,
  onFixed,
  answers,
  onAnswers,
  onReset,
  onGenerate,
  onPresent,
  onPrint,
}: {
  activity: Activity | null;
  rows: Row[];
  onApply: (a: Activity) => void;
  fixed: boolean;
  onFixed: () => void;
  answers: boolean;
  onAnswers: () => void;
  onReset: () => void;
  onGenerate: () => void;
  onPresent: () => void;
  onPrint: () => void;
}) {
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("");
  const [prepared, setPrepared] = useState<string | null>(null);
  const [linkSnapshot, setLinkSnapshot] = useState<string | null>(null);
  const current = JSON.stringify(activity);
  const currentLink = linkSnapshot === current ? link : "";
  const currentStatus = prepared === current ? status : "";
  function message(text: string) {
    setPrepared(current);
    setStatus(text);
  }
  function save(text: string, name: string, type: string) {
    download(new Blob([text], { type }), name);
    message(c.downloaded);
  }
  async function share() {
    if (!activity) return;
    const url = activityLink(window.location.href, activity);
    setLinkSnapshot(current);
    setPrepared(current);
    setLink(url ?? "");
    if (!url) {
      setStatus(c.large);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus(c.copied);
    } catch {
      setStatus(c.copyManually);
    }
  }
  return (
    <details className={s.teacherTools}>
      <summary>
        {c.tools}
        <span>{c.toolsSummary}</span>
      </summary>
      <div className={s.toolsGrid}>
        <section>
          <h3>{c.lesson}</h3>
          <p>{c.lessonHelp}</p>
          <div className={s.toolbar}>
            <button disabled={!activity} aria-pressed={fixed} onClick={onFixed}>
              {fixed ? c.unlock : c.fix}
            </button>
            <button aria-pressed={!answers} onClick={onAnswers}>
              {answers ? c.hideAnswers : c.allowAnswers}
            </button>
            <button onClick={onReset}>{c.reset}</button>
            <button disabled={fixed} onClick={onGenerate}>
              {c.generate}
            </button>
          </div>
          <p className={s.small}>{c.controlHelp}</p>
          <div className={s.toolbar}>
            <button disabled={!activity} onClick={onPresent}>
              {c.present}
            </button>
            <button disabled={!activity} onClick={onPrint}>
              {c.print}
            </button>
          </div>
        </section>
        <section>
          <h3>{c.takeAway}</h3>
          <p>{c.shareHelp}</p>
          <div className={s.toolbar}>
            <button disabled={!activity} onClick={() => void share()}>
              {c.share}
            </button>
            <button
              disabled={!activity}
              onClick={() =>
                activity &&
                save(
                  JSON.stringify(activity, null, 2),
                  "lskc-activity.json",
                  "application/json",
                )
              }
            >
              {c.saveActivity}
            </button>
            <label className={s.file}>
              {c.openActivity}
              <input
                type="file"
                accept=".json,application/json"
                aria-label={c.openActivity}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    if (file.size > MAX_ACTIVITY_BYTES) throw new Error();
                    const a = readActivity(await file.text());
                    onApply(a);
                    setLink("");
                    setPrepared(JSON.stringify(a));
                    setStatus(c.loaded);
                  } catch {
                    message(c.invalidActivity);
                  }
                }}
              />
            </label>
          </div>
          {currentLink && (
            <Field label={c.link}>
              <textarea
                readOnly
                value={currentLink}
                onFocus={(e) => e.target.select()}
                rows={3}
              />
            </Field>
          )}
          <p className={s.small}>{c.localShare}</p>
          <div className={s.toolbar}>
            <button
              disabled={!activity || activity.source !== "raw"}
              onClick={() =>
                activity &&
                save(
                  rawCSV(activity.data as number[]),
                  "lskc-raw-data.csv",
                  "text/csv;charset=utf-8",
                )
              }
            >
              {c.rawCSV}
            </button>
            <button
              disabled={!activity}
              onClick={() =>
                save(
                  tableCSV(rows, c.csvHeaders),
                  "lskc-frequency-table.csv",
                  "text/csv;charset=utf-8",
                )
              }
            >
              {c.tableCSV}
            </button>
          </div>
          <p className={s.small}>{c.groupedCSV}</p>
        </section>
      </div>
      <p role="status" className={s.toolStatus}>
        {currentStatus}
      </p>
    </details>
  );
}
export function PrintView({
  activity,
  rows,
  types,
  onClose,
}: {
  activity: Activity;
  rows: Row[];
  types: ChartType[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const secondRows =
    activity.mode === "advanced" && activity.advanced?.panel === "twoData"
      ? groupedTable(
          activity.advanced.second ?? defaultSecond(rows),
          activity.grouping.precision,
        ).rows
      : null;
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const restoreFocus = () =>
      dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    window.addEventListener("keydown", close);
    window.addEventListener("afterprint", restoreFocus);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("afterprint", restoreFocus);
    };
  }, [onClose]);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && el !== dialog.current,
    );
    const inert = siblings.map((el) => el.inert);
    siblings.forEach((el) => {
      el.inert = true;
    });
    return () => {
      document.body.style.overflow = previous;
      siblings.forEach((el, i) => {
        el.inert = inert[i];
      });
    };
  }, []);
  return createPortal(
    <div
      ref={dialog}
      className={`${s.lab} ${s.printView}`}
      data-statistics-print="true"
      role="dialog"
      aria-modal="true"
      aria-label={c.print}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          const buttons = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              'button, [tabindex="0"]',
            ),
          );
          const first = buttons[0],
            last = buttons.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <div className={s.printToolbar}>
        <strong>{c.print}</strong>
        <div className={s.toolbar}>
          <button autoFocus onClick={() => window.print()}>
            {c.printNow}
          </button>
          <button onClick={onClose}>{c.close}</button>
        </div>
      </div>
      <div className={s.printPaper}>
        <p className={s.chapter}>{c.printBrand}</p>
        <h2>{activity.title}</h2>
        {activity.task?.instructions && (
          <p className={s.taskInstructions}>{activity.task.instructions}</p>
        )}
        <p>
          {secondRows
            ? `${copy.statisticalCharts.advanced.groupA}: ${rows.at(-1)!.cumulative} · ${copy.statisticalCharts.advanced.groupB}: ${secondRows.at(-1)?.cumulative ?? 0}`
            : `${copy.statisticalCharts.total}: ${rows.at(-1)!.cumulative}`}{" "}
          · {copy.statisticalCharts.classes}: {rows.length}
        </p>
        {activity.mode === "advanced" && activity.advanced ? (
          <div className={s.printChart}>
            <AdvancedGraph
              rows={rows}
              settings={activity.advanced}
              title={activity.title}
              axisLabel={`${activity.variable}${activity.unit ? ` (${activity.unit})` : ""}`}
              precision={activity.grouping.precision}
              display={activity.display}
              fullText
            />
          </div>
        ) : (
          types.map((type) => (
            <div className={s.printChart} key={type}>
              <Chart
                rows={rows}
                type={type}
                title={activity.title}
                axisLabel={`${activity.variable}${activity.unit ? ` (${activity.unit})` : ""}`}
                display={activity.display}
                fullText
                sharedScale={
                  types.length > 1 ? comparisonScale(rows, types) : undefined
                }
                selected={null}
                onSelect={() => {}}
              />
              <p>
                {copy.statisticalCharts.chartNotes[chartTypes.indexOf(type)]}
              </p>
            </div>
          ))
        )}
        <div className={s.printTable}>
          <h3>
            {copy.statisticalCharts.table}
            {secondRows && ` · ${copy.statisticalCharts.advanced.groupA}`}
          </h3>
          <FrequencyTable
            rows={rows}
            full
            continuous={activity.grouping.precision === 0}
            selected={null}
            onSelect={() => {}}
          />
        </div>
        {secondRows && (
          <div className={s.printTable}>
            <h3>
              {copy.statisticalCharts.table} ·{" "}
              {copy.statisticalCharts.advanced.groupB}
            </h3>
            <FrequencyTable
              rows={secondRows}
              full
              continuous={activity.grouping.precision === 0}
              selected={null}
              onSelect={() => {}}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
