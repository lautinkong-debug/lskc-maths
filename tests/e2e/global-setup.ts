import { execSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.local" });

const EMULATORS = [
  "http://127.0.0.1:9099/",
  "http://127.0.0.1:8080/",
  "http://127.0.0.1:9199/",
];

async function ready(url: string): Promise<boolean> {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return true;
  } catch {
    return false;
  }
}

export default async function globalSetup() {
  if (
    process.env.NEXT_PUBLIC_USE_EMULATORS !== "true" ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "demo-lskc-maths"
  ) {
    throw new Error("Smoke tests require the local demo Firebase project.");
  }
  for (let attempt = 0; attempt < 90; attempt++) {
    if ((await Promise.all(EMULATORS.map(ready))).every(Boolean)) {
      execSync("npm run seed", { stdio: "inherit" });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("Firebase emulators did not become ready.");
}
