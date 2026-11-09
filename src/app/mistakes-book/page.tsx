"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  ResourceFilters,
  useResourceFilters,
} from "@/components/resources/ResourceFilters";
import { matchesResourceSearch, resourceHref } from "@/lib/resourceNavigation";
import { resourceNavigationCopy as c } from "@/lib/resourceNavigationCopy";
import s from "@/components/resources/Resources.module.css";
import { copy } from "@/lib/copy";
import { useEditMode } from "@/lib/editMode";
import {
  sortBooksByNewest,
  watchVisibleBooks,
  type MistakeBook,
} from "@/lib/db/books";
import { watchTopics, type Topic } from "@/lib/db/topics";

export default function MistakesBookPage() {
  return (
    <Suspense
      fallback={
        <main className="portal-page">
          <h1 className="portal-heading">{copy.books.title}</h1>
          <p role="status">{copy.books.loading}</p>
        </main>
      }
    >
      <BookCatalogue />
    </Suspense>
  );
}

function BookCatalogue() {
  const { editing } = useEditMode();
  const { role } = useAuth();
  const isTeacher = role === "teacher" || role === "admin";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [books, setBooks] = useState<MistakeBook[]>([]);
  const { filters, update } = useResourceFilters();
  const { level, topic: topicId, q } = filters;

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [bookError, setBookError] = useState("");

  useEffect(() => watchTopics(setTopics, () => setTopics([])), []);

  useEffect(() => {
    return watchVisibleBooks(
      isTeacher,
      (rows) => {
        setBooks(rows);
        setBookError("");
        setLoadingBooks(false);
      },
      () => {
        setBookError(copy.books.loadFailed);
        setLoadingBooks(false);
      },
    );
  }, [isTeacher]);

  const visibleBooks = books.filter(
    (book) => isTeacher || book.edition === "student",
  );
  const formBooks = visibleBooks.filter(
    (book) => !level || book.level === level,
  );
  const topicsById = new Map(topics.map((topic) => [topic.id, topic]));
  // Snapshot book metadata keeps the library usable while chapter names are being refreshed.
  const chapterOptions = Array.from(
    new Map(
      formBooks.map((book) => {
        const topic = topicsById.get(book.topicId);
        return [
          book.topicId,
          {
            id: book.topicId,
            code: topic?.code ?? "",
            name: topic?.name ?? book.topicName,
            order: topic?.order ?? 9999,
          },
        ];
      }),
    ).values(),
  ).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  // A link from the app catalogue may identify a real chapter with no books yet.
  const linkedChapter = topicsById.get(topicId);
  if (
    linkedChapter &&
    (!level || linkedChapter.levels.includes(level)) &&
    !chapterOptions.some((topic) => topic.id === topicId)
  ) {
    chapterOptions.push(linkedChapter);
  }
  const filtered = sortBooksByNewest(
    formBooks.filter((book) => {
      const topic = topicsById.get(book.topicId);
      return (
        (!topicId || book.topicId === topicId) &&
        matchesResourceSearch(q, [
          book.title,
          book.description,
          topic?.name ?? book.topicName,
          topic?.code ?? "",
          book.level,
          book.fileType,
          book.edition,
        ])
      );
    }),
  );

  return (
    <main className={`portal-page ${s.page}`}>
      <header className={s.heading}>
        <div>
          <h1 className="portal-heading">{copy.books.title}</h1>
          <p>{c.bookIntro}</p>
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
        chapters={chapterOptions}
        searchLabel={c.searchBooks}
        placeholder={c.findBooks}
        topicDisabled={loadingBooks || Boolean(bookError)}
      />
      {editing && isTeacher && (
        <div className={s.management}>
          <Link href="/manage/books">{copy.nav.manageBooks}</Link>
          <Link href="/manage/topics">{copy.nav.manageTopics}</Link>
        </div>
      )}
      <section className={s.results} aria-label={c.results}>
        {loadingBooks ? (
          <p role="status">{copy.books.loading}</p>
        ) : bookError ? (
          <p role="alert">{bookError}</p>
        ) : (
          <>
            <div className={s.resultsBar}>
              <h2>
                <span role="status">{c.bookCount(filtered.length)}</span>
              </h2>
              <Link href={resourceHref("/apps", { ...filters, q: "" })}>
                {c.booksToApps} →
              </Link>
            </div>
            {filtered.length === 0 ? (
              <p className={s.empty}>
                {visibleBooks.length ? c.noBooks : c.noPublishedBooks}
              </p>
            ) : (
              <ul className={s.bookList}>
                {filtered.map((book) => {
                  const topic = topicsById.get(book.topicId);
                  return (
                    <li key={book.id}>
                      <Link
                        prefetch={false}
                        href={resourceHref(
                          `/mistakes-book/${book.id}`,
                          filters,
                        )}
                        className={s.bookLink}
                      >
                        <span
                          className={s.documentIcon}
                          aria-label={book.fileType.toUpperCase()}
                        >
                          {book.fileType.toUpperCase()}
                        </span>
                        <div className={s.bookInfo}>
                          <p className={s.meta}>
                            {[
                              book.level,
                              topic?.code,
                              topic?.name ?? book.topicName,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <h3>{book.title}</h3>
                          {book.description && (
                            <p className={s.description}>{book.description}</p>
                          )}
                          {isTeacher && (
                            <span className={s.edition}>
                              {book.edition === "teacher"
                                ? copy.books.teacherEdition
                                : copy.books.studentEdition}
                            </span>
                          )}
                        </div>
                        <span aria-hidden="true" className={s.rowArrow}>
                          →
                        </span>
                      </Link>
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
