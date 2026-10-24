/** Export the exact diagram state, resolving CSS tokens for a standalone file. */
export async function downloadDiagram(
  svg: SVGSVGElement,
  format: "svg" | "png",
  filename: string,
) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originals = [svg, ...svg.querySelectorAll("*")];
  const copies = [clone, ...clone.querySelectorAll("*")];
  const properties = [
    "fill",
    "stroke",
    "stroke-width",
    "fill-opacity",
    "stroke-opacity",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-anchor",
    "paint-order",
  ];
  originals.forEach((element, i) => {
    const style = getComputedStyle(element);
    properties.forEach((name) =>
      copies[i].setAttribute(name, style.getPropertyValue(name)),
    );
    copies[i].removeAttribute("tabindex");
    copies[i].removeAttribute("role");
    copies[i].removeAttribute("aria-pressed");
  });
  const { width, height } = svg.viewBox.baseVal;
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.removeAttribute("style");
  const xml = new XMLSerializer().serializeToString(clone);
  let blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  if (format === "png") {
    const source = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = source;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 2400;
      canvas.height = Math.round((2400 * height) / width);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value ? resolve(value) : reject(new Error("PNG encoding failed")),
          "image/png",
        ),
      );
    } finally {
      URL.revokeObjectURL(source);
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
