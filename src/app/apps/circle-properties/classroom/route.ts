import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { copy } from "@/lib/copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store" };

async function isPublished(): Promise<boolean> {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!project) throw new Error("Missing Firestore project");
  const host =
    process.env.NEXT_PUBLIC_USE_EMULATORS === "true"
      ? "http://127.0.0.1:8080"
      : "https://firestore.googleapis.com";
  const database = `projects/${project}/databases/(default)/documents`;
  const name = `${database}/appSettings/circle-properties`;
  // A visitor read under Firestore rules. batchGet distinguishes a genuinely
  // missing listing (visible by default) from a missing database or a denial.
  const response = await fetch(`${host}/v1/${database}:batchGet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documents: [name],
      mask: { fieldPaths: ["visible"] },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Could not read app settings");
  const records = await response.json();
  if (!Array.isArray(records) || records.length !== 1)
    throw new Error("Invalid settings result");
  const record = records[0];
  if (record?.missing === name && !record.found) return true;
  const visible = record?.found?.fields?.visible?.booleanValue;
  if (record?.found?.name === name && typeof visible === "boolean")
    return visible;
  throw new Error("Invalid app visibility");
}

export async function GET() {
  if (process.env.NEXT_PUBLIC_ACCESS_MODE !== "public") {
    return new Response(null, {
      status: 307,
      headers: { ...privateHeaders, Location: "/apps/circle-properties" },
    });
  }
  try {
    if (!(await isPublished())) {
      return new Response(copy.apps.unavailable, {
        status: 404,
        headers: privateHeaders,
      });
    }
    const html = await readFile(
      join(process.cwd(), "out/circle-properties/Circle-Lab.html"),
      "utf8",
    );
    return new Response(html, {
      headers: {
        ...privateHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch {
    return new Response(copy.apps.settingsFailed, {
      status: 503,
      headers: privateHeaders,
    });
  }
}
