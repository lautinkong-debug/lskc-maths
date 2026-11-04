import { useEffect, type RefObject } from "react";

/**
 * Browsers ignore touch-action on the parts inside an SVG, so a finger on a
 * handle would scroll the page and cancel the drag. Stopping the touch as it
 * starts keeps the drag, and a touch anywhere else still scrolls as normal.
 * React's own touch listeners are passive, so this one is added by hand.
 */
export function useTouchDrag(
  ref: RefObject<Element | null>,
  selector: string,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const hold = (event: Event) => {
      if ((event.target as Element).closest(selector)) event.preventDefault();
    };
    element.addEventListener("touchstart", hold, { passive: false });
    return () => element.removeEventListener("touchstart", hold);
  }, [ref, selector]);
}
