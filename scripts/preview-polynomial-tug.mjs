/** Local-only preview and integration verification. Run: node scripts/preview-polynomial-tug.mjs */
import { spawn } from "node:child_process";
import {
  closeSync,
  cpSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidence = join(root, "out/polynomial-tug-preview");
const site = existsSync(join(root, "out/polynomial-tug-release/site/.env.local"))
  ? join(root, "out/polynomial-tug-release/site")
  : join(root, "out/polynomial-quest-preview/site");
const baseURL = "http://localhost:3030";
const snapshotEnv = join(site, ".env.local");
if (!existsSync(snapshotEnv))
  throw new Error("The isolated Polynomial Quest snapshot is missing.");
const config = parse(readFileSync(snapshotEnv));
if (
  config.NEXT_PUBLIC_USE_EMULATORS !== "true" ||
  config.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-lskc-maths"
)
  throw new Error(
    "This launcher requires the demo-lskc-maths emulator snapshot.",
  );
const env = {
  ...process.env,
  NEXT_PUBLIC_USE_EMULATORS: "true",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-lskc-maths",
  GCLOUD_PROJECT: "demo-lskc-maths",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  PLAYWRIGHT_BASE_URL: baseURL,
};
delete env.FIREBASE_SERVICE_ACCOUNT_JSON;
mkdirSync(evidence, { recursive: true });
const logPath = (name) => join(evidence, `${name}.log`);
const report = {
  status: "running",
  startedAt: new Date().toISOString(),
  baseURL,
  checks: [],
};
const saveReport = () =>
  writeFileSync(
    join(evidence, "local-run.json"),
    JSON.stringify(report, null, 2),
  );
saveReport();

async function responds(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2000) });
    return true;
  } catch {
    return false;
  }
}
async function ready(url, label) {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    if (await responds(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`${label} did not start. Read its log in ${evidence}.`);
}
function service(name, args, cwd) {
  const fd = openSync(logPath(name), "w");
  const child = spawn(process.execPath, args, {
    cwd,
    env,
    windowsHide: true,
    detached: true,
    stdio: ["ignore", fd, fd],
  });
  child.on("error", (error) => console.error(`${name}: ${error.message}`));
  closeSync(fd);
  child.unref();
  console.log(`${name}: PID ${child.pid}; log ${logPath(name)}`);
}
async function check(name, args, cwd = root) {
  console.log(`Running ${name}…`);
  const fd = openSync(logPath(name), "w");
  let code;
  try {
    code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd,
        env,
        windowsHide: true,
        stdio: ["ignore", fd, fd],
      });
      child.once("error", reject);
      child.once("exit", resolve);
    });
  } finally {
    closeSync(fd);
  }
  report.checks.push({ name, exitCode: code });
  saveReport();
  if (code !== 0) throw new Error(`${name} failed. Read ${logPath(name)}.`);
  console.log(`${name}: passed`);
}
try {
  // Never replace an existing process or reset a shared emulator.
  if (await responds(baseURL))
    throw new Error(
      "Port 3030 is already in use. Close that preview before rerunning this launcher.",
    );
  const [auth, firestore] = await Promise.all([
    responds("http://127.0.0.1:9099"),
    responds("http://127.0.0.1:8080"),
  ]);
  if (auth !== firestore)
    throw new Error(
      "Only one emulator is running. Start both local auth and Firestore emulators before continuing.",
    );
  if (!auth) {
    service(
      "local-emulators",
      [
        join(root, "node_modules/firebase-tools/lib/bin/firebase.js"),
        "emulators:start",
        "--only",
        "auth,firestore",
        "--project",
        "demo-lskc-maths",
      ],
      root,
    );
    await Promise.all([
      ready("http://127.0.0.1:9099", "Auth emulator"),
      ready("http://127.0.0.1:8080", "Firestore emulator"),
    ]);
  }
  for (const path of [
    "src/lib/polynomial-tug",
    "src/lib/server/polynomialTug.ts",
    "src/app/api/polynomial-tug",
    "src/app/polynomial-tug",
    "src/components/polynomial-tug",
    "src/lib/copy.ts",
    "src/apps/polynomials/quest/Quest.tsx",
  ])
    cpSync(join(root, path), join(site, path), { recursive: true });
  await check(
    "local-build",
    [join(root, "node_modules/next/dist/bin/next"), "build"],
    site,
  );
  service(
    "local-server",
    [join(root, "node_modules/next/dist/bin/next"), "start", "-p", "3030"],
    site,
  );
  await ready(`${baseURL}/polynomial-tug`, "Polynomial Tug preview");
  await check("local-emulator-tests", [
    join(root, "node_modules/vitest/vitest.mjs"),
    "run",
    "--pool=threads",
    "--maxWorkers=1",
    "--config",
    "vitest.challenges.config.ts",
    "tests/challenges/polynomial-tug.test.ts",
  ]);
  await check("local-classroom-browser", [
    join(root, "node_modules/@playwright/test/cli.js"),
    "test",
    "--config",
    "playwright.polynomial-tug.config.ts",
  ]);
  await check("local-solo-regression", [
    join(root, "node_modules/@playwright/test/cli.js"),
    "test",
    "--config",
    "playwright.polynomial-quest.config.ts",
  ]);
  report.status = "passed";
  report.finishedAt = new Date().toISOString();
  saveReport();
  console.log(
    `\nPreview ready: ${baseURL}/polynomial-tug\nLocal teacher: use Teacher sign-in, then the emulator-only Teacher button.\nThe preview and demo emulators are still running. No production service was used.`,
  );
} catch (error) {
  report.status = "failed";
  report.error = error instanceof Error ? error.message : String(error);
  saveReport();
  console.error(report.error);
  console.error(
    "Any services started by this launcher remain running for inspection. No shared data was reset.",
  );
  process.exitCode = 1;
}
