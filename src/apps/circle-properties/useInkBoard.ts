"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalSession } from "./useLocalSession";
import {
  inkAtLimit,
  inkColours,
  inkReducer,
  parseInkDocument,
  strokeAtPoint,
  type InkAction,
  type InkHistory,
  type InkPoint,
  type InkStroke,
} from "./ink";

export type InkMode = "move" | "pen" | "erase";
export type InkBoardController = {
  mode: InkMode;
  setMode: (mode: InkMode) => void;
  colour: string;
  setColour: (colour: string) => void;
  width: number;
  setWidth: (width: number) => void;
  strokes: InkStroke[];
  addStroke: (stroke: InkStroke) => void;
  eraseAt: (point: InkPoint, radius?: number) => void;
  eraseStrokes: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveFailed: boolean;
  limitReached: boolean;
};

/** Mount once per board key. Only final strokes are persisted, never pointer moves. */
export function useInkBoard(storageKey: string): InkBoardController {
  const [document, setDocument, saveFailed] = useLocalSession(
    `ink-${storageKey}`,
    () => ({ strokes: [] as InkStroke[] }),
    parseInkDocument,
  );
  const [history, setHistory] = useState<InkHistory>(() => ({
    past: [],
    present: document.strokes,
    future: [],
  }));
  // Commands may arrive before React has rendered the preceding update.
  // Keep their source current so a second stroke/undo cannot overwrite it.
  const currentHistory = useRef(history);
  const [mode, setMode] = useState<InkMode>("move");
  const [colour, setColour] = useState<string>(inkColours[0].value);
  const [width, setWidth] = useState(3);
  const [rejected, setRejected] = useState(false);
  function dispatch(action: InkAction) {
    const previous = currentHistory.current;
    const next = inkReducer(previous, action);
    setRejected(action.type === "add" && next === previous);
    if (next === previous) return;
    currentHistory.current = next;
    setHistory(next);
    setDocument({ strokes: next.present });
  }
  useEffect(() => {
    if (mode === "move") return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode("move");
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mode]);
  return {
    mode,
    setMode,
    colour,
    setColour: (next) => {
      if (inkColours.some((c) => c.value === next)) setColour(next);
    },
    width,
    setWidth: (next) => {
      if (Number.isFinite(next)) setWidth(Math.max(1, Math.min(8, next)));
    },
    strokes: history.present,
    addStroke: (stroke) => dispatch({ type: "add", stroke }),
    eraseAt: (point, radius) =>
      dispatch({
        type: "erase",
        ids: currentHistory.current.present
          .filter((s) => strokeAtPoint(s, point, radius))
          .map((s) => s.id),
      }),
    eraseStrokes: (ids) => dispatch({ type: "erase", ids }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    clear: () => dispatch({ type: "clear" }),
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    saveFailed,
    limitReached: rejected || inkAtLimit(history.present),
  };
}
