import type { KeyboardEvent } from "react";
export function lessonKey(
  event: KeyboardEvent<HTMLElement>,
  presenting: boolean,
  actions: {
    next: () => void;
    back: () => void;
    reveal: () => void;
    newExample: () => void;
    predict: () => void;
  },
) {
  if (
    !presenting ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    (event.target instanceof HTMLElement &&
      event.target.closest(
        "input,select,textarea,button,a,summary,[contenteditable],[role=slider]",
      ))
  )
    return;
  const keys: Record<string, () => void> = {
    ArrowRight: actions.next,
    PageDown: actions.next,
    " ": actions.next,
    ArrowLeft: actions.back,
    PageUp: actions.back,
    r: actions.reveal,
    R: actions.reveal,
    n: actions.newExample,
    N: actions.newExample,
    p: actions.predict,
    P: actions.predict,
  };
  if (keys[event.key]) {
    event.preventDefault();
    keys[event.key]();
  }
}
