"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { copy } from "@/lib/copy";
import { LessonWorkspace } from "@/components/LessonWorkspace";
import { usePresentation } from "@/components/PresentationFrame";
import { groups, questions } from "./data";
import {
  boardShapes,
  centre,
  comparisonPoses,
  modelPoints,
  separatePoses,
  transform,
  poseFromVertex,
  fitPose,
  snapPose,
  overlappingShapeGroups,
  type VertexDragMode,
  type Pose,
} from "./geometry";
import type { Point, Shape, SourceQuestion } from "./types";
import styles from "./similarity.module.css";
import { OriginalCanvas } from "./OriginalCanvas";
import { GeometryName, GeometryText } from "./Notation";
import { VertexHandles } from "./VertexHandles";
import { layoutReasonAngles, ReasonMarks } from "./ReasonMarks";
import { PairedVertexLabels } from "./PairedVertexLabels";
import { PairedSideLabels } from "./PairedSideLabels";
import { pairedSideLabels, sideLabelPoints } from "./pairedSides";
import { DiagramViewControls, useDiagramView } from "./DiagramView";
import { ReasonsPanel } from "./ReasonsPanel";
import { ComparisonKey } from "./ComparisonKey";
import { placeVertexLabels, vertexLabelPoints } from "./vertexLabels";
import { reasonPairs, conditions, type ReasonView } from "./reasons";
import { textbookSolutions } from "./textbook";
import { StepHighlights } from "./StepHighlights";
import { vertexNames, knownRightAngles } from "./stepGeometry";
import { focusPrintedLine } from "./stepFocus";

const c = copy.similarity;
const colours = [
  "var(--color-navy)",
  "var(--color-crimson)",
  "var(--color-graphite)",
];
const name = (q: SourceQuestion) =>
  `${q.group} · ${q.group === "Quick Practice" ? q.number : `Q${q.number}`}`;
const path = (ps: Point[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");

export default function SimilarityStudio() {
  const [id, setId] = useState("ex8c-19");
  const [group, setGroup] = useState("");
  const [query, setQuery] = useState("");
  const presenting = usePresentation();
  useEffect(() => {
    const read = () => {
      let saved = "";
      try {
        saved = localStorage.getItem("similarity-question") ?? "";
      } catch {
        /* Storage may be disabled. */
      }
      const next = window.location.hash.slice(1) || saved;
      if (questions.some((q) => q.id === next)) setId(next);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  function choose(next: string) {
    setId(next);
    window.history.replaceState(null, "", `#${next}`);
    try {
      localStorage.setItem("similarity-question", next);
    } catch {
      /* Optional. */
    }
  }
  const question = questions.find((q) => q.id === id) ?? questions[0];
  const visible = questions.filter(
    (q) =>
      (!group || q.group === group) &&
      `${name(q)} 8.${q.page} ${q.prompt}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const currentIndex = questions.indexOf(question);
  return (
    <div
      className={styles.app}
      data-testid="similarity-studio"
      data-projecting={presenting}
    >
      <LessonWorkspace
        subject={c.title}
        symbol="△"
        active={name(question)}
        presenting={presenting}
        navigation={
          <nav className={styles.bank} aria-label={c.questionBank}>
            <h2>
              {c.questionBank} <span>{questions.length}</span>
            </h2>
            <label>
              {c.search}
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Q19, 8.32, parallel…"
              />
            </label>
            <label>
              {c.all}
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                <option value="">{c.all}</option>
                {groups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={styles.pilot}
              onClick={() => choose("ex8c-19")}
            >
              {c.jump} ↗
            </button>
            <p className={styles.count}>
              {visible.length} / {questions.length} {c.questions}
            </p>
            <div className={styles.questionList}>
              {visible.map((q) => (
                <button
                  type="button"
                  key={q.id}
                  aria-current={q.id === id ? "page" : undefined}
                  onClick={() => choose(q.id)}
                >
                  <span>{name(q)}</span>
                  <small>p. 8.{q.page}</small>
                </button>
              ))}
              {!visible.length && <p>{c.noResults}</p>}
            </div>
          </nav>
        }
      >
        <div className={styles.questionHeader}>
          <div>
            <p className={styles.reference}>
              {question.group === "Quick Practice"
                ? "Quick Practice"
                : "Level 2"}{" "}
              · p. 8.{question.page}
            </p>
            <h2>{name(question)}</h2>
          </div>
          <div className={styles.pager}>
            <button
              aria-label={c.previous}
              disabled={currentIndex === 0}
              onClick={() => choose(questions[currentIndex - 1].id)}
            >
              ←
            </button>
            <button
              aria-label={c.next}
              disabled={currentIndex === questions.length - 1}
              onClick={() => choose(questions[currentIndex + 1].id)}
            >
              →
            </button>
          </div>
        </div>
        <Lesson key={question.id} question={question} />
      </LessonWorkspace>
    </div>
  );
}

function Lesson({ question }: { question: SourceQuestion }) {
  const points = modelPoints(question);
  const [customShapes, setCustomShapes] = useState<Shape[]>([]);
  const shapes = [...question.shapes, ...customShapes];
  const [selected, setSelected] = useState<number[]>(
    question.shapes.slice(0, 2).map((_, i) => i),
  );
  const [active, setActive] = useState(0);
  const [poses, setPoses] = useState<Pose[]>(separatePoses(selected.length));
  const [opacity, setOpacity] = useState(0.2);
  const [order, setOrder] = useState(false);
  const solution = textbookSolutions[question.id];
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [focusedStep, setFocusedStep] = useState<number | null>(null);
  const focused =
    focusedStep === null
      ? undefined
      : focusPrintedLine(solution.steps[focusedStep]);

  const [tracing, setTracing] = useState(false);
  const [vertices, setVertices] = useState<string[]>([]);
  const [originalExpanded, setOriginalExpanded] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const [vertexMode, setVertexMode] = useState<VertexDragMode>("both");
  const [showReasons, setShowReasons] = useState(true);
  const [showMarks, setShowMarks] = useState(true);
  const [exploreMarks, setExploreMarks] = useState(false);
  const [showAngles, setShowAngles] = useState(true);
  const [showLengths, setShowLengths] = useState(true);
  const [hiddenMarks, setHiddenMarks] = useState<string[]>([]);
  const [snapping, setSnapping] = useState(true);
  const [snapMessage, setSnapMessage] = useState("");
  const [pairIndex, setPairIndex] = useState(0);
  const [reasonView, setReasonView] = useState<ReasonView>(
    reasonPairs(question)[0]?.criterion === "given" ? "both" : "proof",
  );
  const [conditionFocus, setConditionFocus] = useState<string | null>(null);
  const highlightStep =
    focused && showMarks
      ? {
          ...focused,
          highlights: {
            ...focused.highlights,
            angles: showAngles ? focused.highlights.angles : [],
            sides: showLengths ? focused.highlights.sides : [],
          },
        }
      : undefined;
  const rightAngles = knownRightAngles(question);
  const pairs = reasonPairs(question);
  const pair = pairs[pairIndex];
  const rows = pair ? conditions(question, pair, reasonView) : [];
  const anglesVisible =
    showMarks &&
    showAngles &&
    (focused
      ? !!focused.highlights.angles?.length
      : exploreMarks && rows.some((r) => r.kind === "angle"));
  const lengthsVisible =
    showMarks &&
    showLengths &&
    (focused
      ? !!focused.highlights.sides?.length
      : exploreMarks && rows.some((r) => r.kind === "side"));
  const hiddenForPair = hiddenMarks
    .filter((id) => id.startsWith(`${pairIndex}:`))
    .map((id) => id.split(":")[1]);
  const visibleRows =
    showMarks && focusedStep === null && exploreMarks
      ? rows.filter(
          (r) =>
            (!conditionFocus || r.id === conditionFocus) &&
            (r.kind === "angle" ? showAngles : showLengths) &&
            !hiddenForPair.includes(r.id),
        )
      : [];
  function hideMark(id: string) {
    setHiddenMarks((prev) => [...new Set([...prev, `${pairIndex}:${id}`])]);
  }
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    index: number;
    x: number;
    y: number;
    original: Pose;
    pointerId: number;
    vertex?: boolean;
    moved?: boolean;
  } | null>(null);
  const chosen = selected.map((i) => shapes[i]);
  const sets = boardShapes(chosen, points);
  const placedShapes = sets.map((ps, i) => ({
    id: selected[i],
    points: transform(ps, poses[i]),
    colour: colours[i],
  }));
  const labelGroups = overlappingShapeGroups(placedShapes, pairs);
  const pairedShapes = new Set(labelGroups.flat());
  const sideLabels = pairedSideLabels(
    placedShapes,
    labelGroups,
    showMarks ? pair : undefined,
    visibleRows,
  );
  const vertexLabels = placeVertexLabels(
    placedShapes
      .filter((s) => !pairedShapes.has(s.id))
      .flatMap((s) => {
        const mid = centre(s.points);
        return s.points.map((p) => ({
          key: `${s.id}-${p.label}`,
          point: p,
          text: p.label + (order ? "1" : ""),
          fontSize: 30,
          preferred: { x: p.x - mid.x, y: p.y - mid.y },
        }));
      }),
    placedShapes.map((s) => s.points),
    sideLabels,
  );
  const markObstacles = [...vertexLabels.values(), ...sideLabels];
  const angleLabelPoints = placedShapes
    .filter((s) => pair?.shapes.includes(s.id))
    .flatMap((s) =>
      vertexLabelPoints(
        layoutReasonAngles(s.points, visibleRows, 1, markObstacles),
      ),
    );
  const view = useDiagramView(
    { x: 0, y: 0, width: 840, height: 470 },
    [
      ...placedShapes.flatMap((s) => s.points),
      ...sideLabelPoints(sideLabels),
      ...vertexLabelPoints(vertexLabels),
      ...angleLabelPoints,
    ],
    45,
    svg,
  );
  const pilot = question.id === "ex8c-19";
  const pose = poses[active];
  function fitComparison(nextPoses: Pose[]) {
    const nextShapes = placedShapes.map((s, i) => ({
      ...s,
      points: transform(sets[i], nextPoses[i]),
    }));
    const labels = pairedSideLabels(
      nextShapes,
      overlappingShapeGroups(nextShapes, pairs),
      showMarks ? pair : undefined,
      visibleRows,
    );
    view.fit([
      ...nextShapes.flatMap((s) => s.points),
      ...sideLabelPoints(labels),
    ]);
  }
  function reset() {
    view.reset();
    setResetVersion((v) => v + 1);
    setOriginalExpanded(false);
    setCustomShapes([]);
    setSelected(question.shapes.slice(0, 2).map((_, i) => i));
    setPoses(separatePoses(Math.min(2, question.shapes.length)));
    setActive(0);
    setVisibleSteps(0);
    setExploreMarks(false);
    setFocusedStep(null);
    setOrder(false);
    setOpacity(0.2);
    setTracing(false);
    setVertices([]);
    setShowReasons(true);
    setShowMarks(true);
    setShowAngles(true);
    setShowLengths(true);
    setHiddenMarks([]);
    setSnapMessage("");
    setReasonView(pairs[0]?.criterion === "given" ? "both" : "proof");
    setPairIndex(0);
    setConditionFocus(null);
    setFocusedStep(null);
  }
  function focusSolution(index: number | null) {
    setFocusedStep(index);
    if (index === null) return;
    setShowMarks(true);
    setShowAngles(true);
    setShowLengths(true);
    setVisibleSteps(index + 1);
    setExploreMarks(false);
    // Use the most recent printed introduction to expose the relevant copies.
    const context =
      solution.steps
        .slice(0, index + 1)
        .reverse()
        .find((s) => (s.highlights.figures?.length ?? 0) >= 2)?.highlights
        .figures ?? [];
    const desired = context
      .map((f) =>
        question.shapes.findIndex((s) => {
          const names = vertexNames(f);
          return (
            s.vertices.length === names.length &&
            s.vertices.every((v) => names.includes(v))
          );
        }),
      )
      .filter((i) => i >= 0)
      .filter((n, i, all) => all.indexOf(n) === i)
      .slice(0, 3);
    if (desired.length && !desired.every((i) => selected.includes(i))) {
      const next = [
        ...desired,
        ...selected.filter((i) => !desired.includes(i)),
      ].slice(0, 3);
      const defaults = separatePoses(next.length);
      const nextSets = boardShapes(
        next.map((id) => shapes[id]),
        points,
      );
      setPoses(
        next.map((id, i) => {
          const oldIndex = selected.indexOf(id);
          if (oldIndex < 0) return defaults[i];
          const old = sets[oldIndex],
            fresh = nextSets[i];
          const scaleFactor =
            Math.hypot(old[1].x - old[0].x, old[1].y - old[0].y) /
            Math.hypot(fresh[1].x - fresh[0].x, fresh[1].y - fresh[0].y);
          return {
            ...poses[oldIndex],
            scale: poses[oldIndex].scale * scaleFactor,
          };
        }),
      );
      setSelected(next);
      setActive(0);
    }
  }
  function select(index: number) {
    view.reset();
    const next = selected.includes(index)
      ? selected.filter((i) => i !== index)
      : [...selected.slice(-2), index];
    setSelected(next);
    chooseVisiblePair(next);
    setPoses(separatePoses(next.length));
    setActive(Math.max(0, next.length - 1));
    setOrder(false);
  }
  function activateOriginal(index: number) {
    if (selected.includes(index)) {
      setActive(selected.indexOf(index));
      return;
    }
    const next = [...selected.slice(-2), index];
    setSelected(next);
    chooseVisiblePair(next);
    setPoses(separatePoses(next.length));
    setActive(next.length - 1);
    setOrder(false);
  }
  function chooseVisiblePair(next: number[]) {
    if (pair?.shapes.every((i) => next.includes(i))) return;
    const matching = pairs.findIndex((p) =>
      p.shapes.every((i) => next.includes(i)),
    );
    if (matching >= 0) {
      setPairIndex(matching);
      setConditionFocus(null);
      setFocusedStep(null);
    }
  }
  function update(patch: Partial<Pose>, index = active) {
    setPoses((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  }
  function vertex(label: string) {
    setVertices((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }
  function addShape() {
    if (vertices.length < 3) return;
    const ps = vertices.map((label) => points.find((p) => p.label === label)!);
    // Reject collinear or zero-area outlines instead of manufacturing a triangle.
    const area = ps.reduce((sum, p, i) => {
      const q = ps[(i + 1) % ps.length];
      return sum + p.x * q.y - q.x * p.y;
    }, 0);
    if (Math.abs(area) < 0.001) return;
    setCustomShapes((prev) => [
      ...prev,
      {
        name: `${vertices.length === 3 ? "△" : ""}${vertices.join("")}`,
        vertices: [...vertices],
      },
    ]);
    const next = [...selected.slice(-1), shapes.length];
    setSelected(next);
    setPoses(separatePoses(next.length));
    setActive(next.length - 1);
    setVertices([]);
    setTracing(false);
    setOrder(false);
  }
  function location(event: ReactPointerEvent<SVGElement>) {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
  }
  function startDrag(
    event: ReactPointerEvent<SVGGElement>,
    index: number,
    vertex?: Point,
  ) {
    if (event.button !== 0 || drag.current) return;
    setSnapMessage("");
    const p = vertex ?? location(event);
    setActive(index);
    drag.current = {
      index,
      x: p.x,
      y: p.y,
      original: poses[index],
      pointerId: event.pointerId,
      vertex: !!vertex,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    event.preventDefault();
  }
  function moveDrag(event: ReactPointerEvent<SVGSVGElement>) {
    if (view.movePan(event)) return;
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId) return;
    const p = location(event);
    const matrix = svg.current?.getScreenCTM();
    if (
      matrix &&
      Math.hypot(p.x - d.x, p.y - d.y) * Math.hypot(matrix.a, matrix.b) > 4
    )
      d.moved = true;
    if (d.vertex) {
      update(
        fitPose(
          sets[d.index],
          poseFromVertex(d.original, d, p, vertexMode),
          { x: 0, y: 0, width: 840, height: 470 },
          30,
          vertexMode === "rotate",
        ),
        d.index,
      );
      return;
    }
    update(
      {
        x: Math.min(780, Math.max(60, d.original.x + p.x - d.x)),
        y: Math.min(400, Math.max(65, d.original.y + p.y - d.y)),
      },
      d.index,
    );
  }
  function finishDrag(event: ReactPointerEvent<SVGSVGElement>) {
    if (view.endPan()) return;
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved || d.pointerId !== event.pointerId || !snapping) return;
    const targetIndices = new Set(
      pairs
        .filter(
          (p) =>
            p.criterion !== "not-similar" &&
            p.shapes.includes(selected[d.index]),
        )
        .flatMap((p) => p.shapes)
        .filter((id) => id !== selected[d.index] && selected.includes(id)),
    );
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return;
    const result = snapPose(
      sets[d.index],
      poses[d.index],
      [...targetIndices].map((id) => ({
        points: sets[selected.indexOf(id)],
        pose: poses[selected.indexOf(id)],
      })),
      {
        pixelsPerUnit: Math.hypot(matrix.a, matrix.b),
        mode: d.vertex ? vertexMode : "both",
      },
    );
    if (result) {
      update(result, d.index);
      fitComparison(poses.map((p, i) => (i === d.index ? result : p)));
      setSnapMessage(c.snapped);
    }
  }
  function nudge(x: number, y: number) {
    if (pose)
      update({
        x: Math.min(780, Math.max(60, pose.x + x)),
        y: Math.min(400, Math.max(65, pose.y + y)),
      });
  }
  const customArea =
    vertices.length < 3
      ? 0
      : vertices.reduce((sum, label, i) => {
          const p = points.find((p) => p.label === label)!;
          const q = points.find(
            (p) => p.label === vertices[(i + 1) % vertices.length],
          )!;
          return sum + p.x * q.y - q.x * p.y;
        }, 0);
  return (
    <>
      <p className={styles.prompt}>
        <GeometryText>{question.prompt}</GeometryText>
      </p>
      <div className={styles.topActions}>
        <p>{c.intro}</p>
        <button type="button" onClick={reset}>
          {c.reset} ↺
        </button>
      </div>
      {points.length > 0 ? (
        <>
          <div className={styles.diagramTools}>
            <label>
              {c.vertexMode}{" "}
              <select
                value={vertexMode}
                onChange={(e) =>
                  setVertexMode(e.target.value as VertexDragMode)
                }
              >
                <option value="both">{c.vertexBoth}</option>
                <option value="rotate">{c.vertexRotate}</option>
                <option value="resize">{c.vertexResize}</option>
              </select>
            </label>
            {pairs.length > 0 && (
              <>
                <button
                  onClick={() => {
                    if (!focused && !exploreMarks) {
                      setExploreMarks(true);
                      setShowMarks(true);
                    } else setShowMarks(!showMarks);
                  }}
                  aria-pressed={showMarks && (!!focused || exploreMarks)}
                >
                  {showMarks && (!!focused || exploreMarks)
                    ? c.hideMarks
                    : c.showMarks}
                </button>
                <button
                  onClick={() => {
                    setShowAngles(!anglesVisible);
                    setConditionFocus(null);
                    if (!focused?.highlights.angles?.length) {
                      setFocusedStep(null);
                      setExploreMarks(true);
                    }
                    if (!rows.some((r) => r.kind === "angle"))
                      setReasonView("both");
                    setShowMarks(true);
                  }}
                  aria-pressed={anglesVisible}
                >
                  {anglesVisible ? c.hideAngles : c.showAngles}
                </button>
                <button
                  onClick={() => {
                    setShowLengths(!lengthsVisible);
                    setConditionFocus(null);
                    if (!focused?.highlights.sides?.length) {
                      setFocusedStep(null);
                      setExploreMarks(true);
                    }
                    if (!rows.some((r) => r.kind === "side"))
                      setReasonView("both");
                    setShowMarks(true);
                  }}
                  aria-pressed={lengthsVisible}
                >
                  {lengthsVisible ? c.hideLengths : c.showLengths}
                </button>
                {hiddenMarks.length > 0 && (
                  <button
                    onClick={() => {
                      setHiddenMarks([]);
                      setShowMarks(true);
                    }}
                  >
                    {c.restoreMarks}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!showReasons) setShowMarks(true);
                    setShowReasons(!showReasons);
                  }}
                  aria-expanded={showReasons}
                >
                  {showReasons ? c.hideReasons : c.showReasons}
                </button>
              </>
            )}
            <label className={styles.snapToggle}>
              <input
                type="checkbox"
                checked={snapping}
                onChange={(e) => {
                  setSnapping(e.target.checked);
                  setSnapMessage("");
                }}
              />{" "}
              {c.snap}
            </label>
          </div>
          <p className={styles.micro}>
            {c.markClickHint} {snapping && c.snapHint}{" "}
            <span role="status">{snapMessage}</span>
          </p>
          <div className={styles.teachingArea}>
            <div
              className={styles.diagramLayout}
              data-has-proof={showReasons && !!pair}
              data-original-expanded={originalExpanded}
            >
              <div
                className={styles.boards}
                data-original-expanded={originalExpanded}
              >
                <section className={styles.original} aria-label={c.original}>
                  <div className={styles.panelTitle}>
                    <span>01</span>
                    <h3>{c.original}</h3>
                  </div>
                  <OriginalCanvas
                    key={resetVersion}
                    question={question}
                    points={points}
                    shapes={shapes}
                    selected={selected}
                    active={active}
                    onActivate={activateOriginal}
                    tracing={tracing}
                    vertices={vertices}
                    onVertex={vertex}
                    expanded={originalExpanded}
                    onExpand={() => setOriginalExpanded((v) => !v)}
                    vertexMode={vertexMode}
                    reasonPair={showMarks ? pair : undefined}
                    reasonRows={visibleRows}
                    highlightStep={highlightStep}
                    rightAngles={rightAngles}
                    proofOnly={
                      !exploreMarks ||
                      focusedStep !== null ||
                      reasonView !== "both"
                    }
                    showAngles={showMarks && showAngles}
                    showLengths={showMarks && showLengths}
                    hiddenMarks={hiddenForPair}
                    onHideMark={hideMark}
                    snapping={snapping}
                    pairs={pairs}
                    onSnap={() => setSnapMessage(c.snapped)}
                  />
                  <p className={styles.micro}>
                    {question.constructed
                      ? c.constructed
                      : pilot
                        ? c.exact
                        : c.tracing}
                  </p>
                  <fieldset className={styles.choices}>
                    <legend>{c.choose}</legend>
                    {shapes.map((s, i) => (
                      <button
                        type="button"
                        key={`${s.name}-${i}`}
                        aria-pressed={selected.includes(i)}
                        aria-label={s.name}
                        onClick={() => select(i)}
                        style={
                          selected.includes(i)
                            ? {
                                borderColor: colours[selected.indexOf(i)],
                                color: colours[selected.indexOf(i)],
                              }
                            : undefined
                        }
                      >
                        <GeometryName>{s.name}</GeometryName>
                      </button>
                    ))}
                  </fieldset>
                  <button
                    className={styles.textButton}
                    onClick={() => {
                      setTracing(!tracing);
                      setVertices([]);
                    }}
                    aria-expanded={tracing}
                  >
                    ＋ {c.custom}
                  </button>
                  {tracing && (
                    <div className={styles.tracePanel}>
                      <p>{c.customHint}</p>
                      <div className={styles.tools}>
                        {points.map((p) => (
                          <button
                            key={p.label}
                            aria-label={p.label}
                            aria-pressed={vertices.includes(p.label)}
                            onClick={() => vertex(p.label)}
                          >
                            <GeometryName>{p.label}</GeometryName>
                          </button>
                        ))}
                      </div>
                      <p aria-live="polite">{vertices.join(" → ") || "—"}</p>
                      <div className={styles.tools}>
                        <button
                          onClick={addShape}
                          disabled={
                            vertices.length < 3 || Math.abs(customArea) < 0.001
                          }
                        >
                          {c.add}
                        </button>
                        <button onClick={() => setVertices([])}>
                          {c.clear}
                        </button>
                      </div>
                    </div>
                  )}
                </section>
                <section
                  className={styles.manipulation}
                  aria-label={c.workspace}
                >
                  <div className={styles.panelTitle}>
                    <span>02</span>
                    <h3>{c.workspace}</h3>
                    <div className={styles.tools}>
                      <button
                        onClick={() => {
                          setPoses(separatePoses(selected.length));
                          view.reset();
                        }}
                      >
                        {c.separate}
                      </button>
                      <button
                        disabled={!poses.length}
                        onClick={() =>
                          setPoses((prev) =>
                            prev.map((p) => ({ ...p, x: 420, y: 235 })),
                          )
                        }
                      >
                        {c.stack}
                      </button>
                    </div>
                  </div>
                  <DiagramViewControls title={c.workspace} view={view} />
                  <svg
                    ref={svg}
                    viewBox={`${view.frame.x} ${view.frame.y} ${view.frame.width} ${view.frame.height}`}
                    className={styles.board}
                    onPointerDown={view.startPan}
                    onPointerMove={moveDrag}
                    onPointerUp={finishDrag}
                    onPointerCancel={() => {
                      view.endPan();
                      drag.current = null;
                    }}
                    onLostPointerCapture={() => {
                      view.endPan();
                      drag.current = null;
                    }}
                    aria-label={c.workspace}
                    data-testid="manipulation-board"
                  >
                    <defs>
                      <pattern
                        id={`grid-${question.id}`}
                        width="30"
                        height="30"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M30 0H0V30"
                          fill="none"
                          stroke="var(--color-grid)"
                          strokeWidth=".7"
                        />
                      </pattern>
                    </defs>
                    <rect
                      {...view.frame}
                      data-pan-background="true"
                      fill={`url(#grid-${question.id})`}
                    />
                    {sets
                      .map((_, i) => i)
                      .sort(
                        (a, b) => Number(a === active) - Number(b === active),
                      )
                      .map((i) => {
                        const transformed = placedShapes[i].points;
                        return (
                          <g
                            key={`${chosen[i].name}-${i}`}
                            tabIndex={0}
                            role="button"
                            aria-label={`${c.move} ${chosen[i].name}`}
                            aria-pressed={active === i}
                            onPointerDown={(e) => startDrag(e, i)}
                            onFocus={() => setActive(i)}
                            onKeyDown={(e) => {
                              const p = poses[i];
                              const delta = e.shiftKey ? 20 : 5;
                              const movement: Record<string, [number, number]> =
                                {
                                  ArrowLeft: [-delta, 0],
                                  ArrowRight: [delta, 0],
                                  ArrowUp: [0, -delta],
                                  ArrowDown: [0, delta],
                                };
                              if (movement[e.key]) {
                                e.preventDefault();
                                const [x, y] = movement[e.key];
                                update(
                                  {
                                    x: Math.min(780, Math.max(60, p.x + x)),
                                    y: Math.min(400, Math.max(65, p.y + y)),
                                  },
                                  i,
                                );
                              }
                              if (e.key.toLowerCase() === "r") {
                                e.preventDefault();
                                update({ angle: p.angle + 15 }, i);
                              }
                              if (e.key.toLowerCase() === "h") {
                                e.preventDefault();
                                update({ flipX: -p.flipX }, i);
                              }
                              if (e.key.toLowerCase() === "v") {
                                e.preventDefault();
                                update({ flipY: -p.flipY }, i);
                              }
                            }}
                            className={styles.movable}
                            data-testid={`shape-${i}`}
                            data-angle={poses[i].angle}
                            data-scale={poses[i].scale}
                            data-x={poses[i].x}
                            data-y={poses[i].y}
                            data-flip-x={poses[i].flipX}
                            data-flip-y={poses[i].flipY}
                          >
                            <polygon
                              points={path(transformed)}
                              fill={colours[i]}
                              fillOpacity={opacity}
                              stroke={colours[i]}
                              strokeWidth={active === i ? 4 : 2.5}
                              strokeDasharray={
                                i === 1 ? "10 4" : i === 2 ? "3 3" : undefined
                              }
                            />
                            <StepHighlights
                              step={highlightStep}
                              rightAngles={rightAngles}
                              source={points}
                              placed={transformed}
                            />
                            {showMarks &&
                              pair?.shapes.includes(selected[i]) && (
                                <ReasonMarks
                                  points={transformed}
                                  rows={visibleRows}
                                  member={pair.shapes.indexOf(selected[i])}
                                  reserved={markObstacles}
                                  showSideLabels={!sideLabels.length}
                                  onHide={hideMark}
                                  onMoveStart={(event) => startDrag(event, i)}
                                />
                              )}
                            {transformed.map((p, j) => {
                              const label = vertexLabels.get(
                                `${selected[i]}-${p.label}`,
                              );
                              return (
                                <g key={p.label}>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="4"
                                    fill={colours[i]}
                                  />
                                  {!pairedShapes.has(selected[i]) && (
                                    <text
                                      data-testid="vertex-name"
                                      x={label!.textX}
                                      y={label!.textY}
                                      textAnchor="middle"
                                      className={styles.vertexLabel}
                                      fill={colours[i]}
                                    >
                                      {p.label}
                                      {order ? (
                                        <tspan fontSize="13" dy="-9">
                                          {j + 1}
                                        </tspan>
                                      ) : null}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                            {active === i && (
                              <VertexHandles
                                points={transformed}
                                colour={colours[i]}
                                prefix={`shape-${i}`}
                                onStart={(event, point) =>
                                  startDrag(event, i, point)
                                }
                                pose={poses[i]}
                                onChange={(patch) =>
                                  update(
                                    fitPose(
                                      sets[i],
                                      { ...poses[i], ...patch },
                                      { x: 0, y: 0, width: 840, height: 470 },
                                      30,
                                      patch.scale === undefined,
                                    ),
                                    i,
                                  )
                                }
                              />
                            )}
                          </g>
                        );
                      })}
                    <PairedSideLabels
                      labels={sideLabels}
                      onHide={hideMark}
                      onMoveStart={(event) =>
                        startDrag(
                          event,
                          pair!.shapes.includes(selected[active])
                            ? active
                            : selected.indexOf(pair!.shapes[0]),
                        )
                      }
                    />
                    <PairedVertexLabels
                      groups={labelGroups}
                      shapes={placedShapes}
                      frame={view.frame}
                      showOrder={order}
                      obstacles={sideLabels}
                    />
                  </svg>
                  {showMarks &&
                    showLengths &&
                    pair?.shapes.every((i) => selected.includes(i)) && (
                      <ComparisonKey
                        question={question}
                        pair={pair}
                        visibleSides={visibleRows
                          .filter((r) => r.kind === "side")
                          .map((r) => r.id)}
                        hiddenSides={hiddenForPair}
                        showAngles={showAngles}
                      />
                    )}
                  <p className={styles.dragHint}>{c.dragHint}</p>
                  <div className={styles.controlPanel}>
                    <div className={styles.activeShapes}>
                      <span>{c.selected}</span>
                      {chosen.map((s, i) => (
                        <button
                          key={`${s.name}-${i}`}
                          onClick={() => setActive(i)}
                          aria-pressed={active === i}
                          aria-label={s.name}
                          style={{ color: colours[i] }}
                        >
                          <GeometryName>{s.name}</GeometryName>
                        </button>
                      ))}
                    </div>
                    {pose && (
                      <>
                        <div className={styles.tools}>
                          <button
                            onClick={() => update({ angle: pose.angle - 15 })}
                          >
                            {c.rotateLeft}
                          </button>
                          <button
                            onClick={() => update({ angle: pose.angle + 15 })}
                          >
                            {c.rotateRight}
                          </button>
                          <button
                            onClick={() => update({ angle: pose.angle + 90 })}
                          >
                            {c.quarterTurn}
                          </button>
                          <button
                            onClick={() => update({ flipX: -pose.flipX })}
                          >
                            {c.flipH}
                          </button>
                          <button
                            onClick={() => update({ flipY: -pose.flipY })}
                          >
                            {c.flipV}
                          </button>
                        </div>
                        <div className={styles.sliders}>
                          <label>
                            {c.angle} <output>{Math.round(pose.angle)}°</output>
                            <input
                              aria-label={c.angle}
                              type="range"
                              min="-360"
                              max="360"
                              value={((pose.angle + 360) % 720) - 360}
                              onChange={(e) =>
                                update({ angle: Number(e.target.value) })
                              }
                            />
                          </label>
                          <label>
                            {c.scale} <output>×{pose.scale.toFixed(2)}</output>
                            <input
                              aria-label={c.scale}
                              type="range"
                              min=".25"
                              max="3"
                              step=".05"
                              value={pose.scale}
                              onChange={(e) =>
                                update({ scale: Number(e.target.value) })
                              }
                            />
                          </label>
                          <label>
                            {c.opacity}{" "}
                            <output>{Math.round(opacity * 100)}%</output>
                            <input
                              aria-label={c.opacity}
                              type="range"
                              min=".05"
                              max=".75"
                              step=".05"
                              value={opacity}
                              onChange={(e) =>
                                setOpacity(Number(e.target.value))
                              }
                            />
                          </label>
                        </div>
                        <div className={styles.tools}>
                          <span>{c.move}</span>
                          <button
                            aria-label={c.left}
                            onClick={() => nudge(-15, 0)}
                          >
                            ←
                          </button>
                          <button
                            aria-label={c.up}
                            onClick={() => nudge(0, -15)}
                          >
                            ↑
                          </button>
                          <button
                            aria-label={c.down}
                            onClick={() => nudge(0, 15)}
                          >
                            ↓
                          </button>
                          <button
                            aria-label={c.right}
                            onClick={() => nudge(15, 0)}
                          >
                            →
                          </button>
                          <button
                            disabled={sets.length < 2}
                            onClick={() => setPoses(comparisonPoses(sets))}
                          >
                            {c.orient}
                          </button>
                          <button
                            disabled={sets.length < 2}
                            onClick={() => {
                              const next = comparisonPoses(sets, true);
                              setPoses(next);
                              fitComparison(next);
                            }}
                          >
                            {c.enlarge}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>
              {showReasons && (
                <ReasonsPanel
                  question={question}
                  pairs={pairs}
                  pairIndex={pairIndex}
                  onPair={(i) => {
                    setPairIndex(i);
                    setExploreMarks(true);
                    setReasonView(
                      pairs[i].criterion === "given" ? "both" : "proof",
                    );
                    setConditionFocus(null);
                    setFocusedStep(null);
                    setShowAngles(true);
                    setShowLengths(true);
                  }}
                  view={reasonView}
                  onView={(v) => {
                    setReasonView(v);
                    setExploreMarks(true);
                    setConditionFocus(null);
                    setFocusedStep(null);
                    setShowMarks(true);
                    setShowAngles(true);
                    setShowLengths(true);
                  }}
                  solution={solution}
                  visible={visibleSteps}
                  onVisible={setVisibleSteps}
                  onReset={() => {
                    setVisibleSteps(0);
                    setFocusedStep(null);
                    setExploreMarks(false);
                  }}
                  focus={focusedStep}
                  onFocus={focusSolution}
                  selected={selected}
                />
              )}
            </div>
          </div>
          <p className={styles.principle}>{c.rigid}</p>
          <div className={styles.correspondence}>
            <button onClick={() => setOrder(!order)} aria-expanded={order}>
              {order ? c.hideOrder : c.revealOrder}
            </button>
            <span>{c.comparisonHint}</span>
            {order && (
              <div className={styles.order}>
                <h3>{c.comparison}</h3>
                <p>{c.orderHint}</p>
                <div className={styles.tools}>
                  {chosen.map((s, i) => (
                    <span key={`${s.name}-${i}`} style={{ color: colours[i] }}>
                      <GeometryName>{s.name}</GeometryName>:{" "}
                      {s.vertices.map((v, j) => `${j + 1} ${v}`).join(" · ")}
                    </span>
                  ))}
                </div>
                <p>{c.transformNote}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className={styles.empty}>{c.noShape}</p>
      )}
      <details className={styles.source}>
        <summary>
          {c.source} · p. 8.{question.page}
        </summary>
        <Image
          unoptimized
          src={`/similarity/questions/${question.id}.webp`}
          alt={`${name(question)}, textbook page 8.${question.page}. ${question.prompt}`}
          width={1200}
          height={Math.round(
            (1200 * (question.crop[3] - question.crop[1]) * 1.32) /
              (question.crop[2] - question.crop[0]),
          )}
        />
        <p>{c.sourceCredit}</p>
      </details>
    </>
  );
}
