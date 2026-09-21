/** Levels, strands and upload limits. Shared by the UI, the seed script and tests. */

export const LEVELS = ["F1", "F2", "F3", "F4", "F5", "F6", "M2"] as const;
export type Level = (typeof LEVELS)[number];

/**
 * M2 is defined but carries no topics yet (owner deferred it on 2026-09-21).
 * Filters and pickers use this list so an empty level never shows up.
 */
export const ACTIVE_LEVELS: readonly Level[] = [
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
];

export const STRANDS = {
  "number-algebra": "Number and Algebra",
  "measures-shape-space": "Measures, Shape and Space",
  "data-handling": "Data Handling",
  "m2-foundation": "M2 - Foundation Knowledge",
  "m2-calculus": "M2 - Calculus",
  "m2-algebra": "M2 - Algebra",
} as const;

export type Strand = keyof typeof STRANDS;

export const COMPULSORY_STRANDS: readonly Strand[] = [
  "number-algebra",
  "measures-shape-space",
  "data-handling",
];

export const EDITIONS = ["student", "teacher"] as const;
export type Edition = (typeof EDITIONS)[number];

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Content type -> the extension we show people. Storage rules enforce the same list. */
export const ALLOWED_UPLOAD_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/html": "html",
} as const;

export type FileKind =
  (typeof ALLOWED_UPLOAD_TYPES)[keyof typeof ALLOWED_UPLOAD_TYPES];

/** "public" = anyone may read. "school" = allowed domains only. See CLAUDE.md. */
export const ACCESS_MODE =
  process.env.NEXT_PUBLIC_ACCESS_MODE === "school" ? "school" : "public";

export const ALLOWED_EMAIL_DOMAINS = (
  process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? ""
)
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);
