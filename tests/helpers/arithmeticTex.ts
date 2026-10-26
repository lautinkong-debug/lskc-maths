/** Read generated arithmetic independently, including nested printed fractions. */
export function arithmeticTex(tex: string): string {
  let text = tex
    .replace(/\\dfrac/g, "\\frac")
    .replace(/\\textcolor\{#[\da-f]+\}\{([+-])\}/gi, "$1")
    .replace(/\\left|\\right/g, "")
    .replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "$1/$2")
    .replace(/\\,/g, " ")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷");
  const group = (start: number) => {
    if (text[start] !== "{")
      throw new Error(`Expected fraction argument: ${tex}`);
    let end = start + 1,
      depth = 1;
    while (end < text.length && depth) {
      if (text[end] === "{") depth++;
      if (text[end] === "}") depth--;
      end++;
    }
    if (depth) throw new Error(`Unclosed fraction argument: ${tex}`);
    return { value: text.slice(start + 1, end - 1), end };
  };
  while (text.includes("\\frac{")) {
    const start = text.indexOf("\\frac{");
    const numerator = group(start + 5),
      denominator = group(numerator.end);
    text =
      text.slice(0, start) +
      `(${arithmeticTex(numerator.value)})÷(${arithmeticTex(denominator.value)})` +
      text.slice(denominator.end);
  }
  return text;
}
