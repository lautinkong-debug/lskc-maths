export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" className={className} aria-hidden="true">
      <rect width="320" height="176" className="fill-navy-wash" />
      <path
        d="M0 32H320M0 64H320M0 96H320M0 128H320M0 160H320M32 0V176M64 0V176M96 0V176M128 0V176M160 0V176M192 0V176M224 0V176M256 0V176M288 0V176"
        className="stroke-grid"
      />
      <path
        d="M112 48H208Q227 48 233 68L249 117Q253 135 239 141Q230 145 220 137L191 114H129L100 137Q90 145 81 141Q67 135 71 117L87 68Q93 48 112 48Z"
        className="fill-navy stroke-navy-deep"
        strokeWidth="4"
      />
      <path
        d="M112 66V94M98 80H126"
        className="stroke-paper"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="201" cy="82" r="9" className="fill-highlight" />
      <circle cx="218" cy="68" r="7" className="fill-crimson" />
      <path
        d="M150 78H170M150 86H170"
        className="stroke-navy-soft"
        strokeWidth="3"
      />
    </svg>
  );
}
