export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="320" height="180" rx="12" fill="var(--color-navy-wash)" />
      <path
        d="M30 125H290M160 110v35"
        stroke="var(--color-grid-strong)"
        strokeWidth="2"
      />
      <text
        x="160"
        y="78"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="38"
        fill="var(--color-navy)"
      >
        3x + 13 = 25
      </text>
      <text
        x="160"
        y="132"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="26"
        fill="var(--color-navy)"
      >
        x = ?
      </text>
    </svg>
  );
}
