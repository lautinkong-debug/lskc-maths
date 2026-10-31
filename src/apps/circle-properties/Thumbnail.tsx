export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" className={className} aria-hidden="true">
      <rect width="320" height="176" className="fill-navy-wash" />
      <circle
        cx="160"
        cy="88"
        r="66"
        fill="none"
        className="stroke-navy"
        strokeWidth="2.5"
      />
      <path
        d="M103 121L160 22L217 121M103 121L160 88L217 121"
        fill="none"
        className="stroke-navy"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M103 121H217"
        className="stroke-crimson"
        strokeWidth="3"
      />
      <path
        d="M150 39Q160 47 170 39M143 98Q160 113 177 98"
        fill="none"
        className="stroke-crimson"
        strokeWidth="2.5"
      />
      {[[103, 121], [160, 22], [217, 121]].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="6"
          className="fill-highlight stroke-navy"
          strokeWidth="2"
        />
      ))}
      <circle cx="160" cy="88" r="4" className="fill-navy" />
    </svg>
  );
}
