import type { LabId } from "./content";
import type { Parameters } from "./geometry";
import { getMeasurementLayout } from "./diagramLayout";
import { MathSvgText } from "./MathText";
import s from "./measurements.module.css";

/** Live values next to the objects being compared; never changes the construction. */
export default function DiagramMeasurements({
  lab,
  parameters,
  missionIndex,
}: {
  lab: LabId;
  parameters: Parameters;
  missionIndex?: number;
}) {
  const measurements = getMeasurementLayout(lab, parameters, missionIndex);
  if (!measurements.length) return null;
  return (
    <g className={s.measurements} aria-label="Lengths on the construction">
      {measurements.map((measurement) => {
        const { label, box } = measurement;
        return (
          <g key={measurement.name} className={s[measurement.tone]}>
            {measurement.guide && (
              <line
                className={s.guide}
                x1={measurement.guide.from.x}
                y1={measurement.guide.from.y}
                x2={measurement.guide.to.x}
                y2={measurement.guide.to.y}
              />
            )}
            <line
              className={s.leader}
              x1={measurement.anchor.x}
              y1={measurement.anchor.y}
              x2={box.x}
              y2={box.y}
            />
            <rect
              className={s.background}
              x={box.x - box.width / 2}
              y={box.y - box.height / 2}
              width={box.width}
              height={box.height}
              rx="5"
            />
            <MathSvgText
              className={s.value}
              x={box.x}
              y={box.y}
              textAnchor="middle"
              dominantBaseline="middle"
              data-measurement={measurement.name}
            >
              {label}
            </MathSvgText>
          </g>
        );
      })}
    </g>
  );
}
