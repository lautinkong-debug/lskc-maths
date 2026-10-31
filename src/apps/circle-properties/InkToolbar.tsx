"use client";

import { inkColours } from "./ink";
import type { InkBoardController } from "./useInkBoard";
import s from "./ink.module.css";

export default function InkToolbar({ board }: { board: InkBoardController }) {
  return (
    <details className={s.toolbar}>
      <summary aria-label="Pen tools" data-active={board.mode !== "move"}>
        ✎{" "}
        {board.mode === "move"
          ? "Pen"
          : board.mode === "pen"
            ? "Pen on"
            : "Eraser on"}
      </summary>
      <div className={s.panel}>
        <div
          className={s.modeButtons}
          role="group"
          aria-label="Whiteboard mode"
        >
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
              aria-pressed={board.mode === mode}
              onClick={() => board.setMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={s.colours} role="group" aria-label="Pen colour">
          {inkColours.map((colour) => (
            <button
              key={colour.value}
              type="button"
              aria-label={`${colour.name} pen`}
              aria-pressed={board.colour === colour.value}
              onClick={() => {
                board.setColour(colour.value);
                board.setMode("pen");
              }}
            >
              <span style={{ background: colour.value }} aria-hidden="true" />
              {colour.name}
            </button>
          ))}
        </div>
        <label className={s.width}>
          Stroke width{" "}
          <select
            aria-label="Pen stroke width"
            value={board.width}
            onChange={(e) => board.setWidth(Number(e.target.value))}
          >
            <option value="1.5">Thin</option>
            <option value="3">Medium</option>
            <option value="5">Thick</option>
          </select>
        </label>
        <div className={s.actions}>
          <button type="button" onClick={board.undo} disabled={!board.canUndo}>
            Undo
          </button>
          <button type="button" onClick={board.redo} disabled={!board.canRedo}>
            Redo
          </button>
          <button
            type="button"
            onClick={board.clear}
            disabled={!board.strokes.length}
          >
            Clear ink
          </button>
        </div>
        <p>
          {board.mode === "move"
            ? "Choose Pen to draw on the circle and its whiteboard."
            : board.mode === "pen"
              ? "Draw with your mouse, finger or stylus. Move or Esc returns to dragging."
              : "Touch a drawn stroke to erase it. Undo brings it back."}
        </p>
        <p className={s.saved}>
          Ink stays with this property in this browser. Clear ink can be undone.
        </p>
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
      </div>
    </details>
  );
}
