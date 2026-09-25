import {
  ACTIVE_LEVELS,
  COMPULSORY_STRANDS,
  type Level,
  type Strand,
} from "../src/lib/constants";

export interface SeedTopic {
  id: string;
  code: string;
  name: string;
  levels: Level[];
  strand: Strand;
  order: number;
}

/** Parse the owner's markdown table, rejecting incomplete or malformed input. */
export function parseTopicMarkdown(markdown: string): SeedTopic[] {
  const topics: SeedTopic[] = [];
  const expected = new Map<Level, number>();
  const seen = new Set<string>();
  let level: Level | null = null;
  let order = 0;

  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      const match = /^## (F[1-6]) — (\d+) topics$/.exec(line);
      level = match ? (match[1] as Level) : null;
      order = 0;
      if (match) {
        if (expected.has(level!))
          throw new Error(`Duplicate ${level} section.`);
        expected.set(level!, Number(match[2]));
      }
      continue;
    }
    if (!level || !line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length !== 3)
      throw new Error(`Malformed ${level} topic row: ${line}`);
    const [code, name, strand] = cells;
    if (code === "code" || /^-+$/.test(code)) continue;
    if (!code || !name || !COMPULSORY_STRANDS.includes(strand as Strand)) {
      throw new Error(`Invalid ${level} topic row: ${line}`);
    }
    const id = `${level.toLowerCase()}-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    if (seen.has(id)) throw new Error(`Duplicate topic ${id}.`);
    seen.add(id);
    topics.push({
      id,
      code,
      name,
      levels: [level],
      strand: strand as Strand,
      order,
    });
    order += 1;
  }

  for (const activeLevel of ACTIVE_LEVELS) {
    if (!expected.has(activeLevel))
      throw new Error(`Missing ${activeLevel} section.`);
    const actual = topics.filter((topic) =>
      topic.levels.includes(activeLevel),
    ).length;
    if (actual !== expected.get(activeLevel)) {
      throw new Error(
        `${activeLevel} heading says ${expected.get(activeLevel)} topics, found ${actual}.`,
      );
    }
  }
  const total = /Total: \*\*(\d+)\*\* topics/.exec(markdown);
  if (total && topics.length !== Number(total[1])) {
    throw new Error(`Topic total says ${total[1]}, found ${topics.length}.`);
  }
  return topics;
}
