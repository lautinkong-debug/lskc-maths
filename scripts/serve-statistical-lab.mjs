import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
const files = {
  "/": ["index.html", "text/html"],
  "/index.html": ["index.html", "text/html"],
  "/app.js": ["app.js", "text/javascript"],
  "/app.css": ["app.css", "text/css"],
  "/theme.css": ["theme.css", "text/css"],
};
createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const font = /^\/fonts\/[A-Za-z0-9_-]+\.(woff2?|ttf)$/.test(pathname);
  const file =
    files[pathname] ??
    (font
      ? [
          pathname.slice(1),
          pathname.endsWith("woff2")
            ? "font/woff2"
            : pathname.endsWith("woff")
              ? "font/woff"
              : "font/ttf",
        ]
      : undefined);
  if (!file) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    const data = await readFile(`out/statistical-charts/${file[0]}`);
    res.writeHead(200, { "Content-Type": file[1] });
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end("Build the lab first with npm run build:statistics.");
  }
}).listen(Number(process.argv[2] ?? 3216), "127.0.0.1", () =>
  console.log(
    `Statistical Charts Lab: http://127.0.0.1:${process.argv[2] ?? 3216}`,
  ),
);
