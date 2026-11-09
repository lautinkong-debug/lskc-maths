"use client";

import { ResourceBackLink } from "./resources/ResourceBackLink";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { copy } from "@/lib/copy";
import { portalCopy as c } from "@/lib/portalCopy";

const PresentationContext = createContext(false);

export function usePresentation(): boolean {
  return useContext(PresentationContext);
}

export function PresentationFrame({
  title,
  topic,
  canPresent,
  canShare = true,
  classroomHref,
  children,
}: {
  title: string;
  topic: string;
  canPresent: boolean;
  canShare?: boolean;
  classroomHref?: string;
  children: ReactNode;
}) {
  const frame = useRef<HTMLElement>(null);
  const [presenting, setPresenting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "manual">(
    "idle",
  );
  const [studentUrl, setStudentUrl] = useState("");
  const manual = useRef<HTMLInputElement>(null);
  async function copyStudentLink() {
    const url = new URL(
      classroomHref ?? window.location.pathname,
      window.location.origin,
    );
    if (!classroomHref) url.hash = window.location.hash;
    try {
      await navigator.clipboard.writeText(url.href);
      setShareState("copied");
    } catch {
      setStudentUrl(url.href);
      setShareState("manual");
      requestAnimationFrame(() => {
        manual.current?.focus();
        manual.current?.select();
      });
    }
  }

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
                <ResourceBackLink
                  collection="/apps"
                  className="text-navy text-sm font-semibold underline underline-offset-4"
                >
                  ← {copy.apps.backToApps}
                </ResourceBackLink>
              )}
              <h1 className="font-display text-hero text-navy mt-3 font-semibold tracking-tight text-balance">
                {title}
              </h1>
              <p className="text-pencil mt-1">{topic}</p>
            </div>
            <div className="flex max-w-full flex-wrap items-center gap-3">
              {classroomHref && !presenting && (
                <a
                  href={classroomHref}
                  className="border-grid-strong text-navy hover:bg-navy-wash inline-flex min-h-12 items-center rounded-md border px-4 py-2 font-semibold"
                >
                  {copy.apps.studentClassLink}
                </a>
              )}
              {canShare && !presenting && (
                <div className="portal-share">
                  <button
                    type="button"
                    onClick={() => void copyStudentLink()}
                    className="portal-text-link"
                    aria-live="polite"
                  >
                    {shareState === "copied" ? c.copiedLink : c.copyLink}
                  </button>
                  {shareState === "manual" && (
                    <input
                      ref={manual}
                      aria-label={c.linkFallback}
                      value={studentUrl}
                      readOnly
                      onFocus={(event) => event.target.select()}
                    />
                  )}
                </div>
              )}
              <button
                type="button"
                aria-pressed={presenting}
                disabled={!canPresent}
                onClick={() => void togglePresentation()}
                className="border-grid-strong text-navy hover:bg-navy-wash min-h-12 rounded-md border px-4 py-2 font-semibold transition-colors disabled:opacity-50"
              >
                {presenting
                  ? copy.apps.exitPresentation
                  : copy.apps.presentation}
              </button>
            </div>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </PresentationContext.Provider>
  );
}
