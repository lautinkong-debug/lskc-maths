"use client";

import { useEffect, useRef } from "react";
import { createHarbour } from "./scene/harbour";

export type HarbourSceneProps = {
  leftX: number;
  leftUnits: number;
  rightX: number;
  rightUnits: number;
  restored: boolean;
  reducedMotion: boolean;
  paused: boolean;
  lowQuality: boolean;
  revision: number;
  operation: "add" | "subtract" | "multiply" | "divide" | null;
  className?: string;
  onUnavailable: () => void;
  onReady?: () => void;
};

/** The accessible equation and every control live in the surrounding HTML. */
export default function HarbourScene(props: HarbourSceneProps) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const world = useRef<ReturnType<typeof createHarbour> | null>(null);

  useEffect(() => {
    latest.current = props;
    world.current?.setState(props);
  }, [props]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    try {
      world.current = createHarbour(element, latest.current, () => {
        if (!disposed) latest.current.onUnavailable();
      });
      latest.current.onReady?.();
    } catch {
      latest.current.onUnavailable();
    }
    return () => {
      disposed = true;
      world.current?.dispose();
      world.current = null;
    };
  }, []);

  return (
    <div
      ref={host}
      className={props.className}
      aria-hidden="true"
      data-testid="harbour-scene"
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    />
  );
}
