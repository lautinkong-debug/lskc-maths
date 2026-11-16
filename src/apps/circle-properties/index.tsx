"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  circleCopy as c,
  circleLessonCopy,
  circlePathCopy,
  circleTheoremLessonCopy,
} from "@/lib/copy";
import { labs, reasons, type LabId } from "./content";
import CircleDiagram from "./CircleDiagram";
import ReasonExplorer from "./ReasonExplorer";
import LearnPath from "./path/LearnPath";
import ReasonChallenge from "./ReasonChallengeGame";
import InkToolbar from "./InkToolbar";
import { useInkBoard } from "./useInkBoard";
import {
  defaults,
  getModel,
  isBisectorDiameter,
  normalise,
  type Parameters,
  type DragKey,
} from "./geometry";
import { snapParameters, type SnapResult } from "./snapping";
import { allMissions, evaluateMission, missions } from "./missions";
import ChordLesson, {
  ChordLessonQuestions,
  ChordLessonSteps,
} from "./ChordLesson";
import TheoremLesson from "./TheoremLesson";
import PaperCircleDemo from "./PaperCircleDemo";
import {
  isPaperStep,
  paperChords,
  paperLastStage,
  paperTask,
} from "./paperCircle";
import {
  chordLessonDisplay,
  chordLessonStarts,
  initialChordLesson,
  nAtMidpoint,
  parseChordLesson,
  type ChordLessonReadings,
  type ChordLessonState,
  type ChordLessonStep,
} from "./chordLessonData";
import DiscoveryCoach from "./DiscoveryCoach";
import { missionPrompt } from "./discovery";
import ReasonPractice from "./ReasonPractice";
import ConditionsLab from "./ConditionsLab";
import AngleConditionReason from "./AngleConditionReason";
import type { Experiment } from "./conditions";
import { useLocalSession, clearLocalSessions } from "./useLocalSession";
import {
  initialWorkspace,
  modeFromHash,
  parseWorkspace,
  initialPlayground,
  parsePlayground,
  storeMissionShape,
  type PlaygroundState,
  type WorkspaceMode,
} from "./session";
import {
  emptyProgress,
  parseProgress,
  storageKey,
  legacyStorageKey,
  type Progress,
} from "./progress";
import { Orb, Star } from "./LabSprites";
import s from "./circle.module.css";
import MathText from "./MathText";
import MeasurementList from "./MeasurementList";
import ExactNumberInput from "./ExactNumberInput";

const places: Record<LabId, { subtitle: string }> = {
  bisector: { subtitle: "Perpendiculars and chord mid-points" },
  chords: { subtitle: "Equal chords and distances" },
  centre: { subtitle: "Centre and circumference angles" },
  segment: { subtitle: "Angles in the same segment" },
  semicircle: { subtitle: "Angle in a semicircle" },
  "equal-arcs": { subtitle: "Angles, arcs and chords" },
  ratios: { subtitle: "Arc and angle ratios" },
};
/** "16.1–16.3" for a topic with several reasons, "16.6" for one. */
function reasonRange(lab: (typeof labs)[number]) {
  const numbers = lab.reasonIds.map(
    (id) => reasons.find((reason) => reason.id === id)!.number,
  );
  return numbers.length > 1
    ? `${numbers[0]}–${numbers[numbers.length - 1]}`
    : numbers[0];
}
const numeric = (n: number, digits = 1) => Number(n.toFixed(digits)).toString();
function randomShape(labId: LabId) {
  const next = normalise(labId, { ...defaults[labId] });
  for (const control of getModel(labId, next).controls) {
    next[control.key] =
      Math.round(
        (control.min + Math.random() * (control.max - control.min)) /
          control.step,
      ) * control.step;
  }
  return normalise(labId, next);
}

const subscribeReady = () => () => {};
export default function CircleLab() {
  const hydrated = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );
  const [epoch, setEpoch] = useState(0);
  // A link such as …#explore opens that activity. It is read as the page opens
  // and then taken off the address, so a reload returns to wherever the student
  // has moved on to. It still applies after "Reset progress" on the same visit.
  const [link, setLink] = useState(() => ({
    mode:
      typeof window === "undefined"
        ? undefined
        : modeFromHash(window.location.hash),
    turn: 0,
  }));
  useEffect(() => {
    const clear = () => {
      if (!modeFromHash(window.location.hash)) return;
      try {
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname + window.location.search,
        );
      } catch {
        // Some browsers refuse this for a file opened from disk. The link then stays.
      }
    };
    const follow = () => {
      const mode = modeFromHash(window.location.hash);
      if (!mode) return;
      setLink((previous) => ({ mode, turn: previous.turn + 1 }));
      clear();
    };
    clear();
    window.addEventListener("hashchange", follow);
    return () => window.removeEventListener("hashchange", follow);
  }, []);
  return hydrated ? (
    <CircleWorkspace
      key={`${epoch}.${link.turn}`}
      start={link.mode}
      onReset={() => setEpoch((x) => x + 1)}
    />
  ) : (
    <p role="status">{c.loading}</p>
  );
}
function CircleWorkspace({
  onReset,
  start,
}: {
  onReset: () => void;
  start?: WorkspaceMode;
}) {
  const [workspace, setWorkspace, workspaceFailed] = useLocalSession(
    "workspace",
    () => (start ? { ...initialWorkspace, mode: start } : initialWorkspace),
    (raw) => {
      const saved = parseWorkspace(raw);
      return saved && start ? { ...saved, mode: start } : saved;
    },
  );
  const [progress, setProgress, progressFailed] = useLocalSession<Progress>(
    "progress",
    () => {
      try {
        return parseProgress(
          localStorage.getItem(storageKey),
          localStorage.getItem(legacyStorageKey),
        );
      } catch {
        return emptyProgress();
      }
    },
    (raw) => parseProgress(JSON.stringify(raw)),
  );
  const [resetPrompt, setResetPrompt] = useState(false);
  const [propertyMenu, setPropertyMenu] = useState(false);
  const [relayRequest, setRelayRequest] = useState<{
    lab: LabId;
    at: number;
  } | null>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function dismissOutside(event: Event) {
      const settings = settingsRef.current;
      if (
        settings?.open &&
        event.target instanceof Node &&
        !settings.contains(event.target)
      )
        settings.open = false;
    }
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && settingsRef.current?.open) {
        settingsRef.current.open = false;
        settingsRef.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", dismissOutside, true);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, []);
  const { mode, labId } = workspace;
  const setMode = (mode: WorkspaceMode) => {
    setRelayRequest(null);
    setPropertyMenu(false);
    if (settingsRef.current) settingsRef.current.open = false;
    setWorkspace((p) => ({ ...p, mode }));
  };
  const explore = (labId: LabId) => {
    setRelayRequest(null);
    setPropertyMenu(false);
    if (settingsRef.current) settingsRef.current.open = false;
    setWorkspace((p) => ({ ...p, labId, mode: "explore" }));
  };
  const practise = (lab: LabId) => {
    setMode("reasons-relay");
    // Called only from practice buttons, never while rendering.
    // eslint-disable-next-line react-hooks/purity
    setRelayRequest({ lab, at: Date.now() });
    requestAnimationFrame(() =>
      appRef.current?.scrollIntoView({ block: "start" }),
    );
  };
  function collect(kind: "missions" | "reasons", id: string) {
    setProgress((p) =>
      p[kind].includes(id) ? p : { ...p, [kind]: [...p[kind], id] },
    );
  }
  function reset() {
    try {
      clearLocalSessions();
      localStorage.setItem(storageKey, JSON.stringify(emptyProgress()));
    } catch {
      // Blocked or full storage still gets a fresh start for the next class.
    }
    onReset();
  }
  return (
    <div className={s.app} data-appearance={workspace.appearance} ref={appRef}>
      <header className={s.header}>
        <div className={s.brand}>
          <div className={s.brandOrb}>
            <Orb />
          </div>
          <div>
            <h1>{c.title}</h1>
          </div>
        </div>
        <nav className={s.tabs} aria-label={c.activities}>
          {(
            [
              ["learn", circlePathCopy.learn, circlePathCopy.learnHint],
              ["explore", c.explore, c.tabHints.explore],
              ["reasons-relay", c.reasonsRelay, c.tabHints.relay],
              ["reasons-play", c.reasonsPlay, c.tabHints.play],
            ] as const
          ).map(([id, label, hint]) => (
            <button
              type="button"
              key={id}
              aria-pressed={mode === id}
              aria-label={label}
              aria-describedby={`circle-tab-${id}`}
              onClick={() => setMode(id)}
            >
              {label}
              <small id={`circle-tab-${id}`} className={s.tabHint}>
                {hint}
              </small>
            </button>
          ))}
        </nav>
        <details className={s.settings} ref={settingsRef}>
          <summary>{c.more}</summary>
          <div className={s.settingsPanel}>
            {mode === "explore" && (
              <div className={s.howTo} role="note" aria-label={c.howTo}>
                <strong>{c.howTo}</strong>
                <ol>
                  {c.howToSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            <label>
              {c.appearance}
              <select
                value={workspace.appearance}
                onChange={(e) =>
                  setWorkspace((p) => ({
                    ...p,
                    appearance: e.target.value === "calm" ? "calm" : "playful",
                  }))
                }
              >
                <option value="playful">{c.playful}</option>
                <option value="calm">{c.calm}</option>
              </select>
            </label>
            <div className={s.collection} aria-label={c.progress}>
              <span>
                <Star />
                {progress.missions.length}
                <small>
                  /{allMissions.length} {c.tasks}
                </small>
              </span>
              <span>
                <b aria-hidden="true">▱</b>
                {progress.reasons.length}
                <small>
                  /{reasons.length} {c.once}
                </small>
              </span>
            </div>
            <p>{c.savedShape}</p>
            <details className={s.quickGuide}>
              <summary>{c.newHere}</summary>
              <p>{c.startBody}</p>
              <button
                type="button"
                onClick={() => {
                  explore("bisector");
                  setWorkspace((p) => ({ ...p, welcomeDismissed: true }));
                }}
              >
                {c.startAction}
              </button>
              <p>{c.suggested}</p>
            </details>
          </div>
        </details>
      </header>
      {mode === "learn" && <LearnPath onExplore={explore} />}
      {mode === "explore" && (
        <Playground
          key={labId}
          labId={labId}
          collected={progress.missions}
          onCollect={(id) => collect("missions", id)}
          onRelay={() => practise(labId)}
          picker={
            <div
              className={s.picker}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setPropertyMenu(false);
                  event.currentTarget.querySelector("button")?.focus();
                }
              }}
            >
              <button
                type="button"
                aria-expanded={propertyMenu}
                aria-controls="circle-property-menu"
                onClick={() => setPropertyMenu((v) => !v)}
              >
                <span>{c.property}</span>
                <strong>{places[labId].subtitle}</strong>
                <span aria-hidden="true">{propertyMenu ? "▴" : "▾"}</span>
              </button>
              {propertyMenu && (
                <nav
                  id="circle-property-menu"
                  aria-label={c.chooseProperty}
                  className={s.propertyMenu}
                >
                  {labs.map((lab) => (
                    <button
                      type="button"
                      key={lab.id}
                      aria-label={places[lab.id].subtitle}
                      aria-pressed={labId === lab.id}
                      onClick={() => explore(lab.id)}
                    >
                      <span className={s.menuNumbers}>{reasonRange(lab)}</span>
                      <span>{places[lab.id].subtitle}</span>
                      <span className={s.miniStars} aria-hidden="true">
                        {missions[lab.id].map((m) => (
                          <Star
                            key={m.id}
                            filled={progress.missions.includes(m.id)}
                          />
                        ))}
                      </span>
                    </button>
                  ))}
                </nav>
              )}
            </div>
          }
        />
      )}
      {mode === "reasons-play" && (
        <ReasonPractice
          collected={progress.reasons}
          onCollect={(id) => collect("reasons", id)}
          onResetRecord={() =>
            setProgress((previous) => ({ ...previous, reasons: [] }))
          }
        />
      )}
      {mode === "reasons-relay" && (
        <ReasonChallenge onExplore={explore} practiceRequest={relayRequest} />
      )}
      <footer className={s.footer}>
        <span role="status">
          {workspaceFailed || progressFailed ? c.storageFailed : c.saveNotice}
        </span>
        <details>
          <summary>{c.guide}</summary>
          <p>{c.teacherGuidance}</p>
          <p>{c.teacherPrivacy}</p>
          <button type="button" onClick={() => setResetPrompt(true)}>
            {c.clear}
          </button>
          {resetPrompt && (
            <div>
              <p>{c.clearConfirm}</p>
              <div className={s.actions}>
                <button type="button" onClick={reset}>
                  {c.clearYes}
                </button>
                <button type="button" onClick={() => setResetPrompt(false)}>
                  {c.cancel}
                </button>
              </div>
            </div>
          )}
        </details>
      </footer>
    </div>
  );
}

function Playground({
  labId,
  collected,
  onCollect,
  onRelay,
  picker,
}: {
  labId: LabId;
  collected: string[];
  onCollect: (id: string) => void;
  onRelay: () => void;
  /** The property menu: it shares one row with the play style. */
  picker: ReactNode;
}) {
  const lab = labs.find((l) => l.id === labId)!;
  // Only Topic 1 has the guided 16.1 / 16.2 lesson; other topics never read this record.
  const [lesson, setLesson] = useLocalSession<ChordLessonState>(
    "lesson-chords-16-1-16-2-v2",
    initialChordLesson,
    parseChordLesson,
  );
  const [theoremMode, setTheoremMode] = useLocalSession<boolean>(
    `theorem-guide-open-${labId}`,
    () => labId !== "bisector",
    (raw) => (typeof raw === "boolean" ? raw : undefined),
  );
  const [saved, setSaved, saveFailed] = useLocalSession<PlaygroundState>(
    `playground-${labId}`,
    () => initialPlayground(labId),
    (raw) => {
      const parsed = parsePlayground(labId, raw);
      // Opening the lesson replays its demonstration, ready for the next class.
      return parsed &&
        labId === "bisector" &&
        lesson.open &&
        (lesson.step === 3 || lesson.step === 4)
        ? { ...parsed, parameters: { ...chordLessonStarts[lesson.step] } }
        : parsed;
    },
  );
  // Not saved: a finished step still replays from the condition on the next visit.
  const [revealedStep, setRevealedStep] = useState<number | null>(null);
  // Also not saved: a paper circle demonstration always opens at its first stage.
  const [paper, setPaper] = useState({ step: -1, stage: 0, chord: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDetailsElement>(null);
  const ink = useInkBoard(`playground-${labId}`);
  const reasonRef = useRef<HTMLDivElement>(null);
  const sliderKeyboard = useRef(false);
  const [penOpen, setPenOpen] = useState(false);
  // A guided theorem lesson puts its 16.x buttons in the row above, through this slot.
  const [selectorSlot, setSelectorSlot] = useState<HTMLDivElement | null>(null);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [conditionParameters, setConditionParameters] =
    useState<Parameters | null>(null);
  const [highlightKey, setHighlightKey] = useState(0);
  const [snapResult, setSnapResult] = useState<
    (SnapResult & { context: string }) | null
  >(null);
  const {
    parameters,
    missionIndex,
    free,
    showReasons,
    showMeasurements,
    showAngles,
    autoSnap,
    focus,
  } = saved;
  function update<K extends keyof PlaygroundState>(
    key: K,
    value: SetStateAction<PlaygroundState[K]>,
  ) {
    setSaved((p) => ({
      ...p,
      [key]:
        typeof value === "function"
          ? (value as (v: PlaygroundState[K]) => PlaygroundState[K])(p[key])
          : value,
    }));
  }
  const setParameters = (next: SetStateAction<Parameters>) =>
    update("parameters", next);
  const setFree = (next: SetStateAction<boolean>) => update("free", next);
  const setFocus = (next: SetStateAction<boolean>) => update("focus", next);
  const setShowReasons = (next: SetStateAction<boolean>) =>
    update("showReasons", next);
  const lessonMode = labId === "bisector" && lesson.open && !theoremMode;
  // Steps 3 and 4 put their questions across the full width below the circle.
  const lessonQuestions = lessonMode && lesson.step >= 5;
  const paperStep = lessonMode && isPaperStep(lesson.step) ? lesson.step : null;
  const paperStage = paper.step === lesson.step ? paper.stage : 0;
  const paperChord = paperChords[paper.chord];
  const conditionMet = lessonMode && nAtMidpoint(parameters);
  const revealed = revealedStep === lesson.step && conditionMet;
  const tasks = !free && !lessonMode && !theoremMode;
  const angleCondition = ["centre", "segment", "semicircle"].includes(labId);
  const displayedParameters =
    conditionOpen && angleCondition && conditionParameters
      ? conditionParameters
      : parameters;
  const model = getModel(labId, displayedParameters),
    params = normalise(labId, parameters);
  const chordBoard =
    labId === "bisector" && paperStep === null && !conditionOpen;
  const diameter = chordBoard && isBisectorDiameter(params);
  // Older boards could stop 0.2 cm from O when a student tried to make a diameter.
  const nearDiameter =
    chordBoard && !diameter && Math.abs(params.primary) <= 0.2;
  // The lesson decides which readings are visible: the given first, the result once found.
  // The Show/Hide buttons override that for the current step; the next step starts fresh.
  const [lessonReadings, setLessonReadings] = useState<
    Partial<ChordLessonReadings> & { step: number }
  >({ step: -1 });
  const display =
    lessonMode && !conditionOpen
      ? chordLessonDisplay(
          lesson.step,
          revealed,
          lessonReadings.step === lesson.step ? lessonReadings : {},
        )
      : { lengths: showMeasurements, angles: showAngles };
  function toggleReading(kind: keyof ChordLessonReadings) {
    if (!lessonMode)
      return update(
        kind === "lengths" ? "showMeasurements" : "showAngles",
        !display[kind],
      );
    setLessonReadings((previous) => ({
      ...(previous.step === lesson.step ? previous : {}),
      step: lesson.step,
      [kind]: !display[kind],
    }));
  }
  const visibleMeasurements = model.measurements.filter((m) =>
    m.unit === "°" || m.label === "Angle ratio"
      ? display.angles
      : display.lengths,
  );
  const mission = missions[labId][missionIndex];
  const snapMission = tasks && !conditionOpen ? missionIndex : undefined;
  const snapContext = `${free}:${lessonMode}:${missionIndex}:${conditionOpen}`;
  const snapLabel =
    autoSnap &&
    snapResult?.context === snapContext &&
    JSON.stringify(snapResult.parameters) ===
      JSON.stringify(displayedParameters)
      ? snapResult.label
      : null;
  /** A shape the student made by hand: a task records its star, a lesson step notes what was found. */
  function applyShape(next: Parameters) {
    setSaved((previous) => {
      const shaped = { ...previous, parameters: next };
      return tasks ? storeMissionShape(labId, shaped, mission.id) : shaped;
    });
    if (tasks && evaluateMission(mission, next).complete) onCollect(mission.id);
  }
  /** The result stays hidden until the class has seen the condition on its own. */
  function revealDeduction() {
    const step = lesson.step;
    if (!conditionMet || (step !== 3 && step !== 4)) return;
    // The reveal always shows, even if a reading was hidden by hand.
    setLessonReadings({ step: -1 });
    setRevealedStep(step);
    setLesson((previous) => {
      const found: [boolean, boolean] = [...previous.found];
      found[step - 3] = true;
      return { ...previous, found };
    });
  }
  function changeByHand(next: Parameters, key: DragKey) {
    const result = autoSnap
      ? snapParameters(labId, next, key, snapMission)
      : { parameters: next, label: null };
    setSnapResult({ ...result, context: snapContext });
    if (conditionOpen && angleCondition)
      setConditionParameters(result.parameters);
    else applyShape(result.parameters);
  }
  function changeCondition(next: (p: Parameters) => Parameters) {
    setConditionParameters((p) => normalise(labId, next(p ?? parameters)));
    setHighlightKey((n) => n + 1);
  }
  function chooseStyle(freePlay: boolean) {
    setTheoremMode(false);
    setSnapResult(null);
    if (labId === "bisector")
      setLesson((previous) => ({ ...previous, open: false }));
    setFree(freePlay);
  }
  function openChordLesson() {
    setTheoremMode(false);
    setSnapResult(null);
    if (lesson.step === 3 || lesson.step === 4)
      lessonShape({ ...chordLessonStarts[lesson.step] });
    restartPaper();
    setLesson((previous) => ({ ...previous, open: true }));
  }
  function restartPaper() {
    setPaper((previous) => ({ ...previous, step: -1, stage: 0 }));
  }
  function anotherChord() {
    setPaper((previous) => ({
      step: -1,
      stage: 0,
      chord: (previous.chord + 1) % paperChords.length,
    }));
  }
  /** One press moves the demonstration on one stage, and the last press moves to the next step. */
  function advancePaper() {
    if (paperStep === null) return;
    if (paperStage >= paperLastStage[paperStep]) {
      if (paperStep === 2) lessonShape({ ...chordLessonStarts[3] });
      restartPaper();
      setLesson((previous) => ({
        ...previous,
        step: (paperStep + 1) as ChordLessonStep,
      }));
      return;
    }
    const stage = paperStage + 1;
    setPaper((previous) => ({ ...previous, step: paperStep, stage }));
    if (stage === paperLastStage[paperStep])
      setLesson((previous) => {
        const seen: ChordLessonState["seen"] = [...previous.seen];
        seen[paperStep] = true;
        return { ...previous, seen };
      });
  }
  /** A new shape restarts the step: the result is hidden again, with no readings changed by hand. */
  function lessonShape(shape: Parameters) {
    setSnapResult(null);
    setRevealedStep(null);
    setLessonReadings({ step: -1 });
    setParameters(shape);
  }
  /** Once a tool is in hand, Tools closes again. Its own row appears above the task. */
  function closeTools() {
    if (toolsRef.current) toolsRef.current.open = false;
  }
  function togglePen() {
    // A hidden pen must never keep capturing drags meant for the circle.
    if (penOpen) ink.setMode("move");
    setPenOpen(!penOpen);
    closeTools();
  }
  const conditionPrompt =
    labId === "bisector"
      ? "What if the perpendicular misses O?"
      : labId === "centre"
        ? "What if P moves to the other arc?"
        : labId === "segment"
          ? "What if Q crosses chord AB?"
          : labId === "semicircle"
            ? "What if AB misses the centre?"
            : "What changes when the circles have unequal radii?";
  const conditionExperiment: Experiment =
    labId === "bisector" ? "perpendicular" : "radii";
  const conditionObservation =
    labId === "centre"
      ? "Compare the two angles and the highlighted arc. Which centre angle now matches the angle at P?"
      : labId === "segment"
        ? "Compare ∠APB and ∠AQB on opposite sides of AB. Then move Q back. Which position is needed for equal angles?"
        : "Compare the angle at P when AB is a diameter and when it misses O. Drag P too: what changes?";
  const lessonStep =
    lesson.step === 3
      ? circleLessonCopy.perpendicular
      : circleLessonCopy.midpoint;
  const boardTask = conditionOpen
    ? conditionPrompt
    : lessonMode
      ? paperStep !== null
        ? paperTask(paperStep, paperStage)
        : lesson.step >= 5
          ? c.lessonBoardTask
          : revealed
            ? lessonStep.result
            : conditionMet
              ? lessonStep.ask
              : lessonStep.task
      : free
        ? lab.question
        : missionPrompt(mission);
  function showBoard() {
    requestAnimationFrame(() =>
      boardRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" }),
    );
  }
  /** The enlarged board starts at the top of the screen, so its buttons stay in reach. */
  function toggleFocus() {
    setFocus((x) => !x);
    closeTools();
    if (!focus)
      requestAnimationFrame(() =>
        boardRef.current?.scrollIntoView({ block: "start", behavior: "auto" }),
      );
  }
  function openCondition() {
    setConditionParameters({ ...parameters });
    setConditionOpen(true);
    setHighlightKey(0);
    showBoard();
  }
  function closeCondition() {
    setConditionOpen(false);
    setHighlightKey(0);
    showBoard();
  }
  function explain() {
    setHighlightKey((n) => n + 1);
    showBoard();
  }
  function showRecordedShape() {
    const recorded = saved.recordedShapes[mission.id];
    if (!recorded) return;
    setSnapResult(null);
    setHighlightKey(0);
    setParameters({ ...recorded });
    requestAnimationFrame(() => {
      boardRef.current?.focus({ preventScroll: true });
      boardRef.current
        ?.querySelector('[data-testid="circle-diagram"]')
        ?.scrollIntoView({ block: "center", behavior: "auto" });
    });
  }
  function selectMission(index: number) {
    setHighlightKey(0);
    setSaved((p) => ({ ...p, missionIndex: index, free: false }));
  }
  function newShape() {
    (lessonMode ? lessonShape : setParameters)(randomShape(labId));
  }
  const slide = (key: DragKey, value: number) =>
    normalise(labId, { ...parameters, [key]: value });
  const chordSelector = labId === "bisector" && (lessonMode || theoremMode) && (
    <nav
      className={s.lessonChips}
      aria-label={circleTheoremLessonCopy.chordLessons}
    >
      {(
        [
          [circleTheoremLessonCopy.originalChords, lessonMode, openChordLesson],
          [
            circleTheoremLessonCopy.locateCentre,
            theoremMode,
            () => setTheoremMode(true),
          ],
        ] as const
      ).map(([name, pressed, open]) => (
        // The number is enough on the button: the heading below gives the title.
        <button
          type="button"
          key={name}
          aria-label={name}
          title={name}
          aria-pressed={pressed}
          onClick={open}
        >
          {name.split(" · ")[0]}
        </button>
      ))}
    </nav>
  );
  const contextBar = (
    <div className={s.contextBar}>
      <h2 className={s.visuallyHidden}>{places[labId].subtitle}</h2>
      {picker}
      {lessonMode && chordSelector}
      <div className={s.lessonSlot} ref={setSelectorSlot} />
      <div className={s.playSwitch} role="group" aria-label={c.playStyle}>
        <button
          type="button"
          aria-pressed={lessonMode || theoremMode}
          onClick={() => {
            if (labId === "bisector" && !theoremMode) openChordLesson();
            else setTheoremMode(true);
          }}
        >
          {circleLessonCopy.mode}
        </button>
        <button
          type="button"
          aria-pressed={tasks}
          onClick={() => chooseStyle(false)}
        >
          {c.missions}
        </button>
        <button
          type="button"
          aria-pressed={free && !lessonMode && !theoremMode}
          onClick={() => chooseStyle(true)}
        >
          {c.free}
        </button>
      </div>
    </div>
  );
  if (theoremMode) {
    return (
      <section className={s.playground} aria-label={places[labId].subtitle}>
        {contextBar}
        <TheoremLesson
          lab={lab}
          onRelay={onRelay}
          chordSelector={chordSelector || undefined}
          selectorSlot={selectorSlot}
        />
      </section>
    );
  }
  return (
    <section
      className={`${s.playground} ${focus ? s.focused : ""}`}
      aria-label={places[labId].subtitle}
    >
      {contextBar}
      {lessonMode && !focus && !conditionOpen && (
        <ChordLessonSteps
          state={lesson}
          onState={setLesson}
          onShape={lessonShape}
          onPaperRestart={restartPaper}
        />
      )}
      <div
        className={`${s.playArea} ${conditionOpen && !angleCondition ? s.testingCondition : ""} ${lessonMode ? s.lessonArea : ""}`}
      >
        <div
          className={s.board}
          ref={boardRef}
          tabIndex={-1}
          role="region"
          aria-label={c.board}
        >
          {/* Nothing sits above the task until a tool is in use. */}
          {(conditionOpen || penOpen || focus) && (
            <div className={s.boardTools}>
              {conditionOpen ? (
                <>
                  {!angleCondition && <span>{c.changeCondition}</span>}
                  <button
                    type="button"
                    onClick={() => {
                      setConditionOpen(false);
                      setFocus(false);
                      setShowReasons(true);
                      requestAnimationFrame(() =>
                        reasonRef.current?.scrollIntoView({ block: "start" }),
                      );
                    }}
                  >
                    {c.compareReasons}
                  </button>
                  <button type="button" onClick={closeCondition}>
                    {c.backToCircle}
                  </button>
                </>
              ) : (
                <>
                  {penOpen && (
                    <>
                      <InkToolbar board={ink} />
                      <button type="button" onClick={togglePen}>
                        {c.hidePen}
                      </button>
                    </>
                  )}
                  {focus && (
                    <button type="button" onClick={toggleFocus}>
                      {c.unfocus}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          {conditionOpen && !angleCondition ? (
            <ConditionsLab
              labId={labId}
              entryExperiment={conditionExperiment}
              compact
            />
          ) : (
            <>
              {(!focus || diameter || nearDiameter) && (
                <div className={s.currentTask}>
                  <strong>
                    <MathText>
                      {diameter
                        ? c.diameterHelp
                        : nearDiameter
                          ? c.nearDiameter
                          : boardTask}
                    </MathText>
                  </strong>
                  {nearDiameter && (
                    <button
                      type="button"
                      onClick={() => applyShape({ ...params, primary: 0 })}
                    >
                      <MathText>{c.makeDiameter}</MathText>
                    </button>
                  )}
                  {tasks && !conditionOpen && !diameter && !nearDiameter && (
                    <span>
                      {c.taskOf(missionIndex + 1, missions[labId].length)}
                    </span>
                  )}
                </div>
              )}
              <div
                className={`${s.canvas} ${paperStep !== null ? s.paperCanvas : ""}`}
              >
                {paperStep !== null ? (
                  <PaperCircleDemo
                    step={paperStep}
                    stage={paperStage}
                    chord={paperChord}
                    ink={ink}
                    onAdvance={advancePaper}
                    onRestart={restartPaper}
                    onAnotherChord={anotherChord}
                  />
                ) : (
                  <CircleDiagram
                    lab={labId}
                    parameters={displayedParameters}
                    onChange={changeByHand}
                    missionIndex={snapMission}
                    showMeasurements={display.lengths}
                    showAngles={display.angles}
                    showAngleMarks={!lessonMode || display.angles}
                    chordReason={
                      lessonMode && (lesson.step === 3 || lesson.step === 4)
                        ? lesson.step === 3 ? "r1" : "r2"
                        : undefined
                    }
                    highlightKey={highlightKey}
                    showInstructions={false}
                    ink={conditionOpen ? undefined : ink}
                  />
                )}
              </div>
              <div className={s.snapStatus} role="status" aria-live="polite">
                {snapLabel &&
                  !lessonMode &&
                  display.lengths &&
                  display.angles && (
                    <span>
                      <strong>{c.snapped}: </strong>
                      <MathText>{snapLabel}</MathText>
                    </span>
                  )}
              </div>
              {conditionOpen && (
                <div className={s.angleExperiment}>
                  <p>
                    <MathText>{conditionObservation}</MathText>
                  </p>
                  <div>
                    {labId === "semicircle" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            changeCondition((p) => ({ ...p, primary: 180 }))
                          }
                        >
                          <MathText>{c.makeDiameter}</MathText>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            changeCondition((p) => ({ ...p, primary: 130 }))
                          }
                        >
                          <MathText>Move AB away from O</MathText>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          changeCondition((p) => ({
                            ...p,
                            alternate: !p.alternate,
                          }))
                        }
                      >
                        <MathText>
                          {labId === "segment"
                            ? displayedParameters.alternate
                              ? "Move Q back to P's side"
                              : "Move Q to the opposite side"
                            : "Move P to the other arc"}
                        </MathText>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {!conditionOpen && (
            // A new step starts with Tools closed, so each step opens on its task alone.
            <details
              className={s.boardOptions}
              ref={toolsRef}
              key={lessonMode ? lesson.step : "tools"}
            >
              <summary>{c.tools}</summary>
              <div className={s.toolButtons}>
                <button
                  type="button"
                  aria-pressed={penOpen}
                  onClick={togglePen}
                >
                  {c.pen}
                </button>
                <button
                  type="button"
                  aria-pressed={focus}
                  onClick={toggleFocus}
                >
                  {c.focus}
                </button>
              </div>
              {paperStep === null && (
                <>
                  <div className={s.toolSwitches}>
                    <label className={s.snapToggle} title={c.snapHelp}>
                      <input
                        type="checkbox"
                        checked={autoSnap}
                        onChange={(e) => {
                          update("autoSnap", e.target.checked);
                          setSnapResult(null);
                        }}
                      />
                      {c.autoSnap}
                    </label>
                    <div
                      className={s.measurementButtons}
                      role="group"
                      aria-label={c.measurementButtons}
                    >
                      <button
                        type="button"
                        aria-pressed={display.lengths}
                        onClick={() => toggleReading("lengths")}
                      >
                        {display.lengths ? c.hideLengths : c.showLengths}
                      </button>
                      <button
                        type="button"
                        aria-pressed={display.angles}
                        onClick={() => toggleReading("angles")}
                      >
                        {display.angles ? c.hideAngles : c.showAngles}
                      </button>
                    </div>
                  </div>
                  <div className={s.boardCaption}>
                    <span>
                      <MathText>{model.description}</MathText>
                    </span>
                  </div>
                  <MeasurementList
                    label={c.liveMeasurements}
                    measurements={visibleMeasurements}
                  />
                  <p className={s.snapHelp}>{c.snapHelp}</p>
                  <div className={s.boardActions}>
                    <button type="button" onClick={newShape}>
                      <span aria-hidden="true">⤨</span>
                      {c.shuffle}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        (lessonMode ? lessonShape : setParameters)({
                          ...defaults[labId],
                        });
                      }}
                    >
                      <span aria-hidden="true">↺</span>
                      {c.reset}
                    </button>
                  </div>
                  <details className={s.controls}>
                    <summary>{c.controls}</summary>
                    <p className={s.precision}>{c.precision}</p>
                    <div>
                      {model.controls.map((control) => (
                        <label key={control.key}>
                          <span>
                            <MathText>{control.label}</MathText>
                            <output>{numeric(params[control.key])}</output>
                          </span>
                          <input
                            type="range"
                            aria-label={control.label}
                            min={control.min}
                            max={control.max}
                            step={control.step}
                            value={params[control.key]}
                            onPointerDown={() => {
                              sliderKeyboard.current = false;
                            }}
                            onKeyDown={() => {
                              sliderKeyboard.current = true;
                            }}
                            onChange={(e) =>
                              sliderKeyboard.current
                                ? applyShape(
                                    slide(control.key, Number(e.target.value)),
                                  )
                                : changeByHand(
                                    slide(control.key, Number(e.target.value)),
                                    control.key,
                                  )
                            }
                          />
                          <ExactNumberInput
                            label={`${control.label}: exact value`}
                            min={control.min}
                            max={control.max}
                            step={control.step}
                            value={params[control.key]}
                            onCommit={(value) => {
                              setSnapResult(null);
                              applyShape(slide(control.key, value));
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </details>
                  {model.toggleLabel && (
                    <label className={s.toggle}>
                      <input
                        type="checkbox"
                        checked={parameters.alternate}
                        onChange={(e) =>
                          applyShape({ ...parameters, alternate: e.target.checked })
                        }
                      />
                      <MathText>{model.toggleLabel}</MathText>
                    </label>
                  )}
                  <button
                    type="button"
                    className={s.conditionTool}
                    onClick={openCondition}
                  >
                    <MathText>{conditionPrompt}</MathText>
                  </button>
                </>
              )}
            </details>
          )}
        </div>
        {conditionOpen && angleCondition && <AngleConditionReason lab={labId} parameters={displayedParameters} />}
        {!conditionOpen && (
          <aside className={s.missionPanel}>
            {lessonMode ? (
              <ChordLesson
                state={lesson}
                onState={setLesson}
                onShape={lessonShape}
                conditionMet={conditionMet}
                diameter={diameter}
                revealed={revealed}
                onDeduce={revealDeduction}
                paperStage={paperStage}
                paperChord={paperChord}
                onPaperRestart={restartPaper}
              />
            ) : free ? (
              <div className={s.freeInstructions}>
                <h3>{c.freeTitle}</h3>
                <p>{c.freeBody}</p>
                <button
                  type="button"
                  className={s.primary}
                  onClick={() => chooseStyle(false)}
                >
                  {c.tryTask}
                </button>
                <button type="button" onClick={openCondition}>
                  <MathText>{conditionPrompt}</MathText>
                </button>
              </div>
            ) : (
              <DiscoveryCoach
                labId={labId}
                parameters={parameters}
                onChange={setParameters}
                missionIndex={missionIndex}
                onMissionChange={selectMission}
                collected={collected}
                recordedShape={saved.recordedShapes[mission.id]}
                onShowRecordedShape={showRecordedShape}
                onPractice={onRelay}
                onCondition={openCondition}
                conditionPrompt={conditionPrompt}
                onExplain={explain}
              />
            )}
            {saveFailed && <p role="status">{c.storageFailed}</p>}

            <div className={s.reasonDrawer}>
              <button
                type="button"
                aria-expanded={showReasons}
                onClick={() => {
                  setShowReasons((x) => !x);
                  if (!showReasons)
                    requestAnimationFrame(() =>
                      reasonRef.current?.scrollIntoView({
                        block: "start",
                        behavior: "auto",
                      }),
                    );
                }}
              >
                <span aria-hidden="true">▱</span>
                {c.showReasons}
                <span aria-hidden="true">{showReasons ? "−" : "+"}</span>
              </button>
            </div>
          </aside>
        )}
        {lessonQuestions && !conditionOpen && !focus && (
          <ChordLessonQuestions
            state={lesson}
            onState={setLesson}
            onShape={lessonShape}
            onPractice={onRelay}
            onFreePlay={() => chooseStyle(true)}
          />
        )}
      </div>
      {showReasons && !conditionOpen && (
        <div ref={reasonRef} className={s.reasonWorkspace}>
          <ReasonExplorer labId={labId} onPractice={onRelay} />
          <details className={s.reasonExplanation}>
            <summary>{c.whyItWorks}</summary>
            <p>
              <MathText>{lab.explanation}</MathText>
            </p>
          </details>
        </div>
      )}
    </section>
  );
}
