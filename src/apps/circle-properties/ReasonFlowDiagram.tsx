import { useId, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { reasons } from "./content";
import { MathSvgText } from "./MathText";
import { buildReasonFlow, reasonFlow, visibleReasonMarks } from "./reasonFlow";
import { dragReasonPoint, initialReasonParameters } from "./reasonExploration";
import type { DragKey, Parameters, Point } from "./geometry";
import s from "./reason-flow.module.css";

const colours = { base: "#65788e", given: "#2454c6", result: "#18764b" };

/** Reveal only the new conclusion marks; the blue givens remain in place. */
export default function ReasonFlowDiagram({
  reasonId,
  reveal,
  parameters,
  onChange,
  trails = [],
}: {
  reasonId: string;
  reveal: boolean;
  parameters?: Parameters;
  onChange?: (next: Parameters) => void;
  trails?: Parameters[];
}) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ key: DragKey; pointerId: number } | null>(null);
  const reason = reasons.find((item) => item.id === reasonId);
  const flow = reasonFlow[reasonId];
  if (!reason || !flow) return null;
  const current = parameters ?? initialReasonParameters(reasonId);
  const model = buildReasonFlow(reasonId, current);
  const diagramName = reveal ? "Therefore" : "Given";

  function move(event: PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    const matrix = svgRef.current?.getScreenCTM();
    if (!onChange || !drag || event.pointerId !== drag.pointerId || !matrix)
      return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    onChange(dragReasonPoint(reasonId, current, drag.key, point));
  }
  function stop(event: PointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.removeAttribute("data-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function moveWithKeys(
    event: KeyboardEvent<SVGGElement>,
    key: DragKey,
    point: Point,
  ) {
    const offsets: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const offset = offsets[event.key];
    if (!onChange || !offset) return;
    event.preventDefault();
    const step = event.shiftKey ? 10 : 3;
    onChange(
      dragReasonPoint(reasonId, current, key, {
        x: point.x + offset.x * step,
        y: point.y + offset.y * step,
      }),
    );
  }
  return (
    <svg
      ref={svgRef}
      className={s.diagram}
      viewBox="0 0 420 360"
      role={onChange ? "group" : "img"}
      aria-roledescription={onChange ? "interactive circle diagram" : undefined}
      aria-labelledby={`${id}-title ${id}-description`}
      data-testid={`reason-flow-${reasonId}`}
      data-revealed={reveal}
      onPointerMove={move}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={() => {
        dragRef.current = null;
        svgRef.current?.removeAttribute("data-dragging");
      }}
    >
      <title
        id={`${id}-title`}
      >{`${reason.number}: ${reveal ? "given facts and conclusion" : "given facts only"}`}</title>
      <desc id={`${id}-description`}>
        {`Blue given facts: ${flow.startingFact}${reveal ? ` Green conclusion: ${flow.resultFact}` : " The conclusion markings are hidden."}`}
        {onChange &&
          " Drag a ringed point. Both diagrams move together while the givens stay true. Focus a point and use the arrow keys; hold Shift for larger movements."}
        {reasonId === "r3" &&
          trails.length > 0 &&
          " Dashed lines show saved perpendicular bisectors."}
      </desc>
      {reasonId === "r3" && trails.length > 0 && (
        <g className={s.savedLines} aria-label="Saved perpendicular bisectors">
          <title>Saved perpendicular bisectors</title>
          {trails.map((sample, index) => {
            const bisector = buildReasonFlow("r3", sample).marks.find(
              (mark) => mark.id === "line-ell" && mark.kind === "line",
            );
            if (!bisector || bisector.kind !== "line") return null;
            return (
              <line
                key={index}
                data-saved-bisector={index}
                x1={bisector.a.x}
                y1={bisector.a.y}
                x2={bisector.b.x}
                y2={bisector.b.y}
              />
            );
          })}
        </g>
      )}
      {visibleReasonMarks(model, reveal).map((mark) => {
        const colour = colours[mark.stage];
        const common = {
          key: mark.id,
          "data-mark": mark.id,
          "data-stage": mark.stage,
        };
        switch (mark.kind) {
          case "circle":
            return (
              <circle
                {...common}
                cx={mark.at.x}
                cy={mark.at.y}
                r={mark.radius}
                fill="none"
                stroke={colour}
                strokeWidth={2}
              />
            );
          case "line":
            return (
              <line
                {...common}
                x1={mark.a.x}
                y1={mark.a.y}
                x2={mark.b.x}
                y2={mark.b.y}
                stroke={colour}
                strokeWidth={mark.stage === "base" ? 1.8 : 3.5}
                strokeDasharray={mark.dashed ? "6 5" : undefined}
                strokeLinecap="round"
              />
            );
          case "path":
            if (mark.id.startsWith("right-angle-"))
              return (
                <g key={mark.id}>
                  <path
                    d={mark.d}
                    className={s.squareHalo}
                    aria-hidden="true"
                  />
                  <path
                    {...common}
                    d={mark.d}
                    stroke={colour}
                    strokeWidth={3.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pointerEvents="none"
                  />
                </g>
              );
            return (
              <path
                {...common}
                d={mark.d}
                stroke={colour}
                strokeWidth={3.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          case "dot":
            return (
              <circle
                {...common}
                cx={mark.at.x}
                cy={mark.at.y}
                r={mark.stage === "base" ? 3 : 4}
                fill={colour}
              />
            );
          case "text":
            return (
              <g key={mark.id}>
                {mark.leader && (
                  <line
                    x1={mark.leader.x}
                    y1={mark.leader.y}
                    x2={mark.at.x}
                    y2={mark.at.y - 8}
                    stroke={colour}
                    strokeWidth={1}
                    strokeDasharray="2 3"
                    opacity={0.6}
                    pointerEvents="none"
                    aria-hidden="true"
                    data-label-leader={mark.id}
                    data-stage={mark.stage}
                  />
                )}
                <MathSvgText
                  {...common}
                  x={mark.at.x}
                  y={mark.at.y}
                  textAnchor="middle"
                  fill={colour}
                  fontSize={23}
                  fontWeight={mark.stage === "base" ? 500 : 650}
                  style={{
                    paintOrder: "stroke",
                    stroke: "#fff",
                    strokeWidth: 3,
                    strokeLinejoin: "round",
                  }}
                >
                  {mark.text}
                </MathSvgText>
              </g>
            );
        }
      })}
      {onChange &&
        model.handles.map((handle) => (
          <g
            key={handle.name}
            role="button"
            aria-roledescription="draggable point"
            aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
            tabIndex={0}
            aria-label={`Move ${handle.name} in ${diagramName} diagram`}
            aria-describedby={`${id}-description`}
            className={s.handle}
            data-flow-handle={handle.name}
            onPointerDown={(event) => {
              if (event.button !== 0 || !event.isPrimary) return;
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              dragRef.current = { key: handle.key, pointerId: event.pointerId };
              svgRef.current?.setAttribute("data-dragging", "true");
              svgRef.current?.setPointerCapture(event.pointerId);
            }}
            onKeyDown={(event) => moveWithKeys(event, handle.key, handle.point)}
          >
            <circle
              cx={handle.point.x}
              cy={handle.point.y}
              r={24}
              className={s.hitTarget}
            />
            <circle
              cx={handle.point.x}
              cy={handle.point.y}
              r={12}
              className={s.ring}
            />
          </g>
        ))}
    </svg>
  );
}
