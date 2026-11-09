"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
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
import {
  ResourceFilters,
  useResourceFilters,
} from "@/components/resources/ResourceFilters";
import { matchesResourceSearch, resourceHref } from "@/lib/resourceNavigation";
import { resourceNavigationCopy as c } from "@/lib/resourceNavigationCopy";
import s from "@/components/resources/Resources.module.css";

export default function AppsPage() {
  return (
    <Suspense
      fallback={
        <main className="portal-page">
          <h1 className="portal-heading">{copy.apps.title}</h1>
          <p role="status">{copy.apps.loading}</p>
        </main>
      }
    >
      <AppCatalogue />
    </Suspense>
  );
}

function AppCatalogue() {
  const { user, role } = useAuth();
  const { editing } = useEditMode();
  const isTeacher = role === "teacher" || role === "admin";
  const { filters, update } = useResourceFilters();
  const { level, topic: topicId, q: search } = filters;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoaded, setTopicsLoaded] = useState(false);
  const [topicsError, setTopicsError] = useState("");
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
  const available = ordered.filter(
    (app) =>
      (isTeacher || app.visible) && (!level || app.levels.includes(level)),
  );
  const chapterOptions = ACTIVE_LEVELS.filter(
    (form) => !level || form === level,
  ).flatMap((form) =>
    sortTopicsForLevel(topics, form).map((topic) => ({
      ...topic,
      group: form,
    })),
  );
  const selectedTopic = chapterOptions.find((topic) => topic.id === topicId);
  const filtered = available.filter(
    (app) =>
      (!topicId ||
        (selectedTopic &&
          app.topicCodes.includes(selectedTopic.code) &&
          selectedTopic.levels.some((topicLevel) =>
            app.levels.includes(topicLevel),
          ))) &&
      matchesResourceSearch(search, [
        app.title,
        app.topic,
        ...app.topicCodes,
        app.summary,
        ...app.levels,
        STRANDS[app.strand],
      ]),
  );
  const canReorder =
    editing && isTeacher && !level && !topicId && !search.trim();

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
    <main className={`portal-page ${s.page}`}>
      <header className={s.heading}>
        <div>
          <h1 className="portal-heading">{copy.apps.title}</h1>
          <p>{c.appIntro}</p>
        </div>
        {level && (
          <Link href={`/forms/${level.toLowerCase()}`} className={s.back}>
            ← {c.formLink(level)}
          </Link>
        )}
      </header>
      <ResourceFilters
        filters={filters}
        update={update}
        chapters={loaded && !loadError ? chapterOptions : []}
        searchLabel={copy.apps.search}
        placeholder={c.findApps}
        topicDisabled={
          !topicsLoaded || !loaded || Boolean(topicsError || loadError)
        }
      />
      <section className={s.results} aria-label={c.results}>
        {topicsError && (
          <p role="alert" className="text-crimson mt-3">
            {topicsError}
          </p>
        )}
        {editing && isTeacher && (
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
            <div className={s.resultsBar}>
              <h2>
                <span role="status">
                  {copy.apps.resultCount(filtered.length)}
                </span>
              </h2>
              <Link
                href={resourceHref("/mistakes-book", { ...filters, q: "" })}
              >
                {c.appToBooks} →
              </Link>
            </div>
            {filtered.length === 0 ? (
              <p className={s.empty}>
                {selectedTopic && (
                  <strong>
                    {selectedTopic.code} · {selectedTopic.name}
                    <br />
                  </strong>
                )}
                {selectedTopic && !search.trim()
                  ? copy.apps.emptyTopic
                  : c.noApps}
              </p>
            ) : (
              <ul className={s.appList}>
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
                      className={s.appCard}
                    >
                      <Link
                        prefetch={false}
                        href={resourceHref(`/apps/${app.slug}`, filters)}
                        className={s.appLink}
                      >
                        <div className={s.thumb}>
                          <Thumbnail className={s.thumbImage} />
                        </div>
                        <div className={s.appBody}>
                          <div className={s.meta}>
                            <span>{app.levels.join(" · ")}</span>
                            {app.featured && (
                              <span className={s.featured}>
                                {copy.apps.featured}
                              </span>
                            )}
                            {!app.visible && isTeacher && (
                              <span>{copy.apps.hiddenTeacher}</span>
                            )}
                          </div>
                          <h3>{app.title}</h3>
                          <p className={s.chapterName}>{app.topic}</p>
                          <p className={s.description}>{app.summary}</p>
                          <div className={s.cardFoot}>
                            <span>{app.topicCodes.join(" · ")}</span>
                            <span aria-hidden="true">↗</span>
                          </div>
                        </div>
                      </Link>
                      {editing && isTeacher && (
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
                      {editing &&
                        isTeacher &&
                        editingSlug === app.slug &&
                        user?.email && (
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
      </section>
    </main>
  );
}
