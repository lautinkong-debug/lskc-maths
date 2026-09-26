"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { appRegistry, getApp } from "@/apps/registry";
import { useAuth } from "@/lib/auth";
import { copy } from "@/lib/copy";
import {
  effectiveApp,
  watchAppSetting,
  type AppSettings,
} from "@/lib/db/appSettings";
import { PresentationFrame } from "./PresentationFrame";

const components = Object.fromEntries(
  appRegistry.map((app) => [app.slug, lazy(app.load)]),
);

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

export function AppHost({ slug }: { slug: string }) {
  const { role } = useAuth();
  const isTeacher = role === "teacher" || role === "admin";
  const [readySlug, setReadySlug] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<{
    slug: string;
    status: "loading" | "ready" | "error";
    setting: AppSettings | null;
  }>({ slug, status: "loading", setting: null });
  const markReady = useCallback(() => setReadySlug(slug), [slug]);
  useEffect(
    () =>
      watchAppSetting(
        slug,
        (setting) => setVisibility({ slug, status: "ready", setting }),
        () => setVisibility({ slug, status: "error", setting: null }),
      ),
    [slug],
  );
  const app = getApp(slug);
  if (!app) return null;
  if (visibility.slug !== slug || visibility.status === "loading") {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-12">
        <p role="status">{copy.apps.checkingAvailability}</p>
      </main>
    );
  }
  if (visibility.status === "error") {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-12">
        <p role="alert">{copy.apps.settingsFailed}</p>
      </main>
    );
  }
  if (visibility.setting?.visible === false && !isTeacher) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 py-12">
        <h1 className="font-display text-section text-navy font-semibold">
          {copy.apps.unavailable}
        </h1>
      </main>
    );
  }
  const listing = effectiveApp(
    app,
    visibility.setting,
    appRegistry.indexOf(app),
  );
  const Component = components[slug];
  return (
    <>
      {!listing.visible && (
        <p className="border-navy bg-navy-wash text-navy mx-auto max-w-[1400px] border px-4 py-3 font-semibold">
          {copy.apps.hiddenTeacher}
        </p>
      )}
      <PresentationFrame
        key={slug}
        title={listing.title}
        topic={listing.topic}
        canPresent={readySlug === slug}
      >
        <Suspense fallback={<p role="status">{copy.apps.loading}</p>}>
          <Component />
          <ReadySignal key={slug} onReady={markReady} />
        </Suspense>
      </PresentationFrame>
    </>
  );
}
