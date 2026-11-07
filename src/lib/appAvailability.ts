import type { AppSettings } from "@/lib/db/appSettings";

export type AppAvailability =
  | "open"
  | "teacherOnly"
  | "waiting"
  | "unavailable"
  | "failed";

/**
 * What one person gets when they open an app.
 *
 * `live` is undefined until the live listing arrives, and null when the app has
 * no listing. In public mode the page already carries the listing, so nobody
 * waits for it. In school mode the server cannot read the listing, so the page
 * knows nothing until the live one arrives, and a failed read stays closed.
 */
export function appAvailability({
  schoolMode,
  isTeacher,
  authLoading,
  serverHidden,
  live,
  liveFailed,
}: {
  schoolMode: boolean;
  isTeacher: boolean;
  authLoading: boolean;
  serverHidden: boolean;
  live: Pick<AppSettings, "visible"> | null | undefined;
  liveFailed: boolean;
}): AppAvailability {
  if (schoolMode && live === undefined) {
    return liveFailed ? "failed" : "waiting";
  }
  const visible = live === undefined ? !serverHidden : live?.visible !== false;
  if (visible) return "open";
  if (isTeacher) return "teacherOnly";
  return authLoading ? "waiting" : "unavailable";
}
