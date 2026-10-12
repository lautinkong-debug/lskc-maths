import styles from "./MagnitudeCalculation.module.css";

type Picture =
  | "credit"
  | "debt"
  | "settled"
  | "receive"
  | "pay"
  | "borrow"
  | "repay"
  | "unchanged";

/** Symbolic pictures; the exact amount is printed beside each one. */
export function MoneyPicture({ kind }: { kind: Picture }) {
  const debt = kind === "debt" || kind === "borrow" || kind === "repay";
  const transaction = kind === "receive" || kind === "pay";
  return (
    <svg
      viewBox="0 0 96 76"
      className={styles.picture}
      aria-hidden="true"
      focusable="false"
      data-money-picture={kind}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {debt ? (
        <>
          <path d="M22 6H60L74 20V68H22Z" fill="#fff4f4" />
          <path d="M60 6V20H74" />
          <circle cx="48" cy="36" r="11" fill="white" />
          <path d="M42 36H54M33 55H62M33 60H51" />
          {kind === "borrow" && (
            <g className={styles.pictureAction}>
              <circle cx="76" cy="54" r="13" fill="white" />
              <path d="M70 54H82M76 48V60" />
            </g>
          )}
          {kind === "repay" && (
            <g className={styles.pictureAction}>
              <path d="M17 65L77 9" strokeWidth="4" />
              <path d="M77 44V68M71 50L77 44L83 50" />
            </g>
          )}
        </>
      ) : kind === "settled" || kind === "unchanged" ? (
        <>
          <path d="M14 26H80V64H14Z" fill="#f0f5fa" />
          <path d="M14 26L70 16V26M69 41H85V53H69Z" fill="white" />
          <path d="M33 45H53" />
        </>
      ) : (
        <>
          <path d="M25 9H70V46H25Z" fill="#f0f5fa" />
          <circle cx="47" cy="26" r="9" fill="white" />
          <path d="M42 26H52M47 21V31" />
          <path d="M13 37H80V67H13Z" fill="#e8eff6" />
          <path d="M68 47H85V59H68Z" fill="white" />
          <circle cx="75" cy="53" r="1" fill="currentColor" />
          {transaction && (
            <g className={styles.pictureAction}>
              {kind === "receive" ? (
                <path d="M85 5V30M79 24L85 30L91 24" strokeWidth="3.5" />
              ) : (
                <path d="M85 30V5M79 11L85 5L91 11" strokeWidth="3.5" />
              )}
            </g>
          )}
        </>
      )}
    </svg>
  );
}
