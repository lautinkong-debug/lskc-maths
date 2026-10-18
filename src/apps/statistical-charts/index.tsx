"use client";
import { LessonWorkspace } from "@/components/LessonWorkspace";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AdvancedExplorer } from "./AdvancedExplorer";
import { ConceptLab } from "./ConceptLab";
import { AnimatedWalkthroughs } from "./AnimatedWalkthroughs";
import { ClassVocabulary } from "./ClassVocabulary";
import { ageExamples, cumulativeExamples } from "./concepts";
import {
  defaultAdvanced,
  defaultTask,
  type AdvancedSettings,
  type LessonTask,
} from "./advanced";
import { LocalLessons } from "./LocalLessons";
import { ProgressContext, ProgressScope, ProgressStore } from "./progress";
import { SESSION_KEY, readSession, type SavedSession } from "./storage";
import { CompareCharts } from "./CompareCharts";
import { ChartExport, ClassroomTools, PrintView } from "./ClassroomTools";
import {
  comparisons,
  decodeActivity,
  validateActivity,
  type Activity,
  type Comparison,
  type LabMode,
} from "./classroom";
import { AnswersContext } from "./answers";
import { copy } from "@/lib/copy";
import {
  Chart,
  ChartControls,
  chartTypes,
  defaultDisplay,
  interval,
} from "./Chart";
import {
  DatasetGenerator,
  Field,
  GroupedFrequencyEditor,
  NumberField,
  RawDataEditor,
  type Generator,
} from "./Editors";
import { FrequencyTable } from "./FrequencyTable";
import { LearningSteps } from "./LearningSteps";
import { PracticeQuestions } from "./PracticeQuestions";
import {
  autoGrouping,
  format,
  generateData,
  groupedTable,
  parseData,
  rawTable,
  type ChartType,
  type Group,
  type Grouping,
  type Result,
} from "./statistics";
import s from "./lab.module.css";
const c = copy.statisticalCharts;
const initial: Generator = {
  context: "0",
  min: 0,
  max: 100,
  size: 30,
  precision: 1,
  seed: "LSKC-2A06",
  shape: "symmetric",
};
const example: Group[] = [
  { lower: 10, upper: 19, frequency: 3 },
  { lower: 20, upper: 29, frequency: 7 },
  { lower: 30, upper: 39, frequency: 5 },
  { lower: 40, upper: 49, frequency: 5 },
];
export default function StatisticalChartsLab() {
  const [generator, setGenerator] = useState<Generator>(initial);
  const [values, setValues] = useState<string[]>(() =>
    generateData(initial).map(String),
  );
  const [groups, setGroups] = useState(example);
  const [grouping, setGrouping] = useState<Grouping>(() =>
    autoGrouping(0, 100, 1),
  );
  const [source, setSource] = useState<"raw" | "grouped">("raw");
  const [type, setType] = useState<ChartType>("histogram");
  const [display, setDisplay] = useState(defaultDisplay);
  const [title, setTitle] = useState<string>(c.contexts[0].name);
  const [variable, setVariable] = useState<string>(c.contexts[0].variable);
  const [unit, setUnit] = useState<string>(c.contexts[0].unit);
  const [selected, setSelected] = useState<number | null>(null);
  const [full, setFull] = useState(false);
  const [editingFrequencies, setEditingFrequencies] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [error, setError] = useState("");
  const [labView, setLabView] = useState<"data" | "chart">("chart");
  const [preparing, setPreparing] = useState(false);
  const [mode, setMode] = useState<LabMode>("lab");
  const [comparison, setComparison] = useState<Comparison>("shape");
  const [fixed, setFixed] = useState(false);
  const [answers, setAnswers] = useState(true);
  const [lesson, setLesson] = useState<Activity | null>(null);
  const [revision, setRevision] = useState(0);
  const [presentation, setPresentation] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [shareError, setShareError] = useState("");
  const [notice, setNotice] = useState("");
  const [advanced, setAdvanced] = useState<AdvancedSettings>(defaultAdvanced);
  const [task, setTask] = useState<LessonTask>(defaultTask);
  const [progress] = useState(() => new ProgressStore());
  const progressVersion = useSyncExternalStore(
    progress.subscribe,
    progress.snapshot,
    progress.snapshot,
  );
  const [ready, setReady] = useState(false);
  const [storageStatus, setStorageStatus] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const presentationTrigger = useRef<HTMLElement | null>(null);
  function loadConcept(kind: "raw" | "grouped", example: number) {
    if (fixed) return;
    setSource(kind);
    setMode("concepts");
    setSelected(null);
    setError("");
    setTitle(kind === "raw" ? c.concepts.ages : c.concepts.cumulativeTab);
    setVariable(kind === "raw" ? c.concepts.age : c.concepts.value);
    setUnit("");
    setGrouping({
      start: kind === "raw" ? 20 : 0,
      width: 10,
      count: kind === "raw" ? 4 : 6,
      precision: kind === "raw" ? 1 : 0,
    });
    if (kind === "raw") setValues(ageExamples[example].map(String));
    else
      setGroups(
        cumulativeExamples[example].map((frequency, i) => ({
          lower: i * 10,
          upper: (i + 1) * 10,
          frequency,
        })),
      );
  }
  function present() {
    presentationTrigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setPresentation(true);
    setEnlarged(false);
  }
  const applyActivity = useCallback(
    (a: Activity) => {
      progress.replace();
      setSource(a.source);
      if (a.source === "raw") setValues((a.data as number[]).map(String));
      else setGroups(a.data as Group[]);
      setGrouping(a.grouping);
      setType(a.type);
      setDisplay(a.display);
      setTitle(a.title);
      setVariable(a.variable);
      setUnit(a.unit);
      setMode(a.mode);
      setComparison(a.comparison);
      setAnswers(a.answers);
      setFixed(a.fixed);
      setAdvanced(a.advanced ?? defaultAdvanced);
      setTask(a.task ?? defaultTask);
      setLesson(a.fixed ? a : null);
      setSelected(null);
      setEditingFrequencies(false);
      setError("");
      setShareError("");
      setNotice("");
      setEnlarged(false);
      setRevision((n) => n + 1);
    },
    [progress],
  );
  useEffect(() => {
    function load(initial = false) {
      startTransition(() => {
        try {
          const hash = window.location.hash,
            shared = hash.startsWith("#activity=");
          let saved: SavedSession | null = null;
          if (initial) {
            try {
              const text = localStorage.getItem(SESSION_KEY);
              if (text) saved = readSession(text);
            } catch {
              setStorageStatus(c.advanced.storageError);
            }
          }
          if (shared) {
            const linked = decodeActivity(hash.slice(10));
            if (initial && saved && saved.origin === hash) {
              applyActivity(saved.activity);
              setLesson(saved.lesson);
              progress.replace(saved.progress);
              setStorageStatus(c.advanced.restored);
            } else applyActivity(linked);
          } else if (initial && saved && saved.origin === "") {
            applyActivity(saved.activity);
            setLesson(saved.lesson);
            progress.replace(saved.progress);
            setStorageStatus(c.advanced.restored);
          }
        } catch {
          setShareError(c.classroom.invalidActivity);
        } finally {
          setReady(true);
        }
      });
    }
    load(true);
    const onHash = () => load();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [applyActivity, progress]);
  useEffect(() => {
    if (!presentation) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPresentation(false);
        setEnlarged(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
      presentationTrigger.current?.focus();
    };
  }, [presentation]);
  const result: Result = useMemo(() => {
    if (source === "grouped") return groupedTable(groups, grouping.precision);
    try {
      const data = values.map((v) => {
        const p = parseData(v);
        if (p.length !== 1) throw new Error("numbers");
        return p[0];
      });
      return rawTable(data, grouping);
    } catch (e) {
      return { rows: [], total: 0, error: (e as Error).message };
    }
  }, [source, groups, values, grouping]);
  const activity = useMemo(() => {
    if (result.error) return null;
    try {
      return validateActivity({
        version: 1,
        source,
        data: source === "raw" ? values.map(Number) : groups,
        grouping,
        type,
        display,
        title,
        variable,
        unit,
        mode,
        comparison,
        answers,
        fixed,
        advanced,
        task,
      });
    } catch {
      return null;
    }
  }, [
    result.error,
    source,
    values,
    groups,
    grouping,
    type,
    display,
    title,
    variable,
    unit,
    mode,
    comparison,
    answers,
    fixed,
    advanced,
    task,
  ]);
  useEffect(() => {
    if (!ready || !activity) return;
    function save() {
      try {
        const record: SavedSession = {
          version: 1,
          activity: activity!,
          lesson,
          progress: progress.data,
          updated: Date.now(),
          origin: window.location.hash.startsWith("#activity=")
            ? window.location.hash
            : "",
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(record));
        setStorageStatus(c.advanced.savedProgress);
      } catch {
        setStorageStatus(c.advanced.storageError);
      }
    }
    const timer = setTimeout(save, 250);
    window.addEventListener("pagehide", save);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", save);
    };
  }, [activity, lesson, progress, progressVersion, ready]);
  function openActivity(a: Activity) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    applyActivity(a);
  }
  function clearProgress() {
    progress.replace();
    setRevision((n) => n + 1);
    setNotice(c.advanced.cleared);
  }
  const active = selected === null ? undefined : result.rows[selected];
  function onContext(index: number) {
    const preset = c.contexts[index];
    if (preset) {
      setGenerator({
        ...generator,
        context: String(index),
        min: preset.min,
        max: preset.max,
        precision: preset.precision,
      });
      setGrouping(autoGrouping(preset.min, preset.max, preset.precision));
      setTitle(preset.name);
      setVariable(preset.variable);
      setUnit(preset.unit);
    } else setGenerator({ ...generator, context: "-1" });
  }
  function onGenerate(fresh: boolean) {
    if (fixed) return;
    try {
      const seed = fresh ? `LSKC-${Date.now().toString(36)}` : generator.seed;
      const next = { ...generator, precision: grouping.precision, seed };
      setValues(generateData(next).map(String));
      setGenerator(next);
      setGrouping(
        autoGrouping(
          next.min,
          next.max,
          next.precision,
          Number.isInteger(grouping.count) &&
            grouping.count > 0 &&
            grouping.count <= 24
            ? grouping.count
            : 6,
        ),
      );
      setSource("raw");
      setSelected(null);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function fit() {
    try {
      const data = values.map((v) => {
        const p = parseData(v);
        if (p.length !== 1) throw new Error("numbers");
        return p[0];
      });
      if (data.length)
        setGrouping(
          autoGrouping(
            Math.min(...data),
            Math.max(...data),
            grouping.precision,
            Number.isInteger(grouping.count) &&
              grouping.count > 0 &&
              grouping.count <= 24
              ? grouping.count
              : 6,
          ),
        );
      setError("");
    } catch {
      setError("numbers");
    }
  }
  const errorText = (key: string) =>
    c.errors[key as keyof typeof c.errors] ?? c.errors.numbers;
  if (!ready) return <p>{c.advanced.loading}</p>;
  return (
    <ProgressContext value={progress}>
      <AnswersContext value={answers}>
        <div
          className={`${s.lab} ${mode === "compare" || mode === "advanced" ? s.compareActive : ""} ${presentation ? s.presentation : ""}`}
          ref={root}
          role={presentation ? "dialog" : undefined}
          aria-modal={presentation ? true : undefined}
          aria-label={presentation ? c.title : undefined}
          onKeyDown={(e) => {
            if (!presentation || e.key !== "Tab") return;
            const controls = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                'button, a, select, input, textarea, [tabindex="0"]',
              ),
            ).filter(
              (el) => el.checkVisibility() && !el.hasAttribute("disabled"),
            );
            const first = controls[0],
              last = controls.at(-1);
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }}
        >
          {presentation && (
            <div className={s.presentationBar}>
              <strong>{c.title}</strong>
              <button
                autoFocus
                onClick={() => {
                  setPresentation(false);
                  setEnlarged(false);
                }}
              >
                {c.classroom.exitPresentation}
              </button>
            </div>
          )}
          <LessonWorkspace
            subject={copy.lessonWorkspace.statistics}
            symbol="∑"
            active={
              {
                lab: copy.lessonWorkspace.dataCharts,
                learn: c.learning.learn,
                practice: c.learning.practice,
                compare: c.classroom.compare,
                advanced: c.advanced.title,
                concepts: c.concepts.title,
                animations: c.animation.title,
                vocabulary: c.vocabulary.title,
              }[mode]
            }
            presenting={presentation}
            navigation={
              <nav className={s.lessonNav} aria-label={c.title}>
                <a
                  href="#lab-data"
                  aria-current={
                    mode === "lab" && labView === "data" ? "page" : undefined
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    setMode("lab");
                    setEnlarged(false);
                    setPreparing(true);
                    setLabView("data");
                    requestAnimationFrame(() =>
                      document.getElementById("lab-data")?.scrollIntoView(),
                    );
                  }}
                >
                  01 · {c.explorer}
                </a>
                <a
                  href="#lab-chart"
                  aria-current={
                    mode === "lab" && labView === "chart" ? "page" : undefined
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    setMode("lab");
                    setLabView("chart");
                    requestAnimationFrame(() =>
                      document.getElementById("lab-chart")?.scrollIntoView(),
                    );
                  }}
                >
                  02 · {c.builder}
                </a>
                <button
                  aria-pressed={mode === "learn"}
                  onClick={() => setMode("learn")}
                >
                  03 · {c.learning.learn}
                </button>
                <button
                  aria-pressed={mode === "practice"}
                  onClick={() => setMode("practice")}
                >
                  04 · {c.learning.practice}
                </button>
                <button
                  aria-pressed={mode === "compare"}
                  onClick={() => setMode("compare")}
                >
                  05 · {c.classroom.compare}
                </button>
                <button
                  aria-pressed={mode === "advanced"}
                  onClick={() => setMode("advanced")}
                >
                  06 · {c.advanced.title}
                </button>
                <button
                  disabled={fixed}
                  aria-pressed={mode === "concepts"}
                  onClick={() => loadConcept("raw", 0)}
                >
                  07 · {c.concepts.title}
                </button>
                <button
                  aria-pressed={mode === "animations"}
                  onClick={() => setMode("animations")}
                >
                  08 · {c.animation.title}
                </button>
                <button
                  aria-pressed={mode === "vocabulary"}
                  onClick={() => setMode("vocabulary")}
                >
                  09 · {c.vocabulary.title}
                </button>
              </nav>
            }
          >
            <div className={s.screenChrome}>
              {mode !== "animations" && mode !== "vocabulary" && (
                <div className={s.intro}>
                  <div>
                    <p className={s.chapter}>{c.classroom.chapter}</p>
                    <h2>{title || c.intro}</h2>
                    <p>
                      {variable}
                      {unit ? ` · ${unit}` : ""}
                    </p>
                  </div>
                  <div className={s.stats}>
                    <div>
                      <strong data-testid="lab-total">
                        {result.error ? "—" : result.total}
                      </strong>
                      <span>{c.total}</span>
                    </div>
                    <div>
                      <strong>{result.rows.length}</strong>
                      <span>{c.classes}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className={s.utilityShelf}>
                <ClassroomTools
                  activity={activity}
                  rows={result.rows}
                  onApply={openActivity}
                  fixed={fixed}
                  onFixed={() => {
                    if (fixed) {
                      setFixed(false);
                      setLesson(null);
                    } else if (activity) {
                      setFixed(true);
                      setLesson({ ...activity, fixed: true });
                    }
                  }}
                  answers={answers}
                  onAnswers={() => setAnswers(!answers)}
                  onReset={() => {
                    progress.replace();
                    if (lesson) applyActivity({ ...lesson, answers, mode });
                    setRevision((n) => n + 1);
                    setSelected(null);
                    setNotice(c.classroom.resetDone);
                  }}
                  onGenerate={() => onGenerate(true)}
                  onPresent={present}
                  onPrint={() => setPrinting(true)}
                />
                <LocalLessons
                  activity={activity}
                  task={task}
                  onTask={setTask}
                  onOpen={openActivity}
                  onClear={clearProgress}
                  status={activity ? storageStatus : c.advanced.unsaved}
                />
              </div>
              {(task.name || task.instructions) && (
                <section className={s.taskBrief}>
                  <p className={s.chapter}>{c.advanced.task}</p>
                  <h3>{task.name}</h3>
                  <p>{task.instructions}</p>
                </section>
              )}
              {shareError && (
                <p role="alert" className={s.error}>
                  {shareError}
                </p>
              )}
              {notice && (
                <p role="status" className={s.scaleNote}>
                  {notice}
                </p>
              )}
              {fixed && (
                <p className={s.scaleNote}>
                  <strong>{c.classroom.fixed}</strong> · {c.classroom.fixedHelp}
                </p>
              )}
              {!answers && (
                <p className={s.scaleNote}>{c.classroom.answersHidden}</p>
              )}
            </div>
            {mode === "animations" && <AnimatedWalkthroughs key={revision} />}
            {mode === "vocabulary" && <ClassVocabulary key={revision} />}
            {mode === "concepts" && (
              <ConceptLab
                key={revision}
                kind={source}
                rows={result.rows}
                raw={values.map(Number)}
                fixed={fixed}
                onLesson={loadConcept}
                onRaw={(v) => setValues(v.map(String))}
                onFrequency={(index, frequency) =>
                  setGroups((current) =>
                    current.map((g, i) =>
                      i === index ? { ...g, frequency } : g,
                    ),
                  )
                }
              />
            )}
            {mode === "advanced" &&
              (result.rows.length ? (
                <AdvancedExplorer
                  rows={result.rows}
                  title={title}
                  axisLabel={`${variable}${unit ? ` (${unit})` : ""}`}
                  precision={grouping.precision}
                  display={display}
                  settings={advanced}
                  onChange={setAdvanced}
                  raw={source === "raw" ? values.map(Number) : undefined}
                  fixed={fixed}
                />
              ) : (
                <p role="alert" className={s.error}>
                  {c.learning.empty}
                </p>
              ))}
            {mode === "compare" &&
              (result.rows.length ? (
                <CompareCharts
                  rows={result.rows}
                  title={title}
                  axisLabel={`${variable}${unit ? ` (${unit})` : ""}`}
                  display={display}
                  comparison={comparison}
                  onChange={setComparison}
                  selected={selected}
                  onSelect={setSelected}
                  precision={grouping.precision}
                />
              ) : (
                <p role="alert" className={s.error}>
                  {c.learning.empty}
                </p>
              ))}
            {(mode === "learn" || mode === "practice") && (
              <ProgressScope
                value={`${mode}:${type}:${JSON.stringify(result.rows.map((r) => [r.low, r.high, r.frequency]))}`}
              >
                <div className={s.activityHeader}>
                  <Field label={c.learning.activityChart}>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as ChartType)}
                    >
                      {chartTypes.map((t, i) => (
                        <option key={t} value={t}>
                          {c.chartNames[i]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button onClick={() => setMode("lab")}>
                    {c.learning.back}
                  </button>
                </div>
                <p className={s.small}>{c.learning.usesData}</p>
                {result.rows.length ? (
                  mode === "learn" ? (
                    <LearningSteps
                      key={JSON.stringify([
                        result.rows,
                        type,
                        grouping.precision,
                        revision,
                        answers,
                      ])}
                      rows={result.rows}
                      type={type}
                      title={title}
                      axisLabel={`${variable}${unit ? ` (${unit})` : ""}`}
                      precision={grouping.precision}
                      raw={source === "raw" ? values : undefined}
                    />
                  ) : (
                    <PracticeQuestions
                      key={JSON.stringify([
                        result.rows,
                        type,
                        grouping.precision,
                        revision,
                        answers,
                      ])}
                      rows={result.rows}
                      type={type}
                      title={title}
                      axisLabel={`${variable}${unit ? ` (${unit})` : ""}`}
                      precision={grouping.precision}
                      initialLevel={task.level}
                    />
                  )
                ) : (
                  <p role="alert" className={s.error}>
                    {c.learning.empty}
                  </p>
                )}
              </ProgressScope>
            )}
            <div hidden={mode !== "lab"}>
              <div className={enlarged ? s.enlarged : s.workspace}>
                <details
                  className={s.preparation}
                  open={preparing}
                  onToggle={(event) => setPreparing(event.currentTarget.open)}
                  hidden={enlarged}
                >
                  <summary>
                    <span>{copy.lessonWorkspace.configure}</span>
                    <small>{copy.lessonWorkspace.configureHint}</small>
                  </summary>
                  {!enlarged && (
                    <section
                      className={s.settingsPanel}
                      aria-label={c.settings}
                      data-testid="lab-settings"
                    >
                      <fieldset
                        disabled={fixed}
                        className={`${s.settingsFieldset} ${s.settingsLayout}`}
                      >
                        <details open>
                          <summary>{c.settings}</summary>
                          <DatasetGenerator
                            value={generator}
                            onChange={setGenerator}
                            onContext={onContext}
                            onGenerate={onGenerate}
                          />
                          <div className={s.datasetMeta}>
                            <Field label={c.titleLabel}>
                              <input
                                maxLength={100}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                              />
                            </Field>
                            <div className={s.pair}>
                              <Field label={c.variable}>
                                <input
                                  maxLength={40}
                                  value={variable}
                                  onChange={(e) => setVariable(e.target.value)}
                                />
                              </Field>
                              <Field label={c.unit}>
                                <input
                                  maxLength={15}
                                  value={unit}
                                  onChange={(e) => setUnit(e.target.value)}
                                />
                              </Field>
                            </div>
                          </div>
                        </details>
                        <details open>
                          <summary>{c.grouping}</summary>
                          <Field label={c.precision}>
                            <select
                              value={grouping.precision}
                              onChange={(e) =>
                                setGrouping({
                                  ...grouping,
                                  precision: Number(e.target.value),
                                })
                              }
                            >
                              {[1, 0.1, 0.01, 0].map((p, i) => (
                                <option key={p} value={p}>
                                  {c.precisions[i]}
                                </option>
                              ))}
                            </select>
                          </Field>
                          {source === "raw" && (
                            <>
                              <NumberField
                                label={c.start}
                                value={grouping.start}
                                onChange={(start) =>
                                  setGrouping({ ...grouping, start })
                                }
                              />
                              <div className={s.pair}>
                                <NumberField
                                  label={c.width}
                                  value={grouping.width}
                                  onChange={(width) =>
                                    setGrouping({ ...grouping, width })
                                  }
                                />
                                <NumberField
                                  label={c.count}
                                  value={grouping.count}
                                  onChange={(count) =>
                                    setGrouping({ ...grouping, count })
                                  }
                                />
                              </div>
                              <button onClick={fit}>{c.fit}</button>
                            </>
                          )}
                          <p className={s.small}>
                            {grouping.precision
                              ? c.roundedNote
                              : c.continuousNote}
                          </p>
                        </details>
                      </fieldset>
                    </section>
                  )}

                  {!enlarged && (
                    <section
                      id="lab-data"
                      data-testid="lab-data"
                      className={s.dataPanel}
                    >
                      <fieldset disabled={fixed} className={s.settingsFieldset}>
                        <div className={s.sectionHeader}>
                          <h3>{c.explorer}</h3>
                          <span className={s.small}>{c.live}</span>
                        </div>
                        <div className={s.sourceTabs}>
                          {(["raw", "grouped"] as const).map((mode) => (
                            <button
                              key={mode}
                              aria-pressed={source === mode}
                              onClick={() => {
                                setSource(mode);
                                setSelected(null);
                                setError("");
                              }}
                            >
                              {c[mode]}
                            </button>
                          ))}
                        </div>
                        {source === "raw" ? (
                          <RawDataEditor
                            values={values}
                            onChange={(v) => {
                              setValues(v);
                              setError("");
                            }}
                            onError={setError}
                          />
                        ) : (
                          <GroupedFrequencyEditor
                            groups={groups}
                            precision={grouping.precision}
                            onChange={setGroups}
                          />
                        )}
                      </fieldset>
                    </section>
                  )}
                </details>
                <main className={s.main}>
                  {error && (
                    <p className={s.error} role="alert">
                      {errorText(error)}
                    </p>
                  )}
                  {result.error && (
                    <p className={s.error} role="alert">
                      {errorText(result.error)}
                    </p>
                  )}
                  <div
                    id="lab-chart"
                    className={s.results}
                    data-testid="lab-results"
                  >
                    {!enlarged && (
                      <section className={s.tablePanel}>
                        <div className={s.sectionHeader}>
                          <h3>{c.table}</h3>
                          <button
                            disabled={fixed || !result.rows.length}
                            aria-pressed={
                              editingFrequencies && source === "grouped"
                            }
                            onClick={() => {
                              if (editingFrequencies && source === "grouped") {
                                setEditingFrequencies(false);
                                return;
                              }
                              if (source === "raw") {
                                setGroups(
                                  result.rows.map(
                                    ({ lower, upper, frequency }) => ({
                                      lower,
                                      upper,
                                      frequency,
                                    }),
                                  ),
                                );
                                setSource("grouped");
                              }
                              setEditingFrequencies(true);
                            }}
                          >
                            {editingFrequencies && source === "grouped"
                              ? c.doneFrequencies
                              : c.editFrequencies}
                          </button>
                          <label>
                            <input
                              type="checkbox"
                              checked={full}
                              onChange={(e) => setFull(e.target.checked)}
                            />{" "}
                            {c.fullTable}
                          </label>
                        </div>
                        <FrequencyTable
                          rows={result.rows}
                          full={full}
                          continuous={grouping.precision === 0}
                          selected={selected}
                          onSelect={setSelected}
                          onFrequencyChange={
                            editingFrequencies && source === "grouped" && !fixed
                              ? (index, frequency) =>
                                  setGroups((current) =>
                                    current.map((group, i) =>
                                      i === index
                                        ? { ...group, frequency }
                                        : group,
                                    ),
                                  )
                              : undefined
                          }
                        />
                      </section>
                    )}

                    <section className={s.chartPanel}>
                      <div className={s.chartHeader}>
                        <div className={s.chartSelectors}>
                          <Field label={c.chart}>
                            <select
                              value={type}
                              onChange={(e) =>
                                setType(e.target.value as ChartType)
                              }
                            >
                              {chartTypes.map((t, i) => (
                                <option key={t} value={t}>
                                  {c.chartNames[i]}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label={c.horizontalLabels}>
                            <select
                              value={
                                type.startsWith("cumulative")
                                  ? "boundaries"
                                  : display.boundaries
                                    ? display.marks
                                      ? "both"
                                      : "boundaries"
                                    : display.marks
                                      ? "marks"
                                      : "none"
                              }
                              disabled={type.startsWith("cumulative")}
                              onChange={(e) =>
                                setDisplay({
                                  ...display,
                                  boundaries:
                                    e.target.value === "boundaries" ||
                                    e.target.value === "both",
                                  marks:
                                    e.target.value === "marks" ||
                                    e.target.value === "both",
                                })
                              }
                            >
                              <option value="marks">{c.axisMarks}</option>
                              <option value="boundaries">
                                {c.axisBoundaries}
                              </option>
                              <option value="both">{c.axisBoth}</option>
                              <option value="none">{c.axisNone}</option>
                            </select>
                          </Field>
                        </div>
                        <div className={s.chartActions}>
                          <button onClick={present}>{c.tableChartView}</button>
                          <button
                            aria-pressed={enlarged}
                            onClick={() => setEnlarged(!enlarged)}
                          >
                            {enlarged ? c.shrink : c.enlarge}
                          </button>
                        </div>
                      </div>
                      {result.rows.length ? (
                        <Chart
                          rows={result.rows}
                          type={type}
                          title={title}
                          axisLabel={`${variable}${unit ? ` (${unit})` : ""}`}
                          display={display}
                          selected={selected}
                          onSelect={setSelected}
                        />
                      ) : (
                        <div className={s.empty}>{c.invalidChart}</div>
                      )}
                      <div className={s.chartNote}>
                        {c.chartNotes[chartTypes.indexOf(type)]}
                      </div>
                      <ChartControls
                        value={display}
                        onChange={setDisplay}
                        type={type}
                      />
                      {!!result.rows.length && <ChartExport type={type} />}
                    </section>
                  </div>
                  <div className={s.selection} aria-live="polite">
                    {active ? (
                      <>
                        <strong>
                          {c.selected}:{" "}
                          {interval(active, grouping.precision === 0)}
                        </strong>
                        <span>
                          {c.boundaries}: {format(active.low)}–
                          {format(active.high)} · {c.mark}:{" "}
                          {format(active.mark)} · {c.frequency}:{" "}
                          {active.frequency} · {c.cumulative}:{" "}
                          {active.cumulative}
                        </span>
                      </>
                    ) : (
                      c.none
                    )}
                  </div>
                </main>
              </div>
            </div>
          </LessonWorkspace>
          {printing && activity && (
            <PrintView
              activity={activity}
              rows={result.rows}
              types={mode === "compare" ? comparisons[comparison] : [type]}
              onClose={() => {
                setPrinting(false);
                root.current
                  ?.querySelector<HTMLDetailsElement>("details")
                  ?.querySelector("summary")
                  ?.focus();
              }}
            />
          )}
        </div>
      </AnswersContext>
    </ProgressContext>
  );
}
