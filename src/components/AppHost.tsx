"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { appRegistry, getApp } from "@/apps/registry";
import { copy } from "@/lib/copy";
import { PresentationFrame } from "./PresentationFrame";

const components = Object.fromEntries(
  appRegistry.map((app) => [app.slug, lazy(app.load)]),
);

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}

export function AppHost({ slug }: { slug: string }) {
  const [readySlug, setReadySlug] = useState<string | null>(null);
  const markReady = useCallback(() => setReadySlug(slug), [slug]);
  const app = getApp(slug);
  if (!app) return null;
  const Component = components[slug];
  return (
    <PresentationFrame
      key={slug}
      title={app.title}
      topic={app.topic}
      canPresent={readySlug === slug}
    >
      <Suspense fallback={<p role="status">{copy.apps.loading}</p>}>
        <Component />
        <ReadySignal key={slug} onReady={markReady} />
      </Suspense>
    </PresentationFrame>
  );
}
