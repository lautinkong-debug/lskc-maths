import { copy } from "@/lib/copy";
import { birdFor, signed, type Move } from "../lib/moves";
import { button } from "./ui";

const c = copy.apps.directedNumbers.bird;
type Facing = "left" | "right";

export function BirdGuide({
  start,
  end,
  move,
  turnStage,
  hidden,
  complete,
  presenting,
  firstGuess,
  secondGuess,
  onFirstGuess,
  onSecondGuess,
  onAdvanceTurn,
  onReveal,
  onExample,
}: {
  start: number;
  end: number;
  move: Move;
  turnStage: number;
  hidden: boolean;
  complete: boolean;
  presenting: boolean;
  firstGuess: Facing | null;
  secondGuess: Facing | null;
  onFirstGuess: (answer: Facing) => void;
  onSecondGuess: (answer: Facing) => void;
  onAdvanceTurn: () => void;
  onReveal: () => void;
  onExample: (index: number) => void;
}) {
  const bird = birdFor(move.op, move.b);
  const operation = move.op === "+" ? "+" : "−";
  const number = signed(move.b);
  const wrongGuess = turnStage === 0 ? firstGuess : secondGuess;
  return (
    <section
      className="border-grid bg-paper min-w-0 rounded border p-4"
      aria-label={c.title}
    >
      <h3 className="font-display text-navy text-xl font-semibold">
        {c.title}
      </h3>
      <p className={presenting ? "sr-only" : "text-pencil mt-2"}>
        {c.startNote}
      </p>
      <ol className={`mt-2 space-y-2 ${presenting ? "text-xl" : "text-base"}`}>
        <li>{c.start(signed(start))}</li>
        <li>
          {turnStage >= 1
            ? c.first(operation, bird.operationTurn, bird.afterOperation)
            : c.firstPending(operation)}
        </li>
        <li>
          {turnStage >= 2
            ? c.second(number, bird.numberTurn, bird.operationTurn, bird.facing)
            : c.secondPending(number)}
        </li>
        <li>
          {turnStage >= 2
            ? bird.distance === 0
              ? c.zeroStep
              : c.walk(bird.distance)
            : c.walkPending}
        </li>
      </ol>
      {hidden && !presenting && turnStage < 2 && (
        <div className="mt-3">
          <p className="font-semibold">
            {turnStage === 0 ? c.firstQuestion : c.secondQuestion}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["left", "right"] as Facing[]).map((value) => (
              <button
                key={value}
                className={`${button} ${wrongGuess === value ? "border-navy bg-highlight/40" : ""}`}
                aria-pressed={wrongGuess === value}
                onClick={() =>
                  turnStage === 0 ? onFirstGuess(value) : onSecondGuess(value)
                }
              >
                {value === "left" ? "←" : "→"}{" "}
                {value === "left"
                  ? copy.apps.directedNumbers.left
                  : copy.apps.directedNumbers.right}
              </button>
            ))}
          </div>
          {wrongGuess && (
            <p className="text-crimson-deep mt-2 text-sm" role="status">
              {turnStage === 0
                ? c.firstWrong(operation, bird.afterOperation)
                : c.secondWrong(
                    number,
                    bird.afterOperation,
                    bird.facing,
                    bird.operationTurn,
                  )}
            </p>
          )}
        </div>
      )}
      <p className="text-navy mt-3 font-semibold" aria-live="polite">
        {turnStage === 0
          ? c.ready
          : turnStage === 1
            ? c.afterFirst(bird.afterOperation)
            : bird.distance === 0
              ? c.zeroLand(signed(end))
              : complete
                ? c.land(bird.travel, signed(end))
                : c.travelHint(bird.turns, bird.facing, bird.travel)}
      </p>
      {turnStage === 2 && bird.distance > 10 && (
        <p className="text-pencil mt-2 text-sm">{c.longHop(bird.distance)}</p>
      )}
      {turnStage < 2 && !hidden && !presenting && (
        <button className={`${button} mt-3`} onClick={onAdvanceTurn}>
          {turnStage === 0 ? c.readOperation : c.readNumber}
        </button>
      )}
      {hidden && !presenting && (
        <button className={`${button} mt-3 ml-2`} onClick={onReveal}>
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
          <button className={button} onClick={() => onExample(2)}>
            {c.exampleThree}
          </button>
        </div>
      )}
    </section>
  );
}
