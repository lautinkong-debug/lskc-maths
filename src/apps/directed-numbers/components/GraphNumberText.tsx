import { useLayoutEffect, useRef, type Ref, type SVGProps } from "react";
import { Math as Tex } from "@/components/Math";

const fraction = /^\d+\/\d+$/;

/** Keep words and decimals unchanged; stack only fraction literals. */
export function StackedNumberText({ children }: { children: string }) {
  return children
    .split(/(\d+\/\d+)/g)
    .map((part, i) =>
      fraction.test(part) ? (
        <Tex
          key={i}
          label={part}
        >{`\\dfrac{${part.split("/")[0]}}{${part.split("/")[1]}}`}</Tex>
      ) : (
        part
      ),
    );
}

/** Native SVG fractions stay sharp at any projector zoom. */
export function GraphNumberText({
  children,
  x,
  y,
  fontSize = 17,
  textAnchor = "middle",
  textRef,
  ...props
}: Omit<SVGProps<SVGTextElement>, "children" | "x" | "y" | "fontSize"> & {
  children: string;
  x: number;
  y: number;
  fontSize?: number;
  textRef?: Ref<SVGTextElement>;
}) {
  const group = useRef<SVGGElement>(null);
  const stacked = /\d+\/\d+/.test(children);
  useLayoutEffect(() => {
    const node = group.current;
    if (!node) return;
    const align = () => {
      const parts = Array.from(node.children) as SVGGraphicsElement[];
      const widths = parts.map((part) =>
        part.tagName.toLowerCase() === "text"
          ? (part as SVGTextElement).getComputedTextLength()
          : Math.max(
              ...Array.from(part.querySelectorAll("text"), (text) =>
                text.getComputedTextLength(),
              ),
            ) + 8,
      );
      const width = widths.reduce((a, b) => a + b, 0);
      let left = Math.max(
        20,
        Math.min(
          620 - width,
          x -
            (textAnchor === "middle"
              ? width / 2
              : textAnchor === "end"
                ? width
                : 0),
        ),
      );
      parts.forEach((part, i) => {
        if (part.tagName.toLowerCase() === "text") {
          part.setAttribute("x", String(left));
        } else {
          part
            .querySelectorAll("text")
            .forEach((text) =>
              text.setAttribute("x", String(left + widths[i] / 2)),
            );
          const rule = part.querySelector("line")!;
          rule.setAttribute("x1", String(left + 2));
          rule.setAttribute("x2", String(left + widths[i] - 2));
        }
        left += widths[i];
      });
    };
    align();
    document.fonts.addEventListener("loadingdone", align);
    return () => document.fonts.removeEventListener("loadingdone", align);
  }, [children, x, y, fontSize, textAnchor]);
  if (!stacked)
    return (
      <text
        {...props}
        ref={textRef}
        x={x}
        y={y}
        fontSize={fontSize}
        textAnchor={textAnchor}
        aria-label={children}
      >
        {children}
      </text>
    );
  return (
    <g
      {...(props as SVGProps<SVGGElement>)}
      ref={group}
      fontSize={fontSize}
      role="math"
      aria-label={children}
      data-stacked-fractions="true"
    >
      {children.split(/(\d+\/\d+)/g).map((part, i) =>
        fraction.test(part) ? (
          <g key={i}>
            <text
              y={y - fontSize * 0.78}
              textAnchor="middle"
              fontSize={fontSize * 0.8}
            >
              {part.split("/")[0]}
            </text>
            <line
              y1={y - fontSize * 0.48}
              y2={y - fontSize * 0.48}
              stroke={props.fill ?? "currentColor"}
              strokeWidth="1.2"
            />
            <text
              y={y + fontSize * 0.2}
              textAnchor="middle"
              fontSize={fontSize * 0.8}
            >
              {part.split("/")[1]}
            </text>
          </g>
        ) : (
          <text key={i} y={y} xmlSpace="preserve">
            {part}
          </text>
        ),
      )}
    </g>
  );
}
