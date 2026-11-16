import { circlePathCopy as c } from "@/lib/copy";
import { reasons, type LabId } from "../content";
import { Stars } from "./StationView";
import {
  nextStep,
  stationStars,
  stepDone,
  type PathState,
} from "./pathSession";
import { families, stations } from "./stations";
import { cpaStages, stepIds, type Station } from "./types";
import s from "./path.module.css";

const numbers = (station: Station) =>
  station.reasonIds
    .map((id) => reasons.find((reason) => reason.id === id)!.number)
    .join(" · ");

/** One screen, one big button: carry on from where you stopped. */
export default function PathHome({
  state,
  onOpen,
  onMap,
  onTest,
}: {
  state: PathState;
  onOpen: (id: LabId) => void;
  onMap: () => void;
  onTest: () => void;
}) {
  const stars = stations.reduce(
    (sum, station) => sum + stationStars(state, station),
    0,
  );
  const started = Object.keys(state.done).length > 0 || stars > 0;
  // Carry on with the first station that still has a star to earn.
  const current =
    stations.find((station) => stationStars(state, station) < 2) ?? stations[0];
  const lastTest = state.tests.at(-1);
  return (
    <div className={s.home}>
      <section className={s.hero}>
        <div>
          <h2>{c.homeTitle}</h2>
          <p>{c.homeBody}</p>
          <ol className={s.cpaLegend} aria-label={c.cpaLabel}>
            {cpaStages.map((stage) => (
              <li key={stage} data-cpa={stage}>
                <strong>{c.cpa[stage].name}</strong>
                <span>{c.cpa[stage].means}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className={s.heroAction}>
          <button
            type="button"
            className={s.primary}
            onClick={() => onOpen(current.id)}
          >
            {started
              ? c.continueWith(current.n, c.stepNames[nextStep(state, current)])
              : c.startHere}
          </button>
          <p className={s.tally}>
            <Stars count={stars > 0 ? 1 : 0} of={1} />{" "}
            {c.starTally(stars, stations.length * 3)}
          </p>
        </div>
      </section>
      {families.map((family) => {
        const group = stations.filter(
          (station) => station.family === family.id,
        );
        if (!group.length) return null;
        return (
          <section key={family.id} className={s.family}>
            <h3>
              {family.title}
              <span>{family.idea}</span>
            </h3>
            <ul className={s.stationList}>
              {group.map((station) => (
                <li key={station.id}>
                  <button
                    type="button"
                    className={s.stationRow}
                    aria-current={station.id === current.id}
                    onClick={() => onOpen(station.id)}
                  >
                    <span className={s.stationNumber} aria-hidden="true">
                      {station.n}
                    </span>
                    <span className={s.stationText}>
                      <strong>{station.title}</strong>
                      <span>
                        {numbers(station)} · {station.idea}
                      </span>
                    </span>
                    <span className={s.stepDots} aria-hidden="true">
                      {stepIds.map((step) => (
                        <i
                          key={step}
                          data-done={stepDone(state, station, step)}
                        />
                      ))}
                    </span>
                    <Stars count={stationStars(state, station)} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <section className={s.extras}>
        <button type="button" className={s.extra} onClick={onMap}>
          <strong>{c.mapTitle}</strong>
          <span>{c.mapHint}</span>
        </button>
        <button type="button" className={s.extra} onClick={onTest}>
          <strong>{c.testTitle}</strong>
          <span>
            {lastTest ? c.testLast(lastTest.mark, lastTest.total) : c.testHint}
          </span>
        </button>
      </section>
    </div>
  );
}
