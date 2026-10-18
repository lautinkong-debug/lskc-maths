"use client";

import { useEffect, useRef } from "react";

/** Decorative Canvas UI layer. The graph and all controls stay in the DOM. */
export function CanvasGrid() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const output = canvas.current;
    const content = output?.parentElement;
    if (!output || !content) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let destroy: (() => void) | undefined;
    let generation = 0;
    async function sync() {
      const current = ++generation;
      destroy?.();
      destroy = undefined;
      if (motion.matches) return;
      const { createGrid } =
        await import("@/lib/vendor/canvas-ui/Grid/GridVanilla");
      if (disposed || current !== generation || motion.matches) return;
      const instance = createGrid(
        {
          source: document.createElement("canvas"),
          content: content!,
          output: output!,
        },
        {
          tileSize: 40,
          amplitude: 0.8,
          liftHeight: 14,
          tilt: 0.1,
          tint: [0.06, 0.27, 0.45],
          tintStrength: 0.12,
          shading: 0.025,
          idleRipples: 0,
          captureHtml: false,
        },
      );
      destroy = () => instance?.destroy();
    }
    void sync();
    motion.addEventListener("change", sync);
    return () => {
      disposed = true;
      generation++;
      destroy?.();
      motion.removeEventListener("change", sync);
    };
  }, []);
  return <canvas ref={canvas} className="studio-canvas" aria-hidden="true" />;
}
