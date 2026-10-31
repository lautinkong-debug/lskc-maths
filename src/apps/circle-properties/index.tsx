"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type SetStateAction,
} from "react";
import { circleCopy as c } from "@/lib/copy";
import { labs, reasons, type LabId } from "./content";
import CircleDiagram from "./CircleDiagram";
import ReasonExplorer from "./ReasonExplorer";
import InkToolbar from "./InkToolbar";
import { useInkBoard } from "./useInkBoard";
import {
  defaults,
  getModel,
  normalise,
  type Parameters,
  type DragKey,
} from "./geometry";
import { snapParameters, type SnapResult } from "./snapping";
import { missions } from "./missions";
import DiscoveryCoach from "./DiscoveryCoach";
import { missionPrompt } from "./discovery";
import ReasonPractice from "./ReasonPractice";
import TransferCheck from "./TransferCheck";
import ConditionsLab from "./ConditionsLab";
import type { Experiment } from "./conditions";
import { useLocalSession, clearLocalSessions } from "./useLocalSession";
import {
  initialWorkspace,
  parseWorkspace,
  initialPlayground,
  parsePlayground,
  storeMissionShape,
  type PlaygroundState,
} from "./session";
import {
  emptyProgress,
  parseProgress,
  storageKey,
  legacyStorageKey,
  type Progress,
} from "./progress";
import { LabIcon, Orb, Star } from "./LabSprites";
import s from "./circle.module.css";
import MathText from "./MathText";
import ExactNumberInput from "./ExactNumberInput";

const places: Record<LabId, { name: string; subtitle: string; tone: string }> =
  {
    bisector: {
      name: "Chord balance",
      subtitle: "Perpendiculars and chord mid-points",
      tone: "blue",
    },
    chords: {
      name: "Twin chords",
      subtitle: "Equal chords and distances",
      tone: "mint",
    },
    centre: {
      name: "Double vision",
      subtitle: "Centre and circumference angles",
      tone: "purple",
    },
    segment: {
      name: "Angle twins",
      subtitle: "Angles in the same segment",
      tone: "pink",
    },
    semicircle: {
      name: "Right-angle hunt",
      subtitle: "Angle in a semicircle",
      tone: "yellow",
    },
    "equal-arcs": {
      name: "Perfect match",
      subtitle: "Angles, arcs and chords",
      tone: "mint",
    },
    ratios: {
      name: "Ratio remix",
      subtitle: "Arc and angle ratios",
      tone: "purple",
    },
  };
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
  return hydrated ? (
    <CircleWorkspace key={epoch} onReset={() => setEpoch((x) => x + 1)} />
  ) : (
    <p role="status">Opening your playground…</p>
  );
}
function CircleWorkspace({ onReset }: { onReset: () => void }) {
  const [workspace, setWorkspace, workspaceFailed] = useLocalSession(
    "workspace",
    initialWorkspace,
    parseWorkspace,
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
  const [resetError, setResetError] = useState(false);
  const [propertyMenu, setPropertyMenu] = useState(false);
  const settingsRef = useRef<HTMLDetailsElement>(null);
  const { mode, labId } = workspace;
  const setMode = (mode: typeof workspace.mode) => {
    setPropertyMenu(false);
    if (settingsRef.current) settingsRef.current.open = false;
    setWorkspace((p) => ({ ...p, mode }));
  };
  const explore = (labId: LabId) => {
    setPropertyMenu(false);
    if (settingsRef.current) settingsRef.current.open = false;
    setWorkspace((p) => ({ ...p, labId, mode: "explore" }));
  };
  const practise = (focusLab: LabId) =>
    setWorkspace((p) => ({
      ...p,
      mode: "relay",
      focusLab,
      focusToken: p.focusToken + 1,
    }));
  function collect(kind: "missions" | "reasons", id: string) {
    setProgress((p) =>
      p[kind].includes(id) ? p : { ...p, [kind]: [...p[kind], id] },
    );
  }
  function reset() {
    try {
      clearLocalSessions();
      localStorage.setItem(storageKey, JSON.stringify(emptyProgress()));
      onReset();
    } catch {
      setResetError(true);
    }
  }
  return (
    <div className={s.app} data-appearance={workspace.appearance}>
      <header className={s.header}>
        <div className={s.brand}>
          <div className={s.brandOrb}>
            <Orb />
          </div>
          <div>
            <h1>{c.title}</h1>
          </div>
        </div>
        <nav className={s.tabs} aria-label="Circle Lab activities">
          <button
            type="button"
            aria-pressed={mode === "explore"}
            onClick={() => setMode("explore")}
          >
            {c.explore}
          </button>
          <button
            type="button"
            aria-pressed={mode === "relay"}
            onClick={() => setMode("relay")}
          >
            {c.relay}
          </button>
          <button
            type="button"
            aria-pressed={mode === "check"}
            onClick={() => setMode("check")}
          >
            {c.apply}
          </button>
        </nav>
        <details
          className={s.settings}
          ref={settingsRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary>Settings</summary>
          <div className={s.settingsPanel}>
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
            <div className={s.collection} aria-label="Your game progress">
              <span>
                <Star />
                {progress.missions.length}
                <small>/21 {c.tasks}</small>
              </span>
              <span>
                <b aria-hidden="true">▱</b>
                {progress.reasons.length}
                <small>/17 {c.once}</small>
              </span>
            </div>
            <p>{c.savedShape}</p>
            <details className={s.quickGuide}>
              <summary>New here?</summary>
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
      {mode === "explore" && (
        <>
          <div
            className={s.mobileProperty}
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
              <span>Property</span>
              <strong>{places[labId].subtitle}</strong>
              <span aria-hidden="true">{propertyMenu ? "−" : "+"}</span>
            </button>
            {propertyMenu && (
              <nav
                id="circle-property-menu"
                aria-label="Choose a property"
                className={s.propertyMenu}
              >
                {labs.map((lab) => (
                  <button
                    type="button"
                    key={lab.id}
                    aria-pressed={labId === lab.id}
                    onClick={() => explore(lab.id)}
                  >
                    {places[lab.id].subtitle}
                  </button>
                ))}
              </nav>
            )}
          </div>
          <div className={s.explorer}>
            <aside className={s.rail}>
              <div className={s.railHeading}>
                <h2>Choose a property</h2>
                <span>All unlocked</span>
              </div>
              <div className={s.labButtons}>
                {labs.map((lab) => (
                  <button
                    type="button"
                    key={lab.id}
                    data-tone={places[lab.id].tone}
                    aria-label={places[lab.id].subtitle}
                    aria-pressed={labId === lab.id}
                    onClick={() => explore(lab.id)}
                  >
                    <span className={s.labIcon}>
                      <LabIcon id={lab.id} />
                    </span>
                    <span className={s.labName}>
                      {places[lab.id].subtitle}
                      <small>{places[lab.id].name}</small>
                      <span
                        className={s.miniStars}
                        aria-label={`${missions[lab.id].filter((m) => progress.missions.includes(m.id)).length} of 3 tasks`}
                      >
                        {missions[lab.id].map((m) => (
                          <Star
                            key={m.id}
                            filled={progress.missions.includes(m.id)}
                          />
                        ))}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <p className={s.railNote}>{c.suggested}</p>
            </aside>
            <Playground
              key={labId}
              labId={labId}
              collected={progress.missions}
              onCollect={(id) => collect("missions", id)}
              onRelay={() => practise(labId)}
              simple={workspace.appearance === "calm"}
            />
          </div>
        </>
      )}
      {mode === "relay" && (
        <ReasonPractice
          focusLab={workspace.focusLab}
          focusToken={workspace.focusToken}
          collected={progress.reasons}
          onCollect={(id) => collect("reasons", id)}
        />
      )}
      {mode === "check" && <TransferCheck onExplore={explore} />}
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
              {resetError && <p role="alert">{c.storageFailed}</p>}
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
  simple,
}: {
  labId: LabId;
  collected: string[];
  onCollect: (id: string) => void;
  onRelay: () => void;
  simple: boolean;
}) {
  const lab = labs.find((l) => l.id === labId)!;
  const [saved, setSaved, saveFailed] = useLocalSession<PlaygroundState>(
    `playground-${labId}`,
    () => initialPlayground(labId),
    (raw) => parsePlayground(labId, raw),
  );
  const boardRef = useRef<HTMLDivElement>(null);
  const ink = useInkBoard(`playground-${labId}`);
  const reasonRef = useRef<HTMLDivElement>(null);
  const sliderKeyboard = useRef(false);
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
  const setShowMeasurements = (next: boolean) =>
    update("showMeasurements", next);
  const setShowReasons = (next: SetStateAction<boolean>) =>
    update("showReasons", next);
  const angleCondition = ["centre", "segment", "semicircle"].includes(labId);
  const displayedParameters =
    conditionOpen && angleCondition && conditionParameters
      ? conditionParameters
      : parameters;
  const model = getModel(labId, displayedParameters),
    params = normalise(labId, parameters);
  const mission = missions[labId][missionIndex];
  const snapMission = free || conditionOpen ? undefined : missionIndex;
  const snapContext = `${free}:${missionIndex}:${conditionOpen}`;
  const snapLabel =
    autoSnap &&
    snapResult?.context === snapContext &&
    JSON.stringify(snapResult.parameters) ===
      JSON.stringify(displayedParameters)
      ? snapResult.label
      : null;
  function changeByHand(next: Parameters, key: DragKey) {
    const result = autoSnap
      ? snapParameters(labId, next, key, snapMission)
      : { parameters: next, label: null };
    setSnapResult({ ...result, context: snapContext });
    if (conditionOpen && angleCondition)
      setConditionParameters(result.parameters);
    else setParameters(result.parameters);
  }
  function changeCondition(next: (p: Parameters) => Parameters) {
    setConditionParameters((p) => normalise(labId, next(p ?? parameters)));
    setHighlightKey((n) => n + 1);
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
  function showBoard() {
    requestAnimationFrame(() =>
      boardRef.current?.scrollIntoView({ block: "nearest", behavior: "auto" }),
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
  function recordShape(id: string) {
    setSaved((previous) => storeMissionShape(labId, previous, id));
    onCollect(id);
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
    setParameters(randomShape(labId));
  }
  return (
    <section
      className={`${s.playground} ${focus ? s.focused : ""}`}
      aria-label={places[labId].subtitle}
      data-tone={places[labId].tone}
    >
      <div className={s.stageHeading}>
        <div>
          <p className={s.chapter}>
            Ch.16 ·{" "}
            {lab.reasonIds
              .map((id) => reasons.find((r) => r.id === id)!.number)
              .join(" / ")}
          </p>
          <h2>{places[labId].subtitle}</h2>
          <p className={s.propertyName}>{places[labId].name}</p>
        </div>
        <div className={s.playSwitch} aria-label="Play style">
          <button
            type="button"
            aria-pressed={!free}
            onClick={() => setFree(false)}
          >
            {c.missions}
          </button>
          <button
            type="button"
            aria-pressed={free}
            onClick={() => setFree(true)}
          >
            {c.free}
          </button>
        </div>
      </div>
      <div
        className={`${s.playArea} ${conditionOpen ? s.testingCondition : ""}`}
      >
        <div
          className={s.board}
          ref={boardRef}
          tabIndex={-1}
          role="region"
          aria-label="Circle construction board"
        >
          <div className={s.boardTools}>
            {conditionOpen && !angleCondition ? (
              <span>Change one condition</span>
            ) : (
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
            )}
            {!conditionOpen && <InkToolbar board={ink} />}
            {conditionOpen ? (
              <button type="button" onClick={closeCondition}>
                Back to my circle
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFocus((x) => !x)}
                aria-pressed={focus}
              >
                {focus ? c.unfocus : c.focus}
              </button>
            )}
          </div>
          {conditionOpen && !angleCondition ? (
            <ConditionsLab
              labId={labId}
              entryExperiment={conditionExperiment}
              compact
            />
          ) : (
            <>
              {!focus && (
                <div className={s.currentTask}>
                  <strong>
                    <MathText>
                      {conditionOpen
                        ? conditionPrompt
                        : free
                          ? lab.question
                          : missionPrompt(mission)}
                    </MathText>
                  </strong>
                  {!conditionOpen && !free && (
                    <span>Task {missionIndex + 1} of 3</span>
                  )}
                </div>
              )}
              <div className={s.canvas}>
                <CircleDiagram
                  lab={labId}
                  parameters={displayedParameters}
                  onChange={changeByHand}
                  missionIndex={snapMission}
                  showMeasurements={showMeasurements}
                  highlightKey={highlightKey}
                  showInstructions={false}
                  ink={conditionOpen ? undefined : ink}
                />
              </div>
              <div className={s.snapStatus} role="status" aria-live="polite">
                {snapLabel && (
                  <span>
                    <strong>{c.snapped}: </strong>
                    <MathText>{snapLabel}</MathText>
                  </span>
                )}
              </div>
              {showMeasurements && (
                <div className={s.readouts} aria-label="Live measurements">
                  {model.measurements.map((m, i) => (
                    <div key={m.label} data-secondary={i % 2 === 1}>
                      <span>
                        <MathText notation>{m.label}</MathText>
                      </span>
                      <strong>
                        {numeric(m.value, m.unit === "" ? 3 : 1)}
                        <small>{m.unit}</small>
                      </strong>
                    </div>
                  ))}
                </div>
              )}
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
                          <MathText>Make AB a diameter</MathText>
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
            <details className={s.boardOptions}>
              <summary>
                {simple ? "Tools and more options" : "Adjust the circle"}
              </summary>
              <div className={s.boardCaption}>
                <span>
                  <MathText>{model.description}</MathText>
                </span>
                <label>
                  <input
                    type="checkbox"
                    checked={showMeasurements}
                    onChange={(e) => setShowMeasurements(e.target.checked)}
                  />
                  {c.measurements}
                </label>
              </div>
              <p className={s.snapHelp}>{c.snapHelp}</p>
              <div className={s.boardActions}>
                <button type="button" onClick={newShape}>
                  <span aria-hidden="true">⤨</span>
                  {c.shuffle}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setParameters({ ...defaults[labId] });
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
                            ? setParameters(
                                normalise(labId, {
                                  ...parameters,
                                  [control.key]: Number(e.target.value),
                                }),
                              )
                            : changeByHand(
                                normalise(labId, {
                                  ...parameters,
                                  [control.key]: Number(e.target.value),
                                }),
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
                          setParameters((p) =>
                            normalise(labId, { ...p, [control.key]: value }),
                          );
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
                      setParameters((p) => ({
                        ...p,
                        alternate: e.target.checked,
                      }))
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
            </details>
          )}
        </div>
        {!conditionOpen && (
          <aside className={s.missionPanel}>
            <div className={s.missionTop}>
              <div>
                <h3>{free ? "Explore further" : "Your next step"}</h3>
              </div>
            </div>
            {free ? (
              <div className={s.freeInstructions}>
                <p>Try a different shape. Look for what stays the same.</p>
                <button
                  type="button"
                  className={s.primary}
                  onClick={() => setFree(false)}
                >
                  Try a mission
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
                onComplete={recordShape}
                onShowRecordedShape={showRecordedShape}
                onPractice={onRelay}
                onCondition={openCondition}
                conditionPrompt={conditionPrompt}
                onExplain={explain}
                simple={simple}
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
      </div>
      {showReasons && !conditionOpen && (
        <div ref={reasonRef} className={s.reasonWorkspace}>
          <ReasonExplorer labId={labId} onPractice={onRelay} />
          <details className={s.reasonExplanation}>
            <summary>Why does it work?</summary>
            <p>
              <MathText>{lab.explanation}</MathText>
            </p>
          </details>
        </div>
      )}
    </section>
  );
}
