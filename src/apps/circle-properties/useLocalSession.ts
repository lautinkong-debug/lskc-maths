"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { sessionPrefix } from "./session";
import { createSessionStorage } from "./localSessionStorage";

// In-memory fallback also preserves a workspace across activity changes if storage
// is unavailable. Callers mount after the app's hydration-ready boundary.
const storage = createSessionStorage(() =>
  typeof window === "undefined" ? undefined : localStorage,
);
export function useLocalSession<T>(
  key: string,
  initial: T | (() => T),
  validate?: (value: unknown) => T | undefined,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const fullKey = sessionPrefix + key;
  const [snapshot, setSnapshot] = useState<{ value: T; failed: boolean }>(
    () => {
      const fallback = () =>
        typeof initial === "function" ? (initial as () => T)() : initial;
      const { raw, failed } = storage.read(fullKey);
      try {
        return {
          value:
            raw === undefined
              ? fallback()
              : ((validate ? validate(raw) : (raw as T)) ?? fallback()),
          failed,
        };
      } catch {
        return { value: fallback(), failed };
      }
    },
  );
  useEffect(() => {
    const saved = storage.write(fullKey, snapshot.value);
    if (snapshot.failed === saved) {
      // Reflect both failure and recovery of this external persistence operation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSnapshot((previous) =>
        previous.failed === !saved ? previous : { ...previous, failed: !saved },
      );
    }
  }, [fullKey, snapshot.value, snapshot.failed]);
  const setValue: Dispatch<SetStateAction<T>> = (next) =>
    setSnapshot((previous) => ({
      value:
        typeof next === "function"
          ? (next as (value: T) => T)(previous.value)
          : next,
      failed: previous.failed,
    }));
  return [snapshot.value, setValue, snapshot.failed];
}

export function clearLocalSessions() {
  storage.clearMemory();
  const keys = Object.keys(localStorage).filter((key) =>
    key.startsWith(sessionPrefix),
  );
  for (const key of keys) localStorage.removeItem(key);
}
