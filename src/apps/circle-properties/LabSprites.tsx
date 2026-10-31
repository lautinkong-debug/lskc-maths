import type { LabId } from "./content";

export function Orb({ happy = false }: { happy?: boolean }) {
  return (
    <svg viewBox="0 0 110 110" aria-hidden="true">
      <ellipse cx="55" cy="99" rx="32" ry="5" fill="#143b68" opacity=".09" />
      <path
        d="M26 63 10 74M84 62 101 50"
        stroke="#143b68"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle
        cx="55"
        cy="52"
        r="37"
        fill="#ffcf63"
        stroke="#143b68"
        strokeWidth="3"
      />
      <path
        d="M29 31Q53 8 78 31"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".65"
      />
      {happy ? (
        <>
          <path
            d="m35 47 7-5 6 5m14 0 7-5 6 5"
            fill="none"
            stroke="#143b68"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M43 62Q55 78 68 62Z" fill="#143b68" />
        </>
      ) : (
        <>
          <ellipse cx="43" cy="49" rx="4" ry="6" fill="#143b68" />
          <ellipse cx="68" cy="49" rx="4" ry="6" fill="#143b68" />
          <path
            d="M45 66Q55 75 67 64"
            fill="none"
            stroke="#143b68"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      <circle cx="33" cy="62" r="5" fill="#ee6b86" opacity=".5" />
      <circle cx="78" cy="62" r="5" fill="#ee6b86" opacity=".5" />
      <path
        d="m35 86-3 11m41-11 3 11"
        stroke="#143b68"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LabIcon({ id }: { id: LabId }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="32" cy="32" r="24" opacity=".5" />
      {id === "bisector" && (
        <>
          <path d="M11 21h42M32 32V21m0 5h5v-5" />
          <circle cx="32" cy="21" r="4" fill="currentColor" />
        </>
      )}
      {id === "chords" && (
        <>
          <path d="M12 20h40M12 44h40M32 20v24" />
          <path d="m28 20v4h4m-4 20v-4h4" />
        </>
      )}
      {id === "centre" && (
        <>
          <path d="m12 46 20-38 20 38-20-14Z" />
          <path d="M28 17q4 4 8 0M25 37q7 5 14 0" />
        </>
      )}
      {id === "segment" && (
        <>
          <path d="m12 45 13-36 27 36-11-35-29 35h40" />
        </>
      )}
      {id === "semicircle" && (
        <>
          <path d="m8 32 34-22 14 22H8m29-19 4 6 5-3" />
        </>
      )}
      {id === "equal-arcs" && (
        <>
          <path d="m15 15 34 0-17 17-17-17m0 34h34L32 32Z" />
        </>
      )}
      {id === "ratios" && (
        <>
          <path d="M32 8v24l23 8M32 32 11 44" />
          <path d="M32 12a20 20 0 0 1 20 26" strokeWidth="5" />
        </>
      )}
    </svg>
  );
}

export function Star({ filled = true }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8L2.2 9.2l6.8-1Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
