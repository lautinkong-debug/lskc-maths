"use client";

import Link from "next/link";
import { useState } from "react";
import { appRegistry } from "@/apps/registry";
import { ACTIVE_LEVELS, COMPULSORY_STRANDS, STRANDS } from "@/lib/constants";
import { copy } from "@/lib/copy";

export default function AppsPage() {
  const [level, setLevel] = useState("all");
  const [strand, setStrand] = useState("all");
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filtered = appRegistry.filter(
    (app) =>
      (level === "all" || app.levels.some((item) => item === level)) &&
      (strand === "all" || app.strand === strand) &&
      (!query ||
        `${app.title} ${app.topic} ${app.summary} ${app.levels.join(" ")}`
          .toLowerCase()
          .includes(query)),
  );

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
            return (
              <li key={app.slug}>
                <Link
                  href={`/apps/${app.slug}`}
                  className="border-grid border-t-navy hover:bg-navy-wash group flex h-full flex-col border border-t-[3px] bg-white"
                >
                  <Thumbnail className="border-grid h-44 w-full border-b bg-white" />
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-display text-card text-navy font-semibold">
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
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
