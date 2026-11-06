import { circleLessonCopy } from "@/lib/copy";
import MathText from "./MathText";
import {
  foldStage,
  mirrorStage,
  pythagorasSum,
  wordProgress,
  type PaperChord,
  type PaperStep,
} from "./paperCircle";
import s from "./chord-lesson.module.css";

const c = circleLessonCopy.paper;

function Words({ stage }: { stage: number }) {
  const { tags, words, link } = wordProgress(stage);
  return (
    <>
      <h4>{c.words.heading}</h4>
      <ol className={s.paperList}>
        {c.words.tags.slice(0, tags).map((tag, index) => (
          <li key={tag.word}>
            ({index + 1}){" "}
            <strong className={s.answer}>
              {index < words ? tag.word : c.blank}
            </strong>{" "}
            <MathText>{tag.meaning}</MathText>
          </li>
        ))}
      </ol>
      {link && <p className={s.seen}>{c.words.link}</p>}
    </>
  );
}

function Fold({ stage, chord }: { stage: number; chord: PaperChord }) {
  const at = (reached: number, text: string) =>
    stage >= reached ? text : c.blank;
  const f = foldStage;
  return (
    <>
      <h4>{c.fold.heading}</h4>
      <p>
        <MathText>{c.fold.intro}</MathText>
      </p>
      <ol className={s.paperList}>
        <li>
          (a) <MathText>{c.fold.throughCentre}</MathText>{" "}
          <strong className={s.answer}>
            <MathText>{at(f.throughCentre, c.fold.centre)}</MathText>
          </strong>
        </li>
        <li>
          (b) <MathText>AN =</MathText>{" "}
          <strong className={s.answer}>{at(f.halves, `${chord.half}`)}</strong>{" "}
          cm, <MathText>BN =</MathText>{" "}
          <strong className={s.answer}>{at(f.halves, `${chord.half}`)}</strong>{" "}
          cm
        </li>
        <li>
          (c) <MathText>∠ONA =</MathText>{" "}
          <strong className={s.answer}>{at(f.rightAngle, "90°")}</strong>
        </li>
        <li>
          (d) <MathText>ON =</MathText>{" "}
          <strong className={s.answer}>
            {at(f.pythagoras, `${chord.distance}`)}
          </strong>{" "}
          cm. <MathText>ON² + AN² =</MathText>{" "}
          <strong className={s.answer}>
            {at(f.pythagoras, pythagorasSum(chord))}
          </strong>{" "}
          <MathText>= OA²</MathText>
        </li>
      </ol>
      {stage >= f.seen && (
        <div className={s.seen} role="status">
          <p>
            <MathText>{c.fold.seen}</MathText>
          </p>
          <p>
            <strong>{c.fold.enough}</strong>
          </p>
        </div>
      )}
    </>
  );
}

function Mirror({ stage }: { stage: number }) {
  const m = mirrorStage;
  const [right, radii, common, congruent, halves] = c.mirror.lines;
  const rows = [
    { line: right, from: m.rightAngles, answer: m.rightAngles },
    { line: radii, from: m.radii, answer: m.radiiReason },
    { line: common, from: m.common, answer: m.common },
    { line: congruent, from: m.congruent, answer: m.congruentReason },
    { line: halves, from: m.halves, answer: m.halvesValue },
  ];
  return (
    <>
      <h4>{c.mirror.heading}</h4>
      <p>
        <MathText>{c.mirror.picture}</MathText>
      </p>
      {stage >= m.rightAngles && (
        <>
          <p className={s.task}>
            <MathText>{c.mirror.proofIntro}</MathText>
          </p>
          <ol className={s.proof}>
            {rows
              .filter((row) => stage >= row.from)
              .map(({ line, from, answer }) => {
                const shown = stage >= answer;
                return (
                  <li
                    key={line.text}
                    data-current={stage === from || stage === answer}
                  >
                    <span>
                      <MathText>
                        {!shown && "hidden" in line ? line.hidden : line.text}
                      </MathText>
                    </span>
                    <span className={s.proofReason}>
                      <MathText>
                        {!shown && "blank" in line ? line.blank : line.reason}
                      </MathText>
                    </span>
                  </li>
                );
              })}
          </ol>
        </>
      )}
      {stage >= m.halvesValue && (
        <p className={s.seen} role="status">
          <MathText>{c.mirror.theorem}</MathText>
        </p>
      )}
    </>
  );
}

/** The worksheet's words for the demonstration on the board, filled in stage by stage. */
export default function PaperCirclePanel({
  step,
  stage,
  chord,
}: {
  step: PaperStep;
  stage: number;
  chord: PaperChord;
}) {
  return step === 0 ? (
    <Words stage={stage} />
  ) : step === 1 ? (
    <Fold stage={stage} chord={chord} />
  ) : (
    <Mirror stage={stage} />
  );
}
