import { useLayoutEffect, useRef, type Ref, type SVGProps } from "react";
import { Math as Tex } from "@/components/Math";

const fraction = /^[+−-]?\d+\/\d+$/;
const fractionTex = (text: string) =>
  text.replace(/−/g, "-").replace(/(\d+)\/(\d+)/g, "\\dfrac{$1}{$2}");

/** Use the same mathematical font and fraction spacing as the working. */
export function StackedNumberText({ children }: { children: string }) {
  if (/^[\d\s/+−=().-]+$/.test(children))
    return <Tex label={children}>{fractionTex(children)}</Tex>;
  return children.split(/([+−-]?\d+\/\d+)/g).map((part, i) =>
    fraction.test(part) ? (
      <Tex key={i} label={part}>
        {fractionTex(part)}
      </Tex>
    ) : (
      part
    ),
  );
}

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
  const box = useRef<SVGForeignObjectElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const stacked = /\d+\/\d+/.test(children);
  useLayoutEffect(() => {
    const node = box.current,
      label = content.current;
    if (!node || !label) return;
    const align = () => {
      const width = label.offsetWidth,
        height = label.offsetHeight;
      const left =
        x -
        (textAnchor === "middle"
          ? width / 2
          : textAnchor === "end"
            ? width
            : 0);
      node.setAttribute("x", String(Math.max(20, Math.min(620 - width, left))));
      node.setAttribute("y", String(y - height / 2 - fontSize * 0.25));
      node.setAttribute("width", String(width));
      node.setAttribute("height", String(height));
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(label);
    document.fonts.addEventListener("loadingdone", align);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", align);
    };
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
    <foreignObject
      {...(props as SVGProps<SVGForeignObjectElement>)}
      ref={box}
      x={x}
      y={y - 40}
      width={600}
      height={80}
      role="math"
      aria-label={children}
      data-stacked-fractions="true"
    >
      <div
        ref={content}
        style={{
          width: "max-content",
          whiteSpace: "nowrap",
          fontSize,
          lineHeight: 1.4,
          color: props.fill,
          padding: "4px",
          background: props.stroke === "#fff" ? "#fff" : undefined,
          borderRadius: "4px",
        }}
      >
        <StackedNumberText>{children}</StackedNumberText>
      </div>
    </foreignObject>
  );
}
