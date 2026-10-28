export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" className={className} aria-hidden="true">
      <path
        d="M0 44H320M0 88H320M0 132H320M64 0V176M128 0V176M192 0V176M256 0V176"
        className="stroke-grid"
      />
      <text
        x="35"
        y="66"
        fontSize="31"
        className="fill-navy"
        fontFamily="Georgia, serif"
      >
        4x − x + 5
      </text>
      <path
        d="M41 78H141M90 86V105"
        className="stroke-navy"
        fill="none"
        strokeWidth="2"
      />
      <text
        x="63"
        y="143"
        fontSize="34"
        className="fill-navy"
        fontFamily="Georgia, serif"
      >
        3x + 5
      </text>
      <path
        d="M229 113l13 13 25-34"
        className="stroke-navy"
        fill="none"
        strokeWidth="5"
      />
    </svg>
  );
}
