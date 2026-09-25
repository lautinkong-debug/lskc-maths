import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { parseTopicMarkdown } from "./parse-topics";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
loadEnv({ path: resolve(root, ".env.local"), quiet: true });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (
  process.env.NEXT_PUBLIC_USE_EMULATORS !== "true" ||
  projectId !== "demo-lskc-maths"
) {
  throw new Error("Seed is restricted to the demo-lskc-maths local emulators.");
}

const base = "http://127.0.0.1:9099";
const api = `${base}/identitytoolkit.googleapis.com/v1`;
const key = "demo-api-key";
const password = "LocalTest123!";
const accounts = [
  { email: "t28ltk@lskc.edu.hk", name: "Tin Kong Lau", isAdmin: true },
  { email: "teacher2@lskc.edu.hk", name: "Second Teacher", isAdmin: false },
  { email: "viewer@lskc.edu.hk", name: "School Viewer", isAdmin: false },
] as const;

async function post(
  path: string,
  payload: object,
): Promise<Record<string, unknown>> {
  const response = await fetch(`${api}/${path}?key=${key}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok)
    throw new Error(
      String((data.error as { message?: string })?.message ?? response.status),
    );
  return data;
}

async function seedAuthAccount(email: string): Promise<void> {
  let account: Record<string, unknown>;
  try {
    account = await post("accounts:signUp", {
      email,
      password,
      returnSecureToken: true,
    });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("EMAIL_EXISTS"))
      throw error;
    account = await post("accounts:signInWithPassword", {
      email,
      password,
      returnSecureToken: true,
    });
  }
  const token = String(account.idToken);
  const lookup = await post("accounts:lookup", { idToken: token });
  const user = (lookup.users as Array<{ emailVerified?: boolean }>)[0];
  if (user?.emailVerified) return;

  await post("accounts:sendOobCode", {
    requestType: "VERIFY_EMAIL",
    idToken: token,
  });
  const response = await fetch(
    `${base}/emulator/v1/projects/${projectId}/oobCodes`,
  );
  if (!response.ok) throw new Error("Could not read local verification codes.");
  const data = (await response.json()) as {
    oobCodes: Array<{ email: string; oobCode: string; requestType: string }>;
  };
  const code = data.oobCodes.findLast(
    (item) => item.email === email && item.requestType === "VERIFY_EMAIL",
  );
  if (!code) throw new Error(`No local verification code for ${email}.`);
  await post("accounts:update", { oobCode: code.oobCode });
}

async function main() {
  // This read keeps the script aligned with the generated emulator rules without
  // loading or changing any remote Firebase project.
  const firestoreRules = readFileSync(resolve(root, "firestore.rules"), "utf8");
  if (!firestoreRules.includes("service cloud.firestore"))
    throw new Error("Run npm run rules:build first.");
  const sourceTopics = parseTopicMarkdown(
    readFileSync(resolve(root, "docs/topics.md"), "utf8"),
  );
  for (const account of accounts) await seedAuthAccount(account.email);

  let created = 0;
  let updated = 0;
  const testEnv = await initializeTestEnvironment({
    projectId: "demo-lskc-maths",
    firestore: { host: "127.0.0.1", port: 8080 },
  });
  try {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      for (const account of accounts.filter(
        (item) => item.email !== "viewer@lskc.edu.hk",
      )) {
        await firestore.doc(`teachers/${account.email}`).set({
          name: account.name,
          isAdmin: account.isAdmin,
          addedBy: "t28ltk@lskc.edu.hk",
          addedAt: new Date(),
        });
      }
      const existing = await firestore.collection("topics").get();
      const byId = new Map(existing.docs.map((item) => [item.id, item.data()]));
      const batch = firestore.batch();
      const now = new Date();
      for (const topic of sourceTopics) {
        const current = byId.get(topic.id);
        const fields = {
          code: topic.code,
          name: topic.name,
          levels: topic.levels,
          strand: topic.strand,
          order: topic.order,
        };
        const ref = firestore.doc(`topics/${topic.id}`);
        if (!current) {
          batch.set(ref, { ...fields, createdAt: now, updatedAt: now });
          created += 1;
        } else if (
          current.code !== fields.code ||
          current.name !== fields.name ||
          JSON.stringify(current.levels) !== JSON.stringify(fields.levels) ||
          current.strand !== fields.strand ||
          current.order !== fields.order
        ) {
          batch.update(ref, { ...fields, updatedAt: now });
          updated += 1;
        }
      }
      if (created + updated > 0) await batch.commit();
    });
  } finally {
    await testEnv.cleanup();
  }
  process.stdout.write(
    `Seeded 3 verified local accounts (admin, teacher, viewer). Test password: ${password}\n` +
      `Topics: ${sourceTopics.length} total (${created} new, ${updated} updated, ${sourceTopics.length - created - updated} unchanged).\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error}\n`);
  process.exitCode = 1;
});
