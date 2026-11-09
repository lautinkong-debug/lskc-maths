"use client";

import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { appRegistry, getApp } from "@/apps/registry";
import { appAvailability } from "@/lib/appAvailability";
import { useAuth } from "@/lib/auth";
import { ACCESS_MODE } from "@/lib/constants";
import { copy } from "@/lib/copy";
import type { AppSettings } from "@/lib/db/appSettings";
import { PresentationFrame } from "./PresentationFrame";

const components = Object.fromEntries(
  appRegistry.map((app) => [app.slug, lazy(app.load)]),
);

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

/** Plain HTML, so it can still offer a way out if the page's scripts never arrive. */
function LoadingNotice() {
  return (
    <div role="status">
      <p>{copy.apps.loading}</p>
      <p className="app-slow-load">
        {copy.apps.slowLoad} <a href="">{copy.apps.reload}</a>
      </p>
    </div>
  );
}

/** A download cut off on busy Wi-Fi stays failed until the page reloads. */
class AppLoadBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert">
        <p>{copy.apps.loadFailed}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="border-grid-strong text-navy hover:bg-navy-wash mt-3 min-h-12 rounded-md border px-4 py-2 font-semibold"
        >
          {copy.apps.reload}
        </button>
      </div>
    );
  }
}

const subscribeMounted = () => () => {};

/**
 * In public mode students get the listing with the page, so nothing here waits
 * for Firebase, and teachers also watch it live once signed in. In school mode
 * the server cannot read the listing, so everyone waits for the live one.
 */
export function AppHost({
  slug,
  title,
  hidden,
}: {
  slug: string;
  title: string;
  hidden: boolean;
}) {
  const { role, loading } = useAuth();
  const isTeacher = role === "teacher" || role === "admin";
  const watchLive = isTeacher || ACCESS_MODE === "school";
  const [readySlug, setReadySlug] = useState<string | null>(null);
  const [live, setLive] = useState<{
    slug: string;
    setting: AppSettings | null;
  } | null>(null);
  const [failedSlug, setFailedSlug] = useState<string | null>(null);
  // Teaching apps use the browser as they start, so they only ever run there.
  const mounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );
  const markReady = useCallback(() => setReadySlug(slug), [slug]);
  useEffect(() => {
    if (!watchLive) return;
    let closed = false;
    let stopWatching: (() => void) | undefined;
    void import("@/lib/db/appSettings")
      .then(({ watchAppSetting }) => {
        if (closed) return;
        stopWatching = watchAppSetting(
          slug,
          (setting) => setLive({ slug, setting }),
          () => setFailedSlug(slug),
        );
      })
      .catch(() => setFailedSlug(slug));
    return () => {
      closed = true;
      stopWatching?.();
    };
  }, [slug, watchLive]);
  const app = getApp(slug);
  if (!app) return null;
  const setting = live?.slug === slug ? live.setting : undefined;
  const availability = appAvailability({
    schoolMode: ACCESS_MODE === "school",
    isTeacher,
    authLoading: loading,
    serverHidden: hidden,
    live: setting,
    liveFailed: failedSlug === slug,
  });
  if (availability !== "open" && availability !== "teacherOnly") {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-12">
        {availability === "waiting" && <LoadingNotice />}
        {availability === "failed" && (
          <p role="alert">{copy.apps.settingsFailed}</p>
        )}
        {availability === "unavailable" && (
          <h1 className="font-display text-section text-navy font-semibold">
            {copy.apps.unavailable}
          </h1>
        )}
      </main>
    );
  }
  const AppComponent = components[slug];
  return (
    <>
      {availability === "teacherOnly" && (
        <p className="border-navy bg-navy-wash text-navy mx-auto max-w-[1400px] border px-4 py-3 font-semibold">
          {copy.apps.hiddenTeacher}
        </p>
      )}
      <PresentationFrame
        key={slug}
        title={setting?.title.trim() || title}
        topic={app.topic}
        canPresent={readySlug === slug}
        canShare={availability !== "teacherOnly"}
        classroomHref={
          availability !== "teacherOnly" && slug === "circle-properties" && ACCESS_MODE === "public"
            ? "/apps/circle-properties/classroom"
            : undefined
        }
      >
        {mounted ? (
          <AppLoadBoundary>
            <Suspense fallback={<LoadingNotice />}>
              <AppComponent />
              <ReadySignal key={slug} onReady={markReady} />
            </Suspense>
          </AppLoadBoundary>
        ) : (
          <LoadingNotice />
        )}
      </PresentationFrame>
    </>
  );
}
