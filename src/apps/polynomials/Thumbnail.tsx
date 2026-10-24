export default function PolynomialsThumbnail({
  className,
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 320 180" className={className} aria-hidden="true">
      <path
        d="M44 62H276M44 116H276M116 32V146M196 32V146"
        stroke="var(--color-grid)"
        strokeWidth="2"
      />
      <rect
        x="120"
        y="66"
        width="72"
        height="46"
        rx="4"
        fill="var(--color-highlight)"
      />
      <g
        fill="var(--color-navy)"
        fontFamily="Georgia, serif"
        fontStyle="italic"
        fontSize="28"
        textAnchor="middle"
      >
        <text x="156" y="52">
          3x
        </text>
        <text x="236" y="52">
          4
        </text>
        <text x="80" y="98">
          3x
        </text>
        <text x="156" y="98">
          9x²
        </text>
        <text x="236" y="98">
          12x
        </text>
        <text x="80" y="144">
          4
        </text>
        <text x="156" y="144">
          12x
        </text>
        <text x="236" y="144">
          16
        </text>
      </g>
    </svg>
  );
}
