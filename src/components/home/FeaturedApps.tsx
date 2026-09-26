"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { appRegistry } from "@/apps/registry";
import { copy } from "@/lib/copy";
import {
  effectiveApp,
  watchAppSettings,
  type AppSettings,
} from "@/lib/db/appSettings";
import { useEditMode } from "@/lib/editMode";

export function FeaturedApps() {
  const { editing } = useEditMode();
  const [settings, setSettings] = useState<AppSettings[] | null>(null);
  useEffect(
    () =>
      watchAppSettings(
        (rows) => setSettings(rows),
        () => setSettings([]),
      ),
    [],
  );
  if (!settings) return null;
  const bySlug = new Map(settings.map((item) => [item.slug, item]));
  const featured = appRegistry
    .map((app, index) => effectiveApp(app, bySlug.get(app.slug) ?? null, index))
    .filter((app) => app.featured && app.visible)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  if (featured.length === 0 && !editing) return null;

  return (
    <section className="pb-10 lg:pb-14">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-section text-navy font-semibold">
          {copy.home.featuredTitle}
        </h2>
        {editing && (
          <Link href="/apps" className="text-navy text-sm underline">
            {copy.home.featuredManage}
          </Link>
        )}
      </div>
      {featured.length === 0 ? (
        <p className="mt-3">{copy.home.featuredEmpty}</p>
      ) : (
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {featured.map((app) => {
            const Thumbnail = app.thumbnail;
            return (
              <li key={app.slug}>
                <Link
                  href={`/apps/${app.slug}`}
                  className="border-grid border-t-navy hover:bg-navy-wash block h-full border border-t-[3px] bg-white"
                >
                  <Thumbnail className="border-grid h-36 w-full border-b" />
                  <div className="p-4">
                    <h3 className="font-display text-card text-navy font-semibold">
                      {app.title}
                    </h3>
                    <p className="text-pencil mt-2 text-sm">{app.summary}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
