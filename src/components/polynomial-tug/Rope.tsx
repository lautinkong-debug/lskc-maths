import { copy } from "@/lib/copy";
import type { MatchSummary } from "@/lib/polynomial-tug/types";
import styles from "./Tug.module.css";
const c = copy.polynomialTug;
export function Rope({ match }: { match?: MatchSummary }) {
  const position = match?.position ?? 0;
  return (
    <div
      className={styles.rope}
      data-testid="tug-rope"
      data-position={position}
    >
      <svg
        viewBox="0 0 800 252"
        role="img"
        aria-label={`${c.rope}: ${position}`}
      >
        <rect width="800" height="252" rx="30" fill="#ddf3ff" />
        <circle cx="680" cy="47" r="26" fill="#ffc857" />
        <g fill="#fff" opacity=".88">
          <path d="M30 55a18 18 0 0 1 30-14a24 24 0 0 1 44 8a15 15 0 0 1 6 29H35a12 12 0 0 1-5-23Z" />
          <path d="M480 40a14 14 0 0 1 24-11a18 18 0 0 1 33 6a12 12 0 0 1 5 23h-56a10 10 0 0 1-6-18Z" />
        </g>
        <path
          d="M0 184Q110 100 245 173Q330 130 400 178Q540 95 800 170V252H0Z"
          fill="#bee9e4"
        />
        <path d="M0 204Q210 178 366 202L350 252H0Z" fill="#25bca6" />
        <path d="M800 204Q590 178 434 202L450 252H800Z" fill="#ff8fa0" />
        <path
          d="M365 206Q400 220 435 206M370 230Q400 240 430 230"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          opacity=".7"
        />
        <path
          d="M160 86V208M640 86V208"
          stroke="#202153"
          strokeWidth="3"
          strokeDasharray="5 6"
          opacity=".35"
        />
        <path
          d="M400 76V195"
          stroke="#5b3fd6"
          strokeDasharray="4 6"
          opacity=".3"
        />
        <rect x="126" y="35" width="68" height="34" rx="17" fill="#08786e" />
        <rect x="606" y="35" width="68" height="34" rx="17" fill="#a83353" />
        <g fill="white" fontSize="22" fontWeight="800" textAnchor="middle">
          <text x="160" y="60">
            A
          </text>
          <text x="640" y="60">
            B
          </text>
        </g>
        <path
          d="M85 155Q400 172 715 155"
          fill="none"
          stroke="#94622c"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M85 152Q400 169 715 152"
          fill="none"
          stroke="#ffe3a0"
          strokeWidth="3"
          strokeDasharray="8 6"
        />
        {[95, 208, 592, 705].map((x, i) => {
          const left = i < 2,
            pair = match?.pairs[left ? 0 : 1];
          return (
            <g
              key={i}
              className={styles.crew}
              opacity={!match || match.occupied[i] ? 1 : 0.24}
              transform={`translate(${x + position * 1.2}, 144)`}
            >
              {pair?.shield && (
                <path
                  d="M-52-46Q0-65 52-46V5Q42 49 0 61Q-42 49-52 5Z"
                  fill="#bdeeff"
                  fillOpacity=".35"
                  stroke="#5b3fd6"
                  strokeWidth="4"
                />
              )}
              {pair?.armed && (
                <path
                  d="M-38-58L-27-72L-30-55L-17-57L-32-39L-29-55Z"
                  fill="#ffc857"
                  stroke="#906208"
                  strokeWidth="2"
                />
              )}
              <ellipse cy="55" rx="40" ry="7" fill="#202153" opacity=".13" />
              <path
                d="M-19 30L-25 48M19 30L28 48"
                stroke="#202153"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M-29 7L-45 17M29 7L45 14"
                stroke={left ? "#08786e" : "#a83353"}
                strokeWidth="12"
                strokeLinecap="round"
              />
              <rect
                x="-34"
                y="-28"
                width="68"
                height="70"
                rx="25"
                fill={left ? "#16cdb8" : "#ff6b7b"}
                stroke={left ? "#08786e" : "#a83353"}
                strokeWidth="3"
              />
              <path
                d={
                  left
                    ? "M-28-22L-31-45L-9-29M10-29L30-44L28-19"
                    : "M-29-18Q-47-42-22-35M27-18Q46-42 21-35"
                }
                fill={left ? "#16cdb8" : "#ffc857"}
                stroke={left ? "#08786e" : "#a83353"}
                strokeWidth="3"
              />
              <rect
                x="-25"
                y="-12"
                width="50"
                height="29"
                rx="13"
                fill="#fff"
              />
              <ellipse cx="-11" cy="1" rx="4" ry="6" fill="#202153" />
              <ellipse cx="11" cy="1" rx="4" ry="6" fill="#202153" />
              <path
                d="M-6 22Q0 28 6 22"
                stroke="#202153"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <path d="M-28-20H28" stroke="#ffc857" strokeWidth="7" />
            </g>
          );
        })}
        <g
          transform={`translate(${400 + position * 10}, 0)`}
          className={styles.flag}
        >
          <path
            d="M0 135V189"
            stroke="#202153"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M2 135L29 148L2 162Z"
            fill="#ffc857"
            stroke="#906208"
            strokeWidth="2"
          />
          <circle cy="132" r="5" fill="#5b3fd6" />
        </g>
      </svg>
    </div>
  );
}
