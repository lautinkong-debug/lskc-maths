export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" className={className} aria-hidden="true">
      <path
        d="M35 20V150H295"
        fill="none"
        className="stroke-navy"
        strokeWidth="2"
      />
      <g className="fill-navy-soft stroke-navy" strokeWidth="2">
        <path d="M55 150V120H100V150Z M100 150V80H145V150Z M145 150V45H190V150Z M190 150V90H235V150Z M235 150V125H280V150Z" />
      </g>
      <path
        d="M32.5 150L77.5 120L122.5 80L167.5 45L212.5 90L257.5 125L302.5 150"
        fill="none"
        className="stroke-navy"
        strokeWidth="3"
      />
    </svg>
  );
}
