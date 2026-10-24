import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import styles from "./polynomials.module.css";
const c = copy.polynomials;
export function usePlayback(last: number) {
  const [state, setState] = useState({ index: 0, playing: false });
  const [speed, setSpeed] = useState(1400);
  useEffect(() => {
    if (!state.playing || state.index === last) return;
    const timer = window.setTimeout(
      () =>
        setState((p) => {
          const index = Math.min(p.index + 1, last);
          return { index, playing: index < last };
        }),
      speed,
    );
    return () => window.clearTimeout(timer);
  }, [state.index, state.playing, last, speed]);
  return {
    ...state,
    speed,
    setSpeed,
    move: (delta: number) =>
      setState((p) => ({
        index: Math.max(0, Math.min(last, p.index + delta)),
        playing: false,
      })),
    reset: () => setState({ index: 0, playing: false }),
    toggle: () => setState((p) => ({ ...p, playing: !p.playing })),
  };
}
export function PlaybackControls({
  player,
  last,
}: {
  player: ReturnType<typeof usePlayback>;
  last: number;
}) {
  return (
    <div className={styles.controls}>
      <div className={styles.navigationButtons}>
        <button disabled={player.index === 0} onClick={() => player.move(-1)}>
          {c.previous}
        </button>
        <button
          className={styles.primary}
          disabled={player.index === last}
          onClick={() => player.move(1)}
        >
          {c.next}
        </button>
      </div>
      <div className={styles.playbackButtons}>
        <button
          disabled={player.index === last}
          onClick={player.toggle}
          aria-pressed={player.playing}
        >
          {player.playing ? c.pause : c.play}
        </button>
        <button onClick={player.reset}>{c.replay}</button>
        <label>
          {c.speed}
          <select
            value={player.speed}
            onChange={(e) => player.setSpeed(Number(e.target.value))}
          >
            <option value={1400}>{c.normal}</option>
            <option value={2600}>{c.slow}</option>
          </select>
        </label>
      </div>
      <div className={styles.progress}>
        <span role="status" aria-live="polite">
          {c.progress(player.index, last)}
        </span>
        <div aria-hidden="true">
          <i style={{ width: `${(100 * player.index) / last}%` }} />
        </div>
      </div>
    </div>
  );
}
