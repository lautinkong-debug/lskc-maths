export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 240" className={className} aria-hidden="true">
      <g stroke="var(--color-navy)" strokeWidth="2" strokeLinejoin="round">
        <path
          d="M55 140 L55 90 L105 90 L135 140Z"
          fill="var(--color-highlight)"
        />
        <path
          d="M55 90 L110 55 L160 55 L105 90 M105 90 L160 55 L190 105 L135 140"
          fill="var(--color-navy-soft)"
        />
        <path d="M218 112h22m-8-7 8 7-8 7" fill="none" />
        <path d="M267 65h160v104H267Z" fill="var(--color-navy-wash)" />
        <path d="M303 65v104m29-104v104m58-104v104" fill="none" />
        <path d="M267 183v8h160v-8" fill="none" />
      </g>
    </svg>
  );
}
