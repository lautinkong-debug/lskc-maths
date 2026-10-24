import { Math as MathNotation } from "@/components/Math";
import { copy } from "@/lib/copy";
import { expressionTex } from "./algebra";
import type { Lesson } from "./lesson-types";
import styles from "./polynomials.module.css";
export const termRows: Record<
  string,
  { terms: string[]; degrees: string[]; constant: number; degree: number }
> = {
  a: {
    terms: ["4*d^3", "-4*b*d", "-5"],
    degrees: ["3", "1+1", "0"],
    constant: -5,
    degree: 3,
  },
  b: {
    terms: ["x", "-2*x^3", "8*x*y"],
    degrees: ["1", "3", "1+1"],
    constant: 0,
    degree: 3,
  },
  c: {
    terms: ["-q*y", "8", "5*q*y^2", "-2*q^2"],
    degrees: ["1+1", "0", "1+2", "2"],
    constant: 8,
    degree: 3,
  },
  d: {
    terms: ["a^3*b^4", "-5*c^5", "a^2*b^2*c^3", "-7"],
    degrees: ["3+4", "5", "2+2+3", "0"],
    constant: -7,
    degree: 7,
  },
};
export function TermTable({ lesson, step }: { lesson: Lesson; step: number }) {
  const row = termRows[lesson.part],
    c = copy.polynomials;
  return (
    <div className={styles.termTable}>
      <div data-testid="table-polynomial" className={styles.tablePolynomial}>
        <MathNotation>{expressionTex(lesson.expression!)}</MathNotation>
      </div>
      {step >= 0 && (
        <div className={styles.signedTerms} aria-label={c.signedTerms}>
          {row.terms.map((t, i) => (
            <div key={i} data-testid="signed-term">
              <MathNotation>{expressionTex(t)}</MathNotation>
              {step >= 2 && (
                <span data-testid="term-degree">
                  <MathNotation>{expressionTex(row.degrees[i])}</MathNotation>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {step >= 2 && <p>{c.termDegrees}</p>}
      <table>
        <thead>
          <tr>
            {c.tableHeaders.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {[
              step >= 0 ? row.terms.length : null,
              step >= 1 ? row.constant : null,
              step >= 3 ? row.degree : null,
            ].map((v, i) => (
              <td key={i}>
                {v === null ? "?" : <MathNotation>{String(v)}</MathNotation>}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
