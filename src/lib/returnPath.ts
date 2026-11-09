/** Only return app page paths that remain on this origin after URL normalisation. */
export function safeReturnPath(raw: unknown): string | null {
  if (
    typeof raw !== "string" ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    /[\\\p{Control}]/u.test(raw)
  )
    return null;
  try {
    const base = "https://return.invalid";
    const url = new URL(raw, base);
    if (
      url.origin !== base ||
      url.pathname.startsWith("//") ||
      /%(2f|5c)/i.test(url.pathname)
    )
      return null;
    if (/^\/(login|api|_next)(?:\/|$)/.test(url.pathname)) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

export function canReturnTo(path: string, role: string) {
  const pathname = new URL(path, "https://return.invalid").pathname;
  if (/^\/admin(?:\/|$)/.test(pathname)) return role === "admin";
  if (/^\/(manage|challenges)(?:\/|$)/.test(pathname))
    return role === "teacher" || role === "admin";
  return true;
}
