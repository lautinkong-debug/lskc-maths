/** Build an isolated demo-only snapshot; never change the owner's .env or running app. */
import { spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  symlinkSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { resolve, join } from "node:path";

const root = process.cwd();
const out = resolve(root, "out/algebra-preview");
const site = join(out, "site");
mkdirSync(site, { recursive: true });
for (const name of [
  "src",
  "tests",
  "scripts",
  "docs",
  "rules",
  "public",
  "package.json",
  "tsconfig.json",
  "postcss.config.mjs",
  "next.config.ts",
  "next-env.d.ts",
  ".gitignore",
])
  cpSync(join(root, name), join(site, name), { recursive: true });
// The snapshot lives below out/. Limit Tailwind to application sources so it
// cannot scan sibling release snapshots or its own generated build output.
writeFileSync(
  join(site, "src/app/globals.css"),
  readFileSync(join(root, "src/app/globals.css"), "utf8").replace(
    '@import "tailwindcss";',
    '@import "tailwindcss" source("../");',
  ),
);
// Typecheck the actual site entrypoints and their imported dependencies. Other
// chats may have unfinished, unregistered app folders in the shared checkout.
const tsconfig = JSON.parse(readFileSync(join(site, "tsconfig.json"), "utf8"));
tsconfig.include = [
  "next-env.d.ts",
  "src/**/*.d.ts",
  "src/app/**/*.ts",
  "src/app/**/*.tsx",
  "src/apps/registry.ts",
  ".next/types/**/*.ts",
  ".next/dev/types/**/*.ts",
];
tsconfig.exclude = ["node_modules", "out", "tests", "**/*.test.ts"];
writeFileSync(join(site, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
if (!existsSync(join(site, "node_modules")))
  symlinkSync(
    join(root, "node_modules"),
    join(site, "node_modules"),
    "junction",
  );
// Keep the dependency junction inside Turbopack's explicitly declared root.
writeFileSync(
  join(site, "next.config.ts"),
  readFileSync(join(root, "next.config.ts"), "utf8").replace(
    "export default nextConfig;",
    `nextConfig.turbopack = { root: ${JSON.stringify(root)} };\nexport default nextConfig;`,
  ),
);
writeFileSync(
  join(site, ".env.local"),
  [
    "NEXT_PUBLIC_USE_EMULATORS=true",
    "NEXT_PUBLIC_ACCESS_MODE=public",
    "NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=lskc.edu.hk",
    "NEXT_PUBLIC_FIREBASE_API_KEY=demo-key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-lskc-maths.firebaseapp.com",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-lskc-maths",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-lskc-maths.appspot.com",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789",
    "NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:demo",
    "",
  ].join("\n"),
);
const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_USE_EMULATORS: "true",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-lskc-maths",
  GCLOUD_PROJECT: "demo-lskc-maths",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
};
delete env.FIREBASE_SERVICE_ACCOUNT_JSON;
delete env.FIREBASE_WEBAPP_CONFIG;
async function run(name, args, cwd) {
  const fd = openSync(join(out, `${name}.log`), "w");
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd,
      env,
      windowsHide: true,
      stdio: ["ignore", fd, fd],
    });
    child.on("error", reject);
    child.on("exit", resolve);
  });
  closeSync(fd);
  if (code !== 0)
    throw new Error(
      `${name} failed (${code}); see ${join(out, `${name}.log`)}`,
    );
  console.log(`${name} passed`);
}
async function responds(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1000) });
    return true;
  } catch {
    return false;
  }
}
function start(name, args, cwd) {
  const fd = openSync(join(out, `${name}.log`), "w");
  const child = spawn(process.execPath, args, {
    cwd,
    env,
    windowsHide: true,
    detached: true,
    stdio: ["ignore", fd, fd],
  });
  closeSync(fd);
  child.unref();
  console.log(`${name}: PID ${child.pid}`);
  writeFileSync(join(out, `${name}.pid`), String(child.pid));
}
await run(
  "build",
  [join(root, "node_modules/next/dist/bin/next"), "build"],
  site,
);
if (!(await responds("http://127.0.0.1:8080"))) {
  writeFileSync(
    join(out, "firebase.json"),
    JSON.stringify({
      firestore: {
        rules: join(root, "firestore.rules"),
        indexes: join(root, "firestore.indexes.json"),
      },
      emulators: {
        auth: { port: 9099 },
        firestore: { port: 8080 },
        ui: { enabled: false },
        singleProjectMode: true,
      },
    }),
  );
  start(
    "emulators",
    [
      join(root, "node_modules/firebase-tools/lib/bin/firebase.js"),
      "emulators:start",
      "--only",
      "auth,firestore",
      "--project",
      "demo-lskc-maths",
      "--config",
      join(out, "firebase.json"),
    ],
    out,
  );
}
if (await responds("http://localhost:3034"))
  throw new Error(
    "Port 3034 is occupied; the existing server was left running.",
  );
start(
  "server",
  [join(root, "node_modules/next/dist/bin/next"), "start", "-p", "3034"],
  site,
);
console.log("Preview: http://localhost:3034/apps/algebra-simplification");
