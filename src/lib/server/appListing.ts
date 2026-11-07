export interface AppListing {
  title: string;
  visible: boolean;
}

/**
 * A teacher's listing for one app, read as a visitor under the Firestore rules.
 *
 * It runs when a cached page is rebuilt, not once per student. It returns null
 * if the listing cannot be read, and callers then show the default listing: a
 * slow or failed read must never lock a class out of a lesson.
 */
export async function readAppListing(slug: string): Promise<AppListing | null> {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const host =
    process.env.NEXT_PUBLIC_USE_EMULATORS === "true"
      ? "http://127.0.0.1:8080"
      : "https://firestore.googleapis.com";
  const database = `projects/${project}/databases/(default)/documents`;
  const name = `${database}/appSettings/${slug}`;
  try {
    const response = await fetch(`${host}/v1/${database}:batchGet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documents: [name],
        mask: { fieldPaths: ["title", "visible"] },
      }),
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return null;
    const records = await response.json();
    const found = Array.isArray(records) ? records[0]?.found : undefined;
    if (found?.name !== name) return null;
    return {
      title: found.fields?.title?.stringValue?.trim() ?? "",
      visible: found.fields?.visible?.booleanValue !== false,
    };
  } catch {
    return null;
  }
}
