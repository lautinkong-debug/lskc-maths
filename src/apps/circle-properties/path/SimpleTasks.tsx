import { useId, useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import { reasons } from "../content";
import MathText from "../MathText";
import ReasonLabel from "../ReasonLabel";
import Choice from "./Choice";
import Figure from "./Figure";
import type { Figure as FigureModel, Tones } from "./figureModel";
import type { Activity, Option } from "./types";
import s from "./path.module.css";

type Of<K extends Activity["kind"]> = Extract<Activity, { kind: K }>;

/** A figure beside the task on a wide screen, above it on a phone. */
export function Split({
  figure,
  tones,
  under,
  children,
}: {
  figure?: FigureModel;
  tones?: Tones;
  under?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!figure) return <div className={s.solo}>{children}</div>;
  return (
    <div className={s.split}>
      <div className={s.board}>
        <Figure figure={figure} tones={tones} />
        {under}
      </div>
      <div className={s.task}>{children}</div>
    </div>
  );
}

export function StoryTask({ activity }: { activity: Of<"story"> }) {
  return (
    <Split figure={activity.figure}>
      <h3 className={s.taskTitle}>{activity.title}</h3>
      {activity.text.map((line) => (
        <p key={line} className={s.story}>
          <MathText>{line}</MathText>
        </p>
      ))}
    </Split>
  );
}

/**
 * The concrete stage: real paper, a real plate, a real ruler. The screen only
 * says what to do. The diagram comes afterwards.
 */
export function HandsTask({ activity }: { activity: Of<"hands"> }) {
  return (
    <Split figure={activity.figure}>
      <p className={s.handsTag}>{c.handsOn}</p>
      <h3 className={s.taskTitle}>{activity.title}</h3>
      <p className={s.need}>
        <strong>{c.youNeed}</strong>{" "}
        {activity.need.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>
      <ol className={s.todo}>
        {activity.todo.map((line) => (
          <li key={line}>
            <MathText>{line}</MathText>
          </li>
        ))}
      </ol>
      <p className={s.ask}>
        <MathText>{activity.look}</MathText>
      </p>
      <p className={s.note}>{c.noKit}</p>
    </Split>
  );
}

export function ChoiceTask({
  activity,
  earlierGuess,
  onDone,
}: {
  activity: Of<"choice">;
  earlierGuess?: string;
  onDone: (result: { picked: number; firstTry: boolean }) => void;
}) {
  const [answered, setAnswered] = useState(false);
  return (
    <Split
      figure={activity.figure}
      tones={answered ? activity.reveal : undefined}
    >
      <p className={s.ask}>
        <MathText>{activity.prompt}</MathText>
      </p>
      {activity.note && (
        <p className={s.note}>
          <MathText>{activity.note}</MathText>
        </p>
      )}
      <Choice
        options={activity.options}
        guess={activity.guess}
        onDone={(result) => {
          setAnswered(true);
          onDone(result);
        }}
      />
      {answered && activity.after && (
        <p className={s.after}>
          <MathText>{activity.after}</MathText>
        </p>
      )}
      {answered && earlierGuess && (
        <p className={s.note}>{c.yourGuessWas(earlierGuess)}</p>
      )}
    </Split>
  );
}

/** Slide one thing, read two numbers, then say what you noticed. */
export function SlideTask({
  activity,
  onDone,
}: {
  activity: Of<"slide">;
  onDone: (firstTry: boolean) => void;
}) {
  const id = useId();
  const [value, setValue] = useState(activity.start);
  const [moves, setMoves] = useState(0);
  const [found, setFound] = useState(false);
  return (
    <Split
      figure={activity.figure(value)}
      under={
        <>
          <label className={s.slider} htmlFor={id}>
            <span>{activity.label}</span>
            <input
              id={id}
              type="range"
              min={activity.min}
              max={activity.max}
              step={activity.step}
              value={value}
              onChange={(event) => {
                setValue(Number(event.target.value));
                setMoves((count) => count + 1);
              }}
            />
          </label>
          <dl className={s.readout} aria-live="polite">
            {activity.readout(value).map((item) => (
              <div key={item.label}>
                <dt>
                  <MathText notation>{item.label}</MathText>
                </dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </>
      }
    >
      <h3 className={s.taskTitle}>
        <MathText>{activity.title}</MathText>
      </h3>
      <p className={s.story}>
        <MathText>{activity.todo}</MathText>
      </p>
      <p className={s.ask}>{c.whatDidYouNotice}</p>
      <Choice
        options={activity.options}
        disabled={moves < 3}
        disabledNote={c.slideFirst}
        onDone={({ firstTry }) => {
          setFound(true);
          onDone(firstTry);
        }}
      />
      {found && (
        <p className={s.after}>
          <MathText>{activity.after}</MathText>
        </p>
      )}
    </Split>
  );
}

/** Tap the right part of the picture. */
export function PickTask({
  activity,
  onDone,
}: {
  activity: Of<"pick">;
  onDone: (firstTry: boolean) => void;
}) {
  const [state, setState] = useState<Record<string, "right" | "wrong">>({});
  const [last, setLast] = useState<string | null>(null);
  const solved = Object.values(state).includes("right");
  function pick(id: string) {
    if (solved || state[id]) return;
    const right = id === activity.answer;
    setLast(id);
    setState({ ...state, [id]: right ? "right" : "wrong" });
    if (right) onDone(Object.keys(state).length === 0);
  }
  return (
    <div className={s.split}>
      <div className={s.board}>
        <Figure
          figure={activity.figure}
          spots={activity.spots}
          spotState={state}
          onSpot={pick}
        />
      </div>
      <div className={s.task}>
        <p className={s.ask}>
          <MathText>{activity.prompt}</MathText>
        </p>
        <p className={s.note}>{c.tapPicture}</p>
        <p
          className={s.feedback}
          role="status"
          data-tone={last ? state[last] : undefined}
        >
          {last && (
            <>
              <strong>{state[last] === "right" ? c.yes : c.notYet}</strong>{" "}
              <MathText>{activity.why[last] ?? ""}</MathText>
            </>
          )}
        </p>
        {solved && (
          <p className={s.after}>
            <MathText>{activity.after}</MathText>
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * A memory card: one picture for each reason, with its wording in blue (have)
 * and green (get) and its short chant.
 */
export function CardTask({
  activity,
  pictures,
}: {
  activity: Of<"card">;
  pictures: Record<string, FigureModel>;
}) {
  return (
    <Split figure={activity.figure}>
      <h3 className={s.taskTitle}>{activity.title}</h3>
      {activity.body.map((line) => (
        <p key={line} className={s.story}>
          <MathText>{line}</MathText>
        </p>
      ))}
      <ul className={s.cards}>
        {activity.reasonIds.map((id) => {
          const reason = reasons.find((item) => item.id === id)!;
          return (
            <li key={id} data-picture={Boolean(pictures[id])}>
              {pictures[id] && (
                <span className={s.cardPicture}>
                  <Figure figure={pictures[id]} small />
                </span>
              )}
              <span className={s.cardNumber}>{reason.number}</span>
              <span className={s.cardLabel}>
                <ReasonLabel reason={reason} />
              </span>
              <span className={s.cardChant}>
                <MathText>{reason.memory}</MathText>
              </span>
            </li>
          );
        })}
      </ul>
      <p className={s.key}>
        <span data-key="given">{c.keyHave}</span>
        <span data-key="get">{c.keyYouGet}</span>
      </p>
    </Split>
  );
}

/** Options for a question that the caller marks itself. */
export type { Option };
