"use client";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./linear-equations.module.css";

/** Keep every revealed row within the desktop board; retain a stable readable size. */
export default function WorkingViewport({
  children,
  revision,
}: {
  children: ReactNode;
  revision: string;
}) {
  const viewport = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const box = viewport.current,
      content = canvas.current;
    if (!box || !content) return;
    let pending = 0;
    const measure = () => {
      if (!matchMedia("(min-width: 900px)").matches) return;
      const widths = [
        ...content.querySelectorAll<HTMLElement>("[data-equation-row]"),
      ]
        .filter((el) => el.clientWidth > 0)
        .map((el) => el.clientWidth / Math.max(el.clientWidth, el.scrollWidth));
      const ratio = Math.min(
        1,
        (box.clientHeight - 16) / content.getBoundingClientRect().height,
        ...widths,
      );
      if (ratio < 0.995) {
        const measuredScale = Number(
          getComputedStyle(content).getPropertyValue("--working-scale"),
        );
        setScale(Math.max(0.5, measuredScale * ratio * 0.98));
      }
    };
    const schedule = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(measure);
    };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(box);
    observer.observe(content);
    document.fonts.addEventListener("loadingdone", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(pending);
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [revision, scale]);
  return (
    <div
      ref={viewport}
      className={styles.workingViewport}
      data-testid="working-viewport"
    >
      <div
        ref={canvas}
        className={styles.workingColumns}
        style={{ "--working-scale": scale } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
