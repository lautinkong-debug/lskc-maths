import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "out/circle-properties");
const port = Number(process.argv[2] ?? 3217);
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/apps/circle-properties", ["index.html", "text/html; charset=utf-8"]],
  ["/Circle-Lab.html", ["Circle-Lab.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/app.css", ["app.css", "text/css; charset=utf-8"]],
  ["/theme.css", ["theme.css", "text/css; charset=utf-8"]],
]);

createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const file = files.get(pathname);
  if (!file) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  try {
    const data = await readFile(resolve(output, file[0]));
    response.writeHead(200, {
      "Content-Type": file[1],
      "Cache-Control": "no-store",
    });
    response.end(data);
  } catch {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Build Circle Lab first: node scripts/build-circle-lab.mjs");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Circle Lab: http://127.0.0.1:${port}`);
});
