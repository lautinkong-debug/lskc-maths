import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
// esbuild is already pinned in the existing dependency lockfile via the tooling.
await mkdir("out/statistical-charts", { recursive: true });
await build({
  entryPoints: ["src/apps/statistical-charts/standalone.tsx"],
  bundle: true,
  minify: true,
  outfile: "out/statistical-charts/app.js",
  loader: {
    ".module.css": "local-css",
    ".woff2": "file",
    ".woff": "file",
    ".ttf": "file",
  },
  assetNames: "fonts/[name]-[hash]",
  define: { "process.env.NODE_ENV": '"production"' },
  jsx: "automatic",
  tsconfig: "tsconfig.json",
});
const css = await readFile("src/app/globals.css", "utf8");
const tokens = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1];
if (!tokens) throw new Error("Shared design tokens not found");
await writeFile(
  "out/statistical-charts/theme.css",
  `:root {${tokens}\n--font-spectral: Georgia; --font-plex-sans: Arial;} body { margin:0; padding:24px; background:var(--color-paper); color:var(--color-graphite); font-family:var(--font-sans); } #root {max-width:1400px;margin:auto} header {padding:0 0 20px} header p {font-size:14px;color:var(--color-navy)} h1 {font-family:var(--font-display);font-size:clamp(30px,5vw,48px);margin:12px 0;color:var(--color-navy)} :focus-visible {outline:3px solid var(--color-navy);outline-offset:3px;box-shadow:0 0 0 5px var(--color-highlight)} @media(max-width:520px){body{padding:14px}}`,
);
await writeFile(
  "out/statistical-charts/index.html",
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LSKC Statistical Charts Lab</title><link rel="stylesheet" href="theme.css"><link rel="stylesheet" href="app.css"></head><body><div id="root"></div><script src="app.js" defer></script></body></html>',
);
console.log("Standalone app built: out/statistical-charts/index.html");
