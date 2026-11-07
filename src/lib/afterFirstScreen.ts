/**
 * Runs work the first screen does not need, once the page has loaded and gone
 * quiet, so it never competes with a student's first tap. iPad Safari has no
 * requestIdleCallback, so a short timer stands in for it there.
 */
export function afterFirstScreen(run: () => void): () => void {
  let idle: number | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const whenQuiet = () => {
    if (typeof requestIdleCallback === "function") {
      idle = requestIdleCallback(run, { timeout: 3000 });
    } else {
      timer = setTimeout(run, 1500);
    }
  };
  if (document.readyState === "complete") whenQuiet();
  else window.addEventListener("load", whenQuiet, { once: true });
  return () => {
    window.removeEventListener("load", whenQuiet);
    if (idle !== undefined) cancelIdleCallback(idle);
    clearTimeout(timer);
  };
}
