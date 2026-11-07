import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { copy } from "@/lib/copy";
import { readAppListing } from "@/lib/server/appListing";

export const runtime = "nodejs";
// One copy for a whole class, refreshed at most once a minute, so opening the
// lesson costs the server nothing per student. A teacher hiding the app can
// therefore take up to a minute to reach this link.
export const revalidate = 60;

export async function GET() {
  if (process.env.NEXT_PUBLIC_ACCESS_MODE !== "public") {
    return new Response(null, {
      status: 307,
      headers: { Location: "/apps/circle-properties" },
    });
  }
  const listing = await readAppListing("circle-properties");
  if (listing?.visible === false) {
    return new Response(copy.apps.unavailable, { status: 404 });
  }
  try {
    const html = await readFile(
      join(process.cwd(), "out/circle-properties/Circle-Lab.html"),
      "utf8",
    );
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new Response(copy.apps.settingsFailed, { status: 503 });
  }
}
