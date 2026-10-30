"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Math as Maths } from "@/components/Math";
import { copy } from "@/lib/copy";
import { frames, termTex, type Frame } from "./animation";
import { equationTex } from "./engine";
import OperationScene from "./OperationScene";
import WorkingViewport from "./WorkingViewport";
import type { Question } from "./bank";
import styles from "./linear-equations.module.css";
const c = copy.linearEquations;
export function frameReason(f: Frame) {
  if (f.kind === "move") return c.animation.move(f.from!);
  if (f.kind === "distribute") return c.animation.distribute(f.factor!);
  if (f.kind === "denominators") return c.animation.denominators(f.factor!);
  if (f.kind === "cancel") return c.animation.cancel(f.factor!);
  if (f.kind === "divide") return c.animation.divide(f.factor!);
  return c.animation[f.kind];
}
export default function AnimatedLesson({
  question,
  children,
}: {
  question: Question;
  children: React.ReactNode;
}) {
  const sequence = useMemo(
    () => frames(question.equation, question.variable),
    [question],
  );
  const timeline = useMemo(
    () =>
      sequence.flatMap((f, frame) =>
        f.scene?.arrows.length
          ? [
              { frame, phase: "arrows" as const },
              { frame, phase: "result" as const },
            ]
          : [{ frame, phase: "result" as const }],
      ),
    [sequence],
  );
  const lesson = useRef<HTMLElement>(null);
  const checkDialog = useRef<HTMLDialogElement>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [paused, setPaused] = useState(false),
    [speed, setSpeed] = useState("normal"),
    [animate, setAnimate] = useState(true);
  const board = useRef<HTMLDivElement>(null),
    animations = useRef<Animation[]>([]),
    before = useRef<Record<string, DOMRect>>({});
  const autoplay = useRef(false),
    generation = useRef(0);
  const { frame: frameIndex, phase } = timeline[step];
  const active = sequence[frameIndex],
    last = step === timeline.length - 1;
  const activeScene =
    phase === "arrows" || active.kind === "cancel" ? active.scene : undefined;
  const split = Math.ceil(sequence.length / 2);
  function capture(index: number) {
    before.current = {};
    board.current
      ?.querySelectorAll<HTMLElement>(
        '[data-frame="' + index + '"] [data-token]',
      )
      .forEach((el) => {
        before.current[el.dataset.token!] = el.getBoundingClientRect();
      });
  }
  function cancel() {
    generation.current++;
    autoplay.current = false;
    animations.current.forEach((a) => a.cancel());
    animations.current = [];
    setBusy(false);
    setPaused(false);
  }
  function go(index: number, shouldAnimate = true) {
    if (step === 0 && matchMedia("(min-width: 900px)").matches)
      lesson.current?.scrollIntoView({ block: "start" });
    capture(frameIndex);
    setAnimate(shouldAnimate);
    setPaused(false);
    setBusy(shouldAnimate);
    setStep(index);
  }
  useLayoutEffect(() => {
    if (!animate || step === 0) return;
    const gen = ++generation.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 1 : speed === "slow" ? 3600 : 2200;
    const all: Animation[] = [];
    const scene = activeScene;
    const area = board.current;
    if (!area) return;
    const sceneArea = area.querySelector<HTMLElement>(
      "[data-active-operation]",
    );
    let total =
      active.kind === "move" ? duration : reduced ? 1 : duration * 0.5;
    if (scene && sceneArea) {
      const unit = reduced ? 1 : speed === "slow" ? 1400 : 850;
      total = reduced ? 1 : Math.max(1, scene.arrows.length) * unit + 700;
      scene.arrows.forEach((_, i) => {
        const path = sceneArea.querySelector<SVGPathElement>(
          '[data-arrow="' + i + '"]',
        );
        const from = sceneArea.querySelector<SVGRectElement>(
          '[data-source-highlight="' + i + '"]',
        );
        const to = sceneArea.querySelector<SVGRectElement>(
          '[data-target-highlight="' + i + '"]',
        );
        const product = sceneArea.querySelector<HTMLElement>(
          '[data-product="' + i + '"]',
        );
        if (path)
          all.push(
            path.animate(
              [
                { strokeDashoffset: 1, opacity: 0 },
                { strokeDashoffset: 1, opacity: 1, offset: 0.12 },
                { strokeDashoffset: 0, opacity: 1 },
              ],
              {
                duration: unit,
                delay: reduced ? 0 : i * unit,
                fill: "both",
                easing: "ease-in-out",
              },
            ),
          );
        const head = sceneArea.querySelector('[data-arrow-head="' + i + '"]');
        if (head)
          all.push(
            head.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: reduced ? 1 : 150,
              delay: reduced ? 0 : (i + 0.85) * unit,
              fill: "both",
            }),
          );
        if (from)
          all.push(
            from.animate(
              [{ opacity: 0 }, { opacity: 0.55, offset: 0.25 }, { opacity: 0 }],
              {
                duration: unit,
                delay: reduced ? 0 : i * unit,
                fill: "backwards",
              },
            ),
          );
        if (to)
          all.push(
            to.animate(
              [
                { opacity: 0 },
                { opacity: 0.45, offset: 0.85 },
                { opacity: 0.45 },
              ],
              { duration: unit, delay: reduced ? 0 : i * unit, fill: "both" },
            ),
          );
        if (product)
          all.push(
            product.animate(
              [
                { opacity: 0, transform: "translateY(-8px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: reduced ? 1 : 250,
                delay: reduced ? 0 : (i + 0.8) * unit,
                fill: "both",
              },
            ),
          );
      });
      if (active.kind === "cancel") {
        sceneArea.querySelectorAll<SVGElement>(".katex svg").forEach((el) =>
          all.push(
            el.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: reduced ? 1 : 900,
              fill: "both",
            }),
          ),
        );
      }
    }
    const current = area.querySelector<HTMLElement>(
      '[data-frame="' + frameIndex + '"]',
    );
    if (current && phase === "result" && active.kind !== "move")
      all.push(
        current.animate(
          [
            { opacity: 0, transform: "translateY(-10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: reduced ? 1 : 450, fill: "both" },
        ),
      );
    current?.querySelectorAll<HTMLElement>("[data-token]").forEach((el) => {
      const old = before.current[el.dataset.token!],
        now = el.getBoundingClientRect();
      if (old && active.kind === "move") {
        const dx = old.x - now.x,
          dy = old.y - now.y;
        all.push(
          el.animate(
            [
              { transform: "translate(" + dx + "px," + dy + "px)", offset: 0 },
              {
                transform: "translate(" + dx + "px," + dy + "px)",
                offset: 0.15,
              },
              {
                transform:
                  "translate(" +
                  dx / 2 +
                  "px," +
                  (dy / 2 - (active.moved === el.dataset.token ? 55 : 0)) +
                  "px)",
                offset: 0.5,
              },
              { transform: "translate(0,0)", offset: 0.85 },
              { transform: "translate(0,0)", offset: 1 },
            ],
            { duration, fill: "both", easing: "ease-in-out" },
          ),
        );
      }
      el.querySelectorAll<HTMLElement>("[data-old-sign]").forEach((child) =>
        all.push(
          child.animate(
            [
              { opacity: 1, offset: 0 },
              { opacity: 1, offset: 0.49 },
              { opacity: 0, offset: 0.5 },
              { opacity: 0, offset: 1 },
            ],
            { duration, fill: "both" },
          ),
        ),
      );
      el.querySelectorAll<HTMLElement>("[data-new-sign]").forEach((child) =>
        all.push(
          child.animate(
            [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.49 },
              { opacity: 1, offset: 0.5 },
              { opacity: 1, offset: 1 },
            ],
            { duration, fill: "both" },
          ),
        ),
      );
    });
    all.push(
      area.animate([{ opacity: 1 }, { opacity: 1 }], { duration: total }),
    );
    animations.current = all;
    Promise.all(all.map((a) => a.finished))
      .then(() => {
        if (generation.current !== gen) return;
        setBusy(false);
        setPaused(false);
        if (autoplay.current && step < timeline.length - 1) {
          // Wait for the completed result row to be painted before measuring its terms.
          requestAnimationFrame(() => {
            if (generation.current !== gen) return;
            // Arrow-only actions share an equation row; capture its frame index.
            capture(frameIndex);
            setBusy(true);
            setStep(step + 1);
          });
        }
      })
      .catch(() => {});
    return () => all.forEach((a) => a.cancel());
    // Timeline depends on the selected frame; speed changes apply to the next step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, sequence]);
  useEffect(
    () => () => {
      generation.current++;
      animations.current.forEach((a) => a.cancel());
    },
    [],
  );
  useLayoutEffect(() => {
    if (!busy && step > 0 && !matchMedia("(min-width: 900px)").matches)
      board.current
        ?.querySelector<HTMLElement>('[data-frame="' + frameIndex + '"]')
        ?.scrollIntoView({ block: "nearest" });
  }, [busy, step, frameIndex]);
  useEffect(() => {
    if (showCheck) checkDialog.current?.showModal();
  }, [showCheck]);
  function play() {
    if (busy) {
      animations.current.forEach((a) => (paused ? a.play() : a.pause()));
      setPaused(!paused);
      return;
    }
    autoplay.current = true;
    if (!last) go(step + 1);
  }
  const sceneIndex = activeScene ? frameIndex - 1 : -1;
  return (
    <section
      ref={lesson}
      className={styles.lesson}
      data-testid="equation-lesson"
    >
      <div className={styles.controls}>
        <button
          className={styles.primary}
          onClick={play}
          disabled={last && !busy}
        >
          {busy && !paused ? c.pause : c.play}
        </button>
        <button
          onClick={() => {
            cancel();
            go(Math.max(0, step - 1), false);
          }}
          disabled={!step}
        >
          {c.previousStep}
        </button>
        <button
          onClick={() => {
            autoplay.current = false;
            go(step + 1);
          }}
          disabled={last || busy}
        >
          {c.nextStep}
        </button>
        <button
          onClick={() => {
            cancel();
            go(0, false);
          }}
          disabled={!step}
        >
          {c.replay}
        </button>
        <label className={styles.speed}>
          {c.speed}
          <select
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            disabled={busy}
          >
            <option value="normal">{c.normal}</option>
            <option value="slow">{c.slow}</option>
          </select>
        </label>
        <span aria-live="polite">{c.stepCount(step, timeline.length - 1)}</span>
      </div>
      <div
        ref={board}
        className={styles.retainedBoard}
        data-testid="equation-animation"
        data-step={step}
        data-frame-index={frameIndex}
        data-phase={phase}
        data-busy={busy}
        data-paused={paused}
        data-kind={active.kind}
      >
        <div className={styles.stageHeading}>
          <span>{c.working}</span>
          <span className={styles.readingOrder}>{c.readingOrder}</span>
          <span>{c.equality}</span>
        </div>
        <WorkingViewport revision={step + "/" + busy}>
          {[0, 1].map((column) => (
            <ol
              key={column}
              className={styles.retainedSteps}
              aria-label={column ? c.rightWorking : c.leftWorking}
              data-column={column}
            >
              {sequence
                .slice(
                  column * split,
                  Math.min(
                    (column + 1) * split,
                    frameIndex + (phase === "arrows" ? 0 : 1),
                  ),
                )
                .map((f, offset) => {
                  const i = column * split + offset;
                  const waiting = i === frameIndex && busy && !!activeScene;
                  if (waiting) return null;
                  const drawing = i === sceneIndex && activeScene;
                  const prev = sequence[Math.max(0, i - 1)];
                  const cancelled =
                    sequence[i + 1]?.kind === "cancel" && i + 1 <= frameIndex
                      ? sequence[i + 1].scene
                      : undefined;
                  return (
                    <li
                      key={i}
                      data-frame={i}
                      data-current={
                        i === frameIndex ||
                        (phase === "arrows" && i === sceneIndex) ||
                        undefined
                      }
                      className={styles.retainedStep}
                    >
                      <p className={styles.rowReason}>
                        <span className={styles.rowNumber}>{i + 1}</span>
                        {frameReason(f)}
                      </p>
                      {cancelled ? (
                        <div data-active-operation={drawing || undefined}>
                          <OperationScene scene={cancelled} cancellation />
                        </div>
                      ) : drawing && active.kind === "distribute" ? (
                        <div data-active-operation>
                          <OperationScene scene={activeScene!} />
                        </div>
                      ) : f.left.length || f.right.length ? (
                        <div
                          className={styles.tokenEquation}
                          data-equation-row
                          role="math"
                          aria-label={equationTex(f.equation)}
                        >
                          {(["left", "right"] as const).map((side, j) => (
                            <div
                              key={side}
                              className={styles.equationSide}
                              data-side={side}
                            >
                              {j === 1 && (
                                <span
                                  className={styles.fixedEquals}
                                  aria-hidden="true"
                                >
                                  =
                                </span>
                              )}
                              {!f[side].length && <Maths>0</Maths>}
                              {f[side].map((t, k) => {
                                const old = [...prev.left, ...prev.right].find(
                                  (x) => x.id === t.id,
                                );
                                const moving =
                                  i === frameIndex &&
                                  phase === "result" &&
                                  f.moved === t.id &&
                                  animate;
                                const oldSide = prev.left.some(
                                  (x) => x.id === t.id,
                                )
                                  ? prev.left
                                  : prev.right;
                                return (
                                  <span
                                    key={t.id}
                                    data-token={t.id}
                                    data-moving={moving || undefined}
                                    className={styles.term}
                                  >
                                    {moving && old && (
                                      <span
                                        data-old-sign
                                        className={styles.oldTerm}
                                        aria-hidden="true"
                                      >
                                        <Maths>
                                          {termTex(
                                            old,
                                            question.variable,
                                            oldSide[0]?.id === t.id,
                                          )}
                                        </Maths>
                                      </span>
                                    )}
                                    <span
                                      data-new-sign={moving ? true : undefined}
                                    >
                                      <Maths>
                                        {termTex(t, question.variable, k === 0)}
                                      </Maths>
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.retainedMath} data-equation-row>
                          <Maths display>{equationTex(f.equation)}</Maths>
                        </div>
                      )}
                      {drawing &&
                        active.kind !== "distribute" &&
                        active.kind !== "cancel" && (
                          <div data-active-operation>
                            <OperationScene scene={active.scene!} />
                          </div>
                        )}
                    </li>
                  );
                })}
            </ol>
          ))}
        </WorkingViewport>
        <div className={styles.moveExplanation} aria-live="polite">
          <strong>
            {phase === "arrows" ? c.arrowsFirst : frameReason(active)}
          </strong>
          {active.kind === "move" && (
            <p>
              {c.animation.sameOperation} <Maths>{active.operation!}</Maths>
            </p>
          )}
          {active.kind === "divide" && <p>{c.animation.coefficient}</p>}
          {last && !busy && (
            <div className={styles.completed}>
              <strong>{c.verified}</strong>
              <button onClick={() => setShowCheck(true)}>{c.check}</button>
            </div>
          )}
        </div>
      </div>
      {showCheck && (
        <dialog
          ref={checkDialog}
          className={styles.checkDialog}
          onClose={() => setShowCheck(false)}
        >
          <button autoFocus onClick={() => checkDialog.current?.close()}>
            {c.closeCheck}
          </button>
          {children}
        </dialog>
      )}
    </section>
  );
}
