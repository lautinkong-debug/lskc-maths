import katex from "katex";

type MathProps = {
  /** TeX source, e.g. `y = ax^2 + bx + c`. */
  children: string;
  /** Centred block instead of inline. */
  display?: boolean;
  className?: string;
  /** What a screen reader should say. Defaults to the TeX source. */
  label?: string;
};

/**
 * Renders mathematical notation with KaTeX.
 *
 * The HTML here is produced by KaTeX from TeX, never from raw user HTML:
 * `trust: false` means KaTeX refuses commands that could inject markup, and
 * `strict: false` keeps it quiet about non-fatal TeX quirks rather than
 * throwing in front of a class.
 */
export function Math({
  children,
  display = false,
  className,
  label,
}: MathProps) {
  const html = katex.renderToString(children, {
    displayMode: display,
    throwOnError: false,
    trust: false,
    strict: false,
    output: "html",
  });

  const Tag = display ? "div" : "span";

  return (
    <Tag
      className={className}
      role="math"
      aria-label={label ?? children}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
