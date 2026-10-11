import { copy } from "@/lib/copy";
import { format } from "./statistics";
import { classVocabulary } from "./vocabularyModel";
import s from "./lab.module.css";

const c = copy.statisticalCharts.vocabulary;
export function ClassIntervalDiagram({
  values: v,
  active,
  show,
  learn,
}: {
  values: ReturnType<typeof classVocabulary>;
  active: number;
  show: boolean;
  learn: boolean;
}) {
  // All strips and histogram bars share this numeric scale. Limits lie half a
  // recording step inside the boundaries; they must not fill the whole cell.
  const x = (value: number) => 263 + ((value - v.low) / v.width) * 183;
  const left = x(v.lower),
    right = x(v.upper);
  const colour = (term: number) => (active === term ? "#da2127" : "#0f4574");
  return (
    <svg
      className={s.intervalDiagram}
      viewBox="0 0 710 465"
      role="img"
      aria-label={learn ? c.diagram : c.recallDiagram}
      data-testid="vocabulary-diagram"
    >
      <g className={s.vocabularyHighlight} data-active={active === 0}>
        <text x={236} y={27} textAnchor="end" fontSize={18} fill="#0f4574">
          {learn ? c.fields[0] : "?"}
        </text>
        <text
          x={236}
          y={57}
          textAnchor="end"
          fontSize={25}
          fontWeight={700}
          fill="#0f4574"
          data-testid="diagram-lower-limit"
        >
          {show ? v.lower : "?"}
        </text>
        <path
          d={`M246 47H${left}V91 M${left - 5} 84l5 8 5 -8`}
          fill="none"
          stroke={colour(0)}
          strokeWidth={2}
        />
        <text x={474} y={27} fontSize={18} fill="#0f4574">
          {learn ? c.fields[1] : "?"}
        </text>
        <text
          x={474}
          y={57}
          fontSize={25}
          fontWeight={700}
          fill="#0f4574"
          data-testid="diagram-upper-limit"
        >
          {show ? v.upper : "?"}
        </text>
        <path
          d={`M464 47H${right}V91 M${right - 5} 84l5 8 5 -8`}
          fill="none"
          stroke={colour(0)}
          strokeWidth={2}
        />
        {[-1, 0, 1].map((i) => (
          <g key={i}>
            <rect
              data-testid={`limit-strip-${i + 1}`}
              x={x(v.lower + i * v.width)}
              y={96}
              width={x(v.upper) - x(v.lower)}
              height={50}
              fill={i === 0 ? "#fff3b0" : "#f1f4f6"}
              stroke={i === 0 ? colour(0) : "#94a7b6"}
              strokeWidth={i === 0 ? 2.5 : 1}
            />
            <text
              x={x(v.mark + i * v.width)}
              y={128}
              textAnchor="middle"
              fontSize={22}
              fontWeight={i === 0 ? 700 : 400}
              fill="#0f4574"
            >
              {format(v.lower + i * v.width)}–{format(v.upper + i * v.width)}
            </text>
          </g>
        ))}
      </g>
      {[263, 446].map((edge) => (
        <line
          key={edge}
          x1={edge}
          x2={edge}
          y1={94}
          y2={240}
          stroke="#96adbf"
          strokeDasharray="4 5"
        />
      ))}
      {show && (
        <g fill="#0f4574" fontSize={18}>
          <path
            d={`M${left} 165H263l5 -4 M263 165l5 4 M${right} 165H446l-5 -4 M446 165l-5 4`}
            stroke="#0f4574"
            fill="none"
            strokeWidth={2}
          />
          <text x={253} y={171} textAnchor="end">
            −{format(v.halfStep)}
          </text>
          <text x={456} y={171}>
            +{format(v.halfStep)}
          </text>
        </g>
      )}
      <g className={s.vocabularyHighlight} data-active={active === 3}>
        <text
          x={354.5}
          y={205}
          textAnchor="middle"
          fontSize={22}
          fill="#0f4574"
        >
          {learn ? `${c.names[3]}${show ? ` = ${v.width}` : ""}` : "?"}
        </text>
        <path
          d="M263 222H446 M263 222l9 -5 M263 222l9 5 M446 222l-9 -5 M446 222l-9 5"
          fill="none"
          stroke={colour(3)}
          strokeWidth={active === 3 ? 3.5 : 2}
        />
      </g>
      <rect
        x={80}
        y={300}
        width={183}
        height={85}
        fill="#edf0f2"
        stroke="#aaa"
      />
      <rect
        x={446}
        y={315}
        width={183}
        height={70}
        fill="#edf0f2"
        stroke="#aaa"
      />
      <rect
        data-testid="boundary-bar"
        x={263}
        y={240}
        width={183}
        height={145}
        fill="#fff0a3"
        stroke="#0f4574"
        strokeWidth={2}
      />
      <line
        x1={65}
        x2={645}
        y1={385}
        y2={385}
        stroke="#263645"
        strokeWidth={2}
      />
      <g className={s.vocabularyHighlight} data-active={active === 1}>
        {[263, 446].map((edge) => (
          <line
            key={edge}
            x1={edge}
            x2={edge}
            y1={240}
            y2={396}
            stroke={colour(1)}
            strokeWidth={active === 1 ? 5 : 2}
          />
        ))}
        <text x={263} y={420} textAnchor="middle" fontSize={24} fill="#0f4574">
          {show ? v.low : "?"}
        </text>
        <text x={446} y={420} textAnchor="middle" fontSize={24} fill="#0f4574">
          {show ? v.high : "?"}
        </text>
      </g>
      <g className={s.vocabularyHighlight} data-active={active === 2}>
        <text
          x={354.5}
          y={271}
          textAnchor="middle"
          fontSize={21}
          fill="#0f4574"
        >
          {learn ? c.names[2] : "?"}
        </text>
        <path
          d="M354.5 289V385 M354.5 385l-6 -10 M354.5 385l6 -10"
          fill="none"
          stroke={colour(2)}
          strokeWidth={active === 2 ? 4 : 2}
        />
        <text
          x={354.5}
          y={420}
          textAnchor="middle"
          fontSize={24}
          fill="#0f4574"
        >
          {show ? v.mark : "?"}
        </text>
      </g>
      <text x={263} y={450} textAnchor="middle" fontSize={16} fill="#0f4574">
        {learn ? c.lowerBoundary : ""}
      </text>
      <text x={446} y={450} textAnchor="middle" fontSize={16} fill="#0f4574">
        {learn ? c.upperBoundary : ""}
      </text>
    </svg>
  );
}
