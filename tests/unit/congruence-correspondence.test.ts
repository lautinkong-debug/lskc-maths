import { describe, expect, it } from "vitest";
import { conclusionCorrespondence } from "../../src/apps/congruence/correspondence";
import { questions } from "../../src/apps/congruence/data";

describe("congruence conclusion correspondence", () => {
  const question = questions.find((q) => q.id === "rev5-35")!;
  it("uses the printed order at the shared E vertex without crossing the rays", () => {
    const result = conclusionCorrespondence(question, 4)!;
    expect(result.vertices).toEqual([
      ["B", "C"],
      ["E", "E"],
      ["F", "G"],
    ]);
    expect(result.pairs.map((row) => row.members.map((m) => m.name))).toEqual([
      ["BE", "CE"],
      ["EF", "EG"],
      ["FB", "GC"],
      ["FBE", "GCE"],
      ["BEF", "CEG"],
      ["EFB", "EGC"],
    ]);
  });
  it("does not reveal corresponding parts before the congruence conclusion", () => {
    for (let i = -1; i < 4; i++)
      expect(conclusionCorrespondence(question, i)).toBeUndefined();
  });
  it("changes correspondence for later comparisons", () => {
    expect(conclusionCorrespondence(question, 12)?.triangles).toEqual([
      "BEA",
      "CED",
    ]);
    expect(conclusionCorrespondence(question, 19)?.triangles).toEqual([
      "ABF",
      "DCG",
    ]);
  });
  it("never treats similarity or a negated congruence as equal lengths", () => {
    for (const relation of ["\\sim", "\\not\\cong"])
      expect(
        conclusionCorrespondence(
          {
            ...question,
            steps: [
              {
                math: [`\\triangle BEF${relation}\\triangle CEG`],
                highlights: {},
              },
            ],
          },
          0,
        ),
      ).toBeUndefined();
  });
  it("every recognised conclusion yields three valid side and angle pairs", () => {
    let count = 0;
    for (const q of questions)
      q.steps.forEach((_, index) => {
        const result = conclusionCorrespondence(q, index);
        if (!result) return;
        count++;
        expect(result.pairs).toHaveLength(6);
        for (const row of result.pairs)
          for (const member of row.members) {
            expect(member.name).toHaveLength(row.kind === "side" ? 2 : 3);
            expect(
              [...member.name].every((letter) =>
                q.points.some((p) => p.label === letter),
              ),
            ).toBe(true);
          }
      });
    expect(count).toBeGreaterThan(40);
  });
});
