"use client";
import { useLayoutEffect, useRef } from "react";
import katex from "katex";
import { Math as Maths } from "@/components/Math";
import { copy } from "@/lib/copy";
import { equationTex } from "./engine";
import type { Scene } from "./transformations";
import styles from "./linear-equations.module.css";

/** Only internally generated anchor attributes are trusted; no input HTML is accepted. */
export function AnchoredMath({ tex, label }: { tex: string; label: string }) {
  const html = katex.renderToString(tex, {
    displayMode: true,
    throwOnError: false,
    strict: false,
    output: "html",
    trust: (context) => context.command === "\\htmlData",
  });
  return (
    <div
      role="math"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
export default function OperationScene({
  scene,
  cancellation = false,
}: {
  scene: Scene;
  cancellation?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;
    const arrange = () => {
      const svg = box.querySelector<SVGSVGElement>("[data-arrows]");
      const rect = box.getBoundingClientRect();
      if (!svg) return;
      svg.setAttribute(
        "viewBox",
        "0 0 " + box.clientWidth + " " + box.clientHeight,
      );
      const inkBounds = (element: Element) => {
        // Inline KaTeX wrappers do not include the raised numerator or deep denominator.
        const rects = [element, ...element.querySelectorAll("*")]
          .filter((el) => !el.matches(".strut, .vlist-s"))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0);
        return {
          left: Math.min(...rects.map((r) => r.left)),
          right: Math.max(...rects.map((r) => r.right)),
          top: Math.min(...rects.map((r) => r.top)),
          bottom: Math.max(...rects.map((r) => r.bottom)),
        };
      };
      const equation = box.querySelector('[role="math"]');
      if (!equation) return;
      const ceiling = inkBounds(equation).top - rect.top;
      const measured = scene.arrows.map((a, i) => {
        const from = box.querySelector('[data-eq-anchor="' + a.from + '"]');
        const to = box.querySelector('[data-eq-anchor="' + a.to + '"]');
        return from && to
          ? {
              ...a,
              i,
              f: inkBounds(from),
              origin: inkBounds(from.querySelector(".mfrac") ?? from),
              t: inkBounds(to),
            }
          : null;
      });
      measured.forEach((arrow) => {
        if (!arrow) return;
        const { f, origin, t, i } = arrow;
        const path = svg.querySelector<SVGPathElement>(
          '[data-arrow="' + i + '"]',
        );
        if (!path) return;
        const center = (r: typeof f) => (r.left + r.right) / 2;
        const direction = Math.sign(center(t) - center(f)) || 1;
        const fan = measured
          .filter((a) => a && a.from === arrow.from)
          .sort(
            (a, b) =>
              Math.abs(center(a!.t) - center(a!.f)) -
              Math.abs(center(b!.t) - center(b!.f)),
          );
        const rank = fan.indexOf(arrow);
        // A farther target gets a higher lane and an outer starting point.
        const x1 =
          center(origin) -
          rect.left +
          direction * ((fan.length - 1) / 2 - rank) * 6;
        const x2 = center(t) - rect.left;
        const y1 = origin.top - rect.top - 6;
        const y2 = t.top - rect.top - 12;
        const lane = ceiling - 24 - rank * 18;
        const radius = Math.min(12, Math.abs(x2 - x1) / 3);
        path.setAttribute(
          "d",
          [
            "M",
            x1,
            y1,
            "L",
            x1,
            lane + radius,
            "Q",
            x1,
            lane,
            x1 + direction * radius,
            lane,
            "L",
            x2 - direction * radius,
            lane,
            "Q",
            x2,
            lane,
            x2,
            lane + radius,
            "L",
            x2,
            y2,
          ].join(" "),
        );
        svg
          .querySelector('[data-arrow-head="' + i + '"]')
          ?.setAttribute(
            "d",
            ["M", x2 - 6, y2 - 8, "L", x2, y2, "L", x2 + 6, y2 - 8].join(" "),
          );
        for (const [kind, bounds] of [
          ["source", f],
          ["target", t],
        ] as const) {
          const highlight = svg.querySelector(
            "[data-" + kind + '-highlight="' + i + '"]',
          );
          if (!highlight) continue;
          highlight.setAttribute("x", String(bounds.left - rect.left - 3));
          highlight.setAttribute("y", String(bounds.top - rect.top - 3));
          highlight.setAttribute(
            "width",
            String(bounds.right - bounds.left + 6),
          );
          highlight.setAttribute(
            "height",
            String(bounds.bottom - bounds.top + 6),
          );
        }
      });
    };
    arrange();
    const observer = new ResizeObserver(arrange);
    observer.observe(box);
    document.fonts.addEventListener("loadingdone", arrange);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", arrange);
    };
  }, [scene]);
  return (
    <div
      className={styles.operation}
      data-operation={
        cancellation ? "cancel" : scene.lcm ? "lcm" : "distribute"
      }
    >
      {scene.lcm && !cancellation && (
        <p className={styles.lcmNote}>
          <Maths>
            {"\\operatorname{LCM}(" +
              scene.denominators!.join(",") +
              ")=" +
              scene.lcm}
          </Maths>
          <span>{copy.linearEquations.animation.lcmBothSides}</span>
        </p>
      )}
      <div className={styles.operationScroll} data-equation-row>
        <div
          ref={ref}
          className={styles.annotatedEquation}
          style={{
            paddingTop: scene.arrows.length
              ? 1.6 +
                Math.max(
                  ...scene.arrows.map(
                    (a) => scene.arrows.filter((b) => b.from === a.from).length,
                  ),
                ) *
                  0.7 +
                "em"
              : "0.4em",
          }}
        >
          <AnchoredMath tex={scene.tex} label={equationTex(scene.label)} />
          {scene.arrows.length > 0 && (
            <svg
              data-arrows
              className={styles.distributionArrows}
              aria-hidden="true"
            >
              {scene.arrows.map((_, i) => (
                <g key={i}>
                  <rect data-source-highlight={i} rx="4" />
                  <rect data-target-highlight={i} rx="4" />
                </g>
              ))}
              {scene.arrows.map((a, i) => (
                <path
                  key={i}
                  data-arrow={i}
                  data-from={a.from}
                  data-to={a.to}
                  pathLength="1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
              ))}
              {scene.arrows.map((_, i) => (
                <path
                  key={i}
                  data-arrow-head={i}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
              ))}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
