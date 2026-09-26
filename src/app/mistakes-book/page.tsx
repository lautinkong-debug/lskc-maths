"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ACTIVE_LEVELS, type Level } from "@/lib/constants";
import { copy } from "@/lib/copy";
import {
  sortBooksByNewest,
  watchVisibleBooks,
  type MistakeBook,
} from "@/lib/db/books";
import { sortTopicsForLevel, watchTopics, type Topic } from "@/lib/db/topics";

export default function MistakesBookPage() {
  const { role } = useAuth();
  const isTeacher = role === "teacher" || role === "admin";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [books, setBooks] = useState<MistakeBook[]>([]);
  const [level, setLevel] = useState<Level>("F1");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () =>
      watchTopics(
        (rows) => {
          setTopics(rows);
          setLoadingTopics(false);
        },
        () => {
          setError(copy.topics.loadFailed);
          setLoadingTopics(false);
        },
      ),
    [],
  );

  useEffect(() => {
    return watchVisibleBooks(
      isTeacher,
      (rows) => {
        setBooks(rows);
        setLoadingBooks(false);
      },
      () => {
        setError(copy.books.loadFailed);
        setLoadingBooks(false);
      },
    );
  }, [isTeacher]);

  const levels = ACTIVE_LEVELS.filter((item) =>
    topics.some((topic) => topic.levels.includes(item)),
  );
  const levelTopics = sortTopicsForLevel(topics, level);
  const selectedTopic = levelTopics.find((topic) => topic.id === topicId);
  const selectedBooks = sortBooksByNewest(
    books.filter(
      (book) =>
        book.topicId === topicId &&
        book.level === level &&
        (isTeacher || book.edition === "student"),
    ),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="font-display text-hero text-crimson-deep font-semibold">
        {copy.books.title}
      </h1>
      <p className="mt-2 max-w-prose">{copy.books.intro}</p>
      {error && (
        <p role="alert" className="text-crimson mt-5">
          {error}
        </p>
      )}
      <section aria-label={copy.books.chooseLevel} className="mt-8">
        <h2 className="text-sm font-semibold">{copy.books.chooseLevel}</h2>
        <div className="border-grid mt-2 flex flex-wrap gap-2 border-b pb-3">
          {levels.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={level === item}
              onClick={() => {
                setLevel(item);
                setTopicId(null);
              }}
              className={`rounded px-4 py-2 text-sm font-semibold ${level === item ? "bg-crimson text-white" : "bg-crimson-wash text-crimson-deep hover:bg-grid"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      {loadingTopics || loadingBooks ? (
        <p className="mt-6">{copy.books.loading}</p>
      ) : levelTopics.length === 0 ? (
        <p className="mt-6">{copy.books.noTopics}</p>
      ) : (
        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
          <section aria-label={copy.books.topicsTitle}>
            <h2 className="font-display text-section font-semibold">
              {copy.books.topicsTitle}
            </h2>
            <ul className="border-grid mt-3 divide-y border-t border-b">
              {levelTopics.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    aria-pressed={topicId === topic.id}
                    onClick={() => setTopicId(topic.id)}
                    className={`hover:bg-crimson-wash flex w-full gap-3 px-2 py-3 text-left ${topicId === topic.id ? "bg-crimson-wash" : ""}`}
                  >
                    <span className="text-crimson-deep w-14 shrink-0 text-sm font-semibold">
                      {topic.code}
                    </span>
                    <span>{topic.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section aria-label={copy.books.booksTitle}>
            <h2 className="font-display text-section font-semibold">
              {selectedTopic ? selectedTopic.name : copy.books.booksTitle}
            </h2>
            {!selectedTopic ? (
              <p className="text-pencil mt-3">{copy.books.chooseTopic}</p>
            ) : selectedBooks.length === 0 ? (
              <p className="text-pencil mt-3">{copy.books.empty}</p>
            ) : (
              <ul className="border-grid mt-3 divide-y border-t border-b">
                {selectedBooks.map((book) => (
                  <li key={book.id}>
                    <Link
                      href={`/mistakes-book/${book.id}`}
                      className="hover:bg-crimson-wash block px-2 py-4"
                    >
                      <span className="font-semibold">{book.title}</span>
                      <span
                        className={`ml-3 inline-block rounded px-2 py-0.5 text-xs font-medium ${book.edition === "teacher" ? "bg-navy-wash text-navy" : "bg-crimson-wash text-crimson-deep"}`}
                      >
                        {book.edition === "teacher"
                          ? copy.books.teacherEdition
                          : copy.books.studentEdition}
                      </span>
                      {book.description && (
                        <p className="text-pencil mt-1 text-sm">
                          {book.description}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
