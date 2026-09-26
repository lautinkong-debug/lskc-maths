"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { appRegistry } from "@/apps/registry";
import { AppListingEditor } from "@/components/apps/AppListingEditor";
import { useAuth } from "@/lib/auth";
import { ACTIVE_LEVELS, COMPULSORY_STRANDS, STRANDS } from "@/lib/constants";
import { copy } from "@/lib/copy";
import {
  defaultAppSettings,
  effectiveApp,
  saveAppOrder,
  watchAppSettings,
  type AppSettings,
} from "@/lib/db/appSettings";
import { useEditMode } from "@/lib/editMode";

export default function AppsPage() {
  const { user, role } = useAuth();
  const { editing } = useEditMode();
  const isTeacher = role === "teacher" || role === "admin";
  const [level, setLevel] = useState("all");
  const [strand, setStrand] = useState("all");
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState<AppSettings[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(
    () =>
      watchAppSettings(
        (rows) => {
          setSettings(rows);
          setLoaded(true);
          setLoadError("");
        },
        () => {
          setLoaded(true);
          setLoadError(copy.apps.settingsFailed);
        },
      ),
    [],
  );

  const bySlug = new Map(settings.map((item) => [item.slug, item]));
  const ordered = appRegistry
    .map((app, index) => effectiveApp(app, bySlug.get(app.slug) ?? null, index))
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        a.order - b.order ||
        a.title.localeCompare(b.title),
    );
  const query = search.trim().toLowerCase();
  const filtered = ordered.filter(
    (app) =>
      (isTeacher || app.visible) &&
      (level === "all" || app.levels.some((item) => item === level)) &&
      (strand === "all" || app.strand === strand) &&
      (!query ||
        `${app.title} ${app.topic} ${app.summary} ${app.levels.join(" ")}`
          .toLowerCase()
          .includes(query)),
  );
  const canReorder =
    editing && level === "all" && strand === "all" && query === "";

  async function reorder(sourceSlug: string, targetSlug: string) {
    if (!canReorder || !user?.email || savingOrder || sourceSlug === targetSlug)
      return;
    const source = ordered.find((item) => item.slug === sourceSlug);
    const target = ordered.find((item) => item.slug === targetSlug);
    if (!source || !target || source.featured !== target.featured) {
      setStatus(copy.apps.reorderWithinGroup);
      return;
    }
    const group = ordered.filter((item) => item.featured === source.featured);
    const other = ordered.filter((item) => item.featured !== source.featured);
    const sourceIndex = group.findIndex((item) => item.slug === sourceSlug);
    const targetIndex = group.findIndex((item) => item.slug === targetSlug);
    const [moved] = group.splice(sourceIndex, 1);
    group.splice(targetIndex, 0, moved);
    const next = source.featured ? [...group, ...other] : [...other, ...group];
    setSavingOrder(true);
    setStatus("");
    try {
      await saveAppOrder(
        next.map((item, order) => {
          const registryApp = appRegistry.find(
            (entry) => entry.slug === item.slug,
          )!;
          const current =
            bySlug.get(item.slug) ??
            defaultAppSettings(registryApp, appRegistry.indexOf(registryApp));
          return {
            slug: item.slug,
            input: {
              title: current.title,
              summary: current.summary,
              featured: current.featured,
              visible: current.visible,
              order,
            },
          };
        }),
        user.email,
      );
      setStatus(copy.editor.saved);
    } catch {
      setStatus(copy.editor.saveFailed);
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="font-display text-hero text-navy font-semibold">
        {copy.apps.title}
      </h1>
      <p className="mt-2 max-w-prose">{copy.apps.intro}</p>
      <div className="border-grid mt-8 grid gap-4 border bg-white p-4 sm:grid-cols-3 sm:p-6">
        <label className="text-sm font-semibold">
          {copy.apps.filterLevel}
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
          >
            <option value="all">{copy.apps.allLevels}</option>
            {ACTIVE_LEVELS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          {copy.apps.filterStrand}
          <select
            value={strand}
            onChange={(event) => setStrand(event.target.value)}
            className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
          >
            <option value="all">{copy.apps.allStrands}</option>
            {COMPULSORY_STRANDS.map((item) => (
              <option key={item} value={item}>
                {STRANDS[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          {copy.apps.search}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
          />
        </label>
      </div>
      {editing && (
        <p className="text-pencil mt-4 text-sm">
          {canReorder
            ? copy.apps.dragToReorder
            : copy.apps.clearFiltersToReorder}
        </p>
      )}
      {status && (
        <p role="status" className="text-navy mt-4">
          {status}
        </p>
      )}
      {!loaded ? (
        <p role="status" className="mt-5">
          {copy.apps.loading}
        </p>
      ) : loadError ? (
        <p role="alert" className="text-crimson mt-5">
          {loadError}
        </p>
      ) : (
        <>
          <p role="status" className="text-pencil mt-5 text-sm">
            {copy.apps.resultCount(filtered.length)}
          </p>
          {filtered.length === 0 ? (
            <p className="border-grid mt-4 border bg-white p-6">
              {copy.apps.empty}
            </p>
          ) : (
            <ul className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((app) => {
                const Thumbnail = app.thumbnail;
                const group = ordered.filter(
                  (item) => item.featured === app.featured,
                );
                const groupIndex = group.findIndex(
                  (item) => item.slug === app.slug,
                );
                const registryApp = appRegistry.find(
                  (item) => item.slug === app.slug,
                )!;
                return (
                  <li
                    key={app.slug}
                    draggable={
                      canReorder && !savingOrder && editingSlug !== app.slug
                    }
                    onDragStart={(event) => {
                      if (!canReorder) return;
                      setDraggingSlug(app.slug);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(event) => {
                      if (canReorder) event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggingSlug) void reorder(draggingSlug, app.slug);
                      setDraggingSlug(null);
                    }}
                    onDragEnd={() => setDraggingSlug(null)}
                    className="border-grid border-t-navy flex h-full flex-col border border-t-[3px] bg-white"
                  >
                    <Link
                      href={`/apps/${app.slug}`}
                      className="hover:bg-navy-wash group flex flex-1 flex-col"
                    >
                      <Thumbnail className="border-grid h-44 w-full border-b bg-white" />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          {app.featured && (
                            <span className="bg-highlight px-2 py-1">
                              {copy.apps.featured}
                            </span>
                          )}
                          {!app.visible && isTeacher && (
                            <span className="border-navy text-navy border px-2 py-1">
                              {copy.apps.hiddenTeacher}
                            </span>
                          )}
                        </div>
                        <h2 className="font-display text-card text-navy mt-2 font-semibold">
                          {app.title}
                        </h2>
                        <p className="text-pencil mt-1 text-sm">{app.topic}</p>
                        <p className="mt-3 flex-1">{app.summary}</p>
                        <p className="text-pencil mt-4 text-sm">
                          {app.levels.join(" · ")} · {STRANDS[app.strand]}
                        </p>
                        <span className="text-navy mt-4 font-semibold group-hover:underline">
                          {copy.apps.openApp} →
                        </span>
                      </div>
                    </Link>
                    {editing && (
                      <div className="border-grid flex flex-wrap gap-2 border-t px-5 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingSlug(
                              editingSlug === app.slug ? null : app.slug,
                            )
                          }
                          className="border-navy text-navy rounded border px-3 py-1.5 text-sm"
                        >
                          {copy.apps.editListing}
                        </button>
                        <button
                          type="button"
                          disabled={
                            !canReorder || savingOrder || groupIndex === 0
                          }
                          onClick={() =>
                            void reorder(app.slug, group[groupIndex - 1].slug)
                          }
                          className="border-grid-strong rounded border px-3 py-1.5 text-sm disabled:opacity-40"
                        >
                          {copy.apps.moveUp}
                        </button>
                        <button
                          type="button"
                          disabled={
                            !canReorder ||
                            savingOrder ||
                            groupIndex === group.length - 1
                          }
                          onClick={() =>
                            void reorder(app.slug, group[groupIndex + 1].slug)
                          }
                          className="border-grid-strong rounded border px-3 py-1.5 text-sm disabled:opacity-40"
                        >
                          {copy.apps.moveDown}
                        </button>
                      </div>
                    )}
                    {editing && editingSlug === app.slug && user?.email && (
                      <AppListingEditor
                        app={registryApp}
                        setting={bySlug.get(app.slug) ?? null}
                        defaultOrder={appRegistry.indexOf(registryApp)}
                        email={user.email}
                        onClose={() => setEditingSlug(null)}
                        onSaved={() => {
                          setEditingSlug(null);
                          setStatus(copy.editor.saved);
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
