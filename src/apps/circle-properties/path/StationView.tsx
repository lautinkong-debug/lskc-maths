import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { circlePathCopy as c } from "@/lib/copy";
import { reasons } from "../content";
import { Star } from "../LabSprites";
import MathText from "../MathText";
import ExploreTask from "./ExploreTask";
import NumberTask from "./NumberTask";
import Quiz, { rightAnswer, type Marked } from "./Quiz";
import ReasonMaker from "./ReasonMaker";
import {
  CardTask,
  ChoiceTask,
  HandsTask,
  PickTask,
  SlideTask,
  StoryTask,
} from "./SimpleTasks";
import StepPlayer from "./StepPlayer";
import TileBuilder from "./TileBuilder";
import Figure from "./Figure";
import {
  CHECK_PASS,
  CHECK_SIZE,
  activityKey,
  recordAnswer,
  stationStars,
  stepDone,
  stepProgress,
  type PathState,
} from "./pathSession";
import { newSeed } from "./random";
import {
  cpaOf,
  cpaStages,
  stepIds,
  type Activity,
  type LessonStepId,
  type Station,
  type StepId,
} from "./types";
import s from "./path.module.css";

type SetPath = Dispatch<SetStateAction<PathState>>;

export function Stars({ count, of = 3 }: { count: number; of?: number }) {
  return (
    <span className={s.stars} role="img" aria-label={c.starsLabel(count, of)}>
      {Array.from({ length: of }, (_, i) => (
        <Star key={i} filled={i < count} />
      ))}
    </span>
  );
}

/** Kinds that only need reading: Next is always open and marks them finished. */
const readOnly = (activity: Activity) =>
  activity.kind === "story" ||
  activity.kind === "card" ||
  activity.kind === "hands";

function ActivityBody({
  activity,
  station,
  seed,
  onDone,
}: {
  activity: Activity;
  station: Station;
  seed: number;
  onDone: (guess?: number) => void;
}) {
  switch (activity.kind) {
    case "story":
      return <StoryTask activity={activity} />;
    case "hands":
      return <HandsTask activity={activity} />;
    case "card":
      return <CardTask activity={activity} pictures={station.pictures} />;
    case "choice":
      return (
        <ChoiceTask
          activity={activity}
          onDone={({ picked }) => onDone(activity.guess ? picked : undefined)}
        />
      );
    case "explore":
      return <ExploreTask {...activity} onDone={() => onDone()} />;
    case "slide":
      return <SlideTask activity={activity} onDone={() => onDone()} />;
    case "pick":
      return <PickTask activity={activity} onDone={() => onDone()} />;
    case "script":
      return <StepPlayer script={activity.script} onDone={() => onDone()} />;
    case "number":
      return (
        <NumberTask question={activity.make(seed)} onDone={() => onDone()} />
      );
    case "maker":
      return <ReasonMaker activity={activity} onDone={() => onDone()} />;
    case "tiles":
      return (
        <div className={activity.figure ? s.split : s.solo}>
          {activity.figure && (
            <div className={s.board}>
              <Figure figure={activity.figure} />
              <p className={s.key}>
                <span data-key="given">{c.keyHave}</span>
                <span data-key="get">{c.keyYouGet}</span>
              </p>
            </div>
          )}
          <div className={s.task}>
            <p className={s.ask}>
              <MathText>{activity.prompt}</MathText>
            </p>
            <TileBuilder
              tiles={activity.tiles}
              extras={activity.extras}
              hint={activity.hint}
              seed={seed}
              onDone={() => onDone()}
            />
            {activity.after && (
              <p className={s.note}>
                <MathText>{activity.after}</MathText>
              </p>
            )}
          </div>
        </div>
      );
  }
}

function Lesson({
  station,
  step,
  state,
  setState,
  onStep,
}: {
  station: Station;
  step: LessonStepId;
  state: PathState;
  setState: SetPath;
  onStep: (step: StepId) => void;
}) {
  const activities = station.steps[step];
  const slot = `${station.id}.${step}`;
  const index = Math.min(state.index[slot] ?? 0, activities.length - 1);
  const activity = activities[index];
  const key = activityKey(station.id, step, activity.id);
  const done = Boolean(state.done[key]);
  const [seeds] = useState(() => activities.map(() => newSeed()));
  const headRef = useRef<HTMLParagraphElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headRef.current?.focus({ preventScroll: true });
    headRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [index, step]);

  const go = (next: number) =>
    setState((p) => ({ ...p, index: { ...p.index, [slot]: next } }));
  const finish = (guess?: number) =>
    setState((p) => ({
      ...p,
      done: { ...p.done, [key]: true },
      guesses: guess === undefined ? p.guesses : { ...p.guesses, [key]: guess },
    }));
  const nextStep = stepIds[stepIds.indexOf(step) + 1];
  function forward() {
    if (readOnly(activity) && !done) finish();
    if (index + 1 < activities.length) go(index + 1);
    else onStep(nextStep);
  }
  // A guess made in Wonder comes back when the puzzle is finally solved.
  const guessActivity = activity.recall
    ? station.steps.wonder.find((item) => item.id === activity.recall)
    : undefined;
  const guessIndex = activity.recall
    ? state.guesses[activityKey(station.id, "wonder", activity.recall)]
    : undefined;
  const guessText =
    guessActivity?.kind === "choice" && guessIndex !== undefined
      ? guessActivity.options[guessIndex]?.text
      : undefined;
  const open = done || readOnly(activity);
  return (
    <div className={s.lesson}>
      <p className={s.where} ref={headRef} tabIndex={-1}>
        <span className={s.cpaTag} data-cpa={cpaOf[step]}>
          {c.cpa[cpaOf[step]].name}
        </span>
        <strong>{c.stepNames[step]}</strong>
        <span>{c.activityOf(index + 1, activities.length)}</span>
        <span className={s.pips} aria-hidden="true">
          {activities.map((item, i) => (
            <i
              key={item.id}
              data-current={i === index}
              data-done={Boolean(
                state.done[activityKey(station.id, step, item.id)],
              )}
            />
          ))}
        </span>
      </p>
      <div className={s.activity} key={key}>
        <ActivityBody
          activity={activity}
          station={station}
          seed={seeds[index]}
          onDone={finish}
        />
        {done && guessText && (
          <p className={s.recall}>{c.yourGuessWas(guessText)}</p>
        )}
      </div>
      <div className={s.lessonNav}>
        <button
          type="button"
          className={s.quiet}
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          {c.back}
        </button>
        {!open && (
          <button type="button" className={s.quiet} onClick={forward}>
            {c.skip}
          </button>
        )}
        <button
          type="button"
          className={s.primary}
          data-ready={open}
          disabled={!open}
          onClick={forward}
        >
          {index + 1 < activities.length
            ? c.next
            : c.nextStep(c.stepNames[nextStep])}
        </button>
      </div>
    </div>
  );
}

function Check({
  station,
  state,
  setState,
  onHome,
  onNext,
  onExplore,
}: {
  station: Station;
  state: PathState;
  setState: SetPath;
  onHome: () => void;
  onNext?: () => void;
  onExplore: () => void;
}) {
  const [seed, setSeed] = useState<number | null>(null);
  const [marked, setMarked] = useState<Marked[] | null>(null);
  const record = state.checks[station.id];
  function finish(result: Marked[]) {
    const score = result.filter((item) => item.right).length;
    setMarked(result);
    setState((p) => {
      let next = p;
      for (const item of result)
        next = recordAnswer(
          next,
          item.question.reasonIds,
          item.right,
          item.pickedReason,
          item.question.skill,
        );
      const before = p.checks[station.id];
      return {
        ...next,
        checks: {
          ...p.checks,
          [station.id]: {
            best: Math.max(before?.best ?? 0, score),
            tries: (before?.tries ?? 0) + 1,
            seed: seed ?? 0,
          },
        },
      };
    });
  }
  if (seed === null)
    return (
      <div className={s.solo}>
        <h3 className={s.taskTitle}>{c.checkTitle}</h3>
        <p className={s.story}>{c.checkBody(CHECK_SIZE, CHECK_PASS)}</p>
        {record && (
          <p className={s.note}>{c.checkBest(record.best, CHECK_SIZE)}</p>
        )}
        <button
          type="button"
          className={s.primary}
          onClick={() => {
            setMarked(null);
            setSeed(newSeed());
          }}
        >
          {record ? c.tryAgain : c.start}
        </button>
      </div>
    );
  if (!marked)
    return (
      <Quiz
        key={seed}
        questions={station.check(seed)}
        feedback="each"
        onFinish={finish}
      />
    );
  const score = marked.filter((item) => item.right).length;
  return (
    <div className={s.solo}>
      <div className={s.result} data-pass={score >= CHECK_PASS}>
        <p className={s.mark}>
          <b>{score}</b> / {marked.length}
        </p>
        <h3>
          {score === marked.length
            ? c.checkPerfect
            : score >= CHECK_PASS
              ? c.checkPassed
              : c.checkNotYet}
        </h3>
        <Stars count={stationStars(state, station)} />
      </div>
      <ol className={s.review}>
        {marked.map((item, i) => (
          <li key={item.question.id} data-right={item.right}>
            <span className={s.reviewMark} aria-hidden="true">
              {item.right ? "✓" : "✗"}
            </span>
            <span>
              <strong>{c.questionN(i + 1)}</strong>{" "}
              <MathText>{item.question.prompt}</MathText>
              {!item.right && (
                <>
                  <br />
                  {c.yourAnswer} <MathText>{item.shown}</MathText>
                  <br />
                  {c.rightAnswer}{" "}
                  <MathText>{rightAnswer(item.question)}</MathText>
                  {item.note && (
                    <>
                      <br />
                      <MathText>{item.note}</MathText>
                    </>
                  )}
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
      <div className={s.row}>
        <button
          type="button"
          className={score >= CHECK_PASS ? s.quiet : s.primary}
          onClick={() => {
            setMarked(null);
            setSeed(newSeed());
          }}
        >
          {c.tryAgainNew}
        </button>
        {onNext && score >= CHECK_PASS && (
          <button type="button" className={s.primary} onClick={onNext}>
            {c.nextStation}
          </button>
        )}
        <button type="button" className={s.quiet} onClick={onHome}>
          {c.allStations}
        </button>
      </div>
      <div className={s.more}>
        <h4>{c.keepExploring}</h4>
        <ul>
          {station.more.map((line) => (
            <li key={line}>
              <MathText>{line}</MathText>
            </li>
          ))}
        </ul>
        <button type="button" className={s.quiet} onClick={onExplore}>
          {c.openExplore}
        </button>
      </div>
    </div>
  );
}

export default function StationView({
  station,
  state,
  setState,
  onHome,
  onNext,
  onExplore,
}: {
  station: Station;
  state: PathState;
  setState: SetPath;
  onHome: () => void;
  onNext?: () => void;
  onExplore: () => void;
}) {
  const step = state.step;
  const setStep = (next: StepId) => setState((p) => ({ ...p, step: next }));
  return (
    <section className={s.station} aria-label={station.title}>
      <header className={s.stationHead}>
        <button type="button" className={s.quiet} onClick={onHome}>
          ← {c.allStations}
        </button>
        <div>
          <p className={s.badge}>
            {c.stationN(station.n)} ·{" "}
            {station.reasonIds
              .map((id) => reasons.find((r) => r.id === id)!.number)
              .join(" · ")}
          </p>
          <h2>{station.title}</h2>
        </div>
        <Stars count={stationStars(state, station)} />
      </header>
      <ol className={s.cpaBands} aria-label={c.cpaLabel}>
        {cpaStages.map((stage) => (
          <li key={stage} data-cpa={stage} data-current={cpaOf[step] === stage}>
            <strong>{c.cpa[stage].name}</strong>
            <span>{c.cpa[stage].means}</span>
          </li>
        ))}
      </ol>
      <nav className={s.stepper} aria-label={c.steps}>
        {stepIds.map((id, i) => {
          const progress = stepProgress(state, station, id);
          return (
            <button
              type="button"
              key={id}
              aria-current={step === id ? "step" : undefined}
              data-cpa={cpaOf[id]}
              data-done={stepDone(state, station, id)}
              onClick={() => setStep(id)}
            >
              <span className={s.stepNumber} aria-hidden="true">
                {stepDone(state, station, id) ? "✓" : i + 1}
              </span>
              <span className={s.stepName}>{c.stepNames[id]}</span>
              <span className={s.stepHint}>
                {id === "check"
                  ? c.stepHints[id]
                  : `${progress.done}/${progress.total}`}
              </span>
            </button>
          );
        })}
      </nav>
      {step === "check" ? (
        <Check
          key={station.id}
          station={station}
          state={state}
          setState={setState}
          onHome={onHome}
          onNext={onNext}
          onExplore={onExplore}
        />
      ) : (
        <Lesson
          key={`${station.id}.${step}`}
          station={station}
          step={step}
          state={state}
          setState={setState}
          onStep={setStep}
        />
      )}
    </section>
  );
}
