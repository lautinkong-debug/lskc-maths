import { useId } from "react";
import { Math } from "@/components/Math";
import { copy } from "@/lib/copy";
import { equations, products, toTex, type Frame } from "./model";
import styles from "./polynomials.module.css";

const c = copy.polynomials;

function Distribution({ active }: { active: number | null }) {
  const marker = useId().replace(/:/g, "");
  const pair = active === null ? null : products[active];
  const left = pair?.row === 1 ? 205 : 105;
  const right = pair?.column === 1 ? 495 : 395;
  return (
    <svg
      className={styles.distribution}
      viewBox="0 0 600 150"
      role="img"
      aria-label={
        pair ? c.factorPair(toTex(pair.left), toTex(pair.right)) : c.multiply
      }
    >
      <defs>
        <marker
          id={marker}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 10 5 0 10Z" fill="currentColor" />
        </marker>
      </defs>
      {pair && (
        <path
          key={active}
          className={styles.arrow}
          d={`M${left} 83 C${left} 5 ${right} 5 ${right} 74`}
          markerEnd={`url(#${marker})`}
        />
      )}
      {[105, 205, 395, 495].map((x, i) => {
        const selected = pair && (i === pair.row || i === pair.column + 2);
        return (
          <g key={x}>
            {selected && (
              <rect
                x={x - 38}
                y="83"
                width="76"
                height="53"
                rx="6"
                fill="var(--color-highlight)"
              />
            )}
            <foreignObject
              x={x - 40}
              y="87"
              width="80"
              height="55"
              aria-hidden="true"
            >
              <div className={styles.factor}>
                <Math>{i % 2 === 0 ? "3x" : "4"}</Math>
              </div>
            </foreignObject>
          </g>
        );
      })}
      <g className={styles.svgSymbols} aria-hidden="true">
        <text x="57" y="124">
          (
        </text>
        <text x="155" y="124">
          +
        </text>
        <text x="251" y="124">
          )
        </text>
        <text x="347" y="124">
          (
        </text>
        <text x="445" y="124">
          +
        </text>
        <text x="541" y="124">
          )
        </text>
      </g>
    </svg>
  );
}

export function TeachingBoard({ frame }: { frame: Frame }) {
  const showProducts = frame.mode === "distribute" || frame.mode === "product";
  const showSigns = frame.mode === "minus-focus" || frame.mode === "minus";
  const productRevealed =
    frame.activeProduct !== null &&
    frame.revealedProducts > frame.activeProduct;
  const reason = productRevealed ? c.reasons.result : c.reasons[frame.mode];

  return (
    <section
      className={styles.board}
      data-testid="polynomial-board"
      aria-labelledby="polynomial-action"
    >
      <header className={styles.boardHeading}>
        <span className={styles.stepMark} aria-hidden="true">
          {showProducts ? "×" : showSigns ? "−" : "="}
        </span>
        <h3 id="polynomial-action">{c.nextActions[frame.mode]}</h3>
      </header>
      <div className={styles.boardContent}>
        {showProducts ? (
          <>
            <Distribution active={frame.activeProduct} />
            <div className={styles.productGrid} aria-label={c.products}>
              {products.map((p, i) => {
                const revealed = i < frame.revealedProducts;
                return (
                  <div
                    key={i}
                    data-testid={`product-cell-${i}`}
                    data-active={frame.activeProduct === i}
                    className={styles.productCell}
                  >
                    <Math
                      className={styles.pair}
                    >{`${toTex(p.left)}\\times ${toTex(p.right)}`}</Math>
                    {revealed ? (
                      <Math
                        key="result"
                        className={styles.productResult}
                      >{`= ${toTex(p.result)}`}</Math>
                    ) : (
                      <span
                        className={styles.unrevealed}
                        aria-label={c.unrevealed}
                      >
                        ?
                      </span>
                    )}
                    {revealed && (
                      <span data-testid="product-value" className="sr-only">
                        {toTex(p.result)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className={styles.boardNote}>{c.outside}</p>
          </>
        ) : showSigns ? (
          <div data-testid="minus-rule" data-revealed={frame.mode === "minus"}>
            <div className={styles.signExpression}>
              <Math>{"2x^{2}-\\left[9x^{2}+24x+16\\right]"}</Math>
            </div>
            <div className={styles.signColumns}>
              {["9x^{2}", "24x", "16"].map((tex) => (
                <div key={tex}>
                  <Math>{`+${tex}`}</Math>
                  <span className={styles.downArrow} aria-hidden="true">
                    ↓
                  </span>
                  {frame.mode === "minus" ? (
                    <div className={styles.changedTerm}>
                      <span
                        data-testid="changed-sign"
                        className={styles.negativeSign}
                      >
                        <Math>{"-"}</Math>
                      </span>
                      <Math>{tex}</Math>
                    </div>
                  ) : (
                    <span
                      className={styles.signPlaceholder}
                      aria-label={c.signWaiting}
                    >
                      ?
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className={styles.boardNote}>{c.minusRule}</p>
          </div>
        ) : (
          <div className={styles.focusStage}>
            {frame.mode === "question" && (
              <>
                <Math className={styles.heroMath}>
                  {toTex(equations[0].expression)}
                </Math>
                <p className={styles.startHint}>{c.startHint}</p>
              </>
            )}
            {frame.mode === "square" && (
              <>
                <Math className={styles.heroMath}>{"(3x+4)^{2}"}</Math>
                <span className={styles.downArrow} aria-hidden="true">
                  ↓
                </span>
                <Math className={styles.heroMath}>{"(3x+4)(3x+4)"}</Math>
                <p className={styles.boardNote}>{c.outside}</p>
              </>
            )}
            {frame.mode === "collect" && (
              <>
                <Math className={styles.heroMath}>{"12x+12x"}</Math>
                <span className={styles.downArrow} aria-hidden="true">
                  ↓
                </span>
                <Math className={styles.heroMath}>{"(12+12)x=24x"}</Math>
                <p className={styles.boardNote}>{c.crossTerms}</p>
              </>
            )}
            {frame.mode === "group" && (
              <>
                <Math className={styles.heroMath}>{"2x^{2}-9x^{2}"}</Math>
                <span className={styles.downArrow} aria-hidden="true">
                  ↓
                </span>
                <Math className={styles.heroMath}>{"(2-9)x^{2}"}</Math>
              </>
            )}
            {frame.mode === "answer" && (
              <>
                <p className={styles.answerLabel}>{c.answer}</p>
                <Math className={styles.answerMath}>
                  {toTex(equations.at(-1)!.expression)}
                </Math>
                <p className={styles.boardNote}>{c.order}</p>
              </>
            )}
          </div>
        )}
      </div>
      <p className={styles.explanation}>{reason}</p>
    </section>
  );
}
