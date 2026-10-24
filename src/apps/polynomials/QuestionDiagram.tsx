import { Math as MathNotation } from "@/components/Math";
import { copy } from "@/lib/copy";
import type { Lesson } from "./lesson-types";
import styles from "./polynomials.module.css";
const c = copy.polynomials;
function Label({
  x,
  y,
  tex,
  width = 180,
}: {
  x: number;
  y: number;
  tex: string;
  width?: number;
}) {
  return (
    <foreignObject x={x - width / 2} y={y - 15} width={width} height={45}>
      <div className={styles.diagramMath}>
        <MathNotation>{tex}</MathNotation>
      </div>
    </foreignObject>
  );
}
export function QuestionDiagram({
  lesson,
  step,
}: {
  lesson: Lesson;
  step: number;
}) {
  const kind = lesson.diagram;
  const face = lesson.part === "b" && step >= 1 && step <= 3 ? step - 1 : null;
  const stroke = "var(--color-navy)",
    wash = "var(--color-navy-wash)",
    active = "var(--color-highlight)";
  const style = { stroke, strokeWidth: 3, fill: wash };
  const label = (x: number, y: number, name: string) => (
    <text x={x} y={y} fill={stroke} stroke="none" fontSize="20">
      {name}
    </text>
  );
  return (
    <figure className={styles.diagram}>
      <svg viewBox="0 0 600 310" role="img" aria-label={c.diagramLabel}>
        {kind === "l-shape" ? (
          <>
            <path
              d="M210 40H430V260H330V140H210Z"
              {...style}
              fill={step >= 0 ? active : wash}
            />
            <path
              d="M210 140V260H330"
              stroke={stroke}
              strokeWidth="1"
              strokeDasharray="6 5"
              fill="none"
            />
            {label(190, 32, "D")}
            {label(435, 32, "C")}
            {label(435, 280, "B")}
            {label(330, 282, "P")}
            {label(335, 135, "Q")}
            {label(188, 144, "R")}
            {label(190, 282, "A")}
            <Label x={122} y={142} tex="(3x+5)\text{ cm}" />
            <Label x={270} y={282} tex="2x\text{ cm}" width={100} />
            {step >= 0 && (
              <path
                d="M210 40H430V260H330V140H210V40"
                stroke={stroke}
                strokeWidth="5"
                fill="none"
              />
            )}
          </>
        ) : kind === "quadrilateral-area" ? (
          <>
            <path d="M260 80V250H430L362 46Z" {...style} />
            {step >= 1 && lesson.part === "b" && (
              <>
                <path
                  data-testid="triangle-ABC"
                  data-active={step !== 3}
                  d="M260 80V250H430Z"
                  fill={step !== 3 ? active : wash}
                />
                <path
                  data-testid="triangle-ADC"
                  data-active={step !== 2}
                  d="M260 80L430 250L362 46Z"
                  fill={step !== 2 ? active : wash}
                />
                <path
                  d="M260 80L430 250"
                  stroke={stroke}
                  strokeWidth="3"
                  strokeDasharray="8 5"
                />
              </>
            )}
            <path
              d="M260 236H274V250M349 50L353 63L366 59"
              fill="none"
              stroke={stroke}
              strokeWidth="2"
            />
            {label(243, 77, "A")}
            {label(243, 268, "B")}
            {label(435, 269, "C")}
            {label(367, 40, "D")}
            <Label x={155} y={160} tex="(6x-4)\text{ cm}" />
            <Label x={345} y={278} tex="(x^2-1)\text{ cm}" />
            <Label x={487} y={145} tex="6x\text{ cm}" width={100} />
          </>
        ) : kind === "rectangle" ? (
          <>
            <rect
              x="150"
              y="65"
              width="300"
              height="175"
              {...style}
              fill={step >= 3 ? active : wash}
            />
            {label(132, 60, "A")}
            {label(132, 259, "B")}
            {label(454, 259, "C")}
            {label(454, 60, "D")}
            <Label x={300} y={34} tex="(3a+1)\text{ cm}" />
            <Label x={515} y={145} tex="(2a+3)\text{ cm}" width={165} />
          </>
        ) : kind === "cuboid" ? (
          <>
            <path d="M140 100L220 50H460V180L380 230H140Z" {...style} />
            <path
              d="M140 100H380V230H140Z"
              {...style}
              fill={step >= 0 && (face === null || face === 1) ? active : wash}
            />
            <path
              d="M140 100L220 50H460L380 100Z"
              {...style}
              fill={step >= 0 && (face === null || face === 0) ? active : wash}
            />
            <path
              d="M380 100L460 50V180L380 230Z"
              {...style}
              fill={step >= 0 && (face === null || face === 2) ? active : wash}
            />
            <path
              d="M140 230L220 180H460M220 180V50"
              fill="none"
              stroke={stroke}
              strokeDasharray="6 5"
            />
            <Label x={260} y={265} tex="(x+5)\text{ cm}" />
            <Label x={494} y={224} tex="(x-5)\text{ cm}" width={165} />
            <Label x={85} y={150} tex="(2x+1)\text{ cm}" width={160} />
          </>
        ) : kind === "quadrilateral-sides" ? (
          <>
            <path d="M160 70L125 230L435 250L465 90Z" {...style} />
            {label(145, 61, "A")}
            {label(105, 247, "B")}
            {label(438, 270, "C")}
            {label(470, 85, "D")}
            <Label x={80} y={140} tex="61-15x" width={155} />
            <Label x={280} y={270} tex="x^2+3x" />
            <Label x={515} y={165} tex="12x+5" width={150} />
            <Label x={315} y={45} tex="6x^2-4" />
          </>
        ) : (
          <>
            <path
              d={
                kind === "triangle-perimeter"
                  ? "M230 45V235H455Z"
                  : "M290 45L140 235H455Z"
              }
              {...style}
              fill={step >= 0 ? active : wash}
            />
            {label(
              kind === "triangle-perimeter" ? 215 : 280,
              32,
              kind === "triangle-sides" ? "P" : "C",
            )}
            {label(
              kind === "triangle-perimeter" ? 212 : 122,
              253,
              kind === "triangle-sides" ? "Q" : "A",
            )}
            {label(459, 253, kind === "triangle-sides" ? "R" : "B")}
            {kind === "triangle-perimeter" ? (
              <>
                <Label x={170} y={125} tex="x+2" width={100} />
                <Label x={340} y={263} tex="2x" />
                <Label x={400} y={115} tex="x^2-6" />
              </>
            ) : null}
          </>
        )}
      </svg>
      {kind === "triangle-sides" && (
        <div className={styles.dimensionList}>
          {lesson.diagramLabels?.map((t, i) => (
            <p key={i}>{t.replace(/\^2/g, "²").replace(/\^3/g, "³")}</p>
          ))}
        </div>
      )}
      {kind === "cuboid" && lesson.part === "b" && step >= 0 && (
        <div className={styles.facePairs}>
          {c.facePairs.map((t, i) => (
            <span key={t} data-active={face === null || i === face}>
              {t}
            </span>
          ))}
        </div>
      )}
      <figcaption>{c.diagramHint}</figcaption>
    </figure>
  );
}
