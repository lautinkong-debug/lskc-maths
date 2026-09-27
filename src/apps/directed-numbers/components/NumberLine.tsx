import { useEffect, useId, useRef } from "react";
import styles from "./NumberLine.module.css";
import { copy } from "@/lib/copy";
import {
  autoRange,
  journeyHops,
  signed,
  moveText,
  type Journey,
} from "../lib/moves";
export type Skin = "plain" | "thermometer" | "lift";
const c = copy.apps.directedNumbers;
export function NumberLine({
  journey,
  position,
  active,
  skin,
  sentence,
  presenting,
}: {
  journey: Journey;
  position: number;
  active: number;
  skin: Skin;
  sentence: string;
  presenting: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const frames = journeyHops(journey),
    visible = frames.slice(0, position);
  const range = autoRange([journey.start, ...frames.map((frame) => frame.to)]);
  const current = visible.at(-1)?.to ?? journey.start;
  const vertical = skin !== "plain";
  const scroller = useRef<HTMLDivElement>(null);
  const currentX = 55 + ((current - range.min) / (range.max - range.min)) * 650;
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    function keepPointVisible() {
      if (!element) return;
      const width =
        element.querySelector("svg")?.getBoundingClientRect().width ?? 0;
      element.scrollLeft = vertical
        ? 0
        : (currentX / 760) * width - element.clientWidth / 2;
    }
    keepPointVisible();
    const observer = new ResizeObserver(keepPointVisible);
    observer.observe(element);
    return () => observer.disconnect();
  }, [currentX, vertical]);
  const ticks: number[] = [];
  for (let n = range.min; n <= range.max; n += range.step) ticks.push(n);
  const x = (n: number) =>
    55 + ((n - range.min) / (range.max - range.min)) * 650;
  const y = (n: number) =>
    440 - ((n - range.min) / (range.max - range.min)) * 370;
  const label = (n: number) =>
    skin === "lift"
      ? `${c.floor(n)} (${signed(n)})`
      : skin === "thermometer"
        ? c.temperature(signed(n))
        : signed(n);
  const star =
    "M0,-11 L3,-3 L12,-3 L5,2 L8,11 L0,6 L-8,11 L-5,2 L-12,-3 L-3,-3 Z";
  return (
    <div className="graph-paper border-grid rounded border p-2 sm:p-4">
      <div ref={scroller} className="overflow-x-auto">
        <svg
          viewBox={vertical ? "0 0 470 510" : "0 0 760 330"}
          role="img"
          aria-label={sentence}
          className={
            vertical
            ? `mx-auto w-full ${presenting ? "max-h-[280px]" : "max-h-[440px]"}`
              : presenting
                ? "h-[275px] w-full min-w-[600px]"
                : "h-auto w-full min-w-[600px]"
          }
        >
          <defs>
            <marker
              id={`${id}-arrow`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10Z" className="fill-navy" />
            </marker>
          </defs>
          {vertical ? (
            <>
              <rect
                x="95"
                y={y(0)}
                width="145"
                height={y(range.min) - y(0)}
                className="fill-crimson-wash"
                opacity="0.7"
              />
              <rect
                x="95"
                y={y(range.max)}
                width="145"
                height={y(0) - y(range.max)}
                className="fill-navy-wash"
                opacity="0.7"
              />
              <line
                x1="175"
                x2="175"
                y1="55"
                y2="450"
                className="stroke-grid-strong"
                strokeWidth="3"
              />
              {skin === "thermometer" && (
                <circle cx="175" cy="465" r="12" className="fill-navy" />
              )}
              {ticks
                .filter((n, index) => !presenting || index % 2 === 0 || n === 0)
                .map((n) => (
                  <g key={n}>
                    <line
                      x1="166"
                      x2="184"
                      y1={y(n)}
                      y2={y(n)}
                      className="stroke-pencil"
                    />
                    <text
                      x="155"
                      y={y(n) + 5}
                      textAnchor="end"
                    className={`${n === 0 ? "fill-graphite font-bold" : "fill-pencil"} ${presenting ? "text-[36px]" : "text-[15px]"}`}
                    >
                      {label(n)}
                    </text>
                  </g>
                ))}
              <path
                d={star}
                transform={`translate(175 ${y(journey.start)})`}
                className="fill-highlight stroke-graphite"
              />
              {visible.map((frame, index) => (
                <path
                  key={index}
                  d={`M175 ${y(frame.from)} Q${245 + frame.moveIndex * 35} ${(y(frame.from) + y(frame.to)) / 2} 175 ${y(frame.to)}`}
                  fill="none"
                  className={`${styles.hop} ${
                    frame.moveIndex === active ? "stroke-navy" : "stroke-pencil"
                  }`}
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  markerEnd={
                    frame.from === frame.to ? undefined : `url(#${id}-arrow)`
                  }
                />
              ))}
              {position > 0 && (
                <>
                  <circle
                    cx="175"
                    cy={y(current)}
                    r="6"
                    className="fill-navy"
                  />
                  <rect
                    x="320"
                    y={y(current) - 16}
                    width="135"
                    height="32"
                    rx="4"
                    className="fill-paper stroke-navy"
                  />
                  <text
                    x="388"
                    y={y(current) + 5}
                    textAnchor="middle"
                    className="fill-navy text-[17px] font-bold"
                  >
                    {label(current)}
                  </text>
                </>
              )}
            </>
          ) : (
            <>
              <rect
                x={x(range.min)}
                y="211"
                width={x(0) - x(range.min)}
                height="48"
                className="fill-crimson-wash"
                opacity="0.7"
              />
              <rect
                x={x(0)}
                y="211"
                width={x(range.max) - x(0)}
                height="48"
                className="fill-navy-wash"
                opacity="0.7"
              />
              <line
                x1="40"
                x2="720"
                y1="220"
                y2="220"
                className="stroke-grid-strong"
                strokeWidth="3"
              />
              <path
                d="M40 220l9 -5v10Z M720 220l-9 -5v10Z"
                className="fill-grid-strong"
              />
              {ticks.map((n) => (
                <g key={n}>
                  <line
                    x1={x(n)}
                    x2={x(n)}
                    y1="212"
                    y2="228"
                    className="stroke-pencil"
                  />
                  <text
                    x={x(n)}
                    y="251"
                    textAnchor="middle"
                    className={`${n === 0 ? "fill-graphite font-bold" : "fill-pencil"} ${presenting ? "text-[30px]" : "text-[17px]"}`}
                  >
                    {signed(n)}
                  </text>
                </g>
              ))}
              <path
                d={star}
                transform={`translate(${x(journey.start)} 220)`}
                className="fill-highlight stroke-graphite"
              />
              {visible.map((frame, index) => (
                <path
                  key={index}
                  d={`M${x(frame.from)} 213 Q${(x(frame.from) + x(frame.to)) / 2} ${170 - frame.moveIndex * 35} ${x(frame.to)} 213`}
                  fill="none"
                  className={`${styles.hop} ${
                    frame.moveIndex === active ? "stroke-navy" : "stroke-pencil"
                  }`}
                  strokeWidth={frame.moveIndex === active ? 3 : 2}
                  strokeDasharray="5 4"
                  markerEnd={
                    frame.from === frame.to ? undefined : `url(#${id}-arrow)`
                  }
                />
              ))}
              {journey.moves.map(
                (move, index) =>
                  position > 0 &&
                  visible.some((frame) => frame.moveIndex === index) && (
                    <text
                      key={index}
                      x="55"
                      y={35 + index * 28}
                      className={`text-[20px] ${index === active ? "fill-navy font-semibold" : "fill-pencil"}`}
                    >
                      {moveText(move)}
                    </text>
                  ),
              )}
              {position > 0 && (
                <>
                  <circle
                    cx={x(current)}
                    cy="220"
                    r="7"
                    className="fill-navy"
                  />
                  <rect
                    x={x(current) - 28}
                    y="273"
                    width="56"
                    height="32"
                    rx="4"
                    className="fill-paper stroke-navy"
                  />
                  <text
                    x={x(current)}
                    y="295"
                    textAnchor="middle"
                    className="fill-navy text-[20px] font-bold"
                  >
                    {signed(current)}
                  </text>
                </>
              )}
            </>
          )}
        </svg>
      </div>
      {!vertical && (
        <p className="text-pencil mt-2 px-2 text-xs sm:hidden">
          {c.scrollLine}
        </p>
      )}
      <div className="text-pencil flex flex-wrap gap-x-5 gap-y-1 px-2 text-sm">
        <span>
          ★ {c.origin}: {label(journey.start)}
        </span>
        {position > 0 && (
          <span>
            ● {position === frames.length ? c.result : c.now}: {label(current)}
          </span>
        )}
      </div>
    </div>
  );
}
