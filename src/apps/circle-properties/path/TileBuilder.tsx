import { useMemo, useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import MathText from "../MathText";
import { rng, shuffle } from "./random";
import s from "./path.module.css";

/**
 * Build the exact wording of a reason from word tiles. Producing the words is
 * what the exam asks for; choosing from a list is not.
 */
export default function TileBuilder({
  tiles,
  extras,
  hint,
  seed,
  onDone,
}: {
  tiles: string[];
  extras: string[];
  hint: string;
  seed: number;
  onDone: (firstTry: boolean) => void;
}) {
  const bank = useMemo(
    () =>
      shuffle(
        rng(seed),
        [...tiles, ...extras].map((text, id) => ({ id, text })),
      ),
    [tiles, extras, seed],
  );
  const [placed, setPlaced] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<"build" | "wrong" | "right" | "shown">(
    "build",
  );
  const text = (id: number) => bank.find((tile) => tile.id === id)!.text;
  const locked = state === "right" || state === "shown";
  function place(id: number) {
    if (locked) return;
    setPlaced([...placed, id]);
    setState("build");
  }
  function remove(position: number) {
    if (locked) return;
    setPlaced(placed.filter((_, i) => i !== position));
    setState("build");
  }
  function check() {
    const right =
      placed.length === tiles.length &&
      placed.every((id, i) => text(id) === tiles[i]);
    if (right) {
      setState("right");
      onDone(tries === 0);
    } else if (tries >= 1) {
      // Second miss: lay the tiles out correctly so the wording is seen once.
      const answer: number[] = [];
      for (const word of tiles) {
        const tile = bank.find(
          (item) => item.text === word && !answer.includes(item.id),
        );
        if (tile) answer.push(tile.id);
      }
      setPlaced(answer);
      setState("shown");
      onDone(false);
    } else {
      setTries(tries + 1);
      setState("wrong");
    }
  }
  return (
    <div className={s.builder}>
      <div
        className={s.answerLine}
        data-state={state}
        role="group"
        aria-label={c.yourWording}
      >
        {placed.length === 0 && (
          <span className={s.placeholder}>{c.tapTiles}</span>
        )}
        {placed.map((id, position) => (
          <button
            type="button"
            key={id}
            className={s.tile}
            data-placed="true"
            disabled={locked}
            aria-label={c.removeTile(text(id))}
            onClick={() => remove(position)}
          >
            <MathText>{text(id)}</MathText>
          </button>
        ))}
      </div>
      <div className={s.tileBank} role="group" aria-label={c.wordTiles}>
        {bank.map((tile) => (
          <button
            type="button"
            key={tile.id}
            className={s.tile}
            disabled={locked || placed.includes(tile.id)}
            onClick={() => place(tile.id)}
          >
            <MathText>{tile.text}</MathText>
          </button>
        ))}
      </div>
      <p className={s.feedback} role="status" data-tone={state}>
        {state === "right" && <strong>{c.wordingRight}</strong>}
        {state === "wrong" && (
          <>
            <strong>{c.notYet}</strong> <MathText>{hint}</MathText>
          </>
        )}
        {state === "shown" && (
          <>
            <strong>{c.hereItIs}</strong> {c.readAloud}
          </>
        )}
      </p>
      {!locked && (
        <div className={s.row}>
          <button
            type="button"
            className={s.primary}
            disabled={placed.length === 0}
            onClick={check}
          >
            {c.check}
          </button>
          <button
            type="button"
            className={s.quiet}
            disabled={placed.length === 0}
            onClick={() => {
              setPlaced([]);
              setState("build");
            }}
          >
            {c.clear}
          </button>
        </div>
      )}
    </div>
  );
}
