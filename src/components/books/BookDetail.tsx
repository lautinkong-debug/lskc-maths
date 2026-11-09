"use client";

import { useEffect, useState } from "react";
import { ResourceBackLink } from "@/components/resources/ResourceBackLink";
import s from "@/components/resources/Resources.module.css";
import { useAuth } from "@/lib/auth";
import { copy } from "@/lib/copy";
import { getVisibleBook, type MistakeBook } from "@/lib/db/books";
import { FileViewer } from "./FileViewer";

export function BookDetail({ id }: { id: string }) {
  const { role, loading: authLoading } = useAuth();
  const isTeacher = role === "teacher" || role === "admin";
  const [book, setBook] = useState<MistakeBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    getVisibleBook(id)
      .then((result) => {
        if (active) {
          setBook(result);
          setLoadError(false);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setBook(null);
          const denied =
            typeof cause === "object" &&
            cause !== null &&
            "code" in cause &&
            cause.code === "permission-denied";
          setLoadError(!denied);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, role, authLoading]);

  const allowed = book && (book.edition === "student" || isTeacher);
  return (
    <main className={`portal-page ${s.page} ${s.detail}`}>
      <ResourceBackLink collection="/mistakes-book" className={s.back}>
        ← {copy.books.backToBooks}
      </ResourceBackLink>
      {loading || authLoading || (book !== null && book.id !== id) ? (
        <p role="status" className="mt-8">
          {copy.books.loading}
        </p>
      ) : loadError ? (
        <p role="alert" className="text-crimson mt-8">
          {copy.books.loadFailed}
        </p>
      ) : !allowed ? (
        <h1 className="font-display text-section text-crimson-deep mt-8 font-semibold">
          {copy.books.unavailable}
        </h1>
      ) : (
        <>
          <h1 className={s.detailTitle}>{book.title}</h1>
          <p className="text-pencil mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span>
              {book.level} · {book.topicName}
            </span>
            <span>
              {book.edition === "teacher"
                ? copy.books.teacherEdition
                : copy.books.studentEdition}
            </span>
            {book.createdAt && (
              <span>
                {copy.books.uploadedOn}{" "}
                {new Intl.DateTimeFormat("en-HK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(book.createdAt)}
              </span>
            )}
          </p>
          {book.description && (
            <p className="mt-5 max-w-prose">{book.description}</p>
          )}
          <FileViewer key={book.id} book={book} />
        </>
      )}
    </main>
  );
}
