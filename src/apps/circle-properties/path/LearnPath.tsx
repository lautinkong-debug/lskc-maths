"use client";

import { useEffect, useRef } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import type { LabId } from "../content";
import { useLocalSession } from "../useLocalSession";
import ChapterTest from "./ChapterTest";
import PathHome from "./PathHome";
import ReasonMap from "./ReasonMap";
import StationView from "./StationView";
import { initialPath, nextStep, parsePath, type PathView } from "./pathSession";
import { stations } from "./stations";
import s from "./path.module.css";

/**
 * The student's own route through the chapter: seven stations, the same six
 * steps in each, then a chapter test. Progress stays in this browser.
 */
export default function LearnPath({
  onExplore,
}: {
  onExplore: (lab: LabId) => void;
}) {
  const [state, setState, failed] = useLocalSession(
    "path",
    initialPath,
    parsePath,
  );
  const topRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ block: "start" });
  }, [state.view, state.station]);

  const show = (view: PathView) => setState((p) => ({ ...p, view }));
  const open = (id: LabId) => {
    const station = stations.find((item) => item.id === id);
    if (!station) return;
    setState((p) => ({
      ...p,
      view: "station",
      station: id,
      step: nextStep(p, station),
    }));
  };
  const station =
    stations.find((item) => item.id === state.station) ?? stations[0];
  const following = stations[stations.indexOf(station) + 1];
  return (
    <div className={s.path} ref={topRef}>
      {state.view === "station" ? (
        <StationView
          key={station.id}
          station={station}
          state={state}
          setState={setState}
          onHome={() => show("home")}
          onNext={following ? () => open(following.id) : undefined}
          onExplore={() => onExplore(station.id)}
        />
      ) : state.view === "map" ? (
        <ReasonMap state={state} onHome={() => show("home")} onOpen={open} />
      ) : state.view === "test" ? (
        <ChapterTest
          state={state}
          setState={setState}
          onHome={() => show("home")}
          onOpen={open}
        />
      ) : (
        <PathHome
          state={state}
          onOpen={open}
          onMap={() => show("map")}
          onTest={() => show("test")}
        />
      )}
      {failed && <p className={s.note}>{c.notSaved}</p>}
    </div>
  );
}
