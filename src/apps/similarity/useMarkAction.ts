import {
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import styles from "./similarity.module.css";

/** A tap hides a mark; a drag beginning on the same mark moves its shape. */
export function useMarkAction(
  onHide?: (id: string) => void,
  onMoveStart?: (event: PointerEvent<SVGGElement>) => void,
) {
  const press = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  return (id: string, label: string) =>
    onHide
      ? {
          role: "button",
          tabIndex: 0,
          "aria-label": label,
          className: styles.clickableMark,
          onPointerDown: (event: PointerEvent<SVGGElement>) => {
            event.stopPropagation();
            press.current = {
              x: event.clientX,
              y: event.clientY,
              moved: false,
            };
            onMoveStart?.(event);
          },
          onPointerMove: (event: PointerEvent<SVGGElement>) => {
            const start = press.current;
            if (
              start &&
              Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5
            )
              start.moved = true;
          },
          onClick: (event: MouseEvent<SVGGElement>) => {
            event.stopPropagation();
            const moved = press.current?.moved;
            press.current = null;
            if (!moved) onHide(id);
          },
          onKeyDown: (event: KeyboardEvent<SVGGElement>) => {
            event.stopPropagation();
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onHide(id);
            }
          },
        }
      : {};
}
