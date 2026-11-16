import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { circlePathCopy as c } from "@/lib/copy";
import { reasons, type LabId } from "../content";
import MathText from "../MathText";
import Quiz, { rightAnswer, type Marked } from "./Quiz";
import { recordAnswer, type PathState } from "./pathSession";
import { newSeed } from "./random";
import { families, stations } from "./stations";
import { band, buildPaper, summarise, type TestSummary } from "./test";
import s from "./path.module.css";

const numberOf = (id: string) =>
  reasons.find((reason) => reason.id === id)!.number;
const day = (at: number) =>
  new Date(at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** The words a student can paste to their teacher. Nothing is uploaded. */
export function resultText(summary: TestSummary, name: string) {
  const lines = [
    `${c.testTitle} · ${day(summary.at)}${name.trim() ? ` · ${name.trim()}` : ""}`,
    `${c.markWord}: ${summary.mark}/${summary.total}`,
    families
      .map(
        (family, i) =>
          `${family.title} ${summary.families[i]?.[0] ?? 0}/${summary.families[i]?.[1] ?? 0}`,
      )
      .join(" · "),
  ];
  if (summary.missed.length)
    lines.push(`${c.toRevise}: ${summary.missed.map(numberOf).join(", ")}`);
  if (summary.slips.length)
    lines.push(
      `${c.slipsWord}: ${summary.slips.map((id) => c.skills[id].title).join("; ")}`,
    );
  return lines.join("\n");
}

export default function ChapterTest({
  state,
  setState,
  onHome,
  onOpen,
}: {
  state: PathState;
  setState: Dispatch<SetStateAction<PathState>>;
  onHome: () => void;
  onOpen: (id: LabId) => void;
}) {
  const [seed, setSeed] = useState<number | null>(null);
  const [marked, setMarked] = useState<Marked[] | null>(null);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const paper = useMemo(() => (seed === null ? [] : buildPaper(seed)), [seed]);

  function finish(result: Marked[]) {
    // The clock is read once, when the paper is handed in.
    const report = summarise(paper, result, seed ?? 0, Date.now());
    setMarked(result);
    setSummary(report);
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
      const { revise: _revise, ...attempt } = report;
      void _revise;
      return { ...next, tests: [...p.tests, attempt].slice(-5) };
    });
  }
  function start() {
    setMarked(null);
    setSummary(null);
    setCopied(false);
    setSeed(newSeed());
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const head = (
    <header className={s.stationHead}>
      <button type="button" className={s.quiet} onClick={onHome}>
        ← {c.allStations}
      </button>
      <div>
        <h2>{c.testTitle}</h2>
        <p className={s.badge}>{c.testBadge}</p>
      </div>
      <span />
    </header>
  );

  if (seed === null || (!marked && !paper.length))
    return (
      <section className={s.station} aria-label={c.testTitle}>
        {head}
        <div className={s.solo}>
          <p className={s.story}>{c.testIntro}</p>
          <ul className={s.plain}>
            {c.testRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          {state.tests.length > 0 && (
            <ul className={s.attempts} aria-label={c.pastTests}>
              {state.tests.map((test) => (
                <li key={test.at}>
                  <span>{day(test.at)}</span>
                  <strong>
                    {test.mark}/{test.total}
                  </strong>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className={s.primary} onClick={start}>
            {state.tests.length ? c.newPaper : c.startTest}
          </button>
        </div>
      </section>
    );

  if (!marked || !summary)
    return (
      <section className={s.station} aria-label={c.testTitle}>
        {head}
        <Quiz
          key={seed}
          questions={paper.map((item) => item.question)}
          feedback="end"
          onFinish={finish}
        />
      </section>
    );

  const level = band(summary.mark, summary.total);
  const text = resultText(summary, name);
  const tested = [...new Set(paper.flatMap((item) => item.question.reasonIds))];
  return (
    <section className={s.station} aria-label={c.testTitle}>
      {head}
      <div className={s.solo}>
        <div
          className={s.result}
          data-pass={level === "top" || level === "pass"}
        >
          <p className={s.mark}>
            <b>{summary.mark}</b> / {summary.total}
          </p>
          <h3>{c.bands[level]}</h3>
        </div>
        <h4 className={s.reportHead}>{c.byFamily}</h4>
        <ul className={s.bars}>
          {families.map((family, i) => {
            const [got, of] = summary.families[i] ?? [0, 0];
            return (
              <li key={family.id}>
                <span>{family.title}</span>
                <span className={s.bar} aria-hidden="true">
                  <i style={{ width: `${of ? (got / of) * 100 : 0}%` }} />
                </span>
                <strong>
                  {got}/{of}
                </strong>
              </li>
            );
          })}
        </ul>
        <h4 className={s.reportHead}>{c.eachReason}</h4>
        <ul className={s.reasonChips}>
          {tested.map((id) => (
            <li key={id} data-right={!summary.missed.includes(id)}>
              {numberOf(id)} {summary.missed.includes(id) ? "✗" : "✓"}
            </li>
          ))}
        </ul>
        {summary.slips.length > 0 && (
          <>
            <h4 className={s.reportHead}>{c.whatToFix}</h4>
            <ul className={s.fixes}>
              {summary.slips.map((id) => (
                <li key={id}>
                  <strong>{c.skills[id].title}</strong>
                  <span>{c.skills[id].tip}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {summary.revise.length > 0 && (
          <>
            <h4 className={s.reportHead}>{c.goBackTo}</h4>
            <div className={s.row}>
              {summary.revise.map((id) => {
                const station = stations.find((item) => item.id === id)!;
                return (
                  <button
                    type="button"
                    key={id}
                    className={s.quiet}
                    onClick={() => onOpen(id)}
                  >
                    {c.stationN(station.n)} · {station.title}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <details className={s.details}>
          <summary>{c.reviewAll}</summary>
          <ol className={s.review}>
            {marked.map((item, i) => (
              <li key={item.question.id} data-right={item.right}>
                <span className={s.reviewMark} aria-hidden="true">
                  {item.right ? "✓" : "✗"}
                </span>
                <span>
                  <strong>{c.questionN(i + 1)}</strong>{" "}
                  {item.question.given && (
                    <>
                      <MathText>{item.question.given}</MathText>{" "}
                    </>
                  )}
                  <MathText>{item.question.prompt}</MathText>
                  <br />
                  {c.yourAnswer} <MathText>{item.shown}</MathText>
                  {!item.right && (
                    <>
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
        </details>
        <div className={s.share}>
          <h4 className={s.reportHead}>{c.showTeacher}</h4>
          <label>
            {c.nameLabel}
            <input
              value={name}
              maxLength={40}
              autoComplete="off"
              onChange={(event) => {
                setName(event.target.value);
                setCopied(false);
              }}
            />
          </label>
          <pre>{text}</pre>
          <div className={s.row}>
            <button
              type="button"
              className={s.quiet}
              onClick={() => copy(text)}
            >
              {copied ? c.copied : c.copyResult}
            </button>
            <button
              type="button"
              className={s.quiet}
              onClick={() => window.print()}
            >
              {c.print}
            </button>
          </div>
          <p className={s.note}>{c.privacy}</p>
        </div>
        <div className={s.row}>
          <button type="button" className={s.primary} onClick={start}>
            {c.newPaper}
          </button>
          <button type="button" className={s.quiet} onClick={onHome}>
            {c.allStations}
          </button>
        </div>
      </div>
    </section>
  );
}
