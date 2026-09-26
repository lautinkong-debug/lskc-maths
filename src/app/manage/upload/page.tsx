"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { ACTIVE_LEVELS, type Edition, type Level } from "@/lib/constants";
import { copy } from "@/lib/copy";
import { BookInputError, createBook } from "@/lib/db/books";
import { sortTopicsForLevel, watchTopics, type Topic } from "@/lib/db/topics";

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [level, setLevel] = useState<Level>("F1");
  const [topicId, setTopicId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [edition, setEdition] = useState<Edition>("student");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsLoadError, setTopicsLoadError] = useState(false);

  useEffect(
    () =>
      watchTopics(
        (rows) => {
          setTopics(rows);
          setLoadingTopics(false);
          setTopicsLoadError(false);
        },
        () => {
          setLoadingTopics(false);
          setTopicsLoadError(true);
        },
      ),
    [],
  );
  const levelTopics = sortTopicsForLevel(topics, level);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const topic = levelTopics.find((item) => item.id === topicId);
    if (!user?.email || !topic || !file) {
      setError(copy.books.invalidDetails);
      return;
    }
    setBusy(true);
    setProgress(0);
    setError("");
    try {
      const id = await createBook(
        { title, description, level, topic, edition, file },
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName ?? user.email,
        },
        setProgress,
      );
      router.push(`/mistakes-book/${id}`);
    } catch (cause) {
      setError(
        cause instanceof BookInputError
          ? copy.books[cause.reason]
          : copy.books.operationFailed,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="font-display text-hero text-crimson-deep font-semibold">
        {copy.books.uploadTitle}
      </h1>
      <p className="mt-2">{copy.books.uploadIntro}</p>
      {error && (
        <p role="alert" className="text-crimson mt-5">
          {error}
        </p>
      )}
      {topicsLoadError && (
        <p role="alert" className="text-crimson mt-5">
          {copy.topics.loadFailed}
        </p>
      )}
      <form
        onSubmit={(event) => void submit(event)}
        className="border-grid mt-8 space-y-5 border bg-white p-5 sm:p-7"
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
        <div className="grid gap-5 sm:grid-cols-2">
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
            {copy.books.editionLabel}
            <select
              value={edition}
              onChange={(event) => setEdition(event.target.value as Edition)}
              className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
            >
              <option value="student">{copy.books.studentEdition}</option>
              <option value="teacher">{copy.books.teacherEdition}</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold">
          {copy.books.topicLabel}
          <select
            required
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
            disabled={
              loadingTopics || topicsLoadError || levelTopics.length === 0
            }
            className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal disabled:opacity-50"
          >
            <option value="">{copy.books.chooseTopicOption}</option>
            {levelTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.code} · {topic.name}
              </option>
            ))}
          </select>
          {loadingTopics ? (
            <span role="status" className="text-pencil mt-1 block font-normal">
              {copy.topics.loading}
            </span>
          ) : (
            !topicsLoadError &&
            levelTopics.length === 0 && (
              <span className="text-pencil mt-1 block font-normal">
                {copy.books.noTopicForLevel}
              </span>
            )
          )}
        </label>
        <label className="block text-sm font-semibold">
          {copy.books.fileLabel}
          <input
            required
            type="file"
            accept=".pdf,.docx,.html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/html"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="border-grid-strong mt-1 block w-full rounded border px-3 py-2 font-normal"
          />
          <span className="text-pencil mt-1 block font-normal">
            {copy.books.fileHint}
          </span>
        </label>
        {busy && (
          <div role="status">
            <p>
              {copy.books.uploading} {progress}%
            </p>
            <progress value={progress} max={100} className="mt-2 w-full" />
          </div>
        )}
        <button
          type="submit"
          disabled={
            busy || loadingTopics || topicsLoadError || levelTopics.length === 0
          }
          className="bg-crimson hover:bg-crimson-deep rounded px-5 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {copy.books.uploadAction}
        </button>
      </form>
    </main>
  );
}
