/** Small, code-native landmarks keep the quest map sharp on classroom projectors. */
export function WorldMark({ world }: { world: number }) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {world === 1 ? (
        <>
          <path d="M8 58H92M18 51v14M39 51v14M61 51v14M82 51v14M24 38V22L38 12l14 10v16M31 38V28h14v10" />
          <path d="M18 47Q39 14 61 47" strokeDasharray="4 4" />
          <circle cx="61" cy="47" r="5" fill="var(--color-highlight)" />
        </>
      ) : world === 2 ? (
        <>
          <rect x="24" y="8" width="44" height="62" rx="4" />
          <rect
            x="32"
            y="34"
            width="28"
            height="27"
            rx="2"
            fill="var(--color-paper)"
          />
          <path d="M46 35v26M36 19h20M78 51V25m-5 6 5-6 5 6" />
          <circle cx="46" cy="24" r="2" fill="var(--color-highlight)" />
        </>
      ) : world === 3 ? (
        <>
          <path
            d="M8 61q10-7 20 0t20 0t20 0t20 0M17 46Q30 11 44 46M44 46Q58 11 74 46"
            strokeDasharray="4 4"
          />
          <ellipse cx="18" cy="50" rx="10" ry="4" />
          <ellipse cx="46" cy="50" rx="10" ry="4" />
          <ellipse cx="76" cy="50" rx="10" ry="4" />
          <path d="M76 45V12l15 7-15 7" fill="var(--color-highlight)" />
        </>
      ) : world === 4 ? (
        <>
          <rect
            x="14"
            y="18"
            width="32"
            height="46"
            rx="5"
            transform="rotate(-9 30 40)"
          />
          <rect
            x="54"
            y="14"
            width="32"
            height="46"
            rx="5"
            transform="rotate(9 70 36)"
            fill="var(--color-paper)"
          />
          <path d="M23 41h14M63 37h14m-7-7v14M43 9l3 5M48 66l-3 5" />
        </>
      ) : world === 5 ? (
        <>
          <path d="M16 66V24h10V14h10v10h10v42M54 66V24h10V14h10v10h10v42M12 66h76M46 36h8M32 66V52h36v14" />
          <path d="M47 27V7l17 7-17 7" fill="var(--color-highlight)" />
          <path d="M26 35h9M65 35h9" />
        </>
      ) : (
        <>
          <path d="M24 9h36l15 15v45H24zM60 9v15h15M33 34h30M33 44h19M33 54h15" />
          <path
            d="m51 58 25-25 7 7-25 25-10 3z"
            fill="var(--color-highlight)"
          />
          <path d="m73 36 7 7" />
        </>
      )}
    </svg>
  );
}
