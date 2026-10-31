"use client";

import { inkColours } from "./ink";
import type { InkBoardController } from "./useInkBoard";
import s from "./ink.module.css";

const icons = {
  move: "M8 12V5a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9c0 4-3 7-7 7h-1c-2 0-4-1-5-3l-4-6a2 2 0 0 1 3-2l2 2",
  pen: "m4 16-1 5 5-1L21 7l-4-4L4 16Zm10-10 4 4M4 16l4 4",
  erase:
    "m3 14 9-10a2 2 0 0 1 3 0l6 6a2 2 0 0 1 0 3l-8 8H9l-6-5a2 2 0 0 1 0-2Zm4-4 9 8M13 21h9",
  undo: "M9 5 3 11l6 6M3 11h11a6 6 0 0 1 0 12",
  redo: "m15 5 6 6-6 6m6-6H10a6 6 0 0 0 0 12",
  clear: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
} as const;

function Icon({ name }: { name: keyof typeof icons }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[name]} />
    </svg>
  );
}

export default function InkToolbar({ board }: { board: InkBoardController }) {
  return (
    <details className={s.toolbar}>
      <summary aria-label="Pen tools" data-active={board.mode !== "move"}>
        <Icon name={board.mode === "erase" ? "erase" : "pen"} />
        {board.mode === "move"
          ? "Pen"
          : board.mode === "pen"
            ? "Pen on"
            : "Eraser on"}
      </summary>
      <div className={s.panel} role="group" aria-label="Drawing tools">
        <div className={s.group} role="group" aria-label="Whiteboard mode">
          {(
            [
              ["move", "Move"],
              ["pen", "Pen"],
              ["erase", "Erase"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={board.mode === mode}
              onClick={() => board.setMode(mode)}
            >
              <Icon name={mode} />
            </button>
          ))}
        </div>
        <div className={s.group} role="group" aria-label="Pen colour">
          {inkColours.map((colour) => (
            <button
              key={colour.value}
              type="button"
              aria-label={colour.name + " pen"}
              title={colour.name + " pen"}
              aria-pressed={board.colour === colour.value}
              onClick={() => {
                board.setColour(colour.value);
                board.setMode("pen");
              }}
            >
              <span
                className={s.swatch}
                style={{ background: colour.value }}
                aria-hidden="true"
              >
                {board.colour === colour.value ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
        <div className={s.group} role="group" aria-label="Pen stroke width">
          {(
            [
              [1.5, "Thin"],
              [3, "Medium"],
              [5, "Thick"],
            ] as const
          ).map(([width, label]) => (
            <button
              key={width}
              type="button"
              aria-label={label + " stroke"}
              title={label + " stroke"}
              aria-pressed={board.width === width}
              onClick={() => board.setWidth(width)}
            >
              <span
                className={s.dot}
                style={{ width: width * 3, height: width * 3 }}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        <div className={s.group} role="group" aria-label="Ink history">
          <button
            type="button"
            aria-label="Undo"
            title="Undo"
            onClick={board.undo}
            disabled={!board.canUndo}
          >
            <Icon name="undo" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            title="Redo"
            onClick={board.redo}
            disabled={!board.canRedo}
          >
            <Icon name="redo" />
          </button>
          <button
            type="button"
            aria-label="Clear ink"
            title="Clear ink (can be undone)"
            onClick={board.clear}
            disabled={!board.strokes.length}
          >
            <Icon name="clear" />
          </button>
        </div>
      </div>
      {board.limitReached && (
        <p className={s.notice} role="status">
          This board is full. Erase or clear some ink to continue.
        </p>
      )}
      {board.saveFailed && (
        <p className={s.notice} role="status">
          This browser could not save the ink. You can keep drawing.
        </p>
      )}
    </details>
  );
}
