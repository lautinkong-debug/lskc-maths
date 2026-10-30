export default function Thumbnail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 225" aria-hidden="true">
      <rect width="400" height="225" fill="#d9ecdf" />
      <path d="M165 0H240L290 225H110Z" fill="#66b5bd" />
      <path
        d="M40 145Q200 30 360 145"
        fill="none"
        stroke="#856a4a"
        strokeWidth="25"
      />
      <path
        d="M40 120Q200 5 360 120"
        fill="none"
        stroke="#c1a178"
        strokeWidth="8"
      />
      <path
        d="M55 100V160M345 100V160M105 75V125M295 75V125"
        stroke="#967951"
        strokeWidth="9"
      />
      <rect x="103" y="145" width="194" height="54" rx="14" fill="#fbfcf8" />
      <text
        x="200"
        y="180"
        textAnchor="middle"
        fill="#0f4574"
        fontSize="29"
        fontFamily="serif"
      >
        2x + 3 = 11
      </text>
      <circle cx="60" cy="62" r="34" fill="#77a672" />
      <circle cx="350" cy="54" r="27" fill="#689a6c" />
    </svg>
  );
}
