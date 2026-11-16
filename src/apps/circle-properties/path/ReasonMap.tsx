import { useState } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import { reasons, type LabId } from "../content";
import MathText from "../MathText";
import ReasonLabel from "../ReasonLabel";
import Figure from "./Figure";
import { reasonMastery, type PathState } from "./pathSession";
import { families, stations } from "./stations";
import s from "./path.module.css";

/**
 * All seventeen reasons on one page, as seven pictures in three families.
 * "Hide the words" turns the page into a self-test: say it, then tap to check.
 */
export default function ReasonMap({
  state,
  onHome,
  onOpen,
}: {
  state: PathState;
  onHome: () => void;
  onOpen: (id: LabId) => void;
}) {
  const [hidden, setHidden] = useState(false);
  const [shown, setShown] = useState<string[]>([]);
  return (
    <section className={s.station} aria-label={c.mapTitle}>
      <header className={s.stationHead}>
        <button type="button" className={s.quiet} onClick={onHome}>
          ← {c.allStations}
        </button>
        <div>
          <h2>{c.mapTitle}</h2>
          <p className={s.badge}>{c.mapRule}</p>
        </div>
        <button
          type="button"
          className={s.quiet}
          aria-pressed={hidden}
          onClick={() => {
            setHidden(!hidden);
            setShown([]);
          }}
        >
          {hidden ? c.showWords : c.hideWords}
        </button>
      </header>
      {hidden && <p className={s.note}>{c.sayThenTap}</p>}
      {families.map((family) => (
        <div key={family.id} className={s.family}>
          <h3>
            {family.title}
            <span>{family.idea}</span>
          </h3>
          {stations
            .filter((station) => station.family === family.id)
            .map((station) => (
              <div key={station.id} className={s.mapStation}>
                <button
                  type="button"
                  className={s.mapStationName}
                  onClick={() => onOpen(station.id)}
                >
                  {c.stationN(station.n)} · {station.title} →
                </button>
                <ul className={s.mapCards}>
                  {station.reasonIds.map((id) => {
                    const reason = reasons.find((item) => item.id === id)!;
                    const mastery = reasonMastery(state.reasons[id]);
                    const open = !hidden || shown.includes(id);
                    return (
                      <li key={id} data-mastery={mastery}>
                        <Figure figure={station.pictures[id]} small />
                        <p className={s.mapNumber}>
                          {reason.number}
                          <span data-mastery={mastery}>
                            {c.mastery[mastery]}
                          </span>
                        </p>
                        {open ? (
                          <>
                            <p className={s.cardLabel}>
                              <ReasonLabel reason={reason} />
                            </p>
                            <p className={s.cardChant}>
                              <MathText>{reason.memory}</MathText>
                            </p>
                          </>
                        ) : (
                          <button
                            type="button"
                            className={s.quiet}
                            onClick={() => setShown([...shown, id])}
                          >
                            {c.tapToCheck}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </div>
      ))}
      <p className={s.key}>
        <span data-key="given">{c.keyHave}</span>
        <span data-key="get">{c.keyYouGet}</span>
      </p>
    </section>
  );
}
