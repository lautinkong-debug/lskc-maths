import { copy } from "@/lib/copy";
import { birdFor, signed, type Move } from "../lib/moves";
import { button } from "./ui";

const c = copy.apps.directedNumbers.bird;
type Facing = "left" | "right";
type Step = "forward" | "backward" | "stay";

export function BirdGuide({
  start,
  end,
  move,
  hidden,
  complete,
  presenting,
  faceGuess,
  stepGuess,
  onFaceGuess,
  onStepGuess,
  onReveal,
  onExample,
}: {
  start: number;
  end: number;
  move: Move;
  hidden: boolean;
  complete: boolean;
  presenting: boolean;
  faceGuess: Facing | null;
  stepGuess: Step | null;
  onFaceGuess: (answer: Facing) => void;
  onStepGuess: (answer: Step) => void;
  onReveal: () => void;
  onExample: (index: number) => void;
}) {
  const bird = birdFor(move.op, move.b);
  const operation = move.op === "+" ? "+" : "−";
  const answer =
    bird.step === "forward"
      ? c.forward
      : bird.step === "backward"
        ? c.backward
        : c.stay;
  return (
    <section
      className="border-grid bg-paper min-w-0 rounded border p-4"
      aria-label={c.title}
    >
      <h3 className="font-display text-navy text-xl font-semibold">
        {c.title}
      </h3>
      <ol className={`mt-2 space-y-2 ${presenting ? "text-xl" : "text-base"}`}>
        <li>{c.start(signed(start))}</li>
        <li>
          {hidden ? c.facePending(operation) : c.face(operation, bird.facing)}
        </li>
        <li>
          {hidden
            ? c.stepPending(signed(move.b))
            : move.b === 0
              ? c.zeroStep
              : c.step(
                  signed(move.b),
                  bird.distance,
                  bird.step === "forward"
                    ? c.forward.toLowerCase()
                    : c.backward.toLowerCase(),
                )}
        </li>
      </ol>
      {hidden && !presenting && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="font-semibold">{c.faceQuestion}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["left", "right"] as Facing[]).map((value) => (
                <button
                  key={value}
                  className={`${button} ${faceGuess === value ? "border-navy bg-highlight/40" : ""}`}
                  aria-pressed={faceGuess === value}
                  onClick={() => onFaceGuess(value)}
                >
                  {value === "left" ? "←" : "→"}{" "}
                  {value === "left"
                    ? copy.apps.directedNumbers.left
                    : copy.apps.directedNumbers.right}
                </button>
              ))}
            </div>
            {faceGuess && (
              <p
                className={`mt-2 text-sm ${faceGuess === bird.facing ? "text-navy" : "text-crimson-deep"}`}
                role="status"
              >
                {faceGuess === bird.facing
                  ? c.faceCorrect
                  : c.faceWrong(operation, bird.facing)}
              </p>
            )}
          </div>
          <div>
            <p className="font-semibold">{c.stepQuestion}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["forward", "backward", "stay"] as Step[]).map((value) => (
                <button
                  key={value}
                  className={`${button} ${stepGuess === value ? "border-navy bg-highlight/40" : ""}`}
                  aria-pressed={stepGuess === value}
                  onClick={() => onStepGuess(value)}
                >
                  {value === "forward"
                    ? c.forward
                    : value === "backward"
                      ? c.backward
                      : c.stay}
                </button>
              ))}
            </div>
            {stepGuess && (
              <p
                className={`mt-2 text-sm ${stepGuess === bird.step ? "text-navy" : "text-crimson-deep"}`}
                role="status"
              >
                {stepGuess === bird.step
                  ? c.stepCorrect
                  : move.b === 0
                    ? c.zeroStepWrong
                    : c.stepWrong(signed(move.b), answer.toLowerCase())}
              </p>
            )}
          </div>
        </div>
      )}
      <p className="text-navy mt-3 font-semibold" aria-live="polite">
        {hidden
          ? c.wait
          : move.b === 0
            ? c.zeroLand(signed(end))
            : complete
              ? c.land(bird.travel, signed(end))
              : c.travelHint(bird.facing, bird.step, bird.travel)}
      </p>
      {!hidden && bird.distance > 10 && (
        <p className="text-pencil mt-2 text-sm">{c.longHop(bird.distance)}</p>
      )}
      {hidden && !presenting && (
        <button className={`${button} mt-3`} onClick={onReveal}>
          {copy.apps.directedNumbers.showMe}
        </button>
      )}
      {!presenting && (
        <div className="border-grid mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
          <span className="font-semibold">{c.examples}</span>
          <button className={button} onClick={() => onExample(0)}>
            {c.exampleOne}
          </button>
          <button className={button} onClick={() => onExample(1)}>
            {c.exampleTwo}
          </button>
        </div>
      )}
    </section>
  );
}
