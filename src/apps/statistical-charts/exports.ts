export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
/** Inline computed SVG paint/font styles so files work without the app stylesheet. */
export function svgDocument(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originals = [svg, ...svg.querySelectorAll("*")];
  const copies = [clone, ...clone.querySelectorAll("*")];
  const styles = [
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linejoin",
    "stroke-linecap",
    "stroke-dasharray",
    "opacity",
    "font-family",
    "font-size",
    "font-weight",
    "font-variant-numeric",
  ];
  originals.forEach((node, i) => {
    const computed = getComputedStyle(node);
    for (const key of styles)
      (copies[i] as SVGElement).style.setProperty(
        key,
        computed.getPropertyValue(key),
      );
    copies[i].removeAttribute("class");
    copies[i].removeAttribute("tabindex");
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(svg.viewBox.baseVal.width));
  clone.setAttribute("height", String(svg.viewBox.baseVal.height));
  for (const text of clone.querySelectorAll("[data-export-text]")) {
    text.textContent = text.getAttribute("data-export-text");
    if (
      (text.textContent?.length ?? 0) >
      (svg.viewBox.baseVal.width < 520 ? 32 : 60)
    ) {
      text.setAttribute("textLength", String(svg.viewBox.baseVal.width - 100));
      text.setAttribute("lengthAdjust", "spacingAndGlyphs");
    }
  }
  return new XMLSerializer().serializeToString(clone);
}
export async function exportChart(
  svg: SVGSVGElement,
  format: "svg" | "png",
  filename: string,
) {
  const blob = new Blob([svgDocument(svg)], {
    type: "image/svg+xml;charset=utf-8",
  });
  if (format === "svg") {
    download(blob, `${filename}.svg`);
    return;
  }
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = svg.viewBox.baseVal.width * 2;
    canvas.height = svg.viewBox.baseVal.height * 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const png = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("png"))),
        "image/png",
      ),
    );
    download(png, `${filename}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
