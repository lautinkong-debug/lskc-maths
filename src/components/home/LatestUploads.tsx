"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { watchLatestStudentBooks, type MistakeBook } from "@/lib/db/books";

export function LatestUploads() {
  const [books, setBooks] = useState<MistakeBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(
    () =>
      watchLatestStudentBooks(
        (rows) => {
          setBooks(rows);
          setLoading(false);
          setError(false);
        },
        () => {
          setError(true);
          setLoading(false);
        },
      ),
    [],
  );

  return (
    <section className="pb-4">
      <h2 className="font-display border-grid text-section border-b pb-2 font-semibold">
        {copy.home.latestTitle}
      </h2>
      {loading ? (
        <p className="py-5">{copy.books.loading}</p>
      ) : error ? (
        <p role="alert" className="text-crimson py-5">
          {copy.books.loadFailed}
        </p>
      ) : books.length === 0 ? (
        <p className="text-pencil py-5">{copy.home.latestEmpty}</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book.id} className="border-rule border-b last:border-0">
              <Link
                href={`/mistakes-book/${book.id}`}
                className="hover:bg-crimson-wash flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3"
              >
                <span className="bg-crimson-wash text-crimson-deep shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium">
                  {book.level}
                </span>
                <span className="text-pencil text-meta min-w-0 flex-1">
                  {book.topicName} · {book.title}
                </span>
                {book.createdAt && (
                  <span className="text-pencil text-meta">
                    {new Intl.DateTimeFormat("en-HK", {
                      day: "numeric",
                      month: "short",
                    }).format(book.createdAt)}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
