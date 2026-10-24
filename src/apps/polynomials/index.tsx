"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LessonWorkspace } from "@/components/LessonWorkspace";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { lessons, lessonById } from "./bank";
import type { Bank, Skill } from "./lesson-types";
import { PilotLesson } from "./PilotLesson";
import { GenericLesson } from "./GenericLesson";
import styles from "./polynomials.module.css";
const c = copy.polynomials;
const defaultId = "10D-34b";
const subscribe = (fn: () => void) => {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
};
const getHash = () => window.location.hash;
const serverHash = () => "";
export default function Polynomials() {
  const currentHash = useSyncExternalStore(subscribe, getHash, serverHash);
  const requestedId = currentHash.startsWith("#textbook:e=")
    ? currentHash.slice(12)
    : "";
  const lesson = lessonById.get(requestedId) ?? lessonById.get(defaultId)!;
  const [bank, setBank] = useState<Bank | "">("");
  const [skill, setSkill] = useState<Skill | "">("");
  const [search, setSearch] = useState("");
  const [filterRevision, setFilterRevision] = useState(0);
  const presenting = usePresentation();
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", `#textbook:e=${defaultId}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }, []);
  const filtered = lessons.filter(
    (l) =>
      (!bank || l.bank === bank) &&
      (!skill || l.skill === skill) &&
      `${l.id} Q${l.number}${l.part} ${c.banks[l.bank]} ${l.prompt}`
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
  );
  const position = filtered.findIndex((l) => l.id === lesson.id);
  const select = (id: string) => {
    window.history.pushState(null, "", `#textbook:e=${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  const revise = () => setFilterRevision((p) => p + 1);
  const reference = `${c.banks[lesson.bank]} · ${c.questionLabel(lesson.number, lesson.part)}`;
  return (
    <LessonWorkspace
      subject={c.title}
      symbol="x²"
      active={reference}
      presenting={presenting}
      navigation={
        <div className={styles.filters}>
          <p className={styles.bankCount}>{c.questionCount(lessons.length)}</p>
          <label>
            {c.exerciseFilter}
            <select
              value={bank}
              onChange={(e) => {
                setBank(e.target.value as Bank | "");
                revise();
              }}
            >
              <option value="">{c.allExercises}</option>
              {Object.entries(c.banks).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {c.skillFilter}
            <select
              value={skill}
              onChange={(e) => {
                setSkill(e.target.value as Skill | "");
                revise();
              }}
            >
              <option value="">{c.allSkills}</option>
              {Object.entries(c.skills).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {c.search}
            <input
              type="search"
              value={search}
              placeholder={c.searchHint}
              onChange={(e) => {
                setSearch(e.target.value);
                revise();
              }}
            />
          </label>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>{c.noMatches}</p>
              <button
                onClick={() => {
                  setBank("");
                  setSkill("");
                  setSearch("");
                  revise();
                }}
              >
                {c.clearFilters}
              </button>
            </div>
          ) : (
            <nav aria-label={c.navigation}>
              {Object.entries(c.banks).map(([id, label]) => {
                const group = filtered.filter((l) => l.bank === id);
                return (
                  group.length > 0 && (
                    <div key={id} className={styles.questionGroup}>
                      <h3>
                        {label} <span>{group.length}</span>
                      </h3>
                      <div>
                        {group.map((l) => (
                          <button
                            key={l.id}
                            aria-pressed={l.id === lesson.id}
                            onClick={() => {
                              if (l.id === lesson.id) revise();
                              select(l.id);
                            }}
                          >
                            {c.questionLabel(l.number, l.part)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                );
              })}
            </nav>
          )}
        </div>
      }
    >
      {currentHash && !lessonById.has(requestedId) && (
        <p role="status" className={styles.notice}>
          {c.invalidQuestion}
        </p>
      )}
      <div key={`${lesson.id}-${filterRevision}`}>
        {lesson.id === defaultId ? (
          <PilotLesson />
        ) : (
          <GenericLesson lesson={lesson} reference={reference} />
        )}
      </div>
      <div className={styles.questionNavigation}>
        <button
          disabled={position <= 0}
          onClick={() => select(filtered[position - 1].id)}
        >
          {c.previousQuestion}
        </button>
        <span>
          {position >= 0
            ? `${position + 1} / ${filtered.length}`
            : c.questionCount(filtered.length)}
        </span>
        <button
          disabled={position < 0 || position >= filtered.length - 1}
          onClick={() => select(filtered[position + 1].id)}
        >
          {c.nextQuestion}
        </button>
      </div>
    </LessonWorkspace>
  );
}
