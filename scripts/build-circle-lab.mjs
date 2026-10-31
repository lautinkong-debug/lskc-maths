import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "out/circle-properties");
await mkdir(output, { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: ["src/apps/circle-properties/standalone.tsx"],
  bundle: true,
  minify: true,
  outfile: resolve(output, "app.js"),
  format: "iife",
  target: ["es2020"],
  loader: {
    ".module.css": "local-css",
    ".woff2": "dataurl",
    ".woff": "dataurl",
    ".ttf": "dataurl",
  },
  define: { "process.env.NODE_ENV": '"production"' },
  jsx: "automatic",
  tsconfig: "tsconfig.json",
});

const globals = await readFile(resolve(root, "src/app/globals.css"), "utf8");
const tokens = globals.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1];
if (!tokens) throw new Error("Shared school design tokens were not found.");
const theme = `
:root {${tokens}
  --font-spectral: Georgia;
  --font-plex-sans: Arial;
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; padding: 24px; background: var(--color-paper); color: var(--color-graphite); font-family: var(--font-sans); line-height: 1.6; }
#root { max-width: 1440px; margin: auto; }
h1, h2, h3, p, figure { margin: 0; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: default; }
svg { max-width: 100%; }
:focus-visible { outline: 3px solid var(--color-navy); outline-offset: 3px; box-shadow: 0 0 0 5px var(--color-highlight); }
@media (max-width: 600px) { body { padding: 12px; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }
`;
await writeFile(resolve(output, "theme.css"), theme);

const head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Circle Lab | LSKC Mathematics</title>';
await writeFile(
  resolve(output, "index.html"),
  `${head}<link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script src="/app.js" defer></script></body></html>`,
);

const [javascript, stylesheet] = await Promise.all([
  readFile(resolve(output, "app.js"), "utf8"),
  readFile(resolve(output, "app.css"), "utf8"),
]);
// A distributable lesson that works from file:// with no CDN or textbook assets.
// Protect the enclosing raw-text elements against accidental closing tags.
const safeScript = javascript.replace(/<\/script/gi, "<\\/script");
const safeStyle = `${theme}\n${stylesheet}`.replace(/<\/style/gi, "<\\/style");
await writeFile(
  resolve(output, "Circle-Lab.html"),
  `${head}<style>${safeStyle}</style></head><body><div id="root"></div><script>${safeScript}</script></body></html>`,
);
console.log(`Circle Lab built: ${resolve(output, "Circle-Lab.html")}`);
