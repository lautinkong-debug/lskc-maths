import { copy } from "@/lib/copy";
import type { MatchSummary } from "@/lib/polynomial-tug/types";
import styles from "./Tug.module.css";
const c = copy.polynomialTug;
export function Rope({ match }: { match: MatchSummary }) {
  const flag = 400 + match.position * 10;
  return (
    <div
      className={styles.rope}
      data-testid="tug-rope"
      data-position={match.position}
    >
      <svg
        viewBox="0 0 800 170"
        role="img"
        aria-label={`${c.rope}: ${match.position}`}
      >
        <path d="M20 145H780" stroke="currentColor" opacity=".14" />
        <path
          d="M160 30V150 M640 30V150"
          stroke="currentColor"
          strokeDasharray="6 6"
          opacity=".4"
        />
        <path d="M400 28V150" stroke="currentColor" opacity=".2" />
        <path
          d="M80 92Q400 105 720 92"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {[75, 130, 670, 725].map((x, i) => (
          <g
            key={x}
            transform={`translate(${x + match.position * 1.5},0)`}
            className={i < 2 ? styles.crewA : styles.crewB}
          >
            <circle cx="0" cy="52" r="17" />
            <path
              d={`M0 72L${i < 2 ? -9 : 9} 108 M0 78L${i < 2 ? 26 : -26} 94 M${i < 2 ? -9 : 9} 108L${i < 2 ? -30 : 30} 139 M${i < 2 ? -9 : 9} 108L${i < 2 ? 12 : -12} 139`}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </g>
        ))}
        <g transform={`translate(${flag},0)`} className={styles.flag}>
          <path d="M0 65V118" stroke="currentColor" strokeWidth="4" />
          <path d="M2 66L30 78L2 89Z" fill="currentColor" />
        </g>
        <text x="160" y="20" textAnchor="middle">
          A
        </text>
        <text x="640" y="20" textAnchor="middle">
          B
        </text>
      </svg>
    </div>
  );
}
