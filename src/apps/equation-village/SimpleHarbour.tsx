import { copy } from "@/lib/copy";

export default function SimpleHarbour({ restored }: { restored: boolean }) {
  return (
    <svg
      viewBox="0 0 900 510"
      role="img"
      aria-label={
        restored
          ? copy.equationVillage.restoredScene
          : copy.equationVillage.simpleScene
      }
      width="100%"
      height="100%"
    >
      <defs>
        <linearGradient id="ev-sky" x2="0" y2="1">
          <stop stopColor="#cae8eb" />
          <stop offset="1" stopColor="#eef4dc" />
        </linearGradient>
        <linearGradient id="ev-water" x2="0" y2="1">
          <stop stopColor="#79c9c2" />
          <stop offset="1" stopColor="#3693a8" />
        </linearGradient>
      </defs>
      <rect width="900" height="510" fill="url(#ev-sky)" />
      <circle cx="740" cy="84" r="35" fill="#fff3b8" />
      <path
        d="M0 230 Q120 130 260 215 T520 190 T900 220 V510H0Z"
        fill="#bad4a9"
      />
      <path
        d="M0 300 Q180 250 330 320 L300 510H0Z M900 280 Q730 260 580 325L620 510H900Z"
        fill="#7ba971"
      />
      <path
        d="M360 230 Q420 280 350 350 L280 510H650L570 340Q510 270 550 230Z"
        fill="url(#ev-water)"
      />
      {[285, 330, 390, 440].map((y, i) => (
        <path
          key={y}
          d={`M${390 - i * 19} ${y}q55 10 108 0`}
          fill="none"
          stroke="#b8ece1"
          strokeWidth="4"
          opacity=".65"
        />
      ))}
      <g transform="translate(125 170)">
        <rect x="10" y="70" width="150" height="130" rx="9" fill="#f3e4bb" />
        <path d="M-5 80L85 0L175 80Z" fill="#426d74" />
        <path
          d="M20 68L85 12L150 68"
          fill="none"
          stroke="#73999c"
          strokeWidth="6"
        />
        <rect x="65" y="126" width="40" height="74" rx="18" fill="#aa7751" />
        <rect x="25" y="103" width="25" height="30" rx="4" fill="#e0ba60" />
        <rect x="120" y="103" width="25" height="30" rx="4" fill="#e0ba60" />
      </g>
      <g transform="translate(690 122)">
        <path d="M0 135L13 12H57L70 135Z" fill="#f7edce" />
        <path d="M10 42H60L63 70H7Z" fill="#63858c" />
        <path d="M5 10L35-12L65 10Z" fill="#426d74" />
        <rect
          x="22"
          y="12"
          width="26"
          height="25"
          rx="3"
          fill={restored ? "#ffdb79" : "#b3b6a6"}
        />
      </g>
      {[50, 305, 785, 845].map((x, i) => (
        <g key={x} transform={`translate(${x} ${240 + (i % 2) * 35})`}>
          <rect x="-8" y="0" width="16" height="80" rx="5" fill="#9a7450" />
          <ellipse
            cy="-18"
            rx="42"
            ry="53"
            fill={i % 2 ? "#5a8b63" : "#68996a"}
          />
          <ellipse cx="-11" cy="-30" rx="27" ry="32" fill="#85b77a" />
        </g>
      ))}
      <g transform="translate(300 352)">
        <path d="M0 22Q150-70 300 22L300 57Q150-35 0 57Z" fill="#705b45" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={i * 25}
            y={-Math.sin((i / 11) * Math.PI) * 48 + 12}
            width="23"
            height="25"
            rx="3"
            fill={restored || i < 4 || i > 7 ? "#d2aa76" : "#4c91a0"}
            opacity={restored || i < 4 || i > 7 ? 1 : 0.25}
          />
        ))}
        <path
          d="M0 8Q150-80 300 8"
          fill="none"
          stroke="#ad8659"
          strokeWidth="8"
        />
        {[0, 75, 225, 300].map((x) => (
          <path
            key={x}
            d={`M${x} ${-Math.sin((x / 300) * Math.PI) * 48 - 5}v45`}
            stroke="#98714c"
            strokeWidth="9"
            strokeLinecap="round"
          />
        ))}
      </g>
      <g transform="translate(225 365)">
        <ellipse cy="25" rx="31" ry="8" fill="#345e5a" opacity=".2" />
        <ellipse cy="-3" rx="23" ry="29" fill="#e0ad50" />
        <ellipse cy="6" rx="16" ry="20" fill="#fff1ca" />
        <circle cx="5" cy="-28" r="22" fill="#e5b956" />
        <path d="M20-30L38-23L20-18Z" fill="#9d6942" />
        <circle cx="12" cy="-32" r="3" fill="#263e46" />
        <path d="M-10-43Q10-62 24-42Z" fill="#3b747b" />
        <path
          d="M-15-43H29"
          stroke="#3b747b"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
