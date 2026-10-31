import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type SVGProps,
} from "react";
import { parseNotation } from "./mathNotation";
import s from "./math-text.module.css";

const variableStyle: CSSProperties = {
  fontFamily: '"Cambria Math", "Times New Roman", serif',
  fontStyle: "italic",
  fontWeight: "inherit",
};

// Keep ordinary units and function names next to their mathematical quantity.
const proseFollows =
  /^\s+(?!(?:cm|mm|km|rad|sin|cos|tan)\b)(?:[A-Za-z][a-z]+|a)\b/;

function variables(children: string, svg: boolean, notation: boolean) {
  const nodes = [];
  let last = 0;
  const pattern =
    /(?<![A-Za-z])(?:[ABCDMNOPQT]{2,3}|[ABCDMNOPQT]|[xyr])(?![A-Za-z])|[θφℓ]/g;
  for (const match of children.matchAll(pattern)) {
    const index = match.index,
      token = match[0];
    // Only style A in prose when its surrounding words identify the point.
    // In particular, “A perpendicular …” and “A different case …” stay upright.
    if (
      token === "A" &&
      !notation &&
      !/(?:\b(?:at|from|to|through|point|vertex|circle|label|drag|move|endpoint|end)\s+)$/i.test(
        children.slice(0, index),
      ) &&
      !/^\s+(?:and|or|to|is|lies|moves|contains)\b/.test(
        children.slice(index + 1),
      ) &&
      !/^,\s*[BCDMNOPQT]\b/.test(children.slice(index + 1))
    )
      continue;
    if (index > last) nodes.push(children.slice(last, index));
    nodes.push(
      svg ? (
        <tspan key={index} style={variableStyle}>
          {token}
        </tspan>
      ) : (
        <var
          key={index}
          style={variableStyle}
          className={
            !notation && proseFollows.test(children.slice(index + token.length))
              ? s.beforeProse
              : undefined
          }
        >
          {token}
        </var>
      ),
    );
    last = index + token.length;
  }
  if (last < children.length) nodes.push(children.slice(last));
  return <>{nodes}</>;
}

/** A curved arc sign spans the entire italic endpoint name. */
export function MathArc({
  children,
  beforeProse = false,
}: {
  children: string;
  beforeProse?: boolean;
}) {
  return (
    <span
      className={beforeProse ? `${s.arc} ${s.beforeProse}` : s.arc}
      role="math"
      aria-label={`arc ${children}`}
      data-math-arc={children}
    >
      <svg
        className={s.arcMark}
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "100%",
          height: "0.24em",
          maxHeight: "none",
          margin: 0,
          display: "block",
          overflow: "visible",
        }}
      >
        <path d="M 3 17 Q 50 0 97 17" />
      </svg>
      <var style={variableStyle} aria-hidden="true">
        {children}
      </var>
    </span>
  );
}

/** A stacked fraction, with a readable spoken alternative and upright numbers. */
export function MathFraction({
  numerator,
  denominator,
}: {
  numerator: string;
  denominator: string;
}) {
  return (
    <span
      className={s.fraction}
      role="math"
      aria-label={`${numerator} divided by ${denominator}`}
      data-math-fraction
    >
      <span className={s.numerator} aria-hidden="true">
        {inline(numerator, false, true, false)}
      </span>
      <span className={s.denominator} aria-hidden="true">
        {inline(denominator, false, true, false)}
      </span>
    </span>
  );
}

function inline(
  children: string,
  svg: boolean,
  notation: boolean,
  fractions: boolean,
  pathArcs = false,
) {
  const parts = parseNotation(children, fractions && !svg);
  return parts.map((part, index) => {
    if (part.kind === "fraction")
      return (
        <MathFraction
          key={index}
          numerator={part.numerator}
          denominator={part.denominator}
        />
      );
    if (part.kind === "arc") {
      if (!svg) {
        const next = parts[index + 1];
        return (
          <MathArc
            key={index}
            beforeProse={
              !notation && next?.kind === "text" && proseFollows.test(next.text)
            }
          >
            {part.name}
          </MathArc>
        );
      }
      return (
        <tspan
          key={index}
          style={variableStyle}
          data-math-arc={part.name}
          aria-label={`arc ${part.name}`}
        >
          {pathArcs ? part.name : `${part.name[0]}\u0361${part.name.slice(1)}`}
        </tspan>
      );
    }
    return (
      <FragmentText
        key={index}
        text={part.text}
        svg={svg}
        notation={notation}
      />
    );
  });
}

function FragmentText({
  text,
  svg,
  notation,
}: {
  text: string;
  svg: boolean;
  notation: boolean;
}) {
  return variables(text, svg, notation);
}

/** Formats arcs and divisions as mathematical notation, retaining prose and units. */
export default function MathText({
  children = "",
  svg = false,
  notation = false,
}: {
  children?: string;
  svg?: boolean;
  /** A standalone A is a point in notation, but may be an article in prose. */
  notation?: boolean;
}) {
  return <>{inline(children, svg, notation, true)}</>;
}

/**
 * Use in place of <text><MathText svg>…</MathText></text> for arc labels.
 * Native SVG text determines spacing/centering; a measured path draws the arc.
 */
export function MathSvgText({
  children = "",
  notation = true,
  ...props
}: Omit<SVGProps<SVGTextElement>, "children" | "ref"> & {
  children?: string;
  notation?: boolean;
}) {
  const textRef = useRef<SVGTextElement>(null);
  const arcsRef = useRef<SVGGElement>(null);
  useLayoutEffect(() => {
    const text = textRef.current,
      layer = arcsRef.current;
    if (!text || !layer) return;
    if (!text.querySelector("[data-math-arc]")) {
      layer.replaceChildren();
      return;
    }
    let active = true;
    const draw = () => {
      if (!active) return;
      layer.replaceChildren();
      for (const label of text.querySelectorAll<SVGTSpanElement>(
        "[data-math-arc]",
      )) {
        const box = label.getBBox();
        if (!box.width || !box.height) continue;
        const style = getComputedStyle(label);
        const fontSize = Number.parseFloat(style.fontSize) || 18;
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        const left = box.x - fontSize * 0.02,
          right = box.x + box.width + fontSize * 0.02;
        const bottom = box.y + fontSize * 0.04,
          top = bottom - fontSize * 0.24;
        path.setAttribute(
          "d",
          `M ${left} ${bottom} Q ${(left + right) / 2} ${top} ${right} ${bottom}`,
        );
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", style.fill);
        path.setAttribute(
          "stroke-width",
          String(Math.max(0.8, fontSize * 0.065)),
        );
        path.setAttribute("stroke-linecap", "round");
        layer.appendChild(path);
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(text);
    void document.fonts.ready.then(draw);
    return () => {
      active = false;
      observer.disconnect();
    };
  });
  return (
    <g aria-label={children}>
      <text {...props} ref={textRef} xmlSpace="preserve">
        {inline(children, true, notation, false, true)}
      </text>
      <g
        ref={arcsRef}
        aria-hidden="true"
        pointerEvents="none"
        data-arc-decoration
      />
    </g>
  );
}
