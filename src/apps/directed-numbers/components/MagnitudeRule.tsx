import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { toTex } from "../lib/rational";
import { magnitudeModel, type SimpleMove } from "../lib/textbook";
import styles from "./MagnitudeRule.module.css";

const c = copy.apps.directedNumbers.magnitudeLesson.quickRule;

/** Compare signed addends, including the opposite of a subtracted operand. */
export function MagnitudeRule({ id, move }: { id: string; move: SimpleMove }) {
  const m = magnitudeModel(move);
  const options = {
    style: move.exact?.style ?? "decimal",
    signed: true,
  } as const;
  const addends = [m.exact.start, m.exact.delta].map(
    (value) => `\\left(${toTex(value, options)}\\right)`,
  );

  return (
    <aside
      id={id}
      className={styles.rule}
      aria-labelledby={`${id}-title`}
      data-testid="magnitude-quick-rule"
    >
      <h4 id={`${id}-title`}>{c.title}</h4>
      <div className={styles.context}>
        <p>{move.op === "-" ? c.rewrite : c.compare}</p>
        <div className={styles.example} data-testid="rule-addends">
          <Tex label={`(${m.labels.start}) + (${m.labels.delta})`}>
            {addends.join(" + ")}
          </Tex>
        </div>
      </div>
      <div className={`${styles.row} ${styles.same}`}>
        <div className={styles.heading}>
          <h5>{c.same}</h5>
          <span className={styles.pairs} aria-hidden="true">
            <span>+ +</span>
            <span>− −</span>
          </span>
        </div>
        <p className={styles.action}>{c.add}</p>
        <p className={styles.sign}>{c.sameSign}</p>
      </div>
      <div className={`${styles.row} ${styles.different}`}>
        <div className={styles.heading}>
          <h5>{c.different}</h5>
          <span className={styles.pairs} aria-hidden="true">
            <span>+ −</span>
            <span>− +</span>
          </span>
        </div>
        <p className={styles.action}>{c.subtract}</p>
        <p className={styles.sign}>{c.differentSign}</p>
      </div>
      <p className={styles.zero}>{c.zero}</p>
    </aside>
  );
}
