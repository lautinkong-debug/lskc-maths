import { startTransition, useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { Field } from "./Editors";
import { type Activity } from "./classroom";
import { type LessonTask } from "./advanced";
import { LIBRARY_KEY, readLibrary, type SavedLesson } from "./storage";
import s from "./lab.module.css";
const c = copy.statisticalCharts.advanced;
export function LocalLessons({
  activity,
  task,
  onTask,
  onOpen,
  onClear,
  status,
}: {
  activity: Activity | null;
  task: LessonTask;
  onTask: (t: LessonTask) => void;
  onOpen: (a: Activity) => void;
  onClear: () => void;
  status: string;
}) {
  const [lessons, setLessons] = useState<SavedLesson[]>([]),
    [message, setMessage] = useState(""),
    [removed, setRemoved] = useState<SavedLesson | null>(null);
  useEffect(() => {
    startTransition(() => {
      try {
        const saved = localStorage.getItem(LIBRARY_KEY);
        if (saved) setLessons(readLibrary(saved));
      } catch {
        setMessage(c.storageError);
      }
    });
  }, []);
  function persist(next: SavedLesson[]) {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
      setLessons(next);
      setMessage(c.savedLesson);
      return true;
    } catch {
      setMessage(c.storageError);
      return false;
    }
  }
  return (
    <details className={s.teacherTools}>
      <summary>
        {c.library}
        <span>{status}</span>
      </summary>
      <div className={s.toolsGrid}>
        <section>
          <h3>{c.author}</h3>
          <p>{c.authorHelp}</p>
          <Field label={c.taskName}>
            <input
              value={task.name}
              maxLength={80}
              onChange={(e) => onTask({ ...task, name: e.target.value })}
            />
          </Field>
          <Field label={c.instructions}>
            <textarea
              value={task.instructions}
              maxLength={800}
              rows={3}
              onChange={(e) =>
                onTask({ ...task, instructions: e.target.value })
              }
            />
          </Field>
          <Field label={c.startLevel}>
            <select
              value={task.level}
              onChange={(e) =>
                onTask({ ...task, level: Number(e.target.value) as 1 | 2 | 3 })
              }
            >
              {copy.statisticalCharts.learning.levels.map((text, i) => (
                <option key={i} value={i + 1}>
                  {text}
                </option>
              ))}
            </select>
          </Field>
          <p className={s.small}>{c.taskLevelNote}</p>
          <button
            disabled={!activity || lessons.length >= 12}
            onClick={() => {
              if (activity)
                persist([
                  ...lessons,
                  {
                    id: crypto.randomUUID(),
                    name: task.name.trim() || activity.title,
                    activity,
                    updated: Date.now(),
                  },
                ]);
            }}
          >
            {c.saveLesson}
          </button>
          <p className={s.small}>{c.libraryLimit}</p>
          <p className={s.small}>{c.shareTask}</p>
        </section>
        <section>
          <h3>{c.savedActivities}</h3>
          {!lessons.length && <p>{c.noLessons}</p>}
          <ul className={s.lessonLibrary}>
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <strong>{lesson.name}</strong>
                <div className={s.toolbar}>
                  <button
                    aria-label={`${c.openLesson}: ${lesson.name}`}
                    onClick={() => onOpen(lesson.activity)}
                  >
                    {c.openLesson}
                  </button>
                  <button
                    aria-label={`${c.deleteLesson}: ${lesson.name}`}
                    onClick={() => {
                      if (persist(lessons.filter((l) => l.id !== lesson.id)))
                        setRemoved(lesson);
                    }}
                  >
                    {c.deleteLesson}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {removed && (
            <button
              disabled={lessons.length >= 12}
              onClick={() => {
                if (persist([...lessons, removed])) setRemoved(null);
              }}
            >
              {c.undoDelete}
            </button>
          )}
          <p className={s.small}>{c.localOnly}</p>
          <p className={s.small} role="status">
            {status}
          </p>
          <button onClick={onClear}>{c.clearProgress}</button>
        </section>
      </div>
      <p className={s.toolStatus} role="status">
        {message}
      </p>
    </details>
  );
}
