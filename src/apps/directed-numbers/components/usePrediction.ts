import { useSyncExternalStore } from "react";
const key = "lskc.dn.predict";
const eventName = "lskc-dn-predict";
let fallback: boolean | null = null;
function subscribe(notify: () => void) {
  window.addEventListener(eventName, notify);
  return () => window.removeEventListener(eventName, notify);
}
function snapshot(): boolean | null {
  try {
    const value = sessionStorage.getItem(key);
    if (value === "true" || value === "false") return value === "true";
  } catch {
    /* Private windows can keep the preference in memory. */
  }
  return fallback;
}
export function usePrediction(
  presenting: boolean,
): [boolean, (value: boolean) => void] {
  const preference = useSyncExternalStore(subscribe, snapshot, () => null);
  function setPreference(value: boolean) {
    fallback = value;
    try {
      sessionStorage.setItem(key, String(value));
    } catch {
      /* Session-only fallback. */
    }
    window.dispatchEvent(new Event(eventName));
  }
  return [preference ?? presenting, setPreference];
}
