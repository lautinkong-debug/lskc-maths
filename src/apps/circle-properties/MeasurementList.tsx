import MathText from "./MathText";
import s from "./measurement-list.module.css";

/** A text alternative to reading values off the drawing. */
export default function MeasurementList({
  label,
  measurements,
}: {
  label: string;
  measurements: ReadonlyArray<{ label: string; value: number; unit: string }>;
}) {
  if (!measurements.length) return null;
  return (
    <dl className={s.list} aria-label={label}>
      {measurements.map((m) => (
        <div key={m.label}>
          <dt>
            <MathText notation>{m.label}</MathText>
          </dt>
          <dd>
            {Number(m.value.toFixed(m.unit ? 1 : 3))}
            {m.unit === "cm" ? " cm" : m.unit}
          </dd>
        </div>
      ))}
    </dl>
  );
}
