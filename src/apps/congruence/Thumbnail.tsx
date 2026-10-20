export default function CongruenceThumbnail({
  className,
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 320 180" className={className} aria-hidden="true">
      <path
        d="M55 131 112 43 166 131Z"
        fill="var(--color-navy-wash)"
        stroke="var(--color-navy)"
        strokeWidth="3"
      />
      <path
        d="M154 131 211 43 265 131Z"
        fill="none"
        stroke="var(--color-crimson)"
        strokeWidth="3"
        strokeDasharray="7 4"
      />
      <path
        d="m77 84 10 7m145 40v-9m-99 9v-9m45-47 10 7"
        stroke="var(--color-navy)"
        strokeWidth="3"
      />
      <text
        x="160"
        y="159"
        textAnchor="middle"
        fill="var(--color-navy)"
        fontSize="23"
      >
        ≅
      </text>
    </svg>
  );
}
