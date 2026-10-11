"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { appRegistry } from "@/apps/registry";
import { AppListingEditor } from "@/components/apps/AppListingEditor";
import { useAuth } from "@/lib/auth";
import { ACTIVE_LEVELS, STRANDS } from "@/lib/constants";
import { copy } from "@/lib/copy";
import {
  defaultAppSettings,
  effectiveApp,
  saveAppOrder,
  watchAppSettings,
  type AppSettings,
} from "@/lib/db/appSettings";
import { useEditMode } from "@/lib/editMode";
import { sortTopicsForLevel, watchTopics, type Topic } from "@/lib/db/topics";

export default function AppsPage() {
  const { user, role } = useAuth();
  const { editing } = useEditMode();
  const isTeacher = role === "teacher" || role === "admin";
  const [level, setLevel] = useState("all");
  const [topicId, setTopicId] = useState("all");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoaded, setTopicsLoaded] = useState(false);
  const [topicsError, setTopicsError] = useState("");
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
      watchTopics(
        (rows) => {
          setTopics(rows);
          setTopicsLoaded(true);
          setTopicsError("");
        },
        () => {
          setTopicsLoaded(true);
          setTopicsError(copy.topics.loadFailed);
        },
      ),
    [],
  );

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
  const topicGroups = ACTIVE_LEVELS.filter(
    (item) => level === "all" || item === level,
  ).map((item) => ({ level: item, topics: sortTopicsForLevel(topics, item) }));
  const selectedTopic = topicsError
    ? undefined
    : topicGroups
        .flatMap((group) => group.topics)
        .find((topic) => topic.id === topicId);
  const filtered = ordered.filter(
    (app) =>
      (isTeacher || app.visible) &&
      (level === "all" || app.levels.some((item) => item === level)) &&
      (!selectedTopic || app.topicCodes.includes(selectedTopic.code)) &&
      (!query ||
        `${app.title} ${app.topic} ${app.topicCodes.join(" ")} ${app.summary} ${app.levels.join(" ")}`
          .toLowerCase()
          .includes(query)),
  );
  const canReorder =
    editing && level === "all" && !selectedTopic && query === "";

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
      <div className="border-grid mt-8 grid gap-4 border bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] sm:p-6">
        <label className="min-w-0 text-sm font-semibold">
          {copy.apps.filterLevel}
          <select
            value={level}
            onChange={(event) => {
              setLevel(event.target.value);
              setTopicId("all");
            }}
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
        <label className="min-w-0 text-sm font-semibold">
          {copy.apps.filterTopic}
          <select
            value={selectedTopic?.id ?? "all"}
            onChange={(event) => setTopicId(event.target.value)}
            disabled={!topicsLoaded || !!topicsError}
            className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
          >
            <option value="all">
              {topicsLoaded ? copy.apps.allTopics : copy.topics.loading}
            </option>
            {topicGroups
              .filter((group) => group.topics.length > 0)
              .map((group) => (
                <optgroup key={group.level} label={group.level}>
                  {group.topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.code} · {topic.name}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </label>
        <label className="min-w-0 text-sm font-semibold">
          {copy.apps.search}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
          />
        </label>
      </div>
      {topicsError && (
        <p role="alert" className="text-crimson mt-3">
          {topicsError}
        </p>
      )}
      {selectedTopic && (
        <p className="text-navy mt-4 font-semibold">
          {selectedTopic.code} · {selectedTopic.name}
        </p>
      )}
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
              {selectedTopic && !query ? copy.apps.emptyTopic : copy.apps.empty}
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
