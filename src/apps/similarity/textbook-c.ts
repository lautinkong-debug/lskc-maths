import type { TextbookSolution, TextbookStep } from "./textbook-types";
const T = String.raw;
const m = (
  math: string | string[],
  highlights: TextbookStep["highlights"],
  reason?: string,
  conclusion?: boolean,
): TextbookStep => ({
  math: typeof math === "string" ? [math] : math,
  highlights,
  reason,
  conclusion,
});
const h = (heading: string, figures: string[]): TextbookStep => ({
  heading,
  highlights: { figures },
});
const solution = (
  pages: number[],
  steps: TextbookStep[],
): TextbookSolution => ({
  pages,
  steps,
  initialVisible:
    steps.findIndex((s) => s.heading?.startsWith("(b)")) < 0
      ? steps.length
      : steps.findIndex((s) => s.heading?.startsWith("(b)")),
});
/** Visually transcribed from full-solution PDF pp. 11–13, including every calculation and printed reason. */
export const textbookC: Record<string, TextbookSolution> = {
  "ex8c-10": solution(
    [11],
    [
      h("In △ABD and △DCE,", ["ABD", "DCE"]),
      m(
        T`\because\quad \frac{DC}{AB}=\frac{15\text{ cm}}{30\text{ cm}}=\frac12`,
        { sides: ["DC", "AB"] },
      ),
      m(T`\frac{CE}{BD}=\frac{7\text{ cm}}{14\text{ cm}}=\frac12`, {
        sides: ["CE", "BD"],
      }),
      m(T`\therefore\quad \frac{DC}{AB}=\frac{CE}{BD}`, {
        sides: ["DC", "AB", "CE", "BD"],
      }),
      m(T`\because\quad AB=AC`, { sides: ["AB", "AC"] }, "given"),
      m(
        T`\therefore\quad \angle ABD=\angle DCE`,
        { angles: ["ABD", "DCE"] },
        "base ∠s, isos. △",
      ),
      m(
        T`\therefore\quad \triangle ABD\sim\triangle DCE`,
        { figures: ["ABD", "DCE"] },
        "ratio of 2 sides, inc. ∠",
        true,
      ),
    ],
  ),
  "ex8c-11": solution(
    [11],
    [
      h("In △ABD and △DCE,", ["ABD", "DCE"]),
      m(T`\because\quad AB=AC`, { sides: ["AB", "AC"] }, "given"),
      m(
        T`\therefore\quad \angle ABC=\angle BCA`,
        { angles: ["ABC", "BCA"] },
        "base ∠s, isos. △",
      ),
      m(T`\text{i.e.}\quad \angle ABD=\angle DCE`, { angles: ["ABD", "DCE"] }),
      m(T`\angle BAD=\angle CDE`, { angles: ["BAD", "CDE"] }, "given"),
      m(
        T`\because\quad \angle ADB=180^\circ-\angle ABD-\angle BAD`,
        { angles: ["ADB", "ABD", "BAD"] },
        "∠ sum of △",
      ),
      m(
        T`\angle DEC=180^\circ-\angle DCE-\angle CDE`,
        { angles: ["DEC", "DCE", "CDE"] },
        "∠ sum of △",
      ),
      m(T`\therefore\quad \angle ADB=\angle DEC`, { angles: ["ADB", "DEC"] }),
      m(
        T`\therefore\quad \triangle ABD\sim\triangle DCE`,
        { figures: ["ABD", "DCE"] },
        "AAA",
        true,
      ),
    ],
  ),
  "ex8c-12": solution(
    [11, 12],
    [
      h("(a) In △ABC and △DAC,", ["ABC", "DAC"]),
      m(
        T`\because\quad \frac{DA}{AB}=\frac{21\text{ cm}}{35\text{ cm}}=\frac35`,
        { sides: ["DA", "AB"] },
      ),
      m(T`\frac{AC}{BC}=\frac{15\text{ cm}}{25\text{ cm}}=\frac35`, {
        sides: ["AC", "BC"],
      }),
      m(T`\frac{DC}{AC}=\frac{9\text{ cm}}{15\text{ cm}}=\frac35`, {
        sides: ["DC", "AC"],
      }),
      m(T`\therefore\quad \frac{DA}{AB}=\frac{AC}{BC}=\frac{DC}{AC}`, {
        sides: ["DA", "AB", "AC", "BC", "DC"],
      }),
      m(
        T`\therefore\quad \triangle ABC\sim\triangle DAC`,
        { figures: ["ABC", "DAC"] },
        "3 sides prop.",
        true,
      ),
      h("(b)", ["ABC", "DAC"]),
      m(
        T`\because\quad \triangle ABC\sim\triangle DAC`,
        { figures: ["ABC", "DAC"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \angle ACB=\angle DCA`,
        { angles: ["ACB", "DCA"] },
        "(corr. ∠s, ∼△s)",
      ),
      m(
        T`\angle ACB+\angle DCA+120^\circ=360^\circ`,
        { angles: ["ACB", "DCA", "BCD"] },
        "(∠s at a pt.)",
      ),
      m(T`2\angle ACB+120^\circ=360^\circ`, { angles: ["ACB"] }),
      m(T`2\angle ACB=240^\circ`, { angles: ["ACB"] }),
      m(T`\angle ACB=\underline{\underline{120^\circ}}`, { angles: ["ACB"] }),
    ],
  ),
  "ex8c-13": solution(
    [12],
    [
      h("(a) In △OAB and △OCD,", ["OAB", "OCD"]),
      m(
        T`\because\quad \frac{OC}{OA}=\frac{5\text{ cm}}{15\text{ cm}}=\frac13`,
        { sides: ["OC", "OA"] },
      ),
      m(T`\frac{OD}{OB}=\frac{3\text{ cm}}{9\text{ cm}}=\frac13`, {
        sides: ["OD", "OB"],
      }),
      m(T`\therefore\quad \frac{OC}{OA}=\frac{OD}{OB}`, {
        sides: ["OC", "OA", "OD", "OB"],
      }),
      m(T`\angle AOB=\angle COD`, { angles: ["AOB", "COD"] }, "vert. opp. ∠s"),
      m(
        T`\therefore\quad \triangle OAB\sim\triangle OCD`,
        { figures: ["OAB", "OCD"] },
        "ratio of 2 sides, inc. ∠",
        true,
      ),
      h("(b)", ["OAB", "OCD"]),
      m(
        T`\because\quad \triangle OAB\sim\triangle OCD`,
        { figures: ["OAB", "OCD"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \angle ODC=\angle OBA`,
        { angles: ["ODC", "OBA"] },
        "(corr. ∠s, ∼△s)",
      ),
      m(
        T`\therefore\quad DC\mathbin{//}AB`,
        { sides: ["DC", "AB"] },
        "(alt. ∠s equal)",
      ),
    ],
  ),
  "ex8c-14": solution(
    [12],
    [
      h("(a) In △ABC and △CAD,", ["ABC", "CAD"]),
      m(T`\because\quad \frac{CA}{AB}=\frac{8\text{ cm}}{4\text{ cm}}=2`, {
        sides: ["CA", "AB"],
      }),
      m(T`\frac{AD}{BC}=\frac{12\text{ cm}}{6\text{ cm}}=2`, {
        sides: ["AD", "BC"],
      }),
      m(T`\frac{CD}{AC}=\frac{16\text{ cm}}{8\text{ cm}}=2`, {
        sides: ["CD", "AC"],
      }),
      m(T`\therefore\quad \frac{CA}{AB}=\frac{AD}{BC}=\frac{CD}{AC}`, {
        sides: ["CA", "AB", "AD", "BC", "CD", "AC"],
      }),
      m(
        T`\therefore\quad \triangle ABC\sim\triangle CAD`,
        { figures: ["ABC", "CAD"] },
        "3 sides prop.",
        true,
      ),
      h("(b)", ["ABC", "CAD"]),
      m(
        T`\because\quad \triangle ABC\sim\triangle CAD`,
        { figures: ["ABC", "CAD"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \angle BAC=\angle ACD`,
        { angles: ["BAC", "ACD"] },
        "(corr. ∠s, ∼△s)",
      ),
      m(
        T`\therefore\quad BA\mathbin{//}CD`,
        { sides: ["BA", "CD"] },
        "(alt. ∠s equal)",
      ),
    ],
  ),
  "ex8c-15": solution(
    [12],
    [
      h("(a) In △AEF and △DFC,", ["AEF", "DFC"]),
      m(
        T`\because\quad \frac{AE}{DF}=\frac{5\text{ cm}}{(7+3)\text{ cm}}=\frac5{10}=\frac12`,
        { sides: ["AE", "DF"] },
      ),
      m(T`\frac{AF}{DC}=\frac{4\text{ cm}}{8\text{ cm}}=\frac12`, {
        sides: ["AF", "DC"],
      }),
      m(T`\frac{EF}{FC}=\frac{3\text{ cm}}{6\text{ cm}}=\frac12`, {
        sides: ["EF", "FC"],
      }),
      m(T`\therefore\quad \frac{AE}{DF}=\frac{AF}{DC}=\frac{EF}{FC}`, {
        sides: ["AE", "DF", "AF", "DC", "EF", "FC"],
      }),
      m(
        T`\therefore\quad \triangle AEF\sim\triangle DFC`,
        { figures: ["AEF", "DFC"] },
        "3 sides prop.",
        true,
      ),
      h("(b)", ["AEF", "DFC"]),
      m(
        T`\because\quad \triangle AEF\sim\triangle DFC`,
        { figures: ["AEF", "DFC"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \angle AEF=\angle DFC`,
        { angles: ["AEF", "DFC"] },
        "(corr. ∠s, ∼△s)",
      ),
      m(T`\text{i.e.}\quad \angle BEF=\angle BFE`, { angles: ["BEF", "BFE"] }),
      m(
        T`\therefore\quad BE=BF`,
        { sides: ["BE", "BF"] },
        "(sides opp. equal ∠s)",
      ),
    ],
  ),
  "ex8c-16": solution(
    [12],
    [
      h("(a) In △ABD and △EDC,", ["ABD", "EDC"]),
      m(T`\angle ABD=\angle EDC`, { angles: ["ABD", "EDC"] }, "given"),
      m(T`\because\quad DF=CF`, { sides: ["DF", "CF"] }, "given"),
      m(
        T`\therefore\quad \angle FDC=\angle FCD`,
        { angles: ["FDC", "FCD"] },
        "base ∠s, isos. △",
      ),
      m(T`\text{i.e.}\quad \angle ADB=\angle ECD`, { angles: ["ADB", "ECD"] }),
      m(
        T`\because\quad \angle BAD=180^\circ-\angle ABD-\angle ADB`,
        { angles: ["BAD", "ABD", "ADB"] },
        "∠ sum of △",
      ),
      m(
        T`\angle DEC=180^\circ-\angle EDC-\angle ECD`,
        { angles: ["DEC", "EDC", "ECD"] },
        "∠ sum of △",
      ),
      m(T`\therefore\quad \angle BAD=\angle DEC`, { angles: ["BAD", "DEC"] }),
      m(
        T`\therefore\quad \triangle ABD\sim\triangle EDC`,
        { figures: ["ABD", "EDC"] },
        "AAA",
        true,
      ),
      h("(b)", ["ABD", "EDC"]),
      m(
        T`\because\quad \triangle ABD\sim\triangle EDC`,
        { figures: ["ABD", "EDC"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \frac{CD}{DB}=\frac{ED}{AB}`,
        { sides: ["CD", "DB", "ED", "AB"] },
        "(corr. sides, ∼△s)",
      ),
      m(T`\frac{CD}{5\text{ cm}+CD}=\frac{3\text{ cm}}{9\text{ cm}}`, {
        sides: ["CD", "DB", "ED", "AB"],
      }),
      m(T`\frac{CD}{5\text{ cm}+CD}=\frac13`, { sides: ["CD", "DB"] }),
      m(T`3CD=5\text{ cm}+CD`, { sides: ["CD"] }),
      m(T`2CD=5\text{ cm}`, { sides: ["CD"] }),
      m(T`CD=\underline{\underline{2.5\text{ cm}}}`, { sides: ["CD"] }),
    ],
  ),
  "ex8c-17": solution(
    [12],
    [
      h("(a) In △CAB and △CED,", ["CAB", "CED"]),
      m(T`\angle ACB=\angle ECD`, { angles: ["ACB", "ECD"] }, "vert. opp. ∠s"),
      m(
        T`\angle ABC=\angle EDC`,
        { angles: ["ABC", "EDC"], sides: ["BA", "ED"] },
        "alt. ∠s, BA // ED",
      ),
      m(
        T`\angle BAC=\angle DEC`,
        { angles: ["BAC", "DEC"], sides: ["BA", "ED"] },
        "alt. ∠s, BA // ED",
      ),
      m(
        T`\therefore\quad \triangle CAB\sim\triangle CED`,
        { figures: ["CAB", "CED"] },
        "AAA",
        true,
      ),
      h("In △CED and △CGF,", ["CED", "CGF"]),
      m(
        T`\angle CDE=\angle CFG`,
        { angles: ["CDE", "CFG"], sides: ["ED", "GF"] },
        "corr. ∠s, ED // GF",
      ),
      m(
        T`\angle CED=\angle CGF`,
        { angles: ["CED", "CGF"], sides: ["ED", "GF"] },
        "corr. ∠s, ED // GF",
      ),
      m(T`\angle DCE=\angle FCG`, { angles: ["DCE", "FCG"] }, "common ∠"),
      m(
        T`\therefore\quad \triangle CED\sim\triangle CGF`,
        { figures: ["CED", "CGF"] },
        "AAA",
        true,
      ),
      m(
        T`\therefore\quad \triangle CAB\sim\triangle CED\sim\triangle CGF`,
        { figures: ["CAB", "CED", "CGF"] },
        undefined,
        true,
      ),
      h("(b)", ["CAB", "CED"]),
      m(
        T`\because\quad \triangle CAB\sim\triangle CED`,
        { figures: ["CAB", "CED"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \frac{AB}{ED}=\frac{BC}{DC}`,
        { sides: ["AB", "ED", "BC", "DC"] },
        "(corr. sides, ∼△s)",
      ),
      m(T`\frac{AB}{4\text{ cm}}=\frac{2\text{ cm}}{3\text{ cm}}`, {
        sides: ["AB", "ED", "BC", "DC"],
      }),
      m(T`AB=\underline{\underline{\frac83\text{ cm}}}`, { sides: ["AB"] }),
      m(
        T`\because\quad \triangle CED\sim\triangle CGF`,
        { figures: ["CED", "CGF"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \frac{CF}{CD}=\frac{GF}{ED}`,
        { sides: ["CF", "CD", "GF", "ED"] },
        "(corr. sides, ∼△s)",
      ),
      m(T`\frac{3\text{ cm}+DF}{3\text{ cm}}=\frac{6\text{ cm}}{4\text{ cm}}`, {
        sides: ["CF", "DF", "CD", "GF", "ED"],
      }),
      m(T`\frac{3\text{ cm}+DF}{3\text{ cm}}=\frac32`, {
        sides: ["CF", "DF", "CD"],
      }),
      m(T`3\text{ cm}+DF=4.5\text{ cm}`, { sides: ["DF"] }),
      m(T`DF=\underline{\underline{1.5\text{ cm}}}`, { sides: ["DF"] }),
    ],
  ),
  "ex8c-18": solution(
    [12, 13],
    [
      h("(a) In △ABC and △DEC,", ["ABC", "DEC"]),
      m(
        T`\angle ABC=\angle DEC`,
        { angles: ["ABC", "DEC"], sides: ["AB", "DF"] },
        "corr. ∠s, AB // DF",
      ),
      m(
        T`\angle BAC=\angle EDC`,
        { angles: ["BAC", "EDC"], sides: ["AB", "DF"] },
        "corr. ∠s, AB // DF",
      ),
      m(T`\angle ACB=\angle DCE`, { angles: ["ACB", "DCE"] }, "common ∠"),
      m(
        T`\therefore\quad \triangle ABC\sim\triangle DEC`,
        { figures: ["ABC", "DEC"] },
        "AAA",
        true,
      ),
      h("In △DEC and △BEF,", ["DEC", "BEF"]),
      m(T`\angle DCE=\angle BFE`, { angles: ["DCE", "BFE"] }, "given"),
      m(T`\angle DEC=\angle BEF`, { angles: ["DEC", "BEF"] }, "vert. opp. ∠s"),
      m(
        [
          T`\because\quad \angle CDE=180^\circ-\angle DCE`,
          T`\phantom{\because\quad\angle CDE=180^\circ}\ -\angle DEC`,
        ],
        { angles: ["CDE", "DCE", "DEC"] },
        "∠ sum of △",
      ),
      m(
        [
          T`\angle FBE=180^\circ-\angle BFE`,
          T`\phantom{\angle FBE=180^\circ}\ -\angle BEF`,
        ],
        { angles: ["FBE", "BFE", "BEF"] },
        "∠ sum of △",
      ),
      m(T`\therefore\quad \angle CDE=\angle FBE`, { angles: ["CDE", "FBE"] }),
      m(
        T`\therefore\quad \triangle DEC\sim\triangle BEF`,
        { figures: ["DEC", "BEF"] },
        "AAA",
        true,
      ),
      m(
        T`\therefore\quad \triangle ABC\sim\triangle DEC\sim\triangle BEF`,
        { figures: ["ABC", "DEC", "BEF"] },
        undefined,
        true,
      ),
      h("(b)", ["ABC", "DEC"]),
      m(
        T`\because\quad \triangle ABC\sim\triangle DEC`,
        { figures: ["ABC", "DEC"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \frac{CE}{CB}=\frac{DE}{AB}`,
        { sides: ["CE", "CB", "DE", "AB"] },
        "(corr. sides, ∼△s)",
      ),
      m(T`\frac{CE}{6\text{ cm}+CE}=\frac{5\text{ cm}}{9\text{ cm}}`, {
        sides: ["CE", "CB", "DE", "AB"],
      }),
      m(T`9CE=30\text{ cm}+5CE`, { sides: ["CE"] }),
      m(T`4CE=30\text{ cm}`, { sides: ["CE"] }),
      m(T`CE=\underline{\underline{7.5\text{ cm}}}`, { sides: ["CE"] }),
      m(
        T`\because\quad \triangle DEC\sim\triangle BEF`,
        { figures: ["DEC", "BEF"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \frac{EF}{EC}=\frac{BE}{DE}`,
        { sides: ["EF", "EC", "BE", "DE"] },
        "(corr. sides, ∼△s)",
      ),
      m(T`\frac{EF}{7.5\text{ cm}}=\frac{6\text{ cm}}{5\text{ cm}}`, {
        sides: ["EF", "EC", "BE", "DE"],
      }),
      m(T`EF=\underline{\underline{9\text{ cm}}}`, { sides: ["EF"] }),
    ],
  ),
  "ex8c-19": solution(
    [13],
    [
      h("(a) In △AFE and △ABC,", ["AFE", "ABC"]),
      m(
        T`\angle ABC+\angle BAF=180^\circ`,
        { angles: ["ABC", "BAF"], sides: ["AF", "BC"] },
        "int. ∠s, AF // BC",
      ),
      m(T`\angle ABC+90^\circ=180^\circ`, { angles: ["ABC", "BAF"] }),
      m(T`\angle ABC=90^\circ`, { angles: ["ABC"] }),
      m(T`\therefore\quad \angle AFE=\angle ABC`, { angles: ["AFE", "ABC"] }),
      { text: "∵ ACDE is a rectangle.", highlights: { figures: ["ACDE"] } },
      m(T`\therefore\quad \angle CAE=90^\circ`, { angles: ["CAE"] }),
      m(T`\therefore\quad \angle EAF+\angle CAF=90^\circ`, {
        angles: ["EAF", "CAF"],
      }),
      m(T`\angle EAF=90^\circ-\angle CAF`, { angles: ["EAF", "CAF"] }),
      m(T`\angle BAC+\angle CAF=90^\circ`, { angles: ["BAC", "CAF"] }),
      m(T`\angle BAC=90^\circ-\angle CAF`, { angles: ["BAC", "CAF"] }),
      m(T`\therefore\quad \angle EAF=\angle BAC`, { angles: ["EAF", "BAC"] }),
      m(
        [
          T`\because\quad \angle AEF=180^\circ-\angle AFE`,
          T`\phantom{\because\quad\angle AEF=180^\circ}\ -\angle EAF`,
        ],
        { angles: ["AEF", "AFE", "EAF"] },
        "∠ sum of △",
      ),
      m(
        [
          T`\angle ACB=180^\circ-\angle ABC`,
          T`\phantom{\angle ACB=180^\circ}\ -\angle BAC`,
        ],
        { angles: ["ACB", "ABC", "BAC"] },
        "∠ sum of △",
      ),
      m(T`\therefore\quad \angle AEF=\angle ACB`, { angles: ["AEF", "ACB"] }),
      m(
        T`\therefore\quad \triangle AFE\sim\triangle ABC`,
        { figures: ["AFE", "ABC"] },
        "AAA",
        true,
      ),
      h("(b)", ["ACDE"]),
      { text: "∵ ACDE is a rectangle.", highlights: { figures: ["ACDE"] } },
      m(
        [T`\therefore\quad AE=CD`, T`\phantom{\therefore\quad AE}=3\text{ cm}`],
        { sides: ["AE", "CD"] },
      ),
      m(
        T`\because\quad \triangle AFE\sim\triangle ABC`,
        { figures: ["AFE", "ABC"] },
        "(proved in (a))",
      ),
      m(
        T`\therefore\quad \frac{AC}{AE}=\frac{BC}{FE}`,
        { sides: ["AC", "AE", "BC", "FE"] },
        "(corr. sides, ∼△s)",
      ),
      m(T`\frac{AC}{3\text{ cm}}=\frac{3\text{ cm}}{2\text{ cm}}`, {
        sides: ["AC", "AE", "BC", "FE"],
      }),
      m(T`AC=\frac92\text{ cm}`, { sides: ["AC"] }),
      m(
        [
          T`\text{Area of rectangle }ACDE=CD\times AC`,
          T`=3\times\frac92\text{ cm}^2`,
          T`=\underline{\underline{\frac{27}2\text{ cm}^2}}`,
        ],
        { figures: ["ACDE"], sides: ["CD", "AC"] },
      ),
    ],
  ),
};
