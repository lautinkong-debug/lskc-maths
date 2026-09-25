import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseTopicMarkdown } from "../../scripts/parse-topics";

const markdown = readFileSync(resolve(process.cwd(), "docs/topics.md"), "utf8");

describe("topic seed source", () => {
  it("loads the 69 department chapters without M2 or duplicate IDs", () => {
    const topics = parseTopicMarkdown(markdown);
    expect(topics).toHaveLength(69);
    expect(new Set(topics.map((item) => item.id)).size).toBe(69);
    expect(topics.filter((item) => item.levels.includes("F1"))).toHaveLength(
      13,
    );
    expect(topics.filter((item) => item.levels.includes("F6"))).toHaveLength(6);
    expect(topics.some((item) => item.levels.includes("M2"))).toBe(false);
    expect(topics.find((item) => item.id === "f5-ch18")?.name).toBe(
      "Measures of Dispersion",
    );
  });

  it("rejects a section count that does not match its rows", () => {
    expect(() =>
      parseTopicMarkdown(
        markdown.replace("## F1 — 13 topics", "## F1 — 14 topics"),
      ),
    ).toThrow("F1 heading says 14 topics, found 13");
  });

  it("rejects duplicate chapter codes and invalid strands", () => {
    expect(() =>
      parseTopicMarkdown(
        markdown.replace(
          "| 1A01 | Basic Mathematics",
          "| 1A00 | Basic Mathematics",
        ),
      ),
    ).toThrow("Duplicate topic f1-1a00");
    expect(() =>
      parseTopicMarkdown(
        markdown.replace(
          "| 1A00 | Revision on Fundamental Arithmetic | number-algebra |",
          "| 1A00 | Revision on Fundamental Arithmetic | unknown-strand |",
        ),
      ),
    ).toThrow("Invalid F1 topic row");
  });
});
