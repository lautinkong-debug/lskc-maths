export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" className={className} aria-hidden="true">
      <path
        d="M0 44H320M0 88H320M0 132H320M64 0V176M128 0V176M192 0V176M256 0V176"
        className="stroke-grid"
      />
      <path
        d="M0 112H320M160 0V176"
        className="stroke-grid-strong"
        strokeWidth="2"
      />
      <path
        d="M26 10Q128 244 278 16"
        className="stroke-navy"
        fill="none"
        strokeWidth="4"
      />
      <circle
        cx="148"
        cy="143"
        r="7"
        className="fill-highlight stroke-navy"
        strokeWidth="2"
      />
      <circle cx="75" cy="112" r="4" className="fill-navy" />
      <circle cx="226" cy="112" r="4" className="fill-navy" />
    </svg>
  );
}
