import { Math as MathNotation } from "@/components/Math";
import { copy } from "@/lib/copy";
import { expressionTex } from "../algebra";
import type { Question } from "./questions";
import styles from "./quest.module.css";
const c = copy.polynomialQuest;
export function Working({ question: q }: { question: Question }) {
  return (
    <section className={styles.working} aria-label={c.workingTitle}>
      <h4>{c.workingTitle}</h4>
      {q.grid && (
        <div className={styles.gridWrap}>
          <table>
            <caption>{c.grid}</caption>
            <thead>
              <tr>
                <th scope="col">×</th>
                {q.grid.right.map((v, i) => (
                  <th key={i} scope="col">
                    <MathNotation>{expressionTex(v)}</MathNotation>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.grid.left.map((v, i) => (
                <tr key={i}>
                  <th scope="row">
                    <MathNotation>{expressionTex(v)}</MathNotation>
                  </th>
                  {q.grid!.products[i].map((p, j) => (
                    <td key={j}>
                      <MathNotation>{expressionTex(p)}</MathNotation>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p>{c.productNote}</p>
        </div>
      )}
      <ol>
        {q.steps.map((step, i) => (
          <li key={i}>
            <div className={styles.mathLine}>
              <MathNotation>{`= ${expressionTex(step.source)}`}</MathNotation>
            </div>
            <p>{c.reasons[step.reason]}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
