export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" className={className} aria-hidden="true">
      <path
        d="M0 88H320M160 0V176"
        className="stroke-grid-strong"
        strokeWidth="2"
      />
      <circle
        cx="160"
        cy="88"
        r="68"
        className="stroke-navy"
        fill="none"
        strokeWidth="3"
      />
      <path
        d="M160 88L208 40V88Z"
        className="fill-navy-wash stroke-navy"
        strokeWidth="2"
      />
      <path
        d="M208 40V88"
        className="stroke-navy"
        strokeWidth="3"
        strokeDasharray="5 4"
      />
      <circle
        cx="208"
        cy="40"
        r="7"
        className="fill-highlight stroke-navy"
        strokeWidth="2"
      />
    </svg>
  );
}
