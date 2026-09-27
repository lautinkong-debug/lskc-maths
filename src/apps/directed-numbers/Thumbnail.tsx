export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" className={className} aria-hidden="true">
      <path
        d="M0 44H320M0 88H320M0 132H320M64 0V176M128 0V176M192 0V176M256 0V176"
        className="stroke-grid"
      />
      <path
        d="M25 115H295M75 108V122M130 108V122M185 108V122M240 108V122"
        className="stroke-grid-strong"
        strokeWidth="2"
      />
      <path
        d="M75 110Q155 5 240 110"
        className="stroke-navy"
        fill="none"
        strokeWidth="3"
        strokeDasharray="6 5"
      />
      <path
        d="M75 103l4 8h9l-7 5 3 9-9-6-8 6 3-9-7-5h9Z M265 30l3 6h7l-5 4 2 7-7-4-6 4 2-7-5-4h7Z"
        className="fill-highlight stroke-graphite"
      />
      <circle cx="240" cy="115" r="7" className="fill-navy" />
    </svg>
  );
}
