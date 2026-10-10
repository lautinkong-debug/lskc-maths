import { cloneElement, useId, useState, type ReactElement } from "react";
import { copy } from "@/lib/copy";
import {
  MAX_CLASSES,
  MAX_DATA,
  parseData,
  tidy,
  type Group,
  type Shape,
} from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts;
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div className={s.field}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  );
}
export function NumberField({
  label,
  value,
  onChange,
  step = "any",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string | number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? NaN : Number(e.target.value))
        }
      />
    </Field>
  );
}
export type Generator = {
  context: string;
  min: number;
  max: number;
  size: number;
  precision: number;
  seed: string;
  shape: Shape;
};
export const shapes: Shape[] = [
  "uniform",
  "symmetric",
  "positive",
  "negative",
  "bimodal",
];
export function DatasetGenerator({
  value,
  onChange,
  onContext,
  onGenerate,
}: {
  value: Generator;
  onChange: (v: Generator) => void;
  onContext: (index: number) => void;
  onGenerate: (fresh: boolean) => void;
}) {
  return (
    <>
      <Field label={c.context}>
        <select
          value={value.context}
          onChange={(e) => onContext(Number(e.target.value))}
        >
          {c.contexts.map((p, i) => (
            <option key={p.name} value={i}>
              {p.name}
            </option>
          ))}
          <option value="-1">{c.custom}</option>
        </select>
      </Field>
      <div className={s.pair}>
        <NumberField
          label={c.min}
          value={value.min}
          onChange={(min) => onChange({ ...value, min })}
        />
        <NumberField
          label={c.max}
          value={value.max}
          onChange={(max) => onChange({ ...value, max })}
        />
      </div>
      <NumberField
        label={c.size}
        step="1"
        value={value.size}
        onChange={(size) => onChange({ ...value, size })}
      />
      <div className={s.presets}>
        {[20, 30, 40, 50, 100].map((size) => (
          <button
            key={size}
            aria-pressed={value.size === size}
            onClick={() => onChange({ ...value, size })}
          >
            {size}
          </button>
        ))}
      </div>
      <Field label={c.shape}>
        <select
          value={value.shape}
          onChange={(e) =>
            onChange({ ...value, shape: e.target.value as Shape })
          }
        >
          {shapes.map((shape, i) => (
            <option key={shape} value={shape}>
              {c.shapes[i]}
            </option>
          ))}
        </select>
      </Field>
      <Field label={c.seed}>
        <input
          maxLength={80}
          value={value.seed}
          onChange={(e) => onChange({ ...value, seed: e.target.value })}
        />
      </Field>
      <button className={s.primary} onClick={() => onGenerate(true)}>
        {c.generate}
      </button>
      <button onClick={() => onGenerate(false)}>{c.reproduce}</button>
    </>
  );
}
export function RawDataEditor({
  values,
  onChange,
  onError,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  onError: (e: string) => void;
}) {
  const [paste, setPaste] = useState("");
  function apply(text: string) {
    try {
      onChange(parseData(text).map(String));
      onError("");
    } catch (e) {
      onError((e as Error).message);
    }
  }
  function sort(reverse: boolean) {
    try {
      const data = values.map((v) => {
        const parsed = parseData(v);
        if (parsed.length !== 1) throw new Error("numbers");
        return parsed[0];
      });
      onChange(data.sort((a, b) => (reverse ? b - a : a - b)).map(String));
      onError("");
    } catch {
      onError("numbers");
    }
  }
  return (
    <div className={s.editor}>
      <div className={s.toolbar}>
        <button
          disabled={values.length >= MAX_DATA}
          onClick={() => onChange([...values, "0"])}
        >
          {c.add}
        </button>
        <button onClick={() => sort(false)}>{c.ascending}</button>
        <button onClick={() => sort(true)}>{c.descending}</button>
        <button onClick={() => onChange([])}>{c.clear}</button>
      </div>
      <div className={s.dataGrid}>
        {values.slice(0, 100).map((v, i) => (
          <div key={i}>
            <label>
              <span>{i + 1}</span>
              <input
                aria-label={`${c.observation} ${i + 1}`}
                type="number"
                step="any"
                value={v}
                onChange={(e) =>
                  onChange(
                    values.map((old, j) => (i === j ? e.target.value : old)),
                  )
                }
              />
            </label>
            <button
              aria-label={`${c.remove} ${c.observation} ${i + 1}`}
              onClick={() => onChange(values.filter((_, j) => i !== j))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {!values.length && <p>{c.empty}</p>}
      {values.length > 100 && <p>{c.gridLimit}</p>}
      <details>
        <summary>{c.fullData}</summary>
        <button onClick={() => setPaste(values.join(", "))}>
          {c.fullData}
        </button>
      </details>
      <Field label={c.paste}>
        <textarea
          rows={3}
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
        />
      </Field>
      <p className={s.small}>{c.pasteHint}</p>
      <div className={s.toolbar}>
        <button onClick={() => apply(paste)}>{c.replace}</button>
        <label className={s.file}>
          {c.import}
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 1e6) onError("import");
                else
                  try {
                    apply(await file.text());
                  } catch {
                    onError("import");
                  }
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
export function GroupedFrequencyEditor({
  groups,
  precision,
  onChange,
}: {
  groups: Group[];
  precision: number;
  onChange: (g: Group[]) => void;
}) {
  return (
    <div className={s.editor}>
      <p className={s.small}>{c.groupedNote}</p>
      <div className={s.groupedGrid}>
        {groups.map((g, i) => (
          <fieldset key={i}>
            <legend>
              {c.interval} {i + 1}
            </legend>
            <div className={s.groupRow}>
              {(["lower", "upper", "frequency"] as const).map((key) => (
                <NumberField
                  key={key}
                  label={
                    key === "frequency"
                      ? c.frequency
                      : precision === 0
                        ? key === "lower"
                          ? c.lowerBoundary
                          : c.upperBoundary
                        : c[key]
                  }
                  value={g[key]}
                  onChange={(v) =>
                    onChange(
                      groups.map((old, j) =>
                        i === j ? { ...g, [key]: v } : old,
                      ),
                    )
                  }
                />
              ))}
              <button
                aria-label={`${c.remove} ${c.interval} ${i + 1}`}
                onClick={() => onChange(groups.filter((_, j) => i !== j))}
              >
                ×
              </button>
            </div>
          </fieldset>
        ))}
      </div>
      <button
        disabled={groups.length >= MAX_CLASSES}
        onClick={() => {
          const last = groups.at(-1);
          const lower = last ? tidy(last.upper + precision) : 0;
          const width = last ? tidy(last.upper - last.lower + precision) : 10;
          onChange([
            ...groups,
            { lower, upper: tidy(lower + width - precision), frequency: 0 },
          ]);
        }}
      >
        {c.addRow}
      </button>
    </div>
  );
}
