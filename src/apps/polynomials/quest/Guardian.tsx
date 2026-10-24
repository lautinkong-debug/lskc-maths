import styles from "./quest.module.css";

/** Original geometric character and six battle shields. */
export function Guardian({
  stage = 0,
  remaining = 6,
  celebrate = false,
}: {
  stage?: number;
  remaining?: number;
  celebrate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 300 250"
      className={styles.guardian}
      data-stage={stage}
      data-celebrate={celebrate || undefined}
      aria-hidden="true"
    >
      <ellipse cx="150" cy="223" rx="69" ry="9" className={styles.shadow} />
      <g>
        {Array.from({ length: 6 }, (_, i) => {
          const angle = ((i * 60 - 90) * Math.PI) / 180,
            x = 150 + 108 * Math.cos(angle),
            y = 124 + 105 * Math.sin(angle);
          return (
            <g
              key={i}
              transform={`translate(${x} ${y})`}
              className={i < remaining ? styles.shield : styles.brokenShield}
            >
              <path d="M-11-15 11-15 14 1 0 15-14 1Z" />
              <path d="M-5-1 0 4 6-5" />
            </g>
          );
        })}
      </g>
      <g className={styles.creature}>
        <path
          d={
            stage === 3
              ? "M87 92 70 48 122 74 150 38 179 74 230 48 212 92"
              : "M99 87 88 55 126 75 174 75 212 55 201 87"
          }
          className={styles.horns}
        />
        <path
          d="M96 88 150 65 204 88 217 157 188 198 112 198 83 157Z"
          className={styles.body}
        />
        <path
          d="M96 88 150 111 204 88M150 111 150 194M83 157 150 141 217 157"
          className={styles.facets}
        />
        <path d="M110 122 132 127M168 127 190 122" className={styles.eyes} />
        <path
          d={celebrate ? "M133 160Q150 177 167 160" : "M137 165 163 165"}
          className={styles.mouth}
        />
        <path
          d="M87 138 65 151 76 178 95 170M213 138 235 151 224 178 205 170"
          className={styles.arms}
        />
        <path
          d="M112 198 103 216 133 216 137 198M163 198 167 216 197 216 188 198"
          className={styles.feet}
        />
        <path d="M150 84 160 94 150 104 140 94Z" className={styles.gem} />
      </g>
      {celebrate && (
        <g className={styles.spark}>
          <path d="M55 73v14m-7-7h14M244 186v14m-7-7h14M227 68v14m-7-7h14" />
        </g>
      )}
    </svg>
  );
}
