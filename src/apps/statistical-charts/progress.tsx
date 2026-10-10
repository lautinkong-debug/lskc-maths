import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
export class ProgressStore {
  data: Record<string, unknown> = {};
  revision = 0;
  private listeners = new Set<() => void>();
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  snapshot = () => this.revision;
  write(key: string, value: unknown) {
    if (Object.is(this.data[key], value)) return;
    this.data[key] = value;
    if (Object.keys(this.data).length > 160)
      delete this.data[Object.keys(this.data)[0]];
    this.revision++;
    this.listeners.forEach((f) => f());
  }
  replace(data: Record<string, unknown> = {}) {
    this.data = data;
    this.revision++;
    this.listeners.forEach((f) => f());
  }
}
export const ProgressContext = createContext<ProgressStore | null>(null);
export const ProgressScope = createContext("");
export function useProgressState<T>(
  key: string,
  initial: T | (() => T),
  valid: (v: unknown) => v is T,
): [T, Dispatch<SetStateAction<T>>] {
  const store = useContext(ProgressContext),
    scope = useContext(ProgressScope),
    id = `${scope}/${key}`;
  const [value, setValue] = useState<T>(() => {
    const saved = store?.data[id];
    return valid(saved)
      ? saved
      : typeof initial === "function"
        ? (initial as () => T)()
        : initial;
  });
  useEffect(() => {
    store?.write(id, value);
  }, [store, id, value]);
  return [value, setValue];
}
export const validText = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 80;
export const validBoolean = (v: unknown): v is boolean =>
  typeof v === "boolean";
export const validInteger =
  (min: number, max: number) =>
  (v: unknown): v is number =>
    typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
