"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { LessonWorkspace } from "@/components/LessonWorkspace";
import { usePresentation } from "@/components/PresentationFrame";
import { PracticeFrame } from "../similarity/PracticeFrame";
import { GeometryName, GeometryText } from "../similarity/Notation";
import type { Shape } from "../similarity/types";
import { Board } from "./Board";
import { Solution } from "./Solution";
import { usableTriangle } from "./geometry";
import { extractEvidence } from "./evidence";
import { conclusionCorrespondence } from "./correspondence";
import { groups, questions, questionName, filterQuestions } from "./data";
import type { CongruenceQuestion } from "./types";
import styles from "./congruence.module.css";
import sharedStyles from "../similarity/similarity.module.css";

const c = copy.congruence,
  shared = copy.similarity;
const CongruenceGames = dynamic(() => import("./games"));
export default function CongruencePractice() {
  const [id, setId] = useState("qp5-14");
  const [group, setGroup] = useState("");
  const [query, setQuery] = useState("");
  const [classroom, setClassroom] = useState(true);
  const [mode, setMode] = useState<"practice" | "games">("practice");
  const opener = useRef<HTMLButtonElement>(null);
  const presenting = usePresentation();
  useEffect(() => {
    function read() {
      let saved = "";
      try {
        saved = localStorage.getItem("congruence-question") ?? "";
      } catch {
        /* Optional. */
      }
      const next = window.location.hash.slice(1) || saved;
      if (next === "games") {
        setMode("games");
        setClassroom(false);
      } else if (questions.some((q) => q.id === next)) {
        setId(next);
        setMode("practice");
      }
    }
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  function choose(next: string) {
    setId(next);
    setMode("practice");
    window.history.replaceState(null, "", `#${next}`);
    try {
      localStorage.setItem("congruence-question", next);
    } catch {
      /* Optional. */
    }
  }
  function changeMode(next: "practice" | "games") {
    setMode(next);
    setClassroom(next === "practice");
    window.history.replaceState(
      null,
      "",
      `#${next === "games" ? "games" : id}`,
    );
  }
  function exit() {
    setClassroom(false);
    requestAnimationFrame(() => opener.current?.focus());
  }
  const question = questions.find((q) => q.id === id) ?? questions[0];
  const index = questions.indexOf(question);
  const visible = filterQuestions(group, query);
  const picker = (
    <select
      aria-label={shared.chooseQuestion}
      value={question.id}
      onChange={(e) => choose(e.target.value)}
    >
      {groups.map((g) => (
        <optgroup key={g} label={g}>
          {questions
            .filter((q) => q.group === g)
            .map((q) => (
              <option key={q.id} value={q.id}>
                {questionName(q)} · p. 5.{q.page}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
  return (
    <div
      className={`${sharedStyles.app} ${styles.app}`}
      data-testid="congruence-practice"
    >
      <LessonWorkspace
        subject={c.title}
        symbol="≅"
        active={mode === "games" ? c.games : questionName(question)}
        presenting={presenting}
        navigation={
          <>
            <div className={styles.modeTabs} role="group" aria-label={c.modes}>
              <button
                aria-pressed={mode === "practice"}
                onClick={() => changeMode("practice")}
              >
                {c.practice}
              </button>
              <button
                aria-pressed={mode === "games"}
                onClick={() => changeMode("games")}
              >
                {c.games}
              </button>
            </div>
            <nav className={sharedStyles.bank} aria-label={shared.questionBank}>
              <h2>
                {shared.questionBank}
                <span>{questions.length}</span>
              </h2>
              <p className={styles.micro}>{c.coverage}</p>
              <label>
                {shared.search}
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={c.searchPlaceholder}
                />
              </label>
              <label>
                {shared.all}
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                >
                  <option value="">{shared.all}</option>
                  {groups.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </label>
              <p className={styles.micro}>
                {visible.length} / {questions.length} {shared.questions}
              </p>
              <div className={sharedStyles.questionList}>
                {visible.map((q) => (
                  <button
                    key={q.id}
                    aria-current={id === q.id ? "page" : undefined}
                    onClick={() => choose(q.id)}
                  >
                    <span>{questionName(q)}</span>
                    <small>p. 5.{q.page}</small>
                  </button>
                ))}
              </div>
              {!visible.length && <p>{shared.noResults}</p>}
            </nav>
          </>
        }
      >
        <div hidden={mode !== "games"}>
          {mode === "games" && <CongruenceGames presenting={presenting} />}
        </div>
        <div hidden={mode !== "practice"}>
          <div className={styles.studioHeader}>
            <div>
              <p>{c.coverage}</p>
              <h2>{questionName(question)}</h2>
            </div>
            <button ref={opener} onClick={() => setClassroom(true)}>
              {shared.enterClassroom}
            </button>
          </div>
          <PracticeFrame
            label={c.classroom}
            classroom={classroom}
            active={mode === "practice"}
            onExit={exit}
            header={
              <header className={styles.header}>
                <button onClick={exit}>{c.back}</button>
                <button onClick={() => changeMode("games")}>{c.games}</button>
                <div className={styles.identity}>
                  <span>{c.title}</span>
                  <strong>{questionName(question)}</strong>
                </div>
                <div className={styles.picker}>{picker}</div>
                <div className={styles.pager}>
                  <button
                    aria-label={shared.previous}
                    disabled={index === 0}
                    onClick={() => choose(questions[index - 1].id)}
                  >
                    ←
                  </button>
                  <button
                    aria-label={shared.next}
                    disabled={index === questions.length - 1}
                    onClick={() => choose(questions[index + 1].id)}
                  >
                    →
                  </button>
                </div>
              </header>
            }
          >
            <Lesson
              key={question.id}
              question={question}
              classroom={classroom}
            />
          </PracticeFrame>
        </div>
      </LessonWorkspace>
    </div>
  );
}

function Lesson({
  question,
  classroom,
}: {
  question: CongruenceQuestion;
  classroom: boolean;
}) {
  const [board, setBoard] = useState<"source" | "copies">(
    question.constructed ? "copies" : "source",
  );
  const [tab, setTab] = useState<"solution" | "controls" | "question">(
    "solution",
  );
  const [step, setStep] = useState(-1);
  const [marks, setMarks] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [showSides, setShowSides] = useState(true);
  const [keepEvidence, setKeepEvidence] = useState(false);
  const [hiddenEvidence, setHiddenEvidence] = useState<Set<string>>(new Set());
  const [pairKey, setPairKey] = useState<string | null>(null);
  const correspondence = useMemo(
    () => conclusionCorrespondence(question, step),
    [question, step],
  );
  const pair =
    correspondence?.pairs.find((row) => row.key === pairKey) ??
    correspondence?.pairs[0];
  const evidence = useMemo(
    () =>
      pair
        ? [pair]
        : extractEvidence(question, step, keepEvidence ? "all" : "current"),
    [question, step, keepEvidence, pair],
  );
  const currentKeys = useMemo(
    () =>
      new Set(
        pair
          ? [pair.key]
          : extractEvidence(question, step).map((row) => row.key),
      ),
    [question, step, pair],
  );
  const knownEvidence = useMemo(
    () => extractEvidence(question, step, "all"),
    [question, step],
  );
  function hideEvidence(key: string) {
    setHiddenEvidence((previous) => new Set([...previous, key]));
  }
  const [selected, setSelected] = useState(
    [0, 1].slice(0, question.shapes.length),
  );
  const [custom, setCustom] = useState<Shape[]>([]);
  const [vertices, setVertices] = useState(["", "", ""]);
  const [error, setError] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const shapes = [...question.shapes, ...custom];
  function changeStep(next: number) {
    setStep(next);
    setPairKey(null);
    if (next < 0) setHiddenEvidence(new Set());
    // Keep the pair introduced by the most recent printed comparison visible.
    // Board poses are keyed by shape ID, so revealing a new pair never resets one.
    for (let i = next; i >= 0; i--) {
      const line = question.steps[i];
      const names = [
        ...(line.highlights.figures ?? []),
        ...[...(line.heading ?? "").matchAll(/△([A-Z]{3})/g)].map((m) => m[1]),
      ];
      const desired = [
        ...new Set(
          names
            .map((name) =>
              shapes.findIndex(
                (shape) =>
                  [...shape.vertices].sort().join("") ===
                  [...name].sort().join(""),
              ),
            )
            .filter((id) => id >= 0),
        ),
      ].slice(0, 3);
      if (desired.length >= 2) {
        setSelected(desired);
        break;
      }
    }
  }
  function comparePair(key: string) {
    setPairKey(key);
    setMarks(true);
    const chosen = correspondence?.pairs.find((row) => row.key === key);
    if (chosen?.kind === "angle") setShowAngles(true);
    else setShowSides(true);
    setHiddenEvidence((previous) => {
      const next = new Set(previous);
      next.delete(key);
      return next;
    });
  }
  function select(id: number) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev.slice(-2), id],
    );
  }
  function addTriangle() {
    const ps = vertices.map((label) =>
      question.points.find((p) => p.label === label),
    );
    if (new Set(vertices).size !== 3 || ps.some((p) => !p)) {
      setError(true);
      return;
    }
    if (!usableTriangle(ps as NonNullable<(typeof ps)[number]>[])) {
      setError(true);
      return;
    }
    const name = `△${vertices.join("")}`;
    const existing = shapes.findIndex((shape) => shape.name === name);
    const next = existing >= 0 ? existing : shapes.length;
    if (existing < 0)
      setCustom((prev) => [...prev, { name, vertices: [...vertices] }]);
    setSelected((prev) => [...prev.filter((i) => i !== next).slice(-2), next]);
    setVertices(["", "", ""]);
    setError(false);
  }
  return (
    <div className={styles.lesson} data-classroom={classroom}>
      <div className={styles.task}>
        <div className={styles.boardTabs} role="group" aria-label={shared.view}>
          <button
            aria-pressed={board === "source"}
            onClick={() => setBoard("source")}
          >
            {shared.showOriginal}
          </button>
          <button
            aria-pressed={board === "copies"}
            onClick={() => setBoard("copies")}
          >
            {shared.showExtracted}
          </button>
        </div>
        <p>{c.hint}</p>
      </div>
      <div className={styles.lessonGrid}>
        <div className={styles.boards}>
          {[true, false].map((source) => (
            <Board
              key={String(source)}
              question={question}
              shapes={shapes}
              selected={selected}
              source={source}
              visible={board === (source ? "source" : "copies")}
              step={step >= 0 ? question.steps[step] : undefined}
              comparing={!!correspondence}
              marks={marks}
              evidence={evidence}
              knownEvidence={knownEvidence}
              currentKeys={currentKeys}
              showAngles={showAngles}
              showSides={showSides}
              hiddenEvidence={hiddenEvidence}
              onHideEvidence={hideEvidence}
              controlsHost={host}
            />
          ))}
        </div>
        <aside className={styles.desk}>
          <div className={styles.deskTabs} role="group" aria-label={c.title}>
            {(
              [
                ["solution", shared.solutionTab],
                ["controls", shared.controlsTab],
                ["question", shared.questionTab],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                aria-pressed={tab === id}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.solutionPane} hidden={tab !== "solution"}>
            <Solution
              question={question}
              current={step}
              onStep={changeStep}
              correspondence={correspondence}
              pair={pair}
              onCompare={comparePair}
            />
          </div>
          <div className={styles.deskBody} hidden={tab !== "controls"}>
            <fieldset className={styles.choices}>
              <legend>{c.choose}</legend>
              {shapes.map((s, i) => (
                <button
                  key={i}
                  aria-label={s.name}
                  aria-pressed={selected.includes(i)}
                  onClick={() => select(i)}
                >
                  <GeometryName>{s.name}</GeometryName>
                </button>
              ))}
            </fieldset>
            <label className={styles.markToggle}>
              <input
                type="checkbox"
                checked={marks}
                onChange={(e) => setMarks(e.target.checked)}
              />
              {c.marks}
            </label>
            <div className={styles.evidenceControls}>
              <label className={styles.markToggle}>
                <input
                  type="checkbox"
                  checked={showAngles}
                  onChange={(e) => setShowAngles(e.target.checked)}
                />
                {c.showAngles}
              </label>
              <label className={styles.markToggle}>
                <input
                  type="checkbox"
                  checked={showSides}
                  onChange={(e) => setShowSides(e.target.checked)}
                />
                {c.showSides}
              </label>
              <label className={styles.markToggle}>
                <input
                  type="checkbox"
                  checked={keepEvidence}
                  onChange={(e) => setKeepEvidence(e.target.checked)}
                />
                {c.allEvidence}
              </label>
              <button
                disabled={!hiddenEvidence.size}
                onClick={() => setHiddenEvidence(new Set())}
              >
                {c.restoreEvidence}
              </button>
              <p className={styles.micro}>{c.evidenceHint}</p>
            </div>
            <div ref={setHost} />
            <details className={styles.custom}>
              <summary>{c.create}</summary>
              <p>{c.createHint}</p>
              <div className={styles.vertexPicker}>
                {[c.firstVertex, c.secondVertex, c.thirdVertex].map(
                  (label, i) => (
                    <select
                      key={label}
                      aria-label={label}
                      value={vertices[i]}
                      onChange={(e) =>
                        setVertices((prev) =>
                          prev.map((v, j) => (j === i ? e.target.value : v)),
                        )
                      }
                    >
                      <option value="">—</option>
                      {question.points.map((p) => (
                        <option key={p.label}>{p.label}</option>
                      ))}
                    </select>
                  ),
                )}
              </div>
              <button onClick={addTriangle}>{c.add}</button>
              {error && <p role="alert">{c.invalidTriangle}</p>}
            </details>
            <p className={styles.micro}>
              {c.rigid} {c.tracing}
            </p>
          </div>
          <div className={styles.deskBody} hidden={tab !== "question"}>
            <p className={styles.reference}>
              {questionName(question)} · p. 5.{question.page}
            </p>
            <p className={styles.prompt}>
              <GeometryText>{question.prompt}</GeometryText>
            </p>
            <a
              href={`/congruence/questions/${question.id}.webp`}
              target="_blank"
              rel="noreferrer"
              aria-label={c.source}
            >
              <Image
                unoptimized
                src={`/congruence/questions/${question.id}.webp`}
                width={question.crop[2] - question.crop[0]}
                height={question.crop[3] - question.crop[1]}
                alt={`${questionName(question)}. ${question.prompt}`}
              />
            </a>
            <p className={styles.credit}>{c.sourceCredit}</p>
            <p className={styles.micro}>
              {question.constructed ? c.constructed : c.tracing}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
