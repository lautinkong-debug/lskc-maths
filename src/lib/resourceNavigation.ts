import { ACTIVE_LEVELS, type Level } from "@/lib/constants";

export type CollectionPath = "/apps" | "/mistakes-book";
export type ResourceFilters = { level: Level | ""; topic: string; q: string };
export const clearResourceFilters: ResourceFilters = {
  level: "",
  topic: "",
  q: "",
};

type QueryReader = Pick<URLSearchParams, "get">;

export function readResourceFilters(params: QueryReader): ResourceFilters {
  const candidate = (params.get("level") ?? "").toUpperCase() as Level;
  return {
    level: ACTIVE_LEVELS.includes(candidate) ? candidate : "",
    topic: params.get("topic") ?? "",
    q: params.get("q") ?? "",
  };
}

export function resourceHref(path: string, filters: ResourceFilters) {
  const params = new URLSearchParams();
  if (filters.level) params.set("level", filters.level);
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.q) params.set("q", filters.q);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function resourceReturn(
  collection: CollectionPath,
  params: QueryReader,
) {
  const filters = readResourceFilters(params);
  if (params.get("from") === "form" && filters.level) {
    return {
      href: `/forms/${filters.level.toLowerCase()}`,
      form: filters.level,
    };
  }
  return { href: resourceHref(collection, filters), form: null };
}

function searchText(value: string) {
  return value
    .toLowerCase()
    .replace(/\bf(?:orm)?\s*\.?\s*([1-6])\b/g, "f$1")
    .replace(/\bch(?:apter)?\s*\.?\s*(\d+)\b/g, "ch$1");
}

export function matchesResourceSearch(
  query: string,
  fields: readonly string[],
) {
  const text = searchText(fields.join(" "));
  return searchText(query)
    .trim()
    .split(/\s+/)
    .every((word) => text.includes(word));
}
