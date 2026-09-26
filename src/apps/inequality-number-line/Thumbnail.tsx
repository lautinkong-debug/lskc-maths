export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" className={className} aria-hidden="true">
      <path
        d="M0 44H320M0 88H320M0 132H320M64 0V176M128 0V176M192 0V176M256 0V176"
        className="stroke-grid"
      />
      <path d="M25 88H295" className="stroke-grid-strong" strokeWidth="3" />
      <path
        d="M98 88H226"
        className="stroke-navy"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle
        cx="98"
        cy="88"
        r="9"
        className="stroke-navy fill-white"
        strokeWidth="4"
      />
      <circle cx="226" cy="88" r="9" className="fill-navy" />
      <path d="M98 78V98M226 78V98" className="stroke-navy" strokeWidth="2" />
    </svg>
  );
}
