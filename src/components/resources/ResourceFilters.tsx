"use client";

import { useSearchParams } from "next/navigation";
import { ACTIVE_LEVELS } from "@/lib/constants";
import { resourceNavigationCopy as c } from "@/lib/resourceNavigationCopy";
import {
  clearResourceFilters,
  readResourceFilters,
  resourceHref,
  type ResourceFilters as Filters,
} from "@/lib/resourceNavigation";
import s from "./Resources.module.css";

export function useResourceFilters() {
  const filters = readResourceFilters(useSearchParams());
  function update(next: Filters) {
    window.history.replaceState(
      null,
      "",
      resourceHref(window.location.pathname, next) + window.location.hash,
    );
  }
  return { filters, update };
}

export type ChapterOption = {
  id: string;
  name: string;
  code: string;
  group?: string;
};
export function ResourceFilters({
  filters,
  update,
  chapters,
  searchLabel,
  placeholder,
  topicDisabled = false,
}: {
  filters: Filters;
  update: (next: Filters) => void;
  chapters: ChapterOption[];
  searchLabel: string;
  placeholder: string;
  topicDisabled?: boolean;
}) {
  const groups = [...new Set(chapters.map((t) => t.group))];
  const renderOption = (chapter: ChapterOption) => (
    <option key={chapter.id} value={chapter.id}>
      {[chapter.code, chapter.name].filter(Boolean).join(" · ")}
    </option>
  );
  return (
    <section className={s.filters} aria-label={c.filter}>
      <div className={s.formRow} role="group" aria-label={c.form}>
        <span className={s.formLabel}>{c.form}</span>
        {(["", ...ACTIVE_LEVELS] as const).map((level) => (
          <button
            key={level}
            type="button"
            aria-pressed={filters.level === level}
            onClick={() => update({ ...filters, level, topic: "" })}
          >
            {level || c.allForms}
          </button>
        ))}
      </div>
      <div className={s.filterFields}>
        <label className={s.search}>
          <span>{searchLabel}</span>
          <span className={s.searchControl}>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="10" cy="10" r="6.5" />
              <path d="m15 15 5 5" />
            </svg>
            <input
              type="search"
              aria-label={searchLabel}
              value={filters.q}
              placeholder={placeholder}
              onChange={(event) =>
                update({ ...filters, q: event.target.value })
              }
            />
          </span>
        </label>
        <label>
          <span>{c.chapter}</span>
          <select
            aria-label={c.chapter}
            value={filters.topic}
            disabled={topicDisabled}
            onChange={(event) =>
              update({ ...filters, topic: event.target.value })
            }
          >
            <option value="">{c.allTopics}</option>
            {filters.topic && !chapters.some((t) => t.id === filters.topic) && (
              <option value={filters.topic}>{c.unknownTopic}</option>
            )}
            {groups.map((group) =>
              group ? (
                <optgroup key={group} label={group}>
                  {chapters.filter((t) => t.group === group).map(renderOption)}
                </optgroup>
              ) : (
                chapters.filter((t) => !t.group).map(renderOption)
              ),
            )}
          </select>
        </label>
      </div>
      {(filters.level || filters.topic || filters.q) && (
        <button
          className={s.reset}
          type="button"
          onClick={() => update(clearResourceFilters)}
        >
          {c.clear}
        </button>
      )}
    </section>
  );
}
