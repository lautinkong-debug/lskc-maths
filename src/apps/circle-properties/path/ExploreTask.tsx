import { useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import MathText from "../MathText";
import MeasurementList from "../MeasurementList";
import ReasonFlowDiagram from "../ReasonFlowDiagram";
import {
  initialReasonParameters,
  reasonMeasurements,
  type ReasonParameters,
} from "../reasonExploration";
import Choice from "./Choice";
import type { Option } from "./types";
import s from "./path.module.css";

/**
 * Drag the real diagram, read the live numbers, then say what stays true.
 * The question stays locked until the student has actually moved something.
 */
export default function ExploreTask({
  reasonId,
  title,
  todo,
  watch,
  options,
  after,
  onDone,
}: {
  reasonId: string;
  title: string;
  todo: string;
  watch: string;
  options: Option[];
  after: string;
  onDone: (firstTry: boolean) => void;
}) {
  const [parameters, setParameters] = useState<ReasonParameters>(() =>
    initialReasonParameters(reasonId),
  );
  const [moves, setMoves] = useState(0);
  const [found, setFound] = useState(false);
  const moved = moves >= 2;
  return (
    <div className={s.split}>
      <div className={s.board}>
        <ReasonFlowDiagram
          reasonId={reasonId}
          reveal={found}
          parameters={parameters}
          onChange={(next) => {
            setParameters(next);
            setMoves((count) => count + 1);
          }}
        />
        <MeasurementList
          label={c.liveNumbers}
          measurements={reasonMeasurements(reasonId, parameters)}
        />
      </div>
      <div className={s.task}>
        <h3 className={s.taskTitle}>
          <MathText>{title}</MathText>
        </h3>
        <ol className={s.todo}>
          <li>
            <MathText>{todo}</MathText>
          </li>
          <li>
            <MathText>{watch}</MathText>
          </li>
        </ol>
        <p className={s.ask}>{c.whatStaysTrue}</p>
        <Choice
          options={options}
          disabled={!moved}
          disabledNote={c.dragFirst}
          onDone={({ firstTry }) => {
            setFound(true);
            onDone(firstTry);
          }}
        />
        {found && (
          <p className={s.after}>
            <MathText>{after}</MathText>
          </p>
        )}
      </div>
    </div>
  );
}
