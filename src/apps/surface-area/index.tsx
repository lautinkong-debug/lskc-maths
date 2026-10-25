"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Math as Formula } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import Diagram, { needsLegend, OriginalPrism } from "./BankDiagram";
import { downloadDiagram } from "./export";
import { faces, givenFacts, teachingLines } from "./geometry";
import { questionName, questions, resolvePreset, sections } from "./bank";
import { shapeGroup, stepsFor } from "./lesson";
import { totalCalculation } from "./totalWorking";
import type { SurfaceQuestion, SurfaceVariant } from "./types";
import styles from "./surface-area.module.css";

const c = copy.surfaceArea;
const subscribe = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};
const snapshot = () => window.location.hash;
const serverSnapshot = () => "";
const subscribeCompact = (callback: () => void) => {
  const media = window.matchMedia("(max-width: 600px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const compactSnapshot = () => window.matchMedia("(max-width: 600px)").matches;
const wideSnapshot = () => false;
export default function SurfaceAreaStudio() {
  const hash = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const { question, variant } = resolvePreset(hash);
  return (
    <SurfaceLesson
      key={`${question.id}/${variant.id}`}
      question={question}
      variant={variant}
    />
  );
}
function SurfaceLesson({
  question,
  variant,
}: {
  question: SurfaceQuestion;
  variant: SurfaceVariant;
}) {
  const presenting = usePresentation();
  const compact = useSyncExternalStore(
    subscribeCompact,
    compactSnapshot,
    wideSnapshot,
  );
  const [section, setSection] = useState("");
  const [shape, setShape] = useState("");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState(0);
  const [unfold, setUnfold] = useState(0);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFaces, setShowFaces] = useState(true);
  const [showWorking, setShowWorking] = useState(false);
  const [showWaterDepth, setShowWaterDepth] = useState(false);
  const [showBasePerimeter, setShowBasePerimeter] = useState(false);
  const [showBaseArea, setShowBaseArea] = useState(false);
  const [showPerimeterWorking, setShowPerimeterWorking] = useState(false);
  const [showBaseAreaWorking, setShowBaseAreaWorking] = useState(false);
  const [showLateralWorking, setShowLateralWorking] = useState(false);
  const [showTotalWorking, setShowTotalWorking] = useState(false);
  const [totalWorkingLines, setTotalWorkingLines] = useState(1);
  const [showFinalAnswer, setShowFinalAnswer] = useState(false);
  const [clean, setClean] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [comparison, setComparison] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const exportSvg = useRef<SVGSVGElement>(null);
  const exitClean = useRef<HTMLButtonElement>(null);
  const cleanTrigger = useRef<HTMLButtonElement>(null);
  const geometry = variant.geometry;
  const steps = stepsFor(variant);
  const total = totalCalculation(variant, {
    revealBasePerimeter: showBasePerimeter,
    revealBaseArea: showBaseArea,
    revealWaterDepth: showWaterDepth,
  });
  const solved = showWorking && stage === 4 && showFinalAnswer;
  const visibleTotalLines = Math.min(totalWorkingLines, total.lines.length);
  const totalWorkingActive =
    (showTotalWorking && showDimensions) ||
    (showWorking && stage === 4 && !showFinalAnswer);
  const lessonLines =
    stage === 4 && !showFinalAnswer
      ? total.lines.slice(0, visibleTotalLines)
      : teachingLines(variant, stage);
  const shownQuestions = questions.filter(
    (q) =>
      (!section || q.section === section) &&
      (!shape || q.variants.some((v) => shapeGroup(v) === shape)) &&
      `${questionName(q)} ${q.prompt} ${q.variants.map((v) => v.label).join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const select = (qid: string, vid?: string) => {
    window.location.hash = `${qid}${vid ? `/${vid}` : ""}`;
  };
  useEffect(() => {
    if (!clean) return;
    const oldOverflow = document.body.style.overflow;
    const trigger = cleanTrigger.current;
    document.body.style.overflow = "hidden";
    exitClean.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setClean(false);
      if (e.key === "Tab") {
        e.preventDefault();
        exitClean.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", key);
      trigger?.focus();
    };
  }, [clean]);
  function go(next: number) {
    setStage(next);
    setUnfold(next >= 3 ? 1 : 0);
    setShowWorking(false);
    setSelectedFace(null);
    setStatus("");
  }
  function reset() {
    go(0);
    setZoom(100);
    setShowDimensions(true);
    setShowFaces(true);
    setShowWaterDepth(false);
    setShowBasePerimeter(false);
    setShowBaseArea(false);
    setShowPerimeterWorking(false);
    setShowBaseAreaWorking(false);
    setShowLateralWorking(false);
    setShowTotalWorking(false);
    setTotalWorkingLines(1);
    setShowFinalAnswer(false);
    setComparison(false);
  }
  async function save(format: "svg" | "png") {
    if (!exportSvg.current || busy) return;
    setBusy(true);
    setStatus(c.exporting);
    try {
      await downloadDiagram(
        exportSvg.current,
        format,
        `surface-area-${question.id}-${variant.id}-${comparison ? "comparison" : `step-${stage + 1}`}`,
      );
      setStatus(c.saved);
    } catch {
      setStatus(c.exportError);
    } finally {
      setBusy(false);
    }
  }
  const diagramProps = {
    question,
    variant,
    stage,
    unfold,
    selectedFace,
    showDimensions,
    showFaces,
    revealWaterDepth: showWaterDepth,
    revealBasePerimeter: showBasePerimeter,
    revealBaseArea: showBaseArea,
    showPerimeterWorking,
    showBaseAreaWorking,
    showLateralWorking,
    showTotalWorking,
    totalWorkingLines: visibleTotalLines,
    showFinalAnswer,
  };
  return (
    <div
      className={styles.studio}
      data-testid="surface-area-lesson"
      data-presenting={presenting || undefined}
      data-working={showWorking || undefined}
      data-preset={question.id}
      data-variant={variant.id}
    >
      <div className={styles.intro}>
        <div>
          <details className={styles.bank}>
            <summary>
              {c.bank} · {questionName(question)} <span>▾</span>
            </summary>
            <div className={styles.bankPanel}>
              <p>{c.bankCount}</p>
              <label htmlFor="surface-section">{c.sectionFilter}</label>
              <select
                id="surface-section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              >
                <option value="">{c.allSections}</option>
                {sections.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <label htmlFor="surface-shape">{c.shapeFilter}</label>
              <select
                id="surface-shape"
                value={shape}
                onChange={(e) => setShape(e.target.value)}
              >
                <option value="">{c.allShapes}</option>
                {Object.values(c.shapeGroups).map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
              <label htmlFor="surface-search">{c.search}</label>
              <input
                id="surface-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <label htmlFor="surface-question">{c.chooseQuestion}</label>
              <select
                id="surface-question"
                size={Math.min(8, Math.max(2, shownQuestions.length))}
                value={question.id}
                onChange={(e) => select(e.target.value)}
              >
                {shownQuestions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {questionName(q)} · p. 9.{q.page}
                  </option>
                ))}
              </select>
              {!shownQuestions.length && <p>{c.noMatches}</p>}
            </div>
          </details>
          <span className={styles.source}>
            {variant.label} · p. 9.{question.page}
          </span>
        </div>
        <button type="button" onClick={reset}>
          {c.reset}
        </button>
      </div>
      <div className={styles.questionControls}>
        <details>
          <summary>{c.questionPrompt}</summary>
          <p>{question.prompt}</p>
          {givenFacts(variant).map((fact) => (
            <p key={fact}>{fact}</p>
          ))}
          <p>{c.authoredWorking}</p>
          {question.id === "activity-9-3" && <p>{variant.note}</p>}
        </details>
        {question.variants.length > 1 && (
          <label>
            {c.chooseVariant}
            <select
              value={variant.id}
              onChange={(e) => select(question.id, e.target.value)}
            >
              {question.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <nav className={styles.steps} aria-label={c.title}>
        {steps.map((step, i) => (
          <button
            type="button"
            key={i}
            aria-current={stage === i ? "step" : undefined}
            onClick={() => go(i)}
          >
            <span>{i + 1}</span>
            {step.title}
          </button>
        ))}
      </nav>
      <div className={styles.navigation} data-testid="surface-navigation">
        <button
          className={styles.workingToggle}
          type="button"
          aria-pressed={showWorking}
          disabled={stage === 0}
          onClick={() => setShowWorking(!showWorking)}
        >
          {showWorking ? c.hideWorking : c.showWorking}
        </button>
        <button
          type="button"
          disabled={stage === 0}
          onClick={() => go(stage - 1)}
        >
          {c.previous}
        </button>
        <span className={styles.stepNumber}>{stage + 1} / 5</span>
        <button
          type="button"
          className={styles.primary}
          disabled={stage === 4}
          onClick={() => go(stage + 1)}
        >
          {c.next}
        </button>
      </div>
      <div className={styles.workspace}>
        <div className={styles.boardColumn}>
          <div className={styles.boardTools}>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => setShowDimensions(e.target.checked)}
                />
                {c.dimensions}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showFaces}
                  onChange={(e) => setShowFaces(e.target.checked)}
                />
                {c.faceLabels}
              </label>
              {geometry.kind === "prism" && geometry.water && (
                <label>
                  <input
                    type="checkbox"
                    checked={showWaterDepth}
                    disabled={!showDimensions}
                    onChange={(e) => setShowWaterDepth(e.target.checked)}
                  />
                  {variant.target === "increase"
                    ? c.showWaterRise
                    : c.showWaterDepth}
                </label>
              )}
              {geometry.kind === "prism" && (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={showBasePerimeter}
                      disabled={!showDimensions}
                      onChange={(e) => setShowBasePerimeter(e.target.checked)}
                    />
                    {c.showBasePerimeter}
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showBaseArea}
                      disabled={!showDimensions}
                      onChange={(e) => setShowBaseArea(e.target.checked)}
                    />
                    {c.showBaseArea}
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showPerimeterWorking}
                      disabled={!showDimensions}
                      onChange={(e) =>
                        setShowPerimeterWorking(e.target.checked)
                      }
                    />
                    {c.showPerimeterWorking}
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showBaseAreaWorking}
                      disabled={!showDimensions}
                      onChange={(e) => setShowBaseAreaWorking(e.target.checked)}
                    />
                    {c.showBaseAreaWorking}
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showLateralWorking}
                      disabled={!showDimensions}
                      onChange={(e) => setShowLateralWorking(e.target.checked)}
                    />
                    {c.showLateralWorking}
                  </label>
                </>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={showTotalWorking}
                  disabled={!showDimensions}
                  onChange={(e) => setShowTotalWorking(e.target.checked)}
                />
                {total.toggle}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showFinalAnswer}
                  onChange={(e) => setShowFinalAnswer(e.target.checked)}
                />
                {c.showFinalAnswer}
              </label>
            </div>
            <button
              ref={cleanTrigger}
              type="button"
              onClick={() => setClean(true)}
            >
              {c.clean}
            </button>
          </div>
          <div
            className={styles.lineControls}
            data-testid="total-line-controls"
          >
            <div>
              <strong>{total.title}</strong>
              <span role="status" aria-live="polite">
                {c.workingLineProgress(
                  totalWorkingActive ? visibleTotalLines : 0,
                  total.lines.length,
                )}
              </span>
            </div>
            <button
              type="button"
              disabled={!totalWorkingActive || visibleTotalLines <= 1}
              onClick={() => setTotalWorkingLines(visibleTotalLines - 1)}
            >
              {c.previousWorkingLine}
            </button>
            <button
              type="button"
              className={styles.primary}
              disabled={
                !totalWorkingActive || visibleTotalLines >= total.lines.length
              }
              onClick={() => setTotalWorkingLines(visibleTotalLines + 1)}
            >
              {c.nextWorkingLine}
            </button>
          </div>
          <div className={styles.unfold} data-enabled={stage === 2}>
            <label htmlFor="surface-unfold">
              {geometry.kind === "cubes" ? c.separateCubes : c.unfold}
              <strong>{Math.round(unfold * 100)}%</strong>
            </label>
            <input
              id="surface-unfold"
              type="range"
              min="0"
              max="100"
              value={Math.round(unfold * 100)}
              disabled={stage !== 2}
              onChange={(e) => setUnfold(Number(e.target.value) / 100)}
            />
            <div>
              <button
                type="button"
                disabled={stage !== 2}
                onClick={() => setUnfold(0)}
              >
                {c.folded}
              </button>
              <button
                type="button"
                disabled={stage !== 2}
                onClick={() => setUnfold(1)}
              >
                {c.flat}
              </button>
            </div>
          </div>
          <div className={styles.viewport} data-testid="surface-viewport">
            <div
              style={{
                width: `${zoom}%`,
                height: `${zoom}%`,
                minWidth: "100%",
              }}
            >
              <Diagram
                {...diagramProps}
                compact={compact}
                revealDimensions={solved}
                onSelectFace={setSelectedFace}
              />
            </div>
          </div>
          <div className={styles.zoom}>
            <label htmlFor="surface-zoom">{c.zoom}</label>
            <input
              id="surface-zoom"
              type="range"
              min="100"
              max="180"
              step="10"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <span>{zoom}%</span>
            <button type="button" onClick={() => setZoom(100)}>
              {c.fit}
            </button>
          </div>
          <div className={styles.faces} aria-label={c.selectFace}>
            {faces(variant, solved).map((face, i) => (
              <button
                type="button"
                key={i}
                aria-pressed={selectedFace === i}
                onClick={() => setSelectedFace(selectedFace === i ? null : i)}
              >
                <span>{i + 1}</span>
                {face.name}
                {showDimensions && face.label ? ` = ${face.label}` : ""}
                {face.omitted ? " ×" : ""}
              </button>
            ))}
          </div>
          <div
            className={styles.diagramNotes}
            data-testid="surface-annotations"
          >
            {showDimensions && needsLegend(variant) && (
              <p>
                {faces(variant, solved)
                  .filter((face) => face.label)
                  .map(
                    (face) =>
                      `${face.index + 1}: ${face.label}${face.omitted ? ` (${c.opening})` : ""}`,
                  )
                  .join(" · ")}
              </p>
            )}
            {givenFacts(variant).map((fact) => (
              <p key={fact}>{fact}</p>
            ))}
            {geometry.kind === "prism" && geometry.schematic && (
              <p>{c.schematic}</p>
            )}
            {question.id === "activity-9-3" && <p>{c.illustrative}</p>}
          </div>
        </div>
        <div className={styles.rail}>
          <figure className={styles.reference} data-testid="surface-reference">
            <figcaption>
              {geometry.kind === "cubes" ? c.originalSolid : c.original}
            </figcaption>
            <OriginalPrism
              {...diagramProps}
              solved={solved}
              onSelectFace={setSelectedFace}
            />
          </figure>
          <div className={styles.explanation} aria-live="polite">
            <span className={styles.stepNumber}>{stage + 1} / 5</span>
            <h2>{steps[stage].title}</h2>
            <p>{steps[stage].hint}</p>
            <blockquote>{steps[stage].prompt}</blockquote>
            {showWorking && (
              <div className={styles.working} data-testid="surface-working">
                <Formula display>
                  {geometry.kind === "cubes"
                    ? "A=\\sum 6s^2-2\\sum A_{\\text{contact}}"
                    : stage === 4 && variant.quantity
                      ? `A=${variant.quantity}(PH+2B)`
                      : geometry.omittedEdges?.length
                        ? "A=H\\sum w_{\\text{retained}}+nB"
                        : stage < 4
                          ? stage < 3
                            ? "P=\\text{sum of boundary lengths}"
                            : "A_{\\text{lateral}}=PH"
                          : geometry.baseCount
                            ? geometry.baseCount === 1
                              ? "A=PH+B"
                              : "A=PH+2B"
                            : "A=PH"}
                </Formula>
                <ol>
                  {lessonLines.map((line, i) => (
                    <li key={`${i}-${line}`}>{line}</li>
                  ))}
                </ol>
                {stage === 4 && showFinalAnswer && (
                  <>
                    <p className={styles.answer}>{variant.answer}</p>
                    {variant.note && (
                      <p className={styles.teachingNote}>{variant.note}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className={styles.export}>
            <h3>{c.export}</h3>
            <label htmlFor="surface-export-view">{c.exportView}</label>
            <select
              id="surface-export-view"
              value={comparison ? "comparison" : "current"}
              onChange={(e) => setComparison(e.target.value === "comparison")}
            >
              <option value="current">{c.current}</option>
              <option value="comparison">{c.beforeAfter}</option>
            </select>
            <div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void save("png")}
              >
                {c.png}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void save("svg")}
              >
                {c.svg}
              </button>
            </div>
            <p>{c.exportHint}</p>
            <p role="status">{status}</p>
          </div>
        </div>
      </div>
      <div hidden aria-hidden="true">
        <Diagram
          {...diagramProps}
          comparison={comparison}
          showWorking={showWorking}
          svgRef={exportSvg}
        />
      </div>
      {clean && (
        <div
          className={styles.clean}
          role="dialog"
          aria-modal="true"
          aria-label={c.clean}
        >
          <button ref={exitClean} type="button" onClick={() => setClean(false)}>
            {c.exitClean}
          </button>
          <div>
            <Diagram {...diagramProps} showWorking={showWorking} />
          </div>
        </div>
      )}
    </div>
  );
}
