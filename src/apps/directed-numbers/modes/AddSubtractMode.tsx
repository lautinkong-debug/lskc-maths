import { useState, type KeyboardEvent } from "react";
import { Math as Tex } from "@/components/Math";
import { usePresentation } from "@/components/PresentationFrame";
import { copy } from "@/lib/copy";
import { NumberLine, type Skin } from "../components/NumberLine";
import { Working } from "../components/Working";
import { RuleCard } from "../components/RuleCard";
import { ExpressionInput } from "../components/ExpressionInput";
import { StepControls } from "../components/StepControls";
import { BirdGuide } from "../components/BirdGuide";
import { usePrediction } from "../components/usePrediction";
import { button, primary, field } from "../components/ui";
import {
  hops,
  journeyHops,
  journeyText,
  moveFor,
  birdFor,
  parseJourney,
  signed,
  type Direction,
  type Journey,
  type Operation,
} from "../lib/moves";
import { parseAnswer } from "../lib/parse";
import { equals, rational } from "../lib/rational";
const c = copy.apps.directedNumbers;
const initial: Journey = { start: -3, moves: [{ op: "+", b: 5 }] };
const examples: Journey[] = [
  initial,
  { start: 3, moves: [{ op: "-", b: -5 }] },
  { start: -4, moves: [{ op: "+", b: -2 }] },
  { start: 5, moves: [{ op: "-", b: 9 }] },
  { start: -6, moves: [{ op: "+", b: 14 }] },
  { start: 4, moves: [{ op: "-", b: 0 }] },
];
function initialJourney(expression?: string) {
  const parsed = expression ? parseJourney(expression) : null;
  return parsed?.ok ? parsed.value : initial;
}
export default function AddSubtractMode({
  initialExpression,
}: {
  initialExpression?: string;
}) {
  const presenting = usePresentation();
  const [journey, setJourney] = useState(() =>
    initialJourney(initialExpression),
  );
  const [input, setInput] = useState(initialExpression ?? journeyText(initial));
  const [predict, setPreference] = usePrediction(presenting);
  const [moveIndex, setMoveIndex] = useState(0),
    [step, setStep] = useState(0),
    [revealed, setRevealed] = useState(false);
  const [skin, setSkin] = useState<Skin>("plain"),
    [showBird, setShowBird] = useState(true),
    [same, setSame] = useState(false),
    [think, setThink] = useState(false);
  const [example, setExample] = useState(0),
    [before, setBefore] = useState<string | null>(null);
  const [a, setA] = useState(String(journey.start)),
    [b, setB] = useState(String(journey.moves[0].b)),
    [op, setOp] = useState<Operation>(journey.moves[0].op);
  const [builderError, setBuilderError] = useState(false);
  const [direction, setDirection] = useState<Direction | null>(null),
    [faceGuess, setFaceGuess] = useState<"left" | "right" | null>(null),
    [stepGuess, setStepGuess] = useState<
      "forward" | "backward" | "stay" | null
    >(null),
    [distance, setDistance] = useState(""),
    [landing, setLanding] = useState("");
  const [distanceNote, setDistanceNote] = useState(""),
    [landingNote, setLandingNote] = useState(""),
    [landingCorrect, setLandingCorrect] = useState(false);
  const move = journey.moves[moveIndex];
  const start = journey.moves
    .slice(0, moveIndex)
    .reduce(
      (value, item) => value + (item.op === "+" ? item.b : -item.b),
      journey.start,
    );
  const frames = hops(start, move.op, move.b),
    total = journeyHops(journey).length;
  const earlierFrames = journey.moves
    .slice(0, moveIndex)
    .reduce((count, item) => count + hops(0, item.op, item.b).length, 0);
  const position = earlierFrames + step,
    hidden = predict && !revealed;
  const rule = moveFor(move.op, move.b),
    end = frames.at(-1)!.to;
  const complete = step === frames.length;
  const current = step ? frames[step - 1].to : start;
  const horizontalHint =
    move.b === 0
      ? c.directionZero
      : move.op === "+"
        ? move.b < 0
          ? c.addNegative
          : c.addPositive
        : move.b < 0
          ? c.subtractNegative
          : c.subtractPositive;
  const hint =
    skin === "plain" ? horizontalHint : c.verticalHint(horizontalHint);
  const bird = birdFor(move.op, move.b);
  const birdDirectionHint =
    move.b === 0
      ? c.bird.zero
      : c.bird.travelHint(bird.facing, bird.step, bird.travel);
  const horizontalSentence =
    move.b === 0
      ? c.zeroSentence(signed(start))
      : c.sentence(
          signed(start),
          move.op === "+" ? c.adding : c.subtracting,
          signed(move.b),
          rule.distance,
          c[rule.direction].toLowerCase(),
          signed(end),
        );
  const fullSentence =
    skin === "lift" && move.b !== 0
      ? c.liftSentence(
          c.floor(start),
          rule.distance,
          rule.direction === "right",
          c.floor(end),
        )
      : skin === "thermometer" && move.b !== 0
        ? c.temperatureSentence(
            signed(start),
            rule.distance,
            rule.direction === "right",
            signed(end),
          )
        : horizontalSentence;
  const sentence = hidden
    ? c.waiting(signed(start))
    : complete
      ? fullSentence
      : c.partial(signed(start), signed(current), step);
  const equivalent: Journey = {
    start,
    moves: [{ op: move.op === "+" ? "-" : "+", b: -move.b }],
  };
  const movementArrow =
    rule.direction === "left"
      ? skin === "plain"
        ? "←"
        : "↓"
      : rule.direction === "right"
        ? skin === "plain"
          ? "→"
          : "↑"
        : "•";
  function clearAnswers() {
    setDirection(null);
    setFaceGuess(null);
    setStepGuess(null);
    setDistance("");
    setLanding("");
    setDistanceNote("");
    setLandingNote("");
    setLandingCorrect(false);
  }
  function load(next: Journey, old: string | null = null) {
    setJourney(next);
    setInput(journeyText(next));
    setMoveIndex(0);
    setStep(0);
    setRevealed(false);
    clearAnswers();
    setBefore(old);
    setA(String(next.start));
    setOp(next.moves[0].op);
    setB(String(next.moves[0].b));
    setBuilderError(false);
  }
  function next() {
    if (hidden) {
      setRevealed(true);
      return;
    }
    if (!complete) {
      setStep(step + 1);
      return;
    }
    if (moveIndex < journey.moves.length - 1) {
      setMoveIndex(moveIndex + 1);
      setStep(0);
      setRevealed(false);
      clearAnswers();
    }
  }
  function back() {
    if (step > 0) setStep(step - 1);
    else if (moveIndex > 0) {
      const previous = journey.moves[moveIndex - 1];
      setMoveIndex(moveIndex - 1);
      setStep(hops(0, previous.op, previous.b).length);
      setRevealed(true);
      clearAnswers();
    } else setRevealed(false);
  }
  function newExample() {
    const index = (example + 1) % examples.length;
    setExample(index);
    load(examples[index]);
  }
  function togglePrediction() {
    const nextValue = !predict;
    setPreference(nextValue);
    setRevealed(false);
    setStep(0);
    clearAnswers();
  }
  function key(event: KeyboardEvent<HTMLElement>) {
    if (
      !presenting ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target instanceof HTMLElement &&
        event.target.closest(
          "input, select, textarea, button, a, summary, [contenteditable]",
        ))
    )
      return;
    const actions: Record<string, () => void> = {
      ArrowRight: next,
      PageDown: next,
      " ": next,
      ArrowLeft: back,
      PageUp: back,
      r: () => setRevealed(true),
      R: () => setRevealed(true),
      n: newExample,
      N: newExample,
      p: togglePrediction,
      P: togglePrediction,
    };
    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  }
  function applyBuilder() {
    if (
      !/^[+-]?\d+$/.test(a) ||
      !/^[+-]?\d+$/.test(b) ||
      Math.abs(Number(a)) > 20 ||
      Math.abs(Number(b)) > 20
    ) {
      setBuilderError(true);
      return;
    }
    load({ start: Number(a), moves: [{ op, b: Number(b) }] });
  }
  function checkLanding() {
    const answer = parseAnswer(landing);
    const correct = answer.ok && equals(answer.value, rational(end));
    setLandingCorrect(correct);
    setLandingNote(
      !answer.ok
        ? answer.message
        : correct
          ? c.correctLanding
          : `${c.wrongLanding} ${hint}`,
    );
  }
  function showMe() {
    setRevealed(true);
    setStep(frames.length);
    setLandingNote(fullSentence);
  }
  function similar() {
    const bounded = Math.max(-20, Math.min(20, start));
    const offset = bounded < 19 ? 1 : -1;
    load({ start: bounded + offset, moves: [{ ...move }] });
  }
  return (
    <section
      tabIndex={0}
      onKeyDown={key}
      aria-label={c.lesson}
      className="min-w-0 space-y-5"
    >
      {!presenting && <p className="text-pencil max-w-3xl">{c.intro}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex min-h-12 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            checked={predict}
            onChange={togglePrediction}
            className="accent-navy h-5 w-5"
          />
          {c.predict}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          {c.skin}
          <select
            className={field}
            value={skin}
            onChange={(event) => setSkin(event.target.value as Skin)}
          >
            <option value="plain">{c.plain}</option>
            <option value="thermometer">{c.thermometer}</option>
            <option value="lift">{c.lift}</option>
          </select>
        </label>
        <label className="inline-flex min-h-12 items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={showBird}
            disabled={skin !== "plain"}
            onChange={(event) => setShowBird(event.target.checked)}
            className="accent-navy h-5 w-5"
          />
          {c.bird.toggle}
        </label>
        {journey.moves.length > 1 && (
          <span className="text-navy font-semibold">
            {c.journeyProgress(moveIndex + 1, journey.moves.length)}
          </span>
        )}
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-4">
          <NumberLine
            journey={journey}
            position={position}
            active={moveIndex}
            skin={skin}
            sentence={sentence}
            presenting={presenting}
            bird={
              showBird && skin === "plain" && (!hidden || faceGuess !== null)
            }
          />
          {showBird && skin === "plain" && (
            <BirdGuide
              start={start}
              end={end}
              move={move}
              hidden={hidden}
              complete={complete}
              presenting={presenting}
              faceGuess={faceGuess}
              stepGuess={stepGuess}
              onFaceGuess={setFaceGuess}
              onStepGuess={setStepGuess}
              onReveal={() => setRevealed(true)}
              onExample={(index) =>
                load(
                  index === 0
                    ? { start: 3, moves: [{ op: "+", b: -7 }] }
                    : { start: -2, moves: [{ op: "-", b: -4 }] },
                )
              }
            />
          )}
          <p
            aria-live="polite"
            className={`border-navy border-l-4 pl-4 font-medium ${presenting ? "text-2xl" : "text-lg"}`}
          >
            {sentence}
          </p>
          {!hidden && !presenting && <p className="text-navy">{hint}</p>}
          {same && !hidden && (
            <div className="border-grid bg-navy-wash rounded border p-4">
              <p className="text-sm">{c.sameExplanation}</p>
              <div
                className={`mt-2 overflow-x-auto ${presenting ? "grid grid-cols-2 gap-4 text-3xl" : "space-y-2 text-xl"}`}
              >
                <div>
                  <Tex className="block">
                    {journeyText({ start, moves: [move] }).replaceAll("−", "-")}
                  </Tex>
                  <p className="text-base font-semibold">
                    {movementArrow} {rule.distance} {c.units}
                  </p>
                </div>
                <div>
                  <Tex className="mt-2 block">
                    {journeyText(equivalent).replaceAll("−", "-")}
                  </Tex>
                  <p className="mt-2 font-semibold">
                    {movementArrow} {rule.distance} {c.units}
                  </p>
                </div>
              </div>
            </div>
          )}
          {predict && !presenting && (
            <div className="border-grid bg-paper rounded border p-4">
              <h3 className="font-display text-navy text-xl font-semibold">
                {c.build}
              </h3>
              <p className="mt-3 font-semibold">{c.directionQuestion}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["left", "right", "none"] as Direction[]).map((value) => (
                  <button
                    key={value}
                    className={`${button} ${direction === value ? "border-navy bg-highlight/40" : ""}`}
                    aria-pressed={direction === value}
                    onClick={() => {
                      setDirection(value);
                      if (value === rule.direction) setRevealed(true);
                    }}
                  >
                    {value === "left"
                      ? skin === "plain"
                        ? "← "
                        : "↓ "
                      : value === "right"
                        ? skin === "plain"
                          ? "→ "
                          : "↑ "
                        : ""}
                    {skin === "plain" || value === "none"
                      ? c[value]
                      : value === "left"
                        ? c.down
                        : c.up}
                  </button>
                ))}
              </div>
              {direction && (
                <p
                  role="status"
                  className={`mt-3 ${direction === rule.direction ? "text-navy" : "text-crimson-deep"}`}
                >
                  {direction === rule.direction
                    ? c.directionRight
                    : showBird && skin === "plain"
                      ? birdDirectionHint
                      : hint}
                </p>
              )}
              {!hidden && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const answer = parseAnswer(distance);
                      setDistanceNote(
                        answer.ok &&
                          equals(answer.value, rational(rule.distance))
                          ? c.distanceRight
                          : c.distanceHint(rule.distance),
                      );
                    }}
                  >
                    <label
                      htmlFor="dn-distance"
                      className="block text-sm font-semibold"
                    >
                      {c.distanceQuestion}
                    </label>
                    <input
                      id="dn-distance"
                      className={field}
                      inputMode="numeric"
                      value={distance}
                      onChange={(event) => setDistance(event.target.value)}
                    />
                    <button className={`${button} mt-2`} type="submit">
                      {c.check}
                    </button>
                    {distanceNote && (
                      <p role="status" className="mt-2 text-sm">
                        {distanceNote}
                      </p>
                    )}
                  </form>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      checkLanding();
                    }}
                  >
                    <label
                      htmlFor="dn-landing"
                      className="block text-sm font-semibold"
                    >
                      {c.landingQuestion}
                    </label>
                    <input
                      id="dn-landing"
                      className={field}
                      value={landing}
                      onChange={(event) => setLanding(event.target.value)}
                    />
                    <button className={`${button} mt-2`} type="submit">
                      {c.check}
                    </button>
                  </form>
                </div>
              )}
              {landingNote && (
                <div
                  className={`mt-4 border-l-4 pl-3 ${landingCorrect ? "border-navy text-navy" : "border-crimson text-crimson-deep"}`}
                >
                  <p role="status">{landingNote}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className={button} onClick={showMe}>
                      {c.showMe}
                    </button>
                    <button
                      className={button}
                      onClick={() => {
                        setStep(0);
                        setLanding("");
                        setLandingNote("");
                      }}
                    >
                      {c.retry}
                    </button>
                    <button className={button} onClick={similar}>
                      {c.similar}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-4">
          <Working
            journey={journey}
            completedMoves={moveIndex + (complete ? 1 : 0)}
            active={moveIndex}
            presenting={presenting}
          />
          <RuleCard
            move={move}
            revealed={!hidden}
            vertical={skin !== "plain"}
            presenting={presenting}
          />
          <label className="flex min-h-12 items-center gap-3">
            <input
              type="checkbox"
              className="accent-navy h-5 w-5"
              checked={same}
              onChange={(event) => setSame(event.target.checked)}
            />
            {c.sameMove}
          </label>
          {!presenting && (
            <details className="border-grid rounded border p-4">
              <summary className="text-navy cursor-pointer font-semibold">
                {c.change}
              </summary>
              <p className="mt-3 text-sm">{c.changeHelp}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className={button}
                  onClick={() =>
                    load(
                      {
                        start,
                        moves: [{ op: move.op === "+" ? "-" : "+", b: move.b }],
                      },
                      journeyText({ start, moves: [move] }),
                    )
                  }
                >
                  {c.flipOperation}
                </button>
                <button
                  className={button}
                  onClick={() =>
                    load(
                      { start, moves: [{ op: move.op, b: -move.b }] },
                      journeyText({ start, moves: [move] }),
                    )
                  }
                >
                  {c.flipSign}
                </button>
              </div>
              {before && (
                <div className="mt-3 overflow-x-auto text-sm">
                  <p>
                    {c.before}: {before}
                  </p>
                  <p>
                    {c.after}: {journeyText(journey)}
                  </p>
                </div>
              )}
            </details>
          )}
        </div>
      </div>
      <div className="border-grid space-y-4 border-t pt-5">
        <StepControls
          position={position}
          total={total}
          hidden={hidden}
          onNext={next}
          onBack={back}
          onReset={() => load(journey)}
          onNew={newExample}
        />
        <ExpressionInput
          value={input}
          onChange={setInput}
          onLoad={load}
          presenting={presenting}
        />
        {!presenting && (
          <details className="border-grid rounded border p-4">
            <summary className="text-navy cursor-pointer font-semibold">
              {c.apply}
            </summary>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                applyBuilder();
              }}
              className="mt-3 grid items-end gap-3 sm:grid-cols-4"
            >
              <label className="min-w-0 text-sm font-semibold">
                {c.start}
                <input
                  className={field}
                  type="number"
                  min="-20"
                  max="20"
                  step="1"
                  value={a}
                  onChange={(event) => setA(event.target.value)}
                />
              </label>
              <label className="min-w-0 text-sm font-semibold">
                {c.operation}
                <select
                  className={field}
                  value={op}
                  onChange={(event) => setOp(event.target.value as Operation)}
                >
                  <option value="+">+</option>
                  <option value="-">−</option>
                </select>
              </label>
              <label className="min-w-0 text-sm font-semibold">
                {c.amount}
                <input
                  className={field}
                  type="number"
                  min="-20"
                  max="20"
                  step="1"
                  value={b}
                  onChange={(event) => setB(event.target.value)}
                />
              </label>
              <button className={primary} type="submit">
                {c.apply}
              </button>
            </form>
            {builderError && (
              <p role="alert" className="text-crimson-deep mt-3">
                {c.errors.journey}
              </p>
            )}
            <button
              className={`${button} mt-3`}
              onClick={() =>
                load({
                  start: 0,
                  moves: [
                    { op: "+", b: 9 },
                    { op: "+", b: -11 },
                    { op: "+", b: 6 },
                  ],
                })
              }
            >
              {c.chain}
            </button>
          </details>
        )}
      </div>
      <details className="border-grid border-t pt-4">
        <summary className="text-navy cursor-pointer font-semibold">
          {c.think}
        </summary>
        <p className="mt-3">{c.thinkQuestion}</p>
        <button className={`${button} mt-3`} onClick={() => setThink(!think)}>
          {think ? c.hideAnswer : c.revealAnswer}
        </button>
        {think && <p className="mt-3">{c.thinkAnswer}</p>}
      </details>
      <div className="flex flex-wrap gap-3">
        <a className={button} href="#brackets">
          {c.nextTopic} →
        </a>
        <a className={button} href="#play">
          {c.matchingWorld} →
        </a>
        <details className="p-2 text-sm">
          <summary className="text-navy cursor-pointer">{c.keys}</summary>
          <p className="mt-2 max-w-xl">{c.keyHelp}</p>
        </details>
      </div>
    </section>
  );
}
