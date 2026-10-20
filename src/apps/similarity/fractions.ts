/** Recognise textbook ratios without treating the parallel sign // as division. */
const atom = String.raw`(?:[Pp]erimeter\([A-Z]+\)|[Aa]rea\([A-Z]+\)|\([^()]+\)|(?:\d+(?:\.\d+)?(?:√\d+)?|√\d+)[a-z]?|[A-Z][A-Z0-9]{0,11}|[a-z])`;
export function fractionTokens(text: string) {
  const pattern = new RegExp(
    String.raw`(?<![\w/])(${atom})\s*\/\s*(${atom})(?![\w/])`,
    "g",
  );
  const parts: { text: string; numerator?: string; denominator?: string }[] =
    [];
  let at = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > at) parts.push({ text: text.slice(at, match.index) });
    parts.push({ text: match[0], numerator: match[1], denominator: match[2] });
    at = match.index! + match[0].length;
  }
  if (at < text.length) parts.push({ text: text.slice(at) });
  return parts;
}
export function fractionTermTex(term: string): string {
  const stripped = term.replace(/^\((.*)\)$/, "$1");
  return fractionTokens(stripped)
    .map((part) =>
      part.numerator !== undefined
        ? `\\dfrac{${fractionTermTex(part.numerator)}}{${fractionTermTex(part.denominator!)}}`
        : part.text
            .replace(
              /([Pp]erimeter|[Aa]rea)\(([A-Z]+)\)/g,
              "\\operatorname{$1}(\\mathit{$2})",
            )
            .replace(/√(\d+(?:\.\d+)?)/g, "\\sqrt{$1}")
            .replace(/×/g, "\\times ")
            .replace(/−/g, "-"),
    )
    .join("");
}
