"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { appRegistry } from "@/apps/registry";
import type { Level } from "@/lib/constants";
import { copy } from "@/lib/copy";
import { portalCopy as c } from "@/lib/portalCopy";
import { useAuth } from "@/lib/auth";
import {
  effectiveApp,
  watchAppSettings,
  type AppSettings,
} from "@/lib/db/appSettings";
import { watchVisibleBooks, type MistakeBook } from "@/lib/db/books";

export function FormResources({ level }: { level: Level }) {
  const { role } = useAuth();
  const teacher = role === "teacher" || role === "admin";
  const [settings, setSettings] = useState<AppSettings[] | null>(null);
  const [books, setBooks] = useState<MistakeBook[] | null>(null);
  const [appsError, setAppsError] = useState(false);
  const [booksError, setBooksError] = useState(false);
  useEffect(
    () =>
      watchAppSettings(
        (rows) => {
          setSettings(rows);
          setAppsError(false);
        },
        () => setAppsError(true),
      ),
    [],
  );
  useEffect(
    () =>
      watchVisibleBooks(
        false,
        (rows) => {
          setBooks(rows);
          setBooksError(false);
        },
        () => setBooksError(true),
        level,
      ),
    [level],
  );

  const bySlug = new Map(settings?.map((item) => [item.slug, item]));
  const apps = appRegistry
    .map((entry, index) =>
      effectiveApp(entry, bySlug.get(entry.slug) ?? null, index),
    )
    .filter((app) => app.visible && app.levels.some((item) => item === level))
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        a.order - b.order ||
        a.title.localeCompare(b.title),
    );
  const fromForm = `?from=form&level=${level}`;
  return (
    <div className="form-shelves">
      <section className="form-shelf" aria-labelledby="form-apps">
        <div className="shelf-title">
          <h2 id="form-apps">{c.apps}</h2>
          {settings && !appsError && <span>{c.more(apps.length)}</span>}
        </div>
        {appsError ? (
          <p role="alert">{copy.apps.settingsFailed}</p>
        ) : settings === null ? (
          <p role="status">{c.loadApps}</p>
        ) : apps.length === 0 ? (
          <p>{c.noApps}</p>
        ) : (
          <ul className="form-app-list">
            {apps.map((app) => {
              const Thumbnail = app.thumbnail;
              return (
                <li key={app.slug}>
                  <Link prefetch={false} href={`/apps/${app.slug}${fromForm}`}>
                    <span className="form-thumb" aria-hidden="true">
                      <Thumbnail className="form-thumb-image" />
                    </span>
                    <span className="form-item-copy">
                      <strong>{app.title}</strong>
                      <span>{app.topic}</span>
                    </span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          prefetch={false}
          className="portal-text-link"
          href={`/apps?level=${level}`}
        >
          {c.allApps} →
        </Link>
      </section>
      <section className="form-shelf book-shelf" aria-labelledby="form-books">
        <div className="shelf-title">
          <h2 id="form-books">{c.books}</h2>
          {books && !booksError && <span>{c.more(books.length)}</span>}
        </div>
        {booksError ? (
          <p role="alert">{copy.books.loadFailed}</p>
        ) : books === null ? (
          <p role="status">{c.loadBooks}</p>
        ) : books.length === 0 ? (
          <p>{c.noBooks}</p>
        ) : (
          <ul className="form-book-list">
            {books.slice(0, 6).map((book) => (
              <li key={book.id}>
                <Link
                  prefetch={false}
                  href={`/mistakes-book/${encodeURIComponent(book.id)}${fromForm}`}
                >
                  <span className="book-format">
                    {book.fileType.toUpperCase()}
                  </span>
                  <span className="form-item-copy">
                    <strong>{book.title}</strong>
                    <span>{book.topicName}</span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          prefetch={false}
          className="portal-text-link"
          href={`/mistakes-book?level=${level}`}
        >
          {c.allBooks} →
        </Link>
        {teacher && (
          <Link
            prefetch={false}
            className="portal-text-link"
            href={`/manage/upload?level=${level}`}
          >
            {c.addBook} →
          </Link>
        )}
      </section>
    </div>
  );
}
