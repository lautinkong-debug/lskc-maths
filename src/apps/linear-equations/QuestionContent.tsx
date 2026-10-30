import { Math as Maths } from "@/components/Math";
import { copy } from "@/lib/copy";
import type { Question } from "./bank";
import { equationTex } from "./engine";
import styles from "./linear-equations.module.css";
const c = copy.linearEquations;
export function QuestionContent({
  question,
  model = false,
}: {
  question: Question;
  model?: boolean;
}) {
  return (
    <>
      {question.prompt ? (
        <div className={styles.wordProblem}>
          <p>{question.prompt}</p>
          {question.diagram === "triangle24" && (
            <svg
              viewBox="0 0 360 190"
              role="img"
              aria-label={c.diagrams.triangle}
            >
              <polygon
                points="70,145 145,30 300,145"
                fill="var(--color-navy-wash)"
                stroke="var(--color-navy)"
                strokeWidth="2"
              />
              <text x="65" y="85">
                2b cm
              </text>
              <text x="221" y="85">
                (b + 5) cm
              </text>
              <text x="160" y="170">
                15 cm
              </text>
            </svg>
          )}
          {question.diagram === "rectangle27" && (
            <svg
              viewBox="0 0 360 180"
              role="img"
              aria-label={c.diagrams.rectangle}
            >
              <rect
                x="60"
                y="15"
                width="220"
                height="120"
                fill="var(--color-navy-wash)"
                stroke="var(--color-navy)"
                strokeWidth="2"
              />
              <text x="295" y="80">
                7 m
              </text>
              <text x="160" y="160">
                L m
              </text>
            </svg>
          )}
          {question.diagram === "magic63" && (
            <table className={styles.magic} aria-label={c.diagrams.magic}>
              <tbody>
                {[
                  ["x+1", "2*x-18", "2*x-23"],
                  ["16", "A", "24"],
                  ["B", "18", "2*x-21"],
                ].map((r, i) => (
                  <tr key={i}>
                    {r.map((cell, j) => (
                      <td key={j}>
                        <Maths>{equationTex(cell + "=0").split("=")[0]}</Maths>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {model && (
            <div className={styles.model}>
              <strong>{c.model}</strong>
              <p>{question.setup}</p>
              <Maths display>{equationTex(question.equation)}</Maths>
            </div>
          )}
        </div>
      ) : (
        !model && (
          <div className={styles.questionBoard}>
            <Maths display>{equationTex(question.equation)}</Maths>
          </div>
        )
      )}
    </>
  );
}
