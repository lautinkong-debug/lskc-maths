"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ACTIVE_LEVELS, type Level } from "@/lib/constants";
import { copy } from "@/lib/copy";
import {
  BookInputError,
  deleteBook,
  editBook,
  watchVisibleBooks,
  type MistakeBook,
} from "@/lib/db/books";
import { sortTopicsForLevel, watchTopics, type Topic } from "@/lib/db/topics";

export default function ManageBooksPage() {
  const [books, setBooks] = useState<MistakeBook[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editing, setEditing] = useState<MistakeBook | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<Level>("F1");
  const [topicId, setTopicId] = useState("");
  const [replacement, setReplacement] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      watchTopics(setTopics, () => {
        setMessage(copy.topics.loadFailed);
        setIsError(true);
      }),
    [],
  );
  useEffect(
    () =>
      watchVisibleBooks(
        true,
        (rows) => {
          setBooks(rows);
          setLoading(false);
        },
        () => {
          setMessage(copy.books.loadFailed);
          setIsError(true);
          setLoading(false);
        },
      ),
    [],
  );

  const levelTopics = sortTopicsForLevel(topics, level);

  function startEdit(book: MistakeBook) {
    setEditing(book);
    setTitle(book.title);
    setDescription(book.description);
    setLevel(book.level);
    setTopicId(book.topicId);
    setReplacement(null);
    setMessage("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const topic = levelTopics.find((item) => item.id === topicId);
    if (!topic) {
      setMessage(copy.books.invalidDetails);
      setIsError(true);
      return;
    }
    setBusy(true);
    setProgress(0);
    setMessage("");
    try {
      await editBook(
        editing,
        { title, description, level, topic },
        replacement,
        setProgress,
      );
      setEditing(null);
      setReplacement(null);
      setMessage(copy.books.saved);
      setIsError(false);
    } catch (cause) {
      setMessage(
        cause instanceof BookInputError
          ? copy.books[cause.reason]
          : copy.books.operationFailed,
      );
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  async function remove(book: MistakeBook) {
    if (!window.confirm(copy.books.confirmDelete)) return;
    setBusy(true);
    setMessage("");
    try {
      await deleteBook(book);
      if (editing?.id === book.id) setEditing(null);
      setMessage(copy.books.deleted);
      setIsError(false);
    } catch {
      setMessage(copy.books.operationFailed);
      setIsError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="font-display text-hero text-crimson-deep font-semibold">
        {copy.books.manageTitle}
      </h1>
      <p className="mt-2">{copy.books.manageIntro}</p>
      {message && (
        <p
          role={isError ? "alert" : "status"}
          className={`mt-5 ${isError ? "text-crimson" : "text-navy"}`}
        >
          {message}
        </p>
      )}
      {loading ? (
        <p className="mt-8">{copy.books.loading}</p>
      ) : books.length === 0 ? (
        <p className="mt-8">{copy.books.noManagedBooks}</p>
      ) : (
        <ul className="border-grid mt-8 divide-y border-t border-b">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex flex-wrap items-center gap-4 py-4"
            >
              <div className="min-w-0 flex-1 basis-56">
                <Link
                  href={`/mistakes-book/${book.id}`}
                  className="text-crimson-deep font-semibold underline"
                >
                  {book.title}
                </Link>
                <p className="text-pencil mt-1 text-sm">
                  {book.level} · {book.topicName} ·{" "}
                  {book.edition === "teacher"
                    ? copy.books.teacherEdition
                    : copy.books.studentEdition}{" "}
                  · {book.fileType.toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => startEdit(book)}
                  className="border-grid-strong rounded border px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                >
                  {copy.books.editAction}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(book)}
                  className="border-crimson text-crimson rounded border px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                >
                  {copy.books.deleteAction}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <section className="border-grid mt-10 border bg-white p-5 sm:p-7">
          <h2 className="font-display text-section text-crimson-deep font-semibold">
            {copy.books.editAction}: {editing.title}
          </h2>
          <form
            onSubmit={(event) => void save(event)}
            className="mt-5 space-y-5"
          >
            <label className="block text-sm font-semibold">
              {copy.books.titleLabel}
              <input
                required
                maxLength={160}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold">
              {copy.books.descriptionLabel}
              <textarea
                maxLength={1000}
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold">
              {copy.books.levelLabel}
              <select
                value={level}
                onChange={(event) => {
                  setLevel(event.target.value as Level);
                  setTopicId("");
                }}
                className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
              >
                {ACTIVE_LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {copy.books.topicLabel}
              <select
                required
                value={topicId}
                onChange={(event) => setTopicId(event.target.value)}
                className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
              >
                <option value="">{copy.books.chooseTopicOption}</option>
                {levelTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.code} · {topic.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {copy.books.replacementLabel}
              <input
                key={editing.id}
                type="file"
                accept={`.${editing.fileType}`}
                onChange={(event) =>
                  setReplacement(event.target.files?.[0] ?? null)
                }
                className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
              />
              <span className="text-pencil mt-1 block font-normal">
                {copy.books.replacementHint}
              </span>
            </label>
            {busy && replacement && (
              <div role="status">
                <p>
                  {copy.books.uploading} {progress}%
                </p>
                <progress value={progress} max={100} className="mt-2 w-full" />
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="bg-crimson hover:bg-crimson-deep rounded px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {copy.books.saveAction}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(null)}
                className="border-grid-strong rounded border px-4 py-2 font-semibold disabled:opacity-50"
              >
                {copy.books.cancelAction}
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
