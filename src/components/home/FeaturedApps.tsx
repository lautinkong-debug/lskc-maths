"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { appRegistry } from "@/apps/registry";
import { portalCopy as c } from "@/lib/portalCopy";
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
  const [loadError, setLoadError] = useState(false);
  useEffect(
    () =>
      watchAppSettings(
        (rows) => {
          setSettings(rows);
          setLoadError(false);
        },
        () => {
          setSettings([]);
          setLoadError(true);
        },
      ),
    [],
  );
  const bySlug = new Map(settings?.map((item) => [item.slug, item]));
  const visible = appRegistry
    .map((app, index) => effectiveApp(app, bySlug.get(app.slug) ?? null, index))
    .filter((app) => app.visible)
    .sort((a, b) => a.order - b.order);
  const chosen = visible.filter((app) => app.featured);
  const featured = (chosen.length ? chosen : visible).slice(0, 3);

  return (
    <section className="home-shelf">
      <div className="home-shelf-heading">
        <h2 className="portal-section-title">
          {chosen.length ? copy.home.featuredTitle : c.apps}
        </h2>
        <Link prefetch={false} href="/apps" className="portal-text-link">
          {c.seeAllApps} →
        </Link>
        {editing && (
          <Link href="/apps" className="text-navy text-sm underline">
            {copy.home.featuredManage}
          </Link>
        )}
      </div>
      {loadError ? (
        <p role="alert" className="text-crimson mt-3">
          {copy.apps.settingsFailed}
        </p>
      ) : !settings ? (
        <p role="status">{c.loadApps}</p>
      ) : featured.length === 0 ? (
        <p className="mt-3">{copy.home.featuredEmpty}</p>
      ) : (
        <ul className="home-featured-list">
          {featured.map((app) => {
            const Thumbnail = app.thumbnail;
            return (
              <li key={app.slug}>
                <Link href={`/apps/${app.slug}`} prefetch={false}>
                  <span className="form-thumb" aria-hidden="true">
                    <Thumbnail className="form-thumb-image" />
                  </span>
                  <div className="form-item-copy">
                    <h3>{app.title}</h3>
                    <span>{app.topic}</span>
                  </div>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
