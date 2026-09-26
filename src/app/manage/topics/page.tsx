"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ACTIVE_LEVELS,
  COMPULSORY_STRANDS,
  STRANDS,
  type Level,
  type Strand,
} from "@/lib/constants";
import { copy } from "@/lib/copy";
import {
  TopicInputError,
  addTopic,
  deleteTopicIfUnused,
  editTopic,
  moveTopic,
  sortTopicsForLevel,
  watchTopics,
  type Topic,
} from "@/lib/db/topics";

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level>("F1");
  const [draftLevel, setDraftLevel] = useState<Level>("F1");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [strand, setStrand] = useState<Strand>("number-algebra");
  const [editing, setEditing] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(
    () =>
      watchTopics(
        (rows) => {
          setTopics(rows);
          setLoading(false);
          setLoadError(false);
        },
        () => {
          setLoading(false);
          setLoadError(true);
        },
      ),
    [],
  );

  function announce(text: string, error = false) {
    setMessage(text);
    setIsError(error);
  }

  function resetForm(level = selectedLevel) {
    setEditing(null);
    setDraftLevel(level);
    setCode("");
    setName("");
    setStrand("number-algebra");
  }

  function chooseLevel(level: Level) {
    setSelectedLevel(level);
    resetForm(level);
    setMessage("");
  }

  function startEdit(topic: Topic) {
    setEditing(topic);
    setCode(topic.code);
    setName(topic.name);
    setDraftLevel(topic.levels[0]);
    setStrand(topic.strand);
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const input = { code, name, level: draftLevel, strand };
      if (editing) await editTopic(editing, input);
      else await addTopic(input);
      setSelectedLevel(draftLevel);
      resetForm(draftLevel);
      announce(copy.topics.saved);
    } catch (error) {
      announce(
        error instanceof TopicInputError
          ? copy.topics[error.reason]
          : copy.topics.failed,
        true,
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(topic: Topic) {
    if (!window.confirm(copy.topics.confirmDelete)) return;
    setBusy(true);
    setMessage("");
    try {
      const deleted = await deleteTopicIfUnused(topic.id);
      if (!deleted) announce(copy.topics.inUse, true);
      else {
        if (editing?.id === topic.id) resetForm();
        announce(copy.topics.deleted);
      }
    } catch {
      announce(copy.topics.failed, true);
    } finally {
      setBusy(false);
    }
  }

  async function reorder(id: string, direction: -1 | 1) {
    setBusy(true);
    setMessage("");
    try {
      await moveTopic(topics, selectedLevel, id, direction);
      announce(copy.topics.reordered);
    } catch {
      announce(copy.topics.failed, true);
    } finally {
      setBusy(false);
    }
  }

  const visible = sortTopicsForLevel(topics, selectedLevel);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-hero text-navy font-semibold">
        {copy.topics.title}
      </h1>
      <p className="mt-2">{copy.topics.intro}</p>

      <section aria-label={copy.topics.chooseLevel} className="mt-8">
        <p className="text-sm font-semibold">{copy.topics.chooseLevel}</p>
        <div className="border-grid mt-2 flex flex-wrap gap-2 border-b pb-3">
          {ACTIVE_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={selectedLevel === level}
              onClick={() => chooseLevel(level)}
              className={`rounded px-4 py-2 text-sm font-semibold ${
                selectedLevel === level
                  ? "bg-navy text-white"
                  : "bg-navy-wash text-navy hover:bg-navy-soft"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      {message && (
        <p
          role={isError ? "alert" : "status"}
          className={`mt-5 ${isError ? "text-crimson" : "text-navy"}`}
        >
          {message}
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <section className="border-grid h-fit border p-5">
          <h2 className="font-display text-section text-navy font-semibold">
            {editing ? copy.topics.editTitle : copy.topics.addTitle}
          </h2>
          <form
            onSubmit={(event) => void submit(event)}
            className="mt-5 space-y-4"
          >
            <label className="block text-sm font-semibold">
              {copy.topics.code}
              <input
                required
                maxLength={30}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="border-grid-strong mt-1 block w-full rounded border bg-white px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold">
              {copy.topics.name}
              <input
                required
                maxLength={160}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="border-grid-strong mt-1 block w-full rounded border bg-white px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold">
              {copy.topics.level}
              <select
                value={draftLevel}
                onChange={(event) => setDraftLevel(event.target.value as Level)}
                className="border-grid-strong mt-1 block w-full rounded border bg-white px-3 py-2 font-normal"
              >
                {ACTIVE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {copy.topics.strand}
              <select
                value={strand}
                onChange={(event) => setStrand(event.target.value as Strand)}
                className="border-grid-strong mt-1 block w-full rounded border bg-white px-3 py-2 font-normal"
              >
                {COMPULSORY_STRANDS.map((item) => (
                  <option key={item} value={item}>
                    {STRANDS[item]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                disabled={busy}
                className="bg-navy hover:bg-navy-deep rounded px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {editing ? copy.topics.save : copy.topics.add}
              </button>
              {editing && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => resetForm()}
                  className="border-grid-strong rounded border px-4 py-2 font-semibold disabled:opacity-50"
                >
                  {copy.topics.cancel}
                </button>
              )}
            </div>
          </form>
        </section>

        <section
          aria-label={`${selectedLevel} ${copy.topics.topicCount(visible.length)}`}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-section text-navy font-semibold">
              {selectedLevel}
            </h2>
            <p className="text-pencil text-sm">
              {copy.topics.topicCount(visible.length)}
            </p>
          </div>
          {loading ? (
            <p role="status" className="mt-5">
              {copy.topics.loading}
            </p>
          ) : loadError ? (
            <p role="alert" className="text-crimson mt-5">
              {copy.topics.loadFailed}
            </p>
          ) : visible.length === 0 ? (
            <p className="mt-5">{copy.topics.empty}</p>
          ) : (
            <ol className="border-grid mt-3 divide-y border-t border-b">
              {visible.map((topic, index) => (
                <li
                  key={topic.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                >
                  <span className="bg-navy-wash text-navy min-w-14 rounded px-2 py-1 text-center text-sm font-semibold">
                    {topic.code}
                  </span>
                  <div className="min-w-0 flex-1 basis-52">
                    <p className="font-semibold">{topic.name}</p>
                    <p className="text-pencil text-sm">
                      {STRANDS[topic.strand]}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy || index === 0}
                      aria-label={`${copy.topics.moveUp} ${topic.code}`}
                      onClick={() => void reorder(topic.id, -1)}
                      className="border-grid-strong hover:bg-navy-wash rounded border px-2 py-1 text-sm disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={busy || index === visible.length - 1}
                      aria-label={`${copy.topics.moveDown} ${topic.code}`}
                      onClick={() => void reorder(topic.id, 1)}
                      className="border-grid-strong hover:bg-navy-wash rounded border px-2 py-1 text-sm disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => startEdit(topic)}
                      className="text-navy rounded px-2 py-1 text-sm font-semibold underline disabled:opacity-50"
                    >
                      {copy.topics.edit}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove(topic)}
                      className="text-crimson rounded px-2 py-1 text-sm font-semibold underline disabled:opacity-50"
                    >
                      {copy.topics.delete}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
