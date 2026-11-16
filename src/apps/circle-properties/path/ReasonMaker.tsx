import { useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import { reasons } from "../content";
import MathText from "../MathText";
import Figure from "./Figure";
import {
  CENTRE as O,
  on,
  point,
  pts,
  tone,
  type Figure as FigureModel,
  type Tones,
} from "./figureModel";
import type { Activity } from "./types";
import s from "./path.module.css";

const things = ["angles", "arcs", "chords"] as const;
type Thing = (typeof things)[number];
const words: Record<Thing, string> = {
  angles: "equal ∠s",
  arcs: "equal arcs",
  chords: "equal chords",
};
/** have → get → reason. Six arrows between three things. */
export const madeReason: Record<Thing, Partial<Record<Thing, string>>> = {
  angles: { arcs: "r10", chords: "r12" },
  arcs: { angles: "r11", chords: "r15" },
  chords: { angles: "r13", arcs: "r14" },
};
const parts: Record<Thing, string[]> = {
  angles: ["angAOB", "angCOD"],
  arcs: ["arcAB", "arcCD"],
  chords: ["AB", "CD"],
};

const A = on(150),
  B = on(100),
  C = on(40),
  D = on(-10);
const figure: FigureModel = {
  els: [
    { id: "circle", t: "circle" },
    { id: "OA", t: "seg", a: O, b: A },
    { id: "OB", t: "seg", a: O, b: B },
    { id: "OC", t: "seg", a: O, b: C },
    { id: "OD", t: "seg", a: O, b: D },
    { id: "AB", t: "seg", a: A, b: B },
    { id: "CD", t: "seg", a: C, b: D },
    { id: "arcAB", t: "arc", from: 100, to: 150 },
    { id: "arcCD", t: "arc", from: -10, to: 40 },
    { id: "angAOB", t: "ang", a: A, v: O, b: B, r: 30 },
    { id: "angCOD", t: "ang", a: C, v: O, b: D, r: 30 },
    ...point("O", O, 0, 22),
    ...point("A", A),
    ...point("B", B),
    ...point("C", C),
    ...point("D", D),
  ],
  tones: tone(
    ["circle", "OA", "OB", "OC", "OD", ...pts("O", "A", "B", "C", "D")],
    "base",
  ),
  alt: "Two sectors AOB and COD of one circle, with their angles at O, arcs and chords.",
};

/**
 * Six reasons from one rule: say what you have, then what you get.
 * The student makes all six, so the rule replaces six things to memorise.
 */
export default function ReasonMaker({
  activity,
  onDone,
}: {
  activity: Extract<Activity, { kind: "maker" }>;
  onDone: () => void;
}) {
  const [have, setHave] = useState<Thing | null>(null);
  const [get, setGet] = useState<Thing | null>(null);
  const [made, setMade] = useState<string[]>([]);
  const reasonId = have && get ? madeReason[have][get] : undefined;
  const reason = reasons.find((item) => item.id === reasonId);
  const all = Object.values(madeReason).flatMap((row) => Object.values(row));
  function choose(kind: "have" | "get", thing: Thing) {
    const nextHave = kind === "have" ? thing : have;
    let nextGet = kind === "get" ? thing : get;
    if (nextHave === nextGet) nextGet = null;
    setHave(nextHave);
    setGet(nextGet);
    const id = nextHave && nextGet ? madeReason[nextHave][nextGet] : undefined;
    if (id && !made.includes(id)) {
      const next = [...made, id];
      setMade(next);
      if (next.length === all.length) onDone();
    }
  }
  const tones: Tones = {
    ...(have ? tone(parts[have], "given") : {}),
    ...(get ? tone(parts[get], "get") : {}),
  };
  return (
    <div className={s.split}>
      <div className={s.board}>
        <Figure figure={figure} tones={tones} />
        <p className={s.key}>
          <span data-key="given">{c.keyHave}</span>
          <span data-key="get">{c.keyYouGet}</span>
        </p>
      </div>
      <div className={s.task}>
        <h3 className={s.taskTitle}>{activity.title}</h3>
        {activity.body.map((line) => (
          <p key={line} className={s.story}>
            <MathText>{line}</MathText>
          </p>
        ))}
        {(["have", "get"] as const).map((kind) => (
          <div key={kind} className={s.makerRow} data-kind={kind}>
            <span>{kind === "have" ? c.iHave : c.iGet}</span>
            {things.map((thing) => (
              <button
                type="button"
                key={thing}
                className={s.chip}
                aria-pressed={(kind === "have" ? have : get) === thing}
                disabled={kind === "get" && (have === null || have === thing)}
                onClick={() => choose(kind, thing)}
              >
                <MathText>{words[thing]}</MathText>
              </button>
            ))}
          </div>
        ))}
        <p className={s.madeReason} role="status">
          {reason ? (
            <>
              <span className={s.cardNumber}>{reason.number}</span>{" "}
              <MathText>{reason.label}</MathText>
            </>
          ) : (
            c.makerPrompt
          )}
        </p>
        <p className={s.note}>{c.madeCount(made.length, all.length)}</p>
      </div>
    </div>
  );
}
