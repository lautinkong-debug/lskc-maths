"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { copy } from "@/lib/copy";

const PresentationContext = createContext(false);

export function usePresentation(): boolean {
  return useContext(PresentationContext);
}

export function PresentationFrame({
  title,
  topic,
  canPresent,
  children,
}: {
  title: string;
  topic: string;
  canPresent: boolean;
  children: ReactNode;
}) {
  const frame = useRef<HTMLElement>(null);
  const [presenting, setPresenting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = document.fullscreenElement === frame.current;
      setFullscreen(active);
      if (!document.fullscreenElement) setPresenting(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function togglePresentation() {
    if (presenting) {
      if (document.fullscreenElement === frame.current) {
        await document.exitFullscreen();
      } else {
        setPresenting(false);
      }
      return;
    }
    setPresenting(true);
    try {
      await frame.current?.requestFullscreen();
    } catch {
      // The larger in-page view still works when Fullscreen is unavailable.
      setFullscreen(false);
    }
  }

  return (
    <PresentationContext.Provider value={presenting}>
      <section
        ref={frame}
        data-presentation={presenting ? "true" : undefined}
        className={`bg-paper text-graphite ${fullscreen ? "h-screen overflow-y-auto" : ""} ${presenting ? "text-lg" : ""}`}
      >
        <div
          className={`studio-app-frame mx-auto w-full ${presenting ? "max-w-[1800px] px-4 py-5 sm:px-8" : "max-w-[1400px] px-4 py-7 sm:px-6 lg:py-9"}`}
        >
          <div
            className={`flex flex-wrap items-start justify-between gap-4 ${presenting ? "" : "studio-lesson-heading"}`}
          >
            <div>
              {!presenting && (
                <Link
                  href="/apps"
                  className="text-navy text-sm font-semibold underline underline-offset-4"
                >
                  ← {copy.apps.backToApps}
                </Link>
              )}
              <h1 className="font-display text-hero text-navy mt-3 font-semibold tracking-tight text-balance">
                {title}
              </h1>
              <p className="text-pencil mt-1">{topic}</p>
            </div>
            <button
              type="button"
              aria-pressed={presenting}
              disabled={!canPresent}
              onClick={() => void togglePresentation()}
              className="border-grid-strong text-navy hover:bg-navy-wash min-h-12 rounded-md border px-4 py-2 font-semibold transition-colors disabled:opacity-50"
            >
              {presenting ? copy.apps.exitPresentation : copy.apps.presentation}
            </button>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </PresentationContext.Provider>
  );
}
