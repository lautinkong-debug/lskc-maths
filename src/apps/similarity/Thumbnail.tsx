export default function SimilarityThumbnail({
  className,
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 320 180" className={className} aria-hidden="true">
      <path
        d="M55 135V40L180 135Z M55 40H105V5Z"
        fill="var(--color-navy-wash)"
        stroke="var(--color-navy)"
        strokeWidth="3"
      />
      <path
        d="M215 135V65L295 135Z"
        fill="var(--color-crimson-wash)"
        stroke="var(--color-crimson)"
        strokeWidth="3"
      />
      <path
        d="M140 55Q200 20 240 45m-12-15 12 15-18 3"
        fill="none"
        stroke="var(--color-pencil)"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
    </svg>
  );
}
