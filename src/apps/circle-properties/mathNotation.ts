export type NotationPart =
  | { kind: "text"; text: string }
  | { kind: "arc"; name: string }
  | { kind: "fraction"; numerator: string; denominator: string };

const number = String.raw`[+−-]?(?:\d+(?:\.\d+)?|\.\d+)(?:°)?`;
const phrase = String.raw`(?:centre angle|circumference angle|(?:first|second) arc length|(?:major|minor)-arc length|(?:the )?(?:longer|shorter) chord length)`;
const namedArc = String.raw`(?:(?:[Mm]inor|[Mm]ajor)\s+)?[Aa]rc\s+[A-Z]{2,3}`;
const operand = String.raw`(?:\([^()\n]+\)|${namedArc}|[A-Z]{2,3}|∠[A-Z]{3}|[θφℓxyr]|${number}|${phrase})`;
// A colon between named mathematical quantities is a ratio. Numeric colons may
// be times/scores, and a prose colon after a reason number is not division.
const ratioOperand = String.raw`(?:${namedArc}|[A-Z]{2,3}|∠[A-Z]{3}|[θφℓxyr])`;
const fractionPattern = new RegExp(
  String.raw`\\frac\{([^{}]+)\}\{([^{}]+)\}|(?<![A-Za-z0-9])(${operand})\s*[÷/]\s*(${operand})(?![A-Za-z0-9])|(?<![A-Za-z0-9])(${ratioOperand})\s*:\s*(${ratioOperand})(?![A-Za-z0-9])`,
  "g",
);

function arcs(text: string): NotationPart[] {
  const parts: NotationPart[] = [];
  const pattern =
    /\barcs?\s+([A-Z]{2,3})(?![A-Za-z])(?:\s+and\s+([A-Z]{2,3})(?![A-Za-z]))?/gi;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    // Preserve ordinary prose such as “arc and chord”; names use capitals.
    if (!/^[A-Z]{2,3}$/.test(match[1])) continue;
    if (match.index > last)
      parts.push({ kind: "text", text: text.slice(last, match.index) });
    parts.push({ kind: "arc", name: match[1] });
    if (match[2]) {
      if (/^[A-Z]{2,3}$/.test(match[2])) {
        parts.push({ kind: "text", text: " and " });
        parts.push({ kind: "arc", name: match[2] });
      } else {
        parts.push({ kind: "text", text: ` and ${match[2]}` });
      }
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

/** Only recognised mathematical operands become fractions; UI slashes stay prose. */
export function parseNotation(text: string, fractions = true): NotationPart[] {
  if (!fractions) return arcs(text);
  const parts: NotationPart[] = [];
  let last = 0;
  for (const match of text.matchAll(fractionPattern)) {
    if (match.index > last) parts.push(...arcs(text.slice(last, match.index)));
    parts.push({
      kind: "fraction",
      numerator: (match[1] ?? match[3] ?? match[5]).trim(),
      denominator: (match[2] ?? match[4] ?? match[6]).trim(),
    });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(...arcs(text.slice(last)));
  return parts;
}
